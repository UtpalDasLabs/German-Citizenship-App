/**
 * Scenes configured from the script, not from code: each reads the `> a | b`
 * lines written under its `> SCENE (type)` line. Between them they cover most
 * of a lesson, so a new episode mostly needs writing, not programming.
 */
import React from 'react';
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

import { alpha, APP_NAME, C, FONT, GOLD } from '../lib/brand';
import { Archive, CrossIn, INK, PAPER, Photo, PhotoCaption, rise, SERIF, SpokenText } from './look';
import { findCue, screenLines, useShot, type ScreenLine } from './plan';

function useLines(): ScreenLine[] {
  const shot = useShot();
  const { fps } = useVideoConfig();
  const lines = screenLines(shot, fps);
  if (lines.length === 0) throw new Error(`Scene "${shot.key}" needs "> …" lines under it: ${shot.scene}`);
  return lines;
}

/** Slow drift so a still layout never looks frozen. */
function useDrift(): number {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [0, durationInFrames], [1, 1.035]);
}

function Glow({ strength = 0.1 }: { strength?: number }) {
  return (
    <AbsoluteFill
      style={{ background: `radial-gradient(ellipse at 50% 42%, ${alpha(GOLD, strength)} 0%, ${alpha(GOLD, 0)} 60%)` }}
    />
  );
}

function Overline({ children, o = 1 }: { children: React.ReactNode; o?: number }) {
  return (
    <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 28, letterSpacing: 5, color: GOLD, textTransform: 'uppercase', opacity: o }}>
      {children}
    </div>
  );
}

/** `German | English | reference`: one key term, large. Appears when spoken, if it is. */
export function Term() {
  const shot = useShot();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [{ fields }] = useLines();
  const [de, en, ref] = fields;
  const at = findCue(shot, de, fps) ?? 8;
  const o = rise(frame, at, 16);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 30 }}>
      <Glow strength={0.05 + 0.07 * o} />
      <div style={{ transform: `scale(${useDrift()})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
        {ref ? <Overline o={rise(frame, 4)}>{ref}</Overline> : null}
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: de.length > 18 ? 110 : 140,
            color: C.text,
            opacity: o,
            transform: `translateY(${(1 - o) * 24}px)`,
          }}
        >
          {de}
        </div>
        <div style={{ width: 160 * o, height: 4, backgroundColor: GOLD, borderRadius: 2 }} />
        {en ? (
          <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 48, color: C.textMuted, opacity: rise(frame, at + 10, 16) }}>{en}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}

/** One card per line, `big | small`, side by side. */
export function List() {
  const frame = useCurrentFrame();
  const lines = useLines();
  const width = lines.length > 3 ? 400 : 520;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Glow strength={0.05} />
      <div style={{ display: 'flex', gap: 40, alignItems: 'stretch', transform: `scale(${useDrift()})` }}>
        {lines.map(({ fields: [big, small], at }, i) => {
          const o = rise(frame, at, 16);
          return (
            <div
              key={i}
              style={{
                width,
                minHeight: 320,
                padding: '44px 40px',
                borderRadius: 28,
                backgroundColor: C.surface,
                border: `2px solid ${C.border}`,
                borderTop: `6px solid ${GOLD}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 22,
                opacity: o,
                transform: `translateY(${(1 - o) * 40}px)`,
              }}
            >
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: C.textFaint }}>{i + 1}</div>
              <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: big.length > 24 ? 46 : 60, lineHeight: 1.15, color: C.text }}>{big}</div>
              {small ? <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 32, lineHeight: 1.3, color: C.textMuted }}>{small}</div> : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

/** `number | label` per line, side by side. Whole numbers count up. */
export function Stat() {
  const frame = useCurrentFrame();
  const lines = useLines();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Glow />
      <div style={{ display: 'flex', gap: 180, transform: `scale(${useDrift()})` }}>
        {lines.map(({ fields: [value, label], at }, i) => {
          const o = rise(frame, at, 14);
          const n = Number(value);
          const shown = Number.isInteger(n) ? Math.round(n * rise(frame, at, 24)) : value;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: o }}>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 260, lineHeight: 1, color: i === lines.length - 1 ? GOLD : C.text }}>
                {shown}
              </div>
              <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: C.textMuted, maxWidth: 520, textAlign: 'center' }}>{label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

/** `DATE | German | English`: a dated fact, full screen. */
export function Fact() {
  const frame = useCurrentFrame();
  const [{ fields }] = useLines();
  const [date, de, en] = fields;
  return (
    <AbsoluteFill style={{ backgroundColor: INK, alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 1300,
          padding: '70px 90px',
          borderLeft: `8px solid ${GOLD}`,
          backgroundColor: alpha(C.surface, 0.6),
          display: 'flex',
          flexDirection: 'column',
          gap: 26,
          transform: `scale(${useDrift()})`,
        }}
      >
        <Overline o={rise(frame, 4)}>{date}</Overline>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 84, color: PAPER, opacity: rise(frame, 10, 16) }}>{de}</div>
        {en ? (
          <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 42, lineHeight: 1.35, color: '#C9C3B6', opacity: rise(frame, 22, 16) }}>{en}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
}

