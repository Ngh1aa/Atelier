import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts/v14-whole-site");
await mkdir(outputDir, { recursive: true });

const viewport = { width: 1363, height: 936 };
const pressureViewport = { width: 1100, height: 900 };
const browser = await chromium.launch({ headless: true });

const seededCart = [{
  id: "qa-tailored-wool-blazer-S",
  productId: "tailored-wool-blazer",
  variantId: null,
  color: "black",
  colorName: "Black",
  size: "S",
  quantity: 1,
  unitPrice: 3490000,
  addedAt: 1788753600000,
}];

const seededWishlist = [{ productId: "cashmere-overcoat", preferredVariantId: null, savedAt: 1788753600000 }];
const seededOrders = [{
  id: "QA-ORDER-001",
  currency: "VND",
  reality: "SIMULATED_LOCAL",
  paymentStatus: "pending-local",
  fulfillmentStatus: "recorded-local",
  tracking: null,
  serviceRequests: [],
  createdAt: "2026-09-07T04:00:00.000Z",
  customer: { email: "qa@example.test", phone: "0900000000", fullName: "QA Customer" },
  address: { country: "Vietnam", address: "1 Nguyen Hue", apartment: "", district: "District 1", province: "Ho Chi Minh City", postalCode: "" },
  deliveryMethod: "standard",
  deliveryEstimate: "2–4 days",
  paymentMethod: "cod",
  items: [{
    productId: "tailored-wool-blazer",
    variantId: null,
    name: "Belted Cropped Jacket",
    image: "./assets/products/pinkparks/belted-cropped-jacket.jpg",
    color: "Black",
    size: "S",
    quantity: 1,
    unitPrice: 3490000,
  }],
  subtotal: 3490000,
  shippingFee: 0,
  discount: 0,
  total: 3490000,
}];

const routes = [
  ["home", "/index.html"],
  ["shop", "/shop.html"],
  ["pdp", "/detailproduct.html?id=tailored-wool-blazer"],
  ["collections", "/collections.html"],
  ["house", "/about.html"],
  ["services", "/client-services.html"],
  ["contact", "/contact.html"],
  ["shipping", "/shipping&returns.html"],
  ["size", "/size-guide.html"],
  ["care", "/care-guide.html"],
  ["cart", "/cart.html"],
  ["checkout", "/checkout.html"],
  ["saved", "/favourite.html"],
  ["account", "/account.html"],
  ["order", "/order.html?id=QA-ORDER-001"],
  ["order-success", "/order-success.html?id=QA-ORDER-001"],
  ["login", "/login.html"],
  ["forgot", "/forgot-password.html"],
  ["privacy", "/privacy.html"],
  ["terms", "/terms.html"],
];

const screenshotRoles = new Set([
  "home", "shop", "pdp", "collections", "house", "services", "contact",
  "cart", "checkout", "saved", "account", "order", "login", "privacy",
]);

const report = {
  generatedAt: new Date().toISOString(),
  scope: "desktop_only",
  viewport,
  pressureViewport,
  routes: [],
  pressureChecks: [],
  blockers: [],
};

const addBlocker = (key, message) => report.blockers.push({ key, message });

async function primeContext(context) {
  await context.addInitScript(({ cart, wishlist, orders }) => {
    localStorage.setItem("atelier.cart.v2", JSON.stringify(cart));
    localStorage.setItem("atelier.wishlist.v2", JSON.stringify(wishlist));
    localStorage.setItem("atelier.orders", JSON.stringify(orders));
    localStorage.removeItem("atelier.promo");
  }, { cart: seededCart, wishlist: seededWishlist, orders: seededOrders });
}

