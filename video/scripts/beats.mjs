/**
 * The timed beat list for one question, for Node scripts. Reuses the same
 * script module the video does, so stills land on the beats the video has.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildScript } from '../src/lib/script.mjs';

const VIDEO = join(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = join(VIDEO, '..');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));

export const QUESTIONS = json(join(ROOT, 'src/data/questions.json'));
export const TERMS = json(join(ROOT, 'src/data/keyTerms.json'));
export const WHY = json(join(VIDEO, 'src/content/shortWhy.json'));

export function scriptFor(id) {
  const q = QUESTIONS.find((x) => x.id === id);
  if (!q) throw new Error(`There is no question ${id} in the catalogue.`);
  return buildScript(q, TERMS[String(id)], WHY[String(id)]);
}

export async function load(id, fps) {
  let at = 0;
  return scriptFor(id).beats.map((b, index) => {
    const frames = Math.round(b.seconds * fps);
    const timed = { ...b, index, from: at, frames };
    at += frames;
    return timed;
  });
}
