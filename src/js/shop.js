// Shop rendering + cart/wishlist logic driven by products.json
const SHOP_IDS = [
  "tailored-wool-blazer",
  "cashmere-overcoat",
  "merino-knit-dress",
  "silk-drape-blouse",
  "linen-wide-trousers",
  "suede-chelsea-boots",
  "viscose-wrap-top",
  "leather-minimal-tote",
];

const STORAGE_KEY = "atelier.cart";
const WISH_KEY = "atelier.wishlist";

function formatVND(n) {
  return n.toLocaleString("vi-VN") + "\u20ab";
}

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}
function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}
function cartCount() {
  return Object.values(getCart()).reduce((s, q) => s + q, 0);
}
function getWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISH_KEY)) || [];
  } catch {
    return [];
  }
}
function saveWishlist(list) {
  localStorage.setItem(WISH_KEY, JSON.stringify(list));
}

function updateBagBadge() {
  document.querySelectorAll(".nav-text").forEach((el) => {
    if (el.getAttribute("href") === "cart.html") {
      el.textContent = `Bag (${cartCount()})`;
    }
  });
}

// Cart actions
function addToCart(productId, qty = 1, srcEl = null) {
  const cart = getCart();
  cart[productId] = (cart[productId] || 0) + qty;
  saveCart(cart);
  updateBagBadge();
  flashFeedback(srcEl, "Added to bag");
}

function toggleWishlist(productId, srcEl = null) {
  const list = getWishlist();
  const idx = list.indexOf(productId);
  if (idx === -1) {
    list.push(productId);
    flashFeedback(srcEl, "Saved");
  } else {
    list.splice(idx, 1);
  }
  saveWishlist(list);
  syncWishlistIcons();
}

function flashFeedback(el, text) {
  if (!el) return;
  const btn = el.closest("button, a, div");
  if (!btn) return;
  const original = btn.textContent.trim();
  btn.dataset.originalText = original;
  btn.textContent = text;
  btn.classList.add("feedback-flash");
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("feedback-flash");
  }, 1200);
}

function syncWishlistIcons() {
  const list = getWishlist();
  document.querySelectorAll(".js-wishlist-btn").forEach((btn) => {
    const id = btn.dataset.productId;
    btn.classList.toggle("is-saved", list.includes(id));
  });
}

