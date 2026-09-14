#!/usr/bin/env node
/**
 * Rewrites BUILD_ID in the exported service worker.
 *
 * Without this the cache name is constant, `activate` never deletes anything,
 * and an installed user keeps whatever build they first cached.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sw = path.join(ROOT, 'dist', 'sw.js');

if (!fs.existsSync(sw)) {
  console.error('dist/sw.js not found - run the web export first.');
  process.exit(1);
}

let id;
try {
  id = execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
} catch {
  id = String(Date.now());
}
// Include the time too, so an uncommitted rebuild still busts the cache.
const build = `${id}-${Date.now().toString(36)}`;

const src = fs.readFileSync(sw, 'utf8');
if (!src.includes("const BUILD_ID = 'dev';")) {
  console.error('BUILD_ID placeholder missing from sw.js - not stamping.');
  process.exit(1);
}
fs.writeFileSync(sw, src.replace("const BUILD_ID = 'dev';", `const BUILD_ID = '${build}';`));
console.log(`Stamped service worker cache as lid-${build}`);
