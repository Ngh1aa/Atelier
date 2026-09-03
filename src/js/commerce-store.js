const CART_KEY = "atelier.cart.v2";
const LEGACY_CART_KEY = "atelier.cart";
const WISHLIST_KEY = "atelier.wishlist.v2";
const LEGACY_WISHLIST_KEY = "atelier.wishlist";
const ORDER_KEY = "atelier.orders";
const RECENT_KEY = "atelier.recently-viewed";

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

function safeRead(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function slug(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normaliseProduct(product) {
  const colors = product.colors?.length ? product.colors : (COLOR_PRESETS[product.id] || [
    { name: "Black", value: "black", hex: "#151515" },
  ]);
  const images = [...new Set((product.images || []).filter(Boolean))];

  const variants = colors.flatMap((color) => product.sizes.map((size) => {
    const explicitStock = product.inventory?.[color.value]?.[size];
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
      .then((products) => products.map(normaliseProduct));
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
  localStorage.removeItem(LEGACY_CART_KEY);
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
  item.quantity = Math.max(1, Number(quantity) || 1);
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
  if (duplicate) {
    duplicate.quantity = variant.inventoryKnown
      ? Math.min(variant.stock, duplicate.quantity + line.quantity)
      : duplicate.quantity + line.quantity;
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
  localStorage.removeItem(LEGACY_WISHLIST_KEY);
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
      ? `${unavailable[0].product.name} · size ${unavailable[0].size} is unavailable in the requested quantity.`
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
  const order = {
    id: makeOrderId(),
    currency: "VND",
    reality: "SIMULATED_LOCAL",
    paymentStatus: orderInput.paymentMethod === "cod" ? "pending-local" : "awaiting-transfer-local",
    fulfillmentStatus: "recorded-local",
    tracking: null,
    serviceRequests: [],
    createdAt: new Date().toISOString(),
    ...orderInput,
  };
  orders.unshift(order);
  safeWrite(ORDER_KEY, orders);
  track("purchase", { order_id: order.id, value: order.total, currency: "VND", reality: "local_prototype" });
  return order;
}

export function getOrders() {
  return safeRead(ORDER_KEY, []);
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

export function addRecentlyViewed(productId) {
  const current = safeRead(RECENT_KEY, []).filter((id) => id !== productId);
  current.unshift(productId);
  safeWrite(RECENT_KEY, current.slice(0, 8));
}

export function getRecentlyViewed() {
  return safeRead(RECENT_KEY, []);
}

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
