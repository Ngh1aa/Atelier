import { formatVND, getWishlist, loadProducts, toggleWishlist } from "./commerce-store.js?v=ecommerce-2";
import { escapeHtml, openVariantPicker, showMessage } from "./commerce-ui.js?v=ecommerce-2";

export async function renderFavourite() {
  const grid = document.querySelector(".js-favourite-grid");
  const count = document.querySelector(".js-favourite-count");
  if (!grid) return;
  const products = await loadProducts();

  const paint = () => {
    const wishlist = getWishlist();
    const items = wishlist.map((saved) => ({ saved, product: products.find((product) => product.id === saved.productId) })).filter(({ product }) => product);
    if (count) count.textContent = `${items.length} item${items.length === 1 ? "" : "s"} saved`;
    if (!items.length) {
      grid.innerHTML = `<div class="saved-empty-state"><h2>No saved pieces yet.</h2><p>Keep considered pieces close while you decide.</p><a href="shop.html" class="btn-outline">Explore the collection <span aria-hidden="true">→</span></a></div>`;
      return;
    }
    grid.innerHTML = items.map(({ product, saved }) => `
      <article class="favourite-item" data-product-id="${escapeHtml(product.id)}">
        <a class="favourite-img" href="detailproduct.html?id=${encodeURIComponent(product.id)}"><img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}" loading="lazy"></a>
        <button class="btn-remove-wishlist" type="button" aria-label="Remove ${escapeHtml(product.name)}">×</button>
        <div class="favourite-info"><h3><a href="detailproduct.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3><p>${escapeHtml(product.collection)}</p><span class="favourite-price">${formatVND(product.price)}</span></div>
        <div class="favourite-actions"><button class="btn-add-to-cart js-saved-add" type="button" data-preferred-variant="${escapeHtml(saved.preferredVariantId || "")}">SELECT SIZE &amp; ADD</button></div>
      </article>`).join("");
    grid.querySelectorAll(".btn-remove-wishlist").forEach((button) => button.addEventListener("click", () => {
      const item = button.closest("[data-product-id]");
      toggleWishlist(item.dataset.productId);
      showMessage("Removed from Saved.");
      paint();
    }));
    grid.querySelectorAll(".js-saved-add").forEach((button) => button.addEventListener("click", () => {
      const item = button.closest("[data-product-id]");
      const product = products.find((entry) => entry.id === item.dataset.productId);
      if (product) openVariantPicker(product, { heading: "Select your size", preferredVariantId: button.dataset.preferredVariant || null });
    }));
  };

  paint();
  window.addEventListener("atelier:wishlist-updated", paint);
}
