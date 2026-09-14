import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnswerOption, type OptionState } from '@/components/AnswerOption';
import { QuestionVisual } from '@/components/QuestionVisual';
import { Button, Card, ProgressBar, Screen, Txt } from '@/components/ui';
import { makeHaptics } from '@/lib/haptics';
import { GOALS } from '@/lib/goals';
import { deckFor, filterDeck, meta, OPTION_KEYS, orderForStudy } from '@/lib/questions';
import type { OptionKey, TopicKey } from '@/lib/types';
import { LoadingScreen, useAppReady } from '@/components/Loading';
import { useT } from '@/lib/useT';
import { useProgress } from '@/store/ProgressProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useTheme } from '@/theme/ThemeProvider';

export default function PracticeScreen() {
  const { colors, space, radius } = useTheme();
  const { t } = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { progress, grade } = useProgress();
  const params = useLocalSearchParams<{ count?: string; topic?: string; mode?: string }>();

  const haptics = useMemo(() => makeHaptics(settings.haptics), [settings.haptics]);
  const count = Math.max(1, Number(params.count ?? 10) || 10);
  const goalXp = GOALS[settings.goal].xp;

  const [seed, setSeed] = useState(() => Date.now());
  const queue = useMemo(() => {
    const deck = deckFor(settings.state);
    const filtered = filterDeck(deck, progress.cards, {
      topic: (params.topic as TopicKey | undefined) ?? 'all',
      trickyOnly: params.mode === 'tricky',
    });
    return orderForStudy(filtered, progress.cards, seed).slice(0, count);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- frozen for the session
  }, [seed, settings.state, params.topic, params.mode, count]);

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<OptionKey | null>(null);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const question = queue[index];
  const done = index >= queue.length;

  const check = useCallback(() => {
    if (!question || picked == null) return;
    const right = picked === question.answer;
    right ? haptics.success() : haptics.error();
    grade(question.id, right, goalXp);
    if (right) setScore((s) => s + 1);
    setChecked(true);
  }, [question, picked, grade, haptics, goalXp]);

  const next = useCallback(() => {
    setChecked(false);
    setPicked(null);
    setIndex((i) => i + 1);
  }, []);

  const restart = useCallback(() => {
    setSeed(Date.now());
    setIndex(0);
    setPicked(null);
    setChecked(false);
    setScore(0);
  }, []);

  const appReady = useAppReady();
  if (!appReady) return <LoadingScreen />;

  if (queue.length === 0) {
    return (
      <Screen style={{ alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md }}>
        <Txt variant="title">{t('noQuestions')}</Txt>
        <Button title={t('backHome')} onPress={() => router.back()} />
      </Screen>
    );
  }

  if (done) {
    const pct = Math.round((score / queue.length) * 100);
    return (
      <Screen style={{ alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md }}>
        <Txt variant="display">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</Txt>
        <Txt variant="title">{t('practiceDone')}</Txt>
        <Txt variant="display" tone={pct >= 50 ? 'success' : 'danger'}>
          {score}/{queue.length}
        </Txt>
        <View style={{ gap: space.sm, marginTop: space.lg, alignItems: 'center' }}>
          <Button title={t('tryAgain')} size="lg" onPress={restart} />
          <Button title={t('backHome')} variant="ghost" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const topic = meta.topics[question.topic];
  const isPictureOptions = question.imageMode === 'options';

  function stateFor(key: OptionKey): OptionState {
    if (!checked) return picked === key ? 'selected' : 'idle';
    if (key === question.answer) return 'correct';
    if (key === picked) return 'wrong';
    return 'muted';
  }

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
          <Ionicons name="close" size={26} color={colors.textMuted} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={index / queue.length} color={topic.color} />
        </View>
        <Txt variant="caption" tone="muted">
          {score} · {index + 1}/{queue.length}
        </Txt>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          paddingBottom: space.xxxl,
          gap: space.lg,
          maxWidth: 720,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <Card level={2} style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xl }}>
          {isPictureOptions ? null : <QuestionVisual question={question} color={topic.color} size={108} />}
          {settings.language !== 'en' ? (
            <Txt variant="heading" style={{ textAlign: 'center' }}>
              {question.de.text}
            </Txt>
          ) : null}
          {settings.language !== 'de' && question.en.text ? (
            <Txt
              variant={settings.language === 'en' ? 'heading' : 'body'}
              tone={settings.language === 'en' ? 'default' : 'muted'}
              style={{ textAlign: 'center' }}
            >
              {question.en.text}
            </Txt>
          ) : null}
        </Card>

        <View style={{ gap: space.sm }}>
          {OPTION_KEYS.map((key, i) => (
            <AnswerOption
              key={key}
              optionKey={key}
              de={question.de.options[key]}
              en={question.en.options?.[key]}
              language={settings.language}
              state={stateFor(key)}
              imageKey={isPictureOptions ? question.images[i] : undefined}
              onPress={
                checked
                  ? undefined
                  : () => {
                      haptics.tap();
                      setPicked(key);
                    }
              }
            />
          ))}
        </View>

        {checked && question.context ? (
          <View style={{ backgroundColor: colors.infoBg, borderRadius: radius.md, padding: space.lg, gap: space.xs }}>
            <Txt variant="overline" style={{ color: colors.info }}>
              {t('whyLabel').toUpperCase()}
            </Txt>
            <Txt variant="small" tone="muted">
              {question.context}
            </Txt>
          </View>
        ) : null}

        {checked && question.realLife ? (
          <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: space.lg, gap: space.xs }}>
            <Txt variant="overline" style={{ color: colors.streak }}>
              {t('realLifeLabel').toUpperCase()}
            </Txt>
            <Txt variant="small" tone="muted">
              {question.realLife[settings.language === 'de' ? 'de' : 'en']}
            </Txt>
          </View>
        ) : null}

        {checked && question.deepDive ? (
          <Button
            title={t('deepDiveLabel')}
            variant="secondary"
            full
            icon={<Ionicons name="book-outline" size={18} color={colors.text} />}
            onPress={() => router.push(`/learn?dive=${question.deepDive}`)}
          />
        ) : null}
      </ScrollView>

      <View style={{ padding: space.lg, paddingBottom: insets.bottom + space.lg }}>
        {checked ? (
          <Button
            title={index + 1 === queue.length ? t('finish') : t('nextQuestion')}
            size="lg"
            full
            onPress={next}
            icon={<Ionicons name="arrow-forward" size={18} color={colors.onAccent} />}
          />
        ) : (
          <Button title={t('checkAnswer')} size="lg" full disabled={picked == null} onPress={check} />
        )}
      </View>
    </Screen>
  );
}
