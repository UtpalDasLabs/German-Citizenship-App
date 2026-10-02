#!/usr/bin/env node
/**
 * The lively cut's music bed and sound effects, made with ElevenLabs Music and
 * Sound Effects. Each sound is made once and kept: re-running only fills in
 * what is missing (delete a file to make it again).
 *
 *   npm run sound:elevenlabs            writes to out/sound-elevenlabs/
 *
 * Needs ELEVENLABS_API_KEY with the "Music Generation" and "Sound Effects"
 * permissions. Renders use these sounds instead of the synthesised ones from
 * scripts/sound.mjs whenever this folder exists.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VIDEO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(VIDEO, 'out', 'sound-elevenlabs');
const FFMPEG = path.join(VIDEO, 'node_modules', '@remotion', 'compositor-linux-x64-gnu', 'ffmpeg');
const API = 'https://api.elevenlabs.io/v1';
const KEY = process.env.ELEVENLABS_API_KEY;

const MUSIC = {
  prompt:
    'Instrumental underscore for an upbeat history and trivia explainer video. Curious, playful and driving: ' +
    'pizzicato strings, warm marimba, light claps, soft punchy kick, bright synth plucks. Steady energy throughout, ' +
    'no big drops, no vocals, sits under a narrator. 118 bpm.',
  seconds: 60,
};

/** One effect per thing that happens on screen. */
const EFFECTS = {
  whoosh: { text: 'Short soft airy whoosh transition, clean, modern video editing swish', seconds: 0.8 },
  pop: { text: 'Soft bubbly UI pop, a word appearing on screen, clean and light', seconds: 0.5 },
  ding: { text: 'Bright cheerful correct-answer chime, quiz show, two quick bell notes, clean', seconds: 1.2 },
  tick: { text: 'Single crisp clock tick, quiz countdown timer, dry and close', seconds: 0.5 },
  thud: { text: 'Deep cinematic impact boom, a stamp hitting paper, short and punchy, no reverb tail', seconds: 1 },
};

async function post(endpoint, body) {
  const res = await fetch(`${API}${endpoint}`, {
    method: 'POST',
    headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${endpoint}: ${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

const RATE = 22050;

/** An audio file as mono 16-bit samples. */
function pcm(file) {
  return execFileSync(
    FFMPEG,
    ['-loglevel', 'error', '-i', file, '-ac', '1', '-ar', String(RATE), '-c:a', 'pcm_s16le', '-f', 'wav', '-'],
    {
      maxBuffer: 1 << 28,
    },
  ).subarray(78);
}

/** Loudest sample of an audio file, in dB below full scale. */
function peak(file) {
  const pcm_ = pcm(file);
  let p = 0;
  for (let i = 0; i + 1 < pcm_.length; i += 2) p = Math.max(p, Math.abs(pcm_.readInt16LE(i)));
  return 20 * Math.log10(p / 32768);
}

/**
 * Seconds of a track before its own ending fades out: where the last half
 * second at full level ends. Looping only this part keeps the bed steady.
 */
function body(file) {
  const x = pcm(file);
  const w = RATE / 2;
  const levels = [];
  for (let s = 0; (s + w) * 2 <= x.length; s += w) {
    let q = 0;
    for (let i = s; i < s + w; i++) q += (x.readInt16LE(i * 2) / 32768) ** 2;
    levels.push(10 * Math.log10(q / w));
  }
  const median = [...levels].sort((a, b) => a - b)[Math.floor(levels.length / 2)];
  let last = levels.length - 1;
  while (last > 0 && levels[last] < median - 3) last--;
  return (last + 1) / 2;
}

/** Length of an audio file, from ffmpeg's report. */
function seconds(file) {
  let report = '';
  try {
    execFileSync(FFMPEG, ['-i', file], { stdio: 'pipe' });
  } catch (e) {
    report = String(e.stderr);
  }
  const m = report.match(/Duration: (\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error(`No duration for ${file}`);
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

if (!KEY) {
  console.error('Set ELEVENLABS_API_KEY first.');
  process.exit(1);
}
fs.mkdirSync(OUT, { recursive: true });

const music = path.join(OUT, 'music.mp3');
if (!fs.existsSync(music)) {
  console.log(`music: ${MUSIC.seconds}s`);
  fs.writeFileSync(
    music,
    await post('/music', { prompt: MUSIC.prompt, music_length_ms: MUSIC.seconds * 1000, force_instrumental: true }),
  );
}
for (const [name, fx] of Object.entries(EFFECTS)) {
  const raw = path.join(OUT, `${name}.mp3`);
  if (!fs.existsSync(raw)) {
    console.log(`${name}: ${fx.text}`);
    fs.writeFileSync(
      raw,
      await post('/sound-generation', { text: fx.text, duration_seconds: fx.seconds, prompt_influence: 0.6 }),
    );
  }
  // Effects come back at very different levels: bring every one to the same
  // peak, so the volumes set in the video mean the same for each.
  const gain = -3 - peak(raw);
  execFileSync(FFMPEG, [
    '-y',
    '-loglevel',
    'error',
    '-i',
    raw,
    '-af',
    `volume=${gain.toFixed(1)}dB`,
    '-c:a',
    'pcm_s16le',
    path.join(OUT, `${name}.wav`),
  ]);
}
const info = { music: 'music.mp3', musicSeconds: Math.min(seconds(music), body(music)) };
fs.writeFileSync(path.join(OUT, 'sounds.json'), JSON.stringify(info, null, 2) + '\n');
console.log(`→ ${OUT}  (music ${info.musicSeconds.toFixed(1)}s)`);
