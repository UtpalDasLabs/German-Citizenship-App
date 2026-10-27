/**
 * The channel kit: flat illustrated characters, backgrounds and props, drawn
 * in code so every video can reuse them (the look of explainer channels like
 * The Infographics Show). One scene type, `kit`, puts them together from the
 * script, one line each:
 *
 *   > SCENE (kit): Mia rings a doorbell on a dark street.
 *   > bg | night-street
 *   > char | mia | wave | 0.3            id | pose | x (0-1) [| flip]
 *   > prop | pumpkin | 0.7 | 1.2         id | x (0-1) | scale
 *   > text | Süßes oder Saures! @ trick   a big line, top of the frame
 *   > char | mia | cheer | 0.3 @ sweets  a later line replaces the same id
 *
 * Lines with `@ phrase` appear (or take over) when the voice says it.
 * Catalogue and rules: the private repo's KIT.md.
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONT } from '../lib/brand';
import { rise } from '../longform/look';
import { screenLines, useShot } from '../longform/plan';

// ---------------------------------------------------------------- characters

type Look = { skin: string; hair: string; top: string; legs: string; hairStyle: 'short' | 'bun' | 'long' | 'grey'; glasses?: boolean };

/** The cast. Add people here; never change an existing one (viewers know them). */
export const CAST: Record<string, Look> = {
  mia: { skin: '#E8B48F', hair: '#2B1B14', top: '#3CC6C0', legs: '#2E3A55', hairStyle: 'bun' },
  noah: { skin: '#8D5A3B', hair: '#151010', top: '#F59E3B', legs: '#34405C', hairStyle: 'short' },
  oma: { skin: '#F1C9A5', hair: '#D9D9D9', top: '#8E6FD1', legs: '#4A3F5C', hairStyle: 'grey', glasses: true },
  kid: { skin: '#D9A07A', hair: '#6B3A1E', top: '#F06A5D', legs: '#2E3A55', hairStyle: 'long' },
};

export type Pose = 'stand' | 'wave' | 'think' | 'cheer' | 'shrug' | 'point' | 'scared';

