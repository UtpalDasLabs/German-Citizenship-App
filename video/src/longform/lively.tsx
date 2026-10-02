/**
 * The lively cut: music, sound effects, punch words and camera punch-ins.
 * Everything is timed from the same plan as the pictures, so a ding lands on
 * the frame the answer turns green and a pop on the frame a word appears.
 */
import React, { useMemo } from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

import { alpha, C, FONT, GOLD } from '../lib/brand';
import { charFrame, findCue, screenLines, type Plan, type Shot } from './plan';
import { questionTiming } from './shots';

type Sound = 'whoosh' | 'pop' | 'ding' | 'tick' | 'thud';
type Event = { at: number; sound: Sound; volume: number };

/** Frames, within the shot, where a punch word starts. */
export function punchFrames(shot: Shot, fps: number): number[] {
  return shot.paras.flatMap((p) => p.punch.map((w) => charFrame(p, w.start, fps)));
}

/** Every sound effect a shot needs, in frames from the start of the shot. */
function shotEvents(shot: Shot, fps: number, first: boolean): Event[] {
  const events: Event[] = [];
  if (!first) events.push({ at: 0, sound: 'whoosh', volume: 0.32 });
  for (const at of punchFrames(shot, fps)) events.push({ at, sound: 'pop', volume: 0.45 });

  const lines = shot.key && ['term', 'list', 'stat', 'fact', 'quote'].includes(shot.key) ? screenLines(shot, fps) : [];
  if (shot.key === 'term' && lines[0]) {
    events.push({ at: findCue(shot, lines[0].fields[0], fps) ?? 8, sound: 'pop', volume: 0.5 });
  } else {
    for (const l of lines) events.push({ at: Math.max(0, l.at), sound: 'pop', volume: 0.45 });
  }
  if (shot.key === 'words') {
    const words = screenLines(shot, fps)[0]?.fields.join(', ').split(/,\s*/) ?? [];
    words.forEach((w, i) => events.push({ at: (findCue(shot, w, fps) ?? 8 + i * 10) - 3, sound: 'pop', volume: 0.35 }));
  }
  if (shot.key === 'question') {
    const { answerAt, ruledOut } = questionTiming(shot, fps);
    for (const at of ruledOut) events.push({ at, sound: 'tick', volume: 0.5 });
    events.push({ at: answerAt, sound: 'ding', volume: 0.42 });
  }
  if (shot.key === 'title') events.push({ at: 6, sound: 'thud', volume: 0.6 });
  const stamp =
    shot.key === 'book'
      ? findCue(shot, "isn't called", fps)
      : shot.key === 'map1949'
        ? findCue(shot, 'temporary arrangement', fps)
        : null;
  if (stamp != null) events.push({ at: stamp, sound: 'thud', volume: 0.55 });

  // Two sounds a few frames apart read as one mushy sound: keep the first.
  events.sort((a, b) => a.at - b.at);
  return events.filter((e, i) => i === 0 || e.at - events[i - 1].at > 4 || e.sound === 'ding');
}

/**
 * Music under the whole lesson: quiet while the voice speaks, up a little in
 * the gaps, faded in and out. Plus every effect, placed on its frame.
 */
export function Soundtrack({ plan }: { plan: Plan }) {
  const { fps } = useVideoConfig();
  const level = useMemo(() => {
    // 1 where the voice is speaking, 0 in the gaps, eased over a few frames.
    const speaking = new Float32Array(plan.total);
    for (const s of plan.shots) {
      for (const p of s.paras) {
        const a = s.from + p.from;
        for (let f = Math.max(0, a - 4); f < Math.min(plan.total, a + p.frames + 6); f++) speaking[f] = 1;
      }
    }
    const smooth = new Float32Array(plan.total);
    let v = 0;
    for (let f = 0; f < plan.total; f++) {
      v += (speaking[f] - v) * 0.25;
      smooth[f] = v;
    }
    return smooth;
  }, [plan]);

  return (
    <>
      <Audio
        src={staticFile('sound/music.wav')}
        loop
        volume={(f) => {
          const duck = 0.2 - 0.13 * (level[f] ?? 0);
          const fade = Math.min(
            interpolate(f, [0, 45], [0, 1], { extrapolateRight: 'clamp' }),
            interpolate(f, [plan.total - 90, plan.total], [1, 0], { extrapolateLeft: 'clamp' }),
          );
          return duck * fade;
        }}
      />
      {plan.shots.flatMap((shot, i) =>
        shotEvents(shot, fps, i === 0).map((e, j) => (
          <Sequence key={`${i}-${j}`} from={shot.from + e.at} durationInFrames={Math.round(fps * 1.2)} name={e.sound}>
            <Audio src={staticFile(`sound/${e.sound}.wav`)} volume={e.volume} />
          </Sequence>
        )),
      )}
    </>
  );
}

/** A quick jolt of zoom on each punch word and answer reveal, decaying in a third of a second. */
export function usePunchScale(shot: Shot): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hits = useMemo(() => {
    const h = punchFrames(shot, fps);
    if (shot.key === 'question') h.push(questionTiming(shot, fps).answerAt);
    return h;
  }, [shot, fps]);
  let bump = 0;
  for (const at of hits) {
    const t = frame - at;
    if (t < 0) continue;
    bump = Math.max(bump, t < 3 ? t / 3 : Math.exp(-(t - 3) / 7));
  }
  // A slow push on every shot, so no frame is ever completely still.
  const drift = 0.025 * Math.min(1, frame / Math.max(1, shot.frames));
  return 1 + drift + 0.035 * bump;
}

/** The current punch word, big, at the top of the frame. */
export function Punches({ shot }: { shot: Shot }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let current: { text: string; start: number; end: number } | null = null;
  for (const p of shot.paras) {
    for (const w of p.punch) {
      const start = charFrame(p, w.start, fps) - 2;
      const end = Math.max(charFrame(p, w.end - 1, fps) + Math.round(0.8 * fps), start + Math.round(1.2 * fps));
      if (frame >= start && frame <= end) current = { text: w.text, start, end };
    }
  }
  if (!current) return null;
  const t = frame - current.start;
  const scale = t < 5 ? interpolate(t, [0, 5], [0.6, 1.08]) : t < 9 ? interpolate(t, [5, 9], [1.08, 1]) : 1;
  const opacity = Math.min(
    interpolate(t, [0, 3], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(frame, [current.end - 6, current.end], [1, 0], { extrapolateLeft: 'clamp' }),
  );
  return (
    <AbsoluteFill style={{ alignItems: 'center', pointerEvents: 'none' }}>
      <div
        style={{
          marginTop: 64,
          padding: '14px 40px 18px',
          borderRadius: 22,
          backgroundColor: alpha('#0B0E14', 0.78),
          border: `3px solid ${GOLD}`,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: current.text.length > 22 ? 64 : 84,
          letterSpacing: -1,
          color: C.text,
          transform: `scale(${scale}) rotate(-2deg)`,
          opacity,
          boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
        }}
      >
        {current.text}
      </div>
    </AbsoluteFill>
  );
}
