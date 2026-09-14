import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingScreen, useAppReady } from '@/components/Loading';
import { MascotSays } from '@/components/Mascot';
import { Button, Card, Chip, Divider, ProgressBar, Screen, Txt } from '@/components/ui';
import { forecast, formatDate, planFor } from '@/lib/forecast';
import { GOALS, GOAL_ORDER } from '@/lib/goals';
import { EXAM_FACTS, OFFICIAL, pruefstellenUrl } from '@/lib/official';
import { deckFor, meta } from '@/lib/questions';
import type { GoalId } from '@/lib/types';
import { useT } from '@/lib/useT';
import { useProgress } from '@/store/ProgressProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useTheme } from '@/theme/ThemeProvider';

const DAY = 24 * 60 * 60 * 1000;

/** Offer concrete dates rather than a date picker - fewer taps, no keyboard. */
function dateChoices(now = Date.now()) {
  return [
    { weeks: 4, iso: isoAfter(now, 28) },
    { weeks: 8, iso: isoAfter(now, 56) },
    { weeks: 12, iso: isoAfter(now, 84) },
    { weeks: 24, iso: isoAfter(now, 168) },
  ];
}

function isoAfter(now: number, days: number): string {
  const d = new Date(now + days * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function PlanScreen() {
  const { colors, space, radius } = useTheme();
  const { t, locale } = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings, update } = useSettings();
  const { progress } = useProgress();
  const [choices] = useState(() => dateChoices());

  const deck = useMemo(() => deckFor(settings.state), [settings.state]);
  const f = useMemo(() => forecast(deck, progress.cards, settings.goal), [deck, progress.cards, settings.goal]);
  const plan = useMemo(
    () => (settings.examDate ? planFor(f, settings.examDate, settings.goal) : null),
    [f, settings.examDate, settings.goal],
  );

  const stateInfo = meta.states.find((s) => s.name === settings.state);

  const appReady = useAppReady();
  if (!appReady) return <LoadingScreen />;

  const mood = plan == null ? 'thinking' : plan.impossible || !plan.onTrack ? 'sad' : 'happy';

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.md,
          paddingHorizontal: space.lg,
          paddingBottom: space.xxxl,
          gap: space.lg,
          maxWidth: 640,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={t('backHome')} hitSlop={12}>
            <Ionicons name="chevron-back" size={28} color={colors.textFaint} />
          </Pressable>
          <Txt variant="title" style={{ flex: 1 }}>
            {t('planTitle')}
          </Txt>
        </View>

        <MascotSays mood={mood} size={88}>
          <Txt variant="bodyStrong">
            {plan == null
              ? t('whenExam')
              : plan.daysLeft <= 0
                ? t('examPassed')
                : plan.impossible
                  ? t('tooSoon')
                  : plan.onTrack
                    ? t('onTrack')
                    : t('needMore')}
          </Txt>
          <Txt variant="small" tone="muted">
            {plan == null
              ? t('whenExamBody')
              : plan.impossible
                ? `${t('tooSoonBody')} ${f.minimumDays} ${locale === 'de' ? 'Tagen' : 'days'}.`
                : plan.onTrack
                  ? t('onTrackBody')
                  : `${t('needMoreBody')} ${plan.cardsPerDay} ${t('cardsADay')}.`}
          </Txt>
        </MascotSays>

        {/* readiness */}
        <Card style={{ gap: space.sm }}>
          <Txt variant="heading">{t('readyLabel')}</Txt>
          <ProgressBar value={f.total ? f.ready / f.total : 0} color={colors.info} />
          <Txt variant="small" tone="muted">
            {f.ready} / {f.total} {t('readyCards')}
          </Txt>
          {f.reviewsLeft > 0 ? (
            <Txt variant="small" tone="muted">
              {t('readyBy')} <Txt variant="bodyStrong">{formatDate(f.readyDate, locale)}</Txt>
            </Txt>
          ) : null}
        </Card>

        {/* exam date */}
        <Card style={{ gap: space.md }}>
          <Txt variant="heading">{t('whenExam')}</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {choices.map((c) => (
              <Chip
                key={c.iso}
                label={`${locale === 'de' ? 'in' : 'in'} ${c.weeks} ${locale === 'de' ? 'Wochen' : 'weeks'}`}
                active={settings.examDate === c.iso}
                onPress={() => update({ examDate: settings.examDate === c.iso ? null : c.iso })}
              />
            ))}
            <Chip
              label={t('noDateYet')}
              active={settings.examDate == null}
              onPress={() => update({ examDate: null })}
            />
          </View>
          {settings.examDate ? (
            <Txt variant="small" tone="muted">
              {formatDate(new Date(`${settings.examDate}T00:00:00`), locale)}
              {plan && plan.daysLeft > 0 ? ` · ${plan.daysLeft} ${t('daysToGo')}` : ''}
            </Txt>
          ) : null}
        </Card>

        {/* pace */}
        <Card style={{ gap: space.md }}>
          <Txt variant="heading">{t('setGoal')}</Txt>
          {GOAL_ORDER.map((g) => {
            const projected = forecast(deck, progress.cards, g);
            const active = settings.goal === g;
            return (
              <Pressable
                key={g}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => update({ goal: g })}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.md,
                  padding: space.md,
                  borderRadius: radius.md,
                  borderWidth: 2,
                  borderColor: active ? colors.success : colors.border,
                  backgroundColor: active ? colors.successBg : 'transparent',
                }}
              >
                <Ionicons
                  name={active ? 'radio-button-on' : 'radio-button-off'}
                  size={22}
                  color={active ? colors.success : colors.textFaint}
                />
                <View style={{ flex: 1 }}>
                  <Txt variant="bodyStrong">
                    {t(`goal${g[0].toUpperCase()}${g.slice(1)}` as GoalLabel)}
                  </Txt>
                  <Txt variant="small" tone="muted">
                    {GOALS[g].cards} {t('cardsADay')}
                  </Txt>
                </View>
                <Txt variant="caption" tone="faint">
                  {projected.reviewsLeft === 0 ? '✓' : formatDate(projected.readyDate, locale)}
                </Txt>
              </Pressable>
            );
          })}
        </Card>

        {/* booking */}
        <Card style={{ gap: space.md }}>
          <Txt variant="heading">{t('bookTitle')}</Txt>
          <Txt variant="small" tone="muted">
            {t('bookBody')}
          </Txt>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            <Fact text={t('factQuestions')} />
            <Fact text={t('factTime')} />
            <Fact text={t('factPass')} />
            <Fact text={t('factCost')} />
          </View>

          <Divider />

          <Txt variant="overline" tone="faint">
            {t('officialLinks').toUpperCase()}
          </Txt>
          <Link label={t('linkOverview')} url={locale === 'de' ? OFFICIAL.overviewDe : OFFICIAL.overviewEn} />
          <Link label={t('linkPractice')} url={OFFICIAL.practice} />
          {stateInfo ? (
            <Link label={`${t('linkCentres')} ${stateInfo.name}`} url={pruefstellenUrl(stateInfo.code)} />
          ) : (
            <Link label={t('linkCentresAll')} url={OFFICIAL.testCentre} />
          )}

          <View style={{ backgroundColor: colors.infoBg, borderRadius: radius.md, padding: space.md }}>
            <Txt variant="small" style={{ color: colors.info }}>
              {t('bookTip')}
            </Txt>
          </View>
          <Txt variant="caption" tone="faint">
            {EXAM_FACTS.catalogue} {t('questions').toLowerCase()} · {t('aboutBody')}
          </Txt>
        </Card>
      </ScrollView>
    </Screen>
  );
}

type GoalLabel = 'goalCasual' | 'goalRegular' | 'goalSerious' | 'goalIntense';

function Fact({ text }: { text: string }) {
  const { colors, radius, space } = useTheme();
  return (
    <View
      style={{
        paddingVertical: 6,
        paddingHorizontal: space.md,
        borderRadius: radius.pill,
        backgroundColor: colors.surfaceAlt,
      }}
    >
      <Txt variant="caption" tone="muted">
        {text}
      </Txt>
    </View>
  );
}

function Link({ label, url }: { label: string; url: string }) {
  const { colors, space } = useTheme();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => {
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
          return;
        }
        void Linking.openURL(url);
      }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        paddingVertical: space.sm,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Ionicons name="open-outline" size={18} color={colors.info} />
      <Txt variant="small" style={{ color: colors.info, flex: 1 }}>
        {label}
      </Txt>
    </Pressable>
  );
}
