#!/usr/bin/env node
// Fetches the pictures listed in longform/<topic>.images.json from Wikimedia
// Commons, refusing any file whose licence would not let us publish it on a
// monetised channel, and writes the credits the video description must carry.
//
//   npm run images -- basic-rights            download (cached) + credits
//   npm run images -- basic-rights --thumbs   640px previews, for choosing
//
// The licence, author and source of every file are written back into the
// manifest, so the committed manifest is the record of what we used and why
// we were allowed to. The pictures themselves stay in out/ (gitignored).
//
// Commons rate-limits hard, so requests go one at a time with a pause and
// back off on 429. The User-Agent names the project, as Wikimedia asks.
//
// Wikimedia refuses to serve original files to shared cloud addresses like
// ours (429, "use thumbnail images in sizes listed on https://w.wiki/GHai"),
// so we ask for the largest standard thumbnail size that does not upscale.
// Those come from thumb.wikimedia.org, which must be in the environment's
// network allowlist. SVGs come back as PNG renders.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const UA = 'LID-test-video/0.1 (https://github.com/utpaldaslabs/German-Citizenship-App)';
const PAUSE_MS = 4000;
// Wikimedia's standard thumbnail widths; other widths are refused or slow.
const STANDARD_WIDTHS = [120, 250, 330, 500, 960, 1280, 1920, 3840];
const PREVIEW_WIDTH = 500;
// Largest standard width that is not wider than the original (SVGs have no
// natural size worth respecting, so they get the largest).
const widthFor = (original, svg) =>
  svg ? STANDARD_WIDTHS.at(-1) : STANDARD_WIDTHS.filter((w) => w <= original).at(-1) ?? STANDARD_WIDTHS[0];

// Free to use commercially, with or without attribution. Anything with NC
// (non-commercial) or ND (no derivatives — we crop, grade and animate) is out,
// as is "fair use", which is a US defence, not a licence.
const ALLOWED = [/^public domain$/i, /^pd\b/i, /^cc0\b/i, /^cc by( |-sa )\d\.\d( [a-z]{2})?$/i];
const isAllowed = (licence) => ALLOWED.some((re) => re.test(licence.trim()));

const args = process.argv.slice(2);
const topic = args.find((a) => !a.startsWith('--'));
const thumbs = args.includes('--thumbs');
if (!topic) {
  console.error('usage: npm run images -- <topic> [--thumbs]');
  process.exit(1);
}
const manifestPath = path.join(root, 'longform', `${topic}.images.json`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const outDir = path.join(root, 'out', 'images', topic, thumbs ? 'thumbs' : '');
fs.mkdirSync(outDir, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const strip = (html = '') =>
  html.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

async function get(url) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.status !== 429 && res.status !== 503) return res;
    const wait = Number(res.headers.get('retry-after')) * 1000 || 5000 * 2 ** attempt;
    console.log(`  rate limited, waiting ${Math.round(wait / 1000)}s`);
    await sleep(wait);
  }
  throw new Error(`still rate limited: ${url}`);
}

async function info(file, width) {
  const url =
    'https://commons.wikimedia.org/w/api.php?' +
    new URLSearchParams({
      action: 'query',
      format: 'json',
      maxlag: '5',
      titles: `File:${file}`,
      prop: 'imageinfo',
      iiprop: 'url|size|mime|sha1|extmetadata',
      ...(width ? { iiurlwidth: String(width) } : {}),
      iiextmetadatafilter: 'LicenseShortName|LicenseUrl|Artist|Credit|AttributionRequired|DateTimeOriginal',
    });
  const json = await (await get(url)).json();
  const page = Object.values(json.query?.pages ?? {})[0];
  const ii = page?.imageinfo?.[0];
  if (!ii) throw new Error(`not found on Commons: ${file}`);
  return ii;
}

const credits = [];
let refused = 0;
for (const img of manifest.images) {
  const svg = img.file.toLowerCase().endsWith('.svg');
  const dest = path.join(outDir, `${img.id}.${svg ? 'png' : 'jpg'}`);
  process.stdout.write(`${img.id}: `);
  const ii = await info(img.file);
  await sleep(PAUSE_MS);
  const m = ii.extmetadata ?? {};
  const licence = strip(m.LicenseShortName?.value) || 'unknown';
  img.licence = licence;
  img.licenceUrl = m.LicenseUrl?.value ?? null;
  img.author = strip(m.Artist?.value) || strip(m.Credit?.value) || 'unknown';
  img.date = strip(m.DateTimeOriginal?.value).replace(/date QS:.*$/, '').trim() || null;
  img.source = ii.descriptionurl;
  img.size = `${ii.width}x${ii.height}`;
  img.sha1 = ii.sha1;
  if (!isAllowed(licence)) {
    refused++;
    console.log(`REFUSED (${licence})`);
    continue;
  }
  if (!fs.existsSync(dest)) {
    const width = thumbs ? PREVIEW_WIDTH : widthFor(ii.width, svg);
    const { thumburl } = await info(img.file, width);
    await sleep(PAUSE_MS);
    const res = await get(thumburl);
    if (!res.ok) throw new Error(`${res.status} downloading ${thumburl}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
    await sleep(PAUSE_MS);
  }
  const short = ii.width < 1920 && !svg ? '  (under 1920px wide)' : '';
  console.log(`${licence}, ${img.size}${short}`);
  const link = img.licenceUrl ? ` (${img.licenceUrl})` : '';
  credits.push(`${img.file.replace(/\.\w+$/, '')} — ${img.author}, ${licence}${link}, via Wikimedia Commons: ${img.source}`);
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
if (!thumbs) {
  const text = `Pictures\n\n${credits.map((c) => `• ${c}`).join('\n')}\n`;
  fs.writeFileSync(path.join(outDir, 'credits.txt'), text);
  console.log(`\ncredits → ${path.relative(root, path.join(outDir, 'credits.txt'))}`);
}
if (refused) {
  console.error(`\n${refused} file(s) refused for their licence — replace them in ${path.relative(root, manifestPath)}.`);
  process.exit(1);
}