/** `German | English | source`: typed in time with the voice when it is spoken. */
export function Quote() {
  const shot = useShot();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [{ fields }] = useLines();
  const [de, en, source] = fields;
  let typed: React.ReactNode = null;
  let done = 10;
  for (const p of shot.paras) {
    const span = p.de.find((d) => d.text === de);
    if (span) {
      typed = <SpokenText p={p} start={span.start} end={span.end} style={{}} />;
      done = p.from + Math.round(p.starts[Math.min(span.end - 1, p.starts.length - 1)] * fps) + 8;
      break;
    }
  }
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Glow strength={0.08} />
      <div style={{ position: 'absolute', left: 70, top: 40, fontFamily: SERIF, fontSize: 420, lineHeight: 1, color: alpha(GOLD, 0.1) }}>„</div>
      <div style={{ width: 1400, display: 'flex', flexDirection: 'column', gap: 34, transform: `scale(${useDrift()})` }}>
        {source ? <Overline o={rise(frame, 4)}>{source}</Overline> : null}
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 96, lineHeight: 1.12, color: C.text }}>
          {typed ?? <span style={{ opacity: rise(frame, 8, 16) }}>{de}</span>}
        </div>
        {en ? <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 46, color: C.textMuted, opacity: rise(frame, done, 16) }}>{en}</div> : null}
      </div>
    </AbsoluteFill>
  );
}

/**
 * `image-id | caption | options` per line; several lines cut from one photo to
 * the next. Options: `color` (modern photo), `paper` (a document), and
 * `from x y scale` / `to x y scale` for the camera move.
 */
export function PhotoScene({ topic }: { topic: string }) {
  const lines = useLines();
  const shot = useShot();
  return (
    <AbsoluteFill>
      {lines.map(({ fields: [id, caption, options = ''], at }, i) => {
        const start = i === 0 ? 0 : at;
        const end = i + 1 < lines.length ? lines[i + 1].at + 12 : shot.frames + 12;
        const color = /\b(color|paper)\b/.test(options);
        const framing = (word: string, fallback: { x: number; y: number; scale: number }) => {
          const m = options.match(new RegExp(`${word} ([\\d.]+) ([\\d.]+) ([\\d.]+)`));
          return m ? { x: Number(m[1]), y: Number(m[2]), scale: Number(m[3]) } : fallback;
        };
        return (
          <Sequence key={i} from={start} durationInFrames={end - start}>
            <CrossIn frames={i === 0 ? 1 : 12}>
              <Archive>
                <Photo
                  src={`images/${topic}/${id}.jpg`}
                  color={color}
                  from={framing('from', { x: 0.5, y: 0.5, scale: 1.0 })}
                  to={framing('to', { x: 0.5, y: 0.5, scale: 1.12 })}
                />
                {caption ? <PhotoCaption text={caption} /> : null}
              </Archive>
            </CrossIn>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

/** Comma-separated words in a grid; each lands when the voice says it. */
export function Words() {
  const shot = useShot();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const [{ fields }] = useLines();
  const words = fields.join(', ').split(/,\s*/);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Glow strength={0.06} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 380px)', gap: 30, transform: `scale(${useDrift()})` }}>
        {words.map((w, i) => {
          const at = findCue(shot, w, fps) ?? 8 + i * 10;
          const o = rise(frame, at - 3, 10);
          return (
            <div
              key={w}
              style={{
                height: 150,
                borderRadius: 22,
                backgroundColor: C.surface,
                border: `2px solid ${o > 0.5 && frame < at + 25 ? GOLD : C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: SERIF,
                fontWeight: 600,
                fontSize: w.length > 15 ? 40 : 48,
                color: C.text,
                opacity: o,
                transform: `scale(${0.9 + 0.1 * o})`,
              }}
            >
              {w}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

/** Back to Article 1, then the app. */
export function Outro() {
  const shot = useShot();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const app = findCue(shot, 'the app', fps) ?? Math.round(shot.frames * 0.55);
  const quoteOut = 1 - rise(frame, app - 14, 14);
  return (
    <AbsoluteFill style={{ backgroundColor: INK, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, opacity: quoteOut * rise(frame, 6, 20) }}>
        <Overline>Grundgesetz · Artikel 1</Overline>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 78, color: PAPER }}>Die Würde des Menschen ist unantastbar.</div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 42, color: '#B9B2A3' }}>Human dignity is inviolable.</div>
      </div>
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          gap: 60,
          opacity: rise(frame, app, 16),
          transform: `translateY(${(1 - rise(frame, app, 16)) * 30}px)`,
        }}
      >
        <Img src={staticFile('icon.png')} style={{ width: 220, height: 220, borderRadius: 50 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 96, color: C.text }}>{APP_NAME}</div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: C.textMuted }}>All 460 questions · free · no account</div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 36, color: GOLD }}>Link in the description</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

/** Closing card, with the AI-voice disclosure on screen. */
export function End() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 40 }}>
      <Glow strength={0.06} />
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 100, color: C.text, opacity: rise(frame, 6, 18) }}>Bis bald.</div>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 44, color: C.textMuted, opacity: rise(frame, 14, 18) }}>See you in the next one.</div>
      <div style={{ position: 'absolute', bottom: 70, fontFamily: FONT, fontWeight: 500, fontSize: 28, color: C.textFaint, opacity: rise(frame, 4, 18) }}>
        Narrated with an AI version of the creator's voice. Facts checked against the official catalogue and the Grundgesetz.
      </div>
    </AbsoluteFill>
  );
}
