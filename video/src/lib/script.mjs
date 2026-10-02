/**
 * The script for one short: an ordered list of beats, each saying what the
 * viewer sees and what the narrator says.
 *
 * This is the single source of truth for both halves of a video. The Remotion
 * template reads the beat list to lay out its timeline; the narration builder
 * reads the same list to produce the voice script. Change the order here and
 * picture and sound move together.
 *
 * Plain JavaScript with no imports, so it runs unchanged in the Remotion bundle
 * and in the Node scripts that build narration. Callers pass the data in.
 *
 * Narration is English throughout, as the explaining voice. Every span of
 * German is tagged `de` so a text-to-speech voice can switch to native German
 * pronunciation for exactly those words and no others - which is the whole
 * reason the script is structured rather than a plain string.
 */

const LETTERS = ['a', 'b', 'c', 'd'];

/** Seconds per beat when there is no narration to time it by. */
export const SILENT_SECONDS = {
  hook: 2.2,
  question: 5.0,
  questionEn: 3.5,
  trap: 3.0,
  option: 2.6,
  optionsPicture: 4.0,
  countdown: 3.0,
  reveal: 3.0,
  why: 5.5,
  keywords: 5.0,
  end: 3.0,
};

/** Negations that turn a question into "pick the one that does NOT fit". */
export const NEGATION = /\b(kein|keine|keinen|keinem|keiner|nicht)\b/i;

const en = (text) => ({ lang: 'en', text });
const de = (text) => ({ lang: 'de', text });

/**
 * Splits an English line with [[German]] spans into tagged segments.
 *
 * Hand-written lines quote German freely ("In German that is [[Recht
 * sprechen]]"). Left untagged, an English voice reads those words with an
 * English accent - the exact failure this whole set-up exists to avoid.
 */
export function parseMarked(line) {
  const out = [];
  const re = /\[\[(.+?)\]\]/g;
  let last = 0;
  for (const m of line.matchAll(re)) {
    if (m.index > last) out.push(en(line.slice(last, m.index)));
    out.push(de(m[1]));
    last = m.index + m[0].length;
  }
  if (last < line.length) out.push(en(line.slice(last)));
  return out;
}

/**
 * German as it should be spoken. The catalogue writes gendered pairs with a
 * slash - "Richterin/eines Richters" - which a voice reads as "slash".
 */
export function speakableGerman(text) {
  return text.replace(/\s*\/\s*/g, ' oder ').replace(/\s+/g, ' ').trim();
}

/** Official catalogue reference. Mirrors catalogueRef in the app. */
export function catalogueRef(q) {
  if (q.kind === 'general') return { label: `#${q.id}`, spoken: `${q.id}` };
  const nth = ((q.id - 301) % 10) + 1;
  return { label: `${q.state} #${nth}`, spoken: `${nth} for ${q.state}` };
}

/**
 * Orders key terms by where they occur and joins neighbours into phrases, so
 * the answer "Recht sprechen" is read as a phrase rather than as two words
 * from a list - and never backwards.
 */
export function asPhrases(terms, text) {
  const lower = text.toLowerCase();
  const spans = terms
    .map((t) => ({ start: lower.indexOf(t.toLowerCase()), len: t.length }))
    .filter((x) => x.start >= 0)
    .sort((a, b) => a.start - b.start)
    .map((x) => ({ start: x.start, end: x.start + x.len }));

  const merged = [];
  for (const span of spans) {
    const prev = merged[merged.length - 1];
    // Only whitespace between them: one phrase in the source, one phrase here.
    if (prev && /^\s+$/.test(text.slice(prev.end, span.start))) prev.end = span.end;
    else merged.push({ ...span });
  }
  return merged.map((m) => text.slice(m.start, m.end));
}

function firstSentence(text) {
  if (!text) return null;
  const m = text.match(/^.*?[.!?](\s|$)/);
  return (m ? m[0] : text).trim();
}

/**
 * @param q        one question from questions.json
 * @param terms    its entry from keyTerms.json
 * @param whyLine  hand-written one-line explanation, if there is one
 */
export function buildScript(q, terms, whyLine) {
  const picture = q.imageMode === 'options';
  const answerIndex = LETTERS.indexOf(q.answer);
  const answerDe = q.de.options[q.answer];
  const answerEn = q.en.options?.[q.answer] ?? null;
  const ref = catalogueRef(q);
  const trap = Boolean(terms?.trap);
  const why = whyLine ?? firstSentence(q.context);

  const beats = [];
  const beat = (name, say, extra = {}) =>
    beats.push({ name, seconds: SILENT_SECONDS[extra.timing ?? name], say, ...extra });

  beat('hook', [en(`Question ${ref.spoken}, from the `), de('Einbürgerungstest'), en('.')]);

  beat('question', [de(speakableGerman(q.de.text))]);

  if (q.en.text) beat('questionEn', [en(`That means: ${q.en.text}`)]);

  // Said before the options, while it can still change the answer.
  if (trap) {
    const word = q.de.text.match(NEGATION)?.[0] ?? 'nicht';
    beat('trap', [
      en('Careful. '),
      de(word),
      en(' means "not". You are looking for the one that does not fit.'),
    ]);
  }

  if (picture) {
    beat('optionsPicture', [en('Here are the four options: A, B, C and D.')], { timing: 'optionsPicture' });
  } else {
    LETTERS.forEach((letter, i) => {
      const say = [en(`${letter.toUpperCase()}: `), de(speakableGerman(q.de.options[letter]))];
      const meaning = q.en.options?.[letter];
      if (meaning) say.push(en(`, ${meaning}.`));
      beat(`option${letter.toUpperCase()}`, say, { timing: 'option', optionIndex: i });
    });
  }

  beat('countdown', [en('Which one is right?')]);

  beat(
    'reveal',
    picture
      ? [en(`The answer is ${q.answer.toUpperCase()}.`)]
      : [
          en(`The answer is ${q.answer.toUpperCase()}: `),
          de(speakableGerman(answerDe)),
          ...(answerEn ? [en(`, ${answerEn}.`)] : [en('.')]),
        ],
    { answerIndex },
  );

  // Hand-written lines mark their German with [[...]]; the app's fallback
  // explanations carry no marks, so any German in them would be read with an
  // English accent. `marked` lets the narration builder count those.
  if (why) beat('why', parseMarked(why), { marked: Boolean(whyLine) });

  const ask = asPhrases(terms?.ask ?? [], q.de.text);
  const ans = asPhrases(terms?.answer ?? [], answerDe);
  const words = [...ask, ...ans];
  if (words.length) {
    beat('keywords', [en('Words to remember: '), de(words.join(', ')), en('.')], { ask, answer: ans });
  }

  // "LID" is spelled out: read as a word it comes out as "lid".
  beat('end', [en('Practise all four hundred and sixty questions free, in the L.I.D. test app. The link is in the description.')]);

  return { ref, trap, picture, answerIndex, beats };
}
