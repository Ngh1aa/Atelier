import {
  addCartItem,
  cartCount,
  findVariant,
  formatVND,
  getAvailableSizes,
  getDeliveryWindow,
  getProduct,
  hydrateCart,
  isWishlisted,
  loadProducts,
  removeCartItem,
  SIZE_GUIDE,
  toggleWishlist,
} from "./commerce-store.js?v=white-editorial-v6";

let lastFocusedElement = null;
let closeTimer;

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
  document.querySelectorAll(".js-nav-bag-count").forEach((element) => { element.textContent = String(count); });
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
  region.setAttribute("role", assertive ? "alert" : "status");
  region.setAttribute("aria-live", assertive ? "assertive" : "polite");
  region.textContent = message;
  region.classList.add("is-visible");
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => region.classList.remove("is-visible"), 2600);
}

export function attemptLocalAction(action, errorElement = null) {
  try { return action(); }
  catch {
    const message = "This browser could not save the change. Free up storage or allow site data, then try again.";
    if (errorElement) errorElement.textContent = message;
    else showMessage(message, { assertive: true });
    return null;
  }
}

// Shared inline validation for checkout, profile, lookup and service drafts.
export function bindFormValidation(form) {
  form.noValidate = true;
  const fields = [...form.querySelectorAll("input:not([type=hidden]), select, textarea")];
  const validateField = (field) => {
    if (field.disabled || field.type === "radio") return true;
    field.setCustomValidity("");
    if (field.required && field.type !== "checkbox" && !field.value.trim()) field.setCustomValidity("Complete this field.");
    if (field.type === "tel" && field.value && !/^[+()\d\s.-]{7,20}$/.test(field.value)) field.setCustomValidity("Enter a phone number with 7–20 digits and dialling symbols.");
    const valid = field.validity.valid;
    const id = `${field.id || field.name}-error`;
    let error = form.querySelector(`#${CSS.escape(id)}`);
    if (!error) {
      error = document.createElement("small"); error.id = id; error.className = "field-error";
      field.closest(".form-group, .checkout-consent")?.appendChild(error);
      const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(" ").filter(Boolean));
      describedBy.add(id); field.setAttribute("aria-describedby", [...describedBy].join(" "));
    }
    error.textContent = valid ? "" : field.type === "checkbox" ? "Please acknowledge the terms to continue." : field.validity.typeMismatch ? "Enter a valid email address." : field.validationMessage;
    field.setAttribute("aria-invalid", String(!valid));
    return valid;
  };
  fields.forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => { if (field.getAttribute("aria-invalid") === "true") validateField(field); });
    field.addEventListener("change", () => { if (field.getAttribute("aria-invalid") === "true") validateField(field); });
  });
  return () => {
    const invalid = fields.filter((field) => !validateField(field));
    invalid[0]?.focus();
    return !invalid.length;
  };
}

export function downloadText(filename, content, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement("a"); link.href = url; link.download = filename;
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  closeTimer = setTimeout(() => { overlay.querySelector(".js-commerce-drawer-content").innerHTML = ""; }, 320);
  lastFocusedElement?.focus?.();
}

