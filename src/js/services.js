import {
  bookAppointment,
  clearEnquiryDraft,
  getAppointmentConfig,
  getAppointmentDays,
  getCurrentAccount,
  getEnquiryDraft,
  getOrders,
  saveEnquiryDraft,
  sendEnquiry,
  SIZE_GUIDE,
} from "./commerce-store.js?v=full-prototype";
import { attemptLocalAction, bindFormValidation, downloadText, escapeHtml, runRequest, showMessage } from "./commerce-ui.js?v=full-prototype";

const TOPICS = {
  product: { title: "Start with the silhouette.", copy: "Check the product fit note and compare your body measurements with the Size Guide.", href: "size-guide.html", label: "Explore size & fit" },
  delivery: { title: "Know the next step.", copy: "Standard and express estimates are shown at checkout. Open an order to see its status or cancel it while it is processing.", href: "shipping&returns.html", label: "Delivery information" },
  returns: { title: "Find a better fit.", copy: "Returns and size exchanges open on a delivered order. Review the conditions, then start the request from the order page.", href: "shipping&returns.html", label: "Returns & exchanges" },
  care: { title: "Keep it in rotation.", copy: "The garment label comes first. Our guide explains gentle handling, storage and care by material.", href: "care-guide.html", label: "Explore garment care" },
  other: { title: "A little direction.", copy: "Fit, delivery, order and care guidance all live in Client Services. A fitting appointment can answer the rest in person.", href: "client-services.html#appointment", label: "Book an appointment" },
};

export function initEnquiry() {
  const form = document.querySelector(".js-enquiry-form");
  if (!form) return;
  const validate = bindFormValidation(form);
  const status = form.querySelector(".js-enquiry-status");
  const error = form.querySelector(".js-enquiry-error");
  const download = form.querySelector(".js-download-enquiry");
  const clear = form.querySelector(".js-clear-enquiry");
  const saveDraftButton = form.querySelector(".js-save-enquiry");
  const account = getCurrentAccount();
  const orders = getOrders().filter((order) => !account || order.accountEmail === account.email || order.customer?.email === account.email);
  const draft = getEnquiryDraft();
  form.elements.orderId.insertAdjacentHTML("beforeend", orders.map((order) => `<option value="${escapeHtml(order.id)}">${escapeHtml(order.id)}</option>`).join(""));
  if (account) {
    form.elements.fullName.value = account.fullName || "";
    form.elements.email.value = account.email;
  }
  if (draft) ["topic", "orderId", "message"].forEach((key) => { form.elements[key].value = draft[key] || ""; });
  const params = new URLSearchParams(location.search);
  if (TOPICS[params.get("topic")]) form.elements.topic.value = params.get("topic");
  if (orders.some((order) => order.id === params.get("order"))) form.elements.orderId.value = params.get("order");
  if (!TOPICS[form.elements.topic.value]) form.elements.topic.value = "product";
  const update = () => {
    const topic = TOPICS[form.elements.topic.value];
    document.querySelector(".js-topic-help").innerHTML = `<h3>${topic.title}</h3><p>${topic.copy}</p><a class="text-link" href="${topic.href}">${topic.label} →</a>`;
    form.querySelector(".js-enquiry-order-field").hidden = !["delivery", "returns"].includes(form.elements.topic.value);
    form.querySelector(".js-enquiry-count").textContent = `${form.elements.message.value.length} / 2000`;
  };
  update();
  download.hidden = clear.hidden = !draft;
  if (draft) status.textContent = "Your saved draft is ready to continue. It has not been sent.";
  form.addEventListener("input", () => { update(); download.hidden = true; });
  form.addEventListener("change", update);

  const values = () => {
    const data = Object.fromEntries(new FormData(form));
    if (form.querySelector(".js-enquiry-order-field").hidden) data.orderId = "";
    return data;
  };

  saveDraftButton.addEventListener("click", () => {
    if (!form.elements.message.value.trim()) { status.textContent = "Add your question before saving a draft."; form.elements.message.focus(); return; }
    const saved = attemptLocalAction(() => saveEnquiryDraft(values()), status);
    if (!saved) return;
    status.textContent = "Draft saved. It has not been sent yet.";
    download.hidden = clear.hidden = false;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validate()) { status.textContent = "Complete the highlighted fields before sending."; return; }
    const result = await runRequest(form.querySelector(".js-enquiry-send"), "Sending…", () => sendEnquiry(values()), { errorElement: error });
    if (!result?.ok) return;
    clearEnquiryDraft();
    const name = form.elements.fullName.value;
    const email = form.elements.email.value;
    form.reset();
    form.elements.fullName.value = name;
    form.elements.email.value = email;
    update();
    download.hidden = clear.hidden = true;
    status.innerHTML = `Thank you. Your enquiry <strong class="js-enquiry-reference">${escapeHtml(result.enquiry.id)}</strong> has been received. We’ll reply by email within one working day.`;
    showMessage("Enquiry sent.");
  });
  download.addEventListener("click", () => {
    const saved = getEnquiryDraft();
    if (!saved) return;
    downloadText("ATELIER-enquiry-draft.txt", `ATELIER — Enquiry draft (not sent)\nTopic: ${TOPICS[saved.topic]?.label || saved.topic}\n${saved.orderId ? `Order: ${saved.orderId}\n` : ""}\n${saved.message}\n`);
  });
  clear.addEventListener("click", () => {
    if (!attemptLocalAction(() => { clearEnquiryDraft(); return true; }, status)) return;
    form.elements.message.value = "";
    update(); download.hidden = clear.hidden = true;
    status.textContent = "Saved draft cleared. You can start a new enquiry.";
    form.elements.message.focus();
  });
}

