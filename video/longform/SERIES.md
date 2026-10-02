# The series

One long-form lesson per topic in the app's "study by topic" cards, plus one
short lesson per federal state. Together they explain all 460 catalogue
questions, each exactly once. `npm run coverage` checks that.

Topics with more than about 25 questions are split into parts, so no lesson
runs much past 20 minutes.

| # | Lesson | Questions | Parts | Script |
|---|--------|-----------|-------|--------|
| 1 | Basic Rights (Grundrechte) | 23 | 1 | `basic-rights.md`: voiced, rendered |
| 2 | Europe & the World (Europa & Welt) | 23 | 1 | |
| 3 | Work & Welfare (Arbeit & Soziales) | 22 | 1 | |
| 4 | State & Institutions (Staat & Institutionen) | 26 | 1 | |
| 5 | Society & Daily Life (Gesellschaft & Alltag) | 38 | 2 | |
| 6 | Law & Justice (Recht & Justiz) | 41 | 2 | |
| 7 | Elections & Parties (Wahlen & Parteien) | 60 | 3 | |
| 8 | History (Geschichte) | 67 | 3 | |
| 9–24 | One per federal state | 10 each | 1 | |

That is 14 topic lessons and 16 state lessons.

## Making one lesson

1. **Write** `longform/<topic>.md` (format at the top of `basic-rights.md`).
   List every question in the front matter, give each a `{Q<id>}` anchor on a
   `question` scene, and check every claim against the catalogue answer and
   its source (cited in a comment at the end).
2. `npm run coverage`: no question missing, none twice.
3. **Pictures**: list them in `longform/<topic>.images.json`, then
   `npm run images -- <topic>`.
4. `npm run render:longform -- <topic> --silent --stills`: one still per shot,
   before paying for the voice.
5. `npm run voice:longform -- <topic> --dry` for the cost, then without `--dry`.
6. `npm run render:longform -- <topic>`: the video and its YouTube
   description (chapters, questions, AI-voice disclosure, picture credits).

## Voice budget

The narration costs about 600 characters per question explained: around
14,000 for a 23-question lesson, around 250,000 for the whole series.
ElevenLabs Starter includes 30,000 credits a month (about two lessons);
Creator includes 121,000 (about eight). Multilingual v2 costs one credit per
character. Re-voicing after an edit costs only the paragraphs that changed.

## Every upload

- Title from the script's front matter; description from the render.
- The AI-voice disclosure stays in the outro, the end card and the description.
- Nothing implying official status: no federal eagle, no BAMF branding, the
  "not affiliated" line stays in the description.
