# Leben in Deutschland — German Citizenship Test

A flashcard app for the official German citizenship test (*Einbürgerungstest* /
*Leben in Deutschland*). One codebase, three targets: **iOS**, **Android** and a
**static web app** that deploys to GitHub Pages.

All **460 official questions** are included — the 300 general questions plus 10
questions for each of the 16 Bundesländer — each with the German original, an
English translation, a plain-English explanation, and a visual.

## Features

- **Swipe to study** — Tinder-style cards. Swipe right if you knew it, left to
  see it again. Buttons do the same thing, so keyboard and screen-reader users
  are never locked out.
- **Understand, don't just memorise** — every one of the 460 questions carries an
  "In real life" note explaining what it means for someone living here, plus 14
  longer explainers on the things newcomers actually trip over: Anmeldung,
  church tax, quiet hours, the two-vote ballot, what a Betriebsrat does.
- **A plan, not just a pile of cards** — tell it when your test is and it works
  out how many cards a day you need, or shows you the projected ready date for
  each pace. Includes the official BAMF links for booking the real thing.
- **Built to be motivating** — XP, daily goals, a streak, a winding topic path,
  and Adler the eagle reacting to how you are doing.
- **Progress that survives** — installable as an app, asks the browser for
  durable storage, and can export/import a backup file. It also tells you in
  plain words what would lose your progress.
- **A visual on every card** — the official exam photographs where they exist,
  27 hand-drawn SVG scenes elsewhere.
- **German, English or both**, light and dark, works offline.

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

## Installing it as an app

There is no app store build and none is needed: the web app installs to a home
screen and then behaves like a native app, offline included.

- **iOS (Safari):** Share → Add to Home Screen
- **Android (Chrome):** menu → Add to Home screen / Install app
- **Desktop (Chrome, Edge):** the install icon in the address bar

The app detects which of these applies and shows the right steps, during the
first-run intro and again under **You → Where your progress lives**. On Chromium
it skips the instructions and offers a one-tap install button instead.

## Run on iOS / Android

```bash
npm install
npm run ios          # requires macOS + Xcode
npm run android      # requires Android Studio
```

`npm start` opens the Expo dev server, so you can also scan the QR code with the
Expo Go app to run it on a physical device without any native build.

## GitHub Pages

**One-time setup:** go to **Settings → Pages** and set **Source** to **GitHub
Actions**. The workflow cannot do this for you — the `GITHUB_TOKEN` it runs with
is not permitted to create a Pages site — so the first deploy fails with
`Get Pages site failed` until this is done.

Note that Pages on a **private** repository requires GitHub Pro, Team or
Enterprise. On a free plan the repository has to be public for Pages to be
available at all.

After that, every push to `main` (or the feature branch listed in the workflow)
runs `Deploy web app to GitHub Pages`, which type-checks, builds the static
export and publishes it.

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

## Corrections to the source data

The upstream catalogue is community-maintained and its explanation text is
AI-generated, so it is not error-free. Known corrections live in
`scripts/corrections.mjs`, each with its reasoning, and the build **fails** if a
correction no longer matches the source — so a fixed upstream cannot silently
re-break, and an upstream rewrite cannot silently bypass a fix.

Currently corrected:

- **Question 184** (legal basis for the founding of Israel). Upstream marked
  "a proposal by the German federal government" as correct. Israel was founded in
  May 1948 on the basis of **UN General Assembly Resolution 181** (1947); the
  Federal Republic did not exist until May 1949. The generated explanation had
  been written to justify the wrong answer, so it was replaced too.

If you spot another, add it there rather than editing the generated data.

## Question data and licensing

The questions come from the official BAMF *Leben in Deutschland* catalogue, via
the MIT-licensed [`@cemusta/burgertest`](https://www.npmjs.com/package/@cemusta/burgertest)
package. See [`data-source/SOURCE.md`](data-source/SOURCE.md) for details.

This app is a study aid. It is not affiliated with, endorsed by, or operated by
BAMF or any other government body.
