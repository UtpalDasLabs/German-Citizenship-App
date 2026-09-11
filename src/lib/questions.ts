import rawMeta from '@/data/meta.json';
import rawQuestions from '@/data/questions.json';
import type { CardProgress, Meta, OptionKey, Question, TopicKey } from './types';
import { isDue, mastery } from './srs';

export const meta = rawMeta as unknown as Meta;
export const allQuestions = rawQuestions as unknown as Question[];

export const OPTION_KEYS: OptionKey[] = ['a', 'b', 'c', 'd'];

const byId = new Map(allQuestions.map((q) => [q.id, q]));
export function getQuestion(id: number): Question | undefined {
  return byId.get(id);
}

/**
 * The questions that count for one candidate: the 300 general ones plus the
 * 10 belonging to their Bundesland. With no state chosen yet we only study the
 * general set, so nobody memorises the wrong state's answers.
 */
export function deckFor(state: string | null): Question[] {
  return allQuestions.filter((q) => q.kind === 'general' || (state != null && q.state === state));
}

export function topicsOf(deck: Question[]): TopicKey[] {
  const seen = new Set<TopicKey>();
  for (const q of deck) seen.add(q.topic);
  return (Object.keys(meta.topics) as TopicKey[]).filter((t) => seen.has(t));
}

export type DeckFilter = {
  topic?: TopicKey | 'all';
  /** Only cards that are due for review (or never seen). */
  dueOnly?: boolean;
  /** Only cards that have been answered wrong more often than right. */
  trickyOnly?: boolean;
};

export function filterDeck(
  deck: Question[],
  cards: Record<string, CardProgress>,
  filter: DeckFilter,
  now = Date.now(),
): Question[] {
  return deck.filter((q) => {
    if (filter.topic && filter.topic !== 'all' && q.topic !== filter.topic) return false;
    const card = cards[q.id];
    if (filter.dueOnly && !isDue(card, now)) return false;
    if (filter.trickyOnly) {
      if (card == null || card.seen === 0) return false;
      if (card.correct / card.seen > 0.6) return false;
    }
    return true;
  });
}

/**
 * Orders a study session so weak cards come first but the deck never feels
 * like the same five questions on a loop.
 */
export function orderForStudy(deck: Question[], cards: Record<string, CardProgress>, seed = Date.now()): Question[] {
  const rng = mulberry32(seed);
  return [...deck]
    .map((q) => ({ q, weight: (1 - mastery(cards[q.id])) * 2 + rng() }))
    .sort((a, b) => b.weight - a.weight)
    .map((x) => x.q);
}

export function shuffle<T>(items: T[], seed = Date.now()): T[] {
  const rng = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Small deterministic PRNG so a given session can be replayed. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Official format: 33 questions - 30 general + 3 from your Bundesland. */
export const EXAM_GENERAL = 30;
export const EXAM_STATE = 3;
export const EXAM_TOTAL = EXAM_GENERAL + EXAM_STATE;
export const EXAM_PASS = 17;
export const EXAM_SECONDS = 60 * 60;

export function buildExam(state: string | null, seed = Date.now()): Question[] {
  const general = shuffle(
    allQuestions.filter((q) => q.kind === 'general'),
    seed,
  ).slice(0, EXAM_GENERAL);

  const stateQuestions = state
    ? shuffle(
        allQuestions.filter((q) => q.state === state),
        seed + 1,
      ).slice(0, EXAM_STATE)
    : // Without a chosen Bundesland we top the paper up with general questions
      // so the exam still has its full 33 and the pass mark stays meaningful.
      shuffle(
        allQuestions.filter((q) => q.kind === 'general'),
        seed + 1,
      )
        .filter((q) => !general.includes(q))
        .slice(0, EXAM_STATE);

  return [...general, ...stateQuestions];
}
