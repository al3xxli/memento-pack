import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const required = [
  'arduino/memento_pack/memento_pack.ino',
  'public/index.html',
  'public/style.css',
  'public/sketch.js',
  'public/outer.js',
  'public/travel-data.js',
  'public/assets/backpack-closed.svg',
  'public/assets/backpack-empty.svg',
  'public/assets/backpack-pockets.svg',
  'public/assets/backpack-small-notebook.svg',
  'public/assets/backpack-heavy-notebooks.svg'
];
for (const file of required) {
  if (!existsSync(resolve(root, file))) throw new Error(`Missing required file: ${file}`);
}
const sketch = readFileSync(resolve(root, 'public/sketch.js'), 'utf8');
for (const state of ['EMPTY', 'POCKETS', 'SMALL', 'HEAVY']) {
  if (!sketch.includes(state)) throw new Error(`Missing browser state: ${state}`);
}
new Function(sketch.replace(/^\/\* global p5 \*\/\s*/, ''));
new Function(readFileSync(resolve(root, 'public/outer.js'), 'utf8'));
const travelSource = readFileSync(resolve(root, 'public/travel-data.js'), 'utf8');
new Function(travelSource);
const locations = runInNewContext(`${travelSource}\nTRAVEL_LOCATIONS`);
assert.equal(locations.length, 12);
assert.equal(new Set(locations.map((place) => place.id)).size, 12, 'City IDs must be unique for filtering');
assert.equal(new Set(locations.map((place) => place.color)).size, 12, 'Each city needs its own color');
for (const place of locations) {
  assert.ok(place.city && place.country);
  assert.match(place.color, /^#[0-9a-f]{6}$/i);
  assert.ok(place.marks.length > 0);
  for (const mark of place.marks) {
    assert.ok(['rub', 'stain', 'scratch', 'dent'].includes(mark.type));
    assert.ok(Number.isFinite(mark.length) && mark.length > 0 && Number.isFinite(mark.width) && mark.width > 0, 'Wear geometry needs positive dimensions');
    assert.ok(mark.x >= 0 && mark.x <= 280 && mark.y >= 0 && mark.y <= 370, 'Marks must lie on the front panel');
    assert.ok(mark.story.trim());
  }
}
console.log(`Checked ${required.length} required files, browser syntax, and all 12 travel locations.`);
