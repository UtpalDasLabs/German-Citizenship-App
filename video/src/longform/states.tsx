/**
 * Germany's sixteen states (@svg-maps/germany, CC BY 4.0).
 *
 *   > SCENE (states): what the viewer sees
 *   > Bayern, Berlin, …        states to light up, by German name
 *   > ALLE | 16 Bundesländer @ cue      all sixteen, with a caption
 *
 * A state lights up when the voice says its German name; otherwise when its
 * line's cue is spoken, or one after another. Lit states are labelled.
 */
import germany from '@svg-maps/germany';
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

import { C, FONT, GOLD } from '../lib/brand';
import { rise, SERIF } from './look';
import { findCue, screenLines, useShot } from './plan';

const MAP = germany as unknown as { viewBox: string; locations: { id: string; path: string }[] };

export const STATE_IDS: Record<string, string> = {
  'Baden-Württemberg': 'bw',
  Bayern: 'by',
  Berlin: 'be',
  Brandenburg: 'bb',
  Bremen: 'hb',
  Hamburg: 'hh',
  Hessen: 'he',
  Niedersachsen: 'ni',
  'Mecklenburg-Vorpommern': 'mv',
  'Nordrhein-Westfalen': 'nw',
  'Rheinland-Pfalz': 'rp',
  Saarland: 'sl',
  Sachsen: 'sn',
  'Sachsen-Anhalt': 'st',
  'Schleswig-Holstein': 'sh',
  Thüringen: 'th',
};

/** Centre of a state's largest outline, for its label. Paths use only relative m/z. */
function centre(path: string): [number, number] {
  const tokens = path.match(/[mz]|-?[\d.]+/gi) ?? [];
  let x = 0;
  let y = 0;
  let start: [number, number] = [0, 0];
  let best: [number, number][] = [];
  let current: [number, number][] = [];
  for (let i = 0; i < tokens.length; ) {
    const t = tokens[i];
    if (t === 'm' || t === 'M') {
      i++;
      x = t === 'm' ? x + Number(tokens[i]) : Number(tokens[i]);
      y = t === 'm' ? y + Number(tokens[i + 1]) : Number(tokens[i + 1]);
      i += 2;
      start = [x, y];
      current = [[x, y]];
    } else if (t === 'z' || t === 'Z') {
      i++;
      if (current.length > best.length) best = current;
      [x, y] = start;
    } else {
      x += Number(tokens[i]);
      y += Number(tokens[i + 1]);
      i += 2;
      current.push([x, y]);
    }
  }
  if (current.length > best.length) best = current;
  const xs = best.map((p) => p[0]);
  const ys = best.map((p) => p[1]);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
}
const CENTRES = Object.fromEntries(MAP.locations.map((l) => [l.id, centre(l.path)]));

/** Small states get their label beside them, with a short leader line. */
const OFFSET: Record<string, [number, number]> = {
  hb: [-70, 0],
  hh: [-75, -28],
  be: [60, 0],
  sl: [-55, 18],
};

export function StatesMap() {
  const shot = useShot();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = screenLines(shot, fps);

  const lit = new Map<string, number>();
  let caption: { text: string; at: number } | null = null;
  lines.forEach((line) => {
    const all = line.fields[0] === 'ALLE';
    const names = all ? Object.keys(STATE_IDS) : line.fields[0].split(/,\s*/);
    if (line.fields[1]) caption = { text: line.fields[1], at: line.at };
    names.forEach((name, i) => {
      const id = STATE_IDS[name];
      if (!id) throw new Error(`Unknown state "${name}"`);
      const spoken = findCue(shot, name, fps);
      lit.set(id, Math.min(lit.get(id) ?? Infinity, spoken ?? line.at + i * (all ? 3 : 10)));
    });
  });
  const c = caption as { text: string; at: number } | null;
  const nameOf = Object.fromEntries(Object.entries(STATE_IDS).map(([n, id]) => [id, n]));

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <svg viewBox={MAP.viewBox} style={{ position: 'absolute', left: 760, top: 40, height: 1000, overflow: 'visible' }}>
        {MAP.locations.map((l) => {
          const at = lit.get(l.id);
          const o = at == null ? 0 : rise(frame, at, 12);
          const fill = o > 0 ? `rgba(255, 198, 61, ${0.25 + 0.6 * o})` : C.surfaceAlt;
          return <path key={l.id} d={l.path} fill={fill} stroke={C.bg} strokeWidth={1.4} />;
        })}
        {MAP.locations.map((l) => {
          const at = lit.get(l.id);
          if (at == null) return null;
          const [x, y] = CENTRES[l.id];
          const [dx, dy] = OFFSET[l.id] ?? [0, 0];
          return (
            <g key={`label-${l.id}`} opacity={rise(frame, at, 10)}>
              {dx || dy ? <line x1={x} y1={y} x2={x + dx * 0.8} y2={y + dy * 0.8} stroke={C.text} strokeWidth={1} /> : null}
              <text
                x={x + dx}
                y={y + dy + 5}
                textAnchor={dx < 0 ? 'end' : dx > 0 ? 'start' : 'middle'}
                fontFamily={FONT}
                fontWeight={700}
                fontSize={19}
                fill={C.text}
                stroke={C.bg}
                strokeWidth={4.5}
                paintOrder="stroke"
              >
                {nameOf[l.id]}
              </text>
            </g>
          );
        })}
      </svg>
      {c ? (
        <div style={{ position: 'absolute', left: 140, top: 400, width: 560, opacity: rise(frame, c.at, 16) }}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 72, lineHeight: 1.1, color: C.text }}>{c.text}</div>
          <div style={{ width: 120 * rise(frame, c.at + 8, 14), height: 4, backgroundColor: GOLD, marginTop: 24 }} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
}
