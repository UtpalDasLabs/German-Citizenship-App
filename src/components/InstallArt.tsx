import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/theme/ThemeProvider';

/**
 * Little diagrams of the install steps, one per instruction.
 *
 * Words alone do not work here: "tap the Share button" means nothing until you
 * have seen which of the five icons in the Safari toolbar it is. These are
 * drawn rather than screenshotted so they follow the app's theme, stay sharp at
 * any size, and never go stale when a browser changes its chrome.
 *
 * Everything lives in a 240x130 box so the steps line up in a column.
 */

export type InstallScene =
  | 'iosShare'
  | 'iosSheet'
  | 'iosAdd'
  | 'androidMenu'
  | 'androidItem'
  | 'androidAdd'
  | 'desktopBar'
  | 'desktopMenu';

const W = 240;
const H = 130;

type Ink = {
  /** Panel background - a browser surface, not the app's. */
  panel: string;
  /** Recessed areas inside the panel: URL bars, page blocks. */
  inset: string;
  line: string;
  faint: string;
  hi: string;
  hiBg: string;
  onHi: string;
};

/** The circled callout, borrowed from every set of phone instructions ever. */
function Ring({ cx, cy, r, ink }: { cx: number; cy: number; r: number; ink: Ink }) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill={ink.hiBg} />
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke={ink.hi} strokeWidth={3} />
    </G>
  );
}

/** A text-shaped bar. Real words would need translating and would not fit. */
function Bar({
  x,
  y,
  w,
  h = 5,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  fill: string;
}) {
  return <Rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} />;
}

/**
 * The app icon at thumbnail size. The real mark has feathered tricolour wings
 * that turn to mud below ~40px, so this is the same idea reduced to its
 * silhouette: the three ring colours and a bird.
 */
function BrandIcon({ x, y, size }: { x: number; y: number; size: number }) {
  const u = (n: number) => size * n;
  const cx = x + size / 2;
  const cy = y + size / 2;
  return (
    <G>
      <Rect x={x} y={y} width={size} height={size} rx={u(0.24)} fill="#FFFFFF" />
      <Circle cx={cx} cy={cy} r={u(0.47)} fill="#141414" />
      <Circle cx={cx} cy={cy} r={u(0.43)} fill="#E2001A" />
      <Circle cx={cx} cy={cy} r={u(0.4)} fill="#FFCC00" />
      <Circle cx={cx} cy={cy} r={u(0.36)} fill="#FFFFFF" />
      {/* Wings, body, tail: the mark's three colours stacked top to bottom. */}
      <Path
        d={`M${x + u(0.5)} ${y + u(0.3)} L${x + u(0.14)} ${y + u(0.42)} L${x + u(0.32)} ${y + u(0.5)} Z`}
        fill="#141414"
      />
      <Path
        d={`M${x + u(0.5)} ${y + u(0.3)} L${x + u(0.86)} ${y + u(0.42)} L${x + u(0.68)} ${y + u(0.5)} Z`}
        fill="#141414"
      />
      <Path
        d={`M${x + u(0.5)} ${y + u(0.28)} C${x + u(0.62)} ${y + u(0.28)} ${x + u(0.66)} ${y + u(0.4)} ${x + u(0.64)} ${y + u(0.56)} L${x + u(0.5)} ${y + u(0.64)} L${x + u(0.36)} ${y + u(0.56)} C${x + u(0.34)} ${y + u(0.4)} ${x + u(0.38)} ${y + u(0.28)} ${x + u(0.5)} ${y + u(0.28)} Z`}
        fill="#E2001A"
      />
      <Path
        d={`M${x + u(0.38)} ${y + u(0.56)} L${x + u(0.34)} ${y + u(0.76)} L${x + u(0.45)} ${y + u(0.7)} L${x + u(0.5)} ${y + u(0.82)} L${x + u(0.55)} ${y + u(0.7)} L${x + u(0.66)} ${y + u(0.76)} L${x + u(0.62)} ${y + u(0.56)} Z`}
        fill="#FFCC00"
      />
      <Circle cx={x + u(0.56)} cy={y + u(0.26)} r={u(0.1)} fill="#141414" />
    </G>
  );
}

