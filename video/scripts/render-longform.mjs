#!/usr/bin/env node
/**
 * Renders a long-form lesson, 1920×1080, voiced.
 *
 *   npm run render:longform -- basic-rights                  the whole video
 *   npm run render:longform -- basic-rights --chapters 0-1   a cut of some chapters
 *   npm run render:longform -- basic-rights --stills         one PNG per shot, for review
 *   npm run render:longform -- basic-rights --silent         no voice: timed by word count
 *   npm run render:longform -- basic-rights --describe       only the YouTube description
 *
 * Every run also writes out/lesson-<topic>-description.txt: chapters with
 * their timestamps, the questions covered, the AI-voice disclosure and the
 * picture credits, ready to paste into YouTube.
 *
 * Needs `npm run images -- <topic>` and `npm run voice:longform -- <topic>`
 * first. Every frame number is worked out here, from the voice's own
 * timestamps, and handed to the composition as one plan.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { ffbin } from './ffbin.mjs';

import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

import { parseLongform, pickChapters } from './longform.mjs';
import { audioDir, MODEL, paraHash, PROFILE, settingsFor, spokenText, voiceFor } from './voice-longform.mjs';

const VIDEO = join(import.meta.dirname, '..');
const ROOT = join(VIDEO, '..');
const OUT = join(VIDEO, 'out');
const FPS = 30;

/** Seconds of air around the voice. */
const args0 = process.argv.slice(2);
/**
 * --lively: music, sound effects, punch words and a much tighter edit. The
 * calm timings leave air for reading; the lively ones keep the voice moving,
 * the way fast explainer channels cut.
 */
const LIVELY = args0.includes('--lively');
const T = LIVELY
  ? { lead: 0.12, between: 0.22, pause: 0.35, tail: 0.3, read: 0.5, silentShot: 2.4 }
  : { lead: 0.35, between: 0.45, pause: 0.6, tail: 0.7, read: 1.4, silentShot: 4 };
const LEAD = T.lead; //         before a shot's first paragraph
const BETWEEN = T.between; //   between paragraphs
const PAUSE = T.pause; //       extra, before a paragraph tagged [pause]
const TAIL = T.tail; //         after a shot's last paragraph
const READ = T.read; //         extra after a question, to read the card
const SILENT_SHOT = T.silentShot; // a shot with no narration (title cards)
const WORDS_PER_SECOND = 2.6; // --silent only

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const spec = args.includes('--chapters') ? args[args.indexOf('--chapters') + 1] : undefined;
const topic = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--chapters');
if (!topic) {
  console.error('usage: npm run render:longform -- <topic> [--chapters 0-1] [--lively] [--expressive] [--stills] [--silent]');
  process.exit(1);
}
const silent = flags.has('--silent');

const script = parseLongform(topic);
// Time everything against the words actually sent to the voice (no direction
// tags, for models that do not take them).
for (const c of script.chapters) for (const sh of c.shots) for (const p of sh.paras) p.tts = spokenText(p.tts);
const chapters = pickChapters(spec, script.chapters.length);
const VOICE = voiceFor(script.meta);
const voiceDir = audioDir(topic, VOICE, settingsFor(script.meta));
/** A series video (Logic to Live By, Hidden Deutschland), or null for a lesson. */
const SERIES_KEY = script.meta.series ?? null;
/** --short: a vertical short; its pictures and clips are the long video's (`media:`). */
const SHORT = process.argv.includes('--short');
const MEDIA = script.meta.media ?? topic;

