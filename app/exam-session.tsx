import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnswerOption, type OptionState } from '@/components/AnswerOption';
import { QuestionVisual } from '@/components/QuestionVisual';
import { Button, Card, ProgressBar, Screen, Txt } from '@/components/ui';
import { makeHaptics } from '@/lib/haptics';
import {
  buildExam,
  EXAM_PASS,
  EXAM_SECONDS,
  EXAM_TOTAL,
  meta,
  OPTION_KEYS,
} from '@/lib/questions';
import type { OptionKey } from '@/lib/types';
import { LoadingScreen, useAppReady } from '@/components/Loading';
import { useT } from '@/lib/useT';
import { useProgress } from '@/store/ProgressProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useTheme } from '@/theme/ThemeProvider';

function formatClock(seconds: number) {
  const m = Math.floor(Math.max(0, seconds) / 60);
  const s = Math.max(0, seconds) % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ExamScreen() {
  const { colors, space, radius } = useTheme();
  const { t, locale } = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { grade, recordExam } = useProgress();

  const haptics = useMemo(() => makeHaptics(settings.haptics), [settings.haptics]);
  const [seed] = useState(() => Date.now());
  const paper = useMemo(() => buildExam(settings.state, seed), [settings.state, seed]);

  const [answers, setAnswers] = useState<Record<number, OptionKey>>({});
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(EXAM_SECONDS);
  const [submitted, setSubmitted] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const startedAt = useRef(Date.now());

  const finish = useCallback(() => {
    setSubmitted((already) => {
      if (already) return already;
      const correct = paper.filter((q) => answers[q.id] === q.answer).length;
      // A mock exam is real practice, so it feeds the same spaced-repetition
      // schedule as the flashcards.
      for (const q of paper) grade(q.id, answers[q.id] === q.answer);
      recordExam({
        at: Date.now(),
        correct,
        total: paper.length,
        passed: correct >= EXAM_PASS,
        duration: Math.round((Date.now() - startedAt.current) / 1000),
      });
      correct >= EXAM_PASS ? haptics.success() : haptics.error();
      return true;
    });
  }, [paper, answers, grade, recordExam, haptics]);

  useEffect(() => {
    if (submitted) return undefined;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          finish();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [submitted, finish]);

  const confirmSubmit = useCallback(() => {
    const missing = paper.filter((q) => answers[q.id] == null).length;
    const body = missing > 0 ? `${missing} ${t('unanswered')}` : '';
    // `Alert` is a no-op on web, so fall back to the browser confirm there.
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert -- the only confirmation primitive on web
      if (typeof window === 'undefined' || window.confirm(`${t('submitConfirm')}\n${body}`)) finish();
      return;
    }
    Alert.alert(t('submitConfirm'), body, [
      { text: t('cancel'), style: 'cancel' },
      { text: t('submitExam'), style: 'destructive', onPress: finish },
    ]);
  }, [paper, answers, finish, t]);

  const correct = paper.filter((q) => answers[q.id] === q.answer).length;
  const passed = correct >= EXAM_PASS;

  const appReady = useAppReady();
  if (!appReady) return <LoadingScreen />;

  if (submitted && !reviewing) {
    return (
      <Screen style={{ alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md }}>
        <Txt variant="display">{passed ? '🎉' : '📚'}</Txt>
        <Txt variant="title" tone={passed ? 'success' : 'danger'}>
          {passed ? t('passed') : t('failed')}
        </Txt>
        <Txt variant="small" tone="muted">
          {t('youScored')}
        </Txt>
        <Txt variant="display">
          {correct}/{paper.length}
        </Txt>
        <Txt variant="caption" tone="faint">
          {t('passMark')} · {formatClock(EXAM_SECONDS - remaining)}
        </Txt>
        {remaining === 0 ? (
          <Txt variant="caption" tone="danger">
            {t('timeUp')}
          </Txt>
        ) : null}
        <View style={{ gap: space.sm, marginTop: space.lg, alignItems: 'center' }}>
          <Button title={t('reviewAnswers')} size="lg" onPress={() => { setIndex(0); setReviewing(true); }} />
          <Button title={t('retakeExam')} variant="secondary" onPress={() => router.replace('/exam-session')} />
          <Button title={t('backHome')} variant="ghost" onPress={() => router.replace('/(tabs)')} />
        </View>
      </Screen>
    );
  }

  const question = paper[index];
  const topic = meta.topics[question.topic];
  const picked = answers[question.id];
  const isPictureOptions = question.imageMode === 'options';

  function stateFor(key: OptionKey): OptionState {
    if (!reviewing) return picked === key ? 'selected' : 'idle';
    if (key === question.answer) return 'correct';
    if (key === picked) return 'wrong';
    return 'muted';
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <Screen>
      <View
        style={{
          paddingTop: insets.top + space.sm,
          paddingHorizontal: space.lg,
          paddingBottom: space.md,
          gap: space.sm,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Pressable
            onPress={() => (reviewing ? setReviewing(false) : router.back())}
            accessibilityRole="button"
            accessibilityLabel={t('backHome')}
            hitSlop={12}
          >
            <Ionicons name="close" size={26} color={colors.textMuted} />
          </Pressable>
          <Txt variant="bodyStrong" style={{ flex: 1 }}>
            {t('question')} {index + 1} {t('of')} {paper.length}
          </Txt>
          {reviewing ? (
            <Txt variant="caption" tone={passed ? 'success' : 'danger'}>
              {correct}/{paper.length}
            </Txt>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: radius.pill,
                backgroundColor: remaining < 300 ? colors.dangerBg : colors.surfaceAlt,
              }}
            >
              <Ionicons name="time-outline" size={14} color={remaining < 300 ? colors.danger : colors.textMuted} />
              <Txt variant="caption" tone={remaining < 300 ? 'danger' : 'muted'}>
                {formatClock(remaining)}
              </Txt>
            </View>
          )}
        </View>
        <ProgressBar value={(index + 1) / paper.length} color={topic.color} height={6} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          paddingBottom: space.xl,
          gap: space.lg,
          maxWidth: 720,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <Card level={2} style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xl }}>
          {isPictureOptions ? null : <QuestionVisual question={question} color={topic.color} size={96} />}
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
                reviewing
                  ? undefined
                  : () => {
                      haptics.tap();
                      setAnswers((a) => ({ ...a, [question.id]: key }));
                    }
              }
            />
          ))}
        </View>

        {reviewing && question.context ? (
          <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: space.lg, gap: space.xs }}>
            <Txt variant="overline" tone="faint">
              {t('whyLabel').toUpperCase()}
            </Txt>
            <Txt variant="small" tone="muted">
              {question.context}
            </Txt>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          gap: space.sm,
          padding: space.lg,
          paddingBottom: insets.bottom + space.lg,
          alignItems: 'center',
        }}
      >
        <Button
          title={locale === 'de' ? 'Zurück' : 'Back'}
          variant="secondary"
          disabled={index === 0}
          onPress={() => setIndex((i) => Math.max(0, i - 1))}
        />
        <View style={{ flex: 1 }}>
          {index + 1 === paper.length && !reviewing ? (
            <Button
              title={t('submitExam')}
              size="lg"
              full
              variant="success"
              onPress={confirmSubmit}
            />
          ) : (
            <Button
              title={locale === 'de' ? 'Weiter' : 'Next'}
              size="lg"
              full
              disabled={index + 1 >= paper.length}
              onPress={() => setIndex((i) => Math.min(paper.length - 1, i + 1))}
            />
          )}
        </View>
      </View>

      {!reviewing ? (
        <Txt variant="caption" tone="faint" style={{ textAlign: 'center', paddingBottom: insets.bottom + space.sm }}>
          {answeredCount}/{EXAM_TOTAL} {locale === 'de' ? 'beantwortet' : 'answered'}
        </Txt>
      ) : null}
    </Screen>
  );
}