/** Rounded device outline shared by the phone scenes. */
function Phone({ ink, children }: { ink: Ink; children: React.ReactNode }) {
  return (
    <G>
      <Rect x={24} y={5} width={192} height={120} rx={17} fill={ink.panel} stroke={ink.line} strokeWidth={2} />
      {children}
    </G>
  );
}

/** Blocks of page behind the browser chrome, so the crop reads as a web page. */
function PageBlocks({ ink, y = 16 }: { ink: Ink; y?: number }) {
  return (
    <G opacity={0.9}>
      <Rect x={34} y={y} width={172} height={30} rx={6} fill={ink.inset} />
      <Bar x={42} y={y + 40} w={120} fill={ink.faint} />
      <Bar x={42} y={y + 52} w={150} fill={ink.faint} />
    </G>
  );
}

const scenes: Record<InstallScene, (ink: Ink) => React.ReactElement> = {
  // 1. The Safari toolbar, with the Share icon called out.
  iosShare: (ink) => (
    <Phone ink={ink}>
      <PageBlocks ink={ink} y={14} />
      <Rect x={26} y={82} width={188} height={41} rx={16} fill={ink.inset} />
      <G stroke={ink.faint} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Path d="M54 95 L48 101 L54 107" />
        <Path d="M82 95 L88 101 L82 107" />
        <Path d="M150 94 h12 a2 2 0 0 1 2 2 v10 a2 2 0 0 1 -2 2 h-12 Z" />
        <Path d="M180 95 h10 v10 h-10 Z M186 99 h10 v10 h-10 Z" />
      </G>
      <Ring cx={116} cy={101} r={20} ink={ink} />
      {/* Share: a tray with an arrow coming out of the top. */}
      <G stroke={ink.hi} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Path d="M108 99 v10 h16 v-10" />
        <Path d="M116 108 V92" />
        <Path d="M111 97 L116 92 L121 97" />
      </G>
      <Rect x={101} y={117} width={38} height={3} rx={1.5} fill={ink.faint} />
    </Phone>
  ),

  // 2. The share sheet, scrolled to the row that matters.
  iosSheet: (ink) => (
    <Phone ink={ink}>
      <BrandIcon x={36} y={14} size={20} />
      <Bar x={62} y={18} w={44} fill={ink.faint} />
      <Bar x={62} y={28} w={68} h={4} fill={ink.faint} />
      <Rect x={34} y={44} width={172} height={1.5} fill={ink.line} />
      {[52, 74].map((y) => (
        <G key={y}>
          <Bar x={42} y={y + 6} w={64} fill={ink.faint} />
          <Rect x={186} y={y + 2} width={12} height={12} rx={3} fill={ink.faint} opacity={0.5} />
        </G>
      ))}
      {/* Add to Home Screen, highlighted. */}
      <Rect x={32} y={94} width={176} height={24} rx={8} fill={ink.hiBg} stroke={ink.hi} strokeWidth={2} />
      <Bar x={42} y={103} w={92} h={6} fill={ink.hi} />
      <G stroke={ink.hi} strokeWidth={2.2} strokeLinecap="round" fill="none">
        <Rect x={182} y={99} width={14} height={14} rx={3} />
        <Path d="M189 102.5 v7 M185.5 106 h7" />
      </G>
    </Phone>
  ),

  // 3. The confirmation sheet: name it, then tap Add.
  iosAdd: (ink) => (
    <Phone ink={ink}>
      <Bar x={38} y={20} w={26} fill={ink.faint} />
      <Bar x={98} y={20} w={44} fill={ink.faint} />
      <Rect x={34} y={38} width={172} height={1.5} fill={ink.line} />
      <BrandIcon x={40} y={50} size={34} />
      <Bar x={84} y={56} w={48} h={7} fill={ink.faint} />
      <Rect x={84} y={72} width={82} height={12} rx={4} fill={ink.inset} />
      <Bar x={40} y={98} w={140} h={4} fill={ink.faint} />
      <Bar x={40} y={108} w={108} h={4} fill={ink.faint} />
      <Ring cx={182} cy={22} r={21} ink={ink} />
      <Rect x={164} y={13} width={36} height={18} rx={9} fill={ink.hi} />
      <Bar x={173} y={20} w={18} h={4} fill={ink.onHi} />
    </Phone>
  ),

  // 1. Chrome's overflow menu, top right.
  androidMenu: (ink) => (
    <Phone ink={ink}>
      <Rect x={34} y={14} width={128} height={22} rx={11} fill={ink.inset} />
      <G stroke={ink.faint} strokeWidth={2} fill="none">
        <Rect x={42} y={20} width={8} height={10} rx={2} />
      </G>
      <Bar x={56} y={23} w={84} h={4} fill={ink.faint} />
      <Ring cx={190} cy={25} r={18} ink={ink} />
      {[19, 25, 31].map((cy) => (
        <Circle key={cy} cx={190} cy={cy} r={2.4} fill={ink.hi} />
      ))}
      <G opacity={0.9}>
        <Rect x={34} y={52} width={172} height={32} rx={6} fill={ink.inset} />
        <Bar x={42} y={94} w={120} fill={ink.faint} />
        <Bar x={42} y={106} w={150} fill={ink.faint} />
      </G>
    </Phone>
  ),

  // 2. The menu open, with Install app / Add to Home screen highlighted.
  androidItem: (ink) => (
    <Phone ink={ink}>
      <G opacity={0.55}>
        <Rect x={34} y={14} width={60} height={20} rx={10} fill={ink.inset} />
        <Bar x={42} y={48} w={54} fill={ink.faint} />
        <Bar x={42} y={60} w={44} fill={ink.faint} />
      </G>
      <Rect x={96} y={10} width={112} height={110} rx={10} fill={ink.panel} stroke={ink.line} strokeWidth={2} />
      {[20, 38].map((y) => (
        <Bar key={y} x={106} y={y} w={62} fill={ink.faint} />
      ))}
      <Rect x={100} y={54} width={104} height={26} rx={7} fill={ink.hiBg} stroke={ink.hi} strokeWidth={2} />
      <G stroke={ink.hi} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Rect x={106} y={61} width={12} height={12} rx={3} />
        <Path d="M112 64 v6 M109 67.5 L112 70.5 L115 67.5" />
      </G>
      <Bar x={124} y={64} w={70} h={6} fill={ink.hi} />
      {[92, 108].map((y) => (
        <Bar key={y} x={106} y={y} w={52} fill={ink.faint} />
      ))}
    </Phone>
  ),

  // 3. Chrome's install dialog.
  androidAdd: (ink) => (
    <Phone ink={ink}>
      <G opacity={0.4}>
        <Rect x={34} y={14} width={172} height={20} rx={8} fill={ink.inset} />
      </G>
      <Rect x={38} y={30} width={164} height={80} rx={14} fill={ink.panel} stroke={ink.line} strokeWidth={2} />
      <BrandIcon x={52} y={42} size={30} />
      <Bar x={92} y={48} w={46} h={7} fill={ink.faint} />
      <Bar x={92} y={62} w={72} h={4} fill={ink.faint} />
      <Bar x={52} y={82} w={100} h={4} fill={ink.faint} />
      <Ring cx={166} cy={94} r={19} ink={ink} />
      <Rect x={146} y={85} width={42} height={18} rx={9} fill={ink.hi} />
      <Bar x={156} y={92} w={22} h={4} fill={ink.onHi} />
    </Phone>
  ),

  // 1. The install icon that appears at the end of a desktop address bar.
  desktopBar: (ink) => (
    <G>
      <Rect x={16} y={12} width={208} height={106} rx={12} fill={ink.panel} stroke={ink.line} strokeWidth={2} />
      <Rect x={16} y={12} width={208} height={30} rx={12} fill={ink.inset} />
      <Rect x={16} y={40} width={208} height={2} fill={ink.line} />
      {[30, 42, 54].map((cx) => (
        <Circle key={cx} cx={cx} cy={26} r={3.5} fill={ink.faint} />
      ))}
      <Rect x={70} y={18} width={120} height={17} rx={8.5} fill={ink.panel} />
      <Bar x={80} y={25} w={70} h={4} fill={ink.faint} />
      <Ring cx={196} cy={26} r={16} ink={ink} />
      <G stroke={ink.hi} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Rect x={189} y={20} width={14} height={12} rx={2.5} />
        <Path d="M196 22 v5 M193 25 L196 28 L199 25" />
      </G>
      <G opacity={0.9}>
        <Rect x={30} y={54} width={80} height={50} rx={6} fill={ink.inset} />
        <Bar x={122} y={60} w={82} fill={ink.faint} />
        <Bar x={122} y={72} w={64} fill={ink.faint} />
        <Bar x={122} y={84} w={74} fill={ink.faint} />
      </G>
    </G>
  ),

  // 2. Same thing from the browser menu, for the browsers that hide the icon.
  desktopMenu: (ink) => (
    <G>
      <Rect x={16} y={12} width={208} height={106} rx={12} fill={ink.panel} stroke={ink.line} strokeWidth={2} />
      <Rect x={16} y={12} width={208} height={30} rx={12} fill={ink.inset} />
      <Rect x={16} y={40} width={208} height={2} fill={ink.line} />
      <Rect x={60} y={18} width={120} height={17} rx={8.5} fill={ink.panel} />
      {[20, 26, 32].map((cy) => (
        <Circle key={cy} cx={202} cy={cy} r={2.4} fill={ink.faint} />
      ))}
      <Rect x={118} y={44} width={98} height={68} rx={10} fill={ink.panel} stroke={ink.line} strokeWidth={2} />
      <Bar x={128} y={54} w={56} fill={ink.faint} />
      <Rect x={122} y={68} width={90} height={24} rx={7} fill={ink.hiBg} stroke={ink.hi} strokeWidth={2} />
      <G stroke={ink.hi} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <Rect x={128} y={74} width={12} height={12} rx={3} />
        <Path d="M134 77 v6 M131 80.5 L134 83.5 L137 80.5" />
      </G>
      <Bar x={146} y={77} w={58} h={6} fill={ink.hi} />
      <Bar x={128} y={100} w={48} fill={ink.faint} />
    </G>
  ),
};

/**
 * One step diagram, scaled to the width it is given. The aspect ratio is fixed
 * so a column of steps keeps a steady rhythm.
 */
export function InstallArt({ scene, width = 240 }: { scene: InstallScene; width?: number }) {
  const { colors, radius } = useTheme();

  const ink: Ink = {
    panel: colors.surface,
    inset: colors.surfaceAlt,
    line: colors.border,
    faint: colors.textFaint,
    hi: colors.info,
    hiBg: colors.infoBg,
    onHi: '#FFFFFF',
  };

  const height = (width * H) / W;

  return (
    <View
      accessible={false}
      // Decorative: the instruction above it already says everything.
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        width,
        height,
        alignSelf: 'center',
        backgroundColor: colors.bgElevated,
        borderRadius: radius.md,
        overflow: 'hidden',
      }}
    >
      <Svg width={width} height={height} viewBox={`0 0 ${W} ${H}`}>
        {scenes[scene](ink)}
      </Svg>
    </View>
  );
}
