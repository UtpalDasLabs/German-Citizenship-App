/**
 * Archive and verité scenes for Logic to Live By #3.
 *
 * The 1986 chapter is drawn as a lab report on paper (`Pressure`, `MapScene`,
 * `Throughput`, `Storm`), the rule's memo as a file (`RuleIntro`), the catch as
 * two small charts (`Failure`), and the closing rule as a pocket card
 * (`RetryCard`). The everyday uses stay on real footage, with one graphic each.
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import { alpha, C, FONT } from '../lib/brand';
import { rise, SERIF } from './look';
import { cue, useShot } from './plan';
import { useAccent } from './series';
import { between, InkSheet, kickerStyle, OverlayFrame, P, PaperSheet, rnd, Stamp, Tag } from './backoff-kit';

// ─── Cold open: the instinct ────────────────────────────────────────────────

/** More attempts into a pipe that is already full: the queue, the load, the stamp. */
export function Pressure() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const a = cue(shot, 'feels like trying harder', fps, { fallback: 0.08 });
  const b = cue(shot, 'already full', fps, { fallback: 0.3 });
  const c = cue(shot, 'adding to the problem', fps, { fallback: 0.55 });
  const d = cue(shot, 'October 1986', fps, { fallback: 0.8 });
  const flow = between(frame, a, b);
  const crowd = between(frame, b, c + 12);
  const stamp = rise(frame, d, 14);
  const load = 42 + 168 * crowd;

  return (
    <InkSheet kicker="The instinct" title="Retry faster" lead="More attempts, into a system that is already full.">
      {/* The service pipe: fixed capacity, filling up */}
      <div style={{ position: 'absolute', left: 620, top: 420, width: 1010, height: 250, borderRadius: 12, border: `2.5px solid ${alpha('#FFFFFF', 0.28)}`, backgroundColor: alpha('#10151F', 0.9) }} />
      <Tag text="capacity · fixed" at={b} x={624} y={384} color={alpha('#FFFFFF', 0.55)} />
      {Array.from({ length: 12 }).map((_, i) => {
        const filled = i < 4 + crowd * 8.6;
        return (
          <div
            key={`s${i}`}
            style={{
              position: 'absolute',
              left: 636 + i * 82,
              top: 438,
              width: 66,
              height: 214,
              borderRadius: 6,
              backgroundColor: filled ? alpha(accent, 0.32 + 0.1 * crowd) : '#232B3A',
              border: `1.5px solid ${filled ? alpha(accent, 0.8) : '#2E3748'}`,
            }}
          />
        );
      })}
      <div style={{ position: 'absolute', left: 1650, top: 512, fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 6, color: alpha('#FFFFFF', 0.85 * crowd), textTransform: 'uppercase' }}>
        full
      </div>

      {/* Retries arriving, faster as the instinct takes over */}
      {Array.from({ length: 16 }).map((_, i) => {
        const speed = 2.4 + flow * 6.4;
        const x = 120 + (((frame * speed + i * 67) % 460) as number);
        const y = 468 + (i % 5) * 40;
        const o = flow * (0.35 + 0.65 * (i % 3 === 0 ? 1 : 0.6));
        return (
          <div key={`r${i}`} style={{ position: 'absolute', left: x, top: y, opacity: o }}>
            <div style={{ width: 30, height: 4, backgroundColor: accent, borderRadius: 2 }} />
            <div style={{ position: 'absolute', left: 29, top: -4, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: `9px solid ${accent}` }} />
          </div>
        );
      })}

      {/* Load readout */}
      <div style={{ position: 'absolute', left: 620, top: 720, width: 1010 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 700, fontSize: 22, letterSpacing: 2, color: '#7E889C', textTransform: 'uppercase' }}>
          <span>load</span>
          <span style={{ color: crowd > 0.45 ? '#E06A5A' : '#7E889C', fontVariantNumeric: 'tabular-nums' }}>{Math.round(load)}%</span>
        </div>
        <div style={{ marginTop: 10, height: 18, borderRadius: 9, backgroundColor: '#1C2433', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, load / 2.1)}%`, height: '100%', borderRadius: 9, backgroundColor: crowd > 0.45 ? '#E06A5A' : accent }} />
        </div>
        <div style={{ marginTop: 14, fontFamily: FONT, fontWeight: 600, fontSize: 23, color: '#7E889C', opacity: rise(frame, c, 14) }}>
          Every refresh is another packet the system has to drop.
        </div>
      </div>

      {/* The date lands */}
      <div style={{ opacity: stamp }}>
        <Stamp text="October 1986" at={d} x={1290} y={300} size={44} rotate={-6} color="#E06A5A" border={5} />
        <div style={{ position: 'absolute', right: 110, top: 246, width: 700, textAlign: 'right', fontFamily: FONT, fontWeight: 700, fontSize: 26, lineHeight: 1.3, color: alpha('#FFFFFF', 0.9), opacity: stamp }}>
          the instinct that nearly killed the internet
        </div>
      </div>
    </InkSheet>
  );
}

// ─── October 1986: the map ─────────────────────────────────────────────────

export function MapScene() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const a = cue(shot, 'two buildings', fps, { fallback: 0.12 });
  const b = cue(shot, 'Lawrence Berkeley', fps, { fallback: 0.32 });
  const c = cue(shot, 'University of California', fps, { fallback: 0.52 });
  const d = cue(shot, 'two hops', fps, { fallback: 0.8 });
  const e = cue(shot, 'four hundred yards', fps, { fallback: 0.24 });
  const draw = between(frame, a, d + 16);
  const dist = between(frame, e, e + 20);
  const hop = (x: number, n: number) => {
    const o = rise(frame, b + n * 14, 14);
    return (
      <React.Fragment key={n}>
        <div style={{ position: 'absolute', left: x - 13, top: 622, width: 26, height: 26, border: `3px solid ${P.ink}`, backgroundColor: P.paper, transform: 'rotate(45deg)', opacity: o }} />
        <div style={{ position: 'absolute', left: x - 40, top: 578, width: 80, textAlign: 'center', ...kickerStyle(P.muted, 15), opacity: o }}>hop {n}</div>
      </React.Fragment>
    );
  };
  const building = (x: number, label: string[], mono: string, at: number) => {
    const o = rise(frame, at, 18);
    return (
      <React.Fragment>
        <div style={{ position: 'absolute', left: x, top: 540, width: 210, height: 170, border: `3px solid ${P.ink}`, backgroundColor: alpha(P.paper, 0.5), opacity: o }}>
          <div style={{ position: 'absolute', inset: 16, border: `1.5px solid ${alpha(P.ink, 0.55)}` }} />
          <div style={{ position: 'absolute', left: 26, right: 26, top: 52, height: 1.5, backgroundColor: alpha(P.ink, 0.45) }} />
          <div style={{ position: 'absolute', left: 26, right: 26, top: 96, height: 1.5, backgroundColor: alpha(P.ink, 0.45) }} />
          <div style={{ position: 'absolute', left: 74, top: 16, bottom: 16, width: 1.5, backgroundColor: alpha(P.ink, 0.45) }} />
          <div style={{ position: 'absolute', right: 74, top: 16, bottom: 16, width: 1.5, backgroundColor: alpha(P.ink, 0.45) }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 34, letterSpacing: 3, color: alpha(P.ink, 0.18) }}>{mono}</div>
        </div>
        <div style={{ position: 'absolute', left: x - 10, top: 456, width: 330, fontFamily: FONT, fontWeight: 800, fontSize: 18, lineHeight: 1.35, letterSpacing: 2.4, textTransform: 'uppercase', color: P.ink, opacity: o }}>
          {label.map((l) => <div key={l}>{l}</div>)}
        </div>
      </React.Fragment>
    );
  };

  return (
    <PaperSheet kicker="Figure 1 · October 1986" title="Two buildings, two hops" foot={['Berkeley, California', 'Jacobson & Karels · SIGCOMM ’88']}>
      {/* Faint city plan under everything */}
      <AbsoluteFill style={{ opacity: 0.5 }}>
        {[300, 520, 760, 1000, 1240, 1480, 1660].map((x) => (
          <div key={`v${x}`} style={{ position: 'absolute', left: x, top: 250, bottom: 150, width: 1, backgroundColor: alpha(P.ink, 0.12) }} />
        ))}
        {[320, 430, 540, 650, 760, 870].map((y) => (
          <div key={`h${y}`} style={{ position: 'absolute', left: 120, right: 120, top: y, height: 1, backgroundColor: alpha(P.ink, 0.12) }} />
        ))}
      </AbsoluteFill>

      {building(320, ['Lawrence Berkeley', 'Laboratory'], 'LBL', b)}
      {building(1310, ['University of', 'California'], 'UCB', c)}
      {hop(790, 1)}
      {hop(1070, 2)}

      {/* The route between them */}
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <path
          d="M 530 635 L 1310 635"
          fill="none"
          stroke={P.ink}
          strokeWidth={4}
          strokeDasharray="1"
          pathLength={1}
          strokeDashoffset={1 - draw}
          opacity={0.85}
        />
      </svg>

      {/* Distance bracket */}
      <div style={{ position: 'absolute', left: 530, top: 790, width: 780 * dist, height: 2, backgroundColor: P.ink, opacity: 0.7 }} />
      <div style={{ position: 'absolute', left: 528, top: 778, width: 2, height: 26, backgroundColor: P.ink, opacity: 0.7 * dist }} />
      <div style={{ position: 'absolute', left: 1308, top: 778, width: 2, height: 26, backgroundColor: P.ink, opacity: 0.7 * dist }} />
      <div style={{ position: 'absolute', left: 530, top: 812, width: 780, textAlign: 'center', ...kickerStyle(P.muted, 22), opacity: dist }}>400 yards</div>

      {d > 0 && (
        <div style={{ position: 'absolute', right: 110, top: 300, ...kickerStyle(P.muted, 20), opacity: rise(frame, d, 12), textAlign: 'right' }}>
          <div>young internet</div>
          <div style={{ marginTop: 6, color: accent, fontSize: 30, letterSpacing: 3 }}>2 hops</div>
        </div>
      )}

      {/* Compass */}
      <div style={{ position: 'absolute', left: 1640, top: 250, width: 76, height: 76, border: `1.5px solid ${alpha(P.ink, 0.5)}`, borderRadius: 38, opacity: 0.8 }}>
        <div style={{ position: 'absolute', left: 36, top: 12, width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: `16px solid ${P.ink}` }} />
        <div style={{ position: 'absolute', left: 34, top: 28, fontFamily: FONT, fontWeight: 800, fontSize: 15, color: P.ink }}>N</div>
      </div>
    </PaperSheet>
  );
}

// ─── The link ──────────────────────────────────────────────────────────────

export function Throughput() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const a = cue(shot, 'Forty bits', fps, { fallback: 0.05 });
  const b = cue(shot, 'thousand times', fps, { fallback: 0.28 });
  const c = cue(shot, 'switched off', fps, { fallback: 0.55 });
  const d = cue(shot, 'strangling itself', fps, { fallback: 0.76 });
  const draw = between(frame, 0, a + 22);
  const traffic = between(frame, d - 8, d + 28);

  const X0 = 150;
  const X1 = 1450;
  const Y0 = 300;
  const Y1 = 740;
  const logY = (v: number) => Y1 - (Math.log10(v) / 5) * (Y1 - Y0);
  const pts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const t = i / 80;
    const v = t < 0.3 ? 32000 : 32000 * Math.pow(40 / 32000, Math.min(1, (t - 0.3) / 0.42));
    pts.push(`${X0 + t * (X1 - X0)},${logY(v)}`);
  }
  const tPts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const v = Math.pow(800, t);
    tPts.push(`${X0 + (0.3 + t * 0.48) * (X1 - X0)},${Y1 - (Math.log10(v) / Math.log10(800)) * (Y1 - Y0)}`);
  }

  return (
    <PaperSheet kicker="Figure 2 · The link" title="A thousand times slower" foot={['LBL → UC Berkeley', 'Timings: Jacobson & Karels']}>
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {/* grid */}
        {[1, 10, 100, 1000, 10000, 100000].map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={logY(v)} y2={logY(v)} stroke={P.ink} strokeOpacity={v === 1 ? 0.45 : 0.14} strokeWidth={v === 1 ? 2 : 1} />
            <text x={X0 - 18} y={logY(v) + 6} textAnchor="end" fontFamily={FONT} fontSize={19} fontWeight={700} fill={P.muted}>
              {v >= 1000 ? `${v / 1000}k` : v}
            </text>
          </g>
        ))}
        {['13:00', '14:00', '15:00', '16:00', '17:00'].map((t, i) => (
          <g key={t}>
            <line x1={X0 + i * 325} x2={X0 + i * 325} y1={Y1} y2={Y1 + 10} stroke={P.ink} strokeOpacity={0.5} strokeWidth={2} />
            <text x={X0 + i * 325} y={Y1 + 40} textAnchor="middle" fontFamily={FONT} fontSize={19} fontWeight={700} fill={P.muted}>{t}</text>
          </g>
        ))}
        <text x={X0 - 18} y={Y0 - 16} textAnchor="end" fontFamily={FONT} fontSize={17} fontWeight={800} fill={P.muted}>bit/s</text>
        <text x={X1 + 26} y={Y0 + 6} fontFamily={FONT} fontSize={17} fontWeight={800} fill={P.stamp}>retransmissions</text>
        <text x={X1 + 26} y={Y0 + 30} fontFamily={FONT} fontSize={17} fontWeight={700} fill={P.muted}>1× → 800×</text>

        <polyline points={pts.join(' ')} fill="none" stroke={P.ink} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
        <polyline points={tPts.join(' ')} fill="none" stroke={P.stamp} strokeWidth={4} strokeDasharray="10 10" opacity={traffic} />

        {/* the drop */}
        <line x1={X0 + 0.3 * (X1 - X0)} x2={X0 + 0.3 * (X1 - X0)} y1={logY(32000)} y2={Y1} stroke={P.stamp} strokeWidth={2} strokeDasharray="6 8" opacity={0.55 * draw} />
      </svg>

      {/* readout in the empty upper right of the chart */}
      <div style={{ position: 'absolute', left: 1080, top: 320, width: 350, padding: '18px 24px', backgroundColor: alpha(P.paper, 0.92), borderLeft: `5px solid ${accent}` }}>
        <div style={{ ...kickerStyle(P.muted, 17) }}>throughput now</div>
        <div style={{ marginTop: 4, fontFamily: FONT, fontWeight: 900, fontSize: 76, letterSpacing: -2, color: P.ink, fontVariantNumeric: 'tabular-nums' }}>40 <span style={{ fontSize: 34 }}>bit/s</span></div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 21, color: P.muted }}>was 32,000 bit/s</div>
      </div>

      <Stamp text="×1,000 slower" at={b} x={450} y={470} size={38} rotate={-5} />

      {/* nothing was switched off */}
      <div style={{ position: 'absolute', left: 150, top: 844, display: 'flex', gap: 54, alignItems: 'center', opacity: rise(frame, c, 16) }}>
        {[
          { label: 'power', on: true },
          { label: 'link', on: true },
          { label: 'traffic', on: true, warn: true },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: l.warn ? P.stamp : P.good, boxShadow: `0 0 16px ${alpha(l.warn ? P.stamp : P.good, 0.6)}` }} />
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 19, letterSpacing: 3, textTransform: 'uppercase', color: P.ink }}>{l.label} on</div>
          </div>
        ))}
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 23, color: P.muted }}>nothing was switched off</div>
      </div>
    </PaperSheet>
  );
}

// ─── The mechanism ─────────────────────────────────────────────────────────

export function Storm() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const lost = cue(shot, 'packet goes missing', fps, { fallback: 0.08 });
  const again = cue(shot, 'send it again', fps, { fallback: 0.2 });
  const full = cue(shot, 'already full', fps, { fallback: 0.38 });
  const dropped = cue(shot, 'dropped as well', fps, { fallback: 0.46 });
  const those = cue(shot, 'send those again', fps, { fallback: 0.58 });
  const more = cue(shot, 'More packets', fps, { fallback: 0.72 });
  const panic = cue(shot, 'panic was the problem', fps, { fallback: 0.9 });
  const fill = between(frame, full, dropped);

  const life = 42;
  const step = Math.max(9, Math.round((those - lost) / 6));
  const spawns: number[] = [];
  for (let k = 0; k < 6; k++) spawns.push(lost + k * step);
  for (let s = more; s < panic; s += 9) spawns.push(s);
  const fade = 1 - between(frame, panic, panic + 16);
  const packets: React.ReactNode[] = [];
  spawns.forEach((spawn, k) => {
    const age = frame - spawn;
    if (age < 0 || age > life * 1.7) return;
    const count = Math.min(6, 2 ** (k % 4));
    for (let j = 0; j < count; j++) {
      const dir = (j + k) % 2;
      const prog = Math.min(1, age / life);
      const x = dir ? 1550 - 450 * prog : 340 + 480 * prog;
      const y = 424 + j * 18 + (k % 2) * 5;
      const dropP = Math.max(0, Math.min(1, (age - life) / 14));
      const isDropped = age > life;
      packets.push(
        <div key={`p${k}-${j}`} style={{ position: 'absolute', left: x, top: y + dropP * 55, width: 28, height: 14, borderRadius: 2, backgroundColor: isDropped ? P.stamp : P.ink, opacity: (isDropped ? 1 - dropP * 0.9 : 1) * fade }} />,
      );
    }
  });

  return (
    <PaperSheet kicker="Figure 3 · The mechanism" title="The panic was the problem" foot={['A packet, lost and copied', 'Congestion collapse']}>
      {/* hosts */}
      {[
        { x: 140, label: 'host A' },
        { x: 1580, label: 'host B' },
      ].map((h) => (
        <React.Fragment key={h.label}>
          <div style={{ position: 'absolute', left: h.x, top: 380, width: 160, height: 210, border: `3px solid ${P.ink}`, backgroundColor: alpha(P.paper, 0.4) }}>
            <div style={{ position: 'absolute', inset: 18, border: `1.5px solid ${alpha(P.ink, 0.5)}` }} />
            <div style={{ position: 'absolute', left: 34, top: 52, right: 34, height: 54, border: `1.5px solid ${alpha(P.ink, 0.5)}`, backgroundColor: alpha(P.ink, 0.06) }} />
            <div style={{ position: 'absolute', left: 34, bottom: 28, right: 34, height: 18, backgroundColor: alpha(P.ink, 0.18) }} />
          </div>
          <div style={{ position: 'absolute', left: h.x, top: 606, width: 160, textAlign: 'center', ...kickerStyle(P.ink, 20) }}>{h.label}</div>
        </React.Fragment>
      ))}

      {/* router and its buffer */}
      <div style={{ position: 'absolute', left: 850, top: 330, width: 230, height: 380, border: `3px solid ${P.ink}`, backgroundColor: alpha(P.paper, 0.55) }} />
      <div style={{ position: 'absolute', left: 850, top: 330, width: 230, height: 48, backgroundColor: alpha(P.ink, 0.1), borderBottom: `1.5px solid ${alpha(P.ink, 0.35)}` }} />
      <div style={{ position: 'absolute', left: 850, top: 344, width: 230, textAlign: 'center', ...kickerStyle(P.ink, 17) }}>router</div>
      {Array.from({ length: 8 }).map((_, i) => {
        const on = i < Math.round(1 + 7 * fill);
        return <div key={`b${i}`} style={{ position: 'absolute', left: 874, top: 392 + i * 37, width: 182, height: 27, border: `1.5px solid ${on ? P.stamp : alpha(P.ink, 0.3)}`, backgroundColor: on ? alpha(P.stamp, 0.28) : 'transparent' }} />;
      })}
      <div style={{ position: 'absolute', left: 850, top: 724, width: 230, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 19, letterSpacing: 3, textTransform: 'uppercase', color: P.stamp, opacity: rise(frame, full, 10) }}>buffer full · dropping</div>

      {packets}

      {/* loss marks */}
      {Array.from({ length: 16 }).map((_, i) => {
        const x = 640 + rnd(i + 3) * 660;
        const y = 380 + rnd(i + 9) * 300;
        const o = between(frame, those, those + 14) * (0.55 + 0.45 * Math.sin((frame + i * 7) / 6));
        return (
          <div key={`x${i}`} style={{ position: 'absolute', left: x, top: y, opacity: o, color: P.stamp, fontFamily: FONT, fontWeight: 900, fontSize: 30, lineHeight: 1 }}>×</div>
        );
      })}

      {/* the counter */}
      <div style={{ position: 'absolute', left: 150, top: 790, display: 'flex', alignItems: 'baseline', gap: 16 }}>
        <div style={{ ...kickerStyle(P.muted, 18) }}>copies in flight</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: P.stamp, fontVariantNumeric: 'tabular-nums' }}>
          ×{Math.min(64, 2 ** Math.max(0, Math.floor((frame - lost) / Math.max(9, step))))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: 150, top: 846, fontFamily: FONT, fontWeight: 600, fontSize: 24, color: P.muted }}>
        A packet goes missing. Both ends send it again, immediately.
      </div>

      <div style={{ opacity: rise(frame, panic, 12) }}>
        <Stamp text="The panic was the problem" at={panic} x={560} y={580} size={40} rotate={-4} />
      </div>
    </PaperSheet>
  );
}

// ─── The rule's file ───────────────────────────────────────────────────────

export function RuleIntro() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const a = cue(shot, 'Two researchers', fps, { fallback: 0.08 });
  const b = cue(shot, 'Van Jacobson', fps, { fallback: 0.2 });
  const c = cue(shot, 'Michael Karels', fps, { fallback: 0.32 });
  const d = cue(shot, 'three parts', fps, { fallback: 0.86 });
  const parts = [
    { n: '01', name: 'Double', note: 'wait twice as long' },
    { n: '02', name: 'Cap', note: 'stop at a minute' },
    { n: '03', name: 'Jitter', note: 'pick a random moment' },
  ];
  const glyph = (k: number) => {
    if (k === 0) {
      return [18, 34, 54].map((h, i) => <div key={i} style={{ position: 'absolute', left: i * 24, bottom: 0, width: 18, height: h, backgroundColor: P.ink }} />);
    }
    if (k === 1) {
      return [18, 34, 54, 54].map((h, i) => <div key={i} style={{ position: 'absolute', left: i * 22, bottom: 0, width: 16, height: h, backgroundColor: i === 3 ? P.stamp : P.ink }} />);
    }
    return [
      [4, 8], [24, 36], [48, 6], [62, 32], [34, 50], [72, 44], [14, 44], [56, 16], [84, 34],
    ].map(([x, y], i) => <div key={i} style={{ position: 'absolute', left: x, top: y, width: 10, height: 10, borderRadius: 5, backgroundColor: P.ink }} />);
  };

  return (
    <PaperSheet kicker="The fix · Berkeley, 1988" title="Three changes" foot={['Memo · congestion collapse', 'Van Jacobson & Michael Karels']}>
      {/* staff file cards */}
      {[
        { x: 96, y: 270, mono: 'VJ', name: 'Van Jacobson', at: b },
        { x: 96, y: 470, mono: 'MK', name: 'Michael Karels', at: c },
      ].map((p) => (
        <div key={p.mono} style={{ position: 'absolute', left: p.x, top: p.y, width: 620, height: 150, border: `1.5px solid ${alpha(P.ink, 0.45)}`, backgroundColor: alpha('#FFFFFF', 0.18), opacity: rise(frame, p.at, 16) }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 120, borderRight: `1.5px solid ${alpha(P.ink, 0.35)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 40, letterSpacing: 2, color: P.ink }}>{p.mono}</div>
          <div style={{ position: 'absolute', left: 146, top: 38, fontFamily: SERIF, fontWeight: 600, fontSize: 36, color: P.ink }}>{p.name}</div>
          <div style={{ position: 'absolute', left: 146, top: 90, ...kickerStyle(P.muted, 16) }}>Lawrence Berkeley Laboratory</div>
        </div>
      ))}

      <div style={{ position: 'absolute', left: 96, top: 680, width: 620, fontFamily: FONT, fontWeight: 600, fontSize: 23, color: P.muted, opacity: rise(frame, c + 6, 16), lineHeight: 1.5 }}>
        Their answer is in every phone and laptop you own.
      </div>

      {/* three parts */}
      {parts.map((p, i) => {
        const o = rise(frame, c + 12 + i * 16, 14);
        const solid = 0.3 + 0.7 * rise(frame, c + 30 + i * 16, 16);
        return (
          <div key={p.n} style={{ position: 'absolute', left: 830, top: 270 + i * 210, width: 990, height: 170, borderTop: `1.5px solid ${alpha(P.ink, 0.35)}`, opacity: o }}>
            <div style={{ position: 'absolute', left: 0, top: 40, fontFamily: FONT, fontWeight: 900, fontSize: 30, color: alpha(P.ink, solid) }}>{p.n}</div>
            <div style={{ position: 'absolute', left: 78, top: 26, fontFamily: FONT, fontWeight: 900, fontSize: 52, letterSpacing: -1, color: alpha(P.ink, solid) }}>{p.name}</div>
            <div style={{ position: 'absolute', left: 78, top: 96, fontFamily: FONT, fontWeight: 600, fontSize: 24, color: alpha(P.muted, solid) }}>{p.note}</div>
            <div style={{ position: 'absolute', right: 40, bottom: 22, width: 100, height: 66 }}>{glyph(i)}</div>
          </div>
        );
      })}

      {d > 0 && (
        <div style={{ position: 'absolute', left: 830, top: 900, display: 'flex', alignItems: 'center', gap: 18, opacity: rise(frame, d, 12) }}>
          <div style={{ width: 60, height: 4, backgroundColor: accent }} />
          <div style={{ ...kickerStyle(P.ink, 22) }}>three parts, one rule</div>
        </div>
      )}
    </PaperSheet>
  );
}

