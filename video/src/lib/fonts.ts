import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import { cancelRender, continueRender, delayRender } from 'remotion';

/**
 * Inter is bundled from npm rather than fetched from a font CDN, so a render
 * never depends on the network and every machine produces identical frames.
 *
 * Rendering waits until every weight is loaded. If one fails the render stops:
 * a video that silently falls back to a system font is worse than no video.
 * The sample text includes the German characters, so the subset covering them
 * is the one that gets loaded.
 */
const handle = delayRender('Loading Inter');
const SAMPLE = 'Einbürgerungstest ÄÖÜäöüß „“';
Promise.all(['400', '600', '700', '800'].map((w) => document.fonts.load(`${w} 40px Inter`, SAMPLE)))
  .then((faces) => {
    if (faces.some((f) => f.length === 0)) throw new Error('Inter failed to load');
    continueRender(handle);
  })
  .catch((err) => cancelRender(err));
