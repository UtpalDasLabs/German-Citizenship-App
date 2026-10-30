import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * Usage statistics through Google Analytics 4 — web only, and opt-in.
 *
 * Privacy rules this file keeps:
 *  - Nothing is fetched from Google until the visitor allows it. Consent Mode
 *    defaults are queued locally, but gtag.js itself only loads after "Allow"
 *    (or on a later visit that already allowed it).
 *  - Only what the app does is recorded — which screens are used, mock-exam
 *    results, setup choices. Never answers to individual questions, never the
 *    backup contents, and there is no account to attach anything to.
 *  - Native builds (iOS/Android) send nothing: every call is a no-op there.
 *  - The choice is per app and per browser, can be changed any time on the
 *    "You" tab, and is deliberately left out of the backup file.
 *
 * Same GA4 property as the portfolio at utpaldas.com. Every hit carries the
 * same app_id as the portfolio's Labs catalogue, so reports can split by app.
 */
const GA_ID = (process.env.EXPO_PUBLIC_GA_MEASUREMENT_ID ?? 'G-H0QB1FC8VN').trim();
const APP = 'german-citizenship';
const CONSENT_KEY = 'lid.analytics-consent';

const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
export const analyticsAvailable = isWeb && GA_ID.length > 0;

export type ConsentChoice = 'granted' | 'denied' | null;
type Params = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer: unknown[];
    clarity?: (...args: unknown[]) => void;
  }
}

const debug =
  isWeb && typeof location !== 'undefined' && new URLSearchParams(location.search).has('ga_debug');

let choice: ConsentChoice = null;
let started = false;
let scriptLoaded = false;
let context: Params = {};
const listeners = new Set<(c: ConsentChoice) => void>();

function readChoice(): ConsentChoice {
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

/*
 * gtag.js only executes dataLayer entries that are real `arguments` objects;
 * a plain array is silently dropped and nothing reaches Google. This must stay
 * a classic function pushing `arguments`, exactly like Google's own snippet.
 */
function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

function loadScript() {
  if (scriptLoaded) return;
  scriptLoaded = true;
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
}

/**
 * Call once at module load, before React renders anything — React runs child
 * effects before parent effects, so initialising in a component would let the
 * first page_view queue ahead of the consent/config commands, and GA drops it.
 */
export function initAnalytics(): void {
  if (!analyticsAvailable || started) return;
  started = true;
  choice = readChoice();
  window.dataLayer = window.dataLayer || [];
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: choice === 'granted' ? 'granted' : 'denied',
  });
  gtag('js', new Date());
  gtag('config', GA_ID, { send_page_view: false, content_group: APP });
  if (choice === 'granted') loadScript();
}

export function getConsent(): ConsentChoice {
  return analyticsAvailable ? choice : null;
}

export function setConsent(next: 'granted' | 'denied'): void {
  if (!analyticsAvailable) return;
  try {
    window.localStorage.setItem(CONSENT_KEY, next);
  } catch {
    // Private mode: the choice holds for this visit only.
  }
  choice = next;
  gtag('consent', 'update', { analytics_storage: next });
  if (next === 'granted') {
    loadScript();
    // The screen they are on was never counted; count it now.
    trackPageView();
  }
  listeners.forEach((l) => l(next));
}

/** Parameters merged into every hit, e.g. the interface language. */
export function setAnalyticsContext(params: Params): void {
  context = { ...context, ...params };
}

export function track(event: string, params: Params = {}): void {
  if (!isWeb) return;
  const payload = {
    content_group: APP,
    app_id: APP,
    page_path: location.pathname,
    ...context,
    ...params,
  };
  if (debug) console.debug('[analytics]', event, payload);
  if (!analyticsAvailable || choice !== 'granted') return;
  gtag('event', event, payload);
  // If Clarity is installed on this app, expose the same filters there too.
  window.clarity?.('set', 'app_id', APP);
  window.clarity?.('set', 'page_path', String(payload.page_path));
  window.clarity?.('event', event);
}

export function trackPageView(): void {
  if (!isWeb) return;
  track('page_view', {
    page_location: location.href,
    page_path: location.pathname + location.search,
    page_title: document.title,
  });
}

/**
 * The current choice for components. `undefined` until mounted, so the
 * statically rendered HTML and the first client render agree.
 */
export function useAnalyticsConsent(): ConsentChoice | undefined {
  const [value, setValue] = useState<ConsentChoice | undefined>(undefined);
  useEffect(() => {
    setValue(getConsent());
    listeners.add(setValue);
    return () => {
      listeners.delete(setValue);
    };
  }, []);
  return value;
}
