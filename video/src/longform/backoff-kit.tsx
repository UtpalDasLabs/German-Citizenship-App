/**
 * Shared visual language for Logic to Live By #3.
 *
 * Three grammars, one film:
 *  - `PaperSheet`  archive: 1986 drawn as a lab report / blueprint on paper.
 *  - `InkSheet`    clean diagrams on the series' dark stage, left-aligned so
 *                  they do not all look like the same centred slide.
 *  - `OverlayFrame` verité: real footage with a graphic in the lower third.
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import { alpha, C, FONT } from '../lib/brand';
import { Grain, Photo, rise, SERIF } from './look';
import { screenLines, useShot } from './plan';
import { useAccent } from './series';

/** Archive palette: paper, ink, faded rule, rubber stamp. */
export const P = {
  paper: '#F1EBDC',
  ink: '#211D17',
  muted: '#6B6355',
  rule: '#C9BFA9',
  stamp: '#B4472F',
  good: '#2C6B5E',
};

/** 0 → 1 between two frames, clamped, in whichever order the cues land. */
export const between = (frame: number, a: number, b: number) => {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b) > lo ? Math.max(a, b) : lo + 1;
  return interpolate(frame, [lo, hi], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
};

/** Deterministic pseudo-random in [0, 1), so a render is always the same. */
export const rnd = (i: number) => ((Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;

export const kickerStyle = (color: string, size = 20): React.CSSProperties => ({
  fontFamily: FONT,
  fontWeight: 800,
  fontSize: size,
  letterSpacing: 5,
  textTransform: 'uppercase',
  color,
});

/** A sheet of paper: grid, frame, typed header, grain. */
export function PaperSheet({
  kicker,
  title,
  children,
  foot,
}: {
  kicker: string;
  title: string;
  children: React.ReactNode;
  foot?: [string, string];
}) {
  const accent = useAccent();
  return (
    <AbsoluteFill style={{ backgroundColor: P.paper }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${alpha(P.ink, 0.045)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(P.ink, 0.045)} 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 18% 8%, ${alpha('#FFFFFF', 0.55)} 0%, ${alpha('#FFFFFF', 0)} 55%)` }} />
      <AbsoluteFill style={{ boxShadow: 'inset 0 0 240px rgba(32,28,22,0.20)' }} />
      <div style={{ position: 'absolute', inset: 44, border: `1.5px solid ${alpha(P.ink, 0.22)}` }} />
      <div style={{ position: 'absolute', left: 96, top: 74, display: 'flex', alignItems: 'center', gap: 18 }}>
        <div style={{ width: 34, height: 4, backgroundColor: accent }} />
        <div style={kickerStyle(P.muted)}>{kicker}</div>
      </div>
      <div style={{ position: 'absolute', left: 96, top: 106, fontFamily: SERIF, fontWeight: 600, fontSize: 50, color: P.ink }}>{title}</div>
      {children}
      {foot ? (
        <div
          style={{
            position: 'absolute',
            left: 96,
            right: 96,
            bottom: 62,
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 18,
            letterSpacing: 2.6,
            textTransform: 'uppercase',
            color: P.muted,
          }}
        >
          <span>{foot[0]}</span>
          <span>{foot[1]}</span>
        </div>
      ) : null}
      <Grain opacity={0.07} />
    </AbsoluteFill>
  );
}

/** The dark stage, with a left-aligned header and a hairline rule. */
export function InkSheet({
  kicker,
  title,
  lead,
  children,
  foot,
}: {
  kicker: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
  foot?: string;
}) {
  const accent = useAccent();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 24% 12%, ${alpha(accent, 0.12)} 0%, ${alpha(accent, 0)} 58%)` }} />
      <div style={{ position: 'absolute', left: 110, top: 88, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 28, height: 4, backgroundColor: accent }} />
        <div style={kickerStyle(accent)}>{kicker}</div>
      </div>
      <div style={{ position: 'absolute', left: 110, top: 118, fontFamily: FONT, fontWeight: 800, fontSize: 50, letterSpacing: -0.5, color: '#FFFFFF' }}>{title}</div>
      {lead ? (
        <div style={{ position: 'absolute', left: 110, top: 182, fontFamily: FONT, fontWeight: 500, fontSize: 27, color: C.textMuted }}>{lead}</div>
      ) : null}
      <div style={{ position: 'absolute', left: 110, top: 228, width: 1700, height: 1.5, backgroundColor: '#2A3345' }} />
      {children}
      {foot ? (
        <div style={{ position: 'absolute', left: 110, bottom: 58, fontFamily: FONT, fontWeight: 600, fontSize: 20, letterSpacing: 2.2, textTransform: 'uppercase', color: '#5F6A80' }}>{foot}</div>
      ) : null}
    </AbsoluteFill>
  );
}

