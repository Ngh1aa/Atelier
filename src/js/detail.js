import {
  addCartItem,
  getCurrentAccount,
  requestStockAlert,
  addRecentlyViewed,
  findVariant,
  formatVND,
  getAvailableSizes,
  getDeliveryWindow,
  isWishlisted,
  loadProducts,
  toggleWishlist,
  track,
} from "./commerce-store.js?v=full-prototype";
import { bindFormValidation, closeDrawer, escapeHtml, openMiniBag, openPanel, openSizeGuide, renderLoadError, runRequest, showMessage } from "./commerce-ui.js?v=full-prototype";

function renderUnavailable(kind) {
  const grid = document.querySelector(".product-detail-grid");
  document.querySelector(".complete-look")?.setAttribute("hidden", "");
  const breadcrumb = document.querySelector(".js-breadcrumb");
  if (breadcrumb) breadcrumb.innerHTML = '<a href="shop.html">Shop</a><span aria-hidden="true">/</span><span>Unavailable</span>';
  if (kind === "error") {
    document.title = "Piece unavailable — ATELIER";
    renderLoadError(grid, { title: "This piece could not load.", message: "The catalogue request failed. Your Bag and Saved pieces are unchanged.", onRetry: () => location.reload() });
    return;
  }
  document.title = "Piece not found — ATELIER";
  grid.innerHTML = '<div class="request-error-state pdp-not-found" role="status"><p class="eyebrow">NOT FOUND</p><h1>This piece is not in the current edit.</h1><p>The link may be out of date, or the piece has left the collection.</p><a class="btn-outline" href="shop.html">Explore the current edit <span aria-hidden="true">→</span></a></div>';
}

