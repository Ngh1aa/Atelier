import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts/v14-sanity");
await mkdir(outputDir, { recursive: true });

const viewport = { width: 1363, height: 936 };
const browser = await chromium.launch({ headless: true });
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
  ["order", "/order.html"],
  ["order-success", "/order-success.html"],
  ["login", "/login.html"],
  ["forgot", "/forgot-password.html"],
  ["privacy", "/privacy.html"],
  ["terms", "/terms.html"],
];

const buttonSelector = [
  ".btn-primary",
  ".btn-secondary",
  ".btn-outline",
  ".btn-shop",
  ".commerce-primary-action",
  ".commerce-secondary-action",
  ".btn-add-cart",
  ".btn-checkout",
  ".btn-place-order",
  ".product-grid-item__add-to-cart",
].join(",");

const footerSelectors = [
  ".site-footer .footer-newsletter .eyebrow",
  ".site-footer .footer-newsletter h3",
  ".site-footer .footer-newsletter .btn-outline",
  ".site-footer .brand-col .logo span",
  ".site-footer .brand-col p",
  ".site-footer .footer-col h4",
  ".site-footer .footer-links a",
  ".site-footer .footer-bottom",
];

const report = { generatedAt: new Date().toISOString(), viewport, routes: [], blockers: [] };
const block = (key, message, detail = null) => report.blockers.push({ key, message, detail });

