// Shared UI: bag badge, search overlay, mobile hamburger menu, newsletter feedback
import { initBagBadge, initCommerceUi, initSearchOverlay } from "./nav-ui.js?v=ecommerce-1";

function initNav() {
  initBagBadge();
  initCommerceUi();
  initSearchOverlay();

  // Newsletter form feedback
  document.querySelectorAll(".newsletter-form").forEach((form) => {
    const input = form.querySelector('input[type="email"]');
    const button = form.querySelector("button");
    if (!input || !button) return;
    button.addEventListener("click", () => {
      if (input.value && input.validity.valid) {
        const original = button.textContent;
        button.textContent = "\u2713";
        input.value = "";
        input.placeholder = "Thank you — you're on the list.";
        setTimeout(() => {
          button.textContent = original;
          input.placeholder = "Your email address";
        }, 2500);
      }
    });
  });

  // Hamburger menu (mobile)
  const nav = document.querySelector("nav");
  if (!nav || nav.dataset.mobileNavReady === "true") return;
  nav.dataset.mobileNavReady = "true";
  const navContainer = nav.querySelector(".container");
  const navLinks = nav.querySelector(".nav-links");
  if (!navContainer || !navLinks) return;

  navLinks.id = "atelier-mobile-menu";
  const hamburger = document.createElement("button");
  hamburger.className = "hamburger-btn";
  hamburger.setAttribute("type", "button");
  hamburger.setAttribute("aria-label", "Open menu");
  hamburger.setAttribute("aria-expanded", "false");
  hamburger.setAttribute("aria-controls", navLinks.id);
  hamburger.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
  navContainer.appendChild(hamburger);

  const setMenuOpen = (isOpen, moveFocus = false) => {
    nav.classList.toggle("menu-open", isOpen);
    document.body.classList.toggle("atelier-menu-open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    if (moveFocus) navLinks.querySelector("a")?.focus();
  };

  hamburger.addEventListener("click", () => setMenuOpen(!nav.classList.contains("menu-open"), true));

  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("menu-open")) {
      setMenuOpen(false);
      hamburger.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && nav.classList.contains("menu-open")) setMenuOpen(false);
  });
}

export { initNav };
