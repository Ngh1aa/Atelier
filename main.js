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

  // Navbar background change on scroll
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.style.padding = '1rem 0';
      nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)';
    } else {
      nav.style.padding = '1.5rem 0';
      nav.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
    }
  });

  // Quantity Selector Logic
  const cartItems = document.querySelectorAll('.cart-item');
  cartItems.forEach(item => {
    const minusBtn = item.querySelector('.qty-btn.minus');
    const plusBtn = item.querySelector('.qty-btn.plus');
    const qtyVal = item.querySelector('.qty-val');
    const removeBtn = item.querySelector('.btn-remove');

    if (minusBtn && plusBtn && qtyVal) {
      minusBtn.addEventListener('click', () => {
        let currentQty = parseInt(qtyVal.textContent);
        if (currentQty > 1) {
          qtyVal.textContent = currentQty - 1;
        }
      });

      plusBtn.addEventListener('click', () => {
        let currentQty = parseInt(qtyVal.textContent);
        qtyVal.textContent = currentQty + 1;
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        item.style.opacity = '0';
        setTimeout(() => {
          item.remove();
        }, 300);
      });
    }
  });
});
