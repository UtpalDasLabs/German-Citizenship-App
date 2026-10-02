import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, random, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

import { alpha, C, FONT, GOLD } from '../lib/brand';
import { charFrame, spokenCount, useShot, type Para } from './plan';

export const SERIF = '"Source Serif 4", Georgia, serif';
export const INK = '#0B0E14';
/** Paper tone for archival documents and quotes. */
export const PAPER = '#EDE6D6';

export const ease = Easing.bezier(0.33, 0, 0.2, 1);

/** 0 → 1 over `frames` starting at `at`, eased. */
export function rise(frame: number, at: number, frames = 18): number {
  return interpolate(frame, [at, at + frames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });
}

type Framing = { x: number; y: number; scale: number };

/**
 * An archival photo with one consistent treatment, so pictures from different
 * archives read as one film: black and white, a touch warm, lifted blacks, a
 * slow move from one framing to another, grain and a vignette on top.
 * `x`/`y` are the point of the photo kept in the centre (0–1).
 */
export function Photo({
  src,
  from = { x: 0.5, y: 0.5, scale: 1.05 },
  to = { x: 0.5, y: 0.5, scale: 1.18 },
  start = 0,
  end,
  color = false,
  fit = 'cover',
}: {
  src: string;
  from?: Framing;
  to?: Framing;
  start?: number;
  end?: number;
  color?: boolean;
  fit?: 'cover' | 'contain';
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [start, end ?? durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.inOut(Easing.sin),
  });
  const x = from.x + (to.x - from.x) * t;
  const y = from.y + (to.y - from.y) * t;
  const scale = from.scale + (to.scale - from.scale) * t;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', backgroundColor: INK }}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: fit,
          objectPosition: `${x * 100}% ${y * 100}%`,
          transform: `scale(${scale})`,
          transformOrigin: `${x * 100}% ${y * 100}%`,
          filter: color
            ? 'saturate(0.75) contrast(1.05) brightness(0.92)'
            : 'grayscale(1) sepia(0.18) contrast(1.12) brightness(0.86)',
        }}
      />
    </AbsoluteFill>
  );
}

/** Film grain: a fresh noise pattern every other frame. */
export function Grain({ opacity = 0.13 }: { opacity?: number }) {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 50;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: 'overlay', pointerEvents: 'none' }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
}

export function Vignette({ strength = 0.75 }: { strength?: number }) {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
        pointerEvents: 'none',
      }}
    />
  );
}

/** Fade from/to black at the edges of a sequence. */
export function Fade({
  inFrames = 12,
  outFrames = 12,
  children,
}: {
  inFrames?: number;
  outFrames?: number;
  children: React.ReactNode;
}) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = Math.min(
    inFrames ? interpolate(frame, [0, inFrames], [0, 1], { extrapolateRight: 'clamp' }) : 1,
    outFrames ? interpolate(frame, [durationInFrames - outFrames, durationInFrames], [1, 0], { extrapolateLeft: 'clamp' }) : 1,
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
}

