import React from 'react';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

type SceneProps = {
  /** Topic accent, used for the main shape fills. */
  c: string;
  /** Ink colour that adapts to light/dark mode. */
  ink: string;
  /** Muted colour for secondary detail. */
  soft: string;
};

const GOLD = '#F5B301';
const RED = '#E1462C';
const BLACK = '#20262F';

/**
 * Every scene draws inside a 120x120 box. They are deliberately simple and
 * flat: the point is a recognisable silhouette you can recall in the exam, not
 * an illustration that competes with the question text.
 */
const scenes: Record<string, (p: SceneProps) => React.ReactElement> = {
  flag: ({ ink }) => (
    <G>
      <Rect x="18" y="30" width="84" height="20" rx="4" fill={BLACK} />
      <Rect x="18" y="50" width="84" height="20" fill={RED} />
      <Rect x="18" y="70" width="84" height="20" rx="4" fill={GOLD} />
      <Rect x="12" y="24" width="6" height="76" rx="3" fill={ink} opacity={0.35} />
    </G>
  ),

  eagle: ({ c, ink }) => (
    <G>
      <Path d="M60 18 L96 34 V62 C96 84 80 98 60 106 C40 98 24 84 24 62 V34 Z" fill={GOLD} opacity={0.25} />
      <Path d="M60 26 L88 38 V62 C88 79 76 91 60 98 C44 91 32 79 32 62 V38 Z" fill="none" stroke={c} strokeWidth={3} />
      <Path d="M60 44 C52 44 46 50 46 56 L34 66 L48 64 L42 76 L56 68 L60 82 L64 68 L78 76 L72 64 L86 66 L74 56 C74 50 68 44 60 44 Z" fill={BLACK} />
      <Circle cx="60" cy="52" r="3" fill={GOLD} />
    </G>
  ),

  ballot: ({ c, ink, soft }) => (
    <G>
      <Rect x="24" y="52" width="72" height="46" rx="8" fill={c} opacity={0.2} />
      <Rect x="24" y="52" width="72" height="46" rx="8" fill="none" stroke={c} strokeWidth={3} />
      <Rect x="46" y="60" width="28" height="6" rx="3" fill={c} />
      <Rect x="40" y="16" width="40" height="46" rx="5" fill="#FFFFFF" stroke={ink} strokeWidth={2.5} />
      <Line x1="48" y1="28" x2="72" y2="28" stroke={soft} strokeWidth={3} strokeLinecap="round" />
      <Line x1="48" y1="38" x2="72" y2="38" stroke={soft} strokeWidth={3} strokeLinecap="round" />
      <Path d="M50 46 L57 53 L72 36" fill="none" stroke={RED} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  ),

  parliament: ({ c, ink }) => (
    <G>
      <Path d="M60 16 L104 42 H16 Z" fill={c} opacity={0.3} />
      <Path d="M60 22 L96 42 H24 Z" fill="none" stroke={c} strokeWidth={3} strokeLinejoin="round" />
      <Rect x="22" y="42" width="76" height="6" rx="3" fill={ink} />
      {[30, 46, 62, 78].map((x) => (
        <Rect key={x} x={x} y="50" width="12" height="40" rx="2" fill={c} opacity={0.55} />
      ))}
      <Rect x="18" y="90" width="84" height="8" rx="4" fill={ink} />
      <Circle cx="60" cy="30" r="4" fill={GOLD} />
    </G>
  ),

  bundesrat: ({ c, ink }) => (
    <G>
      <Rect x="16" y="44" width="88" height="46" rx="8" fill={c} opacity={0.2} />
      <Rect x="16" y="44" width="88" height="46" rx="8" fill="none" stroke={c} strokeWidth={3} />
      {[0, 1, 2, 3].map((i) => (
        <Circle key={i} cx={30 + i * 20} cy="60" r="6" fill={c} />
      ))}
      {[0, 1, 2].map((i) => (
        <Circle key={`b${i}`} cx={40 + i * 20} cy="78" r="6" fill={ink} opacity={0.5} />
      ))}
      <Rect x="40" y="20" width="40" height="16" rx="8" fill={GOLD} />
    </G>
  ),

  chancellor: ({ c, ink, soft }) => (
    <G>
      <Circle cx="60" cy="40" r="18" fill={c} opacity={0.35} />
      <Circle cx="60" cy="40" r="18" fill="none" stroke={c} strokeWidth={3} />
      <Path d="M28 100 C28 78 42 66 60 66 C78 66 92 78 92 100 Z" fill={c} opacity={0.25} />
      <Path d="M28 100 C28 78 42 66 60 66 C78 66 92 78 92 100" fill="none" stroke={c} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M52 68 L60 84 L68 68" fill="none" stroke={ink} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="60" cy="90" r="5" fill={GOLD} />
      <Line x1="46" y1="36" x2="54" y2="36" stroke={soft} strokeWidth={3} strokeLinecap="round" />
      <Line x1="66" y1="36" x2="74" y2="36" stroke={soft} strokeWidth={3} strokeLinecap="round" />
    </G>
  ),

  president: ({ c, ink }) => (
    <G>
      <Circle cx="60" cy="42" r="17" fill={c} opacity={0.3} stroke={c} strokeWidth={3} />
      <Path d="M30 102 C30 80 43 68 60 68 C77 68 90 80 90 102 Z" fill={c} opacity={0.2} stroke={c} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M42 16 L48 28 L60 22 L72 28 L78 16 L74 34 H46 Z" fill={GOLD} />
      <Path d="M50 70 L60 96 L70 70" fill="none" stroke={RED} strokeWidth={4} strokeLinecap="round" />
      <Circle cx="60" cy="42" r="4" fill={ink} opacity={0.4} />
    </G>
  ),

  constitution: ({ c, ink }) => (
    <G>
      <Rect x="24" y="22" width="72" height="80" rx="8" fill={c} opacity={0.22} />
      <Rect x="24" y="22" width="72" height="80" rx="8" fill="none" stroke={c} strokeWidth={3} />
      <Rect x="24" y="22" width="14" height="80" rx="7" fill={c} opacity={0.6} />
      {[42, 54, 66, 78].map((y) => (
        <Line key={y} x1="48" y1={y} x2="86" y2={y} stroke={ink} strokeWidth={3} strokeLinecap="round" opacity={0.45} />
      ))}
      <Circle cx="86" cy="92" r="12" fill={GOLD} />
      <Path d="M80 92 L85 97 L93 87" fill="none" stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
    </G>
  ),

  scales: ({ c, ink }) => (
    <G>
      <Line x1="60" y1="22" x2="60" y2="94" stroke={c} strokeWidth={4} strokeLinecap="round" />
      <Line x1="24" y1="34" x2="96" y2="34" stroke={c} strokeWidth={4} strokeLinecap="round" />
      <Circle cx="60" cy="22" r="6" fill={GOLD} />
      <Path d="M10 40 H38 L24 66 Z" fill={c} opacity={0.35} stroke={c} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M82 40 H110 L96 66 Z" fill={c} opacity={0.35} stroke={c} strokeWidth={3} strokeLinejoin="round" />
      <Line x1="24" y1="34" x2="24" y2="40" stroke={c} strokeWidth={3} />
      <Line x1="96" y1="34" x2="96" y2="40" stroke={c} strokeWidth={3} />
      <Rect x="38" y="94" width="44" height="8" rx="4" fill={ink} />
    </G>
  ),

  dove: ({ c, ink }) => (
    <G>
      <Circle cx="60" cy="60" r="42" fill={c} opacity={0.16} />
      <Path
        d="M40 74 C34 66 36 52 48 46 C60 40 76 44 84 34 C86 48 80 60 68 66 L74 84 L58 74 L44 88 Z"
        fill={c}
        opacity={0.75}
      />
      <Path d="M84 34 C80 42 72 48 62 50" fill="none" stroke={ink} strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
      <Circle cx="76" cy="42" r="2.5" fill={ink} />
      <Path d="M30 84 C36 88 44 88 50 84" fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round" />
    </G>
  ),

  wall: ({ c, ink }) => (
    <G>
      {[
        [16, 44],
        [46, 44],
        [76, 44],
        [16, 64],
        [46, 64],
        [76, 64],
        [16, 84],
        [46, 84],
        [76, 84],
      ].map(([x, y], i) => (
        <Rect key={i} x={x} y={y} width="28" height="16" rx="3" fill={c} opacity={i % 2 ? 0.35 : 0.55} />
      ))}
      <Path d="M60 100 L54 60 L66 60 Z" fill={ink} opacity={0.15} />
      <Path d="M52 26 C58 34 62 34 68 26" fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round" />
      <Path d="M60 100 V36" stroke={RED} strokeWidth={4} strokeLinecap="round" strokeDasharray="8 7" />
    </G>
  ),

  euStars: ({ c }) => (
    <G>
      <Circle cx="60" cy="60" r="46" fill={c} opacity={0.18} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return <Circle key={i} cx={60 + Math.cos(a) * 30} cy={60 + Math.sin(a) * 30} r="5" fill={GOLD} />;
      })}
    </G>
  ),

  map: ({ c, ink }) => (
    <G>
      <Path
        d="M46 16 L64 20 L72 14 L82 24 L78 38 L92 46 L86 62 L92 76 L78 90 L66 86 L58 100 L44 92 L40 74 L28 66 L34 50 L28 36 Z"
        fill={c}
        opacity={0.3}
        stroke={c}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Circle cx="62" cy="46" r="7" fill={RED} />
      <Circle cx="62" cy="46" r="2.5" fill="#FFFFFF" />
      <Line x1="46" y1="66" x2="76" y2="66" stroke={ink} strokeWidth={2.5} strokeLinecap="round" opacity={0.4} />
    </G>
  ),

  school: ({ c, ink }) => (
    <G>
      <Path d="M18 44 L60 24 L102 44 L60 62 Z" fill={c} opacity={0.5} />
      <Path d="M18 44 L60 24 L102 44 L60 62 Z" fill="none" stroke={c} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M34 52 V78 C34 88 46 94 60 94 C74 94 86 88 86 78 V52" fill="none" stroke={c} strokeWidth={3.5} strokeLinejoin="round" />
      <Line x1="98" y1="46" x2="98" y2="74" stroke={GOLD} strokeWidth={3.5} strokeLinecap="round" />
      <Circle cx="98" cy="78" r="5" fill={GOLD} />
      <Circle cx="60" cy="44" r="4" fill={ink} opacity={0.4} />
    </G>
  ),

  work: ({ c, ink }) => (
    <G>
      <Rect x="18" y="42" width="84" height="52" rx="10" fill={c} opacity={0.25} />
      <Rect x="18" y="42" width="84" height="52" rx="10" fill="none" stroke={c} strokeWidth={3} />
      <Path d="M44 42 V32 C44 27 48 24 53 24 H67 C72 24 76 27 76 32 V42" fill="none" stroke={c} strokeWidth={3.5} strokeLinejoin="round" />
      <Rect x="18" y="60" width="84" height="6" fill={ink} opacity={0.2} />
      <Rect x="52" y="56" width="16" height="14" rx="4" fill={GOLD} />
    </G>
  ),

  church: ({ c, ink }) => (
    <G>
      <Path d="M60 12 V30 M52 20 H68" stroke={GOLD} strokeWidth={4} strokeLinecap="round" />
      <Path d="M60 30 L88 54 V96 H32 V54 Z" fill={c} opacity={0.28} stroke={c} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M60 62 C68 62 72 70 72 78 V96 H48 V78 C48 70 52 62 60 62 Z" fill={ink} opacity={0.35} />
      <Circle cx="60" cy="48" r="6" fill={GOLD} opacity={0.8} />
    </G>
  ),

  family: ({ c, ink }) => (
    <G>
      <Circle cx="40" cy="38" r="13" fill={c} opacity={0.45} />
      <Path d="M20 92 C20 74 29 64 40 64 C51 64 60 74 60 92 Z" fill={c} opacity={0.35} />
      <Circle cx="76" cy="42" r="11" fill={c} opacity={0.6} />
      <Path d="M60 92 C60 76 67 68 76 68 C85 68 92 76 92 92 Z" fill={c} opacity={0.5} />
      <Circle cx="58" cy="68" r="8" fill={GOLD} />
      <Path d="M46 100 C46 90 51 84 58 84 C65 84 70 90 70 100 Z" fill={GOLD} opacity={0.85} />
      <Line x1="26" y1="100" x2="94" y2="100" stroke={ink} strokeWidth={3} strokeLinecap="round" opacity={0.2} />
    </G>
  ),

  history: ({ c, ink }) => (
    <G>
      <Circle cx="60" cy="60" r="40" fill={c} opacity={0.2} />
      <Circle cx="60" cy="60" r="40" fill="none" stroke={c} strokeWidth={3.5} />
      <Line x1="60" y1="60" x2="60" y2="34" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      <Line x1="60" y1="60" x2="80" y2="70" stroke={RED} strokeWidth={4} strokeLinecap="round" />
      <Circle cx="60" cy="60" r="5" fill={GOLD} />
      {[0, 90, 180, 270].map((deg) => {
        const a = (deg * Math.PI) / 180;
        return (
          <Circle key={deg} cx={60 + Math.cos(a) * 32} cy={60 + Math.sin(a) * 32} r="3" fill={c} />
        );
      })}
    </G>
  ),

  // ---- generic per-topic fallbacks ----

  'topic-constitution': ({ c, ink }) => (
    <G>
      <Path d="M60 16 L96 30 V60 C96 82 80 98 60 106 C40 98 24 82 24 60 V30 Z" fill={c} opacity={0.25} stroke={c} strokeWidth={3} strokeLinejoin="round" />
      <Path d="M44 60 L55 71 L78 46" fill="none" stroke={GOLD} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="60" cy="30" r="3" fill={ink} opacity={0.35} />
    </G>
  ),

  'topic-democracy': ({ c, ink }) => (
    <G>
      {/* Ballot box, deliberately wider than the paper so it does not read as a phone. */}
      <Rect x="14" y="54" width="92" height="46" rx="10" fill={c} opacity={0.22} stroke={c} strokeWidth={3} />
      <Rect x="14" y="54" width="92" height="10" rx="5" fill={c} opacity={0.45} />
      <Rect x="46" y="56" width="28" height="6" rx="3" fill={ink} opacity={0.55} />
      <Rect x="48" y="14" width="24" height="42" rx="4" fill="#FFFFFF" stroke={ink} strokeWidth={2.5} />
      <Path d="M53 34 L58 39 L68 25" fill="none" stroke={RED} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="60" cy="84" r="6" fill={GOLD} />
    </G>
  ),

  'topic-institutions': ({ c, ink }) => (
    <G>
      <Path d="M60 18 L102 40 H18 Z" fill={c} opacity={0.35} stroke={c} strokeWidth={3} strokeLinejoin="round" />
      {[28, 46, 64, 82].map((x) => (
        <Rect key={x} x={x} y="46" width="11" height="42" rx="3" fill={c} opacity={0.5} />
      ))}
      <Rect x="18" y="88" width="84" height="9" rx="4" fill={ink} opacity={0.7} />
      <Circle cx="60" cy="30" r="4" fill={GOLD} />
    </G>
  ),

  'topic-history': ({ c, ink }) => (
    <G>
      <Rect x="26" y="30" width="68" height="72" rx="8" fill={c} opacity={0.22} stroke={c} strokeWidth={3} />
      <Rect x="40" y="16" width="40" height="20" rx="10" fill={GOLD} />
      {[52, 66, 80].map((y) => (
        <Line key={y} x1="42" y1={y} x2="78" y2={y} stroke={ink} strokeWidth={3} strokeLinecap="round" opacity={0.4} />
      ))}
      <Line x1="42" y1="92" x2="62" y2="92" stroke={RED} strokeWidth={3.5} strokeLinecap="round" />
    </G>
  ),

  'topic-law': ({ c, ink }) => (
    <G>
      <Rect x="26" y="24" width="68" height="76" rx="8" fill={c} opacity={0.2} stroke={c} strokeWidth={3} />
      <Path d="M44 58 L54 68 L78 42" fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="42" y1="82" x2="78" y2="82" stroke={ink} strokeWidth={3} strokeLinecap="round" opacity={0.35} />
      <Rect x="16" y="16" width="14" height="14" rx="4" fill={RED} />
    </G>
  ),

  'topic-work': ({ c, ink }) => (
    <G>
      <Rect x="18" y="44" width="84" height="50" rx="10" fill={c} opacity={0.25} stroke={c} strokeWidth={3} />
      <Path d="M46 44 V34 C46 29 50 26 55 26 H65 C70 26 74 29 74 34 V44" fill="none" stroke={c} strokeWidth={3.5} strokeLinejoin="round" />
      <Circle cx="60" cy="68" r="9" fill={GOLD} />
      <Line x1="18" y1="62" x2="102" y2="62" stroke={ink} strokeWidth={2.5} opacity={0.2} />
    </G>
  ),

  'topic-society': ({ c, ink }) => (
    <G>
      <Circle cx="42" cy="44" r="14" fill={c} opacity={0.5} />
      <Circle cx="78" cy="44" r="14" fill={GOLD} opacity={0.8} />
      <Path d="M18 96 C18 76 28 66 42 66 C56 66 66 76 66 96 Z" fill={c} opacity={0.35} />
      <Path d="M54 96 C54 76 64 66 78 66 C92 66 102 76 102 96 Z" fill={c} opacity={0.55} />
      <Line x1="16" y1="102" x2="104" y2="102" stroke={ink} strokeWidth={3} strokeLinecap="round" opacity={0.2} />
    </G>
  ),

  'topic-europe': ({ c }) => (
    <G>
      <Circle cx="60" cy="60" r="44" fill={c} opacity={0.2} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return <Circle key={i} cx={60 + Math.cos(a) * 29} cy={60 + Math.sin(a) * 29} r="4.5" fill={GOLD} />;
      })}
      <Circle cx="60" cy="60" r="10" fill={c} opacity={0.5} />
    </G>
  ),

  'topic-states': ({ c, ink }) => (
    <G>
      <Path
        d="M46 18 L64 22 L72 16 L82 26 L78 40 L92 48 L86 62 L92 76 L78 90 L66 86 L58 100 L44 92 L40 74 L28 66 L34 50 L28 38 Z"
        fill={c}
        opacity={0.28}
        stroke={c}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Line x1="40" y1="46" x2="86" y2="52" stroke={ink} strokeWidth={2.5} opacity={0.35} strokeLinecap="round" />
      <Line x1="36" y1="68" x2="82" y2="72" stroke={ink} strokeWidth={2.5} opacity={0.35} strokeLinecap="round" />
      <Circle cx="60" cy="60" r="6" fill={GOLD} />
    </G>
  ),
};

export function hasIllustration(key: string | null | undefined): boolean {
  return key != null && key in scenes;
}

export function Illustration({
  name,
  color,
  size = 120,
}: {
  name: string | null | undefined;
  color: string;
  size?: number;
}) {
  const theme = useTheme();
  const scene = name ? scenes[name] : undefined;
  if (!scene) return null;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      {scene({ c: color, ink: theme.colors.text, soft: theme.colors.textFaint })}
    </Svg>
  );
}
