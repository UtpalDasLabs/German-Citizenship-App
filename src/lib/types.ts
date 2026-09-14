export type OptionKey = 'a' | 'b' | 'c' | 'd';

export type TopicKey =
  | 'constitution'
  | 'democracy'
  | 'institutions'
  | 'history'
  | 'law'
  | 'work'
  | 'society'
  | 'europe'
  | 'states';

export type Question = {
  id: number;
  kind: 'general' | 'state';
  state: string | null;
  topic: TopicKey;
  icon: string;
  /** SVG scene key, or null when the question carries official exam photos. */
  illustration: string | null;
  /** Asset keys into `questionImages`; empty for text-only questions. */
  images: string[];
  /** `single` = one picture for the question, `options` = one picture per answer. */
  imageMode: 'single' | 'options' | null;
  imageCredit: string | null;
  de: { text: string; options: Record<OptionKey, string> };
  en: { text: string | null; options: Record<OptionKey, string> | null };
  /** Plain-English explanation of why the answer is right. */
  context: string | null;
  /** What this actually means for someone living in Germany. */
  realLife: { de: string; en: string } | null;
  /** Key of a longer topic explainer this question belongs to, if any. */
  deepDive: string | null;
  answer: OptionKey;
};

export type Topic = {
  label: { de: string; en: string };
  icon: string;
  color: string;
};

export type StateInfo = { name: string; code: string; capital: string };

export type Meta = {
  topics: Record<TopicKey, Topic>;
  states: StateInfo[];
  counts: { total: number; general: number; state: number; withImages: number };
};

export type Language = 'de' | 'en' | 'both';
export type Appearance = 'system' | 'light' | 'dark';

/** Daily XP target. Named so the UI can show intent, not just a number. */
export type GoalId = 'casual' | 'regular' | 'serious' | 'intense';

export type Settings = {
  language: Language;
  state: string | null;
  appearance: Appearance;
  haptics: boolean;
  /** Daily XP goal. */
  goal: GoalId;
  /** ISO yyyy-mm-dd of the planned exam date, or null if undecided. */
  examDate: string | null;
  /** Dismissed the storage explainer, so it stops appearing on Home. */
  storageNoticeSeen: boolean;
  /** Whether durable storage has been granted by the browser. */
  storagePersisted: boolean;
};

/**
 * Leitner-box scheduling state for a single question.
 * Box 0 = brand new, box 5 = mastered. A correct answer promotes, a wrong one
 * sends the card back to box 0.
 */
export type CardProgress = {
  box: number;
  seen: number;
  correct: number;
  /** epoch ms of the last review */
  last: number;
  /** epoch ms this card becomes due again */
  due: number;
};

export type ExamResult = {
  at: number;
  correct: number;
  total: number;
  passed: boolean;
  /** seconds actually used */
  duration: number;
};

export type Progress = {
  cards: Record<string, CardProgress>;
  exams: ExamResult[];
  /** yyyy-mm-dd of the last day any card was studied */
  lastStudyDay: string | null;
  streak: number;
  bestStreak: number;
  /** Lifetime XP. */
  xp: number;
  /** XP earned on `xpDay`; resets when the day rolls over. */
  xpToday: number;
  xpDay: string | null;
  /** yyyy-mm-dd for each day the daily goal was met, newest first, capped. */
  goalDays: string[];
};
