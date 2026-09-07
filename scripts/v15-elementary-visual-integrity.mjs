import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts/v15-elementary-integrity");
await mkdir(outputDir, { recursive: true });

const routes = [
  ["home", "/index.html"],
  ["shop", "/shop.html"],
  ["pdp", "/detailproduct.html?id=tailored-wool-blazer"],
  ["collections", "/collections.html"],
  ["house", "/about.html"],
  ["services", "/client-services.html"],
  ["contact", "/contact.html"],
  ["shipping", "/shipping&returns.html"],
  ["size", "/size-guide.html"],
  ["care", "/care-guide.html"],
  ["cart", "/cart.html"],
  ["checkout", "/checkout.html"],
  ["saved", "/favourite.html"],
  ["account", "/account.html"],
  ["order", "/order.html?id=QA-ORDER-001"],
  ["order-success", "/order-success.html?id=QA-ORDER-001"],
  ["login", "/login.html"],
  ["forgot", "/forgot-password.html"],
  ["privacy", "/privacy.html"],
  ["terms", "/terms.html"],
];

const viewports = [
  { name: "desktop", width: 1363, height: 936 },
  { name: "pressure", width: 1100, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

const seededCart = [{
  id: "qa-tailored-wool-blazer-S",
  productId: "tailored-wool-blazer",
  variantId: null,
  color: "black",
  colorName: "Black",
  size: "S",
  quantity: 1,
  unitPrice: 3490000,
  addedAt: 1788753600000,
}];

const seededWishlist = [{
  productId: "cashmere-overcoat",
  preferredVariantId: null,
  savedAt: 1788753600000,
}];

const seededOrders = [{
  id: "QA-ORDER-001",
  currency: "VND",
  reality: "SIMULATED_LOCAL",
  paymentStatus: "pending-local",
  fulfillmentStatus: "recorded-local",
  tracking: null,
  serviceRequests: [],
  createdAt: "2026-09-07T04:00:00.000Z",
  customer: { email: "qa@example.test", phone: "0900000000", fullName: "QA Customer" },
  address: { country: "Vietnam", address: "1 Nguyen Hue", apartment: "", district: "District 1", province: "Ho Chi Minh City", postalCode: "" },
  deliveryMethod: "standard",
  deliveryEstimate: "2–4 days",
  paymentMethod: "cod",
  items: [{
    productId: "tailored-wool-blazer",
    variantId: null,
    name: "Belted Cropped Jacket",
    image: "./assets/products/pinkparks/belted-cropped-jacket.jpg",
    color: "Black",
    size: "S",
    quantity: 1,
    unitPrice: 3490000,
  }],
  subtotal: 3490000,
  shippingFee: 0,
  discount: 0,
  total: 3490000,
}];

const report = {
  generatedAt: new Date().toISOString(),
  baseURL,
  scope: "desktop_tablet_mobile",
  policy: {
    allVisibleTextCatastrophicFloor: 2.6,
    interactiveTextUsesNormalContrastThreshold: true,
    unverifiedPrimaryCoverCropIsBlocker: true,
    sharedOwnerCoverage: "all routes x desktop, pressure, tablet and mobile",
  },
  routes: [],
  blockers: [],
};

const browser = await chromium.launch({ headless: true, channel: process.env.QA_BROWSER_CHANNEL || undefined });
const addBlocker = (key, message, detail = null) => report.blockers.push({ key, message, detail });

async function primeContext(context) {
  await context.addInitScript(({ cart, wishlist, orders }) => {
    localStorage.setItem("atelier.cart.v2", JSON.stringify(cart));
    localStorage.setItem("atelier.wishlist.v2", JSON.stringify(wishlist));
    localStorage.setItem("atelier.orders", JSON.stringify(orders));
    localStorage.removeItem("atelier.promo");
  }, { cart: seededCart, wishlist: seededWishlist, orders: seededOrders });
}

async function freezeMotion(page) {
  await page.addStyleTag({ content: `
    *,*::before,*::after{
      animation-duration:.001ms!important;
      animation-delay:0ms!important;
      transition-duration:.001ms!important;
      transition-delay:0ms!important;
      scroll-behavior:auto!important;
    }
  ` });
}

async function snapshot(locator) {
  return locator.evaluate((el) => {
    const parse = (value) => {
      const match = String(value).match(/rgba?\(([^)]+)\)/i);
      if (!match) return { r: 0, g: 0, b: 0, a: 0 };
      const parts = match[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
      return {
        r: parts[0] || 0,
        g: parts[1] || 0,
        b: parts[2] || 0,
        a: Number.isFinite(parts[3]) ? parts[3] : 1,
      };
    };
    const over = (top, bottom) => {
      const alpha = top.a + bottom.a * (1 - top.a);
      if (alpha <= 0) return { r: 255, g: 255, b: 255, a: 1 };
      return {
        r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / alpha,
        g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / alpha,
        b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / alpha,
        a: alpha,
      };
    };
    const channel = (n) => {
      const c = n / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const luminance = ({ r, g, b }) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    const contrast = (a, b) => {
      const l1 = luminance(a);
      const l2 = luminance(b);
      return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    };
    const ownText = [...el.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent || "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const interactive = el.matches('a[href],button,[role="button"],input[type="button"],input[type="submit"]');
    const text = (ownText || (interactive ? (el.innerText || el.textContent || "") : ""))
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);

    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden" && Number.parseFloat(style.opacity || "1") > 0.05;

    let cursor = el;
    let bg = { r: 255, g: 255, b: 255, a: 0 };
    let variableMediaContext = false;
    let sourceNode = null;
    while (cursor) {
      const cs = getComputedStyle(cursor);
      if (cs.backgroundImage && cs.backgroundImage !== "none") variableMediaContext = true;
      const local = parse(cs.backgroundColor);
      if (local.a > 0) {
        bg = over(bg, local);
        if (!sourceNode) sourceNode = cursor;
      }
      if (bg.a >= 0.995) break;
      cursor = cursor.parentElement;
    }
    if (bg.a < 0.995) bg = over(bg, { r: 255, g: 255, b: 255, a: 1 });

    const positionedOverFigure = (() => {
      if (!['absolute', 'fixed'].includes(style.position)) return false;
      const figure = el.closest('figure');
      return !!figure?.querySelector('img,video,picture');
    })();
    variableMediaContext = variableMediaContext || positionedOverFigure;

    const fgRaw = parse(style.color);
    const fg = fgRaw.a < 0.995 ? over(fgRaw, bg) : fgRaw;
    const fontSize = Number.parseFloat(style.fontSize) || 16;
    const weight = Number.parseInt(style.fontWeight, 10) || 400;
    const threshold = fontSize >= 24 || (fontSize >= 18.66 && weight >= 700) ? 3 : 4.5;

    return {
      tag: el.tagName,
      className: typeof el.className === "string" ? el.className : "",
      text,
      interactive,
      visible,
      inViewport: rect.right > 0 && rect.bottom > 0 && rect.left < innerWidth && rect.top < innerHeight,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      color: style.color,
      backgroundColor: style.backgroundColor,
      effectiveBackground: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
      backgroundOwner: sourceNode ? `${sourceNode.tagName}.${typeof sourceNode.className === "string" ? sourceNode.className : ""}` : "page",
      ratio: Number(contrast(fg, bg).toFixed(2)),
      threshold,
      fontSize,
      fontWeight: weight,
      opacity: Number.parseFloat(style.opacity || "1"),
      variableMediaContext,
      disabled: !!el.disabled || el.getAttribute("aria-disabled") === "true",
    };
  });
}

async function auditVisibleText(page, key, entry) {
  const selectors = [
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "a[href]", "button", "label", "li", "span",
    "strong", "small", "summary", "legend", "td", "th", "dt", "dd", "[role=button]",
  ].join(",");
  const nodes = page.locator(selectors);
  const count = await nodes.count();
  entry.textAudit = { checked: 0, mediaContexts: 0, catastrophic: [] };

  for (let i = 0; i < count; i += 1) {
    const node = nodes.nth(i);
    const state = await snapshot(node);
    if (!state.visible || !state.text) continue;
    entry.textAudit.checked += 1;
    if (state.variableMediaContext) {
      entry.textAudit.mediaContexts += 1;
      continue;
    }
    if (state.ratio < report.policy.allVisibleTextCatastrophicFloor) {
      const detail = { index: i, text: state.text, className: state.className, color: state.color, background: state.effectiveBackground, ratio: state.ratio };
      entry.textAudit.catastrophic.push(detail);
      addBlocker(key, `catastrophic text/surface contrast ${state.ratio}:1`, detail);
    }
  }
}

async function auditInteractiveStates(page, key, entry) {
  const nodes = page.locator('a[href],button,[role="button"],input[type="button"],input[type="submit"]');
  const count = await nodes.count();
  entry.interactiveAudit = [];

  for (let i = 0; i < count; i += 1) {
    const node = nodes.nth(i);
    let initial;
    try {
      initial = await snapshot(node);
    } catch {
      continue;
    }
    if (!initial.visible || !initial.text) continue;

    try {
      await node.scrollIntoViewIfNeeded();
      await page.waitForTimeout(12);
    } catch {
      continue;
    }

    initial = await snapshot(node);
    if (!initial.visible || !initial.inViewport) continue;
    const item = { index: i, initial };

    const check = (name, state) => {
      if (!state || state.variableMediaContext) return;
      if (state.ratio < state.threshold) {
        addBlocker(key, `interactive ${name} contrast ${state.ratio}:1 below ${state.threshold}:1`, {
          index: i,
          text: state.text,
          className: state.className,
          color: state.color,
          background: state.effectiveBackground,
          backgroundOwner: state.backgroundOwner,
        });
      }
    };

    check("default", initial);
    if (!initial.disabled) {
      try {
        await node.hover({ force: true });
        await page.waitForTimeout(18);
        item.hover = await snapshot(node);
        check("hover", item.hover);

        await node.focus();
        await page.waitForTimeout(18);
        item.focus = await snapshot(node);
        check("focus", item.focus);
      } catch (error) {
        addBlocker(key, `interactive state audit failed for ${initial.text}`, String(error));
      }
    }
    entry.interactiveAudit.push(item);
  }
}

async function auditPrimaryMedia(page, key, entry) {
  entry.mediaAudit = [];
  const nodes = page.locator("main img");
  const count = await nodes.count();
  for (let i = 0; i < count; i += 1) {
    const media = await nodes.nth(i).evaluate((img) => {
      const style = getComputedStyle(img);
      const rect = img.getBoundingClientRect();
      const owner = img.closest("figure,section,article,div");
      const verified = img.dataset.cropVerified === "true" || owner?.dataset?.cropVerified === "true";
      const focalSubject = img.dataset.focalSubject || owner?.dataset?.focalSubject || "";
      return {
        src: img.getAttribute("src") || "",
        alt: img.getAttribute("alt") || "",
        className: img.className || "",
        objectFit: style.objectFit,
        objectPosition: style.objectPosition,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        visible: rect.width >= 240 && rect.height >= 220 && style.display !== "none" && style.visibility !== "hidden",
        verified,
        focalSubject,
      };
    });
    if (!media.visible) continue;
    entry.mediaAudit.push(media);

    if (media.objectFit === "cover") {
      if (!media.verified || !media.focalSubject) {
        addBlocker(key, "primary/feature media uses unverified object-fit: cover", media);
      }
    }
  }
}

async function captureKnownRiskStates(page, routeKey, viewportName) {
  const safe = `${routeKey}-${viewportName}`;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(20);
  await page.screenshot({ path: path.join(outputDir, `${safe}-top.png`), fullPage: false });

  const targets = [];
  if (routeKey === "home") targets.push(["home-hero", ".home-campaign-v14"]);
  if (routeKey === "house") targets.push(["house-hero", ".v12-house-hero"]);
  if (routeKey === "services") targets.push(["services-hero", ".v12-service-hero"]);
  if (routeKey === "cart") targets.push(["cart-summary", ".order-summary-card"]);
  if (routeKey === "checkout") targets.push(["checkout-summary", ".summary-card"]);
  if (routeKey === "home") targets.push(["footer", ".site-footer"]);

  for (const [label, selector] of targets) {
    const target = page.locator(selector).first();
    if (await target.count()) {
      try {
        await target.screenshot({ path: path.join(outputDir, `${safe}-${label}.png`) });
      } catch {
        // Non-fatal evidence capture; audit blockers are reported separately.
      }
    }
  }

  const hoverTarget = page.locator('.btn-checkout,.btn-place-order,.btn-primary,.btn-secondary,.btn-outline').filter({ visible: true }).first();
  if (await hoverTarget.count()) {
    try {
      await hoverTarget.scrollIntoViewIfNeeded();
      await hoverTarget.hover({ force: true });
      await page.waitForTimeout(20);
      await page.screenshot({ path: path.join(outputDir, `${safe}-hover-state.png`), fullPage: false });
    } catch {
      // Audit already records state failures.
    }
  }
}

await Promise.all(viewports.map(async (viewport) => {
  for (const [routeKey, pathname] of routes) {
    const key = `${routeKey}@${viewport.name}`;
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    await primeContext(context);
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    const response = await page.goto(new URL(pathname, baseURL).toString(), { waitUntil: "networkidle", timeout: 30_000 });
    await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
    await freezeMotion(page);
    await page.waitForTimeout(80);

    // Load lazy media before inspecting layout or capturing a full section.
    await page.evaluate(async () => {
      await Promise.all([...document.images].map(async (img) => {
        img.loading = "eager";
        try { await img.decode(); } catch { /* Report broken sources below. */ }
      }));
    });

    const entry = {
      key,
      routeKey,
      pathname,
      viewport,
      httpStatus: response?.status() || null,
      consoleErrors,
      pageErrors,
    };

    if (!response?.ok()) addBlocker(key, `HTTP ${response?.status() ?? "no response"}`);
    if (consoleErrors.length) addBlocker(key, `console errors: ${consoleErrors.join(" | ")}`);
    if (pageErrors.length) addBlocker(key, `page errors: ${pageErrors.join(" | ")}`);

    entry.layout = await page.evaluate(() => {
      const width = document.documentElement.clientWidth;
      const overflow = [...document.querySelectorAll('main *, footer *')].filter((el) => {
        const box = el.getBoundingClientRect();
        if (!box.width || !box.height || getComputedStyle(el).visibility === 'hidden') return false;
        // Tables and rails may scroll locally without widening the page.
        if (el.closest('.size-table-wrap,.thumbnail-gallery')) return false;
        return box.right > width + 2 || box.left < -2;
      }).map((el) => `${el.tagName}.${el.className}`).slice(0, 12);
      const brokenImages = [...document.images].filter((img) => !img.naturalWidth).map((img) => img.getAttribute('src'));
      const hero = document.querySelector('.home-campaign-v14');
      let heroIntegrity = true;
      if (hero) {
        const outer = hero.getBoundingClientRect();
        const media = hero.querySelector('figure').getBoundingClientRect();
        const panel = hero.querySelector('.home-campaign-v14__panel').getBoundingClientRect();
        const actions = hero.querySelector('.home-campaign-v14__actions').getBoundingClientRect();
        heroIntegrity = actions.bottom <= outer.bottom + 1 && actions.right <= outer.right + 1;
        if (innerWidth > 600) heroIntegrity &&= Math.abs(media.width - panel.width) < 2 && Math.abs(media.bottom - panel.bottom) < 2;
      }
      return { width, scrollWidth: document.documentElement.scrollWidth, overflow, brokenImages, heroIntegrity };
    });
    if (entry.layout.scrollWidth > entry.layout.width + 2 || entry.layout.overflow.length) addBlocker(key, 'horizontal layout overflow', entry.layout);
    if (entry.layout.brokenImages.length) addBlocker(key, 'broken images', entry.layout.brokenImages);
    if (!entry.layout.heroIntegrity) addBlocker(key, 'unequal hero columns or clipped actions', entry.layout);

    await auditVisibleText(page, key, entry);
    await auditInteractiveStates(page, key, entry);
    await auditPrimaryMedia(page, key, entry);
    await captureKnownRiskStates(page, routeKey, viewport.name);

    report.routes.push(entry);
    console.log(`${key}: ${report.blockers.filter((item) => item.key === key).length} blockers`);
    await context.close();
  }
}));

await browser.close();
await writeFile(path.join(outputDir, "detailed-report.local.json"), JSON.stringify(report, null, 2));
await writeFile(path.join(outputDir, "report.json"), JSON.stringify({
  ...report,
  routes: report.routes.map(({ interactiveAudit, ...entry }) => ({
    ...entry,
    interactiveControlsChecked: interactiveAudit.length,
  })),
}, null, 2));

console.log(`V15 elementary visual integrity: ${report.routes.length} route/viewport states.`);
console.log(`Blockers: ${report.blockers.length}`);
for (const blocker of report.blockers) console.log(JSON.stringify(blocker));
if (report.blockers.length) process.exit(1);
