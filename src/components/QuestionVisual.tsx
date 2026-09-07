import React from 'react';
import { Image, View } from 'react-native';

import { questionImages } from '@/data/questionImages';
import type { Question } from '@/lib/types';
import { useTheme } from '@/theme/ThemeProvider';
import { Illustration } from './Illustration';
import { Txt } from './ui';

/**
 * The picture side of a question. Three cases, in priority order:
 *  1. the question ships an official exam photo,
 *  2. it maps to one of the hand-drawn SVG scenes,
 *  3. neither, in which case the caller shows the topic icon instead.
 */
export function QuestionVisual({
  question,
  color,
  size = 132,
}: {
  question: Question;
  color: string;
  size?: number;
}) {
  const { colors, radius, space } = useTheme();

  if (question.imageMode === 'single' && question.images[0]) {
    const src = questionImages[question.images[0]];
    if (src) {
      return (
        <View style={{ alignItems: 'center', gap: space.xs }}>
          <Image
            source={src}
            accessibilityRole="image"
            accessibilityLabel="Question image"
            resizeMode="contain"
            style={{
              width: size * 1.4,
              height: size,
              borderRadius: radius.md,
              backgroundColor: colors.surfaceAlt,
            }}
          />
          {question.imageCredit ? (
            <Txt variant="caption" tone="faint">
              {question.imageCredit}
            </Txt>
          ) : null}
        </View>
      );
    }
  }

  // Picture-choice questions: the four candidate images *are* the question, so
  // they belong on the front of the card, not only in the answer list.
  if (question.imageMode === 'options') {
    return <OptionGrid question={question} size={size} />;
  }

  return <Illustration name={question.illustration} color={color} size={size} />;
}

/** The 2x2 board shown for picture-choice questions, labelled A-D. */
export function OptionGrid({ question, size = 132 }: { question: Question; size?: number }) {
  const { colors, radius, space } = useTheme();
  const tile = Math.max(64, size * 0.72);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: space.sm, maxWidth: tile * 2 + space.sm * 3 }}>
      {question.images.slice(0, 4).map((key, i) => (
        <View
          key={key}
          style={{
            alignItems: 'center',
            gap: 2,
            padding: space.xs,
            borderRadius: radius.md,
            backgroundColor: colors.surfaceAlt,
          }}
        >
          <OptionImage imageKey={key} size={tile} />
          <Txt variant="caption" tone="faint">
            {'ABCD'[i]}
          </Txt>
        </View>
      ))}
    </View>
  );
}

/** The 2x2 grid used when each answer option is itself a picture. */
export function OptionImage({ imageKey, size = 96 }: { imageKey: string; size?: number }) {
  const { colors, radius } = useTheme();
  const src = questionImages[imageKey];
  if (!src) return null;
  return (
    <Image
      source={src}
      accessibilityRole="image"
      resizeMode="contain"
      style={{
        width: size,
        height: size,
        borderRadius: radius.sm,
        backgroundColor: colors.surface,
      }}
    />
  );
}
