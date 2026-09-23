import { en } from '../../src/i18n/en';
import { fr } from '../../src/i18n/fr';
import { floorLabel, format, resolveLanguage } from '../../src/i18n';

type Tree = { [key: string]: unknown };

function leaves(tree: unknown, prefix = ''): Map<string, string> {
  const out = new Map<string, string>();
  if (typeof tree === 'string') {
    out.set(prefix, tree);
    return out;
  }
  for (const [key, value] of Object.entries(tree as Tree)) {
    for (const [path, text] of leaves(value, prefix ? `${prefix}.${key}` : key)) out.set(path, text);
  }
  return out;
}

function placeholders(text: string): string[] {
  return (text.match(/\{\w+\}/g) ?? []).sort();
}

describe('translations', () => {
  const english = leaves(en);
  const french = leaves(fr);

  it('French and English define exactly the same keys', () => {
    expect([...french.keys()].sort()).toEqual([...english.keys()].sort());
  });

  it('no string is empty', () => {
    for (const [key, text] of [...english, ...french]) expect({ key, empty: text.trim() === '' }).toEqual({ key, empty: false });
  });

  it('placeholders match between languages', () => {
    for (const [key, text] of english) {
      expect({ key, placeholders: placeholders(french.get(key)!) }).toEqual({ key, placeholders: placeholders(text) });
    }
  });
});

describe('i18n helpers', () => {
  it('fills placeholders and leaves unknown ones visible', () => {
    expect(format('Floor {floor} of {total}', { floor: 3 })).toBe('Floor 3 of {total}');
  });

  it('resolves the device language unless the player chose one', () => {
    expect(resolveLanguage('system', 'fr')).toBe('fr');
    expect(resolveLanguage('en', 'fr')).toBe('en');
  });

  it('shows floors starting at 1', () => {
    expect(floorLabel(0)).toBe('1');
  });
});
