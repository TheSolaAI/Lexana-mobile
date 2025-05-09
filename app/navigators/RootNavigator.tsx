import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackNavigator } from './OnboardingNavigator';
import { AppStackNavigator } from './AppNavigator';
import { usePrivy } from '@privy-io/expo';
import { SplashScreen } from '@/screens/AppScreens/SplashScreen';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export type RootStackNavigatorParamList = {
  Onboarding: undefined;
  App: undefined;
  Splash: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackNavigatorParamList> =
  NativeStackScreenProps<RootStackNavigatorParamList, T>;

const RootStack = createNativeStackNavigator<RootStackNavigatorParamList>();

export const RootNavigator = function RootNavigator() {
  const { user, isReady } = usePrivy();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom',
      }}
    >
      {isReady ? (
        user ? (
          <RootStack.Screen name="App" component={AppStackNavigator} />
        ) : (
          <RootStack.Screen name="Onboarding" component={OnboardingStackNavigator} />
        )
      ) : (
        <RootStack.Screen name="Splash" component={SplashScreen} />
      )}
    </RootStack.Navigator>
  );
};
