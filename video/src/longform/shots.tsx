import germany from '@svg-maps/germany';
import React from 'react';
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

import { OptionCard, PictureTile, type CardState } from '../components';
import { EuropeMap } from './europe';
import { StatesMap } from './states';
import { End, Fact, List, Outro, PhotoScene, Quote, Stat, Term, Words } from './generic';
import { alpha, APP_NAME, C, FONT, GOLD } from '../lib/brand';
import { load } from '../lib/data';
import { Archive, CrossIn, FactCard, Grain, INK, PAPER, Photo, PhotoCaption, rise, SERIF, SpokenText } from './look';
import { charFrame, cue, findCue, paraStart, useShot } from './plan';

export const img = (topic: string, id: string, ext = 'jpg') => `images/${topic}/${id}.${ext}`;


// ─── Cold open ──────────────────────────────────────────────────────────────

function Ruins({ topic }: { topic: string }) {
  const frame = useCurrentFrame();
  return (
    <Archive>
      <AbsoluteFill
        style={{
          opacity: interpolate(frame, [0, 40], [0, 1], {
            extrapolateRight: 'clamp',
          }),
        }}
      >
        <Photo src={img(topic, 'ruins-stuttgart')} from={{ x: 0.5, y: 0.6, scale: 1.0 }} to={{ x: 0.48, y: 0.55, scale: 1.14 }} />
      </AbsoluteFill>
      <PhotoCaption text="Stuttgart, 1945" at={30} />
    </Archive>
  );
}

function Bonn({ topic }: { topic: string }) {
  const shot = useShot();
  const { fps } = useVideoConfig();
  const second = cue(shot, 'after a government', fps, { fallback: 0.3 });
  const vote = cue(shot, 'parliament voted', fps, { fallback: 0.5 });
  const bonn = paraStart(shot, 1);
  return (
    <AbsoluteFill>
      <Sequence durationInFrames={second + 12}>
        <Archive>
          <Photo src={img(topic, 'ruins-wesel')} from={{ x: 0.5, y: 0.5, scale: 1.12 }} to={{ x: 0.55, y: 0.45, scale: 1.0 }} />
          <PhotoCaption text="Wesel, 1945" />
        </Archive>
      </Sequence>
      <Sequence from={second} durationInFrames={bonn - second + 12}>
        <CrossIn>
          <Archive>
            <Photo
              src={img(topic, 'ruins-heilbronn')}
              from={{ x: 0.5, y: 0.25, scale: 1.0 }}
              to={{ x: 0.5, y: 0.7, scale: 1.08 }}
            />
            <PhotoCaption text="Heilbronn from the air, March 1945" />
            <FactCard
              at={vote - second}
              date="23 MARCH 1933"
              de="Ermächtigungsgesetz"
              en="The Reichstag votes to let Hitler's government make laws without parliament."
            />
          </Archive>
        </CrossIn>
      </Sequence>
      <Sequence from={bonn}>
        <CrossIn>
          <Archive>
            <Photo
              src={img(topic, 'bonn-museum-koenig')}
              color
              from={{ x: 0.45, y: 0.5, scale: 1.0 }}
              to={{ x: 0.5, y: 0.45, scale: 1.1 }}
            />
            <PhotoCaption text="Museum Koenig, Bonn: the Parliamentary Council opened here in 1948" />
          </Archive>
        </CrossIn>
      </Sequence>
    </AbsoluteFill>
  );
}



function Article1({ topic, questions }: { topic: string; questions: number[] }) {
  const shot = useShot();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = shot.paras[0];
  const span = p?.de[0];
  const english = cue(shot, 'Human dignity', fps, { fallback: 0.4 });
  const grid = cue(shot, 'twenty-three', fps, { fallback: 0.8 });
  const inGerman = cue(shot, 'In German', fps, { fallback: 0.95 });
  const quoteOut = 1 - rise(frame, grid - 10, 14);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          width: 900,
          height: 1080,
          overflow: 'hidden',
          opacity: quoteOut,
        }}
      >
        <Photo
          src={img(topic, 'bgbl-1949-article1')}
          color
          from={{ x: 0.5, y: 0.0, scale: 1.0 }}
          to={{ x: 0.78, y: 0.31, scale: 2.1 }}
          end={span ? charFrame(p, span.start, fps) : 90}
        />
        <AbsoluteFill
          style={{
            background: `linear-gradient(90deg, ${INK} 0%, ${alpha(INK, 0)} 22%)`,
          }}
        />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 120,
          top: 0,
          bottom: 0,
          width: 860,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 34,
          opacity: quoteOut,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 3,
            color: GOLD,
            opacity: rise(frame, 6),
          }}
        >
          GRUNDGESETZ · ARTIKEL 1 · 23. MAI 1949
        </div>
        {span ? (
          <SpokenText
            p={p}
            start={span.start}
            end={span.end}
            style={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 84,
              lineHeight: 1.12,
              color: PAPER,
            }}
          />
        ) : null}
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 40,
            color: '#B9B2A3',
            opacity: rise(frame, english, 16),
          }}
        >
          Human dignity is inviolable.
        </div>
      </div>
      <Grain opacity={0.08} />
      <QuestionGrid questions={questions} at={grid} label={inGerman} />
    </AbsoluteFill>
  );
}

