import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts/v14");
await mkdir(outputDir, { recursive: true });

const viewport = { width: 1363, height: 936 };
const browser = await chromium.launch({ headless: true });
const report = { generatedAt: new Date().toISOString(), viewport, checks: [], blockers: [] };

function addBlocker(route, message) {
  report.blockers.push({ route, message });
}

async function openRoute(pathname, key) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "reduce" });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  const response = await page.goto(new URL(pathname, baseURL).toString(), { waitUntil: "networkidle", timeout: 30_000 });
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  await page.addStyleTag({ content: `*,*::before,*::after{animation-duration:.001ms!important;animation-delay:0ms!important;transition-duration:.001ms!important;transition-delay:0ms!important;scroll-behavior:auto!important}` });
  await page.waitForTimeout(180);

  const common = await page.evaluate(() => ({
    title: document.title,
    h1Count: document.querySelectorAll("main h1").length,
    bodyV14: document.body.classList.contains("v14"),
    v14Styles: [...document.querySelectorAll('link[rel="stylesheet"]')].map((el) => el.getAttribute("href") || "").filter((href) => href.includes("atelier-v14.css")),
    viewportWidth: document.documentElement.clientWidth,
    documentWidth: document.documentElement.scrollWidth,
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    brokenImages: [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
  }));

  const entry = { key, pathname, httpStatus: response?.status() || null, consoleErrors, pageErrors, ...common };
  report.checks.push(entry);

  if (!response?.ok()) addBlocker(key, `HTTP ${response?.status() ?? "no response"}`);
  if (consoleErrors.length) addBlocker(key, `console errors: ${consoleErrors.join(" | ")}`);
  if (pageErrors.length) addBlocker(key, `page errors: ${pageErrors.join(" | ")}`);
  if (common.h1Count !== 1) addBlocker(key, `expected 1 H1, found ${common.h1Count}`);
  if (!common.bodyV14) addBlocker(key, "body.v14 missing");
  if (common.v14Styles.length !== 1) addBlocker(key, `expected one V14 stylesheet entrypoint, found ${common.v14Styles.length}`);
  if (common.horizontalOverflow) addBlocker(key, `horizontal overflow ${common.documentWidth}/${common.viewportWidth}`);
  if (common.brokenImages.length) addBlocker(key, `broken images: ${common.brokenImages.join(", ")}`);

  return { context, page, entry };
}

// HOME — structural delta + actual campaign/media checks.
{
  const { context, page, entry } = await openRoute("/index.html", "home");
  const home = await page.evaluate(() => {
    const hero = document.querySelector(".home-campaign-v14");
    const panel = document.querySelector(".home-campaign-v14__panel");
    const image = document.querySelector(".home-campaign-v14__media img");
    const moments = [...document.querySelectorAll(".moment-card")].map((el) => {
      const r = el.getBoundingClientRect();
      return { left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.width), height: Math.round(r.height) };
    });
    const panelStyle = panel ? getComputedStyle(panel) : null;
    return {
      heroExists: !!hero,
      panelExists: !!panel,
      panelBackground: panelStyle?.backgroundColor || null,
      heroHeight: hero ? Math.round(hero.getBoundingClientRect().height) : 0,
      imageNatural: image ? [image.naturalWidth, image.naturalHeight] : [0,0],
      imageFit: image ? getComputedStyle(image).objectFit : null,
      moments,
      currentEditBackground: getComputedStyle(document.querySelector(".current-edit")).backgroundColor,
    };
  });
  entry.home = home;
  if (!home.heroExists || !home.panelExists) addBlocker("home", "V14 campaign structure missing");
  if (home.heroHeight < 700) addBlocker("home", `campaign stage too short: ${home.heroHeight}px`);
  if (home.imageNatural[0] < 1 || home.imageNatural[1] < 1) addBlocker("home", "campaign media did not load");
  if (home.moments.length !== 3) addBlocker("home", `expected 3 runway moments, found ${home.moments.length}`);
  if (home.moments.length === 3 && home.moments.every((m) => m.top === home.moments[0].top && m.width === home.moments[0].width)) addBlocker("home", "runway moments collapsed back to equal-card rhythm");

  await page.screenshot({ path: path.join(outputDir, "home-1363-top.png"), fullPage: false });
  await page.locator(".wardrobe-moments").screenshot({ path: path.join(outputDir, "home-1363-runway.png") });
  await page.locator(".current-edit").screenshot({ path: path.join(outputDir, "home-1363-current-edit.png") });
  await context.close();
}

