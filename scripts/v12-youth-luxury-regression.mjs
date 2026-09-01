import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts");
await mkdir(outputDir, { recursive: true });

const routes = [
  { path: "/shop.html", key: "shop" },
  { path: "/about.html", key: "house" },
  { path: "/client-services.html", key: "services" },
];

const browser = await chromium.launch({ headless: true });
const report = [];
let failed = false;

for (const route of routes) {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: width < 500 ? 844 : 1000 },
      colorScheme: "light",
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
    page.on("pageerror", (error) => consoleErrors.push(error.message));

    const response = await page.goto(new URL(route.path, baseURL).toString(), { waitUntil: "networkidle", timeout: 30_000 });
    await page.evaluate(async () => {
      const step = Math.max(360, Math.floor(innerHeight * .8));
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        scrollTo(0, y);
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      scrollTo(0, 0);
      await new Promise((resolve) => setTimeout(resolve, 120));
    });

    const metrics = await page.evaluate((key) => {
      const main = document.querySelector("main");
      const allText = main?.innerText.replace(/\s+/g, " ").trim() || "";
      const materialImages = [...document.querySelectorAll("main img")].map((img) => {
        const rect = img.getBoundingClientRect();
        const style = getComputedStyle(img);
        return {
          src: img.getAttribute("src") || "",
          width: rect.width,
          height: rect.height,
          ratio: rect.height ? rect.width / rect.height : 0,
          fit: style.objectFit,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete,
        };
      }).filter((img) => img.width >= 120 && img.height >= 120);

      return {
        styleOwner: document.documentElement.dataset.atelierStyle || "",
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        mainTextLength: allText.length,
        h1Count: document.querySelectorAll("main h1").length,
        materialImages,
        serviceLinks: document.querySelectorAll(".v12-service-link").length,
        serviceDetails: document.querySelectorAll(".v12-qa-list details").length,
        houseCodes: document.querySelectorAll(".v12-house-code").length,
        houseSections: document.querySelectorAll("main > section").length,
        shopHero: !!document.querySelector(".v12-shop-hero"),
        shopHeroImages: document.querySelectorAll(".v12-shop-visual img").length,
        shopCards: document.querySelectorAll(".js-shop-grid .product-item-wrap").length,
        shopCategoryLinks: document.querySelectorAll(".shop-category-shortcuts a").length,
        key,
      };
    }, route.key);

    const failures = [];
    if (!response?.ok()) failures.push(`HTTP ${response?.status() ?? "no response"}`);
    if (metrics.styleOwner !== "sharp-youth-luxury") failures.push(`wrong style owner: ${metrics.styleOwner}`);
    if (metrics.scrollWidth > metrics.clientWidth + 2) failures.push(`horizontal overflow ${metrics.scrollWidth}/${metrics.clientWidth}`);
    if (metrics.h1Count !== 1) failures.push(`expected one H1, found ${metrics.h1Count}`);
    if (consoleErrors.length) failures.push(`console/page errors: ${consoleErrors.join(" | ")}`);

    for (const image of metrics.materialImages) {
      if (!image.complete || image.naturalWidth < 1 || image.naturalHeight < 1) failures.push(`broken image: ${image.src}`);
      if (image.ratio > .86) failures.push(`non-portrait material frame ${image.ratio.toFixed(3)}: ${image.src}`);
      if (image.fit !== "contain") failures.push(`unsafe fit ${image.fit}: ${image.src}`);
    }

    if (route.key === "services") {
      if (metrics.serviceLinks !== 4) failures.push(`expected 4 service routes, found ${metrics.serviceLinks}`);
      if (metrics.serviceDetails !== 4) failures.push(`expected 4 quick answers, found ${metrics.serviceDetails}`);
      if (metrics.mainTextLength > 2200) failures.push(`service copy too dense: ${metrics.mainTextLength} chars`);
    }

    if (route.key === "house") {
      if (metrics.houseCodes !== 3) failures.push(`expected 3 house codes, found ${metrics.houseCodes}`);
      if (metrics.houseSections < 4) failures.push(`house too short: ${metrics.houseSections} sections`);
      if (metrics.materialImages.length < 4) failures.push(`house needs >=4 material images, found ${metrics.materialImages.length}`);
    }

    if (route.key === "shop") {
      if (!metrics.shopHero) failures.push("shop editorial hero missing");
      if (metrics.shopHeroImages !== 2) failures.push(`expected 2 shop hero images, found ${metrics.shopHeroImages}`);
      if (metrics.shopCards < 8) failures.push(`expected 8 product cards, found ${metrics.shopCards}`);
      if (metrics.shopCategoryLinks < 6) failures.push(`expected 6 category links, found ${metrics.shopCategoryLinks}`);
    }

    await page.screenshot({ path: path.join(outputDir, `v12-${route.key}-${width}.png`), fullPage: false });
    report.push({ route: route.path, width, passed: failures.length === 0, failures, metrics });
    if (failures.length) failed = true;
    await context.close();
  }
}

await browser.close();
await writeFile(path.join(outputDir, "v12-youth-luxury-report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.map(({ route, width, passed, failures }) => ({ route, width, passed, failures })), null, 2));
if (failed) process.exit(1);
