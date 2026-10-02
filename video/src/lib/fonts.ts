import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/source-serif-4/400.css';
import '@fontsource/source-serif-4/400-italic.css';
import '@fontsource/source-serif-4/600.css';
import { cancelRender, continueRender, delayRender } from 'remotion';

/**
 * Fonts are bundled from npm rather than fetched from a font CDN, so a render
 * never depends on the network and every machine produces identical frames.
 *
 * Rendering waits until every weight is loaded. If one fails the render stops:
 * a video that silently falls back to a system font is worse than no video.
 * The sample text includes the German characters, so the subset covering them
 * is the one that gets loaded.
 */
const handle = delayRender('Loading fonts');
const SAMPLE = 'Einbürgerungstest ÄÖÜäöüß „“';
Promise.all([
  ...['400', '600', '700', '800'].map((w) => document.fonts.load(`${w} 40px Inter`, SAMPLE)),
  // The long-form videos quote the Grundgesetz in a book face.
  ...['400', 'italic 400', '600'].map((w) => document.fonts.load(`${w} 40px "Source Serif 4"`, SAMPLE)),
])
  .then((faces) => {
    if (faces.some((f) => f.length === 0)) throw new Error('A font failed to load');
    continueRender(handle);
  })
  .catch((err) => cancelRender(err));
