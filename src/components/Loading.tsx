import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useProgress } from '@/store/ProgressProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * True once the persisted settings and progress have been read back.
 *
 * The web build is statically pre-rendered, so anything that depends on the
 * clock, a random seed or stored progress would differ between the HTML shipped
 * from the server and the first client render. Both sides start out "not
 * ready", so gating on this keeps hydration consistent.
 */
export function useAppReady(): boolean {
  const { ready: settingsReady } = useSettings();
  const { ready: progressReady } = useProgress();
  return settingsReady && progressReady;
}

export function LoadingScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.textFaint} />
    </View>
  );
}
