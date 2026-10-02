#!/usr/bin/env node
/**
 * Keeps a voiced paragraph but drops its opening words, so a good take can
 * stay when only its first sentence has to go. No new voice is bought.
 *
 *   npm run take:trim -- <topic> "<words to start from>" [--expressive|--lively]
 *
 * Finds the one paragraph of the script containing the words, cuts its
 * audio just before them and saves it as the paragraph that starts there
 * (direction tags kept). Then change the script to match:
 *
 *   [dramatic] And it comes back in disguise. [[Wie wird …]]
 *   →  [dramatic] [[Wie wird …]]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseLongform } from './longform.mjs';
import { audioDir, paraHash, spokenText } from './voice-longform.mjs';

const FFMPEG = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'node_modules',
  '@remotion',
  'compositor-linux-x64-gnu',
  'ffmpeg',
);
/** Seconds of air left before the first kept word. */
const LEAD = 0.06;

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const [topic, from] = args;
if (!topic || !from) {
  console.error('usage: npm run take:trim -- <topic> "<words to start from>" [--expressive|--lively]');
  process.exit(1);
}
const dir = audioDir(topic);
const script = parseLongform(topic);
const paras = script.chapters
  .flatMap((c) => c.shots.flatMap((sh) => sh.paras.map((p) => spokenText(p.tts))))
  .filter((t) => t.includes(from));
if (paras.length !== 1) {
  console.error(`${paras.length} paragraphs of ${topic}.md contain "${from}"; need exactly one.`);
  process.exit(1);
}
const file = `${paraHash(paras[0])}.json`;
if (!fs.existsSync(path.join(dir, file))) {
  console.error(`That paragraph has not been voiced yet (${dir}).`);
  process.exit(1);
}
const take = { file, ...JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')) };
const at = take.text.indexOf(from);
const tags = take.text.match(/^(?:\[[a-z][a-z ,]*\]\s*)*/i)[0];
if (at < tags.length) {
  console.error('Nothing to cut: the words are at the start of the paragraph.');
  process.exit(1);
}
const cut = Math.max(take.starts[at - 1] ?? 0, take.starts[at] - LEAD);
const text = tags + take.text.slice(at);
const starts = [...tags].map(() => 0).concat(take.starts.slice(at).map((s) => +(s - cut).toFixed(3)));
const hash = paraHash(text);
execFileSync(FFMPEG, [
  '-y',
  '-loglevel',
  'error',
  '-ss',
  String(cut),
  '-i',
  path.join(dir, take.file.replace('.json', '.mp3')),
  '-c:a',
  'libmp3lame',
  '-q:a',
  '2',
  path.join(dir, `${hash}.mp3`),
]);
fs.writeFileSync(
  path.join(dir, `${hash}.json`),
  JSON.stringify({ text, seconds: +(take.seconds - cut).toFixed(6), chars: text, starts }),
);
console.log(`Cut ${cut.toFixed(2)}s off the take. In the script, the paragraph is now:\n  ${text}`);
