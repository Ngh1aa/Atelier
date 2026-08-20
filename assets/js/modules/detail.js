// Product detail page: render from ?id= param
import { getWishlist, toggleWishlist, addToCart, formatVND } from "./shop.js";

let currentProduct = null;

async function renderDetail() {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return; // no param -> keep static default page
  const res = await fetch("./assets/data/products.json");
  const products = await res.json();
  const p = products.find((x) => x.id === id);
  if (!p) return; // keep static fallback page as-is
  currentProduct = p;

  const titleEl = document.querySelector(".js-product-title");
  const priceEl = document.querySelector(".js-product-price");
  const descEl = document.querySelector(".js-product-description");
  const mainImg = document.querySelector("#main-product-img");
  const thumbWrap = document.querySelector(".js-thumbnail-gallery");
  const sizeWrap = document.querySelector(".js-size-options");
  const breadcrumb = document.querySelector(".js-breadcrumb");

  if (titleEl) titleEl.textContent = p.name;
  document.title = p.name + " - ATELIER";
  if (priceEl) priceEl.textContent = formatVND(p.price);
  if (descEl) {
    // descEl may be a wrapper <div> containing a <p>
    const target = descEl.querySelector('p') || descEl;
    target.textContent = p.description;
  }

  const productFacts = [
    ['.js-product-fit', p.fit],
    ['.js-product-material', p.material],
    ['.js-product-care', p.care],
    ['.js-product-origin', p.origin],
  ];
  productFacts.forEach(([selector, value]) => {
    const element = document.querySelector(selector);
    if (element && value) element.textContent = value;
  });

  if (mainImg) {
    mainImg.src = p.images[0];
    mainImg.alt = p.name;
  }

  if (thumbWrap) {
    thumbWrap.innerHTML = p.images
      .map(
        (src, i) => `
      <img src="${src}" alt="${p.name} thumbnail ${i + 1}" class="${i === 0 ? "active" : ""}" style="cursor:pointer;width:80px;aspect-ratio:1;object-fit:cover;border:1px solid rgba(255,255,255,0.3);opacity:${i === 0 ? 1 : 0.5};transition:opacity 0.3s;">`
      )
      .join("");
    thumbWrap.querySelectorAll("img").forEach((thumb) => {
      thumb.addEventListener("click", () => {
        thumbWrap.querySelectorAll("img").forEach((t) => {
          t.classList.remove("active");
          t.style.opacity = "0.5";
        });
        thumb.classList.add("active");
        thumb.style.opacity = "1";
        mainImg.src = thumb.src;
      });
    });
  }

  if (sizeWrap) {
    sizeWrap.innerHTML = p.sizes
      .map((s) => `<span class="${s === p.sizes[0] ? "active" : ""}">${s}</span>`)
      .join("");
    sizeWrap.querySelectorAll("span").forEach((sp) => {
      sp.addEventListener("click", () => {
        sizeWrap.querySelectorAll("span").forEach((s) => s.classList.remove("active"));
        sp.classList.add("active");
      });
    });
  }

  if (breadcrumb) {
    breadcrumb.innerHTML = `
      <a href="shop.html">Shop</a><span>/</span>
      <a href="shop.html">${p.collection}</a><span>/</span>
      <span>${p.name}</span>`;
  }

  document.title = `${p.name} - ATELIER`;

  const relatedWrap = document.querySelector('.js-related-grid');
  if (relatedWrap) {
    const related = products
      .filter((item) => item.id !== p.id)
      .sort((a, b) => Number(b.category === p.category) - Number(a.category === p.category))
      .slice(0, 4);
    relatedWrap.innerHTML = related.map((item) => `
      <a class="related-item" href="detailproduct.html?id=${encodeURIComponent(item.id)}">
        <img loading="lazy" src="${item.images[0]}" alt="${item.name}">
        <h4>${item.name}</h4>
        <p>${formatVND(item.price)}</p>
      </a>`).join('');
  }

  // Actions
  const addBtn = document.querySelector(".js-btn-add-cart");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      addToCart(p.id, 1, addBtn);
      addBtn.textContent = "ADDED TO BAG";
      setTimeout(() => {
        addBtn.textContent = "ADD TO BAG";
      }, 1500);
    });
  }

  const wishBtn = document.querySelector(".js-btn-wishlist");
  const syncWishLabel = () => {
    const saved = getWishlist().includes(p.id);
    if (wishBtn) wishBtn.innerHTML = saved ? "\u2665 SAVED" : '<img src="https://api.iconify.design/ph:heart-light.svg?color=white" width="20"> WISHLIST';
  };
  syncWishLabel();
  if (wishBtn) {
    wishBtn.addEventListener("click", () => {
      toggleWishlist(p.id, wishBtn);
      syncWishLabel();
    });
  }

  // Update page title if static title exists
  const staticTitle = document.querySelector("h2.product-title");
  if (staticTitle) staticTitle.textContent = p.name;
  const staticPrice = document.querySelector("p.product-price");
  if (staticPrice) staticPrice.textContent = formatVND(p.price);
  const staticColl = document.querySelector(".collection-name");
  if (staticColl) staticColl.textContent = p.collection;
}

export { renderDetail };
