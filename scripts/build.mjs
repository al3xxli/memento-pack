import './check.mjs';
import assert from 'node:assert/strict';
import { cpSync, copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { basename, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = resolve(root, 'public');
const output = resolve(root, 'dist');
const p5Root = resolve(root, 'node_modules/p5');
const version = JSON.parse(readFileSync(resolve(p5Root, 'package.json'), 'utf8')).version;
assert.equal(version, '1.11.3', 'Keep the tested p5 version and versioned browser URL in sync');
assert.ok(existsSync(resolve(p5Root, 'lib/p5.min.js')), 'Run npm ci before building');

// Only the generated dist directory in this repository can be cleaned.
assert.equal(dirname(output), resolve(root));
assert.equal(basename(output), 'dist');
if (existsSync(output)) {
  assert.ok(lstatSync(output).isDirectory() && !lstatSync(output).isSymbolicLink(), 'dist must be an ordinary generated directory');
  rmSync(output, { recursive: true });
}
cpSync(source, output, { recursive: true });
mkdirSync(resolve(output, 'vendor'), { recursive: true });
copyFileSync(resolve(p5Root, 'lib/p5.min.js'), resolve(output, `vendor/p5-${version}.min.js`));
copyFileSync(resolve(p5Root, 'license.txt'), resolve(output, 'vendor/p5-LICENSE.txt'));

const html = readFileSync(resolve(output, 'index.html'), 'utf8');
const verifyAsset = (asset) => {
  if (asset.startsWith('#')) return;
  assert.ok(!/^(?:https?:)?\/\//.test(asset), `Runtime asset must be self-hosted: ${asset}`);
  const destination = resolve(output, asset.split(/[?#]/)[0]);
  assert.ok(destination.startsWith(output + sep), `Asset must stay in dist: ${asset}`);
  assert.ok(existsSync(destination), `Missing production asset: ${asset}`);
};
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) verifyAsset(match[1]);
const interior = readFileSync(resolve(output, 'sketch.js'), 'utf8');
for (const match of interior.matchAll(/image:\s*'([^']+)'/g)) verifyAsset(match[1]);
for (const excluded of ['README.md', 'docs', 'design', 'arduino', 'node_modules', '.git', '.env']) {
  assert.ok(!existsSync(resolve(output, excluded)), `Do not publish repository-only files: ${excluded}`);
}
const config = JSON.parse(readFileSync(resolve(root, 'vercel.json'), 'utf8'));
assert.equal(config.framework, null);
assert.equal(config.outputDirectory, 'dist');
assert.equal(config.buildCommand, 'npm run build');
console.log(`Production build ready: dist/ (${readdirSync(output).length} top-level entries). All runtime asset references verified.`);
