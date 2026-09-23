import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { format } from '../../i18n';
import { soundBoard } from '../../services/audio';
import { haptic } from '../../services/haptics';
import { useAppState } from '../../state/AppState';
import { colors, durations, nativeDriver, radius, spacing, touchTarget } from '../theme';
import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

interface RowProps {
  icon: IconName;
  label: string;
  hint?: string;
}

function RowLabel({ icon, label, hint }: RowProps) {
  return (
    <View style={styles.rowLabel}>
      <Icon name={icon} size={22} color={colors.textSecondary} />
      <View style={styles.rowText}>
        <AppText variant="body">{label}</AppText>
        {hint ? (
          <AppText variant="caption" color={colors.textMuted}>
            {hint}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

interface ToggleRowProps extends RowProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleRow({ value, onChange, ...row }: ToggleRowProps) {
  const [knob] = useState(() => new Animated.Value(value ? 1 : 0));
  const { save } = useAppState();
  useEffect(() => {
    Animated.timing(knob, {
      toValue: value ? 1 : 0,
      duration: save.settings.reduceMotion ? 0 : durations.fast,
      useNativeDriver: nativeDriver,
    }).start();
  }, [value, knob, save.settings.reduceMotion]);
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={row.label}
      accessibilityHint={row.hint}
      accessibilityState={{ checked: value }}
      onPress={() => {
        soundBoard.play('uiTap');
        haptic('tap');
        onChange(!value);
      }}
      style={styles.row}
    >
      <RowLabel {...row} />
      <View style={[styles.track, value && styles.trackOn]}>
        <Animated.View
          style={[styles.knob, { transform: [{ translateX: knob.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }] }]}
        />
      </View>
    </Pressable>
  );
}

const VOLUME_STEPS = [0, 0.25, 0.5, 0.75, 1];

interface VolumeRowProps extends RowProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

/** Five large segments instead of a thin slider: easier to hit with a thumb and to read. */
export function VolumeRow({ value, onChange, disabled, ...row }: VolumeRowProps) {
  const { t } = useAppState();
  const active = VOLUME_STEPS.reduce((best, step, index) =>
    Math.abs(step - value) < Math.abs(VOLUME_STEPS[best] - value) ? index : best, 0);
  const percent = Math.round(VOLUME_STEPS[active] * 100);
  return (
    <View
      style={[styles.volume, disabled && styles.disabled]}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={row.label}
      accessibilityValue={{ text: format(t.settings.volumeLevel, { percent }) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(event) => {
        const delta = event.nativeEvent.actionName === 'increment' ? 1 : -1;
        const next = Math.min(VOLUME_STEPS.length - 1, Math.max(0, active + delta));
        onChange(VOLUME_STEPS[next]);
      }}
    >
      <View style={styles.volumeHeader}>
        <RowLabel {...row} />
        <AppText variant="caption" color={colors.textSecondary}>
          {format(t.settings.volumeLevel, { percent })}
        </AppText>
      </View>
      <View style={styles.segments}>
        {VOLUME_STEPS.map((step, index) => (
          <Pressable
            key={step}
            disabled={disabled}
            importantForAccessibility="no"
            onPress={() => {
              haptic('tap');
              onChange(step);
              soundBoard.play('uiTap');
            }}
            style={styles.segmentHit}
          >
            <View style={[styles.segment, index <= active && index > 0 && styles.segmentOn, index === 0 && styles.segmentZero, index === 0 && active === 0 && styles.segmentZeroOn]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

interface SegmentedRowProps<T extends string> extends RowProps {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

export function SegmentedRow<T extends string>({ value, options, onChange, ...row }: SegmentedRowProps<T>) {
  return (
    <View style={styles.volume}>
      <RowLabel {...row} />
      <View style={styles.segmented} accessibilityRole="radiogroup">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <PressableScale
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={option.label}
              containerStyle={styles.optionContainer}
              style={[styles.option, selected && styles.optionSelected]}
              pressedStyle={!selected && styles.optionPressed}
            >
              <AppText variant="caption" color={selected ? colors.onAccent : colors.textPrimary} align="center">
                {option.label}
              </AppText>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

interface LinkRowProps extends RowProps {
  onPress: () => void;
  tone?: 'default' | 'danger';
}

export function LinkRow({ onPress, tone = 'default', ...row }: LinkRowProps) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={row.label}
      accessibilityHint={row.hint}
      style={styles.row}
      pressedStyle={styles.rowPressed}
      pressedScale={0.98}
    >
      <RowLabel {...row} />
      <View style={styles.chevron}>
        <Icon name={tone === 'danger' ? 'trash' : 'back'} size={18} color={tone === 'danger' ? colors.danger : colors.textMuted} />
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: touchTarget + 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.xxs,
  },
  rowPressed: { backgroundColor: colors.surfaceRaised },
  rowLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
  rowText: { flex: 1 },
  track: {
    width: 52,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.surfacePressed,
    padding: 4,
    justifyContent: 'center',
  },
  trackOn: { backgroundColor: colors.success },
  knob: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.textPrimary },
  volume: { gap: spacing.xs, paddingVertical: spacing.xxs },
  volumeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  segments: { flexDirection: 'row', gap: spacing.xxs },
  segmentHit: { flex: 1, height: touchTarget, justifyContent: 'center' },
  segment: { height: 14, borderRadius: radius.sm, backgroundColor: colors.surfacePressed },
  segmentOn: { backgroundColor: colors.accent },
  segmentZero: { height: 14, borderWidth: 2, borderColor: colors.surfacePressed, backgroundColor: 'transparent' },
  segmentZeroOn: { borderColor: colors.textSecondary },
  disabled: { opacity: 0.45 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundDeep,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  option: {
    flex: 1,
    minHeight: touchTarget - 4,
    borderRadius: radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  optionContainer: { flex: 1 },
  optionSelected: { backgroundColor: colors.accent },
  optionPressed: { backgroundColor: colors.surfaceRaised },
  chevron: { transform: [{ rotate: '180deg' }] },
});
