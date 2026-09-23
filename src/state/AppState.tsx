import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, AppState as NativeAppState } from 'react-native';
import { DEFAULT_BALANCE } from '../game/balance';
import type { RunResult } from '../game/types';
import type { UpgradeLevels } from '../game/upgrades';
import { DICTIONARIES, deviceLanguage, resolveLanguage, type Language, type Translations } from '../i18n';
import type { SkinId } from '../meta/cosmetics';
import {
  applyRun,
  coinMultiplierFor,
  computeRewards,
  equipSkin as equipSkinIn,
  purchaseSkin,
  type PurchaseOutcome,
  type RunRewards,
} from '../meta/progression';
import { defaultSaveData, type SaveData, type Settings } from '../meta/saveData';
import { clearSave, loadSave, writeSave } from '../meta/storage';
import { soundBoard } from '../services/audio';
import { setHapticsEnabled } from '../services/haptics';
import { reportError } from '../services/log';

const SAVE_DEBOUNCE_MS = 300;

interface AppStateValue {
  ready: boolean;
  save: SaveData;
  language: Language;
  t: Translations;
  updateSettings: (patch: Partial<Settings>) => void;
  recordRun: (result: RunResult, levels: UpgradeLevels) => RunRewards;
  buySkin: (id: SkinId) => PurchaseOutcome;
  equipSkin: (id: SkinId) => void;
  setTutorialCompleted: (completed: boolean) => void;
  resetProgress: () => Promise<void>;
}

const AppStateContext = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [save, setSave] = useState<SaveData>(defaultSaveData);
  const saveRef = useRef(save);
  const pendingWrite = useRef<ReturnType<typeof setTimeout> | null>(null);
  const device = useMemo(() => deviceLanguage(), []);

  const flush = useCallback(() => {
    if (pendingWrite.current) {
      clearTimeout(pendingWrite.current);
      pendingWrite.current = null;
    }
    writeSave(saveRef.current).catch((error) => reportError('save', error));
  }, []);

  const commit = useCallback(
    (next: SaveData, immediate = false) => {
      saveRef.current = next;
      setSave(next);
      if (immediate) {
        flush();
        return;
      }
      if (pendingWrite.current) clearTimeout(pendingWrite.current);
      pendingWrite.current = setTimeout(flush, SAVE_DEBOUNCE_MS);
    },
    [flush],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, source } = await loadSave();
      let loaded = data;
      if (source === 'fresh') {
        const systemReduceMotion = await AccessibilityInfo.isReduceMotionEnabled().catch(() => false);
        loaded = { ...data, settings: { ...data.settings, reduceMotion: systemReduceMotion } };
      }
      if (cancelled) return;
      saveRef.current = loaded;
      setSave(loaded);
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const { musicVolume, sfxVolume, muted, haptics } = save.settings;
    soundBoard.setVolumes(musicVolume, sfxVolume, muted);
    setHapticsEnabled(haptics);
  }, [save.settings]);

  useEffect(() => {
    const subscription = NativeAppState.addEventListener('change', (status) => {
      if (status === 'active') {
        soundBoard.resumeBackground();
        return;
      }
      soundBoard.pauseBackground();
      if (pendingWrite.current) flush();
    });
    return () => subscription.remove();
  }, [flush]);

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      const current = saveRef.current;
      commit({ ...current, settings: { ...current.settings, ...patch } });
    },
    [commit],
  );

  const recordRun = useCallback(
    (result: RunResult, levels: UpgradeLevels) => {
      const current = saveRef.current;
      const rewards = computeRewards(
        result,
        current.progress.bestScore,
        coinMultiplierFor(levels, DEFAULT_BALANCE),
        DEFAULT_BALANCE,
      );
      commit(applyRun(current, result, rewards), true);
      return rewards;
    },
    [commit],
  );

  const buySkin = useCallback(
    (id: SkinId) => {
      const outcome = purchaseSkin(saveRef.current, id);
      if (outcome.ok) commit(outcome.save, true);
      return outcome;
    },
    [commit],
  );

  const equipSkin = useCallback((id: SkinId) => commit(equipSkinIn(saveRef.current, id)), [commit]);

  const setTutorialCompleted = useCallback(
    (completed: boolean) => {
      const current = saveRef.current;
      commit({ ...current, progress: { ...current.progress, tutorialCompleted: completed } }, true);
    },
    [commit],
  );

  const resetProgress = useCallback(async () => {
    const fresh = { ...defaultSaveData(), settings: saveRef.current.settings };
    await clearSave();
    commit(fresh, true);
  }, [commit]);

  const language = resolveLanguage(save.settings.language, device);

  const value = useMemo<AppStateValue>(
    () => ({
      ready,
      save,
      language,
      t: DICTIONARIES[language],
      updateSettings,
      recordRun,
      buySkin,
      equipSkin,
      setTutorialCompleted,
      resetProgress,
    }),
    [ready, save, language, updateSettings, recordRun, buySkin, equipSkin, setTutorialCompleted, resetProgress],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used inside AppStateProvider');
  return value;
}
