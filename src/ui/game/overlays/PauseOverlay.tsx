import { Animated, StyleSheet, View } from 'react-native';
import type { Translations } from '../../../i18n';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { useEntrance } from '../../components/useEntrance';
import { colors, maxContentWidth, radius, shadow, spacing } from '../../theme';

interface PauseOverlayProps {
  t: Translations;
  reduceMotion: boolean;
  bottomInset: number;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
}

export function PauseOverlay({ t, reduceMotion, bottomInset, onResume, onRestart, onQuit }: PauseOverlayProps) {
  const entrance = useEntrance(reduceMotion);
  return (
    <View style={[styles.scrim, { paddingBottom: bottomInset + spacing.lg }]} accessibilityViewIsModal>
      <Animated.View style={[styles.sheet, entrance]}>
        <AppText variant="h1" align="center" accessibilityRole="header">
          {t.pause.title}
        </AppText>
        <Button label={t.pause.resume} onPress={onResume} icon="play" size="lg" />
        <Button label={t.pause.restart} onPress={onRestart} variant="secondary" icon="replay" />
        <Button label={t.pause.quit} onPress={onQuit} variant="ghost" icon="home" sound="uiBack" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
  },
  sheet: {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow('high'),
  },
});
