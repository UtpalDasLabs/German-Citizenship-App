import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Illustration } from '@/components/Illustration';
import { Button, Card, ProgressBar, Screen, Txt } from '@/components/ui';
import { deckFor, filterDeck, meta } from '@/lib/questions';
import { topicStats } from '@/lib/stats';
import { LoadingScreen, useAppReady } from '@/components/Loading';
import { useT } from '@/lib/useT';
import { useProgress } from '@/store/ProgressProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useTheme } from '@/theme/ThemeProvider';

export default function TopicsScreen() {
  const { colors, space, radius } = useTheme();
  const { t, locale } = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { progress } = useProgress();

  const deck = useMemo(() => deckFor(settings.state), [settings.state]);
  const stats = useMemo(() => topicStats(deck, progress.cards), [deck, progress.cards]);
  const dueCount = useMemo(
    () => filterDeck(deck, progress.cards, { dueOnly: true }).length,
    [deck, progress.cards],
  );
  const trickyCount = useMemo(
    () => filterDeck(deck, progress.cards, { trickyOnly: true }).length,
    [deck, progress.cards],
  );

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
        <Txt variant="display">{t('byTopic')}</Txt>

        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <QuickDeck
            label={t('due')}
            count={dueCount}
            icon="time"
            color={colors.accent}
            onPress={() => router.push('/study?mode=due')}
          />
          <QuickDeck
            label={t('tricky')}
            count={trickyCount}
            icon="alert-circle"
            color={colors.danger}
            onPress={() => router.push('/study?mode=tricky')}
          />
        </View>

        {stats.map((s) => {
          const topic = meta.topics[s.topic];
          return (
            <Pressable
              key={s.topic}
              accessibilityRole="button"
              onPress={() => router.push(`/study?mode=all&topic=${s.topic}`)}
              style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
            >
              <Card style={{ gap: space.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: radius.md,
                      backgroundColor: `${topic.color}1F`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Illustration name={`topic-${s.topic}`} color={topic.color} size={40} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt variant="bodyStrong">{topic.label[locale]}</Txt>
                    <Txt variant="small" tone="muted">
                      {s.mastered}/{s.total} {t('cardsMastered').toLowerCase()}
                    </Txt>
                  </View>
                  <Txt variant="caption" tone="faint">
                    {Math.round(s.progress * 100)}%
                  </Txt>
                  <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
                </View>
                <ProgressBar value={s.progress} color={topic.color} height={6} />
              </Card>
            </Pressable>
          );
        })}

        <Button
          title={t('quickPractice')}
          variant="secondary"
          full
          size="lg"
          icon={<Ionicons name="flash" size={18} color={colors.text} />}
          onPress={() => router.push('/practice?count=10')}
        />
      </ScrollView>
    </Screen>
  );
}

function QuickDeck({
  label,
  count,
  icon,
  color,
  onPress,
}: {
  label: string;
  count: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  onPress: () => void;
}) {
  const { space } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={count === 0}
      style={({ pressed }) => ({ flex: 1, opacity: count === 0 ? 0.45 : pressed ? 0.85 : 1 })}
    >
      <Card style={{ gap: space.xs, alignItems: 'flex-start' }}>
        <Ionicons name={icon} size={20} color={color} />
        <Txt variant="title">{count}</Txt>
        <Txt variant="caption" tone="muted">
          {label}
        </Txt>
      </Card>
    </Pressable>
  );
}
