import { useAppTheme } from '@/utils/useAppTheme';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Screens from '@/screens/AppScreens';

export type AppStackParamList = {
  ChatScreen: undefined;
};

export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>;

const Stack = createNativeStackNavigator<AppStackParamList>();

export const AppStackNavigator = function AppStack() {
  const {
    theme: { colors },
  } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        navigationBarColor: colors.background,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen name="ChatScreen" component={Screens.ChatScreen} />
    </Stack.Navigator>
  );
};
