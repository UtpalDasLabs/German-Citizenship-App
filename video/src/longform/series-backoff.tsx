/**
 * Diagrams for Logic to Live By #3 (exponential backoff).
 *
 * The rule diagrams live on the series' dark stage (`Double`, `Cap`, `Jitter`,
 * `Herd`, `Loop`, `Deadend`, `Gate`, `Attempts`); the 1986 archive scenes and
 * the verité overlays are in `backoff-archive.tsx`. One scene key, `backoff`;
 * the word after the colon in the script picks the variant:
 * `SCENE (backoff): double`.
 */
import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

import { alpha, C, FONT } from '../lib/brand';
import { rise, SERIF } from './look';
import { cue, useShot } from './plan';
import { useAccent } from './series';
import { between, InkSheet, kickerStyle, P, rnd, Stamp, Tag } from './backoff-kit';
import {
  Aloha,
  Apply,
  Calls,
  Convo,
  Failure,
  Followup,
  MapScene,
  Next,
  Pressure,
  RetryCard,
  RuleIntro,
  Storm,
  Throughput,
} from './backoff-archive';

/** The doubling staircase as a timetable: each wait starts where the last ended. */
function Double() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const first = cue(shot, 'one second', fps, { fallback: 0.14 });
  const last = cue(shot, 'thirty-two', fps, { fallback: 0.86 });
  const gaps = [1, 2, 4, 8, 16, 32];
  const starts = gaps.map((_, i) => gaps.slice(0, i).reduce((a, b) => a + b, 0));
  const total = gaps.reduce((a, b) => a + b, 0);
  const X0 = 330;
  const W = 1230;
  const scale = W / (total + 4);
  const per = Math.max(10, Math.round((last - first) / gaps.length));

  return (
    <InkSheet kicker="Part one · double" title="Wait twice as long, every time" lead="The gap is the rule." foot="RFC 6298 · doubling the retransmission timer">
      {gaps.map((g, i) => {
        const o = rise(frame, first + i * per, 12);
        const grow = between(frame, first + i * per, first + i * per + 14);
        const x = X0 + starts[i] * scale;
        const w = g * scale * grow;
        return (
          <React.Fragment key={g}>
            <div style={{ position: 'absolute', left: 120, top: 310 + i * 82, width: 180, fontFamily: FONT, fontWeight: 700, fontSize: 23, color: '#8A93A6', opacity: o }}>
              try {i + 1}
            </div>
            <div
              style={{
                position: 'absolute',
                left: x,
                top: 302 + i * 82,
                width: Math.max(3, w),
                height: 40,
                borderRadius: 5,
                backgroundColor: i === 5 ? alpha(accent, 0.95) : alpha(accent, 0.22 + i * 0.08),
                border: `1.5px solid ${alpha(accent, 0.9)}`,
              }}
            />
            <div style={{ position: 'absolute', left: x + Math.max(3, w) + 14, top: 310 + i * 82, fontFamily: FONT, fontWeight: 800, fontSize: 26, color: i === 5 ? accent : '#DDE3EE', opacity: o }}>
              {g} s
            </div>
            {i > 0 ? (
              <div style={{ position: 'absolute', left: x - 8, top: 318 + i * 82, fontFamily: FONT, fontWeight: 900, fontSize: 20, color: '#E06A5A', opacity: o }}>×</div>
            ) : null}
          </React.Fragment>
        );
      })}

      {/* elapsed-time axis */}
      <div style={{ position: 'absolute', left: X0, top: 826, width: W, height: 2, backgroundColor: '#394356' }} />
      {[0, 10, 20, 30, 40, 50, 60].map((s) => (
        <React.Fragment key={s}>
          <div style={{ position: 'absolute', left: X0 + s * scale - 1, top: 826, width: 2, height: 12, backgroundColor: '#394356' }} />
          <div style={{ position: 'absolute', left: X0 + s * scale - 30, top: 848, width: 60, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 21, color: '#6F7B92' }}>{s}</div>
        </React.Fragment>
      ))}
      <div style={{ position: 'absolute', left: X0, top: 886, ...kickerStyle('#6F7B92', 16) }}>seconds since the first failure</div>

      <div style={{ position: 'absolute', right: 110, top: 300, width: 250, textAlign: 'right', opacity: rise(frame, last, 16) }}>
        <div style={{ ...kickerStyle('#6F7B92', 15) }}>six failures later</div>
        <div style={{ marginTop: 6, fontFamily: FONT, fontWeight: 900, fontSize: 76, color: accent, fontVariantNumeric: 'tabular-nums' }}>63 s</div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 21, color: '#8A93A6' }}>waited in total</div>
      </div>
    </InkSheet>
  );
}

