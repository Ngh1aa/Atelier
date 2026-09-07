import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts/v14");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const viewport = { width: 1363, height: 936 };

async function makePage(pathname) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: "light", reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(new URL(pathname, baseURL).toString(), { waitUntil: "networkidle", timeout: 30_000 });
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  await page.addStyleTag({ content: `*,*::before,*::after{animation-duration:.001ms!important;animation-delay:0ms!important;transition-duration:.001ms!important;transition-delay:0ms!important;scroll-behavior:auto!important}` });
  await page.waitForTimeout(180);
  return { context, page };
}

{
  const { context, page } = await makePage("/index.html");
  await page.screenshot({ path: path.join(outputDir, "preview-home-top.jpg"), type: "jpeg", quality: 24, fullPage: false });
  await page.locator(".wardrobe-moments").screenshot({ path: path.join(outputDir, "preview-home-runway.jpg"), type: "jpeg", quality: 24 });
  await page.locator(".current-edit").screenshot({ path: path.join(outputDir, "preview-home-current-edit.jpg"), type: "jpeg", quality: 24 });
  await context.close();
}

{
  const { context, page } = await makePage("/shop.html");
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(outputDir, "preview-shop-top.jpg"), type: "jpeg", quality: 24, fullPage: false });
  await page.locator(".shop-grid").screenshot({ path: path.join(outputDir, "preview-shop-grid.jpg"), type: "jpeg", quality: 24 });
  await context.close();
}

{
  const { context, page } = await makePage("/detailproduct.html?id=tailored-wool-blazer");
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(outputDir, "preview-pdp-top.jpg"), type: "jpeg", quality: 24, fullPage: false });
  await context.close();
}

await browser.close();
console.log("V14 lightweight previews captured.");
