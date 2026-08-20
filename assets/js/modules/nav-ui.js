// Search overlay UI + bag badge (called on every page)
export function initSearchOverlay() {
  const btn = document.getElementById("navSearchBtn");
  const overlay = document.getElementById("navSearchOverlay");
  const input = document.getElementById("navSearchInput");
  const close = document.getElementById("navSearchClose");
  const results = document.getElementById("navSearchResults");
  if (!btn || !overlay || !input || !close || !results) return;

  const openSearch = () => {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => input.focus(), 300);
  };
  const closeSearch = () => {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    input.value = "";
    results.innerHTML = "";
  };

  btn.addEventListener("click", openSearch);
  close.addEventListener("click", closeSearch);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSearch();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeSearch();
  });

  let products = [];
  const loadProducts = async () => {
    try {
      const res = await fetch("./assets/data/products.json");
      products = await res.json();
    } catch {
      products = [];
    }
  };
  let loaded = loadProducts();

  const fmtPrice = (n) =>
    Number(n).toLocaleString("vi-VN") + "\u20AB";

  const renderResults = (list) => {
    results.innerHTML = list
      .map(
        (p) =>
          `<a href="detailproduct.html?id=${p.id}"><span>${p.name}</span><span class="price">${fmtPrice(p.price)}</span></a>`
      )
      .join("");
  };

  input.addEventListener("input", async () => {
    await loaded;
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      results.innerHTML = "";
      return;
    }
    const list = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
    );
    renderResults(list);
  });
}

export function initBagBadge() {
  const els = document.querySelectorAll(".js-nav-bag-count");
  if (!els.length) return;
  try {
    const cart = JSON.parse(localStorage.getItem("atelier.cart") || "{}");
    const count = Object.values(cart).reduce(
      (s, it) => s + Number(it.qty || 1),
      0
    );
    els.forEach((el) => (el.textContent = String(count)));
  } catch {
    /* ignore */
  }
}
