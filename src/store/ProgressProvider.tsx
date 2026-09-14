import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { clearAll, loadJSON, saveJSON } from '@/lib/storage';
import { XP_EXAM, xpForReview } from '@/lib/goals';
import { nextStreak, review, todayKey } from '@/lib/srs';
import type { CardProgress, ExamResult, Progress } from '@/lib/types';

const DEFAULTS: Progress = {
  cards: {},
  exams: [],
  lastStudyDay: null,
  streak: 0,
  bestStreak: 0,
  xp: 0,
  xpToday: 0,
  xpDay: null,
  goalDays: [],
};

type Ctx = {
  progress: Progress;
  ready: boolean;
  card: (id: number) => CardProgress | undefined;
  /** `goalXp` lets the caller pass the user's current daily target. */
  grade: (id: number, knewIt: boolean, goalXp?: number) => void;
  recordExam: (result: ExamResult) => void;
  reset: () => void;
  restore: (next: Progress) => void;
};

const ProgressContext = createContext<Ctx>({
  progress: DEFAULTS,
  ready: false,
  card: () => undefined,
  grade: () => {},
  recordExam: () => {},
  reset: () => {},
  restore: () => {},
});

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadJSON('progress', DEFAULTS).then((p) => {
      setProgress(p);
      setReady(true);
    });
  }, []);

  const commit = useCallback((mutate: (prev: Progress) => Progress) => {
    setProgress((prev) => {
      const next = mutate(prev);
      void saveJSON('progress', next);
      return next;
    });
  }, []);

  const grade = useCallback(
    (id: number, knewIt: boolean, goalXp = 60) => {
      commit((prev) => {
        const today = todayKey();
        const streak = nextStreak(prev.lastStudyDay, prev.streak);
        const gained = xpForReview(knewIt);
        // XP resets when the calendar day rolls over, lifetime XP never does.
        const xpToday = (prev.xpDay === today ? prev.xpToday : 0) + gained;
        const metGoal = xpToday >= goalXp;
        const goalDays =
          metGoal && !prev.goalDays.includes(today)
            ? [today, ...prev.goalDays].slice(0, 400)
            : prev.goalDays;

        return {
          ...prev,
          cards: { ...prev.cards, [id]: review(prev.cards[id], knewIt) },
          lastStudyDay: today,
          streak,
          bestStreak: Math.max(prev.bestStreak, streak),
          xp: prev.xp + gained,
          xpToday,
          xpDay: today,
          goalDays,
        };
      });
    },
    [commit],
  );

  const recordExam = useCallback(
    (result: ExamResult) => {
      // Keep the last 20 attempts - enough for a trend, small enough to store.
      commit((prev) => {
        const today = todayKey();
        const xpToday = (prev.xpDay === today ? prev.xpToday : 0) + XP_EXAM;
        return {
          ...prev,
          exams: [result, ...prev.exams].slice(0, 20),
          xp: prev.xp + XP_EXAM,
          xpToday,
          xpDay: today,
        };
      });
    },
    [commit],
  );

  const reset = useCallback(() => {
    setProgress(DEFAULTS);
    void clearAll();
  }, []);

  /** Replaces all progress, e.g. when importing a backup file. */
  const restore = useCallback((next: Progress) => {
    setProgress(next);
    void saveJSON('progress', next);
  }, []);

  const cardFn = useCallback((id: number) => progress.cards[id], [progress.cards]);

  const value = useMemo(
    () => ({ progress, ready, card: cardFn, grade, recordExam, reset, restore }),
    [progress, ready, cardFn, grade, recordExam, reset, restore],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  return useContext(ProgressContext);
}
