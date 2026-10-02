#!/usr/bin/env node
/**
 * Synthesises the lessons' music bed and sound effects, so every sound in the
 * videos is ours: no licences, no Content ID claims.
 *
 *   npm run sound            writes the sounds to out/sound/
 *
 * The music is an upbeat 112 bpm loop (drums, bass, chord stabs, a little
 * pluck melody) meant to sit quietly under the voice. The effects mark what
 * happens on screen: a whoosh on every cut, a pop when something appears, a
 * ding on the right answer, a tick when a wrong one drops away, and a thud
 * for words that land hard.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RATE = 44100;
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'out', 'sound');

function wav(file, left, right = left) {
  const n = left.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(RATE, 24);
  buf.writeUInt32LE(RATE * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, left[i])) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, right[i])) * 32767), 46 + i * 4);
  }
  fs.writeFileSync(path.join(OUT, file), buf);
}

// Deterministic noise, so every build of the sounds is identical.
let seed = 12345;
const noise = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
const tone = (f, t) => Math.sin(2 * Math.PI * f * t);
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

/** One-pole low-pass over a buffer; cutoff in Hz, fixed or a function of time. */
function lowpass(x, cutoff) {
  const y = new Float32Array(x.length);
  let prev = 0;
  for (let i = 0; i < x.length; i++) {
    const c = typeof cutoff === 'function' ? cutoff(i / RATE) : cutoff;
    const a = 1 - Math.exp((-2 * Math.PI * c) / RATE);
    prev += a * (x[i] - prev);
    y[i] = prev;
  }
  return y;
}

function normalise(x, peak) {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  return x.map((v) => (v / (m || 1)) * peak);
}

const buffer = (seconds, f) => Float32Array.from({ length: Math.round(seconds * RATE) }, (_, i) => f(i / RATE, i));

// ─── Effects ────────────────────────────────────────────────────────────────

function whoosh() {
  const raw = buffer(0.45, () => noise());
  const swept = lowpass(raw, (t) => 400 + 5200 * Math.sin(Math.PI * Math.min(1, t / 0.45)));
  return normalise(
    swept.map((v, i) => v * Math.sin(Math.PI * (i / swept.length)) ** 1.5),
    0.55,
  );
}

const pop = () => buffer(0.12, (t) => tone(900 - 500 * (t / 0.12), t) * Math.exp(-t * 38) * 0.6);

const ding = () =>
  buffer(1.1, (t) => (tone(1318.5, t) * 0.5 + tone(1975.5, t) * 0.25 + tone(2637, t) * 0.12) * Math.exp(-t * 4.2) * 0.7);

const tick = () => buffer(0.05, (t) => (noise() * 0.5 + tone(2400, t) * 0.5) * Math.exp(-t * 120) * 0.5);

function thud() {
  const body = buffer(0.35, (t) => tone(70 + 60 * Math.exp(-t * 30), t) * Math.exp(-t * 11));
  const slap = lowpass(
    buffer(0.35, (t) => noise() * Math.exp(-t * 60)),
    2500,
  );
  return normalise(
    body.map((v, i) => v + slap[i] * 0.8),
    0.8,
  );
}

// ─── Music ──────────────────────────────────────────────────────────────────

/** Eight bars at 112 bpm in A minor, Am – F – C – G, looped by the renderer. */
function music() {
  const beat = 60 / 112;
  const bars = 8;
  const len = Math.round(bars * 4 * beat * RATE);
  const L = new Float32Array(len);
  const R = new Float32Array(len);
  const add = (start, samples, gainL, gainR = gainL) => {
    const s = Math.round(start * RATE);
    for (let i = 0; i < samples.length && s + i < len; i++) {
      L[s + i] += samples[i] * gainL;
      R[s + i] += samples[i] * gainR;
    }
  };
  const kick = buffer(0.3, (t) => tone(50 + 90 * Math.exp(-t * 35), t) * Math.exp(-t * 9));
  const clap = lowpass(
    buffer(0.2, (t) => noise() * Math.exp(-t * 22)),
    3000,
  );
  const hatRaw = buffer(0.05, (t) => noise() * Math.exp(-t * 90));
  const hat = hatRaw.map((v, i, a) => v - (a[i - 1] ?? 0) * 0.9);
  const chords = [
    [57, 60, 64],
    [53, 57, 60],
    [48, 52, 55],
    [55, 59, 62],
  ];
  const melody = [76, 72, 74, 76, 79, 76, 74, 72];

  for (let bar = 0; bar < bars; bar++) {
    const chord = chords[bar % 4];
    for (let b = 0; b < 4; b++) {
      const t0 = (bar * 4 + b) * beat;
      add(t0, kick, 0.9);
      if (b % 2 === 1) add(t0, clap, 0.35, 0.3);
      add(t0 + beat / 2, hat, 0.12, 0.16);
      add(t0 + beat / 4, hat, 0.05, 0.04);
      add(t0 + (3 * beat) / 4, hat, 0.05, 0.04);
      for (const [off, note] of [
        [0, chord[0] - 24],
        [beat / 2, chord[0] - 12],
      ]) {
        const f = midi(note);
        const bass = buffer(beat * 0.45, (t) => (tone(f, t) + 0.35 * tone(2 * f, t)) * Math.min(1, t * 200) * Math.exp(-t * 4));
        add(t0 + off, lowpass(bass, 900), 0.42);
      }
    }
    for (const b of [1.5, 3.5]) {
      const stab = buffer(beat * 0.4, (t) => {
        let v = 0;
        for (const n of chord) {
          const f = midi(n + 12);
          v += Math.sign(tone(f, t)) * 0.25 + tone(f * 1.003, t) * 0.4;
        }
        return v * Math.min(1, t * 300) * Math.exp(-t * 10);
      });
      add((bar * 4 + b) * beat, lowpass(stab, 2600), 0.09, 0.11);
    }
    // A pluck melody in the second half of each four bars, so the loop breathes.
    if (bar % 4 >= 2) {
      for (let k = 0; k < 4; k++) {
        const f = midi(melody[((bar % 2) * 4 + k) % melody.length]);
        const pluck = buffer(beat, (t) => (tone(f, t) * 0.7 + tone(2 * f, t) * 0.2) * Math.exp(-t * 7));
        add((bar * 4 + k) * beat, pluck, 0.1, 0.07);
      }
    }
  }
  let peak = 0;
  for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  return [L.map((v) => (v / peak) * 0.85), R.map((v) => (v / peak) * 0.85)];
}

fs.mkdirSync(OUT, { recursive: true });
wav('whoosh.wav', whoosh());
wav('pop.wav', pop());
wav('ding.wav', ding());
wav('tick.wav', tick());
wav('thud.wav', thud());
const [l, r] = music();
wav('music.wav', l, r);
console.log(`sounds → ${path.relative(process.cwd(), OUT)}`);
