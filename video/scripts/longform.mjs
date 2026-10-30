/**
 * Reads a long-form script (longform/<topic>.md) into chapters and shots.
 *
 * A shot starts at every `> SCENE` line and owns the narration paragraphs
 * that follow it, up to the next scene. Each paragraph is one request to the
 * voice, so a paragraph is also the unit of timing.
 *
 * Paragraph text comes in three forms:
 *   tts    what the voice is sent: direction tags kept, [[ ]] removed
 *   plain  what a viewer would read: no tags, no brackets
 *   de     the German spans, as offsets into `plain`, so they can be shown
 *          on screen at the moment they are spoken
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const LONGFORM_DIR = path.resolve(here, '..', 'longform');

const TAG = /\[(?!\[)([a-z][a-z ,]*)\](?!\])/gi;

function paragraph(text) {
  // **Punch** words pop up on screen as they are spoken; *emphasis* is only
  // for the reader of the script. The voice gets plain words either way.
  const punch = [];
  const raw = text
    .replace(/\*\*([^*]+)\*\*/g, (_, words) => {
      punch.push(words);
      return words;
    })
    .replace(/\*([^*]+)\*/g, '$1');
  const tags = [...raw.matchAll(TAG)].map((m) => m[1].toLowerCase());
  const tts = raw
    .replace(/\[\[(.+?)\]\]/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  const untagged = raw.replace(TAG, '').replace(/\s+/g, ' ').trim();
  let plain = '';
  const de = [];
  let rest = untagged;
  for (;;) {
    const m = rest.match(/\[\[(.+?)\]\]/);
    if (!m) break;
    plain += rest.slice(0, m.index);
    de.push({
      start: plain.length,
      end: plain.length + m[1].length,
      text: m[1],
    });
    plain += m[1];
    rest = rest.slice(m.index + m[0].length);
  }
  plain += rest;
  return { tts, plain, de, tags, punch };
}

export function parseLongform(topic) {
  const src = fs.readFileSync(path.join(LONGFORM_DIR, `${topic}.md`), 'utf8');
  const [, front, body] = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  const meta = Object.fromEntries(
    front.split('\n').map((l) => {
      const i = l.indexOf(':');
      const v = l.slice(i + 1).trim();
      return [l.slice(0, i).trim(), v.startsWith('[') ? JSON.parse(v) : v.replace(/^"(.*)"$/, '$1')];
    }),
  );

  const chapters = [];
  let chapter = null;
  let shot = null;
  let pendingQuestions = [];
  let para = [];
  const flush = () => {
    if (para.length && shot) shot.paras.push(paragraph(para.join(' ')));
    para = [];
  };

  for (const line of body.replace(/<!--[\s\S]*?-->/g, '').split('\n')) {
    const t = line.trim();
    if (t.startsWith('## ')) {
      flush();
      chapter = { title: t.slice(3).trim(), shots: [] };
      chapters.push(chapter);
      shot = null;
    } else if (t.startsWith('> SCENE')) {
      flush();
      const m = t.match(/^> SCENE(?: \(([\w-]+)\))?:\s*(.*)$/);
      if (!m) throw new Error(`Cannot read scene line: ${t}`);
      shot = {
        key: m[1] ?? null,
        scene: m[2],
        questions: pendingQuestions,
        screen: [],
        paras: [],
      };
      pendingQuestions = [];
      chapter.shots.push(shot);
    } else if (t.startsWith('> ') && shot && shot.paras.length === 0 && para.length === 0) {
      // Further quoted lines right after a scene: what the scene puts on screen.
      shot.screen.push(t.slice(2).trim());
    } else if (/^\{Q\d+\}$/.test(t)) {
      flush();
      pendingQuestions.push(Number(t.slice(2, -1)));
    } else if (t === '') {
      flush();
    } else if (chapter && shot) {
      para.push(t);
    } else if (chapter) {
      throw new Error(`Narration before the first scene of "${chapter.title}": ${t}`);
    }
  }
  flush();
  return { topic, meta, chapters };
}

/** "0-1" or "0,2" → chapter indexes; undefined → all. */
export function pickChapters(spec, count) {
  if (!spec) return [...Array(count).keys()];
  return spec.split(',').flatMap((part) => {
    const [a, b] = part.split('-').map(Number);
    return b == null ? [a] : Array.from({ length: b - a + 1 }, (_, i) => a + i);
  });
}
