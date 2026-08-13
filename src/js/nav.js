// Shared UI: bag badge, mobile hamburger menu, newsletter feedback
import { updateBagBadge } from "./shop.js";

function initNav() {
  updateBagBadge();

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
  if (!nav) return;
  const hamburger = document.createElement("button");
  hamburger.className = "hamburger-btn";
  hamburger.setAttribute("aria-label", "Toggle menu");
  hamburger.setAttribute("aria-expanded", "false");
  hamburger.innerHTML = '<span></span><span></span><span></span>';
  nav.querySelector(".container").appendChild(hamburger);

  hamburger.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("menu-open");
    hamburger.setAttribute("aria-expanded", String(isOpen));
  });

  // Close menu when clicking a link
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      nav.classList.remove("menu-open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });
}

export { initNav };
