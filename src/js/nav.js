// Shared navigation: search, Bag indicator, commerce drawer and accessible mobile menu
import { initBagBadge, initCommerceUi, initSearchOverlay } from "./nav-ui.js?v=white-editorial-v6";

function initNav() {
  const nav = document.querySelector("body > nav");
  if (!nav || nav.classList.contains("checkout-nav")) return;

  initBagBadge();
  initCommerceUi();
  initSearchOverlay();

  if (nav.dataset.mobileNavReady === "true") return;
  nav.dataset.mobileNavReady = "true";

  const navContainer = nav.querySelector(".container");
  const navLinks = nav.querySelector(".nav-links");
  if (!navContainer || !navLinks) return;

  navLinks.id = "atelier-mobile-menu";
  const hamburger = document.createElement("button");
  hamburger.className = "hamburger-btn";
  hamburger.type = "button";
  hamburger.setAttribute("aria-label", "Open menu");
  hamburger.setAttribute("aria-expanded", "false");
  hamburger.setAttribute("aria-controls", navLinks.id);
  hamburger.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
  navContainer.appendChild(hamburger);

  const syncMenuSurface = (isOpen) => {
    if (window.innerWidth > 820) {
      navLinks.style.removeProperty("position");
      navLinks.style.removeProperty("inset");
      navLinks.style.removeProperty("z-index");
      navLinks.style.removeProperty("width");
      navLinks.style.removeProperty("height");
      navLinks.style.removeProperty("min-height");
      navLinks.style.removeProperty("padding");
      navLinks.style.removeProperty("background");
      navLinks.style.removeProperty("overflow-y");
      navLinks.style.removeProperty("overscroll-behavior");
      navLinks.style.removeProperty("transform");
      return;
    }

    if (!isOpen) {
      navLinks.style.removeProperty("position");
      navLinks.style.removeProperty("inset");
      navLinks.style.removeProperty("z-index");
      navLinks.style.removeProperty("width");
      navLinks.style.removeProperty("height");
      navLinks.style.removeProperty("min-height");
      navLinks.style.removeProperty("padding");
      navLinks.style.removeProperty("background");
      navLinks.style.removeProperty("overflow-y");
      navLinks.style.removeProperty("overscroll-behavior");
      navLinks.style.removeProperty("transform");
      return;
    }

    Object.assign(navLinks.style, {
      position: "fixed",
      inset: "var(--nav-h) 0 0 0",
      zIndex: "1100",
      width: "100vw",
      height: "calc(100dvh - var(--nav-h))",
      minHeight: "calc(100vh - var(--nav-h))",
      padding: "1.5rem var(--gutter) 3rem",
      background: "#fff",
      overflowY: "auto",
      overscrollBehavior: "contain",
      transform: "translateX(0)",
    });
  };

  const setMenuOpen = (isOpen, moveFocus = false) => {
    nav.classList.toggle("menu-open", isOpen);
    document.body.classList.toggle("atelier-menu-open", isOpen);
    hamburger.setAttribute("aria-expanded", String(isOpen));
    hamburger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    syncMenuSurface(isOpen);
    if (moveFocus && isOpen) navLinks.querySelector("a")?.focus();
  };

  hamburger.addEventListener("click", () => setMenuOpen(!nav.classList.contains("menu-open"), true));
  navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));

  document.addEventListener("keydown", (event) => {
    if (!nav.classList.contains("menu-open")) return;
    if (event.key === "Escape") {
      setMenuOpen(false);
      hamburger.focus();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [hamburger, ...navLinks.querySelectorAll("a[href]")].filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 820 && nav.classList.contains("menu-open")) setMenuOpen(false);
    else syncMenuSurface(nav.classList.contains("menu-open"));
  }, { passive: true });
}

export { initNav };
