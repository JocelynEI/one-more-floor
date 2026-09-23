export type SkinId = 'classic' | 'neon' | 'retro' | 'industrial' | 'gold' | 'space';

export interface ElevatorSkin {
  id: SkinId;
  price: number;
  frame: string;
  frameEdge: string;
  interior: string;
  light: string;
  door: string;
  doorSeam: string;
  accent: string;
  glow: string;
}

/** Cosmetic only: skins never change gameplay. */
export const SKINS: readonly ElevatorSkin[] = [
  {
    id: 'classic',
    price: 0,
    frame: '#2A3850',
    frameEdge: '#3C4E6C',
    interior: '#FFF3D6',
    light: '#FFE7A8',
    door: '#8C9BB3',
    doorSeam: '#5E6D86',
    accent: '#34D5FF',
    glow: '#34D5FF',
  },
  {
    id: 'neon',
    price: 300,
    frame: '#1B1036',
    frameEdge: '#FF4FD8',
    interior: '#2B1B55',
    light: '#FF8AF0',
    door: '#3A2670',
    doorSeam: '#FF4FD8',
    accent: '#FF4FD8',
    glow: '#FF4FD8',
  },
  {
    id: 'retro',
    price: 450,
    frame: '#5A3B22',
    frameEdge: '#C89B5A',
    interior: '#FBE3B8',
    light: '#FFD89A',
    door: '#B8864B',
    doorSeam: '#7A5230',
    accent: '#FFB35A',
    glow: '#FFB35A',
  },
  {
    id: 'industrial',
    price: 600,
    frame: '#3A3F45',
    frameEdge: '#F2B233',
    interior: '#D9DEE3',
    light: '#F5F7FA',
    door: '#6B737C',
    doorSeam: '#F2B233',
    accent: '#F2B233',
    glow: '#F2B233',
  },
  {
    id: 'gold',
    price: 900,
    frame: '#3B2F12',
    frameEdge: '#FFD45A',
    interior: '#FFF6D8',
    light: '#FFE58F',
    door: '#D9A92E',
    doorSeam: '#8C6A14',
    accent: '#FFD45A',
    glow: '#FFD45A',
  },
  {
    id: 'space',
    price: 1300,
    frame: '#0B1B2E',
    frameEdge: '#58D6C0',
    interior: '#12324A',
    light: '#7FF3E0',
    door: '#1F4460',
    doorSeam: '#58D6C0',
    accent: '#58D6C0',
    glow: '#58D6C0',
  },
];

export const DEFAULT_SKIN: SkinId = 'classic';

export function getSkin(id: string): ElevatorSkin {
  return SKINS.find((skin) => skin.id === id) ?? SKINS[0];
}

export function isSkinId(value: unknown): value is SkinId {
  return typeof value === 'string' && SKINS.some((skin) => skin.id === value);
}
