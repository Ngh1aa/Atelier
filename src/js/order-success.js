import { formatVND, getOrder } from "./commerce-store.js?v=white-editorial-v6";
import { escapeHtml } from "./commerce-ui.js?v=white-editorial-v6";

function maskEmail(email) {
  const [name, domain] = String(email || "").split("@");
  if (!domain) return "your email address";
  return `${name.slice(0, 1)}${"•".repeat(Math.max(2, name.length - 1))}@${domain}`;
}

export function renderOrderSuccess() {
  const root = document.querySelector(".js-order-success");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const order = getOrder(id);

  if (!order) {
    root.innerHTML = `<p class="eyebrow">LOCAL ORDER</p><h1>Order not found.</h1><p>This local order may have been created in another browser or cleared from this device.</p><a class="btn-outline" href="shop.html">Explore the collection <span aria-hidden="true">→</span></a>`;
    return;
  }

  root.innerHTML = `
    <p class="eyebrow">ORDER RECORDED / LOCAL PROTOTYPE</p>
    <h1>Thank you.</h1>
    <p class="success-order-number">${escapeHtml(order.id)}</p>
    <p>Your order has been recorded in this browser. No live fulfilment or payment service has been contacted.</p>
    <div class="success-order-facts">
      <div><span>Displayed delivery estimate</span><strong>${escapeHtml(order.deliveryEstimate)}</strong></div>
      <div><span>Prototype total</span><strong>${formatVND(order.total)}</strong></div>
      <div><span>Contact stored locally</span><strong>${escapeHtml(maskEmail(order.customer.email))}</strong></div>
    </div>
    <div class="success-actions">
      <a class="commerce-primary-action" href="order.html?id=${encodeURIComponent(order.id)}">View Local Order</a>
      <a class="commerce-secondary-action" href="account.html">Orders on This Device</a>
    </div>
    <p class="success-account-note">No client account has been created. Orders and service-request demonstrations remain local to this browser.</p>`;
}
