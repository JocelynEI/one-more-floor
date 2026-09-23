import { DEFAULT_BALANCE, type Balance } from './balance';
import { ComboTracker } from './combo';
import {
  activeFloorCount,
  basePatience,
  maxWaitingInTower,
  spawnInterval,
  unlockedPassengerTypes,
} from './difficulty';
import { createElevator, currentFloor, freeSeats, stepMotion } from './elevator';
import { EventDirector } from './events';
import { createPassenger, patienceRatio, pickDestination } from './passengers';
import { Random } from './random';
import type {
  CalloutKind,
  ElevatorState,
  GameSignal,
  Passenger,
  PassengerType,
  RunResult,
  RunStats,
  TutorialStep,
  UpgradeId,
} from './types';
import { computeModifiers, rollUpgradeOffer, upgradeThreshold, type Modifiers, type UpgradeLevels } from './upgrades';

export type EnginePhase = 'tutorial' | 'playing' | 'upgrade' | 'over';

export interface EngineOptions {
  balance?: Balance;
  seed?: number;
  tutorial?: boolean;
}

const MAX_STEP = 1 / 60;
const TUTORIAL_START_FLOOR = 2;
const TUTORIAL_TARGET_FLOOR = 7;
const TUTORIAL_PAUSE_AFTER_DELIVERY = 1.6;

interface StopReport {
  floor: number;
  ridersAtArrival: number;
  unloaded: number;
  boarded: number;
}

/**
 * Pure simulation of one run. It knows nothing about rendering: the view calls `update`
 * every frame, reads the public state, and drains `signals` to play feedback.
 */
export class GameEngine {
  readonly balance: Balance;
  readonly floorCount: number;
  phase: EnginePhase;
  playTime = 0;
  score = 0;
  stress = 0;
  readonly waiting: Passenger[][];
  readonly elevator: ElevatorState;
  readonly combo: ComboTracker;
  readonly events: EventDirector;
  levels: UpgradeLevels = {};
  modifiers: Modifiers;
  upgradeOffer: UpgradeId[] = [];
  tutorialStep: TutorialStep | null;
  signals: GameSignal[] = [];
  readonly stats: RunStats = {
    delivered: 0,
    lost: 0,
    bestMultiplier: 1,
    bestChain: 0,
    upgradesTaken: [],
    eventsSurvived: 0,
    floorsTravelled: 0,
    duration: 0,
    callouts: 0,
  };

  private readonly random: Random;
  private nextPassengerId = 1;
  private spawnTimer: number;
  private upgradeIndex = 0;
  private perfectRouteStreak = 0;
  private stressWarned = false;
  private stop: StopReport | null = null;
  private tutorialTimer = 0;
  private tutorialPassengerIds = new Set<number>();

  constructor(options: EngineOptions = {}) {
    this.balance = options.balance ?? DEFAULT_BALANCE;
    this.random = new Random(options.seed ?? Date.now());
    this.floorCount = this.balance.tower.floorCount;
    this.waiting = Array.from({ length: this.floorCount }, () => []);
    this.modifiers = computeModifiers(this.levels, this.balance);
    this.elevator = createElevator(this.balance.elevator.capacity);
    this.combo = new ComboTracker(this.balance);
    this.events = new EventDirector(this.balance, this.random);
    this.spawnTimer = this.balance.spawn.firstSpawnDelay;
    this.phase = options.tutorial ? 'tutorial' : 'playing';
    this.tutorialStep = options.tutorial ? 'tapFloor' : null;
    if (options.tutorial) this.startTutorial();
  }

  get activeFloors(): number {
    return activeFloorCount(this.playTime, this.balance);
  }

  get multiplier(): number {
    return this.combo.multiplier;
  }

  get comboTimeRatio(): number {
    return this.combo.timeRatio(this.modifiers.comboTimeoutBonus);
  }

  /** Floor the tutorial currently points at, if any. */
  get tutorialFocusFloor(): number | null {
    if (this.tutorialStep === 'tapFloor') return TUTORIAL_START_FLOOR;
    if (this.tutorialStep === 'carry') return TUTORIAL_TARGET_FLOOR;
    return null;
  }

