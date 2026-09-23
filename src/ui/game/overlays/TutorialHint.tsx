import { Animated, StyleSheet, View } from 'react-native';
import type { TutorialStep } from '../../../game/types';
import { floorLabel, format, type Translations } from '../../../i18n';
import { AppText } from '../../components/AppText';
import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/PressableScale';
import { useEntrance } from '../../components/useEntrance';
import { colors, radius, shadow, spacing } from '../../theme';

interface TutorialHintProps {
  step: TutorialStep;
  focusFloor: number | null;
  t: Translations;
  reduceMotion: boolean;
  onSkip: () => void;
}

function hintText(step: TutorialStep, focusFloor: number | null, t: Translations): string {
  const floor = floorLabel(focusFloor ?? 0);
  switch (step) {
    case 'tapFloor':
      return format(t.tutorial.tapFloor, { floor });
    case 'carry':
      return format(t.tutorial.carry, { floor });
    case 'delivered':
      return t.tutorial.delivered;
    case 'patience':
      return t.tutorial.patience;
    case 'done':
      return t.tutorial.go;
  }
}

/** A single line of guidance at a time, keyed by step so each one animates in. */
export function TutorialHint({ step, focusFloor, t, reduceMotion, onSkip }: TutorialHintProps) {
  return (
    <View style={styles.wrap}>
      <HintBubble key={step} text={hintText(step, focusFloor, t)} reduceMotion={reduceMotion} />
      <PressableScale
        onPress={onSkip}
        accessibilityRole="button"
        accessibilityLabel={t.tutorial.skip}
        style={styles.skip}
        pressedStyle={styles.skipPressed}
        sound="uiBack"
      >
        <AppText variant="caption" color={colors.textSecondary}>
          {t.tutorial.skip}
        </AppText>
      </PressableScale>
    </View>
  );
}

function HintBubble({ text, reduceMotion }: { text: string; reduceMotion: boolean }) {
  const entrance = useEntrance(reduceMotion, 0, 12);
  return (
    <Animated.View style={[styles.bubble, entrance]} accessibilityLiveRegion="polite" accessible accessibilityLabel={text}>
      <Icon name="info" size={20} color={colors.accent} />
      <AppText variant="body" style={styles.text}>
        {text}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { pointerEvents: 'box-none', paddingHorizontal: spacing.md, gap: spacing.xs, alignItems: 'center' },
  bubble: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadow('low'),
  },
  text: { flex: 1 },
  skip: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipPressed: { backgroundColor: colors.surface },
});
