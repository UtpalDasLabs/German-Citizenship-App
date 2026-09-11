import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  type PressableProps,
  StyleSheet,
  Text,
  type TextProps,
  View,
  type ViewProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

/** Shadow that reads correctly on iOS, Android and the web. */
export function useShadow(level: 1 | 2 | 3 = 1): ViewStyle {
  const { colors, dark } = useTheme();
  if (dark) {
    // Elevation reads as noise on dark surfaces; a hairline border does the job.
    return { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border };
  }
  const spec = { 1: [2, 6, 0.06], 2: [6, 16, 0.09], 3: [12, 28, 0.12] }[level] as number[];
  return Platform.select<ViewStyle>({
    web: { boxShadow: `0 ${spec[0]}px ${spec[1]}px rgba(11,18,32,${spec[2]})` } as ViewStyle,
    default: {
      shadowColor: '#0B1220',
      shadowOffset: { width: 0, height: spec[0] },
      shadowOpacity: spec[2] * 2,
      shadowRadius: spec[1] / 2,
      elevation: spec[0],
    },
  })!;
}

export function Card({ style, level = 1, ...rest }: ViewProps & { level?: 1 | 2 | 3 }) {
  const { colors, radius } = useTheme();
  const shadow = useShadow(level);
  return (
    <View
      {...rest}
      style={[{ backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16 }, shadow, style]}
    />
  );
}

type TypeKey = keyof ReturnType<typeof useTheme>['type'];

export function Txt({
  variant = 'body',
  tone = 'default',
  style,
  ...rest
}: TextProps & { variant?: TypeKey; tone?: 'default' | 'muted' | 'faint' | 'accent' | 'success' | 'danger' }) {
  const { colors, type } = useTheme();
  const color = {
    default: colors.text,
    muted: colors.textMuted,
    faint: colors.textFaint,
    accent: colors.accentText,
    success: colors.success,
    danger: colors.danger,
  }[tone];
  return <Text {...rest} style={[type[variant] as object, { color }, style]} />;
}

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'success' | 'danger';
  size?: 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  full?: boolean;
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  full,
  style,
  disabled,
  ...rest
}: ButtonProps) {
  const { colors, radius, type } = useTheme();
  const shadow = useShadow(1);

  const bg = {
    primary: colors.accent,
    secondary: colors.surfaceAlt,
    ghost: 'transparent',
    success: colors.success,
    danger: colors.danger,
  }[variant];

  const fg = {
    primary: colors.onAccent,
    secondary: colors.text,
    ghost: colors.textMuted,
    success: '#FFFFFF',
    danger: '#FFFFFF',
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      {...rest}
      style={(state) => [
        {
          backgroundColor: bg,
          borderRadius: radius.pill,
          paddingVertical: size === 'lg' ? 16 : 12,
          paddingHorizontal: size === 'lg' ? 28 : 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          alignSelf: full ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.45 : state.pressed ? 0.8 : 1,
          transform: [{ scale: state.pressed ? 0.98 : 1 }],
        },
        variant === 'ghost' ? null : shadow,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} size="small" /> : icon}
      <Text style={[type[size === 'lg' ? 'bodyStrong' : 'bodyStrong'] as object, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active?: boolean;
  color?: string;
  onPress?: () => void;
}) {
  const { colors, radius, type } = useTheme();
  const tint = color ?? colors.accent;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: radius.pill,
        backgroundColor: active ? tint : colors.surfaceAlt,
        borderWidth: 1,
        borderColor: active ? tint : colors.border,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text style={[type.small as object, { color: active ? '#FFFFFF' : colors.textMuted, fontWeight: '700' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Slim horizontal progress bar. `value` is 0-1. */
export function ProgressBar({ value, color, height = 8 }: { value: number; color?: string; height?: number }) {
  const { colors, radius } = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(pct * 100), min: 0, max: 100 }}
      style={{ height, borderRadius: radius.pill, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}
    >
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color ?? colors.accent }} />
    </View>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.border }} />;
}

export function Screen({ children, style, ...rest }: ViewProps) {
  const { colors } = useTheme();
  return (
    <View {...rest} style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
      {children}
    </View>
  );
}
