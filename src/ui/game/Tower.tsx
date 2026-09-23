import { memo, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameEngine } from '../../game/engine';
import { patienceRatio } from '../../game/passengers';
import type { Passenger } from '../../game/types';
import { floorLabel, format, type Translations } from '../../i18n';
import type { ElevatorSkin } from '../../meta/cosmetics';
import { Icon } from '../components/Icon';
import { colors, floorPalette, fonts, textShadow } from '../theme';
import { Cabin, type CabinRider } from './Cabin';
import { DestinationBadge, PATIENCE_STEPS } from './DestinationBadge';
import { computeTowerLayout, figureWidth, floorTop, type TowerLayout } from './layout';
import { moodFor, PassengerFigure } from './PassengerFigure';
import type { SceneFx } from './sceneFx';

interface TowerProps {
  engine: GameEngine;
  fx: SceneFx;
  skin: ElevatorSkin;
  width: number;
  height: number;
  reduceMotion: boolean;
  t: Translations;
  onFloorPress: (floor: number) => void;
  onLayout: (layout: TowerLayout) => void;
}

/** The playfield: floors (each one a big tap target), the shaft with the cabin, queues and effects. */
export function Tower({ engine, fx, skin, width, height, reduceMotion, t, onFloorPress, onLayout }: TowerProps) {
  const layout = useMemo(() => computeTowerLayout(width, height, engine.floorCount), [width, height, engine.floorCount]);
  onLayout(layout);

  const elevator = engine.elevator;
  const dropFloors = new Set(elevator.riders.map((rider) => rider.destination));
  const liveEvent = engine.events.active && engine.events.active.announceLeft <= 0 ? engine.events.active : null;
  const maintenance = liveEvent?.kind === 'maintenance' ? liveEvent.floors : [];
  const hotFloors = liveEvent?.kind === 'doubleRush' ? liveEvent.floors : [];
  const focus = engine.tutorialFocusFloor;
  const shakeX = reduceMotion ? 0 : Math.sin(engine.stats.duration * 70) * fx.shake * 5;

  const floors = [];
  for (let floor = engine.floorCount - 1; floor >= 0; floor--) {
    floors.push(
      <FloorRow
        key={floor}
        floor={floor}
        layout={layout}
        active={engine.isFloorActive(floor)}
        waiting={engine.waiting[floor].length}
        isDrop={dropFloors.has(floor)}
        maintenance={maintenance.includes(floor)}
        hot={hotFloors.includes(floor)}
        focused={focus === floor}
        flash={fx.tapFloor === floor ? fx.tapFlash : 0}
        t={t}
        onPress={onFloorPress}
      />,
    );
  }

  return (
    <View style={[styles.tower, { width, height, transform: [{ translateX: shakeX }] }]}>
      {floors}
      <Shaft layout={layout} />
      <CabinLayer engine={engine} fx={fx} layout={layout} skin={skin} reduceMotion={reduceMotion} t={t} />
      {engine.waiting.map((queue, floor) =>
        queue.map((passenger) => (
          <WaitingPassenger
            key={passenger.id}
            passenger={passenger}
            x={fx.queueX.get(passenger.id) ?? layout.width}
            top={floorTop(layout, floor)}
            layout={layout}
            patienceStep={Math.ceil(patienceRatio(passenger) * PATIENCE_STEPS)}
          />
        )),
      )}
      <EffectsLayer fx={fx} layout={layout} />
    </View>
  );
}

interface FloorRowProps {
  floor: number;
  layout: TowerLayout;
  active: boolean;
  waiting: number;
  isDrop: boolean;
  maintenance: boolean;
  hot: boolean;
  focused: boolean;
  flash: number;
  t: Translations;
  onPress: (floor: number) => void;
}

