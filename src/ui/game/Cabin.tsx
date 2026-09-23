import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { floorLabel } from '../../i18n';
import type { ElevatorSkin } from '../../meta/cosmetics';
import { Icon } from '../components/Icon';
import { floorPalette, fonts } from '../theme';
import { DestinationBadge } from './DestinationBadge';

export interface CabinRider {
  id: number;
  destination: number;
  seats: number;
}

interface CabinProps {
  skin: ElevatorSkin;
  width: number;
  height: number;
  doorOpen: number;
  riders: CabinRider[];
  capacity: number;
  floor: number;
  direction: -1 | 0 | 1;
  /** Glow intensity 0..1, e.g. on arrival. */
  glow?: number;
}

/**
 * The lift cabin: floor display on top, lit interior with sliding doors, and one slot per
 * seat drawn in front of the doors so riders' destinations stay readable at all times.
 */
export const Cabin = memo(function Cabin({
  skin,
  width,
  height,
  doorOpen,
  riders,
  capacity,
  floor,
  direction,
  glow = 0,
}: CabinProps) {
  const displayHeight = Math.max(12, Math.round(height * 0.2));
  const interiorHeight = height - displayHeight - 6;
  const interiorWidth = width - 6;
  const columns = capacity > 4 ? Math.ceil(capacity / 2) : capacity;
  const rows = Math.ceil(capacity / columns);
  const slot = Math.min((interiorWidth - 6) / columns, (interiorHeight - 4) / rows);
  const badge = Math.max(10, slot - 5);
  const seats = seatLayout(riders, capacity);
  const doorWidth = (interiorWidth / 2) * (1 - doorOpen);

  return (
    <View
      style={[
        styles.frame,
        {
          width,
          height,
          backgroundColor: skin.frame,
          borderColor: skin.frameEdge,
          boxShadow: `0px 0px ${Math.round(8 + glow * 14)}px ${skin.glow}${glowAlpha(glow)}`,
        },
      ]}
    >
      <View style={[styles.display, { height: displayHeight }]}>
        {direction !== 0 ? <Icon name={direction > 0 ? 'up' : 'down'} size={displayHeight * 0.8} color={skin.accent} /> : null}
        <Text style={[styles.displayText, { color: skin.accent, fontSize: displayHeight * 0.78 }]} allowFontScaling={false}>
          {floorLabel(floor)}
        </Text>
      </View>
      <View style={[styles.interior, { width: interiorWidth, height: interiorHeight, backgroundColor: skin.interior }]}>
        <View style={[styles.light, { backgroundColor: skin.light }]} />
        <View style={[styles.door, styles.doorLeft, { width: doorWidth, backgroundColor: skin.door, borderRightColor: skin.doorSeam }]} />
        <View style={[styles.door, styles.doorRight, { width: doorWidth, backgroundColor: skin.door, borderLeftColor: skin.doorSeam }]} />
        <View style={[styles.seats, { width: columns * slot }]}>
          {seats.map((seat, index) => (
            <View key={index} style={[styles.slot, { width: slot, height: slot }]}>
              {seat.kind === 'badge' ? (
                <DestinationBadge destination={seat.destination} goingUp={seat.destination > floor} size={badge} patienceStep={null} />
              ) : seat.kind === 'extra' ? (
                <View
                  style={[
                    styles.extraSeat,
                    { width: badge * 0.7, height: badge * 0.7, backgroundColor: floorPalette[seat.destination % floorPalette.length] },
                  ]}
                />
              ) : (
                <View style={[styles.emptySeat, { width: badge * 0.42, height: badge * 0.42, borderColor: skin.doorSeam }]} />
              )}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});

function glowAlpha(glow: number): string {
  const alpha = Math.round((0.3 + Math.min(1, glow) * 0.5) * 255);
  return alpha.toString(16).padStart(2, '0');
}

type Seat = { kind: 'badge'; destination: number } | { kind: 'extra'; destination: number } | { kind: 'empty' };

function seatLayout(riders: CabinRider[], capacity: number): Seat[] {
  const seats: Seat[] = [];
  for (const rider of riders) {
    seats.push({ kind: 'badge', destination: rider.destination });
    for (let i = 1; i < rider.seats; i++) seats.push({ kind: 'extra', destination: rider.destination });
  }
  while (seats.length < capacity) seats.push({ kind: 'empty' });
  return seats.slice(0, capacity);
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 2,
    borderRadius: 7,
    alignItems: 'center',
  },
  display: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 1 },
  displayText: { fontFamily: fonts.black, fontVariant: ['tabular-nums'] },
  interior: { borderRadius: 4, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  light: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, opacity: 0.9 },
  seats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  slot: { alignItems: 'center', justifyContent: 'center' },
  extraSeat: { borderRadius: 999, opacity: 0.75 },
  emptySeat: { borderRadius: 999, borderWidth: 1.5, opacity: 0.6 },
  door: { position: 'absolute', top: 0, bottom: 0, opacity: 0.58 },
  doorLeft: { left: 0, borderRightWidth: 1.5 },
  doorRight: { right: 0, borderLeftWidth: 1.5 },
});
