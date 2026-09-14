import React, { useCallback } from 'react';
import { Platform, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';

export type SwipeDirection = 'left' | 'right';

/** Fraction of screen width a card must travel to count as a decision. */
const THRESHOLD_RATIO = 0.28;
/** Flick speed that commits a swipe even on a short drag. */
const VELOCITY_THRESHOLD = 800;

/**
 * A Tinder-style card stack.
 *
 * The top card follows the finger and tilts around a pivot below the card, so
 * dragging feels like pushing a physical card across a table. Passing the
 * threshold (or flicking) sends it off screen and calls `onSwipe`; anything
 * less springs back. Two cards sit behind, scaled down, so the deck has depth
 * and the next question is already visible.
 *
 * Swiping is never the only way through: the caller keeps buttons wired to the
 * same handler, which is what keyboard and screen-reader users get.
 */
export function SwipeDeck({
  cardKey,
  onSwipe,
  swipeEnabled = true,
  children,
  behind,
  overlayLeft,
  overlayRight,
}: {
  /** Changing this resets the card position - pass the current question id. */
  cardKey: string | number;
  onSwipe: (direction: SwipeDirection) => void;
  swipeEnabled?: boolean;
  children: React.ReactNode;
  /** Placeholder cards rendered behind the active one. */
  behind?: React.ReactNode[];
  overlayLeft?: React.ReactNode;
  overlayRight?: React.ReactNode;
}) {
  const { width } = useWindowDimensions();
  const { space } = useTheme();

  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const gone = useSharedValue(false);

  const threshold = width * THRESHOLD_RATIO;

  const finish = useCallback(
    (direction: SwipeDirection) => {
      onSwipe(direction);
    },
    [onSwipe],
  );

  // Reset whenever the card identity changes, so the next card starts centred.
  React.useEffect(() => {
    x.value = 0;
    y.value = 0;
    gone.value = false;
  }, [cardKey, x, y, gone]);

  const pan = Gesture.Pan()
    .enabled(swipeEnabled)
    // Let vertical scrolling inside the card win until the drag is clearly sideways.
    .activeOffsetX([-12, 12])
    .failOffsetY([-24, 24])
    .onUpdate((e) => {
      x.value = e.translationX;
      y.value = e.translationY * 0.35;
    })
    .onEnd((e) => {
      const passed = Math.abs(x.value) > threshold || Math.abs(e.velocityX) > VELOCITY_THRESHOLD;
      if (!passed) {
        x.value = withSpring(0, { damping: 18, stiffness: 180 });
        y.value = withSpring(0, { damping: 18, stiffness: 180 });
        return;
      }
      const direction: SwipeDirection = x.value > 0 ? 'right' : 'left';
      gone.value = true;
      x.value = withTiming(
        direction === 'right' ? width * 1.5 : -width * 1.5,
        { duration: 220 },
        () => {
          runOnJS(finish)(direction);
        },
      );
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      // Pivot below the card gives a natural card-on-a-table rotation.
      { rotateZ: `${interpolate(x.value, [-width, 0, width], [-18, 0, 18], Extrapolation.CLAMP)}deg` },
    ],
  }));

  const rightOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, threshold], [0, 1], Extrapolation.CLAMP),
  }));

  const leftOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-threshold, 0], [1, 0], Extrapolation.CLAMP),
  }));

  // Cards behind rise toward full size as the top card is dragged away.
  const behindStyle = useAnimatedStyle(() => {
    const progress = interpolate(Math.abs(x.value), [0, threshold], [0, 1], Extrapolation.CLAMP);
    return {
      transform: [{ scale: 0.94 + progress * 0.06 }, { translateY: (1 - progress) * 14 }],
      opacity: 0.65 + progress * 0.35,
    };
  });

  const deepStyle = { transform: [{ scale: 0.88 }, { translateY: 28 }], opacity: 0.4 };

  return (
    <View style={{ flex: 1 }}>
      {behind?.[1] ? (
        <View style={[{ ...StyleSheetAbsoluteFill }, deepStyle]} pointerEvents="none">
          {behind[1]}
        </View>
      ) : null}
      {behind?.[0] ? (
        <Animated.View style={[{ ...StyleSheetAbsoluteFill }, behindStyle]} pointerEvents="none">
          {behind[0]}
        </Animated.View>
      ) : null}

      <GestureDetector gesture={pan}>
        <Animated.View style={[{ flex: 1 }, cardStyle]}>
          {children}

          {overlayRight ? (
            <Animated.View
              pointerEvents="none"
              style={[{ position: 'absolute', top: space.xxxl + space.lg, left: space.xl }, rightOverlayStyle]}
            >
              {overlayRight}
            </Animated.View>
          ) : null}
          {overlayLeft ? (
            <Animated.View
              pointerEvents="none"
              style={[{ position: 'absolute', top: space.xxxl + space.lg, right: space.xl }, leftOverlayStyle]}
            >
              {overlayLeft}
            </Animated.View>
          ) : null}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const StyleSheetAbsoluteFill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

/** Big rotated stamp shown over the card while dragging. */
export function SwipeStamp({
  label,
  color,
  rotate,
}: {
  label: string;
  color: string;
  rotate: number;
}) {
  const { radius, type } = useTheme();
  return (
    <View
      style={{
        borderWidth: 5,
        borderColor: color,
        borderRadius: radius.md,
        paddingVertical: 6,
        paddingHorizontal: 14,
        transform: [{ rotate: `${rotate}deg` }],
        backgroundColor: Platform.OS === 'web' ? 'rgba(255,255,255,0.75)' : 'transparent',
      }}
    >
      <Animated.Text style={[type.heading as object, { color, letterSpacing: 1 }]}>{label}</Animated.Text>
    </View>
  );
}
