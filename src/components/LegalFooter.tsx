import React from 'react';
import { Linking, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Txt } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';

const links = [
  { label: 'Privacy', url: 'https://utpaldas.com/privacy' },
  { label: 'Impressum', url: 'https://utpaldas.com/impressum' },
];

export function LegalFooter() {
  const { colors, space } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space.lg, paddingHorizontal: space.md, paddingBottom: insets.bottom, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border }}>
      {links.map((link) => (
        <Pressable
          key={link.label}
          accessibilityRole="link"
          accessibilityLabel={link.label}
          onPress={() => void Linking.openURL(link.url)}
          style={{ minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.sm }}
        >
          <Txt variant="caption" tone="muted" style={{ textDecorationLine: 'underline' }}>{link.label}</Txt>
        </Pressable>
      ))}
    </View>
  );
}
