#!/usr/bin/env node
/**
 * Writes the sixteen state lessons (longform/state-<slug>.md) from the
 * catalogue and the facts below. Every state has the same ten kinds of
 * question, so the quiz moments are built from the data; what's written by
 * hand is each state's introduction, where it sits on the map, its coat of
 * arms and a note on its flag and capital. Edit this file, not the output.
 *
 *   npm run state-lessons            writes all sixteen
 *   npm run state-lessons -- bayern  writes one
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(here, '..', '..', 'src', 'data', 'questions.json'), 'utf8'));
const all = data.questions ?? data;
const OUT = path.join(here, '..', 'longform');

/** Which state each district in the answer options belongs to. */
const DISTRICT_STATE = {
  'Mecklenburgische Seenplatte': 'Mecklenburg-Vorpommern',
  'Neckar-Odenwald-Kreis': 'Baden-Württemberg',
  Nordfriesland: 'Schleswig-Holstein',
  Altötting: 'Bayern',
  Prignitz: 'Brandenburg',
  'Rhein-Sieg-Kreis': 'Nordrhein-Westfalen',
  Altona: 'Hamburg',
  Pankow: 'Berlin',
  Vogtlandkreis: 'Sachsen',
  'Amberg-Sulzbach': 'Bayern',
  Hemelingen: 'Bremen',
  Babelsberg: 'Brandenburg',
  Ammerland: 'Niedersachsen',
  'Main-Taunus-Kreis': 'Hessen',
  Westerwaldkreis: 'Rheinland-Pfalz',
  Emsland: 'Niedersachsen',
  Neunkirchen: 'Saarland',
  Uckermark: 'Brandenburg',
  Börde: 'Sachsen-Anhalt',
  Wartburgkreis: 'Thüringen',
};

/**
 * By hand, checked: where the state is, its coat of arms as it appears in the
 * exam, and short notes. `en` is the English name the narration uses.
 */
