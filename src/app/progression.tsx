import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { format } from '../i18n';
import { rankFor } from '../meta/progression';
import { useAppState } from '../state/AppState';
import { AppText } from '../ui/components/AppText';
import { Button } from '../ui/components/Button';
import { Card } from '../ui/components/Card';
import { Icon, type IconName } from '../ui/components/Icon';
import { Screen } from '../ui/components/Screen';
import { colors, fonts, radius, spacing } from '../ui/theme';

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours} h ${minutes.toString().padStart(2, '0')}` : `${minutes} min`;
}

export default function ProgressionScreen() {
  const { t, save } = useAppState();
  const stats = save.stats;
  const rank = rankFor(stats.totalDelivered);
  const copy = t.progression;

  if (stats.gamesPlayed === 0) {
    return (
      <Screen title={copy.title}>
        <Card style={styles.empty}>
          <Icon name="trophy" size={40} color={colors.textMuted} />
          <AppText variant="h2" align="center">
            {copy.emptyTitle}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} align="center">
            {copy.emptyBody}
          </AppText>
          <Button label={t.home.play} icon="play" onPress={() => router.replace('/play')} />
        </Card>
      </Screen>
    );
  }

  const items: { icon: IconName; label: string; value: string }[] = [
    { icon: 'trophy', label: copy.bestScore, value: save.progress.bestScore.toLocaleString() },
    { icon: 'spark', label: copy.bestCombo, value: `x${stats.bestMultiplier}` },
    { icon: 'users', label: copy.totalDelivered, value: stats.totalDelivered.toLocaleString() },
    { icon: 'star', label: copy.bestDelivered, value: stats.bestDelivered.toLocaleString() },
    { icon: 'replay', label: copy.gamesPlayed, value: stats.gamesPlayed.toLocaleString() },
    { icon: 'lift', label: copy.playTime, value: formatPlayTime(stats.totalPlaySeconds) },
  ];

  return (
    <Screen title={copy.title}>
      <Card title={copy.rank}>
        <View style={styles.rankRow}>
          <View style={styles.rankBadge}>
            <Icon name="crown" size={26} color={colors.onCombo} />
          </View>
          <AppText variant="h1" style={styles.flex}>
            {copy.ranks[rank.rank]}
          </AppText>
        </View>
        <View
          style={styles.track}
          accessible
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(rank.progress * 100) }}
        >
          <View style={[styles.fill, { width: `${rank.progress * 100}%` }]} />
        </View>
        <AppText variant="caption" color={colors.textSecondary}>
          {rank.next
            ? format(copy.nextRank, { remaining: rank.remaining, rank: copy.ranks[rank.next] })
            : copy.maxRank}
        </AppText>
      </Card>
      <Card title={copy.stats}>
        <View style={styles.grid}>
          {items.map((item) => (
            <View key={item.label} style={styles.stat} accessible accessibilityLabel={`${item.label} ${item.value}`}>
              <Icon name={item.icon} size={20} color={colors.accent} />
              <Text style={styles.statValue} allowFontScaling={false}>
                {item.value}
              </Text>
              <AppText variant="caption" color={colors.textSecondary}>
                {item.label}
              </AppText>
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.combo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  track: { height: 10, borderRadius: radius.pill, backgroundColor: colors.surfaceRaised, overflow: 'hidden', marginTop: spacing.xs },
  fill: { height: '100%', backgroundColor: colors.combo, borderRadius: radius.pill },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  stat: {
    width: '48.5%',
    flexGrow: 1,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: 2,
  },
  statValue: { fontFamily: fonts.black, fontSize: 22, color: colors.textPrimary, fontVariant: ['tabular-nums'] },
});
