import { Animated, StyleSheet, View } from 'react-native';
import type { UpgradeId } from '../../../game/types';
import { UPGRADES, type UpgradeLevels } from '../../../game/upgrades';
import { format, type Translations } from '../../../i18n';
import { AppText } from '../../components/AppText';
import { Icon } from '../../components/Icon';
import { PressableScale } from '../../components/PressableScale';
import { useEntrance } from '../../components/useEntrance';
import { colors, maxContentWidth, radius, shadow, spacing } from '../../theme';
import { FAMILY_COLORS, UPGRADE_ICONS } from '../visuals';

interface UpgradeOverlayProps {
  choices: UpgradeId[];
  levels: UpgradeLevels;
  t: Translations;
  reduceMotion: boolean;
  bottomInset: number;
  onChoose: (id: UpgradeId) => void;
}

/** Pauses the run for one decision; cards sit low on the screen, within thumb reach. */
export function UpgradeOverlay({ choices, levels, t, reduceMotion, bottomInset, onChoose }: UpgradeOverlayProps) {
  const header = useEntrance(reduceMotion);
  return (
    <View style={[styles.scrim, { paddingBottom: bottomInset + spacing.lg }]} accessibilityViewIsModal>
      <Animated.View style={[styles.header, header]}>
        <AppText variant="h1" align="center" accessibilityRole="header">
          {t.upgrade.title}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} align="center">
          {t.upgrade.subtitle}
        </AppText>
      </Animated.View>
      <View style={styles.cards}>
        {choices.map((id, index) => (
          <UpgradeCard
            key={id}
            id={id}
            nextLevel={(levels[id] ?? 0) + 1}
            t={t}
            reduceMotion={reduceMotion}
            delay={80 + index * 70}
            onChoose={onChoose}
          />
        ))}
      </View>
    </View>
  );
}

interface UpgradeCardProps {
  id: UpgradeId;
  nextLevel: number;
  t: Translations;
  reduceMotion: boolean;
  delay: number;
  onChoose: (id: UpgradeId) => void;
}

function UpgradeCard({ id, nextLevel, t, reduceMotion, delay, onChoose }: UpgradeCardProps) {
  const entrance = useEntrance(reduceMotion, delay, 28);
  const definition = UPGRADES.find((upgrade) => upgrade.id === id)!;
  const color = FAMILY_COLORS[definition.family];
  const copy = t.upgrades[id];
  return (
    <Animated.View style={entrance}>
      <PressableScale
        onPress={() => onChoose(id)}
        sound="upgrade"
        accessibilityRole="button"
        accessibilityLabel={`${copy.name}. ${copy.description}`}
        style={[styles.card, { borderColor: color }]}
        pressedStyle={styles.cardPressed}
      >
        <View style={[styles.icon, { backgroundColor: color }]}>
          <Icon name={UPGRADE_ICONS[id]} size={28} color={colors.backgroundDeep} />
        </View>
        <View style={styles.cardText}>
          <View style={styles.cardTitle}>
            <AppText variant="h2" style={styles.flex} numberOfLines={1}>
              {copy.name}
            </AppText>
            {definition.maxLevel > 1 ? (
              <AppText variant="caption" color={colors.textSecondary}>
                {format(t.upgrade.level, { level: nextLevel })}
              </AppText>
            ) : null}
          </View>
          <AppText variant="body" color={colors.textSecondary}>
            {copy.description}
          </AppText>
          <AppText variant="overline" color={color}>
            {t.families[definition.family]}
          </AppText>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: colors.scrim,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  header: { gap: spacing.xxs },
  cards: { gap: spacing.sm, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    backgroundColor: colors.surfaceRaised,
    minHeight: 96,
    ...shadow('low'),
  },
  cardPressed: { backgroundColor: colors.surfacePressed },
  icon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  flex: { flex: 1 },
});
