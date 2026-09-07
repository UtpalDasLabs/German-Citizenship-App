import { mastery } from './srs';
import type { CardProgress, Question, TopicKey } from './types';

export type TopicStat = {
  topic: TopicKey;
  total: number;
  seen: number;
  mastered: number;
  /** Average box position across the topic, 0-1. */
  progress: number;
};

/** Box 4 and 5 count as "mastered" - the card is on a long interval. */
export const MASTERED_BOX = 4;

export function topicStats(deck: Question[], cards: Record<string, CardProgress>): TopicStat[] {
  const buckets = new Map<TopicKey, Question[]>();
  for (const q of deck) {
    const list = buckets.get(q.topic) ?? [];
    list.push(q);
    buckets.set(q.topic, list);
  }

  return [...buckets.entries()].map(([topic, questions]) => {
    let seen = 0;
    let mastered = 0;
    let sum = 0;
    for (const q of questions) {
      const card = cards[q.id];
      if (card && card.seen > 0) seen += 1;
      if ((card?.box ?? 0) >= MASTERED_BOX) mastered += 1;
      sum += mastery(card);
    }
    return { topic, total: questions.length, seen, mastered, progress: sum / questions.length };
  });
}

export function overallProgress(deck: Question[], cards: Record<string, CardProgress>): number {
  if (deck.length === 0) return 0;
  return deck.reduce((sum, q) => sum + mastery(cards[q.id]), 0) / deck.length;
}

export function masteredCount(deck: Question[], cards: Record<string, CardProgress>): number {
  return deck.filter((q) => (cards[q.id]?.box ?? 0) >= MASTERED_BOX).length;
}
