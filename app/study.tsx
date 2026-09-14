import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Flashcard } from '@/components/Flashcard';
import { LoadingScreen, useAppReady } from '@/components/Loading';
import { Mascot } from '@/components/Mascot';
import { SwipeDeck, SwipeStamp, type SwipeDirection } from '@/components/SwipeDeck';
import { Button, ProgressBar, Screen, Txt, useShadow } from '@/components/ui';
import { GOALS } from '@/lib/goals';
import { makeHaptics } from '@/lib/haptics';
import { deckFor, filterDeck, orderForStudy } from '@/lib/questions';
import type { TopicKey } from '@/lib/types';
import { useT } from '@/lib/useT';
import { useProgress } from '@/store/ProgressProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useTheme } from '@/theme/ThemeProvider';

export default function StudyScreen() {
  const { colors, space, radius } = useTheme();
  const { t } = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { progress, grade } = useProgress();
  const params = useLocalSearchParams<{ mode?: string; topic?: string }>();

  const haptics = useMemo(() => makeHaptics(settings.haptics), [settings.haptics]);

  // Frozen for the session so grading a card does not reshuffle the deck.
  const [seed] = useState(() => Date.now());
  const queue = useMemo(() => {
    const deck = deckFor(settings.state);
    const filtered = filterDeck(deck, progress.cards, {
      topic: (params.topic as TopicKey | undefined) ?? 'all',
      dueOnly: params.mode === 'due',
      trickyOnly: params.mode === 'tricky',
    });
    return orderForStudy(filtered, progress.cards, seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally frozen
  }, [seed, settings.state, params.mode, params.topic]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);

  const question = queue[index];
  const goalXp = GOALS[settings.goal].xp;

  const decide = useCallback(
    (knewIt: boolean) => {
      if (!question) return;
      knewIt ? haptics.success() : haptics.error();
      grade(question.id, knewIt, goalXp);
      if (knewIt) setCorrect((n) => n + 1);
      setFlipped(false);
      setIndex((i) => i + 1);
    },
    [question, grade, haptics, goalXp],
  );

  const onSwipe = useCallback((dir: SwipeDirection) => decide(dir === 'right'), [decide]);

  /**
   * Keyboard support. Swiping is a touch gesture, so without this the deck
   * would be unusable with a keyboard once the grading buttons went away.
   */
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (!flipped) return;
      if (e.key === 'ArrowRight') decide(true);
      if (e.key === 'ArrowLeft') decide(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flipped, decide]);

  const appReady = useAppReady();
  if (!appReady) return <LoadingScreen />;

  if (queue.length === 0) {
    return (
      <Done
        mood="sleeping"
        title={t('noCardsDue')}
        body={t('noCardsDueSub')}
        primary={{ label: t('studyAll'), onPress: () => router.replace('/study?mode=all') }}
        secondary={{ label: t('backHome'), onPress: () => router.back() }}
      />
    );
  }

  if (!question) {
    return (
      <Done
        mood="celebrate"
        title={t('sessionDone')}
        body={`${correct}/${queue.length} ${t('gotRight')}`}
        primary={{ label: t('keepGoing'), onPress: () => router.replace('/study?mode=all') }}
        secondary={{ label: t('backHome'), onPress: () => router.back() }}
      />
    );
  }

  const shell = (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.xl,
        borderWidth: 3,
        borderColor: colors.border,
      }}
    />
  );

  return (
    <Screen>
      <View
        style={{
          paddingTop: insets.top + space.sm,
          paddingHorizontal: space.lg,
          paddingBottom: space.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.md,
        }}
      >
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('backHome')} hitSlop={12}>
          <Ionicons name="close" size={28} color={colors.textFaint} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={index / queue.length} color={colors.success} />
        </View>
        <Txt variant="caption" tone="faint">
          {index + 1}/{queue.length}
        </Txt>

        {/* Learn more lives up here, well away from the card: on the card it
            sat inside the swipe area and was easy to open by accident. */}
        <LearnMoreButton
          dive={flipped ? question.deepDive : null}
          label={t('deepDiveLabel')}
          onPress={(d) => router.push(`/learn?dive=${d}`)}
        />
      </View>

      <View style={{ flex: 1, paddingHorizontal: space.lg, paddingBottom: space.md }}>
        <Pressable
          onPress={() => {
            haptics.tap();
            setFlipped((f) => !f);
          }}
          accessibilityRole="button"
          accessibilityLabel={flipped ? t('answer') : t('tapToFlip')}
          // Screen readers cannot swipe, so grading is exposed as rotor actions.
          accessibilityActions={
            flipped
              ? [
                  { name: 'knewIt', label: t('knewIt') },
                  { name: 'reviewAgain', label: t('reviewAgain') },
                ]
              : undefined
          }
          onAccessibilityAction={(e) => {
            if (e.nativeEvent.actionName === 'knewIt') decide(true);
            if (e.nativeEvent.actionName === 'reviewAgain') decide(false);
          }}
          style={{ flex: 1 }}
        >
          <SwipeDeck
            cardKey={question.id}
            onSwipe={onSwipe}
            swipeEnabled={flipped}
            behind={[shell, shell]}
            overlayRight={<SwipeStamp label={t('knewIt')} color={colors.success} rotate={-12} />}
            overlayLeft={<SwipeStamp label={t('reviewAgain')} color={colors.danger} rotate={12} />}
          >
            <Flashcard
              question={question}
              flipped={flipped}
              language={settings.language}
              labels={{
                tapToFlip: t('tapToFlip'),
                answer: t('answer'),
                why: t('whyLabel'),
                realLife: t('realLifeLabel'),
              }}
            />
          </SwipeDeck>
        </Pressable>
      </View>

      {/* Small round controls rather than two full-width bars: swiping is the
          primary gesture, but a tap target has to remain for anyone who does
          not swipe, and for pointer users. */}
      <View
        style={{
          paddingHorizontal: space.lg,
          paddingBottom: insets.bottom + space.lg,
          gap: space.sm,
          alignItems: 'center',
        }}
      >
        <Txt variant="caption" tone="faint" style={{ textAlign: 'center' }}>
          {flipped ? t('swipeHint') : t('tapToFlip')}
        </Txt>
        <View
          style={{ flexDirection: 'row', gap: space.xxl, opacity: flipped ? 1 : 0.3 }}
          pointerEvents={flipped ? 'auto' : 'none'}
        >
          <RoundButton
            icon="arrow-undo"
            colour={colors.danger}
            edge={colors.dangerEdge}
            label={t('reviewAgain')}
            onPress={() => decide(false)}
          />
          <RoundButton
            icon="checkmark"
            colour={colors.success}
            edge={colors.successEdge}
            label={t('knewIt')}
            onPress={() => decide(true)}
          />
        </View>
      </View>
    </Screen>
  );
}

