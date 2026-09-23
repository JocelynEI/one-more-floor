import type { Balance } from './balance';
import type { Random } from './random';
import type { Passenger, PassengerType } from './types';

export interface PassengerSpawn {
  id: number;
  type: PassengerType;
  origin: number;
  destination: number;
  patience: number;
  isEventVip?: boolean;
}

export function createPassenger(spawn: PassengerSpawn, balance: Balance, random: Random): Passenger {
  const spec = balance.passengerTypes[spawn.type];
  return {
    id: spawn.id,
    type: spawn.type,
    origin: spawn.origin,
    destination: spawn.destination,
    patience: spawn.patience,
    maxPatience: spawn.patience,
    patienceAtPickup: 1,
    seats: spec.size,
    look: random.int(0, 1_000_000),
    changeMindAt: spawn.type === 'tourist' ? random.range(0.35, 0.65) : null,
    isEventVip: spawn.isEventVip ?? false,
  };
}

export function patienceRatio(passenger: Passenger): number {
  return passenger.maxPatience > 0 ? Math.max(0, passenger.patience / passenger.maxPatience) : 0;
}

/** Picks a destination different from `exclude`, favouring the lobby a little like a real tower. */
export function pickDestination(activeFloors: number, exclude: number[], random: Random): number {
  const candidates = Array.from({ length: activeFloors }, (_, floor) => floor).filter(
    (floor) => !exclude.includes(floor),
  );
  return random.weighted(candidates, (floor) => (floor === 0 ? 1.6 : 1));
}
