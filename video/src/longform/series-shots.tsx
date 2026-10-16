/**
 * Scenes for the series videos (Logic to Live By, Hidden Deutschland), after
 * the reference videos the creator picked: full-colour pictures with a key
 * line set low on the frame, location cards, a quiet chapter label that
 * stays up for the whole chapter, and diagrams that build in time with the
 * voice.
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import { alpha, C, FONT } from '../lib/brand';
import { Grain, Photo, rise, SERIF, Vignette } from './look';
import { cue, screenLines, useShot } from './plan';
import { useAccent } from './series';

function useFields(): { fields: string[]; at: number }[] {
  const shot = useShot();
  const { fps } = useVideoConfig();
  const lines = screenLines(shot, fps);
  if (lines.length === 0) throw new Error(`Scene "${shot.key}" needs "> …" lines under it: ${shot.scene}`);
  return lines;
}

/** A full-colour picture with a slow push, grain and a soft vignette. */
function Picture({ topic, id }: { topic: string; id: string }) {
  return (
    <AbsoluteFill>
      <Photo src={`images/${topic}/${id}.jpg`} color from={{ x: 0.5, y: 0.5, scale: 1.02 }} to={{ x: 0.5, y: 0.48, scale: 1.12 }} />
      <Vignette strength={0.55} />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
}

/**
 * `image-id | The line` or just `The line`: the video's key sentence, low on
 * the frame over a picture, or large on its own. Appears when it is spoken
 * (`@ cue`), else straight away.
 */
export function Line({ topic }: { topic: string }) {
  const frame = useCurrentFrame();
  const accent = useAccent();
  const [{ fields, at }] = useFields();
  const [id, text] = fields.length > 1 ? fields : [null, fields[0]];
  const o = rise(frame, at, 16);
  if (!id) {
    return (
      <AbsoluteFill style={{ backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, ${alpha(accent, 0.1)} 0%, ${alpha(accent, 0)} 60%)` }} />
        <div style={{ width: 1400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: text.length > 50 ? 78 : 96,
              lineHeight: 1.15,
              color: C.text,
              textAlign: 'center',
              opacity: o,
              transform: `translateY(${(1 - o) * 18}px)`,
            }}
          >
            {text}
          </div>
          <div style={{ width: 140 * o, height: 4, borderRadius: 2, backgroundColor: accent }} />
        </div>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <Picture topic={topic} id={id} />
      <AbsoluteFill style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 32%, rgba(0,0,0,0) 55%)', opacity: o }} />
      <div
        style={{
          position: 'absolute',
          left: 120,
          right: 120,
          bottom: 110,
          display: 'flex',
          gap: 28,
          alignItems: 'stretch',
          opacity: o,
          transform: `translateY(${(1 - o) * 14}px)`,
        }}
      >
        <div style={{ width: 6, borderRadius: 3, backgroundColor: accent }} />
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 60, lineHeight: 1.18, color: '#FFFFFF', textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}>
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
}

/** The key sentence, low on the frame over a picture or clip, in the series colour. */
export function KeyLine({ text, at = 8 }: { text: string; at?: number }) {
  const frame = useCurrentFrame();
  const accent = useAccent();
  const o = rise(frame, at, 16);
  return (
    <>
      <AbsoluteFill style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 32%, rgba(0,0,0,0) 55%)', opacity: o }} />
      <div style={{ position: 'absolute', left: 120, right: 120, bottom: 110, display: 'flex', gap: 28, alignItems: 'stretch', opacity: o, transform: `translateY(${(1 - o) * 14}px)` }}>
        <div style={{ width: 6, borderRadius: 3, backgroundColor: accent }} />
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 60, lineHeight: 1.18, color: '#FFFFFF', textShadow: '0 2px 24px rgba(0,0,0,0.5)' }}>{text}</div>
      </div>
    </>
  );
}

/** `image-id | PLACE, REGION | a short note`: a location card over a picture. */
export function Place({ topic }: { topic: string }) {
  const frame = useCurrentFrame();
  const accent = useAccent();
  const [{ fields }] = useFields();
  const [id, place, note] = fields;
  const o = rise(frame, 10, 22);
  return (
    <AbsoluteFill>
      <Picture topic={topic} id={id} />
      <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${0.28 * o})` }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 26 }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: place.length > 26 ? 80 : place.length > 18 ? 96 : 116,
            letterSpacing: 10 * o,
            color: '#FFFFFF',
            textTransform: 'uppercase',
            textShadow: '0 4px 40px rgba(0,0,0,0.55)',
            opacity: o,
          }}
        >
          {place}
        </div>
        <div style={{ width: 220 * o, height: 4, borderRadius: 2, backgroundColor: accent }} />
        {note ? (
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 38, color: '#F2EEE6', textShadow: '0 2px 20px rgba(0,0,0,0.6)', opacity: rise(frame, 24, 18) }}>
            {note}
          </div>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

/** The chapter's name in a small pill, top left, for the whole chapter. */
export function SeriesPill({ title }: { title: string }) {
  const frame = useCurrentFrame();
  const accent = useAccent();
  const o = rise(frame, 6, 16);
  return (
    <div
      style={{
        position: 'absolute',
        left: 64,
        top: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 26px 12px 20px',
        borderRadius: 999,
        backgroundColor: 'rgba(16,20,28,0.55)',
        border: '1.5px solid rgba(255,255,255,0.16)',
        backdropFilter: 'blur(10px)',
        opacity: o,
        transform: `translateX(${(1 - o) * -12}px)`,
      }}
    >
      <div style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: accent }} />
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 28, color: '#F4F6FA' }}>{title}</div>
    </div>
  );
}