/** Every question the video covers, as tiles: the promise of the cold open. */
function QuestionGrid({ questions, at, label }: { questions: number[]; at: number; label: number }) {
  const frame = useCurrentFrame();
  if (frame < at - 4) return null;
  const cols = 8;
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', gap: 56 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 150px)`,
          gap: 18,
        }}
      >
        {questions.map((id, i) => {
          const o = rise(frame, at + i * 1.6, 10);
          return (
            <div
              key={id}
              style={{
                height: 92,
                borderRadius: 14,
                backgroundColor: C.surface,
                border: `2px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 34,
                color: C.text,
                opacity: o,
                transform: `scale(${0.85 + 0.15 * o})`,
              }}
            >
              #{id}
            </div>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontSize: 64,
          color: GOLD,
          opacity: rise(frame, label, 14),
        }}
      >
        auf Deutsch.
      </div>
    </AbsoluteFill>
  );
}

function Title({ title }: { title: string }) {
  const frame = useCurrentFrame();
  // `> OVERLINE` under the scene: the topic's German name.
  const overline = useShot().screen[0] ?? 'GRUNDRECHTE';
  const [main, sub] = title.split(' — ');
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 26,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${alpha(GOLD, 0.1)} 0%, ${alpha(GOLD, 0)} 60%)`,
        }}
      />
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 6,
          color: GOLD,
          opacity: rise(frame, 4),
        }}
      >
        {overline}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 150,
          color: C.text,
          opacity: rise(frame, 8),
          transform: `translateY(${(1 - rise(frame, 8)) * 20}px)`,
        }}
      >
        {main}
      </div>
      {sub ? (
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 48,
            color: C.textMuted,
            opacity: rise(frame, 16),
          }}
        >
          {sub}
        </div>
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: 96,
          bottom: 72,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          opacity: rise(frame, 20) * 0.9,
        }}
      >
        <Img src={staticFile('icon.png')} style={{ width: 56, height: 56, borderRadius: 13 }} />
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 28,
            color: C.textMuted,
          }}
        >
          {APP_NAME}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ─── Chapter 1 ──────────────────────────────────────────────────────────────

