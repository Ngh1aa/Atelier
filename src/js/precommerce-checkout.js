import {
  cartTotals,
  clearCart,
  clearCheckoutExtras,
  createOrder,
  formatVND,
  getAddresses,
  getCurrentAccount,
  getDeliveryWindow,
  getGiftNote,
  hydrateCart,
  promoDiscount,
  simulateRequest,
  track,
  validateInventory,
} from "./commerce-store.js?v=full-prototype";
import { attemptLocalAction, bindFormValidation, escapeHtml, renderLoadError } from "./commerce-ui.js?v=full-prototype";

const DRAFT_KEY = "atelier.checkout-draft";
const EXPRESS_FEE = 250000;
const ADDRESS_FIELDS = ["fullName", "phone", "address", "apartment", "district", "province", "postalCode"];

function draftStore() {
  try { return window.sessionStorage; } catch { return null; }
}

function readDraft() {
  try { return JSON.parse(draftStore()?.getItem(DRAFT_KEY)) ?? {}; } catch { return {}; }
}

function saveDraft(form) {
  const values = {};
  new FormData(form).forEach((value, key) => { if (key !== "terms") values[key] = value; });
  draftStore()?.setItem(DRAFT_KEY, JSON.stringify(values));
}

function restoreDraft(form) {
  Object.entries(readDraft()).forEach(([name, value]) => {
    if (name === "terms" || name === "country") return;
    form.querySelectorAll(`[name="${CSS.escape(name)}"]`).forEach((field) => {
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

  let lines;
  try {
    lines = await hydrateCart();
  } catch {
    renderLoadError(itemsWrap, {
      title: "Your order could not load.",
      message: "The catalogue request failed. Your Bag and details are kept.",
      onRetry: () => location.reload(),
    });
    form.querySelector(".js-place-order").disabled = true;
    return;
  }
  const submit = form.querySelector(".js-place-order");
  const submitLabel = submit.textContent;
  const error = form.querySelector(".js-checkout-error");
  const validate = bindFormValidation(form);
  const account = getCurrentAccount();
  let submitting = false;
  restoreDraft(form);
  track("begin_checkout", { item_count: lines.length, reality: "local_prototype" });

  const navNote = document.querySelector(".checkout-nav-inner > span");
  if (navNote) navNote.textContent = account ? `Signed in as ${account.email}` : "Guest checkout";

  // Signed-in clients pick from their address book; guests are offered sign-in.
  const addressSlot = form.querySelector(".js-saved-address-slot");
  const addresses = getAddresses();
  const fillAddress = (address) => {
    ADDRESS_FIELDS.forEach((name) => { const field = form.elements.namedItem(name); if (field && address[name] !== undefined) field.value = address[name]; });
  };
  if (addressSlot && account && addresses.length) {
    addressSlot.innerHTML = `<div class="form-group"><label for="checkoutSavedAddress">Saved address</label><select id="checkoutSavedAddress" class="js-saved-address">${addresses.map((address) => `<option value="${escapeHtml(address.id)}">${escapeHtml(`${address.label || "Address"}, ${address.address}, ${address.district}`)}</option>`).join("")}<option value="">Enter a new address</option></select></div>`;
    const select = addressSlot.querySelector("select");
    const initial = addresses.find((address) => address.isDefault) || addresses[0];
    select.value = initial.id;
    if (!readDraft().address) fillAddress(initial);
    select.addEventListener("change", () => {
      const chosen = addresses.find((address) => address.id === select.value);
      if (chosen) fillAddress(chosen);
      else ["address", "apartment", "district", "province", "postalCode"].forEach((name) => { form.elements.namedItem(name).value = ""; });
      updateReview();
      attemptLocalAction(() => saveDraft(form), document.querySelector(".js-draft-status"));
    });
    if (!form.elements.email.value) form.elements.email.value = account.email;
  } else if (addressSlot && !account) {
    addressSlot.innerHTML = '<p class="checkout-signin-note">Have an ATELIER account? <a href="login.html?next=checkout.html">Sign in</a> to use saved addresses.</p>';
  } else if (account && !form.elements.email.value) {
    form.elements.email.value = account.email;
    if (!form.elements.fullName.value) form.elements.fullName.value = account.fullName || "";
    if (!form.elements.phone.value) form.elements.phone.value = account.phone || "";
  }

  const cardSimulation = form.querySelector(".js-card-simulation");
  const giftNote = getGiftNote();

  const renderItems = () => {
    itemsWrap.innerHTML = lines.length ? lines.map((line) => `
      <a class="summary-item" href="detailproduct.html?id=${encodeURIComponent(line.product.id)}">
        <img src="${escapeHtml(line.product.images[0])}" alt="${escapeHtml(line.product.name)}">
        <span class="item-details"><strong class="item-name">${escapeHtml(line.product.name)}</strong><small class="item-variant">${escapeHtml(line.colorName)}, size ${escapeHtml(line.size)}, Qty ${line.quantity}</small></span>
        <span class="item-price">${formatVND(line.unitPrice * line.quantity)}</span>
      </a>`).join("") : `<div class="checkout-empty"><p>Your Bag is empty.</p><a href="shop.html">Explore the collection →</a></div>`;
    submit.disabled = !lines.length;
  };

  const updateReview = () => {
    const data = new FormData(form);
    document.querySelector(".js-review-contact").textContent = data.get("email") || "Add contact details";
    document.querySelector(".js-review-address").textContent = [data.get("fullName"), data.get("address"), data.get("district"), data.get("province")].filter(Boolean).join(", ") || "Add a delivery address";
    document.querySelector(".js-review-delivery").textContent = selectedLabel(form, "deliveryMethod");
    const payment = data.get("paymentMethod");
    document.querySelector(".js-review-payment").textContent = payment === "card-simulated"
      ? `Card (simulated), ${data.get("cardOutcome") === "decline" ? "will be declined" : "will be approved"}`
      : selectedLabel(form, "paymentMethod");
    if (cardSimulation) cardSimulation.hidden = payment !== "card-simulated";
    const giftRow = document.querySelector(".js-review-gift-row");
    if (giftRow) {
      giftRow.hidden = !giftNote.enabled;
      document.querySelector(".js-review-gift").textContent = giftNote.message ? `“${giftNote.message}”` : "Gift packaging, no message";
    }
    document.querySelectorAll(".delivery-option, .payment-option").forEach((label) => label.classList.toggle("selected", Boolean(label.querySelector("input:checked"))));
  };

  const fingerprint = () => JSON.stringify(lines.map((line) => [line.variantId, line.quantity, line.unitPrice]));
  const refreshBag = async () => {
    const before = fingerprint();
    lines = await hydrateCart();
    renderItems();
    updateTotals();
    return before !== fingerprint();
  };

  const updateTotals = () => {
    const express = form.querySelector('[name="deliveryMethod"]:checked')?.value === "express";
    const subtotal = cartTotals(lines).subtotal;
    const promo = promoDiscount(subtotal);
    const totals = cartTotals(lines, express ? EXPRESS_FEE : 0, promo.discount);
    document.querySelector(".js-checkout-subtotal").textContent = formatVND(totals.subtotal);
    document.querySelector(".js-checkout-delivery-fee").textContent = totals.shippingFee ? formatVND(totals.shippingFee) : "Complimentary";
    document.querySelector(".js-checkout-total").textContent = formatVND(totals.total);
    document.querySelector(".js-review-total").textContent = formatVND(totals.total);
    const discountRow = document.querySelector(".js-checkout-discount-row");
    if (discountRow) {
      discountRow.hidden = !promo.discount;
      discountRow.querySelector(".js-checkout-promo-code").textContent = promo.code || "";
      discountRow.querySelector(".js-checkout-discount").textContent = `−${formatVND(promo.discount)}`;
    }
    form.dataset.subtotal = String(totals.subtotal);
    form.dataset.shippingFee = String(totals.shippingFee);
    form.dataset.discount = String(promo.discount);
    form.dataset.promoCode = promo.discount ? promo.code : "";
    form.dataset.total = String(totals.total);
    document.querySelector(".js-standard-window").textContent = `Estimated ${getDeliveryWindow(false)}`;
    document.querySelector(".js-express-window").textContent = `Estimated ${getDeliveryWindow(true)}`;
    updateReview();
  };

  form.addEventListener("input", () => {
    attemptLocalAction(() => saveDraft(form), document.querySelector(".js-draft-status"));
    updateReview();
  });
  form.querySelector(".js-use-client-details")?.remove();
  form.querySelectorAll('[name="deliveryMethod"]').forEach((input) => input.addEventListener("change", () => {
    updateTotals();
    track("add_shipping_info", { shipping_tier: input.value, reality: "local_prototype" });
  }));
  form.querySelectorAll('[name="paymentMethod"], [name="cardOutcome"]').forEach((input) => input.addEventListener("change", () => {
    updateReview();
    error.textContent = "";
    track("add_payment_info", { payment_type: form.querySelector('[name="paymentMethod"]:checked')?.value, reality: "local_prototype" });
  }));

  const placeOrder = async () => {
    const data = new FormData(form);
    const paymentMethod = data.get("paymentMethod");
    // Simulated order service: latency, optional failure from the demo controls,
    // and a simulated card decline. No card data exists anywhere in this flow.
    return simulateRequest(() => {
      if (paymentMethod === "card-simulated" && data.get("cardOutcome") === "decline") {
        return { ok: false, declined: true };
      }
      const order = createOrder({
        customer: { email: data.get("email"), phone: data.get("phone"), fullName: data.get("fullName") },
        address: { country: data.get("country"), address: data.get("address"), apartment: data.get("apartment"), district: data.get("district"), province: data.get("province"), postalCode: data.get("postalCode") },
        deliveryMethod: data.get("deliveryMethod"),
        deliveryEstimate: getDeliveryWindow(data.get("deliveryMethod") === "express"),
        paymentMethod,
        items: lines.map((line) => ({ productId: line.productId, variantId: line.variantId, name: line.product.name, image: line.product.images[0], color: line.colorName, colorValue: line.color, size: line.size, quantity: line.quantity, unitPrice: line.unitPrice })),
        subtotal: Number(form.dataset.subtotal),
        shippingFee: Number(form.dataset.shippingFee),
        discount: Number(form.dataset.discount),
        promoCode: form.dataset.promoCode || "",
        giftNote: giftNote.enabled ? (giftNote.message || "Gift packaging") : "",
        total: Number(form.dataset.total),
      });
      return { ok: true, order };
    }, { latency: 700 });
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submitting) return;
    error.textContent = "";
    if (!validate()) { error.textContent = "Check the highlighted fields before continuing."; return; }
    submitting = true;
    submit.disabled = true;
    submit.textContent = "Placing order…";
    form.setAttribute("aria-busy", "true");
    let redirecting = false;

    try {
      const changed = await refreshBag();
      submit.disabled = true;
      if (!lines.length) { error.textContent = "Your Bag is empty. Return to the collection to choose a piece."; return; }
      const inventory = validateInventory(lines);
      if (!inventory.ok) { error.textContent = inventory.message; error.focus(); return; }
      if (changed) {
        form.elements.terms.checked = false;
        error.textContent = "Your Bag changed. Review the updated items and total, then acknowledge the terms again.";
        error.focus(); return;
      }
      const result = await placeOrder();
      if (!result.ok) {
        error.textContent = "The card was declined. Nothing was charged. Choose another payment method or try again.";
        error.focus();
        return;
      }
      redirecting = true;
      clearCart();
      clearCheckoutExtras();
      draftStore()?.removeItem(DRAFT_KEY);
      window.location.href = `order-success.html?id=${encodeURIComponent(result.order.id)}`;
    } catch {
      error.innerHTML = 'We couldn’t place your order just now. Your details and Bag are kept. <button type="button" class="text-action js-checkout-retry">Try again</button>';
      error.querySelector(".js-checkout-retry").addEventListener("click", () => form.requestSubmit());
      error.focus();
    } finally {
      submitting = false;
      if (!redirecting) {
        submit.disabled = !lines.length;
        submit.textContent = submitLabel;
        form.removeAttribute("aria-busy");
      }
    }
  });

  renderItems();
  updateTotals();
}
