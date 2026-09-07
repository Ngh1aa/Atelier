import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const files = (await readdir(root)).filter((name) => name.endsWith(".html")).sort();
const changed = [];
const failures = [];

for (const name of files) {
  const filePath = path.join(root, name);
  const before = await readFile(filePath, "utf8");
  let after = before;

  after = after.replace(
    /\.\/atelier-v(?:13|14)\.css\?v=atelier-v(?:13|14)/g,
    "./atelier-v14-site.css?v=atelier-v14-site"
  );

  after = after.replace(/(<body\s+class=")([^"]*)(")/i, (_, open, classNames, close) => {
    const next = classNames
      .split(/\s+/)
      .filter(Boolean)
      .filter((token) => token !== "v13" && token !== "v14")
      .concat("v14")
      .join(" ");
    return `${open}${next}${close}`;
  });

  after = after.replace(/main\.js\?v=atelier-v13/g, "main.js?v=atelier-v14-site");
  after = after.replace(/main\.js\?v=atelier-v14/g, "main.js?v=atelier-v14-site");

  if (!after.includes("atelier-v14-site.css?v=atelier-v14-site")) {
    failures.push(`${name}: V14 site stylesheet missing`);
  }
  if (!/<body\s+class="[^"]*\bv14\b[^"]*"/i.test(after)) {
    failures.push(`${name}: body v14 marker missing`);
  }
  if (/atelier-v13\.css|\bv13\b/.test(after)) {
    failures.push(`${name}: legacy V13 owner remains`);
  }

  if (after !== before) {
    await writeFile(filePath, after);
    changed.push(name);
  }
}

const mainPath = path.join(root, "main.js");
const mainBefore = await readFile(mainPath, "utf8");
let mainAfter = mainBefore
  .replace(
    "// App entry: commerce behavior is shared; V13 pages own their CSS explicitly in HTML.",
    "// App entry: commerce behavior is shared; V14 site CSS is the explicit visual owner across root routes."
  )
  .replace(/atelier-v13/g, "atelier-v14-site")
  .replace(/atelier-v14(?!-site)/g, "atelier-v14-site");

if (!mainAfter.includes('document.documentElement.dataset.atelierStyle = "high-fashion-youth-luxury-v14";')) {
  const insertion = '\ndocument.documentElement.dataset.atelierStyle = "high-fashion-youth-luxury-v14";\n';
  const importEnd = mainAfter.lastIndexOf(";", mainAfter.indexOf("\n\n"));
  if (importEnd >= 0) mainAfter = mainAfter.slice(0, importEnd + 1) + insertion + mainAfter.slice(importEnd + 1);
  else mainAfter = insertion + mainAfter;
}

if (mainAfter !== mainBefore) {
  await writeFile(mainPath, mainAfter);
  changed.push("main.js");
}

await mkdir(path.join(root, "docs", "uiux"), { recursive: true });
const report = [
  "# ATELIER V14 — Whole-site Rollout Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  `Root HTML routes checked: ${files.length}`,
  `Files changed: ${changed.length}`,
  "",
  "## Changed",
  "",
  ...changed.map((name) => `- \`${name}\``),
  "",
  "## Verification",
  "",
  failures.length ? ...[] : "",
].filter(Boolean);

if (failures.length) {
  report.push("Status: **BLOCKED**", "", ...failures.map((item) => `- ${item}`));
} else {
  report.push(
    "Status: **DONE_VERIFIED (source ownership gate)**",
    "",
    "- Every root HTML route references `atelier-v14-site.css?v=atelier-v14-site`.",
    "- Every root HTML body carries the `v14` marker.",
    "- No root HTML retains the V13 stylesheet owner or `v13` body marker.",
    "- Rendered visual QA remains a separate Phase 4 gate."
  );
}

await writeFile(path.join(root, "docs", "uiux", "Whole-Site-Rollout-V14.md"), report.join("\n") + "\n");

console.log(JSON.stringify({ routes: files.length, changed, failures }, null, 2));
if (failures.length) process.exit(1);
