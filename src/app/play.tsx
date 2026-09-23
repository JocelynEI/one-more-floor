import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getSkin } from '../meta/cosmetics';
import { useAppState } from '../state/AppState';
import { Hud } from '../ui/game/Hud';
import { PauseOverlay } from '../ui/game/overlays/PauseOverlay';
import { ResultsOverlay } from '../ui/game/overlays/ResultsOverlay';
import { TutorialHint } from '../ui/game/overlays/TutorialHint';
import { UpgradeOverlay } from '../ui/game/overlays/UpgradeOverlay';
import { Tower } from '../ui/game/Tower';
import { useGameSession } from '../ui/game/useGameSession';
import { colors, maxContentWidth, spacing } from '../ui/theme';

export default function PlayScreen() {
  const insets = useSafeAreaInsets();
  const { t, save } = useAppState();
  const session = useGameSession();
  const { engine, fx, paused, results } = session;
  const reduceMotion = save.settings.reduceMotion;
  const [towerSize, setTowerSize] = useState<{ width: number; height: number } | null>(null);

  const goHome = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, []);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (session.results) goHome();
        else if (engine.phase === 'upgrade') return true;
        else if (paused) session.resume();
        else session.pause();
        return true;
      });
      return () => subscription.remove();
    }, [session, engine, paused, goHome]),
  );

  const onTowerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setTowerSize((current) =>
      current && current.width === width && current.height === height ? current : { width, height },
    );
  };

  const showTutorial = engine.phase === 'tutorial' && engine.tutorialStep !== null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.column}>
        <Hud engine={engine} fx={fx} t={t} reduceMotion={reduceMotion} onPause={session.pause} />
        <View style={[styles.towerArea, { marginBottom: insets.bottom + spacing.xs }]} onLayout={onTowerLayout}>
          {towerSize ? (
            <Tower
              engine={engine}
              fx={fx}
              skin={getSkin(save.progress.equippedSkin)}
              width={towerSize.width}
              height={towerSize.height}
              reduceMotion={reduceMotion}
              t={t}
              onFloorPress={session.requestFloor}
              onLayout={session.setLayout}
            />
          ) : null}
          {showTutorial ? (
            <View style={styles.tutorial}>
              <TutorialHint
                step={engine.tutorialStep!}
                focusFloor={engine.tutorialFocusFloor}
                t={t}
                reduceMotion={reduceMotion}
                onSkip={session.skipTutorial}
              />
            </View>
          ) : null}
        </View>
      </View>

      {engine.phase === 'upgrade' ? (
        <UpgradeOverlay
          choices={engine.upgradeOffer}
          levels={engine.levels}
          t={t}
          reduceMotion={reduceMotion}
          bottomInset={insets.bottom}
          onChoose={session.chooseUpgrade}
        />
      ) : null}
      {paused ? (
        <PauseOverlay
          t={t}
          reduceMotion={reduceMotion}
          bottomInset={insets.bottom}
          onResume={session.resume}
          onRestart={session.restart}
          onQuit={goHome}
        />
      ) : null}
      {results ? (
        <ResultsOverlay
          results={results}
          bestScore={save.progress.bestScore}
          t={t}
          reduceMotion={reduceMotion}
          bottomInset={insets.bottom}
          onReplay={session.restart}
          onHome={goHome}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  column: { flex: 1, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  towerArea: { flex: 1, marginHorizontal: spacing.xs },
  tutorial: { pointerEvents: 'box-none', position: 'absolute', top: spacing.xs, left: 0, right: 0 },
});
