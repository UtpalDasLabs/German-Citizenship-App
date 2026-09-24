import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { ProgressBar, Txt } from '@/components/ui';
import type { Forecast } from '@/lib/forecast';
import { useT } from '@/lib/useT';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The mastery figure, with the two counts that explain it.
 *
 * This used to read "Exam readiness / 16% / 193 of 310 cards started / 0 fully
 * mastered" - three numbers measuring three different things, stacked with
 * nothing saying so, which invited the obvious wrong reading that 193 of 310
 * should be 62%. Each line now says which of the three it is, and the rule
 * underneath explains why seeing a card is only a quarter of learning it.
 */
export function MasteryStats({ f, compact = false }: { f: Forecast; compact?: boolean }) {
  const { colors, space } = useTheme();
  const { t } = useT();

  return (
    <View style={{ gap: space.sm }}>
      <ProgressBar value={f.score} color={colors.info} />

      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
        <Txt variant={compact ? 'heading' : 'title'} tone="info">
          {Math.round(f.score * 100)}%
        </Txt>
        <Txt variant="small" tone="muted" style={{ flex: 1 }}>
          {t('masteryToward')} {f.total}
        </Txt>
      </View>

      <View style={{ gap: space.xs }}>
        <Count icon="eye-outline" color={colors.textMuted} value={f.started} total={f.total} label={t('seenOnce')} />
        <Count icon="star" color={colors.info} value={f.ready} total={f.total} label={t('readyCards')} />
      </View>

      {!compact ? (
        <Txt variant="caption" tone="faint">
          {t('masteryRule')}
        </Txt>
      ) : null}
    </View>
  );
}

function Count({
  icon,
  color,
  value,
  total,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  value: number;
  total: number;
  label: string;
}) {
  const { space } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <Ionicons name={icon} size={15} color={color} />
      <Txt variant="small" tone="muted">
        <Txt variant="bodyStrong">
          {value} / {total}
        </Txt>{' '}
        {label}
      </Txt>
    </View>
  );
}