const FloorRow = memo(function FloorRow({
  floor,
  layout,
  active,
  waiting,
  isDrop,
  maintenance,
  hot,
  focused,
  flash,
  t,
  onPress,
}: FloorRowProps) {
  const color = floorPalette[floor % floorPalette.length];
  const labelSize = Math.min(30, layout.rowHeight * 0.52);
  return (
    <Pressable
      onPressIn={() => onPress(floor)}
      accessibilityRole="button"
      accessibilityLabel={format(t.a11y.floorButton, { floor: floorLabel(floor), waiting })}
      style={[
        styles.floor,
        { top: floorTop(layout, floor), height: layout.rowHeight, width: layout.width },
        floor % 2 === 0 && styles.floorAlt,
      ]}
    >
      {flash > 0 ? <View style={[StyleSheet.absoluteFill, styles.flash, { opacity: flash * 0.18 }]} /> : null}
      {hot ? <View style={[StyleSheet.absoluteFill, styles.hot]} /> : null}
      {maintenance ? <View style={[StyleSheet.absoluteFill, styles.maintenance]} /> : null}
      <View style={[styles.label, { width: layout.labelWidth, opacity: active || isDrop || focused ? 1 : 0.35 }]}>
        <View
          style={[
            styles.labelDisc,
            { width: labelSize, height: labelSize, borderColor: color },
            isDrop && { backgroundColor: color },
          ]}
        >
          <Text
            allowFontScaling={false}
            style={[styles.labelText, { fontSize: labelSize * 0.5, color: isDrop ? '#0B111B' : colors.textPrimary }]}
          >
            {floorLabel(floor)}
          </Text>
        </View>
      </View>
      {maintenance ? (
        <View style={[styles.floorTag, { left: layout.lobbyX + layout.lobbyWidth - 30 }]}>
          <Icon name="wrench" size={18} color={colors.warning} />
        </View>
      ) : null}
      {hot ? (
        <View style={[styles.floorTag, styles.hotTag, { left: layout.lobbyX + layout.lobbyWidth - 34 }]}>
          <Text style={styles.hotText} allowFontScaling={false}>
            x2
          </Text>
        </View>
      ) : null}
      {focused ? <View style={[StyleSheet.absoluteFill, styles.focus]} /> : null}
      <View style={styles.floorLine} />
    </Pressable>
  );
});

const Shaft = memo(function Shaft({ layout }: { layout: TowerLayout }) {
  return (
    <View
      style={[styles.shaft, { left: layout.shaftX, width: layout.shaftWidth, height: layout.height }]}
    >
      <View style={[styles.rail, { left: 3 }]} />
      <View style={[styles.rail, { right: 3 }]} />
    </View>
  );
});

interface CabinLayerProps {
  engine: GameEngine;
  fx: SceneFx;
  layout: TowerLayout;
  skin: ElevatorSkin;
  reduceMotion: boolean;
  t: Translations;
}

function CabinLayer({ engine, fx, layout, skin, reduceMotion, t }: CabinLayerProps) {
  const elevator = engine.elevator;
  const top = (layout.floorCount - 1 - elevator.position) * layout.rowHeight + 3;
  const speed = Math.abs(elevator.velocity);
  const direction: -1 | 0 | 1 =
    elevator.phase === 'moving' ? (elevator.target > elevator.position ? 1 : -1) : 0;
  const settle = reduceMotion ? 0 : 1 - fx.cabinPulse;
  const stretch = reduceMotion ? 0 : Math.min(0.06, speed * 0.008);
  const scaleY = 1 + stretch - settle * 0.07;
  const scaleX = 1 - stretch * 0.5 + settle * 0.04;
  const trailLength = Math.min(layout.rowHeight * 1.6, speed * layout.rowHeight * 0.3);
  const riders: CabinRider[] = elevator.riders;
  const cableX = layout.shaftX + layout.shaftWidth / 2;
  const floor = Math.round(elevator.position);
  return (
    <>
      <View style={[styles.cable, { left: cableX - 1, height: Math.max(0, top) }]} />
      {trailLength > 2 && !reduceMotion ? (
        <View
          style={[
            styles.trail,
            {
              left: layout.shaftX + 8,
              width: layout.shaftWidth - 16,
              height: trailLength,
              top: direction > 0 ? top + layout.cabinHeight : top - trailLength,
              backgroundColor: skin.glow,
            },
          ]}
        />
      ) : null}
      <View
        accessible
        accessibilityLabel={format(t.a11y.lift, { floor: floorLabel(floor), riders: riders.length })}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          left: layout.shaftX + 5,
          top,
          transform: [{ scaleX }, { scaleY }],
        }}
      >
        <Cabin
          skin={skin}
          width={layout.cabinWidth}
          height={layout.cabinHeight}
          doorOpen={elevator.doorOpen}
          riders={riders}
          capacity={elevator.capacity}
          floor={floor}
          direction={direction}
          glow={1 - fx.cabinPulse}
        />
      </View>
    </>
  );
}

interface WaitingPassengerProps {
  passenger: Passenger;
  x: number;
  top: number;
  layout: TowerLayout;
  patienceStep: number;
}

