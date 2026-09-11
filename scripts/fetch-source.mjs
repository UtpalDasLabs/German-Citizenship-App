#!/usr/bin/env node
/**
 * Re-downloads the vendored question catalogue into `data-source/`.
 *
 * The raw images that ship with the upstream package are very large (~35 MB), so
 * they are not committed. Run this script when you need to regenerate the app
 * assets from scratch, then run `npm run data`.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, cpSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PKG = '@cemusta/burgertest@0.1.0';

const work = mkdtempSync(path.join(tmpdir(), 'burgertest-'));
try {
  console.log(`Downloading ${PKG} ...`);
  const tarball = execFileSync('npm', ['pack', PKG, '--silent'], { cwd: work, encoding: 'utf8' }).trim();
  execFileSync('tar', ['xzf', tarball], { cwd: work });

  const data = path.join(work, 'package', 'data');
  if (!existsSync(data)) throw new Error('Unexpected package layout: data/ not found');

  cpSync(path.join(data, 'questions.json'), path.join(ROOT, 'data-source', 'questions.raw.json'));
  cpSync(path.join(data, 'images'), path.join(ROOT, 'data-source', 'images'), { recursive: true });
  console.log('Source data written to data-source/. Now run: npm run data');
} finally {
  rmSync(work, { recursive: true, force: true });
}
