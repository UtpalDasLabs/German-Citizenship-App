import React from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { AnswerOption } from '@/components/AnswerOption';
import { OptionImage, QuestionVisual } from '@/components/QuestionVisual';
import { Txt } from '@/components/ui';
import { meta } from '@/lib/questions';
import type { Language, OptionKey, Question } from '@/lib/types';
import { useTheme } from '@/theme/ThemeProvider';

const KEYS: OptionKey[] = ['a', 'b', 'c', 'd'];

/**
 * A two-sided card. The front asks and offers the four official choices; the
 * back says whether the pick was right, gives the answer, why it is right, and
 * what it means in everyday life. Flipping is a 3D Y-rotation with each face
 * hidden past 90 degrees so they never bleed through one another.
 *
 * Picking is what turns the card: the exam is multiple choice, so answering
 * one is a better rehearsal than deciding for yourself whether you knew it -
 * and it grades honestly, which self-assessment does not.
 */
export function Flashcard({
  question,
  picked,
  onPick,
  language,
  labels,
}: {
  question: Question;
  /** The option the learner tapped, or null while the card is still a question. */
  picked: OptionKey | null;
  onPick: (key: OptionKey) => void;
  language: Language;
  labels: {
    answer: string;
    why: string;
    realLife: string;
    correct: string;
    wrong: string;
    youPicked: string;
  };
}) {
  const { colors, radius, space } = useTheme();
  const topic = meta.topics[question.topic];

  const flipped = picked != null;
  const right = picked === question.answer;

  const spin = useDerivedValue(() => withTiming(flipped ? 1 : 0, { duration: 380 }), [flipped]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(spin.value, [0, 1], [0, 180])}deg` }],
    opacity: spin.value < 0.5 ? 1 : 0,
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(spin.value, [0, 1], [180, 360])}deg` }],
    opacity: spin.value >= 0.5 ? 1 : 0,
  }));

  const face = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 3,
    borderColor: colors.border,
    padding: space.lg,
    overflow: 'hidden' as const,
  };

  const pictureOptions = question.imageMode === 'options';
  const showDe = language !== 'en';
  const showEn = language !== 'de' && question.en.text != null;

  return (
    <View style={{ flex: 1 }}>
      {/* Both faces stay mounted and stacked, and opacity 0 does not stop a
          web browser from routing taps to the hidden one - so the face that is
          turned away is explicitly taken out of hit testing. Without this the
          invisible back swallows every tap aimed at an answer option. */}
      <Animated.View style={[face, frontStyle]} pointerEvents={flipped ? 'none' : 'auto'}>
        <Badge label={topic.label[language === 'de' ? 'de' : 'en']} color={topic.color} icon={question.icon} />
        <ScrollView
          contentContainerStyle={{ gap: space.md, paddingVertical: space.md }}
          showsVerticalScrollIndicator={false}
        >
          {/* Picture-choice questions carry their image on each option, so a
              visual up here would just be one of the four answers. */}
          {pictureOptions ? null : (
            <View style={{ alignItems: 'center' }}>
              <QuestionVisual question={question} color={topic.color} size={92} />
            </View>
          )}
          {showDe ? (
            <Txt variant="bodyStrong" style={{ textAlign: 'center' }}>
              {question.de.text}
            </Txt>
          ) : null}
          {showEn ? (
            <Txt
              variant={showDe ? 'small' : 'bodyStrong'}
              tone={showDe ? 'muted' : 'default'}
              style={{ textAlign: 'center' }}
            >
              {question.en.text}
            </Txt>
          ) : null}

          <View style={{ gap: space.sm, marginTop: space.xs }}>
            {KEYS.map((key) => (
              <AnswerOption
                key={key}
                optionKey={key}
                de={question.de.options[key]}
                en={question.en.options?.[key]}
                language={language}
                state="idle"
                imageKey={pictureOptions ? question.images[KEYS.indexOf(key)] : undefined}
                onPress={() => onPick(key)}
              />
            ))}
          </View>
        </ScrollView>
      </Animated.View>

      <Animated.View
        style={[face, backStyle, { backgroundColor: colors.bgElevated }]}
        pointerEvents={flipped ? 'auto' : 'none'}
      >
        <Badge
          label={right ? labels.correct : labels.wrong}
          color={right ? colors.success : colors.danger}
          icon={right ? '✅' : '❌'}
        />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: space.md, paddingVertical: space.md }}
          showsVerticalScrollIndicator={false}
        >
          <AnswerBlock question={question} language={language} color={colors.success} />

          {/* Only shown after a miss: naming the wrong pick is what stops the
              same confusion repeating next time the card comes round. */}
          {!right && picked != null ? (
            <View style={{ alignItems: 'center' }}>
              <Txt variant="small" tone="danger" style={{ textAlign: 'center' }}>
                {labels.youPicked}: {picked.toUpperCase()} ·{' '}
                {language === 'en' ? (question.en.options?.[picked] ?? question.de.options[picked]) : question.de.options[picked]}
              </Txt>
            </View>
          ) : null}

          {question.context ? (
            <Note label={labels.why} tint={colors.info} bg={colors.infoBg}>
              {question.context}
            </Note>
          ) : null}
          {question.realLife ? (
            <Note label={labels.realLife} tint={colors.streak} bg={colors.surfaceAlt}>
              {question.realLife[language === 'de' ? 'de' : 'en']}
            </Note>
          ) : null}

        </ScrollView>
      </Animated.View>
    </View>
  );
}

function Note({
  label,
  tint,
  bg,
  children,
}: {
  label: string;
  tint: string;
  bg: string;
  children: React.ReactNode;
}) {
  const { radius, space } = useTheme();
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.md, padding: space.md, gap: space.xs }}>
      <Txt variant="overline" style={{ color: tint }}>
        {label.toUpperCase()}
      </Txt>
      <Txt variant="small" tone="muted">
        {children}
      </Txt>
    </View>
  );
}

function AnswerBlock({ question, language, color }: { question: Question; language: Language; color: string }) {
  const { space } = useTheme();
  const de = question.de.options[question.answer];
  const en = question.en.options?.[question.answer];
  const isPicture = question.imageMode === 'options';

  return (
    <View style={{ alignItems: 'center', gap: space.sm }}>
      {isPicture ? (
        <OptionImage imageKey={question.images[['a', 'b', 'c', 'd'].indexOf(question.answer)]} size={132} />
      ) : null}
      {language !== 'en' ? (
        <Txt variant="title" style={{ textAlign: 'center', color }}>
          {de}
        </Txt>
      ) : null}
      {language !== 'de' && en ? (
        <Txt
          variant={language === 'en' ? 'title' : 'body'}
          tone={language === 'en' ? 'default' : 'muted'}
          style={[{ textAlign: 'center' }, language === 'en' ? { color } : null]}
        >
          {en}
        </Txt>
      ) : null}
    </View>
  );
}

function Badge({ label, color, icon }: { label: string; color: string; icon: string }) {
  const { radius, space } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: space.xs,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: radius.pill,
        backgroundColor: `${color}22`,
      }}
    >
      <Txt variant="caption">{icon}</Txt>
      <Txt variant="caption" style={{ color }}>
        {label}
      </Txt>
    </View>
  );
}