const STATES = {
  'Baden-Württemberg': {
    slug: 'baden-wuerttemberg',
    en: 'Baden-Württemberg',
    intro:
      'in the south-west, borders France and Switzerland. It was formed in 1952, when three post-war states merged into one. It has the Black Forest, Lake Constance, and car makers like Mercedes-Benz and Porsche.',
    where: 'the south-west corner of the country',
    arms: 'three black lions on a golden shield',
    flag: 'Black and gold, the colours of the old Staufer dynasty.',
  },
  Bayern: {
    slug: 'bayern',
    en: 'Bavaria',
    intro:
      "in the south-east, is Germany's largest state by area. Officially it's a Freistaat, a free state, which simply means a republic. It borders Austria and the Czech Republic, and its capital is Munich.",
    where: 'the south-east, the biggest state on the map',
    arms: 'the white and blue diamonds, under a crown',
    flag: 'White and blue, often as a pattern of diamonds.',
  },
  Berlin: {
    slug: 'berlin',
    en: 'Berlin',
    intro:
      "is the capital of Germany, and at the same time one of its sixteen states: a city-state. It's divided into twelve districts, and almost four million people live there.",
    where: 'the small state in the middle of Brandenburg',
    arms: 'a black bear on a white shield',
    flag: 'White and red, with the Berlin bear.',
  },
  Brandenburg: {
    slug: 'brandenburg',
    en: 'Brandenburg',
    intro:
      'surrounds Berlin on every side. Its capital is Potsdam, with the palace of Sanssouci, just outside Berlin. Until 1990 it was part of the DDR.',
    where: 'the large state around Berlin, in the east',
    arms: 'a red eagle on a white shield',
    flag: 'Red and white, with the red eagle.',
  },
  Bremen: {
    slug: 'bremen',
    en: 'Bremen',
    intro:
      "is the smallest German state, and it's made up of two cities: Bremen and Bremerhaven, about sixty kilometres apart on the river Weser. Its official name is the Free Hanseatic City of Bremen.",
    where: 'the small city-state in the north-west, surrounded by Lower Saxony',
    arms: 'a silver key on a red shield',
    flag: 'Red and white, in stripes and checks.',
  },
  Hamburg: {
    slug: 'hamburg',
    en: 'Hamburg',
    intro:
      "on the river Elbe, is a city and a state at once: the Free and Hanseatic City of Hamburg. It has Germany's biggest port, and nearly two million people.",
    where: 'the city-state in the north, on the Elbe',
    arms: 'a white castle with three towers on a red shield',
    flag: 'White and red: the white castle on red.',
  },
  Hessen: {
    slug: 'hessen',
    en: 'Hesse',
    intro:
      "is in the middle of the country. Its capital is Wiesbaden, but its biggest city is Frankfurt, home of the European Central Bank and one of Europe's busiest airports.",
    where: 'the middle of the west of the country',
    arms: 'a lion striped red and white, on a blue shield',
    flag: 'Red and white, the colours of its lion.',
  },
  'Mecklenburg-Vorpommern': {
    slug: 'mecklenburg-vorpommern',
    en: 'Mecklenburg-Western Pomerania',
    intro:
      'lies on the Baltic coast, in the north-east. It has islands like Rügen, and hundreds of lakes. Its capital is Schwerin; its biggest city is Rostock.',
    where: 'the north-east, along the Baltic coast',
    arms: 'a black bull’s head and a red griffin',
    flag: 'Blue, white, yellow and red: four colours, from its two old regions.',
  },
  Niedersachsen: {
    slug: 'niedersachsen',
    en: 'Lower Saxony',
    intro:
      'in the north-west, runs from the North Sea coast to the Harz mountains. Its capital is Hanover, and Volkswagen has its headquarters in Wolfsburg.',
    where: 'the large state in the north-west',
    arms: 'a white horse, rearing, on a red shield',
    flag: 'Black, red and gold, like the German flag, with the white horse on it.',
  },
  'Nordrhein-Westfalen': {
    slug: 'nordrhein-westfalen',
    en: 'North Rhine-Westphalia',
    intro:
      'in the west, has more people than any other state: around eighteen million. Its capital is Düsseldorf, its biggest city Cologne, and it includes the Ruhr, once the heart of German coal and steel.',
    where: 'the west, on the borders with the Netherlands and Belgium',
    arms: 'three parts: a white wavy line on green for the Rhine, a white horse for Westphalia, and a red rose for Lippe',
    flag: 'Green, white and red.',
    capital: 'Cologne is bigger, and Bonn was West Germany’s capital until 1990. But the state capital is Düsseldorf.',
  },
  'Rheinland-Pfalz': {
    slug: 'rheinland-pfalz',
    en: 'Rhineland-Palatinate',
    intro:
      'in the west, borders France, Luxembourg and Belgium. Its capital is Mainz, on the Rhine, and it grows more wine than any other state.',
    where: 'the west, along the borders with Luxembourg and France',
    arms: 'a red cross, a white wheel and a golden lion, under a crown of leaves',
    flag: 'Black, red and gold, like the German flag, with the coat of arms on it.',
  },
  Saarland: {
    slug: 'saarland',
    en: 'Saarland',
    intro:
      'in the south-west, on the French border, is the smallest state apart from the three city-states. After the war it was run separately, under French influence, and it only joined West Germany in 1957.',
    where: 'the small state in the far south-west, on the French border',
    arms: 'four parts, with lions, a cross and small eagles',
    flag: 'Black, red and gold, like the German flag, with the coat of arms on it.',
  },
  Sachsen: {
    slug: 'sachsen',
    en: 'Saxony',
    intro:
      'in the east, is a Freistaat, like Bavaria. Its capital is Dresden, and its biggest city is Leipzig, where the Monday demonstrations of 1989 began.',
    where: 'the east, on the borders with Poland and the Czech Republic',
    arms: 'black and gold stripes, with a green band of leaves across them',
    flag: 'White and green.',
  },
  'Sachsen-Anhalt': {
    slug: 'sachsen-anhalt',
    en: 'Saxony-Anhalt',
    intro:
      'lies in the middle of eastern Germany. Its capital is Magdeburg. In Wittenberg, Martin Luther started the Reformation in 1517, and in Dessau the Bauhaus, the famous school of design, built its home.',
    where: 'the middle of eastern Germany',
    arms: 'on top, black and gold stripes with a green band; below, a black bear on a red wall',
    flag: 'Yellow and black, with the coat of arms.',
  },
  'Schleswig-Holstein': {
    slug: 'schleswig-holstein',
    en: 'Schleswig-Holstein',
    intro:
      "is the northernmost state, between the North Sea and the Baltic, on the border with Denmark. Its capital is Kiel. It has a Danish minority, with its own party in the state parliament.",
    where: 'the very top of the map, between two seas',
    arms: 'two blue lions on gold, and a white nettle leaf on red',
    flag: 'Blue, white and red.',
  },
  Thüringen: {
    slug: 'thueringen',
    en: 'Thuringia',
    intro:
      "in the middle of the country, is a Freistaat. Its capital is Erfurt. In nearby Weimar, Goethe and Schiller lived and wrote, and in 1919 Germany's first democratic constitution was drawn up there.",
    where: 'the middle of the country, a little to the east',
    arms: 'a lion striped red and white on blue, with eight white stars',
    flag: 'White and red.',
  },
};

