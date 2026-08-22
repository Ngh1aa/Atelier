import { formatVND, isWishlisted, loadProducts, toggleWishlist } from "./commerce-store.js?v=ecommerce-3";
import { openVariantPicker, showMessage } from "./commerce-ui.js?v=ecommerce-3";

const INDEX_PRODUCTS = {
  "Tailored Coat": "tailored-coat",
  "Silk Gown": "silk-gown",
  "Urban Knit": "urban-knit",
};

export async function initIndex() {
  const products = await loadProducts();
  document.querySelectorAll(".product-card").forEach((card) => {
    const name = card.querySelector("h3")?.textContent.trim();
    const product = products.find((item) => item.id === INDEX_PRODUCTS[name]);
    if (!product || card.dataset.commerceReady === "true") return;
    card.dataset.commerceReady = "true";
    card.classList.add("is-commerce-card");
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");
    card.setAttribute("aria-label", `View ${product.name}`);

    const price = document.createElement("p");
    price.className = "product-card-price";
    price.textContent = formatVND(product.price);
    card.querySelector(".product-info").appendChild(price);

    const quickAdd = document.createElement("button");
    quickAdd.className = "js-quick-add";
    quickAdd.type = "button";
    quickAdd.textContent = "+ Add to Bag";
    quickAdd.setAttribute("aria-label", `Select a size for ${product.name}`);
    quickAdd.addEventListener("click", (event) => {
      event.stopPropagation();
      openVariantPicker(product, { heading: "Select your size" });
    });
    card.appendChild(quickAdd);

    const wishlist = document.createElement("button");
    const syncWishlist = () => {
      const saved = isWishlisted(product.id);
      wishlist.className = `js-card-wishlist${saved ? " is-saved" : ""}`;
      wishlist.setAttribute("aria-pressed", String(saved));
      wishlist.innerHTML = `<svg width="12" height="15" viewBox="0 0 10 13" fill="${saved ? "white" : "none"}" aria-hidden="true"><path d="M0.442627 2.80409V9.80301C0.442627 10.8073 0.442627 11.3093 0.595717 11.6166C0.87946 12.1861 1.50131 12.5135 2.14038 12.4298C2.48518 12.3847 2.90985 12.1062 3.7592 11.549L3.76124 11.5477C4.09789 11.327 4.26624 11.2165 4.44234 11.1553C4.76579 11.0428 5.11867 11.0428 5.44213 11.1553C5.61862 11.2166 5.78764 11.3275 6.12559 11.5492C6.97501 12.1062 7.40008 12.3845 7.74496 12.4297C8.38396 12.5134 9.00577 12.1861 9.28954 11.6166C9.44263 11.3093 9.44263 10.8071 9.44263 9.80301V2.80167C9.44263 1.97679 9.44263 1.56373 9.27928 1.24836C9.13546 0.970681 8.90542 0.745086 8.62318 0.6036C8.30233 0.442749 7.88284 0.442749 7.04278 0.442749H2.84277C2.0027 0.442749 1.58234 0.442749 1.26147 0.6036C0.979234 0.745086 0.749923 0.970681 0.606121 1.24836C0.442627 1.56404 0.442627 1.9776 0.442627 2.80409Z" stroke="white" stroke-width="0.88545" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    };
    wishlist.type = "button";
    wishlist.setAttribute("aria-label", `Save ${product.name}`);
    syncWishlist();
    wishlist.addEventListener("click", (event) => {
      event.stopPropagation();
      const saved = toggleWishlist(product.id);
      syncWishlist();
      showMessage(saved ? "Saved." : "Removed from Saved.");
    });
    card.appendChild(wishlist);

    const openProduct = () => { window.location.href = `detailproduct.html?id=${encodeURIComponent(product.id)}`; };
    card.addEventListener("click", (event) => { if (!event.target.closest("button")) openProduct(); });
    card.addEventListener("keydown", (event) => { if ((event.key === "Enter" || event.key === " ") && !event.target.closest("button")) openProduct(); });
  });

  document.querySelectorAll(".social-links a").forEach((link) => {
    const destination = { facebook: "https://www.facebook.com/", instagram: "https://www.instagram.com/", twitter: "https://twitter.com/" }[link.textContent.trim().toLowerCase()];
    if (destination) link.href = destination;
    link.target = "_blank";
    link.rel = "noopener";
  });
}
