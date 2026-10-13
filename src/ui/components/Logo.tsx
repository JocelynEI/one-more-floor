import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { colors, fonts } from '../theme';
import { AppText } from './AppText';

/** The app mark: stylised lift doors with a cyan light seam and a gold floor indicator. */
export function LiftMark({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="seam" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.accent} stopOpacity="1" />
          <Stop offset="1" stopColor={colors.accent} stopOpacity="0.35" />
        </LinearGradient>
      </Defs>
      <Rect x="18" y="26" width="64" height="66" rx="10" fill={colors.surfaceRaised} stroke="#3C4E6C" strokeWidth="3" />
      <Rect x="26" y="34" width="22.5" height="50" rx="4" fill="#8C9BB3" />
      <Rect x="51.5" y="34" width="22.5" height="50" rx="4" fill="#8C9BB3" />
      <Rect x="48.5" y="34" width="3" height="50" rx="1.5" fill="url(#seam)" />
      <Path d="M50 6 L60 18 H40 Z" fill={colors.combo} />
    </Svg>
  );
}

export function Wordmark() {
  return (
    <View style={styles.wordmark} accessible accessibilityRole="header" accessibilityLabel="TOWER DING">
      <AppText style={styles.small}>TOWER</AppText>
      <AppText style={styles.big}>DING</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wordmark: { alignItems: 'center' },
  small: { fontFamily: fonts.extraBold, fontSize: 18, letterSpacing: 8, color: colors.accent, marginRight: -8 },
  big: { fontFamily: fonts.black, fontSize: 56, lineHeight: 60, letterSpacing: 2, color: colors.textPrimary },
});
