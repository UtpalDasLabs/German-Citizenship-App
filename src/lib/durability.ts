import { Platform } from 'react-native';

import { loadJSON } from './storage';
import type { Progress, Settings } from './types';

/**
 * Everything here is web-only and fails soft. Native builds already store data
 * in the app sandbox, which survives until the app is uninstalled.
 */
const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';

/**
 * Asks the browser to mark this site's storage as durable, so it is not
 * evicted when the device runs low on space. Chrome grants it silently for
 * sites the user has engaged with or installed; Safari ignores it. Returns
 * whether storage is persisted, not whether the request was new.
 */
export async function requestDurableStorage(): Promise<boolean> {
  if (!isWeb || !navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted?.()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function isStoragePersisted(): Promise<boolean> {
  if (!isWeb || !navigator.storage?.persisted) return false;
  try {
    return await navigator.storage.persisted();
  } catch {
    return false;
  }
}

/** Registers the offline service worker. Installed PWAs get stickier storage. */
export function registerServiceWorker(): void {
  if (!isWeb || !('serviceWorker' in navigator)) return;
  // Resolve against the deployed base path so it also works under /repo-name/.
  const base = document.baseURI ?? '/';
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('sw.js', base).toString()).catch(() => {
      // A failed registration only costs offline support, never correctness.
    });
  });
}

export type BackupFile = {
  app: 'leben-in-deutschland';
  version: 1;
  exportedAt: string;
  progress: Progress;
  settings: Settings;
};

export function buildBackup(progress: Progress, settings: Settings): BackupFile {
  return {
    app: 'leben-in-deutschland',
    version: 1,
    exportedAt: new Date().toISOString(),
    progress,
    settings,
  };
}

/** Triggers a file download in the browser. No-op elsewhere. */
export function downloadBackup(backup: BackupFile): boolean {
  if (!isWeb) return false;
  try {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leben-in-deutschland-${backup.exportedAt.slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoking immediately can cancel the download in some browsers.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return true;
  } catch {
    return false;
  }
}

/** Opens a file picker and parses the chosen backup. Resolves null on cancel. */
export function pickBackup(): Promise<BackupFile | null> {
  if (!isWeb) return Promise.resolve(null);
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result)) as BackupFile;
          if (parsed?.app !== 'leben-in-deutschland' || parsed.progress == null) return resolve(null);
          resolve(parsed);
        } catch {
          resolve(null);
        }
      };
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.click();
  });
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

/** Current stored progress, for building a backup without prop-drilling. */
export async function readProgressForBackup(fallback: Progress): Promise<Progress> {
  return loadJSON('progress', fallback);
}
