#!/usr/bin/env node
/**
 * Thumbnail for Logic to Live By #3: a drawn doubling staircase that flattens
 * at the cap, and the three-word rule. No stock photo, so the shape of the
 * idea is the picture.
 *
 *   node scripts/thumb-backoff.mjs   writes out/thumbnails/series-logic-backoff.png
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

const topic = 'logic-backoff';
const series = SERIES.logic;
const color = series.accent;

// 1, 2, 4 … 60, capped, as bars in the series colour.
const waits = [1, 2, 4, 8, 16, 32, 60, 60, 60];
const MAX = 60;
const bars = waits
  .map((v, i) => {
    const capped = i >= 6;
    const h = 60 + (v / MAX) * 380;
    return `<div class=bar style="height:${h}px;background:${capped ? color : '#2E3748'};border-color:${capped ? color : '#3B4558'};box-shadow:${capped ? `0 0 34px ${color}66` : 'none'}"><span>${v}</span></div>`;
  })
  .join('');

const html = `<!doctype html><html><head><meta charset=utf-8><style>
@font-face{font-family:Inter;font-weight:700;src:url(file://${FONTS}/inter/files/inter-latin-700-normal.woff2)}
@font-face{font-family:Inter;font-weight:800;src:url(file://${FONTS}/inter/files/inter-latin-800-normal.woff2)}
html,body{margin:0;width:1280px;height:720px;overflow:hidden;background:#0B0E14;font-family:Inter,sans-serif;color:#fff}
.glow{position:absolute;inset:0;background:radial-gradient(ellipse 620px 520px at 1010px 400px,${color}22,transparent 68%)}
.rule{position:absolute;left:52px;right:52px;top:0;height:6px;background:${color}}
.kicker{position:absolute;left:64px;top:74px;font-weight:700;font-size:25px;letter-spacing:5px;text-transform:uppercase;color:${color}}
.words{position:absolute;left:60px;top:150px;font-weight:800;font-size:116px;line-height:.98;letter-spacing:-3px}
.words div{text-shadow:0 6px 30px rgba(0,0,0,.45)}
.tag{position:absolute;left:64px;bottom:136px;font-weight:700;font-size:36px;color:#E9EDF5;max-width:610px;line-height:1.18}
.series{position:absolute;left:64px;bottom:70px;display:flex;align-items:center;gap:14px;font-weight:700;font-size:26px;letter-spacing:4px;text-transform:uppercase;color:${color}}
.dot{width:16px;height:16px;border-radius:8px;background:${color}}
.chart{position:absolute;right:54px;bottom:150px;width:520px;display:flex;align-items:flex-end;gap:12px}
.bar{flex:1;border:2px solid;border-radius:8px 8px 4px 4px;position:relative;box-sizing:border-box}
.bar span{position:absolute;top:-30px;width:100%;text-align:center;font-weight:800;font-size:20px;color:#AEB7C8}
.axis{position:absolute;right:54px;bottom:142px;width:520px;height:3px;background:#4A5468}
.capline{position:absolute;right:54px;bottom:528px;width:520px;border-top:3px dashed ${color}}
.cap{position:absolute;left:520px;bottom:540px;width:170px;text-align:right;font-weight:800;font-size:22px;color:${color}}
</style></head><body>
<div class=glow></div><div class=rule></div>
<div class=kicker>Logic to Live By · Episode 3</div>
<div class=words><div>DOUBLE.</div><div>CAP.</div><div style="color:${color}">STOP.</div></div>
<div class=tag>Why retrying faster<br>makes it worse</div>
<div class=series><div class=dot></div>${series.name}</div>
<div class=chart>${bars}</div><div class=axis></div>
<div class=capline></div><div class=cap>ceiling · 60 s</div>
</body></html>`;

fs.mkdirSync(OUT, { recursive: true });
const file = path.join(OUT, `series-${topic}.html`);
const png = path.join(OUT, `series-${topic}.png`);
fs.writeFileSync(file, html);
execFileSync(
  CHROME,
  ['--no-sandbox', '--allow-file-access-from-files', '--hide-scrollbars', '--virtual-time-budget=2000', `--screenshot=${png}`, '--window-size=1280,720', `file://${file}`],
  { stdio: 'ignore' },
);
fs.rmSync(file);
console.log(`  ${png}`);
