import { StyleSheet, Text, View } from 'react-native';
import type { GameEngine } from '../../game/engine';
import type { ActiveGameEvent } from '../../game/types';
import { floorLabel, format, type Translations } from '../../i18n';
import { AppText } from '../components/AppText';
import { Icon } from '../components/Icon';
import { IconButton } from '../components/IconButton';
import { colors, fonts, radius, spacing } from '../theme';
import type { SceneFx } from './sceneFx';
import { EVENT_VISUALS } from './visuals';

interface HudProps {
  engine: GameEngine;
  fx: SceneFx;
  t: Translations;
  reduceMotion: boolean;
  onPause: () => void;
}

export function Hud({ engine, fx, t, reduceMotion, onPause }: HudProps) {
  const multiplier = engine.multiplier;
  const comboActive = multiplier > 1;
  const punch = reduceMotion ? 1 : 1 + fx.comboPunch * 0.25;
  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <View style={styles.score} accessible accessibilityLabel={`${t.hud.score} ${engine.score}`}>
          <AppText variant="overline" color={colors.textSecondary}>
            {t.hud.score}
          </AppText>
          <Text style={styles.scoreValue} allowFontScaling={false}>
            {Math.round(fx.displayScore).toLocaleString()}
          </Text>
        </View>
        <View
          style={[styles.combo, comboActive && styles.comboActive, { transform: [{ scale: punch }] }]}
          accessible
          accessibilityLabel={format(t.a11y.comboMeter, { multiplier })}
        >
          <Text style={[styles.comboText, comboActive && styles.comboTextActive]} allowFontScaling={false}>
            x{multiplier}
          </Text>
          <View style={styles.comboTrack}>
            <View
              style={[
                styles.comboFill,
                { width: `${Math.max(0, engine.comboTimeRatio) * 100}%`, backgroundColor: comboActive ? colors.onCombo : colors.combo },
              ]}
            />
          </View>
        </View>
        <IconButton icon="pause" label={t.hud.pause} onPress={onPause} />
      </View>
      <StressMeter engine={engine} fx={fx} t={t} reduceMotion={reduceMotion} />
      <EventBanner event={engine.events.active} t={t} />
    </View>
  );
}

function StressMeter({ engine, fx, t, reduceMotion }: Omit<HudProps, 'onPause'>) {
  const ratio = engine.stress / engine.balance.stress.max;
  const percent = Math.round(ratio * 100);
  const warning = engine.stress >= engine.balance.stress.warningThreshold;
  const color = ratio < 0.45 ? colors.success : warning ? colors.danger : colors.warning;
  const pulse = warning && !reduceMotion ? 0.75 + 0.25 * Math.sin(engine.stats.duration * 8) : 1;
  return (
    <View
      style={styles.stress}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={format(t.a11y.stressMeter, { percent })}
    >
      <View style={styles.stressLabel}>
        <Icon name={warning ? 'bolt' : 'users'} size={14} color={warning ? colors.danger : colors.textSecondary} />
        <AppText variant="overline" color={warning ? colors.danger : colors.textSecondary}>
          {t.hud.stress}
        </AppText>
      </View>
      <View style={styles.stressTrack}>
        <View style={[styles.stressFill, { width: `${percent}%`, backgroundColor: color, opacity: pulse }]} />
        {[25, 50, 75].map((mark) => (
          <View key={mark} style={[styles.stressTick, { left: `${mark}%` }]} />
        ))}
        {fx.stressPulse > 0 ? <View style={[StyleSheet.absoluteFill, styles.stressFlash, { opacity: fx.stressPulse * 0.5 }]} /> : null}
      </View>
      <Text style={[styles.stressValue, warning && { color: colors.danger }]} allowFontScaling={false}>
        {percent}%
      </Text>
    </View>
  );
}

function EventBanner({ event, t }: { event: ActiveGameEvent | null; t: Translations }) {
  if (!event) return <View style={styles.bannerSpace} />;
  const visual = EVENT_VISUALS[event.kind];
  const announcing = event.announceLeft > 0;
  const copy = t.events[event.kind];
  const description = format(copy.description, {
    floor: floorLabel(event.floors[0] ?? 0),
    floorA: floorLabel(event.floors[0] ?? 0),
    floorB: floorLabel(event.floors[1] ?? 0),
  });
  const progress = announcing ? 1 : event.timeLeft / event.duration;
  return (
    <View style={[styles.banner, { borderColor: visual.color }]} accessibilityLiveRegion="polite" accessible>
      <View style={[styles.bannerIcon, { backgroundColor: visual.color }]}>
        <Icon name={visual.icon} size={16} color={colors.backgroundDeep} />
      </View>
      <View style={styles.bannerText}>
        <AppText variant="caption" numberOfLines={1}>
          {announcing ? `${t.events.incoming} · ` : ''}
          <AppText variant="caption" color={visual.color}>
            {copy.name}
          </AppText>
        </AppText>
        <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
          {description}
        </AppText>
      </View>
      <View style={styles.bannerTimer}>
        <View style={[styles.bannerTimerFill, { height: `${progress * 100}%`, backgroundColor: visual.color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: spacing.md, gap: spacing.xs, paddingBottom: spacing.xs },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 52 },
  score: { minWidth: 110 },
  scoreValue: { fontFamily: fonts.black, fontSize: 28, lineHeight: 32, color: colors.textPrimary, fontVariant: ['tabular-nums'] },
  combo: {
    minWidth: 76,
    alignItems: 'center',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    backgroundColor: colors.surface,
  },
  comboActive: { backgroundColor: colors.combo },
  comboText: { fontFamily: fonts.black, fontSize: 22, lineHeight: 26, color: colors.textMuted },
  comboTextActive: { color: colors.onCombo },
  comboTrack: { width: 48, height: 3, borderRadius: 2, backgroundColor: 'rgba(0,0,0,0.25)', overflow: 'hidden', marginTop: 2 },
  comboFill: { height: '100%' },
  stress: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  stressLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, width: 76 },
  stressTrack: {
    flex: 1,
    height: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  stressFill: { height: '100%', borderRadius: radius.pill },
  stressTick: { position: 'absolute', top: 2, bottom: 2, width: 1.5, backgroundColor: colors.background, opacity: 0.8 },
  stressFlash: { backgroundColor: colors.danger },
  stressValue: { width: 44, textAlign: 'right', fontFamily: fonts.extraBold, fontSize: 13, color: colors.textSecondary, fontVariant: ['tabular-nums'] },
  bannerSpace: { height: 44 },
  banner: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs,
  },
  bannerIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  bannerText: { flex: 1 },
  bannerTimer: { width: 4, height: 28, borderRadius: 2, backgroundColor: colors.surfaceRaised, justifyContent: 'flex-end', overflow: 'hidden' },
  bannerTimerFill: { width: '100%' },
});
