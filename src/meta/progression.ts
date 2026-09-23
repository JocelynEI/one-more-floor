import type { Balance } from '../game/balance';
import type { RunResult } from '../game/types';
import type { UpgradeLevels } from '../game/upgrades';
import { getSkin, type SkinId } from './cosmetics';
import type { SaveData } from './saveData';

export interface RunRewards {
  coins: number;
  isNewRecord: boolean;
  previousBest: number;
}

export function computeRewards(
  result: RunResult,
  previousBest: number,
  coinMultiplier: number,
  balance: Balance,
): RunRewards {
  const e = balance.economy;
  const isNewRecord = result.score > previousBest && result.score > 0;
  const earned = result.score / e.pointsPerCoin + result.stats.delivered * e.deliveryCoin;
  const coins = Math.round(earned * coinMultiplier) + (isNewRecord ? e.newRecordBonus : 0);
  return { coins, isNewRecord, previousBest };
}

export function coinMultiplierFor(levels: UpgradeLevels, balance: Balance): number {
  return 1 + balance.upgrades.tipJarBonus * (levels.tipJar ?? 0);
}

export function applyRun(save: SaveData, result: RunResult, rewards: RunRewards): SaveData {
  const stats = save.stats;
  return {
    ...save,
    progress: {
      ...save.progress,
      bestScore: Math.max(save.progress.bestScore, result.score),
      coins: save.progress.coins + rewards.coins,
    },
    stats: {
      gamesPlayed: stats.gamesPlayed + 1,
      totalDelivered: stats.totalDelivered + result.stats.delivered,
      totalLost: stats.totalLost + result.stats.lost,
      totalScore: stats.totalScore + result.score,
      totalPlaySeconds: stats.totalPlaySeconds + Math.round(result.stats.duration),
      bestChain: Math.max(stats.bestChain, result.stats.bestChain),
      bestMultiplier: Math.max(stats.bestMultiplier, result.stats.bestMultiplier),
      bestDelivered: Math.max(stats.bestDelivered, result.stats.delivered),
    },
  };
}

export type PurchaseOutcome = { ok: true; save: SaveData } | { ok: false; reason: 'owned' | 'funds' };

export function purchaseSkin(save: SaveData, id: SkinId): PurchaseOutcome {
  const skin = getSkin(id);
  if (save.progress.ownedSkins.includes(skin.id)) return { ok: false, reason: 'owned' };
  if (save.progress.coins < skin.price) return { ok: false, reason: 'funds' };
  return {
    ok: true,
    save: {
      ...save,
      progress: {
        ...save.progress,
        coins: save.progress.coins - skin.price,
        ownedSkins: [...save.progress.ownedSkins, skin.id],
        equippedSkin: skin.id,
      },
    },
  };
}

export function equipSkin(save: SaveData, id: SkinId): SaveData {
  if (!save.progress.ownedSkins.includes(id)) return save;
  return { ...save, progress: { ...save.progress, equippedSkin: id } };
}

/** Operator ranks reward long-term play: they are earned by total passengers delivered. */
export const RANKS = [
  { id: 'trainee', delivered: 0 },
  { id: 'operator', delivered: 100 },
  { id: 'dispatcher', delivered: 400 },
  { id: 'supervisor', delivered: 1000 },
  { id: 'chief', delivered: 2500 },
  { id: 'legend', delivered: 6000 },
] as const;

export type RankId = (typeof RANKS)[number]['id'];

export interface RankProgress {
  rank: RankId;
  next: RankId | null;
  /** 0..1 progress toward the next rank. */
  progress: number;
  remaining: number;
}

export function rankFor(totalDelivered: number): RankProgress {
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) if (totalDelivered >= RANKS[i].delivered) index = i;
  const current = RANKS[index];
  const next = RANKS[index + 1];
  if (!next) return { rank: current.id, next: null, progress: 1, remaining: 0 };
  const span = next.delivered - current.delivered;
  return {
    rank: current.id,
    next: next.id,
    progress: (totalDelivered - current.delivered) / span,
    remaining: next.delivered - totalDelivered,
  };
}