const CITY_STATES = new Set(['Berlin', 'Bremen', 'Hamburg']);
/** German that the voice reads aloud never contains a slash. */
const sayable = (s) => s.replace(/\s*\/\s*/g, ' oder ').replace(/\s+/g, ' ').trim();
const numberWord = { 1: 'one', 2: 'two', 3: 'three', 4: 'four' };

function lesson(state) {
  const st = STATES[state];
  const qs = all.filter((q) => q.kind === 'state' && q.state === state);
  const find = (re) => qs.find((q) => re.test(q.de.text));
  const answer = (q) => q.de.options[q.answer];
  const ask = (q, lead = '') => `[dramatic] ${lead}[[${sayable(q.de.text)}]] ${q.en.text}`;
  const card = (q, extra = '') => `> SCENE (question): Question card #${q.id}. Three seconds to guess, then the answer highlights.${extra}`;
  const shot = (q, paras, screen = []) => [`{Q${q.id}}`, '', card(q), ...screen, '', ...paras.flatMap((p) => [p, ''])].join('\n');

  const map = find(/^Welches Bundesland ist (?!ein )/);
  const capital = find(/Landeshauptstadt/);
  const cityState = find(/Stadtstaat\?/);
  const flag = find(/Landesflagge/);
  const arms = find(/Wappen/);
  const district = find(/Landkreis|Bezirk|Stadtteil/);
  const term = find(/Für wie viele Jahre/);
  const age = find(/Ab welchem Alter/);
  const info = find(/politische Themen/);
  const head = find(/Regierungschef/);
  const notMinister = find(/nicht\?$/);
  const order = [map, capital ?? cityState, flag, arms, district, term, age, head, notMinister, info];
  if (order.some((q) => !q) || qs.length !== 10) throw new Error(`${state}: unexpected question set`);

  const capitalName = capital ? answer(capital).replace(/\.$/, '') : state;
  const n = Number(answer(map));
  const headSaid = sayable(answer(head));
  const headWord = headSaid.split(' oder ')[1];
  const notSaid = sayable(answer(notMinister));
  const termN = Number(answer(term));
  const ageN = Number(answer(age));
  const others = Object.values(district.de.options).filter((o) => o !== answer(district));
  const otherStates = others.map((o) => `[[${o}]] is in [[${DISTRICT_STATE[o]}]]`);

  const headNote = {
    Berlin: 'the governing mayor. Berlin is a city and a state, so its head of government is a mayor with the powers of a minister-president.',
    Bremen:
      "the president of the senate. In Bremen, the senate is the state government, and its president is also the city's mayor. Don't mix it up with Berlin's governing mayor, or Hamburg's first mayor.",
    Hamburg: "the first mayor. In Hamburg, the senate is the state government, and the first mayor leads it.",
  }[state] ?? 'the minister-president. Not a prime minister, and not a mayor: mayors run towns and cities.';

  const out = `---
title: "${state} — The Ten State Questions"
topic: state
state: ${state}
questions: [${order.map((q) => q.id).join(', ')}]
target: about 4 minutes
status: draft 2, documentary tone (see SERIES.md)
---

<!-- Generated by scripts/state-lessons.mjs from the catalogue; edit the generator, not this file. Format: see the top of basic-rights.md. -->

## Cold open

> SCENE (states): ${state} lights up on the map of Germany.
> ${state} | ${CITY_STATES.has(state) ? 'Stadtstaat' : `Landeshauptstadt ${capitalName}`}

[dramatic] [[${state}]]${st.en !== state ? `, ${st.en},` : /^(in|on) /.test(st.intro) ? ',' : ''} ${st.intro}

[dramatic] If you take the citizenship test in ${st.en}, three of your thirty-three questions are about the state you live in. They come from a list of just ten. Here are all ten, with the answers.

> SCENE (title): Title card.
> ${state.toUpperCase()}

## On the map

${shot(map, [
  ask(map, 'The exam shows a map with four states, numbered. '),
  `[countdown] [dramatic] [[${n}]]. Number ${numberWord[n]}: ${st.where}.`,
])}

${
  capital
    ? shot(capital, [
        ask(capital),
        `[countdown] [dramatic] [[${answer(capital)}]] ${st.capital ?? `The other three are real cities in ${st.en}, but not the capital.`}`,
      ])
    : shot(cityState, [
        ask(cityState),
        `[countdown] [dramatic] [[${answer(cityState)}]]. There are three city-states: Berlin, Hamburg and Bremen. Each one is a city and a state at the same time.`,
      ])
}

## Flag and coat of arms

${shot(flag, [ask(flag), `[countdown] [dramatic] [[${answer(flag)}]]. ${st.flag}`])}

${shot(arms, [
  ask(arms, 'The exam shows four coats of arms. '),
  `[countdown] [dramatic] [[${answer(arms)}]], picture ${numberWord[answer(arms).slice(-1)]}: ${st.arms}.`,
])}

## How it's run

${shot(district, [
  ask(district),
  `[countdown] [dramatic] [[${answer(district)}]]. The others are elsewhere: ${otherStates.slice(0, -1).join(', ')}, and ${otherStates.at(-1)}.`,
])}

${shot(term, [
  ask(term),
  `[countdown] [dramatic] [[${termN}]]. ${
    termN === 5
      ? 'Five years, like almost every state parliament.'
      : 'Four years. Bremen is the only state that still elects its parliament for four years; all the others have moved to five.'
  }`,
])}

${shot(age, [
  ask(age),
  `[countdown] [dramatic] [[${ageN}]]. ${
    `Here, you can vote ${/Landtag|Bürgerschaft/.test(age.de.text) ? 'for the state parliament' : 'in local elections'} from ${ageN === 16 ? 'sixteen' : 'eighteen'}.`
  } It differs from state to state. For the Bundestag, it's eighteen everywhere.`,
])}