/** The cap: the same curve, flattened at a minute, and what that costs a live service. */
function Cap() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const at = cue(shot, 'around a minute', fps, { fallback: 0.18 });
  const recovered = cue(shot, 'recovers in ten seconds', fps, { fallback: 0.64 });
  const hour = cue(shot, 'wait an hour', fps, { fallback: 0.86 });
  const capVals = [1, 2, 4, 8, 16, 32, 60, 60, 60];
  const rawVals = [1, 2, 4, 8, 16, 32, 64, 128, 240];
  const X0 = 300;
  const X1 = 1280;
  const Y0 = 300;
  const Y1 = 660;
  const x = (i: number) => X0 + (i / 8) * (X1 - X0);
  const y = (v: number) => Y1 - (Math.min(v, 240) / 240) * (Y1 - Y0);
  const draw = between(frame, 10, at + 30);
  const panel = between(frame, recovered, recovered + 22);

  return (
    <InkSheet kicker="Part two · cap" title="Stop doubling at a minute" lead="A bad hour should not become a bad day." foot="RFC 6298 · a ceiling of at least 60 s">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        {[0, 60, 120, 180, 240].map((v) => (
          <g key={v}>
            <line x1={X0} x2={X1} y1={y(v)} y2={y(v)} stroke="#FFFFFF" strokeOpacity={v === 0 ? 0.28 : 0.1} strokeWidth={v === 0 ? 2 : 1} />
            <text x={X0 - 16} y={y(v) + 6} textAnchor="end" fontFamily={FONT} fontSize={18} fontWeight={600} fill="#6F7B92">{v}s</text>
          </g>
        ))}
        <line x1={X0} x2={X1} y1={y(60)} y2={y(60)} stroke={accent} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="8 8" opacity={draw} />
        <polyline points={rawVals.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke="#E06A5A" strokeWidth={4} strokeDasharray="9 8" pathLength={1} strokeDashoffset={1 - draw} />
        <polyline points={capVals.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={accent} strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
        {capVals.map((v, i) => (
          <circle key={i} cx={x(i)} cy={y(v)} r={6} fill={i >= 6 ? accent : '#0B0E14'} stroke={accent} strokeWidth={3} opacity={draw} />
        ))}
      </svg>

      <Tag text="with a cap" at={at} x={820} y={y(60) - 48} color={accent} />
      <Tag text="no cap: 4 minutes, 8 minutes" at={at + 12} x={300} y={300} color="#E06A5A" align="left" />
      <div style={{ position: 'absolute', left: X1 + 26, top: y(60) - 14, fontFamily: FONT, fontWeight: 900, fontSize: 28, color: accent, opacity: draw }}>60 s</div>

      {/* what the cap costs a service that is already back */}
      <div style={{ position: 'absolute', left: 110, top: 716, width: 1700, opacity: panel }}>
        <div style={{ ...kickerStyle('#6F7B92', 15) }}>one client, one cap</div>
        <div style={{ position: 'absolute', left: 0, top: 42, width: 1240, height: 64, borderRadius: 6, backgroundColor: '#1A2130', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, width: 1240 * (10 / 60), height: '100%', backgroundColor: alpha(P.good, 0.55) }} />
          <div style={{ position: 'absolute', left: 1240 * (10 / 60), top: 0, width: 1240 * (50 / 60), height: '100%', backgroundColor: alpha('#FFFFFF', 0.05) }} />
          <div style={{ position: 'absolute', left: 1240 * (10 / 60) - 1, top: 0, width: 2, height: '100%', backgroundColor: P.good }} />
        </div>
        <div style={{ position: 'absolute', left: 0, top: 116, fontFamily: FONT, fontWeight: 800, fontSize: 19, letterSpacing: 2, textTransform: 'uppercase', color: P.good }}>service is back · 10 s</div>
        <div style={{ position: 'absolute', left: 430, top: 116, fontFamily: FONT, fontWeight: 800, fontSize: 19, letterSpacing: 2, textTransform: 'uppercase', color: '#8A93A6' }}>the client is still asleep</div>
        <div style={{ position: 'absolute', left: 1240 - 8, top: 28, fontFamily: FONT, fontWeight: 900, fontSize: 26, color: accent }}>60</div>
        <div style={{ position: 'absolute', left: 0, top: 168, fontFamily: FONT, fontWeight: 600, fontSize: 25, color: '#9AA4B8' }}>
          It recovered in ten seconds. Everything that decided to wait an hour is still waiting.
        </div>
      </div>

      <div style={{ position: 'absolute', right: 110, top: 520, width: 470, textAlign: 'right', opacity: rise(frame, hour, 14) }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 34, color: '#E06A5A' }}>a bad day</div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 22, color: '#8A93A6', marginTop: 6 }}>from one bad hour</div>
      </div>
    </InkSheet>
  );
}

