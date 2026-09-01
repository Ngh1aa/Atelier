// App entry: bootstrap commerce modules + V10 journey-first composition
import "./src/js/app.js?v=white-editorial-v6";
import "./src/main.js?v=white-editorial-v6";

function ensureV10DesignOwner() {
  document.querySelectorAll('link[data-atelier-design-owner], link[href*="atelier-v9.css"], link[href*="atelier-v9-integrity.css"]').forEach((sheet) => sheet.remove());
  if (!document.querySelector('link[href*="atelier-v10.css"]')) {
    const sheet = document.createElement("link");
    sheet.rel = "stylesheet";
    sheet.href = "./atelier-v10.css?v=journey-v10-1";
    sheet.dataset.atelierDesignOwner = "v10-journey";
    document.head.appendChild(sheet);
  }
  document.documentElement.dataset.atelierDesign = "v10-journey";
}

ensureV10DesignOwner();

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

function addBodyJourneyClass() {
  const path = location.pathname;
  const classMap = [
    [/index\.html$|\/$/, "v10-home"],
    [/shop\.html$/, "v10-shop"],
    [/detailproduct\.html$/, "v10-pdp"],
    [/cart\.html$/, "v10-bag"],
    [/checkout\.html$/, "v10-checkout"],
    [/collections\.html$/, "v10-collections"],
    [/about\.html$/, "v10-house"],
    [/(client-services|size-guide|care-guide|shipping&returns|contact)\.html$/, "v10-service"],
  ];
  classMap.forEach(([pattern, className]) => {
    if (pattern.test(path)) document.body.classList.add(className);
  });
}

function initHomeJourney() {
  const main = document.querySelector("body.v7-home .v7-home-main");
  const hero = main?.querySelector(".campaign-sheet");
  if (!main || !hero || main.querySelector(".v10-intent-rail")) return;

  const rail = document.createElement("section");
  rail.className = "v10-intent-rail";
  rail.setAttribute("aria-labelledby", "v10-intent-title");
  rail.innerHTML = `
    <div class="container v10-intent-inner">
      <div class="v10-intent-intro">
        <div><p class="eyebrow">START WITH YOUR TASK</p><h2 id="v10-intent-title">What are you looking for today?</h2></div>
        <small>Choose a direct route, or continue into the Fall 2026 edit below.</small>
      </div>
      <nav class="v10-intent-grid" aria-label="Shop and service shortcuts">
        <a class="v10-intent-card" href="shop.html"><b>01</b><span>See what is new</span><small>Current catalogue →</small></a>
        <a class="v10-intent-card" href="shop.html?category=outerwear"><b>02</b><span>Build with tailoring</span><small>Outerwear →</small></a>
        <a class="v10-intent-card" href="shop.html?category=knitwear"><b>03</b><span>Find softer layers</span><small>Knitwear →</small></a>
        <a class="v10-intent-card" href="size-guide.html"><b>04</b><span>Check size & fit</span><small>Client service →</small></a>
      </nav>
    </div>`;
  main.insertBefore(rail, hero);
}

function initPdpJourney() {
  const page = document.querySelector("body.v7-pdp .product-detail-page > .container");
  const grid = page?.querySelector(".product-detail-grid");
  const info = grid?.querySelector(".product-info-col");
  const breadcrumb = page?.querySelector(".breadcrumb");
  if (!page || !grid || !info || page.querySelector(".v10-pdp-header")) return;

  const index = info.querySelector(".v7-pdp-index");
  const collection = info.querySelector(".collection-name");
  const title = info.querySelector(".product-title");
  const price = info.querySelector(".product-price");
  if (!title || !price) return;

  const header = document.createElement("header");
  header.className = "v10-pdp-header";
  const main = document.createElement("div");
  main.className = "v10-pdp-header-main";
  [index, collection, title].filter(Boolean).forEach((node) => main.appendChild(node));
  header.appendChild(main);
  header.appendChild(price);
  breadcrumb?.insertAdjacentElement("afterend", header);

  const guide = document.createElement("div");
  guide.className = "v10-decision-guide";
  guide.setAttribute("aria-label", "Product decision path");
  guide.innerHTML = "<span>01 Understand the piece</span><span>02 Check fit & size</span><span>03 Add when ready</span>";
  info.prepend(guide);
}

function initBagJourney() {
  const title = document.querySelector(".cart-title");
  if (!title || title.querySelector(".v10-bag-progress")) return;
  const progress = document.createElement("div");
  progress.className = "v10-bag-progress";
  progress.setAttribute("aria-label", "Purchase progress");
  progress.innerHTML = "<span>01 Review selection</span><span>02 Add delivery</span><span>03 Record order</span>";
  title.appendChild(progress);
}

function initCheckoutJourney() {
  const header = document.querySelector("body.v7-checkout .checkout-header");
  if (!header || header.querySelector(".v10-checkout-path")) return;
  const path = document.createElement("div");
  path.className = "v10-checkout-path";
  path.setAttribute("aria-label", "Checkout steps");
  path.innerHTML = "<span>01 Contact</span><span>02 Address</span><span>03 Delivery</span><span>04 Payment</span><span>05 Review</span>";
  header.appendChild(path);
}

function initV10Journey() {
  addBodyJourneyClass();
  initHomeJourney();
  initPdpJourney();
  initBagJourney();
  initCheckoutJourney();
}

document.addEventListener("DOMContentLoaded", () => {
  initV10Journey();
  initReveal();
  initScrollState();
  initBackToTop();
});
