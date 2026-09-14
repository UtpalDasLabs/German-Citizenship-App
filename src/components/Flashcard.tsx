import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { OptionImage, QuestionVisual } from '@/components/QuestionVisual';
import { Txt } from '@/components/ui';
import { meta } from '@/lib/questions';
import type { Language, Question } from '@/lib/types';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * A two-sided card. The front asks; the back gives the answer, why it is right,
 * and what it means in everyday life. Flipping is a 3D Y-rotation with each
 * face hidden past 90 degrees so they never bleed through one another.
 */
export function Flashcard({
  question,
  flipped,
  language,
  labels,
}: {
  question: Question;
  flipped: boolean;
  language: Language;
  labels: { tapToFlip: string; answer: string; why: string; realLife: string; learnMore: string };
}) {
  const { colors, radius, space } = useTheme();
  const router = useRouter();
  const topic = meta.topics[question.topic];

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

  const showDe = language !== 'en';
  const showEn = language !== 'de' && question.en.text != null;

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={[face, frontStyle]}>
        <Badge label={topic.label[language === 'de' ? 'de' : 'en']} color={topic.color} icon={question.icon} />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: space.lg, paddingVertical: space.md }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ alignItems: 'center' }}>
            <QuestionVisual question={question} color={topic.color} size={118} />
          </View>
          {showDe ? (
            <Txt variant="heading" style={{ textAlign: 'center' }}>
              {question.de.text}
            </Txt>
          ) : null}
          {showEn ? (
            <Txt
              variant={showDe ? 'body' : 'heading'}
              tone={showDe ? 'muted' : 'default'}
              style={{ textAlign: 'center' }}
            >
              {question.en.text}
            </Txt>
          ) : null}
        </ScrollView>
        <Txt variant="caption" tone="faint" style={{ textAlign: 'center' }}>
          {labels.tapToFlip}
        </Txt>
      </Animated.View>

      <Animated.View style={[face, backStyle, { backgroundColor: colors.bgElevated }]}>
        <Badge label={labels.answer} color={colors.success} icon="✅" />
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: space.md, paddingVertical: space.md }}
          showsVerticalScrollIndicator={false}
        >
          <AnswerBlock question={question} language={language} color={colors.success} />

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

          {question.deepDive ? (
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={labels.learnMore}
              onPress={() => router.push(`/learn?dive=${question.deepDive}`)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: space.xs,
                paddingVertical: space.sm,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Ionicons name="book-outline" size={16} color={colors.info} />
              <Txt variant="caption" style={{ color: colors.info }}>
                {labels.learnMore}
              </Txt>
            </Pressable>
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
