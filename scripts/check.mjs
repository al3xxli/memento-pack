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
  'public/mobile.js',
  'public/travel-data.js',
  'public/assets/Photos/Exterior.png',
  'public/assets/Photos/Interior_fully_empty.png',
  'public/assets/Photos/Interior_pockets.png',
  'public/assets/Photos/Interior_front_notebook_only.png',
  'public/assets/Photos/Interior_Both Notebooks.png',
  'public/assets/Photos/Interior_spiral_notebook_only.png'
];
for (const file of required) {
  if (!existsSync(resolve(root, file))) throw new Error(`Missing required file: ${file}`);
}
const sketch = readFileSync(resolve(root, 'public/sketch.js'), 'utf8');
for (const state of ['EMPTY', 'POCKETS', 'SMALL', 'HEAVY']) {
  if (!sketch.includes(state)) throw new Error(`Missing browser state: ${state}`);
}
new Function(sketch.replace(/^\/\* global p5 \*\/\s*/, ''));
const states = runInNewContext(`${sketch.split('const REMOVALS')[0]}\nSTATES`);
const stateImages = {
  EMPTY: 'Interior_fully_empty.png', POCKETS: 'Interior_pockets.png',
  SMALL: 'Interior_front_notebook_only.png', HEAVY: 'Interior_Both Notebooks.png'
};
for (const [state, filename] of Object.entries(stateImages)) {
  assert.equal(states[state].image, `assets/Photos/${filename}`, `Wrong drawing for ${state}`);
}
for (const file of required.filter((file) => file.endsWith('.png'))) {
  const png = readFileSync(resolve(root, file));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `Invalid PNG: ${file}`);
  assert.equal(png.readUInt32BE(16), 1254, `Unexpected image width: ${file}`);
  assert.equal(png.readUInt32BE(20), 1254, `Unexpected image height: ${file}`);
}
// Verify that one shared perspective mapping fits all four front-panel corners.
const css = readFileSync(resolve(root, 'public/style.css'), 'utf8');
const matrix = css.match(/#panel-projection\s*\{[^}]*matrix3d\(([^)]+)\)/)[1].split(',').map(Number);
for (const [x, y, expectedX, expectedY] of [[0, 0, 302, 159], [280, 0, 674, 137], [280, 370, 670, 1181], [0, 370, 351, 1030]]) {
  const w = matrix[3] * x + matrix[7] * y + matrix[15];
  assert.ok(Math.abs((matrix[0] * x + matrix[4] * y + matrix[12]) / w - expectedX) < .01);
  assert.ok(Math.abs((matrix[1] * x + matrix[5] * y + matrix[13]) / w - expectedY) < .01);
}
new Function(readFileSync(resolve(root, 'public/outer.js'), 'utf8'));
new Function(readFileSync(resolve(root, 'public/mobile.js'), 'utf8'));
const travelSource = readFileSync(resolve(root, 'public/travel-data.js'), 'utf8');
new Function(travelSource);
const locations = runInNewContext(`${travelSource}\nTRAVEL_LOCATIONS`);
const approved = JSON.parse(readFileSync(resolve(root, 'design/approved-front-panel-layout.json'), 'utf8'));
assert.deepEqual(JSON.parse(JSON.stringify(locations)), approved.locations, 'Travel data must match the approved front-panel layout');
const outerSource = readFileSync(resolve(root, 'public/outer.js'), 'utf8');
assert.ok(outerSource.includes(approved.cornerOutline), 'Preserve the approved L-shaped corner outline');
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
console.log(`Checked ${required.length} required files, PNGs and state mapping, panel projection, browser syntax, all 12 travel locations, and the approved front-panel baseline.`);
