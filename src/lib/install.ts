import { Platform } from 'react-native';

/**
 * Adding the app to the home screen.
 *
 * There is no single API for this. Chromium fires `beforeinstallprompt` and
 * lets us show a real install button; Safari has never implemented it, so iOS
 * users have to be told the manual steps. Everything here is web-only and
 * degrades to "already an app" on a native build.
 */

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

export type InstallPlatform = 'ios' | 'android' | 'desktop' | 'unsupported';

/** Set by the inline script in +html.tsx, which runs before React mounts. */
type Deferred = { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type InstallWindow = Window & { __lidInstallPrompt?: Deferred | null };

export function detectPlatform(): InstallPlatform {
  if (!isWeb) return 'unsupported';
  const ua = navigator.userAgent;

  // iPadOS 13+ reports itself as a Mac, so touch points are the giveaway.
  const iOS = /iphone|ipod|ipad/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (iOS) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return 'desktop';
}

/** True on iOS Safari, where Add to Home Screen exists but cannot be triggered. */
export function isIosSafari(): boolean {
  if (!isWeb) return false;
  const ua = navigator.userAgent;
  const iOS = /iphone|ipod|ipad/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  // Chrome, Firefox and Edge on iOS all wrap WebKit but cannot add to home screen.
  return iOS && !/crios|fxios|edgios|opios/i.test(ua);
}

/** True once the app is running from a home-screen install. */
export function isInstalled(): boolean {
  if (!isWeb) return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    // iOS Safari predates the standard and uses its own flag.
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/** Whether Chromium has offered us a prompt we can fire. */
export function canPromptInstall(): boolean {
  if (!isWeb) return false;
  return (window as InstallWindow).__lidInstallPrompt != null;
}

/**
 * Fires the browser's own install prompt. Returns whether the user accepted.
 * The event is single-use, so it is cleared either way.
 */
export async function promptInstall(): Promise<boolean> {
  if (!isWeb) return false;
  const w = window as InstallWindow;
  const deferred = w.__lidInstallPrompt;
  if (!deferred) return false;
  try {
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    return outcome === 'accepted';
  } catch {
    return false;
  } finally {
    w.__lidInstallPrompt = null;
  }
}

/** Notifies when a prompt becomes available, so the UI can appear. */
export function onInstallable(listener: () => void): () => void {
  if (!isWeb) return () => {};
  window.addEventListener('lid-installable', listener);
  window.addEventListener('appinstalled', listener);
  return () => {
    window.removeEventListener('lid-installable', listener);
    window.removeEventListener('appinstalled', listener);
  };
}
