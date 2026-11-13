// Demo store controls: tells the visitor that nothing is real, lets them reset the
// tab-local data and simulate failed requests. Rendered at the top of every footer.
import { getFailureMode, resetDemoData, setFailureMode } from "./commerce-store.js?v=full-prototype";
import { showMessage } from "./commerce-ui.js?v=full-prototype";

const FLASH_KEY = "atelier.demo.flash";

const MODES = [
  { value: "off", label: "Requests succeed" },
  { value: "next", label: "Fail the next request" },
  { value: "always", label: "Fail every request" },
];

export function initDemoControls() {
  if (document.querySelector(".demo-controls")) return;
  const footer = document.querySelector("body > footer");
  const host = footer?.querySelector(".container") || footer || document.body;

  const section = document.createElement("section");
  section.className = "demo-controls";
  section.setAttribute("aria-labelledby", "demo-controls-title");
  section.innerHTML = `
    <div class="demo-controls__copy">
      <p class="eyebrow">DEMO STORE</p>
      <h2 id="demo-controls-title">A demo store. No real orders.</h2>
      <p>Bag, Saved, orders, account and appointments live only in this browser tab. Nothing is charged, shipped or emailed.</p>
    </div>
    <fieldset class="demo-controls__modes">
      <legend>Simulated requests</legend>
      ${MODES.map((mode) => `<label><input type="radio" name="atelier-demo-failure" value="${mode.value}"><span>${mode.label}</span></label>`).join("")}
    </fieldset>
    <div class="demo-controls__actions">
      <button type="button" class="btn-outline js-demo-reset">Reset demo data</button>
      <p class="form-status js-demo-status" role="status"></p>
    </div>`;
  host.prepend(section);

  const status = section.querySelector(".js-demo-status");
  const sync = () => {
    const mode = getFailureMode();
    section.querySelectorAll('input[name="atelier-demo-failure"]').forEach((input) => { input.checked = input.value === mode; });
    section.dataset.failureMode = mode;
  };
  sync();
  window.addEventListener("atelier:demo-failure-updated", sync);

  section.querySelectorAll('input[name="atelier-demo-failure"]').forEach((input) => input.addEventListener("change", () => {
    const mode = setFailureMode(input.value);
    const copy = mode === "off" ? "Requests will succeed again." : mode === "next" ? "The next request will fail once, then recover." : "Every request will fail until you switch this off.";
    status.textContent = copy;
    showMessage(copy);
  }));

  section.querySelector(".js-demo-reset").addEventListener("click", () => {
    resetDemoData();
    try { sessionStorage.setItem(FLASH_KEY, "Demo data reset. Bag, Saved, orders and account are back to the starting state."); } catch { /* ignore */ }
    location.reload();
  });

  let flash = null;
  try { flash = sessionStorage.getItem(FLASH_KEY); sessionStorage.removeItem(FLASH_KEY); } catch { /* ignore */ }
  if (flash) {
    status.textContent = flash;
    showMessage(flash);
  }
}
