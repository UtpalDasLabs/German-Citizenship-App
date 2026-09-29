import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { loadJSON, saveJSON } from '@/lib/storage';
import type { Settings } from '@/lib/types';

const DEFAULTS: Settings = {
  language: 'both',
  uiGerman: false,
  state: null,
  appearance: 'system',
  haptics: true,
  goal: 'regular',
  examDate: null,
  onboarded: false,
};

type Ctx = {
  settings: Settings;
  ready: boolean;
  update: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<Ctx>({ settings: DEFAULTS, ready: false, update: () => {} });

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadJSON('settings', DEFAULTS).then((s) => {
      // `uiGerman` used to be implied by `language`, so anyone already set to
      // German questions had a German interface and should keep it. New users
      // get an English interface whatever they pick for the questions.
      const migrated: Settings =
        (s as Partial<Settings>).uiGerman === undefined
          ? { ...s, uiGerman: s.language === 'de' }
          : s;
      setSettings(migrated);
      setReady(true);
    });
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      void saveJSON('settings', next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, ready, update }), [settings, ready, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}
