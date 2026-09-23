import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { floorLabel } from '../../i18n';
import { colors, floorPalette, fonts } from '../theme';
import { Icon } from '../components/Icon';

/** Patience is quantised so a badge only re-renders a few times per second. */
export const PATIENCE_STEPS = 24;

interface DestinationBadgeProps {
  destination: number;
  goingUp: boolean;
  size: number;
  /** Quantised remaining patience, 0..PATIENCE_STEPS; null hides the ring (inside the cabin). */
  patienceStep: number | null;
  highlighted?: boolean;
}

function ringColor(ratio: number): string {
  if (ratio > 0.5) return colors.textPrimary;
  if (ratio > 0.25) return colors.warning;
  return colors.danger;
}

/**
 * Destination number + direction arrow on the floor colour. The ring around it is patience:
 * its length carries the information, the colour only reinforces it.
 */
export const DestinationBadge = memo(function DestinationBadge({
  destination,
  goingUp,
  size,
  patienceStep,
  highlighted,
}: DestinationBadgeProps) {
  const ratio = patienceStep === null ? 1 : patienceStep / PATIENCE_STEPS;
  const ring = size + 6;
  const radius = ring / 2 - 1.8;
  const circumference = 2 * Math.PI * radius;
  return (
    <View style={{ width: ring, height: ring }}>
      {patienceStep !== null ? (
        <Svg width={ring} height={ring} style={StyleSheet.absoluteFill}>
          <Circle cx={ring / 2} cy={ring / 2} r={radius} stroke="rgba(0,0,0,0.45)" strokeWidth={3} fill="none" />
          <Circle
            cx={ring / 2}
            cy={ring / 2}
            r={radius}
            stroke={ringColor(ratio)}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference * ratio} ${circumference}`}
            transform={`rotate(-90 ${ring / 2} ${ring / 2})`}
          />
        </Svg>
      ) : null}
      <View
        style={[
          styles.badge,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            top: 3,
            left: 3,
            backgroundColor: floorPalette[destination % floorPalette.length],
          },
          highlighted && styles.highlighted,
        ]}
      >
        <Text style={[styles.number, { fontSize: size * 0.5, lineHeight: size * 0.58 }]} allowFontScaling={false}>
          {floorLabel(destination)}
        </Text>
        <View style={[styles.arrow, { right: -size * 0.22, top: -size * 0.12 }]}>
          <Icon name={goingUp ? 'up' : 'down'} size={size * 0.46} color={colors.textPrimary} />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  number: { fontFamily: fonts.black, color: '#0B111B', fontVariant: ['tabular-nums'] },
  arrow: {
    position: 'absolute',
    backgroundColor: colors.backgroundDeep,
    borderRadius: 999,
    padding: 1,
  },
  highlighted: { borderWidth: 2, borderColor: colors.textPrimary },
});
