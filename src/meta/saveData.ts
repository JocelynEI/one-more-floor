import { DEFAULT_SKIN, isSkinId, type SkinId } from './cosmetics';

export const SAVE_VERSION = 1;

export type LanguageSetting = 'system' | 'en' | 'fr';

export interface Settings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  haptics: boolean;
  reduceMotion: boolean;
  language: LanguageSetting;
}

export interface Progress {
  bestScore: number;
  coins: number;
  ownedSkins: SkinId[];
  equippedSkin: SkinId;
  tutorialCompleted: boolean;
}

export interface LifetimeStats {
  gamesPlayed: number;
  totalDelivered: number;
  totalLost: number;
  totalScore: number;
  totalPlaySeconds: number;
  bestChain: number;
  bestMultiplier: number;
  bestDelivered: number;
}

export interface SaveData {
  version: number;
  settings: Settings;
  progress: Progress;
  stats: LifetimeStats;
}

export function defaultSettings(): Settings {
  return { musicVolume: 0.5, sfxVolume: 0.75, muted: false, haptics: true, reduceMotion: false, language: 'system' };
}

export function defaultSaveData(): SaveData {
  return {
    version: SAVE_VERSION,
    settings: defaultSettings(),
    progress: { bestScore: 0, coins: 0, ownedSkins: [DEFAULT_SKIN], equippedSkin: DEFAULT_SKIN, tutorialCompleted: false },
    stats: {
      gamesPlayed: 0,
      totalDelivered: 0,
      totalLost: 0,
      totalScore: 0,
      totalPlaySeconds: 0,
      bestChain: 0,
      bestMultiplier: 1,
      bestDelivered: 0,
    },
  };
}

type Loose = Record<string, unknown>;

function isObject(value: unknown): value is Loose {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function count(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
}

function ratio(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : fallback;
}

function flag(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/**
 * Reshapes a save written by an older version, one version at a time. Register a step here
 * whenever SAVE_VERSION increases; `sanitize` then fills gaps and rejects invalid values, so
 * a save that is missing fields (or comes from a newer build) still loads safely.
 */
const MIGRATIONS: Record<number, (data: Loose) => Loose> = {};

function migrate(raw: Loose): Loose {
  let data = raw;
  let version = typeof data.version === 'number' ? data.version : SAVE_VERSION;
  while (version < SAVE_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) break;
    data = step(data);
    version += 1;
  }
  return data;
}

function sanitizeSettings(raw: unknown): Settings {
  const defaults = defaultSettings();
  const s = isObject(raw) ? raw : {};
  const language = s.language === 'en' || s.language === 'fr' || s.language === 'system' ? s.language : defaults.language;
  return {
    musicVolume: ratio(s.musicVolume, defaults.musicVolume),
    sfxVolume: ratio(s.sfxVolume, defaults.sfxVolume),
    muted: flag(s.muted, defaults.muted),
    haptics: flag(s.haptics, defaults.haptics),
    reduceMotion: flag(s.reduceMotion, defaults.reduceMotion),
    language,
  };
}

function sanitizeProgress(raw: unknown): Progress {
  const defaults = defaultSaveData().progress;
  const p = isObject(raw) ? raw : {};
  const owned = Array.isArray(p.ownedSkins) ? p.ownedSkins.filter(isSkinId) : [];
  const ownedSkins = Array.from(new Set<SkinId>([DEFAULT_SKIN, ...owned]));
  const equipped = isSkinId(p.equippedSkin) && ownedSkins.includes(p.equippedSkin) ? p.equippedSkin : DEFAULT_SKIN;
  return {
    bestScore: count(p.bestScore, defaults.bestScore),
    coins: count(p.coins, defaults.coins),
    ownedSkins,
    equippedSkin: equipped,
    tutorialCompleted: flag(p.tutorialCompleted, defaults.tutorialCompleted),
  };
}

function sanitizeStats(raw: unknown): LifetimeStats {
  const defaults = defaultSaveData().stats;
  const s = isObject(raw) ? raw : {};
  return {
    gamesPlayed: count(s.gamesPlayed, defaults.gamesPlayed),
    totalDelivered: count(s.totalDelivered, defaults.totalDelivered),
    totalLost: count(s.totalLost, defaults.totalLost),
    totalScore: count(s.totalScore, defaults.totalScore),
    totalPlaySeconds: count(s.totalPlaySeconds, defaults.totalPlaySeconds),
    bestChain: count(s.bestChain, defaults.bestChain),
    bestMultiplier: Math.max(1, count(s.bestMultiplier, defaults.bestMultiplier)),
    bestDelivered: count(s.bestDelivered, defaults.bestDelivered),
  };
}

/** Turns anything read from disk into a valid save; never throws. */
export function parseSaveData(raw: unknown): SaveData {
  if (!isObject(raw)) return defaultSaveData();
  const data = migrate(raw);
  return {
    version: SAVE_VERSION,
    settings: sanitizeSettings(data.settings),
    progress: sanitizeProgress(data.progress),
    stats: sanitizeStats(data.stats),
  };
}
