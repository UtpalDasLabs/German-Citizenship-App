import { dark, palette, topicColors } from '../../../src/theme/tokens';

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;

/** Channel handle shown on screen. The one place to change it. */
export const CHANNEL = 'Einburgerung test';
export const APP_NAME = 'LID-test';

/**
 * Areas the platforms cover with their own interface: the tabs and search bar
 * at the top, the caption, music and username at the bottom. Anything that has
 * to be read stays inside these margins on TikTok, Reels and Shorts alike.
 */
export const SAFE = { top: 210, bottom: 380, side: 84 } as const;

/** The app's dark theme, imported rather than copied so the two cannot drift. */
export const C = dark;
export const TOPIC = topicColors;
export const GOLD = palette.gold;

export const FONT = 'Inter, system-ui, sans-serif';

/** `#RRGGBB` plus alpha, for tints and glows. */
export function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}
