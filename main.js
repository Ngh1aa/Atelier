// App entry: commerce modules + V11 restrained ecommerce layout
import "./src/js/app.js?v=white-editorial-v6";
import "./src/main.js?v=white-editorial-v6";

function ensureV11DesignOwner() {
  document.querySelectorAll(
    'link[data-atelier-design-owner], link[href*="atelier-v9.css"], link[href*="atelier-v9-integrity.css"], link[href*="atelier-v10.css"], link[href*="atelier-v10-fixes.css"]'
  ).forEach((sheet) => sheet.remove());

  const sheets = [
    ["./atelier-v11.css?v=commerce-reset-v11-1", "atelier-v11.css", "v11-commerce-reset"],
    ["./atelier-v11-fixes.css?v=portrait-media-v11-3", "atelier-v11-fixes.css", "v11-portrait-media"],
    ["./atelier-v11-portrait.css?v=portrait-hardening-v11-4", "atelier-v11-portrait.css", "v11-portrait-hardening"],
  ];

  sheets.forEach(([href, match, owner]) => {
    if (document.querySelector(`link[href*="${match}"]`)) return;
    const sheet = document.createElement("link");
    sheet.rel = "stylesheet";
    sheet.href = href;
    sheet.dataset.atelierDesignOwner = owner;
    document.head.appendChild(sheet);
  });

  document.documentElement.dataset.atelierDesign = "v11-commerce";
}

function addPageClass() {
  const path = location.pathname;
  const routes = [
    [/index\.html$|\/$/, "v11-home"],
    [/shop\.html$/, "v11-shop"],
    [/detailproduct\.html$/, "v11-pdp"],
    [/cart\.html$/, "v11-bag"],
    [/checkout\.html$/, "v11-checkout"],
    [/collections\.html$/, "v11-collections"],
    [/about\.html$/, "v11-house"],
    [/favourite\.html$/, "v11-saved"],
    [/order\.html$/, "v11-order"],
    [/(client-services|size-guide|care-guide|shipping&returns|contact)\.html$/, "v11-service"],
  ];
  routes.forEach(([pattern, className]) => {
    if (pattern.test(path)) document.body.classList.add(className);
  });
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealObserver = !reducedMotion && "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" })
  : null;

function initReveal() {
  document.querySelectorAll(".reveal").forEach((element) => {
    if (revealObserver) revealObserver.observe(element);
    else element.classList.add("active");
  });
}

function initScrollState() {
  const nav = document.querySelector("body > nav:not(.checkout-nav)");
  if (!nav) return;
  const sync = () => nav.classList.toggle("is-scrolled", window.scrollY > 20);
  sync();
  window.addEventListener("scroll", sync, { passive: true });
}

function initBackToTop() {
  const button = document.querySelector(".back-to-top");
  if (!button) return;
  const sync = () => button.classList.toggle("visible", window.scrollY > 700);
  sync();
  window.addEventListener("scroll", sync, { passive: true });
}

ensureV11DesignOwner();

document.addEventListener("DOMContentLoaded", () => {
  addPageClass();
  initReveal();
  initScrollState();
  initBackToTop();
});
