/**
 * Topic + visual classification rules.
 *
 * Rules are evaluated in order; the first whose pattern matches the German
 * question text (plus its options) wins. Everything unmatched falls back to
 * `society`, which is the broadest bucket.
 */

export const TOPICS = {
  constitution: { label: { de: 'Grundrechte', en: 'Basic Rights' }, icon: '🕊️', color: '#3B82F6' },
  democracy: { label: { de: 'Wahlen & Parteien', en: 'Elections & Parties' }, icon: '🗳️', color: '#8B5CF6' },
  institutions: { label: { de: 'Staat & Institutionen', en: 'State & Institutions' }, icon: '🏛️', color: '#0EA5E9' },
  history: { label: { de: 'Geschichte', en: 'History' }, icon: '⏳', color: '#F59E0B' },
  law: { label: { de: 'Recht & Justiz', en: 'Law & Justice' }, icon: '⚖️', color: '#EF4444' },
  work: { label: { de: 'Arbeit & Soziales', en: 'Work & Welfare' }, icon: '💼', color: '#14B8A6' },
  society: { label: { de: 'Gesellschaft & Alltag', en: 'Society & Daily Life' }, icon: '🤝', color: '#EC4899' },
  europe: { label: { de: 'Europa & Welt', en: 'Europe & the World' }, icon: '🇪🇺', color: '#6366F1' },
  states: { label: { de: 'Bundesländer', en: 'Federal States' }, icon: '🗺️', color: '#10B981' },
};

/**
 * Order matters: the narrowest, most unambiguous vocabulary is tested first so
 * that e.g. "Bundesverfassungsgericht" lands in `law` rather than being pulled
 * into `constitution` by the word "Verfassung".
 * @type {[keyof typeof TOPICS, RegExp][]}
 */
const TOPIC_RULES = [
  ['history', /nationalsozial|hitler|holocaust|judenverfolgung|drittes reich|zweite[nr]? weltkrieg|erste[nr]? weltkrieg|\bddr\b|deutsche demokratische republik|mauer(fall|bau)?|berliner mauer|wiedervereinigung|weimarer|kaiserreich|1848|1919|1933|1945|1949|1961|1989|1990|17\. juni|9\. november|3\. oktober|besatzungszone|alliierte|stasi|\bsed\b|montagsdemo|tag der deutschen einheit|nachkriegs|adenauer|willy brandt|\bnazi/i],
  ['europe', /europäisch|europa\b|europas|\beu\b|euro\b|nato|vereinte nationen|\buno\b|schengen|europaparlament|europawahl|brüssel|straßburg|mitgliedsstaat|nachbarland|nachbarstaat|grenzt an/i],
  ['law', /verfassungsgericht|gericht|richter|urteil|staatsanwalt|prozess|klage|angeklagt|zeuge|strafe\b|straftat|strafbar|anwalt|polizei|gefängnis|\bhaft\b|schöffe|justiz|rechtsstaat|gewaltenteilung|unschuldsvermutung/i],
  ['constitution', /grundgesetz|grundrecht|menschenwürde|menschenrecht|meinungsfreiheit|religionsfreiheit|pressefreiheit|versammlungsfreiheit|glaubensfreiheit|freizügigkeit|gleichberechtigung|gleichheit vor dem gesetz|diskriminier|zensur|artikel \d|verfassung|freiheitlich|asylrecht|\basyl\b|briefgeheimnis|unverletzlich|grundordnung|toleranz|religiöse vielfalt/i],
  ['democracy', /wahl|wähl|gewählt|stimmzettel|stimme\b|partei|abgeordnete|bundestag|opposition|koalition|fraktion|kandidat|mandat|mehrheit|demokrat|volksherrschaft|abstimm|wahlurne|volksvertret/i],
  ['institutions', /bundesrat|bundeskanzler|bundespräsident|bundesregierung|regierung|ministerium|minister\b|ministerin|staatsoberhaupt|verwaltung|behörde|\bamt\b|rathaus|bundeswehr|föderal|legislative|exekutive|judikative|hauptstadt|staatsform|republik|sozialstaat|verfassungsorgan|kommunal|gemeinde|landtag/i],
  ['work', /arbeit|beruf|lohn|gehalt|steuer|versicherung|rente|arbeitslos|gewerkschaft|betriebsrat|kündig|sozialversicherung|krankenkasse|kindergeld|elterngeld|tarif|ausbildung|jobcenter|selbständig|gewerbe|einkommen|mindestlohn/i],
  ['society', /schule|schul|bildung|universität|kirche|religion|christ|\bjud|muslim|islam|kopftuch|familie|kind\b|kinder|\behe\b|eltern|verein|ehrenamt|nachbar|müll|integration|sprache|deutschkurs|feiertag|weihnachten|ostern|pfingsten|karneval|tradition|zeitung|medien|presse|meldeamt|umzug|wohnung|miete|arzt|gesundheit/i],
  ['law', /gesetz|vertrag|verboten|erlaubt|anzeige|schuld|geldstrafe|sorgerecht|scheidung/i],
];

