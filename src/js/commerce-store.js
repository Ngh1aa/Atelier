import { createDemoSeed, DEMO_SEED_VERSION } from "../data/demo-seed.js";

const CART_KEY = "atelier.cart.v2";
const LEGACY_CART_KEY = "atelier.cart";
const WISHLIST_KEY = "atelier.wishlist.v2";
const LEGACY_WISHLIST_KEY = "atelier.wishlist";
const ORDER_KEY = "atelier.orders";
const RECENT_KEY = "atelier.recently-viewed";
const PROFILE_KEY = "atelier.client-profile.v1";
const ENQUIRY_KEY = "atelier.enquiry-draft.v1";

// Body measurements from the existing full Size Guide, shared with Quick Add.
export const SIZE_GUIDE = [
  { size: "XS", chest: [78, 82], waist: [60, 64], hip: [86, 90] },
  { size: "S", chest: [83, 87], waist: [65, 69], hip: [91, 95] },
  { size: "M", chest: [88, 92], waist: [70, 74], hip: [96, 100] },
  { size: "L", chest: [93, 97], waist: [75, 79], hip: [101, 105] },
  { size: "XL", chest: [98, 102], waist: [80, 84], hip: [106, 110] },
];

export const SEARCH_SYNONYMS = {
  coat: ["outerwear", "overcoat"], tee: ["t-shirt", "tees", "top"],
  blazer: ["tailoring", "outerwear"], dress: ["gown", "evening"],
  bag: ["tote", "accessories"], trousers: ["bottoms", "pants"],
};

export function matchesProductSearch(product, query) {
  const term = String(query || "").trim().toLowerCase();
  if (!term) return true;
  const haystack = [product.name, product.category, product.collection, product.description,
    product.material, ...(product.colors || []).map((color) => color.name)].join(" ").toLowerCase();
  return [term, ...(SEARCH_SYNONYMS[term] || [])].some((word) => haystack.includes(word));
}

const COLOR_PRESETS = {
  "tailored-wool-blazer": [
    { name: "Black", value: "black", hex: "#151515" },
    { name: "Ivory", value: "ivory", hex: "#d9d2c4" },
  ],
  "cashmere-overcoat": [
    { name: "Camel", value: "camel", hex: "#9a7658" },
    { name: "Charcoal", value: "charcoal", hex: "#393939" },
  ],
  "merino-knit-dress": [
    { name: "Black", value: "black", hex: "#151515" },
    { name: "Oat", value: "oat", hex: "#b9aa91" },
  ],
  "silk-drape-blouse": [
    { name: "Ivory", value: "ivory", hex: "#d9d2c4" },
    { name: "Black", value: "black", hex: "#151515" },
  ],
  "linen-wide-trousers": [
    { name: "Stone", value: "stone", hex: "#8d887e" },
    { name: "Black", value: "black", hex: "#151515" },
  ],
  "suede-chelsea-boots": [
    { name: "Espresso", value: "espresso", hex: "#3a2921" },
    { name: "Black", value: "black", hex: "#151515" },
  ],
  "viscose-wrap-top": [
    { name: "Black", value: "black", hex: "#151515" },
    { name: "Claret", value: "claret", hex: "#4c2028" },
  ],
  "leather-minimal-tote": [
    { name: "Black", value: "black", hex: "#151515" },
    { name: "Cognac", value: "cognac", hex: "#744832" },
  ],
  "tailored-coat": [{ name: "Camel", value: "camel", hex: "#9a7658" }],
  "silk-gown": [{ name: "Midnight", value: "midnight", hex: "#161923" }],
  "urban-knit": [{ name: "Cream", value: "cream", hex: "#d8d0bf" }],
  "silk-midnight-gown": [{ name: "Midnight", value: "midnight", hex: "#161923" }],
};

let cataloguePromise;

// ---------------------------------------------------------------------------
// Tab-local demo data. sessionStorage keeps every piece of user data inside this
// browser tab: it survives navigation and reload, and disappears with the tab.
// The first read in a tab seeds it from src/data/demo-seed.js.
// ---------------------------------------------------------------------------
const SEED_MARKER_KEY = "atelier.demo.seeded";
const INVENTORY_KEY = "atelier.inventory.v1";
const PROMO_CODES_KEY = "atelier.promo-codes.v1";
const APPLIED_PROMO_KEY = "atelier.promo.v1";
const GIFT_KEY = "atelier.gift-note.v1";
const ACCOUNTS_KEY = "atelier.accounts.v1";
const SESSION_KEY = "atelier.session.v1";
const ADDRESS_KEY = "atelier.addresses.v1";
const NOTIFY_KEY = "atelier.stock-alerts.v1";
const APPOINTMENT_CONFIG_KEY = "atelier.appointment-config.v1";
const APPOINTMENT_KEY = "atelier.appointments.v1";
const MESSAGE_KEY = "atelier.enquiries.v1";
const RESET_KEY = "atelier.password-resets.v1";
const FAILURE_KEY = "atelier.demo.failure";
let seeding = false;

