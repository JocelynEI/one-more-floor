import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { format } from '../i18n';
import type { LanguageSetting } from '../meta/saveData';
import { useAppState } from '../state/AppState';
import { AppText } from '../ui/components/AppText';
import { Card } from '../ui/components/Card';
import { ConfirmDialog } from '../ui/components/ConfirmDialog';
import { Screen } from '../ui/components/Screen';
import { LinkRow, SegmentedRow, ToggleRow, VolumeRow } from '../ui/components/SettingControls';
import { colors, spacing } from '../ui/theme';

const NOTICE_MS = 2400;

export default function SettingsScreen() {
  const { t, save, updateSettings, setTutorialCompleted, resetProgress } = useAppState();
  const settings = save.settings;
  const copy = t.settings;
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  const languages: { value: LanguageSetting; label: string }[] = [
    { value: 'system', label: copy.languageSystem },
    { value: 'en', label: copy.languageEnglish },
    { value: 'fr', label: copy.languageFrench },
  ];

  return (
    <Screen title={copy.title}>
      <Card title={copy.audio}>
        <VolumeRow
          icon="music"
          label={copy.music}
          value={settings.musicVolume}
          disabled={settings.muted}
          onChange={(musicVolume) => updateSettings({ musicVolume })}
        />
        <VolumeRow
          icon="sound"
          label={copy.sfx}
          value={settings.sfxVolume}
          disabled={settings.muted}
          onChange={(sfxVolume) => updateSettings({ sfxVolume })}
        />
        <ToggleRow icon="sound" label={copy.mute} value={settings.muted} onChange={(muted) => updateSettings({ muted })} />
      </Card>

      <Card title={copy.feel}>
        <ToggleRow
          icon="vibration"
          label={copy.haptics}
          value={settings.haptics}
          onChange={(haptics) => updateSettings({ haptics })}
        />
        <ToggleRow
          icon="motion"
          label={copy.reduceMotion}
          hint={copy.reduceMotionHint}
          value={settings.reduceMotion}
          onChange={(reduceMotion) => updateSettings({ reduceMotion })}
        />
      </Card>

      <Card title={copy.language}>
        <SegmentedRow
          icon="globe"
          label={copy.language}
          value={settings.language}
          options={languages}
          onChange={(language) => updateSettings({ language })}
        />
      </Card>

      <Card title={copy.help}>
        <LinkRow icon="help" label={t.howToPlay.title} onPress={() => router.push('/how-to-play')} />
        <LinkRow
          icon="replay"
          label={copy.replayTutorial}
          hint={copy.replayTutorialHint}
          onPress={() => {
            setTutorialCompleted(false);
            setNotice(copy.replayTutorialDone);
          }}
        />
      </Card>

      <Card title={copy.about}>
        <LinkRow icon="shield" label={copy.privacy} onPress={() => router.push('/privacy')} />
        <LinkRow icon="info" label={copy.credits} onPress={() => router.push('/credits')} />
      </Card>

      <Card title={copy.data}>
        <LinkRow icon="trash" label={copy.reset} tone="danger" onPress={() => setConfirmReset(true)} />
      </Card>

      {notice ? (
        <AppText variant="caption" color={colors.success} align="center" accessibilityLiveRegion="polite">
          {notice}
        </AppText>
      ) : null}

      <AppText variant="caption" color={colors.textMuted} align="center" style={styles.version}>
        {format(copy.version, { version: Constants.expoConfig?.version ?? '1.0.0' })}
      </AppText>

      <ConfirmDialog
        visible={confirmReset}
        title={copy.resetTitle}
        body={copy.resetBody}
        confirmLabel={copy.resetConfirm}
        cancelLabel={t.common.cancel}
        onCancel={() => setConfirmReset(false)}
        onConfirm={async () => {
          setConfirmReset(false);
          await resetProgress();
          setNotice(copy.resetDone);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  version: { marginTop: spacing.xs },
});
