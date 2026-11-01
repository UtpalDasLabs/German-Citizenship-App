/**
 * The headless Chrome the container comes with, whatever its version folder
 * is called this time (Playwright's layout changed between versions). Null
 * when there is none, and Remotion then downloads its own.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.env.PLAYWRIGHT_BROWSERS_PATH ?? '/opt/pw-browsers';
const CANDIDATES = [
  ['chrome-headless-shell-linux64', 'chrome-headless-shell'],
  ['chrome-linux', 'headless_shell'],
];

export function preinstalledChrome() {
  if (process.env.REMOTION_BROWSER) return process.env.REMOTION_BROWSER;
  if (!existsSync(ROOT)) return null;
  const dirs = readdirSync(ROOT)
    .filter((d) => d.startsWith('chromium_headless_shell-'))
    .sort((a, b) => Number(b.split('-')[1]) - Number(a.split('-')[1]));
  for (const d of dirs) {
    for (const parts of CANDIDATES) {
      const bin = join(ROOT, d, ...parts);
      if (existsSync(bin)) return bin;
    }
  }
  return null;
}
