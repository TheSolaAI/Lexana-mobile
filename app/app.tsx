/* eslint-disable import/first */

if (__DEV__) {
  require('./devtools/ReactotronConfig.ts');
}
import './utils/gestureHandler';
import { initI18n } from './i18n';
import './utils/ignoreWarnings';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AppNavigator } from './navigators';
import { ErrorBoundary } from './screens/ErrorScreen/ErrorBoundary';
import { customFontsToLoad } from './theme';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export function App() {
  const [areFontsLoaded, fontLoadError] = useFonts(customFontsToLoad);
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    initI18n().then(() => setIsI18nInitialized(true));
  }, []);
  if (!isI18nInitialized || (!areFontsLoaded && !fontLoadError)) {
    setTimeout(SplashScreen.hideAsync, 500);
    return null;
  }

  // otherwise, we're ready to render the app
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ErrorBoundary catchErrors={'dev'}>
        <KeyboardProvider>
          <AppNavigator />
        </KeyboardProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
