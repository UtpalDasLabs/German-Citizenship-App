import type { GoalId } from './types';

/**
 * Daily XP goals. The XP numbers are deliberately small multiples of a single
 * card review so "one more card" always visibly moves the ring.
 */
export const GOALS: Record<GoalId, { xp: number; cards: number }> = {
  casual: { xp: 30, cards: 5 },
  regular: { xp: 60, cards: 10 },
  serious: { xp: 120, cards: 20 },
  intense: { xp: 240, cards: 40 },
};

export const GOAL_ORDER: GoalId[] = ['casual', 'regular', 'serious', 'intense'];

/** XP awarded per card review. Getting it right is worth more than guessing. */
export const XP_CORRECT = 6;
export const XP_WRONG = 2;
/** Bonus for finishing a mock exam, win or lose - sitting one is the hard part. */
export const XP_EXAM = 40;

export function xpForReview(knewIt: boolean): number {
  return knewIt ? XP_CORRECT : XP_WRONG;
}

/** Roughly how many cards a goal's XP represents, for plain-language copy. */
export function cardsForGoal(goal: GoalId): number {
  return GOALS[goal].cards;
}
