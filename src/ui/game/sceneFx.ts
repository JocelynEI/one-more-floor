import type { GameEngine } from '../../game/engine';
import type { PassengerType } from '../../game/types';
import { colors, floorPalette } from '../theme';
import { floorTop, queueSlotX, type TowerLayout } from './layout';
import type { Mood } from './PassengerFigure';

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
  age: number;
  life: number;
  /** Callouts are centred on the tower and punch in; points drift up from the cabin. */
  style: 'points' | 'callout';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  age: number;
  life: number;
}

export interface Walker {
  id: number;
  type: PassengerType;
  look: number;
  mood: Mood;
  floor: number;
  x: number;
  speed: number;
  age: number;
  life: number;
}

const MAX_PARTICLES = 90;
const WALK_SPEED = 260;

/**
 * Presentation-only state: walking positions, particles, floating texts and screen shake.
 * Arrays are reused and trimmed in place to avoid per-frame allocations piling up.
 */
export class SceneFx {
  texts: FloatingText[] = [];
  particles: Particle[] = [];
  walkers: Walker[] = [];
  /** Current on-screen x of each waiting passenger, eased toward its queue slot. */
  queueX = new Map<number, number>();
  shake = 0;
  cabinPulse = 1;
  comboPunch = 0;
  stressPulse = 0;
  tapFloor = -1;
  tapFlash = 0;
  displayScore = 0;
  private reduceMotion = false;
  private nextId = 1;

  setReduceMotion(value: boolean): void {
    this.reduceMotion = value;
  }

  reset(): void {
    this.texts.length = 0;
    this.particles.length = 0;
    this.walkers.length = 0;
    this.queueX.clear();
    this.shake = 0;
    this.cabinPulse = 1;
    this.comboPunch = 0;
    this.stressPulse = 0;
    this.tapFlash = 0;
    this.displayScore = 0;
  }

  update(dt: number, engine: GameEngine, layout: TowerLayout | null): void {
    this.shake = Math.max(0, this.shake - dt * 3);
    this.cabinPulse = Math.min(1, this.cabinPulse + dt * 4);
    this.comboPunch = Math.max(0, this.comboPunch - dt * 3.5);
    this.stressPulse = Math.max(0, this.stressPulse - dt * 1.5);
    this.tapFlash = Math.max(0, this.tapFlash - dt * 4);
    this.displayScore += (engine.score - this.displayScore) * Math.min(1, dt * 10);
    if (Math.abs(engine.score - this.displayScore) < 1) this.displayScore = engine.score;
    this.updateTexts(dt);
    this.updateParticles(dt);
    if (layout) {
      this.updateWalkers(dt, layout);
      this.syncQueues(dt, engine, layout);
    }
  }

  onTap(floor: number): void {
    this.tapFloor = floor;
    this.tapFlash = 1;
  }

  onArrive(): void {
    this.cabinPulse = 0;
  }

  onDelivered(layout: TowerLayout, floor: number, points: number, type: PassengerType, look: number): void {
    const x = layout.shaftX + layout.shaftWidth - 4;
    const y = floorTop(layout, floor) + layout.rowHeight * 0.5;
    this.addText(`+${points}`, x + 18, y - layout.rowHeight * 0.2, colors.combo, 18, 'points');
    this.burst(x, y, floorPalette[floor % floorPalette.length], this.reduceMotion ? 4 : 10);
    this.walkers.push({ id: this.nextId++, type, look, mood: 'happy', floor, x, speed: WALK_SPEED, age: 0, life: 1.6 });
  }

  /** Call before `update` so the passenger's last queue position is still known. */
  onLost(layout: TowerLayout, passengerId: number, floor: number, type: PassengerType, look: number, stressAdded: number): void {
    const x = this.queueX.get(passengerId) ?? layout.lobbyX;
    const y = floorTop(layout, floor) + layout.rowHeight * 0.3;
    if (stressAdded > 0) this.addText(`+${Math.round(stressAdded)}%`, x + 30, y, colors.danger, 16, 'points');
    this.walkers.push({ id: this.nextId++, type, look, mood: 'angry', floor, x, speed: WALK_SPEED * 0.8, age: 0, life: 1.6 });
    if (!this.reduceMotion) this.shake = Math.max(this.shake, 0.6);
    this.stressPulse = 1;
  }

  onCallout(layout: TowerLayout, text: string, color: string): void {
    this.addText(text, layout.width / 2, layout.height * 0.4, color, 30, 'callout');
    if (!this.reduceMotion) this.burst(layout.width / 2, layout.height * 0.4, color, 14);
  }

  onComboTier(): void {
    this.comboPunch = 1;
  }

  onGameOver(): void {
    if (!this.reduceMotion) this.shake = 1;
  }

  private addText(text: string, x: number, y: number, color: string, size: number, style: FloatingText['style']): void {
    const callouts = this.texts.filter((entry) => entry.style === 'callout');
    const offset = style === 'callout' ? callouts.length * size * 1.3 : 0;
    this.texts.push({ id: this.nextId++, text, x, y: y + offset, color, size, age: 0, life: style === 'callout' ? 1.3 : 0.9, style });
  }

  private burst(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count && this.particles.length < MAX_PARTICLES; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 60 + Math.random() * 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        size: 3 + Math.random() * 3,
        color: i % 3 === 0 ? colors.combo : color,
        age: 0,
        life: 0.5 + Math.random() * 0.3,
      });
    }
  }

  private updateTexts(dt: number): void {
    let write = 0;
    for (const text of this.texts) {
      text.age += dt;
      if (text.style === 'points') text.y -= dt * 38;
      if (text.age < text.life) this.texts[write++] = text;
    }
    this.texts.length = write;
  }

  private updateParticles(dt: number): void {
    let write = 0;
    for (const particle of this.particles) {
      particle.age += dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 260 * dt;
      if (particle.age < particle.life) this.particles[write++] = particle;
    }
    this.particles.length = write;
  }

  private updateWalkers(dt: number, layout: TowerLayout): void {
    let write = 0;
    for (const walker of this.walkers) {
      walker.age += dt;
      walker.x += walker.speed * dt;
      if (walker.age < walker.life && walker.x < layout.width + 40) this.walkers[write++] = walker;
    }
    this.walkers.length = write;
  }

  /** Eases each waiting passenger toward its slot; newcomers walk in from the right edge. */
  private syncQueues(dt: number, engine: GameEngine, layout: TowerLayout): void {
    const seen = new Set<number>();
    const step = WALK_SPEED * dt;
    for (const queue of engine.waiting) {
      queue.forEach((passenger, index) => {
        seen.add(passenger.id);
        const target = queueSlotX(layout, index);
        const current = this.queueX.get(passenger.id) ?? layout.width + 10;
        const delta = target - current;
        const next = Math.abs(delta) <= step || this.reduceMotion ? target : current + Math.sign(delta) * step;
        this.queueX.set(passenger.id, next);
      });
    }
    for (const id of this.queueX.keys()) {
      if (!seen.has(id)) this.queueX.delete(id);
    }
  }
}
