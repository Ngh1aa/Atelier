// Shared non-commerce utilities. V15 motion is owned by src/js/motion-system.js.
import { createUIFeedback } from './ui-feedback.js?v=4ef8421';

createUIFeedback({
  storageKey: 'atelier-ui-feedback',
  githubRepo: 'Ngh1aa/Atelier',
});

function normalizeFeedbackAccessibility() {
  const host = document.getElementById("ui-feedback-host");
  const markerLayer = host?.shadowRoot?.querySelector(".ui-feedback-marker-layer");
  // The marker buttons own their accessible names. A generic marker layer must not
  // carry aria-label without an allowed semantic role.
  markerLayer?.removeAttribute("aria-label");
}

function normalizePortfolioEvidenceAccessibility() {
  if (!document.body.classList.contains("system-page")) return;

  // Token cards are visual reference cards, not definition-list data. Normalize
  // legacy dt/dd markup at runtime so the rendered evidence uses valid semantics.
  document.querySelectorAll(".token-card dt").forEach((term) => {
    const replacement = document.createElement("p");
    replacement.className = "token-term";
    replacement.innerHTML = term.innerHTML;
    term.replaceWith(replacement);
  });
  document.querySelectorAll(".token-card dd").forEach((detail) => {
    const replacement = document.createElement("p");
    replacement.className = "token-detail";
    replacement.innerHTML = detail.innerHTML;
    detail.replaceWith(replacement);
  });
  document.querySelectorAll("dl.token-grid").forEach((list) => {
    const replacement = document.createElement("div");
    replacement.className = list.className;
    [...list.attributes].forEach((attribute) => {
      if (attribute.name !== "class") replacement.setAttribute(attribute.name, attribute.value);
    });
    while (list.firstChild) replacement.appendChild(list.firstChild);
    list.replaceWith(replacement);
  });
  document.querySelectorAll('.token-card[style*="surface-inverse"]').forEach((card) => card.classList.add("is-inverse-token"));

  const stateMatrixScroll = document.querySelector('section[aria-labelledby="matrix-title"] > div:nth-child(2)');
  if (stateMatrixScroll && stateMatrixScroll.scrollWidth > stateMatrixScroll.clientWidth) {
    stateMatrixScroll.tabIndex = 0;
    stateMatrixScroll.dataset.keyboardScrollRegion = "true";
    stateMatrixScroll.setAttribute("role", "region");
    stateMatrixScroll.setAttribute("aria-label", "Component state coverage matrix");
  }
}

function bindFilterCloseKeyboardGuard() {
  document.addEventListener("keydown", (event) => {
    const close = event.target instanceof Element ? event.target.closest(".js-filter-close") : null;
    if (!close || (event.key !== "Enter" && event.key !== " ")) return;
    // Prevent native key activation from firing again after the filter close
    // handler restores focus to the trigger.
    event.preventDefault();
    close.click();
  }, true);
}

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
  normalizeFeedbackAccessibility();
  normalizePortfolioEvidenceAccessibility();
  bindFilterCloseKeyboardGuard();
  bindAtelierImageFallbacks();
  initAtelierMarqueeControl();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUtilities, { once: true });
} else {
  initUtilities();
}
