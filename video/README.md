# Video shorts

Vertical (9:16) teaching shorts for YouTube Shorts, TikTok and Reels, one per
catalogue question, rendered from the app's own data with
[Remotion](https://www.remotion.dev/).

Nothing here is written by hand per video. Each short is generated from:

- `../src/data/questions.json` — the official German question and options, the English translation and the answer
- `../src/data/keyTerms.json` — the words to remember, and which questions are "does NOT fit" traps
- `src/content/shortWhy.json` — a one-line explanation (falls back to the first sentence of the app's longer one)
- `../src/theme/tokens.ts` — the app's colours, imported rather than copied
- `../assets/` — the question photos and app icon, served directly

So a correction to the catalogue reaches the app and the videos together.

## Commands

Run these from `video/`.

```sh
npm install

npm run render:prototype           # the three prototype shorts (#147, #32, #226)
node scripts/render.mjs 147 12     # any questions
node scripts/render.mjs all        # the whole catalogue
node scripts/render.mjs 147 --stills   # one PNG per beat, to review a layout
node scripts/render.mjs 147 --safe     # shade what the platforms' UI covers

npm run narration -- 147           # write the voice script for one question
npm run narration -- all           # every question, plus character totals

npm run voice -- 147               # narrate with ElevenLabs, one file per beat
npm run voice -- 147 --segments    # German and English voiced separately, then joined
npm run voice -- 147 --only hook   # one beat, as a cheap check

npm run studio                     # preview and scrub in the browser
npm run typecheck
```

Output goes to `out/` (git-ignored).

## How a short is put together

`src/lib/script.mjs` turns one question into an ordered list of **beats** —
hook, question, its English meaning, a warning for trap questions, the four
options, a countdown, the reveal, why, words to remember, end card — each with
what is shown and what the narrator says. It is the single source of truth:
the video template lays out its timeline from it, and the narration builder
writes the voice script from it, so picture and sound cannot drift apart.

Narration is English. Every span of German is tagged `de`, and the narration
builder wraps those in SSML `<lang xml:lang="de-DE">`, so one multilingual voice
reads the German with native pronunciation and the explanation in English.
German inside a hand-written English line is marked `[[like this]]`.

Each beat in the SSML opens with a `<mark>`. Voice services that report mark
timings return where every beat starts in the audio; those durations go into
the composition as `beatSeconds`, and the picture stretches to fit the voice.

## Narration with ElevenLabs

`scripts/voice-elevenlabs.mjs` reads the key from `ELEVENLABS_API_KEY` and the
voice from `ELEVENLABS_VOICE_ID` (default: Rowan). Audio is cached per beat, so
a rerun spends no credits. It writes `timing.json` with each beat's spoken
length, which is what the video is stretched to fit.

Library voices such as Rowan can only be used through the API on a paid plan;
on the free plan the API answers 402 and nothing is charged. Default voices
work on the free plan.

`npm run voice` sets `NODE_USE_ENV_PROXY=1`: Node's built-in `fetch` otherwise
ignores `HTTPS_PROXY`, and in a sandbox that only lets traffic out through its
proxy the request is refused.

## Design rules

- **Nothing reflows.** Every element has its space from the first frame and
  only fades or tints, which is most of what makes motion graphics look
  deliberate.
- **Safe area.** Text stays clear of the top 210 px and bottom 380 px, which
  TikTok, Reels and Shorts cover with their own interface (`SAFE` in
  `src/lib/brand.ts`; check with `--safe`).
- **One accent colour** (the flag's gold) for every video. Topic colours made a
  law question glow red, and in a quiz red reads as "wrong".
- **Not official.** No federal eagle or state emblem as branding, nothing that
  suggests the videos come from BAMF.
- **Fonts are bundled** (Inter, from npm), so renders never depend on the
  network and are identical on every machine. A render stops if the font fails
  to load rather than falling back silently.

## Before scaling to all 460

`npm run narration -- all` reports how many questions still use the fallback
explanation. Those have no German marked, so any German in them would be read
with an English accent. Each needs a short line in `src/content/shortWhy.json`.
