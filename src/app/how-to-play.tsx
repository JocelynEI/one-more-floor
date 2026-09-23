import { StyleSheet, View } from 'react-native';
import { PASSENGER_TYPES } from '../game/types';
import { useAppState } from '../state/AppState';
import { AppText } from '../ui/components/AppText';
import { Card } from '../ui/components/Card';
import { Screen } from '../ui/components/Screen';
import { DestinationBadge } from '../ui/game/DestinationBadge';
import { PassengerFigure } from '../ui/game/PassengerFigure';
import { colors, fonts, radius, spacing } from '../ui/theme';

export default function HowToPlayScreen() {
  const { t } = useAppState();
  const copy = t.howToPlay;
  return (
    <Screen title={copy.title}>
      <Card>
        {copy.steps.map((step, index) => (
          <View key={step.title} style={styles.step}>
            <View style={styles.number}>
              <AppText style={styles.numberText}>{index + 1}</AppText>
            </View>
            <View style={styles.flex}>
              <AppText variant="h2">{step.title}</AppText>
              <AppText variant="body" color={colors.textSecondary}>
                {step.body}
              </AppText>
            </View>
            {index === 2 ? <DestinationBadge destination={6} goingUp size={24} patienceStep={16} /> : null}
          </View>
        ))}
      </Card>
      <Card title={copy.typesTitle}>
        {PASSENGER_TYPES.map((type) => (
          <View key={type} style={styles.type}>
            <View style={styles.figure}>
              <PassengerFigure type={type} look={type.length * 97} mood="happy" height={44} />
            </View>
            <AppText variant="body" style={styles.flex}>
              {copy.types[type]}
            </AppText>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  step: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', paddingVertical: spacing.xs },
  number: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: { fontFamily: fonts.black, color: colors.onAccent, fontSize: 16 },
  flex: { flex: 1 },
  type: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxs },
  figure: { width: 60, alignItems: 'center' },
});
