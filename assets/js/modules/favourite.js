// Wishlist page: render from localStorage
import { getWishlist, addToCart, toggleWishlist, formatVND } from "./shop.js";

function saveWishlist(list) {
  localStorage.setItem("atelier.wishlist", JSON.stringify(list));
}

let products = [];

async function renderFavourite() {
  const grid = document.querySelector(".js-favourite-grid");
  const title = document.querySelector(".js-favourite-count");
  if (!grid) return;

  const res = await fetch("./assets/data/products.json");
  products = await res.json();

  const list = getWishlist();
  const items = list.map((id) => products.find((p) => p.id === id)).filter(Boolean);

  if (title) {
    title.textContent = `${items.length} item${items.length !== 1 ? "s" : ""} saved`;
  }

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem 0;">
        <p style="color:#a0a0a0;margin-bottom:2rem;">You haven't saved anything yet.</p>
        <a href="shop.html" class="btn-shop" style="display:inline-block;padding:1rem 2.5rem;border:1px solid rgba(255,255,255,0.3);color:#fff;text-decoration:none;font-size:0.85rem;letter-spacing:1px;text-transform:uppercase;">Explore the Shop</a>
      </div>`;
    return;
  }

  grid.innerHTML = items
    .map(
      (p) => `
    <div class="favourite-item js-favourite-item" data-product-id="${p.id}">
      <div class="favourite-img">
        <img src="${p.images[0]}" alt="${p.name}">
        <button class="btn-remove-wishlist" aria-label="Remove from saved">&times;</button>
      </div>
      <div class="favourite-info">
        <h3>${p.name}</h3>
        <p>${p.collection}</p>
        <span class="favourite-price">${formatVND(p.price)}</span>
      </div>
      <div class="favourite-actions">
        <button class="btn-add-to-cart js-add-to-cart-btn" data-product-id="${p.id}">ADD TO CART</button>
      </div>
    </div>`
    )
    .join("");

  grid.querySelectorAll(".btn-remove-wishlist").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".js-favourite-item");
      const id = item.dataset.productId;
      item.style.transition = "opacity 0.3s ease";
      item.style.opacity = "0";
      setTimeout(() => toggleWishlist(id), 300);
      setTimeout(() => renderFavourite(), 350);
    });
  });

  grid.querySelectorAll(".js-add-to-cart-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.target.textContent = "Added";
      addToCart(btn.dataset.productId);
      setTimeout(() => {
        e.target.textContent = "ADD TO CART";
      }, 1200);
    });
  });
}

export { renderFavourite };
