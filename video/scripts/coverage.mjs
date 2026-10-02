#!/usr/bin/env node
/**
 * Does the series explain every question in the catalogue, exactly once?
 *
 *   npm run coverage
 *
 * Reads every episode script in longform/ and reports, per topic and per
 * state, how many questions have a {Q<id>} anchor. Fails if a question is
 * anchored twice, anchored to something that is not a question card, or
 * anchored in a script that does not list it in its front matter.
 */
import fs from 'node:fs';
import path from 'node:path';

import { LONGFORM_DIR, parseLongform } from './longform.mjs';

const root = path.resolve(LONGFORM_DIR, '..', '..');
const questions = JSON.parse(fs.readFileSync(path.join(root, 'src/data/questions.json'), 'utf8'));
const meta = JSON.parse(fs.readFileSync(path.join(root, 'src/data/meta.json'), 'utf8'));

const where = new Map();
const problems = [];
const episodes = fs
  .readdirSync(LONGFORM_DIR)
  .filter((f) => f.endsWith('.md') && fs.readFileSync(path.join(LONGFORM_DIR, f), 'utf8').startsWith('---'))
  .map((f) => f.replace(/\.md$/, ''));

for (const topic of episodes) {
  const script = parseLongform(topic);
  const anchored = [];
  for (const c of script.chapters) {
    for (const s of c.shots) {
      if (s.questions.length && s.key !== 'question') problems.push(`${topic}: {Q${s.questions}} sits on a "${s.key ?? 'storyboard'}" scene, not a question card`);
      for (const id of s.questions) {
        if (where.has(id)) problems.push(`#${id} is explained twice: ${where.get(id)} and ${topic}`);
        where.set(id, topic);
        anchored.push(id);
      }
    }
  }
  const listed = script.meta.questions ?? [];
  for (const id of anchored) if (!listed.includes(id)) problems.push(`${topic}: #${id} is anchored but not in the front matter`);
  for (const id of listed) if (!anchored.includes(id)) problems.push(`${topic}: #${id} is in the front matter but never anchored`);
}

const groups = new Map();
for (const q of questions) {
  const key = q.kind === 'state' ? `state: ${q.state}` : `${meta.topics[q.topic]?.label.en ?? q.topic}`;
  if (!groups.has(key)) groups.set(key, { total: 0, done: 0, eps: new Set() });
  const g = groups.get(key);
  g.total++;
  if (where.has(q.id)) {
    g.done++;
    g.eps.add(where.get(q.id));
  }
}

let done = 0;
for (const [key, g] of groups) {
  done += g.done;
  const bar = g.done === g.total ? 'done' : g.done ? 'partial' : '';
  console.log(`${key.padEnd(34)} ${String(g.done).padStart(3)}/${String(g.total).padEnd(3)} ${bar.padEnd(8)} ${[...g.eps].join(', ')}`);
}
console.log(`\n${done} of ${questions.length} questions explained in ${episodes.length} episode script(s).`);
if (problems.length) {
  console.error(`\n${problems.join('\n')}`);
  process.exit(1);
}
