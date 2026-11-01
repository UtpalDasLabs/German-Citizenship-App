import { useSegments } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Txt } from '@/components/ui';
import { analyticsAvailable, setConsent, useAnalyticsConsent } from '@/lib/analytics';
import { useT } from '@/lib/useT';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Asks once whether usage statistics may be sent. Web only, and only while no
 * choice has been made. It stays out of the way of the timed mock exam and of
 * the first-run intro, and reappears on the next ordinary screen.
 */
export function ConsentBanner() {
  const consent = useAnalyticsConsent();
  const segments = useSegments();
  const { t } = useT();
  const { space } = useTheme();
  const insets = useSafeAreaInsets();

  if (!analyticsAvailable || consent !== null) return null;
  const route = segments[0] as string | undefined;
  if (route === 'exam-session' || route === 'onboarding') return null;
  // Sit above the tab bar (64px on web, see app/(tabs)/_layout.tsx) so the
  // question never blocks navigation — choosing is invited, not forced.
  const tabBar = route === '(tabs)' ? 64 : 0;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: insets.bottom + tabBar + space.md,
        paddingHorizontal: space.md,
        alignItems: 'center',
      }}
    >
      <Card
        level={3}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={{ width: '100%', maxWidth: 560, gap: space.sm }}
      >
        <Txt variant="heading">{t('consentTitle')}</Txt>
        <Txt variant="small" tone="muted">
          {t('consentBody')}
        </Txt>
        <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.xs }}>
          <Button
            title={t('consentDecline')}
            variant="secondary"
            style={{ flex: 1 }}
            onPress={() => setConsent('denied')}
          />
          <Button
            title={t('consentAccept')}
            variant="primary"
            style={{ flex: 1 }}
            onPress={() => setConsent('granted')}
          />
        </View>
      </Card>
    </View>
  );
}