/** Jitter: one window, first everyone at the end, then a random moment each. */
function Jitter() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const at = cue(shot, 'randomness', fps, { fallback: 0.1 });
  const moment = cue(shot, 'random moment', fps, { fallback: 0.44 });
  const spreadOut = cue(shot, 'spread out', fps, { fallback: 0.62 });
  const collide = cue(shot, 'collide again', fps, { fallback: 0.86 });
  const spread = between(frame, moment, spreadOut) * (1 - between(frame, collide, collide + 18));
  const N = 18;
  const L = 330;
  const W = 1260;
  const Y = 420;

  // The load the server sees: one bin if in step, flat if spread.
  const flat = [0.86, 1, 0.9, 0.97, 0.88, 0.95, 0.92, 0.99];
  const bin = (i: number) => (i === 7 ? 1 : 0) * (1 - spread) + flat[i] * spread;

  return (
    <InkSheet kicker="Part three · jitter" title="Break the pattern" lead="Same window, different moments." foot="Each device picks a random point inside its own window">
      <div style={{ position: 'absolute', left: L, top: 300, width: W, display: 'flex', justifyContent: 'space-between', ...kickerStyle('#6F7B92', 15) }}>
        <span>now</span>
        <span>one 8-second window</span>
        <span>8 s</span>
      </div>
      <div style={{ position: 'absolute', left: L, top: Y - 100, width: W, height: 180, borderRadius: 14, backgroundColor: '#1A2130', border: '2px solid #2E3748' }} />
      {[0, 2, 4, 6, 8].map((s) => (
        <div key={s} style={{ position: 'absolute', left: L + (s / 8) * W - 20, top: Y + 96, width: 40, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 20, color: '#6F7B92' }}>{s}s</div>
      ))}

      {Array.from({ length: N }).map((_, i) => {
        const x0 = L + W - 26 - rnd(i + 40) * 24;
        const x1 = L + 40 + rnd(i) * (W - 80);
        const x = x0 + (x1 - x0) * spread;
        const o = rise(frame, 10 + i * 2, 8);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x - 12,
              top: Y - 12 + (rnd(i + 90) - 0.5) * 46,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: spread < 0.4 ? '#E06A5A' : accent,
              boxShadow: `0 0 16px ${alpha(spread < 0.4 ? '#E06A5A' : accent, 0.45)}`,
              opacity: o,
            }}
          />
        );
      })}

      <div style={{ position: 'absolute', left: L, top: 550, width: W, display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 800, fontSize: 25 }}>
        <span style={{ color: '#E06A5A', opacity: 1 - spread }}>In step: they collide again</span>
        <span style={{ color: accent, opacity: spread }}>Jittered: they fit</span>
      </div>

      {/* what the server sees */}
      <div style={{ position: 'absolute', left: L, top: 660, width: W }}>
        <div style={{ ...kickerStyle('#6F7B92', 15), marginBottom: 10 }}>load on the server, second by second</div>
        {Array.from({ length: 8 }).map((_, i) => {
          const h = bin(i) * 120;
          return <div key={i} style={{ position: 'absolute', left: i * (W / 8) + 4, top: 168 - h, width: W / 8 - 16, height: h, borderRadius: 4, backgroundColor: spread < 0.4 ? alpha('#E06A5A', 0.7) : alpha(accent, 0.55) }} />;
        })}
        <div style={{ position: 'absolute', left: 0, top: 168, width: W, height: 2, backgroundColor: '#394356' }} />
        <div style={{ position: 'absolute', left: 0, top: 182, ...kickerStyle('#6F7B92', 14) }}>0 s</div>
        <div style={{ position: 'absolute', right: 0, top: 182, ...kickerStyle('#6F7B92', 14) }}>8 s</div>
      </div>
      <div style={{ position: 'absolute', right: 110, top: 640, width: 260, textAlign: 'right', opacity: rise(frame, at, 12) }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 22, color: '#8A93A6' }}>1,000 devices</div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 18, color: '#6F7B92', marginTop: 4 }}>same 8 s wait</div>
      </div>
    </InkSheet>
  );
}

