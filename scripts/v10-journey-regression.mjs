import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts");
await mkdir(outDir, { recursive: true });

const cases = [
  { key: "home", url: "/index.html", widths: [390, 1440], marker: ".v10-intent-rail" },
  { key: "shop", url: "/shop.html", widths: [390, 1440], marker: ".shop-page" },
  { key: "pdp", url: "/detailproduct.html?id=tailored-wool-blazer", widths: [390, 1440], marker: ".v10-pdp-header" },
  { key: "bag", url: "/cart.html", widths: [390, 1440], marker: ".v10-bag-progress" },
  { key: "checkout", url: "/checkout.html", widths: [390, 1440], marker: ".v10-checkout-path" },
  { key: "collections", url: "/collections.html", widths: [390, 1440], marker: ".collection-feature" },
  { key: "house", url: "/about.html", widths: [390, 1440], marker: ".house-page" },
];

const seededCart = [{
  id: "qa-tailored-wool-blazer",
  productId: "tailored-wool-blazer",
  variantId: null,
  color: null,
  colorName: null,
  size: null,
  quantity: 1,
  unitPrice: 19500000,
  addedAt: 1788253200000,
}];

async function prime(page) {
  await page.evaluate(async () => {
    const step = Math.max(320, Math.floor(innerHeight * .8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 80));
  });
}

const browser = await chromium.launch({ headless: true });
const report = [];

for (const testCase of cases) {
  for (const width of testCase.widths) {
    const height = width <= 430 ? 844 : 1000;
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", colorScheme: "light" });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => pageErrors.push(String(error)));
    await page.addInitScript((cart) => localStorage.setItem("atelier.cart.v2", JSON.stringify(cart)), seededCart);

    const response = await page.goto(new URL(testCase.url, baseURL).toString(), { waitUntil: "networkidle", timeout: 30000 });
    await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
    await page.waitForTimeout(180);
    await prime(page);

    const metrics = await page.evaluate(({ key, marker, width }) => {
      const visible = (el) => {
        if (!el) return false;
        const style = getComputedStyle(el);
        const box = el.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity || 1) > 0 && box.width > 0 && box.height > 0;
      };
      const images = [...document.images].filter(visible).map((img) => {
        const style = getComputedStyle(img);
        const box = img.getBoundingClientRect();
        return {
          className: img.className || "",
          src: img.currentSrc || img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          width: Math.round(box.width),
          height: Math.round(box.height),
          objectFit: style.objectFit,
        };
      });
      const criticalSelectors = {
        home: ".campaign-frame img, .v7-product-image img, .v7-collection-image img, .v7-collection-detail img",
        shop: ".product-grid-item__image img",
        pdp: ".main-img-wrap > img, .pdp-thumbnail img, .related-item img",
        bag: ".cart-item img, .related-products-list img",
        checkout: ".summary-items img",
        collections: ".collection-feature-image img",
        house: ".house-image-frame img",
      };
      const critical = [...document.querySelectorAll(criticalSelectors[key] || "img")].filter(visible).map((img) => ({
        fit: getComputedStyle(img).objectFit,
        width: Math.round(img.getBoundingClientRect().width),
        height: Math.round(img.getBoundingClientRect().height),
      }));
      const markerEl = document.querySelector(marker);
      const shopPanel = document.querySelector(".shop-filter-panel");
      const shopGrid = document.querySelector(".shop-grid");
      const pdpVisuals = document.querySelector(".product-visuals");
      const cartSummary = document.querySelector(".order-summary");
      const checkoutSummary = document.querySelector(".checkout-summary");
      return {
        owner: document.documentElement.dataset.atelierDesign,
        markerVisible: visible(markerEl),
        h1Count: document.querySelectorAll("h1").length,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        brokenImages: images.filter((img) => img.naturalWidth === 0 || img.naturalHeight === 0).map((img) => img.src),
        critical,
        homeIntentCards: document.querySelectorAll(".v10-intent-card").length,
        shopDesktopPanelVisible: key !== "shop" || width < 821 || visible(shopPanel),
        shopGridColumns: shopGrid ? getComputedStyle(shopGrid).gridTemplateColumns.split(" ").filter(Boolean).length : null,
        pdpHeaderExists: key !== "pdp" || Boolean(document.querySelector(".v10-pdp-header .product-title")),
        pdpDecisionGuideExists: key !== "pdp" || Boolean(document.querySelector(".v10-decision-guide")),
        pdpVisualDisplay: pdpVisuals ? getComputedStyle(pdpVisuals).display : null,
        bagSummaryOrder: cartSummary ? getComputedStyle(cartSummary).gridColumn : null,
        checkoutSummaryOrder: checkoutSummary ? getComputedStyle(checkoutSummary).gridColumn : null,
      };
    }, { key: testCase.key, marker: testCase.marker, width });

    const problems = [];
    if (response?.status() !== 200) problems.push(`http:${response?.status()}`);
    if (consoleErrors.length) problems.push("console-errors");
    if (pageErrors.length) problems.push("page-errors");
    if (metrics.owner !== "v10-journey") problems.push("wrong-design-owner");
    if (!metrics.markerVisible) problems.push("missing-journey-marker");
    if (metrics.h1Count !== 1) problems.push(`h1-count:${metrics.h1Count}`);
    if (metrics.horizontalOverflow) problems.push("horizontal-overflow");
    if (metrics.brokenImages.length) problems.push("broken-image");
    if (metrics.critical.some((img) => !["contain", "cover"].includes(img.fit))) problems.push("unowned-critical-image-fit");
    if (testCase.key === "home" && metrics.homeIntentCards !== 4) problems.push("home-intent-routing-missing");
    if (testCase.key === "shop" && width >= 821 && !metrics.shopDesktopPanelVisible) problems.push("desktop-filter-rail-hidden");
    if (testCase.key === "shop" && width >= 821 && metrics.shopGridColumns !== 2) problems.push(`shop-grid-not-two-column:${metrics.shopGridColumns}`);
    if (testCase.key === "pdp" && (!metrics.pdpHeaderExists || !metrics.pdpDecisionGuideExists)) problems.push("pdp-decision-journey-missing");

    await page.screenshot({ path: path.join(outDir, `v10-${testCase.key}-${width}-top.png`), fullPage: false });
    await page.screenshot({ path: path.join(outDir, `v10-${testCase.key}-${width}-full.png`), fullPage: true });
    report.push({ route: testCase.key, width, consoleErrors, pageErrors, problems, ...metrics });
    await context.close();
  }
}

await browser.close();
await writeFile(path.join(outDir, "v10-journey-report.json"), JSON.stringify(report, null, 2));
const failed = report.filter((item) => item.problems.length);
console.log(`V10 journey checks: ${report.length}; failed: ${failed.length}`);
failed.forEach((item) => console.log(JSON.stringify({ route: item.route, width: item.width, problems: item.problems })));
if (failed.length) process.exitCode = 1;
