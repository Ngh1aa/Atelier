// App entry: bootstrap per-page modules
import { initNav } from "./nav.js?v=atelier-v13";

function boot() {
  initNav();

  const path = location.pathname;
  if (/(^|\/)index\.html?$/.test(path) || path.endsWith("/")) {
    import("./index.js?v=atelier-v13").then((m) => m.initIndex());
  }
  if (path.includes("shop.html")) {
    import("./shop.js?v=atelier-v13").then((m) => m.renderShop());
  }
  if (path.includes("detailproduct.html")) {
    import("./detail.js?v=atelier-v13").then((m) => m.renderDetail());
  }
  if (path.includes("cart.html")) {
    import("./cart.js?v=white-editorial-v6").then((m) => m.renderCart());
  }
  if (path.includes("favourite.html")) {
    import("./favourite.js?v=white-editorial-v6").then((m) => m.renderFavourite());
  }
  if (path.includes("checkout.html")) {
    import("./precommerce-checkout.js?v=white-editorial-v6").then((m) => m.initPrecommerceCheckout());
  }
  if (path.includes("order-success.html")) {
    import("./order-success.js?v=white-editorial-v6").then((m) => m.renderOrderSuccess());
  } else if (path.includes("order.html")) {
    import("./order.js?v=white-editorial-v6").then((m) => m.renderOrder());
  }
  if (path.includes("account.html")) {
    import("./account.js?v=white-editorial-v6").then((m) => m.renderAccount());
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();
