import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts");
await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];
let failed = false;

for (const width of [390, 1440]) {
  const context = await browser.newContext({
    viewport: { width, height: width < 500 ? 844 : 1000 },
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const response = await page.goto(new URL("/shop.html", baseURL).toString(), { waitUntil: "networkidle", timeout: 30_000 });
  await page.evaluate(async () => {
    const step = Math.max(360, Math.floor(innerHeight * .8));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 120));
  });

  const cards = await page.evaluate(() => [...document.querySelectorAll(".js-shop-grid .product-item-wrap")].slice(0, 4).map((card) => {
    const frame = card.querySelector(".product-grid-item__image");
    const image = frame?.querySelector("img.js-grid-img-front");
    if (!frame || !image) return null;
    const frameRect = frame.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    const style = getComputedStyle(image);
    const matrix = new DOMMatrixReadOnly(style.transform === "none" ? undefined : style.transform);
    return {
      id: card.dataset.id || "",
      src: image.getAttribute("src") || "",
      frameRatio: frameRect.height ? frameRect.width / frameRect.height : null,
      imageWidthRatio: frameRect.width ? imageRect.width / frameRect.width : null,
      imageHeightRatio: frameRect.height ? imageRect.height / frameRect.height : null,
      objectFit: style.objectFit,
      objectPosition: style.objectPosition,
      scaleX: matrix.a,
      scaleY: matrix.d,
      backgroundColor: style.backgroundColor,
    };
  }).filter(Boolean));

  const failures = [];
  if (!response?.ok()) failures.push(`HTTP ${response?.status() ?? "no response"}`);
  if (cards.length < 4) failures.push(`expected 4 cards, found ${cards.length}`);

  for (const card of cards) {
    if (card.objectFit !== "contain") failures.push(`${card.id}: object-fit ${card.objectFit}`);
    if (card.frameRatio == null || Math.abs(card.frameRatio - .75) > .03) failures.push(`${card.id}: frame ratio ${card.frameRatio}`);
    if (Math.abs(card.scaleX - 1) > .02 || Math.abs(card.scaleY - 1) > .02) failures.push(`${card.id}: image element scaled to ${card.scaleX.toFixed(3)}×${card.scaleY.toFixed(3)}`);
    if (card.imageWidthRatio == null || card.imageWidthRatio < .98) failures.push(`${card.id}: image element width only ${(card.imageWidthRatio * 100).toFixed(1)}% of frame`);
    if (card.imageHeightRatio == null || card.imageHeightRatio < .98) failures.push(`${card.id}: image element height only ${(card.imageHeightRatio * 100).toFixed(1)}% of frame`);
  }

  const tailored = cards.find((card) => card.id === "tailored-wool-blazer");
  if (!tailored) failures.push("tailored-wool-blazer card missing");

  const grid = page.locator(".js-shop-grid");
  await grid.screenshot({ path: path.join(outputDir, `catalogue-crop-${width}.png`) });
  results.push({ width, passed: failures.length === 0, failures, cards });
  if (failures.length) failed = true;
  await context.close();
}

await browser.close();
await writeFile(path.join(outputDir, "catalogue-crop-report.json"), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
if (failed) process.exit(1);
