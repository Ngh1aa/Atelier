import {
  cartTotals,
  clearCart,
  createOrder,
  formatVND,
  getDeliveryWindow,
  hydrateCart,
  track,
  validateInventory,
} from "./commerce-store.js?v=white-editorial-v6";
import { escapeHtml } from "./commerce-ui.js?v=white-editorial-v6";

const DRAFT_KEY = "atelier.checkout-draft";
const PROMO_KEY = "atelier.promo";
const EXPRESS_FEE = 250000;

function readJson(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

function saveDraft(form) {
  const values = {};
  new FormData(form).forEach((value, key) => { values[key] = value; });
  localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
}

function restoreDraft(form) {
  const draft = readJson(DRAFT_KEY, {});
  Object.entries(draft).forEach(([name, value]) => {
    const fields = form.querySelectorAll(`[name="${CSS.escape(name)}"]`);
    fields.forEach((field) => {
      if (field.type === "radio" || field.type === "checkbox") field.checked = field.value === value;
      else field.value = value;
    });
  });
}

function selectedLabel(form, name) {
  return form.querySelector(`[name="${name}"]:checked`)?.closest("label")?.querySelector("strong")?.textContent.trim() || "—";
}

export async function initPrecommerceCheckout() {
  const form = document.querySelector(".js-checkout-form");
  const itemsWrap = document.querySelector(".js-checkout-items");
  if (!form || !itemsWrap) return;

  localStorage.removeItem(PROMO_KEY);
  let lines = await hydrateCart();
  const submit = form.querySelector(".js-place-order");
  const error = form.querySelector(".js-checkout-error");
  restoreDraft(form);
  track("begin_checkout", { item_count: lines.length, reality: "local_prototype" });

  const renderItems = () => {
    itemsWrap.innerHTML = lines.length ? lines.map((line) => `
      <a class="summary-item" href="detailproduct.html?id=${encodeURIComponent(line.product.id)}">
        <img src="${escapeHtml(line.product.images[0])}" alt="${escapeHtml(line.product.name)}">
        <span class="item-details"><strong class="item-name">${escapeHtml(line.product.name)}</strong><small class="item-variant">${escapeHtml(line.colorName)} · Size ${escapeHtml(line.size)} · Qty ${line.quantity}</small></span>
        <span class="item-price">${formatVND(line.unitPrice * line.quantity)}</span>
      </a>`).join("") : `<div class="checkout-empty"><p>Your Bag is empty.</p><a href="shop.html">Explore the collection →</a></div>`;
    submit.disabled = !lines.length;
  };

  const updateReview = () => {
    const data = new FormData(form);
    document.querySelector(".js-review-contact").textContent = data.get("email") || "Add contact details";
    document.querySelector(".js-review-address").textContent = [data.get("fullName"), data.get("address"), data.get("district"), data.get("province")].filter(Boolean).join(", ") || "Add a delivery address";
    document.querySelector(".js-review-delivery").textContent = selectedLabel(form, "deliveryMethod");
    document.querySelector(".js-review-payment").textContent = selectedLabel(form, "paymentMethod");
    document.querySelectorAll(".delivery-option, .payment-option").forEach((label) => label.classList.toggle("selected", Boolean(label.querySelector("input:checked"))));
  };

  const updateTotals = () => {
    const express = form.querySelector('[name="deliveryMethod"]:checked')?.value === "express";
    const totals = cartTotals(lines, express ? EXPRESS_FEE : 0, 0);
    document.querySelector(".js-checkout-subtotal").textContent = formatVND(totals.subtotal);
    document.querySelector(".js-checkout-delivery-fee").textContent = totals.shippingFee ? formatVND(totals.shippingFee) : "Complimentary";
    document.querySelector(".js-checkout-total").textContent = formatVND(totals.total);
    const discountRow = document.querySelector(".js-checkout-discount-row");
    if (discountRow) discountRow.hidden = true;
    form.dataset.subtotal = String(totals.subtotal);
    form.dataset.shippingFee = String(totals.shippingFee);
    form.dataset.discount = "0";
    form.dataset.total = String(totals.total);
    document.querySelector(".js-standard-window").textContent = `Estimated ${getDeliveryWindow(false)}`;
    document.querySelector(".js-express-window").textContent = `Estimated ${getDeliveryWindow(true)}`;
    updateReview();
  };

  form.addEventListener("input", () => {
    saveDraft(form);
    updateReview();
  });
  form.querySelectorAll('[name="deliveryMethod"]').forEach((input) => input.addEventListener("change", () => {
    updateTotals();
    track("add_shipping_info", { shipping_tier: input.value, reality: "local_prototype" });
  }));
  form.querySelectorAll('[name="paymentMethod"]').forEach((input) => input.addEventListener("change", () => {
    updateReview();
    track("add_payment_info", { payment_type: input.value, reality: "local_prototype" });
  }));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = "";
    if (!form.reportValidity()) return;

    lines = await hydrateCart();
    const inventory = validateInventory(lines);
    if (!inventory.ok) {
      error.textContent = inventory.message;
      error.focus();
      return;
    }
    if (!lines.length) {
      error.textContent = "Your Bag is empty.";
      return;
    }

    submit.disabled = true;
    submit.textContent = "Recording…";
    form.setAttribute("aria-busy", "true");

    try {
      const data = new FormData(form);
      const order = createOrder({
        customer: { email: data.get("email"), phone: data.get("phone"), fullName: data.get("fullName") },
        address: { country: data.get("country"), address: data.get("address"), apartment: data.get("apartment"), district: data.get("district"), province: data.get("province"), postalCode: data.get("postalCode") },
        deliveryMethod: data.get("deliveryMethod"),
        deliveryEstimate: getDeliveryWindow(data.get("deliveryMethod") === "express"),
        paymentMethod: data.get("paymentMethod"),
        items: lines.map((line) => ({ productId: line.productId, variantId: line.variantId, name: line.product.name, image: line.product.images[0], color: line.colorName, size: line.size, quantity: line.quantity, unitPrice: line.unitPrice })),
        subtotal: Number(form.dataset.subtotal),
        shippingFee: Number(form.dataset.shippingFee),
        discount: 0,
        total: Number(form.dataset.total),
      });
      clearCart();
      localStorage.removeItem(DRAFT_KEY);
      window.location.href = `order-success.html?id=${encodeURIComponent(order.id)}`;
    } catch {
      error.textContent = "The local order could not be recorded. Your details and Bag have been preserved; please try again.";
      submit.disabled = false;
      submit.textContent = "Record Order on This Device";
      form.removeAttribute("aria-busy");
    }
  });

  renderItems();
  updateTotals();
}