function openDrawer(content) {
  const overlay = ensureOverlay();
  clearTimeout(closeTimer);
  if (!overlay.classList.contains("is-open")) lastFocusedElement = document.activeElement;
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
      <div class="commerce-fieldset-head"><span>COLOUR</span><strong class="js-variant-color-label">${escapeHtml(product.colors.find((color) => color.value === selectedColor)?.name)}</strong></div>
      <div class="commerce-color-options" role="group" aria-label="Colour">
        ${product.colors.map((color) => `<button type="button" class="commerce-color-option${color.value === selectedColor ? " is-selected" : ""}" data-color="${escapeHtml(color.value)}" aria-pressed="${color.value === selectedColor}"><i style="--swatch:${escapeHtml(color.hex)}"></i>${escapeHtml(color.name)}</button>`).join("")}
      </div>
      <div class="commerce-fieldset-head"><span>SIZE</span><button class="text-action js-open-size-guide" type="button">Size Guide</button></div>
      <div class="commerce-size-options" role="group" aria-label="Size">
        ${sizes.map(({ size, stock }) => `<button type="button" class="commerce-size-option${size === selectedSize ? " is-selected" : ""}" data-size="${escapeHtml(size)}" aria-pressed="${size === selectedSize}" ${stock < 1 ? "disabled" : ""}>${escapeHtml(size)}</button>`).join("")}
      </div>
      <p class="commerce-inline-error js-variant-error" aria-live="polite"></p>
    </div>`;
}

function bindVariantControls(container, product, initialColor, initialSize, onChange) {
  let color = initialColor;
  let size = initialSize;

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

  const repaintSizes = () => {
    const sizeWrap = container.querySelector(".commerce-size-options");
    const currentSizes = getAvailableSizes(product, color);
    sizeWrap.innerHTML = currentSizes.map(({ size: option, stock }) => `<button type="button" class="commerce-size-option${option === size ? " is-selected" : ""}" data-size="${escapeHtml(option)}" aria-pressed="${option === size}" ${stock < 1 ? "disabled" : ""}>${escapeHtml(option)}</button>`).join("");
    if (!currentSizes.some((item) => item.size === size && item.stock > 0)) size = null;
    bindSizeButtons();
    onChange?.({ color, size, variant: size ? findVariant(product, color, size) : null });
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
  bindSizeButtons();
  return () => ({ color, size, variant: size ? findVariant(product, color, size) : null });
}

export function openVariantPicker(product, { heading = "Select an option", preferredVariantId = null, onAdded = null, selectedSize = undefined } = {}) {
  const preferred = product.variants.find((variant) => variant.id === preferredVariantId);
  const initialColor = preferred?.color || product.colors[0].value;
  const initialSize = selectedSize !== undefined ? selectedSize : preferred?.size || (product.requiresSize ? null : "One Size");
  const overlay = openDrawer(`
    <p class="eyebrow">QUICK ADD</p>
    <h2 id="commerce-drawer-title">${escapeHtml(heading)}</h2>
    <div class="commerce-picker-product"><img src="${escapeHtml(product.images[0])}" alt=""><div><strong>${escapeHtml(product.name)}</strong><span>${formatVND(product.price)}</span></div></div>
    ${variantControls(product, initialColor, initialSize)}
    <button type="button" class="commerce-primary-action js-confirm-variant">Add to Bag</button>`);
  const content = overlay.querySelector(".js-commerce-drawer-content");
  const getSelection = bindVariantControls(content, product, initialColor, initialSize);
  content.querySelector(".js-open-size-guide")?.addEventListener("click", () => {
    const selection = getSelection();
    openSizeGuide({ onBack: () => openVariantPicker(product, { heading,
      preferredVariantId: selection.variant?.id || product.variants.find((variant) => variant.color === selection.color)?.id,
      onAdded, selectedSize: selection.size }), });
  });
  content.querySelector(".js-confirm-variant").addEventListener("click", () => {
    const selection = getSelection();
    if (!selection.variant) {
      content.querySelector(".js-variant-error").textContent = "Please select a size.";
      return;
    }
    const result = attemptLocalAction(() => addCartItem(product, selection.variant.id), content.querySelector(".js-variant-error"));
    if (!result) return;
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
    <h2 id="commerce-drawer-title">${latest ? "Added to your Bag." : "Your Bag."}</h2>
    <div class="mini-bag-items">
      ${lines.length ? lines.map((line) => `<article class="mini-bag-item" data-line-id="${escapeHtml(line.id)}"><img src="${escapeHtml(line.product.images[0])}" alt="${escapeHtml(line.product.name)}"><div><a href="detailproduct.html?id=${encodeURIComponent(line.product.id)}">${escapeHtml(line.product.name)}</a><p>${escapeHtml(line.colorName)} · Size ${escapeHtml(line.size)} · Qty ${line.quantity}</p><strong>${formatVND(line.unitPrice * line.quantity)}</strong></div><button type="button" class="js-mini-remove" aria-label="Remove ${escapeHtml(line.product.name)}">×</button></article>`).join("") : '<p class="commerce-empty-copy">Your Bag is empty.</p>'}
    </div>
    <div class="mini-bag-total"><span>Subtotal</span><strong>${formatVND(subtotal)}</strong></div>
    <div class="mini-bag-actions">
      ${lines.length ? '<a class="commerce-primary-action" href="checkout.html">Checkout</a>' : ''}
      <a class="commerce-secondary-action" href="cart.html">View Bag</a>
      <button class="text-action js-commerce-close" type="button">Continue shopping</button>
    </div>`);
  overlay.querySelector(".js-commerce-drawer-content .js-commerce-close")?.addEventListener("click", closeDrawer);
  overlay.querySelectorAll(".js-mini-remove").forEach((button) => button.addEventListener("click", () => {
    removeCartItem(button.closest("[data-line-id]").dataset.lineId);
    openMiniBag();
  }));
}

export function openSizeGuide({ onBack = null } = {}) {
  const overlay = openDrawer(`
    <p class="eyebrow">ATELIER CLIENT SERVICES</p>
    <h2 id="commerce-drawer-title">Size Guide</h2>
    <p class="commerce-drawer-intro">Measurements are body measurements in centimetres. For a relaxed silhouette, consider the larger size.</p>
    <div class="size-guide-table-wrap"><table class="size-guide-table"><thead><tr><th scope="col">Size</th><th scope="col">Chest</th><th scope="col">Waist</th><th scope="col">Hip</th></tr></thead><tbody>${SIZE_GUIDE.map((row) => `<tr><th scope="row">${row.size}</th><td>${row.chest.join("–")}</td><td>${row.waist.join("–")}</td><td>${row.hip.join("–")}</td></tr>`).join("")}</tbody></table></div>
    ${onBack ? '<button type="button" class="commerce-primary-action js-size-guide-back">Back to your selection</button>' : ""}
    <a class="commerce-secondary-action" href="size-guide.html">Full measuring guide</a>`);
  overlay.querySelector(".js-size-guide-back")?.addEventListener("click", onBack);
  overlay.querySelector(".commerce-secondary-action")?.addEventListener("click", closeDrawer);
}

export async function initCommerceUi() {
  updateGlobalIndicators();
  ensureOverlay();
  window.addEventListener("atelier:cart-updated", updateGlobalIndicators);
  window.addEventListener("storage", updateGlobalIndicators);
  document.addEventListener("keydown", (event) => {
    const overlay = document.getElementById("atelier-commerce-overlay");
    if (!overlay?.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      closeDrawer();
      return;
    }
    if (event.key !== "Tab") return;
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
  });
  await loadProducts().catch(() => []);
}

export { escapeHtml, getDeliveryWindow, getProduct, isWishlisted, toggleWishlist };