async function stateSnapshot(locator) {
  return locator.evaluate((el) => {
    const parse = (value) => {
      const m = String(value).match(/rgba?\(([^)]+)\)/i);
      if (!m) return { r: 0, g: 0, b: 0, a: 0 };
      const parts = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
      return { r: parts[0] || 0, g: parts[1] || 0, b: parts[2] || 0, a: Number.isFinite(parts[3]) ? parts[3] : 1 };
    };
    const over = (top, bottom) => {
      const a = top.a + bottom.a * (1 - top.a);
      if (a <= 0) return { r: 255, g: 255, b: 255, a: 0 };
      return {
        r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a,
        g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a,
        b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a,
        a,
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
    const effectiveBackground = (node) => {
      let composite = { r: 255, g: 255, b: 255, a: 0 };
      let cursor = node;
      while (cursor) {
        const bg = parse(getComputedStyle(cursor).backgroundColor);
        composite = over(composite, bg);
        if (composite.a >= 0.995) break;
        cursor = cursor.parentElement;
      }
      if (composite.a < 0.995) composite = over(composite, { r: 255, g: 255, b: 255, a: 1 });
      return composite;
    };

    const style = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const bg = effectiveBackground(el);
    const fgRaw = parse(style.color);
    const fg = fgRaw.a < 0.995 ? over(fgRaw, bg) : fgRaw;
    const fontSize = Number.parseFloat(style.fontSize) || 16;
    const weight = Number.parseInt(style.fontWeight, 10) || 400;
    const threshold = fontSize >= 24 || (fontSize >= 18.66 && weight >= 700) ? 3 : 4.5;
    return {
      tag: el.tagName,
      className: typeof el.className === "string" ? el.className : "",
      text: (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 120),
      display: style.display,
      visibility: style.visibility,
      opacity: Number.parseFloat(style.opacity || "1"),
      disabled: !!el.disabled,
      ariaDisabled: el.getAttribute("aria-disabled") === "true",
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      color: style.color,
      backgroundColor: style.backgroundColor,
      effectiveBackground: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
      fontSize,
      fontWeight: weight,
      ratio: Number(contrast(fg, bg).toFixed(2)),
      threshold,
      visible: rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden" && Number.parseFloat(style.opacity || "1") > 0.05,
      inViewport: rect.right > 0 && rect.bottom > 0 && rect.left < window.innerWidth && rect.top < window.innerHeight,
    };
  });
}

async function auditFooter(page, key, entry) {
  entry.footer = [];
  for (const selector of footerSelectors) {
    const nodes = page.locator(selector);
    const count = await nodes.count();
    for (let i = 0; i < count; i += 1) {
      const state = await stateSnapshot(nodes.nth(i));
      if (!state.visible || !state.text) continue;
      entry.footer.push({ selector, index: i, ...state });
      if (state.ratio < state.threshold) {
        block(key, `footer contrast ${state.ratio}:1 below ${state.threshold}:1`, { selector, index: i, text: state.text, color: state.color, background: state.effectiveBackground });
      }
    }
  }
}

async function auditButtons(page, key, entry) {
  const nodes = page.locator(buttonSelector);
  const count = await nodes.count();
  entry.buttons = [];
  for (let i = 0; i < count; i += 1) {
    const node = nodes.nth(i);
    const discovered = await stateSnapshot(node);
    if (!discovered.visible || !discovered.text) continue;

    try {
      await node.scrollIntoViewIfNeeded();
      await page.waitForTimeout(20);
    } catch {
      continue;
    }

    const initial = await stateSnapshot(node);
    if (!initial.visible || !initial.inViewport) continue;

    const item = { index: i, initial };
    if (initial.ratio < initial.threshold) {
      block(key, `button default contrast ${initial.ratio}:1 below ${initial.threshold}:1`, { index: i, text: initial.text, className: initial.className, color: initial.color, background: initial.effectiveBackground });
    }

    if (initial.disabled || initial.ariaDisabled) {
      entry.buttons.push(item);
      continue;
    }

    try {
      await node.hover({ force: true });
      await page.waitForTimeout(30);
      item.hover = await stateSnapshot(node);
      if (item.hover.ratio < item.hover.threshold) {
        block(key, `button hover contrast ${item.hover.ratio}:1 below ${item.hover.threshold}:1`, { index: i, text: item.hover.text, className: item.hover.className, color: item.hover.color, background: item.hover.effectiveBackground });
      }

      await node.focus();
      await page.waitForTimeout(20);
      item.focus = await stateSnapshot(node);
      if (item.focus.ratio < item.focus.threshold) {
        block(key, `button focus contrast ${item.focus.ratio}:1 below ${item.focus.threshold}:1`, { index: i, text: item.focus.text, className: item.focus.className, color: item.focus.color, background: item.focus.effectiveBackground });
      }
    } catch (error) {
      block(key, `button state audit failed for ${initial.text}`, String(error));
    }
    entry.buttons.push(item);
  }
}

for (const [key, pathname] of routes) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "reduce" });
  const page = await context.newPage();
  const response = await page.goto(new URL(pathname, baseURL).toString(), { waitUntil: "networkidle", timeout: 30_000 });
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  await page.addStyleTag({ content: `*,*::before,*::after{animation-duration:.001ms!important;animation-delay:0ms!important;transition-duration:.001ms!important;transition-delay:0ms!important;scroll-behavior:auto!important}` });
  await page.waitForTimeout(120);

  const entry = { key, pathname, httpStatus: response?.status() || null };
  if (!response?.ok()) block(key, `HTTP ${response?.status() ?? "no response"}`);

  await auditFooter(page, key, entry);
  await auditButtons(page, key, entry);

  if (key === "home") {
    entry.hero = await page.locator(".home-campaign-v14__media img").evaluate((img) => {
      const style = getComputedStyle(img);
      return {
        objectFit: style.objectFit,
        objectPosition: style.objectPosition,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        renderedWidth: Math.round(img.getBoundingClientRect().width),
        renderedHeight: Math.round(img.getBoundingClientRect().height),
      };
    });
    if (entry.hero.objectFit !== "cover") block(key, `Home campaign media object-fit changed: ${entry.hero.objectFit}`);
    if (!/(^|\s)0%$|top$/i.test(entry.hero.objectPosition)) {
      block(key, `Home campaign focal Y is not top-safe: ${entry.hero.objectPosition}`, entry.hero);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(30);
    await page.screenshot({ path: path.join(outputDir, "home-hero-1363.png"), fullPage: false });
    await page.locator(".site-footer").screenshot({ path: path.join(outputDir, "home-footer-1363.png") });

    const secondary = page.locator(".house-bridge .btn-secondary").first();
    if (await secondary.count()) {
      await secondary.scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(outputDir, "home-secondary-default.png"), fullPage: false });
      await secondary.hover({ force: true });
      await page.waitForTimeout(30);
      await page.screenshot({ path: path.join(outputDir, "home-secondary-hover.png"), fullPage: false });
    }

    const footerButton = page.locator(".site-footer .btn-outline").first();
    if (await footerButton.count()) {
      await footerButton.scrollIntoViewIfNeeded();
      await footerButton.hover({ force: true });
      await page.waitForTimeout(30);
      await page.locator(".site-footer").screenshot({ path: path.join(outputDir, "home-footer-hover.png") });
    }
  }

  report.routes.push(entry);
  await context.close();
}

await browser.close();
await writeFile(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));
console.log(`V14 visual sanity regression: ${report.routes.length} routes.`);
console.log(`Blockers: ${report.blockers.length}`);
for (const blocker of report.blockers) console.log(JSON.stringify(blocker));
if (report.blockers.length) process.exit(1);
