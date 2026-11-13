// Control inventory: lists every interactive control on the site pages, activates
// each one and records whether something meaningful happened.
//
//   QA_BASE_URL=http://127.0.0.1:8924 node scripts/control-inventory.mjs [out.json]
//
// Links are resolved (target page or in-page anchor must exist, never "#").
// Buttons, summaries, role=button and selects are activated one by one on a
// freshly loaded page; the script records navigation, DOM/attribute mutation,
// focus movement, downloads and popups. Playwright is resolved through NODE_PATH.
import { createRequire } from "node:module";
import { writeFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const baseURL = (process.env.QA_BASE_URL || "http://127.0.0.1:8924").replace(/\/$/, "");
const outFile = process.argv[2] || "";

export const SITE_PAGES = [
  "index.html", "shop.html", "collections.html", "detailproduct.html?id=tailored-wool-blazer", "cart.html",
  "checkout.html", "order.html", "order-success.html", "favourite.html", "account.html", "login.html",
  "forgot-password.html", "client-services.html", "contact.html", "care-guide.html", "size-guide.html",
  "shipping&returns.html", "privacy.html", "terms.html", "about.html",
];

const CONTROL_SELECTOR = [
  "a[href]", "a:not([href])[onclick]", "button", "summary", "[role=button]", "select",
  "input[type=checkbox]", "input[type=radio]", "input[type=submit]",
].join(",");

async function seedState(page) {
  // A Bag line and a Saved piece make the stateful pages render their controls.
  // Seeded through the real UI so the script works on any build of the site.
  await page.goto(`${baseURL}/detailproduct.html?id=merino-knit-dress`, { waitUntil: "networkidle" });
  await page.waitForSelector("body[data-pdp-ready=true]", { timeout: 8000 }).catch(() => {});
  await page.locator('.js-size-options button[data-size="M"]').click().catch(() => {});
  await page.locator(".js-btn-add-cart").click().catch(() => {});
  await page.waitForSelector(".mini-bag-item", { timeout: 5000 }).catch(() => {});
  await page.keyboard.press("Escape").catch(() => {});
  const saved = await page.locator(".js-btn-wishlist").getAttribute("aria-pressed").catch(() => "true");
  if (saved !== "true") await page.locator(".js-btn-wishlist").click().catch(() => {});
}

async function describeControls(page) {
  return page.evaluate((selector) => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && box.width > 0 && box.height > 0;
    };
    return [...document.querySelectorAll(selector)]
      .filter((element) => !element.closest("#ui-feedback-host"))
      .map((element, index) => {
        element.dataset.inventoryIndex = String(index);
        return {
          index,
          tag: element.tagName.toLowerCase(),
          type: element.getAttribute("type") || "",
          href: element.getAttribute("href"),
          label: (element.getAttribute("aria-label") || element.textContent || element.value || "").replace(/\s+/g, " ").trim().slice(0, 70),
          visible: visible(element),
          isSubmit: Boolean(element.form) && (element.type === "submit" || (element.tagName === "BUTTON" && !element.getAttribute("type"))),
          disabled: element.disabled === true || element.getAttribute("aria-disabled") === "true",
        };
      });
  }, CONTROL_SELECTOR);
}

async function resolveLink(context, pagePath, control, knownIds) {
  const href = control.href;
  if (href === "#" || href === "" || /^javascript:/i.test(href)) return { ok: false, effect: "dead link (#/empty/javascript:)" };
  if (/^(mailto|tel):/i.test(href)) return { ok: true, effect: "external protocol" };
  if (href.startsWith("#")) return knownIds.includes(href.slice(1)) ? { ok: true, effect: "in-page anchor" } : { ok: false, effect: `missing anchor ${href}` };
  const url = new URL(href, `${baseURL}/${pagePath}`);
  if (url.origin !== new URL(baseURL).origin) return { ok: true, effect: "external link" };
  const response = await context.request.get(url.href).catch(() => null);
  if (!response || response.status() >= 400) return { ok: false, effect: `broken link (${response?.status() ?? "no response"})` };
  return { ok: true, effect: `navigates to ${url.pathname.split("/").pop()}${url.search}` };
}

