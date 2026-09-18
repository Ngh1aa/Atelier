import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [pdp, css, rationale, validation] = await Promise.all([
  readFile(new URL("../src/js/pdp-v15.js", import.meta.url), "utf8"),
  readFile(new URL("../atelier-v15.css", import.meta.url), "utf8"),
  readFile(new URL("../docs/uiux/INTERACTION-COMMERCE-RATIONALE-V16.md", import.meta.url), "utf8"),
  readFile(new URL("../docs/uiux/PLANNED-VALIDATION.md", import.meta.url), "utf8"),
]);

test("PDP exposes live decision support before Add to Bag", () => {
  assert.match(pdp, /pdp-confidence-strip/);
  assert.match(pdp, /Size & fit/);
  assert.match(pdp, /Availability/);
  assert.match(pdp, /Delivery & returns/);
  assert.match(pdp, /syncConfidenceStrip/);
});

test("decision support preserves Atelier hard-edge responsive language", () => {
  assert.match(css, /\.pdp-confidence-strip/);
  assert.match(css, /border-block:\s*1px solid var\(--ink\)/);
  assert.match(css, /grid-template-columns:\s*repeat\(3/);
  assert.match(css, /\.pdp-confidence-strip \{ grid-template-columns: minmax\(0,1fr\); \}/);
});

test("portfolio evidence stays truthful", () => {
  assert.match(rationale, /PLANNED VALIDATION/);
  assert.match(rationale, /No participant findings/);
  assert.match(validation, /Directional measures/);
  assert.match(validation, /Do not claim/);
});
