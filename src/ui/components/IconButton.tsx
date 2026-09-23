import { StyleSheet } from 'react-native';
import type { SoundName } from '../../services/audio';
import { colors, radius, touchTarget } from '../theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

interface IconButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  sound?: SoundName | null;
  tone?: 'surface' | 'clear';
}

export function IconButton({ icon, label, onPress, sound, tone = 'surface' }: IconButtonProps) {
  return (
    <PressableScale
      onPress={onPress}
      sound={sound}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={[styles.base, tone === 'surface' && styles.surface]}
      pressedStyle={styles.pressed}
    >
      <Icon name={icon} size={22} color={colors.textPrimary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    width: touchTarget,
    height: touchTarget,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  surface: { backgroundColor: colors.surfaceRaised },
  pressed: { backgroundColor: colors.surfacePressed },
});
