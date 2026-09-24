import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InstallGuide } from '@/components/InstallGuide';
import { LoadingScreen, useAppReady } from '@/components/Loading';
import { ProgressRing } from '@/components/ProgressRing';
import { Button, Card, Chip, Divider, ProgressBar, Screen, Txt } from '@/components/ui';
import {
  buildBackup,
  downloadBackup,
  isStoragePersisted,
  pickBackup,
  requestDurableStorage,
} from '@/lib/durability';
import { deckFor, meta } from '@/lib/questions';
import { forecast } from '@/lib/forecast';
import { topicStats } from '@/lib/stats';
import type { Appearance, Language } from '@/lib/types';
import { useT } from '@/lib/useT';
import { useProgress } from '@/store/ProgressProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useTheme } from '@/theme/ThemeProvider';

function confirm(message: string, onYes: () => void, title?: string, yesLabel = 'OK', cancelLabel = 'Cancel') {
  if (Platform.OS === 'web') {
    // eslint-disable-next-line no-alert -- the only confirmation primitive on web
    if (typeof window === 'undefined' || window.confirm(message)) onYes();
    return;
  }
  Alert.alert(title ?? message, title ? message : undefined, [
    { text: cancelLabel, style: 'cancel' },
    { text: yesLabel, style: 'destructive', onPress: onYes },
  ]);
}

export default function YouScreen() {
  const { colors, space, radius } = useTheme();
  const { t, locale } = useT();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings, update } = useSettings();
  const { progress, reset, restore } = useProgress();
  const [statesOpen, setStatesOpen] = useState(settings.state == null);
  const [persisted, setPersisted] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    void isStoragePersisted().then(setPersisted);
  }, []);

  const deck = useMemo(() => deckFor(settings.state), [settings.state]);
  const stats = useMemo(() => topicStats(deck, progress.cards), [deck, progress.cards]);
  const f = useMemo(() => forecast(deck, progress.cards, settings.goal), [deck, progress.cards, settings.goal]);

  const onProtect = useCallback(async () => {
    const ok = await requestDurableStorage();
    setPersisted(ok);
    setNote(ok ? t('storageSecured') : t('storageLoss'));
  }, [t]);

  const onExport = useCallback(async () => {
    const outcome = await downloadBackup(buildBackup(progress, settings));
    setNote(outcome === 'saved' ? t('exportDone') : outcome === 'declined' ? null : t('importFailed'));
  }, [progress, settings, t]);

  const onImport = useCallback(async () => {
    const file = await pickBackup();
    if (!file) {
      setNote(t('importFailed'));
      return;
    }
    confirm(t('importConfirm'), () => {
      restore(file.progress);
      if (file.settings) update(file.settings);
      setNote(t('importDone'));
    });
  }, [restore, update, t]);

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
          maxWidth: 640,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <Txt variant="display">{t('yourProgress')}</Txt>

        <Card level={2} style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <ProgressRing value={f.score} size={92} stroke={12} color={colors.info}>
            <Txt variant="heading">{Math.round(f.score * 100)}%</Txt>
            <Txt variant="caption" tone="muted">
              {t('masteryLabel').toLowerCase()}
            </Txt>
          </ProgressRing>
          <View style={{ flex: 1, gap: 2 }}>
            <Txt variant="small" tone="muted">
              <Txt variant="bodyStrong">
                {f.started} / {f.total}
              </Txt>{' '}
              {t('seenOnce')}
            </Txt>
            <Txt variant="small" tone="muted">
              <Txt variant="bodyStrong">
                {f.ready} / {f.total}
              </Txt>{' '}
              {t('readyCards')}
            </Txt>
            <Txt variant="small" tone="muted">
              🔥 {progress.streak} {t('dayStreak')} · ⚡ {progress.xp} {t('xp')}
            </Txt>
          </View>
        </Card>

        <Button
          title={t('planTitle')}
          variant="secondary"
          full
          icon={<Ionicons name="calendar" size={18} color={colors.text} />}
          onPress={() => router.push('/plan')}
        />

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
              <ProgressBar value={s.progress} color={meta.topics[s.topic].color} height={10} />
            </View>
          ))}
        </Card>

        {/* Storage - written plainly, because the consequences are real. */}
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Ionicons name="save-outline" size={20} color={colors.info} />
            <Txt variant="heading" style={{ flex: 1 }}>
              {t('storageTitle')}
            </Txt>
          </View>

          <Txt variant="small" tone="muted">
            {t('storageBody')}
          </Txt>
          <View style={{ backgroundColor: colors.dangerBg, borderRadius: radius.md, padding: space.md }}>
            <Txt variant="small" style={{ color: colors.danger }}>
              ⚠︎ {t('storageLoss')}
            </Txt>
          </View>

          {Platform.OS === 'web' ? (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <Ionicons
                  name={persisted ? 'shield-checkmark' : 'shield-outline'}
                  size={18}
                  color={persisted ? colors.success : colors.textFaint}
                />
                <Txt variant="small" tone={persisted ? 'success' : 'muted'} style={{ flex: 1 }}>
                  {persisted ? t('storageSecured') : t('storageInstall')}
                </Txt>
              </View>
              {!persisted ? (
                <Button
                  title={t('protectStorage')}
                  variant="secondary"
                  full
                  icon={<Ionicons name="shield-outline" size={18} color={colors.text} />}
                  onPress={() => void onProtect()}
                />
              ) : null}

              <Divider />
              <Txt variant="overline" tone="faint">
                {t('installTitle').toUpperCase()}
              </Txt>
              <InstallGuide />
            </>
          ) : null}

          <Divider />
          <Txt variant="overline" tone="faint">
            {t('backup').toUpperCase()}
          </Txt>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <View style={{ flex: 1 }}>
              <Button
                title={t('exportBackup')}
                variant="secondary"
                full
                icon={<Ionicons name="download-outline" size={18} color={colors.text} />}
                onPress={() => void onExport()}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Button
                title={t('importBackup')}
                variant="secondary"
                full
                icon={<Ionicons name="folder-open-outline" size={18} color={colors.text} />}
                onPress={onImport}
              />
            </View>
          </View>
          {note ? (
            <Txt variant="caption" tone="info">
              {note}
            </Txt>
          ) : null}
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
                <Chip key={value} label={label} active={settings.language === value} onPress={() => update({ language: value })} />
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
                <Chip key={value} label={label} active={settings.appearance === value} onPress={() => update({ appearance: value })} />
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
        </Card>

        <Button
          title={t('resetProgress')}
          variant="ghost"
          full
          icon={<Ionicons name="trash-outline" size={18} color={colors.danger} />}
          onPress={() => confirm(t('resetConfirm'), reset, t('resetProgress'), t('reset'), t('cancel'))}
        />
      </ScrollView>
    </Screen>
  );
}
