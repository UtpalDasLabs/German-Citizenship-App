import { BOX_INTERVALS } from './srs';
import type { CardProgress, GoalId, Question } from './types';
import { GOALS } from './goals';

const DAY = 24 * 60 * 60 * 1000;

/**
 * A card counts as exam-ready at this box. Box 4 means it survived four
 * correct reviews spread over roughly two weeks, which is a fair proxy for
 * "you will still know this on test day".
 */
export const READY_BOX = 4;

export type Forecast = {
  /** Cards already at or past READY_BOX. */
  ready: number;
  /** Cards reviewed at least once, whatever box they reached. */
  started: number;
  total: number;
  /**
   * Readiness as a fraction, 0-1, giving partial credit for partial progress.
   *
   * The headline number used to be `ready / total`, which is a count of fully
   * mastered cards - so a real session of 36 cards showed 0%, because reaching
   * READY_BOX takes four correct reviews spread over a week. That reads as
   * "you achieved nothing", which is both discouraging and untrue.
   */
  score: number;
  /** Reviews still needed to bring every card to READY_BOX. */
  reviewsLeft: number;
  /** Days at the chosen pace, ignoring the spacing floor. */
  daysAtPace: number;
  /**
   * Earliest possible finish. Spaced repetition has a hard floor: a brand new
   * card needs reviews on separate days to climb the boxes, so cramming cannot
   * beat this no matter how many cards you do per day.
   */
  minimumDays: number;
  /** The realistic answer: the later of the two above. */
  days: number;
  readyDate: Date;
};

/**
 * The soonest a brand new card can reach READY_BOX, in days, given the Leitner
 * intervals. Used as a floor so the app never promises "ready tomorrow".
 */
function minimumDaysToReady(): number {
  let days = 0;
  for (let box = 0; box < READY_BOX; box += 1) days += BOX_INTERVALS[box];
  return days;
}

export function forecast(
  deck: Question[],
  cards: Record<string, CardProgress>,
  goal: GoalId,
  now = Date.now(),
): Forecast {
  let ready = 0;
  let started = 0;
  let scoreSum = 0;
  let reviewsLeft = 0;
  /** Worst remaining spacing debt across the deck, in days. */
  let longestPath = 0;

  for (const q of deck) {
    const card = cards[q.id];
    const box = card?.box ?? 0;
    if ((card?.seen ?? 0) > 0) started += 1;
    // Credit progress towards READY_BOX; boxes beyond it are already full marks.
    scoreSum += Math.min(1, box / READY_BOX);

    if (box >= READY_BOX) {
      ready += 1;
      continue;
    }
    reviewsLeft += READY_BOX - box;

    let path = 0;
    for (let b = box; b < READY_BOX; b += 1) path += BOX_INTERVALS[b];
    longestPath = Math.max(longestPath, path);
  }

  const perDay = Math.max(1, GOALS[goal].cards);
  const daysAtPace = Math.ceil(reviewsLeft / perDay);
  const minimumDays = reviewsLeft === 0 ? 0 : Math.max(1, Math.min(longestPath, minimumDaysToReady()));
  const days = Math.max(daysAtPace, minimumDays);

  return {
    ready,
    started,
    score: deck.length ? scoreSum / deck.length : 0,
    total: deck.length,
    reviewsLeft,
    daysAtPace,
    minimumDays,
    days,
    readyDate: new Date(now + days * DAY),
  };
}

/** Days between today and the target date; negative once it is in the past. */
export function daysUntil(isoDate: string, now = Date.now()): number {
  const target = new Date(`${isoDate}T00:00:00`).getTime();
  const startOfToday = new Date(new Date(now).toDateString()).getTime();
  return Math.round((target - startOfToday) / DAY);
}

export type PacePlan = {
  /** Cards per day needed to be ready by the target. */
  cardsPerDay: number;
  /** Whether the current goal is already enough. */
  onTrack: boolean;
  /** The smallest preset goal that would make the date, if any. */
  suggested: GoalId | null;
  /** True when no pace can make it, because of the spacing floor. */
  impossible: boolean;
  daysLeft: number;
};

export function planFor(
  f: Forecast,
  examDate: string,
  goal: GoalId,
  now = Date.now(),
): PacePlan {
  const daysLeft = daysUntil(examDate, now);
  if (daysLeft <= 0) {
    return { cardsPerDay: 0, onTrack: true, suggested: null, impossible: false, daysLeft };
  }

  const cardsPerDay = Math.ceil(f.reviewsLeft / daysLeft);
  // Even at infinite speed, spacing means a card needs this many days.
  const impossible = daysLeft < f.minimumDays;

  const order: GoalId[] = ['casual', 'regular', 'serious', 'intense'];
  const suggested = order.find((g) => GOALS[g].cards >= cardsPerDay) ?? null;

  return {
    cardsPerDay,
    onTrack: GOALS[goal].cards >= cardsPerDay,
    suggested,
    impossible,
    daysLeft,
  };
}

export function formatDate(date: Date, locale: 'de' | 'en'): string {
  return date.toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
