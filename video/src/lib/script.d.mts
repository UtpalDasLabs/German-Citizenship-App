import type { Question } from '../../../src/lib/types';

export type Segment = { lang: 'en' | 'de'; text: string };

export type Beat = {
  name: string;
  /** Duration used when there is no narration to time it by. */
  seconds: number;
  say: Segment[];
  timing?: string;
  optionIndex?: number;
  answerIndex?: number;
  /** "why" only: whether the line was hand-written with its German marked. */
  marked?: boolean;
  /** Delivery tag for Eleven v4 ("[curious]"); never shown, never spoken. */
  tag?: string;
  /** Shown without narration; its length comes from SILENT_SECONDS. */
  silent?: boolean;
};

export type KeyTerms = { trap: boolean; ask: string[]; answer: string[] };

export type Script = {
  ref: { label: string; spoken: string };
  trap: boolean;
  picture: boolean;
  answerIndex: number;
  /** Key terms, highlighted in the question and the answer at the reveal. */
  ask: string[];
  answer: string[];
  beats: Beat[];
};

export const SILENT_SECONDS: Record<string, number>;
export const NEGATION: RegExp;
export function speakableGerman(text: string): string;
export function parseMarked(line: string): Segment[];
export function asPhrases(terms: string[], text: string): string[];
export function catalogueRef(q: Question): Script['ref'];
export function buildScript(q: Question, terms: KeyTerms | undefined, whyLine: string | undefined): Script;
