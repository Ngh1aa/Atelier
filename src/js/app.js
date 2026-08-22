// App entry: bootstrap per-page modules
import { initNav } from "./nav.js";

function boot() {
  initNav();

  const path = location.pathname;
  if (/(^|\/)index\.html?$/.test(path) || path.endsWith("/")) {
    import("./index.js").then((m) => m.initIndex());
  }
  if (path.includes("shop.html")) {
    import("./shop.js").then((m) => m.renderShop());
  }
  if (path.includes("detailproduct.html")) {
    import("./detail.js").then((m) => m.renderDetail());
  }
  if (path.includes("cart.html")) {
    import("./cart.js").then((m) => m.renderCart());
  }
  if (path.includes("favourite.html")) {
    import("./favourite.js").then((m) => m.renderFavourite());
  }
  if (path.includes("checkout.html")) {
    import("./precommerce-checkout.js").then((m) => m.initPrecommerceCheckout());
  }
  if (path.includes("order-success.html")) {
    import("./order-success.js").then((m) => m.renderOrderSuccess());
  } else if (path.includes("order.html")) {
    import("./order.js").then((m) => m.renderOrder());
  }
  if (path.includes("account.html")) {
    import("./account.js").then((m) => m.renderAccount());
  }
}

document.addEventListener("DOMContentLoaded", boot);