/** The 7 a.m. spike, and the same arrivals spread at random. */
function Herd() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const at = cue(shot, 'Bürgeramt', fps, { fallback: 0.34 });
  const slow = cue(shot, 'server slows down', fps, { fallback: 0.62 });
  const grow = cue(shot, 'spike grows', fps, { fallback: 0.8 });
  const burst = 150 + 60 * between(frame, grow, grow + 20);

  const panel = (x: number, title: string, values: number[], colour: string, live: number) => (
    <div style={{ position: 'absolute', left: x, top: 292, width: 800, height: 470, borderRadius: 12, backgroundColor: '#10151F', border: `1.5px solid ${alpha(colour, 0.35 + 0.4 * live)}` }}>
      <div style={{ position: 'absolute', left: 30, top: 24, fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 1, color: colour }}>{title}</div>
      {values.map((v, i) => {
        const h = (v / 210) * 300;
        return <div key={i} style={{ position: 'absolute', left: 42 + i * 92, top: 360 - h, width: 62, height: h, borderRadius: 4, backgroundColor: alpha(colour, 0.7) }} />;
      })}
      <div style={{ position: 'absolute', left: 30, top: 360, width: 740, height: 2, backgroundColor: '#394356' }} />
      <div style={{ position: 'absolute', left: 30, top: 303, width: 740, height: 2, borderTop: `2px dashed ${alpha('#FFFFFF', 0.45)}` }} />
      <div style={{ position: 'absolute', right: 30, top: 276, ...kickerStyle('#6F7B92', 13) }}>capacity</div>
      <div style={{ position: 'absolute', left: 30, top: 386, width: 740, display: 'flex', justifyContent: 'space-between', ...kickerStyle('#6F7B92', 13) }}>
        <span>7:00</span><span>8:10</span>
      </div>
    </div>
  );

  return (
    <InkSheet kicker="The same second" title="The crowd is the spike" lead="Waiting a little, at random, turns noise back into a conversation." foot="A retry that ignores everyone else is a vote for the next crash">
      {panel(100, 'Spread at random', [26, 31, 28, 33, 27, 30, 29, 32], accent, 0.2)}
      {panel(1020, 'Everyone at 7:00', [burst, 4, 3, 4, 3, 4, 3, 3], '#E06A5A', between(frame, at, at + 12))}

      <div style={{ position: 'absolute', left: 100, top: 790, width: 800, fontFamily: FONT, fontWeight: 700, fontSize: 24, color: '#8A93A6' }}>
        load stays under capacity
      </div>
      <div style={{ position: 'absolute', left: 1020, top: 772, width: 800, opacity: rise(frame, slow, 14) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 800, fontSize: 19, letterSpacing: 2, textTransform: 'uppercase', color: '#E06A5A' }}>
          <span>server load</span>
          <span>{Math.round(120 + 100 * between(frame, slow, grow))}%</span>
        </div>
        <div style={{ marginTop: 8, height: 14, borderRadius: 7, backgroundColor: '#1C2433', overflow: 'hidden' }}>
          <div style={{ width: `${Math.min(100, 100 + 80 * between(frame, slow, grow))}%`, height: '100%', backgroundColor: '#E06A5A' }} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: 100, top: 836, fontFamily: FONT, fontWeight: 600, fontSize: 22, color: '#6F7B92', opacity: rise(frame, grow, 14) }}>
        Same number of people. Different moments.
      </div>
    </InkSheet>
  );
}

