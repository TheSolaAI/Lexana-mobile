/* eslint-disable react-native/no-color-literals */
import { AppStackScreenProps } from '@/navigators/AppNavigator';
import { FC, useState } from 'react';
import { Screen } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { $styles } from '@/theme';
import { Screenheader } from '@/components/app/ScreenHeader';
import { ViewStyle, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useStandardProvider } from '@/hooks/useStandardProvider';
import { Chat } from '@/components/chat/Chat';
import { Feather } from '@expo/vector-icons';
import { InputCard } from '@/components/chat/InputCard';
import { useAppDispatch } from '@/stores/hooks';
import { setSelectedRoomId } from '@/stores/slices/selectedRoomSlice';
import { useCreateChatRoomMutation } from '@/stores/services/chatRooms.service';
import { toast } from 'sonner-native';
import { useFetchChatRoomsQuery } from '@/stores/services/chatRooms.service';
import { LiveMode } from '@/components/chat/LiveMode';

interface ChatScreenProps extends AppStackScreenProps<'ChatScreen'> {}

/**
 * ChatScreen displays the chat UI and header, and auto-hides the header on scroll.
 * @param {ChatScreenProps} props - The props for the chat screen.
 * @returns {JSX.Element} The rendered chat screen.
 */
export const ChatScreen: FC<ChatScreenProps> = ({ navigation }) => {
  /**
   * Global State
   */
  const { themed, theme } = useAppTheme();
  const { onAudioMessage, messages, handleTextMessage, isFetching, setMessages } =
    useStandardProvider();
  const dispatch = useAppDispatch();
  const [createChatRoom] = useCreateChatRoomMutation();
  const { data: chatRooms = [] } = useFetchChatRoomsQuery();

  // State for live mode
  const [isLiveMode, setIsLiveMode] = useState(false);

  /**
   * Handles entering live mode by creating a new chat room and updating state
   * @returns {Promise<void>}
   */
  const handleEnterLiveMode = async () => {
    try {
      const result = await createChatRoom({ name: 'Live Chat' }).unwrap();
      dispatch(setSelectedRoomId(result.id));
      setIsLiveMode(true);
    } catch {
      toast.error('Failed to enter live mode');
    }
  };

  /**
   * Handles exiting live mode by updating the state and creating a new chat room
   * @returns {Promise<void>}
   */
  const handleExitLiveMode = async () => {
    try {
      // Clear messages before creating new chat
      setMessages([]);
      // First set live mode to false to update UI
      setIsLiveMode(false);

      // Create a new chat room
      const result = await createChatRoom({ name: 'New Chat' }).unwrap();

      // Update the selected room ID to switch to the new chat
      dispatch(setSelectedRoomId(result.id));
    } catch {
      toast.error('Failed to create new chat');
      // If creating new chat fails, try to go back to the previous chat
      if (chatRooms.length > 0) {
        dispatch(setSelectedRoomId(chatRooms[0].id));
      }
    }
  };

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top']}
      contentContainerStyle={[themed($styles.screenContainer), $screenContainerStyle]}
      backgroundColor="transparent"
    >
      <Screenheader
        titleTx={isLiveMode ? 'chatScreen:liveMode.title' : 'chatScreen:voiceMode.title'}
        leftComponent={
          <TouchableOpacity onPress={() => navigation.navigate('MenuScreen')}>
            <Feather name="menu" size={32} color={theme.colors.textDim} />
          </TouchableOpacity>
        }
      />
      {isFetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : isLiveMode ? (
        <LiveMode onExitLiveMode={handleExitLiveMode} />
      ) : (
        <Chat messages={messages} />
      )}
      {isLiveMode ? (
        <></>
      ) : (
        <InputCard
          onSendMessage={handleTextMessage}
          onAudioRecorded={onAudioMessage}
          onEnterLiveMode={handleEnterLiveMode}
        />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

const $screenContainerStyle: ViewStyle = {
  flex: 1,
};
