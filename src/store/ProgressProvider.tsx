import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { clearAll, loadJSON, saveJSON } from '@/lib/storage';
import { nextStreak, review, todayKey } from '@/lib/srs';
import type { CardProgress, ExamResult, Progress } from '@/lib/types';

const DEFAULTS: Progress = {
  cards: {},
  exams: [],
  lastStudyDay: null,
  streak: 0,
  bestStreak: 0,
};

type Ctx = {
  progress: Progress;
  ready: boolean;
  card: (id: number) => CardProgress | undefined;
  grade: (id: number, knewIt: boolean) => void;
  recordExam: (result: ExamResult) => void;
  reset: () => void;
};

const ProgressContext = createContext<Ctx>({
  progress: DEFAULTS,
  ready: false,
  card: () => undefined,
  grade: () => {},
  recordExam: () => {},
  reset: () => {},
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
    (id: number, knewIt: boolean) => {
      commit((prev) => {
        const streak = nextStreak(prev.lastStudyDay, prev.streak);
        return {
          ...prev,
          cards: { ...prev.cards, [id]: review(prev.cards[id], knewIt) },
          lastStudyDay: todayKey(),
          streak,
          bestStreak: Math.max(prev.bestStreak, streak),
        };
      });
    },
    [commit],
  );

  const recordExam = useCallback(
    (result: ExamResult) => {
      // Keep the last 20 attempts - enough for a trend, small enough to store.
      commit((prev) => ({ ...prev, exams: [result, ...prev.exams].slice(0, 20) }));
    },
    [commit],
  );

  const reset = useCallback(() => {
    setProgress(DEFAULTS);
    void clearAll();
  }, []);

  const cardFn = useCallback((id: number) => progress.cards[id], [progress.cards]);

  const value = useMemo(
    () => ({ progress, ready, card: cardFn, grade, recordExam, reset }),
    [progress, ready, cardFn, grade, recordExam, reset],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  return useContext(ProgressContext);
}
