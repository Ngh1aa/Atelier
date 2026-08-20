// Cart page: render from localStorage, qty controls, totals
import { getCart, updateBagBadge, toggleWishlist, formatVND } from "./shop.js";

function saveCart(cart) {
  localStorage.setItem("atelier.cart", JSON.stringify(cart));
}

const STORAGE_KEY = "atelier.cart";

let products = [];

function cartItemsList() {
  return document.querySelector(".js-cart-items-list");
}

function emptyState() {
  return `
    <div class="js-empty-cart" style="padding:4rem 0;text-align:center;">
      <p style="color:#a0a0a0;margin-bottom:2rem;">Your bag is currently empty.</p>
      <a href="shop.html" class="btn-shop" style="display:inline-block;padding:1rem 2.5rem;border:1px solid rgba(255,255,255,0.3);color:#fff;text-decoration:none;font-size:0.85rem;letter-spacing:1px;text-transform:uppercase;">Continue Shopping</a>
    </div>`;
}

async function renderCart() {
  const list = cartItemsList();
  if (!list) return;
  try {
  const res = await fetch("./assets/data/products.json");
  products = await res.json();

  const cart = getCart();
  const ids = Object.keys(cart);

  if (ids.length === 0) {
    list.innerHTML = emptyState();
    updateSummary(0);
    updateBagBadge();
    return;
  }

  list.innerHTML = ids
    .map((id) => {
      const p = products.find((x) => x.id === id);
      if (!p) return "";
      const qty = cart[id];
      return `
      <div class="cart-item js-cart-item" data-product-id="${p.id}">
        <div class="cart-item-img">
          <img src="${p.images[0]}" alt="${p.name}">
        </div>
        <div class="cart-item-info">
          <h3>${p.name}</h3>
          <p>${p.collection} | Size: ${p.sizes[0]}</p>
        </div>
        <div class="qty-selector">
          <button class="qty-btn minus" aria-label="Decrease quantity">-</button>
          <span class="qty-val">${qty}</span>
          <button class="qty-btn plus" aria-label="Increase quantity">+</button>
        </div>
        <div class="cart-item-price">${formatVND(p.price * qty)}</div>
        <button class="btn-remove" aria-label="Remove item">&times;</button>
      </div>`;
    })
    .join("");

  const total = ids.reduce((s, id) => {
    const p = products.find((x) => x.id === id);
    return s + (p ? p.price * cart[id] : 0);
  }, 0);

  updateSummary(total);
  bindCartEvents();
  updateBagBadge();
  } catch (err) {
    console.error('[atelier cart] render failed', err);
  }
}

function updateSummary(total) {
  const rows = document.querySelectorAll(".js-summary-subtotal, .js-summary-total");
  rows.forEach((el) => {
    el.textContent = total > 0 ? formatVND(total) : "0$";
  });
}

function persistAndRebind() {
  saveCart(getCart());
  const ids = Object.keys(getCart());
  if (ids.length === 0) {
    const list = cartItemsList();
    if (list) list.innerHTML = emptyState();
    updateSummary(0);
  }
  updateBagBadge();
}

function bindCartEvents() {
  document.querySelectorAll(".js-cart-item").forEach((item) => {
    const minus = item.querySelector(".qty-btn.minus");
    const plus = item.querySelector(".qty-btn.plus");
    const val = item.querySelector(".qty-val");
    const remove = item.querySelector(".btn-remove");

    minus.addEventListener("click", () => {
      let q = parseInt(val.textContent);
      if (q > 1) {
        q -= 1;
        val.textContent = q;
        const cart = getCart();
        cart[item.dataset.productId] = q;
        saveCart(cart);
        const p = products.find((x) => x.id === item.dataset.productId);
        if (p) item.querySelector(".cart-item-price").textContent = formatVND(p.price * q);
        updateSummary(Object.entries(getCart()).reduce((s, [id, qq]) => {
          const pp = products.find((x) => x.id === id);
          return s + (pp ? pp.price * qq : 0);
        }, 0));
        updateBagBadge();
      }
    });

    plus.addEventListener("click", () => {
      let q = parseInt(val.textContent) + 1;
      val.textContent = q;
      const cart = getCart();
      cart[item.dataset.productId] = q;
      saveCart(cart);
      const p = products.find((x) => x.id === item.dataset.productId);
      if (p) item.querySelector(".cart-item-price").textContent = formatVND(p.price * q);
      updateSummary(Object.entries(getCart()).reduce((s, [id, qq]) => {
        const pp = products.find((x) => x.id === id);
        return s + (pp ? pp.price * qq : 0);
      }, 0));
      updateBagBadge();
    });

    remove.addEventListener("click", () => {
      item.style.transition = "opacity 0.3s ease";
      item.style.opacity = "0";
      setTimeout(() => {
        const cart = getCart();
        delete cart[item.dataset.productId];
        saveCart(cart);
        persistAndRebind();
      }, 300);
    });
  });
}

export { renderCart };