/**
 * Illustration keys map to hand-drawn SVG scenes in `src/components/illustrations`.
 * These are reserved for the concepts that come up again and again in the exam,
 * where a picture genuinely helps recall.
 */
const ILLUSTRATION_RULES = [
  ['flag', /flagge|farben der bundesrepublik|landesflagge|schwarz.?rot.?gold/i],
  ['eagle', /wappen|bundesadler|adler/i],
  ['ballot', /stimmzettel|wahlurne|wählen gehen|wahlrecht|wahlgrundsätze|geheim.*wahl|briefwahl|wahlberechtigt/i],
  ['parliament', /bundestag|abgeordnete|parlament|plenar/i],
  ['bundesrat', /bundesrat/i],
  ['chancellor', /bundeskanzler|regierungschef|kabinett/i],
  ['president', /bundespräsident|staatsoberhaupt/i],
  ['constitution', /grundgesetz|verfassung|artikel \d/i],
  ['scales', /gericht|richter|urteil|justiz|rechtsstaat|gewaltenteilung/i],
  ['dove', /meinungsfreiheit|menschenwürde|grundrecht|menschenrecht|freiheit|toleranz|gleichberechtigung/i],
  ['wall', /mauer|ddr|wiedervereinigung|deutsche einheit|teilung deutschlands/i],
  ['euStars', /europäische union|\beu\b|europaparlament|euro\b/i],
  ['map', /bundesland|bundesländer|föderal|landkreis|hauptstadt/i],
  ['school', /schule|bildung|universität|ausbildung|schulpflicht/i],
  ['work', /arbeit|beruf|gewerkschaft|kündigung|lohn|steuer|rente|versicherung/i],
  ['church', /kirche|religion|glaube|christ|islam|jud/i],
  ['family', /familie|kind|eltern|ehe|erziehung/i],
  ['history', /nationalsozial|hitler|holocaust|weltkrieg|weimar|1933|1945|1949/i],
];

/** Small per-question emoji, used when a question has no photo and no SVG scene. */
const ICON_RULES = [
  ['🗳️', /wahl|wähl|stimmzettel|abstimm/i],
  ['🏛️', /bundestag|bundesrat|parlament|regierung|ministerium/i],
  ['⚖️', /gericht|richter|urteil|gesetz|recht/i],
  ['📜', /grundgesetz|verfassung|artikel/i],
  ['🕊️', /freiheit|menschenwürde|grundrecht|toleranz/i],
  ['🇪🇺', /europäisch|europa|\beu\b/i],
  ['💶', /euro|geld|steuer|lohn|einkommen/i],
  ['🏰', /geschichte|kaiser|könig|krieg|mauer|ddr/i],
  ['🎓', /schule|bildung|universität|ausbildung/i],
  ['💼', /arbeit|beruf|gewerkschaft|kündigung/i],
  ['🏥', /arzt|krank|gesundheit|versicherung/i],
  ['👨‍👩‍👧', /familie|kind|eltern|ehe/i],
  ['⛪', /kirche|religion|glaube|christ|islam|jud/i],
  ['📰', /zeitung|medien|presse|nachricht/i],
  ['🏠', /wohnung|miete|umzug|nachbar/i],
  ['🗺️', /bundesland|landkreis|hauptstadt|stadt/i],
  ['📅', /feiertag|weihnachten|ostern|datum|jahr/i],
];

function haystack(q) {
  return [q.text, ...Object.values(q.options ?? {}), q.imageText ?? ''].join(' \n ');
}

export function classifyTopic(q) {
  if (q.type === 'state') return 'states';
  const hay = haystack(q);
  for (const [topic, pattern] of TOPIC_RULES) {
    if (pattern.test(hay)) return topic;
  }
  return 'society';
}

export function pickIllustration(q, topic) {
  const hay = haystack(q);
  for (const [key, pattern] of ILLUSTRATION_RULES) {
    if (pattern.test(hay)) return key;
  }
  // Every card deserves art, so fall back to the topic's own generic scene.
  return `topic-${topic}`;
}

export function pickIcon(q, topic) {
  const hay = haystack(q);
  for (const [icon, pattern] of ICON_RULES) {
    if (pattern.test(hay)) return icon;
  }
  return TOPICS[topic].icon;
}
