// End-to-end test for the ATELIER store (no backend, sessionStorage only).
//
//   QA_BASE_URL=http://127.0.0.1:8924 NODE_PATH=<playwright node_modules> node scripts/full-prototype-e2e.mjs
//
// Every flow runs in a fresh browser context, so each starts from the seed in
// src/data/demo-seed.js. Async UI is awaited with waitForSelector / expect-style
// polling, never fixed sleeps, so consecutive runs stay deterministic.
import { createRequire } from "node:module";
import assert from "node:assert/strict";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const baseURL = (process.env.QA_BASE_URL || "http://127.0.0.1:8924").replace(/\/$/, "");
const SITE_PAGES = [
  "index.html", "shop.html", "collections.html", "detailproduct.html?id=tailored-wool-blazer", "cart.html",
  "checkout.html", "order.html?id=AT-2611041987", "order-success.html", "favourite.html", "account.html", "login.html",
  "forgot-password.html", "client-services.html", "contact.html", "care-guide.html", "size-guide.html",
  "shipping&returns.html", "privacy.html", "terms.html", "about.html",
];
const DEMO = { email: "linh.tran@atelier-studio.vn", password: "atelier-demo", name: "Linh Tran" };
const PROTOTYPE_SIGNALS = /prototype|demo data|sandbox|simulat|fictional|state lab|portfolio review/i;

const browser = await chromium.launch();
const results = [];

async function flow(name, run) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  const started = Date.now();
  try {
    await run(page, context);
    assert.deepEqual(errors, [], `console errors during "${name}"`);
    results.push({ name, ok: true, ms: Date.now() - started });
    console.log(`  ✓ ${name} (${Date.now() - started} ms)`);
  } catch (error) {
    results.push({ name, ok: false, error: error.message });
    const where = (error.stack || "").split("\n").find((line) => line.includes("full-prototype-e2e")) || "";
    console.log(`  ✗ ${name}\n      ${error.message.split("\n").slice(0, 6).join("\n      ")}\n      ${where.trim()}`);
  } finally {
    await context.close();
  }
}

// Demo tools are hidden from visitors; flows that need them open pages with ?demo=1.
const withDemo = (path) => {
  const [beforeHash, hash = ""] = path.split("#");
  return `${beforeHash}${beforeHash.includes("?") ? "&" : "?"}demo=1${hash ? `#${hash}` : ""}`;
};
const go = async (page, path) => {
  await page.goto(`${baseURL}/${withDemo(path)}`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".demo-controls", { state: "attached", timeout: 15000 });
};
const openDemoTools = (page) => page.evaluate(() => { document.querySelector(".demo-controls").open = true; });
const text = (page, selector) => page.locator(selector).first().innerText();
const bagCount = (page) => page.evaluate(() => (JSON.parse(sessionStorage.getItem("atelier.cart.v2") || "[]")).reduce((sum, line) => sum + line.quantity, 0));
const onPage = (name) => (url) => url.pathname.endsWith(`/${name.split("?")[0]}`);
const waitText = (page, selector, pattern, timeout = 8000) => page.waitForFunction(
  ([sel, source, flags]) => [...document.querySelectorAll(sel)].some((el) => new RegExp(source, flags).test(el.textContent)),
  [selector, pattern.source, pattern.flags], { timeout },
);
async function addToBag(page, id, size, color) {
  await go(page, `detailproduct.html?id=${id}${color ? `&color=${color}` : ""}`);
  await page.waitForSelector("body[data-pdp-ready=true]");
  await page.waitForSelector(`.js-size-options button[data-size="${size}"]:not([disabled])`);
  await page.click(`.js-size-options button[data-size="${size}"]`);
  await page.click(".js-btn-add-cart");
  await page.waitForSelector(".mini-bag-item");
  await page.keyboard.press("Escape");
}
async function setFailure(page, mode) {
  await openDemoTools(page);
  await page.locator(`.demo-controls input[value="${mode}"]`).check();
  await page.waitForFunction((value) => sessionStorage.getItem("atelier.demo.failure") === value, mode);
}
// Visitors start signed in as the seeded client; sign out through the UI.
async function signOut(page) {
  await go(page, "account.html");
  await page.waitForSelector(".js-account-signed-in:not([hidden])");
  await Promise.all([page.waitForURL(onPage("login.html")), page.click(".js-sign-out")]);
  await page.waitForSelector(".js-signin-form:not([hidden])");
}
async function signIn(page, email = DEMO.email, password = DEMO.password, next = "account.html") {
  await signOut(page);
  await go(page, `login.html?next=${next}`);
  await page.fill("#signinEmail", email);
  await page.fill("#signinPassword", password);
  await Promise.all([page.waitForURL(onPage(next)), page.click(".js-signin-submit")]);
  await page.waitForSelector(".demo-controls");
}

