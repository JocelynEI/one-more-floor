import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export const colors = {
  background: '#0E1420',
  backgroundDeep: '#0A0F18',
  surface: '#171F2E',
  surfaceRaised: '#202B3D',
  surfacePressed: '#2A3850',
  outline: '#2E3B52',
  textPrimary: '#F7F9FC',
  textSecondary: '#AAB4C3',
  textMuted: '#7D889B',
  accent: '#34D5FF',
  accentPressed: '#1FB8E0',
  onAccent: '#06202B',
  combo: '#FFD45A',
  onCombo: '#2B2105',
  danger: '#FF5E68',
  success: '#58D68D',
  warning: '#FFA24C',
  shaft: '#0B111B',
  floorLine: '#243048',
  scrim: 'rgba(6, 10, 18, 0.78)',
} as const;

/** 4 px base grid. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const fonts = {
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
  black: 'Inter_900Black',
} as const;

export const type = {
  display: { fontFamily: fonts.black, fontSize: 40, lineHeight: 42, letterSpacing: -0.5 },
  h1: { fontFamily: fonts.extraBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.3 },
  h2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26 },
  body: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 22 },
  caption: { fontFamily: fonts.semibold, fontSize: 13, lineHeight: 18 },
  overline: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, letterSpacing: 1.4, textTransform: 'uppercase' },
  button: { fontFamily: fonts.extraBold, fontSize: 17, lineHeight: 22, letterSpacing: 0.6 },
  number: { fontFamily: fonts.black, fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

export const durations = {
  press: 90,
  fast: 160,
  base: 220,
  slow: 300,
} as const;

/** Minimum touch target: 44 pt (iOS) / 48 dp (Android); we use 48 everywhere. */
export const touchTarget = 48;

export const maxContentWidth = 520;

export function shadow(elevation: 'low' | 'high'): ViewStyle {
  return {
    boxShadow: elevation === 'high' ? '0px 16px 40px rgba(0, 0, 0, 0.45)' : '0px 6px 16px rgba(0, 0, 0, 0.35)',
  };
}

/** Destination badge colours, always paired with a number and an arrow, never alone. */
export const floorPalette = [
  '#34D5FF',
  '#58D68D',
  '#FFD45A',
  '#FF8A5B',
  '#C58CFF',
  '#5B9BFF',
  '#FF6FA8',
  '#7FE3C4',
  '#F2C14E',
  '#9FB4FF',
] as const;

/** The native animation driver does not exist on web; there animations run in JS. */
export const nativeDriver = Platform.OS !== 'web';

/** Dark halo that keeps floating text readable over any background. */
export function textShadow(blur: number, opacity: number): TextStyle {
  const color = `rgba(0, 0, 0, ${opacity})`;
  return Platform.OS === 'web'
    ? ({ textShadow: `0px 1px ${blur}px ${color}` } as TextStyle)
    : { textShadowColor: color, textShadowRadius: blur, textShadowOffset: { width: 0, height: 1 } };
}
