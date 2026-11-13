import { formatVND, getCurrentAccount, getOrder } from "./commerce-store.js?v=full-prototype";
import { escapeHtml } from "./commerce-ui.js?v=full-prototype";

function maskEmail(email) {
  const [name, domain] = String(email || "").split("@");
  if (!domain) return "your email address";
  return `${name.slice(0, 1)}${"•".repeat(Math.max(2, name.length - 1))}@${domain}`;
}

const PAYMENT_LABELS = {
  cod: "Cash on delivery",
  "bank-transfer": "Bank transfer",
  "card-simulated": "Card",
};

export function renderOrderSuccess() {
  const root = document.querySelector(".js-order-success");
  if (!root) return;
  const id = new URLSearchParams(location.search).get("id");
  const order = id ? getOrder(id) : null;

  if (!order) {
    root.innerHTML = `<p class="eyebrow">ORDER</p><h1>Order not found.</h1><p>${id ? `We couldn’t find order ${escapeHtml(id)}. Check the number, or look it up with the email you used at checkout.` : "There is no order to confirm yet."}</p><div class="success-actions"><a class="commerce-primary-action" href="shop.html">Explore the collection</a><a class="commerce-secondary-action" href="forgot-password.html#order-lookup">Find an order</a></div>`;
    return;
  }

  const account = getCurrentAccount();
  root.innerHTML = `
    <p class="eyebrow">ORDER CONFIRMED</p>
    <h1>Thank you.</h1>
    <p class="success-order-number js-success-order-number">${escapeHtml(order.id)}</p>
    <p class="js-success-confirmation">Your order is confirmed. We’ve sent the details to ${escapeHtml(order.customer?.email || "your email address")} and will let you know when it ships.${order.paymentMethod === "bank-transfer" ? " Transfer instructions are included in that email; we dispatch once payment is received." : " Nothing is charged until your order is delivered."}</p>
    <div class="success-order-facts">
      <div><span>Estimated delivery</span><strong>${escapeHtml(order.deliveryEstimate)}</strong></div>
      <div><span>Total</span><strong>${formatVND(order.total)}</strong></div>
      <div><span>Payment</span><strong>${escapeHtml(PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod)}</strong></div>
      <div><span>Contact</span><strong>${escapeHtml(maskEmail(order.customer?.email))}</strong></div>
      ${order.giftNote ? `<div><span>Gift note</span><strong>${escapeHtml(order.giftNote)}</strong></div>` : ""}
    </div>
    <div class="success-actions">
      <a class="commerce-primary-action" href="order.html?id=${encodeURIComponent(order.id)}">View order</a>
      <a class="commerce-secondary-action" href="${account ? "account.html#orders" : "shop.html"}">${account ? "Order history" : "Continue shopping"}</a>
    </div>
    <p class="success-account-note">${account ? `Saved to the order history of ${escapeHtml(account.email)}.` : `Placed as a guest. Find it again with the order number and email on <a href="forgot-password.html#order-lookup">Find an order</a>.`}</p>`;
}
