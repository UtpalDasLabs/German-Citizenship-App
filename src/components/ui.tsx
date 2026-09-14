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

/** Soft drop shadow that reads correctly on iOS, Android and the web. */
export function useShadow(level: 1 | 2 | 3 = 1): ViewStyle {
  const { colors, dark } = useTheme();
  if (dark) {
    // Elevation reads as noise on dark surfaces; a hairline border does the job.
    return { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border };
  }
  const spec = { 1: [2, 6, 0.05], 2: [6, 16, 0.08], 3: [12, 28, 0.11] }[level] as number[];
  return Platform.select<ViewStyle>({
    web: { boxShadow: `0 ${spec[0]}px ${spec[1]}px rgba(20,24,31,${spec[2]})` } as ViewStyle,
    default: {
      shadowColor: '#14181F',
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
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: 16,
          borderWidth: 2,
          borderColor: colors.border,
        },
        shadow,
        style,
      ]}
    />
  );
}

type TypeKey = keyof ReturnType<typeof useTheme>['type'];
type Tone = 'default' | 'muted' | 'faint' | 'success' | 'danger' | 'info' | 'streak';

export function Txt({
  variant = 'body',
  tone = 'default',
  style,
  ...rest
}: TextProps & { variant?: TypeKey; tone?: Tone }) {
  const { colors, type } = useTheme();
  const color: Record<Tone, string> = {
    default: colors.text,
    muted: colors.textMuted,
    faint: colors.textFaint,
    success: colors.success,
    danger: colors.danger,
    info: colors.info,
    streak: colors.streak,
  };
  return <Text {...rest} style={[type[variant] as object, { color: color[tone] }, style]} />;
}

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';

type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: ButtonVariant;
  size?: 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
  full?: boolean;
  style?: ViewStyle;
};

/**
 * A button with a solid bottom edge. Pressing moves the face down by exactly
 * the edge height so the control looks physically depressed rather than
 * jumping - the detail that makes the whole UI feel tactile.
 */
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
  const { colors, radius, type, edge } = useTheme();
  const depth = size === 'lg' ? edge.lg : edge.md;

  const skin: Record<ButtonVariant, { face: string; edge: string; fg: string; border?: string }> = {
    primary: { face: colors.accent, edge: colors.accentEdge, fg: colors.onAccent },
    success: { face: colors.success, edge: colors.successEdge, fg: '#FFFFFF' },
    danger: { face: colors.danger, edge: colors.dangerEdge, fg: '#FFFFFF' },
    secondary: { face: colors.surface, edge: colors.borderStrong, fg: colors.text, border: colors.borderStrong },
    ghost: { face: 'transparent', edge: 'transparent', fg: colors.textMuted },
  };
  const s = skin[variant];
  const isFlat = variant === 'ghost';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      {...rest}
      style={({ pressed }) => [
        {
          alignSelf: full ? 'stretch' : 'flex-start',
          borderRadius: radius.md,
          backgroundColor: isFlat ? 'transparent' : s.edge,
          paddingBottom: isFlat ? 0 : pressed ? 0 : depth,
          marginTop: isFlat ? 0 : pressed ? depth : 0,
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          borderRadius: radius.md,
          backgroundColor: s.face,
          borderWidth: s.border ? 2 : 0,
          borderColor: s.border,
          paddingVertical: size === 'lg' ? 16 : 12,
          paddingHorizontal: size === 'lg' ? 26 : 18,
        }}
      >
        {loading ? <ActivityIndicator color={s.fg} size="small" /> : icon}
        <Text
          style={[
            type.bodyStrong as object,
            { color: s.fg, letterSpacing: 0.2, textAlign: 'center' },
          ]}
          numberOfLines={2}
        >
          {title}
        </Text>
      </View>
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
        paddingVertical: 9,
        paddingHorizontal: 15,
        borderRadius: radius.pill,
        backgroundColor: active ? tint : colors.surface,
        borderWidth: 2,
        borderColor: active ? tint : colors.border,
        opacity: pressed ? 0.75 : 1,
      })}
    >
      <Text style={[type.small as object, { color: active ? '#FFFFFF' : colors.textMuted, fontWeight: '800' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Thick rounded progress bar. `value` is 0-1. */
export function ProgressBar({ value, color, height = 14 }: { value: number; color?: string; height?: number }) {
  const { colors, radius } = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(pct * 100), min: 0, max: 100 }}
      style={{ height, borderRadius: radius.pill, backgroundColor: colors.track, overflow: 'hidden' }}
    >
      <View
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          borderRadius: radius.pill,
          backgroundColor: color ?? colors.accent,
        }}
      />
    </View>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 2, backgroundColor: colors.border, borderRadius: 2 }} />;
}

export function Screen({ children, style, ...rest }: ViewProps) {
  const { colors } = useTheme();
  return (
    <View {...rest} style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
      {children}
    </View>
  );
}

/** Small pill used for counters in the top bar: streak, XP, gems. */
export function StatPill({
  icon,
  value,
  color,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  color: string;
  label?: string;
}) {
  const { space, type } = useTheme();
  return (
    <View
      accessibilityLabel={label ? `${label}: ${value}` : value}
      style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}
    >
      {icon}
      <Text style={[type.bodyStrong as object, { color }]}>{value}</Text>
    </View>
  );
}
