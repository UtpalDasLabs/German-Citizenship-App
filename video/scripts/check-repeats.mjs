#!/usr/bin/env node
/**
 * Checks a rendered video for a repeating clip: a shot that comes back after
 * something else has been on screen (a clip that looped, or the same footage
 * used twice). The render's own `--check` works from estimated timing, so it
 * can miss a loop (the Martinstag goose short, 4 Nov 2026, looped after 12.5 s
 * although `--check` passed). This looks at the finished file.
 *
 *   npm run check:repeats -- short.mp4 [more.mp4 ...]
 *
 * One frame every half second, blurred to a coarse grey grid. A repeat is a
 * frame that matches an earlier one 3+ seconds before it while the picture in
 * between looked different (so a held still is not a repeat). Vertical videos
 * ignore the top (hook) and bottom (captions); only the middle is compared.
 * Exits 1 if anything repeats.
 */
import { duration, frameAt } from './frames.mjs';

const STEP = 0.5;
const MIN_GAP = 3; // seconds between the two matching frames
const SAME = 7; // mean grey difference (0-255) that counts as the same picture
const CHANGED = 20; // ...and as visibly different in between
const GRID = 16;

function signature(file, t) {
  const { width: w, height: h, data } = frameAt(file, t, 192);
  const portrait = h > w;
  const y0 = Math.floor(h * (portrait ? 0.32 : 0));
  const y1 = Math.floor(h * (portrait ? 0.7 : 1));
  const sig = [];
  for (let gy = 0; gy < GRID; gy++)
    for (let gx = 0; gx < GRID; gx++) {
      let sum = 0;
      let n = 0;
      for (let y = y0 + Math.floor(((y1 - y0) * gy) / GRID); y < y0 + Math.floor(((y1 - y0) * (gy + 1)) / GRID); y++)
        for (let x = Math.floor((w * gx) / GRID); x < Math.floor((w * (gx + 1)) / GRID); x++) {
          const i = (y * w + x) * 3;
          sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
          n++;
        }
      sig.push(n ? sum / n : 0);
    }
  return sig;
}
const diff = (a, b) => a.reduce((s, v, i) => s + Math.abs(v - b[i]), 0) / a.length;

/** [{ at, again }] seconds, one entry per first repeated moment. */
export function findRepeats(file) {
  const secs = duration(file);
  const sigs = [];
  for (let t = 0.2; t < secs - 0.3; t += STEP) sigs.push({ t, s: signature(file, t) });
  const gap = Math.round(MIN_GAP / STEP);
  const found = [];
  for (let j = gap; j < sigs.length; j++) {
    for (let i = 0; i + gap <= j; i++) {
      if (diff(sigs[i].s, sigs[j].s) > SAME) continue;
      let between = 0;
      for (let k = i + 1; k < j; k++) between = Math.max(between, diff(sigs[i].s, sigs[k].s));
      if (between > CHANGED) {
        found.push({ at: sigs[i].t, again: sigs[j].t });
        break;
      }
    }
  }
  // Keep the first moment of each run of repeated frames.
  return found.filter((f, n) => n === 0 || f.again - found[n - 1].again > STEP * 1.5);
}

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: npm run check:repeats -- <video.mp4> [...]');
  process.exit(1);
}
let bad = 0;
for (const file of files) {
  const reps = findRepeats(file);
  if (!reps.length) console.log(`OK   ${file}: no repeating shot`);
  else {
    bad++;
    console.log(`FAIL ${file}: ${reps.map((r) => `${r.at.toFixed(1)} s comes back at ${r.again.toFixed(1)} s`).join('; ')}`);
  }
}
process.exit(bad ? 1 : 0);