/**
 * Look, then leap: twenty doors open one by one. The first 37% are only
 * looked at; after that, the first one better than all of them is taken.
 */
const SCORES = [0.42, 0.61, 0.35, 0.74, 0.5, 0.28, 0.66, 0.58, 0.7, 0.45, 0.91, 0.63, 0.55, 0.8, 0.38, 0.72, 0.49, 0.6, 0.67, 0.52];
const LOOK = Math.round(SCORES.length / Math.E); // 7 of 20
const BAR = Math.max(...SCORES.slice(0, LOOK));
const LEAP = SCORES.findIndex((s, i) => i >= LOOK && s > BAR);

export function Stopping() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  // Doors open across the first two thirds of the shot, up to the leap.
  const step = Math.max(6, Math.round((shot.frames * 0.62) / (LEAP + 1)));
  const opened = (i: number) => rise(frame, 20 + i * step, 10);
  const leapAt = 20 + LEAP * step + 10;
  const leap = rise(frame, leapAt, 14);
  const bestSoFar = (i: number) => Math.max(...SCORES.slice(0, Math.min(i + 1, LOOK)));
  const viewed = Math.min(LEAP + 1, Math.max(0, Math.floor((frame - 20) / step) + 1));
  const bar = rise(frame, cue(shot, 'better', fps, { fallback: 0.35 }) - 10, 14);
  const W = 70;
  const GAP = 16;
  const left = (1920 - (SCORES.length * W + (SCORES.length - 1) * GAP)) / 2;
  const doorTop = 430;
  const H = 230;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, ${alpha(accent, 0.07)} 0%, ${alpha(accent, 0)} 60%)` }} />
      {/* LOOK and LEAP zones */}
      {[
        { label: 'LOOK', from: 0, to: LOOK, color: '#8A93A6' },
        { label: 'LEAP', from: LOOK, to: SCORES.length, color: accent },
      ].map((z, k) => {
        const x0 = left + z.from * (W + GAP) - GAP / 2;
        const x1 = left + z.to * (W + GAP) - GAP / 2;
        const zo = rise(frame, 4 + k * 10, 16);
        return (
          <div key={z.label} style={{ position: 'absolute', left: x0, top: doorTop - 120, width: x1 - x0, opacity: zo }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: 8, color: z.color, textAlign: 'center' }}>{z.label}</div>
            <div style={{ marginTop: 14, height: 4, borderRadius: 2, backgroundColor: z.color, opacity: 0.8 }} />
            <div style={{ marginTop: 10, fontFamily: FONT, fontWeight: 600, fontSize: 26, color: C.textMuted, textAlign: 'center' }}>
              {k === 0 ? 'first 37%: learn what good looks like' : 'take the first one better than all of those'}
            </div>
          </div>
        );
      })}
      {/* The bar set by the look phase */}
      <div
        style={{
          position: 'absolute',
          left: left - 20,
          width: (W + GAP) * SCORES.length + 24,
          top: doorTop + H - BAR * (H - 20) - 10,
          height: 0,
          borderTop: `3px dashed ${alpha(accent, 0.9)}`,
          opacity: bar,
        }}
      />
      {SCORES.map((s, i) => {
        const open = opened(i);
        const isLeap = i === LEAP;
        const after = i > LEAP;
        const dim = after ? 1 - 0.65 * leap : 1;
        const best = i < LOOK && SCORES[i] === bestSoFar(LOOK - 1);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: left + i * (W + GAP),
              top: doorTop,
              width: W,
              height: H,
              borderRadius: 10,
              backgroundColor: C.surface,
              border: `2px solid ${isLeap && leap > 0 ? accent : C.border}`,
              boxShadow: isLeap ? `0 0 ${40 * leap}px ${alpha(accent, 0.7 * leap)}` : undefined,
              overflow: 'hidden',
              opacity: dim,
            }}
          >
            {/* What was behind the door: its score */}
            <div
              style={{
                position: 'absolute',
                left: 10,
                right: 10,
                bottom: 10,
                height: s * (H - 20) * open,
                borderRadius: 6,
                backgroundColor: isLeap ? accent : i < LOOK ? (best ? '#C9CFDB' : '#5E6779') : '#7A8396',
              }}
            />
            {/* The door itself, swinging open */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: '#2A3346',
                borderRadius: 8,
                transformOrigin: 'left center',
                transform: `perspective(400px) rotateY(${-80 * open}deg)`,
                opacity: 1 - 0.85 * open,
              }}
            >
              <div style={{ position: 'absolute', right: 10, top: H / 2 - 5, width: 10, height: 10, borderRadius: 5, backgroundColor: '#8A93A6' }} />
            </div>
          </div>
        );
      })}
      <div
        style={{
          position: 'absolute',
          top: doorTop + H + 50,
          width: '100%',
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 40,
          color: leap > 0 ? accent : C.textMuted,
        }}
      >
        {leap > 0 ? `Option ${LEAP + 1} beats everything before it. Take it.` : `Options seen: ${viewed}`}
      </div>
    </AbsoluteFill>
  );
}

/**
 * The chance of ending with the very best option, for every length of the
 * look phase: x·ln(1/x), which peaks at 1/e ≈ 37% look, 37% success.
 */
export function Curve() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const W = 1200;
  const H = 560;
  const X0 = 360;
  const Y0 = 220;
  const ymax = 0.45;
  const px = (x: number) => X0 + x * W;
  const py = (y: number) => Y0 + H - (y / ymax) * H;
  const pts: string[] = [];
  for (let i = 1; i <= 200; i++) {
    const x = i / 200;
    pts.push(`${px(x).toFixed(1)},${py(-x * Math.log(x)).toFixed(1)}`);
  }
  const path = `M ${px(0)},${py(0)} L ${pts.join(' L ')}`;
  const draw = interpolate(frame, [10, Math.max(40, shot.frames * 0.45)], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const peakAt = cue(shot, 'peak', fps, { fallback: 0.5 });
  const peak = rise(frame, peakAt, 16);
  const e1 = 1 / Math.E;
  const axis = { stroke: '#4A5468', strokeWidth: 3 };
  const label = { fontFamily: FONT, fontWeight: 600, fontSize: 28, fill: '#9AA3B5' };
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <svg width={1920} height={1080}>
        <line x1={X0} y1={Y0 + H} x2={X0 + W} y2={Y0 + H} {...axis} />
        <line x1={X0} y1={Y0} x2={X0} y2={Y0 + H} {...axis} />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={px(t)} y={Y0 + H + 44} textAnchor="middle" {...label}>
            {Math.round(t * 100)}%
          </text>
        ))}
        {[0, 0.1, 0.2, 0.3, 0.4].map((t) => (
          <text key={t} x={X0 - 22} y={py(t) + 10} textAnchor="end" {...label}>
            {Math.round(t * 100)}%
          </text>
        ))}
        <text x={X0 + W / 2} y={Y0 + H + 100} textAnchor="middle" {...label} fill="#C6CCD8" fontSize={32}>
          How much of the search you spend only looking
        </text>
        <text x={X0 - 110} y={Y0 + H / 2} textAnchor="middle" transform={`rotate(-90 ${X0 - 110} ${Y0 + H / 2})`} {...label} fill="#C6CCD8" fontSize={32}>
          Chance of ending with the very best
        </text>
        <path d={path} fill="none" stroke={accent} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        <g opacity={peak}>
          <line x1={px(e1)} y1={py(e1)} x2={px(e1)} y2={Y0 + H} stroke={accent} strokeWidth={3} strokeDasharray="10 10" />
          <line x1={X0} y1={py(e1)} x2={px(e1)} y2={py(e1)} stroke={accent} strokeWidth={3} strokeDasharray="10 10" />
          <circle cx={px(e1)} cy={py(e1)} r={16 * peak} fill={accent} />
          <text x={px(e1) + 34} y={py(e1) - 30} fontFamily={FONT} fontWeight={800} fontSize={64} fill="#FFFFFF">
            37% look → 37% win
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
}

/**
 * The Berlin Wall on a timeline: built 1961, Gott's visit in 1969, his
 * even-odds range (2⅔ to 24 more years) and the fall in 1989, each when the
 * voice gets to it.
 */
export function WallTimeline() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const Y0 = 1958;
  const Y1 = 1996;
  const L = 200;
  const W = 1520;
  const x = (y: number) => L + ((y - Y0) / (Y1 - Y0)) * W;
  const axisY = 620;
  const built = rise(frame, 6, 14);
  const visitAt = cue(shot, '1969', fps, { fallback: 0.1 });
  const grow = interpolate(frame, [visitAt - 20, visitAt + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const visit = rise(frame, visitAt, 14);
  const rangeO = rise(frame, cue(shot, 'even chance', fps, { fallback: 0.5 }), 18);
  const fallO = rise(frame, cue(shot, '1989', fps, { nth: 0, fallback: 2 }), 14);
  const label = { fontFamily: FONT, fontWeight: 700, fontSize: 46, fill: '#E9EDF5' } as const;
  const small = { fontFamily: FONT, fontWeight: 600, fontSize: 34, fill: '#9AA3B5' } as const;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <svg width={1920} height={1080}>
        <line x1={L} y1={axisY} x2={L + W} y2={axisY} stroke="#4A5468" strokeWidth={3} />
        {[1960, 1965, 1970, 1975, 1980, 1985, 1990, 1995].map((y) => (
          <g key={y}>
            <line x1={x(y)} y1={axisY - 10} x2={x(y)} y2={axisY + 10} stroke="#4A5468" strokeWidth={3} />
            <text x={x(y)} y={axisY + 52} textAnchor="middle" {...small}>{y}</text>
          </g>
        ))}
        {/* The wall's life so far */}
        <rect x={x(1961.6)} y={axisY - 34} width={(x(1969) - x(1961.6)) * grow} height={24} rx={6} fill="#C6CCD8" opacity={built} />
        <text x={x(1961.6)} y={axisY - 60} {...label} opacity={built}>Built 1961</text>
        {/* Gott's visit */}
        <g opacity={visit}>
          <line x1={x(1969)} y1={axisY - 150} x2={x(1969)} y2={axisY + 10} stroke="#FFFFFF" strokeWidth={4} />
          <text x={x(1969)} y={axisY - 170} textAnchor="middle" {...label}>Gott visits, 1969</text>
        </g>
        {/* His even-odds range */}
        <g opacity={rangeO}>
          <rect x={x(1971.67)} y={axisY + 90} width={x(1993) - x(1971.67)} height={60} rx={10} fill={alpha(accent, 0.35)} stroke={accent} strokeWidth={3} />
          <text x={(x(1971.67) + x(1993)) / 2} y={axisY + 210} textAnchor="middle" {...label} fill={accent}>Even chance: 2⅔ to 24 more years</text>
        </g>
        {/* The fall */}
        <g opacity={fallO}>
          <line x1={x(1989.86)} y1={axisY - 150} x2={x(1989.86)} y2={axisY + 140} stroke={accent} strokeWidth={5} />
          <circle cx={x(1989.86)} cy={axisY} r={14} fill={accent} />
          <text x={x(1989.86)} y={axisY - 170} textAnchor="middle" {...label} fill={accent}>The wall falls, 1989</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
}

/**
 * Three kinds of waiting, side by side, each lighting up when it is named:
 * clustered around an average, a long tail, and at random.
 */
export function Waits() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const panels = [
    { title: 'Around an average', rule: 'Predict the average', cueAt: 'cluster around an average', kind: 'normal' },
    { title: 'A long tail', rule: 'The longer it lasts, the longer it lasts', cueAt: 'long tail', kind: 'tail' },
    { title: 'At random', rule: 'The wait ahead stays the same', cueAt: 'happen at random', kind: 'random' },
  ] as const;
  const PW = 500;
  const PH = 300;
  const path = (kind: string) => {
    const pts: string[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const y =
        kind === 'normal' ? Math.exp(-((t - 0.5) ** 2) / 0.02) : kind === 'tail' ? 1 / (1 + 14 * t) ** 1.4 : 0;
      pts.push(`${(t * PW).toFixed(1)},${(PH - y * (PH - 20)).toFixed(1)}`);
    }
    return `M ${pts.join(' L ')}`;
  };
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 60 }}>
        {panels.map((p, i) => {
          const at = cue(shot, p.cueAt, fps, { fallback: 0.1 + 0.3 * i });
          const o = rise(frame, at - 6, 14);
          const lit = frame >= at - 6;
          return (
            <div key={p.kind} style={{ width: PW, opacity: 0.25 + 0.75 * o, display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 44, color: lit ? '#FFFFFF' : '#8A93A6' }}>{p.title}</div>
              <svg width={PW} height={PH} style={{ background: '#1A2130', borderRadius: 18 }}>
                {p.kind === 'random' ? (
                  [0.07, 0.19, 0.24, 0.41, 0.48, 0.66, 0.71, 0.88].map((t, k) => (
                    <g key={k}>
                      <line x1={t * PW} y1={PH - 40} x2={t * PW} y2={60} stroke={lit ? accent : '#5E6779'} strokeWidth={4} opacity={rise(frame, at + k * 4, 6)} />
                      <circle cx={t * PW} cy={60} r={9} fill={lit ? accent : '#5E6779'} opacity={rise(frame, at + k * 4, 6)} />
                    </g>
                  ))
                ) : (
                  <path d={path(p.kind)} fill="none" stroke={lit ? accent : '#5E6779'} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - rise(frame, at, 24)} />
                )}
                <line x1={0} y1={PH - 2} x2={PW} y2={PH - 2} stroke="#4A5468" strokeWidth={3} />
              </svg>
              <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 32, lineHeight: 1.25, color: lit ? accent : '#8A93A6' }}>{p.rule}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
