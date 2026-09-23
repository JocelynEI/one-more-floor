import { StyleSheet, View } from 'react-native';
import { format } from '../../i18n';
import { useAppState } from '../../state/AppState';
import { colors, radius, spacing } from '../theme';
import { AppText } from './AppText';
import { Icon } from './Icon';

export function CoinBadge({ amount }: { amount: number }) {
  const { t } = useAppState();
  return (
    <View style={styles.badge} accessible accessibilityLabel={format(t.a11y.coins, { coins: amount })}>
      <Icon name="coin" size={20} color={colors.combo} />
      <AppText variant="caption" style={styles.value}>
        {amount.toLocaleString()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs + 2,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.pill,
    paddingVertical: spacing.xxs + 2,
    paddingLeft: spacing.xs,
    paddingRight: spacing.sm,
    minHeight: 36,
  },
  value: { fontFamily: 'Inter_800ExtraBold', fontVariant: ['tabular-nums'] },
});
