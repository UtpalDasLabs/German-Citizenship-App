import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressRing } from '@/components/ProgressRing';
import { Button, Card, Screen, Txt, useShadow } from '@/components/ui';
import { deckFor, meta } from '@/lib/questions';
import { isDue } from '@/lib/srs';
import { masteredCount, overallProgress } from '@/lib/stats';
import { LoadingScreen, useAppReady } from '@/components/Loading';
import { useT } from '@/lib/useT';
import { useProgress } from '@/store/ProgressProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useTheme } from '@/theme/ThemeProvider';

function greetingKey(hour: number) {
  if (hour < 12) return 'goodMorning' as const;
  if (hour < 18) return 'goodAfternoon' as const;
  return 'goodEvening' as const;
}

export default function HomeScreen() {
  const { colors, space, radius } = useTheme();
  const { settings } = useSettings();
  const { progress } = useProgress();
  const { t } = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const shadow = useShadow(2);

  const deck = useMemo(() => deckFor(settings.state), [settings.state]);
  const dueCount = useMemo(
    () => deck.filter((q) => isDue(progress.cards[q.id])).length,
    [deck, progress.cards],
  );
  const mastered = useMemo(() => masteredCount(deck, progress.cards), [deck, progress.cards]);
  const readiness = useMemo(() => overallProgress(deck, progress.cards), [deck, progress.cards]);
  const started = mastered > 0 || Object.keys(progress.cards).length > 0;

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
        <View>
          <Txt variant="small" tone="muted">
            {t(greetingKey(new Date().getHours()))}
          </Txt>
          <Txt variant="display">{t('appName')}</Txt>
        </View>

        {/* Readiness hero */}
        <LinearGradient
          colors={colors.bg === '#0B1220' ? ['#1B2740', '#131C2E'] : ['#1E2A44', '#2C3A5C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[{ borderRadius: radius.xl, padding: space.xl }, shadow]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xl }}>
            <ProgressRing value={readiness} size={104} stroke={11} color="#F5B301">
              <Txt variant="title" style={{ color: '#FFFFFF' }}>
                {Math.round(readiness * 100)}%
              </Txt>
            </ProgressRing>
            <View style={{ flex: 1, gap: space.xs }}>
              <Txt variant="overline" style={{ color: '#F8C74A' }}>
                {t('readyLabel').toUpperCase()}
              </Txt>
              <Txt variant="heading" style={{ color: '#FFFFFF' }}>
                {mastered} / {deck.length}
              </Txt>
              <Txt variant="small" style={{ color: 'rgba(255,255,255,0.72)' }}>
                {t('cardsMastered')}
              </Txt>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: space.sm, marginTop: space.xl }}>
            <Stat value={String(dueCount)} label={t('dueToday')} />
            <Stat value={String(progress.streak)} label={t('dayStreak')} />
            <Stat value={String(deck.length)} label={t('questions')} />
          </View>
        </LinearGradient>

        <Button
          title={started ? t('continueStudying') : t('startStudying')}
          size="lg"
          full
          icon={<Ionicons name="flash" size={18} color={colors.onAccent} />}
          onPress={() => router.push('/study?mode=due')}
        />

        {settings.state == null ? (
          <Link href="/(tabs)/you" asChild>
            <Pressable>
              <Card
                level={1}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.md,
                  borderWidth: 1,
                  borderColor: colors.borderStrong,
                  borderStyle: 'dashed',
                }}
              >
                <Txt variant="title">🗺️</Txt>
                <View style={{ flex: 1 }}>
                  <Txt variant="bodyStrong">{t('pickState')}</Txt>
                  <Txt variant="small" tone="muted">
                    {t('pickStateSub')}
                  </Txt>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
              </Card>
            </Pressable>
          </Link>
        ) : null}

        <View style={{ gap: space.md }}>
          <ActionCard
            emoji="🃏"
            title={t('flashcards')}
            subtitle={t('flashcardsSub')}
            onPress={() => router.push('/study?mode=all')}
          />
          <ActionCard
            emoji="⚡"
            title={t('quickPractice')}
            subtitle={t('quickPracticeSub')}
            onPress={() => router.push('/practice?count=10')}
          />
          <ActionCard
            emoji="🎓"
            title={t('mockExam')}
            subtitle={t('mockExamSub')}
            onPress={() => router.push('/(tabs)/exam')}
          />
        </View>

        <Txt variant="caption" tone="faint" style={{ textAlign: 'center', marginTop: space.md }}>
          {meta.counts.general} {t('generalQuestions').toLowerCase()} ·{' '}
          {settings.state ?? `16 × 10 ${t('stateQuestions').toLowerCase()}`}
        </Txt>
      </ScrollView>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const { space, radius } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: radius.md,
        paddingVertical: space.md,
        paddingHorizontal: space.sm,
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Txt variant="heading" style={{ color: '#FFFFFF' }}>
        {value}
      </Txt>
      <Txt variant="caption" style={{ color: 'rgba(255,255,255,0.65)', textAlign: 'center' }}>
        {label}
      </Txt>
    </View>
  );
}

function ActionCard({
  emoji,
  title,
  subtitle,
  onPress,
}: {
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const { colors, space } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            backgroundColor: colors.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Txt variant="heading">{emoji}</Txt>
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="bodyStrong">{title}</Txt>
          <Txt variant="small" tone="muted">
            {subtitle}
          </Txt>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
      </Card>
    </Pressable>
  );
}
