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
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { bundle } from '@remotion/bundler';
import { renderMedia, renderStill, selectComposition } from '@remotion/renderer';

import { parseLongform, pickChapters } from './longform.mjs';
import { audioDir, MODEL, paraHash, PROFILE, spokenText, VOICE } from './voice-longform.mjs';

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
const voiceDir = audioDir(topic);
// Music and effects from ElevenLabs (npm run sound:elevenlabs) when they have
// been made, else the synthesised ones (npm run sound).
const EL_SOUND = join(OUT, 'sound-elevenlabs');
const elSound = existsSync(join(EL_SOUND, 'sounds.json'))
  ? JSON.parse(readFileSync(join(EL_SOUND, 'sounds.json'), 'utf8'))
  : null;
/** The music bed, and how loud it sits under the voice and in the gaps. */
const MUSIC = elSound
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
    const length = paras.length ? t + frames(TAIL + (s.key === 'question' ? READ : 0)) : frames(SILENT_SHOT);
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
  topic,
  title: script.meta.title,
  questions: script.meta.questions,
  fps: FPS,
  total: cursor,
  shots,
  lively: LIVELY,
  music: LIVELY && !args0.includes('--no-music') ? MUSIC : null,
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
function describe() {
  const chapterLines = [];
  for (const sh of shots) {
    if (sh.opensChapter || sh === shots[0]) {
      chapterLines.push(`${stamp(sh.from)} ${sh === shots[0] ? 'Intro' : sh.chapterTitle}`);
    }
  }
  const credits = join(OUT, 'images', topic, 'credits.txt');
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
    "Narrated with an AI version of the creator's own voice (ElevenLabs). Every fact was checked against the official question catalogue and the Grundgesetz. This channel is independent and not affiliated with the BAMF or any government body.",
    '',
    existsSync(credits) ? readFileSync(credits, 'utf8').trim() : 'Pictures: none',
    ...(usesMap
      ? [
          '• Map of Germany: @svg-maps/germany, based on MapSVG (mapsvg.com), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)',
        ]
      : []),
    '',
  ].join('\n');
}
const descriptionFile = join(OUT, `lesson-${topic}${spec ? `-ch${spec}` : ''}-description.txt`);
writeFileSync(descriptionFile, describe());
console.log(`Description → ${descriptionFile}`);
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
cpSync(join(OUT, 'images', topic), join(pub, 'images', topic), {
  recursive: true,
});
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
  id: 'LongForm',
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
  const file = join(OUT, `lesson-${label}${silent ? '-silent' : ''}.mp4`);
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
}
