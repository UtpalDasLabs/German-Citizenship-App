#!/usr/bin/env node
/**
 * YouTube thumbnails (1280×720 PNG) for every lesson, in the channel's look:
 * a big German keyword, the English subtitle, the number of questions and the
 * map of Germany in the topic's colour (a state lesson lights up its state).
 * Files are numbered in upload order.
 *
 *   npm run thumbnails            writes out/thumbnails/NN-<topic>.png
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseLongform } from './longform.mjs';
import { preinstalledChrome } from './browser.mjs';

const VIDEO = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(VIDEO, 'out', 'thumbnails');
const FONTS = path.join(VIDEO, 'node_modules', '@fontsource');
const SVG = fs.readFileSync(path.join(VIDEO, 'node_modules', '@svg-maps', 'germany', 'germany.svg'), 'utf8');
const CHROME = preinstalledChrome();

const T = { constitution: '#2BB3F3', democracy: '#A472F0', institutions: '#0FA3B1', history: '#FF9F1C', law: '#FF4B4B', work: '#18B98A', society: '#F45D9C', europe: '#5B7CF5', states: '#4CC93F' };

/** Upload order, and what each thumbnail says. */
const LESSONS = [
  ['basic-rights', 'Grundrechte', 'Basic Rights', T.constitution],
  ['history-1', '1933–1945', 'Dictatorship, War & Remembrance', T.history, 1],
  ['state-nordrhein-westfalen'],
  ['democracy-1', 'Wahlen', 'How Germany Votes', T.democracy, 1],
  ['state-bayern'],
  ['europe', 'Europa', 'Europe & the EU', T.europe],
  ['state-baden-wuerttemberg'],
  ['history-2', 'Die Mauer', 'Zones, Two States & the Wall', T.history, 2],
  ['state-niedersachsen'],
  ['institutions', 'Der Staat', 'State & Institutions', T.institutions],
  ['state-hessen'],
  ['work', 'Arbeit', 'Work & Social Security', T.work],
  ['state-berlin'],
  ['history-3', '1989', 'The Wall Falls & Reunification', T.history, 3],
  ['state-sachsen'],
  ['law-1', 'Recht', 'The Rule of Law', T.law, 1],
  ['state-rheinland-pfalz'],
  ['society-1', 'Alltag', 'Family, School & Living Together', T.society, 1],
  ['state-schleswig-holstein'],
  ['democracy-2', 'Wahlen', 'Parties & the Bundestag', T.democracy, 2],
  ['state-brandenburg'],
  ['law-2', 'Recht', 'Courts & Everyday Law', T.law, 2],
  ['state-sachsen-anhalt'],
  ['society-2', 'Alltag', 'Flag, Faith & Festivals', T.society, 2],
  ['state-thueringen'],
  ['democracy-3', 'Wahlen', 'Government & the Bundesrat', T.democracy, 3],
  ['state-hamburg'],
  ['state-mecklenburg-vorpommern'],
  ['state-saarland'],
  ['state-bremen'],
];

const IDS = { 'Baden-Württemberg': 'bw', Bayern: 'by', Berlin: 'be', Brandenburg: 'bb', Bremen: 'hb', Hamburg: 'hh', Hessen: 'he', 'Mecklenburg-Vorpommern': 'mv', Niedersachsen: 'ni', 'Nordrhein-Westfalen': 'nw', 'Rheinland-Pfalz': 'rp', Saarland: 'sl', Sachsen: 'sn', 'Sachsen-Anhalt': 'st', 'Schleswig-Holstein': 'sh', Thüringen: 'th' };
const paths = [...SVG.matchAll(/<path[^>]*?id="(\w+)"[\s\S]*?d="([^"]+)"/g)].map((m) => ({ id: m[1], d: m[2] }));

