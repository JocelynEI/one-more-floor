import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSkin } from '../meta/cosmetics';
import { useAppState } from '../state/AppState';
import { AppText } from '../ui/components/AppText';
import { Button } from '../ui/components/Button';
import { CoinBadge } from '../ui/components/CoinBadge';
import { Icon, type IconName } from '../ui/components/Icon';
import { IconButton } from '../ui/components/IconButton';
import { LiftMark, Wordmark } from '../ui/components/Logo';
import { PressableScale } from '../ui/components/PressableScale';
import { useEntrance } from '../ui/components/useEntrance';
import { Cabin } from '../ui/game/Cabin';
import { colors, fonts, maxContentWidth, nativeDriver, radius, spacing } from '../ui/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { t, save } = useAppState();
  const reduceMotion = save.settings.reduceMotion;
  const best = save.progress.bestScore;
  const title = useEntrance(reduceMotion, 0, 24);
  const actions = useEntrance(reduceMotion, 120, 24);
  const { height } = useWindowDimensions();
  const showShaft = height > 640;

  return (
    <View style={[styles.root, { paddingTop: insets.top + spacing.xs, paddingBottom: insets.bottom + spacing.md }]}>
      <View style={styles.topBar}>
        <CoinBadge amount={save.progress.coins} />
        <IconButton icon="settings" label={t.home.settings} onPress={() => router.push('/settings')} />
      </View>

      <Animated.View style={[styles.hero, title]}>
        {showShaft ? <IdleShaft reduceMotion={reduceMotion} skinId={save.progress.equippedSkin} /> : <LiftMark size={96} />}
        <Wordmark />
        <AppText variant="body" color={colors.textSecondary} align="center">
          {t.app.tagline}
        </AppText>
      </Animated.View>

      <Animated.View style={[styles.actions, actions]}>
        <View style={styles.best} accessible accessibilityLabel={best > 0 ? `${t.home.best} ${best}` : t.home.noBestYet}>
          {best > 0 ? (
            <>
              <Icon name="trophy" size={18} color={colors.combo} />
              <AppText variant="overline" color={colors.textSecondary}>
                {t.home.best}
              </AppText>
              <AppText style={styles.bestValue}>{best.toLocaleString()}</AppText>
            </>
          ) : (
            <AppText variant="caption" color={colors.textSecondary}>
              {t.home.noBestYet}
            </AppText>
          )}
        </View>
        <Button label={t.home.play} onPress={() => router.push('/play')} icon="play" size="lg" />
        <View style={styles.tiles}>
          <Tile icon="trophy" label={t.home.progression} onPress={() => router.push('/progression')} />
          <Tile icon="lift" label={t.home.collection} onPress={() => router.push('/collection')} />
          <Tile icon="help" label={t.home.howToPlay} onPress={() => router.push('/how-to-play')} />
        </View>
      </Animated.View>
    </View>
  );
}

function Tile({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      containerStyle={styles.flex}
      style={styles.tile}
      pressedStyle={styles.tilePressed}
    >
      <Icon name={icon} size={24} color={colors.textPrimary} />
      <AppText variant="caption" align="center" numberOfLines={1}>
        {label}
      </AppText>
    </PressableScale>
  );
}

const SHAFT_FLOORS = 4;
const SHAFT_ROW = 58;

/** A small looping lift ride: the equipped skin, gently moving between floors. */
function IdleShaft({ reduceMotion, skinId }: { reduceMotion: boolean; skinId: string }) {
  const [position] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduceMotion) return;
    const stops = [2, 1, 3, 0];
    const animation = Animated.loop(
      Animated.sequence(
        stops.flatMap((stop) => [
          Animated.timing(position, {
            toValue: stop,
            duration: 900,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: nativeDriver,
          }),
          Animated.delay(700),
        ]),
      ),
    );
    animation.start();
    return () => animation.stop();
  }, [position, reduceMotion]);

  const translateY = position.interpolate({
    inputRange: [0, SHAFT_FLOORS - 1],
    outputRange: [(SHAFT_FLOORS - 1) * SHAFT_ROW, 0],
  });
  return (
    <View style={styles.shaft} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {Array.from({ length: SHAFT_FLOORS }, (_, index) => (
        <View key={index} style={[styles.shaftFloor, { top: index * SHAFT_ROW + SHAFT_ROW - 1 }]} />
      ))}
      <Animated.View style={[styles.shaftCabin, { transform: [{ translateY }] }]}>
        <Cabin
          skin={getSkin(skinId)}
          width={96}
          height={SHAFT_ROW - 4}
          doorOpen={0}
          riders={[
            { id: 1, destination: 3, seats: 1 },
            { id: 2, destination: 7, seats: 1 },
          ]}
          capacity={4}
          floor={4}
          direction={0}
          glow={0.4}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  actions: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', gap: spacing.md },
  best: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    minHeight: 28,
  },
  bestValue: { fontFamily: fonts.black, fontSize: 22, color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  tiles: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    minHeight: 76,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs + 2,
    paddingHorizontal: spacing.xxs,
  },
  flex: { flex: 1 },
  tilePressed: { backgroundColor: colors.surfaceRaised },
  shaft: {
    width: 110,
    height: SHAFT_FLOORS * SHAFT_ROW,
    backgroundColor: colors.shaft,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outline,
    overflow: 'hidden',
  },
  shaftFloor: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: colors.floorLine },
  shaftCabin: { position: 'absolute', left: 7, top: 2 },
});
