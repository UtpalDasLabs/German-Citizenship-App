/**
 * Europe, drawn from Natural Earth (public domain) via world-atlas.
 *
 *   > SCENE (europe): what the viewer sees
 *   > Deutschland                          first line: home, in gold
 *   > Dänemark, Polen, Tschechien, …       countries to light up
 *   > EU27 | 27 Mitgliedstaaten @ cue       groups: EU27 and EWG6 expand
 *
 * A country lights up when the voice says its German name; otherwise when its
 * line's cue is spoken, or one after another. Lit countries are labelled.
 */
import { geoConicConformal, geoPath } from 'd3-geo';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { feature } from 'topojson-client';
import world from 'world-atlas/countries-50m.json';

import { alpha, C, FONT, GOLD } from '../lib/brand';
import { rise, SERIF } from './look';
import { findCue, screenLines, useShot } from './plan';

/** German name → ISO 3166 numeric code, as world-atlas uses. */
const CODES: Record<string, string> = {
  Deutschland: '276',
  Dänemark: '208',
  Polen: '616',
  Tschechien: '203',
  Österreich: '040',
  Schweiz: '756',
  Frankreich: '250',
  Luxemburg: '442',
  Belgien: '056',
  Niederlande: '528',
  Italien: '380',
  Spanien: '724',
  Portugal: '620',
  Griechenland: '300',
  Irland: '372',
  Schweden: '752',
  Finnland: '246',
  Estland: '233',
  Lettland: '428',
  Litauen: '440',
  Slowakei: '703',
  Slowenien: '705',
  Ungarn: '348',
  Kroatien: '191',
  Rumänien: '642',
  Bulgarien: '100',
  Zypern: '196',
  Malta: '470',
  Norwegen: '578',
  Großbritannien: '826',
};
const GROUPS: Record<string, string[]> = {
  // The six that signed the Treaties of Rome in 1957 (West Germany for Germany).
  EWG6: ['Belgien', 'Deutschland', 'Frankreich', 'Italien', 'Luxemburg', 'Niederlande'],
  // Members since 1 February 2020.
  EU27: [
    'Belgien', 'Bulgarien', 'Dänemark', 'Deutschland', 'Estland', 'Finnland', 'Frankreich', 'Griechenland', 'Irland',
    'Italien', 'Kroatien', 'Lettland', 'Litauen', 'Luxemburg', 'Malta', 'Niederlande', 'Österreich', 'Polen',
    'Portugal', 'Rumänien', 'Schweden', 'Slowakei', 'Slowenien', 'Spanien', 'Tschechien', 'Ungarn', 'Zypern',
  ],
};

type Country = Feature<Geometry, { name: string }>;
const COUNTRIES = (
  feature(world as never, (world as unknown as { objects: { countries: never } }).objects.countries) as unknown as FeatureCollection<
    Geometry,
    { name: string }
  >
).features as Country[];

const WIDTH = 1920;
const HEIGHT = 1080;

/** Frame the map on a box of [west, south, east, north] degrees. */
function useProjection(wide: boolean) {
  return useMemo(() => {
    const [w, s, e, n] = wide ? [-12, 34, 34, 66] : [-1, 44.5, 22, 57.5];
    const box: Feature = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'MultiPoint', coordinates: [[w, s], [e, s], [e, n], [w, n], [(w + e) / 2, n], [(w + e) / 2, s]] },
    };
    const projection = geoConicConformal()
      .parallels([45, 60])
      .rotate([-((w + e) / 2), 0])
      .fitExtent([[560, 40], [WIDTH - 40, HEIGHT - 40]], box);
    return geoPath(projection);
  }, [wide]);
}

export function EuropeMap() {
  const shot = useShot();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = screenLines(shot, fps);
  const [home, ...rest] = lines;
  const homeName = home?.fields[0] ?? 'Deutschland';

  // Every country to light, with the frame it lights at.
  const lit = new Map<string, number>();
  const labels: string[] = [];
  let caption: { text: string; at: number } | null = null;
  rest.forEach((line, li) => {
    const names = line.fields[0].split(/,\s*/).flatMap((n) => GROUPS[n] ?? [n]);
    if (line.fields[1]) caption = { text: line.fields[1], at: line.at };
    const grouped = line.fields[0].split(/,\s*/).some((n) => GROUPS[n]);
    names.forEach((name, i) => {
      if (!CODES[name]) throw new Error(`No map code for "${name}"`);
      const spoken = grouped ? null : findCue(shot, name, fps);
      lit.set(CODES[name], Math.min(lit.get(CODES[name]) ?? Infinity, spoken ?? line.at + i * (grouped ? 2 : 8) + li));
      if (!grouped) labels.push(name);
    });
  });
  const wide = rest.some((l) => /EU27|EWG6/.test(l.fields[0]));
  const path = useProjection(wide);
  const homeCode = CODES[homeName];
  const c = caption as { text: string; at: number } | null;

  return (
    <AbsoluteFill style={{ backgroundColor: '#0E1830' }}>
      <svg width={WIDTH} height={HEIGHT}>
        {COUNTRIES.map((f) => {
          const id = String(f.id);
          const at = lit.get(id);
          const o = at == null ? 0 : rise(frame, at, 12);
          const fill =
            id === homeCode ? GOLD : o > 0 ? `rgba(255, 198, 61, ${0.25 + 0.35 * o})` : C.surfaceAlt;
          const d = path(f);
          return d ? <path key={id} d={d} fill={fill} stroke="#0E1830" strokeWidth={1.2} /> : null;
        })}
        {labels.map((name) => {
          const f = COUNTRIES.find((x) => String(x.id) === CODES[name]);
          if (!f) return null;
          const [x, y] = path.centroid(f);
          const at = lit.get(CODES[name]) ?? 0;
          const o = rise(frame, at, 10);
          // France's centroid falls in the Atlantic once overseas territory counts; nudge onto the mainland.
          const [dx, dy] = name === 'Frankreich' ? [130, -110] : name === 'Norwegen' ? [-40, 60] : [0, 0];
          return (
            <g key={name} opacity={o} transform={`translate(${x + dx}, ${y + dy})`}>
              <text
                textAnchor="middle"
                fontFamily={FONT}
                fontWeight={700}
                fontSize={wide ? 20 : 30}
                fill={C.text}
                stroke="#0E1830"
                strokeWidth={6}
                paintOrder="stroke"
              >
                {name}
              </text>
            </g>
          );
        })}
      </svg>
      {c ? (
        <div style={{ position: 'absolute', left: 110, top: 380, width: 440, opacity: rise(frame, c.at, 16) }}>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 64, lineHeight: 1.1, color: C.text }}>{c.text}</div>
          <div style={{ width: 120 * rise(frame, c.at + 8, 14), height: 4, backgroundColor: GOLD, marginTop: 24 }} />
        </div>
      ) : null}
      <AbsoluteFill
        style={{
          background: `linear-gradient(90deg, #0E1830 0%, ${alpha('#0E1830', 0)} 30%)`,
          opacity: interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
