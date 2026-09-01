import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts");
await mkdir(outDir, { recursive: true });

const cases = [
  { key: "home", url: "/index.html", widths: [390, 1440] },
  { key: "shop", url: "/shop.html", widths: [390, 1440] },
  { key: "pdp", url: "/detailproduct.html?id=tailored-wool-blazer", widths: [390, 1440] },
  { key: "collections", url: "/collections.html", widths: [390, 1440] },
  { key: "house", url: "/about.html", widths: [390, 1440] },
];

async function primeLazyMedia(page) {
  await page.evaluate(async () => {
    const step = Math.max(320, Math.floor(window.innerHeight * 0.72));
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 35));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((resolve) => setTimeout(resolve, 100));
    window.scrollTo(0, 0);
    await new Promise((resolve) => setTimeout(resolve, 120));
  });
}

const browser = await chromium.launch({ headless: true });
const results = [];

for (const testCase of cases) {
  for (const width of testCase.widths) {
    const context = await browser.newContext({
      viewport: { width, height: width <= 430 ? 844 : 1000 },
      reducedMotion: "reduce",
      colorScheme: "light",
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
    page.on("pageerror", (e) => pageErrors.push(String(e)));

    const response = await page.goto(new URL(testCase.url, baseURL).toString(), { waitUntil: "networkidle", timeout: 30000 });
    await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
    await page.waitForFunction(() => document.documentElement.dataset.atelierDesign === "v9-media-safe", null, { timeout: 5000 });
    await page.waitForTimeout(180);

    await page.screenshot({ path: path.join(outDir, `v9-${testCase.key}-${width}-top.png`), fullPage: false });
    await primeLazyMedia(page);
    await page.screenshot({ path: path.join(outDir, `v9-${testCase.key}-${width}-full.png`), fullPage: true });

    const metrics = await page.evaluate(({ key }) => {
      const visible = (el) => {
        if (!el) return false;
        const s = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return s.display !== "none" && s.visibility !== "hidden" && Number(s.opacity) > 0 && r.width > 0 && r.height > 0;
      };
      const box = (el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.x,
          y: r.y,
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height,
          right: r.right,
          bottom: r.bottom,
        };
      };

      const selectors =
        key === "home" ? ".campaign-frame img, .v7-product-image img, .v7-collection-image img, .v7-collection-detail img, .v7-editorial-break img" :
        key === "shop" ? ".product-grid-item__image img" :
        key === "pdp" ? ".main-img-wrap > img, .pdp-thumbnail img, .related-grid img" :
        key === "collections" ? ".collection-feature-image img" :
        ".house-image-frame img";

      const imageChecks = [...document.querySelectorAll(selectors)].filter(visible).map((img) => {
        const s = getComputedStyle(img);
        const r = img.getBoundingClientRect();
        const ratio = r.height ? r.width / r.height : 0;
        return {
          src: img.currentSrc || img.src,
          objectFit: s.objectFit,
          objectPosition: s.objectPosition,
          width: Math.round(r.width),
          height: Math.round(r.height),
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          renderedRatio: Number(ratio.toFixed(3)),
          // A genuine sliver is an extreme aspect ratio, not a deliberately small 4:5 thumbnail.
          sliceRisk: ratio > 0 && (ratio < 0.28 || ratio > 3.5),
        };
      });

      const productCards = [...document.querySelectorAll(".v7-product-card, .product-item-wrap")].filter(visible).map((card) => {
        const cardBox = box(card);
        const media = card.querySelector(".v7-product-image, .product-grid-item__image");
        const content = card.querySelector(".product-info, .product-grid-item__content");
        const mediaBox = box(media);
        const contentBox = box(content);
        const withinX = (parent, child) => Boolean(parent && child && child.left >= parent.left - 2 && child.right <= parent.right + 2);
        const withinY = (parent, child) => Boolean(parent && child && child.top >= parent.top - 2 && child.bottom <= parent.bottom + 2);
        return {
          card: cardBox,
          media: mediaBox,
          content: contentBox,
          contentOwned: withinX(cardBox, contentBox) && withinY(cardBox, contentBox),
          mediaOwned: withinX(cardBox, mediaBox) && withinY(cardBox, mediaBox),
        };
      });

      const notation = document.querySelector(".campaign-notation");
      const heroTitle = document.querySelector(".campaign-copy h1");
      const heroBox = box(document.querySelector(".campaign-sheet"));
      const titleBox = box(heroTitle);
      const heroTitleWithin = !heroBox || !titleBox || (
        titleBox.left >= heroBox.left - 2 &&
        titleBox.right <= heroBox.right + 2 &&
        titleBox.top >= heroBox.top - 2 &&
        titleBox.bottom <= heroBox.bottom + 2
      );

      const blankRevealFrames = [...document.querySelectorAll(".reveal")]
        .filter((el) => {
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          return r.width > 100 && r.height > 100 && (s.visibility === "hidden" || Number(s.opacity) < 0.95);
        })
        .map((el) => el.className)
        .slice(0, 12);

      return {
        designOwner: document.documentElement.dataset.atelierDesign,
        horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
        hiddenCampaignNotation: !notation || getComputedStyle(notation).display === "none",
        heroTitleWithin,
        imageChecks,
        productCards,
        blankRevealFrames,
      };
    }, { key: testCase.key });

    const problems = [];
    if (response?.status() !== 200) problems.push(`http:${response?.status()}`);
    if (consoleErrors.length) problems.push("console-errors");
    if (pageErrors.length) problems.push("page-errors");
    if (metrics.designOwner !== "v9-media-safe") problems.push("wrong-design-owner");
    if (metrics.horizontalOverflow) problems.push("horizontal-overflow");
    if (testCase.key === "home" && !metrics.hiddenCampaignNotation) problems.push("oversized-campaign-notation-visible");
    if (testCase.key === "home" && !metrics.heroTitleWithin) problems.push("hero-title-outside-bounds");
    if (metrics.imageChecks.some((img) => img.naturalWidth === 0 || img.naturalHeight === 0)) problems.push("broken-image");
    if (metrics.imageChecks.some((img) => !["contain", "cover"].includes(img.objectFit))) problems.push("unowned-image-fit");
    if (metrics.imageChecks.some((img) => img.sliceRisk)) problems.push("media-slice-risk");
    if (["home", "shop"].includes(testCase.key) && metrics.productCards.some((card) => !card.mediaOwned || !card.contentOwned)) problems.push("product-card-ownership");
    if (metrics.blankRevealFrames.length) problems.push("blank-reveal-frame");

    results.push({ route: testCase.key, width, consoleErrors, pageErrors, problems, ...metrics });
    await context.close();
  }
}

await browser.close();
await writeFile(path.join(outDir, "v9-media-layout-report.json"), JSON.stringify(results, null, 2));

const failed = results.filter((r) => r.problems.length);
console.log(`V9 media/layout checks: ${results.length}; failed: ${failed.length}`);
for (const item of failed) console.log(JSON.stringify({ route: item.route, width: item.width, problems: item.problems }));
if (failed.length) process.exitCode = 1;
