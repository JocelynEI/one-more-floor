import type { Balance } from './balance';

export interface ComboUpdate {
  multiplier: number;
  tierIndex: number;
  tierChanged: boolean;
}

/** Tracks the delivery chain and its multiplier. */
export class ComboTracker {
  chain = 0;
  bestChain = 0;
  timeLeft = 0;
  tierIndex = 0;

  constructor(private readonly balance: Balance) {}

  get multiplier(): number {
    return this.balance.combo.tiers[this.tierIndex].multiplier;
  }

  /** Remaining time ratio before the chain expires, for the HUD. */
  timeRatio(timeoutBonus: number): number {
    if (this.chain === 0) return 0;
    return this.timeLeft / (this.balance.combo.timeout + timeoutBonus);
  }

  registerDelivery(thresholdMultiplier: number, timeoutBonus: number): ComboUpdate {
    this.chain += 1;
    this.bestChain = Math.max(this.bestChain, this.chain);
    this.timeLeft = this.balance.combo.timeout + timeoutBonus;
    const previous = this.tierIndex;
    this.tierIndex = this.tierForChain(this.chain, thresholdMultiplier);
    return { multiplier: this.multiplier, tierIndex: this.tierIndex, tierChanged: this.tierIndex > previous };
  }

  /** Returns the chain length that was lost, or 0 if nothing was broken. */
  break(): number {
    const lost = this.chain;
    this.chain = 0;
    this.tierIndex = 0;
    this.timeLeft = 0;
    return lost;
  }

  /** Returns the broken chain length when the timer runs out, 0 otherwise. */
  tick(dt: number): number {
    if (this.chain === 0) return 0;
    this.timeLeft -= dt;
    return this.timeLeft <= 0 ? this.break() : 0;
  }

  private tierForChain(chain: number, thresholdMultiplier: number): number {
    const tiers = this.balance.combo.tiers;
    let index = 0;
    for (let i = 0; i < tiers.length; i++) {
      if (chain >= Math.ceil(tiers[i].chain * thresholdMultiplier)) index = i;
    }
    return index;
  }
}