  isFloorActive(floor: number): boolean {
    return floor < this.activeFloors || this.waiting[floor].length > 0;
  }

  consumeSignals(): GameSignal[] {
    const drained = this.signals;
    this.signals = [];
    return drained;
  }

  update(dt: number): void {
    let remaining = Math.min(dt, 0.25);
    while (remaining > 0 && (this.phase === 'playing' || this.phase === 'tutorial')) {
      const step = Math.min(MAX_STEP, remaining);
      this.step(step);
      remaining -= step;
    }
  }

  /** Player input: send the cabin to a floor. Returns false when the tap is ignored. */
  requestFloor(floor: number): boolean {
    if (this.phase !== 'playing' && this.phase !== 'tutorial') return false;
    if (floor < 0 || floor >= this.floorCount) return false;
    const elevator = this.elevator;
    const here = currentFloor(elevator);
    switch (elevator.phase) {
      case 'moving':
        elevator.target = floor;
        elevator.pendingTarget = null;
        return true;
      case 'idle':
        if (floor === here) this.openDoors();
        else this.startTrip(floor);
        return true;
      case 'closing':
        if (floor === here) {
          elevator.pendingTarget = null;
          this.openDoors();
          return true;
        }
        elevator.pendingTarget = floor;
        return true;
      case 'opening':
      case 'exchanging':
        elevator.pendingTarget = floor === here ? null : floor;
        return true;
    }
  }

  chooseUpgrade(id: UpgradeId): void {
    if (this.phase !== 'upgrade' || !this.upgradeOffer.includes(id)) return;
    const previousVipPatience = this.modifiers.vipPatienceMultiplier;
    this.levels = { ...this.levels, [id]: (this.levels[id] ?? 0) + 1 };
    this.modifiers = computeModifiers(this.levels, this.balance);
    this.rescaleWaitingVips(this.modifiers.vipPatienceMultiplier / previousVipPatience);
    this.elevator.capacity = this.balance.elevator.capacity + this.modifiers.capacityBonus;
    if (id === 'stressRelief') {
      this.stress = Math.max(0, this.stress - this.balance.upgrades.stressReliefInstant);
      this.stressWarned = this.stress >= this.balance.stress.warningThreshold;
    }
    this.stats.upgradesTaken.push(id);
    this.upgradeOffer = [];
    this.upgradeIndex += 1;
    this.phase = 'playing';
    this.signals.push({ type: 'upgradeApplied', id });
  }

  private rescaleWaitingVips(ratio: number): void {
    if (ratio === 1) return;
    for (const queue of this.waiting) {
      for (const passenger of queue) {
        if (passenger.type !== 'vip') continue;
        passenger.patience *= ratio;
        passenger.maxPatience *= ratio;
      }
    }
  }

  skipTutorial(): void {
    if (this.phase !== 'tutorial') return;
    this.finishTutorial();
  }

  result(): RunResult {
    return { score: this.score, stats: { ...this.stats, upgradesTaken: [...this.stats.upgradesTaken] } };
  }

  private step(dt: number): void {
    this.stats.duration += dt;
    if (this.phase === 'playing') {
      this.playTime += dt;
      this.updateEvents(dt);
      this.updateSpawning(dt);
    } else {
      this.updateTutorial(dt);
    }
    this.updatePatience(dt);
    this.updateElevator(dt);
    const broken = this.combo.tick(dt);
    if (broken > 0) this.signals.push({ type: 'comboBroken', chain: broken });
    this.stats.eventsSurvived = this.events.survived;
  }

  // ---- Spawning -------------------------------------------------------------------------

  private updateSpawning(dt: number): void {
    const rushFactor = this.events.isLive('rushHour') ? this.balance.events.rushHour.spawnMultiplier : 1;
    const calmFactor = this.events.isCalm(this.playTime) ? 0.5 : 1;
    this.spawnTimer -= dt * rushFactor * calmFactor;
    if (this.spawnTimer > 0) return;
    this.spawnTimer += spawnInterval(this.playTime, this.balance);
    this.spawnRandomPassenger();
  }

