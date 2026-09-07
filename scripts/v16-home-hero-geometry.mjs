import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const outputDir = path.resolve(process.env.QA_OUT_DIR || "qa-artifacts/v16-home-hero-geometry");
await mkdir(outputDir, { recursive: true });

const viewports = [
  { name: "wide", width: 1900, height: 820 },
  { name: "desktop", width: 1363, height: 936 },
  { name: "pressure", width: 1100, height: 900 },
];

const browser = await chromium.launch({ headless: true });
const report = {
  generatedAt: new Date().toISOString(),
  scope: "desktop_only",
  contract: {
    mediaFit: "contain",
    captionMustStayInsideMediaRail: true,
    captionMustNotIntersectDecisionPanel: true,
    decisionPanelMustNotIntersectMediaRail: true,
    mediaRailUsesSourceAwareNegativeSpace: true,
  },
  states: [],
  blockers: [],
};

const rect = (r) => ({
  left: Math.round(r.left),
  top: Math.round(r.top),
  right: Math.round(r.right),
  bottom: Math.round(r.bottom),
  width: Math.round(r.width),
  height: Math.round(r.height),
});

const intersects = (a, b, tolerance = 1) => (
  a.left < b.right - tolerance &&
  a.right > b.left + tolerance &&
  a.top < b.bottom - tolerance &&
  a.bottom > b.top + tolerance
);

const inside = (child, parent, tolerance = 1) => (
  child.left >= parent.left - tolerance &&
  child.right <= parent.right + tolerance &&
  child.top >= parent.top - tolerance &&
  child.bottom <= parent.bottom + tolerance
);

for (const viewport of viewports) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
    colorScheme: "light",
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const response = await page.goto(new URL("/index.html", baseURL).toString(), {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  await page.evaluate(async () => { if (document.fonts?.ready) await document.fonts.ready; });
  await page.addStyleTag({ content: `*,*::before,*::after{animation-duration:.001ms!important;transition-duration:.001ms!important;scroll-behavior:auto!important}` });
  await page.waitForTimeout(80);

  const state = await page.evaluate(() => {
    const hero = document.querySelector(".home-campaign-v14");
    const media = document.querySelector(".home-campaign-v14__media");
    const image = media?.querySelector("img");
    const panel = document.querySelector(".home-campaign-v14__panel");
    const caption = document.querySelector(".home-campaign-v14__caption");
    const captionSpans = [...document.querySelectorAll(".home-campaign-v14__caption span")];
    const actions = document.querySelector(".home-campaign-v14__actions");
    const edition = document.querySelector(".home-campaign-v14__edition");
    const getRect = (el) => el ? el.getBoundingClientRect().toJSON() : null;
    const spanState = captionSpans.map((el) => ({
      text: (el.textContent || "").trim(),
      rect: getRect(el),
      color: getComputedStyle(el).color,
      backgroundColor: getComputedStyle(el).backgroundColor,
      visibility: getComputedStyle(el).visibility,
      opacity: Number.parseFloat(getComputedStyle(el).opacity || "1"),
    }));
    return {
      http: document.readyState,
      hero: getRect(hero),
      media: getRect(media),
      image: image ? {
        rect: getRect(image),
        objectFit: getComputedStyle(image).objectFit,
        objectPosition: getComputedStyle(image).objectPosition,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      } : null,
      panel: getRect(panel),
      caption: getRect(caption),
      captions: spanState,
      actions: getRect(actions),
      edition: getRect(edition),
    };
  });

  const key = `home@${viewport.name}`;
  const blockers = [];
  const block = (message, detail = null) => {
    const item = { key, message, detail };
    blockers.push(item);
    report.blockers.push(item);
  };

  if (!response?.ok()) block(`HTTP ${response?.status() ?? "no response"}`);
  if (!state.hero || !state.media || !state.panel || !state.image || state.captions.length < 2) {
    block("required Home campaign geometry nodes are missing", state);
  } else {
    const hero = rect(state.hero);
    const media = rect(state.media);
    const panel = rect(state.panel);
    const image = rect(state.image.rect);
    const actions = state.actions ? rect(state.actions) : null;

    if (state.image.objectFit !== "contain") {
      block(`Home hero media fit must remain contain, got ${state.image.objectFit}`, state.image);
    }
    if (!state.image.naturalWidth || !state.image.naturalHeight) {
      block("Home hero source image did not load", state.image);
    }
    if (!inside(media, hero)) {
      block("Home media rail escapes hero bounds", { hero, media });
    }
    if (!inside(panel, hero)) {
      block("Home decision panel escapes hero bounds", { hero, panel });
    }
    if (intersects(media, panel)) {
      block("Home decision panel overlaps the portrait media rail", { media, panel });
    }

    for (const caption of state.captions) {
      const captionRect = rect(caption.rect);
      if (!inside(captionRect, media)) {
        block(`hero caption escapes media rail: ${caption.text}`, { caption: captionRect, media });
      }
      if (intersects(captionRect, panel)) {
        block(`hero caption is obscured by decision panel: ${caption.text}`, { caption: captionRect, panel });
      }
      if (actions && intersects(captionRect, actions)) {
        block(`hero caption collides with decision actions: ${caption.text}`, { caption: captionRect, actions });
      }
      if (caption.visibility === "hidden" || caption.opacity <= 0.05) {
        block(`hero caption is not visibly rendered: ${caption.text}`, caption);
      }
      if (/rgba?\([^)]*,\s*0(?:\.0+)?\)/.test(caption.backgroundColor)) {
        block(`hero caption lost its stable contrast backplate: ${caption.text}`, caption);
      }
    }

    const mediaRatio = media.width / viewport.width;
    if (mediaRatio < 0.35 || mediaRatio > 0.48) {
      block("Home media rail width drifted outside the intentional desktop range", { mediaRatio, media, viewport });
    }

    if (image.width !== media.width || image.height !== media.height) {
      block("Home image box no longer fills the declared media rail", { image, media });
    }
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: path.join(outputDir, `${key.replace("@", "-")}.png`),
    fullPage: false,
  });
  const heroNode = page.locator(".home-campaign-v14");
  if (await heroNode.count()) {
    await heroNode.screenshot({ path: path.join(outputDir, `${key.replace("@", "-")}-hero.png`) });
  }

  report.states.push({ key, viewport, state, blockers });
  await context.close();
}

await browser.close();
await writeFile(path.join(outputDir, "report.json"), JSON.stringify(report, null, 2));

console.log(`V16 Home hero geometry: ${report.states.length} desktop states.`);
console.log(`Blockers: ${report.blockers.length}`);
for (const blocker of report.blockers) console.log(JSON.stringify(blocker));
if (report.blockers.length) process.exit(1);