/** A rubber stamp, landing when `at` is spoken. */
export function Stamp({
  text,
  at,
  x,
  y,
  size = 42,
  rotate = -7,
  color = P.stamp,
  border = 5,
}: {
  text: string;
  at: number;
  x: number;
  y: number;
  size?: number;
  rotate?: number;
  color?: string;
  border?: number;
}) {
  const frame = useCurrentFrame();
  const o = rise(frame, at, 9);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `rotate(${rotate}deg) scale(${0.9 + 0.1 * o})`,
        opacity: o,
        border: `${border}px solid ${color}`,
        color,
        padding: '10px 26px',
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        backgroundColor: alpha(P.paper, 0.25),
      }}
    >
      {text}
    </div>
  );
}

/** A small uppercase label with a leader line, for callouts. */
export function Tag({
  text,
  at,
  x,
  y,
  color = P.muted,
  size = 20,
  align = 'left',
}: {
  text: string;
  at: number;
  x: number;
  y: number;
  color?: string;
  size?: number;
  align?: 'left' | 'right' | 'center';
}) {
  const frame = useCurrentFrame();
  const o = rise(frame, at, 12);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: align === 'left' ? undefined : 360,
        textAlign: align,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color,
        opacity: o,
        transform: `translateY(${(1 - o) * 6}px)`,
      }}
    >
      {text}
    </div>
  );
}

/** Footage + scrim + header, with a graphic composed on top. */
export function OverlayFrame({
  topic,
  kicker,
  title,
  foot,
  scrim = 0.9,
  children,
}: {
  topic: string;
  kicker: string;
  title?: string;
  foot?: string;
  scrim?: number;
  children: React.ReactNode;
}) {
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const id = screenLines(shot, fps)[0]?.fields[0];
  return (
    <AbsoluteFill style={{ backgroundColor: '#06080C' }}>
      {id ? (
        <Photo
          src={`images/${topic}/${id}.jpg`}
          color
          from={{ x: 0.5, y: 0.5, scale: 1.02 }}
          to={{ x: 0.5, y: 0.46, scale: 1.12 }}
        />
      ) : null}
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(6,8,12,0.10) 0%, rgba(6,8,12,0.42) 46%, rgba(6,8,12,${scrim}) 100%)` }} />
      <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(6,8,12,0.72) 0%, rgba(6,8,12,0) 52%)' }} />
      <div style={{ position: 'absolute', left: 110, top: 86, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 28, height: 4, backgroundColor: accent }} />
        <div style={{ ...kickerStyle(accent), textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>{kicker}</div>
      </div>
      {title ? (
        <div style={{ position: 'absolute', left: 110, top: 118, fontFamily: SERIF, fontWeight: 600, fontSize: 56, color: '#FFFFFF', textShadow: '0 3px 30px rgba(0,0,0,0.55)' }}>
          {title}
        </div>
      ) : null}
      {children}
      {foot ? (
        <div style={{ position: 'absolute', left: 110, bottom: 52, fontFamily: FONT, fontWeight: 600, fontSize: 19, letterSpacing: 2.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>{foot}</div>
      ) : null}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
}
