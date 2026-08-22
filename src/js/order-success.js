import { formatVND, getOrder } from "./commerce-store.js?v=ecommerce-2";
import { escapeHtml } from "./commerce-ui.js?v=ecommerce-2";

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
    root.innerHTML = `<p class="eyebrow">ORDER</p><h1>Order not found.</h1><p>This order may have been created on another device.</p><a class="btn-outline" href="shop.html">Explore the collection <span aria-hidden="true">→</span></a>`;
    return;
  }
  root.innerHTML = `
    <p class="eyebrow">ORDER RECEIVED</p>
    <h1>Thank you.</h1>
    <p class="success-order-number">${escapeHtml(order.id)}</p>
    <p>We have received your order and will prepare it with care.</p>
    <div class="success-order-facts"><div><span>Estimated delivery</span><strong>${escapeHtml(order.deliveryEstimate)}</strong></div><div><span>Total</span><strong>${formatVND(order.total)}</strong></div><div><span>Confirmation sent to</span><strong>${escapeHtml(maskEmail(order.customer.email))}</strong></div></div>
    <div class="success-actions"><a class="commerce-primary-action" href="order.html?id=${encodeURIComponent(order.id)}">VIEW ORDER</a><a class="commerce-secondary-action" href="account.html">CREATE AN ACCOUNT</a></div>
    <p class="success-account-note">An account is optional. Use it to keep orders and return requests together on this device.</p>`;
}
