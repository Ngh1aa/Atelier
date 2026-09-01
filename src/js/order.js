import { formatVND, getOrder, loadProducts, track, updateOrder } from "./commerce-store.js?v=white-editorial-v6";
import { escapeHtml, showMessage } from "./commerce-ui.js?v=white-editorial-v6";

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

      <div class="order-page-grid">
        <section class="order-status-panel">
          <h2>LOCAL ORDER STATUS</h2>
          <div class="order-detail-row"><span>Status</span><strong>Recorded on this device</strong></div>
          <p>ATELIER has not connected this static prototype to live fulfilment or carrier tracking. No shipment status will update automatically.</p>
        </section>
        <section class="order-details-panel">
          <div class="order-detail-row"><span>Estimate</span><strong>${escapeHtml(order.deliveryEstimate)}</strong></div>
          <div class="order-detail-row"><span>Address</span><strong>${escapeHtml([order.address?.address, order.address?.district, order.address?.province].filter(Boolean).join(", "))}</strong></div>
          <div class="order-detail-row"><span>Payment</span><strong>${order.paymentMethod === "cod" ? "Cash on delivery · local record" : "Bank transfer · local record"}</strong></div>
        </section>
      </div>

      <section class="order-items-section">
        <h2>PIECES</h2>
        ${(order.items || []).map((item, index) => `<article class="order-item"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}"><div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.color)} · Size ${escapeHtml(item.size)} · Qty ${item.quantity}</p><strong>${formatVND(item.unitPrice * item.quantity)}</strong></div><button type="button" class="cart-text-action js-service-open" data-item-index="${index}">Save return / exchange intent</button></article>`).join("")}
      </section>

      <section class="order-service-panel js-order-service-panel" hidden style="display:none">
        <div class="order-service-head"><h2>LOCAL SERVICE REQUEST</h2><button type="button" class="js-service-close" aria-label="Close">×</button></div>
        <p>This demonstration stores the request in this browser only. It is not sent to Client Services.</p>
        <form class="js-service-form">
          <input type="hidden" name="itemIndex">
          <label>Request<select name="action"><option value="exchange">Exchange size</option><option value="return">Return</option></select></label>
          <label>Reason<select name="reason"><option value="wrong-size">Wrong size</option><option value="changed-mind">Changed my mind</option><option value="quality">Quality concern</option></select></label>
          <label class="js-exchange-size">New size<select name="newSize"></select></label>
          <p class="commerce-inline-error js-service-error" aria-live="polite"></p>
          <button type="submit" class="commerce-primary-action">Save on This Device</button>
        </form>
      </section>

      ${order.serviceRequests?.length ? `<section class="order-requests"><h2>LOCAL SERVICE NOTES</h2>${order.serviceRequests.map((request) => `<article><span>${escapeHtml(request.action.toUpperCase())}</span><strong>${escapeHtml(request.itemName)}</strong><p>${request.action === "exchange" ? `Size ${escapeHtml(request.fromSize)} → ${escapeHtml(request.newSize)}` : "Return intent"} · Saved locally</p></article>`).join("")}</section>` : ""}`;
    bind();
  };

  const bind = () => {
    const panel = root.querySelector(".js-order-service-panel");
    const form = root.querySelector(".js-service-form");
    if (!panel || !form) return;

    root.querySelectorAll(".js-service-open").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.itemIndex);
      const item = order.items[index];
      const product = products.find((entry) => entry.id === item.productId);
      form.elements.itemIndex.value = String(index);
      form.elements.newSize.innerHTML = (product?.sizes || [])
        .filter((size) => size !== item.size)
        .map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`)
        .join("");
      setHidden(panel, false);
      panel.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      form.elements.action.focus();
    }));

    root.querySelector(".js-service-close")?.addEventListener("click", () => { setHidden(panel, true); });
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
      order = updateOrder(order.id, { serviceRequests: [...(order.serviceRequests || []), request] });
      track(data.get("action") === "exchange" ? "exchange_requested" : "return_requested", { order_id: order.id, product_id: item.productId, reality: "local_prototype" });
      showMessage("Request saved on this device.");
      paint();
    });
  };

  paint();
}
