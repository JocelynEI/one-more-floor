import { StyleSheet, View } from 'react-native';
import { format } from '../i18n';
import { SKINS, type ElevatorSkin } from '../meta/cosmetics';
import { soundBoard } from '../services/audio';
import { haptic } from '../services/haptics';
import { useAppState } from '../state/AppState';
import { AppText } from '../ui/components/AppText';
import { Button } from '../ui/components/Button';
import { CoinBadge } from '../ui/components/CoinBadge';
import { Icon } from '../ui/components/Icon';
import { Screen } from '../ui/components/Screen';
import { Cabin } from '../ui/game/Cabin';
import { colors, radius, spacing } from '../ui/theme';

const PREVIEW_RIDERS = [
  { id: 1, destination: 2, seats: 1 },
  { id: 2, destination: 6, seats: 1 },
  { id: 3, destination: 8, seats: 1 },
];

export default function CollectionScreen() {
  const { t, save } = useAppState();
  return (
    <Screen title={t.collection.title} headerRight={<CoinBadge amount={save.progress.coins} />}>
      <AppText variant="body" color={colors.textSecondary}>
        {t.collection.subtitle}
      </AppText>
      <View style={styles.grid}>
        {SKINS.map((skin) => (
          <SkinCard key={skin.id} skin={skin} />
        ))}
      </View>
    </Screen>
  );
}

function SkinCard({ skin }: { skin: ElevatorSkin }) {
  const { t, save, buySkin, equipSkin } = useAppState();
  const owned = save.progress.ownedSkins.includes(skin.id);
  const equipped = save.progress.equippedSkin === skin.id;
  const missing = skin.price - save.progress.coins;
  const name = t.collection.skins[skin.id];

  const buy = () => {
    const outcome = buySkin(skin.id);
    if (outcome.ok) {
      soundBoard.play('coins');
      haptic('record');
    }
  };

  return (
    <View style={[styles.card, equipped && { borderColor: skin.accent }]}>
      <View style={styles.preview} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Cabin
          skin={skin}
          width={92}
          height={78}
          doorOpen={0.35}
          riders={PREVIEW_RIDERS}
          capacity={4}
          floor={4}
          direction={1}
          glow={equipped ? 0.8 : 0.2}
        />
      </View>
      <View style={styles.nameRow}>
        <AppText variant="h2" style={styles.flex} numberOfLines={1}>
          {name}
        </AppText>
        {equipped ? <Icon name="check" size={20} color={skin.accent} /> : null}
      </View>
      {equipped ? (
        <View style={styles.status} accessible accessibilityLabel={`${name}, ${t.collection.equipped}`}>
          <AppText variant="caption" color={colors.textSecondary}>
            {t.collection.equipped}
          </AppText>
        </View>
      ) : owned ? (
        <Button label={t.collection.equip} onPress={() => equipSkin(skin.id)} variant="secondary" accessibilityHint={name} />
      ) : (
        <View style={styles.buy}>
          <View style={styles.price}>
            <Icon name="coin" size={18} color={colors.combo} />
            <AppText variant="button" color={colors.combo}>
              {skin.price.toLocaleString()}
            </AppText>
          </View>
          <Button
            label={missing > 0 ? format(t.collection.notEnough, { missing }) : t.collection.buy}
            onPress={buy}
            disabled={missing > 0}
            variant={missing > 0 ? 'ghost' : 'primary'}
            icon={missing > 0 ? 'lock' : undefined}
            sound={null}
            accessibilityHint={name}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.outline,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  preview: {
    height: 108,
    borderRadius: radius.md,
    backgroundColor: colors.shaft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  flex: { flex: 1 },
  status: { minHeight: 52, justifyContent: 'center' },
  buy: { gap: spacing.xs },
  price: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs + 2 },
});
