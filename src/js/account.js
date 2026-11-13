import {
  cancelAppointment,
  deleteAddress,
  formatVND,
  getAccountOrders,
  getAddresses,
  getAppointments,
  getCurrentAccount,
  getRecentlyViewed,
  getStockAlerts,
  getWishlist,
  loadProducts,
  ORDER_STATUS_LABELS,
  removeStockAlert,
  saveAddress,
  setDefaultAddress,
  signOut,
  updateAccountProfile,
} from "./commerce-store.js?v=full-prototype";
import { bindFormValidation, escapeHtml, runRequest, showMessage } from "./commerce-ui.js?v=full-prototype";

const shortDate = (value) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));

function renderOrders(account) {
  const root = document.querySelector(".js-account-orders");
  const orders = getAccountOrders(account.email);
  document.querySelector(".js-orders-count").textContent = orders.length;
  root.innerHTML = orders.length
    ? orders.map((order) => `<a class="account-order-row" href="order.html?id=${encodeURIComponent(order.id)}"><span><strong>${escapeHtml(order.id)}</strong><small>${shortDate(order.createdAt)}</small></span><span><span class="status-label" data-status="${escapeHtml(order.status || "processing")}">${escapeHtml(ORDER_STATUS_LABELS[order.status || "processing"])}</span><small>${((count) => `${count} ${count === 1 ? "piece" : "pieces"}`)(order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0)}${order.serviceRequests?.length ? `, ${order.serviceRequests.length} requests` : ""}</small></span><b>${formatVND(order.total)}</b><i aria-hidden="true">→</i></a>`).join("")
    : `<div class="account-orders-empty"><p class="eyebrow">YOUR FIRST CHAPTER</p><h3>No orders yet.</h3><p>Orders you place while signed in appear here with their status, returns and cancellations.</p><a href="shop.html" class="text-link">Explore the collection →</a></div>`;
}

function initProfile(account, onChange) {
  const form = document.querySelector(".js-account-profile");
  const validate = bindFormValidation(form);
  const status = form.querySelector(".js-profile-status");
  form.elements.fullName.value = account.fullName || "";
  form.elements.email.value = account.email;
  form.elements.phone.value = account.phone || "";
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validate()) { status.textContent = "Check the highlighted details."; return; }
    const result = await runRequest(form.querySelector(".js-profile-save"), "Saving…", () => updateAccountProfile(Object.fromEntries(new FormData(form))), { errorElement: status });
    if (!result) return;
    if (!result.ok) { status.textContent = result.message; return; }
    status.textContent = "Profile saved.";
    showMessage("Profile saved.");
    onChange(result.account);
  });
}

function initAddresses() {
  const list = document.querySelector(".js-address-list");
  const form = document.querySelector(".js-address-form");
  const addButton = document.querySelector(".js-address-add");
  const error = form.querySelector(".js-address-error");
  const validate = bindFormValidation(form);

  const closeForm = () => {
    form.hidden = true;
    addButton.hidden = false;
  };
  const openForm = (address = null) => {
    form.reset();
    error.textContent = "";
    form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.setAttribute("aria-invalid", "false"));
    form.querySelectorAll(".field-error").forEach((field) => { field.textContent = ""; });
    form.querySelector(".js-address-form-title").textContent = address ? `Edit ${address.label || "address"}` : "New address";
    form.elements.id.value = address?.id || "";
    ["label", "fullName", "phone", "address", "apartment", "district", "province", "postalCode"].forEach((name) => { form.elements[name].value = address?.[name] || ""; });
    form.elements.isDefault.checked = Boolean(address?.isDefault);
    form.hidden = false;
    addButton.hidden = true;
    form.elements.label.focus();
  };

  const paint = () => {
    const addresses = getAddresses();
    document.querySelector(".js-address-count").textContent = addresses.length;
    list.innerHTML = addresses.length ? addresses.map((address) => `
      <article class="address-card" data-address-id="${escapeHtml(address.id)}">
        <div><h3>${escapeHtml(address.label || "Address")}${address.isDefault ? ' <span class="status-label">Default</span>' : ""}</h3>
        <p>${escapeHtml(address.fullName)}, ${escapeHtml(address.phone)}<br>${escapeHtml([address.address, address.apartment].filter(Boolean).join(", "))}<br>${escapeHtml([address.district, address.province, address.postalCode].filter(Boolean).join(", "))}</p></div>
        <div class="address-card__actions">
          <button type="button" class="text-action js-address-edit" aria-label="Edit ${escapeHtml(address.label || "address")}">Edit</button>
          ${address.isDefault ? "" : `<button type="button" class="text-action js-address-default" aria-label="Make ${escapeHtml(address.label || "address")} the default">Make default</button>`}
          <button type="button" class="text-action js-address-delete" aria-label="Delete ${escapeHtml(address.label || "address")}">Delete</button>
        </div>
        <p class="commerce-inline-error js-address-card-error" role="alert"></p>
      </article>`).join("")
      : '<div class="account-orders-empty"><h3>No saved addresses.</h3><p>Add one to fill checkout in a single step.</p></div>';

    list.querySelectorAll(".address-card").forEach((card) => {
      const address = addresses.find((item) => item.id === card.dataset.addressId);
      const cardError = card.querySelector(".js-address-card-error");
      card.querySelector(".js-address-edit").addEventListener("click", () => openForm(address));
      card.querySelector(".js-address-default")?.addEventListener("click", async (event) => {
        const result = await runRequest(event.currentTarget, "Saving…", () => setDefaultAddress(address.id), { errorElement: cardError });
        if (result?.ok) { paint(); showMessage(`${address.label || "Address"} is now your default.`); }
      });
      const deleteButton = card.querySelector(".js-address-delete");
      deleteButton.addEventListener("click", async () => {
        if (deleteButton.dataset.confirm !== "true") {
          deleteButton.dataset.confirm = "true";
          deleteButton.textContent = "Confirm delete";
          return;
        }
        const result = await runRequest(deleteButton, "Deleting…", () => deleteAddress(address.id), { errorElement: cardError });
        if (!result) return;
        if (!result.ok) { cardError.textContent = result.message; return; }
        paint();
        showMessage("Address deleted.");
        addButton.focus();
      });
    });
  };

  addButton.addEventListener("click", () => openForm());
  form.querySelector(".js-address-cancel").addEventListener("click", () => { closeForm(); addButton.focus(); });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validate()) { error.textContent = "Check the highlighted fields."; return; }
    const values = Object.fromEntries(new FormData(form));
    values.isDefault = form.elements.isDefault.checked;
    const result = await runRequest(form.querySelector(".js-address-save"), "Saving…", () => saveAddress(values), { errorElement: error });
    if (!result) return;
    if (!result.ok) { error.textContent = result.message; return; }
    closeForm();
    paint();
    showMessage("Address saved.");
  });
  paint();
}