export function initAppointments() {
  const form = document.querySelector(".js-appointment-form");
  if (!form) return;
  const config = getAppointmentConfig();
  const daysWrap = form.querySelector(".js-appointment-days");
  const timesWrap = form.querySelector(".js-appointment-times");
  const error = form.querySelector(".js-appointment-error");
  const confirmation = form.querySelector(".js-appointment-confirmation");
  const validate = bindFormValidation(form);
  const account = getCurrentAccount();
  form.elements.service.innerHTML = config.services.map((service) => `<option value="${escapeHtml(service.id)}">${escapeHtml(service.label)}, ${service.minutes} min</option>`).join("");
  if (account) {
    form.elements.fullName.value = account.fullName || "";
    form.elements.email.value = account.email;
    form.elements.phone.value = account.phone || "";
  }
  // The chosen appointment names the booking action, so the choice is confirmed on screen.
  const submitButton = form.querySelector(".js-appointment-submit");
  const syncService = () => {
    const service = config.services.find((item) => item.id === form.elements.service.value);
    submitButton.textContent = service ? `Book ${service.label.toLowerCase()} (${service.minutes} min)` : "Book appointment";
  };
  form.elements.service.addEventListener("change", syncService);
  syncService();
  const dayFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
  let selectedDay = null;
  let selectedTime = null;

  const paintTimes = () => {
    const day = getAppointmentDays().find((item) => item.key === selectedDay);
    if (!day) { timesWrap.innerHTML = '<p class="form-status">Choose a day to see available times.</p>'; return; }
    timesWrap.innerHTML = day.slots.map((slot) => `<button type="button" class="appointment-slot" data-time="${escapeHtml(slot.time)}" aria-pressed="${slot.time === selectedTime}" ${slot.available ? "" : 'disabled aria-label="' + escapeHtml(slot.time) + ', unavailable"'}>${escapeHtml(slot.time)}</button>`).join("");
    timesWrap.querySelectorAll(".appointment-slot").forEach((button) => button.addEventListener("click", () => {
      selectedTime = button.dataset.time;
      error.textContent = "";
      paintTimes();
      timesWrap.querySelector(`[data-time="${CSS.escape(selectedTime)}"]`)?.focus();
    }));
  };

  const paintDays = () => {
    const days = getAppointmentDays();
    daysWrap.innerHTML = days.map((day) => {
      const open = day.slots.filter((slot) => slot.available).length;
      return `<button type="button" class="appointment-day" role="radio" data-day="${escapeHtml(day.key)}" aria-checked="${day.key === selectedDay}" ${open ? "" : "disabled"}><strong>${escapeHtml(dayFormat.format(day.date))}</strong><small>${open ? `${open} times` : "Full"}</small></button>`;
    }).join("");
    daysWrap.querySelectorAll(".appointment-day").forEach((button) => button.addEventListener("click", () => {
      selectedDay = button.dataset.day;
      selectedTime = null;
      error.textContent = "";
      paintDays();
      paintTimes();
      daysWrap.querySelector(`[data-day="${CSS.escape(selectedDay)}"]`)?.focus();
    }));
  };
  paintDays();
  paintTimes();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    confirmation.hidden = true;
    const fieldsValid = validate();
    if (!selectedDay || !selectedTime) { error.textContent = "Choose a day and a time for your appointment."; return; }
    if (!fieldsValid) { error.textContent = "Complete the highlighted fields."; return; }
    const data = Object.fromEntries(new FormData(form));
    const result = await runRequest(form.querySelector(".js-appointment-submit"), "Booking…", () => bookAppointment({ ...data, date: selectedDay, time: selectedTime }), { errorElement: error });
    if (!result) return;
    if (!result.ok) { error.textContent = result.message; selectedTime = null; paintDays(); paintTimes(); return; }
    const appointment = result.appointment;
    const when = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${appointment.date}T00:00:00`));
    confirmation.innerHTML = `<p class="eyebrow">BOOKED</p><h3>${escapeHtml(appointment.serviceLabel)}</h3><p><strong class="js-appointment-reference">${escapeHtml(appointment.id)}</strong>, ${escapeHtml(when)} at ${escapeHtml(appointment.time)}</p><p>We’ve emailed your confirmation and calendar invite.${account ? ' <a class="text-link" href="account.html#alerts">See it in your account →</a>' : ""}</p>`;
    confirmation.hidden = false;
    selectedDay = null;
    selectedTime = null;
    form.elements.notes.value = "";
    paintDays();
    paintTimes();
    confirmation.focus();
    showMessage("Appointment booked.");
  });
}

export function initSizeGuide() {
  const wrap = document.querySelector(".size-table-wrap");
  if (!wrap) return;
  const controls = document.createElement("div");
  controls.className = "measurement-controls";
  controls.innerHTML = '<span>Body measurements</span><div role="group" aria-label="Measurement unit"><button type="button" data-unit="cm" aria-pressed="true">CM</button><button type="button" data-unit="in" aria-pressed="false">IN</button></div>';
  wrap.before(controls);
  const heading = wrap.closest(".container").querySelector("h2");
  const paint = (unit) => {
    const measurement = (values) => values.map((value) => unit === "cm" ? value : (value / 2.54).toFixed(1)).join("–");
    heading.textContent = `Body measurements in ${unit === "cm" ? "centimetres" : "inches"}`;
    wrap.querySelector("table").innerHTML = `<caption class="sr-only">ATELIER body measurements in ${unit === "cm" ? "centimetres" : "inches"}</caption><thead><tr><th scope="col">ATELIER size</th>${SIZE_GUIDE.map((row) => `<th scope="col">${row.size}</th>`).join("")}</tr></thead><tbody>${["chest", "waist", "hip"].map((key) => `<tr><th scope="row">${key[0].toUpperCase() + key.slice(1)}</th>${SIZE_GUIDE.map((row) => `<td>${measurement(row[key])}</td>`).join("")}</tr>`).join("")}</tbody>`;
    controls.querySelectorAll("button").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.unit === unit)));
  };
  controls.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => paint(button.dataset.unit)));
  paint("cm");
}
