import type { Balance } from './balance';
import type { Random } from './random';
import type { UpgradeFamily, UpgradeId } from './types';

export interface UpgradeDefinition {
  id: UpgradeId;
  family: UpgradeFamily;
  maxLevel: number;
}

export const UPGRADES: readonly UpgradeDefinition[] = [
  { id: 'fastDoors', family: 'speed', maxLevel: 3 },
  { id: 'turboMotor', family: 'speed', maxLevel: 3 },
  { id: 'expressLine', family: 'speed', maxLevel: 2 },
  { id: 'extraSpace', family: 'capacity', maxLevel: 2 },
  { id: 'calmAtmosphere', family: 'calm', maxLevel: 3 },
  { id: 'stressRelief', family: 'calm', maxLevel: 2 },
  { id: 'vipLounge', family: 'calm', maxLevel: 1 },
  { id: 'comboMaster', family: 'score', maxLevel: 2 },
  { id: 'tipJar', family: 'score', maxLevel: 2 },
];

export type UpgradeLevels = Partial<Record<UpgradeId, number>>;

/** Derived multipliers the systems read; recomputed whenever an upgrade is taken. */
export interface Modifiers {
  speedMultiplier: number;
  transferMultiplier: number;
  capacityBonus: number;
  expressLevel: number;
  patienceDrainMultiplier: number;
  stressReliefMultiplier: number;
  comboTimeoutBonus: number;
  comboThresholdMultiplier: number;
  coinMultiplier: number;
  vipPatienceMultiplier: number;
  vipPointsMultiplier: number;
}

export function computeModifiers(levels: UpgradeLevels, balance: Balance): Modifiers {
  const u = balance.upgrades;
  const level = (id: UpgradeId) => levels[id] ?? 0;
  return {
    speedMultiplier: 1 + u.turboSpeedBonus * level('turboMotor'),
    transferMultiplier: Math.pow(1 - u.fastDoorsReduction, level('fastDoors')),
    capacityBonus: level('extraSpace'),
    expressLevel: level('expressLine'),
    patienceDrainMultiplier: Math.pow(1 - u.calmDrainReduction, level('calmAtmosphere')),
    stressReliefMultiplier: 1 + u.stressReliefDeliveryBonus * level('stressRelief'),
    comboTimeoutBonus: u.comboTimeoutBonus * level('comboMaster'),
    comboThresholdMultiplier: Math.pow(1 - u.comboThresholdReduction, level('comboMaster')),
    coinMultiplier: 1 + u.tipJarBonus * level('tipJar'),
    vipPatienceMultiplier: 1 + u.vipLoungePatienceBonus * level('vipLounge'),
    vipPointsMultiplier: 1 + u.vipLoungePointsBonus * level('vipLounge'),
  };
}

export function isMaxed(id: UpgradeId, levels: UpgradeLevels): boolean {
  const definition = UPGRADES.find((upgrade) => upgrade.id === id);
  return !definition || (levels[id] ?? 0) >= definition.maxLevel;
}

/**
 * Picks distinct upgrades, favouring one per family so every offer shows a real choice of build.
 * `vipLounge` is only offered once VIPs can actually appear.
 */
export function rollUpgradeOffer(
  levels: UpgradeLevels,
  random: Random,
  count: number,
  vipsUnlocked: boolean,
): UpgradeId[] {
  const available = UPGRADES.filter(
    (upgrade) => !isMaxed(upgrade.id, levels) && (vipsUnlocked || upgrade.id !== 'vipLounge'),
  );
  const byFamily = new Map<UpgradeFamily, UpgradeDefinition[]>();
  for (const upgrade of random.shuffle(available)) {
    const list = byFamily.get(upgrade.family) ?? [];
    list.push(upgrade);
    byFamily.set(upgrade.family, list);
  }
  const offer: UpgradeId[] = [];
  const families = random.shuffle([...byFamily.keys()]);
  for (const family of families) {
    if (offer.length >= count) break;
    offer.push(byFamily.get(family)![0].id);
  }
  for (const upgrade of random.shuffle(available)) {
    if (offer.length >= count) break;
    if (!offer.includes(upgrade.id)) offer.push(upgrade.id);
  }
  return offer;
}

export function upgradeThreshold(index: number, balance: Balance): number {
  const thresholds = balance.upgrades.thresholds;
  if (index < thresholds.length) return thresholds[index];
  const last = thresholds[thresholds.length - 1];
  const gap = last - thresholds[thresholds.length - 2];
  return last + gap * (index - thresholds.length + 1);
}
