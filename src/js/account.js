import { formatVND, getOrders } from "./commerce-store.js";
import { escapeHtml } from "./commerce-ui.js";

export function renderAccount() {
  const root = document.querySelector(".js-account-orders");
  if (!root) return;
  const orders = getOrders();
  root.innerHTML = orders.length ? orders.map((order) => `<a class="account-order-row" href="order.html?id=${encodeURIComponent(order.id)}"><span><strong>${escapeHtml(order.id)}</strong><small>${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(order.createdAt))}</small></span><span>${escapeHtml(order.fulfillmentStatus)}</span><b>${formatVND(order.total)}</b><i aria-hidden="true">→</i></a>`).join("") : `<div class="account-orders-empty"><p>No orders on this device yet.</p><a href="shop.html">Explore the collection →</a></div>`;
}
