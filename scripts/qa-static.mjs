import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const files = (await readdir(root, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
  .map((entry) => entry.name)
  .sort();
let errors = 0;
const hasMeta = (html, name) => new RegExp(`<meta\\b(?=[^>]*\\bname=["']${name}["'])[^>]*>`, "i").test(html);
for (const file of files) {
  const html = await readFile(join(root, file), "utf8");
  const hasRedirect = /http-equiv=["']refresh|window\.location\.replace/i.test(html);
  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(html)) { console.error(`${file}: missing html lang`); errors++; }
  if (!/<title\b[^>]*>[^<]+<\/title>/i.test(html)) { console.error(`${file}: missing title`); errors++; }
  if (!hasMeta(html, "description") && !hasRedirect) { console.error(`${file}: missing meta description`); errors++; }
  if (!hasMeta(html, "viewport")) { console.error(`${file}: missing viewport`); errors++; }
  if (!hasRedirect && !/<main\b/i.test(html)) { console.error(`${file}: missing main landmark`); errors++; }
  for (const match of html.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt\s*=/i.test(match[1])) { console.error(`${file}: image without alt`); errors++; }
  }
  for (const match of html.matchAll(/<button\b([^>]*)>/gi)) {
    if (!/\btype\s*=/i.test(match[1])) { console.error(`${file}: button without type`); errors++; }
  }
}
if (errors) process.exit(1);
console.log(`QA passed: ${files.length} HTML pages checked.`);