// ─── The catch ─────────────────────────────────────────────────────────────

export function Failure() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const a = cue(shot, 'a catch', fps, { fallback: 0.08 });
  const b = cue(shot, 'might come back', fps, { fallback: 0.5 });
  const draw = between(frame, a + 4, b + 10);
  const recover = between(frame, b - 8, b + 12);

  const charts = [
    { x0: 160, x1: 880, title: 'Temporary', sub: 'service returns', colour: accent, recovers: true },
    { x0: 1040, x1: 1760, title: 'Permanent', sub: 'the number is gone', colour: P.stamp, recovers: false },
  ];
  const Y0 = 370;
  const Y1 = 680;

  return (
    <PaperSheet kicker="Figure 4 · The catch" title="Only if it can come back" foot={['Backoff is a bet on recovery', 'A longer wait is not always better']}>
      {charts.map((ch) => {
        const dropX = ch.x0 + 210;
        const recX = ch.x0 + 470;
        const path = ch.recovers
          ? `M ${ch.x0} ${Y0} L ${dropX} ${Y0} L ${dropX} ${Y1} L ${recX} ${Y1} L ${recX} ${Y0} L ${ch.x1} ${Y0}`
          : `M ${ch.x0} ${Y0} L ${dropX} ${Y0} L ${dropX} ${Y1} L ${ch.x1} ${Y1}`;
        const bracketEnd = ch.recovers ? recX : ch.x1 - 10;
        return (
          <React.Fragment key={ch.title}>
            <div style={{ position: 'absolute', left: ch.x0, top: 258, ...kickerStyle(P.muted, 19) }}>{ch.title}</div>
            <div style={{ position: 'absolute', left: ch.x0, top: 286, fontFamily: SERIF, fontWeight: 600, fontSize: 38, color: P.ink }}>{ch.sub}</div>
            <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
              <line x1={ch.x0} x2={ch.x1} y1={Y0} y2={Y0} stroke={P.ink} strokeOpacity={0.18} strokeWidth={1.5} />
              <line x1={ch.x0} x2={ch.x1} y1={Y1} y2={Y1} stroke={P.ink} strokeOpacity={0.45} strokeWidth={2} />
              <line x1={ch.x0} x2={ch.x0} y1={Y0} y2={Y1} stroke={P.ink} strokeOpacity={0.45} strokeWidth={2} />
              <path d={path} fill="none" stroke={ch.colour} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
              {ch.recovers ? (
                <circle cx={recX} cy={Y0} r={13} fill={P.paper} stroke={accent} strokeWidth={5} opacity={recover} />
              ) : null}
              {/* the wait */}
              <line x1={dropX} x2={bracketEnd} y1={742} y2={742} stroke={P.ink} strokeWidth={2} opacity={0.6} />
              <line x1={dropX} x2={dropX} y1={732} y2={752} stroke={P.ink} strokeWidth={2} opacity={0.6} />
              <line x1={bracketEnd} x2={bracketEnd} y1={732} y2={752} stroke={P.ink} strokeWidth={2} opacity={0.6} />
            </svg>
            <div style={{ position: 'absolute', left: ch.x0 + 120, top: 760, width: 520, ...kickerStyle(ch.recovers ? P.good : P.stamp, 20) }}>
              {ch.recovers ? 'waiting helps' : 'waiting changes nothing'}
            </div>
            <div style={{ position: 'absolute', left: ch.x0 + 180, top: 700, ...kickerStyle(P.muted, 15) }}>failure</div>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: 160, top: 840, fontFamily: FONT, fontWeight: 600, fontSize: 25, color: P.muted }}>
        The wait only buys something if the thing you are waiting for can recover.
      </div>
    </PaperSheet>
  );
}

// ─── The closing card ──────────────────────────────────────────────────────

export function RetryCard() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const cues = [
    cue(shot, 'wait longer', fps, { fallback: 0.06 }),
    cue(shot, 'Cap the wait', fps, { fallback: 0.28 }),
    cue(shot, 'Spread your attempts', fps, { fallback: 0.48 }),
    cue(shot, 'stop at three', fps, { fallback: 0.68 }),
  ];
  const changed = cue(shot, 'something has changed', fps, { fallback: 0.9 });
  const rows = [
    { n: '1', main: 'Wait longer each time', value: '1s · 2s · 4s · 8s' },
    { n: '2', main: 'Cap the wait', value: '60s' },
    { n: '3', main: 'Spread your attempts', value: 'jitter' },
    { n: '4', main: 'Stop at three', value: 'unless something changed' },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#0A0D13' }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${alpha(accent, 0.12)} 0%, ${alpha(accent, 0)} 62%)` }} />
      <div style={{ position: 'absolute', left: 190, top: 132, width: 1540, height: 816, transform: 'rotate(-1.1deg)', backgroundColor: P.paper, boxShadow: '0 40px 90px rgba(0,0,0,0.55)', border: `1px solid ${alpha(P.ink, 0.25)}` }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 14, backgroundColor: accent, opacity: 0.85 }} />
        <div style={{ position: 'absolute', left: 74, top: 58, ...kickerStyle(P.muted, 17) }}>Logic to Live By · episode 3</div>
        <div style={{ position: 'absolute', left: 74, top: 88, fontFamily: SERIF, fontWeight: 600, fontSize: 50, color: P.ink }}>The retry card</div>
        <div style={{ position: 'absolute', right: 74, top: 96, ...kickerStyle(P.muted, 16) }}>when something fails</div>
        <div style={{ position: 'absolute', left: 66, top: 176, bottom: 60, width: 1.5, backgroundColor: alpha(P.stamp, 0.45) }} />
        {rows.map((r, i) => {
          const o = rise(frame, cues[i], 14);
          return (
            <div key={r.n} style={{ position: 'absolute', left: 100, right: 90, top: 190 + i * 140, height: 120, borderBottom: `1px solid ${alpha(P.ink, 0.16)}`, opacity: o, transform: `translateY(${(1 - o) * 12}px)` }}>
              <div style={{ position: 'absolute', left: 12, top: 32, width: 46, height: 46, borderRadius: 23, border: `2px solid ${P.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 24, color: P.ink }}>{r.n}</div>
              <div style={{ position: 'absolute', left: 94, top: 26, fontFamily: FONT, fontWeight: 800, fontSize: 38, color: P.ink }}>{r.main}</div>
              <div style={{ position: 'absolute', left: 94, top: 74, fontFamily: FONT, fontWeight: 600, fontSize: 23, letterSpacing: 1, color: i === 3 ? P.stamp : P.muted, opacity: i === 3 ? 0.55 + 0.45 * rise(frame, changed, 14) : 1 }}>{r.value}</div>
            </div>
          );
        })}
        <div style={{ position: 'absolute', right: 70, bottom: 96, transform: 'rotate(-6deg)', opacity: rise(frame, cues[3], 12), border: `5px solid ${P.stamp}`, color: P.stamp, padding: '8px 20px', fontFamily: FONT, fontWeight: 900, fontSize: 32, letterSpacing: 4, textTransform: 'uppercase' }}>stop at 3</div>
      </div>
    </AbsoluteFill>
  );
}

// ─── ALOHA ─────────────────────────────────────────────────────────────────

export function Aloha() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const a = cue(shot, '1970', fps, { fallback: 0.1 });
  const b = cue(shot, 'eighteen percent', fps, { fallback: 0.38 });
  const c = cue(shot, 'lost to collisions', fps, { fallback: 0.6 });
  const d = cue(shot, 'repeating themselves', fps, { fallback: 0.86 });
  const draw = between(frame, a, c);
  const gauge = between(frame, b, b + 26);
  const again = between(frame, d, d + 18);

  const lanes = ['A', 'B', 'C', 'D'];
  const blocks: { lane: number; from: number; to: number }[] = [
    { lane: 0, from: 0.06, to: 0.3 },
    { lane: 0, from: 0.56, to: 0.74 },
    { lane: 1, from: 0.22, to: 0.48 },
    { lane: 1, from: 0.64, to: 0.86 },
    { lane: 2, from: 0.38, to: 0.68 },
    { lane: 3, from: 0.12, to: 0.3 },
    { lane: 3, from: 0.8, to: 0.95 },
  ];
  const collides = (b0: { lane: number; from: number; to: number }) =>
    blocks.some((o) => o !== b0 && o.lane !== b0.lane && o.from < b0.to && b0.from < o.to);

  const X0 = 300;
  const X1 = 1330;
  const laneY = (l: number) => 716 + l * 56;

  return (
    <OverlayFrame topic="logic-backoff" kicker="Hawaii · 1970" title="One channel, everyone talking" foot="ALOHANET · pure ALOHA ceiling 1/2e">
      {/* the shared channel */}
      <div style={{ position: 'absolute', left: 110, top: 640, width: 1290, height: 330, backgroundColor: 'rgba(8,11,17,0.86)', border: `1.5px solid ${alpha('#FFFFFF', 0.14)}`, borderRadius: 8 }}>
        <div style={{ position: 'absolute', left: 28, top: 20, ...kickerStyle(alpha('#FFFFFF', 0.55), 16) }}>one shared radio channel · time →</div>
        {lanes.map((l, i) => (
          <div key={l} style={{ position: 'absolute', left: 28, top: laneY(i) - 702, width: 30, fontFamily: FONT, fontWeight: 800, fontSize: 18, color: alpha('#FFFFFF', 0.65) }}>{l}</div>
        ))}
        <svg width={1290} height={330} style={{ position: 'absolute', left: 0, top: 0 }}>
          {lanes.map((l, i) => (
            <line key={l} x1={X0 - 110} x2={X1 - 110} y1={laneY(i) - 640} y2={laneY(i) - 640} stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={1.5} />
          ))}
          {blocks.map((b0, i) => {
            const x = (X0 - 110) + b0.from * (X1 - X0);
            const w = (b0.to - b0.from) * (X1 - X0) * draw;
            const bad = collides(b0);
            return <rect key={i} x={x} y={laneY(b0.lane) - 640 - 13} width={w} height={26} rx={4} fill={bad ? P.stamp : accent} opacity={bad ? 0.9 : 0.8} />;
          })}
        </svg>
        <div style={{ position: 'absolute', right: 24, top: 18, fontFamily: FONT, fontWeight: 700, fontSize: 17, letterSpacing: 2, textTransform: 'uppercase', color: alpha('#FFFFFF', 0.45), opacity: rise(frame, c, 12) }}>red = two senders overlap</div>
      </div>

      {/* the ceiling */}
      <div style={{ position: 'absolute', right: 96, top: 232, width: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: rise(frame, b, 16) }}>
        <svg width={210} height={210}>
          <circle cx={105} cy={105} r={84} fill="none" stroke={alpha('#FFFFFF', 0.18)} strokeWidth={14} />
          <circle
            cx={105}
            cy={105}
            r={84}
            fill="none"
            stroke={accent}
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 84 * 0.184 * gauge} ${2 * Math.PI * 84}`}
            transform="rotate(-90 105 105)"
          />
        </svg>
        <div style={{ marginTop: -140, fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#FFFFFF' }}>18.4%</div>
        <div style={{ marginTop: 84, ...kickerStyle(alpha('#FFFFFF', 0.6), 15), textAlign: 'center' }}>usable capacity</div>
        <div style={{ marginTop: 6, fontFamily: FONT, fontWeight: 600, fontSize: 18, color: alpha('#FFFFFF', 0.55), textAlign: 'center' }}>the rest collides</div>
      </div>

      {/* retries after a collision */}
      <div style={{ position: 'absolute', left: 1110, top: 596, display: 'flex', gap: 12, opacity: again }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ padding: '6px 12px', borderRadius: 4, backgroundColor: alpha(P.stamp, 0.9), fontFamily: FONT, fontWeight: 800, fontSize: 17, letterSpacing: 2, color: '#FFFFFF' }}>↻ again</div>
        ))}
      </div>
    </OverlayFrame>
  );
}

// ─── Everyday uses: verité + one graphic each ──────────────────────────────

export function Calls() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const a = cue(shot, 'twenty times', fps, { fallback: 0.2 });
  const b = cue(shot, 'adds you to the pile', fps, { fallback: 0.5 });
  const c = cue(shot, 'same queue', fps, { fallback: 0.82 });
  const reflow = between(frame, b, b + 34);
  const X0 = 370;
  const X1 = 1450;

  return (
    <OverlayFrame topic="logic-backoff" kicker="The hotline" title="Twenty calls in ten minutes" scrim={0.94} foot="call · wait · call again later">
      <div style={{ position: 'absolute', left: 110, top: 640, width: 1700, height: 340 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 18, display: 'flex', justifyContent: 'space-between', ...kickerStyle(alpha('#FFFFFF', 0.55), 16) }}>
          <span>0 min</span><span>5 min</span><span>10 min</span>
        </div>
        <div style={{ position: 'absolute', left: X0, right: 1920 - X1, top: 78, height: 3, backgroundColor: 'rgba(255,255,255,0.18)' }} />

        {/* the calls */}
        {Array.from({ length: 20 }).map((_, i) => {
          const burst = X0 + 20 + rnd(i + 1) * 210;
          const spaced = X0 + 30 + (i % 3) * 470 + rnd(i + 5) * 90;
          const x = burst + (spaced - burst) * reflow;
          const o = i < 3 ? 1 : 0.55 + 0.45 * (1 - reflow);
          return <div key={i} style={{ position: 'absolute', left: x, top: 58, width: 5, height: 44, borderRadius: 3, backgroundColor: accent, opacity: o }} />;
        })}

        {/* the pile */}
        <div style={{ position: 'absolute', right: 10, top: 40, width: 200 }}>
          <div style={{ ...kickerStyle(alpha('#FFFFFF', 0.55), 15) }}>added to the pile</div>
          <div style={{ marginTop: 8, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: P.stamp, fontVariantNumeric: 'tabular-nums' }}>
            +{Math.round(20 - 17 * reflow)}
          </div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 19, color: alpha('#FFFFFF', 0.55) }}>{reflow > 0.5 ? 'fewer calls, same wait' : 'calls in ten minutes'}</div>
        </div>

        <div style={{ position: 'absolute', left: X0, top: 210, fontFamily: FONT, fontWeight: 700, fontSize: 27, color: alpha('#FFFFFF', 0.9), opacity: rise(frame, c, 16) }}>
          The queue is the same queue.
        </div>
        <div style={{ position: 'absolute', left: X0, top: 154, fontFamily: FONT, fontWeight: 600, fontSize: 21, color: alpha('#FFFFFF', 0.5), opacity: rise(frame, a, 12) }}>
          twenty calls in ten minutes does not get you through faster
        </div>
      </div>
    </OverlayFrame>
  );
}

