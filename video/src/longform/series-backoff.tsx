/**
 * Diagrams for Logic to Live By #3 (exponential backoff): the 1986 collapse,
 * the doubling staircase, the cap, jitter, the herd and the stop rule.
 *
 * One scene key, `backoff`; the word after the colon in the script picks the
 * variant: `SCENE (backoff): double`. Everything is drawn in code, in the
 * series colour, and builds in time with the voice (`cue`).
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import { alpha, C, FONT } from '../lib/brand';
import { rise } from './look';
import { cue, useShot } from './plan';
import { useAccent } from './series';

/** 0 → 1 between two frames, clamped, in whichever order the cues land. */
const between = (frame: number, a: number, b: number) => {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b) > lo ? Math.max(a, b) : lo + 1;
  return interpolate(frame, [lo, hi], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
};

/** Deterministic pseudo-random in [0, 1), so a render is always the same. */
const rnd = (i: number) => ((Math.sin(i * 127.1 + 311.7) * 43758.5453) % 1 + 1) % 1;

function Stage({ children }: { children: React.ReactNode }) {
  const accent = useAccent();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 46%, ${alpha(accent, 0.09)} 0%, ${alpha(accent, 0)} 62%)` }} />
      {children}
    </AbsoluteFill>
  );
}

const Kicker = ({ text, at = 6 }: { text: string; at?: number }) => {
  const frame = useCurrentFrame();
  const accent = useAccent();
  const o = rise(frame, at, 14);
  return (
    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 28, letterSpacing: 7, textTransform: 'uppercase', color: accent, opacity: o }}>
      {text}
    </div>
  );
};

const Caption = ({ text, at, tone = 'muted' }: { text: string; at: number; tone?: 'muted' | 'accent' | 'light' }) => {
  const frame = useCurrentFrame();
  const accent = useAccent();
  const o = rise(frame, at, 16);
  const color = tone === 'accent' ? accent : tone === 'light' ? '#E9EDF5' : C.textMuted;
  return (
    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 34, color, opacity: o, transform: `translateY(${(1 - o) * 10}px)` }}>
      {text}
    </div>
  );
};

/**
 * October 1986: 32 kbit/s falls to 40 bit/s between two Berkeley buildings,
 * with the number counting down as the bar drains.
 */
function Collapse() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const a = cue(shot, 'thirty-two kilobits', fps, { fallback: 0.06 });
  const b = cue(shot, 'forty bits', fps, { fallback: 0.42 });
  const f = between(frame, a, b);
  const value = 32000 * Math.pow(40 / 32000, f);
  const label = value >= 1000 ? `${Math.round(value / 1000)} kbit/s` : `${Math.round(value)} bit/s`;
  const slower = rise(frame, cue(shot, 'thousand times', fps, { fallback: 0.58 }), 16);
  const W = 1240;
  const w = Math.max(8, W * (1 - 0.993 * f));
  return (
    <Stage>
      <div style={{ width: 1400, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        <Kicker text="Link throughput · October 1986" />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 148, lineHeight: 1, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>{label}</div>
        <div style={{ position: 'relative', width: W, height: 74 }}>
          {/* What the link used to carry, so the loss is visible */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 12, border: `2px dashed ${alpha(accent, 0.35 * f)}` }} />
          <div style={{ position: 'absolute', right: 0, top: -46, fontFamily: FONT, fontWeight: 700, fontSize: 26, color: alpha('#FFFFFF', 0.55 * f), opacity: f }}>
            was 32 kbit/s
          </div>
          <div style={{ position: 'absolute', left: 0, top: 0, width: w, height: '100%', borderRadius: 12, backgroundColor: accent, boxShadow: `0 0 60px ${alpha(accent, 0.35 + 0.35 * f)}` }} />
        </div>
        <div style={{ width: W, display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 600, fontSize: 26, color: '#7E889C' }}>
          <span>LBL → UC Berkeley · 400 yards · two hops</span>
          <span>over a few hours</span>
        </div>
        <div style={{ height: 96, display: 'flex', alignItems: 'center' }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 56, color: accent, opacity: slower, transform: `scale(${0.9 + 0.1 * slower})` }}>
            ×1,000 slower, in one afternoon
          </div>
        </div>
      </div>
    </Stage>
  );
}

/** The doubling staircase. `capped` flattens the steps at a minute. */
function Stairs({ capped }: { capped: boolean }) {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const values = capped ? [1, 2, 4, 8, 16, 32, 60, 60, 60] : [1, 2, 4, 8, 16, 32, 64];
  const started = cue(shot, 'one second', fps, { fallback: 0.1 });
  const per = Math.max(9, Math.round((shot.frames * 0.62) / values.length));
  const appear = (i: number) => rise(frame, started + i * per, 10);
  const capAt = rise(frame, cue(shot, 'cap', fps, { fallback: 0.52 }), 16);

  const BASE = 800;
  const MAXH = 470;
  const BW = capped ? 92 : 116;
  const GAP = capped ? 62 : 92;
  const total = values.length * BW + (values.length - 1) * GAP;
  const left = (1920 - total) / 2;
  const h = (v: number) => (v / 64) * MAXH;

  return (
    <Stage>
      <div style={{ position: 'absolute', top: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <Kicker text={capped ? 'Part two · the cap' : 'Part one · the doubling'} />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: '#FFFFFF' }}>
          {capped ? 'Stop doubling at about a minute' : 'After every failure, wait twice as long'}
        </div>
      </div>

      {/* The ceiling, on the capped variant */}
      {capped ? (
        <div
          style={{
            position: 'absolute',
            left: left - 40,
            width: total + 80,
            top: BASE - h(60) - 2,
            borderTop: `3px dashed ${alpha(accent, 0.95)}`,
            opacity: capAt,
          }}
        >
          <div style={{ position: 'absolute', left: 0, top: -52, fontFamily: FONT, fontWeight: 800, fontSize: 34, color: accent, opacity: capAt }}>ceiling · 60 s</div>
        </div>
      ) : null}

      {values.map((v, i) => {
        const o = appear(i);
        const isCap = capped && i >= 6;
        const hh = h(v);
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                left: left + i * (BW + GAP),
                top: BASE - hh - 46,
                width: BW,
                textAlign: 'center',
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 34,
                color: isCap ? accent : '#DDE3EE',
                opacity: o,
              }}
            >
              {v} s
            </div>
            <div
              style={{
                position: 'absolute',
                left: left + i * (BW + GAP),
                top: BASE - hh * o,
                width: BW,
                height: hh * o,
                borderRadius: 10,
                backgroundColor: isCap ? alpha(accent, 0.55) : '#2E3748',
                border: `2px solid ${isCap ? accent : '#3B4558'}`,
                boxShadow: isCap ? `0 0 34px ${alpha(accent, 0.4)}` : undefined,
              }}
            />
          </React.Fragment>
        );
      })}

      {/* Baseline and attempt numbers */}
      <div style={{ position: 'absolute', left: left - 40, width: total + 80, top: BASE, height: 3, backgroundColor: '#4A5468' }} />
      {values.map((_, i) => (
        <div
          key={`n${i}`}
          style={{
            position: 'absolute',
            left: left + i * (BW + GAP),
            width: BW,
            top: BASE + 16,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 24,
            color: '#7E889C',
          }}
        >
          {i + 1}
        </div>
      ))}
      <div style={{ position: 'absolute', top: BASE + 78, width: '100%', textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 26, color: '#7E889C' }}>
        attempt · the wait before it
      </div>
    </Stage>
  );
}

/** Jitter: the same window, first everyone at the end of it, then spread. */
function Jitter() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const at = cue(shot, 'randomness', fps, { fallback: 0.18 });
  const spread = between(frame, at + 10, at + 44);
  const N = 14;
  const L = 320;
  const W = 1280;
  const Y = 540;
  return (
    <Stage>
      <div style={{ position: 'absolute', top: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <Kicker text="Part three · jitter" />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 52, color: '#FFFFFF' }}>One retry window, eight seconds long</div>
      </div>

      <div style={{ position: 'absolute', left: L, top: Y - 96, width: W, height: 192, borderRadius: 16, backgroundColor: '#1C2433', border: '2px solid #303A4D' }} />
      {[0, 2, 4, 6, 8].map((s) => (
        <div key={s} style={{ position: 'absolute', left: L + (s / 8) * W - 30, top: Y + 118, width: 60, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 24, color: '#7E889C' }}>
          {s} s
        </div>
      ))}

      {Array.from({ length: N }).map((_, i) => {
        const x0 = L + W - 26 - rnd(i + 40) * 26;
        const x1 = L + 46 + rnd(i) * (W - 92);
        const x = x0 + (x1 - x0) * spread;
        const appear = rise(frame, 10 + i * 2, 8);
        const collided = spread < 0.35;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 13,
              top: Y - 13 + (rnd(i + 90) - 0.5) * 34,
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: collided ? '#E06A5A' : accent,
              boxShadow: collided ? '0 0 18px rgba(224,106,90,0.45)' : `0 0 18px ${alpha(accent, 0.4)}`,
              opacity: appear,
            }}
          />
        );
      })}

      <div style={{ position: 'absolute', top: Y + 190, display: 'flex', gap: 120 }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: '#E06A5A', opacity: 1 - spread }}>In step: they collide again</div>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: accent, opacity: spread }}>Jittered: they fit</div>
      </div>
    </Stage>
  );
}

/** The herd: every retry at 7:00, then spread across the hour. */
function Herd() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const at = cue(shot, 'waiting a little', fps, { fallback: 0.3 });
  const move = between(frame, at + 8, at + 54);
  const N = 160;
  const ROWS = 20;
  const LANES = 8;
  const LW = 142;
  const GAP = 30;
  const L = (1920 - (LANES * LW + (LANES - 1) * GAP)) / 2;
  const TOP = 330;
  const H = 360;
  const laneX = (lane: number) => L + lane * (LW + GAP) + LW / 2;
  const times = ['7:00', '7:10', '7:20', '7:30', '7:40', '7:50', '8:00', '8:10'];

  return (
    <Stage>
      <div style={{ position: 'absolute', top: 118, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <Kicker text="Why jitter matters to people" />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 50, color: '#FFFFFF' }}>
          {move < 0.5 ? 'Everybody at 7:00' : 'Spread across the hour'}
        </div>
      </div>

      {Array.from({ length: LANES }).map((_, lane) => {
        const load = lane === 3 ? 1 - move * (1 - 1 / LANES) : move / LANES;
        return (
          <div key={`lane${lane}`}>
            <div style={{ position: 'absolute', left: L + lane * (LW + GAP), top: TOP, width: LW, height: H, borderRadius: 14, backgroundColor: '#1A2130', border: `2px solid ${load > 0.4 ? alpha(accent, 0.7) : '#2E3748'}` }} />
            <div style={{ position: 'absolute', left: L + lane * (LW + GAP), top: TOP + H + 12, width: LW, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 26, color: load > 0.4 ? accent : '#7E889C' }}>
              {times[lane]}
            </div>
            <div style={{ position: 'absolute', left: L + lane * (LW + GAP), top: TOP + H + 56, width: LW, height: 12, borderRadius: 6, backgroundColor: '#232B3A', overflow: 'hidden' }}>
              <div style={{ width: `${load * 100}%`, height: '100%', backgroundColor: load > 0.4 ? accented(accent) : '#4A5468' }} />
            </div>
          </div>
        );
      })}

      {Array.from({ length: N }).map((_, i) => {
        const lane = i % LANES;
        const row = Math.floor(i / LANES) % ROWS;
        const y0 = TOP + 34 + row * 16;
        const x0 = laneX(3) + (rnd(i + 7) - 0.5) * (LW - 30);
        const x1 = laneX(lane) + (rnd(i) - 0.5) * (LW - 34);
        const x = x0 + (x1 - x0) * move;
        const y = y0 + (rnd(i + 3) - 0.5) * 6 * move;
        const o = rise(frame, 10 + (i % LANES) * 3 + Math.floor(i / LANES) * 0.6, 8);
        return <div key={`d${i}`} style={{ position: 'absolute', left: x - 6, top: y - 6, width: 12, height: 12, borderRadius: 6, backgroundColor: accent, opacity: o * 0.9 }} />;
      })}

      <div style={{ position: 'absolute', top: TOP + H + 108, fontFamily: FONT, fontWeight: 600, fontSize: 28, color: '#7E889C' }}>
        Retries per ten minutes, if everyone picks their own moment
      </div>
    </Stage>
  );
}

/** The stop rule: three tries, growing gaps, then stop. */
function Attempts() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const first = cue(shot, 'three tries', fps, { fallback: 0.15 });
  const stopAt = cue(shot, 'then stop', fps, { fallback: 0.45 });
  const days = [0, 7, 21, 49];
  const X0 = 300;
  const W = 1320;
  const Y = 560;
  const x = (d: number) => X0 + (d / 49) * W;

  return (
    <Stage>
      <div style={{ position: 'absolute', top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <Kicker text="The stop rule" />
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 54, color: '#FFFFFF' }}>Three tries, then the gap is the rule</div>
      </div>

      <div style={{ position: 'absolute', left: X0, top: Y, width: W, height: 3, backgroundColor: '#4A5468' }} />
      {days.map((d, i) => {
        const at = first + i * Math.max(10, Math.round((shot.frames * 0.45) / 4));
        const o = rise(frame, at, 12);
        const stopped = i === 3;
        return (
          <div key={d}>
            <div
              style={{
                position: 'absolute',
                left: x(d) - 15,
                top: Y - 15,
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: stopped ? 'transparent' : accent,
                border: `4px solid ${stopped ? '#6B7488' : accent}`,
                opacity: o,
                boxShadow: stopped ? undefined : `0 0 30px ${alpha(accent, 0.55)}`,
              }}
            />
            {stopped ? (
              <div style={{ position: 'absolute', left: x(d) - 24, top: Y - 24, width: 48, height: 3, backgroundColor: '#6B7488', transform: 'rotate(45deg)', opacity: o }} />
            ) : null}
            <div style={{ position: 'absolute', left: x(d) - 90, width: 180, top: Y + 40, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 34, color: stopped ? '#8A93A6' : '#FFFFFF', opacity: o }}>
              {stopped ? 'stop' : `try ${i + 1}`}
            </div>
            <div style={{ position: 'absolute', left: x(d) - 90, width: 180, top: Y - 78, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 26, color: '#7E889C', opacity: o }}>
              day {d}
            </div>
          </div>
        );
      })}

      <div style={{ position: 'absolute', top: Y + 150, display: 'flex', gap: 60 }}>
        <Caption text="a week between the first two," at={first + 8} />
        <Caption text="then two, then four" at={first + 18} tone="accent" />
      </div>      <div style={{ position: 'absolute', top: 860, fontFamily: FONT, fontWeight: 600, fontSize: 30, color: '#8A93A6', opacity: rise(frame, stopAt, 16) }}>
        Unless something has changed, the next wait buys less than it costs.
      </div>
    </Stage>
  );
}

/** The series colour, pre-mixed for a filled bar. */
const accented = (hex: string) => alpha(hex, 0.85);

export function Backoff() {
  const shot = useShot();
  const variant = shot.scene.trim().toLowerCase().split(/[\s,]+/)[0];
  if (variant === 'collapse') return <Collapse />;
  if (variant === 'cap') return <Stairs capped />;
  if (variant === 'jitter') return <Jitter />;
  if (variant === 'herd') return <Herd />;
  if (variant === 'attempts') return <Attempts />;
  return <Stairs capped={false} />;
}