// SHOP — utility remains immediate while product scale changes materially.
{
  const { context, page, entry } = await openRoute("/shop.html", "shop");
  await page.waitForTimeout(250);
  const shop = await page.evaluate(() => {
    const grid = document.querySelector(".shop-grid");
    const firstImage = document.querySelector(".product-grid-item__image img");
    const firstCard = document.querySelector(".product-grid-item");
    return {
      cards: document.querySelectorAll(".js-shop-grid .product-item-wrap").length,
      gridTemplateColumns: grid ? getComputedStyle(grid).gridTemplateColumns : "",
      gridColumnCount: grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").filter(Boolean).length : 0,
      firstImageNatural: firstImage ? [firstImage.naturalWidth, firstImage.naturalHeight] : [0,0],
      firstImageFit: firstImage ? getComputedStyle(firstImage).objectFit : null,
      firstCardTop: firstCard ? Math.round(firstCard.getBoundingClientRect().top) : null,
      resultCount: document.querySelector("#result-count")?.textContent?.trim() || "",
      filterButton: !!document.querySelector(".js-filter-open"),
    };
  });
  entry.shop = shop;
  if (shop.cards < 8) addBlocker("shop", `expected >=8 cards, found ${shop.cards}`);
  if (shop.gridColumnCount !== 3) addBlocker("shop", `expected 3-column V14 grid, found ${shop.gridColumnCount}: ${shop.gridTemplateColumns}`);
  if (shop.firstImageNatural[0] < 1 || shop.firstImageNatural[1] < 1) addBlocker("shop", "first catalogue image did not load");
  if (shop.firstCardTop == null || shop.firstCardTop > 900) addBlocker("shop", `catalogue discovery delayed below evidence viewport: top=${shop.firstCardTop}`);
  if (!shop.filterButton) addBlocker("shop", "filter control missing after hydration");

  await page.screenshot({ path: path.join(outputDir, "shop-1363-top.png"), fullPage: false });
  await page.locator(".shop-grid").screenshot({ path: path.join(outputDir, "shop-1363-grid.png") });
  await context.close();
}

// PDP — product identity/media sync + size/Add to Bag regression.
{
  const { context, page, entry } = await openRoute("/detailproduct.html?id=tailored-wool-blazer", "pdp");
  await page.waitForTimeout(300);
  const pdpBefore = await page.evaluate(() => ({
    title: document.querySelector(".js-product-title")?.textContent?.trim() || "",
    price: document.querySelector(".js-product-price")?.textContent?.trim() || "",
    imageSrc: document.querySelector("#main-product-img")?.getAttribute("src") || "",
    imageNatural: [document.querySelector("#main-product-img")?.naturalWidth || 0, document.querySelector("#main-product-img")?.naturalHeight || 0],
    gridTemplateColumns: getComputedStyle(document.querySelector(".product-detail-grid")).gridTemplateColumns,
    addButtonVisible: !!document.querySelector(".js-btn-add-cart")?.getBoundingClientRect().height,
  }));
  entry.pdpBefore = pdpBefore;
  if (!/Belted Cropped Jacket/i.test(pdpBefore.title)) addBlocker("pdp", `product title out of sync: ${pdpBefore.title}`);
  if (!pdpBefore.price.includes("3.490.000")) addBlocker("pdp", `product price out of sync: ${pdpBefore.price}`);
  if (!pdpBefore.imageSrc.includes("belted-cropped-jacket")) addBlocker("pdp", `product image out of sync: ${pdpBefore.imageSrc}`);
  if (pdpBefore.imageNatural[0] < 1 || pdpBefore.imageNatural[1] < 1) addBlocker("pdp", "main product media did not load");
  if (!pdpBefore.addButtonVisible) addBlocker("pdp", "Add to Bag is not visible in decision rail");

  await page.screenshot({ path: path.join(outputDir, "pdp-1363-top.png"), fullPage: false });
  const sizeS = page.locator('.js-size-options button[data-size="S"]');
  await sizeS.click();
  await page.waitForTimeout(80);
  const selected = await sizeS.getAttribute("aria-pressed");
  if (selected !== "true") addBlocker("pdp", "size S selection did not become aria-pressed=true");
  await page.locator(".js-btn-add-cart").click();
  await page.waitForTimeout(180);
  const bagCount = await page.locator(".js-nav-bag-count").first().textContent();
  entry.pdpInteraction = { selectedSize: "S", selectedAriaPressed: selected, bagCount: bagCount?.trim() || "" };
  if (!bagCount || Number.parseInt(bagCount, 10) < 1) addBlocker("pdp", `Bag count did not update: ${bagCount}`);
  await page.screenshot({ path: path.join(outputDir, "pdp-1363-selected.png"), fullPage: false });
  await context.close();
}

await browser.close();
await writeFile(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));

console.log(`V14 representative QA captured ${report.checks.length} roles at ${viewport.width}x${viewport.height}.`);
console.log(`Blockers: ${report.blockers.length}`);
for (const blocker of report.blockers) console.log(JSON.stringify(blocker));
if (report.blockers.length) process.exit(1);
