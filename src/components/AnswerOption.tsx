import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { OptionImage } from '@/components/QuestionVisual';
import { Txt } from '@/components/ui';
import type { Language, OptionKey } from '@/lib/types';
import { useTheme } from '@/theme/ThemeProvider';

export type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'muted';

/**
 * One answer choice. Before checking, the tapped option is merely `selected`;
 * afterwards the correct one turns green and a wrong pick turns red, so the
 * feedback is unambiguous without needing colour alone (icons back it up).
 */
export function AnswerOption({
  optionKey,
  de,
  en,
  language,
  state,
  imageKey,
  onPress,
}: {
  optionKey: OptionKey;
  de: string;
  en?: string | null;
  language: Language;
  state: OptionState;
  imageKey?: string;
  onPress?: () => void;
}) {
  const { colors, radius, space } = useTheme();

  const style = {
    idle: { bg: colors.surface, border: colors.border, fg: colors.text },
    selected: { bg: colors.surfaceAlt, border: colors.borderStrong, fg: colors.text },
    correct: { bg: colors.successBg, border: colors.success, fg: colors.success },
    wrong: { bg: colors.dangerBg, border: colors.danger, fg: colors.danger },
    muted: { bg: colors.surface, border: colors.border, fg: colors.textFaint },
  }[state];

  const icon = state === 'correct' ? 'checkmark-circle' : state === 'wrong' ? 'close-circle' : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={onPress == null}
      accessibilityRole="radio"
      accessibilityState={{ selected: state === 'selected' || state === 'correct' }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        padding: space.md,
        borderRadius: radius.md,
        backgroundColor: style.bg,
        borderWidth: 2,
        borderColor: style.border,
        opacity: pressed ? 0.85 : state === 'muted' ? 0.6 : 1,
      })}
    >
      <View
        style={{
          width: 30,
          height: 30,
          borderRadius: 15,
          backgroundColor: state === 'idle' || state === 'muted' ? colors.surfaceAlt : 'transparent',
          borderWidth: state === 'idle' || state === 'muted' ? 0 : 2,
          borderColor: style.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Txt variant="caption" style={{ color: style.fg }}>
          {optionKey.toUpperCase()}
        </Txt>
      </View>

      {imageKey ? <OptionImage imageKey={imageKey} size={84} /> : null}

      <View style={{ flex: 1, gap: 2 }}>
        {language !== 'en' ? <Txt variant="body" style={{ color: style.fg }}>{de}</Txt> : null}
        {language !== 'de' && en ? (
          <Txt variant={language === 'en' ? 'body' : 'small'} tone={language === 'en' ? 'default' : 'muted'} style={language === 'en' ? { color: style.fg } : undefined}>
            {en}
          </Txt>
        ) : null}
      </View>

      {icon ? <Ionicons name={icon} size={22} color={style.fg} /> : null}
    </Pressable>
  );
}
