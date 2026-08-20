// Fashion - The Armor of Reality
// Main entry point - currently no JavaScript modules needed
// UI/UX review overlay: press Q + W + E together to toggle.
import { createUIFeedback } from './ui-feedback.js?v=ui-feedback-v0.9.0-minimalism';
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