console.log(`ATELIER full-prototype e2e against ${baseURL}`);

await flow("every site page: no console errors, no href=\"#\", no broken same-origin requests", async (page) => {
  const failures = [];
  page.on("response", (response) => {
    if (response.url().startsWith(baseURL) && response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
  });
  for (const path of SITE_PAGES) {
    await go(page, path);
    await page.waitForLoadState("networkidle");
    const dead = await page.$$eval('a[href="#"], a[href=""], a[href^="javascript:"]', (links) => links.map((link) => link.outerHTML.slice(0, 80)));
    assert.deepEqual(dead, [], `${path} has dead links`);
    const unnamed = await page.$$eval("button", (buttons) => buttons.filter((button) => !button.closest("#ui-feedback-host") && button.offsetParent && !(button.getAttribute("aria-label") || button.textContent.trim())).length);
    assert.equal(unnamed, 0, `${path} has unnamed buttons`);
  }
  assert.deepEqual(failures, [], "broken same-origin requests");
});

await flow("first visit: homepage, signed in as the seeded client, Account / Orders / Saved populated", async (page) => {
  await page.goto(`${baseURL}/`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  assert.equal(await page.locator(".demo-controls").count(), 0, "no demo tools without ?demo=1");
  await page.goto(`${baseURL}/account.html`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".js-account-signed-in:not([hidden])");
  await waitText(page, ".js-client-greeting", /Welcome, Linh\./);
  await page.waitForFunction(() => document.querySelectorAll(".account-order-row").length === 2);
  await page.goto(`${baseURL}/favourite.html`, { waitUntil: "domcontentloaded" });
  await waitText(page, ".js-favourite-count", /^2 items saved$/);
  await page.goto(`${baseURL}/account.html`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".js-account-signed-in:not([hidden])");
  await Promise.all([page.waitForURL(onPage("login.html")), page.click(".js-sign-out")]);
  await waitText(page, ".js-auth-flash", /signed out/);
  await waitText(page, ".js-continue-as-button", /Continue as Linh Tran/);
  await page.goto(`${baseURL}/account.html`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".js-account-signed-out:not([hidden])");
  await page.goto(`${baseURL}/login.html`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".js-continue-as:not([hidden])");
  await Promise.all([page.waitForURL(onPage("account.html")), page.click(".js-continue-as-button")]);
  await waitText(page, ".js-client-greeting", /Welcome, Linh\./);
});

await flow("no prototype signals or demo tools without ?demo=1; tools appear with ?demo=1 and leave with ?demo=0", async (page) => {
  for (const path of SITE_PAGES) {
    await page.goto(`${baseURL}/${path}`, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");
    const visible = await page.evaluate(() => [document.title, document.body.innerText].join("\n"));
    const hit = visible.split("\n").find((line) => PROTOTYPE_SIGNALS.test(line));
    assert.equal(hit, undefined, `${path} shows a prototype signal`);
    assert.equal(await page.locator(".demo-controls, .atelier-state-lab-launcher, #ui-feedback-host").count(), 0, `${path} shows demo tooling`);
    assert.equal(await page.locator(".footer-concept-note").count(), 1, `${path} has the concept footer line`);
  }
  await page.goto(`${baseURL}/shop.html?demo=1`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".demo-controls > summary", { state: "visible" });
  await page.goto(`${baseURL}/about.html`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".demo-controls > summary", { state: "visible" });
  await page.click(".demo-controls > summary");
  await page.waitForSelector(".js-demo-reset", { state: "visible" });
  await page.goto(`${baseURL}/about.html?demo=0`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle");
  assert.equal(await page.locator(".demo-controls").count(), 0, "?demo=0 hides demo tools");
});

await flow("shop: search, filter, sort, chips, empty state and clear", async (page) => {
  await go(page, "shop.html");
  await waitText(page, "#result-count", /^8 Pieces$/);
  await page.fill(".js-shop-search", "shirt");
  await waitText(page, "#result-count", /^[1-7] Pieces?$/);
  assert.ok(await page.locator('.applied-filters [data-filter-type="search"]').count(), "search chip shown");
  assert.match(page.url(), /search=shirt/);
  await page.click('.applied-filters [data-filter-type="search"]');
  await waitText(page, "#result-count", /^8 Pieces$/);
  await page.click(".js-filter-open");
  await page.waitForSelector(".js-shop-filter-panel.is-open");
  await page.check('.js-shop-filter-panel input[name="category"][value="tops"]');
  await page.click(".js-filter-apply");
  await waitText(page, "#result-count", /^2 Pieces$/);
  assert.match(page.url(), /category=tops/);
  await page.selectOption(".shop-sort select", "price-asc");
  const prices = await page.$$eval(".js-product-item:not([hidden]) .product-grid-item__price", (nodes) => nodes.map((node) => Number(node.textContent.replace(/\D/g, ""))));
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b), "sorted low to high");
  await page.fill(".js-shop-search", "zzzz-nothing");
  await page.waitForSelector(".shop-empty-state");
  await page.click(".js-empty-clear");
  await waitText(page, "#result-count", /^8 Pieces$/);
  assert.equal(await page.inputValue(".js-shop-search"), "");
});

await flow("shop: catalogue failure shows a recoverable error", async (page) => {
  await go(page, "shop.html");
  await setFailure(page, "always");
  await page.reload();
  await page.waitForSelector(".js-shop-grid .request-error-state");
  await setFailure(page, "off");
  await page.click(".js-load-retry");
  await waitText(page, "#result-count", /^8 Pieces$/);
  assert.ok(await page.locator(".js-product-item").count() >= 8);
});

await flow("product detail: colour, size guide, stock, notify me, add to Bag, not found", async (page) => {
  await go(page, "detailproduct.html?id=tailored-wool-blazer");
  await page.waitForSelector("body[data-pdp-ready=true]");
  await page.waitForSelector('.js-size-options button[data-size="L"][disabled]');
  await waitText(page, ".js-pdp-notify", /Sold out in L/);
  await page.click(".js-pdp-size-guide");
  await page.waitForSelector(".commerce-overlay.is-open .size-guide-table");
  await page.keyboard.press("Escape");
  await page.click('.js-color-options button[data-color="ivory"]');
  await page.waitForURL(/color=ivory/);
  await waitText(page, ".js-pdp-notify", /Sold out in XS, XL/);
  await page.click(".js-notify-open");
  await page.waitForSelector(".js-notify-form");
  await page.selectOption("#notifySize", "XL");
  await page.fill("#notifyEmail", "notify@example.com");
  await page.click(".js-notify-submit");
  await page.waitForSelector(".js-notify-confirmation");
  await page.click(".js-notify-done");
  await page.click('.js-size-options button[data-size="L"]');
  await waitText(page, ".js-pdp-availability", /Low availability in size L/);
  await page.click(".js-btn-add-cart");
  await page.waitForSelector(".mini-bag-item");
  assert.equal(await bagCount(page), 1);
  await go(page, "detailproduct.html?id=viscose-wrap-top&color=claret");
  await page.waitForSelector(".js-btn-add-cart:disabled");
  await waitText(page, ".js-pdp-notify", /sold out in every size/);
  await go(page, "detailproduct.html?id=does-not-exist");
  await page.waitForSelector(".pdp-not-found");
  assert.match(await page.title(), /not found/i);
});

await flow("favourites: save, remove, move to Bag", async (page) => {
  await go(page, "shop.html");
  await page.waitForSelector('.js-wishlist-btn[data-product-id="merino-knit-dress"]');
  await page.click('.js-wishlist-btn[data-product-id="merino-knit-dress"]');
  await page.click('.js-wishlist-btn[data-product-id="silk-drape-blouse"]');
  await page.waitForSelector('.js-wishlist-btn[data-product-id="silk-drape-blouse"][aria-pressed="true"]');
  await go(page, "favourite.html");
  await waitText(page, ".js-favourite-count", /^4 items saved$/);
  await page.click('[data-product-id="silk-drape-blouse"] .btn-remove-wishlist');
  await waitText(page, ".js-favourite-count", /^3 items saved$/);
  await page.click('[data-product-id="merino-knit-dress"] .js-saved-add');
  await page.waitForSelector('.commerce-overlay.is-open .commerce-size-option[data-size="S"]');
  await page.click('.commerce-overlay.is-open .commerce-size-option[data-size="S"]');
  await page.click(".js-confirm-variant");
  await page.waitForSelector(".mini-bag-item");
  await page.keyboard.press("Escape");
  await waitText(page, ".js-favourite-count", /^2 items saved$/);
  assert.equal(await bagCount(page), 1);
});

await flow("cart: quantity, remove, promo (invalid, minimum, valid), gift note, reload", async (page) => {
  await addToBag(page, "merino-knit-dress", "M");
  await addToBag(page, "silk-drape-blouse", "S");
  await go(page, "cart.html");
  await page.waitForSelector(".js-cart-item");
  assert.equal(await page.locator(".js-cart-item").count(), 2);
  const first = page.locator(".js-cart-item").first();
  assert.equal(await first.locator(".minus").isDisabled(), true, "minus disabled at quantity 1");
  await first.locator(".plus").click();
  await page.waitForFunction(() => document.querySelector(".js-cart-item .qty-val")?.textContent === "2");
  await page.locator(".js-cart-item").first().locator(".minus").click();
  await page.waitForFunction(() => document.querySelector(".js-cart-item .qty-val")?.textContent === "1");
  await page.fill("#promoCode", "NOPE");
  await page.click(".js-promo-apply");
  await waitText(page, ".js-promo-status", /isn’t a recognised code/);
  assert.equal(await page.getAttribute("#promoCode", "aria-invalid"), "true");
  await page.fill("#promoCode", "WELCOME200");
  await page.click(".js-promo-apply");
  await waitText(page, ".js-promo-status", /applies to orders from/);
  await page.fill("#promoCode", "FALL2025");
  await page.click(".js-promo-apply");
  await waitText(page, ".js-promo-status", /has expired/);
  await page.fill("#promoCode", "atelier10");
  await page.click(".js-promo-apply");
  await waitText(page, ".js-promo-status", /ATELIER10 applied/);
  await page.waitForSelector(".js-summary-discount-row:not([hidden])");
  await page.check(".js-gift-toggle");
  await page.fill("#giftMessage", "Happy birthday, Mai.");
  await waitText(page, ".js-gift-count", /^20 \/ 200$/);
  await page.locator(".js-cart-item").last().locator(".btn-remove").click();
  await page.waitForFunction(() => document.querySelectorAll(".js-cart-item").length === 1);
  await page.reload();
  await page.waitForSelector(".js-cart-item");
  assert.equal(await page.locator(".js-cart-item").count(), 1, "Bag survives reload");
  assert.equal(await page.inputValue("#giftMessage"), "Happy birthday, Mai.");
  await page.waitForSelector(".js-summary-discount-row:not([hidden])");
  await page.click(".js-promo-remove");
  await page.waitForSelector(".js-summary-discount-row[hidden]", { state: "attached" });
  await page.locator(".js-cart-item .btn-remove").click();
  await page.waitForSelector(".cart-empty-state");
  assert.equal(await page.getAttribute(".btn-checkout", "aria-disabled"), "true");
});

let guestOrderId = "";
await flow("checkout (guest): validation, simulated decline, failed request + retry, success, order detail, cancel", async (page) => {
  await signOut(page);
  await addToBag(page, "merino-knit-dress", "M");
  await go(page, "cart.html");
  await page.waitForSelector(".js-cart-item");
  await page.fill("#promoCode", "ATELIER10");
  await page.click(".js-promo-apply");
  await waitText(page, ".js-promo-status", /ATELIER10 applied/);
  await page.check(".js-gift-toggle");
  await page.fill("#giftMessage", "For you.");
  await go(page, "checkout.html");
  await page.waitForSelector(".js-checkout-items .summary-item");
  await page.click(".js-place-order");
  await waitText(page, ".js-checkout-error", /Check the highlighted fields/);
  await page.fill("#checkoutEmail", "guest@example.com");
  await page.fill("#checkoutPhone", "0912 345 678");
  await page.fill("#checkoutName", "Guest Client");
  await page.fill("#checkoutAddress", "1 Le Loi");
  await page.fill("#checkoutDistrict", "District 1");
  await page.fill("#checkoutProvince", "Ho Chi Minh City");
  await page.check('input[name="deliveryMethod"][value="express"]');
  await waitText(page, ".js-checkout-delivery-fee", /250/);
  await page.waitForSelector(".js-checkout-discount-row:not([hidden])");
  await page.check('input[name="paymentMethod"][value="card-simulated"]');
  await page.waitForSelector(".js-card-simulation:not([hidden])");
  assert.equal(await page.locator('.checkout-page input[autocomplete^="cc-"], .checkout-page input[name*="card" i][type="text"]').count(), 0, "no card fields");
  await page.check('input[name="cardOutcome"][value="decline"]');
  await page.check("#checkoutTerms");
  await waitText(page, ".js-review-gift", /For you/);
  await page.click(".js-place-order");
  await waitText(page, ".js-checkout-error", /declined/, 10000);
  await page.check('input[name="cardOutcome"][value="approve"]');
  await setFailure(page, "next");
  await page.click(".js-place-order");
  await page.waitForSelector(".js-checkout-retry", { timeout: 10000 });
  assert.equal(await bagCount(page), 1, "Bag kept after failed request");
  await Promise.all([page.waitForURL(onPage("order-success.html"), { timeout: 15000 }), page.click(".js-checkout-retry")]);
  await page.waitForSelector(".js-success-order-number");
  guestOrderId = (await text(page, ".js-success-order-number")).trim();
  assert.match(guestOrderId, /^AT-\d{10}$/);
  assert.match(await text(page, ".js-order-success"), /sent the details to guest@example\.com/i);
  assert.equal(await bagCount(page), 0);
  await page.click(`a[href="order.html?id=${guestOrderId}"]`);
  await page.waitForSelector(".js-order-status");
  assert.equal((await text(page, ".js-order-status")).trim(), "Processing");
  assert.match(await text(page, ".order-details-panel"), /For you/);
  await page.click(".js-cancel-open");
  await page.selectOption("#cancelReason", "wrong-item");
  await page.click(".js-cancel-confirm");
  await page.waitForSelector('.js-order-status[data-status="cancelled"]');
  await page.reload();
  await page.waitForSelector('.js-order-status[data-status="cancelled"]');
  await go(page, "order.html?id=AT-0000000000");
  await page.waitForSelector(".order-not-found");
});

await flow("guest order lookup by number and email", async (page) => {
  await signOut(page);
  await addToBag(page, "silk-drape-blouse", "M");
  await go(page, "checkout.html");
  await page.waitForSelector(".js-checkout-items .summary-item");
  for (const [selector, value] of [["#checkoutEmail", "lookup@example.com"], ["#checkoutPhone", "0912 000 111"], ["#checkoutName", "Lookup Client"], ["#checkoutAddress", "2 Hai Ba Trung"], ["#checkoutDistrict", "District 3"], ["#checkoutProvince", "Ho Chi Minh City"]]) await page.fill(selector, value);
  await page.check("#checkoutTerms");
  await Promise.all([page.waitForURL(onPage("order-success.html"), { timeout: 15000 }), page.click(".js-place-order")]);
  await page.waitForSelector(".js-success-order-number");
  const id = (await text(page, ".js-success-order-number")).trim();
  await go(page, "forgot-password.html#order-lookup");
  await page.fill("#lookupOrder", id);
  await page.fill("#lookupEmail", "wrong@example.com");
  await page.click(".js-lookup-submit");
  await waitText(page, ".js-lookup-error", /No order matches/);
  await page.fill("#lookupEmail", "lookup@example.com");
  await Promise.all([page.waitForURL(onPage("order.html")), page.click(".js-lookup-submit")]);
  await page.waitForSelector(".js-order-status");
  assert.match(await text(page, ".order-page-header h1"), new RegExp(id));
});

await flow("account: sign up, profile edit, addresses CRUD, sign out, sign in", async (page) => {
  await signOut(page);
  await go(page, "account.html");
  await page.waitForSelector(".js-account-signed-out:not([hidden])");
  await go(page, "login.html?mode=create");
  await page.waitForSelector(".js-signup-form:not([hidden])");
  await page.fill("#signupName", "Mai Pham");
  await page.fill("#signupEmail", "mai@example.com");
  await page.fill("#signupPassword", "short");
  await page.click(".js-signup-submit");
  await waitText(page, ".js-signup-error", /at least 8 characters/);
  await page.fill("#signupEmail", DEMO.email);
  await page.fill("#signupPassword", "longenough1");
  await page.click(".js-signup-submit");
  await waitText(page, ".js-signup-error", /already exists/);
  await page.fill("#signupEmail", "mai@example.com");
  await Promise.all([page.waitForURL(onPage("account.html")), page.click(".js-signup-submit")]);
  await page.waitForSelector(".js-account-signed-in:not([hidden])");
  await waitText(page, ".js-client-greeting", /Welcome, Mai\./);
  await page.waitForSelector(".account-orders-empty");
  await page.fill("#profileName", "Mai Anh Pham");
  await page.fill("#profilePhone", "0903 333 444");
  await page.click(".js-profile-save");
  await waitText(page, ".js-profile-status", /Profile saved/);
  await page.click(".js-address-add");
  await page.fill("#addrLabel", "Home");
  await page.click(".js-address-save");
  await waitText(page, ".js-address-error", /Check the highlighted fields/);
  await page.fill("#addrName", "Mai Anh Pham");
  await page.fill("#addrPhone", "0903 333 444");
  await page.fill("#addrStreet", "9 Ly Thuong Kiet");
  await page.fill("#addrDistrict", "Hoan Kiem");
  await page.fill("#addrProvince", "Ha Noi");
  await page.click(".js-address-save");
  await page.waitForSelector(".address-card");
  await waitText(page, ".address-card h3", /Home\s*Default/);
  await page.click(".js-address-add");
  for (const [selector, value] of [["#addrLabel", "Office"], ["#addrName", "Mai Anh Pham"], ["#addrPhone", "0903 333 444"], ["#addrStreet", "20 Trang Tien"], ["#addrDistrict", "Hoan Kiem"], ["#addrProvince", "Ha Noi"]]) await page.fill(selector, value);
  await page.click(".js-address-save");
  await page.waitForFunction(() => document.querySelectorAll(".address-card").length === 2);
  await page.locator(".address-card", { hasText: "Office" }).locator(".js-address-edit").click();
  await page.fill("#addrStreet", "22 Trang Tien");
  await page.click(".js-address-save");
  await waitText(page, ".address-card", /22 Trang Tien/);
  await page.locator(".address-card", { hasText: "Office" }).locator(".js-address-default").click();
  await waitText(page, ".address-card h3", /Office\s*Default/);
  const homeDelete = page.locator(".address-card", { hasText: "Home" }).locator(".js-address-delete");
  await homeDelete.click();
  await waitText(page, ".js-address-delete", /Confirm delete/);
  await homeDelete.click();
  await page.waitForFunction(() => document.querySelectorAll(".address-card").length === 1);
  await page.reload();
  await page.waitForSelector(".address-card");
  assert.equal(await page.locator(".address-card").count(), 1, "addresses survive reload");
  await Promise.all([page.waitForURL(onPage("login.html")), page.click(".js-sign-out")]);
  await waitText(page, ".js-auth-flash", /signed out/);
  await page.fill("#signinEmail", "mai@example.com");
  await page.fill("#signinPassword", "wrong-password");
  await page.click(".js-signin-submit");
  await waitText(page, ".js-signin-error", /don’t match/);
  await page.fill("#signinPassword", "longenough1");
  await Promise.all([page.waitForURL(onPage("account.html")), page.click(".js-signin-submit")]);
  await waitText(page, ".js-client-greeting", /Welcome, Mai\./);
});

await flow("account checkout with saved address, order history, return request on a delivered order", async (page) => {
  await signIn(page);
  await page.waitForSelector(".account-order-row");
  assert.equal(await page.locator(".account-order-row").count(), 2, "seeded orders listed");
  await addToBag(page, "leather-minimal-tote", "M");
  await go(page, "checkout.html");
  await page.waitForSelector("#checkoutSavedAddress");
  assert.equal(await page.inputValue("#checkoutAddress"), "12 Nguyen Hue");
  await page.selectOption("#checkoutSavedAddress", "ADDR-STUDIO");
  assert.equal(await page.inputValue("#checkoutAddress"), "45 Hang Bai");
  await page.fill("#checkoutPhone", "0901 234 567");
  await page.check("#checkoutTerms");
  await Promise.all([page.waitForURL(onPage("order-success.html"), { timeout: 15000 }), page.click(".js-place-order")]);
  await page.waitForSelector(".js-success-order-number");
  await go(page, "account.html");
  await page.waitForFunction(() => document.querySelectorAll(".account-order-row").length === 3);
  await page.click('.account-order-row[href="order.html?id=AT-2611041987"]');
  await page.waitForSelector('.js-order-status[data-status="delivered"]');
  assert.equal(await page.locator(".js-cancel-open").count(), 0, "delivered orders cannot be cancelled");
  await page.locator(".js-service-open").first().click();
  await page.waitForSelector(".js-order-service-panel:not([hidden])");
  await page.selectOption('.js-service-form select[name="action"]', "return");
  await page.click(".js-service-submit");
  await page.waitForSelector('.js-order-status[data-status="return-requested"]');
  await page.waitForSelector(".js-remove-service");
});

await flow("forgot password: request code, reset, sign in with the new password", async (page) => {
  await go(page, "forgot-password.html");
  await page.fill("#resetEmail", DEMO.email);
  await page.click(".js-reset-request-submit");
  await page.waitForSelector(".js-reset-demo-code");
  const code = (await text(page, ".js-reset-demo-code")).trim();
  await page.fill("#resetCode", "000000");
  await page.fill("#resetPassword", "new-password-1");
  await page.click(".js-reset-confirm-submit");
  await waitText(page, ".js-reset-confirm-error", /isn’t valid/);
  await page.fill("#resetCode", code);
  await page.click(".js-reset-confirm-submit");
  await page.waitForSelector(".js-reset-done:not([hidden])");
  await signIn(page, DEMO.email, "new-password-1");
  await waitText(page, ".js-client-greeting", /Welcome, Linh\./);
});

await flow("client services: appointment booking; contact: enquiry with failure + retry", async (page) => {
  await signIn(page);
  await go(page, "client-services.html#appointment");
  await page.waitForSelector(".appointment-day:not([disabled])");
  await page.click(".js-appointment-submit");
  await waitText(page, ".js-appointment-error", /Choose a day and a time/);
  await page.locator(".appointment-day:not([disabled])").first().click();
  await page.waitForSelector(".appointment-slot:not([disabled])");
  const time = await page.locator(".appointment-slot:not([disabled])").first().getAttribute("data-time");
  await page.locator(".appointment-slot:not([disabled])").first().click();
  await page.waitForSelector(`.appointment-slot[data-time="${time}"][aria-pressed="true"]`);
  await page.fill("#appointmentNotes", "Belted Cropped Jacket in S and M.");
  await page.click(".js-appointment-submit");
  await page.waitForSelector(".js-appointment-confirmation:not([hidden]) .js-appointment-reference");
  await go(page, "account.html#alerts");
  await page.waitForSelector("[data-appointment-id]");
  await page.click(".js-appointment-cancel");
  await page.waitForFunction(() => !document.querySelector("[data-appointment-id]"));

  await go(page, "contact.html?topic=delivery");
  await page.waitForSelector(".js-enquiry-order-field:not([hidden])");
  assert.equal(await page.inputValue("#enquiryEmail"), DEMO.email);
  await page.click(".js-enquiry-send");
  await waitText(page, ".js-enquiry-status", /Complete the highlighted fields/);
  await page.fill("#enquiryMessage", "When will AT-2611122041 leave the studio?");
  await page.click(".js-save-enquiry");
  await waitText(page, ".js-enquiry-status", /Draft saved/);
  await setFailure(page, "next");
  await page.click(".js-enquiry-send");
  await page.waitForSelector(".js-enquiry-error .js-request-retry", { timeout: 8000 });
  await page.click(".js-enquiry-error .js-request-retry");
  await page.waitForSelector(".js-enquiry-reference");
  assert.match(await text(page, ".js-enquiry-reference"), /^ENQ-\d{6}$/);
});

await flow("size guide unit toggle and search overlay", async (page) => {
  await go(page, "size-guide.html");
  await page.waitForSelector('.measurement-controls button[data-unit="in"]');
  await page.click('.measurement-controls button[data-unit="in"]');
  await waitText(page, ".size-table-wrap", /30\.7/);
  await page.click("#navSearchBtn");
  await page.fill("#navSearchInput", "shirt");
  await page.waitForSelector(".search-product-result");
});

await flow("reset demo data restores the seed", async (page) => {
  await addToBag(page, "merino-knit-dress", "S");
  await signIn(page);
  await setFailure(page, "next");
  assert.equal(await bagCount(page), 1);
  await openDemoTools(page);
  await Promise.all([page.waitForEvent("load"), page.click(".js-demo-reset")]);
  await page.waitForSelector(".demo-controls[open]");
  await waitText(page, ".js-demo-status", /Demo data reset/);
  assert.equal(await bagCount(page), 0);
  assert.equal(await page.locator('.demo-controls input[value="off"]').isChecked(), true);
  await page.waitForSelector(".js-account-signed-in:not([hidden])");
  await waitText(page, ".js-client-greeting", /Welcome, Linh\./);
  const seeded = await page.evaluate(() => JSON.parse(sessionStorage.getItem("atelier.orders")).map((order) => order.id));
  assert.deepEqual(seeded, ["AT-2611122041", "AT-2611041987"]);
});

await browser.close();
const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} flows passed.`);
process.exitCode = failed.length ? 1 : 0;