function Book() {
  const shot = useShot();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sticker = cue(shot, 'has a constitution', fps, { fallback: 0.2 });
  const strike = cue(shot, "isn't called", fps, { fallback: 0.35 });
  const glow = cue(shot, 'Grundgesetz', fps, { fallback: 0.6 });
  const words = cue(shot, 'basic law', fps, { fallback: 0.8 });
  const g = rise(frame, glow, 14);
  const s = rise(frame, sticker, 12);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 45%, ${alpha(GOLD, 0.06 + 0.1 * g)} 0%, ${alpha(GOLD, 0)} 55%)`,
        }}
      />
      <div style={{ perspective: 1600, marginTop: -60 }}>
        <div
          style={{
            width: 500,
            height: 680,
            borderRadius: '8px 18px 18px 8px',
            background: 'linear-gradient(135deg, #22304E 0%, #172238 100%)',
            boxShadow: `-18px 0 0 #101828, 0 40px 90px rgba(0,0,0,0.55), 0 0 ${80 * g}px ${alpha(GOLD, 0.35 * g)}`,
            transform: `rotateY(${-14 + 6 * rise(frame, 0, 60)}deg)`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 22,
            border: `3px solid ${alpha(GOLD, 0.5)}`,
            opacity: rise(frame, 0, 16),
          }}
        >
          <div style={{ width: 340, height: 2, backgroundColor: alpha(GOLD, 0.6) }} />
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 600,
              fontSize: 58,
              letterSpacing: 2,
              color: GOLD,
            }}
          >
            Grundgesetz
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontSize: 26,
              color: alpha(GOLD, 0.8),
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            für die
            <br />
            Bundesrepublik Deutschland
          </div>
          <div style={{ width: 340, height: 2, backgroundColor: alpha(GOLD, 0.6) }} />
        </div>
      </div>
      {/* The label it does not carry. */}
      <div
        style={{
          position: 'absolute',
          left: 1240,
          top: 300,
          padding: '14px 30px',
          backgroundColor: PAPER,
          borderRadius: 6,
          transform: `rotate(-6deg) translateX(${(1 - s) * 120}px)`,
          opacity: s,
          boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
        }}
      >
        <div
          style={{
            position: 'relative',
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 56,
            color: INK,
          }}
        >
          Verfassung
          <div
            style={{
              position: 'absolute',
              left: -10,
              top: '52%',
              height: 7,
              width: `${rise(frame, strike, 10) * 108}%`,
              backgroundColor: C.danger,
              borderRadius: 4,
            }}
          />
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 120,
          display: 'flex',
          gap: 60,
          fontFamily: FONT,
          fontSize: 44,
          color: C.textMuted,
          opacity: rise(frame, words, 14),
        }}
      >
        <span>
          <b style={{ color: C.text, fontFamily: SERIF }}>Grund</b> = basic
        </span>
        <span>
          <b style={{ color: C.text, fontFamily: SERIF }}>Gesetz</b> = law
        </span>
      </div>
    </AbsoluteFill>
  );
}

type Region = 'west' | 'east' | 'saar' | 'berlin';
const REGION: Record<string, Region> = {
  bw: 'west',
  by: 'west',
  hb: 'west',
  hh: 'west',
  he: 'west',
  ni: 'west',
  nw: 'west',
  rp: 'west',
  sh: 'west',
  bb: 'east',
  mv: 'east',
  sn: 'east',
  st: 'east',
  th: 'east',
  sl: 'saar',
  be: 'berlin',
};
const MAP = germany as unknown as {
  viewBox: string;
  locations: { id: string; name: string; path: string }[];
};

/** Germany by today's states, coloured as they stood in 1949 (or 1990). */
function GermanyMap({ west, east, height = 900 }: { west: number; east: number; height?: number }) {
  const lit = (o: number) => `rgba(255, 198, 61, ${0.18 + 0.62 * o})`;
  const fill: Record<Region, string> = {
    west: west > 0 ? lit(west) : C.surfaceAlt,
    east: east > 0 ? lit(east) : C.surfaceAlt,
    // The Saar was under French administration and joined the Federal Republic only in 1957.
    saar: east > 0 ? lit(east) : C.track,
    // Berlin was divided; drawn neutral until 1990.
    berlin: east > 0 ? lit(east) : C.textFaint,
  };
  return (
    <svg viewBox={MAP.viewBox} style={{ height }}>
      {MAP.locations.map((l) => (
        <path key={l.id} d={l.path} fill={fill[REGION[l.id]]} stroke={C.bg} strokeWidth={1.4} />
      ))}
    </svg>
  );
}

function Legend({ color, title, sub, o }: { color: string; title: string; sub: string; o: number }) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 22,
        alignItems: 'flex-start',
        opacity: o,
        transform: `translateX(${(1 - o) * 20}px)`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          backgroundColor: color,
          marginTop: 10,
        }}
      />
      <div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 46,
            color: C.text,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 30,
            color: C.textMuted,
            marginTop: 4,
          }}
        >
          {sub}
        </div>
      </div>
    </div>
  );
}

