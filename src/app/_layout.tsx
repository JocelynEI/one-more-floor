import {
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { soundBoard } from '../services/audio';
import { reportError } from '../services/log';
import { AppStateProvider, useAppState } from '../state/AppState';
import { colors } from '../ui/theme';

SplashScreen.preventAutoHideAsync().catch((error) => reportError('splash', error));

export default function RootLayout() {
  return (
    <SafeAreaProvider style={styles.root}>
      <AppStateProvider>
        <StatusBar style="light" />
        <Navigator />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

function Navigator() {
  const { ready, save } = useAppState();
  const [fontsLoaded, fontError] = useFonts({
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });
  const fontsSettled = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (fontError) reportError('fonts', fontError);
  }, [fontError]);

  useEffect(() => {
    soundBoard.configure().then(() => soundBoard.preload());
  }, []);

  useEffect(() => {
    if (!ready || !fontsSettled) return;
    SplashScreen.hideAsync().catch((error) => reportError('splash', error));
    // Browsers only allow audio after a user gesture; native can start the ambience right away.
    if (Platform.OS !== 'web') soundBoard.startBackground();
  }, [ready, fontsSettled]);

  if (!ready || !fontsSettled) return <View style={styles.root} />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: save.settings.reduceMotion ? 'none' : 'fade',
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="play" options={{ gestureEnabled: false, animation: save.settings.reduceMotion ? 'none' : 'fade' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
});
