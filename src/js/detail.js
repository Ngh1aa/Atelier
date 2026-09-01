import {
  addCartItem,
  addRecentlyViewed,
  findVariant,
  formatVND,
  getAvailableSizes,
  getDeliveryWindow,
  isWishlisted,
  loadProducts,
  toggleWishlist,
  track,
} from "./commerce-store.js?v=white-editorial-v6";
import { escapeHtml, openMiniBag, openSizeGuide, showMessage } from "./commerce-ui.js?v=white-editorial-v6";

export async function renderDetail() {
  const products = await loadProducts();
  const requestedId = new URLSearchParams(window.location.search).get("id");
  const product = products.find((item) => item.id === requestedId) || products.find((item) => item.id === "silk-midnight-gown") || products[0];
  if (!product) return;

  addRecentlyViewed(product.id);
  track("view_item", { product_id: product.id, value: product.price, currency: "VND" });

  const params = new URLSearchParams(window.location.search);
  let selectedColor = product.colors.some((color) => color.value === params.get("color")) ? params.get("color") : product.colors[0].value;
  let selectedSize = product.requiresSize ? null : "One Size";

  const title = document.querySelector(".js-product-title");
  const price = document.querySelector(".js-product-price");
  const description = document.querySelector(".js-product-description p");
  const mainImage = document.querySelector("#main-product-img");
  const thumbnails = document.querySelector(".js-thumbnail-gallery");
  const sizeOptions = document.querySelector(".js-size-options");
  const colorOptions = document.querySelector(".js-color-options");
  const colorLabel = document.querySelector(".js-color-label");
  const selectionError = document.querySelector(".js-pdp-selection-error");
  const addButton = document.querySelector(".js-btn-add-cart");
  const wishlistButton = document.querySelector(".js-btn-wishlist");
  if (!title || !price || !description || !mainImage || !thumbnails || !sizeOptions || !colorOptions || !colorLabel || !selectionError || !addButton || !wishlistButton) return;

  document.title = `${product.name} — ATELIER`;
  title.textContent = product.name;
  price.textContent = formatVND(product.price);
  description.textContent = product.description;
  document.querySelector(".collection-name").textContent = product.collection;
  document.querySelector(".js-product-fit").textContent = product.fit;
  document.querySelector(".js-product-model").textContent = product.model;
  document.querySelector(".js-product-material").textContent = product.material;
  document.querySelector(".js-product-care").textContent = product.care;
  document.querySelector(".js-product-origin").textContent = product.origin;
  document.querySelector(".js-delivery-window").textContent = `Estimated ${getDeliveryWindow(false)}`;
  document.querySelector(".js-return-summary").textContent = product.returnPolicy;

  const breadcrumb = document.querySelector(".js-breadcrumb");
  if (breadcrumb) breadcrumb.innerHTML = `<a href="shop.html">Shop</a><span aria-hidden="true">/</span><a href="shop.html?collection=${encodeURIComponent(product.collection.toLowerCase())}">${escapeHtml(product.collection)}</a><span aria-hidden="true">/</span><span>${escapeHtml(product.name)}</span>`;

  const renderGallery = () => {
    mainImage.src = product.images[0];
    mainImage.alt = product.name;
    mainImage.removeAttribute("srcset");
    thumbnails.innerHTML = product.images.map((source, index) => `<button type="button" class="pdp-thumbnail${index === 0 ? " is-active" : ""}" aria-label="View image ${index + 1}"><img src="${escapeHtml(source)}" alt="${escapeHtml(product.name)} view ${index + 1}" loading="${index ? "lazy" : "eager"}"></button>`).join("");
    thumbnails.querySelectorAll("button").forEach((button, index) => button.addEventListener("click", () => {
      mainImage.src = product.images[index];
      thumbnails.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
    }));
  };

  const syncUrl = () => {
    const next = new URLSearchParams(location.search);
    next.set("id", product.id);
    next.set("color", selectedColor);
    history.replaceState({}, "", `${location.pathname}?${next.toString()}`);
  };

  let sticky;
  const syncSticky = () => {
    if (!sticky) return;
    sticky.querySelector("span").textContent = selectedSize ? `Size ${selectedSize}` : "Select size";
  };

  const renderSizes = () => {
    const sizes = getAvailableSizes(product, selectedColor);
    if (!sizes.some((item) => item.size === selectedSize && item.stock > 0)) selectedSize = product.requiresSize ? null : "One Size";
    sizeOptions.innerHTML = sizes.map(({ size, stock }) => `<button type="button" data-size="${escapeHtml(size)}" class="${size === selectedSize ? "is-selected" : ""}" aria-pressed="${size === selectedSize}" ${stock < 1 ? `disabled aria-label="${escapeHtml(size)}, unavailable"` : ""}>${escapeHtml(size)}</button>`).join("");
    sizeOptions.querySelectorAll("button:not(:disabled)").forEach((button) => button.addEventListener("click", () => {
      selectedSize = button.dataset.size;
      selectionError.textContent = "";
      sizeOptions.querySelectorAll("button").forEach((item) => {
        item.classList.toggle("is-selected", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });
      syncSticky();
      track("select_size", { product_id: product.id, size: selectedSize });
    }));
    syncSticky();
  };

  const renderColors = () => {
    colorLabel.textContent = product.colors.find((color) => color.value === selectedColor)?.name || "";
    colorOptions.innerHTML = product.colors.map((color) => `<button type="button" class="pdp-color-option${color.value === selectedColor ? " is-selected" : ""}" data-color="${escapeHtml(color.value)}" aria-pressed="${color.value === selectedColor}"><i style="--swatch:${escapeHtml(color.hex)}"></i><span>${escapeHtml(color.name)}</span></button>`).join("");
    colorOptions.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
      selectedColor = button.dataset.color;
      colorLabel.textContent = product.colors.find((color) => color.value === selectedColor)?.name || "";
      colorOptions.querySelectorAll("button").forEach((item) => {
        item.classList.toggle("is-selected", item === button);
        item.setAttribute("aria-pressed", String(item === button));
      });
      selectionError.textContent = "";
      renderSizes();
      syncUrl();
      track("select_color", { product_id: product.id, color: selectedColor });
    }));
  };

  const addSelection = () => {
    const variant = selectedSize ? findVariant(product, selectedColor, selectedSize) : null;
    if (!variant) {
      selectionError.textContent = "Please select a size.";
      sizeOptions.querySelector("button:not(:disabled)")?.focus();
      return;
    }
    const result = addCartItem(product, variant.id);
    if (!result.ok) {
      selectionError.textContent = result.message;
      return;
    }
    selectionError.textContent = "";
    openMiniBag();
  };

  const syncWishlist = () => {
    const saved = isWishlisted(product.id);
    wishlistButton.classList.toggle("is-saved", saved);
    wishlistButton.setAttribute("aria-pressed", String(saved));
    wishlistButton.textContent = saved ? "♥ Saved" : "♡ Save";
  };

  renderGallery();
  renderColors();
  renderSizes();
  syncWishlist();
  syncUrl();

  addButton.addEventListener("click", addSelection);
  wishlistButton.addEventListener("click", () => {
    const variant = selectedSize ? findVariant(product, selectedColor, selectedSize) : null;
    const saved = toggleWishlist(product.id, variant?.id || null);
    syncWishlist();
    showMessage(saved ? "Saved." : "Removed from Saved.");
  });
  document.querySelector(".js-pdp-size-guide")?.addEventListener("click", () => {
    track("open_size_guide", { product_id: product.id });
    openSizeGuide();
  });

  const relatedWrap = document.querySelector(".js-related-grid");
  if (relatedWrap) {
    const related = products
      .filter((item) => item.id !== product.id)
      .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
      .slice(0, 4);
    relatedWrap.innerHTML = related.map((item) => `<a class="related-item" href="detailproduct.html?id=${encodeURIComponent(item.id)}"><img loading="lazy" src="${escapeHtml(item.images[0])}" alt="${escapeHtml(item.name)}"><h4>${escapeHtml(item.name)}</h4><p>${formatVND(item.price)}</p></a>`).join("");
  }

  sticky = document.createElement("div");
  sticky.className = "mobile-purchase-bar";
  sticky.innerHTML = `<span>${selectedSize ? `Size ${escapeHtml(selectedSize)}` : "Select size"}</span><button type="button">Add to Bag</button>`;
  sticky.querySelector("button").addEventListener("click", addSelection);
  document.body.appendChild(sticky);

  const updateStickyVisibility = () => {
    sticky.classList.toggle("is-visible", addButton.getBoundingClientRect().bottom < 0);
  };
  let stickyFrame = 0;
  const requestStickyUpdate = () => {
    if (stickyFrame) return;
    stickyFrame = window.requestAnimationFrame(() => {
      stickyFrame = 0;
      updateStickyVisibility();
    });
  };
  updateStickyVisibility();
  window.addEventListener("scroll", requestStickyUpdate, { passive: true });
  window.addEventListener("resize", requestStickyUpdate, { passive: true });
}
