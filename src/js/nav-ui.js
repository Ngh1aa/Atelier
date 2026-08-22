import { cartCount, formatVND, loadProducts, track } from "./commerce-store.js?v=ecommerce-2";
import { escapeHtml, initCommerceUi, updateGlobalIndicators } from "./commerce-ui.js?v=ecommerce-2";

const SEARCH_SYNONYMS = {
  coat: ["outerwear", "overcoat"],
  tee: ["t-shirt", "tees", "top"],
  blazer: ["tailoring", "outerwear"],
  dress: ["gown", "evening"],
  bag: ["tote", "accessories"],
};

function searchTerms(product) {
  return [product.name, product.category, product.collection, product.description, product.material, ...product.colors.map((color) => color.name)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function initSearchOverlay() {
  const btn = document.getElementById("navSearchBtn");
  const overlay = document.getElementById("navSearchOverlay");
  const input = document.getElementById("navSearchInput");
  const close = document.getElementById("navSearchClose");
  const results = document.getElementById("navSearchResults");
  if (!btn || !overlay || !input || !close || !results || overlay.dataset.ready === "true") return;
  overlay.dataset.ready = "true";

  let previousFocus;
  const openSearch = () => {
    previousFocus = document.activeElement;
    overlay.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
    setTimeout(() => input.focus(), 120);
  };
  const closeSearch = () => {
    overlay.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    input.value = "";
    results.innerHTML = "";
    previousFocus?.focus?.();
  };

  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-controls", "navSearchOverlay");
  btn.addEventListener("click", openSearch);
  close.addEventListener("click", closeSearch);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeSearch();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("open")) closeSearch();
    if (event.key === "Tab" && overlay.classList.contains("open")) {
      const focusable = [...overlay.querySelectorAll('input, button:not(:disabled), a[href]')].filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  const loaded = loadProducts().catch(() => []);

  input.addEventListener("input", async () => {
    const products = await loaded;
    const query = input.value.trim().toLowerCase();
    if (query.length < 2) {
      results.innerHTML = "";
      return;
    }
    const expanded = [query, ...(SEARCH_SYNONYMS[query] || [])];
    const matchedProducts = products.filter((product) => expanded.some((term) => searchTerms(product).includes(term))).slice(0, 5);
    const matchedCategories = [...new Set(products.map((product) => product.category))]
      .filter((category) => expanded.some((term) => category.toLowerCase().includes(term)))
      .slice(0, 3);

    if (!matchedProducts.length && !matchedCategories.length) {
      results.innerHTML = `
        <div class="search-empty-state">
          <p>No results for “${escapeHtml(input.value.trim())}”.</p>
          <span>Try a product, material or colour.</span>
          <a href="shop.html">Explore New In <span aria-hidden="true">→</span></a>
        </div>`;
      track("view_search_results", { search_term: query, result_count: 0 });
      return;
    }

    results.innerHTML = `
      ${matchedProducts.length ? `<p class="search-result-label">PRODUCTS</p>${matchedProducts.map((product) => `<a class="search-product-result" href="detailproduct.html?id=${encodeURIComponent(product.id)}"><img src="${escapeHtml(product.images[0])}" alt=""><span><strong>${escapeHtml(product.name)}</strong><small>${escapeHtml(product.category)}</small></span><span class="price">${formatVND(product.price)}</span></a>`).join("")}` : ""}
      ${matchedCategories.length ? `<p class="search-result-label">CATEGORIES</p>${matchedCategories.map((category) => `<a href="shop.html?category=${encodeURIComponent(category.toLowerCase())}"><span>${escapeHtml(category)}</span><span aria-hidden="true">→</span></a>`).join("")}` : ""}
      <a class="search-view-all" href="shop.html?search=${encodeURIComponent(query)}"><span>View all results for “${escapeHtml(input.value.trim())}”</span><span aria-hidden="true">→</span></a>`;
    track("search", { search_term: query });
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && input.value.trim().length >= 2) {
      event.preventDefault();
      window.location.href = `shop.html?search=${encodeURIComponent(input.value.trim())}`;
    }
  });
}

export function initBagBadge() {
  updateGlobalIndicators();
  return cartCount();
}

export { initCommerceUi };
