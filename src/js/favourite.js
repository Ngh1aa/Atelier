import { addCartItem, formatVND, getVariant, getWishlist, loadProducts, toggleWishlist } from "./commerce-store.js?v=full-prototype";
import { escapeHtml, openMiniBag, openVariantPicker, renderLoadError, showMessage } from "./commerce-ui.js?v=full-prototype";

export async function renderFavourite() {
  const grid = document.querySelector(".js-favourite-grid");
  const count = document.querySelector(".js-favourite-count");
  if (!grid) return;
  let products;
  try {
    products = await loadProducts();
  } catch {
    if (count) count.textContent = "Saved pieces unavailable";
    renderLoadError(grid, {
      title: "Your Saved pieces could not load.",
      message: "The catalogue request failed. Your Saved list is safe and nothing was removed.",
      onRetry: () => { grid.innerHTML = '<p class="saved-loading-state" role="status">Loading Saved pieces…</p>'; renderFavourite(); },
    });
    return;
  }

  // Saved → Bag: a remembered in-stock size goes straight to the Bag; otherwise the
  // shared size picker opens and the piece leaves Saved once it is added.
  const moveToBag = (product, saved) => {
    const preferred = getVariant(product, saved.preferredVariantId);
    if (preferred && preferred.stock > 0) {
      const result = addCartItem(product, preferred.id);
      if (result.ok) {
        toggleWishlist(product.id);
        showMessage(`${product.name} moved to your Bag.`);
        openMiniBag();
        return;
      }
    }
    openVariantPicker(product, {
      heading: "Select your size",
      preferredVariantId: saved.preferredVariantId || null,
      onAdded: () => { if (getWishlist().some((item) => item.productId === product.id)) toggleWishlist(product.id); },
    });
  };

  const paint = () => {
    const wishlist = getWishlist();
    const items = wishlist.map((saved) => ({ saved, product: products.find((product) => product.id === saved.productId) })).filter(({ product }) => product);
    if (count) count.textContent = `${items.length} item${items.length === 1 ? "" : "s"} saved`;
    if (!items.length) {
      if (!grid.querySelector(".saved-empty-state")) grid.innerHTML = `<div class="saved-empty-state"><h2>No saved pieces yet.</h2><p>Keep considered pieces close while you decide.</p><a href="shop.html" class="btn-outline">Explore the collection <span aria-hidden="true">→</span></a></div>`;
      return;
    }
    grid.innerHTML = items.map(({ product, saved }) => {
      const preferred = getVariant(product, saved.preferredVariantId);
      const soldOut = product.variants.every((variant) => variant.stock < 1);
      return `
      <article class="favourite-item" data-product-id="${escapeHtml(product.id)}">
        <a class="favourite-img" href="detailproduct.html?id=${encodeURIComponent(product.id)}"><img src="${escapeHtml(product.images[0])}" alt="${escapeHtml(product.name)}" loading="lazy"></a>
        <button class="btn-remove-wishlist" type="button" aria-label="Remove ${escapeHtml(product.name)}">×</button>
        <div class="favourite-info"><h3><a href="detailproduct.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3><p>${escapeHtml(preferred ? `${preferred.colorName}, size ${preferred.size}` : product.collection)}</p><span class="favourite-price">${formatVND(product.price)}</span></div>
        <div class="favourite-actions"><button class="btn-add-to-cart js-saved-add" type="button" ${soldOut ? "disabled" : ""}>${soldOut ? "Sold out" : "Move to Bag"}</button></div>
      </article>`;
    }).join("");

    grid.querySelectorAll(".btn-remove-wishlist").forEach((button) => button.addEventListener("click", () => {
      const item = button.closest("[data-product-id]");
      toggleWishlist(item.dataset.productId);
      showMessage("Removed from Saved.");
      paint();
    }));
    grid.querySelectorAll(".js-saved-add").forEach((button) => button.addEventListener("click", () => {
      const item = button.closest("[data-product-id]");
      const product = products.find((entry) => entry.id === item.dataset.productId);
      const saved = getWishlist().find((entry) => entry.productId === item.dataset.productId);
      if (product && saved) moveToBag(product, saved);
    }));
  };

  paint();
  window.addEventListener("atelier:wishlist-updated", paint);
}
