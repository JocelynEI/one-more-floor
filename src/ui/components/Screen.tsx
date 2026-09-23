import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppState } from '../../state/AppState';
import { colors, maxContentWidth, spacing } from '../theme';
import { AppText } from './AppText';
import { IconButton } from './IconButton';

interface ScreenProps {
  title: string;
  children: ReactNode;
  headerRight?: ReactNode;
}

export function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

/** Standard secondary screen: safe-area aware header with back button and a scrollable body. */
export function Screen({ title, children, headerRight }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const { t } = useAppState();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <IconButton icon="back" label={t.common.back} onPress={goBack} sound="uiBack" />
        <AppText variant="h2" style={styles.title} numberOfLines={1} accessibilityRole="header">
          {title}
        </AppText>
        <View style={styles.headerSide}>{headerRight}</View>
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  title: { flex: 1 },
  headerSide: { minWidth: 48, alignItems: 'flex-end' },
  content: { paddingHorizontal: spacing.md, paddingTop: spacing.xs },
  inner: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', gap: spacing.md },
});