  private totalWaiting(): number {
    return this.waiting.reduce((sum, floor) => sum + floor.length, 0);
  }

  private spawnRandomPassenger(forcedType?: PassengerType, isEventVip = false): Passenger | null {
    if (!forcedType && this.totalWaiting() >= maxWaitingInTower(this.playTime, this.balance)) return null;
    const origin = this.pickOrigin();
    if (origin === null) return null;
    const type = forcedType ?? this.pickType();
    const destination = pickDestination(this.activeFloors, [origin], this.random);
    return this.addPassenger(type, origin, destination, isEventVip);
  }

  private pickOrigin(): number | null {
    const maxPerFloor = this.balance.spawn.maxWaitingPerFloor;
    const maintenance = this.events.isLive('maintenance') ? this.events.active!.floors : [];
    const candidates = Array.from({ length: this.activeFloors }, (_, floor) => floor).filter(
      (floor) => this.waiting[floor].length < maxPerFloor && !maintenance.includes(floor),
    );
    if (candidates.length === 0) return null;
    if (this.events.isLive('doubleRush')) {
      const hot = candidates.filter((floor) => this.events.active!.floors.includes(floor));
      if (hot.length > 0 && this.random.next() < this.balance.events.doubleRush.spawnFocus) {
        return this.random.pick(hot);
      }
    }
    return this.random.weighted(candidates, (floor) => (floor === 0 ? 1.5 : 1) / (1 + this.waiting[floor].length));
  }

  private pickType(): PassengerType {
    const types = unlockedPassengerTypes(this.playTime, this.balance);
    return this.random.weighted(types, (type) => this.balance.passengerTypes[type].weight);
  }

  private addPassenger(type: PassengerType, origin: number, destination: number, isEventVip: boolean): Passenger {
    let patience = basePatience(this.playTime, this.balance) * this.balance.passengerTypes[type].patience;
    if (type === 'vip') patience *= this.modifiers.vipPatienceMultiplier;
    const passenger = createPassenger(
      { id: this.nextPassengerId++, type, origin, destination, patience, isEventVip },
      this.balance,
      this.random,
    );
    this.waiting[origin].push(passenger);
    this.signals.push({ type: 'spawned', passenger });
    return passenger;
  }

  // ---- Events ---------------------------------------------------------------------------

  private updateEvents(dt: number): void {
    const result = this.events.tick(dt, this.playTime, this.floorCount, this.activeFloors);
    if (result.announced) this.signals.push({ type: 'eventAnnounced', event: result.announced });
    if (result.started) {
      this.signals.push({ type: 'eventStarted', event: result.started });
      if (result.started.kind === 'vipArrival') this.spawnRandomPassenger('vip', true);
    }
    if (result.ended) this.signals.push({ type: 'eventEnded', kind: result.ended });
  }

  // ---- Patience & stress ----------------------------------------------------------------

  private updatePatience(dt: number): void {
    const drain = dt * this.modifiers.patienceDrainMultiplier * this.tutorialDrainMultiplier();
    if (drain === 0) return;
    for (let floor = 0; floor < this.floorCount; floor++) {
      const queue = this.waiting[floor];
      for (let i = queue.length - 1; i >= 0; i--) {
        const passenger = queue[i];
        passenger.patience -= drain;
        this.maybeChangeMind(passenger);
        if (passenger.patience <= 0) {
          queue.splice(i, 1);
          this.losePassenger(passenger);
          if (this.phase === 'over') return;
        }
      }
    }
  }

  private tutorialDrainMultiplier(): number {
    if (this.phase !== 'tutorial') return 1;
    return this.tutorialStep === 'patience' ? this.balance.tutorial.guideDrainMultiplier : 0;
  }

  private maybeChangeMind(passenger: Passenger): void {
    if (passenger.changeMindAt === null || patienceRatio(passenger) > passenger.changeMindAt) return;
    const previous = passenger.destination;
    passenger.destination = pickDestination(
      Math.max(this.activeFloors, previous + 1),
      [passenger.origin, previous],
      this.random,
    );
    passenger.changeMindAt = null;
    passenger.patience = Math.min(
      passenger.maxPatience,
      passenger.patience + passenger.maxPatience * this.balance.patience.touristRefund,
    );
    this.signals.push({ type: 'mindChanged', passenger, previous });
  }

