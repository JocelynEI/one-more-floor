import { GameEngine } from '../../src/game/engine';
import { placePassenger, quietBalance, runFor, runUntil } from './helpers';

function newEngine() {
  return new GameEngine({ balance: quietBalance(), seed: 42 });
}

describe('elevator movement', () => {
  it('travels to a requested floor and opens its doors', () => {
    const engine = newEngine();
    expect(engine.requestFloor(6)).toBe(true);
    const signals = runUntil(engine, () => engine.elevator.phase === 'exchanging' || engine.elevator.phase === 'closing');
    expect(engine.elevator.position).toBe(6);
    expect(signals.some((s) => s.type === 'arrive' && s.floor === 6)).toBe(true);
  });

  it('accelerates and decelerates instead of teleporting', () => {
    const engine = newEngine();
    engine.requestFloor(9);
    runFor(engine, 0.1);
    const early = Math.abs(engine.elevator.velocity);
    runFor(engine, 0.5);
    const cruising = Math.abs(engine.elevator.velocity);
    expect(early).toBeGreaterThan(0);
    expect(cruising).toBeGreaterThan(early);
    expect(engine.elevator.position).toBeLessThan(9);
  });

  it('retargets immediately while moving', () => {
    const engine = newEngine();
    engine.requestFloor(9);
    runFor(engine, 0.4);
    engine.requestFloor(2);
    runUntil(engine, () => engine.elevator.phase !== 'moving');
    expect(engine.elevator.position).toBe(2);
  });

  it('queues a destination requested while the doors are busy', () => {
    const engine = newEngine();
    placePassenger(engine, 0, 5);
    engine.requestFloor(0);
    runFor(engine, 0.05);
    expect(engine.elevator.phase).not.toBe('moving');
    engine.requestFloor(5);
    expect(engine.elevator.pendingTarget).toBe(5);
    runUntil(engine, () => engine.elevator.phase === 'moving');
    expect(engine.elevator.riders).toHaveLength(1);
  });

  it('survives extremely fast tapping', () => {
    const engine = newEngine();
    for (let i = 0; i < 500; i++) {
      engine.requestFloor(i % 10);
      engine.update(1 / 240);
    }
    expect(Number.isFinite(engine.elevator.position)).toBe(true);
    expect(engine.elevator.position).toBeGreaterThanOrEqual(0);
    expect(engine.elevator.position).toBeLessThanOrEqual(9);
  });

  it('ignores floors outside the tower', () => {
    const engine = newEngine();
    expect(engine.requestFloor(-1)).toBe(false);
    expect(engine.requestFloor(10)).toBe(false);
  });
});

describe('boarding and capacity', () => {
  it('never exceeds capacity', () => {
    const engine = newEngine();
    for (let i = 0; i < 6; i++) placePassenger(engine, 0, 4);
    engine.requestFloor(0);
    runUntil(engine, () => engine.elevator.phase === 'idle');
    expect(engine.elevator.riders).toHaveLength(4);
    expect(engine.waiting[0]).toHaveLength(2);
  });

  it('lets a smaller passenger board when a two-seat one does not fit', () => {
    const engine = newEngine();
    for (let i = 0; i < 3; i++) placePassenger(engine, 0, 4);
    placePassenger(engine, 0, 4, 'group');
    placePassenger(engine, 0, 4, 'standard');
    engine.requestFloor(0);
    runUntil(engine, () => engine.elevator.phase === 'idle');
    expect(engine.elevator.riders.map((r) => r.type)).toEqual(['standard', 'standard', 'standard', 'standard']);
    expect(engine.waiting[0][0].type).toBe('group');
  });

  it('delivers passengers at their destination and scores', () => {
    const engine = newEngine();
    placePassenger(engine, 0, 3);
    engine.requestFloor(0);
    runUntil(engine, () => engine.elevator.riders.length === 1);
    engine.requestFloor(3);
    const signals = runUntil(engine, () => engine.stats.delivered === 1);
    expect(engine.score).toBeGreaterThan(0);
    expect(signals.some((s) => s.type === 'delivered')).toBe(true);
  });

  it('opens by itself when a passenger appears at an idle cabin floor', () => {
    const engine = newEngine();
    placePassenger(engine, 0, 2);
    runUntil(engine, () => engine.elevator.riders.length === 1, 2);
  });
});

