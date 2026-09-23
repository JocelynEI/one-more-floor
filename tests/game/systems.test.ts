import { DEFAULT_BALANCE } from '../../src/game/balance';
import { ComboTracker } from '../../src/game/combo';
import {
  activeFloorCount,
  basePatience,
  spawnInterval,
  unlockedPassengerTypes,
} from '../../src/game/difficulty';
import { GameEngine } from '../../src/game/engine';
import { EventDirector } from '../../src/game/events';
import { Random } from '../../src/game/random';
import { computeModifiers, rollUpgradeOffer, upgradeThreshold, UPGRADES } from '../../src/game/upgrades';
import { cloneBalance, placePassenger, quietBalance, runFor, runUntil } from './helpers';

describe('combo', () => {
  it('climbs through the multiplier tiers', () => {
    const combo = new ComboTracker(DEFAULT_BALANCE);
    const multipliers = Array.from({ length: 18 }, () => combo.registerDelivery(1, 0).multiplier);
    expect(multipliers[0]).toBe(1);
    expect(multipliers[2]).toBe(2);
    expect(multipliers[6]).toBe(3);
    expect(multipliers[11]).toBe(5);
    expect(multipliers[17]).toBe(8);
  });

  it('expires after the timeout', () => {
    const combo = new ComboTracker(DEFAULT_BALANCE);
    combo.registerDelivery(1, 0);
    combo.registerDelivery(1, 0);
    expect(combo.tick(DEFAULT_BALANCE.combo.timeout - 0.1)).toBe(0);
    expect(combo.tick(0.2)).toBe(2);
    expect(combo.multiplier).toBe(1);
  });

  it('combo master lowers thresholds and extends the timer', () => {
    const combo = new ComboTracker(DEFAULT_BALANCE);
    combo.registerDelivery(0.8, 4);
    const update = combo.registerDelivery(0.8, 4);
    expect(update.multiplier).toBe(1);
    expect(combo.registerDelivery(0.8, 4).multiplier).toBe(2);
    expect(combo.tick(DEFAULT_BALANCE.combo.timeout + 3)).toBe(0);
  });

  it('a lost passenger breaks the chain in game', () => {
    const engine = new GameEngine({ balance: quietBalance(), seed: 3 });
    engine.combo.registerDelivery(1, 0);
    engine.combo.registerDelivery(1, 0);
    engine.combo.registerDelivery(1, 0);
    expect(engine.multiplier).toBe(2);
    placePassenger(engine, 4, 0, 'standard', 0.1);
    const signals = runFor(engine, 0.5);
    expect(engine.multiplier).toBe(1);
    expect(signals.some((s) => s.type === 'comboBroken' && s.chain === 3)).toBe(true);
  });
});

describe('difficulty curve', () => {
  it('spawns faster and with less patience over time', () => {
    expect(spawnInterval(300, DEFAULT_BALANCE)).toBeLessThan(spawnInterval(0, DEFAULT_BALANCE));
    expect(basePatience(400, DEFAULT_BALANCE)).toBeLessThan(basePatience(0, DEFAULT_BALANCE));
    expect(basePatience(10_000, DEFAULT_BALANCE)).toBeCloseTo(DEFAULT_BALANCE.patience.minimum);
  });

  it('opens floors progressively', () => {
    expect(activeFloorCount(0, DEFAULT_BALANCE)).toBe(DEFAULT_BALANCE.tower.initialActiveFloors);
    expect(activeFloorCount(1000, DEFAULT_BALANCE)).toBe(DEFAULT_BALANCE.tower.floorCount);
  });

  it('introduces passenger types one at a time', () => {
    expect(unlockedPassengerTypes(0, DEFAULT_BALANCE)).toEqual(['standard']);
    expect(unlockedPassengerTypes(1000, DEFAULT_BALANCE)).toHaveLength(6);
  });

  it('never spawns more than the tower can hold', () => {
    const engine = new GameEngine({ seed: 5 });
    runFor(engine, 60);
    for (const queue of engine.waiting) {
      expect(queue.length).toBeLessThanOrEqual(DEFAULT_BALANCE.spawn.maxWaitingPerFloor);
    }
  });

  it('never spawns a passenger whose destination is its origin', () => {
    const balance = cloneBalance();
    balance.stress.max = 1e9;
    const engine = new GameEngine({ balance, seed: 9 });
    const signals = runFor(engine, 240);
    const spawned = signals.filter((s) => s.type === 'spawned');
    expect(spawned.length).toBeGreaterThan(20);
    for (const signal of spawned) {
      if (signal.type === 'spawned') expect(signal.passenger.destination).not.toBe(signal.passenger.origin);
    }
  });
});