const readJsonTop = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null);
// No stock clip twice: not twice in this video, and not one already used by
// another episode. A short (`media:` set) reuses its long video's clips.
// Override for a deliberate callback with --allow-repeat.
if (!script.meta.media && !args.includes('--allow-repeat')) {
  const dir = join(VIDEO, 'longform');
  const key = (c) => (c.source === 'pixabay' ? `pixabay:${c.pixabayId}` : c.source === 'vecteezy' ? `vecteezy:${c.vecteezyId}` : c.file ? `file:${c.file}` : null);
  const mine = readJsonTop(join(dir, `${topic}.clips.json`))?.clips ?? [];
  const seen = new Map();
  for (const c of mine) {
    const k = key(c);
    if (!k) continue;
    if (seen.has(k)) throw new Error(`${topic}: clip ${k} is used twice (${seen.get(k)} and ${c.id}). Pick another clip.`);
    seen.set(k, c.id);
  }
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.clips.json') && f !== `${topic}.clips.json` && !f.includes('-pilot'))) {
    for (const c of readJsonTop(join(dir, f))?.clips ?? []) {
      const k = key(c);
      if (k && seen.has(k)) throw new Error(`${topic}: clip ${k} (${seen.get(k)}) is already used in ${f.replace('.clips.json', '')}. Pick another clip.`);
    }
  }
}
const SERIES = SERIES_KEY ? JSON.parse(readFileSync(join(VIDEO, 'longform', 'series.json'), 'utf8'))[SERIES_KEY] : null;
if (SERIES_KEY && !SERIES) throw new Error(`Unknown series "${SERIES_KEY}" (longform/series.json)`);
// Music and effects from ElevenLabs (npm run sound:elevenlabs) when they have
// been made, else the synthesised ones (npm run sound).
const EL_SOUND = join(OUT, 'sound-elevenlabs');
const elSound = existsSync(join(EL_SOUND, 'sounds.json'))
  ? JSON.parse(readFileSync(join(EL_SOUND, 'sounds.json'), 'utf8'))
  : null;
/** The music bed, and how loud it sits under the voice and in the gaps. */
const seriesBed = SERIES_KEY ? elSound?.series?.[SERIES_KEY] : null;
const MUSIC = seriesBed
  ? // The series' own calmer bed, about 20 dB under the voice like the
    // reference videos, rising a little in the gaps.
    { src: `sound/${seriesBed.music}`, seconds: seriesBed.musicSeconds, under: 0.1, gap: 0.32 }
  : elSound
    ? { src: `sound/${elSound.music}`, seconds: elSound.musicSeconds, under: 0.16, gap: 0.4 }
    : { src: 'sound/music.wav', seconds: null, under: 0.07, gap: 0.2 };
const frames = (s) => Math.round(s * FPS);

/** Timing for one paragraph: from the voice, or estimated from its length. */
function timing(p) {
  if (silent) {
    const seconds = p.plain.split(/\s+/).length / WORDS_PER_SECOND;
    return {
      seconds,
      starts: [...p.tts].map((_, i) => (i / p.tts.length) * seconds),
      src: null,
    };
  }
  const file = join(voiceDir, `${paraHash(p.tts)}.json`);
  if (!existsSync(file)) {
    throw new Error(
      `Not voiced yet: "${p.tts.slice(0, 60)}…" — run npm run voice:longform -- ${topic}${spec ? ` --chapters ${spec}` : ''}`,
    );
  }
  const t = JSON.parse(readFileSync(file, 'utf8'));
  return {
    seconds: t.seconds,
    starts: t.starts,
    src: `audio/${paraHash(p.tts)}.mp3`,
  };
}

/** Punch words as ranges of the text the voice was sent. */
function punchRanges(p) {
  let from = 0;
  return p.punch.map((text) => {
    const start = p.tts.indexOf(text, from);
    if (start === -1) throw new Error(`Punch "${text}" not found in "${p.tts}"`);
    from = start + text.length;
    return { text, start, end: start + text.length };
  });
}

/** German spans as ranges of the text the voice was sent. */
function deRanges(p) {
  let from = 0;
  return p.de.map((d) => {
    const start = p.tts.indexOf(d.text, from);
    if (start === -1) throw new Error(`German "${d.text}" not found in "${p.tts}"`);
    from = start + d.text.length;
    return { text: d.text, start, end: start + d.text.length };
  });
}

