/* eslint-disable import/first */

/**Pollyfils for privy and solana/web3.js */
import 'fast-text-encoding';
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;
import '@ethersproject/shims';
import '@/pollyfill';

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
import { customFontsToLoad, darkTheme } from './theme';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { PrivyProvider } from '@privy-io/expo';
import { PrivyElements } from '@privy-io/expo/ui';

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
          <PrivyProvider
            appId="cm5lc4euv00c5kmrbpu9oj0u4"
            clientId="client-WY5fNz4s4Zk72BvJbQoKagZPN9v6RP3bkFLVxXacMZ9Mr"
            config={{
              embedded: {
                solana: {
                  createOnLogin: 'users-without-wallets',
                },
              },
            }}
          >
            <PrivyElements
              config={{
                appearance: { colorScheme: 'dark', accentColor: darkTheme.colors.primary },
              }}
            />
            <AppNavigator />
          </PrivyProvider>
        </KeyboardProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
