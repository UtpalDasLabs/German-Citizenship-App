import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Illustration } from '@/components/Illustration';
import { LoadingScreen, useAppReady } from '@/components/Loading';
import { Mascot } from '@/components/Mascot';
import { ProgressRing } from '@/components/ProgressRing';
import { Card, Screen, Txt, useShadow } from '@/components/ui';
import { deckFor, filterDeck, meta } from '@/lib/questions';
import { topicStats, type TopicStat } from '@/lib/stats';
import { useT } from '@/lib/useT';
import { useProgress } from '@/store/ProgressProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useTheme } from '@/theme/ThemeProvider';

/** Horizontal offsets that make the column of nodes wind like a path. */
const WEAVE = [0, 54, 78, 54, 0, -54, -78, -54, 0];

export default function PathScreen() {
  const { colors, space } = useTheme();
  const { t, locale } = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { progress } = useProgress();

  const deck = useMemo(() => deckFor(settings.state), [settings.state]);
  const stats = useMemo(() => topicStats(deck, progress.cards), [deck, progress.cards]);
  const dueCount = useMemo(() => filterDeck(deck, progress.cards, { dueOnly: true }).length, [deck, progress.cards]);
  const trickyCount = useMemo(() => filterDeck(deck, progress.cards, { trickyOnly: true }).length, [deck, progress.cards]);

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
          maxWidth: 560,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <Txt variant="display">{t('byTopic')}</Txt>

        <View style={{ flexDirection: 'row', gap: space.md }}>
          <QuickDeck
            label={t('due')}
            count={dueCount}
            icon="time"
            color={colors.info}
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

        <View style={{ alignItems: 'center', gap: space.xl, marginTop: space.md }}>
          {stats.map((s, i) => (
            <PathNode
              key={s.topic}
              stat={s}
              offset={WEAVE[i % WEAVE.length]}
              label={meta.topics[s.topic].label[locale]}
              color={meta.topics[s.topic].color}
              onPress={() => router.push(`/study?mode=all&topic=${s.topic}`)}
            />
          ))}

          <View style={{ alignItems: 'center', gap: space.sm, marginTop: space.lg }}>
            <Mascot mood="happy" size={110} />
            <Txt variant="small" tone="muted" style={{ textAlign: 'center', maxWidth: 260 }}>
              {t('pathFootnote')}
            </Txt>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

function PathNode({
  stat,
  offset,
  label,
  color,
  onPress,
}: {
  stat: TopicStat;
  offset: number;
  label: string;
  color: string;
  onPress: () => void;
}) {
  const { colors, space } = useTheme();
  const shadow = useShadow(2);
  const complete = stat.mastered === stat.total;

  return (
    <View style={{ alignItems: 'center', transform: [{ translateX: offset }], gap: space.xs }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${stat.mastered} of ${stat.total} mastered`}
        style={({ pressed }) => ({ transform: [{ translateY: pressed ? 3 : 0 }] })}
      >
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          <ProgressRing value={stat.progress} size={104} stroke={9} color={color}>
            <View
              style={[
                {
                  width: 78,
                  height: 78,
                  borderRadius: 39,
                  backgroundColor: complete ? color : colors.surface,
                  borderWidth: 3,
                  borderColor: complete ? color : colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                shadow,
              ]}
            >
              {complete ? (
                <Ionicons name="trophy" size={34} color="#FFFFFF" />
              ) : (
                <Illustration name={`topic-${stat.topic}`} color={color} size={52} />
              )}
            </View>
          </ProgressRing>
        </View>
      </Pressable>

      <Txt variant="bodyStrong" style={{ textAlign: 'center', maxWidth: 170 }}>
        {label}
      </Txt>
      <Txt variant="caption" tone="faint">
        {stat.mastered}/{stat.total}
      </Txt>
    </View>
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
        <Ionicons name={icon} size={22} color={color} />
        <Txt variant="title">{count}</Txt>
        <Txt variant="caption" tone="muted">
          {label}
        </Txt>
      </Card>
    </Pressable>
  );
}
