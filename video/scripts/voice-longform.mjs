#!/usr/bin/env node
/**
 * Voices a long-form script with ElevenLabs, one request per paragraph.
 *
 *   npm run voice:longform -- basic-rights              every chapter
 *   npm run voice:longform -- basic-rights --chapters 0-1
 *   npm run voice:longform -- basic-rights --dry         characters only, no requests
 *
 * Uses the /with-timestamps endpoint, so every paragraph comes back with the
 * time each character is spoken. The renderer uses that to show German
 * phrases the moment they are said and to land highlights on the right word.
 *
 * Audio is cached by voice, clone version, model, settings and the exact
 * paragraph text: re-running after editing one sentence pays only for the
 * paragraph that changed, and retraining the clone (same voice ID) or
 * changing a setting never reuses old audio.
 *
 * The key is read from ELEVENLABS_API_KEY and nowhere else.
 */
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseLongform, pickChapters } from './longform.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const FFPROBE = path.join(root, 'node_modules/@remotion/compositor-linux-x64-gnu/ffprobe');

export const VOICE = process.env.ELEVENLABS_VOICE_ID ?? 'vFeVIow1bgkn4mgnqNwD';
/** Bump when the clone is retrained: ElevenLabs keeps the same voice ID. */
export const CLONE_VERSION = process.env.ELEVENLABS_CLONE_VERSION ?? '2026-10-02';
/**
 * Multilingual v2 with high similarity was picked by ear (A/B test, 2 Oct
 * 2026) as the one that sounds most like the creator; `style` gives back some
 * of the energy the v4 model had. v2 does not take [direction] tags.
 */
export const MODEL = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2';
export const SETTINGS = { stability: 0.4, similarity_boost: 0.95, style: 0.35, use_speaker_boost: true };
const TAKES_TAGS = /^eleven_v[34]/.test(MODEL);

/** The text actually sent to the voice for a paragraph. */
export const spokenText = (tts) => (TAKES_TAGS ? tts : tts.replace(/\[(?!\[)[a-z][a-z ,]*\]\s*/gi, '').trim());

const slug = `${VOICE}-${CLONE_VERSION}-${MODEL}-s${SETTINGS.stability}-m${SETTINGS.similarity_boost}-y${SETTINGS.style}`;
export const audioDir = (topic) => path.join(root, 'out', 'audio', 'longform', topic, slug);
export const paraHash = (text) => createHash('sha1').update(text).digest('hex').slice(0, 12);

async function main() {
  const args = process.argv.slice(2);
  const topic = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--chapters');
  const spec = args.includes('--chapters') ? args[args.indexOf('--chapters') + 1] : undefined;
  const dry = args.includes('--dry');
  if (!topic) {
    console.error('usage: npm run voice:longform -- <topic> [--chapters 0-1] [--dry]');
    process.exit(1);
  }
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key && !dry) {
    console.error('Set ELEVENLABS_API_KEY in the environment.');
    process.exit(1);
  }

  const script = parseLongform(topic);
  const dir = audioDir(topic);
  fs.mkdirSync(dir, { recursive: true });
  const paras = pickChapters(spec, script.chapters.length)
    .flatMap((c) => script.chapters[c].shots.flatMap((s) => s.paras))
    .map((p) => ({ ...p, text: spokenText(p.tts) }));
  const todo = paras.filter((p) => !fs.existsSync(path.join(dir, `${paraHash(p.text)}.json`)));
  const chars = todo.reduce((n, p) => n + p.text.length, 0);
  console.log(`${paras.length} paragraphs, ${todo.length} not voiced yet: ${chars} characters (${VOICE}, ${MODEL})`);
  if (dry) return;

  for (const [i, p] of todo.entries()) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({ text: p.text, model_id: MODEL, voice_settings: SETTINGS }),
    });
    if (!res.ok) throw new Error(`${res.status} from ElevenLabs: ${(await res.text()).slice(0, 300)}`);
    const json = await res.json();
    const id = paraHash(p.text);
    const mp3 = path.join(dir, `${id}.mp3`);
    fs.writeFileSync(mp3, Buffer.from(json.audio_base64, 'base64'));
    const seconds = Number(
      execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3]).toString(),
    );
    const a = json.alignment;
    fs.writeFileSync(
      path.join(dir, `${id}.json`),
      JSON.stringify({
        text: p.text,
        seconds,
        chars: a.characters.join(''),
        starts: a.character_start_times_seconds,
      }),
    );
    console.log(`  ${i + 1}/${todo.length} ${seconds.toFixed(1)}s  ${p.text.slice(0, 70)}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