async function openPage(key, pathname, size = viewport) {
  const context = await browser.newContext({ viewport: size, deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "reduce" });
  await primeContext(context);
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  const response = await page.goto(new URL(pathname, baseURL).toString(), { waitUntil: "networkidle", timeout: 30_000 });
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  await page.addStyleTag({ content: `*,*::before,*::after{animation-duration:.001ms!important;animation-delay:0ms!important;transition-duration:.001ms!important;transition-delay:0ms!important;scroll-behavior:auto!important}` });
  await page.waitForTimeout(180);

  const metrics = await page.evaluate(() => {
    const styles = [...document.querySelectorAll('link[rel="stylesheet"]')].map((el) => el.getAttribute("href") || "");
    const images = [...document.images];
    return {
      title: document.title,
      h1Count: document.querySelectorAll("main h1").length,
      h1Text: document.querySelector("main h1")?.textContent?.replace(/\s+/g, " ").trim() || "",
      bodyV14: document.body.classList.contains("v14"),
      styleOwner: document.documentElement.dataset.atelierStyle || "",
      siteStyles: styles.filter((href) => href.includes("atelier-v14-site.css")),
      legacyStyles: styles.filter((href) => /atelier-v13\.css/.test(href)),
      viewportWidth: document.documentElement.clientWidth,
      documentWidth: document.documentElement.scrollWidth,
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      brokenImages: images.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
      bodyText: document.body.innerText.replace(/\s+/g, " ").trim().slice(0, 12000),
      navVisible: (() => {
        const nav = document.querySelector("body > nav");
        if (!nav) return false;
        const r = nav.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && getComputedStyle(nav).visibility !== "hidden";
      })(),
    };
  });

  const entry = { key, pathname, width: size.width, height: size.height, httpStatus: response?.status() || null, consoleErrors, pageErrors, ...metrics };

  if (!response?.ok()) addBlocker(key, `HTTP ${response?.status() ?? "no response"}`);
  if (consoleErrors.length) addBlocker(key, `console errors: ${consoleErrors.join(" | ")}`);
  if (pageErrors.length) addBlocker(key, `page errors: ${pageErrors.join(" | ")}`);
  if (metrics.h1Count !== 1) addBlocker(key, `expected one main H1, found ${metrics.h1Count}`);
  if (!metrics.bodyV14) addBlocker(key, "body.v14 missing");
  if (metrics.styleOwner !== "luxury-monochrome") addBlocker(key, `wrong style owner: ${metrics.styleOwner || "missing"}`);
  if (metrics.siteStyles.length !== 1) addBlocker(key, `expected one V14 site entrypoint, found ${metrics.siteStyles.length}`);
  if (metrics.legacyStyles.length) addBlocker(key, `legacy stylesheet remains: ${metrics.legacyStyles.join(", ")}`);
  if (metrics.horizontalOverflow) addBlocker(key, `horizontal overflow ${metrics.documentWidth}/${metrics.viewportWidth}`);
  if (metrics.brokenImages.length) addBlocker(key, `broken images: ${metrics.brokenImages.join(", ")}`);
  if (!metrics.navVisible) addBlocker(key, "primary/checkout navigation not visible");

  return { context, page, entry };
}

