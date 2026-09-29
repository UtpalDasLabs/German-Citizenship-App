import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { Txt } from '@/components/ui';
import { keyTermsFor } from '@/lib/keyTerms';
import { useT } from '@/lib/useT';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The German words that identify a question and its answer.
 *
 * The exam is German-only and its questions are lifted verbatim from the
 * catalogue, so what carries you through it is recognising a handful of words,
 * not translating a sentence. The negation warning comes first and alone:
 * "Was steht NICHT im Grundgesetz" is how people lose questions they know.
 */
export function KeyTermsTip({ questionId }: { questionId: number }) {
  const { colors, radius, space } = useTheme();
  const { t } = useT();

  const terms = keyTermsFor(questionId);
  if (!terms || (terms.ask.length === 0 && terms.answer.length === 0 && !terms.trap)) return null;

  return (
    <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: space.md, gap: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
        <Ionicons name="key" size={13} color={colors.streak} />
        <Txt variant="overline" style={{ color: colors.streak }}>
          {t('keyWordsLabel').toUpperCase()}
        </Txt>
      </View>

      {terms.trap ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }}>
          <Ionicons name="alert-circle" size={16} color={colors.danger} />
          <Txt variant="small" tone="danger" style={{ flex: 1 }}>
            {t('trapWarning')}
          </Txt>
        </View>
      ) : null}

      {terms.ask.length ? <Row label={t('inTheQuestion')} words={terms.ask} tint={colors.info} /> : null}
      {terms.answer.length ? <Row label={t('inTheAnswer')} words={terms.answer} tint={colors.success} /> : null}
    </View>
  );
}

function Row({ label, words, tint }: { label: string; words: string[]; tint: string }) {
  const { colors, radius, space } = useTheme();
  return (
    <View style={{ gap: space.xs }}>
      <Txt variant="caption" tone="faint">
        {label}
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
        {words.map((w) => (
          <View
            key={w}
            style={{
              paddingVertical: 4,
              paddingHorizontal: 10,
              borderRadius: radius.sm,
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: tint,
            }}
          >
            <Txt variant="small" style={{ color: tint }}>
              {w}
            </Txt>
          </View>
        ))}
      </View>
    </View>
  );
}
