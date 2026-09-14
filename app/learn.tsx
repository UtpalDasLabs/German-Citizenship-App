import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingScreen, useAppReady } from '@/components/Loading';
import { MascotSays } from '@/components/Mascot';
import { Card, Screen, Txt } from '@/components/ui';
import { DEEP_DIVES, DIVES_BY_KEY, type DeepDive } from '@/data/deepDives';
import { meta } from '@/lib/questions';
import { useT } from '@/lib/useT';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The "understand it" half of the app. Reachable from any card that maps to an
 * explainer, and browsable as a list on its own.
 */
export default function LearnScreen() {
  const { colors, space, radius } = useTheme();
  const { t, locale } = useT();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ dive?: string }>();
  const [open, setOpen] = useState<string | null>(params.dive ?? null);

  const appReady = useAppReady();
  if (!appReady) return <LoadingScreen />;

  const active = open ? DIVES_BY_KEY[open] : null;

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
          <Pressable
            onPress={() => (active ? setOpen(null) : router.back())}
            accessibilityRole="button"
            accessibilityLabel={t('backHome')}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={28} color={colors.textFaint} />
          </Pressable>
          <Txt variant="title" style={{ flex: 1 }}>
            {active ? active.title[locale] : t('learnTitle')}
          </Txt>
        </View>

        {active ? (
          <Article dive={active} locale={locale} vocabLabel={t('vocabLabel')} />
        ) : (
          <>
            <MascotSays mood="thinking" size={84}>
              <Txt variant="bodyStrong">{t('learnTitle')}</Txt>
              <Txt variant="small" tone="muted">
                {t('learnBody')}
              </Txt>
            </MascotSays>

            {DEEP_DIVES.map((d) => (
              <Pressable
                key={d.key}
                accessibilityRole="button"
                onPress={() => setOpen(d.key)}
                style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
              >
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: radius.md,
                      backgroundColor: `${meta.topics[d.topic].color}22`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Txt variant="heading">{d.icon}</Txt>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Txt variant="bodyStrong">{d.title[locale]}</Txt>
                    <Txt variant="small" tone="muted">
                      {d.summary[locale]}
                    </Txt>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
                </Card>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function Article({
  dive,
  locale,
  vocabLabel,
}: {
  dive: DeepDive;
  locale: 'de' | 'en';
  vocabLabel: string;
}) {
  const { colors, radius, space } = useTheme();
  const tint = meta.topics[dive.topic].color;

  return (
    <View style={{ gap: space.lg }}>
      <View style={{ alignItems: 'center' }}>
        <Txt style={{ fontSize: 56, lineHeight: 64 }}>{dive.icon}</Txt>
      </View>

      {dive.body[locale].map((paragraph, i) => (
        <Txt key={i} variant="body" tone={i === 0 ? 'default' : 'muted'}>
          {paragraph}
        </Txt>
      ))}

      {dive.vocab?.length ? (
        <Card style={{ gap: space.sm, borderColor: tint }}>
          <Txt variant="overline" style={{ color: tint }}>
            {vocabLabel.toUpperCase()}
          </Txt>
          {dive.vocab.map((v) => (
            <View key={v.term} style={{ gap: 2 }}>
              <Txt variant="bodyStrong">{v.term}</Txt>
              <Txt variant="small" tone="muted">
                {v.gloss[locale]}
              </Txt>
            </View>
          ))}
        </Card>
      ) : null}

      <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.md, padding: space.md }}>
        <Txt variant="caption" tone="faint">
          {meta.topics[dive.topic].icon} {meta.topics[dive.topic].label[locale]}
        </Txt>
      </View>
    </View>
  );
}
