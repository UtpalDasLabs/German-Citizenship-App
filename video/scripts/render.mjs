#!/usr/bin/env node
/**
 * Renders question shorts to MP4.
 *
 *   node scripts/render.mjs 147 32 226        three questions
 *   node scripts/render.mjs all               the whole catalogue
 *   node scripts/render.mjs 147 --stills      one PNG per beat, for review
 *   node scripts/render.mjs 147 --safe        shade the platform UI areas
 *
 * Output goes to video/out/. The browser comes from REMOTION_BROWSER if set,
 * then from a preinstalled headless Chromium if one exists, and otherwise
 * Remotion downloads its own - which is what happens on GitHub's runners.
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const HERE = dirname(fileURLToPath(import.meta.url));
const VIDEO = join(HERE, '..');
const ROOT = join(VIDEO, '..');
const OUT = join(VIDEO, 'out');

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
let ids = args.filter((a) => !a.startsWith('--'));
if (ids.includes('all')) {
  ids = JSON.parse(readFileSync(join(ROOT, 'src/data/questions.json'), 'utf8')).map((q) => q.id);
}
ids = ids.map(Number);
if (ids.length === 0 || ids.some(Number.isNaN)) {
  console.error('Usage: node scripts/render.mjs <id ...|all> [--stills] [--safe]');
  process.exit(1);
}

const PREINSTALLED = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = process.env.REMOTION_BROWSER ?? (existsSync(PREINSTALLED) ? PREINSTALLED : null);

mkdirSync(OUT, { recursive: true });

console.log('Bundling…');
const serveUrl = await bundle({
  entryPoint: join(VIDEO, 'src/index.ts'),
  publicDir: join(ROOT, 'assets'),
});

for (const id of ids) {
  const inputProps = { id, showSafeArea: flags.has('--safe') };
  const composition = await selectComposition({ serveUrl, id: 'QuestionShort', inputProps, browserExecutable });

  if (flags.has('--stills')) {
    // One frame from the middle of each beat: enough to review a layout
    // without watching forty seconds of video.
    const { load } = await import('./beats.mjs');
    for (const beat of await load(id, composition.fps)) {
      const frame = Math.min(composition.durationInFrames - 1, beat.from + Math.floor(beat.frames * 0.7));
      const file = join(OUT, `still-${id}-${String(beat.index).padStart(2, '0')}-${beat.name}.png`);
      await renderStill({ composition, serveUrl, frame, output: file, inputProps, browserExecutable });
      console.log(`  ${file}`);
    }
    continue;
  }

  const file = join(OUT, `short-${id}${inputProps.showSafeArea ? '-safe' : ''}.mp4`);
  const started = Date.now();
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    // Platforms re-encode everything; a high-quality master survives that best.
    crf: 18,
    outputLocation: file,
    inputProps,
    browserExecutable,
    onProgress: ({ progress }) => process.stdout.write(`\r  #${id} ${Math.round(progress * 100)}%`),
  });
  const secs = composition.durationInFrames / composition.fps;
  console.log(`\r  #${id} → ${file}  (${secs.toFixed(1)}s video, rendered in ${((Date.now() - started) / 1000).toFixed(0)}s)`);
}
