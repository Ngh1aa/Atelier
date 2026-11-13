// Demo tools: reset the tab-local data and simulate failed requests. Hidden from
// normal visitors; only rendered as a small floating panel when ?demo=1 is set.
import { getFailureMode, resetDemoData, setFailureMode } from "./commerce-store.js?v=full-prototype";
import { showMessage } from "./commerce-ui.js?v=full-prototype";
import { isDemoMode, revealDemoOnlyElements } from "./demo-mode.js";

const FLASH_KEY = "atelier.demo.flash";
const OPEN_KEY = "atelierDemoToolsOpen";

const MODES = [
  { value: "off", label: "Requests succeed" },
  { value: "next", label: "Fail the next request" },
  { value: "always", label: "Fail every request" },
];

export function initDemoControls() {
  if (!isDemoMode()) return;
  revealDemoOnlyElements();
  if (document.querySelector(".demo-controls")) return;

  const section = document.createElement("details");
  section.className = "demo-controls";
  section.setAttribute("aria-label", "Demo tools");
  section.innerHTML = `
    <summary>Demo tools</summary>
    <div class="demo-controls__body">
      <p>Data lives in this browser tab. Add <code>?demo=0</code> to hide these tools.</p>
      <fieldset class="demo-controls__modes">
        <legend>Simulated requests</legend>
        ${MODES.map((mode) => `<label><input type="radio" name="atelier-demo-failure" value="${mode.value}"><span>${mode.label}</span></label>`).join("")}
      </fieldset>
      <div class="demo-controls__actions">
        <button type="button" class="btn-outline js-demo-reset">Reset demo data</button>
        <p class="form-status js-demo-status" role="status"></p>
      </div>
    </div>`;
  document.body.appendChild(section);

  try { section.open = sessionStorage.getItem(OPEN_KEY) === "1"; } catch { /* ignore */ }
  section.addEventListener("toggle", () => {
    try { sessionStorage.setItem(OPEN_KEY, section.open ? "1" : "0"); } catch { /* ignore */ }
  });

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
    section.open = true;
    status.textContent = flash;
    showMessage(flash);
  }
}