${shot(
  head,
  [
    ask(head),
    `[countdown] [dramatic] [[${headSaid}]], ${headNote}`,
  ],
  [`> @ ${headSaid}`],
)}

${shot(
  notMinister,
  [
    ask(notMinister, 'And a question with a [[nicht]]. '),
    CITY_STATES.has(state)
      ? `[countdown] [dramatic] [[${notSaid}]], a senator for foreign relations. In a city-state, the ministers are called senators. Finance, justice and the interior: ${st.en} has all of those. Foreign policy is the federation's job.`
      : `[countdown] [dramatic] [[${notSaid}]], a foreign minister. Foreign policy is the federation's job, so no state has one. Finance, justice and the interior: every state has those.`,
  ],
  [`> @ ${notSaid}`],
)}

${shot(
  info,
  [
    ask(info),
    /Landesbeauftragten/.test(answer(info))
      ? `[countdown] [dramatic] [[bei der Landesbeauftragten für politische Bildung]], the state's office for civic education. In most states it's called a Landeszentrale; here it has its own name. It's free, it belongs to no party, and it has material on politics in plain language.`
      : `[countdown] [dramatic] [[${answer(info)}]], the state centre for civic education. Every state has one. It's free, it belongs to no party, and it has material on politics in plain language.`,
  ],
  /Landesbeauftragten/.test(answer(info)) ? ['> @ Landesbeauftragten'] : [],
)}

## What to remember for the exam

> SCENE (words): The words appear one by one, then settle into a grid.
> ${[capital ? capitalName : answer(district), answer(flag), headWord].join(', ')}

[dramatic] Three answers to hold on to: [[${capital ? capitalName : answer(district)}]]. [[${answer(flag)}]]. And [[${headWord}]].

## Outro

> SCENE (outro): ${state} on the map. Then the app.
> ${state} | ${st.en} | 10 Fragen

[dramatic] Three of these ten will be in your test. Learn them, and they're three of the easiest points you'll get. If you want to practise all four hundred and sixty questions, free and with no account, the app is linked in the description.

> SCENE (end): End card with the AI-voice disclosure.

[dramatic] This video is narrated with an AI version of my own voice. Every answer was checked against the official question catalogue. See you in the next one.
`;
  fs.writeFileSync(path.join(OUT, `state-${st.slug}.md`), out);
  return `state-${st.slug}`;
}

const pick = process.argv[2];
for (const state of Object.keys(STATES)) {
  if (pick && STATES[state].slug !== pick) continue;
  console.log(lesson(state));
}
