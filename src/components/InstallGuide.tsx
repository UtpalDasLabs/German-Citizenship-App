import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform, View } from 'react-native';

import { Button, Txt } from '@/components/ui';
import {
  canPromptInstall,
  detectPlatform,
  isEmbeddedArtifact,
  isInstalled,
  isIosSafari,
  onInstallable,
  promptInstall,
  type InstallPlatform,
} from '@/lib/install';
import { useT } from '@/lib/useT';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * How to get the app onto a home screen.
 *
 * Chromium hands us a real prompt, so Android and desktop get a button. Safari
 * has never implemented that API, so iOS users are shown the actual taps -
 * which is the whole point, since nothing in the UI otherwise hints that Add to
 * Home Screen exists.
 */
export function InstallGuide({ compact = false }: { compact?: boolean }) {
  const { colors, radius, space } = useTheme();
  const { t } = useT();

  const [platform, setPlatform] = useState<InstallPlatform>('unsupported');
  const [installed, setInstalled] = useState(false);
  const [promptable, setPromptable] = useState(false);
  const [done, setDone] = useState(false);
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    setEmbedded(isEmbeddedArtifact());
    setPlatform(detectPlatform());
    setInstalled(isInstalled());
    setPromptable(canPromptInstall());
    return onInstallable(() => {
      setPromptable(canPromptInstall());
      setInstalled(isInstalled());
    });
  }, []);

  const onInstall = useCallback(async () => {
    const accepted = await promptInstall();
    setPromptable(canPromptInstall());
    if (accepted) setDone(true);
  }, []);

  if (Platform.OS !== 'web') return null;
  // Inside an embedded artifact there is no page to install.
  if (embedded) return null;

  if (installed || done) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        <Txt variant="small" tone="success" style={{ flex: 1 }}>
          {t('installedBody')}
        </Txt>
      </View>
    );
  }

  const steps =
    platform === 'ios' && isIosSafari()
      ? [t('iosStep1'), t('iosStep2'), t('iosStep3')]
      : platform === 'ios'
        ? [t('iosOtherBrowser')]
        : platform === 'android'
          ? [t('androidStep1'), t('androidStep2')]
          : [t('desktopStep1'), t('desktopStep2')];

  return (
    <View style={{ gap: space.md }}>
      {!compact ? (
        <Txt variant="small" tone="muted">
          {t('installWhy')}
        </Txt>
      ) : null}

      {/* Chromium can do it in one tap; everyone else gets the real steps. */}
      {promptable ? (
        <Button
          title={t('installNow')}
          full
          icon={<Ionicons name="download-outline" size={18} color={colors.onAccent} />}
          onPress={() => void onInstall()}
        />
      ) : (
        <View
          style={{
            backgroundColor: colors.surfaceAlt,
            borderRadius: radius.md,
            padding: space.md,
            gap: space.sm,
          }}
        >
          {steps.map((step, i) => (
            <View key={step} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: colors.accent,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Txt variant="caption" style={{ color: colors.onAccent }}>
                  {i + 1}
                </Txt>
              </View>
              <Txt variant="small" tone="muted" style={{ flex: 1 }}>
                {step}
              </Txt>
            </View>
          ))}
        </View>
      )}

      <Txt variant="caption" tone="faint">
        {t('installNoStore')}
      </Txt>
    </View>
  );
}