function initAlerts() {
  const root = document.querySelector(".js-account-alerts");
  const paint = () => {
    const account = getCurrentAccount();
    const alerts = getStockAlerts().filter((item) => item.email === account?.email);
    const appointments = getAppointments().filter((item) => item.email === account?.email && item.status !== "cancelled");
    if (!alerts.length && !appointments.length) {
      root.innerHTML = '<div class="account-orders-empty"><h3>Nothing waiting.</h3><p>Ask to be notified about a sold-out size on a product page, or book a fitting with Client Services.</p></div>';
      return;
    }
    root.innerHTML = `${appointments.map((item) => `<article class="address-card" data-appointment-id="${escapeHtml(item.id)}"><div><h3>${escapeHtml(item.serviceLabel)} <span class="status-label">Booked</span></h3><p>${escapeHtml(new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${item.date}T00:00:00`)))}, ${escapeHtml(item.time)}, ATELIER studio, District 1</p></div><div class="address-card__actions"><button type="button" class="text-action js-appointment-cancel">Cancel appointment</button></div><p class="commerce-inline-error js-alert-error" role="alert"></p></article>`).join("")}
      ${alerts.map((item) => `<article class="address-card" data-alert-id="${escapeHtml(item.id)}"><div><h3>${escapeHtml(item.productName)} <span class="status-label">Notify me</span></h3><p>${escapeHtml(item.colorName)}, size ${escapeHtml(item.size)}. We’ll email you when it’s back.</p></div><div class="address-card__actions"><a class="text-action" href="detailproduct.html?id=${encodeURIComponent(item.productId)}&amp;color=${encodeURIComponent(item.color)}">View piece</a><button type="button" class="text-action js-alert-remove">Remove alert</button></div><p class="commerce-inline-error js-alert-error" role="alert"></p></article>`).join("")}`;
    root.querySelectorAll("[data-appointment-id]").forEach((card) => card.querySelector(".js-appointment-cancel").addEventListener("click", async (event) => {
      const result = await runRequest(event.currentTarget, "Cancelling…", () => cancelAppointment(card.dataset.appointmentId), { errorElement: card.querySelector(".js-alert-error") });
      if (result?.ok) { paint(); showMessage("Appointment cancelled."); }
    }));
    root.querySelectorAll("[data-alert-id]").forEach((card) => card.querySelector(".js-alert-remove").addEventListener("click", async (event) => {
      const result = await runRequest(event.currentTarget, "Removing…", () => removeStockAlert(card.dataset.alertId), { errorElement: card.querySelector(".js-alert-error") });
      if (result?.ok) { paint(); showMessage("Alert removed."); }
    }));
  };
  paint();
}

async function renderRecent() {
  const recent = getRecentlyViewed();
  if (!recent.length) return;
  let products;
  try { products = await loadProducts(); } catch { return; }
  const pieces = recent.map((id) => products.find((product) => product.id === id)).filter(Boolean).slice(0, 4);
  document.querySelector(".js-client-recent-section").hidden = !pieces.length;
  document.querySelector(".js-client-recent").innerHTML = pieces.map((product) => `<a class="client-piece" href="detailproduct.html?id=${encodeURIComponent(product.id)}"><img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}" loading="lazy"><h3>${escapeHtml(product.name)}</h3><p>${formatVND(product.price)}</p></a>`).join("");
}

export async function renderAccount() {
  const signedOut = document.querySelector(".js-account-signed-out");
  const signedIn = document.querySelector(".js-account-signed-in");
  if (!signedOut || !signedIn) return;
  const greeting = document.querySelector(".js-client-greeting");
  const account = getCurrentAccount();

  if (!account) {
    signedOut.hidden = false;
    signedIn.hidden = true;
    greeting.textContent = "Your ATELIER.";
    renderRecent();
    return;
  }

  signedOut.hidden = true;
  signedIn.hidden = false;
  const greet = (current) => { greeting.textContent = current.fullName ? `Welcome, ${current.fullName.split(" ")[0]}.` : "Welcome back."; };
  greet(account);
  document.querySelector(".js-account-intro").textContent = `Signed in as ${account.email}.`;
  document.querySelector(".js-saved-count").textContent = getWishlist().length;
  renderOrders(account);
  initProfile(account, (updated) => {
    greet(updated);
    document.querySelector(".js-account-intro").textContent = `Signed in as ${updated.email}.`;
    renderOrders(updated);
  });
  initAddresses();
  initAlerts();
  document.querySelector(".js-sign-out").addEventListener("click", () => {
    signOut();
    location.href = "login.html?signedout=1";
  });
  renderRecent();
}
