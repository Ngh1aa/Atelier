// ATELIER app entry — commerce behavior remains shared; V15 is an isolated flagship layer.
import "./atelier-v15.css?v=flagship-20260914";
import "./atelier-v15-responsive.css?v=flagship-20260914";
import "./src/js/app.js?v=atelier-v15";
import "./src/main.js?v=atelier-v15";
import { initCheckoutProgress, initMotionSystem } from "./src/js/motion-system.js?v=atelier-v15";
import { initPdpV15 } from "./src/js/pdp-v15.js?v=atelier-v15";

document.documentElement.dataset.atelierStyle = "luxury-monochrome";
document.documentElement.dataset.atelierVersion = "v15";

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

function initFlagshipExperience() {
  initReveal();
  initScrollState();
  initBackToTop();
  initMotionSystem();
  initCheckoutProgress();
  initPdpV15().catch((error) => console.error("ATELIER V15 PDP enhancement failed", error));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initFlagshipExperience, { once: true });
} else {
  initFlagshipExperience();
}