  private losePassenger(passenger: Passenger): void {
    const isTutorial = this.tutorialPassengerIds.has(passenger.id);
    const stressAdded = isTutorial
      ? 0
      : this.balance.stress.perLostPassenger * this.balance.passengerTypes[passenger.type].stress;
    this.stress = Math.min(this.balance.stress.max, this.stress + stressAdded);
    this.stats.lost += 1;
    this.perfectRouteStreak = 0;
    this.signals.push({ type: 'lost', passenger, stressAdded });
    const chain = this.combo.break();
    if (chain > 0) this.signals.push({ type: 'comboBroken', chain });
    if (!this.stressWarned && this.stress >= this.balance.stress.warningThreshold) {
      this.stressWarned = true;
      this.signals.push({ type: 'stressWarning' });
    }
    if (this.stress >= this.balance.stress.max) {
      this.phase = 'over';
      this.signals.push({ type: 'gameOver' });
    }
  }

  // ---- Elevator -------------------------------------------------------------------------

  private startTrip(floor: number): void {
    const elevator = this.elevator;
    this.signals.push({ type: 'depart', from: currentFloor(elevator), to: floor });
    elevator.phase = 'moving';
    elevator.target = floor;
    elevator.pendingTarget = null;
  }

  private openDoors(): void {
    const elevator = this.elevator;
    const floor = currentFloor(elevator);
    elevator.phase = 'opening';
    elevator.phaseTimer = this.doorDuration() * (1 - elevator.doorOpen);
    this.stop = { floor, ridersAtArrival: elevator.riders.length, unloaded: 0, boarded: 0 };
  }

  private doorDuration(): number {
    return this.balance.elevator.doorTime * this.modifiers.transferMultiplier;
  }

  private maxSpeed(): number {
    const elevator = this.elevator;
    let speed = this.balance.elevator.maxSpeed * this.modifiers.speedMultiplier;
    if (this.events.isLive('express')) speed *= this.balance.events.express.speedMultiplier;
    const distance = Math.abs(elevator.target - elevator.position);
    if (this.modifiers.expressLevel > 0 && distance >= this.balance.elevator.expressMinDistance) {
      speed *= 1 + this.balance.elevator.expressSpeedPerLevel * this.modifiers.expressLevel;
    }
    return speed;
  }

  private updateElevator(dt: number): void {
    const elevator = this.elevator;
    switch (elevator.phase) {
      case 'idle':
        this.updateIdle();
        return;
      case 'moving': {
        const before = elevator.position;
        const acceleration = this.balance.elevator.acceleration * this.modifiers.speedMultiplier;
        const arrived = stepMotion(elevator, dt, this.maxSpeed(), acceleration);
        this.stats.floorsTravelled += Math.abs(elevator.position - before);
        if (arrived) {
          this.signals.push({ type: 'arrive', floor: elevator.target });
          this.openDoors();
        }
        return;
      }
      case 'opening':
        elevator.phaseTimer -= dt;
        elevator.doorOpen = Math.min(1, 1 - elevator.phaseTimer / this.doorDuration());
        if (elevator.phaseTimer <= 0) {
          elevator.doorOpen = 1;
          elevator.phase = 'exchanging';
          elevator.phaseTimer = 0;
          this.signals.push({ type: 'doorsOpen', floor: currentFloor(elevator) });
        }
        return;
      case 'exchanging':
        elevator.phaseTimer -= dt;
        if (elevator.phaseTimer <= 0) this.nextTransfer();
        return;
      case 'closing':
        elevator.phaseTimer -= dt;
        elevator.doorOpen = Math.max(0, elevator.phaseTimer / this.doorDuration());
        if (elevator.phaseTimer <= 0) this.finishClosing();
        return;
    }
  }

