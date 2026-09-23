import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';
import { durations, nativeDriver } from '../theme';

/** Fade + short rise used by every overlay and card so motion stays consistent. */
export function useEntrance(reduceMotion: boolean, delay = 0, distance = 18) {
  const [progress] = useState(() => new Animated.Value(reduceMotion ? 1 : 0));
  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: durations.base,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: nativeDriver,
    }).start();
  }, [progress, reduceMotion, delay]);
  return {
    opacity: progress,
    transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
  };
}
