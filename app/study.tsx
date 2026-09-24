import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Flashcard } from '@/components/Flashcard';
import { LoadingScreen, useAppReady } from '@/components/Loading';
import { Mascot } from '@/components/Mascot';
import { SwipeDeck, SwipeStamp } from '@/components/SwipeDeck';
import { Button, ProgressBar, Screen, Txt } from '@/components/ui';
import { GOALS } from '@/lib/goals';
import { makeHaptics } from '@/lib/haptics';
import { deckFor, filterDeck, orderForStudy } from '@/lib/questions';
import type { OptionKey, TopicKey } from '@/lib/types';
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
  /** The option tapped on this card, or null while it is still a question. */
  const [picked, setPicked] = useState<OptionKey | null>(null);
  const [correct, setCorrect] = useState(0);

  const question = queue[index];
  const goalXp = GOALS[settings.goal].xp;
  const answered = picked != null;

  /**
   * Answering is what grades the card. The exam is multiple choice, so the tap
   * is both the rehearsal and an honest result - better data for the scheduler
   * than asking someone to rate themselves after seeing the answer.
   */
  const pick = useCallback(
    (key: OptionKey) => {
      if (!question || picked != null) return;
      const right = key === question.answer;
      right ? haptics.success() : haptics.error();
      grade(question.id, right, goalXp);
      if (right) setCorrect((n) => n + 1);
      setPicked(key);
    },
    [question, picked, grade, haptics, goalXp],
  );

  /** Moves to the next card. Carries no judgement - the pick already did. */
  const advance = useCallback(() => {
    setPicked(null);
    setIndex((i) => i + 1);
  }, []);

  /**
   * Keyboard support. Swiping is a touch gesture, so without this the deck
   * would be unusable with a keyboard: a-d (or 1-4) answers, and any of
   * Enter, space or an arrow key moves on.
   */
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (!answered) {
        const byLetter = ['a', 'b', 'c', 'd'].indexOf(e.key.toLowerCase());
        const byNumber = ['1', '2', '3', '4'].indexOf(e.key);
        const slot = byLetter >= 0 ? byLetter : byNumber;
        if (slot >= 0) {
          e.preventDefault();
          pick((['a', 'b', 'c', 'd'] as OptionKey[])[slot]);
        }
        return;
      }
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answered, pick, advance]);

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
          dive={answered ? question.deepDive : null}
          label={t('deepDiveLabel')}
          onPress={(d) => router.push(`/learn?dive=${d}`)}
        />
      </View>

      <View style={{ flex: 1, paddingHorizontal: space.lg, paddingBottom: space.md }}>
        {/* Once answered, the whole card is the "next" control - which keeps
            the deck gesture-first without stranding anyone who cannot swipe.
            Before that it has no onPress, so taps reach the answer options. */}
        <Pressable
          onPress={answered ? advance : undefined}
          accessibilityRole={answered ? 'button' : undefined}
          accessibilityLabel={answered ? t('nextCard') : undefined}
          style={{ flex: 1 }}
        >
          <SwipeDeck
            cardKey={question.id}
            onSwipe={advance}
            swipeEnabled={answered}
            behind={[shell, shell]}
            overlayRight={<SwipeStamp label={t('nextCard')} color={colors.info} rotate={-12} />}
            overlayLeft={<SwipeStamp label={t('nextCard')} color={colors.info} rotate={12} />}
          >
            <Flashcard
              question={question}
              picked={picked}
              onPick={pick}
              language={settings.language}
              labels={{
                answer: t('answer'),
                why: t('whyLabel'),
                realLife: t('realLifeLabel'),
                correct: t('correctTitle'),
                wrong: t('wrongTitle'),
                youPicked: t('youPicked'),
              }}
            />
          </SwipeDeck>
        </Pressable>
      </View>

      {/* No grading buttons: answering the question is the grade. This strip
          is a hint about how to move on, not a control. */}
      <View
        style={{
          paddingHorizontal: space.lg,
          paddingBottom: insets.bottom + space.lg,
          alignItems: 'center',
        }}
      >
        <Txt variant="caption" tone="faint" style={{ textAlign: 'center' }}>
          {answered ? t('nextHint') : t('pickAnswer')}
        </Txt>
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
