import type { CardProgress } from './types';

/**
 * Leitner intervals in days, indexed by box. Box 0 is "due immediately", which
 * keeps freshly-failed cards in the current session.
 */
export const BOX_INTERVALS = [0, 1, 2, 4, 8, 21] as const;
export const MAX_BOX = BOX_INTERVALS.length - 1;

const DAY = 24 * 60 * 60 * 1000;

export function emptyCard(): CardProgress {
  return { box: 0, seen: 0, correct: 0, last: 0, due: 0 };
}

export function review(card: CardProgress | undefined, knewIt: boolean, now = Date.now()): CardProgress {
  const base = card ?? emptyCard();
  // A miss always resets to box 0 - the whole point of Leitner is that shaky
  // cards come back fast.
  const box = knewIt ? Math.min(base.box + 1, MAX_BOX) : 0;
  return {
    box,
    seen: base.seen + 1,
    correct: base.correct + (knewIt ? 1 : 0),
    last: now,
    due: now + BOX_INTERVALS[box] * DAY,
  };
}

export function isDue(card: CardProgress | undefined, now = Date.now()): boolean {
  return card == null || card.due <= now;
}

/** 0-1, how far through the boxes the card has travelled. */
export function mastery(card: CardProgress | undefined): number {
  return (card?.box ?? 0) / MAX_BOX;
}

export function todayKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** Returns the new streak given the previous study day. */
export function nextStreak(lastDay: string | null, streak: number, now = new Date()): number {
  const today = todayKey(now);
  if (lastDay === today) return streak;
  const yesterday = todayKey(new Date(now.getTime() - DAY));
  return lastDay === yesterday ? streak + 1 : 1;
}