const shots = [];
let cursor = 0;
for (const c of chapters) {
  const chapter = script.chapters[c];
  chapter.shots.forEach((s, i) => {
    let t = s.paras.length ? frames(LEAD) : 0;
    const paras = s.paras.map((p, j) => {
      if (j > 0) t += frames(BETWEEN);
      if (p.tags.includes('pause')) t += frames(PAUSE);
      // [countdown]: three silent seconds to guess before the answer.
      const countdown = p.tags.includes('countdown');
      if (countdown) t += frames(3);
      const { seconds, starts, src } = timing(p);
      const para = {
        from: t,
        frames: frames(seconds),
        src,
        tts: p.tts,
        starts,
        de: deRanges(p),
        punch: punchRanges(p),
        countdown,
      };
      t += para.frames;
      return para;
    });
    // `> hold 2.5` under a scene: seconds of picture after the voice, for an
    // animation that makes its point without words.
    const hold = Number(s.screen.find((l) => /^hold [\d.]+$/.test(l))?.slice(5) ?? 0);
    const length = paras.length ? t + frames(TAIL + hold + (s.key === 'question' ? READ : 0)) : frames(SILENT_SHOT);
    shots.push({
      key: s.key,
      scene: s.scene,
      chapter: c,
      chapterTitle: chapter.title,
      opensChapter: i === 0 && c > 0,
      questions: s.questions,
      screen: s.screen,
      from: cursor,
      frames: length,
      paras: silent ? paras.map((p) => ({ ...p, src: null })) : paras,
    });
    cursor += length;
  });
}
const plan = {
  topic: MEDIA,
  title: script.meta.title,
  questions: script.meta.questions,
  fps: FPS,
  total: cursor,
  shots,
  lively: LIVELY,
  music: LIVELY && !args0.includes('--no-music') ? MUSIC : null,
  series: SERIES_KEY,
  // Video clips fetched by npm run clips -- <topic> (id → seconds).
  clips: existsSync(join(OUT, 'clips', MEDIA, 'clips.json')) ? JSON.parse(readFileSync(join(OUT, 'clips', MEDIA, 'clips.json'), 'utf8')) : {},
  short: SHORT ? { hook: script.meta.hook ?? script.meta.title, parent: script.meta.parent ?? '' } : null,
};
if (silent) for (const s of plan.shots) s.paras = s.paras.map((p) => ({ ...p, src: null }));

const APP_URL = 'https://utpaldaslabs.github.io/German-Citizenship-App/';
const stamp = (frame) => {
  const t = Math.floor(frame / FPS);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const sec = String(t % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};
/** Picture and clip ids the cut actually shows (a clip hides the photo with the same id). */
function shownMedia() {
  const ids = new Set();
  for (const sh of shots) {
    if (!['photo', 'line', 'place', 'list', 'stat'].includes(sh.key)) continue;
    for (const l of sh.screen) {
      const f = l.split(' @ ')[0].split(/ ?\| ?/).map((x) => x.trim());
      ids.add(f[0] === 'bg' ? f[1] : f[0]);
    }
  }
  const clipIds = new Set(Object.keys(plan.clips ?? {}));
  const readJson = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : null);
  const images = (readJson(join(VIDEO, 'longform', `${topic}.images.json`))?.images ?? []).filter(
    (im) => ids.has(im.id) && !clipIds.has(im.id),
  );
  const clips = (readJson(join(VIDEO, 'longform', `${topic}.clips.json`))?.clips ?? []).filter((c) => ids.has(c.id));
  return { images, clips };
}

const CREDITS_URL = `https://github.com/UtpalDasLabs/German-Citizenship-App/blob/claude/series-logic-hidden/video/credits/${topic}.md`;

/**
 * Credits for a series video: short lines for the description (YouTube
 * allows 5,000 characters), and a full page with every link, kept in this
 * public repository at video/credits/<topic>.md and linked from the
 * description. CC BY / BY-SA allow attribution through such a page.
 */
function seriesCredits() {
  const { images, clips } = shownMedia();
  const plain = (f) => f.replace(/\.[a-z0-9]+$/i, '');
  const pixabay = clips.filter((c) => c.source === 'pixabay');
  const users = [...new Set(pixabay.map((c) => (c.credit ?? '').match(/^Video by (.+?) from Pixabay/)?.[1]).filter(Boolean))];
  const made = [...new Set(clips.filter((c) => /made with|Kling|Veo/i.test(c.credit ?? '')).map((c) => (/Veo/i.test(c.credit) ? 'Google Veo' : 'Kling AI')))];
  const ccClips = clips.filter((c) => c.source === 'file' && /CC BY/.test(c.credit ?? ''));
  const short = [
    'Pictures and video',
    ...images.map((im) => `• ${plain(im.file)}: ${im.author.replace(/\s*\(talk\).*$/, '')}, ${im.licence}`),
    ...ccClips.map((c) => `• ${c.credit.split(': http')[0]}`),
    ...(users.length ? [`• Stock video from Pixabay (Content License): ${users.join(', ')}`] : []),
    ...(clips.some((c) => c.source === 'vecteezy') ? ['• Stock video from Vecteezy (www.vecteezy.com); each clip is listed below'] : []),
    ...(made.length ? [`• Some scenes made with ${made.join(' and ')}`] : []),
    `Full credits with links: ${CREDITS_URL}`,
  ];
  const full = [
    `# Credits: ${script.meta.title}`,
    '',
    ...(images.length ? ['## Pictures (Wikimedia Commons)', '', ...images.map((im) => `- [${plain(im.file)}](${im.source}): ${im.author.replace(/\s*\(talk\).*$/, '')}, ${im.licence}${im.licenceUrl ? ` ([licence](${im.licenceUrl}))` : ''}`), ''] : []),
    ...(clips.length ? ['## Video', '', ...clips.filter((c) => c.credit).map((c) => `- ${c.credit}`), ''] : []),
    '## Voice and music',
    '',
    "- Narrated by Utpal, using a voice model trained on his own recordings (ElevenLabs).",
    '- Music: made with ElevenLabs.',
    '',
  ];
  mkdirSync(join(VIDEO, 'credits'), { recursive: true });
  writeFileSync(join(VIDEO, 'credits', `${topic}.md`), full.join('\n'));
  return short;
}

