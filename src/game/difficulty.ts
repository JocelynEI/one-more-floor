import type { Balance } from './balance';
import { PASSENGER_TYPES, type PassengerType } from './types';

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/** Overall pressure from 0 (calm start) to 1 (full difficulty). */
export function difficultyProgress(playTime: number, balance: Balance): number {
  return smoothstep(playTime / balance.spawn.rampDuration);
}

/**
 * Seconds between two spawns. The base curve tightens with time and a slow wave adds
 * breathing moments so pressure is felt in rises and falls rather than a flat ramp.
 */
export function spawnInterval(playTime: number, balance: Balance): number {
  const s = balance.spawn;
  const base = lerp(s.initialInterval, s.minimumInterval, difficultyProgress(playTime, balance));
  const waveStrength = s.waveAmplitude * clamp01(playTime / 60);
  const wave = 1 + waveStrength * Math.sin((2 * Math.PI * playTime) / s.wavePeriod);
  return base * wave;
}

export function basePatience(playTime: number, balance: Balance): number {
  return lerp(balance.patience.initial, balance.patience.minimum, difficultyProgress(playTime, balance));
}

export function activeFloorCount(playTime: number, balance: Balance): number {
  const { floorCount, initialActiveFloors, allFloorsActiveAt } = balance.tower;
  const t = clamp01(playTime / allFloorsActiveAt);
  return Math.min(floorCount, Math.round(lerp(initialActiveFloors, floorCount, t)));
}

export function unlockedPassengerTypes(playTime: number, balance: Balance): PassengerType[] {
  return PASSENGER_TYPES.filter((type) => balance.passengerTypes[type].unlockAt <= playTime);
}

export function maxWaitingInTower(playTime: number, balance: Balance): number {
  return Math.ceil(activeFloorCount(playTime, balance) * balance.spawn.maxWaitingPerActiveFloor);
}
