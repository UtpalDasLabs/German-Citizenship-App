/**
 * Derives the German words worth locking onto for each question.
 *
 * Written for people who studied the catalogue in translation and then
 * realised the exam is German-only. The exam draws its 33 questions verbatim
 * from this catalogue, so passing it is a recognition task, not a
 * comprehension one: you need the handful of words that tell you *which*
 * question this is and *which* option answers it.
 *
 * Two things come out per question:
 *
 *   trap   - the stem asks for the odd one out ("Was ist KEIN Bundesland?").
 *            These are the questions people fail while knowing the material.
 *            Flagged first and on its own, because it changes what you are
 *            looking for.
 *
 *            Curated, not matched. A regex on kein/nicht also fires on every
 *            narrative stem that happens to contain a negation - "weil ihre
 *            Muttersprache nicht Deutsch ist", "ob man zu einer Kirche gehoert
 *            oder nicht" - and telling someone those are inverted questions
 *            walks them into the wrong answer. That is worse than no tip at
 *            all, so the regex only proposes candidates and every one of them
 *            was read. An unclassified candidate is a build failure.
 *   terms  - the rarest content words in the stem and in the correct answer.
 *            Rarity is the point: a word appearing in one question out of 460
 *            identifies it, while "Deutschland" identifies nothing.
 *
 * Output is written next to the question data rather than into it, so this can
 * be regenerated without touching the image pipeline.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');

/**
 * German function words. Deliberately generous: anything that survives here
 * and is still rare across 460 questions is worth pointing at.
 */
const STOP = new Set(`
aber alle allen aller alles als also am an andere anderen auch auf aus bei beim bin bis bist
da dabei dann darf das dass dem den denen der deren des dessen die dies diese diesem diesen
dieser dieses doch dort du durch ein eine einem einen einer eines er es etwas euch für gegen
gibt hab habe haben hat hatte hier ihm ihn ihnen ihr ihre ihrem ihren ihrer im in ist ja je
jede jedem jeden jeder jedes kann können könnte man mehr mein meine mit muss müssen nach neben
noch nun nur ob oder ohne schon sein seine seinem seinen seiner seines sich sie sind so soll
sollen sondern um und uns unser unsere unserem unseren unter viel viele vom von vor war waren
was wegen weil welche welchem welchen welcher welches wem wen wenn wer werden wie wieder wird
wo wurde wurden zu zum zur über
`.trim().split(/\s+/));

/** Proposes questions that might be inverted; the verdict is TRAPS below. */
const MAYBE_TRAP = /\b(kein|keine|keinen|keinem|keiner|nicht|falsch|niemals)\b/i;

/**
 * Stems that really do ask for the odd one out, by question id.
 * Read one by one against the German text.
 */
const TRAPS = new Set([
  8, 25, 30, 32, 34, 44, 47, 48, 51, 54, 63, 65, 100, 104, 159, 168, 245, 272, 285,
  // "Welche Ministerin/welchen Minister hat <Land> nicht?" - one per Bundesland.
  310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 450, 460,
]);

/**
 * Candidates whose negation belongs to the story, not to the question. Listed
 * explicitly so a new one cannot slip through as an unreviewed trap.
 */
const NOT_TRAPS = new Set([
  267, // "...weil ihnen der Freund nicht gefaellt. Was koennen die Eltern tun?"
  268, // "...weil ihre Muttersprache nicht Deutsch ist. Was ist richtig?"
  274, // "Was haben Sie nicht beachtet?" - pick the right you broke, no inversion.
  277, // "Sie bekommt die Stelle nur deshalb nicht, weil sie ..."
  278, // "Er bekommt die Stelle nur deshalb nicht, weil er ..."
  281, // "...werden deshalb nicht hineingelassen. Welches Recht wird verletzt?"
  289, // "Er bekommt die Stelle nur deshalb nicht, weil ..."
  290, // "...doch er funktioniert nicht. Was koennen Sie machen?"
  291, // "...ob man zu einer Kirche gehoert oder nicht? Weil ..."
]);

const tokens = (s) =>
  (s.toLowerCase().match(/[a-zäöüß][a-zäöüß-]{2,}/g) || []).filter((w) => !STOP.has(w));

const questions = JSON.parse(readFileSync(join(ROOT, 'src/data/questions.json'), 'utf8'));

// How many questions each word appears in. Rare word = identifying word.
const docFreq = new Map();
for (const q of questions) {
  const seen = new Set([...tokens(q.de.text), ...Object.values(q.de.options).flatMap(tokens)]);
  for (const w of seen) docFreq.set(w, (docFreq.get(w) ?? 0) + 1);
}

/** The `limit` rarest words in `text`, original casing preserved, in order. */
function rarest(text, limit) {
  const originals = new Map();
  for (const raw of text.match(/[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß-]{2,}/g) ?? []) {
    const key = raw.toLowerCase();
    if (!STOP.has(key) && !originals.has(key)) originals.set(key, raw);
  }
  return [...originals.keys()]
    .filter((w) => docFreq.has(w))
    .sort((a, b) => docFreq.get(a) - docFreq.get(b) || b.length - a.length)
    .slice(0, limit)
    .map((w) => originals.get(w).replace(/-$/, ''));
}

const out = {};
let traps = 0;
for (const q of questions) {
  const candidate = MAYBE_TRAP.test(q.de.text);
  if (candidate && !TRAPS.has(q.id) && !NOT_TRAPS.has(q.id)) {
    throw new Error(
      `Question ${q.id} reads as a possible odd-one-out and is not classified.\n` +
        `  ${q.de.text}\n` +
        '  Add it to TRAPS or NOT_TRAPS in scripts/key-terms.mjs after reading it.',
    );
  }
  const trap = candidate && TRAPS.has(q.id);
  if (trap) traps += 1;
  const ask = rarest(q.de.text, trap ? 2 : 3);
  // Picture questions answer with "Bild 1".."Bild 4", which names nothing.
  const answer = q.imageMode === 'options' ? [] : rarest(q.de.options[q.answer], 2);
  // A word that carries both sides tells you nothing about which option to pick.
  const unique = answer.filter((w) => !ask.some((a) => a.toLowerCase() === w.toLowerCase()));
  out[q.id] = { trap, ask, answer: unique };
}

writeFileSync(join(ROOT, 'src/data/keyTerms.json'), `${JSON.stringify(out, null, 0)}\n`);
console.log(`key terms for ${questions.length} questions (${traps} with a negation trap)`);
