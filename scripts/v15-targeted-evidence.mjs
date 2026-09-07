import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts/v15-targeted-evidence");
await mkdir(outputDir, { recursive: true });

const seededCart = [{ id: "qa-tailored-wool-blazer-S", productId: "tailored-wool-blazer", variantId: null, color: "black", colorName: "Black", size: "S", quantity: 1, unitPrice: 3490000, addedAt: 1788753600000 }];
const seededWishlist = [{ productId: "cashmere-overcoat", preferredVariantId: null, savedAt: 1788753600000 }];
const seededOrders = [{
  id: "QA-ORDER-001", currency: "VND", reality: "SIMULATED_LOCAL", paymentStatus: "pending-local", fulfillmentStatus: "recorded-local", tracking: null, serviceRequests: [], createdAt: "2026-09-07T04:00:00.000Z",
  customer: { email: "qa@example.test", phone: "0900000000", fullName: "QA Customer" },
  address: { country: "Vietnam", address: "1 Nguyen Hue", apartment: "", district: "District 1", province: "Ho Chi Minh City", postalCode: "" },
  deliveryMethod: "standard", deliveryEstimate: "2–4 days", paymentMethod: "cod",
  items: [{ productId: "tailored-wool-blazer", variantId: null, name: "Belted Cropped Jacket", image: "./assets/products/pinkparks/belted-cropped-jacket.jpg", color: "Black", size: "S", quantity: 1, unitPrice: 3490000 }],
  subtotal: 3490000, shippingFee: 0, discount: 0, total: 3490000,
}];

const cases = [
  ["home", "/index.html", ".home-campaign-v14"],
  ["house", "/about.html", ".v12-house-hero"],
  ["services", "/client-services.html", ".v12-service-hero"],
  ["login-footer", "/login.html", ".auth-footer-page"],
  ["forgot-footer", "/forgot-password.html", ".auth-footer-page"],
  ["cart-summary", "/cart.html", ".order-summary-card"],
  ["checkout-summary", "/checkout.html", ".summary-card"],
];

const browser = await chromium.launch({ headless: true });
for (const viewport of [{ name: "1363", width: 1363, height: 936 }, { name: "1100", width: 1100, height: 900 }]) {
  for (const [key, pathname, selector] of cases) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, colorScheme: "light", reducedMotion: "reduce" });
    await context.addInitScript(({ cart, wishlist, orders }) => {
      localStorage.setItem("atelier.cart.v2", JSON.stringify(cart));
      localStorage.setItem("atelier.wishlist.v2", JSON.stringify(wishlist));
      localStorage.setItem("atelier.orders", JSON.stringify(orders));
    }, { cart: seededCart, wishlist: seededWishlist, orders: seededOrders });
    const page = await context.newPage();
    await page.goto(new URL(pathname, baseURL).toString(), { waitUntil: "networkidle", timeout: 30_000 });
    await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
    await page.addStyleTag({ content: `*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important}` });
    const target = page.locator(selector).first();
    if (await target.count()) {
      await target.scrollIntoViewIfNeeded();
      await target.screenshot({ path: path.join(outputDir, `${key}-${viewport.name}.png`) });
    }
    const action = page.locator(`${selector} a[href],${selector} button`).filter({ visible: true }).first();
    if (await action.count()) {
      await action.hover({ force: true });
      await page.waitForTimeout(20);
      await target.screenshot({ path: path.join(outputDir, `${key}-${viewport.name}-hover.png`) });
    }
    await context.close();
  }
}
await browser.close();
console.log("V15 targeted rendered evidence captured.");
