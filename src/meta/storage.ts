import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultSaveData, parseSaveData, type SaveData } from './saveData';

const SAVE_KEY = 'omf.save';
const BACKUP_KEY = 'omf.save.backup';

export type LoadSource = 'main' | 'backup' | 'fresh';

async function readJson(key: string): Promise<unknown | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Loads the save, falling back to the backup copy when the main one is unreadable.
 * Storage failures resolve to a fresh save so the game always starts.
 */
export async function loadSave(): Promise<{ data: SaveData; source: LoadSource }> {
  try {
    const main = await readJson(SAVE_KEY);
    if (main !== null) return { data: parseSaveData(main), source: 'main' };
    const backup = await readJson(BACKUP_KEY);
    if (backup !== null) return { data: parseSaveData(backup), source: 'backup' };
  } catch (error) {
    console.warn('[save] load failed, starting fresh', error);
  }
  return { data: defaultSaveData(), source: 'fresh' };
}

/**
 * Writes the backup first, then the main copy: an interruption can only ever leave one
 * of the two half-written, and `loadSave` recovers from the other.
 */
export async function writeSave(data: SaveData): Promise<void> {
  const serialized = JSON.stringify(data);
  await AsyncStorage.setItem(BACKUP_KEY, serialized);
  await AsyncStorage.setItem(SAVE_KEY, serialized);
}

export async function clearSave(): Promise<void> {
  await AsyncStorage.multiRemove([SAVE_KEY, BACKUP_KEY]);
}
