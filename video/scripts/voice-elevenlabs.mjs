#!/usr/bin/env node
/**
 * Voices a short with ElevenLabs, one audio file per beat.
 *
 *   node scripts/voice-elevenlabs.mjs 147                 whole beats
 *   node scripts/voice-elevenlabs.mjs 147 --segments      German and English separately
 *   node scripts/voice-elevenlabs.mjs 147 --only hook     a single beat (a cheap probe)
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
 * Writes out/audio/<id>/<mode>/NN-<beat>.mp3 and timing.json with each beat's
 * spoken length - which is what the video is then stretched to fit.
 *
 * The API key comes from ELEVENLABS_API_KEY and is only ever sent in the
 * request header. Audio is cached: rerunning does not spend credits again.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { scriptFor } from './beats.mjs';

const VIDEO = join(dirname(fileURLToPath(import.meta.url)), '..');
const FFMPEG = join(VIDEO, 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg');
const FFPROBE = join(VIDEO, 'node_modules/@remotion/compositor-linux-x64-gnu/ffprobe');

/** Rowan - the voice chosen for the first test. */
const VOICE = process.env.ELEVENLABS_VOICE_ID ?? 'kLhAstPcnnPxqzk6gS5i';
/** The established multilingual model; German is one of its native languages. */
const MODEL = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2';

const args = process.argv.slice(2);
const id = Number(args.find((a) => /^\d+$/.test(a)));
const segments = args.includes('--segments');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
if (!id) {
  console.error('Usage: node scripts/voice-elevenlabs.mjs <id> [--segments] [--only <beat>]');
  process.exit(1);
}
const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error('ELEVENLABS_API_KEY is not set in this session.');
  process.exit(1);
}

const mode = segments ? 'segments' : 'beats';
const dir = join(VIDEO, 'out', 'audio', String(id), mode);
mkdirSync(dir, { recursive: true });

let spent = 0;

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
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true },
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
  spent += text.length;
}

const seconds = (file) =>
  Number(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());

const script = scriptFor(id);
const timing = {};

for (const [i, beat] of script.beats.entries()) {
  if (only && beat.name !== only) continue;
  const base = join(dir, `${String(i).padStart(2, '0')}-${beat.name}`);
  const out = `${base}.mp3`;
  const whole = beat.say.map((s) => s.text).join('');

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
  console.log(`  ${beat.name.padEnd(15)} ${timing[beat.name].toFixed(2)}s  ${beat.say.map((s) => (s.lang === 'de' ? `[${s.text}]` : s.text)).join('')}`);
}

writeFileSync(join(dir, 'timing.json'), `${JSON.stringify({ id, voice: VOICE, model: MODEL, mode, timing }, null, 2)}\n`);
console.log(`\n${spent} characters sent this run (cached audio is not re-sent). Files: ${dir}`);
