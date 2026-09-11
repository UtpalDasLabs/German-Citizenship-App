import type { Language } from './types';

/**
 * UI copy. Question text always comes from the dataset; this only covers chrome.
 * `both` shows German and English question text, with an English interface.
 */
const strings = {
  en: {
    appName: 'Leben in Deutschland',
    tagline: 'Pass the German citizenship test',

    // tabs
    tabHome: 'Home',
    tabCards: 'Cards',
    tabPractice: 'Practice',
    tabExam: 'Exam',
    tabYou: 'You',

    // home
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    dueToday: 'Due today',
    cardsMastered: 'Mastered',
    dayStreak: 'day streak',
    continueStudying: 'Continue studying',
    startStudying: 'Start studying',
    quickPractice: 'Quick practice',
    quickPracticeSub: '10 questions, instant feedback',
    mockExam: 'Mock exam',
    mockExamSub: '33 questions · 60 minutes',
    flashcards: 'Flashcards',
    flashcardsSub: 'Flip, learn, repeat',
    byTopic: 'Study by topic',
    yourState: 'Your federal state',
    pickState: 'Pick your Bundesland',
    pickStateSub: 'Adds your 10 state questions to the deck',
    readyLabel: 'Exam readiness',

    // cards
    tapToFlip: 'Tap the card to see the answer',
    knewIt: 'I knew it',
    reviewAgain: 'Review again',
    noCardsDue: 'Nothing due right now',
    noCardsDueSub: 'You are up to date. Come back later, or study the full deck.',
    studyAll: 'Study the whole deck',
    sessionDone: 'Session complete',
    cardsReviewed: 'cards reviewed',
    keepGoing: 'Keep going',
    backHome: 'Back to home',
    answer: 'Answer',
    whyLabel: 'Why',

    // practice
    checkAnswer: 'Check answer',
    nextQuestion: 'Next question',
    correct: 'Correct',
    incorrect: 'Not quite',
    correctAnswerIs: 'The correct answer is',
    finish: 'Finish',
    score: 'Score',
    practiceDone: 'Practice complete',
    tryAgain: 'Try again',
    reviewMistakes: 'Review mistakes',

    // exam
    examIntro: 'Mock exam',
    examRules:
      'The real test is 33 questions in 60 minutes: 30 general questions and 3 about your federal state. You pass with 17 correct answers.',
    startExam: 'Start exam',
    question: 'Question',
    of: 'of',
    timeLeft: 'Time left',
    submitExam: 'Submit exam',
    submitConfirm: 'Submit your answers?',
    unanswered: 'unanswered',
    passed: 'Passed',
    failed: 'Not passed',
    youScored: 'You scored',
    passMark: 'Pass mark is 17 of 33',
    reviewAnswers: 'Review answers',
    retakeExam: 'Retake exam',
    timeUp: "Time's up",

    // you / settings
    yourProgress: 'Your progress',
    overall: 'Overall mastery',
    topicBreakdown: 'By topic',
    examHistory: 'Mock exam history',
    noExamsYet: 'No mock exams yet.',
    settings: 'Settings',
    language: 'Question language',
    langDe: 'German',
    langEn: 'English',
    langBoth: 'Both',
    appearance: 'Appearance',
    themeSystem: 'System',
    themeLight: 'Light',
    themeDark: 'Dark',
    haptics: 'Haptic feedback',
    resetProgress: 'Reset all progress',
    resetConfirm: 'This deletes your streak, card history and exam results. This cannot be undone.',
    cancel: 'Cancel',
    reset: 'Reset',
    about: 'About',
    aboutBody:
      'Questions come from the official BAMF "Leben in Deutschland" catalogue. This app is a study aid and is not affiliated with any government body.',


    // shared
    all: 'All',
    due: 'Due',
    tricky: 'Tricky',
    questions: 'questions',
    noQuestions: 'No questions match this filter.',
    generalQuestions: 'General questions',
    stateQuestions: 'State questions',
  },

  de: {
    appName: 'Leben in Deutschland',
    tagline: 'Bestehe den Einbürgerungstest',

    tabHome: 'Start',
    tabCards: 'Karten',
    tabPractice: 'Üben',
    tabExam: 'Test',
    tabYou: 'Du',

    goodMorning: 'Guten Morgen',
    goodAfternoon: 'Guten Tag',
    goodEvening: 'Guten Abend',
    dueToday: 'Heute fällig',
    cardsMastered: 'Gemeistert',
    dayStreak: 'Tage in Folge',
    continueStudying: 'Weiterlernen',
    startStudying: 'Lernen starten',
    quickPractice: 'Schnelles Üben',
    quickPracticeSub: '10 Fragen mit sofortiger Rückmeldung',
    mockExam: 'Probetest',
    mockExamSub: '33 Fragen · 60 Minuten',
    flashcards: 'Lernkarten',
    flashcardsSub: 'Umdrehen, lernen, wiederholen',
    byTopic: 'Nach Thema lernen',
    yourState: 'Dein Bundesland',
    pickState: 'Bundesland auswählen',
    pickStateSub: 'Fügt deine 10 Landesfragen hinzu',
    readyLabel: 'Testreife',

    tapToFlip: 'Tippe auf die Karte für die Antwort',
    knewIt: 'Gewusst',
    reviewAgain: 'Nochmal üben',
    noCardsDue: 'Gerade nichts fällig',
    noCardsDueSub: 'Du bist auf dem neuesten Stand. Komm später wieder oder lerne den ganzen Stapel.',
    studyAll: 'Ganzen Stapel lernen',
    sessionDone: 'Runde geschafft',
    cardsReviewed: 'Karten wiederholt',
    keepGoing: 'Weitermachen',
    backHome: 'Zurück zum Start',
    answer: 'Antwort',
    whyLabel: 'Warum',

    checkAnswer: 'Antwort prüfen',
    nextQuestion: 'Nächste Frage',
    correct: 'Richtig',
    incorrect: 'Leider falsch',
    correctAnswerIs: 'Richtig ist',
    finish: 'Beenden',
    score: 'Ergebnis',
    practiceDone: 'Übung beendet',
    tryAgain: 'Nochmal',
    reviewMistakes: 'Fehler ansehen',

    examIntro: 'Probetest',
    examRules:
      'Der echte Test hat 33 Fragen in 60 Minuten: 30 allgemeine Fragen und 3 zu deinem Bundesland. Bestanden ab 17 richtigen Antworten.',
    startExam: 'Test starten',
    question: 'Frage',
    of: 'von',
    timeLeft: 'Restzeit',
    submitExam: 'Test abgeben',
    submitConfirm: 'Antworten abgeben?',
    unanswered: 'ohne Antwort',
    passed: 'Bestanden',
    failed: 'Nicht bestanden',
    youScored: 'Dein Ergebnis',
    passMark: 'Bestanden ab 17 von 33',
    reviewAnswers: 'Antworten ansehen',
    retakeExam: 'Test wiederholen',
    timeUp: 'Zeit abgelaufen',

    yourProgress: 'Dein Fortschritt',
    overall: 'Gesamtfortschritt',
    topicBreakdown: 'Nach Thema',
    examHistory: 'Probetests',
    noExamsYet: 'Noch keine Probetests.',
    settings: 'Einstellungen',
    language: 'Sprache der Fragen',
    langDe: 'Deutsch',
    langEn: 'Englisch',
    langBoth: 'Beides',
    appearance: 'Darstellung',
    themeSystem: 'System',
    themeLight: 'Hell',
    themeDark: 'Dunkel',
    haptics: 'Vibration',
    resetProgress: 'Fortschritt zurücksetzen',
    resetConfirm: 'Das löscht deine Serie, den Kartenverlauf und die Testergebnisse. Das kann nicht rückgängig gemacht werden.',
    cancel: 'Abbrechen',
    reset: 'Zurücksetzen',
    about: 'Über die App',
    aboutBody:
      'Die Fragen stammen aus dem offiziellen BAMF-Katalog „Leben in Deutschland". Diese App ist eine Lernhilfe und steht in keiner Verbindung zu einer Behörde.',

    all: 'Alle',
    due: 'Fällig',
    tricky: 'Schwierig',
    questions: 'Fragen',
    noQuestions: 'Keine Fragen für diesen Filter.',
    generalQuestions: 'Allgemeine Fragen',
    stateQuestions: 'Landesfragen',
  },
} as const;

export type StringKey = keyof typeof strings.en;

/** `both` reads as an English interface with bilingual question text. */
export function uiLocale(language: Language): 'de' | 'en' {
  return language === 'de' ? 'de' : 'en';
}

export function translator(language: Language) {
  const table = strings[uiLocale(language)];
  return (key: StringKey) => table[key];
}
