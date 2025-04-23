import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackNavigator } from './OnboardingNavigator';
import { AppStackNavigator } from './AppNavigator';

export type RootStackNavigatorParamList = {
  Onboarding: undefined;
  App: undefined;
};

export type OnboardingStackScreenProps<T extends keyof RootStackNavigatorParamList> =
  NativeStackScreenProps<RootStackNavigatorParamList, T>;

const RootStack = createNativeStackNavigator<RootStackNavigatorParamList>();

export const RootNavigator = function RootNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <RootStack.Screen name="Onboarding" component={OnboardingStackNavigator} />
      <RootStack.Screen name="App" component={AppStackNavigator} />
    </RootStack.Navigator>
  );
};
