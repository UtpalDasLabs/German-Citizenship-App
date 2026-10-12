#!/usr/bin/env node
/**
 * Posting plan for the citizenship question shorts: the order they go out in,
 * and Publer CSVs so a scheduler posts them to YouTube Shorts, TikTok and
 * Instagram Reels without a single form filled in by hand.
 *
 *   node scripts/shorts-posts.mjs                        plan from 2 Nov 2026, 12:00
 *   node scripts/shorts-posts.mjs --start 2026-11-02 --time 12:00
 *   node scripts/shorts-posts.mjs --skip 10              the first ten are posted
 *   node scripts/shorts-posts.mjs --every 5              import calendar in fives
 *                         (when the driving shorts share the free plan's queue)
 *   node scripts/shorts-posts.mjs --comment              with the app link as a
 *                         first comment (Publer's free plan refuses those on YouTube)
 *
 * Writes out/shorts/:
 *   order.txt               "001 72" per line: the file number of each short
 *   publer-all.csv          every short, one a day (needs a paid Publer plan)
 *   publer-from-NNN.csv     the same in fives (the free plan's CSV limit)
 *   import-calendar.txt     when to import which files
 *   captions/NNN-qID.txt    title, caption and first comment, for posting by hand
 *
 * Columns follow Publer's own template (publer-assets.s3.amazonaws.com/site/
 * CSV Template for Publer.csv). The video URLs are <media><NNN-qID>.mp4, so the
 * rendered files must be hosted there under the same names.
 */
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { QUESTIONS } from './beats.mjs';

const VIDEO = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(VIDEO, 'out', 'shorts');
const META = JSON.parse(readFileSync(join(VIDEO, '..', 'src/data/meta.json'), 'utf8'));

const APP = 'https://utpaldaslabs.github.io/German-Citizenship-App/';
const CHANNEL = 'Living in Deutschland';
const SERIES = ' | Einbürgerungstest';

const args = process.argv.slice(2);
const arg = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
const START = arg('--start', '2026-11-02');
const TIME = arg('--time', '12:00');
const SKIP = Number(arg('--skip', 0));
const EVERY = Number(arg('--every', 10));
const COMMENT = args.includes('--comment');
const MEDIA = arg('--media', 'https://github.com/UtpalDasLabs/German-Driving-/releases/download/citizenship-shorts/');

/** One hashtag per topic, in the words people search for. */
const TOPIC_TAG = {
  constitution: '#grundgesetz', democracy: '#wahlen', institutions: '#bundestag', history: '#deutschegeschichte',
  law: '#rechtsstaat', society: '#integration', europe: '#europa', work: '#arbeitenindeutschland',
};
const TAGS = '#einbürgerungstest #lebenindeutschland #germancitizenship #einbürgerung #livingingermany';
const stateTag = (state) => `#${state.toLowerCase().replace(/[^a-zäöüß]/g, '')}`;

/** Answers that change with each government: posted first, while they hold. */
const TIME_BOUND = [72, 75, 73];

/**
 * The order the shorts go out in. General questions take turns by topic, so
 * no two days look alike, pictures first in each topic (they stop the scroll
 * best). State questions take turns by state and are spread evenly between
 * them, about one day in three, so every state's viewers keep seeing theirs.
 */
export function postingOrder() {
  const byPicture = (a, b) => Number(Boolean(b.imageMode)) - Number(Boolean(a.imageMode)) || a.id - b.id;
  const turns = (groups) => {
    const queues = groups.filter((qs) => qs.length);
    const out = [];
    while (queues.some((qs) => qs.length)) for (const qs of queues) if (qs.length) out.push(qs.shift());
    return out;
  };
  const general = turns(Object.keys(META.topics).map((t) =>
    QUESTIONS.filter((q) => q.kind === 'general' && q.topic === t && !TIME_BOUND.includes(q.id)).sort(byPicture)));
  const states = turns([...new Set(QUESTIONS.filter((q) => q.state).map((q) => q.state))].sort().map((s) =>
    QUESTIONS.filter((q) => q.state === s).sort(byPicture)));
  // Even spread: each next short is whichever series is further behind its share.
  const total = general.length + states.length;
  const order = [];
  let g = 0;
  let s = 0;
  while (g + s < total) {
    const stateDue = s < states.length && (g >= general.length || (s + 1) / states.length <= (g + 1) / general.length);
    order.push(stateDue ? states[s++] : general[g++]);
  }
  // The time-bound ones on days 2, 5 and 8.
  TIME_BOUND.map((id) => QUESTIONS.find((q) => q.id === id)).forEach((q, i) => order.splice(1 + i * 3, 0, q));
  return order;
}

/** Cut at a word so title and suffix fit the 70 characters a phone shows. */
function fit(text, room) {
  const clean = text.replace(/\s*(\.\.\.|…)\s*$/, '').trim();
  const ended = /[?.]$/.test(clean) && clean === text.trim();
  if (clean.length <= room && ended) return clean;
  if (clean.length + 1 <= room) return `${clean}…`;
  const cut = clean.slice(0, room - 1).replace(/\s+\S*$/, '').replace(/[,;:]$/, '');
  return `${cut}…`;
}

