import { getLocales } from 'expo-localization';
import type { LanguageSetting } from '../meta/saveData';
import { en, type Translations } from './en';
import { fr } from './fr';

export type Language = 'en' | 'fr';

export const DICTIONARIES: Record<Language, Translations> = { en, fr };

export function deviceLanguage(): Language {
  try {
    const code = getLocales()[0]?.languageCode;
    return code === 'fr' ? 'fr' : 'en';
  } catch {
    return 'en';
  }
}

export function resolveLanguage(setting: LanguageSetting, device: Language): Language {
  return setting === 'system' ? device : setting;
}

/** Replaces `{name}` placeholders; unknown placeholders are left visible so they get noticed. */
export function format(template: string, params: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/** Floors are stored from 0; players read them from 1. */
export function floorLabel(floor: number): string {
  return String(floor + 1);
}

export type { Translations };
