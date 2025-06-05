import { useAppTheme } from '@/utils/useAppTheme';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Screens from '@/screens/AppScreens';

export type AppStackParamList = {
  ChatScreen: undefined;
  SettingsScreen: undefined;
  MenuScreen: undefined;
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
        navigationBarColor: colors.secondaryBg,
        contentStyle: {
          backgroundColor: colors.secondaryBg,
        },
      }}
    >
      <Stack.Screen name="ChatScreen" component={Screens.ChatScreen} />
      <Stack.Screen 
        name="SettingsScreen" 
        component={Screens.SettingsScreen}
        options={{
          animation: 'ios_from_right',
        }}
      />
      <Stack.Screen
        name="MenuScreen"
        component={Screens.MenuScreen}
        options={{
          animation: 'fade_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};
