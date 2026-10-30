/**
 * A vertical short (1080×1920) cut from a series video: the hook pinned at
 * the top for the whole short, the footage filling the frame, diagrams
 * letterboxed in the middle, word-by-word captions, and the voice and music
 * of the long video. Built by scripts/render-longform.mjs --short from a
 * script that scripts/series-shorts.mjs writes.
 */
import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

import { alpha, FONT, SAFE } from '../lib/brand';
import { OVERLAP } from './LongForm';
import { Soundtrack } from './lively';
import { INK, Photo, rise } from './look';
import { charFrame, screenLines, ShotContext, type Para, type Plan, type Shot } from './plan';
import { ClipContext, SeriesContext, useAccent, useSeries } from './series';
import { shotFor } from './shots';

export type SeriesShortProps = { plan: Plan };

const MEDIA = new Set(['photo', 'line', 'place']);

/** The footage of a photo/line/place scene, full height; cuts on its cues. */
function ShortMedia({ shot, topic }: { shot: Shot; topic: string }) {
  const { fps } = useVideoConfig();
  const lines = screenLines(shot, fps).filter((l) => l.fields.length > 1 || shot.key !== 'line');
  if (lines.length === 0) {
    // A text-only key line: large, centred.
    const text = shot.screen[0]?.split(' @ ')[0] ?? '';
    return <BigLine text={text} />;
  }
  return (
    <AbsoluteFill>
      {lines.map(({ fields: [id], at }, i) => {
        const start = i === 0 ? 0 : at;
        const end = i + 1 < lines.length ? lines[i + 1].at + 8 : shot.frames + OVERLAP;
        return (
          <Sequence key={i} from={start} durationInFrames={Math.max(1, end - start)}>
            <Photo src={`images/${topic}/${id}.jpg`} color from={{ x: 0.5, y: 0.5, scale: 1.0 }} to={{ x: 0.5, y: 0.5, scale: 1.06 }} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}

function BigLine({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const accent = useAccent();
  return (
    <AbsoluteFill style={{ backgroundColor: '#131720', alignItems: 'center', justifyContent: 'center', padding: 90 }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 96, lineHeight: 1.1, color: '#fff', textAlign: 'center', opacity: rise(frame, 4, 14) }}>{text}</div>
      <div style={{ marginTop: 36, width: 160, height: 6, borderRadius: 3, backgroundColor: accent }} />
    </AbsoluteFill>
  );
}

/** A 16:9 scene (a diagram, a card) shown whole across the middle of the frame. */
function Letterboxed({ shot, plan }: { shot: Shot; plan: Plan }) {
  // A little larger than the frame is wide: the scenes keep their content
  // away from the left and right edges, so only margin is cropped.
  const scale = 0.66;
  return (
    <AbsoluteFill style={{ backgroundColor: '#131720' }}>
      <div
        style={{
          position: 'absolute',
          left: (1080 - 1920 * scale) / 2,
          top: (1920 - 1080 * scale) / 2,
          width: 1920,
          height: 1080,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {shotFor(shot.key, plan.topic, plan.title, plan.questions)}
      </div>
    </AbsoluteFill>
  );
}

function ShortShot({ shot, plan, first }: { shot: Shot; plan: Plan; first: boolean }) {
  const frame = useCurrentFrame();
  const opacity = first ? 1 : interpolate(frame, [0, OVERLAP], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <ShotContext.Provider value={shot}>
      <AbsoluteFill style={{ opacity }}>
        {MEDIA.has(shot.key ?? '') ? <ShortMedia shot={shot} topic={plan.topic} /> : <Letterboxed shot={shot} plan={plan} />}
      </AbsoluteFill>
    </ShotContext.Provider>
  );
}

/** The hook, pinned at the top for the whole short. */
function Hook({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const accent = useAccent();
  const series = useSeries();
  const o = rise(frame, 0, 6);
  return (
    <>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(8,10,16,0.88) 0%, rgba(8,10,16,0.55) 30%, rgba(8,10,16,0) 42%)' }} />
      <div style={{ position: 'absolute', top: SAFE.top, left: SAFE.side, right: SAFE.side, opacity: o }}>
        {series ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <div style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: accent }} />
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 30, letterSpacing: 5, color: accent, textTransform: 'uppercase' }}>{series.name}</div>
          </div>
        ) : null}
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: text.length > 60 ? 64 : 76, lineHeight: 1.1, color: '#fff', textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}>
          {text}
        </div>
      </div>
    </>
  );
}

type Word = { text: string; from: number; to: number };

/** Every spoken word with its frame in the short (direction tags left out). */
function words(plan: Plan): Word[] {
  const out: Word[] = [];
  for (const s of plan.shots)
    for (const p of s.paras as Para[]) {
      const re = /\[[^\]]*\]|[^\s[\]]+/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(p.tts))) {
        if (m[0].startsWith('[')) continue;
        const from = s.from + charFrame(p, m.index, plan.fps);
        const to = s.from + charFrame(p, m.index + m[0].length - 1, plan.fps) + 2;
        out.push({ text: m[0], from, to });
      }
    }
  return out;
}