function page({ big, sub, color, part, count, state }) {
  const lines = state && big.length > 11 && big.includes('-') ? [big.replace(/-.*/, '-'), big.replace(/^[^-]*-/, '')] : [big];
  const longest = Math.max(...lines.map((l) => l.length));
  const size = Math.min(150, Math.floor(700 / (0.58 * longest)));
  const lit = state ? IDS[state] : null;
  const map = paths
    .map(({ id, d }) => {
      const on = lit ? id === lit : true;
      const fill = lit ? (on ? color : '#252D3F') : `${color}40`;
      const stroke = lit ? (on ? '#ffffff' : '#131720') : color;
      return `<path id="p-${id}" d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${lit && on ? 3 : 1.6}" stroke-linejoin="round"/>`;
    })
    .join('');
  return `<!doctype html><html><head><meta charset=utf-8><style>
@font-face{font-family:Inter;font-weight:600;src:url(file://${FONTS}/inter/files/inter-latin-600-normal.woff2)}
@font-face{font-family:Inter;font-weight:800;src:url(file://${FONTS}/inter/files/inter-latin-800-normal.woff2)}
html,body{margin:0;width:1280px;height:720px;overflow:hidden;background:#131720;font-family:Inter,sans-serif;color:#F3F6FB}
.glow{position:absolute;inset:0;background:radial-gradient(ellipse 520px 420px at 1010px 360px,${color}33,transparent 70%)}
.flag{position:absolute;left:0;top:0;width:18px;height:720px;display:flex;flex-direction:column}.flag i{flex:1}
.k{position:absolute;left:70px;top:70px;font-weight:800;font-size:30px;letter-spacing:5px;color:#FFC63D}
.big{position:absolute;left:66px;top:150px;width:760px;font-weight:800;font-size:${size}px;line-height:.98;letter-spacing:-2px}
.sub{position:absolute;left:70px;bottom:150px;width:700px;font-weight:600;font-size:40px;line-height:1.2;color:#A3AFC2}
.pills{position:absolute;left:70px;bottom:62px;display:flex;gap:16px}
.pill{font-weight:800;font-size:32px;padding:10px 24px;border-radius:999px;background:${color};color:#0b0d12}
.pill.o{background:transparent;color:#F3F6FB;border:3px solid #F3F6FB}
svg{position:absolute;right:50px;top:40px;height:640px;overflow:visible}
</style></head><body><div class=glow></div>
<div class=flag><i style=background:#0b0d12></i><i style=background:#FF4B4B></i><i style=background:#FFC63D></i></div>
<div class=k>EINBÜRGERUNGSTEST</div>
<div class=big>${lines.join('<br>')}</div>
<div class=sub>${sub}</div>
<div class=pills><div class=pill>${count} ${state ? 'LANDESFRAGEN' : 'FRAGEN'}</div>${part ? `<div class="pill o">TEIL ${part}</div>` : ''}</div>
<svg id=map viewBox="0 0 586 793">${map}</svg>
${
  lit
    ? `<script>const b=document.getElementById('p-${lit}').getBBox();if(b.width<80){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',b.x+b.width/2);c.setAttribute('cy',b.y+b.height/2);c.setAttribute('r',34);c.setAttribute('fill','none');c.setAttribute('stroke','${color}');c.setAttribute('stroke-width',6);document.getElementById('map').appendChild(c)}</script>`
    : ''
}
</body></html>`;
}

fs.mkdirSync(OUT, { recursive: true });
LESSONS.forEach(([topic, big, sub, color, part], i) => {
  const script = parseLongform(topic);
  const count = script.meta.questions.length;
  const state = script.meta.state;
  const html = path.join(OUT, `${topic}.html`);
  fs.writeFileSync(
    html,
    page(state ? { big: state, sub: 'All 10 state questions & answers', color: T.states, count, state } : { big, sub, color, part, count }),
  );
  const png = path.join(OUT, `${String(i + 1).padStart(2, '0')}-${topic}.png`);
  execFileSync(CHROME, ['--no-sandbox', '--allow-file-access-from-files', '--hide-scrollbars', '--virtual-time-budget=2000', `--screenshot=${png}`, '--window-size=1280,720', `file://${html}`], { stdio: 'ignore' });
  fs.rmSync(html);
  console.log(path.basename(png));
});
