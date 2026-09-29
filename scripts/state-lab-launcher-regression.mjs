import { chromium } from "playwright";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const browser = await chromium.launch({ headless: true });

async function launcherState(path, width = 1440) {
  const context = await browser.newContext({
    viewport: { width, height: width <= 430 ? 844 : 1000 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  const response = await page.goto(new URL(path, baseURL).toString(), {
    waitUntil: "networkidle",
    timeout: 30_000,
  });
  await page.waitForTimeout(120);
  const launcher = page.locator("[data-atelier-state-lab-launcher]");
  const count = await launcher.count();
  const visible = count > 0 ? await launcher.first().isVisible() : false;
  const href = count > 0 ? await launcher.first().getAttribute("href") : null;
  await context.close();
  return { path, width, status: response?.status() || null, count, visible, href, consoleErrors, pageErrors };
}

const customerRoutes = [
  "/index.html",
  "/shop.html",
  "/detailproduct.html?id=tailored-wool-blazer",
  "/cart.html",
  "/checkout.html",
];

const results = [];
for (const path of customerRoutes) {
  results.push(await launcherState(path, 1440));
}
results.push(await launcherState("/index.html", 390));

for (const result of results) {
  if (result.status !== 200) throw new Error(`Unexpected HTTP ${result.status} for ${result.path}`);
  if (result.consoleErrors.length || result.pageErrors.length) {
    throw new Error(`Runtime errors on ${result.path}: ${JSON.stringify({ consoleErrors: result.consoleErrors, pageErrors: result.pageErrors })}`);
  }
  if (result.count !== 0) {
    throw new Error(`Recruiter State Lab launcher leaked into customer route ${result.path} @ ${result.width}px`);
  }
}

const explicitDesktop = await launcherState("/index.html?lab=1", 1440);
const explicitMobile = await launcherState("/index.html?lab=1", 390);
for (const result of [explicitDesktop, explicitMobile]) {
  if (result.status !== 200 || result.count !== 1 || !result.visible) {
    throw new Error(`Explicit lab mode failed @ ${result.width}px: ${JSON.stringify(result)}`);
  }
  if (!String(result.href || "").includes("recruiter-state-lab.html?state=normal")) {
    throw new Error(`Explicit lab mode points to the wrong evidence route: ${JSON.stringify(result)}`);
  }
}

await browser.close();
console.log(`State Lab launcher isolation passed across ${results.length} customer route/view checks plus desktop/mobile opt-in mode.`);