export function Apply() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const a = cue(shot, 'after a week', fps, { fallback: 0.25 });
  const b = cue(shot, 'after two weeks', fps, { fallback: 0.45 });
  const c = cue(shot, 'same curve', fps, { fallback: 0.72 });
  const marks = [
    { label: 'apply', when: 'day 0', at: 8 },
    { label: 'follow up', when: 'day 7', at: a },
    { label: 'one more', when: 'day 21', at: b },
    { label: 'stop', when: 'day 35', at: b + 22 },
  ];
  const line = between(frame, 8, b + 22);

  return (
    <OverlayFrame topic="logic-backoff" kicker="The application" scrim={0.86} foot="one follow-up, then one more, then stop">
      <div style={{ position: 'absolute', right: 110, top: 210, width: 610, height: 760, backgroundColor: 'rgba(8,11,17,0.78)', border: `1.5px solid ${alpha('#FFFFFF', 0.12)}`, borderRadius: 10 }}>
        <div style={{ position: 'absolute', left: 44, top: 36, ...kickerStyle(alpha('#FFFFFF', 0.55), 15) }}>the follow-up rhythm</div>
        <div style={{ position: 'absolute', left: 108, top: 100, bottom: 96, width: 2, backgroundColor: 'rgba(255,255,255,0.14)' }} />
        <div style={{ position: 'absolute', left: 108, top: 100, width: 2, height: 540 * line, backgroundColor: accent }} />
        {marks.map((m, i) => {
          const o = rise(frame, m.at, 12);
          return (
            <div key={m.label} style={{ position: 'absolute', left: 88, top: 100 + i * 166, width: 470, opacity: o }}>
              <div style={{ position: 'absolute', left: 10, top: 4, width: 20, height: 20, borderRadius: 10, backgroundColor: i === 3 ? P.stamp : accent, border: `3px solid #0B0E14` }} />
              <div style={{ position: 'absolute', left: 58, top: -6, fontFamily: FONT, fontWeight: 800, fontSize: 34, color: i === 3 ? '#E8A091' : '#FFFFFF' }}>{m.label}</div>
              <div style={{ position: 'absolute', left: 58, top: 38, ...kickerStyle(alpha('#FFFFFF', 0.5), 16) }}>{m.when}</div>
            </div>
          );
        })}
        <div style={{ position: 'absolute', left: 44, bottom: 42, display: 'flex', alignItems: 'center', gap: 14, opacity: rise(frame, c, 16) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 22, color: accent }}>1 · 2 · 4 · 8</div>
          <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 18, color: alpha('#FFFFFF', 0.55) }}>the same curve the internet uses</div>
        </div>
      </div>
    </OverlayFrame>
  );
}

