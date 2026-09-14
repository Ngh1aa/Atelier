import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts/v15-flagship");
await mkdir(outputDir, { recursive: true });

const routes = [
  ["home", "/index.html"],
  ["collections", "/collections.html"],
  ["shop", "/shop.html"],
  ["pdp", "/detailproduct.html?id=tailored-wool-blazer"],
  ["bag", "/cart.html"],
  ["checkout", "/checkout.html"],
  ["confirmation", "/order-success.html?id=QA-ORDER-001"],
  ["design-system", "/design-system.html"],
  ["component-states", "/component-states.html"],
];

const viewports = [
  { name: "1440", width: 1440, height: 1000 },
  { name: "1280", width: 1280, height: 900 },
  { name: "768", width: 768, height: 1024 },
  { name: "390", width: 390, height: 844 },
  { name: "320", width: 320, height: 720 },
];

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

const seededOrders = [{
  id: "QA-ORDER-001",
  currency: "VND",
  reality: "SIMULATED_LOCAL",
  paymentStatus: "pending-local",
  fulfillmentStatus: "recorded-local",
  tracking: null,
  serviceRequests: [],
  createdAt: "2026-09-14T04:00:00.000Z",
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

const report = { generatedAt: new Date().toISOString(), baseURL, routeViewportChecks: [], interactions: [], blockers: [] };
const fail = (scope, message, detail = null) => report.blockers.push({ scope, message, detail });

async function prime(context) {
  await context.addInitScript(({ cart, orders }) => {
    localStorage.setItem("atelier.cart.v2", JSON.stringify(cart));
    localStorage.setItem("atelier.orders", JSON.stringify(orders));
    localStorage.setItem("atelier.wishlist.v2", JSON.stringify([]));
  }, { cart: seededCart, orders: seededOrders });
}

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  await page.waitForTimeout(80);
}

const browser = await chromium.launch({ headless: true });

for (const viewport of viewports) {
  for (const [key, pathname] of routes) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, colorScheme: "light" });
    await prime(context);
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on("console", (message) => { if (message.type() === "error") runtimeErrors.push(`console: ${message.text()}`); });
    page.on("pageerror", (error) => runtimeErrors.push(`pageerror: ${error.message}`));
    page.on("requestfailed", (request) => runtimeErrors.push(`requestfailed: ${request.url()} — ${request.failure()?.errorText || "unknown"}`));

    const response = await page.goto(new URL(pathname, baseURL).toString(), { waitUntil: "domcontentloaded", timeout: 30_000 });
    await settle(page);

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth,
      atelierVersion: document.documentElement.dataset.atelierVersion || "",
      brokenImages: [...document.images]
        .filter((img) => img.complete && img.naturalWidth === 0)
        .map((img) => img.getAttribute("src")),
    }));

    if (!response || response.status() >= 400) fail(`${key}-${viewport.name}`, `route returned ${response?.status() ?? "no response"}`);
    if (metrics.scrollWidth > metrics.innerWidth + 1) fail(`${key}-${viewport.name}`, "horizontal document overflow", metrics);
    if (metrics.atelierVersion !== "v15") fail(`${key}-${viewport.name}`, "V15 runtime marker missing", metrics.atelierVersion);
    if (metrics.brokenImages.length) fail(`${key}-${viewport.name}`, "broken product/content images", metrics.brokenImages);
    runtimeErrors.forEach((error) => fail(`${key}-${viewport.name}`, error));

    const axe = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const severe = axe.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
    severe.forEach((violation) => fail(`${key}-${viewport.name}`, `axe ${violation.impact}: ${violation.id}`, {
      help: violation.help,
      nodes: violation.nodes.slice(0, 5).map((node) => node.target),
    }));

    await page.screenshot({ path: path.join(outputDir, `${key}-${viewport.name}.png`), fullPage: false });
    report.routeViewportChecks.push({ route: key, viewport: viewport.name, status: response?.status(), ...metrics, seriousCriticalAxe: severe.length, runtimeErrors });
    await context.close();
  }
}

async function recordInteraction(name, run) {
  try {
    const detail = await run();
    report.interactions.push({ name, result: "PASS", detail });
  } catch (error) {
    report.interactions.push({ name, result: "FAIL", detail: String(error) });
    fail(name, String(error));
  }
}

await recordInteraction("keyboard search opens, traps context and returns focus", async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await prime(context);
  const page = await context.newPage();
  await page.goto(new URL("/shop.html", baseURL).toString(), { waitUntil: "domcontentloaded" });
  await settle(page);
  await page.locator("#navSearchBtn").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(30);
  if (!await page.locator("#navSearchOverlay").evaluate((el) => el.classList.contains("open"))) throw new Error("Search overlay did not open from keyboard activation");
  if (await page.evaluate(() => document.activeElement?.id) !== "navSearchInput") throw new Error("Search focus did not move to input");
  await page.keyboard.type("zzzzzz");
  await page.waitForTimeout(80);
  if (!await page.locator(".search-empty-state").count()) throw new Error("Search no-result recovery state missing");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(20);
  if (await page.evaluate(() => document.activeElement?.id) !== "navSearchBtn") throw new Error("Search focus did not return to trigger");
  await context.close();
  return "keyboard open/no-result/Escape/focus-return";
});

