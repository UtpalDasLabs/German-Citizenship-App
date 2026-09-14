/**
 * The LID-test app mark: a circular black/red/gold badge around a heraldic
 * eagle whose plumage runs black at the top, red through the middle and gold
 * at the bottom - the national flag read vertically, which is what makes the
 * bird recognisably German rather than a generic heraldic eagle.
 *
 * This is an original mark. It is deliberately NOT the Bundeswappen: Germany's
 * federal coat of arms is a protected state emblem whose use by third parties
 * is an administrative offence under section 124 OWiG, and an app that looked
 * like an official seal would also imply a government affiliation this one
 * does not have.
 */

export const COLOURS = {
  black: '#141414',
  red: '#E2001A',
  redDark: '#AB0014',
  gold: '#FFCC00',
  goldDark: '#E0A800',
  cream: '#FFFFFF',
};

const { black: BLACK, red: RED, redDark: RED_D, gold: GOLD, goldDark: GOLD_D, cream: CREAM } = COLOURS;

/** One feather: full at the base, tapering to a blunt tip, slightly sickled. */
function blade(bx, by, deg, length, width, curve = 0.07) {
  const a = (deg * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const px = -dy;
  const py = dx;
  const tx = bx + dx * length;
  const ty = by + dy * length;
  const mx = bx + dx * length * 0.45;
  const my = by + dy * length * 0.45;
  const w = width / 2;
  const ox = mx + px * (w + length * curve);
  const oy = my + py * (w + length * curve);
  const ix = mx - px * w * 0.9;
  const iy = my - py * w * 0.9;
  const t = width * 0.13;
  const r = (n) => n.toFixed(1);
  return (
    `M ${r(bx + px * w)} ${r(by + py * w)} ` +
    `Q ${r(ox)} ${r(oy)} ${r(tx + px * t)} ${r(ty + py * t)} ` +
    `L ${r(tx - px * t)} ${r(ty - py * t)} ` +
    `Q ${r(ix)} ${r(iy)} ${r(bx - px * w)} ${r(by - py * w)} Z`
  );
}

/**
 * Half the fan: angle, length, width, colour. Angles are SVG-convention
 * (y grows downward), so the fan sweeps from up-and-out at the top round to
 * straight-down at the bottom.
 */
const PLUMES = [
  [214, 150, 62, BLACK],
  [201, 172, 62, BLACK],
  [188, 186, 60, BLACK],
  [175, 196, 56, RED],
  [163, 200, 54, RED],
  [151, 194, 52, RED],
  [139, 178, 48, RED],
  [128, 156, 44, GOLD],
  [117, 132, 40, GOLD],
];

function fan(mirror) {
  return PLUMES.map(([deg, length, width, colour]) => {
    const d = mirror ? 180 - deg : deg;
    const bx = mirror ? 512 - 246 : 246;
    return `<path d="${blade(bx, 196, d, length, width)}" fill="${colour}"/>`;
  }).join('');
}

export function eagle() {
  return `
  ${fan(false)}${fan(true)}

  <path d="M256 150 C284 150 300 176 300 210 L290 292 L256 310 L222 292 L212 210
           C212 176 228 150 256 150 Z" fill="${RED}"/>
  <path d="M226 288 L216 352 L244 338 L256 370 L268 338 L296 352 L286 288 Z" fill="${GOLD}"/>

  <g stroke="${GOLD_D}" stroke-width="9" stroke-linecap="round" fill="none">
    <path d="M238 302 L224 324 M238 302 L240 328"/>
    <path d="M274 302 L288 324 M274 302 L272 328"/>
  </g>

  <!-- Head in profile with a hooked beak. The cream outline is load-bearing:
       against the black upper wing an unoutlined beak disappears entirely. -->
  <g stroke="${CREAM}" stroke-width="9" stroke-linejoin="round">
    <path d="M218 108 L122 140 L142 168 L222 180
             C206 156 206 132 218 108 Z" fill="${RED}"/>
    <circle cx="262" cy="126" r="52" fill="${BLACK}"/>
  </g>
  <path d="M122 140 L142 168 L166 158 L140 150 Z" fill="${RED_D}"/>
  <circle cx="278" cy="114" r="14" fill="${CREAM}"/>
  <circle cx="274" cy="114" r="6.5" fill="${BLACK}"/>
`;
}

/** Full badge, used for the app icon and favicon. */
export function badge() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${CREAM}"/>
  <circle cx="256" cy="256" r="250" fill="${BLACK}"/>
  <circle cx="256" cy="256" r="233" fill="${RED}"/>
  <circle cx="256" cy="256" r="216" fill="${GOLD}"/>
  <circle cx="256" cy="256" r="199" fill="${CREAM}"/>
  <g transform="translate(256 268) scale(0.88) translate(-256 -244)">${eagle()}</g>
</svg>`;
}

/** Android adaptive foreground: eagle only, inset for the system mask. */
export function foreground() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <g transform="translate(256 268) scale(0.60) translate(-256 -244)">${eagle()}</g>
</svg>`;
}

/** Android monochrome layer: one flat silhouette for themed icons. */
export function monochrome() {
  let body = eagle();
  for (const c of [RED, RED_D, GOLD, GOLD_D, CREAM]) body = body.split(c).join('#000000');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <g transform="translate(256 268) scale(0.60) translate(-256 -244)">${body}</g>
</svg>`;
}

/** Splash: the eagle on the badge's cream field, no ring. */
export function splash() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <g transform="translate(256 268) scale(0.78) translate(-256 -244)">${eagle()}</g>
</svg>`;
}
