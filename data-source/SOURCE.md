# Question data source

The question catalogue in this folder is derived from the official
**"Leben in Deutschland" / Einbürgerungstest** question catalogue published by the
German Federal Office for Migration and Refugees (BAMF).

The machine-readable form (German text, English translations, educational context
notes and the official question images) comes from the npm package
[`@cemusta/burgertest`](https://www.npmjs.com/package/@cemusta/burgertest) v0.1.0,
which is published under the **MIT** license.

- `questions.raw.json` — 460 questions (300 general + 16 x 10 Bundesland questions)
- `images/` — original question images for the 43 picture-based questions

These files are the **input** to `scripts/build-data.mjs`, which normalises them,
fixes the Sachsen-Anhalt labelling, classifies each question into a topic, assigns
visuals, and writes the app-ready dataset to `src/data/` and `assets/questions/`.

Do not edit the generated output by hand — edit the script and re-run `npm run data`.
