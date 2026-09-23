import type { Balance } from './balance';
import type { Random } from './random';
import { GAME_EVENT_KINDS, type ActiveGameEvent, type GameEventKind } from './types';

export interface EventTickResult {
  announced?: ActiveGameEvent;
  started?: ActiveGameEvent;
  ended?: GameEventKind;
}

/**
 * Schedules one temporary event at a time. Every event is announced before it takes effect
 * so the player always has time to react, and events never repeat back to back.
 */
export class EventDirector {
  active: ActiveGameEvent | null = null;
  survived = 0;
  private nextEventAt: number;
  private lastKind: GameEventKind | null = null;
  private calmUntil = 0;

  constructor(
    private readonly balance: Balance,
    private readonly random: Random,
  ) {
    this.nextEventAt = balance.events.firstAt;
  }

  /** True while an event is running (after its announcement). */
  isLive(kind: GameEventKind): boolean {
    return this.active?.kind === kind && this.active.announceLeft <= 0;
  }

  /** Breathing time after a rush: spawns slow down briefly. */
  isCalm(playTime: number): boolean {
    return playTime < this.calmUntil;
  }

  tick(dt: number, playTime: number, floorCount: number, activeFloors: number): EventTickResult {
    const active = this.active;
    if (active) {
      if (active.announceLeft > 0) {
        active.announceLeft -= dt;
        return active.announceLeft <= 0 ? { started: active } : {};
      }
      active.timeLeft -= dt;
      if (active.timeLeft > 0) return {};
      this.active = null;
      this.survived += 1;
      if (active.kind === 'rushHour') this.calmUntil = playTime + this.balance.events.rushHour.cooldownCalm;
      this.nextEventAt = playTime + this.random.range(this.balance.events.minGap, this.balance.events.maxGap);
      return { ended: active.kind };
    }
    if (playTime < this.nextEventAt) return {};
    this.active = this.createEvent(floorCount, activeFloors);
    return { announced: this.active };
  }

  private createEvent(floorCount: number, activeFloors: number): ActiveGameEvent {
    const kind = this.random.pick(GAME_EVENT_KINDS.filter((candidate) => candidate !== this.lastKind));
    this.lastKind = kind;
    const duration = this.durationOf(kind);
    const floorPool = Array.from({ length: Math.min(floorCount, activeFloors) }, (_, index) => index);
    let floors: number[] = [];
    if (kind === 'maintenance') floors = [this.random.pick(floorPool.slice(1))];
    if (kind === 'doubleRush') floors = this.random.shuffle(floorPool).slice(0, 2).sort((a, b) => a - b);
    return {
      kind,
      announceLeft: this.balance.events.announceTime,
      timeLeft: duration,
      duration,
      floors,
    };
  }

  private durationOf(kind: GameEventKind): number {
    const e = this.balance.events;
    switch (kind) {
      case 'rushHour':
        return e.rushHour.duration;
      case 'maintenance':
        return e.maintenance.duration;
      case 'vipArrival':
        return e.vipArrival.duration;
      case 'doubleRush':
        return e.doubleRush.duration;
      case 'express':
        return e.express.duration;
    }
  }
}
