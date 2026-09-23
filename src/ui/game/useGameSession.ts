import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';
import { AppState as NativeAppState } from 'react-native';
import { GameEngine } from '../../game/engine';
import type { GameSignal, UpgradeId } from '../../game/types';
import type { RunRewards } from '../../meta/progression';
import { soundBoard } from '../../services/audio';
import { haptic } from '../../services/haptics';
import { useAppState } from '../../state/AppState';
import { colors } from '../theme';
import type { TowerLayout } from './layout';
import { SceneFx } from './sceneFx';

/** Short beat between the last lost passenger and the results sheet, so the ending reads. */
const RESULTS_DELAY = 0.9;

export interface SessionResults {
  score: number;
  rewards: RunRewards;
  engine: GameEngine;
}

/**
 * Owns one run at a time: the engine, the frame loop, pausing and feedback. Restarting
 * swaps the engine in place, so "play again" never navigates or reloads anything.
 *
 * The engine and effects are mutable simulation objects; the frame counter is what tells
 * React to redraw them each animation frame.
 */
export function useGameSession() {
  const { save, t, recordRun, setTutorialCompleted } = useAppState();
  const needsTutorial = !save.progress.tutorialCompleted;
  const reduceMotion = save.settings.reduceMotion;
  const [engine, setEngine] = useState(() => new GameEngine({ tutorial: needsTutorial }));
  const [fx] = useState(() => new SceneFx());
  const [, setFrame] = useState(0);
  const [paused, setPaused] = useState(false);
  const [results, setResults] = useState<SessionResults | null>(null);
  const pausedRef = useRef(false);
  const layoutRef = useRef<TowerLayout | null>(null);

  useEffect(() => {
    fx.setReduceMotion(reduceMotion);
  }, [fx, reduceMotion]);

  useEffect(() => {
    // Development builds expose the running engine for inspection from the JS console.
    if (__DEV__) (globalThis as { __omfEngine?: GameEngine }).__omfEngine = engine;
  }, [engine]);

  const onSignal = useEffectEvent((signal: GameSignal) => {
    const layout = layoutRef.current;
    switch (signal.type) {
      case 'depart':
        soundBoard.play('depart');
        return;
      case 'arrive':
        fx.onArrive();
        soundBoard.play('arrive');
        haptic('arrive');
        return;
      case 'doorsOpen':
      case 'doorsClose':
        soundBoard.play('doors');
        return;
      case 'boarded':
        soundBoard.play('board');
        return;
      case 'delivered': {
        soundBoard.play('deliver');
        haptic('deliver');
        const { passenger } = signal;
        if (layout) fx.onDelivered(layout, passenger.destination, signal.points, passenger.type, passenger.look);
        return;
      }
      case 'lost': {
        soundBoard.play('lost');
        haptic('error');
        const { passenger } = signal;
        if (layout) fx.onLost(layout, passenger.id, passenger.origin, passenger.type, passenger.look, signal.stressAdded);
        return;
      }
      case 'comboTier':
        fx.onComboTier();
        soundBoard.play('combo');
        haptic('combo');
        return;
      case 'callout': {
        soundBoard.play('callout');
        haptic('combo');
        const bonus = signal.bonus > 0 ? `  +${signal.bonus}` : '';
        const color = signal.kind === 'rushCombo' ? colors.combo : colors.accent;
        if (layout) fx.onCallout(layout, `${t.callouts[signal.kind]}${bonus}`, color);
        return;
      }
      case 'mindChanged':
        if (layout) fx.onCallout(layout, t.callouts.mindChanged, colors.textPrimary);
        return;
      case 'stressWarning':
        soundBoard.play('warning');
        haptic('warning');
        if (layout) fx.onCallout(layout, t.callouts.stressWarning, colors.danger);
        return;
      case 'eventAnnounced':
        soundBoard.play('event');
        haptic('tap');
        return;
      case 'upgradeOffered':
        soundBoard.play('upgrade');
        return;
      case 'tutorialStep':
        if (signal.step === 'done') setTutorialCompleted(true);
        return;
      case 'gameOver':
        fx.onGameOver();
        soundBoard.play('gameOver');
        haptic('error');
        return;
      case 'comboBroken':
      case 'spawned':
      case 'eventStarted':
      case 'eventEnded':
      case 'upgradeApplied':
        return;
    }
  });

  const onRunOver = useEffectEvent(() => {
    const rewards = recordRun(engine.result(), engine.levels);
    if (rewards.isNewRecord) {
      soundBoard.play('newRecord');
      haptic('record');
    }
    setResults({ score: engine.score, rewards, engine });
  });

  useEffect(() => {
    let frameHandle = 0;
    let last: number | null = null;
    let overFor = 0;
    let recorded = false;
    const loop = (now: number) => {
      const dt = last === null ? 0 : Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!pausedRef.current) {
        engine.update(dt);
        for (const signal of engine.consumeSignals()) onSignal(signal);
        fx.update(dt, engine, layoutRef.current);
        if (engine.phase === 'over' && !recorded) {
          overFor += dt;
          if (overFor >= RESULTS_DELAY) {
            recorded = true;
            onRunOver();
          }
        }
      }
      setFrame((frame) => (frame + 1) % 1_000_000);
      frameHandle = requestAnimationFrame(loop);
    };
    frameHandle = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameHandle);
  }, [engine, fx]);

  const pause = useCallback(() => {
    if (engine.phase === 'over' || engine.phase === 'upgrade') return;
    pausedRef.current = true;
    setPaused(true);
  }, [engine]);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setPaused(false);
  }, []);

  useEffect(() => {
    const subscription = NativeAppState.addEventListener('change', (status) => {
      if (status !== 'active') pause();
    });
    return () => subscription.remove();
  }, [pause]);

  const restart = useCallback(() => {
    fx.reset();
    pausedRef.current = false;
    setPaused(false);
    setResults(null);
    setEngine(new GameEngine({ tutorial: needsTutorial }));
  }, [fx, needsTutorial]);

  const requestFloor = useCallback(
    (floor: number) => {
      if (pausedRef.current) return;
      if (engine.requestFloor(floor)) {
        fx.onTap(floor);
        haptic('tap');
      }
    },
    [engine, fx],
  );

  const chooseUpgrade = useCallback(
    (id: UpgradeId) => {
      engine.chooseUpgrade(id);
      haptic('combo');
    },
    [engine],
  );

  const skipTutorial = useCallback(() => {
    engine.skipTutorial();
    setTutorialCompleted(true);
  }, [engine, setTutorialCompleted]);

  const setLayout = useCallback((layout: TowerLayout) => {
    layoutRef.current = layout;
  }, []);

  return {
    engine,
    fx,
    paused,
    results,
    pause,
    resume,
    restart,
    requestFloor,
    chooseUpgrade,
    skipTutorial,
    setLayout,
  };
}
