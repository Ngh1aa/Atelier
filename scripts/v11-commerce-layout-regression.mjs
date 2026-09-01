import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

async function check(route, width, assertions) {
  const height = width <= 430 ? 844 : 1000;
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion: "reduce" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });

  const response = await page.goto(new URL(route, baseURL).toString(), { waitUntil: "networkidle", timeout: 30000 });
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  await page.waitForTimeout(180);

  const metrics = await page.evaluate(() => {
    const box = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return {
        top: r.top, left: r.left, right: r.right, bottom: r.bottom,
        width: r.width, height: r.height,
        fontSize: parseFloat(s.fontSize),
        display: s.display,
        position: s.position,
        objectFit: s.objectFit,
      };
    };
    return {
      design: document.documentElement.dataset.atelierDesign,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hero: box(".campaign-sheet"),
      heroCopy: box(".campaign-copy"),
      heroImage: box(".campaign-frame-main"),
      homeH1: box(".campaign-copy h1"),
      productBand: box(".v7-product-band"),
      productStrip: box(".v7-product-strip"),
      firstHomeCard: box(".v7-product-card"),
      filterBar: box(".filter-bar"),
      shopGrid: box(".shop-grid"),
      firstShopCard: box(".shop-grid .product-item-wrap"),
      pdpGrid: box(".product-detail-grid"),
      pdpMedia: box(".main-img-wrap"),
      pdpImage: box("#main-product-img"),
      pdpInfo: box(".product-info-col"),
      pdpTitle: box(".product-title"),
      cartGrid: box(".cart-grid"),
      orderSummary: box(".order-summary"),
      checkoutGrid: box(".checkout-grid"),
      checkoutSummary: box(".checkout-summary"),
      bodyHeight: document.body.scrollHeight,
    };
  });

  const failures = [];
  if (!response || response.status() >= 400) failures.push(`HTTP ${response?.status?.() ?? "no response"}`);
  if (metrics.design !== "v11-commerce") failures.push(`wrong design owner: ${metrics.design}`);
  if (metrics.scrollWidth > metrics.clientWidth + 2) failures.push(`horizontal overflow ${metrics.scrollWidth}/${metrics.clientWidth}`);
  if (consoleErrors.length) failures.push(`console errors: ${consoleErrors.join(" | ")}`);
  assertions(metrics, failures);

  const key = route.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "home";
  await page.screenshot({ path: path.join(outputDir, `v11-${key}-${width}-top.png`), fullPage: false });
  await page.screenshot({ path: path.join(outputDir, `v11-${key}-${width}-full.png`), fullPage: true });
  results.push({ route, width, passed: failures.length === 0, failures, metrics });
  await context.close();
}

await check("/index.html", 1440, (m, f) => {
  if (!m.hero || m.hero.height > 780) f.push(`home hero too tall: ${m.hero?.height}`);
  if (!m.heroCopy || !m.heroImage || Math.abs(m.heroCopy.top - m.heroImage.top) > 4) f.push("home hero columns are not aligned");
  if (!m.homeH1 || m.homeH1.fontSize > 110) f.push(`home headline oversized: ${m.homeH1?.fontSize}`);
  if (!m.productStrip || !m.firstHomeCard) f.push("home product grid missing");
  if (m.productStrip && m.firstHomeCard && m.firstHomeCard.top - m.productStrip.top > 40) f.push("home product card detached from product grid");
});

await check("/index.html", 390, (m, f) => {
  if (!m.hero || m.hero.height > 1050) f.push(`mobile hero too tall: ${m.hero?.height}`);
  if (!m.homeH1 || m.homeH1.fontSize > 78) f.push(`mobile headline oversized: ${m.homeH1?.fontSize}`);
});

await check("/shop.html", 1440, (m, f) => {
  if (!m.shopGrid || !m.firstShopCard) f.push("shop grid missing");
  if (m.filterBar && m.firstShopCard && m.firstShopCard.top - m.filterBar.bottom > 100) f.push(`shop first product too far from controls: ${Math.round(m.firstShopCard.top - m.filterBar.bottom)}px`);
  if (m.firstShopCard && m.firstShopCard.width > 420) f.push(`shop card too wide: ${Math.round(m.firstShopCard.width)}px`);
});

await check("/shop.html", 390, (m, f) => {
  if (!m.firstShopCard || m.firstShopCard.width > 205) f.push(`mobile shop should be dense two-column: ${m.firstShopCard?.width}`);
});

await check("/detailproduct.html?id=tailored-wool-blazer", 1440, (m, f) => {
  if (!m.pdpMedia || !m.pdpInfo) f.push("pdp columns missing");
  if (m.pdpMedia && m.pdpInfo && m.pdpInfo.left <= m.pdpMedia.left) f.push("pdp info is not beside media");
  if (m.pdpImage?.objectFit !== "contain") f.push(`pdp image must contain, got ${m.pdpImage?.objectFit}`);
  if (!m.pdpTitle || m.pdpTitle.fontSize > 76) f.push(`pdp title oversized: ${m.pdpTitle?.fontSize}`);
});

await check("/cart.html", 1440, (m, f) => {
  if (!m.cartGrid || !m.orderSummary) f.push("bag two-column layout missing");
  if (m.cartGrid && m.orderSummary && m.orderSummary.left < m.cartGrid.left + m.cartGrid.width * .55) f.push("bag summary is not a distinct right rail");
});

await check("/checkout.html", 1440, (m, f) => {
  if (!m.checkoutGrid || !m.checkoutSummary) f.push("checkout two-column layout missing");
  if (m.checkoutGrid && m.checkoutSummary && m.checkoutSummary.left < m.checkoutGrid.left + m.checkoutGrid.width * .55) f.push("checkout summary is not a distinct right rail");
});

await browser.close();
const passed = results.every((item) => item.passed);
await writeFile(path.join(outputDir, "v11-commerce-layout-report.json"), JSON.stringify({ passed, results }, null, 2));
if (!passed) {
  console.error(JSON.stringify(results.filter((item) => !item.passed), null, 2));
  process.exit(1);
}
console.log(`V11 commerce layout regression passed (${results.length} checks).`);
