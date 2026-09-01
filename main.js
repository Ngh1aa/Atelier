// App entry: bootstrap reveal animations + per-page commerce modules
import "./src/js/app.js?v=white-editorial-v6";
import "./src/main.js?v=white-editorial-v6";

// V8 whole-site design owner. Keeping this at the shared entry means legacy/utility routes
// receive the same page-family system without duplicating a stylesheet tag across every HTML file.
const v8StyleHref = "./campaign-v8.css?v=web-benchmark-v8";
if (![...document.styleSheets].some((sheet) => sheet.href?.includes("campaign-v8.css"))) {
  const v8Sheet = document.createElement("link");
  v8Sheet.rel = "stylesheet";
  v8Sheet.href = v8StyleHref;
  v8Sheet.dataset.atelierDesignOwner = "campaign-commerce-v8";
  document.head.appendChild(v8Sheet);
}

document.documentElement.dataset.atelierDesign = "campaign-commerce-v8";

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
