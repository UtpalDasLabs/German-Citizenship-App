import type { TopicKey } from '@/lib/types';

/**
 * Longer explainers, written to answer "what does this actually mean for me?"
 * rather than "what is the exam answer?".
 *
 * Facts here are deliberately the stable kind - how a process works, which
 * office to go to, what a right protects. Figures that change often are given
 * with the date they were checked, so a stale number is visible rather than
 * silently wrong.
 */
export type DeepDive = {
  key: string;
  topic: TopicKey;
  icon: string;
  title: { de: string; en: string };
  /** Short hook shown in the list. */
  summary: { de: string; en: string };
  body: { de: string[]; en: string[] };
  /** German words worth learning, with a gloss. */
  vocab?: { term: string; gloss: { de: string; en: string } }[];
  links?: { label: string; url: string }[];
};

export const DEEP_DIVES: DeepDive[] = [
  {
    key: 'anmeldung',
    topic: 'society',
    icon: '🏠',
    title: { de: 'Anmeldung: dein erster Behördengang', en: 'Anmeldung: your first trip to the authorities' },
    summary: {
      de: 'Ohne Anmeldung gibt es kein Bankkonto, keine Steuer-ID und keinen Handyvertrag.',
      en: 'Without it you cannot get a bank account, a tax ID, or a phone contract.',
    },
    body: {
      en: [
        'When you move into a home in Germany you must register that address at the local Bürgeramt (also called Einwohnermeldeamt or KVR, depending on the city). The law gives you 14 days from the day you move in. This is set by §17 of the Bundesmeldegesetz, and missing the deadline is an administrative offence.',
        'You need your passport, the rental contract is not enough on its own: your landlord must give you a Wohnungsgeberbestätigung, a signed confirmation that you really live there. Bring both, plus the filled-in registration form.',
        'The Anmeldung is the key that unlocks everything else. A few weeks later your Steuer-ID arrives by post, which your employer needs to pay you properly. Banks, health insurers and phone companies all ask for the Meldebescheinigung you get on the day. If you move again, you repeat it; if you leave Germany, you do an Abmeldung.',
      ],
      de: [
        'Wenn du in Deutschland in eine Wohnung einziehst, musst du diese Adresse beim Bürgeramt anmelden. Das Gesetz gibt dir 14 Tage ab dem Einzug. Das steht in §17 Bundesmeldegesetz, und wer die Frist verpasst, begeht eine Ordnungswidrigkeit.',
        'Du brauchst deinen Pass. Der Mietvertrag allein reicht nicht: Deine Vermieterin oder dein Vermieter muss dir eine Wohnungsgeberbestätigung geben, also eine Unterschrift, dass du dort wirklich wohnst.',
        'Die Anmeldung ist der Schlüssel für alles andere. Ein paar Wochen später kommt die Steuer-ID mit der Post, die dein Arbeitgeber braucht. Banken, Krankenkassen und Handyanbieter fragen nach der Meldebescheinigung. Beim Umzug meldest du dich neu an, beim Wegzug ab.',
      ],
    },
    vocab: [
      { term: 'Bürgeramt', gloss: { de: 'Amt für Meldeangelegenheiten', en: 'citizens’ office' } },
      { term: 'Wohnungsgeberbestätigung', gloss: { de: 'Bestätigung der Vermieterin', en: 'landlord’s confirmation' } },
      { term: 'Meldebescheinigung', gloss: { de: 'Nachweis der Anmeldung', en: 'proof of registration' } },
    ],
  },

  {
    key: 'grundgesetz',
    topic: 'constitution',
    icon: '📜',
    title: { de: 'Warum Artikel 1 zuerst kommt', en: 'Why Article 1 comes first' },
    summary: {
      de: '„Die Würde des Menschen ist unantastbar" ist kein schöner Satz, sondern eine Lehre aus der Geschichte.',
      en: '"Human dignity shall be inviolable" is not decoration. It is a lesson drawn from history.',
    },
    body: {
      en: [
        'The Grundgesetz was written in 1949, four years after the end of Nazi rule. The people who wrote it had just watched a state strip people of their rights and then their lives. So they put human dignity in Article 1, before democracy, before the state itself.',
        'Articles 1 to 19 are the Grundrechte, the basic rights: dignity, free development of personality, equality, freedom of belief, freedom of expression, freedom of assembly, privacy of correspondence. They bind the state directly. If a law breaks one, the Bundesverfassungsgericht can strike it down.',
        'Some parts cannot be changed at all, even by a unanimous parliament. That is the Ewigkeitsklausel in Article 79(3): human dignity, the federal structure, and the democratic and social nature of the republic are permanent. It exists so that democracy cannot vote itself away, which is exactly what happened in 1933.',
      ],
      de: [
        'Das Grundgesetz entstand 1949, vier Jahre nach dem Ende der NS-Herrschaft. Die Menschen, die es schrieben, hatten gerade erlebt, wie ein Staat Menschen erst die Rechte und dann das Leben nahm. Deshalb steht die Menschenwürde in Artikel 1 – vor der Demokratie, vor dem Staat.',
        'Die Artikel 1 bis 19 sind die Grundrechte: Würde, freie Entfaltung, Gleichheit, Glaubensfreiheit, Meinungsfreiheit, Versammlungsfreiheit, Briefgeheimnis. Sie binden den Staat unmittelbar. Verstößt ein Gesetz dagegen, kann das Bundesverfassungsgericht es aufheben.',
        'Manches lässt sich gar nicht ändern, auch nicht einstimmig. Das ist die Ewigkeitsklausel in Artikel 79 Absatz 3: Menschenwürde, Bundesstaat, Demokratie und Sozialstaat sind dauerhaft. So kann sich die Demokratie nicht selbst abschaffen – genau das geschah 1933.',
      ],
    },
    vocab: [
      { term: 'Grundrechte', gloss: { de: 'die Rechte in Artikel 1–19', en: 'basic rights, Articles 1–19' } },
      { term: 'Ewigkeitsklausel', gloss: { de: 'unveränderbarer Kern', en: 'the eternity clause' } },
    ],
  },

  {
    key: 'elections',
    topic: 'democracy',
    icon: '🗳️',
    title: { de: 'Zwei Stimmen, ein Stimmzettel', en: 'Two votes, one ballot paper' },
    summary: {
      de: 'Bei der Bundestagswahl wählst du zweimal – und die zweite Stimme zählt mehr, als viele denken.',
      en: 'In a federal election you vote twice, and the second vote matters more than most people expect.',
    },
    body: {
      en: [
        'The Bundestag ballot has two columns. With the Erststimme on the left you choose a person, the candidate for your local district. With the Zweitstimme on the right you choose a party. Both are on the same sheet and you mark one cross in each column.',
        'The Zweitstimme is the important one: it decides how many seats each party gets in the Bundestag overall. The Erststimme decides who represents your particular corner of the country. This is why you can vote for a local candidate you like from one party and still give your Zweitstimme to another.',
        'A party needs at least five percent of the Zweitstimmen to enter parliament at all. That threshold, the Fünf-Prozent-Hürde, exists to stop a parliament splintering into dozens of tiny groups, as the Reichstag did in the Weimar Republic. Elections are allgemein, unmittelbar, frei, gleich and geheim: everyone of age may vote, directly, without pressure, with equal weight, and in secret.',
      ],
      de: [
        'Der Stimmzettel zur Bundestagswahl hat zwei Spalten. Mit der Erststimme links wählst du eine Person, die Kandidatin oder den Kandidaten aus deinem Wahlkreis. Mit der Zweitstimme rechts wählst du eine Partei. Du machst in jeder Spalte ein Kreuz.',
        'Die Zweitstimme ist die wichtigere: Sie entscheidet, wie viele Sitze eine Partei im Bundestag bekommt. Die Erststimme entscheidet, wer deinen Wahlkreis vertritt. Deshalb kannst du eine Person der einen Partei wählen und die Zweitstimme einer anderen geben.',
        'Eine Partei braucht mindestens fünf Prozent der Zweitstimmen, um überhaupt in den Bundestag zu kommen. Diese Fünf-Prozent-Hürde verhindert ein zersplittertes Parlament, wie es der Reichstag in der Weimarer Republik war. Wahlen sind allgemein, unmittelbar, frei, gleich und geheim.',
      ],
    },
    vocab: [
      { term: 'Erststimme', gloss: { de: 'Stimme für eine Person', en: 'vote for a person' } },
      { term: 'Zweitstimme', gloss: { de: 'Stimme für eine Partei', en: 'vote for a party' } },
      { term: 'Wahlkreis', gloss: { de: 'dein Wahlgebiet', en: 'your electoral district' } },
    ],
  },

  {
    key: 'bundestag',
    topic: 'institutions',
    icon: '🏛️',
    title: { de: 'Wer regiert eigentlich?', en: 'Who actually governs?' },
    summary: {
      de: 'Bundestag, Kanzler, Bundespräsident, Bundesrat – wer was darf, und wer wen absetzen kann.',
      en: 'Bundestag, chancellor, president, Bundesrat: who may do what, and who can remove whom.',
    },
    body: {
      en: [
        'You elect exactly one thing at federal level: the Bundestag. It then elects the chancellor, who picks the ministers. So a government exists only for as long as it holds a Bundestag majority, and losing that majority is how governments fall here - not a fixed term running out.',
        'The Bundespräsident is head of state but deliberately weak: representing the country, signing laws, and formally appointing the chancellor the Bundestag chose. The Weimar Republic had a powerful directly-elected president who could rule by decree, and that is precisely what the Grundgesetz set out to avoid. The president is elected by the Bundesversammlung, which meets for nothing else.',
        'Laws are passed by parliament, never by the government alone. Bills that affect the states also need the Bundesrat, whose members are sent by the sixteen state governments. And a chancellor can only be removed by electing a successor in the same vote - the konstruktives Misstrauensvotum - so parliament can never leave the country without a government.',
      ],
      de: [
        'Auf Bundesebene wählst du genau eines: den Bundestag. Der wählt die Kanzlerin, die sich die Ministerinnen aussucht. Eine Regierung besteht also nur, solange sie eine Mehrheit im Bundestag hat – daran scheitern Regierungen hier, nicht am Ablauf einer Frist.',
        'Der Bundespräsident ist Staatsoberhaupt, aber bewusst schwach: Er vertritt das Land, unterschreibt Gesetze und ernennt formal die Kanzlerin, die der Bundestag gewählt hat. Die Weimarer Republik hatte einen mächtigen, direkt gewählten Präsidenten, der per Notverordnung regieren konnte – genau das sollte das Grundgesetz verhindern.',
        'Gesetze beschließt das Parlament, nie die Regierung allein. Vorhaben, die die Länder betreffen, brauchen zusätzlich den Bundesrat. Und eine Kanzlerin kann nur abgelöst werden, indem gleichzeitig eine Nachfolgerin gewählt wird – das konstruktive Misstrauensvotum. So bleibt das Land nie ohne Regierung.',
      ],
    },
    vocab: [
      { term: 'Bundesversammlung', gloss: { de: 'wählt nur den Bundespräsidenten', en: 'elects only the president' } },
      { term: 'konstruktives Misstrauensvotum', gloss: { de: 'Abwahl nur mit Nachfolger', en: 'removal only by electing a successor' } },
      { term: 'Fraktion', gloss: { de: 'Gruppe einer Partei im Parlament', en: 'a party\u2019s group in parliament' } },
    ],
  },

  {
    key: 'federalism',
    topic: 'institutions',
    icon: '🗺️',
    title: { de: 'Warum es 16 Bundesländer gibt', en: 'Why there are 16 Bundesländer' },
    summary: {
      de: 'Schule, Polizei und Ladenöffnungszeiten sind Ländersache – deshalb ist vieles je nach Wohnort anders.',
      en: 'Schools, police and shop opening hours are state matters, which is why so much depends on where you live.',
    },
    body: {
      en: [
        'Germany is a Bundesstaat: power is deliberately split between the federal level and sixteen states. After 1945 this was designed so that no single centre could ever again control everything. It is one of the parts of the Grundgesetz that can never be removed.',
        'The Bund handles foreign policy, defence, currency and citizenship. The Länder handle education, police, culture and broadcasting. That is why school holidays, school systems and even the rules on public holidays differ when you cross a state border, and why your test has ten questions about your own Bundesland.',
        'The Länder are not just administrators, they legislate. Each has its own Landtag and Ministerpräsident. Through the Bundesrat they also shape federal law: bills that affect the states need the Bundesrat’s agreement, so a federal government cannot simply ignore them.',
      ],
      de: [
        'Deutschland ist ein Bundesstaat: Die Macht ist bewusst zwischen Bund und sechzehn Ländern geteilt. Nach 1945 sollte so nie wieder eine einzige Zentrale alles kontrollieren. Das ist ein Teil des Grundgesetzes, der nie abgeschafft werden kann.',
        'Der Bund macht Außenpolitik, Verteidigung, Währung und Staatsangehörigkeit. Die Länder machen Bildung, Polizei, Kultur und Rundfunk. Deshalb sind Schulferien, Schulsysteme und Feiertage je nach Bundesland anders – und deshalb hat dein Test zehn Fragen zu deinem Bundesland.',
        'Die Länder verwalten nicht nur, sie machen Gesetze. Jedes hat einen Landtag und eine Ministerpräsidentin oder einen Ministerpräsidenten. Über den Bundesrat gestalten sie auch Bundesgesetze mit.',
      ],
    },
    vocab: [
      { term: 'Bundesrat', gloss: { de: 'Vertretung der Länder', en: 'chamber of the states' } },
      { term: 'Landtag', gloss: { de: 'Parlament eines Landes', en: 'state parliament' } },
    ],
  },

  {
    key: 'courts',
    topic: 'law',
    icon: '⚖️',
    title: { de: 'Wenn du vor Gericht stehst', en: 'If you ever stand before a court' },
    summary: {
      de: 'Unschuldig bis zum Beweis des Gegenteils – und du musst gar nichts sagen.',
      en: 'Innocent until proven guilty, and you never have to say anything at all.',
    },
    body: {
      en: [
        'Courts in Germany are independent. Judges answer to the law, not to a minister or a party. This separation, Gewaltenteilung, means the people who write laws, the people who carry them out, and the people who judge them are deliberately different people.',
        'If you are accused of a crime, three things protect you. You are presumed innocent until a court says otherwise. You have the right to remain silent, and silence cannot be used against you. And you have the right to a lawyer, paid by the state if you cannot afford one in serious cases.',
        'Above all courts sits the Bundesverfassungsgericht in Karlsruhe. Any person can bring a Verfassungsbeschwerde there if they believe the state has violated their basic rights, after other courts have been tried. It has struck down laws passed by large parliamentary majorities. That is the point of it.',
      ],
      de: [
        'Gerichte in Deutschland sind unabhängig. Richterinnen und Richter sind nur dem Gesetz verpflichtet, nicht einer Ministerin oder Partei. Diese Gewaltenteilung bedeutet: Wer Gesetze macht, wer sie ausführt und wer über sie urteilt, sind bewusst verschiedene Menschen.',
        'Wenn du angeklagt wirst, schützen dich drei Dinge. Du giltst als unschuldig, bis ein Gericht etwas anderes feststellt. Du darfst schweigen, und dein Schweigen darf nicht gegen dich verwendet werden. Und du hast das Recht auf eine Anwältin oder einen Anwalt.',
        'Über allen Gerichten steht das Bundesverfassungsgericht in Karlsruhe. Jeder Mensch kann dort Verfassungsbeschwerde erheben, wenn er seine Grundrechte verletzt sieht. Es hat schon Gesetze aufgehoben, die große Mehrheiten beschlossen hatten. Genau dafür ist es da.',
      ],
    },
    vocab: [
      { term: 'Gewaltenteilung', gloss: { de: 'Trennung der Staatsgewalten', en: 'separation of powers' } },
      { term: 'Verfassungsbeschwerde', gloss: { de: 'Klage wegen Grundrechten', en: 'constitutional complaint' } },
    ],
  },

  {
    key: 'work',
    topic: 'work',
    icon: '💼',
    title: { de: 'Arbeiten in Deutschland', en: 'Working in Germany' },
    summary: {
      de: 'Kündigungsschutz, Betriebsrat und Urlaub sind keine Extras, sondern Gesetz.',
      en: 'Protection from dismissal, works councils and paid holiday are law, not perks.',
    },
    body: {
      en: [
        'A German employment contract comes with rights you do not have to negotiate. Full-time employees get at least 20 paid holiday days a year by law, and most contracts give more. There is a statutory minimum wage. Notice periods are set in law, and they apply to your employer as well as to you.',
        'In companies above a certain size, employees can elect a Betriebsrat, a works council. It has real legal powers: it must be consulted on working hours, dismissals and shift plans. It is elected by the workforce and is independent of the employer.',
        'Your Lohnsteuer is deducted before you are paid, along with contributions to health insurance, pension, unemployment and care insurance. That is why the Netto on your payslip is well below the Brutto. Most of that difference is not lost money: it is health cover, a pension record, and support if you lose your job.',
      ],
      de: [
        'Ein deutscher Arbeitsvertrag bringt Rechte mit, die du nicht aushandeln musst. Vollzeitbeschäftigte haben gesetzlich mindestens 20 bezahlte Urlaubstage, meist mehr. Es gibt einen Mindestlohn. Kündigungsfristen stehen im Gesetz und gelten auch für den Arbeitgeber.',
        'In größeren Betrieben können die Beschäftigten einen Betriebsrat wählen. Er hat echte Rechte: Bei Arbeitszeit, Kündigungen und Schichtplänen muss er beteiligt werden. Er wird von der Belegschaft gewählt und ist unabhängig.',
        'Die Lohnsteuer wird direkt abgezogen, dazu Beiträge für Kranken-, Renten-, Arbeitslosen- und Pflegeversicherung. Deshalb ist das Netto deutlich kleiner als das Brutto. Das meiste davon ist kein verlorenes Geld, sondern Absicherung.',
      ],
    },
    vocab: [
      { term: 'Betriebsrat', gloss: { de: 'gewählte Vertretung im Betrieb', en: 'elected works council' } },
      { term: 'Brutto / Netto', gloss: { de: 'vor / nach Abzügen', en: 'before / after deductions' } },
    ],
  },

  {
    key: 'social',
    topic: 'work',
    icon: '🏥',
    title: { de: 'Das soziale Netz', en: 'The social safety net' },
    summary: {
      de: 'Krankenversicherung ist Pflicht – und genau das macht sie bezahlbar.',
      en: 'Health insurance is compulsory, and that is exactly what makes it affordable.',
    },
    body: {
      en: [
        'Germany calls itself a Sozialstaat in the Grundgesetz. In practice that means five compulsory insurances: health, long-term care, pension, unemployment and accident. Employer and employee usually split the cost.',
        'Health insurance is mandatory for everyone living here. Most people are in the gesetzliche Krankenversicherung, where contributions depend on income rather than on health, and children and non-working spouses are often covered at no extra cost. You pick a Krankenkasse and get a card; you show that card at the doctor.',
        'If you lose your job, Arbeitslosengeld replaces part of your income for a period based on how long you paid in. The Jobcenter and Agentur für Arbeit also help with retraining and applications. Registering as unemployed promptly matters, because payments start from registration, not from when you stopped working.',
      ],
      de: [
        'Deutschland nennt sich im Grundgesetz Sozialstaat. Praktisch heißt das: fünf Pflichtversicherungen – Kranken-, Pflege-, Renten-, Arbeitslosen- und Unfallversicherung. Arbeitgeber und Beschäftigte teilen sich meist die Kosten.',
        'Eine Krankenversicherung ist für alle Pflicht, die hier leben. Die meisten sind gesetzlich versichert: Der Beitrag richtet sich nach dem Einkommen, nicht nach der Gesundheit. Kinder und nicht arbeitende Ehepartner sind oft beitragsfrei mitversichert.',
        'Wer die Arbeit verliert, bekommt Arbeitslosengeld – abhängig davon, wie lange eingezahlt wurde. Jobcenter und Agentur für Arbeit helfen auch bei Weiterbildung. Melde dich früh arbeitslos, denn die Zahlung beginnt mit der Meldung.',
      ],
    },
    vocab: [
      { term: 'Krankenkasse', gloss: { de: 'Träger der Krankenversicherung', en: 'health insurance fund' } },
      { term: 'Sozialstaat', gloss: { de: 'Staat mit sozialer Absicherung', en: 'welfare state' } },
    ],
  },

  {
    key: 'school',
    topic: 'society',
    icon: '🎓',
    title: { de: 'Schule und Ausbildung', en: 'School and apprenticeships' },
    summary: {
      de: 'Schulpflicht heißt: Kinder müssen wirklich zur Schule, nicht nur lernen.',
      en: 'Schulpflicht means children must actually attend school, not merely be educated.',
    },
    body: {
      en: [
        'School attendance is compulsory in Germany, not just education. Home schooling is generally not allowed. Schooling is free at state schools and is run by the Bundesländer, so the school types, the length of primary school and the holiday dates differ from state to state.',
        'After primary school children continue at different school types, and the route is not final: it is possible to move between them and to reach university entrance by several paths. Parents are expected to take part, through Elternabende and elected parent representatives.',
        'The other route is the duale Ausbildung: a paid apprenticeship where you work in a company three or four days a week and attend a Berufsschule on the others. It usually lasts two to three-and-a-half years and ends with a recognised qualification. It is a normal, respected path, not a fallback.',
      ],
      de: [
        'In Deutschland gilt Schulpflicht, nicht nur Bildungspflicht. Hausunterricht ist in der Regel nicht erlaubt. Staatliche Schulen sind kostenlos, und Schule ist Ländersache – Schulformen, Dauer der Grundschule und Ferien sind je nach Land verschieden.',
        'Nach der Grundschule gehen Kinder auf verschiedene Schulformen. Der Weg ist nicht endgültig: Man kann wechseln und die Hochschulreife auf mehreren Wegen erreichen. Eltern sollen mitmachen, über Elternabende und gewählte Elternvertretungen.',
        'Der andere Weg ist die duale Ausbildung: bezahlte Lehre im Betrieb an drei bis vier Tagen, Berufsschule an den anderen. Sie dauert meist zwei bis dreieinhalb Jahre und endet mit einem anerkannten Abschluss. Das ist ein normaler, angesehener Weg.',
      ],
    },
    vocab: [
      { term: 'Schulpflicht', gloss: { de: 'Pflicht, zur Schule zu gehen', en: 'compulsory school attendance' } },
      { term: 'duale Ausbildung', gloss: { de: 'Lehre im Betrieb und Berufsschule', en: 'dual apprenticeship' } },
    ],
  },

  {
    key: 'ns-zeit',
    topic: 'history',
    icon: '🕯️',
    title: { de: 'Warum Deutschland erinnert', en: 'Why Germany remembers' },
    summary: {
      de: 'Die NS-Zeit erklärt fast jede Grundentscheidung des heutigen Deutschlands.',
      en: 'The Nazi era explains almost every basic decision modern Germany has made.',
    },
    body: {
      en: [
        'From 1933 to 1945 Germany was a dictatorship under Adolf Hitler and the NSDAP. Parliament was neutralised, other parties were banned, the press was controlled, and opponents were imprisoned or killed. The Second World War, started by Germany, killed tens of millions of people.',
        'In the Holocaust, the German state murdered around six million Jews, and also Sinti and Roma, disabled people, political opponents, gay men and others. This was organised, bureaucratic and deliberate. Germany does not treat this as a closed chapter: denying it is a criminal offence, and remembrance is a public duty.',
        'Almost everything in the Grundgesetz is a reply to those years. Dignity first. Courts that can overrule parliament. A president with little power and a chancellor who can only be replaced by electing a successor. Parties that reject democracy can be banned. The word for this is wehrhafte Demokratie: a democracy able to defend itself.',
      ],
      de: [
        'Von 1933 bis 1945 war Deutschland eine Diktatur unter Adolf Hitler und der NSDAP. Das Parlament wurde entmachtet, andere Parteien verboten, die Presse gelenkt, Gegner eingesperrt oder ermordet. Der von Deutschland begonnene Zweite Weltkrieg kostete Millionen Menschen das Leben.',
        'Im Holocaust ermordete der deutsche Staat etwa sechs Millionen Jüdinnen und Juden, außerdem Sinti und Roma, Menschen mit Behinderung, politische Gegner, homosexuelle Männer und andere. Das war organisiert und gewollt. Die Leugnung ist strafbar, das Erinnern ist öffentliche Aufgabe.',
        'Fast alles im Grundgesetz ist eine Antwort auf diese Jahre: die Würde zuerst, Gerichte, die das Parlament korrigieren können, ein Bundespräsident mit wenig Macht, ein Kanzler, der nur durch die Wahl eines Nachfolgers abgelöst wird. Das nennt man wehrhafte Demokratie.',
      ],
    },
    vocab: [
      { term: 'wehrhafte Demokratie', gloss: { de: 'Demokratie, die sich verteidigen kann', en: 'democracy able to defend itself' } },
    ],
  },

  {
    key: 'ddr',
    topic: 'history',
    icon: '🧱',
    title: { de: 'Geteilt und wiedervereinigt', en: 'Divided, then reunited' },
    summary: {
      de: '40 Jahre zwei Staaten – und eine Mauer, die 1989 friedlich fiel.',
      en: 'Forty years as two states, and a wall that came down peacefully in 1989.',
    },
    body: {
      en: [
        'After 1949 there were two German states: the Bundesrepublik in the west and the DDR in the east, a one-party socialist state led by the SED. From 1961 the Berlin Wall and the inner-German border stopped people leaving. Hundreds died trying.',
        'In the DDR the Stasi ran mass surveillance, often using ordinary neighbours as informants. There were elections, but with no real choice. Travel to the west was mostly impossible for ordinary citizens.',
        'In autumn 1989 people in Leipzig and other cities marched week after week, chanting "Wir sind das Volk". The state did not shoot. On 9 November 1989 the Wall opened, and on 3 October 1990 the two states unified. That date is now the Tag der Deutschen Einheit, the national holiday. A peaceful revolution is a rare thing, and Germany marks it.',
      ],
      de: [
        'Nach 1949 gab es zwei deutsche Staaten: die Bundesrepublik im Westen und die DDR im Osten, ein sozialistischer Einparteienstaat unter der SED. Ab 1961 hielten die Berliner Mauer und die innerdeutsche Grenze die Menschen fest. Hunderte starben bei Fluchtversuchen.',
        'In der DDR überwachte die Stasi die Bevölkerung, oft mit Hilfe von Nachbarn als Spitzeln. Wahlen gab es, aber ohne echte Auswahl. Reisen in den Westen war für die meisten unmöglich.',
        'Im Herbst 1989 gingen Menschen in Leipzig und anderswo Woche für Woche auf die Straße: „Wir sind das Volk." Der Staat schoss nicht. Am 9. November 1989 öffnete sich die Mauer, am 3. Oktober 1990 vereinigten sich beide Staaten. Dieser Tag ist heute der Tag der Deutschen Einheit.',
      ],
    },
    vocab: [
      { term: 'Wiedervereinigung', gloss: { de: 'Vereinigung 1990', en: 'reunification in 1990' } },
      { term: 'Stasi', gloss: { de: 'Staatssicherheit der DDR', en: 'the DDR’s secret police' } },
    ],
  },

  {
    key: 'eu',
    topic: 'europe',
    icon: '🇪🇺',
    title: { de: 'Was die EU im Alltag bedeutet', en: 'What the EU means day to day' },
    summary: {
      de: 'Keine Grenzkontrolle, eine Währung, und du darfst überall arbeiten.',
      en: 'No border checks, one currency, and the right to work anywhere in it.',
    },
    body: {
      en: [
        'The European Union grew out of a project to make another European war impossible by tying economies together. Germany was a founding member of its earliest form and is today its most populous member state.',
        'For daily life the practical effects are large. Schengen means you can cross most internal borders without a check. The Euro means no exchanging money. Freedom of movement means an EU citizen can live and work in another member state without a work permit, and qualifications are often recognised across borders.',
        'The EU also makes law that applies in Germany, on consumer protection, data protection and product safety among others. You vote for the European Parliament in the Europawahl. Germany sits in the Council alongside the other governments, so decisions are made with it rather than to it.',
      ],
      de: [
        'Die Europäische Union entstand aus dem Ziel, einen neuen Krieg in Europa unmöglich zu machen, indem man die Wirtschaft verflicht. Deutschland war Gründungsmitglied der Vorläufer und ist heute das bevölkerungsreichste Mitglied.',
        'Im Alltag merkt man es deutlich. Schengen heißt: meist keine Grenzkontrolle. Der Euro heißt: kein Geldwechseln. Die Freizügigkeit heißt: EU-Bürgerinnen und -Bürger dürfen ohne Arbeitserlaubnis in einem anderen Mitgliedstaat leben und arbeiten.',
        'Die EU macht auch Recht, das in Deutschland gilt – etwa beim Verbraucherschutz und Datenschutz. Das Europäische Parlament wählst du bei der Europawahl. Deutschland sitzt im Rat mit den anderen Regierungen am Tisch.',
      ],
    },
  },

  {
    key: 'participation',
    topic: 'society',
    icon: '🤝',
    title: { de: 'Mitmachen, nicht nur zuschauen', en: 'Taking part, not just watching' },
    summary: {
      de: 'Vereine, Ehrenamt und Petitionen sind der normale Weg, etwas zu verändern.',
      en: 'Clubs, volunteering and petitions are the ordinary way things get changed here.',
    },
    body: {
      en: [
        'Germany runs on Vereine. There is a registered club for almost everything: sport, music, allotments, fire brigades, animal welfare. Joining one is the most common way newcomers meet people, and many are actively looking for members.',
        'Ehrenamt, unpaid voluntary work, carries real social weight. Volunteer fire brigades, sports coaching and refugee support are often run this way. It also looks good in a naturalisation file, but more importantly it is how neighbourhoods actually function.',
        'Beyond that, you can petition the Bundestag online, join a citizens’ initiative, attend an open council meeting in your Gemeinde, or demonstrate, which is a basic right that needs no permission, only notification. Even before you can vote in federal elections, none of these doors are closed to you.',
      ],
      de: [
        'Deutschland läuft über Vereine. Für fast alles gibt es einen: Sport, Musik, Schrebergarten, Feuerwehr, Tierschutz. Einem Verein beizutreten ist der häufigste Weg, Leute kennenzulernen – und viele suchen Mitglieder.',
        'Das Ehrenamt hat echtes Gewicht. Freiwillige Feuerwehren, Trainerinnen im Sport und Geflüchtetenhilfe funktionieren so. Es hilft auch bei der Einbürgerung, vor allem aber hält es Nachbarschaften zusammen.',
        'Außerdem kannst du beim Bundestag online Petitionen einreichen, in einer Bürgerinitiative mitmachen, in die öffentliche Sitzung deiner Gemeinde gehen oder demonstrieren. Das ist ein Grundrecht und braucht keine Erlaubnis, nur eine Anmeldung.',
      ],
    },
  },

  {
    key: 'religion',
    topic: 'society',
    icon: '⛪',
    title: { de: 'Glaube, Staat und Kirchensteuer', en: 'Faith, the state, and church tax' },
    summary: {
      de: 'Der Staat ist neutral – aber er zieht die Kirchensteuer ein.',
      en: 'The state is neutral, yet it collects church tax for you.',
    },
    body: {
      en: [
        'Article 4 of the Grundgesetz protects freedom of belief. You may follow a religion, change it, or have none, and the state may not favour one faith. There is no state church. Religious education in schools exists, but you can opt out or take an alternative subject.',
        'Germany is not strictly separated from religion in the French sense, though. Recognised religious communities can have their membership fees collected by the tax office as Kirchensteuer, typically eight or nine percent of your income tax. This only applies if you are registered as a member.',
        'This is worth knowing when you register your address: the Anmeldung form asks your religion. Naming a tax-collecting church there starts the Kirchensteuer. Leaving the church later is possible, through a formal Kirchenaustritt at a local office, usually for a small fee.',
      ],
      de: [
        'Artikel 4 des Grundgesetzes schützt die Glaubensfreiheit. Du darfst einer Religion angehören, sie wechseln oder keine haben, und der Staat darf keine Religion bevorzugen. Es gibt keine Staatskirche. Religionsunterricht gibt es, aber du kannst dich abmelden.',
        'Deutschland ist trotzdem nicht streng vom Glauben getrennt wie Frankreich. Anerkannte Religionsgemeinschaften können ihre Beiträge vom Finanzamt einziehen lassen – als Kirchensteuer, meist acht oder neun Prozent der Einkommensteuer. Das gilt nur für Mitglieder.',
        'Wichtig bei der Anmeldung: Das Formular fragt nach der Religion. Wer dort eine steuererhebende Kirche angibt, zahlt Kirchensteuer. Ein Austritt ist später möglich, über einen formellen Kirchenaustritt beim Amt.',
      ],
    },
    vocab: [{ term: 'Kirchensteuer', gloss: { de: 'Steuer für Kirchenmitglieder', en: 'church tax for members' } }],
  },

  {
    key: 'alltag',
    topic: 'society',
    icon: '📮',
    title: { de: 'Deutscher Alltagskram', en: 'Everyday German admin' },
    summary: {
      de: 'Rundfunkbeitrag, Mülltrennung, Ruhezeiten – die Regeln, über die niemand redet.',
      en: 'Broadcasting fee, sorting rubbish, quiet hours: the rules nobody tells you.',
    },
    body: {
      en: [
        'Every household pays the Rundfunkbeitrag, which funds public broadcasting. It is per home, not per person or per television, and it is due even if you own no TV. As of 2026 it is €18.36 a month, frozen at that level until at least 2027. Flatmates pay once between them, not each.',
        'Rubbish is sorted, and neighbours notice. Paper, packaging, glass by colour, organic waste and the rest each have their own bin. Bottles usually carry Pfand, a deposit you get back at a supermarket machine.',
        'Ruhezeiten are real. Nights, and all day Sunday, are quiet time in most places: no drilling, no loud music, no vacuuming in many buildings. Sunday is also when nearly all shops are closed, so Saturday shopping is a habit worth acquiring early.',
      ],
      de: [
        'Jeder Haushalt zahlt den Rundfunkbeitrag für den öffentlich-rechtlichen Rundfunk. Er gilt pro Wohnung, nicht pro Person oder Gerät – auch ohne Fernseher. Stand 2026 sind das 18,36 Euro im Monat, eingefroren bis mindestens 2027. In einer WG zahlt man gemeinsam, nicht jeder.',
        'Müll wird getrennt, und Nachbarn merken das. Papier, Verpackung, Glas nach Farben, Biomüll und Restmüll haben eigene Tonnen. Auf Flaschen ist meist Pfand, das du am Automaten zurückbekommst.',
        'Ruhezeiten gelten wirklich. Nachts und den ganzen Sonntag ist Ruhe: kein Bohren, keine laute Musik, in vielen Häusern kein Staubsaugen. Sonntags sind fast alle Läden zu – samstags einkaufen wird schnell zur Gewohnheit.',
      ],
    },
    vocab: [
      { term: 'Rundfunkbeitrag', gloss: { de: 'Beitrag pro Wohnung', en: 'fee per household' } },
      { term: 'Pfand', gloss: { de: 'Flaschenpfand', en: 'bottle deposit' } },
    ],
  },
];

export const DIVES_BY_KEY: Record<string, DeepDive> = Object.fromEntries(
  DEEP_DIVES.map((d) => [d.key, d]),
);
