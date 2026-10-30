#!/usr/bin/env node
/**
 * Hero clips from Google's video model (Gemini Omni; Veo's old endpoint was
 * retired) through the Gemini API's Interactions endpoint.
 * Clips are listed in longform/<topic>.clips.json as
 *
 *   { "id": "noah-doorbell", "source": "veo", "file": "veo/halloween/noah-doorbell.mp4",
 *     "prompt": "…", "reference": "noah/reference/noah-costume-white.png", "seconds": 8,
 *     "credit": "Made with Google Veo" }
 *
 * and generated into the private repo's clips/ folder, where `npm run clips`
 * picks them up like any other file clip.
 *
 *   npm run veo -- hidden-halloween --list           models available to the key
 *   npm run veo -- hidden-halloween --dry            what would be generated, and the budget
 *   npm run veo -- hidden-halloween --only noah-doorbell
 *   npm run veo -- hidden-halloween                  every veo clip not generated yet
 *
 * Needs GEMINI_API_KEY in the environment (never in a file). Budget: at most
 * as many as the script needs (the creator approves the count first);
 * VEO_MAX_CLIPS sets an optional cap per topic, retakes included; every generation is logged in the private repo's
 * clips/veo/LOG.md. VEO_MODEL picks the model (default: the newest Veo the
 * key can use).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import { ffbin } from './ffbin.mjs';

const FFMPEG = ffbin('ffmpeg');

const VIDEO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PRIVATE = path.join(VIDEO, '..', '..', 'German-Citizenship-Videos');
const CLIPS = path.join(PRIVATE, 'clips');
const KIT = path.join(PRIVATE, 'kit', 'characters');
const LOG = path.join(CLIPS, 'veo', 'LOG.md');
const API = 'https://generativelanguage.googleapis.com/v1beta';
const KEY = process.env.GEMINI_API_KEY;
const MAX = Number(process.env.VEO_MAX_CLIPS ?? Infinity);

const args = process.argv.slice(2);
const topic = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--only');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const dry = args.includes('--dry');
if (!topic) {
  console.error('usage: npm run veo -- <topic> [--list] [--dry] [--only <clip id>]');
  process.exit(1);
}
if (!KEY && !dry) throw new Error('Set GEMINI_API_KEY in the environment settings.');
const headers = { 'x-goog-api-key': KEY ?? '', 'Content-Type': 'application/json' };

async function api(url, init) {
  const res = await fetch(url, { ...init, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(body).slice(0, 400)}`);
  return body;
}

async function models() {
  const r = await api(`${API}/models?pageSize=200`);
  return (r.models ?? []).filter((m) => (m.supportedGenerationMethods ?? []).some((g) => /predictLongRunning/i.test(g)) || /veo|omni|video/i.test(m.name));
}

if (args.includes('--list')) {
  for (const m of await models()) console.log(m.name, '·', m.displayName ?? '', '·', (m.supportedGenerationMethods ?? []).join(','));
  process.exit(0);
}

const manifestPath = path.join(VIDEO, 'longform', `${topic}.clips.json`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const todo = manifest.clips.filter((c) => c.source === 'veo' && (!only || c.id === only) && (only || !fs.existsSync(path.join(CLIPS, c.file))));
const logText = fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8') : '# Veo generations\n\n| When | Topic | Clip | Model | Seconds | Result |\n|---|---|---|---|---|---|\n';
const used = logText.split('\n').filter((l) => l.startsWith(`| `) && l.includes(`| ${topic} |`) && !l.includes('| failed')).length;
console.log(`${topic}: ${todo.length} to generate, ${used} already used for this topic${Number.isFinite(MAX) ? ` (cap ${MAX})` : ""}.`);
for (const c of todo) console.log(`  ${c.id} (${c.seconds ?? 8} s)${c.reference ? `, reference ${c.reference}` : ''}`);
if (used + todo.length > MAX) throw new Error(`Over budget: ${used} used + ${todo.length} > ${MAX}. Ask the creator before going on.`);
if (dry || !todo.length) process.exit(0);

// Veo models are often missing from the model list, so the default is named.
const model = process.env.VEO_MODEL ?? 'gemini-omni-1.1-flash';
if (!model) throw new Error('No Veo model available to this key; run with --list.');
console.log(`model: ${model}`);

let log = logText;
for (const c of todo) {
  // Gemini Omni through the Interactions API (Veo's predictLongRunning endpoint was retired, Oct 2026).
  const input = [];
  // `referenceFrom`: a frame of an earlier clip of this episode keeps its character the same.
  if (c.referenceFrom && !c.reference) {
    const src = manifest.clips.find((x) => x.id === c.referenceFrom);
    const png = path.join(CLIPS, 'veo', 'references', `${c.referenceFrom}.png`);
    if (src && fs.existsSync(path.join(CLIPS, src.file)) && !fs.existsSync(png))
      execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-ss', String(c.referenceAt ?? 2), '-i', path.join(CLIPS, src.file), '-frames:v', '1', png]);
    if (fs.existsSync(png)) input.push({ type: 'image', data: fs.readFileSync(png).toString('base64'), mime_type: 'image/png' });
    else throw new Error(`${c.id}: generate ${c.referenceFrom} first`);
  }
  if (c.reference) {
    const file = path.join(KIT, c.reference);
    input.push({ type: 'image', data: fs.readFileSync(file).toString('base64'), mime_type: 'image/png' });
  }
  const look = c.reference || c.referenceFrom ? ' The character must look exactly like the person in this reference image (same face, hair, clothes and costume), drawn in the same flat 2D cartoon style.' : '';
  input.push({ type: 'text', text: `Create one ${c.seconds ?? 8}-second video, 16:9 landscape, no on-screen text, no speech.${look} ${c.prompt}` });
  let result = 'ok';
  try {
    process.stdout.write(`${c.id}: generating… `);
    let it = await api(`${API}/interactions`, { method: 'POST', body: JSON.stringify({ model, response_modalities: ['video'], input }) });
    while (it.status && !['completed', 'failed', 'cancelled'].includes(it.status)) {
      await new Promise((r) => setTimeout(r, 10000));
      it = await api(`${API}/interactions/${it.id}`);
    }
    const video = (it.steps ?? []).flatMap((s) => s.content ?? []).find((p) => p.type === 'video');
    if (!video?.data) throw new Error(`no video (${it.status}): ${JSON.stringify(it).slice(0, 200)}`);
    const dst = path.join(CLIPS, c.file);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, Buffer.from(video.data, 'base64'));
    result = `ok, ${it.usage?.total_output_tokens ?? '?'} output tokens`;
    console.log(`→ ${dst}`);
  } catch (e) {
    result = `failed: ${String(e.message ?? e).slice(0, 120)}`;
    console.log(`\n${c.id}: ${result}`);
  }
  log += `| ${new Date().toISOString().slice(0, 16)} | ${topic} | ${c.id} | ${model} | ${c.seconds ?? 8} | ${result.replace(/\|/g, '/')} |\n`;
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.writeFileSync(LOG, log);
}
