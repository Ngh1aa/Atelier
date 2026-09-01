import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts");
await mkdir(outputDir, { recursive: true });

const routes = [
  "/index.html",
  "/shop.html",
  "/detailproduct.html?id=tailored-wool-blazer",
  "/collections.html",
  "/about.html",
  "/client-services.html",
  "/size-guide.html",
  "/care-guide.html",
  "/shipping&returns.html",
  "/contact.html",
  "/cart.html",
  "/favourite.html",
  "/checkout.html",
  "/order.html?id=QA-ORDER-001",
];

const seededCart = [{
  id: "qa-tailored-wool-blazer",
  productId: "tailored-wool-blazer",
  variantId: null,
  color: null,
  colorName: null,
  size: null,
  quantity: 1,
  unitPrice: 19500000,
  addedAt: 1788253200000,
}];

const seededWishlist = [{
  productId: "cashmere-overcoat",
  preferredVariantId: null,
  savedAt: 1788253200000,
}];

const seededOrders = [{
  id: "QA-ORDER-001",
  currency: "VND",
  reality: "SIMULATED_LOCAL",
  paymentStatus: "pending-local",
  fulfillmentStatus: "recorded-local",
  tracking: null,
  serviceRequests: [],
  createdAt: "2026-09-01T10:00:00.000Z",
  customer: { email: "qa@example.test", phone: "0900000000", fullName: "QA Customer" },
  address: { country: "Vietnam", address: "1 Nguyen Hue", apartment: "", district: "District 1", province: "Ho Chi Minh City", postalCode: "" },
  deliveryMethod: "standard",
  deliveryEstimate: "3–5 September",
  paymentMethod: "cod",
  items: [{
    productId: "tailored-wool-blazer",
    variantId: null,
    name: "Tailored Wool Blazer",
    image: "./assets/products/pinkparks/belted-cropped-jacket.jpg",
    color: "Black",
    size: "M",
    quantity: 1,
    unitPrice: 19500000,
  }],
  subtotal: 19500000,
  shippingFee: 0,
  discount: 0,
  total: 19500000,
}];

async function primeLazyMedia(page) {
  await page.evaluate(async () => {
    const step = Math.max(360, Math.floor(innerHeight * .8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 120));
  });
}

const browser = await chromium.launch({ headless: true });
const report = [];
let failed = false;

