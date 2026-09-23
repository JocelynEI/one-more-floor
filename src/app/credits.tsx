import { StyleSheet, View } from 'react-native';
import { useAppState } from '../state/AppState';
import { AppText } from '../ui/components/AppText';
import { Card } from '../ui/components/Card';
import { LiftMark, Wordmark } from '../ui/components/Logo';
import { Screen } from '../ui/components/Screen';
import { colors, spacing } from '../ui/theme';

export default function CreditsScreen() {
  const { t } = useAppState();
  const copy = t.credits;
  const entries = [
    { label: copy.gameBy, value: copy.gameByValue },
    { label: copy.font, value: copy.fontValue },
    { label: copy.engine, value: copy.engineValue },
    { label: copy.sounds, value: copy.soundsValue },
  ];
  return (
    <Screen title={copy.title}>
      <View style={styles.hero}>
        <LiftMark size={72} />
        <Wordmark />
      </View>
      <Card>
        {entries.map((entry) => (
          <View key={entry.label} style={styles.entry}>
            <AppText variant="overline" color={colors.textSecondary}>
              {entry.label}
            </AppText>
            <AppText variant="body">{entry.value}</AppText>
          </View>
        ))}
      </Card>
      <AppText variant="h2" align="center" color={colors.accent}>
        {copy.thanks}
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  entry: { paddingVertical: spacing.xs, gap: 2 },
});