function storageArea() {
  try {
    if (globalThis.sessionStorage) return globalThis.sessionStorage;
  } catch { /* storage blocked: fall through */ }
  return globalThis.localStorage;
}

function writeRaw(key, value) {
  storageArea().setItem(key, JSON.stringify(value));
}

export function ensureSeeded() {
  if (seeding) return;
  const area = storageArea();
  try {
    if (area.getItem(SEED_MARKER_KEY) === String(DEMO_SEED_VERSION)) return;
  } catch { return; }
  seeding = true;
  try {
    const seed = createDemoSeed();
    writeRaw(INVENTORY_KEY, seed.inventory);
    writeRaw(PROMO_CODES_KEY, seed.promoCodes);
    writeRaw(ACCOUNTS_KEY, seed.accounts);
    writeRaw(ADDRESS_KEY, seed.addresses);
    writeRaw(ORDER_KEY, seed.orders);
    writeRaw(CART_KEY, seed.cart);
    writeRaw(WISHLIST_KEY, seed.wishlist);
    writeRaw(APPOINTMENT_CONFIG_KEY, seed.appointments);
    writeRaw(APPOINTMENT_KEY, seed.appointments.booked);
    area.setItem(SEED_MARKER_KEY, String(DEMO_SEED_VERSION));
  } catch { /* storage full or blocked: callers fall back to defaults */ }
  finally { seeding = false; }
}

// Clears every ATELIER key in this tab (and legacy localStorage records), then seeds again.
export function resetDemoData() {
  const area = storageArea();
  const keys = [];
  for (let index = 0; index < area.length; index += 1) keys.push(area.key(index));
  keys.filter((key) => key?.startsWith("atelier.")).forEach((key) => area.removeItem(key));
  try {
    const legacy = globalThis.localStorage;
    if (legacy && legacy !== area) {
      const legacyKeys = [];
      for (let index = 0; index < legacy.length; index += 1) legacyKeys.push(legacy.key(index));
      legacyKeys.filter((key) => key?.startsWith("atelier.")).forEach((key) => legacy.removeItem(key));
    }
  } catch { /* ignore */ }
  cataloguePromise = undefined;
  ensureSeeded();
  emit("atelier:cart-updated", { cart: [] });
  emit("atelier:wishlist-updated", { wishlist: [] });
}

// Simulated network: every "server" action goes through here so latency, loading
// states and recoverable failures can be demonstrated without a backend.
export class DemoRequestError extends Error {
  constructor(message = "The request could not be completed. Nothing was saved — please try again.") {
    super(message);
    this.name = "DemoRequestError";
    this.recoverable = true;
  }
}

export function getFailureMode() {
  try { return storageArea().getItem(FAILURE_KEY) || "off"; } catch { return "off"; }
}

export function setFailureMode(mode) {
  const value = ["off", "next", "always"].includes(mode) ? mode : "off";
  storageArea().setItem(FAILURE_KEY, value);
  emit("atelier:demo-failure-updated", { mode: value });
  return value;
}

function consumeFailure() {
  const mode = getFailureMode();
  if (mode === "next") setFailureMode("off");
  return mode === "next" || mode === "always";
}

export const DEMO_LATENCY = 420;

export async function simulateRequest(work, { latency = DEMO_LATENCY } = {}) {
  await new Promise((resolve) => setTimeout(resolve, latency));
  if (consumeFailure()) throw new DemoRequestError();
  return work();
}

