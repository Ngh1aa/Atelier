import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.has(key) ? storage.get(key) : null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = { dataLayer: [], dispatchEvent: () => true };
globalThis.CustomEvent = class CustomEvent {
  constructor(type, options) { this.type = type; this.detail = options?.detail; }
};
globalThis.fetch = async () => ({
  ok: true,
  json: async () => JSON.parse(await readFile(new URL("../src/data/products.json", import.meta.url), "utf8")),
});

const store = await import("../src/js/commerce-store.js");

test("cart keeps variant, quantity and VND totals in one source of truth", async () => {
  const products = await store.loadProducts();
  const product = products[0];
  const variant = product.variants.find((item) => item.stock >= 2);

  assert.ok(product.colors.length);
  assert.ok(variant);
  assert.equal(store.addCartItem(product, variant.id).ok, true);
  const initial = await store.hydrateCart();
  assert.equal(initial[0].variantId, variant.id);
  assert.equal(initial[0].size, variant.size);

  store.updateCartQuantity(initial[0].id, 2);
  const updated = await store.hydrateCart();
  assert.equal(store.cartCount(), 2);
  assert.equal(store.cartTotals(updated).subtotal, product.price * 2);
  assert.match(store.formatVND(product.price), /₫/);
});

test("guest wishlist and local order lifecycle persist", async () => {
  const product = (await store.loadProducts())[1];
  const variant = product.variants.find((item) => item.stock > 0);
  assert.equal(store.toggleWishlist(product.id, variant.id), true);
  assert.equal(store.isWishlisted(product.id), true);

  const order = store.createOrder({
    customer: { email: "client@example.com" },
    address: { country: "Vietnam" },
    items: [],
    subtotal: 0,
    shippingFee: 0,
    discount: 0,
    total: 0,
    paymentMethod: "cod",
  });
  assert.equal(store.getOrder(order.id).paymentStatus, "pending");
});