/** The YouTube description of a series video: no exam questions, its sources instead. */
function describeSeries(chapterLines) {
  const sources = script.meta.sources ?? [];
  const text = [
    script.meta.title,
    '',
    ...(script.meta.summary ? [script.meta.summary, ''] : []),
    'Chapters',
    ...chapterLines,
    '',
    `${SERIES.name}: ${SERIES.tagline}. A series from Living in Deutschland.`,
    SERIES.credit,
    ...(sources.length ? ['', 'Sources', ...sources.map((u) => `• ${u}`)] : []),
    '',
    'Narrated by Utpal, using a voice model trained on his own recordings.',
    '',
    'Free apps from this channel, no account needed:',
    '• German citizenship test (all 460 questions): https://lid.utpaldas.com',
    '• German driving theory test: https://fuehrerschein.utpaldas.com',
    '',
    ...seriesCredits(),
    ...(LIVELY ? [elSound ? 'Music: made with ElevenLabs.' : 'Music: made for this channel.'] : []),
    '',
  ].join('\n').replace(/[<>]/g, '');
  // YouTube refuses descriptions over 5,000 characters (and any < or >).
  if (text.length > 5000) console.warn(`  description: ${text.length} characters, over YouTube's 5,000 — shorten it`);
  else console.log(`  description: ${text.length} characters`);
  return text;
}

function describe() {
  const chapterLines = [];
  for (const sh of shots) {
    if (sh.opensChapter || sh === shots[0]) {
      chapterLines.push(`${stamp(sh.from)} ${sh === shots[0] ? 'Intro' : sh.chapterTitle}`);
    }
  }
  const credits = join(OUT, 'images', topic, 'credits.txt');
  if (SERIES) return describeSeries(chapterLines);
  const usesMap = shots.some((sh) => sh.key === 'map1949' || sh.key === 'reunify');
  const asked = shots.flatMap((sh) => sh.questions);
  return [
    script.meta.title,
    '',
    `${asked.length} questions from the German citizenship test (Leben in Deutschland / Einbürgerungstest), explained in English, with the exact German you will see on the day.`,
    '',
    `Practise all 460 questions, free, no account: ${APP_URL}`,
    '',
    'Chapters',
    ...chapterLines,
    '',
    `Questions in this video (catalogue numbers): ${asked.map((id) => `#${id}`).join(', ')}`,
    '',
    "Narrated with an AI version of the creator's own voice (ElevenLabs). Every fact was checked against the official question catalogue and its legal sources. This channel is independent and not affiliated with the BAMF or any government body.",
    '',
    ...(existsSync(credits) ? [readFileSync(credits, 'utf8').trim()] : []),
    ...(usesMap
      ? [
          '• Map of Germany: @svg-maps/germany, based on MapSVG (mapsvg.com), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)',
        ]
      : []),
    ...(LIVELY ? ['', elSound ? 'Music and sound effects: made with ElevenLabs.' : 'Music and sound effects: made for this channel.'] : []),
    '',
  ].join('\n');
}
const descriptionFile = join(OUT, `lesson-${topic}${spec ? `-ch${spec}` : ''}-description.txt`);
if (!SHORT) {
  writeFileSync(descriptionFile, describe());
  console.log(`Description → ${descriptionFile}`);
}
if (flags.has('--describe')) process.exit(0);

