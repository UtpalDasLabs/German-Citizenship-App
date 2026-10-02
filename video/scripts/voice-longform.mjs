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
 * Audio is cached by voice, model and the exact paragraph text: re-running
 * after editing one sentence pays only for the paragraph that changed.
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
export const MODEL = process.env.ELEVENLABS_MODEL ?? 'eleven_v4';

export const audioDir = (topic) => path.join(root, 'out', 'audio', 'longform', topic, `${VOICE}-${MODEL}`);
export const paraHash = (tts) => createHash('sha1').update(tts).digest('hex').slice(0, 12);

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
  const paras = pickChapters(spec, script.chapters.length).flatMap((c) => script.chapters[c].shots.flatMap((s) => s.paras));
  const todo = paras.filter((p) => !fs.existsSync(path.join(dir, `${paraHash(p.tts)}.json`)));
  const chars = todo.reduce((n, p) => n + p.tts.length, 0);
  console.log(`${paras.length} paragraphs, ${todo.length} not voiced yet: ${chars} characters (${VOICE}, ${MODEL})`);
  if (dry) return;

  for (const [i, p] of todo.entries()) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}/with-timestamps?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({ text: p.tts, model_id: MODEL }),
    });
    if (!res.ok) throw new Error(`${res.status} from ElevenLabs: ${(await res.text()).slice(0, 300)}`);
    const json = await res.json();
    const id = paraHash(p.tts);
    const mp3 = path.join(dir, `${id}.mp3`);
    fs.writeFileSync(mp3, Buffer.from(json.audio_base64, 'base64'));
    const seconds = Number(
      execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp3]).toString(),
    );
    const a = json.alignment;
    fs.writeFileSync(
      path.join(dir, `${id}.json`),
      JSON.stringify({
        tts: p.tts,
        seconds,
        chars: a.characters.join(''),
        starts: a.character_start_times_seconds,
      }),
    );
    console.log(`  ${i + 1}/${todo.length} ${seconds.toFixed(1)}s  ${p.tts.slice(0, 70)}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
