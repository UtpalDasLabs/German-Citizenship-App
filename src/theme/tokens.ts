/**
 * Design tokens. The palette is built around the German flag (black / red /
 * gold) but pulled towards calmer, modern values so long study sessions stay
 * comfortable in both light and dark mode.
 */

export const palette = {
  gold: '#F5B301',
  goldSoft: '#FDE68A',
  red: '#E1462C',
  redSoft: '#FECACA',
  ink: '#0B1220',
  green: '#10B981',
  greenSoft: '#A7F3D0',
} as const;

type Scheme = {
  bg: string;
  bgElevated: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentText: string;
  onAccent: string;
  success: string;
  successBg: string;
  danger: string;
  dangerBg: string;
  shadow: string;
  overlay: string;
};

export const light: Scheme = {
  bg: '#F6F7FB',
  bgElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#EFF1F7',
  border: '#E4E7F0',
  borderStrong: '#CBD2E1',
  text: '#0B1220',
  textMuted: '#5A6478',
  textFaint: '#93A0B5',
  accent: '#1E2A44',
  accentText: '#1E2A44',
  onAccent: '#FFFFFF',
  success: '#0F9D68',
  successBg: '#E6F7F0',
  danger: '#D93A29',
  dangerBg: '#FDECEA',
  shadow: 'rgba(11, 18, 32, 0.10)',
  overlay: 'rgba(11, 18, 32, 0.45)',
};

export const dark: Scheme = {
  bg: '#0B1220',
  bgElevated: '#131C2E',
  surface: '#161F33',
  surfaceAlt: '#1E293F',
  border: '#24304A',
  borderStrong: '#33415F',
  text: '#F2F5FA',
  textMuted: '#9BA8BF',
  textFaint: '#6B7894',
  accent: '#F5B301',
  accentText: '#F8C74A',
  onAccent: '#1A1200',
  success: '#3DDC97',
  successBg: '#10331F',
  danger: '#FF6B5B',
  dangerBg: '#3A1712',
  shadow: 'rgba(0, 0, 0, 0.5)',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const type = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800' },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '800' },
  heading: { fontSize: 19, lineHeight: 25, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '500' },
  bodyStrong: { fontSize: 16, lineHeight: 23, fontWeight: '700' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
  overline: { fontSize: 11, lineHeight: 14, fontWeight: '800', letterSpacing: 0.8 },
} as const;

export type Theme = {
  colors: Scheme;
  dark: boolean;
  space: typeof space;
  radius: typeof radius;
  type: typeof type;
  palette: typeof palette;
};
