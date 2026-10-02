import type { Question } from '../../../src/lib/types';
import keyTermsJson from '../../../src/data/keyTerms.json';
import questionsJson from '../../../src/data/questions.json';
import shortWhy from '../content/shortWhy.json';
import { buildScript, type KeyTerms, type Script } from './script.mjs';

const QUESTIONS = questionsJson as unknown as Question[];
const TERMS = keyTermsJson as unknown as Record<string, KeyTerms>;
const WHY = shortWhy as unknown as Record<string, string>;

export type Loaded = { q: Question; terms: KeyTerms | undefined; script: Script };

export function load(id: number): Loaded {
  const q = QUESTIONS.find((x) => x.id === id);
  if (!q) throw new Error(`There is no question ${id} in the catalogue.`);
  const terms = TERMS[String(id)];
  return { q, terms, script: buildScript(q, terms, WHY[String(id)]) };
}
