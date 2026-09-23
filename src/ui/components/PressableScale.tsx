import { useState, type ReactNode } from 'react';
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { soundBoard, type SoundName } from '../../services/audio';
import { haptic } from '../../services/haptics';
import { useAppState } from '../../state/AppState';
import { durations, nativeDriver } from '../theme';

interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Layout of the touch area itself (e.g. `flex: 1` inside a row). */
  containerStyle?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  /** Sound played on press; `null` for silent controls. */
  sound?: SoundName | null;
  pressedScale?: number;
}

/** Base of every tappable element: scale feedback, click sound and light haptic. */
export function PressableScale({
  children,
  style,
  containerStyle,
  pressedStyle,
  sound = 'uiTap',
  pressedScale = 0.96,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  ...rest
}: PressableScaleProps) {
  const [scale] = useState(() => new Animated.Value(1));
  const { save } = useAppState();
  const reduceMotion = save.settings.reduceMotion;

  const animateTo = (value: number) => {
    Animated.timing(scale, {
      toValue: value,
      duration: durations.press,
      useNativeDriver: nativeDriver,
    }).start();
  };

  return (
    <Pressable
      {...rest}
      style={containerStyle}
      disabled={disabled}
      accessibilityState={{ disabled: !!disabled }}
      onPressIn={(event) => {
        if (!reduceMotion) animateTo(pressedScale);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        animateTo(1);
        onPressOut?.(event);
      }}
      onPress={(event) => {
        soundBoard.startBackground();
        if (sound) soundBoard.play(sound);
        haptic('tap');
        onPress?.(event);
      }}
    >
      {({ pressed }) => (
        <Animated.View style={[style, pressed && pressedStyle, { transform: [{ scale }] }]}>{children}</Animated.View>
      )}
    </Pressable>
  );
}
