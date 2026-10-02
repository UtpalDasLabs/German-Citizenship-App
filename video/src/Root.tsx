import React from 'react';
import { Composition } from 'remotion';

import './lib/fonts';
import { FPS, HEIGHT, WIDTH } from './lib/brand';
import { load } from './lib/data';
import { timeline } from './lib/timeline';
import { LongForm, type LongFormProps } from './longform/LongForm';
import { QuestionShort, type QuestionShortProps } from './QuestionShort';

/**
 * One composition for every question: pick the question with `id`. Its length
 * comes from the script, so a question with a "does NOT fit" warning, or with
 * narration, simply runs longer.
 */
const EMPTY_PLAN: LongFormProps['plan'] = {
  topic: '',
  title: '',
  questions: [],
  fps: FPS,
  total: FPS,
  shots: [],
  lively: false,
  music: false,
};

export function Root() {
  return (
    <>
      <Composition
        id="QuestionShort"
        component={QuestionShort}
        width={WIDTH}
        height={HEIGHT}
        fps={FPS}
        durationInFrames={1}
        defaultProps={{ id: 147, showSafeArea: false } satisfies QuestionShortProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: timeline(load(props.id).script, FPS, props.beatSeconds).total,
        })}
      />
      {/*
      A long-form lesson, 16:9. Its timed plan comes from
      scripts/render-longform.mjs, which reads the script and the voice.
    */}
      <Composition
        id="LongForm"
        component={LongForm}
        width={1920}
        height={1080}
        fps={FPS}
        durationInFrames={FPS}
        defaultProps={{ plan: EMPTY_PLAN } satisfies LongFormProps}
        calculateMetadata={({ props }) => ({
          durationInFrames: Math.max(1, props.plan.total),
        })}
      />
    </>
  );
}