describe('patience, stress and game over', () => {
  it('a passenger who waits too long leaves and raises stress', () => {
    const engine = newEngine();
    placePassenger(engine, 5, 0, 'standard', 1);
    const signals = runFor(engine, 1.2);
    expect(engine.waiting[5]).toHaveLength(0);
    expect(engine.stress).toBeCloseTo(engine.balance.stress.perLostPassenger);
    expect(signals.some((s) => s.type === 'lost')).toBe(true);
  });

  it('VIPs add more stress when lost', () => {
    const engine = newEngine();
    placePassenger(engine, 5, 0, 'vip', 0.5);
    runFor(engine, 1);
    expect(engine.stress).toBeCloseTo(
      engine.balance.stress.perLostPassenger * engine.balance.passengerTypes.vip.stress,
    );
  });

  it('ends the game when stress reaches the maximum', () => {
    const engine = newEngine();
    const needed = Math.ceil(engine.balance.stress.max / engine.balance.stress.perLostPassenger);
    for (let i = 0; i < needed; i++) placePassenger(engine, 1 + (i % 9), 0, 'standard', 0.2);
    const signals = runFor(engine, 1);
    expect(engine.phase).toBe('over');
    expect(signals.filter((s) => s.type === 'gameOver')).toHaveLength(1);
    expect(engine.requestFloor(3)).toBe(false);
  });

  it('warns once when stress crosses the warning threshold', () => {
    const engine = newEngine();
    for (let i = 0; i < 6; i++) placePassenger(engine, 1 + i, 0, 'standard', 0.2);
    const signals = runFor(engine, 1);
    expect(signals.filter((s) => s.type === 'stressWarning')).toHaveLength(1);
  });

  it('riders never lose patience once inside', () => {
    const engine = newEngine();
    placePassenger(engine, 0, 9, 'standard', 3);
    runUntil(engine, () => engine.elevator.riders.length === 1);
    runFor(engine, 5);
    expect(engine.stats.lost).toBe(0);
  });
});

describe('tutorial', () => {
  it('guides through pickup and delivery, then starts the run', () => {
    const engine = new GameEngine({ balance: quietBalance(), seed: 1, tutorial: true });
    expect(engine.phase).toBe('tutorial');
    expect(engine.tutorialStep).toBe('tapFloor');
    runFor(engine, 5);
    expect(engine.waiting[2]).toHaveLength(1);

    engine.requestFloor(2);
    runUntil(engine, () => engine.tutorialStep === 'carry');
    engine.requestFloor(7);
    runUntil(engine, () => engine.tutorialStep === 'patience');
    expect(engine.stress).toBe(0);

    engine.requestFloor(5);
    runUntil(engine, () => engine.elevator.riders.length === 1);
    engine.requestFloor(0);
    runUntil(engine, () => engine.elevator.riders.some((r) => r.destination === 3));
    engine.requestFloor(3);
    runUntil(engine, () => engine.phase === 'playing');
    expect(engine.playTime).toBe(0);
  });

  it('can be skipped', () => {
    const engine = new GameEngine({ balance: quietBalance(), seed: 1, tutorial: true });
    engine.skipTutorial();
    expect(engine.phase).toBe('playing');
    expect(engine.tutorialStep).toBeNull();
  });
});

describe('full simulated runs', () => {
  it('an idle player eventually loses, with consistent stats', () => {
    const engine = new GameEngine({ seed: 7 });
    runUntil(engine, () => engine.phase === 'over', 900);
    const result = engine.result();
    expect(result.stats.lost).toBeGreaterThan(0);
    expect(result.stats.delivered).toBe(0);
    expect(result.score).toBe(0);
  });

  it('a simple greedy bot survives the opening minutes and scores', () => {
    const engine = new GameEngine({ seed: 11 });
    const frame = 1 / 60;
    for (let t = 0; t < 180 && engine.phase !== 'over'; t += frame) {
      if (engine.phase === 'upgrade') engine.chooseUpgrade(engine.upgradeOffer[0]);
      if (engine.elevator.phase === 'idle') {
        const rider = engine.elevator.riders[0];
        const waitingFloor = engine.waiting.findIndex((queue) => queue.length > 0);
        const target = rider ? rider.destination : waitingFloor;
        if (target >= 0) engine.requestFloor(target);
      }
      engine.update(frame);
      engine.consumeSignals();
    }
    expect(engine.stats.delivered).toBeGreaterThan(15);
    expect(engine.stats.upgradesTaken.length).toBeGreaterThan(0);
  });
});
