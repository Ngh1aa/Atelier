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

await page.goto(new URL("/detailproduct.html?id=tailored-wool-blazer", baseURL).toString(), {
  waitUntil: "networkidle",
  timeout: 30_000,
});
await page.evaluate(async () => {
  if (document.fonts?.ready) await document.fonts.ready;
});
await page.waitForTimeout(120);

const stickyVisible = () => page.locator(".mobile-purchase-bar.is-visible").count();
const primary = page.locator(".js-btn-add-cart");

const topVisible = await stickyVisible();
await page.screenshot({ path: path.join(outputDir, "pdp-sticky-top.png"), fullPage: false });

const pageBottom = await primary.evaluate((el) => {
  const rect = el.getBoundingClientRect();
  return window.scrollY + rect.bottom;
});
await page.evaluate((y) => window.scrollTo(0, y + 120), pageBottom);
await page.waitForTimeout(150);
const afterPrimaryVisible = await stickyVisible();
await page.screenshot({ path: path.join(outputDir, "pdp-sticky-after-primary.png"), fullPage: false });

await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(150);
const returnTopVisible = await stickyVisible();
await page.screenshot({ path: path.join(outputDir, "pdp-sticky-return-top.png"), fullPage: false });

const result = {
  topVisible,
  afterPrimaryVisible,
  returnTopVisible,
  passed: topVisible === 0 && afterPrimaryVisible === 1 && returnTopVisible === 0,
};
await writeFile(path.join(outputDir, "pdp-sticky-report.json"), JSON.stringify(result, null, 2));

await context.close();
await browser.close();

console.log(JSON.stringify(result));
if (!result.passed) process.exitCode = 1;
