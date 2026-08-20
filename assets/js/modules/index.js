// Homepage: make product cards interactive
import { addToCart, toggleWishlist, updateBagBadge, syncWishlistIcons, getWishlist, formatVND } from "./shop.js";
import { initNav } from "./nav.js";

const INDEX_PRODUCTS = {
  "Tailored Coat": { id: "tailored-coat", collection: "Fall 2026" },
  "Silk Gown": { id: "silk-gown", collection: "Evening Collection" },
  "Urban Knit": { id: "urban-knit", collection: "Foundations" },
};

async function initIndex() {
  const res = await fetch("./assets/data/products.json");
  const products = await res.json();

  // Make index product cards clickable to detail page + add wishlist
  document.querySelectorAll(".product-card").forEach((card) => {
    const h3 = card.querySelector("h3");
    if (!h3) return;
    const name = h3.textContent.trim();
    const meta = INDEX_PRODUCTS[name];
    if (!meta) return;
    const p = products.find((x) => x.id === meta.id);
    if (!p) return;

    // Card click -> detail
    card.style.cursor = "pointer";
    card.addEventListener("click", (e) => {
      if (e.target.closest(".js-quick-add, .js-card-wishlist")) return;
      window.location.href = `detailproduct.html?id=${p.id}`;
    });

    // Quick add button (appears on hover)
    const addBtn = document.createElement("button");
    addBtn.className = "js-quick-add";
    addBtn.textContent = "+ Add to Bag";
    addBtn.setAttribute("aria-label", `Add ${p.name} to bag`);
    addBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(p.id);
    });
    card.appendChild(addBtn);

    // Wishlist icon on card
    const wishBtn = document.createElement("button");
    const saved = getWishlist().includes(p.id);
    wishBtn.className = `js-card-wishlist${saved ? " is-saved" : ""}`;
    wishBtn.setAttribute("aria-label", `Save ${p.name}`);
    wishBtn.innerHTML = `<svg width="12" height="15" viewBox="0 0 10 13" fill="${saved ? "white" : "none"}" xmlns="http://www.w3.org/2000/svg">
      <path d="M0.442627 2.80409V9.80301C0.442627 10.8073 0.442627 11.3093 0.595717 11.6166C0.87946 12.1861 1.50131 12.5135 2.14038 12.4298C2.48518 12.3847 2.90985 12.1062 3.7592 11.549L3.76124 11.5477C4.09789 11.327 4.26624 11.2165 4.44234 11.1553C4.76579 11.0428 5.11867 11.0428 5.44213 11.1553C5.61862 11.2166 5.78764 11.3275 6.12559 11.5492C6.97501 12.1062 7.40008 12.3845 7.74496 12.4297C8.38396 12.5134 9.00577 12.1861 9.28954 11.6166C9.44263 11.3093 9.44263 10.8071 9.44263 9.80301V2.80167C9.44263 1.97679 9.44263 1.56373 9.27928 1.24836C9.13546 0.970681 8.90542 0.745086 8.62318 0.6036C8.30233 0.442749 7.88284 0.442749 7.04278 0.442749H2.84277C2.0027 0.442749 1.58234 0.442749 1.26147 0.6036C0.979234 0.745086 0.749923 0.970681 0.606121 1.24836C0.442627 1.56404 0.442627 1.9776 0.442627 2.80409Z" stroke="white" stroke-width="0.88545" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>`;
    wishBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWishlist(p.id);
      wishBtn.classList.toggle("is-saved");
      wishBtn.querySelector("svg").setAttribute("fill", wishBtn.classList.contains("is-saved") ? "white" : "none");
    });
    card.appendChild(wishBtn);
  });

  // Social bar links
  document.querySelectorAll(".social-links a").forEach((a) => {
    const text = a.textContent.trim();
    if (text === "facebook") a.href = "https://www.facebook.com/";
    if (text === "instagram") a.href = "https://www.instagram.com/";
    if (text === "twitter") a.href = "https://twitter.com/";
    a.target = "_blank";
    a.rel = "noopener";
  });

  initNav();
  updateBagBadge();
}

export { initIndex };
