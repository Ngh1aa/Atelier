import { formatVND, getOrder, loadProducts, track, updateOrder } from "./commerce-store.js?v=ecommerce-2";
import { escapeHtml, showMessage } from "./commerce-ui.js?v=ecommerce-2";

const STATUS_ORDER = ["placed", "processing", "shipped", "out-for-delivery", "delivered"];

function timeline(order) {
  const current = order.fulfillmentStatus === "processing" ? 1 : Math.max(0, STATUS_ORDER.indexOf(order.fulfillmentStatus));
  const labels = { placed: "Order placed", processing: "Processing", shipped: "Shipped", "out-for-delivery": "Out for delivery", delivered: "Delivered" };
  return STATUS_ORDER.map((status, index) => `<li class="${index <= current ? "is-complete" : ""}"><i></i><span>${labels[status]}</span></li>`).join("");
}

export async function renderOrder() {
  const root = document.querySelector(".js-order-page");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  let order = getOrder(id);
  if (!order) {
    root.innerHTML = `<div class="order-not-found"><p class="eyebrow">ORDER</p><h1>Order not found.</h1><a class="btn-outline" href="account.html">View orders →</a></div>`;
    return;
  }
  const products = await loadProducts();

  const paint = () => {
    root.innerHTML = `
      <header class="order-page-header"><div><p class="eyebrow">YOUR ORDER</p><h1>${escapeHtml(order.id)}</h1></div><div><span>${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(new Date(order.createdAt))}</span><strong>${formatVND(order.total)}</strong></div></header>
      <div class="order-page-grid">
        <section class="order-status-panel"><h2>TRACKING</h2><ol class="order-timeline">${timeline(order)}</ol><p>${order.tracking ? `Tracking ${escapeHtml(order.tracking)}` : "Tracking will appear here once your order has shipped."}</p></section>
        <section class="order-details-panel"><div class="order-detail-row"><span>Delivery</span><strong>${escapeHtml(order.deliveryEstimate)}</strong></div><div class="order-detail-row"><span>Address</span><strong>${escapeHtml([order.address.address, order.address.district, order.address.province].filter(Boolean).join(", "))}</strong></div><div class="order-detail-row"><span>Payment</span><strong>${order.paymentMethod === "cod" ? "Cash on delivery" : "Bank transfer"}</strong></div></section>
      </div>
      <section class="order-items-section"><h2>PIECES</h2>${order.items.map((item, index) => `<article class="order-item"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}"><div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.color)} · Size ${escapeHtml(item.size)} · Qty ${item.quantity}</p><strong>${formatVND(item.unitPrice * item.quantity)}</strong></div><button type="button" class="cart-text-action js-service-open" data-item-index="${index}">Return or Exchange</button></article>`).join("")}</section>
      <section class="order-service-panel js-order-service-panel" hidden><div class="order-service-head"><h2>RETURN OR EXCHANGE</h2><button type="button" class="js-service-close" aria-label="Close">×</button></div><form class="js-service-form"><input type="hidden" name="itemIndex"><label>Request<select name="action"><option value="exchange">Exchange size</option><option value="return">Return</option></select></label><label>Reason<select name="reason"><option value="wrong-size">Wrong size</option><option value="changed-mind">Changed my mind</option><option value="quality">Quality concern</option></select></label><label class="js-exchange-size">New size<select name="newSize"></select></label><p class="commerce-inline-error js-service-error" aria-live="polite"></p><button type="submit" class="commerce-primary-action">SUBMIT REQUEST</button></form></section>
      ${order.serviceRequests?.length ? `<section class="order-requests"><h2>SERVICE REQUESTS</h2>${order.serviceRequests.map((request) => `<article><span>${escapeHtml(request.action.toUpperCase())}</span><strong>${escapeHtml(request.itemName)}</strong><p>${request.action === "exchange" ? `Size ${escapeHtml(request.fromSize)} → ${escapeHtml(request.newSize)}` : "Return requested"} · Requested</p></article>`).join("")}</section>` : ""}`;
    bind();
  };

  const bind = () => {
    const panel = root.querySelector(".js-order-service-panel");
    const form = root.querySelector(".js-service-form");
    root.querySelectorAll(".js-service-open").forEach((button) => button.addEventListener("click", () => {
      const index = Number(button.dataset.itemIndex);
      const item = order.items[index];
      const product = products.find((entry) => entry.id === item.productId);
      form.elements.itemIndex.value = String(index);
      form.elements.newSize.innerHTML = (product?.sizes || []).filter((size) => size !== item.size).map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`).join("");
      panel.hidden = false;
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
      form.elements.action.focus();
    }));
    root.querySelector(".js-service-close")?.addEventListener("click", () => { panel.hidden = true; });
    form.elements.action.addEventListener("change", () => { root.querySelector(".js-exchange-size").hidden = form.elements.action.value !== "exchange"; });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const item = order.items[Number(data.get("itemIndex"))];
      if (data.get("action") === "exchange" && !data.get("newSize")) {
        root.querySelector(".js-service-error").textContent = "Choose a replacement size.";
        return;
      }
      const request = { id: `SR-${Date.now()}`, action: data.get("action"), reason: data.get("reason"), itemIndex: Number(data.get("itemIndex")), itemName: item.name, fromSize: item.size, newSize: data.get("action") === "exchange" ? data.get("newSize") : null, status: "requested", createdAt: new Date().toISOString() };
      order = updateOrder(order.id, { serviceRequests: [...(order.serviceRequests || []), request] });
      track(data.get("action") === "exchange" ? "exchange_requested" : "return_requested", { order_id: order.id, product_id: item.productId });
      showMessage("Request received.");
      paint();
    });
  };

  paint();
}
