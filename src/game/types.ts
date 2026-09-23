export type PassengerType = 'standard' | 'delivery' | 'senior' | 'vip' | 'group' | 'tourist';

export const PASSENGER_TYPES: readonly PassengerType[] = [
  'standard',
  'delivery',
  'senior',
  'vip',
  'group',
  'tourist',
];

export interface Passenger {
  id: number;
  type: PassengerType;
  origin: number;
  destination: number;
  patience: number;
  maxPatience: number;
  /** Patience ratio when the passenger stepped into the cabin, used for swift bonuses. */
  patienceAtPickup: number;
  seats: number;
  /** Stable cosmetic seed so a passenger keeps the same look for its whole life. */
  look: number;
  /** Tourists change their mind once, at this remaining patience ratio (null = never). */
  changeMindAt: number | null;
  isEventVip: boolean;
}

export type ElevatorPhase = 'idle' | 'moving' | 'opening' | 'exchanging' | 'closing';

export interface ElevatorState {
  /** Continuous position, in floors (0 = ground floor). */
  position: number;
  velocity: number;
  phase: ElevatorPhase;
  /** Floor the cabin is heading to while moving. */
  target: number;
  /** Destination requested while the doors are busy; used once they close. */
  pendingTarget: number | null;
  /** 0 = closed, 1 = fully open. */
  doorOpen: number;
  phaseTimer: number;
  riders: Passenger[];
  capacity: number;
}

export type GameEventKind = 'rushHour' | 'maintenance' | 'vipArrival' | 'doubleRush' | 'express';

export const GAME_EVENT_KINDS: readonly GameEventKind[] = [
  'rushHour',
  'maintenance',
  'vipArrival',
  'doubleRush',
  'express',
];

export interface ActiveGameEvent {
  kind: GameEventKind;
  /** Remaining time before the event becomes effective. */
  announceLeft: number;
  timeLeft: number;
  duration: number;
  /** Floors concerned (maintenance, double rush). */
  floors: number[];
}

export type UpgradeId =
  | 'fastDoors'
  | 'turboMotor'
  | 'extraSpace'
  | 'calmAtmosphere'
  | 'comboMaster'
  | 'expressLine'
  | 'stressRelief'
  | 'tipJar'
  | 'vipLounge';

export type UpgradeFamily = 'speed' | 'capacity' | 'calm' | 'score';

export type CalloutKind = 'perfectFloor' | 'fullDrop' | 'perfectRoute' | 'rushCombo';

/** Things that happened during a step, consumed by the presentation layer (audio, haptics, fx). */
export type GameSignal =
  | { type: 'depart'; from: number; to: number }
  | { type: 'arrive'; floor: number }
  | { type: 'doorsOpen'; floor: number }
  | { type: 'doorsClose'; floor: number }
  | { type: 'boarded'; passenger: Passenger }
  | { type: 'delivered'; passenger: Passenger; points: number; multiplier: number; swift: boolean }
  | { type: 'lost'; passenger: Passenger; stressAdded: number }
  | { type: 'spawned'; passenger: Passenger }
  | { type: 'mindChanged'; passenger: Passenger; previous: number }
  | { type: 'comboTier'; multiplier: number; tierIndex: number }
  | { type: 'comboBroken'; chain: number }
  | { type: 'callout'; kind: CalloutKind; floor: number; bonus: number }
  | { type: 'eventAnnounced'; event: ActiveGameEvent }
  | { type: 'eventStarted'; event: ActiveGameEvent }
  | { type: 'eventEnded'; kind: GameEventKind }
  | { type: 'stressWarning' }
  | { type: 'upgradeOffered'; choices: UpgradeId[] }
  | { type: 'upgradeApplied'; id: UpgradeId }
  | { type: 'tutorialStep'; step: TutorialStep }
  | { type: 'gameOver' };

export type TutorialStep = 'tapFloor' | 'carry' | 'delivered' | 'patience' | 'done';

export interface RunStats {
  delivered: number;
  lost: number;
  bestMultiplier: number;
  bestChain: number;
  upgradesTaken: UpgradeId[];
  eventsSurvived: number;
  floorsTravelled: number;
  duration: number;
  callouts: number;
}

export interface RunResult {
  score: number;
  stats: RunStats;
}
