import { Text, type TextProps } from 'react-native';
import { colors, type as typography } from '../theme';

type Variant = keyof typeof typography;

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  align?: 'left' | 'center' | 'right';
}

/** Every text in the app goes through this so the type scale stays consistent. */
export function AppText({ variant = 'body', color = colors.textPrimary, align, style, ...rest }: AppTextProps) {
  return (
    <Text
      maxFontSizeMultiplier={1.4}
      {...rest}
      style={[typography[variant], { color, textAlign: align }, style]}
    />
  );
}
