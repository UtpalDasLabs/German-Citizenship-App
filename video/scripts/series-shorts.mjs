#!/usr/bin/env node
/**
 * Writes one script per vertical short from a series video's own script, as
 * listed in longform/<topic>.shorts.json:
 *
 *   { "shorts": [ { "id": "1", "hook": "On-screen hook",
 *                   "spoken": "What the voice says first", "paragraphs": [7, 8, 9] } ] }
 *
 * Each short is the spoken hook, the chosen paragraphs (word for word, with
 * their scenes, so their takes are copied from the long video and cost
 * nothing) and one closing line shared by every short. Then:
 *
 *   npm run shorts:series -- logic-optimal-stopping
 *   npm run voice:longform -- logic-optimal-stopping--short-1 --expressive
 *   npm run render:longform -- logic-optimal-stopping--short-1 --short --lively --expressive
 */
import fs from 'node:fs';
import path from 'node:path';

import { LONGFORM_DIR } from './longform.mjs';

const CLOSING = '[calm] The full story is in the video on this channel.';

const topic = process.argv[2];
if (!topic) {
  console.error('usage: npm run shorts:series -- <topic>');
  process.exit(1);
}
const src = fs.readFileSync(path.join(LONGFORM_DIR, `${topic}.md`), 'utf8');
const [, front, body] = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
const meta = Object.fromEntries(
  front.split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]),
);

// Every narration paragraph, with the scene it plays under.
const paras = [];
let scene = null;
for (const block of body.replace(/<!--[\s\S]*?-->/g, '').split(/\n\s*\n/)) {
  const t = block.trim();
  if (!t || t.startsWith('#')) continue;
  if (t.startsWith('> SCENE')) scene = t;
  else if (!t.startsWith('>')) paras.push({ text: t, scene });
}

const { shorts } = JSON.parse(fs.readFileSync(path.join(LONGFORM_DIR, `${topic}.shorts.json`), 'utf8'));
for (const s of shorts) {
  const picked = s.paragraphs.map((i) => {
    if (!paras[i]) throw new Error(`short ${s.id}: no paragraph ${i} in ${topic}`);
    return paras[i];
  });
  const out = [
    '---',
    `title: "${s.hook}"`,
    `series: ${meta.series}`,
    `voice: ${meta.voice}`,
    ...(meta.stability ? [`stability: ${meta.stability}`] : []),
    `media: ${topic}`,
    `hook: "${s.hook}"`,
    `parent: ${meta.title}`,
    'questions: []',
    '---',
    '',
    `<!-- Short ${s.id} of ${topic}, written by scripts/series-shorts.mjs from ${topic}.shorts.json. Edit those, not this. -->`,
    '',
    '## Short',
    '',
    picked[0].scene,
    '',
    `[calm] ${s.spoken}`,
    '',
  ];
  let last = picked[0].scene;
  for (const p of picked) {
    if (p.scene !== last) out.push(p.scene, '');
    out.push(p.text, '');
    last = p.scene;
  }
  out.push(CLOSING, '');
  const file = path.join(LONGFORM_DIR, `${topic}--short-${s.id}.md`);
  fs.writeFileSync(file, out.join('\n'));
  console.log(`  ${path.basename(file)}: ${s.hook}`);
}
