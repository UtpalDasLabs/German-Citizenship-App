import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingScreen, useAppReady } from '@/components/Loading';
import { MascotSays } from '@/components/Mascot';
import { ProgressRing } from '@/components/ProgressRing';
import { Button, Card, ProgressBar, Screen, StatPill, Txt } from '@/components/ui';
import { forecast, formatDate, planFor } from '@/lib/forecast';
import { GOALS } from '@/lib/goals';
import { deckFor } from '@/lib/questions';
import { isDue, todayKey } from '@/lib/srs';
import { useT } from '@/lib/useT';
import { useProgress } from '@/store/ProgressProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useTheme } from '@/theme/ThemeProvider';

export default function HomeScreen() {
  const { colors, space, radius } = useTheme();
  const { settings } = useSettings();
  const { progress } = useProgress();
  const { t, locale } = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const deck = useMemo(() => deckFor(settings.state), [settings.state]);
  const dueCount = useMemo(() => deck.filter((q) => isDue(progress.cards[q.id])).length, [deck, progress.cards]);
  const f = useMemo(() => forecast(deck, progress.cards, settings.goal), [deck, progress.cards, settings.goal]);
  const plan = useMemo(
    () => (settings.examDate ? planFor(f, settings.examDate, settings.goal) : null),
    [f, settings.examDate, settings.goal],
  );

  const goalXp = GOALS[settings.goal].xp;
  const xpToday = progress.xpDay === todayKey() ? progress.xpToday : 0;
  const goalProgress = Math.min(1, xpToday / goalXp);
  const goalDone = xpToday >= goalXp;
  const started = progress.xp > 0;

  const appReady = useAppReady();
  if (!appReady) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.md,
          paddingHorizontal: space.lg,
          paddingBottom: space.xxxl,
          gap: space.lg,
          maxWidth: 640,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* wordmark */}
        <View>
          <Txt variant="title">{t('appName')}</Txt>
          <Txt variant="caption" tone="faint">
            {t('appSubtitle').toUpperCase()}
          </Txt>
        </View>

        {/* top counters */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
          <StatPill
            icon={<Ionicons name="flame" size={22} color={progress.streak > 0 ? colors.streak : colors.textFaint} />}
            value={String(progress.streak)}
            color={progress.streak > 0 ? colors.streak : colors.textFaint}
            label={t('dayStreak')}
          />
          <StatPill
            icon={<Ionicons name="flash" size={22} color={colors.xp} />}
            value={String(progress.xp)}
            color={colors.xp}
            label={t('totalXp')}
          />
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => router.push('/(tabs)/you')}
            accessibilityRole="button"
            accessibilityLabel={t('settings')}
            hitSlop={10}
          >
            <Ionicons name="settings-outline" size={22} color={colors.textFaint} />
          </Pressable>
        </View>

        {/* mascot + daily goal */}
        <MascotSays mood={goalDone ? 'celebrate' : started ? 'happy' : 'idle'} size={96}>
          <Txt variant="bodyStrong">
            {goalDone ? t('goalMet') : started ? t('continueStudying') : t('welcomeBack')}
          </Txt>
          <Txt variant="small" tone="muted">
            {goalDone
              ? t('goalMetBody')
              : `${xpToday} / ${goalXp} ${t('xpToday')}`}
          </Txt>
        </MascotSays>

        <Card level={2} style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
            <ProgressRing value={goalProgress} size={84} stroke={12} color={colors.success}>
              <Txt variant="heading">{Math.round(goalProgress * 100)}%</Txt>
            </ProgressRing>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt variant="overline" tone="faint">
                {t('dailyGoal').toUpperCase()}
              </Txt>
              <Txt variant="heading">
                {t(`goal${settings.goal[0].toUpperCase()}${settings.goal.slice(1)}` as 'goalRegular')}
              </Txt>
              <Txt variant="small" tone="muted">
                {GOALS[settings.goal].cards} {t('cardsADay')}
              </Txt>
            </View>
          </View>

          <Button
            title={started ? t('continueStudying') : t('startStudying')}
            size="lg"
            full
            icon={<Ionicons name="play" size={20} color={colors.onAccent} />}
            onPress={() => router.push('/study?mode=due')}
          />
        </Card>

        {/* exam readiness */}
        <Pressable onPress={() => router.push('/plan')} accessibilityRole="button">
          <Card style={{ gap: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Txt variant="heading" style={{ flex: 1 }}>
                {t('readyLabel')}
              </Txt>
              <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
            </View>

            <ProgressBar value={f.score} color={colors.info} />
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
              <Txt variant="heading" tone="info">
                {Math.round(f.score * 100)}%
              </Txt>
              <Txt variant="small" tone="muted" style={{ flex: 1 }}>
                {f.started} / {f.total} {t('cardsStarted')}
                {f.ready > 0 ? ` · ${f.ready} ${t('cardsMastered').toLowerCase()}` : ''}
              </Txt>
            </View>

            {plan ? (
              plan.daysLeft <= 0 ? (
                <Banner tone="info" text={t('examPassed')} colors={colors} radius={radius} space={space} />
              ) : plan.impossible ? (
                <Banner
                  tone="danger"
                  text={`${t('tooSoonBody')} ${f.minimumDays} ${locale === 'de' ? 'Tagen' : 'days'}.`}
                  colors={colors}
                  radius={radius}
                  space={space}
                />
              ) : plan.onTrack ? (
                <Banner
                  tone="success"
                  text={`${t('onTrack')} — ${plan.daysLeft} ${t('daysToGo')}`}
                  colors={colors}
                  radius={radius}
                  space={space}
                />
              ) : (
                <Banner
                  tone="danger"
                  text={`${t('needMoreBody')} ${plan.cardsPerDay} ${t('cardsADay')}`}
                  colors={colors}
                  radius={radius}
                  space={space}
                />
              )
            ) : (
              <Txt variant="small" tone="muted">
                {t('readyBy')} {formatDate(f.readyDate, locale)}
              </Txt>
            )}
          </Card>
        </Pressable>

        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Tile emoji="⚡" title={t('quickPractice')} onPress={() => router.push('/practice?count=10')} />
          <Tile emoji="🎓" title={t('mockExam')} onPress={() => router.push('/(tabs)/exam')} />
          <Tile emoji="📖" title={t('learnTitle')} onPress={() => router.push('/learn')} />
        </View>

        {dueCount > 0 ? (
          <Txt variant="caption" tone="faint" style={{ textAlign: 'center' }}>
            {dueCount} {t('dueToday').toLowerCase()}
          </Txt>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

function Banner({
  tone,
  text,
  colors,
  radius,
  space,
}: {
  tone: 'success' | 'danger' | 'info';
  text: string;
  colors: ReturnType<typeof useTheme>['colors'];
  radius: ReturnType<typeof useTheme>['radius'];
  space: ReturnType<typeof useTheme>['space'];
}) {
  const bg = { success: colors.successBg, danger: colors.dangerBg, info: colors.infoBg }[tone];
  const fg = { success: colors.success, danger: colors.danger, info: colors.info }[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.md, padding: space.md }}>
      <Txt variant="small" style={{ color: fg }}>
        {text}
      </Txt>
    </View>
  );
}

function Tile({ emoji, title, onPress }: { emoji: string; title: string; onPress: () => void }) {
  const { space } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({ flex: 1, opacity: pressed ? 0.85 : 1 })}
    >
      <Card style={{ alignItems: 'center', gap: space.xs, paddingVertical: space.lg }}>
        <Txt variant="title">{emoji}</Txt>
        <Txt variant="small" style={{ textAlign: 'center' }}>
          {title}
        </Txt>
      </Card>
    </Pressable>
  );
}