await recordInteraction("filter opens and returns focus", async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await prime(context);
  const page = await context.newPage();
  await page.goto(new URL("/shop.html", baseURL).toString(), { waitUntil: "domcontentloaded" });
  await settle(page);
  const trigger = page.locator(".js-filter-open");
  await trigger.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(20);
  const panel = page.locator(".js-shop-filter-panel");
  if (await panel.getAttribute("aria-hidden") !== "false") throw new Error("Filter did not open");
  const close = panel.locator(".js-filter-close");
  await close.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(20);
  if (await panel.getAttribute("aria-hidden") !== "true") throw new Error("Filter did not close");
  if (!await trigger.evaluate((el) => el === document.activeElement)) throw new Error("Filter focus did not return to trigger");
  await context.close();
  return "keyboard trigger/close/focus-return";
});

await recordInteraction("PDP size, truthful availability, add-to-bag drawer", async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await prime(context);
  const page = await context.newPage();
  await page.goto(new URL("/detailproduct.html?id=tailored-wool-blazer", baseURL).toString(), { waitUntil: "domcontentloaded" });
  await settle(page);
  const firstSize = page.locator(".js-size-options button:not(:disabled)").first();
  await firstSize.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(30);
  const availability = (await page.locator(".js-pdp-availability").textContent())?.trim() || "";
  if (!availability) throw new Error("Availability status is empty");
  if (/in stock/i.test(availability) && /not connected/i.test(availability) === false) throw new Error(`Unknown inventory was converted to an unverified stock claim: ${availability}`);
  const add = page.locator(".js-btn-add-cart");
  await add.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(80);
  const overlay = page.locator("#atelier-commerce-overlay");
  if (!await overlay.evaluate((el) => el.classList.contains("is-open"))) throw new Error("Mini Bag did not open after successful add");
  const activeInsideDrawer = await page.evaluate(() => Boolean(document.activeElement?.closest?.(".commerce-drawer")));
  if (!activeInsideDrawer) throw new Error("Focus did not enter commerce drawer");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(30);
  if (await overlay.evaluate((el) => el.classList.contains("is-open"))) throw new Error("Commerce drawer did not close with Escape");
  await context.close();
  return availability;
});

await recordInteraction("checkout validation focuses first invalid field", async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await prime(context);
  const page = await context.newPage();
  await page.goto(new URL("/checkout.html", baseURL).toString(), { waitUntil: "domcontentloaded" });
  await settle(page);
  if (!await page.locator(".checkout-progress").count()) throw new Error("Checkout progress rail missing");
  const submit = page.locator(".js-place-order");
  await submit.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(40);
  const invalidCount = await page.locator('[aria-invalid="true"]').count();
  if (!invalidCount) throw new Error("Checkout did not expose invalid fields");
  const focusedInvalid = await page.evaluate(() => document.activeElement?.getAttribute("aria-invalid") === "true");
  if (!focusedInvalid) throw new Error("Checkout did not focus the first invalid field");
  await context.close();
  return `${invalidCount} invalid fields exposed`;
});

await recordInteraction("mobile menu keyboard focus and Escape", async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await prime(context);
  const page = await context.newPage();
  await page.goto(new URL("/index.html", baseURL).toString(), { waitUntil: "domcontentloaded" });
  await settle(page);
  const menu = page.locator(".hamburger-btn");
  await menu.focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(20);
  if (await menu.getAttribute("aria-expanded") !== "true") throw new Error("Mobile menu did not open");
  if (!await page.evaluate(() => document.activeElement?.closest?.("#atelier-mobile-menu") !== null)) throw new Error("Mobile menu focus did not move to menu");
  await page.keyboard.press("Escape");
  if (!await menu.evaluate((el) => el === document.activeElement)) throw new Error("Mobile menu focus did not return to trigger");
  await context.close();
  return "open/focus/Escape/return";
});

await recordInteraction("reduced motion preserves content and removes transforms", async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  await prime(context);
  const page = await context.newPage();
  await page.goto(new URL("/index.html", baseURL).toString(), { waitUntil: "domcontentloaded" });
  await settle(page);
  const state = await page.evaluate(() => ({
    matches: matchMedia("(prefers-reduced-motion: reduce)").matches,
    hiddenMotionContent: [...document.querySelectorAll(".reveal,.atelier-motion-item")].filter((el) => {
      const style = getComputedStyle(el);
      return Number.parseFloat(style.opacity) < .99 || style.transform !== "none";
    }).length,
  }));
  if (!state.matches) throw new Error("Reduced motion media query did not match");
  if (state.hiddenMotionContent) throw new Error(`${state.hiddenMotionContent} motion elements remained hidden/transformed`);
  await context.close();
  return state;
});

await browser.close();
await writeFile(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));

if (report.blockers.length) {
  console.error(JSON.stringify(report.blockers, null, 2));
  process.exit(1);
}
console.log(`V15 flagship QA passed: ${report.routeViewportChecks.length} route/viewport states, ${report.interactions.length} interaction checks, 0 serious/critical Axe blockers.`);
