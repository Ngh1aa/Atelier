import {
  cartTotals,
  changeCartVariant,
  findVariant,
  formatVND,
  getDeliveryWindow,
  hydrateCart,
  loadProducts,
  removeCartItem,
  saveForLater,
  updateCartQuantity,
} from "./commerce-store.js?v=ecommerce-2";
import { escapeHtml, showMessage } from "./commerce-ui.js?v=ecommerce-2";

const PROMO_KEY = "atelier.promo";

function getPromo() {
  try {
    return JSON.parse(localStorage.getItem(PROMO_KEY)) || null;
  } catch {
    return null;
  }
}

function emptyState() {
  return `<div class="cart-empty-state"><h2>Your Bag is empty.</h2><p>Discover considered pieces for the season ahead.</p><a href="shop.html" class="btn-outline">Discover the collection <span aria-hidden="true">→</span></a></div>`;
}

function lineMarkup(line) {
  const { product, variant } = line;
  return `
    <article class="cart-item js-cart-item" data-line-id="${escapeHtml(line.id)}">
      <a class="cart-item-img" href="detailproduct.html?id=${encodeURIComponent(product.id)}"><img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}" loading="lazy"></a>
      <div class="cart-item-info">
        <h3><a href="detailproduct.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3>
        <p>${escapeHtml(variant.colorName)} · Size ${escapeHtml(variant.size)}</p>
        <button type="button" class="cart-text-action js-edit-variant">Size ${escapeHtml(variant.size)} · Edit</button>
        <div class="cart-variant-editor js-variant-editor" hidden>
          <label>Color<select class="js-cart-color">${product.colors.map((color) => `<option value="${escapeHtml(color.value)}" ${color.value === variant.color ? "selected" : ""}>${escapeHtml(color.name)}</option>`).join("")}</select></label>
          <label>Size<select class="js-cart-size">${product.sizes.map((size) => { const option = findVariant(product, variant.color, size); return `<option value="${escapeHtml(size)}" ${size === variant.size ? "selected" : ""} ${!option?.stock ? "disabled" : ""}>${escapeHtml(size)}${option?.stock ? "" : " — Unavailable"}</option>`; }).join("")}</select></label>
          <button type="button" class="cart-text-action js-save-variant">Save</button>
          <p class="commerce-inline-error js-cart-variant-error" aria-live="polite"></p>
        </div>
        <button type="button" class="cart-text-action js-save-later">Save for later</button>
      </div>
      <div class="qty-selector" aria-label="Quantity">
        <button class="qty-btn minus" type="button" aria-label="Decrease quantity">−</button>
        <span class="qty-val">${line.quantity}</span>
        <button class="qty-btn plus" type="button" aria-label="Increase quantity">+</button>
      </div>
      <div class="cart-item-price">${formatVND(line.unitPrice * line.quantity)}</div>
      <button class="btn-remove" type="button" aria-label="Remove ${escapeHtml(product.name)}">×</button>
    </article>`;
}

