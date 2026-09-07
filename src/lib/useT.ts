import { useMemo } from 'react';

import { translator, uiLocale } from '@/lib/i18n';
import { useSettings } from '@/store/SettingsProvider';

/** UI translation function plus the resolved interface locale. */
export function useT() {
  const { settings } = useSettings();
  const locale = uiLocale(settings.language);
  const t = useMemo(() => translator(settings.language), [settings.language]);
  return { t, locale, language: settings.language };
}
