#!/usr/bin/env node
/**
 * Video clips for the series videos: free stock footage from Pixabay, plus
 * clips made elsewhere (Kling) and kept as files. Listed per episode in
 * longform/<topic>.clips.json; each clip gets an id that scenes use exactly
 * like a photo id (a clip wins over a photo with the same id).
 *
 *   npm run clips -- logic-optimal-stopping                  download + trim + credits
 *   npm run clips -- --search "apartment viewing" [--min 8]  candidates, for choosing
 *
 * Pixabay needs PIXABAY_API_KEY (free: pixabay.com/api/docs, logged in).
 *   { "id": "carving", "source": "vecteezy", "vecteezyId": 86900413, "start": 0, "seconds": 6 }
 * Vecteezy needs VECTEEZY_API_KEY and VECTEEZY_ACCOUNT_ID; free files need the credit line.
 * Content License: free for commercial use, no attribution required; we
 * credit anyway. Every clip is cut to its useful part, scaled and cropped to
 * 1920×1080 at 30 fps, without sound.
 *
 * Manifest entries:
 *   { "id": "flat-walk", "source": "pixabay", "pixabayId": 123456, "start": 2, "seconds": 8, "scene": "…" }
 *   { "id": "cloak", "source": "file", "file": "kling/cloak.mp4", "credit": "Made with Kling AI", "scene": "…" }
 *     (file: relative to the private repo's clips/ folder, or an absolute path)
 *   "speed": 0.8 on any entry plays it slower, to cover a longer line without looping
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ffbin } from './ffbin.mjs';

const VIDEO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const FFMPEG = ffbin('ffmpeg');
const KEY = process.env.PIXABAY_API_KEY;
const CLIP_ROOT = process.env.SERIES_CLIPS_DIR ?? path.join(VIDEO, '..', '..', 'German-Citizenship-Videos', 'clips');
const args = process.argv.slice(2);

async function pixabay(params) {
  if (!KEY) throw new Error('Set PIXABAY_API_KEY (free at pixabay.com/api/docs).');
  const url = `https://pixabay.com/api/videos/?${new URLSearchParams({ key: KEY, safesearch: 'true', ...params })}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Pixabay ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

if (args[0] === '--search') {
  const q = args[1];
  const min = Number(args.includes('--min') ? args[args.indexOf('--min') + 1] : 5);
  const r = await pixabay({ q, per_page: '30', min_width: '1920' });
  for (const h of r.hits.filter((h) => h.duration >= min)) {
    console.log(`${h.id}\t${h.duration}s\t${h.videos.large.width}x${h.videos.large.height}\t${h.user}\t${h.tags}\t${h.videos.tiny.thumbnail ?? h.videos.large.thumbnail ?? ''}`);
  }
  process.exit(0);
}

const topic = args.find((a) => !a.startsWith('--'));
if (!topic) {
  console.error('usage: npm run clips -- <topic> | --search "<words>"');
  process.exit(1);
}
const manifestPath = path.join(VIDEO, 'longform', `${topic}.clips.json`);
if (!fs.existsSync(manifestPath)) {
  console.log(`${topic}: no clips listed; nothing to fetch.`);
  process.exit(0);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const out = path.join(VIDEO, 'out', 'clips', topic);
fs.mkdirSync(out, { recursive: true });

/** Cut, scale and crop to 1920×1080/30 fps, no sound; `speed` below 1 slows the clip down. */
function cut(src, dst, start = 0, seconds, speed = 1) {
  execFileSync(FFMPEG, [
    '-y', '-loglevel', 'error',
    ...(start ? ['-ss', String(start)] : []),
    // `seconds` of the source: a slowed clip comes out longer (seconds / speed).
    ...(seconds ? ['-t', String(seconds)] : []),
    '-i', src,
    '-vf', `${speed !== 1 ? `setpts=PTS/${speed},` : ''}scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fps=30,format=yuv420p`,
    '-an', '-c:v', 'libx264', '-crf', '19', '-preset', 'medium', '-movflags', '+faststart',
    dst,
  ]);
}

const length = (file) =>
  Number(execFileSync(ffbin('ffprobe'), ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString());

const durations = {};
const credits = [];
for (const c of manifest.clips) {
  const dst = path.join(out, `${c.id}.mp4`);
  if (!fs.existsSync(dst)) {
    if (c.source === 'pixabay') {
      const r = await pixabay({ id: String(c.pixabayId) });
      const hit = r.hits[0];
      if (!hit) throw new Error(`${c.id}: Pixabay video ${c.pixabayId} not found`);
      const raw = path.join(out, `${c.id}.raw.mp4`);
      const v = hit.videos.large.url ? hit.videos.large : hit.videos.medium;
      fs.writeFileSync(raw, Buffer.from(await (await fetch(v.url)).arrayBuffer()));
      cut(raw, dst, c.start, c.seconds, c.speed);
      fs.rmSync(raw);
      c.credit = `Video by ${hit.user} from Pixabay: ${hit.pageURL}`;
    } else if (c.source === 'vecteezy') {
      // VECTEEZY_API_KEY and VECTEEZY_ACCOUNT_ID come from the environment (see the private repo's SOURCES.md).
      const key = process.env.VECTEEZY_API_KEY;
      const account = process.env.VECTEEZY_ACCOUNT_ID;
      if (!key || !account) throw new Error('Set VECTEEZY_API_KEY and VECTEEZY_ACCOUNT_ID.');
      const api = `https://api.vecteezy.com/v2/${account}/resources/${c.vecteezyId}`;
      const auth = { headers: { Authorization: `Bearer ${key}` } };
      const info = await (await fetch(api, auth)).json();
      const types = (info.file_metadata?.available_file_types ?? []).map((t) => t.extension);
      const type = types.includes('mp4') ? 'mp4' : types[0] ?? 'mp4';
      const dl = await (await fetch(`${api}/download?file_type=${type}&size=medium`, auth)).json();
      if (!dl.url) throw new Error(`${c.id}: Vecteezy ${c.vecteezyId}: ${JSON.stringify(dl).slice(0, 200)}`);
      const raw = path.join(out, `${c.id}.raw.${type}`);
      fs.writeFileSync(raw, Buffer.from(await (await fetch(dl.url)).arrayBuffer()));
      cut(raw, dst, c.start, c.seconds, c.speed);
      fs.rmSync(raw);
      c.credit = `"${info.title ?? 'Video'}" from Vecteezy: https://www.vecteezy.com/video/${c.vecteezyId}`;
    } else if (c.source === 'veo' && !fs.existsSync(path.join(CLIP_ROOT, c.file))) {
      console.log(`${c.id}: not generated yet (npm run veo -- ${topic}); skipped`);
      continue;
    } else if (c.source === 'file' || c.source === 'veo') {
      cut(path.isAbsolute(c.file) ? c.file : path.join(CLIP_ROOT, c.file), dst, c.start, c.seconds, c.speed);
    } else {
      throw new Error(`${c.id}: unknown source "${c.source}"`);
    }
    console.log(`${c.id}: ${c.source}`);
  }
  durations[c.id] = length(dst);
  if (c.credit) credits.push(`• ${c.credit}`);
}
fs.writeFileSync(path.join(out, 'clips.json'), JSON.stringify(durations, null, 2) + '\n');
fs.writeFileSync(path.join(out, 'credits.txt'), credits.length ? `Video\n${credits.join('\n')}\n` : '');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`→ ${out}  (${Object.keys(durations).length} clips)`);
