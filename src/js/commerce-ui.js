import {
  addCartItem,
  cartCount,
  findVariant,
  formatVND,
  getAvailableSizes,
  getCart,
  getDeliveryWindow,
  getProduct,
  hydrateCart,
  isWishlisted,
  loadProducts,
  removeCartItem,
  toggleWishlist,
} from "./commerce-store.js?v=ecommerce-3";

let lastFocusedElement = null;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function updateGlobalIndicators() {
  const count = cartCount();
  document.querySelectorAll(".js-nav-bag-count").forEach((element) => {
    element.textContent = String(count);
  });
  document.querySelectorAll('.nav-text[href="cart.html"]').forEach((element) => {
    if (!element.querySelector(".js-nav-bag-count")) element.textContent = `Bag (${count})`;
  });
}

export function showMessage(message, { assertive = false } = {}) {
  let region = document.getElementById("atelier-status-region");
  if (!region) {
    region = document.createElement("div");
    region.id = "atelier-status-region";
    region.className = "atelier-status-region";
    region.setAttribute("role", assertive ? "alert" : "status");
    region.setAttribute("aria-live", assertive ? "assertive" : "polite");
    document.body.appendChild(region);
  }
  region.textContent = message;
  region.classList.add("is-visible");
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => region.classList.remove("is-visible"), 2600);
}

function ensureOverlay() {
  let overlay = document.getElementById("atelier-commerce-overlay");
  if (overlay) return overlay;
  overlay = document.createElement("div");
  overlay.id = "atelier-commerce-overlay";
  overlay.className = "commerce-overlay";
  overlay.innerHTML = '<button class="commerce-overlay-backdrop js-commerce-close" type="button" aria-label="Close"></button><section class="commerce-drawer" role="dialog" aria-modal="true" aria-labelledby="commerce-drawer-title"><button class="commerce-drawer-close js-commerce-close" type="button" aria-label="Close">×</button><div class="js-commerce-drawer-content"></div></section>';
  document.body.appendChild(overlay);
  overlay.querySelectorAll(".js-commerce-close").forEach((button) => button.addEventListener("click", closeDrawer));
  return overlay;
}

export function closeDrawer() {
  const overlay = document.getElementById("atelier-commerce-overlay");
  if (!overlay) return;
  overlay.classList.remove("is-open");
  document.body.classList.remove("commerce-drawer-open");
  setTimeout(() => {
    overlay.querySelector(".js-commerce-drawer-content").innerHTML = "";
  }, 320);
  lastFocusedElement?.focus?.();
}

function openDrawer(content) {
  const overlay = ensureOverlay();
  lastFocusedElement = document.activeElement;
  overlay.querySelector(".js-commerce-drawer-content").innerHTML = content;
  overlay.classList.add("is-open");
  document.body.classList.add("commerce-drawer-open");
  requestAnimationFrame(() => overlay.querySelector(".commerce-drawer button, .commerce-drawer input, .commerce-drawer select, .commerce-drawer a")?.focus());
  return overlay;
}

function variantControls(product, selectedColor, selectedSize) {
  const sizes = getAvailableSizes(product, selectedColor);
  return `
    <div class="commerce-fieldset" data-product-id="${escapeHtml(product.id)}">
      <div class="commerce-fieldset-head"><span>COLOR</span><strong class="js-variant-color-label">${escapeHtml(product.colors.find((color) => color.value === selectedColor)?.name)}</strong></div>
      <div class="commerce-color-options" role="radiogroup" aria-label="Color">
        ${product.colors.map((color) => `<button type="button" class="commerce-color-option${color.value === selectedColor ? " is-selected" : ""}" data-color="${escapeHtml(color.value)}" aria-pressed="${color.value === selectedColor}"><i style="--swatch:${escapeHtml(color.hex)}"></i>${escapeHtml(color.name)}</button>`).join("")}
      </div>
      <div class="commerce-fieldset-head"><span>SIZE</span><button class="text-action js-open-size-guide" type="button">Size Guide</button></div>
      <div class="commerce-size-options" role="radiogroup" aria-label="Size">
        ${sizes.map(({ size, stock }) => `<button type="button" class="commerce-size-option${size === selectedSize ? " is-selected" : ""}" data-size="${escapeHtml(size)}" aria-pressed="${size === selectedSize}" ${stock < 1 ? "disabled" : ""}>${escapeHtml(size)}</button>`).join("")}
      </div>
      <p class="commerce-inline-error js-variant-error" aria-live="polite"></p>
    </div>`;
}