export async function renderDetail() {
  let products;
  try { products = await loadProducts(); }
  catch { renderUnavailable("error"); return; }
  const requestedId = new URLSearchParams(window.location.search).get("id");
  const product = requestedId ? products.find((item) => item.id === requestedId) : products[0];
  if (!product) { renderUnavailable("not-found"); return; }

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

  const syncSticky = () => {};

  const renderSizes = () => {
    const sizes = getAvailableSizes(product, selectedColor);
    if (!sizes.some((item) => item.size === selectedSize && item.stock > 0)) selectedSize = product.requiresSize ? null : "One Size";
    const buttons = [...sizeOptions.querySelectorAll("button")];
    while (buttons.length < sizes.length) {
      const button = document.createElement("button");
      button.type = "button";
      sizeOptions.appendChild(button);
      buttons.push(button);
    }
    buttons.forEach((button, index) => {
      const option = sizes[index];
      button.hidden = !option;
      if (!option) return;
      button.dataset.size = option.size;
      button.textContent = option.size;
      button.disabled = option.stock < 1;
      button.setAttribute("aria-pressed", String(option.size === selectedSize));
      button.classList.toggle("is-selected", option.size === selectedSize);
      if (option.stock < 1) button.setAttribute("aria-label", `${option.size}, unavailable`);
      else button.removeAttribute("aria-label");
      button.onclick = () => {
        selectedSize = button.dataset.size;
        selectionError.textContent = "";
        sizeOptions.querySelectorAll("button").forEach((item) => {
          item.classList.toggle("is-selected", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        });
        syncSticky();
        track("select_size", { product_id: product.id, size: selectedSize });
      };
    });
    syncSticky();
    syncSoldOut();
  };

  // Sold-out sizes stay visible (disabled) and offer "Notify me"; a fully sold-out
  // colour turns Add to Bag into a sold-out state with the same alert route.
  const notifyRow = document.createElement("div");
  notifyRow.className = "pdp-notify js-pdp-notify";
  selectionError.insertAdjacentElement("afterend", notifyRow);
  const syncSoldOut = () => {
    const sizes = getAvailableSizes(product, selectedColor);
    const soldOut = sizes.filter((item) => item.inventoryKnown && item.stock < 1);
    const allSoldOut = soldOut.length === sizes.length;
    const colorName = product.colors.find((color) => color.value === selectedColor)?.name || "";
    addButton.disabled = allSoldOut;
    addButton.textContent = allSoldOut ? `Sold out in ${colorName}` : "Add to Bag";
    if (!soldOut.length) {
      notifyRow.hidden = true;
      notifyRow.innerHTML = "";
      return;
    }
    notifyRow.hidden = false;
    notifyRow.innerHTML = `<span>${allSoldOut ? `${escapeHtml(colorName)} is sold out in every size.` : `Sold out in ${soldOut.map((item) => escapeHtml(item.size)).join(", ")}.`}</span><button type="button" class="text-action js-notify-open">Notify me when it returns</button>`;
    notifyRow.querySelector(".js-notify-open").addEventListener("click", () => openNotify(soldOut.map((item) => item.size), colorName));
  };

  const openNotify = (sizes, colorName) => {
    const account = getCurrentAccount();
    const overlay = openPanel(`
      <p class="eyebrow">NOTIFY ME</p>
      <h2 id="commerce-drawer-title">Hear when it returns.</h2>
      <p class="commerce-drawer-intro">${escapeHtml(product.name)}, ${escapeHtml(colorName)}</p>
      <form class="js-notify-form notify-form" novalidate>
        <div class="form-group"><label for="notifySize">Size*</label><select id="notifySize" name="size" required>${sizes.map((size) => `<option value="${escapeHtml(size)}">${escapeHtml(size)}</option>`).join("")}</select></div>
        <div class="form-group"><label for="notifyEmail">Email*</label><input id="notifyEmail" name="email" type="email" autocomplete="email" required maxlength="254" value="${escapeHtml(account?.email || "")}"></div>
        <p class="commerce-inline-error js-notify-error" role="alert"></p>
        <button type="submit" class="commerce-primary-action js-notify-submit">Notify me</button>
        <p class="commerce-drawer-intro">Demo store: the alert is saved in this tab only. No email will be sent.</p>
      </form>`);
    const form = overlay.querySelector(".js-notify-form");
    const validate = bindFormValidation(form);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!validate()) return;
      const data = new FormData(form);
      const result = await runRequest(form.querySelector(".js-notify-submit"), "Saving…", () => requestStockAlert({
        productId: product.id, productName: product.name, color: selectedColor, colorName, size: data.get("size"), email: data.get("email"),
      }), { errorElement: form.querySelector(".js-notify-error") });
      if (!result?.ok) return;
      const content = overlay.querySelector(".js-commerce-drawer-content");
      content.innerHTML = `<p class="eyebrow">NOTIFY ME</p><h2 id="commerce-drawer-title">${result.duplicate ? "You’re already on the list." : "You’re on the list."}</h2><p class="commerce-drawer-intro js-notify-confirmation">${escapeHtml(product.name)}, ${escapeHtml(colorName)}, size ${escapeHtml(data.get("size"))}. In this demo the alert is kept in this tab; no email is sent.</p><button type="button" class="commerce-primary-action js-notify-done">Continue browsing</button><a class="commerce-secondary-action" href="account.html#alerts">View alerts in your account</a>`;
      content.querySelector(".js-notify-done").addEventListener("click", closeDrawer);
      content.querySelector(".js-notify-done").focus();
    });
  };

  const renderColors = () => {
    colorLabel.textContent = product.colors.find((color) => color.value === selectedColor)?.name || "";
    const buttons = [...colorOptions.querySelectorAll("button")];
    while (buttons.length < product.colors.length) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pdp-color-option";
      button.innerHTML = "<i></i><span></span>";
      colorOptions.appendChild(button);
      buttons.push(button);
    }
    buttons.forEach((button, index) => {
      const color = product.colors[index];
      button.hidden = !color;
      if (!color) return;
      button.dataset.color = color.value;
      button.querySelector("i").style.setProperty("--swatch", color.hex);
      button.querySelector("span").textContent = color.name;
      button.classList.toggle("is-selected", color.value === selectedColor);
      button.setAttribute("aria-pressed", String(color.value === selectedColor));
      button.onclick = () => {
        selectedColor = button.dataset.color;
        colorLabel.textContent = product.colors.find((item) => item.value === selectedColor)?.name || "";
        colorOptions.querySelectorAll("button").forEach((item) => {
          item.classList.toggle("is-selected", item === button);
          item.setAttribute("aria-pressed", String(item === button));
        });
        selectionError.textContent = "";
        renderSizes();
        syncUrl();
        track("select_color", { product_id: product.id, color: selectedColor });
      };
    });
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
  // Purchase controls are live from here (used by QA scripts to avoid pre-hydration clicks).
  document.body.dataset.pdpReady = "true";

  const relatedWrap = document.querySelector(".js-related-grid");
  if (relatedWrap) {
    const related = products
      .filter((item) => item.id !== product.id)
      .sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
      .slice(0, 4);
    relatedWrap.innerHTML = related.map((item) => `<a class="related-item" href="detailproduct.html?id=${encodeURIComponent(item.id)}"><img loading="lazy" src="${escapeHtml(item.images[0])}" alt="${escapeHtml(item.name)}"><h4>${escapeHtml(item.name)}</h4><p>${formatVND(item.price)}</p></a>`).join("");
  }

}
