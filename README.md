# Leben in Deutschland — German Citizenship Test

A flashcard app for the official German citizenship test (*Einbürgerungstest* /
*Leben in Deutschland*). One codebase, three targets: **iOS**, **Android** and a
**static web app** that deploys to GitHub Pages.

All **460 official questions** are included — the 300 general questions plus 10
questions for each of the 16 Bundesländer — each with the German original, an
English translation, a plain-English explanation, and a visual.

## Features

- **Flashcards** — tap to flip, with a Leitner spaced-repetition schedule so
  shaky cards come back fast and mastered ones stretch out to three weeks.
- **A visual on every card** — the official exam photographs where the question
  has them (coats of arms, flags, ballot papers), hand-drawn SVG scenes for the
  concepts that recur, and a topic icon otherwise.
- **Practice quiz** — multiple choice with instant feedback and the reason the
  answer is right.
- **Mock exam** — the real format: 33 questions, 60 minutes, pass at 17.
- **Progress tracking** — per-topic mastery, day streaks and exam history.
- **German / English / both**, light and dark themes, offline-capable.

## Try the web app

Once GitHub Pages is enabled (see below), the app is served at:

```
https://<your-github-username>.github.io/German-Citizenship-App/
```

To run it locally:

```bash
npm install
npm run web          # dev server with fast refresh
```

Or build and serve the exact bundle that ships to Pages:

```bash
npm run build:web
npx http-server dist -p 8080
```

> The static build is generated with a base path of `/German-Citizenship-App`
> (set in `app.json` under `experiments.baseUrl`). If you fork this repo under a
> different name, change that value to match, or the CSS and JS will 404 on Pages.

## Run on iOS / Android

```bash
npm install
npm run ios          # requires macOS + Xcode
npm run android      # requires Android Studio
```

`npm start` opens the Expo dev server, so you can also scan the QR code with the
Expo Go app to run it on a physical device without any native build.

## Enabling GitHub Pages

1. Push to `main` (or the feature branch listed in the workflow).
2. In the repository, go to **Settings → Pages** and set **Source** to
   **GitHub Actions**.
3. The `Deploy web app to GitHub Pages` workflow builds the static export and
   publishes it. Subsequent pushes redeploy automatically.

## Project layout

```
app/                      expo-router routes
  (tabs)/                 home, topic decks, exam intro, progress + settings
  study.tsx               flashcard session
  practice.tsx            multiple-choice practice
  exam-session.tsx        timed 33-question mock exam
src/
  components/             UI primitives, flashcard, SVG illustration set
  data/                   generated question dataset (do not edit by hand)
  lib/                    question selectors, spaced repetition, stats, i18n
  store/                  settings + progress providers (AsyncStorage backed)
  theme/                  design tokens and the theme provider
scripts/
  fetch-source.mjs        re-downloads the upstream question catalogue
  build-data.mjs          builds src/data/ and assets/questions/
  topics.mjs              topic / illustration / icon classification rules
data-source/              vendored input data (see data-source/SOURCE.md)
```

## Regenerating the question data

`src/data/` and `assets/questions/` are generated. To rebuild them:

```bash
node scripts/fetch-source.mjs   # downloads the catalogue + original images
npm run data                    # classifies, optimises and writes the dataset
```

The build fails loudly if the catalogue is not exactly 300 general questions and
10 per Bundesland, so a bad upstream update cannot slip through silently.

## Question data and licensing

The questions come from the official BAMF *Leben in Deutschland* catalogue, via
the MIT-licensed [`@cemusta/burgertest`](https://www.npmjs.com/package/@cemusta/burgertest)
package. See [`data-source/SOURCE.md`](data-source/SOURCE.md) for details.

This app is a study aid. It is not affiliated with, endorsed by, or operated by
BAMF or any other government body.
