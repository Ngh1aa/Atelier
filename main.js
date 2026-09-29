// ATELIER app entry — commerce behavior remains shared; V15 is an isolated flagship layer.
import "./src/js/app.js?v=atelier-v15";
import "./src/main.js?v=atelier-v15";
import { initCheckoutProgress, initMotionSystem } from "./src/js/motion-system.js?v=atelier-v15-motion2";
import { initPdpV15 } from "./src/js/pdp-v15.js?v=atelier-v15";

const FLAGSHIP_STYLESHEETS = [
  "./atelier-v15.css?v=flagship-20260915-motion2",
  "./atelier-v15-responsive.css?v=flagship-20260915-motion2",
  "./atelier-v15-accessibility.css?v=flagship-20260915-motion2",
  "./atelier-motion-editorial.css?v=visible-motion-20260917-2",
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

function initStateLabLauncher() {
  if (new URLSearchParams(window.location.search).get("lab") === "1") return;
  if (document.querySelector("[data-atelier-state-lab-launcher]")) return;

  const style = document.createElement("style");
  style.textContent = `
    .atelier-state-lab-launcher{position:fixed;right:18px;bottom:18px;z-index:9999;display:flex;align-items:center;gap:9px;border:1px solid #111;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);padding:10px 12px;color:#111;text-decoration:none;text-transform:uppercase;letter-spacing:.08em;font:600 9px/1 Arial,sans-serif;box-shadow:0 10px 24px rgba(0,0,0,.08)}
    .atelier-state-lab-launcher:before{content:"LAB";display:grid;place-items:center;min-width:30px;height:20px;background:#111;color:#fff;font-size:8px;letter-spacing:.12em}.atelier-state-lab-launcher:hover{background:#111;color:#fff}.atelier-state-lab-launcher:hover:before{background:#fff;color:#111}.atelier-state-lab-launcher:focus-visible{outline:2px solid #111;outline-offset:3px}.atelier-state-lab-launcher small{color:#707070;font:500 8px/1 Arial,sans-serif;letter-spacing:.05em}.atelier-state-lab-launcher:hover small{color:#d8d8d8}@media(max-width:720px){.atelier-state-lab-launcher{right:10px;bottom:12px;padding:8px 9px}.atelier-state-lab-launcher small{display:none}}
  `;
  document.head.appendChild(style);

  const link = document.createElement("a");
  link.href = "recruiter-state-lab.html?state=normal";
  link.className = "atelier-state-lab-launcher";
  link.dataset.atelierStateLabLauncher = "true";
  link.setAttribute("aria-label", "Open Recruiter State Lab for empty, loading, payment error and sold-out variant states");
  link.innerHTML = '<span>State Lab</span><small>Empty · Loading · Error · Edge</small>';
  document.body.appendChild(link);
}

async function initFlagshipExperience() {
  await ensureFlagshipStyles();
  initMotionSystem();
  initScrollState();
  initBackToTop();
  initCheckoutProgress();
  initStateLabLauncher();
  initPdpV15().catch((error) => console.error("ATELIER V15 PDP enhancement failed", error));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initFlagshipExperience().catch((error) => console.error("ATELIER V15 initialization failed", error));
  }, { once: true });
} else {
  initFlagshipExperience().catch((error) => console.error("ATELIER V15 initialization failed", error));
}
