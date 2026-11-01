# Notes for Claude

## Voice (ElevenLabs)

- **Use the creator's Professional Voice Clone for everything voiced from now on:
  `Rr3HT8xllxaRdjMZxGBa`.** It is the default in `video/scripts/voice-longform.mjs`
  and `video/scripts/voice-elevenlabs.mjs`.
- The 30 citizenship lessons were narrated with the earlier instant clone,
  `vFeVIow1bgkn4mgnqNwD`. That narration stays; `render-longform.mjs` falls back
  to it. Re-voice only when the creator asks.
- Delivery: Eleven v4, calm and entertaining, never shouty.
- Never spend credits without being asked; check the cost with `--dry` first.
- Clean narration lives only in the private repo
  `UtpalDasLabs/German-Citizenship-Videos`.

## Language

- Gender-neutral in every language; "they" for people in English.

## Shorts (never again: 1 Nov 2026)

- A question about a picture must show it. `npm run check:shorts` (in `video/`)
  checks rendered shorts, folders or Publer CSVs; the private repo's render
  workflow runs it and uploads nothing that fails. Press-photo questions
  (`imageCredit`) are never shorts: `render.mjs` skips them, plans leave them out.
- Before importing to Publer: `npm run check:plan` per account (TikTok has its
  own plan), check the live schedule, verify after. Checklist: "Before anything
  goes to Publer" in the private repo's `docs/SHORTS-POSTING.md`.
- The picture fix is on `main` (PR #22); the render workflows use `main`.
