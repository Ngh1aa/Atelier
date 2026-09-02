import {
  formatVND,
  getWishlist,
  isWishlisted,
  loadProducts,
  toggleWishlist,
  track,
} from "./commerce-store.js?v=atelier-v13";
import { escapeHtml, openVariantPicker, showMessage } from "./commerce-ui.js?v=atelier-v13";

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
const PLP_SCROLL_KEY = "atelier.plp-position";

const bookmarkIcon = () => `
  <svg width="10" height="13" viewBox="0 0 10 13" aria-hidden="true">
    <path d="M0.442627 2.80409V9.80301C0.442627 10.8073 0.442627 11.3093 0.595717 11.6166C0.87946 12.1861 1.50131 12.5135 2.14038 12.4298C2.48518 12.3847 2.90985 12.1062 3.7592 11.549L3.76124 11.5477C4.09789 11.327 4.26624 11.2165 4.44234 11.1553C4.76579 11.0428 5.11867 11.0428 5.44213 11.1553C5.61862 11.2166 5.78764 11.3275 6.12559 11.5492C6.97501 12.1062 7.40008 12.3845 7.74496 12.4297C8.38396 12.5134 9.00577 12.1861 9.28954 11.6166C9.44263 11.3093 9.44263 10.8071 9.44263 9.80301V2.80167C9.44263 1.97679 9.44263 1.56373 9.27928 1.24836C9.13546 0.970681 8.90542 0.745086 8.62318 0.6036C8.30233 0.442749 7.88284 0.442749 7.04278 0.442749H2.84277C2.0027 0.442749 1.58234 0.442749 1.26147 0.6036C0.979234 0.745086 0.749923 0.970681 0.606121 1.24836C0.442627 1.56404 0.442627 1.9776 0.442627 2.80409Z" stroke-width="0.88545" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

function querySet(params, key) {
  return new Set((params.get(key) || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean));
}

function createState() {
  const params = new URLSearchParams(window.location.search);
  return {
    categories: querySet(params, "category"),
    sizes: querySet(params, "size"),
    colors: querySet(params, "color"),
    collection: (params.get("collection") || "").toLowerCase(),
    search: (params.get("search") || "").trim().toLowerCase(),
    sort: params.get("sort") || "newest",
  };
}

function syncUrl(state) {
  const params = new URLSearchParams();
  if (state.categories.size) params.set("category", [...state.categories].join(","));
  if (state.sizes.size) params.set("size", [...state.sizes].join(","));
  if (state.colors.size) params.set("color", [...state.colors].join(","));
  if (state.collection) params.set("collection", state.collection);
  if (state.search) params.set("search", state.search);
  if (state.sort !== "newest") params.set("sort", state.sort);
  const query = params.toString();
  history.replaceState({ atelierPlp: true }, "", `${location.pathname}${query ? `?${query}` : ""}`);
}

function matchesSearch(product, query) {
  if (!query) return true;
  const synonyms = { coat: "outerwear", tee: "tees", blazer: "outerwear", bag: "accessories" };
  const expanded = [query, synonyms[query]].filter(Boolean);
  const haystack = [
    product.name,
    product.category,
    product.collection,
    product.description,
    product.material,
    ...product.colors.map((color) => color.name),
  ].join(" ").toLowerCase();
  return expanded.some((term) => haystack.includes(term));
}

function filterProducts(products, state) {
  const filtered = products.filter((product) => {
    if (!matchesSearch(product, state.search)) return false;
    if (state.collection && product.collection.toLowerCase() !== state.collection) return false;
    if (state.categories.size && !state.categories.has(product.category.toLowerCase())) return false;
    if (state.sizes.size && !product.variants.some((variant) => state.sizes.has(variant.size.toLowerCase()) && variant.stock > 0)) return false;
    if (state.colors.size && !product.colors.some((color) => state.colors.has(color.value))) return false;
    return true;
  });
  if (state.sort === "price-asc") filtered.sort((a, b) => a.price - b.price);
  if (state.sort === "price-desc") filtered.sort((a, b) => b.price - a.price);
  if (state.sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  return filtered;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
}

function renderFilterPanel(products, state) {
  const categories = uniqueSorted(products.map((product) => product.category));
  const sizes = uniqueSorted(products.flatMap((product) => product.sizes));
  const colors = uniqueSorted(products.flatMap((product) => product.colors.map((color) => color.value)));
  return `
    <aside class="shop-filter-panel js-shop-filter-panel" role="dialog" aria-modal="true" aria-label="Product filters" aria-hidden="true">
      <div class="shop-filter-head"><span>FILTER</span><button type="button" class="js-filter-close" aria-label="Close filters">×</button></div>
      <fieldset><legend>SIZE</legend><div class="filter-option-grid">${sizes.map((size) => `<label><input type="checkbox" name="size" value="${escapeHtml(size.toLowerCase())}" ${state.sizes.has(size.toLowerCase()) ? "checked" : ""}><span>${escapeHtml(size)}</span></label>`).join("")}</div></fieldset>
      <fieldset><legend>CATEGORY</legend><div class="filter-option-list">${categories.map((category) => `<label><input type="checkbox" name="category" value="${escapeHtml(category.toLowerCase())}" ${state.categories.has(category.toLowerCase()) ? "checked" : ""}><span>${escapeHtml(category)}</span></label>`).join("")}</div></fieldset>
      <fieldset><legend>COLOUR</legend><div class="filter-option-list">${colors.map((color) => `<label><input type="checkbox" name="color" value="${escapeHtml(color)}" ${state.colors.has(color) ? "checked" : ""}><span>${escapeHtml(color.replace(/(^|-)\w/g, (letter) => letter.replace("-", " ").toUpperCase()))}</span></label>`).join("")}</div></fieldset>
      <button type="button" class="commerce-primary-action js-filter-apply">Show pieces</button>
    </aside>`;
}

function appliedFilterMarkup(state) {
  const filters = [
    ...[...state.sizes].map((value) => ({ type: "size", value, label: value.toUpperCase() })),
    ...[...state.categories].map((value) => ({ type: "category", value, label: value })),
    ...[...state.colors].map((value) => ({ type: "color", value, label: value })),
  ];
  if (state.search) filters.unshift({ type: "search", value: state.search, label: `“${state.search}”` });
  if (!filters.length) return "";
  return `<div class="applied-filters" aria-label="Applied filters">${filters.map((filter) => `<button type="button" data-filter-type="${filter.type}" data-filter-value="${escapeHtml(filter.value)}">${escapeHtml(filter.label)} <span aria-hidden="true">×</span></button>`).join("")}<button type="button" class="js-clear-filters">Clear all</button></div>`;
}

function productCard(product) {
  const saved = isWishlisted(product.id);
  return `
    <article class="product-item-wrap js-product-item" data-id="${escapeHtml(product.id)}">
      <div class="product-grid-item">
        <div class="product-grid-item__image">
          <a class="js-plp-product-link" href="detailproduct.html?id=${encodeURIComponent(product.id)}">
            <img src="${escapeHtml(product.images[0])}" data-fallback-src="${escapeHtml(product.fallback || "")}" alt="${escapeHtml(product.name)}" loading="eager" decoding="async" width="900" height="1200" class="js-grid-img-front">
            ${product.images[1] ? `<img src="${escapeHtml(product.images[1])}" alt="" aria-hidden="true" class="js-grid-img-back" loading="lazy">` : ""}
          </a>
          <div class="product-grid-item__hover"><button class="product-grid-item__add-to-cart js-quick-add" data-product-id="${escapeHtml(product.id)}" type="button">Select size +</button></div>
        </div>
        <div class="product-grid-item__content">
          <div><h2 class="product-grid-item__title"><a class="js-plp-product-link" href="detailproduct.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h2><p class="product-grid-item__price">${formatVND(product.price)}</p></div>
          <button class="js-wishlist-btn${saved ? " is-saved" : ""}" data-product-id="${escapeHtml(product.id)}" type="button" aria-label="${saved ? "Remove" : "Save"} ${escapeHtml(product.name)}" aria-pressed="${saved}">${bookmarkIcon()}</button>
        </div>
      </div>
    </article>`;
}

export async function renderShop() {
  const grid = document.querySelector(".js-shop-grid");
  const filterBar = document.querySelector(".filter-bar");
  if (!grid || !filterBar) return;

  const allProducts = await loadProducts();
  const products = SHOP_IDS.map((id) => allProducts.find((product) => product.id === id)).filter(Boolean);
  const state = createState();
  let filterTrigger = null;

  filterBar.innerHTML = `
    <span id="result-count" class="result-count" aria-live="polite"></span>
    <div class="shop-toolbar">
      <button type="button" class="shop-tool-button js-filter-open">Filter <span class="js-filter-total"></span></button>
      <label class="shop-sort"><span>Sort By</span><select aria-label="Sort products"><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="name">Name</option></select></label>
    </div>`;
  filterBar.insertAdjacentHTML("afterend", `<div class="js-applied-filters"></div>${renderFilterPanel(products, state)}`);

  const panel = document.querySelector(".js-shop-filter-panel");
  const applied = document.querySelector(".js-applied-filters");
  const sortSelect = filterBar.querySelector("select");
  sortSelect.value = state.sort;

  const closeFilters = () => {
    panel.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("shop-filters-open");
    filterTrigger?.focus?.();
  };
  const openFilters = () => {
    filterTrigger = document.activeElement;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("shop-filters-open");
    panel.querySelector("input:not(:disabled)")?.focus();
  };

  const repaint = () => {
    const visible = filterProducts(products, state);
    grid.innerHTML = visible.length ? visible.map(productCard).join("") : `
      <div class="shop-empty-state"><h2>No pieces found.</h2><p>Adjust your selection or explore the complete collection.</p><button type="button" class="btn-outline js-empty-clear">Clear filters</button></div>`;
    filterBar.querySelector("#result-count").textContent = `${visible.length} Piece${visible.length === 1 ? "" : "s"}`;
    const filterTotal = state.categories.size + state.sizes.size + state.colors.size;
    filterBar.querySelector(".js-filter-total").textContent = filterTotal ? `(${filterTotal})` : "";
    applied.innerHTML = appliedFilterMarkup(state);
    syncUrl(state);
    bindGrid();
    bindApplied();
    track("view_item_list", { item_count: visible.length, search_term: state.search || undefined });
  };

  const clearFilters = () => {
    state.categories.clear();
    state.sizes.clear();
    state.colors.clear();
    state.search = "";
    panel.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = false; });
    repaint();
  };

  function bindGrid() {
    grid.querySelectorAll(".js-quick-add").forEach((button) => button.addEventListener("click", () => {
      const product = products.find((item) => item.id === button.dataset.productId);
      if (product) openVariantPicker(product, { heading: "Select your size" });
    }));
    grid.querySelectorAll(".js-wishlist-btn").forEach((button) => button.addEventListener("click", () => {
      const saved = toggleWishlist(button.dataset.productId);
      button.classList.toggle("is-saved", saved);
      button.setAttribute("aria-pressed", String(saved));
      const product = products.find((item) => item.id === button.dataset.productId);
      button.setAttribute("aria-label", `${saved ? "Remove" : "Save"} ${product?.name || "piece"}`);
      showMessage(saved ? "Saved." : "Removed from Saved.");
    }));
    grid.querySelectorAll(".js-plp-product-link").forEach((link) => link.addEventListener("click", () => {
      sessionStorage.setItem(PLP_SCROLL_KEY, JSON.stringify({ url: location.href, y: window.scrollY }));
      track("select_item", { product_id: new URL(link.href).searchParams.get("id") });
    }));
    grid.querySelector(".js-empty-clear")?.addEventListener("click", clearFilters);
  }

  function bindApplied() {
    applied.querySelectorAll("[data-filter-type]").forEach((button) => button.addEventListener("click", () => {
      const { filterType, filterValue } = button.dataset;
      if (filterType === "search") state.search = "";
      else state[`${filterType === "category" ? "categories" : `${filterType}s`}`]?.delete(filterValue);
      const checkbox = panel.querySelector(`input[name="${filterType}"][value="${CSS.escape(filterValue)}"]`);
      if (checkbox) checkbox.checked = false;
      repaint();
    }));
    applied.querySelector(".js-clear-filters")?.addEventListener("click", clearFilters);
  }

  filterBar.querySelector(".js-filter-open").addEventListener("click", openFilters);
  panel.querySelector(".js-filter-close").addEventListener("click", closeFilters);
  panel.querySelector(".js-filter-apply").addEventListener("click", () => {
    ["size", "category", "color"].forEach((name) => {
      const target = name === "category" ? state.categories : state[`${name}s`];
      target.clear();
      panel.querySelectorAll(`input[name="${name}"]:checked`).forEach((input) => target.add(input.value));
    });
    closeFilters();
    repaint();
  });
  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    repaint();
  });

  document.addEventListener("keydown", (event) => {
    if (!panel.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      closeFilters();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...panel.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]')]
      .filter((element) => element.offsetParent !== null);
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
  });

  repaint();
  const savedPosition = JSON.parse(sessionStorage.getItem(PLP_SCROLL_KEY) || "null");
  if (savedPosition?.url === location.href) {
    requestAnimationFrame(() => window.scrollTo({ top: savedPosition.y, behavior: "instant" }));
    sessionStorage.removeItem(PLP_SCROLL_KEY);
  }
}

export { getWishlist };
