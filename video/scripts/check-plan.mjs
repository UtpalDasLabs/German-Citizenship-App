#!/usr/bin/env node
/**
 * Checks Publer CSVs before they are imported, one account at a time: list
 * every CSV that account already has scheduled, plus the new one.
 *
 *   npm run check:plan -- --account TikTok tiktok-2-per-day.csv fix.csv \
 *                         --account Instagram week-05.csv fix.csv
 *
 * Fails (exit 1) when, on one account:
 * - two posts share a time slot (the 1 Nov clash: a fix CSV imported to all
 *   three accounts at Instagram's times landed on TikTok's own posts);
 * - the same video goes out twice;
 * - a short asks about a press photo, which it can't show.
 * Rows before today are ignored (--from YYYY-MM-DD to change that). The live
 * schedule can still differ from the CSVs (posts deleted or moved in Publer),
 * so check the account in Publer too before importing.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { expectation, idOf } from './check-shorts.mjs';

const VIDEO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const raw = JSON.parse(fs.readFileSync(path.join(VIDEO, '..', 'src', 'data', 'questions.json'), 'utf8'));
const QUESTIONS = new Map((Array.isArray(raw) ? raw : raw.questions).map((q) => [q.id, q]));

/** Rows of a CSV file, honouring quoted cells with commas and line breaks. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') (cell += '"'), i++;
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') row.push(cell), (cell = '');
    else if (c === '\n') row.push(cell), rows.push(row), (row = []), (cell = '');
    else if (c !== '\r') cell += c;
  }
  if (cell || row.length) row.push(cell), rows.push(row);
  return rows;
}

const args = process.argv.slice(2);
const from = args.includes('--from') ? args[args.indexOf('--from') + 1] : new Date().toISOString().slice(0, 10);
const accounts = new Map();
let current = 'all accounts';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--from') i++;
  else if (args[i] === '--account') current = args[++i];
  else accounts.set(current, [...(accounts.get(current) ?? []), args[i]]);
}
if (accounts.size === 0) {
  console.error('Usage: npm run check:plan -- [--account NAME] file.csv ... [--account NAME file.csv ...]');
  process.exit(1);
}

let problems = 0;
const problem = (msg) => (problems++, console.log(`✗  ${msg}`));
for (const [account, files] of accounts) {
  const posts = files.flatMap((file) =>
    parseCsv(fs.readFileSync(file, 'utf8'))
      .slice(1)
      .filter((r) => /^\d{4}-\d\d-\d\d/.test(r[0] ?? '') && r[0].slice(0, 10) >= from)
      .map((r) => ({ when: r[0].trim(), video: path.basename((r[3] ?? '').split(',')[0]), title: (r[1] ?? '').split('\n')[0].slice(0, 50), file: path.basename(file) })),
  );
  const at = new Map();
  const seen = new Map();
  for (const p of posts) {
    if (at.has(p.when)) problem(`${account} ${p.when}: two posts in one slot: "${at.get(p.when).title}" (${at.get(p.when).file}) and "${p.title}" (${p.file})`);
    else at.set(p.when, p);
    if (p.video && seen.has(p.video)) problem(`${account}: ${p.video} goes out twice, ${seen.get(p.video)} and ${p.when}`);
    else if (p.video) seen.set(p.video, p.when);
    const id = idOf(p.video);
    if (id && QUESTIONS.has(id) && expectation(QUESTIONS.get(id)) === 'press-photo')
      problem(`${account} ${p.when}: ${p.video} is about a press photo the short can't show`);
  }
  console.log(`${account}: ${posts.length} posts from ${from} in ${files.length} file(s) checked`);
}
console.log(problems ? `\n${problems} problem(s).` : '\nNo clashes, repeats or press photos.');
process.exit(problems ? 1 : 0);