  /** An idle cabin reopens by itself if someone it can take shows up at its floor. */
  private updateIdle(): void {
    const elevator = this.elevator;
    if (elevator.pendingTarget !== null) {
      const target = elevator.pendingTarget;
      elevator.pendingTarget = null;
      if (target !== currentFloor(elevator)) this.startTrip(target);
      return;
    }
    const floor = currentFloor(elevator);
    if (this.waiting[floor].some((passenger) => passenger.seats <= freeSeats(elevator))) this.openDoors();
  }

  private finishClosing(): void {
    const elevator = this.elevator;
    elevator.doorOpen = 0;
    elevator.phase = 'idle';
    this.signals.push({ type: 'doorsClose', floor: currentFloor(elevator) });
    const target = elevator.pendingTarget;
    elevator.pendingTarget = null;
    if (target !== null && target !== currentFloor(elevator)) this.startTrip(target);
  }

  private transferTime(passenger: Passenger, floor: number): number {
    let time =
      this.balance.elevator.transferTime *
      this.balance.passengerTypes[passenger.type].transfer *
      this.modifiers.transferMultiplier;
    if (this.events.isLive('maintenance') && this.events.active!.floors.includes(floor)) {
      time *= this.balance.events.maintenance.transferMultiplier;
    }
    return time;
  }

  private nextTransfer(): void {
    const elevator = this.elevator;
    const floor = currentFloor(elevator);
    const leavingIndex = elevator.riders.findIndex((rider) => rider.destination === floor);
    if (leavingIndex >= 0) {
      const [rider] = elevator.riders.splice(leavingIndex, 1);
      elevator.phaseTimer += this.transferTime(rider, floor);
      this.deliver(rider, floor);
      return;
    }
    const queue = this.waiting[floor];
    const boardingIndex = queue.findIndex((passenger) => passenger.seats <= freeSeats(elevator));
    if (boardingIndex >= 0) {
      const [passenger] = queue.splice(boardingIndex, 1);
      passenger.patienceAtPickup = patienceRatio(passenger);
      elevator.riders.push(passenger);
      elevator.phaseTimer += this.transferTime(passenger, floor);
      if (this.stop) this.stop.boarded += 1;
      this.signals.push({ type: 'boarded', passenger });
      if (this.tutorialStep === 'tapFloor' && this.tutorialPassengerIds.has(passenger.id)) {
        this.setTutorialStep('carry');
      }
      return;
    }
    this.evaluateStop();
    elevator.phase = 'closing';
    elevator.phaseTimer = this.doorDuration() * elevator.doorOpen;
  }

  // ---- Scoring --------------------------------------------------------------------------

  private deliver(passenger: Passenger, floor: number): void {
    const scoreBalance = this.balance.score;
    const combo = this.combo.registerDelivery(
      this.modifiers.comboThresholdMultiplier,
      this.modifiers.comboTimeoutBonus,
    );
    const swift = passenger.patienceAtPickup >= scoreBalance.swiftThreshold;
    let points = scoreBalance.basePoints * this.balance.passengerTypes[passenger.type].points;
    if (passenger.type === 'vip') points *= this.modifiers.vipPointsMultiplier;
    if (passenger.isEventVip) points *= scoreBalance.vipEventMultiplier;
    if (this.isHotFloor(passenger.origin) || this.isHotFloor(floor)) points *= scoreBalance.hotFloorMultiplier;
    if (swift) points *= 1 + scoreBalance.swiftBonus;
    points = Math.round(points * combo.multiplier);

    this.score += points;
    this.stats.delivered += 1;
    this.stats.bestChain = Math.max(this.stats.bestChain, this.combo.chain);
    this.stats.bestMultiplier = Math.max(this.stats.bestMultiplier, combo.multiplier);
    const relief = this.balance.stress.reliefPerDelivery * this.modifiers.stressReliefMultiplier;
    this.stress = Math.max(0, this.stress - relief);
    if (this.stress < this.balance.stress.warningThreshold) this.stressWarned = false;
    if (this.stop) this.stop.unloaded += 1;

    this.signals.push({ type: 'delivered', passenger, points, multiplier: combo.multiplier, swift });
    if (combo.tierChanged) {
      this.signals.push({ type: 'comboTier', multiplier: combo.multiplier, tierIndex: combo.tierIndex });
      if (combo.tierIndex >= this.balance.combo.rushTierIndex) this.callout('rushCombo', floor, 0);
    }
    this.updatePerfectRoute(swift, floor);
    this.onTutorialDelivery(passenger);
    this.checkUpgradeThreshold();
  }