export function Convo() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const a = cue(shot, 'after a real gap', fps, { fallback: 0.5 });
  const b = cue(shot, 'something new', fps, { fallback: 0.76 });

  const bubble = (text: string, y: number, o: number, dim = false) => (
    <div
      style={{
        position: 'absolute',
        left: 110,
        top: y,
        maxWidth: 620,
        padding: '18px 26px',
        borderRadius: 18,
        borderBottomLeftRadius: 4,
        backgroundColor: dim ? 'rgba(241,235,220,0.72)' : P.paper,
        opacity: o,
        transform: `translateY(${(1 - o) * 12}px)`,
      }}
    >
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 31, color: P.ink }}>{text}</div>
    </div>
  );

  return (
    <OverlayFrame topic="logic-backoff" kicker="The difficult conversation" scrim={0.9} foot="once more, with something new to say">
      {bubble('Again tomorrow?', 596, rise(frame, 10, 12), true)}
      {bubble('And the day after?', 700, rise(frame, 26, 12), true)}
      <div style={{ position: 'absolute', left: 700, top: 726, display: 'flex', alignItems: 'center', gap: 10, opacity: rise(frame, 34, 12) }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 18, letterSpacing: 2, textTransform: 'uppercase', color: '#E8A091' }}>rarely helps</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 26, color: '#E8A091' }}>↻</div>
      </div>

      {/* the real gap */}
      <div style={{ position: 'absolute', left: 110, top: 800, width: 520 * between(frame, a, a + 20), height: 2, backgroundColor: accent }} />
      <div style={{ position: 'absolute', left: 110, top: 812, ...kickerStyle(alpha('#FFFFFF', 0.6), 15), opacity: rise(frame, a, 12) }}>a real gap</div>

      {bubble('One more — and something new to say.', 856, rise(frame, b, 14))}
      <div style={{ position: 'absolute', left: 762, top: 866, padding: '7px 14px', borderRadius: 4, backgroundColor: accent, fontFamily: FONT, fontWeight: 900, fontSize: 16, letterSpacing: 2, textTransform: 'uppercase', color: '#06211F', opacity: rise(frame, b, 12) }}>
        new information
      </div>
    </OverlayFrame>
  );
}

