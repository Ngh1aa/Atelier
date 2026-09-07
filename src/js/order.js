import { formatVND, getOrder, loadProducts, saveOrderServiceRequest, track, updateOrder } from "./commerce-store.js?v=white-editorial-v6";
import { attemptLocalAction, downloadText, escapeHtml, showMessage } from "./commerce-ui.js?v=white-editorial-v6";

function setHidden(element, hidden) {
  if (!element) return;
  element.hidden = hidden;
  element.style.display = hidden ? "none" : "";
}

export async function renderOrder() {
  const root = document.querySelector(".js-order-page");
  if (!root) return;

  const id = new URLSearchParams(location.search).get("id");
  let order = getOrder(id);
  if (!order) {
    root.innerHTML = `<div class="order-not-found"><p class="eyebrow">LOCAL ORDER</p><h1>Order not found.</h1><p>This order is not available in the current browser storage.</p><a class="btn-outline" href="account.html">View orders on this device →</a></div>`;
    return;
  }

  const products = await loadProducts();

  const paint = () => {
    const created = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(order.createdAt));
    root.innerHTML = `
      <header class="order-page-header">
        <div><p class="eyebrow">LOCAL ORDER / SIMULATED</p><h1>${escapeHtml(order.id)}</h1></div>
        <div><span>${created}</span><strong>${formatVND(order.total)}</strong></div>
      </header>
      <nav class="order-tools" aria-label="Order actions"><a class="text-link" href="account.html">← All orders</a><button type="button" class="text-action js-order-download">Download order notes ↓</button><a class="text-link" href="contact.html?topic=delivery&amp;order=${encodeURIComponent(order.id)}">Prepare an enquiry →</a></nav>

      <div class="order-page-grid">
        <section class="order-status-panel">
          <h2>LOCAL ORDER STATUS</h2>
          <div class="order-detail-row"><span>Status</span><strong>Recorded on this device</strong></div>
          <p>ATELIER has not connected this static prototype to live fulfilment or carrier tracking. No shipment status will update automatically.</p>
        </section>
        <section class="order-details-panel">
          <div class="order-detail-row"><span>Estimate</span><strong>${escapeHtml(order.deliveryEstimate)}</strong></div>
          <div class="order-detail-row"><span>Deliver to</span><strong>${escapeHtml(order.customer?.fullName)}</strong></div>
          <div class="order-detail-row"><span>Address</span><strong>${escapeHtml([order.address?.address, order.address?.apartment, order.address?.district, order.address?.province, order.address?.postalCode].filter(Boolean).join(", "))}</strong></div>
          <div class="order-detail-row"><span>Payment</span><strong>${order.paymentMethod === "cod" ? "Cash on delivery · local record" : "Bank transfer · local record"}</strong></div>
          <div class="order-detail-row"><span>Subtotal</span><strong>${formatVND(order.subtotal)}</strong></div>
          <div class="order-detail-row"><span>Delivery</span><strong>${order.shippingFee ? formatVND(order.shippingFee) : "Complimentary"}</strong></div>
          <div class="order-detail-row"><span>Total</span><strong>${formatVND(order.total)}</strong></div>
        </section>
      </div>

      <section class="order-items-section">
        <h2>PIECES</h2>
        ${(order.items || []).map((item, index) => `<article class="order-item"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}"><div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.color)} · Size ${escapeHtml(item.size)} · Qty ${item.quantity}</p><strong>${formatVND(item.unitPrice * item.quantity)}</strong></div><button type="button" class="cart-text-action js-service-open" data-item-index="${index}">Save return / exchange intent</button></article>`).join("")}
      </section>

      <section class="order-service-panel js-order-service-panel" hidden style="display:none">
        <div class="order-service-head"><h2>LOCAL SERVICE REQUEST</h2><button type="button" class="js-service-close" aria-label="Close">×</button></div>
        <p class="js-service-piece"></p><p>Save a note for this piece on your device. It is not sent to Client Services. <a class="text-link" href="shipping&amp;returns.html">Review return conditions →</a></p>
        <form class="js-service-form">
          <input type="hidden" name="itemIndex">
          <label>Request<select name="action"><option value="exchange">Exchange size</option><option value="return">Return</option></select></label>
          <label>Reason<select name="reason"><option value="wrong-size">Wrong size</option><option value="changed-mind">Changed my mind</option><option value="quality">Quality concern</option></select></label>
          <label class="js-exchange-size">New size<select name="newSize"></select></label>
          <p class="commerce-inline-error js-service-error" aria-live="polite"></p>
          <button type="submit" class="commerce-primary-action">Save on This Device</button>
        </form>
      </section>

      ${order.serviceRequests?.length ? `<section class="order-requests"><h2>LOCAL SERVICE NOTES</h2>${order.serviceRequests.map((request) => `<article><span class="status-label">${escapeHtml(request.action.toUpperCase())}</span><strong>${escapeHtml(request.itemName)}</strong><p>${request.action === "exchange" ? `Size ${escapeHtml(request.fromSize)} → ${escapeHtml(request.newSize)}` : "Return intent"} · Saved locally</p><button type="button" class="text-action js-remove-service" data-request-id="${escapeHtml(request.id)}" aria-label="Remove ${escapeHtml(request.action)} note for ${escapeHtml(request.itemName)}">Remove note</button></article>`).join("")}</section>` : ""}`;
    bind();
  };

  const bind = () => {
    const panel = root.querySelector(".js-order-service-panel");
    const form = root.querySelector(".js-service-form");
    if (!panel || !form) return;
    let serviceTrigger;
    root.querySelector(".js-order-download").addEventListener("click", () => {
      downloadText(`${order.id}-notes.txt`, `ATELIER — Local order notes\n${order.id}\nRecorded: ${order.createdAt}\nNo payment or fulfilment has been processed.\n\n${order.items.map((item) => `${item.name} / ${item.color} / ${item.size} / Qty ${item.quantity} / ${formatVND(item.unitPrice * item.quantity)}`).join("\n")}\n\nSubtotal: ${formatVND(order.subtotal)}\nDelivery: ${formatVND(order.shippingFee)}\nTotal: ${formatVND(order.total)}\n\n${(order.serviceRequests || []).map((request) => `${request.action}: ${request.itemName}${request.newSize ? ` / ${request.fromSize} to ${request.newSize}` : ""} / saved locally`).join("\n")}`);
    });
    root.querySelectorAll(".js-remove-service").forEach((button) => button.addEventListener("click", () => {
      const current = getOrder(order.id);
      const saved = attemptLocalAction(() => updateOrder(order.id, { serviceRequests: (current?.serviceRequests || []).filter((request) => request.id !== button.dataset.requestId) }));
      if (!saved) return;
      order = saved; paint(); showMessage("Local service note removed.");
      root.querySelector(".js-service-open")?.focus();
    }));

    root.querySelectorAll(".js-service-open").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.itemIndex);
      const item = order.items[index];
      const product = products.find((entry) => entry.id === item.productId);
      serviceTrigger = button;
      form.reset();
      root.querySelector(".js-service-error").textContent = "";
      root.querySelector(".js-service-piece").textContent = `${item.name} · ${item.color} · Size ${item.size}`;
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

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const item = order.items[Number(data.get("itemIndex"))];
      if (data.get("action") === "exchange" && !data.get("newSize")) {
        root.querySelector(".js-service-error").textContent = "Choose a replacement size.";
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
        status: "saved-local",
        createdAt: new Date().toISOString(),
      };
      const result = attemptLocalAction(() => saveOrderServiceRequest(order.id, request), root.querySelector(".js-service-error"));
      if (!result) return;
      if (!result.ok) { root.querySelector(".js-service-error").textContent = result.message; return; }
      order = result.order;
      track(data.get("action") === "exchange" ? "exchange_requested" : "return_requested", { order_id: order.id, product_id: item.productId, reality: "local_prototype" });
      showMessage("Request saved on this device.");
      paint();
      root.querySelector(".js-remove-service:last-child")?.focus();
    });
  };

  paint();
}