function bindVariantControls(container, product, initialColor, initialSize, onChange) {
  let color = initialColor;
  let size = initialSize;
  const repaintSizes = () => {
    const sizeWrap = container.querySelector(".commerce-size-options");
    const currentSizes = getAvailableSizes(product, color);
    sizeWrap.innerHTML = currentSizes.map(({ size: option, stock }) => `<button type="button" class="commerce-size-option${option === size ? " is-selected" : ""}" data-size="${escapeHtml(option)}" aria-pressed="${option === size}" ${stock < 1 ? "disabled" : ""}>${escapeHtml(option)}</button>`).join("");
    if (!currentSizes.some((item) => item.size === size && item.stock > 0)) size = null;
    bindSizeButtons();
    onChange?.({ color, size, variant: size ? findVariant(product, color, size) : null });
  };
  const bindSizeButtons = () => {
    container.querySelectorAll(".commerce-size-option").forEach((button) => button.addEventListener("click", () => {
      size = button.dataset.size;
      container.querySelectorAll(".commerce-size-option").forEach((item) => {
        item.classList.toggle("is-selected", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });
      container.querySelector(".js-variant-error").textContent = "";
      onChange?.({ color, size, variant: findVariant(product, color, size) });
    }));
  };
  container.querySelectorAll(".commerce-color-option").forEach((button) => button.addEventListener("click", () => {
    color = button.dataset.color;
    container.querySelectorAll(".commerce-color-option").forEach((item) => {
      item.classList.toggle("is-selected", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    container.querySelector(".js-variant-color-label").textContent = product.colors.find((item) => item.value === color)?.name || "";
    repaintSizes();
  }));
  container.querySelector(".js-open-size-guide")?.addEventListener("click", () => openSizeGuide());
  bindSizeButtons();
  return () => ({ color, size, variant: size ? findVariant(product, color, size) : null });
}

export function openVariantPicker(product, { heading = "Select an option", preferredVariantId = null, onAdded = null } = {}) {
  const preferred = product.variants.find((variant) => variant.id === preferredVariantId);
  const initialColor = preferred?.color || product.colors[0].value;
  const initialSize = preferred?.size || (product.requiresSize ? null : "One Size");
  const overlay = openDrawer(`
    <p class="eyebrow">QUICK ADD</p>
    <h2 id="commerce-drawer-title">${escapeHtml(heading)}</h2>
    <div class="commerce-picker-product"><img src="${escapeHtml(product.images[0])}" alt=""><div><strong>${escapeHtml(product.name)}</strong><span>${formatVND(product.price)}</span></div></div>
    ${variantControls(product, initialColor, initialSize)}
    <button type="button" class="commerce-primary-action js-confirm-variant">ADD TO BAG</button>
  `);
  const content = overlay.querySelector(".js-commerce-drawer-content");
  const getSelection = bindVariantControls(content, product, initialColor, initialSize);
  content.querySelector(".js-confirm-variant").addEventListener("click", () => {
    const selection = getSelection();
    if (!selection.variant) {
      content.querySelector(".js-variant-error").textContent = "Please select a size.";
      return;
    }
    const result = addCartItem(product, selection.variant.id);
    if (!result.ok) {
      content.querySelector(".js-variant-error").textContent = result.message;
      return;
    }
    onAdded?.(selection.variant);
    openMiniBag();
  });
}

export async function openMiniBag() {
  const lines = await hydrateCart();
  const latest = lines[lines.length - 1];
  const subtotal = lines.reduce((total, line) => total + (line.unitPrice * line.quantity), 0);
  const overlay = openDrawer(`
    <p class="eyebrow">${latest ? "ADDED TO BAG" : "YOUR BAG"}</p>
    <h2 id="commerce-drawer-title">A considered selection.</h2>
    <div class="mini-bag-items">
      ${lines.length ? lines.map((line) => `<article class="mini-bag-item" data-line-id="${escapeHtml(line.id)}"><img src="${escapeHtml(line.product.images[0])}" alt="${escapeHtml(line.product.name)}"><div><a href="detailproduct.html?id=${encodeURIComponent(line.product.id)}">${escapeHtml(line.product.name)}</a><p>${escapeHtml(line.colorName)} · Size ${escapeHtml(line.size)} · Qty ${line.quantity}</p><strong>${formatVND(line.unitPrice * line.quantity)}</strong></div><button type="button" class="js-mini-remove" aria-label="Remove ${escapeHtml(line.product.name)}">×</button></article>`).join("") : '<p class="commerce-empty-copy">Your Bag is empty.</p>'}
    </div>
    <div class="mini-bag-total"><span>Subtotal</span><strong>${formatVND(subtotal)}</strong></div>
    <div class="mini-bag-actions">
      <a class="commerce-primary-action" href="checkout.html" ${lines.length ? "" : 'aria-disabled="true"'}>CHECKOUT</a>
      <a class="commerce-secondary-action" href="cart.html">VIEW BAG</a>
      <button class="text-action js-commerce-close" type="button">Continue shopping</button>
    </div>
  `);
  overlay.querySelector(".js-commerce-drawer-content .js-commerce-close")?.addEventListener("click", closeDrawer);
  overlay.querySelectorAll(".js-mini-remove").forEach((button) => button.addEventListener("click", () => {
    removeCartItem(button.closest("[data-line-id]").dataset.lineId);
    openMiniBag();
  }));
}

export function openSizeGuide() {
  const overlay = openDrawer(`
    <p class="eyebrow">ATELIER CLIENT SERVICES</p>
    <h2 id="commerce-drawer-title">Size Guide</h2>
    <p class="commerce-drawer-intro">Measurements are body measurements in centimetres. For a relaxed silhouette, consider the larger size.</p>
    <div class="size-guide-table-wrap"><table class="size-guide-table"><thead><tr><th>Size</th><th>Chest</th><th>Waist</th><th>Hip</th></tr></thead><tbody><tr><td>XS</td><td>80–84</td><td>62–66</td><td>86–90</td></tr><tr><td>S</td><td>84–88</td><td>66–70</td><td>90–94</td></tr><tr><td>M</td><td>88–92</td><td>70–74</td><td>94–98</td></tr><tr><td>L</td><td>92–98</td><td>74–80</td><td>98–104</td></tr><tr><td>XL</td><td>98–104</td><td>80–86</td><td>104–110</td></tr></tbody></table></div>
    <a class="commerce-secondary-action" href="size-guide.html">FULL MEASURING GUIDE</a>
  `);
  overlay.querySelector(".commerce-secondary-action")?.addEventListener("click", closeDrawer);
}

export async function initCommerceUi() {
  updateGlobalIndicators();
  ensureOverlay();
  window.addEventListener("atelier:cart-updated", updateGlobalIndicators);
  window.addEventListener("storage", updateGlobalIndicators);
  document.addEventListener("keydown", (event) => {
    const overlay = document.getElementById("atelier-commerce-overlay");
    if (event.key === "Escape" && overlay?.classList.contains("is-open")) closeDrawer();
    if (event.key === "Tab" && overlay?.classList.contains("is-open")) {
      const focusable = [...overlay.querySelectorAll('.commerce-drawer button:not(:disabled), .commerce-drawer input:not(:disabled), .commerce-drawer select:not(:disabled), .commerce-drawer a[href]')]
        .filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  await loadProducts().catch(() => []);
}

export { escapeHtml, getDeliveryWindow, getProduct, isWishlisted, toggleWishlist };
