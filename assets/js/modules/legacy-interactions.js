// Shared visual interactions retained from the original static entrypoint.
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("active");
  });
}, observerOptions);

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
  const nav = document.querySelector("nav");
  if (nav) {
    window.addEventListener("scroll", () => {
      nav.style.padding = window.scrollY > 50 ? "1rem 0" : "1.5rem 0";
      nav.style.borderBottom = window.scrollY > 50 ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(255, 255, 255, 0.1)";
    }, { passive: true });
  }
  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("visible", window.scrollY > 600);
    }, { passive: true });
  }

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
});