const WaitingPassenger = memo(function WaitingPassenger({ passenger, x, top, layout, patienceStep }: WaitingPassengerProps) {
  const ratio = patienceStep / PATIENCE_STEPS;
  const width = figureWidth(layout, passenger.type);
  const ring = layout.badgeSize + 6;
  return (
    <View
      style={[styles.passenger, { left: x, top: top + 1, width: Math.max(width, ring), height: layout.rowHeight - 2 }]}
    >
      <View style={[styles.passengerBadge, passenger.isEventVip && styles.eventVip]}>
        <DestinationBadge
          destination={passenger.destination}
          goingUp={passenger.destination > passenger.origin}
          size={layout.badgeSize}
          patienceStep={patienceStep}
          highlighted={passenger.isEventVip}
        />
      </View>
      <View style={styles.passengerFigure}>
        <PassengerFigure type={passenger.type} look={passenger.look} mood={moodFor(ratio)} height={layout.figureHeight} />
      </View>
    </View>
  );
});

function EffectsLayer({ fx, layout }: { fx: SceneFx; layout: TowerLayout }) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.passThrough]}>
      {fx.walkers.map((walker) => (
        <View
          key={walker.id}
          style={[
            styles.walker,
            {
              left: walker.x,
              top: floorTop(layout, walker.floor) + layout.rowHeight - layout.figureHeight - 2,
              opacity: 1 - walker.age / walker.life,
            },
          ]}
        >
          <PassengerFigure type={walker.type} look={walker.look} mood={walker.mood} height={layout.figureHeight} />
        </View>
      ))}
      {fx.particles.map((particle, index) => (
        <View
          key={index}
          style={[
            styles.particle,
            {
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: 1 - particle.age / particle.life,
            },
          ]}
        />
      ))}
      {fx.texts.map((text) => {
        const progress = text.age / text.life;
        const punch = text.style === 'callout' ? 1 + Math.max(0, 0.35 - progress * 2.5) : 1;
        const opacity = progress < 0.75 ? 1 : 1 - (progress - 0.75) / 0.25;
        return (
          <Text
            key={text.id}
            allowFontScaling={false}
            style={[
              text.style === 'callout' ? styles.callout : styles.points,
              {
                color: text.color,
                fontSize: text.size,
                top: text.y - text.size,
                opacity,
                transform: [{ scale: punch }],
              },
              text.style === 'callout' ? { left: 0, right: 0 } : { left: text.x },
            ]}
          >
            {text.text}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tower: { overflow: 'hidden' },
  passThrough: { pointerEvents: 'none' },
  floor: { position: 'absolute', left: 0, flexDirection: 'row', alignItems: 'center' },
  floorAlt: { backgroundColor: 'rgba(255,255,255,0.018)' },
  floorLine: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, backgroundColor: colors.floorLine },
  flash: { backgroundColor: colors.accent },
  hot: { backgroundColor: 'rgba(255, 212, 90, 0.08)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255, 212, 90, 0.45)' },
  maintenance: { backgroundColor: 'rgba(255, 162, 76, 0.07)' },
  focus: { pointerEvents: 'none', borderWidth: 2, borderColor: colors.accent, borderRadius: 10 },
  label: { height: '100%', alignItems: 'center', justifyContent: 'center' },
  labelDisc: { borderRadius: 999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  labelText: { fontFamily: fonts.black, fontVariant: ['tabular-nums'] },
  floorTag: { position: 'absolute', top: 4 },
  hotTag: { backgroundColor: colors.combo, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  hotText: { fontFamily: fonts.black, fontSize: 12, color: colors.onCombo },
  shaft: {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    backgroundColor: colors.shaft,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1C2638',
  },
  rail: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#1F2A3E' },
  cable: { pointerEvents: 'none', position: 'absolute', top: 0, width: 2, backgroundColor: '#2C3950' },
  trail: { pointerEvents: 'none', position: 'absolute', opacity: 0.12, borderRadius: 6 },
  passenger: { pointerEvents: 'none', position: 'absolute', alignItems: 'center', justifyContent: 'space-between' },
  passengerBadge: { zIndex: 1 },
  passengerFigure: { marginTop: -4 },
  eventVip: { transform: [{ scale: 1.1 }] },
  walker: { position: 'absolute' },
  particle: { position: 'absolute', borderRadius: 2 },
  points: { position: 'absolute', fontFamily: fonts.black, ...textShadow(4, 0.6) },
  callout: {
    position: 'absolute',
    textAlign: 'center',
    fontFamily: fonts.black,
    letterSpacing: 1,
    ...textShadow(8, 0.7),
  },
});