for (const route of routes) {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width < 500 ? 844 : 1000 },
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.addInitScript(({ cart, wishlist, orders }) => {
      localStorage.setItem("atelier.cart.v2", JSON.stringify(cart));
      localStorage.setItem("atelier.wishlist.v2", JSON.stringify(wishlist));
      localStorage.setItem("atelier.orders", JSON.stringify(orders));
    }, { cart: seededCart, wishlist: seededWishlist, orders: seededOrders });

    const response = await page.goto(new URL(route, baseURL).toString(), { waitUntil: "networkidle", timeout: 30_000 });
    await primeLazyMedia(page);

    const metrics = await page.evaluate(() => {
      const frameSelector = [
        ".campaign-frame-main",
        ".campaign-frame-offset",
        ".v7-product-image",
        ".v7-collection-image",
        ".v7-collection-detail",
        ".v7-editorial-break > figure",
        ".product-grid-item__image",
        ".main-img-wrap",
        ".pdp-thumbnail",
        ".collection-feature-image",
        ".house-image-frame",
        ".favourite-img",
        ".cart-item-img",
        ".v12-service-media",
        ".v12-house-hero-media",
        ".v12-house-code figure",
        ".v12-house-studio-media",
        ".v12-shop-visual figure",
      ].join(",");

      const images = [...document.querySelectorAll("main img")]
        .map((img) => {
          const rect = img.getBoundingClientRect();
          const style = getComputedStyle(img);
          const matrix = new DOMMatrixReadOnly(style.transform === "none" ? undefined : style.transform);
          const frame = img.closest(frameSelector);
          const frameRect = frame?.getBoundingClientRect() || null;
          const frameStyle = frame ? getComputedStyle(frame) : null;
          const padding = frameStyle ? [frameStyle.paddingTop, frameStyle.paddingRight, frameStyle.paddingBottom, frameStyle.paddingLeft].map(Number.parseFloat) : [];
          return {
            src: img.getAttribute("src") || "",
            className: img.className || "",
            width: rect.width,
            height: rect.height,
            ratio: rect.height > 0 ? rect.width / rect.height : null,
            objectFit: style.objectFit,
            objectPosition: style.objectPosition,
            transform: style.transform,
            scaleX: matrix.a,
            scaleY: matrix.d,
            backgroundColor: style.backgroundColor,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
            complete: img.complete,
            frame: frame ? {
              className: frame.className || frame.tagName,
              width: frameRect.width,
              height: frameRect.height,
              ratio: frameRect.height > 0 ? frameRect.width / frameRect.height : null,
              padding,
              backgroundColor: frameStyle.backgroundColor,
              fillX: frameRect.width > 0 ? rect.width / frameRect.width : null,
              fillY: frameRect.height > 0 ? rect.height / frameRect.height : null,
            } : null,
          };
        })
        .filter((item) => item.width >= 70 && item.height >= 70);

      return {
        design: document.documentElement.dataset.atelierDesign || "",
        mediaOwnerLoaded: Boolean(document.querySelector('link[href*="atelier-media-integrity.css"]')),
        images,
      };
    });

    const failures = [];
    if (!response?.ok()) failures.push(`HTTP ${response?.status() ?? "no response"}`);
    if (metrics.design !== "v11-commerce") failures.push(`wrong design owner: ${metrics.design}`);
    if (!metrics.mediaOwnerLoaded) failures.push("sitewide media owner missing");

    for (const image of metrics.images) {
      if (!image.complete || image.naturalWidth < 1 || image.naturalHeight < 1) {
        failures.push(`broken image: ${image.src}`);
        continue;
      }
      if (image.objectFit !== "contain") failures.push(`cropping fit ${image.objectFit}: ${image.src}`);
      if (Math.abs(image.scaleX - 1) > .02 || Math.abs(image.scaleY - 1) > .02) {
        failures.push(`scaled image ${image.scaleX.toFixed(3)}×${image.scaleY.toFixed(3)}: ${image.src}`);
      }
      if (image.backgroundColor !== "rgb(255, 255, 255)") {
        failures.push(`non-white image canvas ${image.backgroundColor}: ${image.src}`);
      }

      if (image.frame) {
        if (image.frame.ratio != null && Math.abs(image.frame.ratio - .75) > .05) {
          failures.push(`frame not 3:4 (${image.frame.ratio.toFixed(3)}): ${image.src}`);
        }
        if (image.frame.padding.some((value) => value > 1.5)) {
          failures.push(`inset frame padding ${image.frame.padding.join("/")}: ${image.src}`);
        }
        if (image.frame.backgroundColor !== "rgb(255, 255, 255)") {
          failures.push(`non-white frame ${image.frame.backgroundColor}: ${image.src}`);
        }
        if (image.frame.fillX != null && image.frame.fillX < .96) {
          failures.push(`image width only ${(image.frame.fillX * 100).toFixed(1)}% of frame: ${image.src}`);
        }
        if (image.frame.fillY != null && image.frame.fillY < .96) {
          failures.push(`image height only ${(image.frame.fillY * 100).toFixed(1)}% of frame: ${image.src}`);
        }
      } else if (image.ratio != null && image.ratio > .84) {
        failures.push(`non-portrait material image ${image.ratio.toFixed(3)}: ${image.src}`);
      }
    }

    const key = route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
    await page.screenshot({ path: path.join(outputDir, `portrait-${key}-${width}.png`), fullPage: false });
    report.push({ route, width, passed: failures.length === 0, failures, images: metrics.images });
    if (failures.length) failed = true;
    await context.close();
  }
}

await browser.close();
await writeFile(path.join(outputDir, "portrait-media-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.map(({ route, width, passed, failures }) => ({ route, width, passed, failures })), null, 2));
if (failed) process.exit(1);
