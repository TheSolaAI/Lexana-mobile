import { useAppTheme } from '@/utils/useAppTheme';
import { NativeStackScreenProps, createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Screens from '@/screens/AppScreens';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { fetchChatRooms } from '@/stores/slices/chatRoomsSlice';
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

  /**
   * Global State
   */
  const { rooms } = useAppSelector(state => state.chatRooms);
  const dispatch = useAppDispatch();

  /**
   * Add any logic here that needs to run as soon as the app loads and we know that
   * the user is logged in
   */
  useEffect(() => {
    const fetchRooms = async () => {
      await dispatch(fetchChatRooms()).unwrap();
      console.log('Chat rooms fetched:', rooms);
    };

    fetchRooms();
  }, []);

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
