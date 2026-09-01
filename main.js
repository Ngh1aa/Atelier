// App entry: bootstrap reveal animations + per-page commerce modules
import "./src/js/app.js?v=white-editorial-v6";
import "./src/main.js?v=white-editorial-v6";

const v9StyleHref = "./atelier-v9.css?v=media-safe-v9";
if (![...document.styleSheets].some((sheet) => sheet.href?.includes("atelier-v9.css"))) {
  const v9Sheet = document.createElement("link");
  v9Sheet.rel = "stylesheet";
  v9Sheet.href = v9StyleHref;
  v9Sheet.dataset.atelierDesignOwner = "v9-media-safe";
  document.head.appendChild(v9Sheet);
}
document.documentElement.dataset.atelierDesign = "v9-media-safe";

const observerOptions = { threshold: 0.1 };
const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target);
      });
    }, observerOptions)
  : null;

function initScrollState() {
  const nav = document.querySelector("body > nav:not(.checkout-nav)");
  if (!nav) return;
  const sync = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  sync();
  window.addEventListener("scroll", sync, { passive: true });
}

function initReveal() {
  document.querySelectorAll(".reveal").forEach((element) => {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add("active");
  });
}

function initBackToTop() {
  const backToTop = document.querySelector(".back-to-top");
  if (!backToTop) return;
  const sync = () => backToTop.classList.toggle("visible", window.scrollY > 600);
  sync();
  window.addEventListener("scroll", sync, { passive: true });
}

document.addEventListener("DOMContentLoaded", () => {
  initReveal();
  initScrollState();
  initBackToTop();
});
