import { clearEnquiryDraft, getEnquiryDraft, getOrders, saveEnquiryDraft, SIZE_GUIDE } from "./commerce-store.js";
import { attemptLocalAction, bindFormValidation, downloadText, escapeHtml } from "./commerce-ui.js";

const TOPICS = {
  product: { title: "Start with the silhouette.", copy: "Check the product fit note and compare your body measurements with the Size Guide.", href: "size-guide.html", label: "Explore size & fit" },
  delivery: { title: "Know the next step.", copy: "Standard and express estimates are shown at checkout. Orders in this edition are local records; live shipping is not connected.", href: "shipping&returns.html", label: "Delivery information" },
  returns: { title: "Find a better fit.", copy: "Review the displayed return conditions, then open an order to save a return or size exchange note for a piece.", href: "shipping&returns.html", label: "Returns & exchanges" },
  care: { title: "Keep it in rotation.", copy: "The garment label comes first. Our guide explains gentle handling, storage and care by material.", href: "care-guide.html", label: "Explore garment care" },
  other: { title: "A little direction.", copy: "Browse Client Services for fit, delivery, order and care guidance. You can keep your remaining question in a draft.", href: "client-services.html", label: "Explore Client Services" },
};

export function initEnquiry() {
  const form = document.querySelector(".js-enquiry-form");
  if (!form) return;
  const validate = bindFormValidation(form);
  const status = form.querySelector(".js-enquiry-status");
  const download = form.querySelector(".js-download-enquiry");
  const clear = form.querySelector(".js-clear-enquiry");
  const orders = getOrders();
  const draft = getEnquiryDraft();
  form.elements.orderId.insertAdjacentHTML("beforeend", orders.map((order) => `<option value="${escapeHtml(order.id)}">${escapeHtml(order.id)}</option>`).join(""));
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
  form.addEventListener("input", () => { update(); download.hidden = true; status.textContent = "Unsaved changes. Save your draft to keep this version."; });
  form.addEventListener("change", update);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validate()) { status.textContent = "Add your question before saving."; return; }
    const values = Object.fromEntries(new FormData(form));
    if (form.querySelector(".js-enquiry-order-field").hidden) values.orderId = "";
    const saved = attemptLocalAction(() => saveEnquiryDraft(values), status);
    if (!saved) return;
    status.textContent = "Draft saved on this device. Download a copy if you need it; nothing has been sent.";
    download.hidden = clear.hidden = false;
  });
  download.addEventListener("click", () => {
    const saved = getEnquiryDraft();
    if (!saved) return;
    downloadText("ATELIER-enquiry-draft.txt", `ATELIER — Enquiry draft (not sent)\nTopic: ${TOPICS[saved.topic]?.label || saved.topic}\n${saved.orderId ? `Order: ${saved.orderId}\n` : ""}\n${saved.message}\n`);
  });
  clear.addEventListener("click", () => {
    if (!attemptLocalAction(() => { clearEnquiryDraft(); return true; }, status)) return;
    form.reset(); update(); download.hidden = clear.hidden = true;
    status.textContent = "Saved draft cleared. You can start a new enquiry.";
    form.elements.message.focus();
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
