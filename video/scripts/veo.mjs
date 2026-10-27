#!/usr/bin/env node
/**
 * Hero clips from Google's video models (Veo / omni) through the Gemini API.
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
 * VEO_MAX_CLIPS generations per topic (default 6, the creator's limit),
 * retakes included; every generation is logged in the private repo's
 * clips/veo/LOG.md. VEO_MODEL picks the model (default: the newest Veo the
 * key can use).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VIDEO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PRIVATE = path.join(VIDEO, '..', '..', 'German-Citizenship-Videos');
const CLIPS = path.join(PRIVATE, 'clips');
const KIT = path.join(PRIVATE, 'kit', 'characters');
const LOG = path.join(CLIPS, 'veo', 'LOG.md');
const API = 'https://generativelanguage.googleapis.com/v1beta';
const KEY = process.env.GEMINI_API_KEY;
const MAX = Number(process.env.VEO_MAX_CLIPS ?? 6);

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
const used = logText.split('\n').filter((l) => l.startsWith(`| `) && l.includes(`| ${topic} |`)).length;
console.log(`${topic}: ${todo.length} to generate, ${used} of ${MAX} already used for this topic.`);
for (const c of todo) console.log(`  ${c.id} (${c.seconds ?? 8} s)${c.reference ? `, reference ${c.reference}` : ''}`);
if (used + todo.length > MAX) throw new Error(`Over budget: ${used} used + ${todo.length} > ${MAX}. Ask the creator before going on.`);
if (dry || !todo.length) process.exit(0);

const model = process.env.VEO_MODEL ?? (await models()).map((m) => m.name.replace(/^models\//, '')).filter((n) => /veo/i.test(n)).sort().at(-1);
if (!model) throw new Error('No Veo model available to this key; run with --list.');
console.log(`model: ${model}`);

let log = logText;
for (const c of todo) {
  const instance = { prompt: c.prompt };
  if (c.reference) {
    const file = path.join(KIT, c.reference);
    instance.image = { bytesBase64Encoded: fs.readFileSync(file).toString('base64'), mimeType: 'image/png' };
  }
  const parameters = { aspectRatio: '16:9', ...(c.seconds ? { durationSeconds: c.seconds } : {}), ...(c.parameters ?? {}) };
  let result = 'ok';
  try {
    let op = await api(`${API}/models/${model}:predictLongRunning`, { method: 'POST', body: JSON.stringify({ instances: [instance], parameters }) });
    process.stdout.write(`${c.id}: generating`);
    while (!op.done) {
      await new Promise((r) => setTimeout(r, 10000));
      op = await api(`${API}/${op.name}`);
      process.stdout.write('.');
    }
    if (op.error) throw new Error(JSON.stringify(op.error));
    const samples = op.response?.generateVideoResponse?.generatedSamples ?? op.response?.generatedVideos ?? [];
    const uri = samples[0]?.video?.uri;
    if (!uri) throw new Error(`no video in ${JSON.stringify(op.response).slice(0, 300)}`);
    const res = await fetch(uri, { headers: { 'x-goog-api-key': KEY } });
    const dst = path.join(CLIPS, c.file);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.writeFileSync(dst, Buffer.from(await res.arrayBuffer()));
    console.log(` → ${dst}`);
  } catch (e) {
    result = `failed: ${String(e.message ?? e).slice(0, 120)}`;
    console.log(`\n${c.id}: ${result}`);
  }
  log += `| ${new Date().toISOString().slice(0, 16)} | ${topic} | ${c.id} | ${model} | ${c.seconds ?? 8} | ${result.replace(/\|/g, '/')} |\n`;
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.writeFileSync(LOG, log);
}
