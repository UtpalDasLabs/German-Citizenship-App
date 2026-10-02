import React from 'react';
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from 'remotion';

import { C } from '../lib/brand';
import { Soundtrack, usePunchScale } from './lively';
import { ChapterLabel, GermanCaption, Storyboard } from './look';
import { ShotContext, type Plan, type Shot } from './plan';
import { shownGerman, SHOWS_GERMAN, shotFor } from './shots';

/** Scenes with a photo caption at the bottom: the German sits above it. */
const PHOTO_SCENES = new Set(['ruins', 'bonn', 'photo']);

export type LongFormProps = { plan: Plan };

/** Shots overlap by this much so each one dissolves into the next. */
export const OVERLAP = 12;

function ShotView({ shot, plan, first }: { shot: Shot; plan: Plan; first: boolean }) {
  const frame = useCurrentFrame();
  const opacity = first ? 1 : interpolate(frame, [0, OVERLAP], [0, 1], { extrapolateRight: 'clamp' });
  const scale = usePunchScale(shot);
  return (
    <ShotContext.Provider value={shot}>
      <AbsoluteFill style={{ opacity }}>
        <AbsoluteFill style={{ transform: plan.lively ? `scale(${scale})` : undefined }}>
          {shotFor(shot.key, plan.topic, plan.title, plan.questions) ?? <Storyboard />}
        </AbsoluteFill>
        {shot.key && SHOWS_GERMAN.has(shot.key) ? null : (
          <GermanCaption
            exclude={shownGerman(shot.questions, shot.screen, shot.key)}
            bottom={PHOTO_SCENES.has(shot.key ?? '') ? 190 : 70}
          />
        )}
        {shot.opensChapter ? <ChapterLabel number={shot.chapter} title={shot.chapterTitle} /> : null}
      </AbsoluteFill>
    </ShotContext.Provider>
  );
}

export function LongForm({ plan }: LongFormProps) {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {plan.shots.map((shot, i) => (
        <Sequence
          key={i}
          from={shot.from}
          durationInFrames={shot.frames + (i < plan.shots.length - 1 ? OVERLAP : 0)}
          name={shot.key ?? 'storyboard'}
        >
          <ShotView shot={shot} plan={plan} first={i === 0} />
        </Sequence>
      ))}
      {plan.lively ? <Soundtrack plan={plan} /> : null}
      {plan.shots.flatMap((shot, i) =>
        // A silent cut (--silent) has timings but no audio.
        shot.paras
          .filter((p) => p.src)
          .map((p, j) => (
            <Sequence key={`${i}-${j}`} from={shot.from + p.from} durationInFrames={p.frames} name="voice">
              <Audio src={staticFile(p.src!)} />
            </Sequence>
          )),
      )}
    </AbsoluteFill>
  );
}