describe('events', () => {
  it('announces before starting and never repeats back to back', () => {
    const director = new EventDirector(DEFAULT_BALANCE, new Random(4));
    const kinds: string[] = [];
    let time = 0;
    let announcedBeforeStart = true;
    let lastAnnounced: string | null = null;
    while (time < 1500) {
      time += 0.1;
      const result = director.tick(0.1, time, 10, 10);
      if (result.announced) lastAnnounced = result.announced.kind;
      if (result.started) {
        announcedBeforeStart &&= lastAnnounced === result.started.kind;
        kinds.push(result.started.kind);
      }
    }
    expect(announcedBeforeStart).toBe(true);
    expect(kinds.length).toBeGreaterThan(10);
    for (let i = 1; i < kinds.length; i++) expect(kinds[i]).not.toBe(kinds[i - 1]);
  });

  it('never puts the ground floor under maintenance', () => {
    const director = new EventDirector(DEFAULT_BALANCE, new Random(8));
    for (let time = 0; time < 3000; time += 0.1) {
      const { started } = director.tick(0.1, time, 10, 10);
      if (started?.kind === 'maintenance') expect(started.floors[0]).toBeGreaterThan(0);
    }
  });
});

describe('upgrades', () => {
  it('offers three distinct upgrades from different families when possible', () => {
    const offer = rollUpgradeOffer({}, new Random(2), 3, true);
    expect(new Set(offer).size).toBe(3);
    const families = offer.map((id) => UPGRADES.find((u) => u.id === id)!.family);
    expect(new Set(families).size).toBe(3);
  });

  it('never offers a maxed upgrade or the VIP lounge before VIPs exist', () => {
    const levels = { fastDoors: 3, turboMotor: 3, expressLine: 2 };
    for (let seed = 0; seed < 50; seed++) {
      const offer = rollUpgradeOffer(levels, new Random(seed), 3, false);
      expect(offer).not.toContain('fastDoors');
      expect(offer).not.toContain('vipLounge');
    }
  });

  it('extra space increases capacity in game', () => {
    const engine = new GameEngine({ balance: quietBalance(), seed: 1 });
    engine.phase = 'upgrade';
    engine.upgradeOffer = ['extraSpace'];
    engine.chooseUpgrade('extraSpace');
    expect(engine.elevator.capacity).toBe(DEFAULT_BALANCE.elevator.capacity + 1);
    expect(engine.phase).toBe('playing');
  });

  it('modifiers stack as documented', () => {
    const modifiers = computeModifiers({ turboMotor: 2, calmAtmosphere: 1, tipJar: 1 }, DEFAULT_BALANCE);
    expect(modifiers.speedMultiplier).toBeCloseTo(1 + 2 * DEFAULT_BALANCE.upgrades.turboSpeedBonus);
    expect(modifiers.patienceDrainMultiplier).toBeCloseTo(1 - DEFAULT_BALANCE.upgrades.calmDrainReduction);
    expect(modifiers.coinMultiplier).toBeCloseTo(1 + DEFAULT_BALANCE.upgrades.tipJarBonus);
  });

  it('thresholds keep growing past the configured list', () => {
    const list = DEFAULT_BALANCE.upgrades.thresholds;
    expect(upgradeThreshold(0, DEFAULT_BALANCE)).toBe(list[0]);
    expect(upgradeThreshold(list.length + 2, DEFAULT_BALANCE)).toBeGreaterThan(list[list.length - 1]);
  });

  it('pauses the run to offer an upgrade at the first threshold', () => {
    const balance = quietBalance();
    balance.upgrades.thresholds = [1, 2];
    const engine = new GameEngine({ balance, seed: 1 });
    placePassenger(engine, 0, 1);
    engine.requestFloor(0);
    runUntil(engine, () => engine.elevator.riders.length === 1);
    engine.requestFloor(1);
    const signals = runUntil(engine, () => engine.phase === 'upgrade');
    expect(engine.upgradeOffer).toHaveLength(3);
    expect(signals.some((s) => s.type === 'upgradeOffered')).toBe(true);
    const before = engine.stats.duration;
    engine.update(1);
    expect(engine.stats.duration).toBe(before);
  });
});

describe('callouts', () => {
  it('FULL DROP when the whole cabin empties at once', () => {
    const engine = new GameEngine({ balance: quietBalance(), seed: 1 });
    for (let i = 0; i < 3; i++) placePassenger(engine, 0, 4);
    engine.requestFloor(0);
    runUntil(engine, () => engine.elevator.riders.length === 3);
    engine.requestFloor(4);
    const signals = runUntil(engine, () => engine.stats.delivered === 3 && engine.elevator.phase === 'idle');
    expect(signals.some((s) => s.type === 'callout' && s.kind === 'fullDrop')).toBe(true);
  });

  it('PERFECT FLOOR when a stop clears the whole queue', () => {
    const engine = new GameEngine({ balance: quietBalance(), seed: 1 });
    placePassenger(engine, 0, 4);
    placePassenger(engine, 0, 4);
    engine.requestFloor(0);
    const signals = runUntil(engine, () => engine.elevator.phase === 'idle' && engine.elevator.riders.length === 2);
    expect(signals.some((s) => s.type === 'callout' && s.kind === 'perfectFloor')).toBe(true);
  });
});
