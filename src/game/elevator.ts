import type { ElevatorState } from './types';

const ARRIVAL_EPSILON = 0.004;

export function createElevator(capacity: number): ElevatorState {
  return {
    position: 0,
    velocity: 0,
    phase: 'idle',
    target: 0,
    pendingTarget: null,
    doorOpen: 0,
    phaseTimer: 0,
    riders: [],
    capacity,
  };
}

export function seatsUsed(elevator: ElevatorState): number {
  return elevator.riders.reduce((sum, rider) => sum + rider.seats, 0);
}

export function freeSeats(elevator: ElevatorState): number {
  return elevator.capacity - seatsUsed(elevator);
}

export function currentFloor(elevator: ElevatorState): number {
  return Math.round(elevator.position);
}

function moveToward(value: number, goal: number, maxDelta: number): number {
  if (Math.abs(goal - value) <= maxDelta) return goal;
  return value + Math.sign(goal - value) * maxDelta;
}

/**
 * Advances the cabin toward its target with acceleration and braking, so it eases out of
 * departures and settles into arrivals. Retargeting mid-trip brakes and reverses naturally.
 * Returns true on the step the cabin reaches its target.
 */
export function stepMotion(
  elevator: ElevatorState,
  dt: number,
  maxSpeed: number,
  acceleration: number,
): boolean {
  const distance = elevator.target - elevator.position;
  if (Math.abs(distance) < ARRIVAL_EPSILON && Math.abs(elevator.velocity) < 0.5) {
    elevator.position = elevator.target;
    elevator.velocity = 0;
    return true;
  }
  const direction = Math.sign(distance);
  const brakingSpeed = Math.sqrt(2 * acceleration * Math.abs(distance));
  const desired = direction * Math.min(maxSpeed, brakingSpeed);
  elevator.velocity = moveToward(elevator.velocity, desired, acceleration * dt);
  const next = elevator.position + elevator.velocity * dt;
  const overshot = Math.sign(elevator.target - next) !== direction && elevator.velocity * direction > 0;
  if (overshot || Math.abs(elevator.target - next) < ARRIVAL_EPSILON) {
    elevator.position = elevator.target;
    elevator.velocity = 0;
    return true;
  }
  elevator.position = next;
  return false;
}
