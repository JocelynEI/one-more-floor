import { DEFAULT_BALANCE } from '../../src/game/balance';
import type { RunResult } from '../../src/game/types';
import { getSkin } from '../../src/meta/cosmetics';
import {
  applyRun,
  coinMultiplierFor,
  computeRewards,
  equipSkin,
  purchaseSkin,
  rankFor,
  RANKS,
} from '../../src/meta/progression';
import { defaultSaveData } from '../../src/meta/saveData';

function run(score: number, delivered = 10): RunResult {
  return {
    score,
    stats: {
      delivered,
      lost: 8,
      bestMultiplier: 3,
      bestChain: 9,
      upgradesTaken: [],
      eventsSurvived: 1,
      floorsTravelled: 40,
      duration: 180,
      callouts: 2,
    },
  };
}

describe('run rewards', () => {
  it('pays coins from score and deliveries, plus a record bonus', () => {
    const rewards = computeRewards(run(1500), 1000, 1, DEFAULT_BALANCE);
    const base = Math.round(1500 / DEFAULT_BALANCE.economy.pointsPerCoin + 10 * DEFAULT_BALANCE.economy.deliveryCoin);
    expect(rewards.isNewRecord).toBe(true);
    expect(rewards.coins).toBe(base + DEFAULT_BALANCE.economy.newRecordBonus);
  });

  it('a zero score is never a record', () => {
    expect(computeRewards(run(0, 0), 0, 1, DEFAULT_BALANCE).isNewRecord).toBe(false);
  });

  it('tip jar multiplies coins', () => {
    expect(coinMultiplierFor({ tipJar: 2 }, DEFAULT_BALANCE)).toBeCloseTo(1 + 2 * DEFAULT_BALANCE.upgrades.tipJarBonus);
  });

  it('applying a run updates best score, coins and lifetime stats', () => {
    const save = applyRun(defaultSaveData(), run(800), { coins: 40, isNewRecord: true, previousBest: 0 });
    expect(save.progress.bestScore).toBe(800);
    expect(save.progress.coins).toBe(40);
    expect(save.stats.gamesPlayed).toBe(1);
    expect(save.stats.totalDelivered).toBe(10);
    expect(save.stats.bestMultiplier).toBe(3);
    const second = applyRun(save, run(300), { coins: 10, isNewRecord: false, previousBest: 800 });
    expect(second.progress.bestScore).toBe(800);
    expect(second.stats.gamesPlayed).toBe(2);
  });
});

describe('cosmetics shop', () => {
  it('buys a skin, spends coins and equips it', () => {
    const save = { ...defaultSaveData(), progress: { ...defaultSaveData().progress, coins: 1000 } };
    const outcome = purchaseSkin(save, 'neon');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.save.progress.coins).toBe(1000 - getSkin('neon').price);
    expect(outcome.save.progress.ownedSkins).toContain('neon');
    expect(outcome.save.progress.equippedSkin).toBe('neon');
  });

  it('refuses when coins are missing or the skin is already owned', () => {
    expect(purchaseSkin(defaultSaveData(), 'gold')).toEqual({ ok: false, reason: 'funds' });
    expect(purchaseSkin(defaultSaveData(), 'classic')).toEqual({ ok: false, reason: 'owned' });
  });

  it('cannot equip a skin that is not owned', () => {
    const save = defaultSaveData();
    expect(equipSkin(save, 'space')).toBe(save);
  });
});

describe('operator ranks', () => {
  it('starts as trainee and reports progress to the next rank', () => {
    const rank = rankFor(50);
    expect(rank.rank).toBe('trainee');
    expect(rank.next).toBe('operator');
    expect(rank.remaining).toBe(RANKS[1].delivered - 50);
  });

  it('caps at the highest rank', () => {
    const rank = rankFor(1_000_000);
    expect(rank.rank).toBe('legend');
    expect(rank.next).toBeNull();
    expect(rank.progress).toBe(1);
  });
});
