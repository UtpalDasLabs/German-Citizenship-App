#!/usr/bin/env node
/**
 * Renders question shorts to MP4.
 *
 *   node scripts/render.mjs 147 32 226        three questions
 *   node scripts/render.mjs all               the whole catalogue
 *   node scripts/render.mjs 147 --stills      one PNG per beat, for review
 *   node scripts/render.mjs 147 --safe        shade the platform UI areas
 *   node scripts/render.mjs 147 --audio <dir>  narrated: time every beat to the
 *                                             voice in <dir> (from voice-elevenlabs)
 *
 * Output goes to video/out/. The browser comes from REMOTION_BROWSER if set,
 * then from a preinstalled headless Chromium if one exists, and otherwise
 * Remotion downloads its own - which is what happens on GitHub's runners.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const HERE = dirname(fileURLToPath(import.meta.url));
const VIDEO = join(HERE, '..');
const ROOT = join(VIDEO, '..');
const OUT = join(VIDEO, 'out');

const args = process.argv.slice(2);
const audioDir = args.includes('--audio') ? args[args.indexOf('--audio') + 1] : null;
const flags = new Set(args.filter((a) => a.startsWith('--')));
let ids = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--audio');
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

const FFMPEG = join(VIDEO, 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg');

/**
 * Silence after each beat's narration, in seconds: room to read the German
 * after hearing it, and for each change on screen to land before the next
 * sentence starts. The countdown keeps its three silent seconds to guess in.
 */
const AFTER_SPEECH = {
  hook: 0.4, question: 1.0, questionEn: 0.6, trap: 0.6, option: 0.5, optionsPicture: 1.0,
  countdown: 3.0, reveal: 0.6, why: 0.8, keywords: 0.8, end: 0.6,
};

function narratedSeconds(id) {
  const { timing } = JSON.parse(readFileSync(join(audioDir, 'timing.json'), 'utf8'));
  const { scriptFor } = beatsModule;
  const out = {};
  for (const b of scriptFor(id).beats) {
    if (timing[b.name] == null) throw new Error(`No narration for beat "${b.name}" in ${audioDir}`);
    out[b.name] = timing[b.name] + (AFTER_SPEECH[b.timing ?? b.name] ?? 0.5);
  }
  return out;
}

/**
 * One narration track for the whole video: each beat's audio padded with
 * silence to exactly that beat's length on screen, end to end. Lengths come
 * from frame counts, not seconds, so rounding never lets voice and picture drift.
 */
function buildTrack(id, fps, beatSeconds, workDir) {
  const { scriptFor } = beatsModule;
  const files = readdirSync(audioDir).filter((f) => /^\d\d-.+\.mp3$/.test(f) && !/\.\d+\.mp3$/.test(f));
  const padded = scriptFor(id).beats.map((b, i) => {
    const src = files.find((f) => f === `${String(i).padStart(2, '0')}-${b.name}.mp3`);
    if (!src) throw new Error(`Missing audio for beat ${i} "${b.name}"`);
    const secs = Math.round(beatSeconds[b.name] * fps) / fps;
    const wav = join(workDir, `${String(i).padStart(2, '0')}.wav`);
    execFileSync(FFMPEG, ['-v', 'error', '-i', join(audioDir, src), '-af', `apad,atrim=0:${secs}`, '-ar', '44100', '-ac', '1', '-y', wav]);
    return wav;
  });
  const list = join(workDir, 'track.txt');
  writeFileSync(list, padded.map((f) => `file '${f}'`).join('\n'));
  const track = join(workDir, 'narration.wav');
  execFileSync(FFMPEG, ['-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-y', track]);
  return track;
}

const beatsModule = await import('./beats.mjs');

console.log('Bundling…');
const serveUrl = await bundle({
  entryPoint: join(VIDEO, 'src/index.ts'),
  publicDir: join(ROOT, 'assets'),
});

for (const id of ids) {
  const beatSeconds = audioDir ? narratedSeconds(id) : undefined;
  const inputProps = { id, showSafeArea: flags.has('--safe'), ...(beatSeconds ? { beatSeconds } : {}) };
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

  const label = audioDir ? `-${basename(dirname(audioDir)).split('-')[0].slice(0, 6)}-${basename(audioDir)}` : '';
  const file = join(OUT, `short-${id}${label}${inputProps.showSafeArea ? '-safe' : ''}.mp4`);
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
  if (audioDir) {
    // Picture first, then the voice laid over it in one pass.
    const work = join(OUT, `.work-${id}`);
    mkdirSync(work, { recursive: true });
    const track = buildTrack(id, composition.fps, beatSeconds, work);
    const silent = join(work, 'silent.mp4');
    execFileSync('mv', [file, silent]);
    execFileSync(FFMPEG, ['-v', 'error', '-i', silent, '-i', track, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-y', file]);
    rmSync(work, { recursive: true, force: true });
  }
  const secs = composition.durationInFrames / composition.fps;
  console.log(`\r  #${id} → ${file}  (${secs.toFixed(1)}s video, rendered in ${((Date.now() - started) / 1000).toFixed(0)}s)`);
}
