/**
 * Frames of a video as plain RGB pixels, using Remotion's bundled ffmpeg. That
 * build can only write PNG, so this file also holds a small PNG decoder
 * (8-bit RGB, no interlacing: exactly what ffmpeg writes).
 */
import { execFileSync } from 'node:child_process';
import zlib from 'node:zlib';

import { ffbin } from './ffbin.mjs';

const FFMPEG = ffbin('ffmpeg');

/** Decodes an 8-bit RGB PNG into { width, height, data } (3 bytes a pixel). */
export function decodePng(buf) {
  let pos = 8;
  let width = 0;
  let height = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('latin1', pos + 4, pos + 8);
    const body = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      if (body[8] !== 8 || body[9] !== 2 || body[12] !== 0) throw new Error('Only 8-bit RGB PNGs without interlacing');
    } else if (type === 'IDAT') idat.push(body);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * 3;
  const data = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    const out = data.subarray(y * stride, (y + 1) * stride);
    const up = y > 0 ? data.subarray((y - 1) * stride, y * stride) : null;
    for (let x = 0; x < stride; x++) {
      const a = x >= 3 ? out[x - 3] : 0;
      const b = up ? up[x] : 0;
      const c = up && x >= 3 ? up[x - 3] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[x] = v & 255;
    }
  }
  return { width, height, data };
}

/** Length of a video in seconds. */
export function duration(file) {
  let report = '';
  try {
    execFileSync(FFMPEG, ['-i', file], { stdio: 'pipe' });
  } catch (e) {
    report = String(e.stderr);
  }
  const m = report.match(/Duration: (\d+):(\d+):([\d.]+)/);
  if (!m) throw new Error(`No duration for ${file}`);
  return Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]);
}

/** One frame at `seconds`, scaled to `width` pixels wide. */
export function frameAt(file, seconds, width = 540) {
  const png = execFileSync(
    FFMPEG,
    ['-v', 'error', '-ss', String(seconds), '-i', file, '-frames:v', '1', '-vf', `scale=${width}:-2`, '-pix_fmt', 'rgb24', '-f', 'image2pipe', '-c:v', 'png', '-'],
    { maxBuffer: 1 << 26 },
  );
  return decodePng(png);
}