async function activate(page, control) {
  const handle = page.locator(`[data-inventory-index="${control.index}"]`);
  const before = page.url();
  const sameControl = (await handle.count()) > 0 && await handle.evaluate((element, tag) => element.tagName.toLowerCase() === tag, control.tag).catch(() => false);
  if (!sameControl) return { ok: true, effect: "not present in this state (re-rendered)" };
  if (control.tag === "input" && control.type === "radio" && await handle.isChecked().catch(() => false)) {
    return { ok: true, effect: "already selected (default choice)" };
  }
  // Learn which nodes change on their own (marquees, reveal motion) and ignore them.
  await page.evaluate(() => {
    window.__inventoryNoise = new WeakSet();
    const noise = new MutationObserver((records) => records.forEach((record) => window.__inventoryNoise.add(record.target)));
    noise.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
    window.__inventoryNoiseObserver = noise;
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.__inventoryNoiseObserver.disconnect();
    window.__inventory = { mutations: 0 };
    const observer = new MutationObserver((records) => {
      window.__inventory.mutations += records.filter((record) => !window.__inventoryNoise.has(record.target)).length;
    });
    observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true });
    window.__inventoryObserver = observer;
    window.__inventoryFocus = document.activeElement;
  });
  let download = false;
  let popup = false;
  let dialog = "";
  const onDialog = (event) => { dialog = event.message(); event.dismiss().catch(() => {}); };
  page.on("dialog", onDialog);
  let reloaded = false;
  page.once("load", () => { reloaded = true; });
  page.once("download", () => { download = true; });
  page.context().once("page", () => { popup = true; });
  try {
    if (control.tag === "select") {
      const values = await handle.evaluate((select) => [...select.options].filter((option) => !option.disabled).map((option) => option.value));
      const current = await handle.inputValue();
      const next = values.find((value) => value !== current);
      if (next === undefined) return { ok: false, effect: "select has a single option" };
      await handle.selectOption(next, { timeout: 1500 });
    } else {
      // Click asynchronously so controls that reload the page (Reset demo data) do not hang evaluate.
      await handle.evaluate((element) => { setTimeout(() => element.click(), 0); });
    }
  } catch (error) {
    return { ok: false, effect: `could not activate: ${error.message.split("\n")[0]}` };
  }
  await page.waitForTimeout(900);
  page.off("dialog", onDialog);
  const after = page.url();
  const stats = await page.evaluate(() => {
    window.__inventoryObserver?.disconnect();
    return { mutations: window.__inventory?.mutations || 0, focusMoved: document.activeElement !== window.__inventoryFocus };
  }).catch(() => ({ mutations: 0, focusMoved: false, navigated: true }));
  if (dialog) return { ok: false, effect: `placeholder browser alert: "${dialog.slice(0, 60)}"` };
  if (after !== before) {
    const from = new URL(before);
    const to = new URL(after);
    if (control.isSubmit && from.pathname === to.pathname) return { ok: false, effect: "native form reload (no handler)" };
    return { ok: true, effect: `navigates to ${to.pathname.split("/").pop()}${to.search}`, navigated: true };
  }
  if (reloaded) return { ok: true, effect: "reloads the page with updated state" };
  if (download) return { ok: true, effect: "downloads a file" };
  if (popup) return { ok: true, effect: "opens a new tab" };
  if (stats.mutations > 0) return { ok: true, effect: `updates the page (${stats.mutations} DOM changes)` };
  if (stats.focusMoved) return { ok: true, effect: "moves focus" };
  return { ok: false, effect: "no visible effect" };
}

async function inventoryPage(browser, pagePath) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  const consoleErrors = [];
  let page;
  const openPage = async () => {
    page = await context.newPage();
    page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
    page.on("pageerror", (error) => consoleErrors.push(error.message));
  };
  await openPage();
  const load = async () => {
    if (page.isClosed()) await openPage();
    await page.goto(`${baseURL}/${pagePath}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(250);
  };
  await load();
  await seedState(page);
  await load();
  const controls = await describeControls(page);
  const knownIds = await page.evaluate(() => [...document.querySelectorAll("[id]")].map((element) => element.id));
  const rows = [];
  for (const control of controls) {
    let outcome;
    if (control.tag === "a" && control.href !== null) outcome = await resolveLink(context, pagePath, control, knownIds);
    else if (control.disabled) outcome = { ok: true, effect: "disabled by state" };
    else if (!control.visible) outcome = { ok: true, effect: "hidden until its state is reached" };
    else {
      await load();
      await describeControls(page);
      outcome = await activate(page, control);
      if (/Reset demo data/.test(control.label)) { await load().catch(() => {}); await seedState(page).catch(() => {}); }
    }
    rows.push({ page: pagePath, ...control, ...outcome });
  }
  await context.close();
  return { rows, consoleErrors };
}

// A fresh browser per page keeps one crashed renderer from ending the whole inventory.
const report = { baseURL, generatedAt: new Date().toISOString(), pages: {} };
let total = 0;
let dead = 0;
for (const pagePath of SITE_PAGES) {
  const browser = await chromium.launch();
  const { rows, consoleErrors } = await inventoryPage(browser, pagePath);
  await browser.close().catch(() => {});
  report.pages[pagePath] = { controls: rows, consoleErrors };
  total += rows.length;
  const failures = rows.filter((row) => !row.ok);
  dead += failures.length;
  console.log(`${pagePath.padEnd(46)} ${String(rows.length).padStart(4)} controls  ${String(failures.length).padStart(3)} dead  ${consoleErrors.length} console errors`);
  [...new Set(consoleErrors)].forEach((message) => console.log(`   CONSOLE  ${message.slice(0, 160)}`));
  failures.forEach((row) => console.log(`   DEAD  <${row.tag}${row.type ? ` type=${row.type}` : ""}> "${row.label}"${row.href !== null && row.href !== undefined ? ` href="${row.href}"` : ""} — ${row.effect}`));
}

report.summary = { pages: SITE_PAGES.length, controls: total, dead };
console.log(`\nTOTAL ${total} controls on ${SITE_PAGES.length} pages, ${dead} dead.`);
if (outFile) await writeFile(outFile, JSON.stringify(report, null, 2));
process.exitCode = dead ? 1 : 0;
