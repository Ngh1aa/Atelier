import { findVariant, getAvailableSizes, loadProducts } from "./commerce-store.js?v=atelier-v15";

const LOW_STOCK_THRESHOLD = 3;
const LEGACY_MODEL_FALLBACK = "Model is 178 cm and wears size S.";

function selectedValue(container, key) {
  return container.querySelector('[aria-pressed="true"]')?.dataset?.[key] || null;
}

export async function initPdpV15() {
  if (!document.body.classList.contains("page-pdp") || document.body.dataset.pdpV15Ready === "true") return;
  document.body.dataset.pdpV15Ready = "true";

  const products = await loadProducts();
  const requestedId = new URLSearchParams(location.search).get("id");
  const product = products.find((item) => item.id === requestedId) || products[0];
  if (!product) return;

  const sizeOptions = document.querySelector(".js-size-options");
  const colorOptions = document.querySelector(".js-color-options");
  const addButton = document.querySelector(".js-btn-add-cart");
  const mainImage = document.querySelector("#main-product-img");
  const thumbnails = document.querySelector(".js-thumbnail-gallery");
  if (!sizeOptions || !colorOptions || !addButton || !mainImage || !thumbnails) return;

  const modelNote = document.querySelector(".js-product-model");
  if (modelNote && (!product.model || product.model === LEGACY_MODEL_FALLBACK)) {
    modelNote.textContent = "";
    modelNote.hidden = true;
  }

  let availability = document.querySelector(".js-pdp-availability");
  if (!availability) {
    availability = document.createElement("p");
    availability.className = "pdp-availability js-pdp-availability";
    availability.setAttribute("role", "status");
    availability.setAttribute("aria-live", "polite");
    sizeOptions.insertAdjacentElement("afterend", availability);
  }

  let confidenceStrip = document.querySelector(".pdp-confidence-strip");
  if (!confidenceStrip) {
    confidenceStrip = document.createElement("section");
    confidenceStrip.className = "pdp-confidence-strip";
    confidenceStrip.setAttribute("aria-label", "Purchase decision summary");
    confidenceStrip.innerHTML = `
      <article><span>Size & fit</span><strong class="js-confidence-fit">Choose a size</strong><small class="js-confidence-fit-note"></small></article>
      <article><span>Availability</span><strong class="js-confidence-stock">Choose a size</strong><small>Only known local variant data is described as stock.</small></article>
      <article><span>Delivery & returns</span><strong class="js-confidence-service"></strong><small>Review the service detail before adding to Bag.</small></article>`;
    document.querySelector(".product-actions")?.insertAdjacentElement("beforebegin", confidenceStrip);
  }

  const currentSelection = () => {
    const color = selectedValue(colorOptions, "color") || product.colors[0]?.value;
    const size = selectedValue(sizeOptions, "size");
    return { color, size, variant: size ? findVariant(product, color, size) : null };
  };

  const syncAvailability = () => {
    const { color, size, variant } = currentSelection();
    const sizes = getAvailableSizes(product, color);

    sizeOptions.querySelectorAll("button[data-size]").forEach((button) => {
      const option = sizes.find((item) => item.size === button.dataset.size);
      if (!option) return;
      if (option.inventoryKnown && option.stock < 1) {
        button.dataset.stockState = "sold-out";
        button.setAttribute("aria-label", `${option.size}, sold out`);
      } else if (option.inventoryKnown && option.stock <= LOW_STOCK_THRESHOLD) {
        button.dataset.stockState = "low";
        button.setAttribute("aria-label", `${option.size}, low availability`);
      } else {
        button.dataset.stockState = option.inventoryKnown ? "available" : "unknown";
        button.setAttribute("aria-label", option.inventoryKnown ? `${option.size}, available` : option.size);
      }
    });

    if (!size || !variant) {
      availability.dataset.state = "neutral";
      availability.textContent = product.requiresSize ? "Choose a size to review availability." : "Availability is not connected.";
      return;
    }
    if (!variant.inventoryKnown) {
      availability.dataset.state = "unknown";
      availability.textContent = "Live stock status is not connected in this prototype.";
      return;
    }
    if (variant.stock < 1) {
      availability.dataset.state = "sold-out";
      availability.textContent = `Size ${variant.size} is sold out.`;
      return;
    }
    if (variant.stock <= LOW_STOCK_THRESHOLD) {
      availability.dataset.state = "low";
      availability.textContent = `Low availability in size ${variant.size}.`;
      return;
    }
    availability.dataset.state = "available";
    availability.textContent = `Available in size ${variant.size}.`;
  };

  const dock = document.createElement("div");
  dock.className = "pdp-mobile-dock";
  dock.setAttribute("aria-label", "Purchase shortcut");
  dock.innerHTML = `
    <div class="pdp-mobile-dock__meta">
      <strong class="js-mobile-product-name"></strong>
      <span class="js-mobile-product-price"></span>
      <small class="js-mobile-selection">Choose a size</small>
    </div>
    <button class="js-mobile-add" type="button">Choose size</button>`;
  dock.querySelector(".js-mobile-product-name").textContent = product.name;
  dock.querySelector(".js-mobile-product-price").textContent = document.querySelector(".js-product-price")?.textContent || "";
  document.body.appendChild(dock);
  document.body.classList.add("has-mobile-purchase-dock");

  const syncDock = () => {
    const { color, size } = currentSelection();
    const colorName = product.colors.find((item) => item.value === color)?.name || "";
    dock.querySelector(".js-mobile-selection").textContent = size ? `${colorName} · Size ${size}` : `${colorName} · Choose a size`;
    dock.querySelector(".js-mobile-add").textContent = size ? "Add to Bag" : "Choose size";
  };

  const syncConfidenceStrip = () => {
    if (!confidenceStrip) return;
    const { size } = currentSelection();
    const fitNode = confidenceStrip.querySelector(".js-confidence-fit");
    const fitNote = confidenceStrip.querySelector(".js-confidence-fit-note");
    const stockNode = confidenceStrip.querySelector(".js-confidence-stock");
    const serviceNode = confidenceStrip.querySelector(".js-confidence-service");
    const fitCopy = product.fit || document.querySelector(".js-product-fit")?.textContent || "Fit guidance available below.";
    const deliveryCopy = document.querySelector(".js-delivery-window")?.textContent?.trim() || "Delivery timing shown below";
    const returnCopy = document.querySelector(".js-return-summary")?.textContent?.trim() || "Return terms shown below";

    if (fitNode) fitNode.textContent = size ? `Size ${size} selected` : "Choose a size";
    if (fitNote) fitNote.textContent = fitCopy;
    if (stockNode) stockNode.textContent = availability.textContent || "Choose a size to review availability.";
    if (serviceNode) serviceNode.textContent = `${deliveryCopy} · ${returnCopy}`;
  };

  const syncDecisionState = () => {
    syncAvailability();
    syncDock();
    syncConfidenceStrip();
  };

  sizeOptions.addEventListener("click", () => setTimeout(syncDecisionState, 0));
  colorOptions.addEventListener("click", () => setTimeout(syncDecisionState, 0));

  const sizeMutationObserver = new MutationObserver(() => queueMicrotask(syncDecisionState));
  sizeMutationObserver.observe(sizeOptions, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-pressed", "disabled"] });

  thumbnails.addEventListener("click", (event) => {
    if (!event.target.closest("button")) return;
    mainImage.classList.add("is-changing");
    requestAnimationFrame(() => requestAnimationFrame(() => mainImage.classList.remove("is-changing")));
  }, { capture: true });

  dock.querySelector(".js-mobile-add").addEventListener("click", () => {
    const { size } = currentSelection();
    if (!size) {
      sizeOptions.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
      sizeOptions.querySelector("button:not(:disabled)")?.focus({ preventScroll: true });
      return;
    }
    addButton.click();
  });

  let addRequested = false;
  addButton.addEventListener("click", () => { addRequested = true; }, { capture: true });
  window.addEventListener("atelier:cart-updated", () => {
    if (!addRequested) return;
    addRequested = false;
    addButton.dataset.state = "success";
    const original = addButton.textContent;
    addButton.textContent = "Added to Bag";
    setTimeout(() => {
      addButton.removeAttribute("data-state");
      addButton.textContent = original;
    }, matchMedia("(prefers-reduced-motion: reduce)").matches ? 200 : 900);
  });

  if ("IntersectionObserver" in window) {
    const dockObserver = new IntersectionObserver(([entry]) => {
      dock.classList.toggle("is-visible", !entry.isIntersecting && window.scrollY > 180);
    }, { threshold: 0.2 });
    dockObserver.observe(addButton);
    window.addEventListener("pagehide", () => dockObserver.disconnect(), { once: true });
  }

  syncDecisionState();
}
