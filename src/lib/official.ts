/**
 * Official BAMF resources.
 *
 * Every URL here was checked against BAMF's own search results rather than
 * written from memory - these are the links users will act on. The per-state
 * Pruefstellen pages follow one pattern, confirmed for BW, BY, BE and NW.
 */

export const OFFICIAL = {
  /** Overview of naturalisation, in English. */
  overviewEn:
    'https://www.bamf.de/EN/Themen/Integration/ZugewanderteTeilnehmende/Einbuergerung/einbuergerung-node.html',
  /** Same page in German. */
  overviewDe:
    'https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/Einbuergerung/einbuergerung-node.html',
  /** BAMF's own interactive practice test. */
  practice: 'https://oet.bamf.de/',
  /** Online test centre landing page. */
  testCentre:
    'https://www.bamf.de/DE/Themen/Integration/ZugewanderteTeilnehmende/OnlineTestcenter/online-testcenter-node.html',
} as const;

/** Official list of test centres for one Bundesland. `code` is e.g. "BY". */
export function pruefstellenUrl(code: string): string {
  return `https://www.bamf.de/SharedDocs/Anlagen/DE/Integration/Einbuergerung/Pruefstellen-${code}.html?nn=284310`;
}

/** Facts about the real exam, from BAMF. */
export const EXAM_FACTS = {
  questions: 33,
  minutes: 60,
  pass: 17,
  costEur: 25,
  catalogue: 310,
} as const;
