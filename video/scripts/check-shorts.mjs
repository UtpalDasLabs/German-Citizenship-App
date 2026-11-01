#!/usr/bin/env node
/**
 * Checks rendered question shorts before anyone posts them: a question about a
 * picture (a map, a flag, a ballot, four coats of arms) must show that picture,
 * and a question about a press photo must not be a short at all, since the
 * photo can't be shown and the question can't be answered without it.
 *
 *   npm run check:shorts -- out/shorts                 every NNN-q<id>.mp4 in a folder
 *   npm run check:shorts -- 088-q438.mp4 short-308.mp4 single files
 *   npm run check:shorts -- week-05.csv                every video a Publer CSV posts
 *                                                      (downloaded from its media URL)
 *
 * Only questions with pictures are opened; text-only shorts pass unopened.
 * Exits 1 if any short fails, so a workflow stops before uploading it.
 *
 * How a picture is recognised (measured on the real renders):
 * - an exam picture sits on a white card: rows of the frame with a long white
 *   run appear while the question is on screen;
 * - option pictures fill the answer tiles with colour and white, many times
 *   more than four lines of answer text.
 * Frames are taken from the middle of the video only, so the opening sticker
 * and the end card don't count.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { duration, frameAt } from './frames.mjs';

const VIDEO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const raw = JSON.parse(fs.readFileSync(path.join(VIDEO, '..', 'src', 'data', 'questions.json'), 'utf8'));
const QUESTIONS = new Map((Array.isArray(raw) ? raw : raw.questions).map((q) => [q.id, q]));

/** What a short of this question has to show. */
export function expectation(q) {
  if (q.imageMode === 'single') return q.imageCredit ? 'press-photo' : 'exam-picture';
  if (q.imageMode === 'options') return 'option-pictures';
  return 'none';
}

const WHITE_ROWS = 6; // rows with a white run of 40+ px (at 540 px wide)
const TILE_PIXELS = 12000; // colourful or white pixels in the answer area

function measure(file) {
  const secs = duration(file);
  let whiteRows = 0;
  let tilePixels = 0;
  for (let t = secs * 0.15; t < secs * 0.75; t += 1.5) {
    const { width: w, height: h, data } = frameAt(file, t);
    let rows = 0;
    let tiles = 0;
    for (let y = 0; y < h; y++) {
      let run = 0;
      let best = 0;
      const inTiles = y >= h * 0.28 && y < h * 0.66;
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 3;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lo = Math.min(r, g, b);
        const hi = Math.max(r, g, b);
        if (lo > 225) best = Math.max(best, ++run);
        else run = 0;
        if (inTiles && (hi - lo > 60 || lo > 200)) tiles++;
      }
      if (best >= 40) rows++;
    }
    whiteRows = Math.max(whiteRows, rows);
    tilePixels = Math.max(tilePixels, tiles);
  }
  return { whiteRows, tilePixels };
}

/** { ok, why } for one rendered short of question `id`. */
export function checkShort(file, id) {
  const q = QUESTIONS.get(id);
  if (!q) return { ok: false, why: `no question #${id}` };
  const want = expectation(q);
  if (want === 'none') return { ok: true, why: 'text only' };
  if (want === 'press-photo') return { ok: false, why: 'press photo: the question cannot be answered without it, never make it a short' };
  const m = measure(file);
  if (want === 'exam-picture') {
    return m.whiteRows >= WHITE_ROWS
      ? { ok: true, why: `picture shown (${m.whiteRows} rows of white card)` }
      : { ok: false, why: `PICTURE MISSING: no white picture card while the question is on screen (${m.whiteRows} rows)` };
  }
  return m.tilePixels >= TILE_PIXELS
    ? { ok: true, why: `option pictures shown (${m.tilePixels} px)` }
    : { ok: false, why: `OPTION PICTURES MISSING: answer tiles look empty (${m.tilePixels} px)` };
}

/** The question id in a short's file name: 088-q438.mp4, short-308.mp4. */
export function idOf(file) {
  const m = path.basename(file).match(/q(\d+)\.mp4$/) ?? path.basename(file).match(/^short-(\d+)/);
  return m ? Number(m[1]) : null;
}

/** Media URLs of the videos a Publer CSV posts. */
function csvVideos(file) {
  return [...fs.readFileSync(file, 'utf8').matchAll(/https:\/\/[^\s,"]+\.mp4/g)].map((m) => m[0]);
}

async function main() {
  const inputs = process.argv.slice(2);
  if (inputs.length === 0) {
    console.error('Usage: npm run check:shorts -- <folder|file.mp4|plan.csv> ...');
    process.exit(1);
  }
  const targets = [];
  for (const a of inputs) {
    if (a.endsWith('.csv')) targets.push(...csvVideos(a));
    else if (fs.existsSync(a) && fs.statSync(a).isDirectory())
      targets.push(...fs.readdirSync(a).filter((f) => f.endsWith('.mp4')).map((f) => path.join(a, f)));
    else targets.push(a);
  }
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'check-shorts-'));
  let failed = 0;
  let checked = 0;
  for (const target of [...new Set(targets)]) {
    const id = idOf(target);
    const q = id && QUESTIONS.get(id);
    if (!q) {
      if (!/driving-shorts|series/.test(target)) console.log(`?  ${target}: not a citizenship question short, skipped`);
      continue;
    }
    if (expectation(q) === 'none') continue;
    let file = target;
    if (/^https?:/.test(target)) {
      file = path.join(tmp, path.basename(target));
      const res = await fetch(target);
      if (!res.ok) {
        console.log(`✗  ${path.basename(target)}: download failed (${res.status})`);
        failed++;
        continue;
      }
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    }
    const { ok, why } = checkShort(file, id);
    checked++;
    if (!ok) failed++;
    console.log(`${ok ? '✓' : '✗'}  ${path.basename(target)}  #${id}  ${why}`);
    if (file !== target) fs.rmSync(file);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`\n${checked} picture shorts checked, ${failed} failed.`);
  process.exit(failed ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) await main();
