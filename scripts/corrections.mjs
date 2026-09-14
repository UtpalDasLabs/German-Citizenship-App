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
  const out = { ...q, correctAnswer: fix.answer };
  if (fix.context) {
    out.translations = {
      ...q.translations,
      en: { ...(q.translations?.en ?? {}), context: fix.context },
    };
  }
  return out;
}