/** The feedback loop: a retry adds load, load adds timeouts, timeouts add retries. */
function Loop() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const at = cue(shot, 'not unlucky', fps, { fallback: 0.12 });
  const vote = cue(shot, 'vote', fps, { fallback: 0.78 });
  const hot = between(frame, vote - 12, vote + 8);
  const cx = 960;
  const cy = 600;
  const r = 250;
  const nodes = [
    { deg: -90, label: 'a retry', note: '+1 packet' },
    { deg: 0, label: 'more load', note: 'the server fills' },
    { deg: 90, label: 'slower service', note: 'timeouts rise' },
    { deg: 180, label: 'more timeouts', note: 'so we retry' },
  ];
  const pos = (deg: number) => ({ x: cx + r * Math.cos((deg * Math.PI) / 180), y: cy + r * Math.sin((deg * Math.PI) / 180) });

  return (
    <InkSheet kicker="The feedback" title="A vote for the next crash" lead="Each retry adds load; load adds timeouts; timeouts add retries." foot="The crowd is not unlucky · the crowd is the problem">
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={hot ? '#E06A5A' : '#394356'} strokeWidth={3} strokeDasharray="12 12" strokeDashoffset={-frame * (1.2 + hot * 3)} opacity={0.9} />
        {[45, 135, 225, 315].map((deg) => {
          const p = pos(deg);
          const rot = deg + 90;
          return <polygon key={deg} points="-9,-7 11,0 -9,7" fill={hot ? '#E06A5A' : accent} transform={`translate(${p.x},${p.y}) rotate(${rot})`} opacity={0.85} />;
        })}
        {(() => {
          const a = ((frame * (1.6 + hot * 4)) % 360) * (Math.PI / 180);
          return <circle cx={cx + r * Math.cos(a)} cy={cy + r * Math.sin(a)} r={10} fill={hot ? '#E06A5A' : accent} />;
        })()}
      </svg>

      {nodes.map((n, i) => {
        const p = pos(n.deg);
        const o = rise(frame, at + i * 8, 12);
        return (
          <div key={n.label} style={{ position: 'absolute', left: p.x - 130, top: p.y - 50, width: 260, height: 100, borderRadius: 12, backgroundColor: '#10151F', border: `1.5px solid ${alpha(hot ? '#E06A5A' : accent, 0.5)}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: o }}>
            <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 27, color: '#FFFFFF' }}>{n.label}</div>
            <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 17, color: '#8A93A6', marginTop: 3 }}>{n.note}</div>
          </div>
        );
      })}

      <div style={{ position: 'absolute', left: 110, top: 250, width: 1050, fontFamily: SERIF, fontWeight: 600, fontSize: 40, lineHeight: 1.2, color: '#FFFFFF', opacity: rise(frame, at + 20, 14) }}>
        the crowd is the problem
      </div>
      <div style={{ position: 'absolute', left: cx - 210, top: 936, width: 420, textAlign: 'left', fontFamily: FONT, fontWeight: 700, fontSize: 21, color: hot ? '#E06A5A' : '#8A93A6', opacity: rise(frame, vote, 14), letterSpacing: 2, textTransform: 'uppercase' }}>
        1 retry = +1 vote for the next crash
      </div>
    </InkSheet>
  );
}

/** Three doors that stay shut, however long the clock runs. */
function Deadend() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const n1 = cue(shot, 'number is disconnected', fps, { fallback: 0.14 });
  const n2 = cue(shot, 'job is filled', fps, { fallback: 0.36 });
  const n3 = cue(shot, 'moved on', fps, { fallback: 0.56 });
  const slow = cue(shot, 'slower no', fps, { fallback: 0.82 });
  const doors = [
    { x: 190, label: 'the number', note: 'disconnected', at: n1 },
    { x: 790, label: 'the job', note: 'filled', at: n2 },
    { x: 1390, label: 'the person', note: 'moved on', at: n3 },
  ];

  return (
    <InkSheet kicker="Where it breaks" title="A longer wait is just a slower no" lead="Waiting only helps if the thing might come back." foot="Backoff is a bet on recovery, not a cure for a closed door">
      {doors.map((d) => {
        const o = rise(frame, 10, 16);
        const dead = rise(frame, d.at, 14);
        return (
          <React.Fragment key={d.label}>
            <div style={{ position: 'absolute', left: d.x, top: 252, width: 340, textAlign: 'center', ...kickerStyle(dead > 0.5 ? '#E06A5A' : '#8A93A6', 19), opacity: o }}>{d.label}</div>
            <div style={{ position: 'absolute', left: d.x + 20, top: 290, width: 300, height: 420, border: `3px solid ${alpha('#FFFFFF', 0.28)}`, backgroundColor: '#10151F', opacity: o }}>
              <div style={{ position: 'absolute', left: 26, top: 26, right: 26, bottom: 26, border: `2px solid ${alpha('#FFFFFF', 0.22)}` }}>
                <div style={{ position: 'absolute', left: 26, top: 26, right: 26, height: 110, border: `1.5px solid ${alpha('#FFFFFF', 0.14)}` }} />
                <div style={{ position: 'absolute', left: 26, bottom: 26, right: 26, height: 96, border: `1.5px solid ${alpha('#FFFFFF', 0.14)}` }} />
              </div>
              <div style={{ position: 'absolute', right: 44, top: 214, width: 18, height: 18, borderRadius: 9, backgroundColor: dead > 0.5 ? '#E06A5A' : accent }} />
              <svg width={300} height={420} style={{ position: 'absolute', inset: 0 }}>
                <circle cx={264} cy={62} r={30} fill="none" stroke="#394356" strokeWidth={2.5} />
                <line x1={264} y1={62} x2={264 + 22 * Math.cos((frame * 0.06) % (Math.PI * 2))} y2={62 + 22 * Math.sin((frame * 0.06) % (Math.PI * 2))} stroke={dead > 0.5 ? '#E06A5A' : accent} strokeWidth={3} strokeLinecap="round" />
                <circle cx={264} cy={62} r={3} fill={dead > 0.5 ? '#E06A5A' : accent} />
              </svg>
            </div>
            <div style={{ position: 'absolute', left: d.x, top: 730, width: 340, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 26, color: dead > 0.5 ? '#E06A5A' : '#8A93A6', opacity: o }}>{d.note}</div>
            <div style={{ position: 'absolute', left: d.x + 238, top: 486, fontFamily: FONT, fontWeight: 900, fontSize: 64, color: '#E06A5A', opacity: dead }}>×</div>
          </React.Fragment>
        );
      })}
      <div style={{ opacity: rise(frame, slow, 12) }}>
        <Stamp text="A slower no" at={slow} x={760} y={856} size={38} rotate={-3} color="#E06A5A" border={4} />
      </div>
    </InkSheet>
  );
}

/** The question gate: yes retries, no stops. */
function Gate() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const ask = cue(shot, 'anything changed', fps, { fallback: 0.18 });
  const no = cue(shot, 'answer is no', fps, { fallback: 0.6 });
  const stuck = cue(shot, 'will not change', fps, { fallback: 0.8 });
  const branches = between(frame, ask + 6, ask + 34);
  const dark = between(frame, stuck, stuck + 18);

  return (
    <InkSheet kicker="Before the next try" title="One question" lead="Since the last try." foot="If nothing has changed, more waiting will not change it">
      <div style={{ position: 'absolute', left: 660, top: 286, width: 600, height: 132, borderRadius: 14, backgroundColor: '#10151F', border: `2px solid ${alpha(accent, 0.7)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SERIF, fontWeight: 600, fontSize: 46, color: '#FFFFFF', opacity: rise(frame, 10, 14) }}>
        has anything changed?
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <path d="M 960 418 L 960 492 L 600 492 L 600 640" fill="none" stroke={accent} strokeWidth={4} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - branches} opacity={0.9 * (1 - 0.65 * dark)} />
        <polygon points="592,630 600,648 608,630" fill={accent} opacity={branches * (1 - 0.65 * dark)} />
        <path d="M 960 418 L 960 492 L 1320 492 L 1320 640" fill="none" stroke="#E06A5A" strokeWidth={4} strokeDasharray="1" pathLength={1} strokeDashoffset={1 - branches} opacity={0.9} />
        <polygon points="1312,630 1320,648 1328,630" fill="#E06A5A" opacity={branches} />
      </svg>

      <div style={{ position: 'absolute', left: 370, top: 668, width: 460, height: 210, borderRadius: 14, backgroundColor: '#10151F', border: `2px solid ${alpha(accent, 0.45 + 0.5 * dark)}`, opacity: rise(frame, ask + 26, 14) * (1 - 0.55 * dark), padding: '30px 34px' }}>
        <div style={{ ...kickerStyle(accent, 16) }}>yes</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#FFFFFF', marginTop: 4 }}>Try again</div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 22, color: '#8A93A6', marginTop: 8 }}>something is different</div>
      </div>

      <div style={{ position: 'absolute', left: 1090, top: 668, width: 460, height: 210, borderRadius: 14, backgroundColor: '#10151F', border: `2px solid ${alpha('#E06A5A', 0.5 + 0.5 * between(frame, no, no + 14))}`, opacity: rise(frame, ask + 30, 14), padding: '30px 34px' }}>
        <div style={{ ...kickerStyle('#E06A5A', 16) }}>no</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 44, color: '#FFFFFF', marginTop: 4 }}>Stop</div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 22, color: '#8A93A6', marginTop: 8 }}>nothing has changed</div>
      </div>

      {/* the barrier, across the no path */}
      <div style={{ position: 'absolute', left: 1082, top: 632, width: 470, height: 13, borderRadius: 3, backgroundColor: '#E06A5A', transform: `rotate(${-16 + 16 * between(frame, no, no + 16)}deg)`, transformOrigin: 'left center', opacity: rise(frame, no, 8), boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }} />
      <div style={{ position: 'absolute', left: 1074, top: 620, width: 12, height: 42, backgroundColor: '#E06A5A', opacity: rise(frame, no, 8) }} />

      <div style={{ position: 'absolute', left: 370, top: 908, width: 1180, fontFamily: FONT, fontWeight: 600, fontSize: 23, color: '#8A93A6', opacity: rise(frame, no + 10, 14) }}>
        A longer wait cannot turn a closed answer into an open one.
      </div>
    </InkSheet>
  );
}