export function Followup() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const a = cue(shot, 'go quiet for a week', fps, { fallback: 0.3 });
  const b = cue(shot, 'follow up next week', fps, { fallback: 0.68 });
  const c = cue(shot, 'part of the message', fps, { fallback: 0.9 });

  return (
    <OverlayFrame topic="logic-backoff" kicker="The human version" scrim={0.9} foot="the other side cannot see your backoff">
      {/* the silence */}
      <div style={{ position: 'absolute', right: 110, top: 236, width: 660, opacity: rise(frame, a, 14) }}>
        <div style={{ ...kickerStyle(alpha('#FFFFFF', 0.5), 15) }}>what silence looks like</div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.18)' }} />
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 6, color: 'rgba(255,255,255,0.45)' }}>· · ·</div>
          <div style={{ flex: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.18)' }} />
        </div>
        <div style={{ marginTop: 8, fontFamily: FONT, fontWeight: 600, fontSize: 19, color: 'rgba(255,255,255,0.5)' }}>seven quiet days read as lost interest</div>
      </div>

      {/* the message */}
      <div style={{ position: 'absolute', right: 110, top: 430, width: 720, padding: '24px 30px', borderRadius: 20, borderBottomRightRadius: 4, backgroundColor: P.paper, opacity: rise(frame, b, 14), transform: `translateY(${(1 - rise(frame, b, 14)) * 14}px)` }}>
        <div style={{ ...kickerStyle(P.muted, 14) }}>you</div>
        <div style={{ marginTop: 6, fontFamily: FONT, fontWeight: 700, fontSize: 34, color: P.ink }}>I’ll follow up next week.</div>
      </div>

      {/* the date that makes it a plan */}
      <div style={{ position: 'absolute', right: 110, top: 626, display: 'flex', gap: 18, alignItems: 'center', opacity: rise(frame, b + 16, 14) }}>
        <div style={{ padding: '12px 20px', borderRadius: 8, border: `2px solid ${b > 0 ? accent : accent}`, color: accent, fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 2 }}>
          CALENDAR · next Tuesday
        </div>
        <div style={{ width: 240, height: 2, backgroundColor: accent }} />
      </div>

      <div style={{ position: 'absolute', right: 110, top: 720, width: 720, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: '#FFFFFF', opacity: rise(frame, c, 16) }}>
        The waiting is part of the message.
      </div>
      <div style={{ position: 'absolute', right: 110, top: 766, width: 720, fontFamily: FONT, fontWeight: 500, fontSize: 21, color: 'rgba(255,255,255,0.58)', opacity: rise(frame, c + 8, 16) }}>
        not a silence
      </div>
    </OverlayFrame>
  );
}

export function Next() {
  const frame = useCurrentFrame();
  const accent = useAccent();
  return (
    <OverlayFrame topic="logic-backoff" kicker="Next time" scrim={0.9}>
      <div style={{ position: 'absolute', left: 110, top: 300, width: 1180, fontFamily: SERIF, fontWeight: 600, fontSize: 82, lineHeight: 1.14, color: '#FFFFFF', textShadow: '0 4px 40px rgba(0,0,0,0.55)', opacity: rise(frame, 8, 18) }}>
        Why a crowd of smart people can all be wrong together.
      </div>
      <div style={{ position: 'absolute', left: 114, top: 670, display: 'flex', alignItems: 'center', gap: 16, opacity: rise(frame, 40, 18) }}>
        <div style={{ width: 48, height: 4, backgroundColor: accent }} />
        <div style={{ ...kickerStyle('#FFFFFF', 22) }}>Logic to Live By</div>
      </div>
    </OverlayFrame>
  );
}
