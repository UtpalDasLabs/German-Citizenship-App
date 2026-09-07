import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';

import { OptionImage, QuestionVisual } from '@/components/QuestionVisual';
import { Txt, useShadow } from '@/components/ui';
import { meta } from '@/lib/questions';
import type { Language, Question } from '@/lib/types';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * A two-sided card. The front asks the question; the back gives the answer plus
 * a plain-English explanation. Flipping is a 3D Y-rotation, with each face
 * hidden past 90 degrees so they never bleed through each other.
 */
export function Flashcard({
  question,
  flipped,
  onFlip,
  language,
  labels,
}: {
  question: Question;
  flipped: boolean;
  onFlip: () => void;
  language: Language;
  labels: { tapToFlip: string; answer: string; why: string };
}) {
  const { colors, radius, space } = useTheme();
  const shadow = useShadow(3);
  const topic = meta.topics[question.topic];

  const spin = useDerivedValue(() => withTiming(flipped ? 1 : 0, { duration: 420 }), [flipped]);

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
    inset: 0 as unknown as number,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: space.xl,
    overflow: 'hidden' as const,
  };

  const showDe = language !== 'en';
  const showEn = language !== 'de' && question.en.text != null;

  return (
    <Pressable
      onPress={onFlip}
      accessibilityRole="button"
      accessibilityLabel={flipped ? labels.answer : labels.tapToFlip}
      style={{ flex: 1 }}
    >
      <View style={[{ flex: 1 }, shadow, { borderRadius: radius.xl }]}>
        {/* Front */}
        <Animated.View style={[face, frontStyle]}>
          <TopicBadge label={topic.label[language === 'de' ? 'de' : 'en']} color={topic.color} icon={question.icon} />
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: space.lg, paddingVertical: space.lg }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ alignItems: 'center' }}>
              <QuestionVisual question={question} color={topic.color} size={124} />
            </View>
            {showDe ? (
              <Txt variant="heading" style={{ textAlign: 'center' }}>
                {question.de.text}
              </Txt>
            ) : null}
            {showEn ? (
              <Txt variant={showDe ? 'body' : 'heading'} tone={showDe ? 'muted' : 'default'} style={{ textAlign: 'center' }}>
                {question.en.text}
              </Txt>
            ) : null}
          </ScrollView>
          <Txt variant="caption" tone="faint" style={{ textAlign: 'center' }}>
            {labels.tapToFlip}
          </Txt>
        </Animated.View>

        {/* Back */}
        <Animated.View style={[face, backStyle, { backgroundColor: colors.bgElevated }]}>
          <TopicBadge label={labels.answer} color={topic.color} icon="✅" />
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: space.lg, paddingVertical: space.lg }}
            showsVerticalScrollIndicator={false}
          >
            <AnswerBlock question={question} language={language} color={topic.color} />
            {question.context ? (
              <View
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderRadius: radius.md,
                  padding: space.lg,
                  gap: space.xs,
                }}
              >
                <Txt variant="overline" tone="faint">
                  {labels.why.toUpperCase()}
                </Txt>
                <Txt variant="small" tone="muted">
                  {question.context}
                </Txt>
              </View>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>
    </Pressable>
  );
}

function AnswerBlock({ question, language, color }: { question: Question; language: Language; color: string }) {
  const { space } = useTheme();
  const de = question.de.options[question.answer];
  const en = question.en.options?.[question.answer];
  const isPicture = question.imageMode === 'options';

  return (
    <View style={{ alignItems: 'center', gap: space.md }}>
      {isPicture ? (
        <OptionImage imageKey={question.images[['a', 'b', 'c', 'd'].indexOf(question.answer)]} size={140} />
      ) : null}
      {language !== 'en' ? (
        <Txt variant="title" style={{ textAlign: 'center', color }}>
          {de}
        </Txt>
      ) : null}
      {language !== 'de' && en ? (
        <Txt variant={language === 'en' ? 'title' : 'body'} tone={language === 'en' ? 'default' : 'muted'} style={{ textAlign: 'center' }}>
          {en}
        </Txt>
      ) : null}
    </View>
  );
}

function TopicBadge({ label, color, icon }: { label: string; color: string; icon: string }) {
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
