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
  applyPromo,
  getGiftNote,
  promoDiscount,
  removePromo,
  saveGiftNote,
} from "./commerce-store.js?v=full-prototype";
import { escapeHtml, renderLoadError, runRequest, showMessage } from "./commerce-ui.js?v=full-prototype";

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
        <p>${escapeHtml(variant.colorName)}, size ${escapeHtml(variant.size)}</p>
        <button type="button" class="cart-text-action js-edit-variant" aria-expanded="false">Edit size ${escapeHtml(variant.size)}</button>
        <div class="cart-variant-editor js-variant-editor" hidden style="display:none">
          <label>Colour<select class="js-cart-color">${product.colors.map((color) => `<option value="${escapeHtml(color.value)}" ${color.value === variant.color ? "selected" : ""}>${escapeHtml(color.name)}</option>`).join("")}</select></label>
          <label>Size<select class="js-cart-size">${product.sizes.map((size) => { const option = findVariant(product, variant.color, size); return `<option value="${escapeHtml(size)}" ${size === variant.size ? "selected" : ""} ${!option?.stock ? "disabled" : ""}>${escapeHtml(size)}${option?.stock ? "" : " — Unavailable"}</option>`; }).join("")}</select></label>
          <button type="button" class="cart-text-action js-save-variant">Save</button>
          <p class="commerce-inline-error js-cart-variant-error" aria-live="polite"></p>
        </div>
        <button type="button" class="cart-text-action js-save-later">Save for later</button>
      </div>
      <div class="qty-selector" aria-label="Quantity">
        <button class="qty-btn minus" type="button" aria-label="Decrease quantity" ${line.quantity <= 1 ? "disabled" : ""}>−</button>
        <span class="qty-val">${line.quantity}</span>
        <button class="qty-btn plus" type="button" aria-label="Increase quantity" ${variant.inventoryKnown && line.quantity >= variant.stock ? "disabled" : ""}>+</button>
      </div>
      <div class="cart-item-price">${formatVND(line.unitPrice * line.quantity)}</div>
      <button class="btn-remove" type="button" aria-label="Remove ${escapeHtml(product.name)}">×</button>
    </article>`;
}

export async function renderCart() {
  const list = document.querySelector(".js-cart-items-list");
  if (!list) return;
  let products;
  try { products = await loadProducts(); }
  catch {
    renderLoadError(list, { title: "Your Bag could not load.", message: "The catalogue request failed. Your Bag is saved in this tab and nothing was removed.", onRetry: () => { list.innerHTML = '<p class="cart-loading-state" role="status">Loading your Bag…</p>'; renderCart(); } });
    return;
  }
  let currentLines = [];

  const renderRelated = () => {
    const wrap = document.querySelector(".related-products-list");
    if (!wrap) return;
    wrap.innerHTML = products.slice(0, 4).map((product) => `<a class="related-product-item" href="detailproduct.html?id=${encodeURIComponent(product.id)}"><img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}" loading="lazy"><p class="category">${escapeHtml(product.category)}</p><h4>${escapeHtml(product.name)}</h4><p class="price">${formatVND(product.price)}</p></a>`).join("");
  };

  const paint = async () => {
    const lines = await hydrateCart();
    currentLines = lines;
    if (lines.length) {
      list.innerHTML = `${lines.map(lineMarkup).join("")}<a href="shop.html" class="continue-shopping">← Continue Shopping</a>`;
    } else if (!list.querySelector(".cart-empty-state")) {
      list.innerHTML = emptyState();
    }
    bindLines(lines);
    updateSummary(lines);
  };

  const updateSummary = (lines) => {
    const subtotal = cartTotals(lines).subtotal;
    const promo = promoDiscount(subtotal);
    const totals = cartTotals(lines, 0, promo.discount);
    const discountRow = document.querySelector(".js-summary-discount-row");
    if (discountRow) {
      discountRow.hidden = !promo.code || !promo.ok;
      discountRow.querySelector(".js-summary-promo-code").textContent = promo.code || "";
      discountRow.querySelector(".js-summary-discount").textContent = `−${formatVND(promo.discount)}`;
    }
    syncPromo(promo, lines.length);
    document.querySelectorAll(".js-summary-subtotal").forEach((element) => { element.textContent = formatVND(totals.subtotal); });
    document.querySelectorAll(".js-summary-total").forEach((element) => { element.textContent = formatVND(totals.total); });
    const shipping = document.querySelector(".js-cart-delivery");
    if (shipping) shipping.textContent = `Estimated ${getDeliveryWindow(false)}`;
    const checkout = document.querySelector(".btn-checkout");
    checkout?.classList.toggle("is-disabled", !lines.length);
    checkout?.setAttribute("aria-disabled", String(!lines.length));
  };

  const bindLines = (lines) => {
    list.querySelectorAll(".js-cart-item").forEach((item) => {
      const line = lines.find((entry) => entry.id === item.dataset.lineId);
      if (!line) return;
      item.querySelector(".minus").addEventListener("click", () => {
        if (line.quantity <= 1) return;
        updateCartQuantity(line.id, line.quantity - 1);
        paint();
      });
      item.querySelector(".plus").addEventListener("click", () => {
        if (line.variant.inventoryKnown && line.quantity >= line.variant.stock) {
          showMessage("The requested quantity is unavailable for this size.", { assertive: true });
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
      const editButton = item.querySelector(".js-edit-variant");
      const colorSelect = item.querySelector(".js-cart-color");
      const sizeSelect = item.querySelector(".js-cart-size");
      editButton.addEventListener("click", () => {
        const willOpen = editor.hidden;
        editor.hidden = !willOpen;
        editor.style.display = willOpen ? "" : "none";
        editButton.setAttribute("aria-expanded", String(willOpen));
        if (willOpen) colorSelect.focus();
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

  document.querySelector(".btn-checkout")?.addEventListener("click", (event) => {
    if (event.currentTarget.getAttribute("aria-disabled") === "true") event.preventDefault();
  });

  const promoForm = document.querySelector(".js-promo-form");
  const promoStatus = promoForm?.querySelector(".js-promo-status");
  const promoRemove = promoForm?.querySelector(".js-promo-remove");
  function syncPromo(promo, hasLines) {
    if (!promoForm) return;
    promoForm.querySelector("input").disabled = !hasLines;
    promoForm.querySelector(".js-promo-apply").disabled = !hasLines;
    promoRemove.hidden = !promo.code;
    if (promo.code && !promo.ok) promoStatus.textContent = `${promo.message} The code stays saved and will apply when the Bag qualifies.`;
    else if (promo.code && !promoStatus.textContent) promoStatus.textContent = `${promo.code} applied.`;
    promoForm.dataset.state = promo.code ? (promo.ok ? "applied" : "pending") : "empty";
  }
  promoForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = promoForm.querySelector("input");
    const subtotal = cartTotals(currentLines).subtotal;
    input.setAttribute("aria-invalid", "false");
    const result = await runRequest(promoForm.querySelector(".js-promo-apply"), "Checking…", () => applyPromo(input.value, subtotal), { errorElement: promoStatus });
    if (!result) return;
    promoStatus.textContent = result.message;
    promoStatus.dataset.state = result.ok ? "success" : "error";
    input.setAttribute("aria-invalid", String(!result.ok));
    if (result.ok) { input.value = ""; showMessage("Promo code applied."); }
    updateSummary(currentLines);
  });
  promoRemove?.addEventListener("click", () => {
    removePromo();
    promoStatus.textContent = "Promo code removed.";
    promoStatus.dataset.state = "";
    updateSummary(currentLines);
    promoForm.querySelector("input").focus();
  });

  const giftForm = document.querySelector(".js-gift-form");
  if (giftForm) {
    const toggle = giftForm.querySelector(".js-gift-toggle");
    const fields = giftForm.querySelector(".js-gift-fields");
    const message = giftForm.elements.giftMessage;
    const count = giftForm.querySelector(".js-gift-count");
    const giftStatus = giftForm.querySelector(".js-gift-status");
    const note = getGiftNote();
    toggle.checked = note.enabled;
    message.value = note.message;
    const syncGift = () => {
      fields.hidden = !toggle.checked;
      count.textContent = `${message.value.length} / 200`;
    };
    syncGift();
    toggle.addEventListener("change", () => {
      saveGiftNote({ enabled: toggle.checked, message: message.value });
      syncGift();
      giftStatus.textContent = toggle.checked ? "Gift note added. It will be printed without prices." : "Gift note removed.";
      if (toggle.checked) message.focus();
    });
    message.addEventListener("input", () => {
      saveGiftNote({ enabled: toggle.checked, message: message.value });
      syncGift();
      giftStatus.textContent = "Gift note saved with your Bag.";
    });
    giftForm.addEventListener("submit", (event) => event.preventDefault());
  }

  renderRelated();
  await paint();
}
