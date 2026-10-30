/**
 * Rigged characters from licensed artwork (kit/characters/<id>/ in the
 * private repo, copied to the bundle as kit/<id>/): a body without arms,
 * swappable expression heads, and arms that pivot at the shoulder. Animated
 * with the principles in .claude/skills: anticipation, slow in / slow out,
 * arcs, follow-through and overlapping action, secondary action.
 *
 *   > SCENE (rig): Noah walks to the door and waves.
 *   > bg | us-house                  a clip or photo of this video, behind him
 *   > walk | 0.12 | 0.48             from x to x (0-1); starts at the scene start or @ cue
 *   > wave @ rings the bell          raises the arm, waves, lowers it
 *   > face | worried @ nobody        smile, wink, sad, laugh, angry, neutral, frown, surprised, worried
 *   > size | 0.7                     height as a share of the frame (default 0.66)
 *   > costume | witch                a wizard hat, a cape and a pumpkin candy bucket
 */
import React from 'react';
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Photo, Vignette } from '../longform/look';
import { screenLines, useShot } from '../longform/plan';

/** Each character's anchors, in pixels of its body.png. */
const RIGS: Record<string, { w: number; h: number; head: { x: number; y: number }; shoulders: [number, number]; shoulderY: number }> = {
  noah: { w: 654, h: 1910, head: { x: 318, y: 0 }, shoulders: [92, 566], shoulderY: 362 },
};

const ease = Easing.inOut(Easing.cubic);