/** A flat person, about 520 px tall, feet at y = 0. */
export function Character({ id, pose, frame, flip = false }: { id: string; pose: Pose; frame: number; flip?: boolean }) {
  const c = CAST[id] ?? CAST.mia;
  const bob = Math.sin(frame / 9) * 4;
  const blink = frame % 110 < 4;
  const wave = Math.sin(frame / 4) * 18;
  const arm = (side: 1 | -1) => {
    // Shoulder at (±62, -330); returns the arm's end angle in degrees from straight down.
    const up = pose === 'cheer' || (pose === 'wave' && side === 1) || (pose === 'point' && side === 1);
    if (pose === 'scared') return side * 150;
    if (pose === 'shrug') return side * 70;
    if (pose === 'think' && side === 1) return 150;
    if (up) return side * (pose === 'wave' ? 160 + wave : pose === 'point' ? 95 : 155);
    return side * 12;
  };
  const Arm = ({ side }: { side: 1 | -1 }) => (
    <g transform={`translate(${side * 62} -330) rotate(${arm(side)})`}>
      <rect x={-16} y={0} width={32} height={170} rx={16} fill={c.top} />
      <circle cx={0} cy={172} r={20} fill={c.skin} />
    </g>
  );
  const mouth = pose === 'cheer' || pose === 'wave' ? 'M -22 -432 Q 0 -408 22 -432' : pose === 'scared' ? 'M -12 -420 a 12 14 0 1 0 24 0 a 12 14 0 1 0 -24 0' : pose === 'shrug' || pose === 'think' ? 'M -18 -424 L 18 -428' : 'M -18 -428 Q 0 -416 18 -428';
  return (
    <g transform={`translate(0 ${bob}) scale(${flip ? -1 : 1} 1)`}>
      <ellipse cx={0} cy={0} rx={110} ry={16} fill="rgba(0,0,0,0.25)" />
      {/* legs */}
      <rect x={-48} y={-200} width={40} height={200} rx={18} fill={c.legs} />
      <rect x={8} y={-200} width={40} height={200} rx={18} fill={c.legs} />
      <rect x={-58} y={-18} width={58} height={22} rx={10} fill="#1B2030" />
      <rect x={4} y={-18} width={58} height={22} rx={10} fill="#1B2030" />
      <Arm side={-1} />
      {/* body */}
      <rect x={-78} y={-350} width={156} height={180} rx={50} fill={c.top} />
      <Arm side={1} />
      {/* head */}
      <rect x={-14} y={-372} width={28} height={30} fill={c.skin} />
      {c.hairStyle === 'long' && <rect x={-82} y={-520} width={164} height={150} rx={60} fill={c.hair} />}
      <circle cx={0} cy={-445} r={78} fill={c.skin} />
      {c.hairStyle === 'bun' && (
        <>
          <path d="M -80 -450 Q -78 -535 0 -530 Q 78 -535 80 -450 Q 50 -505 0 -500 Q -50 -505 -80 -450 Z" fill={c.hair} />
          <circle cx={0} cy={-540} r={32} fill={c.hair} />
        </>
      )}
      {c.hairStyle === 'short' && <path d="M -80 -440 Q -84 -530 0 -528 Q 84 -530 80 -440 Q 60 -495 0 -492 Q -60 -495 -80 -440 Z" fill={c.hair} />}
      {c.hairStyle === 'long' && <path d="M -80 -445 Q -80 -530 0 -528 Q 80 -530 80 -445 Q 40 -500 -20 -490 Q -60 -480 -80 -445 Z" fill={c.hair} />}
      {c.hairStyle === 'grey' && (
        <>
          <path d="M -82 -430 Q -88 -532 0 -530 Q 88 -532 82 -430 Q 70 -500 0 -498 Q -70 -500 -82 -430 Z" fill={c.hair} />
          <circle cx={-70} cy={-470} r={22} fill={c.hair} />
          <circle cx={70} cy={-470} r={22} fill={c.hair} />
        </>
      )}
      {/* face */}
      {blink ? (
        <>
          <rect x={-36} y={-458} width={22} height={4} rx={2} fill="#1B2030" />
          <rect x={14} y={-458} width={22} height={4} rx={2} fill="#1B2030" />
        </>
      ) : (
        <>
          <circle cx={-25} cy={-456} r={pose === 'scared' ? 11 : 8} fill="#1B2030" />
          <circle cx={25} cy={-456} r={pose === 'scared' ? 11 : 8} fill="#1B2030" />
        </>
      )}
      {c.glasses && (
        <g stroke="#1B2030" strokeWidth={4} fill="none">
          <circle cx={-25} cy={-456} r={20} />
          <circle cx={25} cy={-456} r={20} />
          <line x1={-5} y1={-456} x2={5} y2={-456} />
        </g>
      )}
      <circle cx={-46} cy={-428} r={10} fill="#F28C8C" opacity={0.45} />
      <circle cx={46} cy={-428} r={10} fill="#F28C8C" opacity={0.45} />
      <path d={mouth} stroke="#1B2030" strokeWidth={5} fill={pose === 'scared' ? '#1B2030' : 'none'} strokeLinecap="round" />
      {pose === 'think' && <circle cx={110} cy={-560} r={14} fill="#FFFFFF" opacity={0.8} />}
    </g>
  );
}

// ---------------------------------------------------------------- backgrounds

const W = 1920;
const H = 1080;
const GROUND = 900;

function Houses({ frame, windows }: { frame: number; windows: string }) {
  const houses = [
    { x: 40, w: 330, h: 380, c: '#2B3350' },
    { x: 400, w: 280, h: 460, c: '#323B5C' },
    { x: 1250, w: 300, h: 420, c: '#2B3350' },
    { x: 1580, w: 320, h: 360, c: '#323B5C' },
  ];
  return (
    <>
      {houses.map((h, i) => (
        <g key={i}>
          <rect x={h.x} y={GROUND - h.h} width={h.w} height={h.h} fill={h.c} />
          <path d={`M ${h.x - 20} ${GROUND - h.h} L ${h.x + h.w / 2} ${GROUND - h.h - 120} L ${h.x + h.w + 20} ${GROUND - h.h} Z`} fill="#1E2540" />
          {[0, 1].map((r) =>
            [0, 1].map((k) => (
              <rect key={`${r}${k}`} x={h.x + 50 + k * (h.w - 160)} y={GROUND - h.h + 60 + r * 130} width={60} height={80} rx={6} fill={windows} opacity={0.55 + 0.35 * Math.abs(Math.sin(frame / 50 + i + r + k))} />
            )),
          )}
        </g>
      ))}
    </>
  );
}

