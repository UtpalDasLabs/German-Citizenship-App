/**
 * Corrections to the upstream catalogue.
 *
 * The vendored dataset is community-maintained and its explanation text is
 * AI-generated, so it can be wrong. Anything corrected here is listed with the
 * reasoning, and the build fails if a correction no longer matches the source -
 * that way a fixed upstream cannot silently re-break, and an upstream rewrite
 * cannot silently bypass a fix.
 */
export const CORRECTIONS = {
  14: {
    // "Meinungsfreiheit in Deutschland heißt, dass ich …" Two options arrive
    // with their words glued together ("imInternetäußern",
    // "öffentlichtragen"), so the app and the videos showed them that way.
    // Text only; the answer (b) is right.
    options: {
      b: ['meine Meinung imInternetäußern kann.', 'meine Meinung im Internet äußern kann.'],
      c: [
        'Nazi-, Hamas- oder Islamischer Staat-Symbole öffentlichtragen darf.',
        'Nazi-, Hamas- oder Islamischer Staat-Symbole öffentlich tragen darf.',
      ],
    },
  },
  71: {
    // "Wo hält sich die deutsche Bundeskanzlerin/der deutsche Bundeskanzler am
    // häufigsten auf?" The chancellor works in the Bundeskanzleramt in Berlin,
    // next to the Bundestag (option d). Upstream marks Schloss Meseberg (b),
    // the government's guest house, and its explanation argues for it. The
    // app's own real-life note already said Berlin, so learners saw both.
    expectedAnswer: 'b',
    answer: 'd',
    context:
      'The Federal Chancellor works in the Federal Chancellery (Bundeskanzleramt) in Berlin, close to the Bundestag. Schloss Meseberg is only the government guest house, used now and then for state guests and retreats.',
  },
  5: {
    // "Wahlen in Deutschland sind frei. Was bedeutet das?" The official answer
    // is that voters may be neither influenced nor forced to vote a certain way
    // and suffer no disadvantage from their vote (option c). Upstream marks
    // "Nur Personen, die noch nie im Gefängnis waren, dürfen wählen" (b), which
    // is false: being in prison does not take away the right to vote, and it
    // has nothing to do with elections being free. The upstream explanation
    // already describes free elections correctly, so it is kept.
    expectedAnswer: 'b',
    answer: 'c',
  },
  184: {
    // Israel was founded in May 1948 on the basis of UN General Assembly
    // Resolution 181 (Nov 1947). The Federal Republic of Germany did not exist
    // until May 1949, so it cannot have proposed anything. The upstream answer
    // "ein Vorschlag der Bundesregierung" is chronologically impossible, and
    // its generated explanation argues for that wrong answer.
    expectedAnswer: 'c',
    answer: 'a',
    context:
      'The State of Israel was founded in May 1948 on the basis of United Nations General Assembly Resolution 181, the 1947 partition plan for Palestine. The Federal Republic of Germany did not yet exist.',
  },
};

/** Applies a correction, verifying the source still says what we expect. */
export function applyCorrection(q) {
  const fix = CORRECTIONS[q.id];
  if (!fix) return q;
  if (fix.expectedAnswer && q.correctAnswer !== fix.expectedAnswer) {
    throw new Error(
      `Correction for question ${q.id} is stale: upstream answer is now "${q.correctAnswer}", ` +
        `expected "${fix.expectedAnswer}". Re-check the source and update scripts/corrections.mjs.`,
    );
  }
  const out = { ...q, correctAnswer: fix.answer ?? q.correctAnswer };
  if (fix.options) {
    out.options = { ...q.options };
    for (const [letter, [expected, value]] of Object.entries(fix.options)) {
      if (q.options?.[letter] !== expected) {
        throw new Error(
          `Correction for question ${q.id} option ${letter} is stale: upstream text is now "${q.options?.[letter]}". ` +
            'Re-check the source and update scripts/corrections.mjs.',
        );
      }
      out.options[letter] = value;
    }
  }
  if (fix.context) {
    out.translations = {
      ...q.translations,
      en: { ...(q.translations?.en ?? {}), context: fix.context },
    };
  }
  return out;
}