function safeRead(key, fallback) {
  ensureSeeded();
  try {
    const value = JSON.parse(storageArea().getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  ensureSeeded();
  storageArea().setItem(key, JSON.stringify(value));
}

function removeKey(key) {
  storageArea().removeItem(key);
}

function slug(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normaliseProduct(product, inventoryMap = {}) {
  const colors = product.colors?.length ? product.colors : (COLOR_PRESETS[product.id] || [
    { name: "Black", value: "black", hex: "#151515" },
  ]);
  const images = [...new Set((product.images || []).filter(Boolean))];

  const variants = colors.flatMap((color) => product.sizes.map((size) => {
    const explicitStock = (inventoryMap[product.id] || product.inventory)?.[color.value]?.[size];
    const inventoryKnown = Number.isFinite(Number(explicitStock));
    return {
      id: `${product.id}-${color.value}-${slug(size)}`,
      productId: product.id,
      color: color.value,
      colorName: color.name,
      size,
      sku: `ATL-${slug(product.id).slice(0, 8).toUpperCase()}-${slug(color.value).slice(0, 3).toUpperCase()}-${slug(size).toUpperCase()}`,
      // UNKNOWN inventory stays purchasable in this prototype but never becomes fake scarcity.
      stock: inventoryKnown ? Number(explicitStock) : Number.POSITIVE_INFINITY,
      inventoryKnown,
      price: product.price,
      images,
    };
  }));

  return {
    ...product,
    currency: "VND",
    colors,
    images,
    variants,
    inventoryReality: variants.every((variant) => variant.inventoryKnown) ? "STATIC" : "UNKNOWN",
    requiresSize: !(product.sizes.length === 1 && product.sizes[0] === "One Size"),
    delivery: product.delivery || "Complimentary delivery",
    returnPolicy: product.returnPolicy || "Returns and exchanges within 14 days",
    model: product.model || "Model is 178 cm and wears size S.",
  };
}

export async function loadProducts() {
  if (!cataloguePromise) {
    cataloguePromise = fetch("./src/data/products.json?v=atelier-v13")
      .then((response) => {
        if (!response.ok) throw new Error("The catalogue could not be loaded.");
        return response.json();
      })
      .then((products) => {
        // "Fail every request" also takes the catalogue down, so error states can be reviewed.
        if (getFailureMode() === "always") throw new DemoRequestError("The catalogue could not be loaded.");
        const inventoryMap = getInventory();
        return products.map((product) => normaliseProduct(product, inventoryMap));
      })
      .catch((error) => { cataloguePromise = undefined; throw error; });
  }
  return cataloguePromise;
}

export async function getProduct(productId) {
  const products = await loadProducts();
  return products.find((product) => product.id === productId) || null;
}

export function getVariant(product, variantId) {
  return product?.variants.find((variant) => variant.id === variantId) || null;
}

export function findVariant(product, color, size) {
  return product?.variants.find((variant) => variant.color === color && variant.size === size) || null;
}

export function getAvailableSizes(product, color) {
  return product.sizes.map((size) => {
    const variant = findVariant(product, color, size);
    return { size, stock: variant?.stock || 0, inventoryKnown: variant?.inventoryKnown || false, variant };
  });
}

export function formatVND(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function migrateLegacyCart() {
  const legacy = safeRead(LEGACY_CART_KEY, {});
  if (!legacy || Array.isArray(legacy) || typeof legacy !== "object") return [];
  return Object.entries(legacy)
    .filter(([, quantity]) => Number(quantity) > 0)
    .map(([productId, quantity]) => ({
      id: `legacy-${productId}`,
      productId,
      variantId: null,
      color: null,
      size: null,
      quantity: Number(quantity),
      unitPrice: null,
      addedAt: Date.now(),
    }));
}

export function getCart() {
  const current = safeRead(CART_KEY, null);
  if (Array.isArray(current)) return current;
  const migrated = migrateLegacyCart();
  safeWrite(CART_KEY, migrated);
  return migrated;
}

function emit(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function saveCart(cart) {
  safeWrite(CART_KEY, cart);
  removeKey(LEGACY_CART_KEY);
  emit("atelier:cart-updated", { cart });
}

export function cartCount() {
  return getCart().reduce((total, item) => total + Number(item.quantity || 0), 0);
}

export async function hydrateCart({ persistMigration = true } = {}) {
  const products = await loadProducts();
  let changed = false;
  const hydrated = getCart().map((line) => {
    const product = products.find((item) => item.id === line.productId);
    if (!product) return null;
    let variant = getVariant(product, line.variantId);
    if (!variant) {
      variant = product.variants.find((item) => item.stock > 0) || product.variants[0];
      changed = true;
    }
    return {
      ...line,
      id: line.id.startsWith("legacy-") ? `${product.id}::${variant.id}` : line.id,
      variantId: variant.id,
      color: variant.color,
      colorName: variant.colorName,
      size: variant.size,
      unitPrice: variant.price,
      product,
      variant,
    };
  }).filter(Boolean);

  if (changed && persistMigration) {
    saveCart(hydrated.map(({ product, variant, ...line }) => line));
  }
  return hydrated;
}

export function addCartItem(product, variantId, quantity = 1) {
  const variant = getVariant(product, variantId);
  if (!variant) return { ok: false, message: "Please select a size." };
  if (variant.stock < 1) return { ok: false, message: `Size ${variant.size} is unavailable.` };
  if (!Number.isSafeInteger(quantity) || quantity < 1) return { ok: false, message: "Choose a whole quantity of at least one." };
  if (variant.inventoryKnown && quantity > variant.stock) return { ok: false, message: "The requested quantity is not available for this size." };

  const cart = getCart();
  const existing = cart.find((item) => item.variantId === variant.id);
  if (existing) {
    if (variant.inventoryKnown && existing.quantity + quantity > variant.stock) {
      return { ok: false, message: "The requested quantity is not available for this size." };
    }
    existing.quantity += quantity;
  } else {
    cart.push({
      id: `${product.id}::${variant.id}`,
      productId: product.id,
      variantId: variant.id,
      color: variant.color,
      colorName: variant.colorName,
      size: variant.size,
      quantity,
      unitPrice: variant.price,
      addedAt: Date.now(),
    });
  }
  saveCart(cart);
  track("add_to_cart", { product_id: product.id, variant_id: variant.id, quantity });
  return { ok: true, lineId: `${product.id}::${variant.id}` };
}

export function updateCartQuantity(lineId, quantity) {
  const cart = getCart();
  const item = cart.find((line) => line.id === lineId);
  if (!item) return;
  item.quantity = Math.max(1, Math.floor(Number(quantity) || 1));
  saveCart(cart);
}

export function removeCartItem(lineId) {
  const cart = getCart();
  const item = cart.find((line) => line.id === lineId);
  saveCart(cart.filter((line) => line.id !== lineId));
  if (item) track("remove_from_cart", { product_id: item.productId, variant_id: item.variantId });
}

export function changeCartVariant(lineId, product, variantId) {
  const variant = getVariant(product, variantId);
  if (!variant || variant.stock < 1) return { ok: false, message: "This option is unavailable." };
  const cart = getCart();
  const line = cart.find((item) => item.id === lineId);
  if (!line) return { ok: false, message: "This Bag item could not be found." };
  const duplicate = cart.find((item) => item.id !== lineId && item.variantId === variant.id);
  if (variant.inventoryKnown && line.quantity + (duplicate?.quantity || 0) > variant.stock) {
    return { ok: false, message: "This size cannot fulfil the combined quantity. Reduce the quantity first." };
  }
  if (duplicate) {
    duplicate.quantity += line.quantity;
    saveCart(cart.filter((item) => item.id !== lineId));
  } else {
    line.id = `${product.id}::${variant.id}`;
    line.variantId = variant.id;
    line.color = variant.color;
    line.colorName = variant.colorName;
    line.size = variant.size;
    line.unitPrice = variant.price;
    saveCart(cart);
  }
  return { ok: true };
}

export function clearCart() {
  saveCart([]);
}

function migrateWishlist() {
  const legacy = safeRead(LEGACY_WISHLIST_KEY, []);
  return Array.isArray(legacy) ? legacy.map((item) => typeof item === "string"
    ? { productId: item, preferredVariantId: null, savedAt: Date.now() }
    : item) : [];
}

export function getWishlist() {
  const current = safeRead(WISHLIST_KEY, null);
  if (Array.isArray(current)) return current;
  const migrated = migrateWishlist();
  safeWrite(WISHLIST_KEY, migrated);
  return migrated;
}

export function isWishlisted(productId) {
  return getWishlist().some((item) => item.productId === productId);
}

export function toggleWishlist(productId, preferredVariantId = null) {
  const wishlist = getWishlist();
  const index = wishlist.findIndex((item) => item.productId === productId);
  let saved;
  if (index >= 0) {
    wishlist.splice(index, 1);
    saved = false;
    track("remove_from_wishlist", { product_id: productId });
  } else {
    wishlist.push({ productId, preferredVariantId, savedAt: Date.now() });
    saved = true;
    track("add_to_wishlist", { product_id: productId, variant_id: preferredVariantId });
  }
  safeWrite(WISHLIST_KEY, wishlist);
  removeKey(LEGACY_WISHLIST_KEY);
  emit("atelier:wishlist-updated", { wishlist });
  return saved;
}

export function saveForLater(line) {
  if (!isWishlisted(line.productId)) toggleWishlist(line.productId, line.variantId);
  removeCartItem(line.id);
}

export function cartTotals(lines, shippingFee = 0, discount = 0) {
  const subtotal = lines.reduce((total, line) => total + (line.unitPrice * line.quantity), 0);
  return { subtotal, shippingFee, discount, total: Math.max(0, subtotal + shippingFee - discount) };
}

export function validateInventory(lines) {
  const unavailable = lines.filter((line) => !line.variant || (line.variant.inventoryKnown && line.variant.stock < line.quantity));
  return {
    ok: unavailable.length === 0,
    unavailable,
    message: unavailable.length
      ? `${unavailable[0].product.name}, size ${unavailable[0].size} is unavailable in the requested quantity.`
      : "",
  };
}

function makeOrderId() {
  const now = new Date();
  const date = [String(now.getFullYear()).slice(-2), String(now.getMonth() + 1).padStart(2, "0"), String(now.getDate()).padStart(2, "0")].join("");
  const suffix = String(Math.floor(1000 + Math.random() * 9000));
  return `AT-${date}${suffix}`;
}

export function createOrder(orderInput) {
  const orders = safeRead(ORDER_KEY, []);
  const createdAt = new Date().toISOString();
  const order = {
    id: makeOrderId(),
    currency: "VND",
    reality: "SIMULATED_LOCAL",
    status: "processing",
    accountEmail: getSession()?.email || null,
    paymentStatus: orderInput.paymentMethod === "cod" ? "pending-local"
      : orderInput.paymentMethod === "card-simulated" ? "authorised-simulated" : "awaiting-transfer-local",
    fulfillmentStatus: "recorded-local",
    tracking: null,
    serviceRequests: [],
    timeline: [{ status: "processing", at: createdAt }],
    createdAt,
    ...orderInput,
  };
  orders.unshift(order);
  safeWrite(ORDER_KEY, orders);
  adjustInventory(order.items || [], -1);
  track("purchase", { order_id: order.id, value: order.total, currency: "VND", reality: "local_prototype" });
  return order;
}

export function getOrders() {
  const orders = safeRead(ORDER_KEY, []);
  return Array.isArray(orders) ? orders : [];
}

export function getOrder(orderId) {
  return getOrders().find((order) => order.id === orderId) || null;
}

export function updateOrder(orderId, update) {
  const orders = getOrders();
  const index = orders.findIndex((order) => order.id === orderId);
  if (index < 0) return null;
  orders[index] = { ...orders[index], ...update };
  safeWrite(ORDER_KEY, orders);
  return orders[index];
}

export function saveOrderServiceRequest(orderId, request) {
  const order = getOrder(orderId);
  if (!order) return { ok: false, message: "This order could not be found in this tab." };
  if (order.serviceRequests?.some((item) => item.itemIndex === request.itemIndex)) {
    return { ok: false, message: "This piece already has a request. Withdraw it before choosing a different one." };
  }
  return { ok: true, order: updateOrder(orderId, { serviceRequests: [...(order.serviceRequests || []), request] }) };
}

export function addRecentlyViewed(productId) {
  const current = safeRead(RECENT_KEY, []).filter((id) => id !== productId);
  current.unshift(productId);
  safeWrite(RECENT_KEY, current.slice(0, 8));
}

export function getRecentlyViewed() {
  return safeRead(RECENT_KEY, []);
}

export function getClientProfile() {
  const account = getCurrentAccount();
  if (account) {
    const address = getAddresses().find((item) => item.isDefault) || getAddresses()[0] || {};
    return { fullName: address.fullName || account.fullName, email: account.email, phone: address.phone || account.phone,
      address: address.address || "", apartment: address.apartment || "", district: address.district || "",
      province: address.province || "", postalCode: address.postalCode || "" };
  }
  const profile = safeRead(PROFILE_KEY, {});
  return profile && typeof profile === "object" && !Array.isArray(profile) ? profile : {};
}

export function saveClientProfile(values) {
  const fields = ["fullName", "email", "phone", "address", "apartment", "district", "province", "postalCode"];
  const profile = Object.fromEntries(fields.map((key) => [key, String(values[key] || "").trim()]));
  safeWrite(PROFILE_KEY, profile);
  return profile;
}

export function clearClientProfile() { removeKey(PROFILE_KEY); }
export function getEnquiryDraft() { return safeRead(ENQUIRY_KEY, null); }
export function saveEnquiryDraft(values) {
  const draft = { topic: String(values.topic || "product"), orderId: String(values.orderId || ""),
    message: String(values.message || "").trim(), updatedAt: new Date().toISOString() };
  safeWrite(ENQUIRY_KEY, draft);
  return draft;
}
export function clearEnquiryDraft() { removeKey(ENQUIRY_KEY); }

export function getDeliveryWindow(express = false) {
  const start = new Date();
  start.setDate(start.getDate() + (express ? 1 : 2));
  const end = new Date(start);
  end.setDate(end.getDate() + (express ? 0 : 2));
  const formatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long" });
  return express || start.toDateString() === end.toDateString()
    ? formatter.format(start)
    : `${formatter.format(start)}–${formatter.format(end)}`;
}

export function track(eventName, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...payload });
}

// ---------------------------------------------------------------------------
// Inventory (tab-local, seeded). Demo orders decrement stock; cancellations restore it.
// ---------------------------------------------------------------------------
export function getInventory() {
  const inventory = safeRead(INVENTORY_KEY, {});
  return inventory && typeof inventory === "object" ? inventory : {};
}

function adjustInventory(items, direction) {
  const inventory = getInventory();
  let changed = false;
  items.forEach((item) => {
    const byColor = inventory[item.productId];
    if (!byColor) return;
    const colorKey = Object.keys(byColor).find((key) => key === item.colorValue || key === String(item.color || "").toLowerCase());
    if (!colorKey || !Number.isFinite(Number(byColor[colorKey][item.size]))) return;
    byColor[colorKey][item.size] = Math.max(0, Number(byColor[colorKey][item.size]) + direction * Number(item.quantity || 0));
    changed = true;
  });
  if (changed) {
    safeWrite(INVENTORY_KEY, inventory);
    cataloguePromise = undefined;
  }
}

// ---------------------------------------------------------------------------
// Promo codes and gift note (Bag -> Checkout -> Order).
// ---------------------------------------------------------------------------
export function getPromoCodes() {
  return safeRead(PROMO_CODES_KEY, []);
}

export function evaluatePromo(code, subtotal) {
  const value = String(code || "").trim().toUpperCase();
  if (!value) return { ok: false, message: "Enter a promo code." };
  const promo = getPromoCodes().find((item) => item.code === value);
  if (!promo) return { ok: false, message: `“${value}” isn’t a recognised code. Check the spelling and try again.` };
  if (promo.expired) return { ok: false, message: `“${value}” has expired.` };
  if (promo.minSubtotal && subtotal < promo.minSubtotal) return { ok: false, message: `“${value}” applies to orders from ${formatVND(promo.minSubtotal)}. Your Bag is ${formatVND(subtotal)}.` };
  const discount = promo.type === "percent" ? Math.round(subtotal * promo.value / 100) : Math.min(subtotal, promo.value);
  return { ok: true, promo, discount, message: `${promo.code} applied: ${promo.label}.` };
}

export function getAppliedPromo() {
  return safeRead(APPLIED_PROMO_KEY, null);
}

export async function applyPromo(code, subtotal) {
  return simulateRequest(() => {
    const result = evaluatePromo(code, subtotal);
    if (result.ok) safeWrite(APPLIED_PROMO_KEY, result.promo.code);
    return result;
  });
}

export function removePromo() { removeKey(APPLIED_PROMO_KEY); }

// Discount for the current Bag; a code that no longer qualifies stays saved but gives 0.
export function promoDiscount(subtotal) {
  const code = getAppliedPromo();
  if (!code) return { code: null, discount: 0, ok: false, message: "" };
  const result = evaluatePromo(code, subtotal);
  return { code, discount: result.ok ? result.discount : 0, ok: result.ok, message: result.message };
}

export function getGiftNote() {
  const note = safeRead(GIFT_KEY, null);
  return note && typeof note === "object" ? note : { enabled: false, message: "" };
}

export function saveGiftNote({ enabled, message }) {
  const note = { enabled: Boolean(enabled), message: String(message || "").slice(0, 200) };
  safeWrite(GIFT_KEY, note);
  return note;
}

export function clearCheckoutExtras() {
  removeKey(APPLIED_PROMO_KEY);
  removeKey(GIFT_KEY);
}

// ---------------------------------------------------------------------------
// Orders: cancellation (while processing), returns and history per account.
// ---------------------------------------------------------------------------
export const ORDER_STATUS_LABELS = {
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  "return-requested": "Return requested",
};

export function canCancelOrder(order) { return (order?.status || "processing") === "processing"; }
export function canRequestReturn(order) { return order?.status === "delivered" || order?.status === "return-requested"; }

export async function cancelOrder(orderId, reason = "") {
  return simulateRequest(() => {
    const order = getOrder(orderId);
    if (!order) return { ok: false, message: "This order could not be found." };
    if (!canCancelOrder(order)) return { ok: false, message: "This order can no longer be cancelled." };
    const now = new Date().toISOString();
    const updated = updateOrder(orderId, { status: "cancelled", cancelReason: String(reason), timeline: [...(order.timeline || []), { status: "cancelled", at: now }] });
    adjustInventory(order.items || [], 1);
    track("order_cancelled", { order_id: orderId, reality: "local_prototype" });
    return { ok: true, order: updated };
  });
}

export async function submitServiceRequest(orderId, request) {
  return simulateRequest(() => {
    const result = saveOrderServiceRequest(orderId, request);
    if (!result.ok) return result;
    const order = result.order;
    if (order.status === "delivered") {
      return { ok: true, order: updateOrder(orderId, { status: "return-requested", timeline: [...(order.timeline || []), { status: "return-requested", at: new Date().toISOString() }] }) };
    }
    return result;
  });
}

export function getAccountOrders(email) {
  const target = String(email || "").toLowerCase();
  return getOrders().filter((order) => (order.accountEmail || "").toLowerCase() === target || (order.customer?.email || "").toLowerCase() === target);
}

export async function lookupOrder(orderId, email) {
  return simulateRequest(() => {
    const id = String(orderId || "").trim().toUpperCase();
    const order = getOrders().find((item) => item.id.toUpperCase() === id && (item.customer?.email || "").toLowerCase() === String(email || "").trim().toLowerCase());
    return order ? { ok: true, order } : { ok: false, message: "No order matches that number and email in this demo session." };
  });
}

// ---------------------------------------------------------------------------
// Simulated accounts. Credentials live in this tab only; nothing is sent anywhere.
// ---------------------------------------------------------------------------
function normaliseEmail(value) { return String(value || "").trim().toLowerCase(); }

export function getAccounts() { return safeRead(ACCOUNTS_KEY, []); }
export function getSession() { return safeRead(SESSION_KEY, null); }

export function getCurrentAccount() {
  const session = getSession();
  if (!session) return null;
  const account = getAccounts().find((item) => item.email === session.email);
  if (!account) return null;
  const { password, ...publicAccount } = account;
  void password;
  return publicAccount;
}

function startSession(email) {
  safeWrite(SESSION_KEY, { email, signedInAt: new Date().toISOString() });
  emit("atelier:session-updated", { email });
}

export async function signIn({ email, password }) {
  return simulateRequest(() => {
    const account = getAccounts().find((item) => item.email === normaliseEmail(email));
    if (!account || account.password !== String(password || "")) return { ok: false, message: "That email and password don’t match a demo account. Check them, or create an account." };
    startSession(account.email);
    track("login", { method: "demo" });
    return { ok: true };
  });
}

export async function signUp({ fullName, email, password, phone = "" }) {
  return simulateRequest(() => {
    const normalised = normaliseEmail(email);
    const accounts = getAccounts();
    if (accounts.some((item) => item.email === normalised)) return { ok: false, field: "email", message: "An account with this email already exists in this demo. Sign in instead." };
    if (String(password || "").length < 8) return { ok: false, field: "password", message: "Use at least 8 characters for the password." };
    accounts.push({ email: normalised, password: String(password), fullName: String(fullName || "").trim(), phone: String(phone || "").trim(), createdAt: new Date().toISOString() });
    safeWrite(ACCOUNTS_KEY, accounts);
    startSession(normalised);
    track("sign_up", { method: "demo" });
    return { ok: true };
  });
}

export function signOut() {
  removeKey(SESSION_KEY);
  emit("atelier:session-updated", { email: null });
}

export async function requestPasswordReset(email) {
  return simulateRequest(() => {
    const normalised = normaliseEmail(email);
    const exists = getAccounts().some((item) => item.email === normalised);
    // Same response either way, as a real store would. No email is sent: the demo shows the code on screen.
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const resets = safeRead(RESET_KEY, {});
    if (exists) resets[normalised] = code;
    safeWrite(RESET_KEY, resets);
    return { ok: true, demoCode: exists ? code : null };
  });
}

export async function resetPassword({ email, code, password }) {
  return simulateRequest(() => {
    const normalised = normaliseEmail(email);
    const resets = safeRead(RESET_KEY, {});
    if (!resets[normalised] || resets[normalised] !== String(code || "").trim()) return { ok: false, field: "code", message: "That reset code isn’t valid. Request a new one." };
    if (String(password || "").length < 8) return { ok: false, field: "password", message: "Use at least 8 characters for the new password." };
    safeWrite(ACCOUNTS_KEY, getAccounts().map((item) => item.email === normalised ? { ...item, password: String(password) } : item));
    delete resets[normalised];
    safeWrite(RESET_KEY, resets);
    return { ok: true };
  });
}

export async function updateAccountProfile(values) {
  return simulateRequest(() => {
    const session = getSession();
    if (!session) return { ok: false, message: "Sign in to edit your profile." };
    const nextEmail = normaliseEmail(values.email || session.email);
    const accounts = getAccounts();
    if (nextEmail !== session.email && accounts.some((item) => item.email === nextEmail)) return { ok: false, field: "email", message: "Another demo account already uses this email." };
    safeWrite(ACCOUNTS_KEY, accounts.map((item) => item.email === session.email
      ? { ...item, email: nextEmail, fullName: String(values.fullName || "").trim(), phone: String(values.phone || "").trim() } : item));
    if (nextEmail !== session.email) {
      safeWrite(ADDRESS_KEY, safeRead(ADDRESS_KEY, []).map((item) => item.accountEmail === session.email ? { ...item, accountEmail: nextEmail } : item));
      safeWrite(ORDER_KEY, getOrders().map((item) => item.accountEmail === session.email ? { ...item, accountEmail: nextEmail } : item));
      startSession(nextEmail);
    }
    return { ok: true, account: getCurrentAccount() };
  });
}

// ---------------------------------------------------------------------------
// Address book (per signed-in account).
// ---------------------------------------------------------------------------
const ADDRESS_FIELDS = ["label", "fullName", "phone", "address", "apartment", "district", "province", "postalCode"];

export function getAddresses() {
  const session = getSession();
  if (!session) return [];
  return safeRead(ADDRESS_KEY, []).filter((item) => item.accountEmail === session.email);
}

export async function saveAddress(values) {
  return simulateRequest(() => {
    const session = getSession();
    if (!session) return { ok: false, message: "Sign in to save addresses." };
    const all = safeRead(ADDRESS_KEY, []);
    const clean = Object.fromEntries(ADDRESS_FIELDS.map((key) => [key, String(values[key] || "").trim()]));
    const mine = all.filter((item) => item.accountEmail === session.email);
    let id = values.id;
    if (id && all.some((item) => item.id === id && item.accountEmail === session.email)) {
      const index = all.findIndex((item) => item.id === id);
      all[index] = { ...all[index], ...clean };
    } else {
      id = `ADDR-${Date.now().toString(36).toUpperCase()}`;
      all.push({ id, accountEmail: session.email, ...clean, isDefault: !mine.length });
    }
    const next = values.isDefault ? all.map((item) => item.accountEmail === session.email ? { ...item, isDefault: item.id === id } : item) : all;
    safeWrite(ADDRESS_KEY, next);
    return { ok: true, id };
  });
}

export async function deleteAddress(id) {
  return simulateRequest(() => {
    const session = getSession();
    const all = safeRead(ADDRESS_KEY, []);
    const target = all.find((item) => item.id === id && item.accountEmail === session?.email);
    if (!target) return { ok: false, message: "This address no longer exists." };
    let next = all.filter((item) => item.id !== id);
    if (target.isDefault) {
      const firstMine = next.find((item) => item.accountEmail === session.email);
      if (firstMine) next = next.map((item) => item.id === firstMine.id ? { ...item, isDefault: true } : item);
    }
    safeWrite(ADDRESS_KEY, next);
    return { ok: true };
  });
}

export async function setDefaultAddress(id) {
  return simulateRequest(() => {
    const session = getSession();
    safeWrite(ADDRESS_KEY, safeRead(ADDRESS_KEY, []).map((item) => item.accountEmail === session?.email ? { ...item, isDefault: item.id === id } : item));
    return { ok: true };
  });
}

// ---------------------------------------------------------------------------
// Stock alerts ("Notify me" on sold-out sizes). No email is ever sent.
// ---------------------------------------------------------------------------
export function getStockAlerts() { return safeRead(NOTIFY_KEY, []); }

export async function requestStockAlert({ productId, productName, color, colorName, size, email }) {
  return simulateRequest(() => {
    const alerts = getStockAlerts();
    const normalised = normaliseEmail(email);
    if (alerts.some((item) => item.productId === productId && item.color === color && item.size === size && item.email === normalised)) {
      return { ok: true, duplicate: true };
    }
    alerts.push({ id: `ALERT-${Date.now().toString(36).toUpperCase()}`, productId, productName, color, colorName, size, email: normalised, createdAt: new Date().toISOString() });
    safeWrite(NOTIFY_KEY, alerts);
    track("stock_alert_requested", { product_id: productId, size, reality: "local_prototype" });
    return { ok: true, duplicate: false };
  });
}

export async function removeStockAlert(id) {
  return simulateRequest(() => {
    safeWrite(NOTIFY_KEY, getStockAlerts().filter((item) => item.id !== id));
    return { ok: true };
  });
}

// ---------------------------------------------------------------------------
// Client Services: appointments and enquiries.
// ---------------------------------------------------------------------------
export function getAppointmentConfig() { return safeRead(APPOINTMENT_CONFIG_KEY, { services: [], times: [], daysAhead: 0, closedWeekdays: [], taken: [] }); }
export function getAppointments() { return safeRead(APPOINTMENT_KEY, []); }

function dateKey(date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

export function getAppointmentDays(today = new Date()) {
  const config = getAppointmentConfig();
  const booked = getAppointments().filter((item) => item.status !== "cancelled");
  const days = [];
  for (let offset = 1; offset <= config.daysAhead; offset += 1) {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    if (config.closedWeekdays.includes(date.getDay())) continue;
    const key = dateKey(date);
    const slots = config.times.map((time) => ({
      time,
      available: !config.taken.some((item) => item.dayOffset === offset && item.time === time) && !booked.some((item) => item.date === key && item.time === time),
    }));
    days.push({ key, date, slots });
  }
  return days;
}

export async function bookAppointment(values) {
  return simulateRequest(() => {
    const day = getAppointmentDays().find((item) => item.key === values.date);
    const slot = day?.slots.find((item) => item.time === values.time);
    if (!slot || !slot.available) return { ok: false, field: "time", message: "That time is no longer available. Choose another slot." };
    const service = getAppointmentConfig().services.find((item) => item.id === values.service);
    const appointment = {
      id: `APT-${Date.now().toString(36).toUpperCase()}`, status: "booked", service: values.service, serviceLabel: service?.label || values.service,
      date: values.date, time: values.time, fullName: String(values.fullName || "").trim(), email: normaliseEmail(values.email),
      phone: String(values.phone || "").trim(), notes: String(values.notes || "").trim().slice(0, 500), createdAt: new Date().toISOString(),
    };
    safeWrite(APPOINTMENT_KEY, [...getAppointments(), appointment]);
    track("appointment_booked", { service: values.service, reality: "local_prototype" });
    return { ok: true, appointment };
  });
}

export async function cancelAppointment(id) {
  return simulateRequest(() => {
    safeWrite(APPOINTMENT_KEY, getAppointments().map((item) => item.id === id ? { ...item, status: "cancelled" } : item));
    return { ok: true };
  });
}

export function getEnquiries() { return safeRead(MESSAGE_KEY, []); }

export async function sendEnquiry(values) {
  return simulateRequest(() => {
    const enquiry = {
      id: `ENQ-${String(Date.now()).slice(-6)}`, topic: String(values.topic || "other"), orderId: String(values.orderId || ""),
      fullName: String(values.fullName || "").trim(), email: normaliseEmail(values.email), message: String(values.message || "").trim().slice(0, 2000),
      status: "received-simulated", createdAt: new Date().toISOString(),
    };
    safeWrite(MESSAGE_KEY, [enquiry, ...getEnquiries()]);
    return { ok: true, enquiry };
  });
}
