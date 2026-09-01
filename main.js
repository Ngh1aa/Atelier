// App entry: bootstrap reveal animations + per-page commerce modules
import "./src/js/app.js?v=white-editorial-v6";
import "./src/main.js?v=white-editorial-v6";

const designSheets = [
  { href: "./atelier-v9.css?v=media-safe-v9", match: "atelier-v9.css", owner: "v9-media-safe" },
  { href: "./atelier-v9-integrity.css?v=media-safe-v9", match: "atelier-v9-integrity.css", owner: "v9-media-integrity" },
];

designSheets.forEach(({ href, match, owner }) => {
  if ([...document.styleSheets].some((sheet) => sheet.href?.includes(match))) return;
  const sheet = document.createElement("link");
  sheet.rel = "stylesheet";
  sheet.href = href;
  sheet.dataset.atelierDesignOwner = owner;
  document.head.appendChild(sheet);
});

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
