// App entry: bootstrap per-page modules
import { initNav } from "./nav.js?v=monochrome-20260907";
import { initDemoControls } from "./demo-controls.js?v=full-prototype";

function page(name) {
  return location.pathname.split("/").pop().replace(/\.html?$/, "") === name;
}

function boot() {
  initNav();
  initDemoControls();

  const path = location.pathname;
  if (/(^|\/)index\.html?$/.test(path) || path.endsWith("/")) {
    import("./index.js?v=atelier-v13").then((m) => m.initIndex());
  }
  if (page("shop")) import("./shop.js?v=full-prototype").then((m) => m.renderShop());
  if (page("detailproduct")) import("./detail.js?v=full-prototype").then((m) => m.renderDetail());
  if (page("cart")) import("./cart.js?v=full-prototype").then((m) => m.renderCart());
  if (page("favourite")) import("./favourite.js?v=full-prototype").then((m) => m.renderFavourite());
  if (page("checkout")) import("./precommerce-checkout.js?v=full-prototype").then((m) => m.initPrecommerceCheckout());
  if (page("order-success")) import("./order-success.js?v=full-prototype").then((m) => m.renderOrderSuccess());
  if (page("order")) import("./order.js?v=full-prototype").then((m) => m.renderOrder());
  if (page("account")) import("./account.js?v=full-prototype").then((m) => m.renderAccount());
  if (page("login")) import("./auth.js?v=full-prototype").then((m) => m.initLogin());
  if (page("forgot-password")) import("./auth.js?v=full-prototype").then((m) => m.initForgotPassword());
  if (page("contact")) import("./services.js?v=full-prototype").then((m) => m.initEnquiry());
  if (page("size-guide")) import("./services.js?v=full-prototype").then((m) => m.initSizeGuide());
  if (page("client-services")) import("./services.js?v=full-prototype").then((m) => m.initAppointments());
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
else boot();
