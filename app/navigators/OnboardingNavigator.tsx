import { useAppTheme } from '@/utils/useAppTheme';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Screens from '@/screens/OnboardingScreens';

export type OnboardingStackParamList = {
  WelcomeScreen: undefined;
};

export type OnboardingStackScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingStackNavigator = function OnboardingStackNavigator() {
  const {
    theme: { colors },
  } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.backgroundFirst,
        contentStyle: {
          backgroundColor: colors.backgroundFirst,
        },
      }}
    >
      <Stack.Screen name="WelcomeScreen" component={Screens.WelcomeScreen} />
    </Stack.Navigator>
  );
};
