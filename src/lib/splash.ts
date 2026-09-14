import { Platform } from 'react-native';

/**
 * Dismisses the splash painted by +html.tsx once the app is on screen.
 *
 * It fades rather than vanishing, and is removed from the DOM afterwards so it
 * can never trap focus or swallow a tap.
 */
export function hideSplash(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  const node = document.getElementById('lid-splash');
  if (!node) return;
  node.classList.add('lid-splash-done');
  window.setTimeout(() => node.remove(), 320);
}
