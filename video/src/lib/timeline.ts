import type { Beat, Script } from './script.mjs';

export type TimedBeat = Beat & { from: number; frames: number };

export type Timeline = {
  beats: TimedBeat[];
  total: number;
  /** First frame of a beat, or Infinity if the question has no such beat. */
  start: (name: string) => number;
};

/**
 * Lays the script's beats end to end.
 *
 * Silent renders use each beat's default length. Once narration exists its
 * measured durations come in through `seconds`, and the picture stretches to
 * fit the voice rather than the voice being cut to fit the picture.
 */
export function timeline(script: Script, fps: number, seconds?: Record<string, number>): Timeline {
  let at = 0;
  const beats = script.beats.map((b) => {
    const frames = Math.round((seconds?.[b.name] ?? b.seconds) * fps);
    const timed = { ...b, from: at, frames };
    at += frames;
    return timed;
  });
  return {
    beats,
    total: at,
    start: (name) => beats.find((b) => b.name === name)?.from ?? Infinity,
  };
}
