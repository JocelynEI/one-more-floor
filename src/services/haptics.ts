import * as Haptics from 'expo-haptics';
import { reportError } from './log';

export type HapticCue = 'tap' | 'arrive' | 'deliver' | 'combo' | 'record' | 'error' | 'warning';

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

function run(effect: () => Promise<void>): void {
  effect().catch((error) => reportError('haptics', error));
}

/** Each cue maps to one intensity so feedback stays consistent across the game. */
export function haptic(cue: HapticCue): void {
  if (!enabled) return;
  switch (cue) {
    case 'tap':
      run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
      return;
    case 'arrive':
      run(() => Haptics.selectionAsync());
      return;
    case 'deliver':
      run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft));
      return;
    case 'combo':
      run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
      return;
    case 'record':
      run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
      return;
    case 'warning':
      run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
      return;
    case 'error':
      run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
      return;
  }
}
