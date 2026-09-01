import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.QA_BASE_URL || 'http://127.0.0.1:4173';
const outDir = process.env.QA_OUT_DIR || 'qa-artifacts';
await mkdir(outDir, { recursive: true });

const routes = ['shop.html', 'about.html', 'client-services.html'];
const widths = [390, 1440];
const browser = await chromium.launch({ headless: true });
const results = [];

for (const route of routes) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 });
    const response = await page.goto(`${baseURL}/${route}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);

    const metrics = await page.evaluate(() => {
      const parseRgb = (value) => {
        const match = value?.match(/rgba?\((\d+)[, ]+\s*(\d+)[, ]+\s*(\d+)(?:[, /]+\s*([\d.]+))?\)/i);
        if (!match) return null;
        return { r: +match[1], g: +match[2], b: +match[3], a: match[4] == null ? 1 : +match[4] };
      };
      const isBlue = (value) => {
        const c = parseRgb(value);
        return Boolean(c && c.a > 0.05 && c.b >= 100 && c.b - c.r >= 35 && c.b - c.g >= 20);
      };
      const visible = (el) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      };
      const blueStyles = [];
      document.querySelectorAll('body *').forEach((el) => {
        if (!visible(el)) return;
        const s = getComputedStyle(el);
        const values = [s.color, s.backgroundColor, s.borderTopColor, s.borderRightColor, s.borderBottomColor, s.borderLeftColor];
        const hit = values.find(isBlue);
        if (hit && blueStyles.length < 30) {
          blueStyles.push({ tag: el.tagName, cls: String(el.className || '').slice(0, 100), value: hit });
        }
      });

      const surfaceSelectors = [
        'body', 'main', 'footer',
        '.v12-house-manifesto', '.v12-shop-visual', '.v12-service-media', '.v12-house-hero-media'
      ];
      const nonWhiteSurfaces = [];
      surfaceSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach((el) => {
          const bg = getComputedStyle(el).backgroundColor;
          const c = parseRgb(bg);
          if (c && c.a > 0.05 && !(c.r >= 248 && c.g >= 248 && c.b >= 248)) {
            nonWhiteSurfaces.push({ selector, background: bg });
          }
        });
      });

      return {
        palette: document.documentElement.dataset.atelierPalette || '',
        blueStyles,
        nonWhiteSurfaces,
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      };
    });

    const failures = [];
    if (!response?.ok()) failures.push(`HTTP ${response?.status() ?? 'no response'}`);
    if (metrics.palette !== 'full-white') failures.push(`palette owner missing: ${metrics.palette || 'none'}`);
    if (metrics.blueStyles.length) failures.push(`blue computed styles: ${JSON.stringify(metrics.blueStyles.slice(0, 6))}`);
    if (metrics.nonWhiteSurfaces.length) failures.push(`non-white primary surfaces: ${JSON.stringify(metrics.nonWhiteSurfaces)}`);
    if (metrics.overflow) failures.push('horizontal overflow');

    await page.screenshot({ path: path.join(outDir, `v12-white-${route.replace('.html','')}-${width}.png`), fullPage: false });
    results.push({ route, width, passed: failures.length === 0, failures, metrics });
    await page.close();
  }
}

await browser.close();
const passed = results.every((item) => item.passed);
await writeFile(path.join(outDir, 'v12-monochrome-report.json'), JSON.stringify({ passed, results }, null, 2));
if (!passed) {
  console.error(JSON.stringify(results.filter((item) => !item.passed), null, 2));
  process.exit(1);
}
console.log(`V12 full-white palette gate passed: ${results.length}/${results.length}.`);