function LearnMoreButton({
  dive,
  label,
  onPress,
}: {
  dive: string | null;
  label: string;
  onPress: (dive: string) => void;
}) {
  const { colors, radius } = useTheme();
  if (!dive) return <View style={{ width: 34 }} />;
  return (
    <Pressable
      onPress={() => onPress(dive)}
      accessibilityRole="link"
      accessibilityLabel={label}
      hitSlop={10}
      style={({ pressed }) => ({
        width: 34,
        height: 34,
        borderRadius: radius.pill,
        backgroundColor: colors.infoBg,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name="bulb" size={19} color={colors.info} />
    </Pressable>
  );
}

function RoundButton({
  icon,
  colour,
  edge,
  label,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  colour: string;
  edge: string;
  label: string;
  onPress: () => void;
}) {
  const shadow = useShadow(2);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          width: 66,
          height: 66,
          borderRadius: 33,
          backgroundColor: colour,
          borderBottomWidth: pressed ? 0 : 4,
          borderBottomColor: edge,
          marginTop: pressed ? 4 : 0,
          alignItems: 'center',
          justifyContent: 'center',
        },
        shadow,
      ]}
    >
      <Ionicons name={icon} size={30} color="#FFFFFF" />
    </Pressable>
  );
}

function Done({
  mood,
  title,
  body,
  primary,
  secondary,
}: {
  mood: 'celebrate' | 'sleeping';
  title: string;
  body: string;
  primary: { label: string; onPress: () => void };
  secondary: { label: string; onPress: () => void };
}) {
  const { space } = useTheme();
  return (
    <Screen style={{ alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md }}>
      <Mascot mood={mood} size={160} />
      <Txt variant="title" style={{ textAlign: 'center' }}>
        {title}
      </Txt>
      <Txt variant="body" tone="muted" style={{ textAlign: 'center', maxWidth: 320 }}>
        {body}
      </Txt>
      <View style={{ gap: space.sm, marginTop: space.lg, alignSelf: 'stretch', maxWidth: 340 }}>
        <Button title={primary.label} size="lg" full onPress={primary.onPress} />
        <Button title={secondary.label} variant="ghost" full onPress={secondary.onPress} />
      </View>
    </Screen>
  );
}