for (const [key, pathname] of routes) {
  const { context, page, entry } = await openPage(key, pathname);

  if (key === "cart") {
    entry.cartReality = await page.evaluate(() => ({
      itemCount: document.querySelectorAll(".cart-item").length,
      checkoutVisible: !!document.querySelector(".btn-checkout")?.getBoundingClientRect().height,
      total: document.querySelector(".js-summary-total")?.textContent?.trim() || "",
    }));
    if (entry.cartReality.itemCount < 1) addBlocker(key, "seeded cart item not rendered");
    if (!entry.cartReality.checkoutVisible) addBlocker(key, "checkout action not visible");
  }

  if (key === "saved") {
    entry.savedReality = await page.evaluate(() => ({ cards: document.querySelectorAll(".favourite-item").length }));
    if (entry.savedReality.cards < 1) addBlocker(key, "seeded saved item not rendered");
  }

  if (key === "checkout") {
    entry.checkoutReality = await page.evaluate(() => ({
      prototypeNote: document.querySelector(".checkout-reality-note")?.textContent?.replace(/\s+/g, " ").trim() || "",
      summaryItems: document.querySelectorAll(".summary-item").length,
      placeOrderLabel: document.querySelector(".js-place-order")?.textContent?.trim() || "",
    }));
    if (!/static edition|stores the order in this browser/i.test(entry.checkoutReality.prototypeNote)) addBlocker(key, "checkout prototype reality note missing or weakened");
    if (!/Record Order on This Device/i.test(entry.checkoutReality.placeOrderLabel)) addBlocker(key, `checkout action overclaims reality: ${entry.checkoutReality.placeOrderLabel}`);
    if (entry.checkoutReality.summaryItems < 1) addBlocker(key, "seeded checkout summary item missing");
  }

  if (key === "login" || key === "forgot") {
    if (!/does not currently create client accounts|does not store passwords|does not collect|static edition|locally|browser/i.test(entry.bodyText)) addBlocker(key, "auth static-reality disclosure missing");
  }

  if (key === "contact") {
    if (!/direct messaging is not connected|will not be sent|not be sent/i.test(entry.bodyText)) addBlocker(key, "contact local-draft reality disclosure missing");
  }

  if (key === "order") {
    entry.orderReality = await page.evaluate(() => ({
      body: document.querySelector("main")?.innerText.replace(/\s+/g, " ").trim() || "",
      items: document.querySelectorAll(".order-item").length,
    }));
    if (entry.orderReality.items < 1) addBlocker(key, "seeded local order not rendered");
  }

  if (key === "house") {
    const anchor = page.locator('a[href="#house-codes"]').first();
    if (await anchor.count()) {
      await anchor.click();
      await page.waitForTimeout(100);
      entry.houseAnchor = await page.evaluate(() => {
        const nav = document.querySelector("body > nav");
        const target = document.querySelector("#house-codes");
        const navHeight = nav ? nav.getBoundingClientRect().height : 0;
        const targetTop = target ? target.getBoundingClientRect().top : -1;
        return { navHeight: Math.round(navHeight), targetTop: Math.round(targetTop) };
      });
      if (entry.houseAnchor.targetTop < entry.houseAnchor.navHeight + 8) {
        addBlocker(key, `House codes anchor sits under sticky nav: target=${entry.houseAnchor.targetTop}, nav=${entry.houseAnchor.navHeight}`);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(60);
    }
  }

  if (screenshotRoles.has(key)) {
    await page.screenshot({ path: path.join(outputDir, `${key}-1363-top.png`), fullPage: false });
  }

  if (key === "collections") {
    await page.locator("#workday").screenshot({ path: path.join(outputDir, "collections-1363-chapter.png") });
  }
  if (key === "house") {
    await page.locator("#house-codes").screenshot({ path: path.join(outputDir, "house-1363-codes.png") });
  }
  if (key === "services") {
    await page.locator(".v12-service-index").screenshot({ path: path.join(outputDir, "services-1363-index.png") });
  }

  report.routes.push(entry);
  await context.close();
}

// Desktop pressure-point checks only; mobile/tablet remain N/A_JUSTIFIED by project contract.
for (const [key, pathname] of [["home", "/index.html"], ["collections", "/collections.html"], ["house", "/about.html"], ["cart", "/cart.html"], ["checkout", "/checkout.html"]]) {
  const { context, page, entry } = await openPage(`pressure-${key}`, pathname, pressureViewport);
  report.pressureChecks.push(entry);
  await page.screenshot({ path: path.join(outputDir, `${key}-1100-pressure.png`), fullPage: false });
  await context.close();
}

await browser.close();
await writeFile(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));
console.log(`V14 whole-site QA: ${report.routes.length} routes + ${report.pressureChecks.length} desktop pressure checks.`);
console.log(`Blockers: ${report.blockers.length}`);
for (const blocker of report.blockers) console.log(JSON.stringify(blocker));
if (report.blockers.length) process.exit(1);
