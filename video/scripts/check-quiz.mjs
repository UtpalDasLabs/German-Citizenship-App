#!/usr/bin/env node
/**
 * Checks every exam question in a script works as a quiz moment, before any
 * voice is bought: a [countdown] paragraph, no option read out before it (it
 * would be ruled out on screen), and the answer said in German right after
 * the countdown, so the card turns green on time.
 *
 *   npm run check:quiz -- <topic>
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseLongform } from './longform.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(here, '..', '..', 'src', 'data', 'questions.json'), 'utf8'));
const all = data.questions ?? data;
const norm = (s) =>
  s
    .replace(/­/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N} ]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

const topic = process.argv[2];
if (!topic) {
  console.error('usage: npm run check:quiz -- <topic>');
  process.exit(1);
}
let bad = 0;
for (const ch of parseLongform(topic).chapters)
  for (const sh of ch.shots) {
    if (sh.key !== 'question') continue;
    const q = all.find((x) => x.id === sh.questions[0]);
    const ci = sh.paras.findIndex((p) => p.tags.includes('countdown'));
    const problems = [];
    if (ci < 0) problems.push('no [countdown] paragraph');
    else {
      const before = sh.paras.slice(0, ci).flatMap((p) => p.de.map((d) => norm(d.text)));
      for (const [l, o] of Object.entries(q.de.options)) if (before.includes(norm(o))) problems.push(`option ${l} said before the countdown`);
      const answer = norm(q.de.options[q.answer]);
      const revealCue = sh.screen.some((l) => l.startsWith('@ '));
      if (!revealCue && !sh.paras[ci].de.some((d) => norm(d.text) === answer))
        problems.push(`answer [[${q.de.options[q.answer]}]] not said after the countdown`);
    }
    if (problems.length) {
      bad++;
      console.log(`Q${q.id} (${ch.title}): ${problems.join('; ')}`);
    }
  }
console.log(bad ? `${bad} question(s) to fix` : 'Every question is a working quiz moment.');
process.exit(bad ? 1 : 0);
