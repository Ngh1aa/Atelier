import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  colorScheme: "light",
  reducedMotion: "reduce",
});
const page = await context.newPage();

await page.goto(new URL("/index.html", baseURL).toString(), { waitUntil: "networkidle", timeout: 30_000 });
await page.locator(".hamburger-btn").click();
await page.waitForTimeout(120);

const openState = await page.evaluate(() => {
  const menu = document.querySelector("#atelier-mobile-menu");
  const rect = menu?.getBoundingClientRect();
  const links = [...(menu?.querySelectorAll("a[href]") || [])];
  const visibleLinks = links.filter((link) => {
    const box = link.getBoundingClientRect();
    const style = getComputedStyle(link);
    return style.display !== "none" && style.visibility !== "hidden" && box.width > 0 && box.height > 0;
  });
  return {
    menuOpenClass: document.querySelector("body > nav")?.classList.contains("menu-open") || false,
    bodyLocked: document.body.classList.contains("atelier-menu-open"),
    menuTop: rect ? Math.round(rect.top) : null,
    menuBottom: rect ? Math.round(rect.bottom) : null,
    menuWidth: rect ? Math.round(rect.width) : null,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    linkCount: links.length,
    visibleLinkCount: visibleLinks.length,
    labels: visibleLinks.map((link) => link.textContent.trim()),
  };
});

await page.screenshot({ path: path.join(outputDir, "mobile-menu-open-regression.png"), fullPage: false });
await page.keyboard.press("Escape");
await page.waitForTimeout(80);

const closedState = await page.evaluate(() => ({
  menuOpenClass: document.querySelector("body > nav")?.classList.contains("menu-open") || false,
  expanded: document.querySelector(".hamburger-btn")?.getAttribute("aria-expanded"),
  bodyLocked: document.body.classList.contains("atelier-menu-open"),
}));

const passed =
  openState.menuOpenClass &&
  openState.bodyLocked &&
  openState.linkCount >= 5 &&
  openState.visibleLinkCount === openState.linkCount &&
  openState.menuWidth >= openState.viewportWidth - 2 &&
  openState.menuBottom >= openState.viewportHeight - 2 &&
  !closedState.menuOpenClass &&
  closedState.expanded === "false" &&
  !closedState.bodyLocked;

const result = { openState, closedState, passed };
await writeFile(path.join(outputDir, "mobile-menu-report.json"), JSON.stringify(result, null, 2));

await context.close();
await browser.close();

console.log(JSON.stringify(result));
if (!passed) process.exitCode = 1;