export async function renderCart() {
  const list = document.querySelector(".js-cart-items-list");
  if (!list) return;
  const products = await loadProducts();

  const renderRelated = () => {
    const wrap = document.querySelector(".related-products-list");
    if (!wrap) return;
    wrap.innerHTML = products.slice(0, 4).map((product) => `<a class="related-product-item" href="detailproduct.html?id=${encodeURIComponent(product.id)}"><img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}" loading="lazy"><p class="category">${escapeHtml(product.category)}</p><h4>${escapeHtml(product.name)}</h4><p class="price">${formatVND(product.price)}</p></a>`).join("");
  };

  const paint = async () => {
    const lines = await hydrateCart();
    list.innerHTML = lines.length ? `${lines.map(lineMarkup).join("")}<a href="shop.html" class="continue-shopping">← Continue Shopping</a>` : emptyState();
    bindLines(lines);
    updateSummary(lines);
  };

  const updateSummary = (lines) => {
    const promo = getPromo();
    const rawSubtotal = lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
    const discount = promo?.code === "ATELIER10" ? Math.round(rawSubtotal * 0.1) : 0;
    const totals = cartTotals(lines, 0, discount);
    document.querySelectorAll(".js-summary-subtotal").forEach((element) => { element.textContent = formatVND(totals.subtotal); });
    document.querySelectorAll(".js-summary-total").forEach((element) => { element.textContent = formatVND(totals.total); });
    const shipping = document.querySelector(".js-cart-delivery");
    if (shipping) shipping.textContent = `Estimated ${getDeliveryWindow(false)}`;
    const discountRow = document.querySelector(".js-summary-discount");
    if (discountRow) {
      discountRow.hidden = !discount;
      discountRow.querySelector("span:last-child").textContent = `−${formatVND(discount)}`;
    }
    const checkout = document.querySelector(".btn-checkout");
    checkout?.classList.toggle("is-disabled", !lines.length);
    checkout?.setAttribute("aria-disabled", String(!lines.length));
  };

  const bindLines = (lines) => {
    list.querySelectorAll(".js-cart-item").forEach((item) => {
      const line = lines.find((entry) => entry.id === item.dataset.lineId);
      if (!line) return;
      const quantity = item.querySelector(".qty-val");
      item.querySelector(".minus").addEventListener("click", () => {
        if (line.quantity <= 1) return;
        updateCartQuantity(line.id, line.quantity - 1);
        paint();
      });
      item.querySelector(".plus").addEventListener("click", () => {
        if (line.quantity >= line.variant.stock) {
          showMessage(`Only ${line.variant.stock} piece${line.variant.stock === 1 ? "" : "s"} remain in this size.`, { assertive: true });
          return;
        }
        updateCartQuantity(line.id, line.quantity + 1);
        paint();
      });
      item.querySelector(".btn-remove").addEventListener("click", () => {
        removeCartItem(line.id);
        paint();
      });
      item.querySelector(".js-save-later").addEventListener("click", () => {
        saveForLater(line);
        showMessage("Moved to Saved.");
        paint();
      });

      const editor = item.querySelector(".js-variant-editor");
      const colorSelect = item.querySelector(".js-cart-color");
      const sizeSelect = item.querySelector(".js-cart-size");
      item.querySelector(".js-edit-variant").addEventListener("click", () => {
        editor.hidden = !editor.hidden;
        if (!editor.hidden) colorSelect.focus();
      });
      colorSelect.addEventListener("change", () => {
        sizeSelect.innerHTML = line.product.sizes.map((size) => {
          const variant = findVariant(line.product, colorSelect.value, size);
          return `<option value="${escapeHtml(size)}" ${!variant?.stock ? "disabled" : ""}>${escapeHtml(size)}${variant?.stock ? "" : " — Unavailable"}</option>`;
        }).join("");
      });
      item.querySelector(".js-save-variant").addEventListener("click", () => {
        const variant = findVariant(line.product, colorSelect.value, sizeSelect.value);
        const result = changeCartVariant(line.id, line.product, variant?.id);
        if (!result.ok) {
          item.querySelector(".js-cart-variant-error").textContent = result.message;
          return;
        }
        showMessage("Bag updated.");
        paint();
      });
    });
  };

  const promoWrap = document.querySelector(".promo-code-wrap");
  if (promoWrap) {
    promoWrap.innerHTML = `<button type="button" class="promo-header js-promo-toggle"><span>ADD A PROMO CODE</span><span>+</span></button><form class="promo-form" hidden><label class="sr-only" for="promoCode">Promo code</label><input id="promoCode" autocomplete="off" placeholder="Promo code"><button type="submit">Apply</button><p class="js-promo-message" aria-live="polite"></p></form>`;
    const form = promoWrap.querySelector("form");
    promoWrap.querySelector(".js-promo-toggle").addEventListener("click", () => { form.hidden = !form.hidden; });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const code = form.querySelector("input").value.trim().toUpperCase();
      const message = form.querySelector(".js-promo-message");
      if (code === "ATELIER10") {
        localStorage.setItem(PROMO_KEY, JSON.stringify({ code }));
        message.textContent = "ATELIER10 applied.";
        updateSummary(await hydrateCart());
      } else {
        localStorage.removeItem(PROMO_KEY);
        message.textContent = code ? "This code is invalid or has expired." : "Enter a promo code.";
        updateSummary(await hydrateCart());
      }
    });
  }

  document.querySelector(".btn-checkout")?.addEventListener("click", (event) => {
    if (event.currentTarget.getAttribute("aria-disabled") === "true") event.preventDefault();
  });
  renderRelated();
  await paint();
}
