import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressRing } from '@/components/ProgressRing';
import { Button, Card, Chip, Divider, ProgressBar, Screen, Txt } from '@/components/ui';
import { deckFor, meta } from '@/lib/questions';
import { masteredCount, overallProgress, topicStats } from '@/lib/stats';
import type { Appearance, Language } from '@/lib/types';
import { LoadingScreen, useAppReady } from '@/components/Loading';
import { useT } from '@/lib/useT';
import { useProgress } from '@/store/ProgressProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useTheme } from '@/theme/ThemeProvider';

export default function YouScreen() {
  const { colors, space, radius } = useTheme();
  const { t, locale } = useT();
  const insets = useSafeAreaInsets();
  const { settings, update } = useSettings();
  const { progress, reset } = useProgress();
  const [statesOpen, setStatesOpen] = useState(settings.state == null);

  const deck = useMemo(() => deckFor(settings.state), [settings.state]);
  const stats = useMemo(() => topicStats(deck, progress.cards), [deck, progress.cards]);
  const overall = useMemo(() => overallProgress(deck, progress.cards), [deck, progress.cards]);
  const mastered = useMemo(() => masteredCount(deck, progress.cards), [deck, progress.cards]);

  function confirmReset() {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert -- the only confirmation primitive on web
      if (typeof window === 'undefined' || window.confirm(t('resetConfirm'))) reset();
      return;
    }
    Alert.alert(t('resetProgress'), t('resetConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      { text: t('reset'), style: 'destructive', onPress: reset },
    ]);
  }

  const appReady = useAppReady();
  if (!appReady) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.lg,
          paddingHorizontal: space.lg,
          paddingBottom: space.xxxl,
          gap: space.lg,
          maxWidth: 720,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <Txt variant="display">{t('yourProgress')}</Txt>

        <Card level={2} style={{ flexDirection: 'row', alignItems: 'center', gap: space.xl }}>
          <ProgressRing value={overall} size={100} stroke={11}>
            <Txt variant="title">{Math.round(overall * 100)}%</Txt>
          </ProgressRing>
          <View style={{ flex: 1, gap: space.xs }}>
            <Txt variant="overline" tone="faint">
              {t('overall').toUpperCase()}
            </Txt>
            <Txt variant="heading">
              {mastered} / {deck.length}
            </Txt>
            <Txt variant="small" tone="muted">
              🔥 {progress.streak} {t('dayStreak')} · {locale === 'de' ? 'Rekord' : 'best'} {progress.bestStreak}
            </Txt>
          </View>
        </Card>

        <Card style={{ gap: space.md }}>
          <Txt variant="heading">{t('topicBreakdown')}</Txt>
          {stats.map((s) => (
            <View key={s.topic} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Txt variant="small">
                  {meta.topics[s.topic].icon} {meta.topics[s.topic].label[locale]}
                </Txt>
                <Txt variant="caption" tone="faint">
                  {s.mastered}/{s.total}
                </Txt>
              </View>
              <ProgressBar value={s.progress} color={meta.topics[s.topic].color} height={6} />
            </View>
          ))}
        </Card>

        {/* Bundesland */}
        <Card style={{ gap: space.md }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setStatesOpen((o) => !o)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}
          >
            <Txt variant="heading" style={{ flex: 1 }}>
              {t('yourState')}
            </Txt>
            <Txt variant="small" tone="muted">
              {settings.state ?? t('pickState')}
            </Txt>
            <Ionicons name={statesOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textFaint} />
          </Pressable>

          {statesOpen ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
              {meta.states.map((s) => (
                <Chip
                  key={s.name}
                  label={s.name}
                  active={settings.state === s.name}
                  onPress={() => {
                    update({ state: settings.state === s.name ? null : s.name });
                    setStatesOpen(false);
                  }}
                />
              ))}
            </View>
          ) : null}
        </Card>

        {/* Settings */}
        <Card style={{ gap: space.lg }}>
          <Txt variant="heading">{t('settings')}</Txt>

          <View style={{ gap: space.sm }}>
            <Txt variant="small" tone="muted">
              {t('language')}
            </Txt>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              {(
                [
                  ['de', t('langDe')],
                  ['en', t('langEn')],
                  ['both', t('langBoth')],
                ] as [Language, string][]
              ).map(([value, label]) => (
                <Chip
                  key={value}
                  label={label}
                  active={settings.language === value}
                  onPress={() => update({ language: value })}
                />
              ))}
            </View>
          </View>

          <Divider />

          <View style={{ gap: space.sm }}>
            <Txt variant="small" tone="muted">
              {t('appearance')}
            </Txt>
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              {(
                [
                  ['system', t('themeSystem')],
                  ['light', t('themeLight')],
                  ['dark', t('themeDark')],
                ] as [Appearance, string][]
              ).map(([value, label]) => (
                <Chip
                  key={value}
                  label={label}
                  active={settings.appearance === value}
                  onPress={() => update({ appearance: value })}
                />
              ))}
            </View>
          </View>

          {Platform.OS !== 'web' ? (
            <>
              <Divider />
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Txt variant="body" style={{ flex: 1 }}>
                  {t('haptics')}
                </Txt>
                <Switch value={settings.haptics} onValueChange={(v) => update({ haptics: v })} />
              </View>
            </>
          ) : null}
        </Card>

        <Card style={{ gap: space.sm }}>
          <Txt variant="heading">{t('about')}</Txt>
          <Txt variant="small" tone="muted">
            {t('aboutBody')}
          </Txt>
          <View
            style={{
              flexDirection: 'row',
              gap: space.md,
              marginTop: space.sm,
              padding: space.md,
              borderRadius: radius.md,
              backgroundColor: colors.surfaceAlt,
            }}
          >
            <Txt variant="caption" tone="faint" style={{ flex: 1 }}>
              {meta.counts.total} {t('questions')} · {meta.counts.general} {t('generalQuestions').toLowerCase()} ·{' '}
              {meta.states.length} {locale === 'de' ? 'Bundesländer' : 'federal states'}
            </Txt>
          </View>
        </Card>

        <Button
          title={t('resetProgress')}
          variant="ghost"
          full
          icon={<Ionicons name="trash-outline" size={18} color={colors.danger} />}
          onPress={confirmReset}
          style={{ marginTop: space.md }}
        />
      </ScrollView>
    </Screen>
  );
}
