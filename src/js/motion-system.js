const MOTION_SELECTOR = [
  ".home-campaign-v14__media",
  ".home-campaign-v14__panel",
  ".moment-card",
  ".edit-card",
  ".lookbook-chapter__media",
  ".lookbook-chapter__copy",
  ".product-grid-item",
  ".product-main-image",
  ".related-item",
  ".checkout-section",
].join(",");

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function prepareMotionNode(node, observer, reducedMotion) {
  if (!(node instanceof Element) || node.dataset.atelierMotionReady === "true") return;
  node.dataset.atelierMotionReady = "true";
  node.classList.add("atelier-motion-item");

  if (node.matches(".home-campaign-v14__media, .lookbook-chapter__media, .product-main-image")) {
    node.dataset.motion = "image-reveal";
  }

  const siblings = node.parentElement
    ? [...node.parentElement.children].filter((child) => child.matches?.(MOTION_SELECTOR))
    : [];
  const index = Math.max(0, siblings.indexOf(node));
  node.style.setProperty("--atelier-motion-delay", `${Math.min(index, 4) * 55}ms`);

  if (reducedMotion || !observer || node.matches("main > :first-child, .home-campaign-v14__media, .home-campaign-v14__panel")) {
    node.classList.add("is-motion-visible");
    return;
  }
  observer.observe(node);
}

export function initMotionSystem() {
  const reducedMotion = prefersReducedMotion();
  let observer = null;

  if (!reducedMotion && "IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-motion-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  }

  const prepare = (scope = document) => {
    if (scope instanceof Element && scope.matches(MOTION_SELECTOR)) {
      prepareMotionNode(scope, observer, reducedMotion);
    }
    scope.querySelectorAll?.(MOTION_SELECTOR).forEach((node) => prepareMotionNode(node, observer, reducedMotion));
  };

  prepare();

  const mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
      if (node instanceof Element) prepare(node);
    }));
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });

  return () => {
    observer?.disconnect();
    mutationObserver.disconnect();
  };
}

function currentCheckoutIndex(sections, activeSection) {
  return Math.max(0, sections.indexOf(activeSection));
}

export function initCheckoutProgress() {
  const header = document.querySelector(".checkout-header");
  const sections = [...document.querySelectorAll(".checkout-form-section .checkout-section")];
  if (!header || sections.length < 2 || document.querySelector(".checkout-progress")) return;

  const progress = document.createElement("nav");
  progress.className = "checkout-progress";
  progress.setAttribute("aria-label", "Checkout progress");
  progress.innerHTML = sections.map((section, index) => {
    const label = section.querySelector("h2")?.textContent?.trim() || `Step ${index + 1}`;
    return `<span data-checkout-progress="${index}"${index === 0 ? ' class="is-current" aria-current="step"' : ""}>${String(index + 1).padStart(2, "0")} ${label}</span>`;
  }).join("");
  header.insertAdjacentElement("afterend", progress);

  const indicators = [...progress.querySelectorAll("[data-checkout-progress]")];
  const setCurrent = (index) => {
    indicators.forEach((indicator, itemIndex) => {
      const current = itemIndex === index;
      indicator.classList.toggle("is-current", current);
      if (current) indicator.setAttribute("aria-current", "step");
      else indicator.removeAttribute("aria-current");
    });
  };

  sections.forEach((section) => {
    section.addEventListener("focusin", () => setCurrent(currentCheckoutIndex(sections, section)));
  });

  if (!prefersReducedMotion() && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setCurrent(currentCheckoutIndex(sections, visible.target));
    }, { threshold: [0.35, 0.6], rootMargin: "-12% 0px -48% 0px" });
    sections.forEach((section) => sectionObserver.observe(section));
  }
}
