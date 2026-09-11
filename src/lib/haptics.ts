import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** No-ops on web, where the haptics API is not available. */
export function makeHaptics(enabled: boolean) {
  const active = enabled && Platform.OS !== 'web';
  return {
    tap: () => active && void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    success: () => active && void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    error: () => active && void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  };
}
