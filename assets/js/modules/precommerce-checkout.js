import { formatVND } from './shop.js';

const CART_KEY = 'atelier.cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '{}');
  } catch {
    return {};
  }
}

export async function initPrecommerceCheckout() {
  const itemWrap = document.querySelector('.js-checkout-items');
  const subtotal = document.querySelector('.js-checkout-subtotal');
  const total = document.querySelector('.js-checkout-total');
  const notice = document.querySelector('.js-checkout-notice');
  if (!itemWrap || !subtotal || !total) return;

  const response = await fetch('./assets/data/products.json');
  const products = await response.json();
  const cart = getCart();
  const entries = Object.entries(cart)
    .map(([id, quantity]) => ({ product: products.find((product) => product.id === id), quantity: Number(quantity) }))
    .filter(({ product, quantity }) => product && quantity > 0);

  const amount = entries.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0);

  if (!entries.length) {
    itemWrap.innerHTML = `
      <div class="precommerce-empty">
        <p>Your Bag is currently empty.</p>
        <a class="btn-outline" href="shop.html">Explore the catalogue <span aria-hidden="true">→</span></a>
      </div>`;
    if (notice) notice.textContent = 'Build a considered selection in your Bag, then return here to review its catalogue value. No order or payment will be created from this page.';
  } else {
    itemWrap.innerHTML = entries.map(({ product, quantity }) => `
      <a class="precommerce-item" href="detailproduct.html?id=${encodeURIComponent(product.id)}">
        <img src="${product.images[0]}" alt="${product.name}">
        <span class="precommerce-item-copy"><strong>${product.name}</strong><small>Quantity ${quantity}</small></span>
        <span>${formatVND(product.price * quantity)}</span>
      </a>`).join('');
    if (notice) notice.textContent = 'Your Bag is saved on this device. Prices are catalogue references; no order or payment will be created from this page.';
  }

  subtotal.textContent = formatVND(amount);
  total.textContent = formatVND(amount);
}