function Map1949() {
  const shot = useShot();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const divided = cue(shot, 'divided', fps, { fallback: 0.15 });
  const temporary = cue(shot, 'temporary arrangement', fps, { fallback: 0.7 });
  const still = paraStart(shot, 1);
  const w = rise(frame, divided, 20);
  const stamp = rise(frame, temporary, 8);
  const year = Math.round(
    interpolate(frame, [still + 6, still + 50], [1949, 2026], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div
        style={{
          position: 'absolute',
          left: 230,
          top: 90,
          opacity: rise(frame, 0, 20),
        }}
      >
        <GermanyMap west={w} east={0} />
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 380,
            padding: '10px 26px',
            border: `6px solid ${C.danger}`,
            borderRadius: 10,
            color: C.danger,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 50,
            letterSpacing: 4,
            transform: `rotate(-14deg) scale(${1.6 - 0.6 * stamp})`,
            opacity: stamp,
          }}
        >
          PROVISORISCH
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 1020,
          top: 250,
          display: 'flex',
          flexDirection: 'column',
          gap: 46,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 120,
            color: C.text,
            opacity: rise(frame, 4),
          }}
        >
          1949
        </div>
        <Legend color={GOLD} title="Bundesrepublik Deutschland" sub="West Germany: writes the Grundgesetz" o={w} />
        <Legend
          color={C.surfaceAlt}
          title="DDR"
          sub="East Germany: its own state from October 1949"
          o={rise(frame, divided + 20, 16)}
        />
        <div
          style={{
            fontFamily: FONT,
            fontSize: 26,
            color: C.textFaint,
            opacity: rise(frame, divided + 40, 16),
          }}
        >
          The Saarland, French-administered, joined West Germany only in 1957.
        </div>
      </div>
      {frame >= still ? (
        <div
          style={{
            position: 'absolute',
            right: 120,
            bottom: 90,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 72,
            color: GOLD,
            opacity: rise(frame, still, 8),
          }}
        >
          1949 → {year}
        </div>
      ) : null}
    </AbsoluteFill>
  );
}

function Reunify() {
  const shot = useShot();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reunited = cue(shot, 'reunited', fps, { fallback: 0.2 });
  const stayed = cue(shot, 'The name stayed', fps, { fallback: 0.8 });
  const e = rise(frame, reunited, 24);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <div style={{ position: 'absolute', left: 230, top: 90 }}>
        <GermanyMap west={1} east={e} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 1020,
          top: 300,
          display: 'flex',
          flexDirection: 'column',
          gap: 30,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: 160,
            color: C.text,
            opacity: rise(frame, 0, 14),
          }}
        >
          1990
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 40,
            color: C.textMuted,
            opacity: e,
          }}
        >
          3 October: Germany reunites
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 60,
            color: GOLD,
            marginTop: 30,
            opacity: rise(frame, stayed, 14),
          }}
        >
          Still the Grundgesetz.
        </div>
      </div>
    </AbsoluteFill>
  );
}

const LETTERS = ['a', 'b', 'c', 'd'] as const;

