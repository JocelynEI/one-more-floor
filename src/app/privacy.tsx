import { StyleSheet, View } from 'react-native';
import { useAppState } from '../state/AppState';
import { AppText } from '../ui/components/AppText';
import { Card } from '../ui/components/Card';
import { Icon } from '../ui/components/Icon';
import { Screen } from '../ui/components/Screen';
import { colors, spacing } from '../ui/theme';

export default function PrivacyScreen() {
  const { t } = useAppState();
  const copy = t.privacy;
  return (
    <Screen title={copy.title}>
      <View style={styles.hero}>
        <Icon name="shield" size={48} color={colors.success} />
        <AppText variant="h2" align="center">
          {copy.intro}
        </AppText>
      </View>
      <Card>
        {copy.points.map((point) => (
          <View key={point} style={styles.point}>
            <Icon name="check" size={20} color={colors.success} />
            <AppText variant="body" style={styles.flex}>
              {point}
            </AppText>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  point: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', paddingVertical: spacing.xxs },
  flex: { flex: 1 },
});
