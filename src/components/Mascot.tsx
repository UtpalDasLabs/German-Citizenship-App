import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

export type MascotMood = 'idle' | 'happy' | 'celebrate' | 'sad' | 'thinking' | 'sleeping';

const BODY = '#E8A21C';
const BODY_DARK = '#C08213';
const HEAD = '#FFFFFF';
const HEAD_SHADE = '#E7ECF2';
const BEAK = '#FF9A00';
const BEAK_DARK = '#DB7900';
const EYE = '#22303F';

/**
 * Adler - a friendly Bundesadler, Germany's federal eagle.
 *
 * Posed by mood rather than redrawn, so it stays the same bird throughout.
 * The white head, heavy brow ridge and hooked beak are what make it read as a
 * bird of prey rather than a generic cartoon bird; the wings always sweep out
 * from the sides, never above the head, where they would look like ears.
 */
export function Mascot({ mood = 'idle', size = 120 }: { mood?: MascotMood; size?: number }) {
  const { colors } = useTheme();

  const wingsUp = mood === 'celebrate' || mood === 'happy';
  const asleep = mood === 'sleeping';
  const pupilX = mood === 'thinking' ? 3 : 0;
  const pupilY = mood === 'sad' ? 3 : 0;

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      accessibilityRole="image"
      accessibilityLabel={`Adler the eagle, looking ${mood}`}
    >
      <Ellipse cx="80" cy="150" rx="34" ry="6" fill={colors.text} opacity={0.1} />

      {/* tail */}
      <Path d="M64 124 L72 144 L80 132 L88 144 L96 124 Z" fill={BODY_DARK} />

      {/* wings */}
      {wingsUp ? (
        <>
          <Path d="M52 70 L14 40 L28 42 L10 24 L30 30 L22 12 L42 28 L58 50 Z" fill={BODY_DARK} />
          <Path d="M108 70 L146 40 L132 42 L150 24 L130 30 L138 12 L118 28 L102 50 Z" fill={BODY_DARK} />
        </>
      ) : (
        <>
          <Path d="M46 78 C30 84 24 106 34 120 C44 132 58 122 58 104 Z" fill={BODY_DARK} />
          <Path d="M114 78 C130 84 136 106 126 120 C116 132 102 122 102 104 Z" fill={BODY_DARK} />
        </>
      )}

      {/* body and head */}
      <Path d="M80 56 C104 56 118 76 118 98 C118 120 102 134 80 134 C58 134 42 120 42 98 C42 76 56 56 80 56 Z" fill={BODY} />
      <Path d="M80 22 C100 22 112 38 112 56 C112 74 98 86 80 86 C62 86 48 74 48 56 C48 38 60 22 80 22 Z" fill={HEAD} />

      {/* eyes */}
      {asleep ? (
        <>
          <Path d="M58 66 C64 73 74 73 80 66" fill="none" stroke={EYE} strokeWidth={4.5} strokeLinecap="round" />
          <Path d="M80 66 C86 73 96 73 102 66" fill="none" stroke={EYE} strokeWidth={4.5} strokeLinecap="round" />
        </>
      ) : (
        <>
          <Circle cx="67" cy="64" r="11" fill="#FFFFFF" stroke={HEAD_SHADE} strokeWidth={1.5} />
          <Circle cx="93" cy="64" r="11" fill="#FFFFFF" stroke={HEAD_SHADE} strokeWidth={1.5} />
          <Circle cx={67 + pupilX} cy={64 + pupilY} r="5.5" fill={EYE} />
          <Circle cx={93 + pupilX} cy={64 + pupilY} r="5.5" fill={EYE} />
          <Circle cx={69 + pupilX} cy={62 + pupilY} r="1.9" fill="#FFFFFF" />
          <Circle cx={95 + pupilX} cy={62 + pupilY} r="1.9" fill="#FFFFFF" />
        </>
      )}

      {/* Brow ridge. Inner ends raised reads as sad; lowered would read as angry. */}
      {mood === 'sad' ? (
        <>
          <Path d="M54 60 L78 52" stroke={BODY_DARK} strokeWidth={6} strokeLinecap="round" />
          <Path d="M106 60 L82 52" stroke={BODY_DARK} strokeWidth={6} strokeLinecap="round" />
        </>
      ) : mood === 'thinking' ? (
        <>
          <Path d="M54 56 L78 48" stroke={BODY_DARK} strokeWidth={6} strokeLinecap="round" />
          <Path d="M106 54 L84 54" stroke={BODY_DARK} strokeWidth={6} strokeLinecap="round" />
        </>
      ) : (
        <>
          <Path d="M52 54 L78 50" stroke={BODY_DARK} strokeWidth={6} strokeLinecap="round" />
          <Path d="M108 54 L82 50" stroke={BODY_DARK} strokeWidth={6} strokeLinecap="round" />
        </>
      )}

      {/* hooked beak */}
      <Path d="M67 76 Q80 71 93 76 L87 94 Q80 107 73 94 Z" fill={BEAK} />
      <Path d="M73 94 Q80 107 87 94 L84.5 89 Q80 96 75.5 89 Z" fill={BEAK_DARK} />
      <Circle cx="74" cy="80" r="1.8" fill={BEAK_DARK} />
      <Circle cx="86" cy="80" r="1.8" fill={BEAK_DARK} />

      {/* flag shield */}
      <Path d="M80 96 C90 96 97 104 97 113 C97 122 89 129 80 129 C71 129 63 122 63 113 C63 104 70 96 80 96 Z" fill="#FFFFFF" />
      <Rect x="69" y="104" width="22" height="6" rx="3" fill="#1A1A1A" />
      <Rect x="69" y="110" width="22" height="6" fill="#E8332A" />
      <Rect x="69" y="116" width="22" height="6" rx="3" fill="#FFC63D" />

      {mood === 'celebrate' ? (
        <G>
          <Path d="M26 96 L30 106 L40 110 L30 114 L26 124 L22 114 L12 110 L22 106 Z" fill="#FFC63D" />
          <Circle cx="140" cy="96" r="5" fill="#FF4B4B" />
          <Circle cx="128" cy="118" r="4" fill="#2BB3F3" />
          <Circle cx="20" cy="70" r="4" fill="#4CC93F" />
        </G>
      ) : null}
      {asleep ? (
        <G>
          <Path d="M116 30 h16 l-16 18 h16" fill="none" stroke={colors.textFaint} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M136 10 h10 l-10 12 h10" fill="none" stroke={colors.textFaint} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </G>
      ) : null}
      {mood === 'thinking' ? (
        <G>
          <Circle cx="126" cy="40" r="4" fill={colors.textFaint} />
          <Circle cx="137" cy="28" r="6" fill={colors.textFaint} />
          <Circle cx="150" cy="14" r="8" fill={colors.textFaint} />
        </G>
      ) : null}
    </Svg>
  );
}

/** Mascot plus a speech bubble - the app's voice for tips and encouragement. */
export function MascotSays({
  mood = 'idle',
  children,
  size = 88,
}: {
  mood?: MascotMood;
  children: React.ReactNode;
  size?: number;
}) {
  const { colors, radius, space } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <Mascot mood={mood} size={size} />
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surface,
          borderWidth: 2,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: space.md,
        }}
      >
        {children}
      </View>
    </View>
  );
}
