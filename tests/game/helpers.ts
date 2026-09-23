import { DEFAULT_BALANCE, type Balance } from '../../src/game/balance';
import { GameEngine } from '../../src/game/engine';
import type { GameSignal, PassengerType } from '../../src/game/types';

export function cloneBalance(): Balance {
  return JSON.parse(JSON.stringify(DEFAULT_BALANCE)) as Balance;
}

/** A balance with no random spawns so tests control every passenger. */
export function quietBalance(): Balance {
  const balance = cloneBalance();
  balance.spawn.firstSpawnDelay = 1e9;
  balance.spawn.initialInterval = 1e9;
  balance.spawn.minimumInterval = 1e9;
  balance.events.firstAt = 1e9;
  return balance;
}

export function runFor(engine: GameEngine, seconds: number, signals: GameSignal[] = []): GameSignal[] {
  const frame = 1 / 60;
  for (let t = 0; t < seconds; t += frame) {
    engine.update(frame);
    signals.push(...engine.consumeSignals());
  }
  return signals;
}

export function runUntil(
  engine: GameEngine,
  predicate: () => boolean,
  maxSeconds = 30,
  signals: GameSignal[] = [],
): GameSignal[] {
  const frame = 1 / 60;
  for (let t = 0; t < maxSeconds && !predicate(); t += frame) {
    engine.update(frame);
    signals.push(...engine.consumeSignals());
  }
  if (!predicate()) throw new Error(`Condition not met within ${maxSeconds}s`);
  return signals;
}

let manualId = 10_000;

/** Places a passenger directly in a floor queue. */
export function placePassenger(
  engine: GameEngine,
  origin: number,
  destination: number,
  type: PassengerType = 'standard',
  patience = 30,
) {
  const seats = engine.balance.passengerTypes[type].size;
  const passenger = {
    id: manualId++,
    type,
    origin,
    destination,
    patience,
    maxPatience: patience,
    patienceAtPickup: 1,
    seats,
    look: 1,
    changeMindAt: null,
    isEventVip: false,
  };
  engine.waiting[origin].push(passenger);
  return passenger;
}
