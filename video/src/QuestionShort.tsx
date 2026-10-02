import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

import { Chip, Countdown, Highlighted, type Mark, OptionCard, Overline, PictureTile, type CardState } from './components';
import { alpha, APP_NAME, C, CHANNEL, FONT, GOLD, SAFE } from './lib/brand';
import { load } from './lib/data';
import { NEGATION } from './lib/script.mjs';
import { timeline } from './lib/timeline';

export type QuestionShortProps = {
  id: number;
  /** Shade the areas the platforms cover with their own UI. Review aid only. */
  showSafeArea?: boolean;
  /** Measured narration length per beat; omitted for silent renders. */
  beatSeconds?: Record<string, number>;
};

const LETTERS = ['A', 'B', 'C', 'D'] as const;

/**
 * One question as a vertical short.
 *
 * The screen is built once and stays put: question at the top, options in the
 * middle, and a panel underneath whose content changes with the beat. Nothing
 * reflows as the video plays - every element has its space from frame one and
 * only fades or tints - which is most of what makes motion graphics look
 * deliberate rather than busy.
 */
export function QuestionShort({ id, showSafeArea = false, beatSeconds }: QuestionShortProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { q, script } = load(id);
  const tl = timeline(script, fps, beatSeconds);

  /** 0 before `name` starts, easing to 1 just after. */
  const enter = (name: string, delayFrames = 0) =>
    spring({ frame: frame - tl.start(name) - delayFrames, fps, config: { damping: 200 }, durationInFrames: 14 });
  const reached = (name: string) => frame >= tl.start(name);
  const current = tl.beats.find((b) => frame >= b.from && frame < b.from + b.frames) ?? tl.beats[tl.beats.length - 1];

  // One accent for every video, from the flag's gold. Topic colours made a
  // "law" question glow red, and in a quiz red reads as "wrong".
  const accent = GOLD;
  const revealed = reached('reveal');
  const keywordsOn = enter('keywords');
  const keywordBeat = script.beats.find((b) => b.name === 'keywords');

  // Words to remember are highlighted where they occur, as well as listed.
  const questionMarks: Mark[] = [
    ...(keywordBeat?.ask ?? []).map((term) => ({ term, color: C.info, strength: keywordsOn })),
    ...(script.trap ? [{ term: q.de.text.match(NEGATION)?.[0] ?? '', color: C.danger, strength: enter('trap') }] : []),
  ];
  const answerMarks: Mark[] = (keywordBeat?.answer ?? []).map((term) => ({ term, color: C.success, strength: keywordsOn }));

  const stateOf = (i: number): CardState => (!revealed ? 'idle' : i === script.answerIndex ? 'correct' : 'dim');

  const longestOption = Math.max(...LETTERS.map((l) => q.de.options[l.toLowerCase() as 'a'].length));
  const questionSize = q.de.text.length > 110 ? 48 : q.de.text.length > 70 ? 54 : 60;
  const optionSize = longestOption > 40 ? 36 : 44;

  const hookOut = 1 - enter('question');
  const endIn = enter('end');

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(1300px 900px at 50% -10%, ${alpha(accent, 0.13)}, transparent 65%), ${C.bg}`,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: SAFE.top,
          bottom: SAFE.bottom,
          left: SAFE.side,
          right: SAFE.side,
          display: 'flex',
          flexDirection: 'column',
          gap: 30,
        }}
      >
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Img src={staticFile('icon.png')} style={{ width: 58, height: 58, borderRadius: 14 }} />
          <div style={{ flex: 1, fontWeight: 700, fontSize: 30, color: C.textMuted }}>{CHANNEL}</div>
          <div
            style={{
              padding: '10px 22px',
              borderRadius: 999,
              backgroundColor: alpha(accent, 0.16),
              color: accent,
              fontWeight: 800,
              fontSize: 30,
            }}
          >
            {q.kind === 'general' ? `Frage ${script.ref.label}` : script.ref.label.replace(' #', ' · Frage #')}
          </div>
        </div>

        {/* question */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, opacity: enter('question') }}>
          <div style={{ fontWeight: 800, fontSize: questionSize, lineHeight: 1.22, color: C.text }}>
            <Highlighted text={q.de.text} marks={questionMarks} />
          </div>
          <div style={{ fontWeight: 600, fontSize: 36, lineHeight: 1.3, color: C.textMuted, opacity: enter('questionEn'), minHeight: 47 }}>
            {q.en.text}
          </div>
        </div>

        {/* options */}
        {script.picture ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {LETTERS.map((letter, i) => (
              <PictureTile
                key={letter}
                letter={letter}
                imageKey={q.images[i]}
                state={stateOf(i)}
                enter={enter('optionsPicture', i * 6)}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {LETTERS.map((letter, i) => {
              const key = letter.toLowerCase() as 'a' | 'b' | 'c' | 'd';
              const beat = `option${letter}`;
              return (
                <OptionCard
                  key={letter}
                  letter={letter}
                  de={q.de.options[key]}
                  en={q.en.options?.[key] ?? null}
                  // The English lands as the narrator gets to it, not with the card.
                  enShown={enter(beat, Math.round(fps * 1.0))}
                  state={stateOf(i)}
                  enter={enter(beat)}
                  fontSize={optionSize}
                  marks={i === script.answerIndex ? answerMarks : []}
                />
              );
            })}
          </div>
        )}

        {/* panel: changes with the beat */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 18 }}>
          <Panel
            beat={current.name}
            frame={frame - current.from}
            frames={current.frames}
            fps={fps}
            script={script}
            negation={q.de.text.match(NEGATION)?.[0] ?? null}
            enter={enter}
          />
        </div>
      </div>

      {/* opening card */}
      {hookOut > 0.01 ? (
        <AbsoluteFill
          style={{
            backgroundColor: C.bg,
            opacity: hookOut,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 26,
            transform: `scale(${interpolate(enter('hook'), [0, 1], [0.96, 1])})`,
          }}
        >
          <Img src={staticFile('icon.png')} style={{ width: 170, height: 170, borderRadius: 40 }} />
          <Overline color={GOLD}>Einbürgerungstest</Overline>
          <div style={{ fontWeight: 800, fontSize: 104, color: C.text }}>
            {q.kind === 'general' ? `Frage ${script.ref.label}` : script.ref.label}
          </div>
          <div style={{ fontWeight: 600, fontSize: 44, color: C.textMuted }}>Do you know this one?</div>
        </AbsoluteFill>
      ) : null}

      {/* closing card */}
      {endIn > 0.01 ? (
        <AbsoluteFill
          style={{ backgroundColor: C.bg, opacity: endIn, alignItems: 'center', justifyContent: 'center', gap: 26 }}
        >
          <Img src={staticFile('icon.png')} style={{ width: 200, height: 200, borderRadius: 46 }} />
          <div style={{ fontWeight: 800, fontSize: 84, color: C.text }}>{APP_NAME}</div>
          <div style={{ fontWeight: 600, fontSize: 42, color: C.textMuted, textAlign: 'center', lineHeight: 1.35 }}>
            All 460 official questions
            <br />
            Free · no account
          </div>
          <div
            style={{
              marginTop: 18,
              padding: '20px 40px',
              borderRadius: 999,
              backgroundColor: C.success,
              color: C.onAccent,
              fontWeight: 800,
              fontSize: 40,
            }}
          >
            Link in description
          </div>
          <div style={{ marginTop: 30, fontWeight: 700, fontSize: 30, color: C.textFaint }}>{CHANNEL}</div>
        </AbsoluteFill>
      ) : null}

      {showSafeArea ? <SafeAreaOverlay /> : null}
    </AbsoluteFill>
  );
}

function Panel({
  beat,
  frame,
  frames,
  fps,
  script,
  negation,
  enter,
}: {
  beat: string;
  frame: number;
  frames: number;
  fps: number;
  script: ReturnType<typeof load>['script'];
  negation: string | null;
  enter: (name: string, delay?: number) => number;
}) {
  if (beat === 'trap') {
    return (
      <div
        style={{
          opacity: enter('trap'),
          padding: '26px 34px',
          borderRadius: 26,
          backgroundColor: C.dangerBg,
          border: `3px solid ${C.danger}`,
          color: C.danger,
          fontWeight: 700,
          fontSize: 38,
          lineHeight: 1.3,
          textAlign: 'center',
        }}
      >
        ⚠ <b>{negation}</b> = not
        <br />
        Find the one that does <b>NOT</b> fit
      </div>
    );
  }

  if (beat === 'countdown') {
    const left = Math.max(1, Math.ceil((frames - frame) / fps));
    return (
      <>
        <Countdown progress={Math.min(1, frame / frames)} secondsLeft={Math.min(3, left)} />
        <div style={{ fontWeight: 700, fontSize: 36, color: C.textMuted }}>Which one is right?</div>
      </>
    );
  }

  if (beat === 'reveal') {
    return (
      <div
        style={{
          opacity: enter('reveal'),
          padding: '18px 40px',
          borderRadius: 999,
          backgroundColor: C.success,
          color: C.onAccent,
          fontWeight: 800,
          fontSize: 44,
        }}
      >
        ✓ Answer {LETTERS[script.answerIndex]}
      </div>
    );
  }

  if (beat === 'why') {
    const b = script.beats.find((x) => x.name === 'why');
    return (
      <div style={{ opacity: enter('why'), display: 'flex', flexDirection: 'column', gap: 12, alignSelf: 'stretch' }}>
        <Overline color={C.info}>Why</Overline>
        <div style={{ fontWeight: 600, fontSize: 38, lineHeight: 1.35, color: C.text }}>
          {b?.say.map((s, i) =>
            s.lang === 'de' ? (
              <span key={i} style={{ color: GOLD, fontWeight: 800 }}>
                {s.text}
              </span>
            ) : (
              <React.Fragment key={i}>{s.text}</React.Fragment>
            ),
          )}
        </div>
      </div>
    );
  }

  if (beat === 'keywords') {
    const b = script.beats.find((x) => x.name === 'keywords');
    const chips = [
      ...(b?.ask ?? []).map((t) => ({ t, color: C.info })),
      ...(b?.answer ?? []).map((t) => ({ t, color: C.success })),
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignSelf: 'stretch' }}>
        <Overline color={GOLD}>Words to remember</Overline>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
          {chips.map((c, i) => (
            <Chip key={c.t} text={c.t} color={c.color} enter={enter('keywords', i * 5)} />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

/** Shades what the platforms' own interface covers. Never in a real render. */
function SafeAreaOverlay() {
  const shade = 'rgba(255, 60, 60, 0.28)';
  const label = { fontFamily: FONT, fontWeight: 800, fontSize: 28, color: '#fff', padding: 16 };
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: SAFE.top, background: shade }}>
        <div style={label}>Platform tabs and search</div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: SAFE.bottom, background: shade }}>
        <div style={label}>Caption, username, music</div>
      </div>
    </AbsoluteFill>
  );
}
