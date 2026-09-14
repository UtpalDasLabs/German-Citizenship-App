/**
 * Everyday context for the question catalogue: what each answer actually means
 * for someone living in Germany, rather than how to score a mark.
 *
 * Two sources:
 *   - the 160 Bundesland questions follow ten fixed patterns, so those notes
 *     are generated from the pattern plus the state's own facts
 *   - the 300 general questions are written individually in general.mjs
 *
 * Facts are kept to the stable kind. Anything that changes often (fees,
 * office hours, current office-holders) is left out on purpose, because a
 * confidently wrong note is worse than no note.
 */
import { GENERAL_NOTES } from './general-notes.mjs';

/** Pattern index within each ten-question state block. */
const PATTERNS = [
  'wappen',
  'landkreis',
  'landtagJahre',
  'kommunalwahlAlter',
  'flagge',
  'informieren',
  'hauptstadt',
  'artDesLandes',
  'regierungschef',
  'minister',
];

const STATE_NOTE = {
  wappen: (s) =>
    `Every Bundesland has its own coat of arms, and you will see ${s}'s on official letters, number plates and government buildings. Recognising it is a quick way to tell which authority a document came from.`,
  landkreis: (s) =>
    `${s} is divided into Landkreise and independent cities. Your Landkreis runs things you will actually deal with: vehicle registration, the Jugendamt, waste collection and many school matters.`,
  landtagJahre: (s) =>
    `The Landtag is ${s}'s own parliament, and this is how often you get to re-elect it. It decides schools, police and culture for the state, so a Landtagswahl changes your daily life as much as a federal one.`,
  kommunalwahlAlter: (s) =>
    `Kommunalwahlen choose your town or city council. ${s} sets its own minimum age for these, and in several states it is lower than for federal elections. EU citizens may vote in local elections too, even without German citizenship.`,
  flagge: (s) =>
    `You will see the ${s} flag beside the federal one on public buildings. States fly both, which is federalism made visible: two levels of government, neither replacing the other.`,
  informieren: (s) =>
    `Each state funds a Landeszentrale für politische Bildung, which publishes free, party-neutral material about how politics works. It is a genuinely useful and free resource while you prepare for this test.`,
  hauptstadt: (s) =>
    `The Landeshauptstadt is where ${s}'s parliament and government sit. If you ever need a state-level authority rather than a local one, this is usually where it is based.`,
  artDesLandes: (s) =>
    `Germany's sixteen states are not all the same kind. Some are city-states, some call themselves Freistaat, and the rest are ordinary Flächenländer. The label is mostly historical, but it appears in official names.`,
  regierungschef: (s) =>
    `This is the title of the person who leads ${s}'s government, the state equivalent of the Bundeskanzler. City-states use a different title from the other states, which is exactly what this question tests.`,
  minister: (s) =>
    `States run ministries for what they are responsible for: schools, police, culture, environment. They do not run ministries for federal matters like defence or foreign affairs, which is the trick in this question.`,
};