/** Captions three or four words at a time, the spoken word lit in the series colour. */
function Captions({ plan }: { plan: Plan }) {
  const frame = useCurrentFrame();
  const accent = useAccent();
  const all = React.useMemo(() => words(plan), [plan]);
  const chunks: Word[][] = [];
  let cur: Word[] = [];
  for (const w of all) {
    cur.push(w);
    if (cur.length >= 4 || /[.,?!:;]$/.test(w.text)) {
      chunks.push(cur);
      cur = [];
    }
  }
  if (cur.length) chunks.push(cur);
  const i = chunks.findIndex((c, k) => frame >= c[0].from && frame < (chunks[k + 1]?.[0].from ?? c[c.length - 1].to + 10));
  if (i < 0) return null;
  return (
    <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, bottom: SAFE.bottom + 120, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 66,
          lineHeight: 1.15,
          textAlign: 'center',
          color: '#fff',
          textShadow: '0 0 4px #000, 0 3px 18px rgba(0,0,0,0.85)',
          padding: '10px 22px',
          borderRadius: 18,
          backgroundColor: alpha('#0B0E14', 0.35),
        }}
      >
        {chunks[i].map((w, k) => (
          <span key={k} style={{ color: frame >= w.from && frame < w.to + 6 ? accent : '#fff' }}>
            {w.text}{' '}
          </span>
        ))}
      </div>
    </div>
  );
}

/** "Full video on the channel" over the closing line. */
function EndNote({ plan }: { plan: Plan }) {
  const frame = useCurrentFrame();
  const accent = useAccent();
  const series = useSeries();
  const last = plan.shots[plan.shots.length - 1];
  const at = last.from + (last.paras.at(-1)?.from ?? 0);
  const o = rise(frame, at, 10);
  if (o <= 0) return null;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: o }}>
      <div style={{ padding: '28px 44px', borderRadius: 24, backgroundColor: alpha(INK, 0.82), border: `3px solid ${accent}`, textAlign: 'center' }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 58, color: '#fff' }}>{plan.short?.parent ? 'Full video on the channel' : 'More stories on the channel'}</div>
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 34, color: '#C6CCD8', marginTop: 10, maxWidth: 820 }}>{plan.short?.parent || series?.name}</div>
      </div>
    </AbsoluteFill>
  );
}

export function SeriesShort({ plan }: SeriesShortProps) {
  return (
    <SeriesContext.Provider value={plan.series ?? null}>
      <ClipContext.Provider value={plan.clips ?? {}}>
        <AbsoluteFill style={{ backgroundColor: INK }}>
          {plan.shots.map((shot, i) => (
            <Sequence key={i} from={shot.from} durationInFrames={shot.frames + (i < plan.shots.length - 1 ? OVERLAP : 0)}>
              <ShortShot shot={shot} plan={plan} first={i === 0} />
            </Sequence>
          ))}
          <Hook text={plan.short?.hook ?? plan.title} />
          <Captions plan={plan} />
          <EndNote plan={plan} />
          {plan.lively ? <Soundtrack plan={plan} /> : null}
          {plan.shots.flatMap((shot, i) =>
            shot.paras
              .filter((p) => p.src)
              .map((p, j) => (
                <Sequence key={`${i}-${j}`} from={shot.from + p.from} durationInFrames={p.frames} name="voice">
                  <Audio src={staticFile(p.src!)} />
                </Sequence>
              )),
          )}
        </AbsoluteFill>
      </ClipContext.Provider>
    </SeriesContext.Provider>
  );
}
