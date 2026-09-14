import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Illustration } from '@/components/Illustration';
import { Button, Card, Divider, Screen, Txt } from '@/components/ui';
import { EXAM_PASS, EXAM_TOTAL } from '@/lib/questions';
import { LoadingScreen, useAppReady } from '@/components/Loading';
import { useT } from '@/lib/useT';
import { useProgress } from '@/store/ProgressProvider';
import { useSettings } from '@/store/SettingsProvider';
import { useTheme } from '@/theme/ThemeProvider';

export default function ExamIntroScreen() {
  const { colors, space, radius } = useTheme();
  const { t, locale } = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { settings } = useSettings();
  const { progress } = useProgress();

  const best = progress.exams.reduce((max, e) => Math.max(max, e.correct), 0);

  const appReady = useAppReady();
  if (!appReady) return <LoadingScreen />;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + space.lg,
          paddingHorizontal: space.lg,
          paddingBottom: space.xxxl,
          gap: space.lg,
          maxWidth: 720,
          width: '100%',
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <Txt variant="display">{t('examIntro')}</Txt>

        <Card level={2} style={{ alignItems: 'center', gap: space.md, paddingVertical: space.xl }}>
          <Illustration name="topic-institutions" color={colors.accent} size={110} />
          <Txt variant="body" tone="muted" style={{ textAlign: 'center' }}>
            {t('examRules')}
          </Txt>
          <View style={{ flexDirection: 'row', gap: space.lg, marginTop: space.sm }}>
            <Fact value={String(EXAM_TOTAL)} label={t('questions')} />
            <Fact value="60" label="min" />
            <Fact value={String(EXAM_PASS)} label={locale === 'de' ? 'zum Bestehen' : 'to pass'} />
          </View>
        </Card>

        {settings.state == null ? (
          <Card
            style={{
              flexDirection: 'row',
              gap: space.md,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: colors.borderStrong,
              borderStyle: 'dashed',
            }}
          >
            <Ionicons name="information-circle" size={22} color={colors.textMuted} />
            <Txt variant="small" tone="muted" style={{ flex: 1 }}>
              {t('pickStateSub')}
            </Txt>
            <Button title={t('pickState')} variant="secondary" onPress={() => router.push('/(tabs)/you')} />
          </Card>
        ) : null}

        <Button
          title={t('startExam')}
          size="lg"
          full
          icon={<Ionicons name="play" size={18} color={colors.onAccent} />}
          onPress={() => router.push('/exam-session')}
        />

        <Card style={{ gap: space.md }}>
          <Txt variant="heading">{t('examHistory')}</Txt>
          {progress.exams.length === 0 ? (
            <Txt variant="small" tone="muted">
              {t('noExamsYet')}
            </Txt>
          ) : (
            progress.exams.slice(0, 8).map((e, i) => (
              <View key={e.at} style={{ gap: space.md }}>
                {i > 0 ? <Divider /> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                  <View
                    style={{
                      paddingVertical: 4,
                      paddingHorizontal: 10,
                      borderRadius: radius.pill,
                      backgroundColor: e.passed ? colors.successBg : colors.dangerBg,
                    }}
                  >
                    <Txt variant="caption" tone={e.passed ? 'success' : 'danger'}>
                      {e.passed ? t('passed') : t('failed')}
                    </Txt>
                  </View>
                  <Txt variant="body" style={{ flex: 1 }}>
                    {e.correct}/{e.total}
                  </Txt>
                  <Txt variant="caption" tone="faint">
                    {new Date(e.at).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB')}
                  </Txt>
                </View>
              </View>
            ))
          )}
          {best > 0 ? (
            <Txt variant="caption" tone="faint">
              {locale === 'de' ? 'Bestes Ergebnis' : 'Best score'}: {best}/{EXAM_TOTAL}
            </Txt>
          ) : null}
        </Card>
      </ScrollView>
    </Screen>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Txt variant="title">{value}</Txt>
      <Txt variant="caption" tone="muted">
        {label}
      </Txt>
    </View>
  );
}
