#!/usr/bin/env node
/**
 * Voices a short with ElevenLabs, one audio file per beat.
 *
 *   node scripts/voice-elevenlabs.mjs 147                 whole beats
 *   node scripts/voice-elevenlabs.mjs 147 --segments      German and English separately
 *   node scripts/voice-elevenlabs.mjs 147 --only hook     a single beat (a cheap probe)
 *   node scripts/voice-elevenlabs.mjs 1 2 3 ...           several shorts, one after another
 *
 * Two ways to voice a beat, because which one sounds right has to be heard:
 *
 *   whole beats  "A: Deutschland regieren, governing Germany." in one request.
 *                Natural flow; the model decides which words are German.
 *   --segments   each German and English piece in its own request, with the
 *                neighbouring text passed as context so the intonation still
 *                runs on, then joined. The model never has to guess the
 *                language, at the risk of faint seams.
 *
 * Writes out/audio/<id>/<voice>-<model>/<mode>/NN-<beat>.mp3 and timing.json with each beat's
 * spoken length - which is what the video is then stretched to fit.
 *
 * The API key comes from ELEVENLABS_API_KEY and is only ever sent in the
 * request header. Audio is cached: rerunning does not spend credits again.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { scriptFor } from './beats.mjs';

const VIDEO = join(dirname(fileURLToPath(import.meta.url)), '..');
const FFMPEG = join(VIDEO, 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg');
const FFPROBE = join(VIDEO, 'node_modules/@remotion/compositor-linux-x64-gnu/ffprobe');

/**
 * The creator's Professional Voice Clone (ElevenLabs), used for everything
 * voiced from October 2026 on. The earlier instant clone, vFeVIow1bgkn4mgnqNwD,
 * voiced the 30 long-form lessons; their narration is kept as it is.
 */
const VOICE = process.env.ELEVENLABS_VOICE_ID ?? 'Rr3HT8xllxaRdjMZxGBa';
/**
 * Eleven v4, the model and settings of the long-form lessons, so a short and a
 * lesson sound like the same person. v4 also performs each beat's delivery tag.
 */
const MODEL = process.env.ELEVENLABS_MODEL ?? 'eleven_v4';
const TAKES_TAGS = /^eleven_v[34]/.test(MODEL);
const SETTINGS = TAKES_TAGS
  ? { stability: 0.5 }
  : { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true };

const args = process.argv.slice(2);
const ids = args.filter((a, i) => /^\d+$/.test(a) && args[i - 1] !== '--only').map(Number);
const segments = args.includes('--segments');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
if (ids.length === 0) {
  console.error('Usage: node scripts/voice-elevenlabs.mjs <id ...> [--segments] [--only <beat>]');
  process.exit(1);
}
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error('ELEVENLABS_API_KEY is not set in this session.');
  process.exit(1);
}

const mode = segments ? 'segments' : 'beats';

let spent = 0;
/** What ElevenLabs reports it billed (its character-cost header), when it says. */
let billed = 0;

async function speak(text, file, context = {}) {
  if (existsSync(file)) return; // cached
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: SETTINGS,
        ...(context.previous ? { previous_text: context.previous } : {}),
        ...(context.next ? { next_text: context.next } : {}),
      }),
    },
  );
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`ElevenLabs ${res.status} for "${text.slice(0, 40)}": ${body.slice(0, 300)}`);
  }
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  billed += Number(res.headers.get('character-cost') ?? 0);
  spent += text.replace(/\[[a-z ]+\]\s*/g, '').length;
}

const seconds = (file) =>
  Number(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());

async function voiceOne(id) {
  const dir = join(VIDEO, 'out', 'audio', String(id), `${VOICE}-${MODEL}`, mode);
  mkdirSync(dir, { recursive: true });
  const script = scriptFor(id);
  const timing = {};
  /** The audio file each beat uses, so a render picks this text's take. */
  const files = {};

  for (const [i, beat] of script.beats.entries()) {
    if (only && beat.name !== only) continue;
    if (beat.silent) continue; // shown, not said: the render holds it for its silent length
    const whole = `${TAKES_TAGS && beat.tag ? `${beat.tag} ` : ''}${beat.say.map((s) => s.text).join('')}`;
    // Cached by the exact text, so an edited line is voiced again and an
    // unchanged one never is.
    const base = join(dir, `${String(i).padStart(2, '0')}-${beat.name}-${createHash('sha1').update(whole).digest('hex').slice(0, 8)}`);
    const out = `${base}.mp3`;

    if (!segments) {
      await speak(whole, out);
    } else {
      // Each piece on its own, told what comes before and after it.
      const parts = [];
      for (const [j, seg] of beat.say.entries()) {
        if (!seg.text.trim() || /^[\s.,:;!?]+$/.test(seg.text)) continue; // bare punctuation
        const file = `${base}.${j}.mp3`;
        const previous = beat.say.slice(0, j).map((s) => s.text).join('').trim();
        const next = beat.say.slice(j + 1).map((s) => s.text).join('').trim();
        await speak(seg.text.trim(), file, { previous, next });
        parts.push(file);
      }
      if (!existsSync(out)) {
        const list = join(dir, `${String(i).padStart(2, '0')}.txt`);
        writeFileSync(list, parts.map((p) => `file '${p}'`).join('\n'));
        execFileSync(FFMPEG, ['-v', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-y', out]);
      }
    }
    timing[beat.name] = Number(seconds(out).toFixed(3));
    files[beat.name] = out.slice(dir.length + 1);
    console.log(`  ${beat.name.padEnd(15)} ${timing[beat.name].toFixed(2)}s  ${beat.say.map((s) => (s.lang === 'de' ? `[${s.text}]` : s.text)).join('')}`);
  }

  writeFileSync(join(dir, 'timing.json'), `${JSON.stringify({ id, voice: VOICE, model: MODEL, mode, timing, files }, null, 2)}\n`);
  return dir;
}

let lastDir = null;
for (const id of ids) {
  if (ids.length > 1) console.log(`#${id}`);
  lastDir = await voiceOne(id);
}
console.log(`\n${spent} characters sent this run${billed ? `, ${billed} credits billed` : ''} (cached audio is not re-sent). Files: ${ids.length > 1 ? join(VIDEO, 'out', 'audio') : lastDir}`);