/** The stop rule as a calendar: day 0, 7, 21, then stop at 49. */
function Attempts() {
  const frame = useCurrentFrame();
  const shot = useShot();
  const { fps } = useVideoConfig();
  const accent = useAccent();
  const three = cue(shot, 'three tries', fps, { fallback: 0.18 });
  const stop = cue(shot, 'then stop', fps, { fallback: 0.42 });
  const cousin = cue(shot, '37 percent', fps, { fallback: 0.78 });
  const X0 = 200;
  const W = 1520;
  const day = (d: number) => X0 + (d / 56) * W;
  const marks = [
    { d: 0, label: 'try 1', note: 'day 0', at: three },
    { d: 7, label: 'try 2', note: 'day 7', at: three + 14 },
    { d: 21, label: 'try 3', note: 'day 21', at: three + 30 },
    { d: 49, label: 'stop', note: 'day 49', at: stop },
  ];

  return (
    <InkSheet kicker="The stop rule" title="Three tries, then stop" lead="Not because you gave up: because the answer is probably no." foot="A practical cadence, not a theorem">
      {/* the weeks */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ position: 'absolute', left: X0 + (i / 8) * W + 4, top: 380, width: W / 8 - 8, height: 150, borderRadius: 8, backgroundColor: i >= 7 ? alpha('#E06A5A', 0.08) : '#10151F', border: `1.5px solid ${i >= 7 ? alpha('#E06A5A', 0.35) : '#2A3345'}` }}>
          <div style={{ position: 'absolute', left: 14, top: 12, ...kickerStyle('#5F6A80', 13) }}>week {i + 1}</div>
        </div>
      ))}

      <div style={{ position: 'absolute', left: X0, top: 455, width: W, height: 3, backgroundColor: '#394356' }} />

      {marks.map((m, i) => {
        const o = rise(frame, m.at, 12);
        const dead = i === 3;
        return (
          <React.Fragment key={m.label}>
            <div style={{ position: 'absolute', left: day(m.d) - 14, top: 441, width: 28, height: 28, borderRadius: 14, backgroundColor: dead ? '#E06A5A' : accent, border: `4px solid #0B0E14`, opacity: o }} />
            <div style={{ position: 'absolute', left: day(m.d) - 100, top: 300, width: 200, textAlign: 'center', opacity: o }}>
              <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 30, color: dead ? '#E06A5A' : '#FFFFFF' }}>{m.label}</div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 19, letterSpacing: 2, color: '#8A93A6', marginTop: 4 }}>{m.note}</div>
            </div>
          </React.Fragment>
        );
      })}

      {/* the gaps */}
      {[
        { from: 0, to: 7, label: '1 week' },
        { from: 7, to: 21, label: '2 weeks' },
        { from: 21, to: 49, label: '4 weeks' },
      ].map((g, i) => {
        const o = rise(frame, three + 20 + i * 12, 12);
        return (
          <div key={g.label} style={{ opacity: o }}>
            <div style={{ position: 'absolute', left: day(g.from), top: 580, width: day(g.to) - day(g.from), height: 2, backgroundColor: alpha(accent, 0.5) }} />
            <div style={{ position: 'absolute', left: day(g.from), top: 570, width: 2, height: 22, backgroundColor: alpha(accent, 0.5) }} />
            <div style={{ position: 'absolute', left: day(g.to), top: 570, width: 2, height: 22, backgroundColor: alpha(accent, 0.5) }} />
            <div style={{ position: 'absolute', left: day(g.from), top: 600, width: day(g.to) - day(g.from), textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 21, color: '#8A93A6' }}>{g.label}</div>
          </div>
        );
      })}

      <div style={{ position: 'absolute', left: day(49) + 22, top: 548, width: 270, fontFamily: FONT, fontWeight: 800, fontSize: 17, lineHeight: 1.35, color: '#E06A5A', opacity: rise(frame, stop, 12) }}>
        the answer is probably no
      </div>

      <div style={{ position: 'absolute', left: X0, top: 700, width: 1180, fontFamily: FONT, fontWeight: 600, fontSize: 25, color: '#8A93A6' }}>
        Growing gaps between three honest attempts — then let the silence do its work.
      </div>
      <div style={{ position: 'absolute', left: X0, top: 758, display: 'flex', alignItems: 'center', gap: 16, opacity: rise(frame, cousin, 16) }}>
        <div style={{ width: 44, height: 3, backgroundColor: accent }} />
        <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: accent }}>the 37 percent rule’s quieter cousin: know when to stop looking</div>
      </div>
    </InkSheet>
  );
}