const STATE_NOTE_DE = {
  wappen: (s) =>
    `Jedes Bundesland hat ein eigenes Wappen. Das von ${s} siehst du auf Behördenbriefen, Kennzeichen und Amtsgebäuden – ein schneller Hinweis darauf, von welcher Stelle ein Schreiben kommt.`,
  landkreis: (s) =>
    `${s} ist in Landkreise und kreisfreie Städte gegliedert. Der Landkreis macht Dinge, mit denen du wirklich zu tun hast: Kfz-Zulassung, Jugendamt, Müllabfuhr, vieles rund um Schule.`,
  landtagJahre: (s) =>
    `Der Landtag ist das Parlament von ${s}. So oft darfst du ihn neu wählen. Er entscheidet über Schule, Polizei und Kultur – eine Landtagswahl verändert deinen Alltag genauso wie eine Bundestagswahl.`,
  kommunalwahlAlter: (s) =>
    `Bei Kommunalwahlen wählst du den Gemeinde- oder Stadtrat. ${s} legt das Mindestalter selbst fest, in mehreren Ländern ist es niedriger als bei Bundestagswahlen. EU-Bürgerinnen und -Bürger dürfen hier mitwählen.`,
  flagge: (s) =>
    `Vor öffentlichen Gebäuden weht die Flagge von ${s} neben der Bundesflagge. Beide zusammen sind der sichtbare Föderalismus: zwei Ebenen, keine ersetzt die andere.`,
  informieren: (s) =>
    `Jedes Land hat eine Landeszentrale für politische Bildung. Sie gibt kostenloses, parteineutrales Material heraus – auch zur Vorbereitung auf diesen Test sehr nützlich.`,
  hauptstadt: (s) =>
    `In der Landeshauptstadt sitzen Parlament und Regierung von ${s}. Wenn du einmal eine Landesbehörde statt einer örtlichen brauchst, ist sie meist dort.`,
  artDesLandes: (s) =>
    `Die sechzehn Länder sind nicht alle gleich. Einige sind Stadtstaaten, einige nennen sich Freistaat, der Rest sind Flächenländer. Das ist vor allem Geschichte, steht aber in den amtlichen Namen.`,
  regierungschef: (s) =>
    `So heißt die Person an der Spitze der Regierung von ${s} – das Landes-Gegenstück zur Bundeskanzlerin. Stadtstaaten benutzen einen anderen Titel als die übrigen Länder.`,
  minister: (s) =>
    `Länder haben Ministerien für ihre eigenen Aufgaben: Schule, Polizei, Kultur, Umwelt. Für Bundesthemen wie Verteidigung oder Außenpolitik haben sie keine – das ist der Trick an dieser Frage.`,
};

/** Maps a question to the most relevant deep-dive explainer. */
const DIVE_RULES = [
  ['anmeldung', /anmeld|meldeamt|umzug|wohnung|einwohnermelde/i],
  ['grundgesetz', /grundgesetz|grundrecht|menschenwürde|artikel \d|verfassung|meinungsfreiheit|glaubensfreiheit|versammlungsfreiheit|pressefreiheit/i],
  ['elections', /wahl|wähl|stimmzettel|erststimme|zweitstimme|wahlrecht|wahlgrunds|partei/i],
  ['federalism', /bundesland|bundesländer|föderal|bundesrat|landtag|landkreis|hauptstadt/i],
  ['courts', /gericht|richter|urteil|justiz|rechtsstaat|gewaltenteilung|anwalt|unschuld|strafe/i],
  ['work', /arbeit|beruf|lohn|kündig|gewerkschaft|betriebsrat|mindestlohn|urlaub/i],
  ['social', /versicher|krankenkasse|rente|arbeitslos|sozial|pflege|gesundheit|arzt/i],
  ['school', /schule|schul|bildung|ausbildung|universität|studium/i],
  ['ns-zeit', /nationalsozial|hitler|holocaust|jüdisch|jud|1933|1945|zweite[nr]? weltkrieg|nsdap|drittes reich/i],
  ['ddr', /\bddr\b|mauer|wiedervereinigung|deutsche einheit|sed\b|stasi|1989|1990|3\. oktober/i],
  ['eu', /europäisch|europa|\beu\b|euro\b|schengen/i],
  ['religion', /kirche|religion|glaube|christ|islam|muslim|konfession|kirchensteuer/i],
  ['participation', /verein|ehrenamt|bürgerinitiative|demonstr|petition|engagier|nachbar/i],
  ['alltag', /rundfunk|müll|ruhezeit|pfand|feiertag|sonntag|miete|nebenkosten/i],
];

function haystack(q) {
  return [q.text, ...Object.values(q.options ?? {})].join(' \n ');
}

export function realLifeFor(q) {
  if (q.type === 'state') {
    const pattern = PATTERNS[(q.id - 301) % 10];
    const state = q.state ?? '';
    return { en: STATE_NOTE[pattern](state), de: STATE_NOTE_DE[pattern](state) };
  }
  return GENERAL_NOTES[q.id] ?? null;
}

export function deepDiveFor(q) {
  const hay = haystack(q);
  for (const [key, pattern] of DIVE_RULES) {
    if (pattern.test(hay)) return key;
  }
  return null;
}
