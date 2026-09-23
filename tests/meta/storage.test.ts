import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultSaveData } from '../../src/meta/saveData';
import { clearSave, loadSave, writeSave } from '../../src/meta/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('save storage', () => {
  it('starts fresh when nothing is stored', async () => {
    const { data, source } = await loadSave();
    expect(source).toBe('fresh');
    expect(data).toEqual(defaultSaveData());
  });

  it('writes and reads back a save', async () => {
    const save = defaultSaveData();
    save.progress.coins = 321;
    await writeSave(save);
    const { data, source } = await loadSave();
    expect(source).toBe('main');
    expect(data.progress.coins).toBe(321);
  });

  it('recovers from the backup when the main copy is corrupted', async () => {
    const save = defaultSaveData();
    save.progress.bestScore = 777;
    await writeSave(save);
    await AsyncStorage.setItem('omf.save', '{"broken json');
    const { data, source } = await loadSave();
    expect(source).toBe('backup');
    expect(data.progress.bestScore).toBe(777);
  });

  it('falls back to defaults when the main copy is unreadable JSON', async () => {
    await AsyncStorage.setItem('omf.save', '{"broken json');
    const { data } = await loadSave();
    expect(data).toEqual(defaultSaveData());
  });

  it('clears both copies on reset', async () => {
    await writeSave(defaultSaveData());
    await clearSave();
    expect(await AsyncStorage.getItem('omf.save')).toBeNull();
    expect(await AsyncStorage.getItem('omf.save.backup')).toBeNull();
  });
});