/** Small documentary caption: where and when a photo was taken. */
export function PhotoCaption({ text, at = 10 }: { text: string; at?: number }) {
  const frame = useCurrentFrame();
  const o = rise(frame, at, 20);
  return (
    <>
      {/* A soft shade under the caption, so it reads on bright skies and paper. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 260,
          opacity: o,
          background: 'linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 96,
          bottom: 84,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          opacity: o,
          transform: `translateY(${(1 - o) * 10}px)`,
        }}
      >
        <div style={{ width: 4, height: 34, backgroundColor: GOLD }} />
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 28,
            letterSpacing: 2.4,
            color: '#F2EEE6',
            textTransform: 'uppercase',
          }}
        >
          {text}
        </div>
      </div>
    </>
  );
}

/** Chapter number and title, top left, for the first seconds of a chapter. */
export function ChapterLabel({ number, title }: { number: number; title: string }) {
  const frame = useCurrentFrame();
  const o =
    rise(frame, 8, 20) *
    interpolate(frame, [130, 150], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 96,
        top: 80,
        opacity: o,
        transform: `translateX(${(1 - o) * -16}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 3,
          color: GOLD,
        }}
      >
        CHAPTER {number}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 44,
          color: C.text,
          marginTop: 6,
          textShadow: '0 2px 18px rgba(0,0,0,0.6)',
        }}
      >
        {title}
      </div>
    </div>
  );
}

/**
 * Every German phrase the narrator says appears on screen as it is spoken, so
 * viewers see the exact words they will meet in the exam. Shots that already
 * show the German themselves turn this off.
 */
export function GermanCaption({ exclude = [], bottom = 70 }: { exclude?: string[]; bottom?: number }) {
  const shot = useShot();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shown = (t: string) => {
    const n = t
      .toLowerCase()
      .replace(/[.…?!„“"]+/g, '')
      .trim();
    if (exclude.some((e) => e === n || (n.length > 3 && e.includes(n)))) return true;
    // A reworded answer ("beim Behördenleiter" for "bei der Behördenleiterin/beim
    // Behördenleiter") is on screen too, if most of its words are.
    const words = n.split(/\s+/).filter((w) => w.length > 3);
    return words.length >= 2 && exclude.some((e) => words.filter((w) => e.includes(w)).length / words.length >= 0.6);
  };
  for (const p of shot.paras) {
    for (const d of p.de) {
      if (shown(d.text)) continue;
      const start = charFrame(p, d.start, fps) - 4;
      const end = Math.max(charFrame(p, d.end - 1, fps) + Math.round(1.6 * fps), start + Math.round(2.2 * fps));
      if (frame < start || frame > end) continue;
      const o = Math.min(
        rise(frame, start, 8),
        interpolate(frame, [end - 8, end], [1, 0], {
          extrapolateLeft: 'clamp',
        }),
      );
      return (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom,
            display: 'flex',
            justifyContent: 'center',
            opacity: o,
          }}
        >
          <div
            style={{
              padding: '16px 34px',
              borderRadius: 16,
              backgroundColor: alpha(INK, 0.82),
              border: `2px solid ${alpha(GOLD, 0.55)}`,
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 54,
              color: PAPER,
              transform: `translateY(${(1 - o) * 12}px)`,
            }}
          >
            {d.text}
          </div>
        </div>
      );
    }
  }
  return null;
}

/** An unbuilt scene: the director's note on screen, so the cut can be watched end to end. */
export function Storyboard() {
  const shot = useShot();
  const frame = useCurrentFrame();
  const n = Math.floor(random(shot.scene) * 900) + 100;
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        padding: '120px 160px',
        justifyContent: 'center',
        gap: 28,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 3,
          color: C.textFaint,
        }}
      >
        STORYBOARD · SHOT {n}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: 52,
          lineHeight: 1.3,
          color: C.textMuted,
          opacity: rise(frame, 0, 12),
        }}
      >
        {shot.scene}
      </div>
    </AbsoluteFill>
  );
}

/** A dated fact on a card, for history the narration only alludes to. */
export function FactCard({ date, de, en, at }: { date: string; de: string; en: string; at: number }) {
  const frame = useCurrentFrame();
  const o = rise(frame, at, 16);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        right: 96,
        top: 96,
        width: 620,
        padding: '28px 34px',
        borderRadius: 18,
        backgroundColor: alpha(INK, 0.86),
        borderLeft: `6px solid ${GOLD}`,
        opacity: o,
        transform: `translateY(${(1 - o) * 14}px)`,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 24,
          letterSpacing: 2.4,
          color: GOLD,
        }}
      >
        {date}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: 44,
          color: PAPER,
          marginTop: 10,
        }}
      >
        {de}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 28,
          lineHeight: 1.35,
          color: '#C9C3B6',
          marginTop: 10,
        }}
      >
        {en}
      </div>
    </div>
  );
}

/** Archive look on top of any photo shot. */
export function Archive({ children }: { children: React.ReactNode }) {
  return (
    <AbsoluteFill>
      {children}
      <Vignette />
      <Grain />
    </AbsoluteFill>
  );
}

/** Fades its children in over the frames where the previous picture is still showing. */
export function CrossIn({ children, frames = 12 }: { children: React.ReactNode; frames?: number }) {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(frame, [0, frames], [0, 1], {
          extrapolateRight: 'clamp',
        }),
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/** German text that writes itself exactly as fast as it is spoken. */
export function SpokenText({ p, start, end, style }: { p: Para; start: number; end: number; style: React.CSSProperties }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = spokenCount(p, start, end, frame, fps);
  const text = p.tts.slice(start, end);
  return (
    <div style={style}>
      <span>{text.slice(0, n)}</span>
      <span style={{ opacity: 0 }}>{text.slice(n)}</span>
    </div>
  );
}
