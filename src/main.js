// Fashion - The Armor of Reality
// Main entry point - currently no JavaScript modules needed
// UI/UX review overlay: press Q + W + E together to toggle.
import { createUIFeedback } from './ui-feedback.js?v=4ef8421';
createUIFeedback({
  storageKey: 'atelier-ui-feedback',
  githubRepo: 'Ngh1aa/Atelier',
});


function bindAtelierImageFallbacks() {
  document.querySelectorAll("img[data-fallback-src]").forEach((img) => {
    if (img.dataset.fallbackBound) return;
    img.dataset.fallbackBound = "true";
    img.addEventListener("error", () => {
      const fallback = img.dataset.fallbackSrc;
      if (!fallback || img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = "true";
      img.removeAttribute("srcset");
      img.src = fallback;
    }, { once: true });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bindAtelierImageFallbacks, { once: true });
} else {
  bindAtelierImageFallbacks();
}

function initAtelierMotionSystem() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const selector = [
    "main > section",
    ".product-card",
    ".collection-item",
    ".editorial-img",
    ".editorial-content",
    ".service-card",
    ".guide-card",
  ].join(",");
  let observer;

  document.documentElement.classList.add("atelier-motion-ready");

  const prepare = (scope = document) => {
    const nodes = [
      ...(scope instanceof Element && scope.matches(selector) ? [scope] : []),
      ...scope.querySelectorAll(selector),
    ];

    nodes.forEach((node) => {
      if (node.dataset.atelierMotionReady === "true") return;
      node.dataset.atelierMotionReady = "true";
      node.classList.add("atelier-motion-item");

      const siblings = [...node.parentElement.children].filter((child) => child.matches?.(selector));
      const index = Math.max(0, siblings.indexOf(node));
      node.style.setProperty("--atelier-motion-delay", `${Math.min(index, 5) * 70}ms`);

      if (node.matches("main > section:first-of-type") || reducedMotion || !observer) {
        node.classList.add("is-motion-visible");
      } else {
        observer.observe(node);
      }
    });
  };

  if (!reducedMotion && "IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-motion-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
  }

  prepare();

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node instanceof Element) prepare(node);
    }));
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

function initAtelierMarqueeControl() {
  const marquee = document.querySelector(".atelier-marquee");
  if (!marquee) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  marquee.setAttribute("role", "button");
  marquee.tabIndex = 0;

  const setPaused = (paused) => {
    marquee.classList.toggle("is-paused", paused);
    marquee.setAttribute("aria-pressed", String(paused));
    marquee.setAttribute("aria-label", paused
      ? "Play Atelier journal animation"
      : "Pause Atelier journal animation");
  };

  setPaused(reducedMotion);
  const toggle = () => setPaused(!marquee.classList.contains("is-paused"));
  marquee.addEventListener("click", toggle);
  marquee.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggle();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initAtelierMotionSystem();
    initAtelierMarqueeControl();
  }, { once: true });
} else {
  initAtelierMotionSystem();
  initAtelierMarqueeControl();
}
