import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Flashcard } from '@/components/Flashcard';
import { Button, ProgressBar, Screen, Txt } from '@/components/ui';
import { makeHaptics } from '@/lib/haptics';
import { deckFor, filterDeck, orderForStudy } from '@/lib/questions';
import type { TopicKey } from '@/lib/types';
import { LoadingScreen, useAppReady } from '@/components/Loading';
import { useT } from '@/lib/useT';
import { useProgress } from '@/store/ProgressProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useTheme } from '@/theme/ThemeProvider';

export default function StudyScreen() {
  const { colors, space } = useTheme();
  const { t } = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { progress, grade } = useProgress();
  const params = useLocalSearchParams<{ mode?: string; topic?: string }>();

  const haptics = useMemo(() => makeHaptics(settings.haptics), [settings.haptics]);

  // The queue is built once per session so grading a card does not reshuffle
  // the deck out from under the user.
  const [seed] = useState(() => Date.now());
  const queue = useMemo(() => {
    const deck = deckFor(settings.state);
    const filtered = filterDeck(deck, progress.cards, {
      topic: (params.topic as TopicKey | undefined) ?? 'all',
      dueOnly: params.mode === 'due',
      trickyOnly: params.mode === 'tricky',
    });
    return orderForStudy(filtered, progress.cards, seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally frozen for the session
  }, [seed, settings.state, params.mode, params.topic]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const question = queue[index];

  const advance = useCallback(
    (knewIt: boolean) => {
      if (!question) return;
      knewIt ? haptics.success() : haptics.error();
      grade(question.id, knewIt);
      setReviewed((n) => n + 1);
      setFlipped(false);
      setIndex((i) => i + 1);
    },
    [question, grade, haptics],
  );

  const appReady = useAppReady();
  if (!appReady) return <LoadingScreen />;

  if (queue.length === 0) {
    return (
      <EmptyState
        title={t('noCardsDue')}
        body={t('noCardsDueSub')}
        primary={{ label: t('studyAll'), onPress: () => router.replace('/study?mode=all') }}
        secondary={{ label: t('backHome'), onPress: () => router.back() }}
      />
    );
  }

  if (!question) {
    return (
      <EmptyState
        title={t('sessionDone')}
        body={`${reviewed} ${t('cardsReviewed')}`}
        emoji="🎉"
        primary={{ label: t('keepGoing'), onPress: () => router.replace('/study?mode=all') }}
        secondary={{ label: t('backHome'), onPress: () => router.back() }}
      />
    );
  }

  return (
    <Screen>
      <View
        style={{
          paddingTop: insets.top + space.sm,
          paddingHorizontal: space.lg,
          paddingBottom: space.md,
          gap: space.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('backHome')}
            hitSlop={12}
          >
            <Ionicons name="close" size={26} color={colors.textMuted} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <ProgressBar value={index / queue.length} />
          </View>
          <Txt variant="caption" tone="muted">
            {index + 1}/{queue.length}
          </Txt>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: space.lg, paddingBottom: space.md }}>
        <Flashcard
          key={question.id}
          question={question}
          flipped={flipped}
          onFlip={() => {
            haptics.tap();
            setFlipped((f) => !f);
          }}
          language={settings.language}
          labels={{ tapToFlip: t('tapToFlip'), answer: t('answer'), why: t('whyLabel') }}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          gap: space.md,
          paddingHorizontal: space.lg,
          paddingBottom: insets.bottom + space.lg,
          opacity: flipped ? 1 : 0.35,
        }}
        pointerEvents={flipped ? 'auto' : 'none'}
      >
        <View style={{ flex: 1 }}>
          <Button
            title={t('reviewAgain')}
            variant="danger"
            size="lg"
            full
            icon={<Ionicons name="refresh" size={18} color="#FFFFFF" />}
            onPress={() => advance(false)}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title={t('knewIt')}
            variant="success"
            size="lg"
            full
            icon={<Ionicons name="checkmark" size={18} color="#FFFFFF" />}
            onPress={() => advance(true)}
          />
        </View>
      </View>
    </Screen>
  );
}

function EmptyState({
  title,
  body,
  emoji = '✨',
  primary,
  secondary,
}: {
  title: string;
  body: string;
  emoji?: string;
  primary: { label: string; onPress: () => void };
  secondary: { label: string; onPress: () => void };
}) {
  const { space } = useTheme();
  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md }}>
      <Txt variant="display">{emoji}</Txt>
      <Txt variant="title" style={{ textAlign: 'center' }}>
        {title}
      </Txt>
      <Txt variant="body" tone="muted" style={{ textAlign: 'center', maxWidth: 320 }}>
        {body}
      </Txt>
      <View style={{ gap: space.sm, marginTop: space.lg, alignItems: 'center' }}>
        <Button title={primary.label} size="lg" onPress={primary.onPress} />
        <Button title={secondary.label} variant="ghost" onPress={secondary.onPress} />
      </View>
    </Screen>
  );
}
