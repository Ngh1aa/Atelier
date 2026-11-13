import {
  cancelOrder,
  canCancelOrder,
  canRequestReturn,
  formatVND,
  getOrder,
  loadProducts,
  ORDER_STATUS_LABELS,
  submitServiceRequest,
  track,
  updateOrder,
} from "./commerce-store.js?v=full-prototype";
import { attemptLocalAction, downloadText, escapeHtml, runRequest, showMessage } from "./commerce-ui.js?v=full-prototype";

function setHidden(element, hidden) {
  if (!element) return;
  element.hidden = hidden;
  element.style.display = hidden ? "none" : "";
}

const PAYMENT_LABELS = {
  cod: "Cash on delivery, demo",
  "bank-transfer": "Bank transfer, demo",
  "card-simulated": "Card, simulated approval",
};

const formatDate = (value, withTime = false) => new Intl.DateTimeFormat("en-GB", withTime
  ? { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }
  : { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));

export async function renderOrder() {
  const root = document.querySelector(".js-order-page");
  if (!root) return;

  const id = new URLSearchParams(location.search).get("id");
  let order = id ? getOrder(id) : null;
  if (!order) {
    root.innerHTML = `<div class="order-not-found"><p class="eyebrow">DEMO ORDER</p><h1>Order not found.</h1><p>${id ? `No order ${escapeHtml(id)} exists in this tab. It may have been placed in another tab, or the demo data was reset.` : "Open an order from your order history, or look one up by number and email."}</p><div class="success-actions"><a class="commerce-primary-action" href="forgot-password.html#order-lookup">Find an order</a><a class="commerce-secondary-action" href="account.html#orders">Order history</a></div></div>`;
    return;
  }

  let products = [];
  try { products = await loadProducts(); } catch { products = []; }

  const paint = () => {
    const status = order.status || "processing";
    const timeline = order.timeline?.length ? order.timeline : [{ status, at: order.createdAt }];
    root.innerHTML = `
      <header class="order-page-header">
        <div><p class="eyebrow">DEMO ORDER / NOTHING CHARGED</p><h1>${escapeHtml(order.id)}</h1></div>
        <div><span>${formatDate(order.createdAt)}</span><strong>${formatVND(order.total)}</strong></div>
      </header>
      <nav class="order-tools" aria-label="Order actions"><a class="text-link" href="account.html#orders">← Order history</a><button type="button" class="text-action js-order-download">Download order summary ↓</button><a class="text-link" href="contact.html?topic=delivery&amp;order=${encodeURIComponent(order.id)}">Ask about this order →</a></nav>

      <div class="order-page-grid">
        <section class="order-status-panel" aria-labelledby="order-status-title">
          <h2 id="order-status-title">STATUS</h2>
          <div class="order-detail-row"><span>Current</span><strong class="status-label js-order-status" data-status="${escapeHtml(status)}">${escapeHtml(ORDER_STATUS_LABELS[status] || status)}</strong></div>
          <ol class="order-timeline">${timeline.map((step) => `<li><strong>${escapeHtml(ORDER_STATUS_LABELS[step.status] || step.status)}</strong><span>${formatDate(step.at, true)}</span></li>`).join("")}</ol>
          <p>Demo store: statuses are seeded or changed by your actions here. No carrier or warehouse is connected.</p>
          ${canCancelOrder(order) ? `<div class="order-cancel js-order-cancel">
            <button type="button" class="btn-outline js-cancel-open">Cancel order</button>
            <form class="order-cancel-form js-cancel-form" hidden novalidate>
              <div class="form-group"><label for="cancelReason">Reason</label><select id="cancelReason" name="reason"><option value="changed-mind">I changed my mind</option><option value="wrong-item">I ordered the wrong size or colour</option><option value="delivery-time">Delivery takes too long</option><option value="other">Another reason</option></select></div>
              <p class="commerce-inline-error js-cancel-error" role="alert"></p>
              <div class="form-actions"><button type="submit" class="commerce-primary-action js-cancel-confirm">Confirm cancellation</button><button type="button" class="text-action js-cancel-keep">Keep order</button></div>
            </form>
          </div>` : ""}
        </section>
        <section class="order-details-panel" aria-label="Order details">
          <div class="order-detail-row"><span>Estimate</span><strong>${escapeHtml(order.deliveryEstimate)}</strong></div>
          <div class="order-detail-row"><span>Deliver to</span><strong>${escapeHtml(order.customer?.fullName)}</strong></div>
          <div class="order-detail-row"><span>Address</span><strong>${escapeHtml([order.address?.address, order.address?.apartment, order.address?.district, order.address?.province, order.address?.postalCode].filter(Boolean).join(", "))}</strong></div>
          <div class="order-detail-row"><span>Payment</span><strong>${escapeHtml(PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod)}</strong></div>
          ${order.giftNote ? `<div class="order-detail-row"><span>Gift note</span><strong>${escapeHtml(order.giftNote)}</strong></div>` : ""}
          <div class="order-detail-row"><span>Subtotal</span><strong>${formatVND(order.subtotal)}</strong></div>
          ${order.discount ? `<div class="order-detail-row"><span>Promo ${escapeHtml(order.promoCode || "")}</span><strong>−${formatVND(order.discount)}</strong></div>` : ""}
          <div class="order-detail-row"><span>Delivery</span><strong>${order.shippingFee ? formatVND(order.shippingFee) : "Complimentary"}</strong></div>
          <div class="order-detail-row"><span>Total</span><strong>${formatVND(order.total)}</strong></div>
        </section>
      </div>

      <section class="order-items-section" aria-labelledby="order-pieces-title">
        <h2 id="order-pieces-title">PIECES</h2>
        ${(order.items || []).map((item, index) => `<article class="order-item"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}"><div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.color)}, size ${escapeHtml(item.size)}, Qty ${item.quantity}</p><strong>${formatVND(item.unitPrice * item.quantity)}</strong></div>${canRequestReturn(order) ? `<button type="button" class="cart-text-action js-service-open" data-item-index="${index}">Return or exchange</button>` : ""}</article>`).join("")}
        ${status === "processing" ? '<p class="order-items-note">Returns and exchanges open once an order is delivered. While it is processing, you can cancel it instead.</p>' : ""}
        ${status === "cancelled" ? '<p class="order-items-note">This order was cancelled. Nothing was charged and the pieces are back in stock.</p>' : ""}
      </section>

      <section class="order-service-panel js-order-service-panel" hidden style="display:none" aria-labelledby="order-service-title">
        <div class="order-service-head"><h2 id="order-service-title">RETURN OR EXCHANGE</h2><button type="button" class="js-service-close" aria-label="Close">×</button></div>
        <p class="js-service-piece"></p><p>Within 14 days of delivery. In this demo the request is saved in this tab; no courier is booked. <a class="text-link" href="shipping&amp;returns.html">Return conditions →</a></p>
        <form class="js-service-form" novalidate>
          <input type="hidden" name="itemIndex">
          <label>Request<select name="action"><option value="exchange">Exchange size</option><option value="return">Return for a refund</option></select></label>
          <label>Reason<select name="reason"><option value="wrong-size">Wrong size</option><option value="changed-mind">Changed my mind</option><option value="quality">Quality concern</option></select></label>
          <label class="js-exchange-size">New size<select name="newSize"></select></label>
          <p class="commerce-inline-error js-service-error" role="alert"></p>
          <button type="submit" class="commerce-primary-action js-service-submit">Submit request</button>
        </form>
      </section>

      ${order.serviceRequests?.length ? `<section class="order-requests" aria-labelledby="order-requests-title"><h2 id="order-requests-title">REQUESTS</h2>${order.serviceRequests.map((request) => `<article><span class="status-label">${escapeHtml(request.action.toUpperCase())}</span><strong>${escapeHtml(request.itemName)}</strong><p>${request.action === "exchange" ? `Size ${escapeHtml(request.fromSize)} → ${escapeHtml(request.newSize)}` : "Return for a refund"}, requested ${formatDate(request.createdAt, true)}</p><button type="button" class="text-action js-remove-service" data-request-id="${escapeHtml(request.id)}" aria-label="Withdraw ${escapeHtml(request.action)} request for ${escapeHtml(request.itemName)}">Withdraw request</button></article>`).join("")}</section>` : ""}`;
    bind();
  };

  const bind = () => {
    root.querySelector(".js-order-download").addEventListener("click", () => {
      downloadText(`${order.id}-summary.txt`, `ATELIER — Demo order summary\n${order.id}\nPlaced: ${order.createdAt}\nStatus: ${ORDER_STATUS_LABELS[order.status] || order.status}\nDemo store: no payment was taken and nothing will be shipped.\n\n${order.items.map((item) => `${item.name} / ${item.color} / ${item.size} / Qty ${item.quantity} / ${formatVND(item.unitPrice * item.quantity)}`).join("\n")}\n\nSubtotal: ${formatVND(order.subtotal)}\nDiscount: ${formatVND(order.discount || 0)}\nDelivery: ${formatVND(order.shippingFee)}\nTotal: ${formatVND(order.total)}\n\n${(order.serviceRequests || []).map((request) => `${request.action}: ${request.itemName}${request.newSize ? ` / ${request.fromSize} to ${request.newSize}` : ""}`).join("\n")}`);
    });

    const cancelForm = root.querySelector(".js-cancel-form");
    if (cancelForm) {
      const openButton = root.querySelector(".js-cancel-open");
      openButton.addEventListener("click", () => {
        cancelForm.hidden = false;
        openButton.hidden = true;
        cancelForm.elements.reason.focus();
      });
      root.querySelector(".js-cancel-keep").addEventListener("click", () => {
        cancelForm.hidden = true;
        openButton.hidden = false;
        openButton.focus();
      });
      cancelForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const errorElement = cancelForm.querySelector(".js-cancel-error");
        const result = await runRequest(cancelForm.querySelector(".js-cancel-confirm"), "Cancelling…", () => cancelOrder(order.id, cancelForm.elements.reason.value), { errorElement });
        if (!result) return;
        if (!result.ok) { errorElement.textContent = result.message; return; }
        order = result.order;
        paint();
        showMessage("Order cancelled. Nothing was charged.");
        root.querySelector(".js-order-status")?.focus?.();
      });
    }

    const panel = root.querySelector(".js-order-service-panel");
    const form = root.querySelector(".js-service-form");
    let serviceTrigger;
    root.querySelectorAll(".js-remove-service").forEach((button) => button.addEventListener("click", () => {
      const current = getOrder(order.id);
      const remaining = (current?.serviceRequests || []).filter((request) => request.id !== button.dataset.requestId);
      const saved = attemptLocalAction(() => updateOrder(order.id, {
        serviceRequests: remaining,
        ...(current.status === "return-requested" && !remaining.length ? { status: "delivered" } : {}),
      }));
      if (!saved) return;
      order = saved; paint(); showMessage("Request withdrawn.");
      root.querySelector(".js-service-open")?.focus();
    }));

    root.querySelectorAll(".js-service-open").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.itemIndex);
      const item = order.items[index];
      const product = products.find((entry) => entry.id === item.productId);
      serviceTrigger = button;
      form.reset();
      root.querySelector(".js-service-error").textContent = "";
      root.querySelector(".js-service-piece").textContent = `${item.name}, ${item.color}, size ${item.size}`;
      setHidden(root.querySelector(".js-exchange-size"), false);
      form.elements.itemIndex.value = String(index);
      form.elements.newSize.innerHTML = (product?.sizes || [])
        .filter((size) => size !== item.size && product.variants.some((variant) => variant.size === size && variant.colorName === item.color && variant.stock > 0))
        .map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`)
        .join("");
      setHidden(panel, false);
      panel.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      form.elements.action.focus();
    }));

    root.querySelector(".js-service-close")?.addEventListener("click", () => { setHidden(panel, true); serviceTrigger?.focus(); });
    form.elements.action.addEventListener("change", () => {
      setHidden(root.querySelector(".js-exchange-size"), form.elements.action.value !== "exchange");
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const item = order.items[Number(data.get("itemIndex"))];
      const errorElement = root.querySelector(".js-service-error");
      if (data.get("action") === "exchange" && !data.get("newSize")) {
        errorElement.textContent = "No other size is in stock for an exchange. Choose a return instead.";
        return;
      }
      const request = {
        id: `SR-${Date.now()}`,
        reality: "SIMULATED_LOCAL",
        action: data.get("action"),
        reason: data.get("reason"),
        itemIndex: Number(data.get("itemIndex")),
        itemName: item.name,
        fromSize: item.size,
        newSize: data.get("action") === "exchange" ? data.get("newSize") : null,
        status: "requested",
        createdAt: new Date().toISOString(),
      };
      const result = await runRequest(form.querySelector(".js-service-submit"), "Submitting…", () => submitServiceRequest(order.id, request), { errorElement });
      if (!result) return;
      if (!result.ok) { errorElement.textContent = result.message; return; }
      order = result.order;
      track(data.get("action") === "exchange" ? "exchange_requested" : "return_requested", { order_id: order.id, product_id: item.productId, reality: "local_prototype" });
      showMessage("Request submitted (demo).");
      paint();
      root.querySelector(".js-remove-service")?.focus();
    });
  };

  paint();
}
