#!/usr/bin/env node
/**
 * YouTube thumbnails (1280×720 PNG) for the series videos: one of the
 * episode's own photos, three or four big words, and the series name in its
 * colour. Needs `npm run images -- <topic>` first.
 *
 *   npm run thumbnails:series          writes out/thumbnails/series-<topic>.png
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VIDEO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(VIDEO, 'out', 'thumbnails');
const FONTS = path.join(VIDEO, 'node_modules', '@fontsource');
const SERIES = JSON.parse(fs.readFileSync(path.join(VIDEO, 'longform', 'series.json'), 'utf8'));
const LOCAL_SHELL = path.join(
  VIDEO,
  'node_modules/.remotion/chrome-headless-shell/mac-arm64/chrome-headless-shell-mac-arm64/chrome-headless-shell',
);
const CHROME =
  process.env.REMOTION_BROWSER ??
  (fs.existsSync(LOCAL_SHELL) ? LOCAL_SHELL : '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');

/** What each thumbnail says: the photo, the big words (one line each), the accent word. */
const THUMBS = [
  { topic: 'hidden-martinstag', series: 'hidden', photo: 'lantern', side: true, lines: ['Why the', 'lanterns?'], accent: 'lanterns?', tag: '11 November · Martinstag' },
  { topic: 'logic-optimal-stopping', series: 'logic', doors: true, lines: ['The 37%', 'rule'], accent: '37%', tag: 'When to stop looking' },
  { topic: 'hidden-advent', series: 'hidden', photo: 'thumb-wheel', side: true, lines: ['It was a', 'wagon wheel'], accent: 'wheel', tag: 'The Advent wreath, explained' },
  { topic: 'logic-predicting', series: 'logic', photo: 'thumb-platform', side: true, lines: ['How long', 'will it last?'], accent: 'last?', tag: 'Predicting with almost no data' },
];

/** Look, then leap, as ten doors: four only looked at, the leap glowing. */
const doorsHtml = (color) =>
  `<div class=doors>${[0.5, 0.75, 0.4, 0.6, 0.55, 0.45, 0.95, 0.3, 0.3, 0.3]
    .map((h, i) => {
      const leap = i === 6;
      const look = i < 4;
      return `<div class=door style="border-color:${leap ? color : '#3A4459'};box-shadow:${leap ? `0 0 40px ${color}` : 'none'};opacity:${i > 6 ? 0.35 : 1}"><div style="height:${h * 100}%;background:${leap ? color : look ? '#6B7488' : '#8A93A6'}"></div></div>`;
    })
    .join('')}</div>`;

function page({ topic, series, photo, side, doors, lines, accent, tag }) {
  const color = SERIES[series].accent;
  const img = photo ? path.join(VIDEO, 'out', 'images', topic, `${photo}.jpg`) : '';
  const words = lines
    .map((l) => `<div>${l.split(accent).join(`<span style="color:${color}">${accent}</span>`)}</div>`)
    .join('');
  return `<!doctype html><html><head><meta charset=utf-8><style>
@font-face{font-family:Inter;font-weight:700;src:url(file://${FONTS}/inter/files/inter-latin-700-normal.woff2)}
@font-face{font-family:Inter;font-weight:800;src:url(file://${FONTS}/inter/files/inter-latin-800-normal.woff2)}
html,body{margin:0;width:1280px;height:720px;overflow:hidden;background:#0B0E14;font-family:Inter,sans-serif;color:#fff}
.photo{position:absolute;top:0;bottom:0;right:0;left:${side ? '42%' : '0'};background:url(file://${img}) center/cover;filter:saturate(1.1) contrast(1.05)}
.doors{position:absolute;right:60px;top:200px;display:flex;gap:14px;align-items:flex-end}
.door{width:44px;height:300px;border:3px solid;border-radius:8px;display:flex;align-items:flex-end;padding:6px;box-sizing:border-box;background:#1A2130}
.door div{width:100%;border-radius:4px}
.glow{position:absolute;inset:0;background:radial-gradient(ellipse 520px 420px at 1000px 360px,${color}2A,transparent 70%)}
.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,10,16,.92) 0%,rgba(8,10,16,.75) 38%,rgba(8,10,16,0) 70%)}
.words{position:absolute;left:64px;top:150px;font-weight:800;font-size:128px;line-height:1.02;letter-spacing:-2px;text-shadow:0 6px 30px rgba(0,0,0,.5)}
.tag{position:absolute;left:68px;bottom:150px;font-weight:700;font-size:38px;color:#E9EDF5}
.series{position:absolute;left:68px;bottom:70px;display:flex;align-items:center;gap:14px;font-weight:700;font-size:28px;letter-spacing:4px;text-transform:uppercase;color:${color}}
.dot{width:16px;height:16px;border-radius:8px;background:${color}}
</style></head><body>${photo ? '<div class=photo></div><div class=shade></div>' : '<div class=glow></div>'}${doors ? doorsHtml(color) : ''}
<div class=words>${words}</div><div class=tag>${tag}</div>
<div class=series><div class=dot></div>${SERIES[series].name}</div></body></html>`;
}

fs.mkdirSync(OUT, { recursive: true });
for (const t of THUMBS) {
  const html = path.join(OUT, `series-${t.topic}.html`);
  const png = path.join(OUT, `series-${t.topic}.png`);
  fs.writeFileSync(html, page(t));
  execFileSync(
    CHROME,
    ['--no-sandbox', '--allow-file-access-from-files', '--hide-scrollbars', '--virtual-time-budget=2000', `--screenshot=${png}`, '--window-size=1280,720', `file://${html}`],
    { stdio: 'ignore' },
  );
  fs.rmSync(html);
  console.log(`  ${png}`);
}
