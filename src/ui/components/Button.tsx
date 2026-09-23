import { StyleSheet, View } from 'react-native';
import type { SoundName } from '../../services/audio';
import { colors, radius, shadow, spacing, touchTarget } from '../theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'lg' | 'md';
  icon?: IconName;
  disabled?: boolean;
  sound?: SoundName | null;
  accessibilityHint?: string;
}

const VARIANTS: Record<Variant, { background: string; pressed: string; text: string; border?: string }> = {
  primary: { background: colors.accent, pressed: colors.accentPressed, text: colors.onAccent },
  secondary: { background: colors.surfacePressed, pressed: '#34445F', text: colors.textPrimary },
  ghost: { background: 'transparent', pressed: colors.surface, text: colors.textPrimary, border: colors.outline },
  danger: { background: colors.danger, pressed: '#E54852', text: '#2B0508' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  sound,
  accessibilityHint,
}: ButtonProps) {
  const palette = VARIANTS[variant];
  const large = size === 'lg';
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      sound={sound}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={[
        styles.base,
        large ? styles.large : styles.medium,
        { backgroundColor: palette.background, borderColor: palette.border ?? 'transparent' },
        variant === 'primary' && shadow('low'),
        disabled && styles.disabled,
      ]}
      pressedStyle={{ backgroundColor: palette.pressed }}
    >
      <View style={styles.content}>
        {icon ? <Icon name={icon} size={large ? 26 : 20} color={palette.text} /> : null}
        <AppText variant="button" color={palette.text} style={large && styles.largeLabel}>
          {label}
        </AppText>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  medium: { minHeight: touchTarget + 4 },
  large: { minHeight: 72, borderRadius: radius.xl },
  largeLabel: { fontSize: 24, lineHeight: 30, letterSpacing: 2 },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  disabled: { opacity: 0.4 },
});
