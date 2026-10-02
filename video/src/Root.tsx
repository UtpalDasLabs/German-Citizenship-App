import React from 'react';
import { Composition } from 'remotion';

import './lib/fonts';
import { FPS, HEIGHT, WIDTH } from './lib/brand';
import { load } from './lib/data';
import { timeline } from './lib/timeline';
import { QuestionShort, type QuestionShortProps } from './QuestionShort';

/**
 * One composition for every question: pick the question with `id`. Its length
 * comes from the script, so a question with a "does NOT fit" warning, or with
 * narration, simply runs longer.
 */
export function Root() {
  return (
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
  );
}
