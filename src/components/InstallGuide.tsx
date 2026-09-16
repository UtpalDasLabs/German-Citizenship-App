import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { type LayoutChangeEvent, Platform, Pressable, View } from 'react-native';

import { InstallArt, type InstallScene } from '@/components/InstallArt';
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

type Step = { text: string; scene?: InstallScene };

/** Widest the diagrams get: past this they are just big, not clearer. */
const ART_MAX = 260;

/**
 * How to get the app onto a home screen.
 *
 * Chromium hands us a real prompt, so Android and desktop get a button. Safari
 * has never implemented that API, so iOS users are shown the actual taps -
 * which is the whole point, since nothing in the UI otherwise hints that Add to
 * Home Screen exists. Each step carries a small drawing of what to look for,
 * because "tap Share" is useless until you know which icon that is.
 */
export function InstallGuide({ compact = false }: { compact?: boolean }) {
  const { colors, radius, space } = useTheme();
  const { t } = useT();

  const [platform, setPlatform] = useState<InstallPlatform>('unsupported');
  const [safari, setSafari] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [promptable, setPromptable] = useState(false);
  const [done, setDone] = useState(false);
  const [embedded, setEmbedded] = useState(false);
  // Shown under the one-tap button, for when the browser never offers it.
  const [manual, setManual] = useState(false);
  const [boxWidth, setBoxWidth] = useState(0);

  useEffect(() => {
    setEmbedded(isEmbeddedArtifact());
    setPlatform(detectPlatform());
    setSafari(isIosSafari());
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

  const onBox = useCallback((e: LayoutChangeEvent) => setBoxWidth(e.nativeEvent.layout.width), []);

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

  const ios: Step[] = [
    { text: t('iosStep1'), scene: 'iosShare' },
    { text: t('iosStep2'), scene: 'iosSheet' },
    { text: t('iosStep3'), scene: 'iosAdd' },
  ];

  const steps: Step[] =
    platform === 'ios'
      ? // Other iOS browsers cannot add to the home screen at all, so the first
        // thing to do is move to Safari; the taps after that are the same.
        safari
        ? ios
        : [{ text: t('iosOtherBrowser') }, ...ios]
      : platform === 'android'
        ? [
            { text: t('androidStep1'), scene: 'androidMenu' },
            { text: t('androidStep2'), scene: 'androidItem' },
            { text: t('androidStep3'), scene: 'androidAdd' },
          ]
        : [
            { text: t('desktopStep1'), scene: 'desktopBar' },
            { text: t('desktopStep2'), scene: 'desktopMenu' },
          ];

  const artWidth = Math.min(ART_MAX, Math.max(0, boxWidth - space.md * 2));

  const stepList = (
    <View
      onLayout={onBox}
      style={{
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.md,
        padding: space.md,
        gap: space.md,
      }}
    >
      {steps.map((step, i) => (
        <View key={step.text} style={{ gap: space.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }}>
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.info,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Txt variant="caption" style={{ color: '#FFFFFF' }}>
                {i + 1}
              </Txt>
            </View>
            <Txt variant="small" style={{ flex: 1 }}>
              {step.text}
            </Txt>
          </View>
          {step.scene && artWidth > 0 ? <InstallArt scene={step.scene} width={artWidth} /> : null}
        </View>
      ))}
    </View>
  );

  return (
    <View style={{ gap: space.md }}>
      {!compact ? (
        <Txt variant="small" tone="muted">
          {t('installWhy')}
        </Txt>
      ) : null}

      {/* Chromium can do it in one tap; everyone else gets the real steps. */}
      {promptable ? (
        <>
          <Button
            title={t('installNow')}
            full
            icon={<Ionicons name="download-outline" size={18} color={colors.onAccent} />}
            onPress={() => void onInstall()}
          />
          <Pressable
            onPress={() => setManual((m) => !m)}
            accessibilityRole="button"
            accessibilityState={{ expanded: manual }}
            hitSlop={8}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.xs }}
          >
            <Txt variant="small" tone="info">
              {manual ? t('installHideSteps') : t('installShowSteps')}
            </Txt>
            <Ionicons name={manual ? 'chevron-up' : 'chevron-down'} size={14} color={colors.info} />
          </Pressable>
          {manual ? stepList : null}
        </>
      ) : (
        stepList
      )}

      <Txt variant="caption" tone="faint">
        {t('installNoStore')}
      </Txt>
    </View>
  );
}