  private isHotFloor(floor: number): boolean {
    return this.events.isLive('doubleRush') && this.events.active!.floors.includes(floor);
  }

  private updatePerfectRoute(swift: boolean, floor: number): void {
    this.perfectRouteStreak = swift ? this.perfectRouteStreak + 1 : 0;
    if (this.perfectRouteStreak >= this.balance.score.perfectRouteLength) {
      this.perfectRouteStreak = 0;
      this.callout('perfectRoute', floor, this.balance.score.perfectRouteBonus);
    }
  }

  private evaluateStop(): void {
    const stop = this.stop;
    this.stop = null;
    if (!stop) return;
    const s = this.balance.score;
    if (stop.unloaded >= s.fullDropMinPassengers && stop.unloaded === stop.ridersAtArrival) {
      this.callout('fullDrop', stop.floor, s.fullDropBonus);
    }
    if (stop.boarded >= s.perfectFloorMinBoarded && this.waiting[stop.floor].length === 0) {
      this.callout('perfectFloor', stop.floor, s.perfectFloorBonus);
    }
  }

  private callout(kind: CalloutKind, floor: number, bonus: number): void {
    const points = Math.round(bonus * this.combo.multiplier);
    this.score += points;
    this.stats.callouts += 1;
    this.signals.push({ type: 'callout', kind, floor, bonus: points });
  }

  private checkUpgradeThreshold(): void {
    if (this.phase !== 'playing') return;
    if (this.stats.delivered < upgradeThreshold(this.upgradeIndex, this.balance)) return;
    const vipsUnlocked = unlockedPassengerTypes(this.playTime, this.balance).includes('vip');
    const offer = rollUpgradeOffer(this.levels, this.random, this.balance.upgrades.choices, vipsUnlocked);
    if (offer.length === 0) {
      this.upgradeIndex += 1;
      return;
    }
    this.upgradeOffer = offer;
    this.phase = 'upgrade';
    this.signals.push({ type: 'upgradeOffered', choices: offer });
  }

  // ---- Tutorial -------------------------------------------------------------------------

  private startTutorial(): void {
    const guide = this.addPassenger('standard', TUTORIAL_START_FLOOR, TUTORIAL_TARGET_FLOOR, false);
    this.tutorialPassengerIds.add(guide.id);
    this.signals.push({ type: 'tutorialStep', step: 'tapFloor' });
  }

  private setTutorialStep(step: TutorialStep): void {
    this.tutorialStep = step;
    this.signals.push({ type: 'tutorialStep', step });
  }

  private onTutorialDelivery(passenger: Passenger): void {
    if (this.phase !== 'tutorial' || !this.tutorialPassengerIds.has(passenger.id)) return;
    if (this.tutorialStep === 'carry') {
      this.setTutorialStep('delivered');
      this.tutorialTimer = TUTORIAL_PAUSE_AFTER_DELIVERY;
    }
  }

  private updateTutorial(dt: number): void {
    if (this.tutorialStep === 'delivered') {
      this.tutorialTimer -= dt;
      if (this.tutorialTimer > 0) return;
      for (const [origin, destination] of [
        [5, 0],
        [0, 3],
      ]) {
        this.tutorialPassengerIds.add(this.addPassenger('standard', origin, destination, false).id);
      }
      this.setTutorialStep('patience');
      return;
    }
    if (this.tutorialStep === 'patience') {
      const pending =
        this.waiting.some((queue) => queue.some((p) => this.tutorialPassengerIds.has(p.id))) ||
        this.elevator.riders.some((p) => this.tutorialPassengerIds.has(p.id));
      if (!pending) this.finishTutorial();
    }
  }

  private finishTutorial(): void {
    this.setTutorialStep('done');
    this.tutorialStep = null;
    this.phase = 'playing';
    this.playTime = 0;
    this.spawnTimer = this.balance.spawn.firstSpawnDelay;
  }
}
