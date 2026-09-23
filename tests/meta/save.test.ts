import { DEFAULT_SKIN } from '../../src/meta/cosmetics';
import { defaultSaveData, parseSaveData, SAVE_VERSION } from '../../src/meta/saveData';

describe('save data parsing', () => {
  it('returns defaults for a missing or corrupted save', () => {
    for (const raw of [null, undefined, 42, 'garbage', [], true]) {
      expect(parseSaveData(raw)).toEqual(defaultSaveData());
    }
  });

  it('keeps valid values and fills missing ones', () => {
    const parsed = parseSaveData({ version: SAVE_VERSION, progress: { bestScore: 1234, coins: 50 } });
    expect(parsed.progress.bestScore).toBe(1234);
    expect(parsed.progress.coins).toBe(50);
    expect(parsed.progress.ownedSkins).toEqual([DEFAULT_SKIN]);
    expect(parsed.settings).toEqual(defaultSaveData().settings);
    expect(parsed.stats.gamesPlayed).toBe(0);
  });

  it('rejects invalid numbers, unknown skins and out-of-range volumes', () => {
    const parsed = parseSaveData({
      version: SAVE_VERSION,
      settings: { musicVolume: 7, sfxVolume: -1, language: 'de', haptics: 'yes' },
      progress: { bestScore: -5, coins: Number.NaN, ownedSkins: ['neon', 'pirated', 3], equippedSkin: 'gold' },
    });
    expect(parsed.settings.musicVolume).toBe(1);
    expect(parsed.settings.sfxVolume).toBe(0);
    expect(parsed.settings.language).toBe('system');
    expect(parsed.settings.haptics).toBe(true);
    expect(parsed.progress.bestScore).toBe(0);
    expect(parsed.progress.coins).toBe(0);
    expect(parsed.progress.ownedSkins).toEqual([DEFAULT_SKIN, 'neon']);
    expect(parsed.progress.equippedSkin).toBe(DEFAULT_SKIN);
  });

  it('always owns the default skin', () => {
    const parsed = parseSaveData({ progress: { ownedSkins: [] } });
    expect(parsed.progress.ownedSkins).toContain(DEFAULT_SKIN);
  });

  it('loads a save written by a newer version without losing known fields', () => {
    const parsed = parseSaveData({ version: SAVE_VERSION + 5, progress: { bestScore: 900 }, futureField: { a: 1 } });
    expect(parsed.progress.bestScore).toBe(900);
    expect(parsed.version).toBe(SAVE_VERSION);
  });

  it('round-trips through JSON', () => {
    const save = defaultSaveData();
    save.progress.bestScore = 4242;
    save.settings.language = 'fr';
    expect(parseSaveData(JSON.parse(JSON.stringify(save)))).toEqual(save);
  });
});
