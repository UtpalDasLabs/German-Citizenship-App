import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

import { useSettings } from '@/store/SettingsProvider';
import { dark, light, palette, radius, space, type Theme, type as typeScale } from './tokens';

const ThemeContext = createContext<Theme>({
  colors: light,
  dark: false,
  space,
  radius,
  type: typeScale,
  palette,
});

/**
 * Resolves the system colour scheme *after* mount.
 *
 * `useColorScheme()` reads the media query on first render, which on the
 * statically pre-rendered web build disagrees with the server HTML. Components
 * that never re-render (the tab bar, for one) would then stay stuck on the
 * server's light values. Starting at 'light' matches the server exactly, and the
 * effect re-renders the whole tree once with the real scheme.
 */
type Scheme = 'light' | 'dark';

function useSystemScheme(): Scheme {
  const [scheme, setScheme] = useState<Scheme>('light');

  useEffect(() => {
    setScheme(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setScheme(colorScheme === 'dark' ? 'dark' : 'light'),
    );
    return () => sub.remove();
  }, []);

  return scheme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useSystemScheme();
  const { settings } = useSettings();

  const isDark = settings.appearance === 'system' ? system === 'dark' : settings.appearance === 'dark';

  const value = useMemo<Theme>(
    () => ({
      colors: isDark ? dark : light,
      dark: isDark,
      space,
      radius,
      type: typeScale,
      palette,
    }),
    [isDark],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