/** For matching what was said against what is printed: no case, no end punctuation. */
export const norm = (t: string) =>
  t
    .toLowerCase()
    .replace(/\u00ad/g, '')
    .replace(/[.…?!„“"]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Let "Arbeitgeberinnen/Arbeitgeber" break after the slash instead of overflowing. */
const breakable = (t: string) => t.replace(/\//g, '/\u200b');

/** The question with "nicht" / "kein…" in red: the words that turn it into a trap. */
function WithNegation({ text }: { text: string }) {
  return (
    <>
      {breakable(text).split(/(\bnicht\b|\bkein\w*)/i).map((part, i) =>
        i % 2 ? (
          <span key={i} style={{ color: C.danger }}>
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * An exam question exactly as worded in the catalogue. The right answer lights
 * up when the narrator says it; wrong answers dim as the narrator rules them out.
 */
function Question() {
  const shot = useShot();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const id = shot.questions[0];
  if (id == null) throw new Error(`A question shot needs a {Q<id>} anchor: ${shot.scene}`);
  const { q } = load(id);
  const answer = q.answer as (typeof LETTERS)[number];

  // When each option's German text is first spoken, after the question itself.
  const spoken: Partial<Record<string, number>> = {};
  for (const p of shot.paras) {
    for (const d of p.de) {
      for (const l of LETTERS) {
        if (spoken[l] == null && norm(d.text) === norm(q.de.options[l])) spoken[l] = charFrame(p, d.start, fps);
      }
    }
  }
  // `> @ phrase` under the scene says when to reveal, for answers never read out (pictures).
  const revealCue = shot.screen.find((l) => l.startsWith('@ '));
  const revealAt = revealCue ? findCue(shot, revealCue.slice(2).trim(), fps) : null;
  const answerAt = revealAt ?? spoken[answer] ?? Math.round(shot.frames * 0.6);
  // Some catalogue questions are whole stories; keep them on one screen.
  const qSize = q.de.text.length > 150 ? 44 : q.de.text.length > 90 ? 54 : 64;
  const longest = Math.max(...LETTERS.map((l) => q.de.options[l].length));
  const optSize = longest > 50 ? 34 : longest > 28 ? 40 : 48;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        padding: '90px 120px',
        gap: 22,
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 3,
          color: GOLD,
          opacity: rise(frame, 0),
        }}
      >
        EXAM QUESTION #{id}
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: qSize,
          lineHeight: 1.15,
          color: C.text,
          opacity: rise(frame, 2),
        }}
      >
        <WithNegation text={q.de.text} />
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 34,
          color: C.textMuted,
          opacity: rise(frame, 8),
        }}
      >
        {q.en?.text}
      </div>
      {q.imageMode === 'single' ? <ExamPicture imageKey={q.images[0]} credit={q.imageCredit} /> : null}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: q.imageMode === 'options' ? 'repeat(4, 1fr)' : '1fr 1fr',
          gap: 26,
          marginTop: q.imageMode === 'single' ? 10 : 40,
        }}
      >
        {LETTERS.map((l, i) => {
          if (q.imageMode === 'options') {
            const state: CardState = frame >= answerAt ? (l === answer ? 'correct' : 'dim') : 'idle';
            return <PictureTile key={l} letter={l.toUpperCase()} imageKey={q.images[i]} state={state} enter={rise(frame, 10 + i * 4, 14)} />;
          }
          const ruledOut = l !== answer && spoken[l] != null && frame >= spoken[l]!;
          const state: CardState = frame >= answerAt ? (l === answer ? 'correct' : 'dim') : ruledOut ? 'dim' : 'idle';
          return (
            <OptionCard
              key={l}
              letter={l.toUpperCase()}
              de={breakable(q.de.options[l])}
              en={q.en?.options?.[l] ?? null}
              enShown={1}
              state={state}
              enter={rise(frame, 10 + i * 4, 14)}
              fontSize={optSize}
              marks={[]}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

/**
 * The picture a question shows in the exam. Pictures the app drew or that are
 * free are shown; a press photo under someone else's copyright is described
 * instead, since these videos are published.
 */
function ExamPicture({ imageKey, credit }: { imageKey: string; credit: string | null }) {
  const frame = useCurrentFrame();
  const o = rise(frame, 6, 14);
  if (credit) {
    return (
      <div
        style={{
          alignSelf: 'flex-start',
          padding: '14px 26px',
          borderRadius: 14,
          border: `2px dashed ${C.borderStrong}`,
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 28,
          color: C.textMuted,
          opacity: o,
        }}
      >
        In the exam, this question shows a photo ({credit}).
      </div>
    );
  }
  return <Img src={staticFile(`questions/${imageKey}.webp`)} style={{ height: 240, alignSelf: 'flex-start', borderRadius: 14, opacity: o }} />;
}

/** Scenes that already put all their German on screen themselves. */
export const SHOWS_GERMAN = new Set(['article1', 'book', 'outro']);

/**
 * German the scene already shows, so the spoken-German caption skips it: the
 * question and its options, and the scene's own on-screen lines.
 */
export function shownGerman(questions: number[], screen: string[], key: string | null): string[] {
  const shown = screen.flatMap((l) => l.split(' @ ')[0].split(/ \| |, /));
  if (key === 'question' && questions[0] != null) {
    const { q } = load(questions[0]);
    shown.push(q.de.text, ...LETTERS.map((l) => q.de.options[l]));
  }
  return shown.map(norm);
}

export function shotFor(key: string | null, topic: string, title: string, questions: number[]): React.ReactNode | null {
  switch (key) {
    case 'ruins':
      return <Ruins topic={topic} />;
    case 'bonn':
      return <Bonn topic={topic} />;
    case 'article1':
      return <Article1 topic={topic} questions={questions} />;
    case 'title':
      return <Title title={title} />;
    case 'book':
      return <Book />;
    case 'map1949':
      return <Map1949 />;
    case 'reunify':
      return <Reunify />;
    case 'question':
      return <Question />;
    case 'term':
      return <Term />;
    case 'list':
      return <List />;
    case 'stat':
      return <Stat />;
    case 'fact':
      return <Fact />;
    case 'quote':
      return <Quote />;
    case 'photo':
      return <PhotoScene topic={topic} />;
    case 'words':
      return <Words />;
    case 'outro':
      return <Outro />;
    case 'end':
      return <End />;
    case 'europe':
      return <EuropeMap />;
    case 'states':
      return <StatesMap />;
    default:
      return null;
  }
}
