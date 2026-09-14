// Shared non-commerce utilities. V15 motion is owned by src/js/motion-system.js.
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

function initUtilities() {
  bindAtelierImageFallbacks();
  initAtelierMarqueeControl();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUtilities, { once: true });
} else {
  initUtilities();
}
