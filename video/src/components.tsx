import React from 'react';
import { Img, staticFile } from 'remotion';

import { alpha, C, FONT, GOLD } from './lib/brand';

/** A span of text to tint, with how far its highlight has faded in (0-1). */
export type Mark = { term: string; color: string; strength: number };

/**
 * Text with some words highlighted - the on-screen half of "words to
 * remember". Matching is case-insensitive and every occurrence is marked.
 */
export function Highlighted({ text, marks }: { text: string; marks: Mark[] }) {
  type Range = { start: number; end: number; mark: Mark };
  const lower = text.toLowerCase();
  const ranges: Range[] = [];
  for (const mark of marks) {
    if (mark.strength <= 0 || !mark.term) continue;
    const needle = mark.term.toLowerCase();
    for (let i = lower.indexOf(needle); i >= 0; i = lower.indexOf(needle, i + needle.length)) {
      ranges.push({ start: i, end: i + needle.length, mark });
    }
  }
  ranges.sort((a, b) => a.start - b.start);

  const parts: React.ReactNode[] = [];
  let at = 0;
  for (const r of ranges) {
    if (r.start < at) continue; // overlapping match: first one wins
    if (r.start > at) parts.push(text.slice(at, r.start));
    parts.push(
      <span
        key={r.start}
        style={{
          backgroundColor: alpha(r.mark.color, 0.28 * r.mark.strength),
          boxShadow: `0 0 0 6px ${alpha(r.mark.color, 0.28 * r.mark.strength)}`,
          borderRadius: 8,
          color: r.mark.strength > 0.5 ? r.mark.color : undefined,
        }}
      >
        {text.slice(r.start, r.end)}
      </span>,
    );
    at = r.end;
  }
  if (at < text.length) parts.push(text.slice(at));
  return <>{parts}</>;
}

export type CardState = 'idle' | 'correct' | 'dim';

/** One answer, styled like the app's answer cards. */
export function OptionCard({
  letter,
  de,
  en,
  enShown,
  state,
  enter,
  fontSize,
  marks,
}: {
  letter: string;
  de: string;
  en: string | null;
  enShown: number;
  state: CardState;
  enter: number;
  fontSize: number;
  marks: Mark[];
}) {
  const correct = state === 'correct';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        padding: '22px 28px',
        borderRadius: 28,
        border: `4px solid ${correct ? C.success : C.border}`,
        backgroundColor: correct ? C.successBg : C.surface,
        opacity: enter * (state === 'dim' ? 0.4 : 1),
        transform: `translateY(${(1 - enter) * 28}px)`,
      }}
    >
      <LetterBadge letter={letter} correct={correct} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize, lineHeight: 1.2, color: correct ? C.success : C.text }}>
          <Highlighted text={de} marks={marks} />
        </div>
        {/* Space is always reserved, so cards never jump when English arrives. */}
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 32, lineHeight: 1.25, color: C.textMuted, opacity: enShown }}>
          {en ?? ' '}
        </div>
      </div>
      {correct ? <Check /> : null}
    </div>
  );
}

/** One picture answer, for questions whose options are photographs. */
export function PictureTile({
  letter,
  imageKey,
  state,
  enter,
}: {
  letter: string;
  imageKey: string;
  state: CardState;
  enter: number;
}) {
  const correct = state === 'correct';
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 28,
        border: `5px solid ${correct ? C.success : C.border}`,
        backgroundColor: correct ? C.successBg : C.surface,
        padding: 22,
        opacity: enter * (state === 'dim' ? 0.35 : 1),
        transform: `scale(${0.92 + 0.08 * enter})`,
      }}
    >
      <Img
        src={staticFile(`questions/${imageKey}.webp`)}
        style={{ width: '100%', height: 250, objectFit: 'contain', borderRadius: 12 }}
      />
      <div style={{ position: 'absolute', top: 14, left: 14 }}>
        <LetterBadge letter={letter} correct={correct} />
      </div>
      {correct ? (
        <div style={{ position: 'absolute', top: 14, right: 14 }}>
          <Check />
        </div>
      ) : null}
    </div>
  );
}

function LetterBadge({ letter, correct }: { letter: string; correct: boolean }) {
  return (
    <div
      style={{
        width: 68,
        height: 68,
        borderRadius: 34,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: correct ? C.success : C.surfaceAlt,
        color: correct ? C.onAccent : C.text,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 32,
      }}
    >
      {letter}
    </div>
  );
}

function Check() {
  return (
    <svg width="60" height="60" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="12" fill={C.success} />
      <path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke={C.onAccent} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Chip({ text, color, enter }: { text: string; color: string; enter: number }) {
  return (
    <div
      style={{
        padding: '12px 26px',
        borderRadius: 18,
        border: `3px solid ${color}`,
        backgroundColor: alpha(color, 0.12),
        color,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 38,
        opacity: enter,
        transform: `scale(${0.9 + 0.1 * enter})`,
      }}
    >
      {text}
    </div>
  );
}

export function Overline({ children, color = C.textFaint }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 4, color, textTransform: 'uppercase' }}>
      {children}
    </div>
  );
}

/** A ring that drains over the countdown, with the seconds left inside. */
export function Countdown({ progress, secondsLeft }: { progress: number; secondsLeft: number }) {
  const r = 78;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: 190, height: 190 }}>
      <svg width="190" height="190" viewBox="0 0 190 190">
        <circle cx="95" cy="95" r={r} fill="none" stroke={C.track} strokeWidth="14" />
        <circle
          cx="95"
          cy="95"
          r={r}
          fill="none"
          stroke={GOLD}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * progress}
          transform="rotate(-90 95 95)"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 84,
          color: C.text,
        }}
      >
        {secondsLeft}
      </div>
    </div>
  );
}