export function RigScene({ topic }: { topic: string }) {
  const frame = useCurrentFrame();
  const { fps, height } = useVideoConfig();
  const shot = useShot();
  const lines = screenLines(shot, fps).map(({ fields, at }) => ({ kind: fields[0], args: fields.slice(1), at }));
  const bg = lines.find((l) => l.kind === 'bg')?.args[0];
  const who = lines.find((l) => l.kind === 'char')?.args[0] ?? 'noah';
  const rig = RIGS[who];
  const size = Number(lines.find((l) => l.kind === 'size')?.args[0] ?? 0.66);
  const scale = (height * size) / rig.h;

  // Walk: slow in, slow out, with a step bounce, squash on each landing, and a lean that overshoots when he stops.
  const walk = lines.find((l) => l.kind === 'walk');
  const w0 = walk ? walk.at : 0;
  const wDur = Math.round(fps * 2.2);
  const from = Number(walk?.args[0] ?? 0.5);
  const to = Number(walk?.args[1] ?? from);
  const t = walk ? interpolate(frame, [w0, w0 + wDur], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease }) : 1;
  const walking = walk && frame >= w0 && frame < w0 + wDur;
  const phase = ((frame - w0) / fps) * Math.PI * 3.2;
  const speed = walk ? Math.sin(Math.PI * t) : 0; // 0 at the ends, 1 mid-walk
  const bob = walking ? -Math.abs(Math.sin(phase)) * 22 * speed : 0;
  const squash = walking ? 1 - 0.035 * speed * Math.max(0, Math.cos(phase * 2)) : 1;
  const settle = walk ? spring({ frame: frame - (w0 + wDur), fps, config: { damping: 9, stiffness: 120 } }) : 1;
  const lean = walking ? 4 * speed : frame >= w0 + wDur && walk ? -3 * (1 - settle) * Math.cos((frame - w0 - wDur) / 3) : 0;
  const x = (from + (to - from) * t) * 1920;

  // Breathing and a small head tilt all the time (secondary action).
  const breathe = 1 + 0.008 * Math.sin(frame / 16);
  const tilt = Math.sin(frame / 37) * 2;

  // Wave: anticipation (the arm dips), the arm swings up with overshoot, waves on an arc, then drops back.
  const wave = lines.find((l) => l.kind === 'wave');
  const wa = wave?.at ?? -1e9;
  const anticip = interpolate(frame, [wa, wa + 5, wa + 8], [0, -10, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const up = spring({ frame: frame - (wa + 6), fps, config: { damping: 10, stiffness: 140 } });
  const waveEnd = wa + Math.round(fps * 2.6);
  const down = spring({ frame: frame - waveEnd, fps, config: { damping: 14, stiffness: 120 } });
  const raised = frame >= wa + 6 && frame < waveEnd + 8;
  const wiggle = raised ? Math.sin((frame - wa) / 3.2) * 14 * Math.min(1, (frame - wa - 6) / 8) * (1 - down) : 0;
  const waveAngle = interpolate(up, [0, 1], [70, 0]) + wiggle + down * 70;

  // Arms swing opposite to the steps; overlapping action: they trail the body by a few frames.
  const swing = walking ? Math.sin(phase - 0.6) * 14 * speed : Math.sin(frame / 22) * 1.5;

  // Faces: the latest `face` line that has started.
  const faces = lines.filter((l) => l.kind === 'face' && frame >= l.at - 2);
  const face = faces.length ? faces[faces.length - 1].args[0] : 'smile';
  const blinkOn = frame % 96 > 91 && face === 'smile';
  const costume = lines.find((l) => l.kind === 'costume')?.args[0];
  // The cape trails the body (follow-through): it swings against the walk and settles after he stops.
  const capeSway = (walking ? -Math.sin(phase - 1.2) * 5 * speed : 0) - lean * 1.2;

  const src = (p: string) => staticFile(`kit/${who}/${p}.png`);
  const armDown = (side: 0 | 1, angle: number) => (
    <div
      style={{
        position: 'absolute',
        left: rig.shoulders[side] - 87,
        top: rig.shoulderY - 22,
        width: 174,
        height: 624,
        transformOrigin: '87px 22px',
        transform: `scaleX(${side ? -1 : 1}) rotate(${7 + angle}deg)`,
      }}
    >
      <Img src={src('arm-down')} style={{ position: 'absolute', inset: 0, width: 174, height: 624 }} />
      {costume && side === 1 && (
        // The bucket hangs from the hand and swings a little behind the arm (overlapping action).
        <Img
          src={src('costume-bucket')}
          style={{ position: 'absolute', left: -6, top: 540, width: 190, height: 224, transformOrigin: '95px 0px', transform: `rotate(${-angle * 0.8 + Math.sin(frame / 11) * 3}deg)` }}
        />
      )}
    </div>
  );
  return (
    <AbsoluteFill>
      {bg && <Photo src={`images/${topic}/${bg}.jpg`} color from={{ x: 0.5, y: 0.5, scale: 1.04 }} to={{ x: 0.5, y: 0.5, scale: 1.1 }} />}
      <Vignette strength={0.45} />
      <div
        style={{
          position: 'absolute',
          left: x - (rig.w * scale) / 2,
          top: height * 0.96 - rig.h * scale + bob,
          width: rig.w * scale,
          height: rig.h * scale,
        }}
      >
        {/* soft ground shadow, smaller when he is in the air */}
        <div style={{ position: 'absolute', left: '15%', right: '15%', bottom: -10 - bob, height: 26, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', filter: 'blur(6px)', transform: `scaleX(${1 + bob / 120})` }} />
        <div
          style={{
            position: 'absolute',
            width: rig.w,
            height: rig.h,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
          }}
        >
          <div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 100%', transform: `rotate(${lean}deg) scaleY(${squash * breathe}) scaleX(${2 - squash})` }}>
            {costume && (
              <svg width={rig.w} height={rig.h} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
                <g transform={`rotate(${capeSway} ${rig.w / 2} ${rig.shoulderY})`}>
                  <path
                    d={`M ${rig.shoulders[0] + 20} ${rig.shoulderY - 10} Q ${rig.w / 2} ${rig.shoulderY - 40} ${rig.shoulders[1] - 20} ${rig.shoulderY - 10} L ${rig.w + 40} 1300 Q ${rig.w * 0.75} ${1340 + Math.sin(frame / 7) * 14} ${rig.w / 2} 1310 Q ${rig.w * 0.25} ${1340 + Math.cos(frame / 7) * 14} -40 1300 Z`}
                    fill="#4B2370"
                  />
                  <path d={`M ${rig.w / 2 - 60} ${rig.shoulderY - 28} L ${rig.w / 2 + 60} ${rig.shoulderY - 28} L ${rig.w / 2} ${rig.shoulderY + 30} Z`} fill="#F5B84A" />
                </g>
              </svg>
            )}
            {armDown(1, -swing)}
            <Img src={src('body')} style={{ position: 'absolute', left: 0, top: 0, width: rig.w, height: rig.h }} />
            {raised ? (
              <Img
                src={src('arm-wave')}
                style={{
                  position: 'absolute',
                  left: rig.shoulders[0] - 269,
                  top: rig.shoulderY - 131,
                  width: 311,
                  height: 436,
                  transformOrigin: '269px 131px',
                  transform: `rotate(${waveAngle}deg)`,
                }}
              />
            ) : (
              armDown(0, swing + anticip)
            )}
            <Img
              src={src(`head-${blinkOn ? 'laugh' : face}`)}
              style={{
                position: 'absolute',
                left: rig.head.x - 96,
                top: rig.head.y,
                width: 191,
                height: 299,
                transformOrigin: '96px 280px',
                transform: `rotate(${tilt + lean * 0.5}deg)`,
              }}
            />
            {costume && (
              // The hat sits on the head and lags its tilt slightly.
              <Img
                src={src('costume-hat')}
                style={{
                  position: 'absolute',
                  left: rig.head.x - 205,
                  top: rig.head.y - 230,
                  width: 410,
                  height: 335,
                  transformOrigin: '205px 520px',
                  transform: `rotate(${(tilt + lean * 0.5) * 1.15}deg)`,
                }}
              />
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
