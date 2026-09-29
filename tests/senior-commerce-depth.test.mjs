import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const runtime = fs.readFileSync('src/js/senior-commerce-depth.js', 'utf8');
const entry = fs.readFileSync('main.js', 'utf8');
const styles = fs.readFileSync('atelier-senior-commerce.css', 'utf8');

test('senior commerce layer is wired into the flagship runtime', () => {
  assert.match(entry, /initSeniorCommerceDepth/);
  assert.match(entry, /senior-commerce-depth\.js/);
});

test('PDP guidance is explicit, bounded and not fake personalization', () => {
  assert.match(runtime, /does not infer body measurements or guarantee fit/i);
  assert.match(runtime, /usual labelled size/i);
  assert.match(runtime, /Compare the product fit note and size guide/i);
});

test('cart and checkout preserve decision continuity and recovery', () => {
  assert.match(runtime, /DECISION CONTINUITY/);
  assert.match(runtime, /Stock is revalidated again before the local order is recorded/);
  assert.match(runtime, /ORDER READINESS/);
  assert.match(runtime, /Bag and inventory are checked again immediately before the local order is recorded/);
  assert.match(runtime, /Review first missing detail/);
});

test('senior commerce additions include a mobile adaptation', () => {
  assert.match(styles, /@media\(max-width:720px\)/);
});
