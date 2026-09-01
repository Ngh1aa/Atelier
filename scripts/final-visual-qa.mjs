import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts");
await mkdir(outputDir, { recursive: true });

const routes = [
  { key: "home", path: "/index.html", widths: [390, 768, 1440, 1920] },
  { key: "shop", path: "/shop.html", widths: [390, 768, 1440] },
  { key: "pdp", path: "/detailproduct.html?id=tailored-wool-blazer", widths: [390, 768, 1440] },
  { key: "checkout", path: "/checkout.html", widths: [390, 768, 1440] },
  { key: "bag", path: "/cart.html", widths: [390, 1440] },
  { key: "saved", path: "/favourite.html", widths: [390, 1440] },
  { key: "service", path: "/shipping&returns.html", widths: [390, 1440] },
];

const seededCart = [
  {
    id: "qa-tailored-wool-blazer",
    productId: "tailored-wool-blazer",
    variantId: null,
    color: null,
    colorName: null,
    size: null,
    quantity: 1,
    unitPrice: 19500000,
    addedAt: 1788253200000,
  },
];

const seededWishlist = [
  { productId: "cashmere-overcoat", preferredVariantId: null, savedAt: 1788253200000 },
];

const browser = await chromium.launch({ headless: true });
const report = {
  generatedAt: new Date().toISOString(),
  baseURL,
  checks: [],
};

for (const route of routes) {
  for (const width of route.widths) {
    const height = width <= 430 ? 844 : width <= 800 ? 1024 : 1000;
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];

    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    await page.addInitScript(({ cart, wishlist }) => {
      localStorage.setItem("atelier.cart.v2", JSON.stringify(cart));
      localStorage.setItem("atelier.wishlist.v2", JSON.stringify(wishlist));
      localStorage.removeItem("atelier.promo");
    }, { cart: seededCart, wishlist: seededWishlist });

    const url = new URL(route.path, baseURL).toString();
    const response = await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 });
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
    });
    await page.addStyleTag({ content: `
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-delay: 0ms !important;
        transition-duration: 0.001ms !important;
        transition-delay: 0ms !important;
        scroll-behavior: auto !important;
      }
    `});
    await page.waitForTimeout(150);

    const baseName = `${route.key}-${width}`;
    await page.screenshot({ path: path.join(outputDir, `${baseName}-top.png`), fullPage: false });
    await page.screenshot({ path: path.join(outputDir, `${baseName}-full.png`), fullPage: true });

    const metrics = await page.evaluate(() => {
      const rect = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const box = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return {
          width: Math.round(box.width),
          height: Math.round(box.height),
          top: Math.round(box.top),
          left: Math.round(box.left),
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          color: style.color,
          backgroundColor: style.backgroundColor,
        };
      };

      const interactive = [...document.querySelectorAll("a[href], button, input, select, textarea")]
        .filter((el) => {
          const style = getComputedStyle(el);
          const box = el.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
        });
      const smallTouchTargets = interactive
        .map((el) => {
          const box = el.getBoundingClientRect();
          return {
            tag: el.tagName.toLowerCase(),
            text: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
            width: Math.round(box.width),
            height: Math.round(box.height),
          };
        })
        .filter((item) => item.width < 40 || item.height < 40)
        .slice(0, 30);

      return {
        title: document.title,
        h1: document.querySelector("h1")?.textContent?.trim() || null,
        bodyBackground: getComputedStyle(document.body).backgroundColor,
        bodyColor: getComputedStyle(document.body).color,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        nav: rect("nav"),
        logo: rect("nav .logo"),
        primaryButton: rect(".btn-shop, .js-place-order, .checkout-submit"),
        cardRoleLinks: document.querySelectorAll(".product-card[role='link']").length,
        h1Count: document.querySelectorAll("h1").length,
        unlabeledInputs: [...document.querySelectorAll("input, select, textarea")].filter((el) => {
          if (el.type === "hidden") return false;
          if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")) return false;
          if (el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`)) return false;
          return !el.closest("label");
        }).length,
        emptyButtons: [...document.querySelectorAll("button")].filter((el) => {
          const name = (el.getAttribute("aria-label") || el.textContent || "").trim();
          return !name && !el.getAttribute("aria-labelledby");
        }).length,
        smallTouchTargets,
      };
    });

    const check = {
      route: route.key,
      path: route.path,
      width,
      height,
      httpStatus: response?.status() || null,
      consoleErrors,
      pageErrors,
      ...metrics,
    };
    report.checks.push(check);

    if (route.key === "home" && width === 390) {
      const toggle = page.locator(".mobile-menu-toggle");
      if (await toggle.count()) {
        await toggle.click();
        await page.waitForTimeout(100);
        await page.screenshot({ path: path.join(outputDir, "home-390-mobile-menu.png"), fullPage: false });
        await page.keyboard.press("Escape");
      }
    }

    if (route.key === "home" && width === 1440) {
      await page.evaluate(() => window.scrollTo(0, 720));
      await page.waitForTimeout(120);
      await page.screenshot({ path: path.join(outputDir, "home-1440-scrolled-nav.png"), fullPage: false });
    }

    if (route.key === "shop" && width === 390) {
      const filterToggle = page.locator(".js-filter-toggle, .filter-toggle, [data-filter-toggle]").first();
      if (await filterToggle.count()) {
        await filterToggle.click();
        await page.waitForTimeout(120);
        await page.screenshot({ path: path.join(outputDir, "shop-390-filter-open.png"), fullPage: false });
        await page.keyboard.press("Escape");
      }
    }

    await context.close();
  }
}

await browser.close();
await writeFile(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));

const blockers = report.checks.filter((check) =>
  check.httpStatus !== 200 ||
  check.pageErrors.length ||
  check.horizontalOverflow ||
  check.h1Count !== 1 ||
  check.unlabeledInputs ||
  check.emptyButtons ||
  check.cardRoleLinks
);

console.log(`Captured ${report.checks.length} route/viewport combinations.`);
console.log(`Automated blocker candidates: ${blockers.length}.`);
for (const blocker of blockers) {
  console.log(JSON.stringify({
    route: blocker.route,
    width: blocker.width,
    status: blocker.httpStatus,
    pageErrors: blocker.pageErrors,
    horizontalOverflow: blocker.horizontalOverflow,
    h1Count: blocker.h1Count,
    unlabeledInputs: blocker.unlabeledInputs,
    emptyButtons: blocker.emptyButtons,
    cardRoleLinks: blocker.cardRoleLinks,
  }));
}
