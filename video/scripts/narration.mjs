#!/usr/bin/env node
/**
 * Builds the narration for question shorts, without calling any voice service.
 *
 *   node scripts/narration.mjs 147 32 226     write scripts for these
 *   node scripts/narration.mjs all            every question, plus totals
 *
 * Per question, in video/out/narration/:
 *   <id>.txt   the script as a person reads it; German in [brackets]
 *   <id>.ssml  what a voice service is sent: English, with every German span
 *              wrapped in <lang xml:lang="de-DE"> so one voice switches to
 *              native German pronunciation for exactly those words
 *   <id>.json  the same, as segments per beat
 *
 * Each beat opens with an SSML <mark>. Services that report mark timings give
 * back where every beat starts in the audio, which is what lets the picture be
 * timed to the voice instead of the other way round.
 *
 * Totals are printed because character count is what every provider bills.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { QUESTIONS, scriptFor } from './beats.mjs';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'out', 'narration');

const args = process.argv.slice(2);
const ids = args.includes('all') ? QUESTIONS.map((q) => q.id) : args.map(Number);
if (ids.length === 0 || ids.some(Number.isNaN)) {
  console.error('Usage: node scripts/narration.mjs <id ...|all>');
  process.exit(1);
}

const xml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

function ssml(script) {
  const body = script.beats
    .map((b) => {
      const said = b.say.map((s) => (s.lang === 'de' ? `<lang xml:lang="de-DE">${xml(s.text)}</lang>` : xml(s.text))).join('');
      return `  <p><mark name="${b.name}"/>${said}</p>`;
    })
    .join('\n');
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">\n${body}\n</speak>\n`;
}

function readable(id, script) {
  const lines = script.beats.map(
    (b) => `${b.name.padEnd(15)}${b.say.map((s) => (s.lang === 'de' ? `[${s.text}]` : s.text)).join('')}`,
  );
  return `Question ${id} (${script.ref.label})\n\n${lines.join('\n')}\n`;
}

mkdirSync(OUT, { recursive: true });

let spoken = 0;
let german = 0;
let ssmlChars = 0;
let unmarkedWhy = 0;
for (const id of ids) {
  const script = scriptFor(id);
  const doc = ssml(script);
  const chars = script.beats.flatMap((b) => b.say).reduce((n, s) => n + s.text.length, 0);
  const de = script.beats.flatMap((b) => b.say).filter((s) => s.lang === 'de').reduce((n, s) => n + s.text.length, 0);
  spoken += chars;
  german += de;
  ssmlChars += doc.length;
  if (script.beats.some((b) => b.name === 'why' && !b.marked)) unmarkedWhy += 1;

  writeFileSync(join(OUT, `${id}.txt`), readable(id, script));
  writeFileSync(join(OUT, `${id}.ssml`), doc);
  writeFileSync(join(OUT, `${id}.json`), `${JSON.stringify({ id, ref: script.ref, beats: script.beats.map(({ name, say }) => ({ name, say })) }, null, 2)}\n`);
  if (ids.length <= 10) console.log(`  #${id}: ${chars} spoken characters (${de} German) → ${join(OUT, `${id}.ssml`)}`);
}

const avg = Math.round(spoken / ids.length);
console.log(`\n${ids.length} question(s): ${spoken.toLocaleString('en')} spoken characters, ${german.toLocaleString('en')} of them German.`);
console.log(`Average ${avg} per short. As SSML (if a provider counts the markup): ${ssmlChars.toLocaleString('en')}.`);
if (unmarkedWhy) {
  console.log(
    `\n${unmarkedWhy} of these use the app's long explanation cut to its first sentence, which has no German marked.` +
      '\nAny German in those would be read with an English accent. Before they are voiced, each needs a short line in' +
      '\nsrc/content/shortWhy.json with its German marked [[like this]].',
  );
}
