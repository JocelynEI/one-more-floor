import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { format, type Translations } from '../../../i18n';
import { soundBoard } from '../../../services/audio';
import { AppText } from '../../components/AppText';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { useEntrance } from '../../components/useEntrance';
import { colors, fonts, maxContentWidth, nativeDriver, radius, shadow, spacing } from '../../theme';
import type { SessionResults } from '../useGameSession';

interface ResultsOverlayProps {
  results: SessionResults;
  bestScore: number;
  t: Translations;
  reduceMotion: boolean;
  bottomInset: number;
  onReplay: () => void;
  onHome: () => void;
}

const COUNT_DURATION_MS = 650;

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

/** One screen, one obvious action: PLAY AGAIN sits at the bottom, under the thumb. */
export function ResultsOverlay({ results, bestScore, t, reduceMotion, bottomInset, onReplay, onHome }: ResultsOverlayProps) {
  const sheet = useEntrance(reduceMotion, 0, 40);
  const shownScore = useCountUp(results.score, reduceMotion);
  const [recordScale] = useState(() => new Animated.Value(reduceMotion ? 1 : 0.4));
  const { stats } = results.engine;
  const isRecord = results.rewards.isNewRecord;

  useEffect(() => {
    if (!isRecord || reduceMotion) return;
    Animated.spring(recordScale, { toValue: 1, friction: 4, tension: 140, useNativeDriver: nativeDriver }).start();
  }, [isRecord, reduceMotion, recordScale]);

  useEffect(() => {
    if (results.rewards.coins <= 0) return;
    const timer = setTimeout(() => soundBoard.play('coins'), reduceMotion ? 0 : COUNT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [results.rewards.coins, reduceMotion]);

  const statItems = [
    { icon: 'users' as const, label: t.results.delivered, value: String(stats.delivered) },
    { icon: 'spark' as const, label: t.results.bestCombo, value: `x${stats.bestMultiplier}` },
    { icon: 'replay' as const, label: t.results.time, value: formatDuration(stats.duration) },
  ];

  return (
    <View style={[styles.scrim, { paddingBottom: bottomInset + spacing.md }]} accessibilityViewIsModal>
      <Animated.View style={[styles.sheet, sheet]}>
        <AppText variant="overline" color={colors.textSecondary} align="center" accessibilityRole="header">
          {t.results.title}
        </AppText>
        {isRecord ? (
          <Animated.View style={[styles.record, { transform: [{ scale: recordScale }] }]}>
            <Icon name="trophy" size={18} color={colors.onCombo} />
            <AppText variant="button" color={colors.onCombo}>
              {t.results.newRecord}
            </AppText>
          </Animated.View>
        ) : null}
        <Text style={[styles.score, isRecord && styles.scoreRecord]} allowFontScaling={false} accessibilityLabel={`${t.results.score} ${results.score}`}>
          {shownScore.toLocaleString()}
        </Text>
        <AppText variant="caption" color={colors.textSecondary} align="center">
          {t.results.best} {Math.max(bestScore, results.score).toLocaleString()}
        </AppText>
        <View style={styles.stats}>
          {statItems.map((item) => (
            <View key={item.label} style={styles.stat} accessible accessibilityLabel={`${item.label} ${item.value}`}>
              <Icon name={item.icon} size={18} color={colors.textSecondary} />
              <Text style={styles.statValue} allowFontScaling={false}>
                {item.value}
              </Text>
              <AppText variant="caption" color={colors.textMuted} align="center" numberOfLines={1}>
                {item.label}
              </AppText>
            </View>
          ))}
        </View>
        <View style={styles.reward}>
          <Icon name="coin" size={22} color={colors.combo} />
          <AppText variant="button" color={colors.combo}>
            {format(t.results.reward, { coins: results.rewards.coins })}
          </AppText>
        </View>
        <Button label={t.results.replay} onPress={onReplay} icon="replay" size="lg" />
        <Button label={t.results.home} onPress={onHome} variant="ghost" icon="home" sound="uiBack" />
      </Animated.View>
    </View>
  );
}

function useCountUp(target: number, instant: boolean): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (instant) return;
    const animated = new Animated.Value(0);
    const listener = animated.addListener(({ value: progress }) => setValue(Math.round(target * progress)));
    Animated.timing(animated, {
      toValue: 1,
      duration: COUNT_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => {
      animated.removeListener(listener);
      animated.stopAnimation();
    };
  }, [target, instant]);
  return instant ? target : value;
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
  },
  sheet: {
    width: '100%',
    maxWidth: maxContentWidth,
    alignSelf: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow('high'),
  },
  record: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.combo,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs + 2,
  },
  score: {
    fontFamily: fonts.black,
    fontSize: 56,
    lineHeight: 62,
    color: colors.textPrimary,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  scoreRecord: { color: colors.combo },
  stats: { flexDirection: 'row', gap: spacing.xs, marginVertical: spacing.xs },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xxs,
  },
  statValue: { fontFamily: fonts.black, fontSize: 20, color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  reward: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, marginBottom: spacing.xs },
});