// Render shop grid
async function renderShop() {
  const grid = document.querySelector(".js-shop-grid");
  if (!grid) return;

  const res = await fetch("./src/data/products.json");
  const all = await res.json();
  const products = SHOP_IDS.map((id) => all.find((p) => p.id === id)).filter(Boolean);

  const urlParams = new URLSearchParams(window.location.search);
  const filter = (urlParams.get("category") || "").toLowerCase();

  grid.innerHTML = products
    .map((p) => {
      const isSaved = getWishlist().includes(p.id);
      return `
      <div class="product-item-wrap js-product-item" data-category="${p.category.toLowerCase()}" data-id="${p.id}">
        <div class="product-grid-item js-product-grid-item">
          <div class="product-grid-item__image js-product-grid-item-image">
            <a href="detailproduct.html?id=${p.id}">
              <img src="${p.images[0]}" alt="${p.name}" loading="lazy" style="width:100%;display:block;aspect-ratio:3/4;object-fit:cover;">
            </a>
            <div class="product-grid-item__hover js-product-grid-item-hover">
              <div class="product-grid-item__add-to-cart js-add-to-cart" data-product-id="${p.id}" role="button" tabindex="0">
                <p class="text-cta">Add to bag +</p>
              </div>
            </div>
          </div>
          <div class="product-grid-item__content" style="display:flex;justify-content:space-between;margin-top:1rem;">
            <div class="product-grid-item__content-left">
              <h4 class="product-grid-item__title" style="font-size:0.85rem;text-transform:uppercase;margin:0 0 0.3rem 0;">
                <a href="detailproduct.html?id=${p.id}" style="color:inherit;text-decoration:none;">${p.name}</a>
              </h4>
              <div class="product-grid-item__price" style="font-size:0.8rem;color:#a0a0a0;">
                ${formatVND(p.price)}
              </div>
            </div>
            <div class="product-grid-item__content-right">
              <div class="product-grid-item__wishlist">
                <button class="js-wishlist-btn" data-product-id="${p.id}" aria-label="Save ${p.name}" style="background:none;border:none;cursor:pointer;padding:0;">
                  <svg width="10" height="13" viewBox="0 0 10 13" fill="${isSaved ? "white" : "none"}" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.442627 2.80409V9.80301C0.442627 10.8073 0.442627 11.3093 0.595717 11.6166C0.87946 12.1861 1.50131 12.5135 2.14038 12.4298C2.48518 12.3847 2.90985 12.1062 3.7592 11.549L3.76124 11.5477C4.09789 11.327 4.26624 11.2165 4.44234 11.1553C4.76579 11.0428 5.11867 11.0428 5.44213 11.1553C5.61862 11.2166 5.78764 11.3275 6.12559 11.5492C6.97501 12.1062 7.40008 12.3845 7.74496 12.4297C8.38396 12.5134 9.00577 12.1861 9.28954 11.6166C9.44263 11.3093 9.44263 10.8071 9.44263 9.80301V2.80167C9.44263 1.97679 9.44263 1.56373 9.27928 1.24836C9.13546 0.970681 8.90542 0.745086 8.62318 0.6036C8.30233 0.442749 7.88284 0.442749 7.04278 0.442749H2.84277C2.0027 0.442749 1.58234 0.442749 1.26147 0.6036C0.979234 0.745086 0.749923 0.970681 0.606121 1.24836C0.442627 1.56404 0.442627 1.9776 0.442627 2.80409Z" stroke="white" stroke-width="0.88545" stroke-linecap="round" stroke-linejoin="round"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    })
    .join("");

  // Filter by category from URL
  if (filter) {
    document.querySelectorAll(".js-product-item").forEach((el) => {
      if (el.dataset.category !== filter) el.classList.add("js-hidden");
    });
  }

  const countEl = document.getElementById("result-count");
  if (countEl) {
    const visible = document.querySelectorAll(".js-product-item:not(.js-hidden)").length;
    countEl.textContent = `${visible} Piece${visible !== 1 ? "s" : ""}`;
  }

  // Load-more (reuse existing .js-hidden / #load-more pattern)
  const BATCH = 8;
  const items = Array.from(document.querySelectorAll(".js-product-item"));
  items.forEach((item, i) => {
    if (i >= BATCH) item.classList.add("js-hidden");
  });
  let shown = BATCH;
  const loadMoreBtn = document.getElementById("load-more");
  if (loadMoreBtn) {
    const refreshLoadMore = () => {
      const visibleItems = items.filter((it) => !it.classList.contains("js-hidden"));
      loadMoreBtn.style.display = shown >= visibleItems.length ? "none" : "";
    };
    loadMoreBtn.addEventListener("click", () => {
      const next = shown + BATCH;
      items.slice(shown, next).forEach((i) => i.classList.remove("js-hidden"));
      shown = next;
      refreshLoadMore();
    });
    refreshLoadMore();
  }

  // Add to cart + wishlist bindings
  document.querySelectorAll(".js-add-to-cart").forEach((btn) => {
    const activate = (e) => {
      e.preventDefault();
      addToCart(btn.dataset.productId, 1, btn);
    };
    btn.addEventListener("click", activate);
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") activate(e);
    });
  });

  document.querySelectorAll(".js-wishlist-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      toggleWishlist(btn.dataset.productId);
    });
  });

  updateBagBadge();
  syncWishlistIcons();
}

export { renderShop, addToCart, toggleWishlist, updateBagBadge, syncWishlistIcons, getCart, getWishlist, formatVND };