// ─── Dispatch ──────────────────────────────────────────────────────────────

export function Backoff() {
  const shot = useShot();
  const variant = shot.scene.trim().toLowerCase().split(/[\s,]+/)[0];
  if (variant === 'pressure') return <Pressure />;
  if (variant === 'map') return <MapScene />;
  if (variant === 'throughput') return <Throughput />;
  if (variant === 'storm') return <Storm />;
  if (variant === 'ruleintro') return <RuleIntro />;
  if (variant === 'double') return <Double />;
  if (variant === 'cap') return <Cap />;
  if (variant === 'jitter') return <Jitter />;
  if (variant === 'herd') return <Herd />;
  if (variant === 'loop') return <Loop />;
  if (variant === 'failure') return <Failure />;
  if (variant === 'deadend') return <Deadend />;
  if (variant === 'gate') return <Gate />;
  if (variant === 'attempts') return <Attempts />;
  if (variant === 'recap') return <RetryCard />;
  return <Double />;
}

export function Overlay() {
  const shot = useShot();
  const variant = shot.scene.trim().toLowerCase().split(/[\s,]+/)[0];
  if (variant === 'aloha') return <Aloha />;
  if (variant === 'calls') return <Calls />;
  if (variant === 'apply') return <Apply />;
  if (variant === 'convo') return <Convo />;
  if (variant === 'followup') return <Followup />;
  if (variant === 'next') return <Next />;
  return <Calls />;
}
