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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { persistor, store } from './stores/rootStore';
import { Toaster } from 'sonner-native';

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
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <ErrorBoundary catchErrors={'dev'}>
            <GestureHandlerRootView>
              <KeyboardProvider>
                <PrivyProvider
                  appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID!}
                  clientId={process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID}
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
              <Toaster richColors theme="system" />
            </GestureHandlerRootView>
          </ErrorBoundary>
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
