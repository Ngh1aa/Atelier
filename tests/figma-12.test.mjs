import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const routes = [
  'figma-12.html',
  'figma-01-overview.html','figma-02-research.html','figma-03-strategy.html',
  'figma-04-ia.html','figma-05-user-flows.html','figma-06-wireframes.html',
  'figma-07-design-system.html','figma-08-components-states.html','figma-09-final-ui.html',
  'figma-10-responsive.html','figma-11-prototype.html','figma-12-iteration-handoff.html',
];

test('Bộ 12 Figma routes are static and importer-friendly', async () => {
  await access(path.join(root, 'figma-12.css'));
  for (const file of routes) {
    const source = await readFile(path.join(root, file), 'utf8');
    assert.match(source, /figma-12\.css/, file + ' should load figma-12.css');
    assert.match(source, /f12-shell/, file + ' should expose one stable frame shell');
    assert.doesNotMatch(source, /<script\b/i, file + ' should not rely on runtime JavaScript');
  }
});

test('Bộ 12 Figma has exactly one numbered route for each screen', () => {
  for (let i = 1; i <= 12; i += 1) {
    const id = String(i).padStart(2, '0');
    assert.equal(routes.filter((file) => file.startsWith('figma-' + id + '-')).length, 1, 'screen ' + id);
  }
});