/** Backgrounds. Add new ones here and list them in KIT.md. */
export function Background({ id, frame }: { id: string; frame: number }) {
  const stars = Array.from({ length: 60 }).map((_, i) => ({ x: (i * 397) % W, y: (i * 131) % 520, r: 1 + (i % 3) }));
  switch (id) {
    case 'night-street':
      return (
        <svg width={W} height={H} style={{ position: 'absolute' }}>
          <rect width={W} height={H} fill="#141A33" />
          {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={0.3 + 0.5 * Math.abs(Math.sin(frame / 20 + i))} />)}
          <circle cx={1500} cy={170} r={80} fill="#F5E6B8" />
          <Houses frame={frame} windows="#F5B84A" />
          <rect y={GROUND} width={W} height={H - GROUND} fill="#1E2540" />
          <rect y={GROUND + 60} width={W} height={8} fill="#2B3350" />
        </svg>
      );
    case 'castle-night':
      return (
        <svg width={W} height={H} style={{ position: 'absolute' }}>
          <rect width={W} height={H} fill="#120F26" />
          {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FFFFFF" opacity={0.4} />)}
          <circle cx={420} cy={200} r={90} fill="#F5E6B8" />
          <path d="M 0 900 Q 500 560 960 600 Q 1400 560 1920 900 Z" fill="#1E1A3A" />
          <g fill="#2A244D">
            <rect x={760} y={330} width={400} height={300} />
            <rect x={700} y={250} width={120} height={380} />
            <rect x={1100} y={220} width={120} height={410} />
            {[0, 1, 2, 3, 4].map((k) => <rect key={k} x={770 + k * 82} y={300} width={44} height={40} />)}
            <path d="M 690 250 L 760 160 L 830 250 Z M 1090 220 L 1160 120 L 1230 220 Z" />
          </g>
          {[[740, 330], [1140, 300], [900, 450], [1010, 450]].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width={36} height={56} rx={18} fill="#F5853A" opacity={0.5 + 0.5 * Math.abs(Math.sin(frame / 7 + i))} />
          ))}
          <rect y={GROUND} width={W} height={H - GROUND} fill="#16122E" />
        </svg>
      );
    case 'garden':
      return (
        <svg width={W} height={H} style={{ position: 'absolute' }}>
          <defs>
            <linearGradient id="kit-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F7C978" />
              <stop offset="1" stopColor="#F4A46A" />
            </linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#kit-sky)" />
          <rect x={560} y={330} width={800} height={260} fill="#E9DCC3" />
          <path d="M 520 330 L 960 200 L 1400 330 Z" fill="#B85C3C" />
          {[0, 1, 2, 3, 4, 5, 6].map((k) => <rect key={k} x={600 + k * 110} y={400} width={50} height={90} fill="#7A8FB0" />)}
          <path d="M 0 640 Q 960 560 1920 640 L 1920 1080 L 0 1080 Z" fill="#6E9B4E" />
          <rect y={GROUND} width={W} height={H - GROUND} fill="#5C8742" />
        </svg>
      );
    case 'room':
      return (
        <svg width={W} height={H} style={{ position: 'absolute' }}>
          <rect width={W} height={H} fill="#F3E7D3" />
          <rect x={1180} y={180} width={420} height={320} fill="#9FC6E0" stroke="#FFFFFF" strokeWidth={18} />
          <line x1={1390} y1={180} x2={1390} y2={500} stroke="#FFFFFF" strokeWidth={10} />
          <rect x={200} y={250} width={300} height={200} fill="#E2CFAE" />
          <rect y={GROUND} width={W} height={H - GROUND} fill="#C99B6D" />
        </svg>
      );
    case 'city-day':
      return (
        <svg width={W} height={H} style={{ position: 'absolute' }}>
          <rect width={W} height={H} fill="#BFE3F2" />
          {[100, 380, 620, 900, 1180, 1450, 1700].map((x, i) => (
            <rect key={i} x={x} y={GROUND - 300 - (i % 3) * 120} width={200} height={300 + (i % 3) * 120} fill={['#8FB3CC', '#A7C4D8', '#7FA3BE'][i % 3]} />
          ))}
          <rect y={GROUND} width={W} height={H - GROUND} fill="#9AA5B1" />
        </svg>
      );
    default:
      return <AbsoluteFill style={{ backgroundColor: '#1B2030' }} />;
  }
}