function title(q) {
  const prefix = q.kind === 'state' ? `${q.state}: ` : '';
  return `${prefix}${fit(q.en.text, 70 - SERIES.length - prefix.length)}${SERIES}`;
}

function caption(q) {
  return [
    q.de.text,
    `${q.en.text} 🤔`,
    'A, B, C or D? Leave your guess in the comments, then watch to the end for the answer.',
    '',
    `All 460 official questions are free in the LID-test app, in German and English: ${APP}`,
    `Full lessons in English on YouTube: ${CHANNEL}.`,
    '',
    `${TAGS} ${q.state ? stateTag(q.state) : TOPIC_TAG[q.topic] ?? ''} #shorts`.replace(/\s+/g, ' ').trim(),
  ].join('\n');
}

const firstComment = () => `Practise all ${QUESTIONS.length} questions free, no account: ${APP}`;

const csvCell = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const HEADER = [
  'Date - Intl. format or prompt', 'Text', 'Link(s) - Separated by comma for FB carousels', 'Media URL(s) - Separated by comma',
  'Title - For the video, pin, PDF ..', 'Label(s) - Separated by comma', 'Alt text(s) - Separated by ||', 'Comment(s) - Separated by ||',
  'Pin board, FB album, or Google category', 'Post subtype - I.e. story, reel, PDF ..', 'CTA - For Facebook links or Google',
  'Reminder - For stories, reels, shorts, and TikToks',
];

if (import.meta.url === `file://${process.argv[1]}`) {
  const order = postingOrder();
  // Only this script's own files: rendered videos may sit beside them.
  rmSync(join(OUT, 'captions'), { recursive: true, force: true });
  mkdirSync(join(OUT, 'captions'), { recursive: true });
  for (const f of readdirSync(OUT)) if (/^publer-.*\.csv$/.test(f)) rmSync(join(OUT, f));

  const all = order.map((q, i) => {
    const n = String(i + 1).padStart(3, '0');
    const day = new Date(`${START}T00:00:00Z`);
    day.setUTCDate(day.getUTCDate() + i - SKIP);
    const date = `${day.toISOString().slice(0, 10)} ${TIME}`;
    const file = `${n}-q${q.id}.mp4`;
    return { n, q, cells: [date, caption(q), '', `${MEDIA}${file}`, title(q), 'citizenship-shorts', '', COMMENT ? firstComment() : '', '', 'reel', '', ''] };
  });
  // A title used more than once gets the question's number, so no two
  // shorts look alike in search results.
  const uses = {};
  for (const r of all) uses[r.cells[4]] = (uses[r.cells[4]] ?? 0) + 1;
  for (const r of all) {
    if (uses[r.cells[4]] < 2) continue;
    const tag = ` (Q${Number(r.n)})`;
    r.cells[4] = r.cells[4].length + tag.length <= 70 ? r.cells[4] + tag : r.cells[4].replace(SERIES, '') + tag;
  }
  for (const r of all) {
    writeFileSync(
      join(OUT, 'captions', `${r.n}-q${r.q.id}.txt`),
      `${r.cells[4]}\n\n${r.cells[1]}\n\nFirst comment:\n${firstComment()}\n\nPost on: ${r.cells[0]}\n`,
    );
  }
  const rows = all.slice(SKIP);

  const csv = (rs) => `${[HEADER, ...rs.map((r) => r.cells)].map((r) => r.map(csvCell).join(',')).join('\n')}\n`;
  writeFileSync(join(OUT, 'order.txt'), all.map((r) => `${r.n} ${r.q.id}`).join('\n') + '\n');
  writeFileSync(join(OUT, 'publer-all.csv'), csv(rows));
  for (let b = 0; b * 5 < rows.length; b++) {
    // Named by their first short's number, so a batch keeps its name whatever was skipped.
    writeFileSync(join(OUT, `publer-from-${rows[b * 5].n}.csv`), csv(rows.slice(b * 5, b * 5 + 5)));
  }
  // Publer's free plan holds 10 scheduled posts per account. Alone, this series
  // needs two files every ten days; sharing the queue with the driving shorts
  // (--every 5), one file every five days.
  const day = (r) => new Date(`${r.cells[0].slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const lines = [`Import calendar: on each date, before ${TIME}, import the file(s) in Publer`, '(Create -> Bulk Options -> CSV, all three accounts ticked, then Submit).', ''];
  for (let i = 0; i < rows.length; i += EVERY) {
    const group = rows.slice(i, i + EVERY);
    const files = group.filter((_, j) => j % 5 === 0).map((r) => `publer-from-${r.n}.csv`).join(' + ');
    lines.push(`${String(i / EVERY + 1).padStart(2)}. ${day(group[0])}   shorts ${group[0].n}-${group.at(-1).n}   ${files}`);
  }
  writeFileSync(join(OUT, 'import-calendar.txt'), `${lines.join('\n')}\n`);

  const longest = Math.max(...rows.map((r) => r.cells[4].length));
  console.log(`${rows.length} shorts, ${rows[0].cells[0]} to ${rows.at(-1).cells[0]}; longest title ${longest} characters. → ${OUT}`);
}
