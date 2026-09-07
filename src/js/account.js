import { clearClientProfile, formatVND, getClientProfile, getOrders, getRecentlyViewed, getWishlist, loadProducts, saveClientProfile } from "./commerce-store.js";
import { attemptLocalAction, bindFormValidation, escapeHtml } from "./commerce-ui.js";

export function initClientProfile() {
  const form = document.querySelector(".js-client-profile");
  if (!form) return;
  const validate = bindFormValidation(form);
  const status = form.querySelector(".js-profile-status");
  const restore = () => {
    const profile = getClientProfile();
    [...form.elements].forEach((field) => { if (field.name) field.value = profile[field.name] || ""; });
    const greeting = document.querySelector(".js-client-greeting");
    if (greeting) greeting.textContent = profile.fullName ? `Welcome, ${profile.fullName.split(" ")[0]}.` : "Your private edit.";
  };
  restore();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validate()) { status.textContent = "Check the highlighted details."; return; }
    const profile = attemptLocalAction(() => saveClientProfile({ ...getClientProfile(), ...Object.fromEntries(new FormData(form)) }), status);
    if (!profile) return;
    status.textContent = "Details saved on this device. You can use them at checkout.";
    restore();
    if (form.dataset.entry) location.href = "account.html";
  });
  form.querySelector(".js-clear-client")?.addEventListener("click", () => {
    const cleared = attemptLocalAction(() => { clearClientProfile(); return true; }, status);
    if (!cleared) return;
    restore();
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => { field.removeAttribute("aria-invalid"); field.setCustomValidity(""); });
    form.querySelectorAll(".field-error").forEach((field) => { field.textContent = ""; });
    status.textContent = "Saved details cleared. Your orders and saved pieces are still available.";
  });
}

export function initOrderLookup() {
  const form = document.querySelector(".js-order-lookup");
  if (!form) return;
  const validate = bindFormValidation(form);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validate()) return;
    const id = form.elements.orderId.value.trim().toUpperCase();
    const order = getOrders().find((item) => item.id.toUpperCase() === id);
    if (order) location.href = `order.html?id=${encodeURIComponent(order.id)}`;
    else form.querySelector(".js-lookup-status").textContent = "No matching order on this device. Check the number or open your order history.";
  });
}

export async function renderAccount() {
  initClientProfile();
  const root = document.querySelector(".js-account-orders");
  if (!root) return;
  const orders = getOrders();
  document.querySelector(".js-orders-count").textContent = orders.length;
  document.querySelector(".js-saved-count").textContent = getWishlist().length;
  root.innerHTML = orders.length
    ? orders.map((order) => `<a class="account-order-row" href="order.html?id=${encodeURIComponent(order.id)}"><span><strong>${escapeHtml(order.id)}</strong><small>${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(order.createdAt))}</small></span><span><span class="status-label">Recorded locally</span><small>${order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} pieces${order.serviceRequests?.length ? ` · ${order.serviceRequests.length} service notes` : ""}</small></span><b>${formatVND(order.total)}</b><i aria-hidden="true">→</i></a>`).join("")
    : `<div class="account-orders-empty"><p class="eyebrow">YOUR FIRST CHAPTER</p><h3>No orders here yet.</h3><p>Orders recorded in this browser will appear here with their details and service notes.</p><a href="shop.html" class="text-link">Explore the collection →</a></div>`;
  const recent = getRecentlyViewed();
  if (!recent.length) return;
  const products = await loadProducts();
  const pieces = recent.map((id) => products.find((product) => product.id === id)).filter(Boolean).slice(0, 4);
  document.querySelector(".js-client-recent-section").hidden = !pieces.length;
  document.querySelector(".js-client-recent").innerHTML = pieces.map((product) => `<a class="client-piece" href="detailproduct.html?id=${encodeURIComponent(product.id)}"><img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}" loading="lazy"><h3>${escapeHtml(product.name)}</h3><p>${formatVND(product.price)}</p></a>`).join("");
}
