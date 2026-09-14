import { ScrollViewStyleReset } from 'expo-router/html';
import React from 'react';

/**
 * The HTML shell every statically rendered page is wrapped in.
 *
 * This is where the PWA lives: the manifest and icons make the app
 * installable, which is what gives stored progress real durability.
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
          content="Learn all 460 official German citizenship test questions with flashcards, visuals and mock exams."
        />
        <meta name="theme-color" content="#4CC93F" />

        {/* Installable app. Relative paths so it works under a repo sub-path. */}
        <link rel="manifest" href="manifest.json" />
        <link rel="apple-touch-icon" href="icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Leben in DE" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Keeps <ScrollView> from scrolling the page body. */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{ __html: BASE_STYLE }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

/**
 * Painted before the JS bundle boots, so the first frame already matches the
 * viewer's theme instead of flashing white.
 */
const BASE_STYLE = `
body { background-color: #FFFFFF; }
@media (prefers-color-scheme: dark) {
  body { background-color: #131720; }
}
`;
