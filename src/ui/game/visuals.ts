import type { GameEventKind, UpgradeFamily, UpgradeId } from '../../game/types';
import type { IconName } from '../components/Icon';
import { colors } from '../theme';

export const FAMILY_COLORS: Record<UpgradeFamily, string> = {
  speed: colors.accent,
  capacity: colors.success,
  calm: '#A9B8FF',
  score: colors.combo,
};

export const UPGRADE_ICONS: Record<UpgradeId, IconName> = {
  fastDoors: 'lift',
  turboMotor: 'bolt',
  expressLine: 'up',
  extraSpace: 'expand',
  calmAtmosphere: 'leaf',
  stressRelief: 'shield',
  vipLounge: 'crown',
  comboMaster: 'spark',
  tipJar: 'coin',
};

export const EVENT_VISUALS: Record<GameEventKind, { icon: IconName; color: string }> = {
  rushHour: { icon: 'users', color: colors.warning },
  maintenance: { icon: 'wrench', color: colors.warning },
  vipArrival: { icon: 'crown', color: colors.combo },
  doubleRush: { icon: 'star', color: colors.combo },
  express: { icon: 'bolt', color: colors.accent },
};
