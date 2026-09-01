import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts");
await mkdir(outputDir, { recursive: true });

const routes = [
  { key: "collections-v8", path: "/collections.html", widths: [390, 1440] },
  { key: "house-v8", path: "/about.html", widths: [390, 1440] },
  { key: "services-v8", path: "/client-services.html", widths: [390, 1440] },
  { key: "size-v8", path: "/size-guide.html", widths: [390, 1440] },
  { key: "bag-v8", path: "/cart.html", widths: [390, 1440] },
  { key: "saved-v8", path: "/favourite.html", widths: [390, 1440] },
  { key: "account-v8", path: "/account.html", widths: [390, 1440] },
];

const seededCart = [{
  id: "v8-line",
  productId: "tailored-wool-blazer",
  variantId: null,
  color: null,
  colorName: null,
  size: null,
  quantity: 1,
  unitPrice: 19500000,
  addedAt: 1788253200000,
}];

const seededWishlist = [
  { productId: "cashmere-overcoat", preferredVariantId: null, savedAt: 1788253200000 },
  { productId: "tailored-wool-blazer", preferredVariantId: null, savedAt: 1788253200001 },
];

const seededOrders = [{
  id: "V8-QA-001",
  currency: "VND",
  reality: "SIMULATED_LOCAL",
  paymentStatus: "pending-local",
  fulfillmentStatus: "recorded-local",
  createdAt: "2026-09-01T10:00:00.000Z",
  customer: { email: "qa@example.test", phone: "0900000000", fullName: "QA Customer" },
  address: { country: "Vietnam", address: "1 Nguyen Hue", district: "District 1", province: "Ho Chi Minh City" },
  items: [], subtotal: 0, shippingFee: 0, discount: 0, total: 0,
}];

const browser = await chromium.launch({ headless: true });
const report = { generatedAt: new Date().toISOString(), routes: [] };

for (const route of routes) {
  for (const width of route.widths) {
    const height = width <= 430 ? 844 : 1000;
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce", colorScheme: "light" });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    await page.addInitScript(({ cart, wishlist, orders }) => {
      localStorage.setItem("atelier.cart.v2", JSON.stringify(cart));
      localStorage.setItem("atelier.wishlist.v2", JSON.stringify(wishlist));
      localStorage.setItem("atelier.orders", JSON.stringify(orders));
    }, { cart: seededCart, wishlist: seededWishlist, orders: seededOrders });

    const response = await page.goto(new URL(route.path, baseURL).toString(), { waitUntil: "networkidle", timeout: 30_000 });
    await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
    await page.waitForFunction(() => document.documentElement.dataset.atelierDesign === "campaign-commerce-v8", null, { timeout: 5_000 });
    await page.waitForTimeout(180);

    await page.addStyleTag({ content: `*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important}` });

    const metrics = await page.evaluate(() => ({
      designOwner: document.documentElement.dataset.atelierDesign || null,
      width: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
      h1Count: document.querySelectorAll("h1").length,
      brokenImages: [...document.images].filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src),
      bodyBackground: getComputedStyle(document.body).backgroundColor,
    }));

    const file = `${route.key}-${width}.png`;
    await page.screenshot({ path: path.join(outputDir, file), fullPage: true });

    report.routes.push({
      route: route.key,
      path: route.path,
      width,
      httpStatus: response?.status() || null,
      consoleErrors,
      pageErrors,
      horizontalOverflow: metrics.width > metrics.viewport + 2,
      ...metrics,
      screenshot: file,
    });
    await context.close();
  }
}

await browser.close();
await writeFile(path.join(outputDir, "v8-whole-site-report.json"), JSON.stringify(report, null, 2));

const blockers = report.routes.filter((item) =>
  item.httpStatus !== 200 ||
  item.consoleErrors.length ||
  item.pageErrors.length ||
  item.horizontalOverflow ||
  item.h1Count !== 1 ||
  item.brokenImages.length ||
  item.designOwner !== "campaign-commerce-v8"
);

console.log(`V8 whole-site captures: ${report.routes.length}`);
console.log(`V8 blocker candidates: ${blockers.length}`);
for (const blocker of blockers) console.log(JSON.stringify(blocker));
if (blockers.length) process.exitCode = 1;
