# Videos

Two formats, both rendered with [Remotion](https://www.remotion.dev/):

- **Long-form lessons** (16:9), one per topic, written as scripts in
  `longform/` and narrated with the creator's cloned voice. See
  [Long-form lessons](#long-form-lessons).
- **Shorts** (9:16) for YouTube Shorts, TikTok and Reels, one per catalogue
  question, generated from the app's own data. The rest of this file up to
  "Pictures" is about these.

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

## Long-form lessons

```sh
npm run images -- basic-rights                          # the archival pictures
npm run voice:longform -- basic-rights --chapters 0-1 --dry   # cost, in characters
npm run voice:longform -- basic-rights --chapters 0-1   # narrate (cached per paragraph)
npm run render:longform -- basic-rights --chapters 0-1 --stills   # one PNG per shot
npm run render:longform -- basic-rights --chapters 0-1  # out/lesson-basic-rights-ch0-1.mp4
npm run render:longform -- basic-rights --silent        # whole cut, no voice, as an animatic
npm run render:longform -- basic-rights --describe      # just the YouTube description
npm run coverage                                        # is every question explained, once?
```

The series plan and the steps for each new lesson are in
[`longform/SERIES.md`](longform/SERIES.md).

The script format is described at the top of `longform/basic-rights.md`. In
short: `## Chapter`, `> SCENE (key): what is on screen`, `{Q6}` before the shot
that answers question 6, `[[Deutsch]]` for German, `[curious]` for delivery.

- **One paragraph = one voice request.** The voice comes back with the time
  of every character (`/with-timestamps`), so German phrases appear on screen
  as they are said, typed quotes keep pace with the voice, and the right
  answer lights up on the word that names it. Nothing is timed by hand.
- **Editing is cheap.** Audio is cached by voice, model and exact paragraph
  text, so changing one sentence re-voices one paragraph.
- **Most scenes are written, not coded.** `term`, `list`, `stat`, `fact`,
  `quote`, `photo`, `words` and `question` read the `> a | b @ cue` lines
  under their scene in the script (`src/longform/generic.tsx`). One-off
  scenes, like the 1949 map, are code in `src/longform/shots.tsx`. A scene
  without a key renders as a storyboard card with the director's note.
- **Question cards** show the catalogue wording, mark `nicht`/`kein` in red,
  dim wrong answers as the narrator rules them out and light the right one
  on the word that names it.
- **Voice:** the creator's clone on Multilingual v2 with high similarity,
  picked by ear in an A/B test because it sounds most like the creator
  (`scripts/voice-longform.mjs`). v2 does not take `[direction]` tags, so
  they are stripped before sending; `[pause]` still adds a gap. Bump
  `CLONE_VERSION` whenever the clone is retrained, since its ID stays the same.
- **Every video discloses the AI voice** in its outro and description.
- The 1949 map is drawn from [@svg-maps/germany](https://www.npmjs.com/package/@svg-maps/germany)
  (MapSVG, CC BY 4.0): credit it in the description alongside `credits.txt`.

## Pictures

Long-form videos use real archival photos for history (an AI picture of Bonn
in 1949 would be invented history) and motion graphics for everything else.
Each video lists its pictures in `longform/<topic>.images.json`:

```sh
npm run images -- basic-rights            # download + write credits.txt
npm run images -- basic-rights --thumbs   # 500px previews for choosing
```

The script only accepts licences that allow use on a monetised channel and
editing: public domain, CC0, CC BY and CC BY-SA. Anything NC, ND, "fair use" or
unknown fails the run. It writes each file's licence, author and source back
into the manifest, so the committed manifest records what we used and why we
were allowed to. `out/images/<topic>/credits.txt` is pasted into the video
description; CC BY / BY-SA require it.

- Wikimedia blocks original files from shared cloud addresses, so the script
  fetches its standard thumbnail sizes (up to 3840px) from
  `thumb.wikimedia.org`. The environment's network allowlist needs
  `commons.wikimedia.org` and `thumb.wikimedia.org`.
- Requests are slow on purpose (one every 4s, backing off on 429).
- Bundesarchiv files on Commons are only 800px wide: too small to fill a
  1080p frame. Use them small (inset, framed) or not at all.
- Many 1949 photos are still under copyright: in Germany, an ordinary photo is
  protected for 50 years after publication, and a photo counted as a creative
  work until 70 years after the photographer's death. Trust the licence on the
  Commons file page, not the age of the photo.

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
