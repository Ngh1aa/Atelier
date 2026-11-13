// Hidden demo tools switch. Visitors never see the tools; "?demo=1" turns them on
// for this tab (remembered in sessionStorage), "?demo=0" turns them off again.
// The key deliberately does not start with "atelier." so "Reset demo data" keeps it.
const DEMO_FLAG_KEY = "atelierDemoTools";

export function isDemoMode() {
  let param = null;
  try { param = new URLSearchParams(location.search).get("demo"); } catch { /* ignore */ }
  try {
    if (param === "1") sessionStorage.setItem(DEMO_FLAG_KEY, "1");
    if (param === "0") sessionStorage.removeItem(DEMO_FLAG_KEY);
    return sessionStorage.getItem(DEMO_FLAG_KEY) === "1";
  } catch {
    return param === "1";
  }
}

// Elements marked data-demo-only (e.g. the simulated card outcome at checkout)
// stay hidden unless the demo tools are on.
export function revealDemoOnlyElements(root = document) {
  if (!isDemoMode()) return;
  root.querySelectorAll("[data-demo-only]").forEach((element) => { element.hidden = false; });
}
