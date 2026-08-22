// App entry: bootstrap reveal animations + per-page commerce modules
import "./src/js/app.js?v=ecommerce-1";
import "./src/main.js?v=0.13.0";

// Scroll Reveal Animation
const observerOptions = {
  threshold: 0.1
};
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, observerOptions);
document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal');
  revealElements.forEach(el => observer.observe(el));

  // Navbar background change on scroll
  const nav = document.querySelector('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        nav.style.padding = '1rem 0';
        nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
      } else {
        nav.style.padding = '1.5rem 0';
        nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
      }
    });
  }

  // Back to top button
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
  }
});
