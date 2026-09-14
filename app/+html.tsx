import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

import { BRAND_MARK_SVG } from '@/data/brandMark';

/**
 * The HTML shell every statically rendered page is wrapped in.
 *
 * Two things here have to happen before React mounts: the splash, so the app
 * does not flash an empty white page while a 3 MB bundle parses, and the
 * capture of `beforeinstallprompt`, which Chromium fires early and only once.
 */
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        <meta
          name="description"
          content="LID-test: learn all 460 official German citizenship test questions with flashcards, visuals and mock exams."
        />
        <meta name="theme-color" content="#4CC93F" />

        {/* Installable app. Relative paths so it works under a repo sub-path. */}
        <link rel="manifest" href="manifest.json" />
        <link rel="apple-touch-icon" href="icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LID-test" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Keeps <ScrollView> from scrolling the page body. */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: BASE_STYLE }} />
        <script dangerouslySetInnerHTML={{ __html: INSTALL_CAPTURE }} />
      </head>
      <body>
        {/* Painted immediately, removed by the app once it has mounted. */}
        <div id="lid-splash" aria-hidden="true">
          <div
            id="lid-splash-mark"
            dangerouslySetInnerHTML={{ __html: BRAND_MARK_SVG }}
          />
          <div id="lid-splash-name">LID-test</div>
          <div id="lid-splash-sub">Leben in Deutschland</div>
        </div>
        {children}
      </body>
    </html>
  );
}

/**
 * Chromium fires `beforeinstallprompt` once, often before the bundle has
 * parsed. Stashing it here is the only way the install button can exist later.
 */
const INSTALL_CAPTURE = `
window.__lidInstallPrompt = null;
window.addEventListener('beforeinstallprompt', function (e) {
  e.preventDefault();
  window.__lidInstallPrompt = e;
  window.dispatchEvent(new Event('lid-installable'));
});
window.addEventListener('appinstalled', function () {
  window.__lidInstallPrompt = null;
});
`;

const BASE_STYLE = `
body { background-color: #FFFFFF; }

#lid-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: #FFFFFF;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: opacity 260ms ease;
}
#lid-splash.lid-splash-done { opacity: 0; pointer-events: none; }
#lid-splash-mark svg { width: 128px; height: 128px; display: block; }
#lid-splash-name { font-size: 26px; font-weight: 800; color: #14181F; letter-spacing: -0.2px; }
#lid-splash-sub { font-size: 12px; font-weight: 700; color: #8C97A8; letter-spacing: 1px; text-transform: uppercase; }

@media (prefers-color-scheme: dark) {
  body { background-color: #131720; }
  #lid-splash { background: #131720; }
  #lid-splash-name { color: #F3F6FB; }
  #lid-splash-sub { color: #74829A; }
}
`;
