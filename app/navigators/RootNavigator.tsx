import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackNavigator } from './OnboardingNavigator';
import { AppStackNavigator } from './AppNavigator';
import { usePrivy } from '@privy-io/expo';

export type RootStackNavigatorParamList = {
  Onboarding: undefined;
  App: undefined;
};

export type OnboardingStackScreenProps<T extends keyof RootStackNavigatorParamList> =
  NativeStackScreenProps<RootStackNavigatorParamList, T>;

const RootStack = createNativeStackNavigator<RootStackNavigatorParamList>();

export const RootNavigator = function RootNavigator() {
  const { user } = usePrivy();

  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {user ? (
        <RootStack.Screen name="App" component={AppStackNavigator} />
      ) : (
        <RootStack.Screen name="Onboarding" component={OnboardingStackNavigator} />
      )}
    </RootStack.Navigator>
  );
};
