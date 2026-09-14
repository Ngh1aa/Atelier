// ATELIER app entry — commerce behavior remains shared; V15 is an isolated flagship layer.
import "./src/js/app.js?v=atelier-v15";
import "./src/main.js?v=atelier-v15";
import { initCheckoutProgress, initMotionSystem } from "./src/js/motion-system.js?v=atelier-v15-motion2";
import { initPdpV15 } from "./src/js/pdp-v15.js?v=atelier-v15";

const FLAGSHIP_STYLESHEETS = [
  "./atelier-v15.css?v=flagship-20260915-motion2",
  "./atelier-v15-responsive.css?v=flagship-20260915-motion2",
  "./atelier-v15-accessibility.css?v=flagship-20260915-motion2",
];

function ensureStylesheet(href) {
  const absoluteHref = new URL(href, document.baseURI).href;
  const existing = [...document.querySelectorAll('link[rel="stylesheet"]')]
    .find((link) => link.href === absoluteHref || link.href.split("?")[0] === absoluteHref.split("?")[0]);
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.atelierFlagshipStyle = "true";
    link.addEventListener("load", () => resolve(link), { once: true });
    link.addEventListener("error", () => {
      console.warn(`ATELIER stylesheet failed to load: ${href}`);
      resolve(link);
    }, { once: true });
    document.head.appendChild(link);
  });
}

async function ensureFlagshipStyles() {
  await Promise.all(FLAGSHIP_STYLESHEETS.map(ensureStylesheet));
}

document.documentElement.dataset.atelierStyle = "luxury-monochrome";
document.documentElement.dataset.atelierVersion = "v15";

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

async function initFlagshipExperience() {
  await ensureFlagshipStyles();
  initMotionSystem();
  initScrollState();
  initBackToTop();
  initCheckoutProgress();
  initPdpV15().catch((error) => console.error("ATELIER V15 PDP enhancement failed", error));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initFlagshipExperience().catch((error) => console.error("ATELIER V15 initialization failed", error));
  }, { once: true });
} else {
  initFlagshipExperience().catch((error) => console.error("ATELIER V15 initialization failed", error));
}