// The bundle's public dir: the app icon, this topic's pictures and voice.
// One per topic, so two lessons can render at the same time.
const pub = join(OUT, `.public-longform-${topic}`);
rmSync(pub, { recursive: true, force: true });
mkdirSync(join(pub, 'audio'), { recursive: true });
cpSync(join(ROOT, 'assets', 'icon.png'), join(pub, 'icon.png'));
if (LIVELY) {
  if (elSound) {
    cpSync(EL_SOUND, join(pub, 'sound'), { recursive: true });
  } else {
    if (!existsSync(join(OUT, 'sound', 'music.wav')))
      execFileSync('node', [join(VIDEO, 'scripts', 'sound.mjs')], { stdio: 'inherit' });
    cpSync(join(OUT, 'sound'), join(pub, 'sound'), { recursive: true });
  }
}
// The catalogue's own pictures, for picture questions.
cpSync(join(ROOT, 'assets', 'questions'), join(pub, 'questions'), { recursive: true });
// This video's clips, if it has any.
if (existsSync(join(OUT, 'clips', MEDIA))) {
  cpSync(join(OUT, 'clips', MEDIA), join(pub, 'clips', MEDIA), { recursive: true });
}
// This lesson's own pictures, if it has any.
if (existsSync(join(OUT, 'images', MEDIA))) {
  cpSync(join(OUT, 'images', MEDIA), join(pub, 'images', MEDIA), { recursive: true });
}
if (!silent)
  for (const s of shots) for (const p of s.paras) cpSync(join(voiceDir, p.src.slice('audio/'.length)), join(pub, p.src));

const PREINSTALLED = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = process.env.REMOTION_BROWSER ?? (existsSync(PREINSTALLED) ? PREINSTALLED : null);

console.log(`${shots.length} shots, ${(cursor / FPS).toFixed(1)}s${silent ? ' (silent)' : ` (${VOICE}, ${MODEL})`}. Bundling…`);
const serveUrl = await bundle({
  entryPoint: join(VIDEO, 'src/index.ts'),
  publicDir: pub,
});
const inputProps = { plan };
const composition = await selectComposition({
  serveUrl,
  id: SHORT ? 'SeriesShort' : 'LongForm',
  inputProps,
  browserExecutable,
});
const label = `${topic}${spec ? `-ch${spec}` : ''}${LIVELY ? '-lively' : ''}${PROFILE === 'expressive' ? '-expressive' : ''}`;

if (flags.has('--stills')) {
  for (const [i, s] of shots.entries()) {
    const frame = s.from + Math.floor(s.frames * 0.75);
    const file = join(OUT, `still-${label}-${String(i).padStart(2, '0')}-${s.key ?? 'storyboard'}.png`);
    await renderStill({
      composition,
      serveUrl,
      frame,
      output: file,
      inputProps,
      browserExecutable,
    });
    console.log(`  ${file}`);
  }
} else {
  const file = join(OUT, SHORT ? `short-${topic}.mp4` : `lesson-${label}${silent ? '-silent' : ''}.mp4`);
  const started = Date.now();
  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    crf: 18,
    audioBitrate: '192k',
    outputLocation: file,
    inputProps,
    browserExecutable,
    muted: silent,
    onProgress: ({ progress }) => process.stdout.write(`\r  ${Math.round(progress * 100)}%`),
  });
  console.log(`\r  → ${file}  (${(cursor / FPS).toFixed(1)}s, rendered in ${((Date.now() - started) / 1000).toFixed(0)}s)`);
  if (SERIES && !silent) loudnorm(file);
}

/**
 * Series videos: bring the mix to -14 LUFS, where YouTube plays everything.
 * YouTube turns loud videos down but never turns quiet ones up, and the raw
 * mix sits near -23. Two passes (measure, then correct linearly); the
 * picture is copied untouched. Keeps the raw mix if no ffmpeg can do it.
 */
function loudnorm(file) {
  const target = 'I=-14:TP=-1.5:LRA=11';
  const out = file.replace(/\.mp4$/, '.norm.mp4');
  for (const bin of new Set([ffbin('ffmpeg'), 'ffmpeg'])) {
    const measure = spawnSync(bin, ['-hide_banner', '-nostats', '-i', file, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-'], { encoding: 'utf8' });
    const report = measure.status === 0 ? measure.stderr.match(/\{[^{}]*"input_i"[^{}]*\}/) : null;
    if (!report) continue;
    const m = JSON.parse(report[0]);
    const filter = `loudnorm=${target}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
    const fix = spawnSync(bin, ['-y', '-hide_banner', '-loglevel', 'error', '-i', file, '-c:v', 'copy', '-af', filter, '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', out]);
    if (fix.status !== 0) continue;
    cpSync(out, file);
    rmSync(out);
    console.log(`  loudness: ${m.input_i} → -14 LUFS`);
    return;
  }
  console.warn('  loudness: no ffmpeg could normalise it; the file keeps its raw mix');
}
