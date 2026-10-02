import { createContext, useContext } from 'react';

/**
 * A long-form video, already timed. Built by scripts/render-longform.mjs from
 * the script and the voice's timestamps, so every frame number here is final:
 * components only ever read it.
 */
export type Para = {
  /** Frame within the shot where this paragraph's audio starts. */
  from: number;
  frames: number;
  /** Audio file, relative to the public dir; null in a silent cut. */
  src: string | null;
  /** Exactly what the voice was sent, tags included. */
  tts: string;
  /** When each character of `tts` is spoken, in seconds from `from`. */
  starts: number[];
  /** German spans, as character ranges of `tts`. */
  de: { text: string; start: number; end: number }[];
  /** Words to punch on screen (`**…**` in the script), as ranges of `tts`. */
  punch: { text: string; start: number; end: number }[];
};

export type Shot = {
  key: string | null;
  scene: string;
  chapter: number;
  chapterTitle: string;
  /** Set on the first shot of every chapter after the cold open. */
  opensChapter: boolean;
  questions: number[];
  /** Lines under the scene in the script: what a generic scene shows. */
  screen: string[];
  from: number;
  frames: number;
  paras: Para[];
};

export type Plan = {
  topic: string;
  title: string;
  /** Every question the video covers, in order. */
  questions: number[];
  fps: number;
  total: number;
  shots: Shot[];
  /** Music, sound effects and punch-ins on (the lively cut) or off. */
  lively: boolean;
};

export const ShotContext = createContext<Shot | null>(null);

export function useShot(): Shot {
  const shot = useContext(ShotContext);
  if (!shot) throw new Error('useShot() outside a shot');
  return shot;
}

/** Frame (within the shot) where character `index` of paragraph `p` is spoken. */
export function charFrame(p: Para, index: number, fps: number): number {
  const i = Math.max(0, Math.min(index, p.starts.length - 1));
  return p.from + Math.round(p.starts[i] * fps);
}

/**
 * Frame (within the shot) where `phrase` is first spoken, searching the
 * paragraphs in order; `nth` picks a later occurrence. Falls back to `fallback`
 * (a fraction of the shot) so a reworded script degrades, not crashes.
 */
/** Frame where `phrase` is first (or `nth`) spoken in the shot, or null. */
export function findCue(shot: Shot, phrase: string, fps: number, nth = 0): number | null {
  const needle = phrase.toLowerCase();
  let seen = 0;
  for (const p of shot.paras) {
    const hay = p.tts.toLowerCase();
    let at = hay.indexOf(needle);
    while (at !== -1) {
      if (seen === nth) return charFrame(p, at, fps);
      seen++;
      at = hay.indexOf(needle, at + 1);
    }
  }
  return null;
}

/** One `> a | b @ cue` line under a scene: its fields, and when to show it. */
export type ScreenLine = { fields: string[]; at: number };

/**
 * The scene's on-screen lines, timed: a line with `@ phrase` appears when the
 * voice says the phrase; the rest appear one after another from the start.
 */
export function screenLines(shot: Shot, fps: number): ScreenLine[] {
  const n = shot.screen.length;
  const step = Math.min(Math.round(fps * 1.2), Math.round((shot.frames * 0.5) / Math.max(1, n)));
  return shot.screen.map((line, i) => {
    const [body, phrase] = line.split(' @ ');
    const fields = body.split(' | ').map((f) => f.trim());
    const spoken = phrase ? findCue(shot, phrase.trim(), fps) : null;
    return { fields, at: spoken ?? 8 + i * step };
  });
}

export function cue(shot: Shot, phrase: string, fps: number, { nth = 0, fallback = 0.5 } = {}): number {
  const needle = phrase.toLowerCase();
  let seen = 0;
  for (const p of shot.paras) {
    const hay = p.tts.toLowerCase();
    let at = hay.indexOf(needle);
    while (at !== -1) {
      if (seen === nth) return charFrame(p, at, fps);
      seen++;
      at = hay.indexOf(needle, at + 1);
    }
  }
  return Math.round(shot.frames * fallback);
}

/** Frame where paragraph `i` of the shot starts (or the shot ends, if there is none). */
export function paraStart(shot: Shot, i: number): number {
  return shot.paras[i]?.from ?? shot.frames;
}

/** How many characters of `tts[start, end)` have been spoken by `frame`. */
export function spokenCount(p: Para, start: number, end: number, frame: number, fps: number): number {
  let n = 0;
  for (let i = start; i < end; i++) {
    if (charFrame(p, i, fps) <= frame) n = i - start + 1;
  }
  return n;
}