// ---------------------------------------------------------------- props

/** Props, about 200 px tall, bottom at y = 0. */
export function Prop({ id, frame }: { id: string; frame: number }) {
  const flicker = 0.75 + 0.25 * Math.abs(Math.sin(frame / 5));
  switch (id) {
    case 'pumpkin':
    case 'jack':
      return (
        <g>
          <ellipse cx={0} cy={-90} rx={120} ry={90} fill="#F07F23" />
          <ellipse cx={-50} cy={-90} rx={55} ry={88} fill="#E46F14" />
          <ellipse cx={50} cy={-90} rx={55} ry={88} fill="#E46F14" />
          <ellipse cx={0} cy={-90} rx={45} ry={90} fill="#F07F23" />
          <rect x={-10} y={-200} width={20} height={36} rx={6} fill="#5C7A2E" />
          {id === 'jack' && (
            <g fill="#FFD66B" opacity={flicker}>
              <path d="M -60 -120 L -25 -120 L -42 -150 Z M 25 -120 L 60 -120 L 42 -150 Z" />
              <path d="M -70 -70 Q 0 -10 70 -70 L 45 -60 L 30 -78 L 10 -60 L -10 -78 L -30 -60 L -45 -78 Z" />
            </g>
          )}
        </g>
      );
    case 'giant-pumpkin':
      return (
        <g transform="scale(2.2)">
          <Prop id="pumpkin" frame={frame} />
        </g>
      );
    case 'turnip':
      return (
        <g>
          <path d="M 0 0 Q -95 -40 -80 -120 Q -60 -190 0 -190 Q 60 -190 80 -120 Q 95 -40 0 0 Z" fill="#E9D7B4" />
          <path d="M -80 -120 Q -60 -190 0 -190 Q 60 -190 80 -120 Q 40 -150 0 -150 Q -40 -150 -80 -120 Z" fill="#B57BB5" />
          <path d="M -10 -190 L -30 -250 M 0 -190 L 0 -260 M 10 -190 L 30 -250" stroke="#6E9B4E" strokeWidth={10} strokeLinecap="round" />
          <g fill="#FFD66B" opacity={flicker}>
            <circle cx={-28} cy={-110} r={12} />
            <circle cx={28} cy={-110} r={12} />
            <path d="M -35 -65 Q 0 -40 35 -65 Q 0 -55 -35 -65 Z" />
          </g>
        </g>
      );
    case 'candy':
      return (
        <g>
          <path d="M -60 -40 L -110 -70 L -110 -10 Z M 60 -40 L 110 -70 L 110 -10 Z" fill="#F06A5D" />
          <ellipse cx={0} cy={-40} rx={65} ry={40} fill="#F06A5D" />
          <path d="M -30 -75 Q 0 -40 -30 -5 M 0 -80 Q 30 -40 0 0" stroke="#FFFFFF" strokeWidth={8} fill="none" />
        </g>
      );
    case 'ghost':
      return (
        <g transform={`translate(0 ${Math.sin(frame / 10) * 14})`}>
          <path d="M -80 -20 L -80 -150 Q -80 -240 0 -240 Q 80 -240 80 -150 L 80 -20 L 50 -45 L 25 -20 L 0 -45 L -25 -20 L -50 -45 Z" fill="#F4F1FA" />
          <circle cx={-25} cy={-160} r={12} fill="#1B2030" />
          <circle cx={25} cy={-160} r={12} fill="#1B2030" />
        </g>
      );
    case 'bat':
      return (
        <g transform={`translate(${Math.sin(frame / 12) * 60} ${-300 + Math.cos(frame / 9) * 30})`}>
          <path d={`M 0 0 Q -40 ${-30 + Math.sin(frame / 2) * 20} -90 -10 Q -60 0 -50 20 Q -25 5 0 20 Q 25 5 50 20 Q 60 0 90 -10 Q 40 ${-30 + Math.sin(frame / 2) * 20} 0 0 Z`} fill="#0B0B14" />
        </g>
      );
    case 'door':
      return (
        <g>
          <rect x={-110} y={-420} width={220} height={420} fill="#7A4A2E" />
          <rect x={-90} y={-400} width={180} height={380} fill="#8C5634" />
          <circle cx={60} cy={-200} r={12} fill="#F5B84A" />
          <rect x={-80} y={-470} width={160} height={40} rx={8} fill="#F5B84A" opacity={flicker} />
        </g>
      );
    case 'lantern':
      return (
        <g transform={`rotate(${Math.sin(frame / 15) * 6} 0 -260)`}>
          <line x1={0} y1={-260} x2={0} y2={-180} stroke="#5A4630" strokeWidth={6} />
          <circle cx={0} cy={-120} r={60} fill="#F5B84A" opacity={flicker} />
        </g>
      );
    case 'boat':
      return (
        <g transform={`translate(0 ${Math.sin(frame / 12) * 6})`}>
          <path d="M -150 -60 Q 0 40 150 -60 Z" fill="#F07F23" />
          <rect x={-150} y={-70} width={300} height={14} rx={7} fill="#E46F14" />
        </g>
      );
    case 'phone':
      return (
        <g>
          <rect x={-60} y={-220} width={120} height={220} rx={18} fill="#1B2030" />
          <rect x={-50} y={-205} width={100} height={180} rx={10} fill="#3CC6C0" />
        </g>
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------- the scene

type Item = { kind: string; id: string; args: string[]; at: number };

export function KitScene() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const lines = screenLines(shot, fps);
  const items: Item[] = lines.map(({ fields, at }) => ({ kind: fields[0], id: fields[1] ?? '', args: fields.slice(2), at }));
  // The latest line for each (kind, id) that has started wins: a character can change pose on cue.
  const live = new Map<string, Item>();
  for (const it of items) {
    const key = it.kind === 'char' || it.kind === 'prop' ? `${it.kind}:${it.id}` : `${it.kind}`;
    if (frame >= it.at - 2 || !live.has(key)) live.set(key, it);
  }
  const bg = live.get('bg');
  const text = live.get('text');
  return (
    <AbsoluteFill>
      <Background id={bg?.id ?? 'night-street'} frame={frame} />
      <svg width={W} height={H} style={{ position: 'absolute' }}>
        {[...live.values()]
          .filter((it) => it.kind === 'prop' || it.kind === 'char')
          .map((it) => {
            const first = items.find((x) => x.kind === it.kind && x.id === it.id)!;
            const o = rise(frame, first.at, 12);
            const x = Number(it.args[it.kind === 'char' ? 1 : 0] ?? 0.5) * W;
            const s = it.kind === 'prop' ? Number(it.args[1] ?? 1) : 1.25;
            const pop = interpolate(o, [0, 1], [0.6, 1]);
            return (
              <g key={`${it.kind}:${it.id}`} transform={`translate(${x} ${GROUND + 40}) scale(${s * pop})`} opacity={o}>
                {it.kind === 'char' ? (
                  <Character id={it.id} pose={(it.args[0] as Pose) || 'stand'} frame={frame} flip={it.args[2] === 'flip'} />
                ) : (
                  <Prop id={it.id} frame={frame} />
                )}
              </g>
            );
          })}
      </svg>
      {text && frame >= text.at - 2 && (
        <div
          style={{
            position: 'absolute',
            top: 90,
            left: 120,
            right: 120,
            textAlign: 'center',
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 92,
            lineHeight: 1.1,
            color: '#FFFFFF',
            textShadow: '0 6px 0 rgba(0,0,0,0.35)',
            opacity: rise(frame, text.at, 10),
            transform: `scale(${interpolate(rise(frame, text.at, 10), [0, 1], [0.85, 1])})`,
          }}
        >
          {[text.id, ...text.args].join(' · ')}
        </div>
      )}
    </AbsoluteFill>
  );
}
