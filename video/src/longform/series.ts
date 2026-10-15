/**
 * The channel's series videos (Logic to Live By, Hidden Deutschland): a script
 * with `series: <key>` in its front matter gets that series' name and accent
 * colour instead of the citizenship lessons' gold. The lessons are unchanged.
 */
import { createContext, useContext } from 'react';

import SERIES from '../../longform/series.json';
import { GOLD } from '../lib/brand';

export type SeriesKey = keyof typeof SERIES;
export type Series = (typeof SERIES)[SeriesKey];

export const SeriesContext = createContext<string | null>(null);

export function useSeries(): Series | null {
  const key = useContext(SeriesContext);
  return key && key in SERIES ? SERIES[key as SeriesKey] : null;
}

/** The accent colour: the series' own, or the lessons' gold. */
export function useAccent(): string {
  return useSeries()?.accent ?? GOLD;
}
