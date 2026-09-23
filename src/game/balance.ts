import type { PassengerType } from './types';

/**
 * Every gameplay number lives here so balancing never requires touching the systems.
 * Times are in seconds, distances in floors.
 */
export const DEFAULT_BALANCE = {
  tower: {
    floorCount: 10,
    initialActiveFloors: 5,
    /** Seconds of play after which every floor spawns passengers. */
    allFloorsActiveAt: 110,
  },
  elevator: {
    capacity: 4,
    maxSpeed: 4.4,
    acceleration: 13,
    doorTime: 0.16,
    transferTime: 0.2,
    /** Extra max-speed ratio per EXPRESS_LINE level on trips of `expressMinDistance` floors or more. */
    expressSpeedPerLevel: 0.4,
    expressMinDistance: 3,
  },
  patience: {
    initial: 25,
    minimum: 14,
    /** Patience given back to a tourist when it changes its mind, as a ratio of its max. */
    touristRefund: 0.25,
  },
  spawn: {
    initialInterval: 4.3,
    minimumInterval: 1.2,
    /** Seconds needed to go from the initial interval to the minimum one. */
    rampDuration: 330,
    /** Breathing: the interval oscillates around the curve so pressure comes in waves. */
    waveAmplitude: 0.22,
    wavePeriod: 42,
    maxWaitingPerFloor: 4,
    /** Waiting passengers allowed in the whole tower, per active floor. */
    maxWaitingPerActiveFloor: 1.6,
    firstSpawnDelay: 0.8,
  },
  passengerTypes: {
    standard: { unlockAt: 0, weight: 10, patience: 1, points: 1, size: 1, transfer: 1, stress: 1 },
    delivery: { unlockAt: 45, weight: 3, patience: 1.1, points: 1.6, size: 2, transfer: 1.2, stress: 1 },
    senior: { unlockAt: 75, weight: 3, patience: 1.6, points: 1.4, size: 1, transfer: 2.2, stress: 1 },
    vip: { unlockAt: 105, weight: 2, patience: 0.62, points: 3, size: 1, transfer: 1, stress: 1.7 },
    group: { unlockAt: 140, weight: 2, patience: 1, points: 2.2, size: 2, transfer: 1.3, stress: 1.4 },
    tourist: { unlockAt: 180, weight: 2, patience: 1.15, points: 1.5, size: 1, transfer: 1, stress: 1 },
  } satisfies Record<PassengerType, PassengerTypeSpec>,
  stress: {
    max: 100,
    perLostPassenger: 13,
    reliefPerDelivery: 1.5,
    warningThreshold: 70,
  },
  combo: {
    /** Deliveries in the chain needed to reach each multiplier. */
    tiers: [
      { chain: 0, multiplier: 1 },
      { chain: 3, multiplier: 2 },
      { chain: 7, multiplier: 3 },
      { chain: 12, multiplier: 5 },
      { chain: 18, multiplier: 8 },
    ],
    /** The chain resets if no delivery happens during this time. */
    timeout: 11,
    rushTierIndex: 3,
  },
  score: {
    basePoints: 10,
    /** Delivering a passenger who still had this ratio of patience at pickup gives the swift bonus. */
    swiftThreshold: 0.6,
    swiftBonus: 0.5,
    perfectFloorBonus: 30,
    perfectFloorMinBoarded: 2,
    fullDropBonus: 60,
    fullDropMinPassengers: 3,
    perfectRouteBonus: 120,
    perfectRouteLength: 6,
    hotFloorMultiplier: 2,
    vipEventMultiplier: 2,
  },
  events: {
    firstAt: 70,
    minGap: 32,
    maxGap: 46,
    announceTime: 2.2,
    rushHour: { duration: 13, spawnMultiplier: 2.3, cooldownCalm: 6 },
    maintenance: { duration: 14, transferMultiplier: 2.6 },
    doubleRush: { duration: 15, spawnFocus: 0.7 },
    express: { duration: 12, speedMultiplier: 1.6 },
    vipArrival: { duration: 16 },
  },
  upgrades: {
    /** Delivered passengers needed to trigger each upgrade choice; beyond the list the last gap repeats. */
    thresholds: [12, 26, 44, 66, 92, 122, 156],
    choices: 3,
    fastDoorsReduction: 0.22,
    turboSpeedBonus: 0.18,
    calmDrainReduction: 0.12,
    comboTimeoutBonus: 4,
    comboThresholdReduction: 0.2,
    stressReliefInstant: 18,
    stressReliefDeliveryBonus: 0.6,
    tipJarBonus: 0.3,
    vipLoungePatienceBonus: 0.35,
    vipLoungePointsBonus: 0.5,
  },
  economy: {
    pointsPerCoin: 150,
    deliveryCoin: 0.3,
    newRecordBonus: 25,
  },
  tutorial: {
    guideDrainMultiplier: 0.35,
  },
};

export interface PassengerTypeSpec {
  /** Seconds of play before this type can spawn. */
  unlockAt: number;
  weight: number;
  patience: number;
  points: number;
  /** Seats used in the cabin. */
  size: number;
  /** Multiplier on boarding / leaving time. */
  transfer: number;
  /** Multiplier on stress when this passenger gives up. */
  stress: number;
}

export type Balance = typeof DEFAULT_BALANCE;
