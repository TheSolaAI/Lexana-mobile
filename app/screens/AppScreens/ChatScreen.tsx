/* eslint-disable react-native/no-color-literals */
import { AppStackScreenProps } from '@/navigators/AppNavigator';
import { FC, useEffect, useRef, useState } from 'react';
import { Screen } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { $styles } from '@/theme';
import { Screenheader } from '@/components/app/ScreenHeader';
import {
  ViewStyle,
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useChatFunctions } from '@/hooks/ChatHandler';
import { Chat } from '@/components/chat/Chat';
import { Feather } from '@expo/vector-icons';
import { LiveModeInputBar } from '@/components/chat/LiveModeInputBar';
import { InputCard } from '@/components/chat/InputCard';
import { useAppDispatch } from '@/stores/hooks';
import { setSelectedRoomId } from '@/stores/slices/selectedRoomSlice';
import { useCreateChatRoomMutation } from '@/stores/services/chatRooms.service';
import { toast } from 'sonner-native';
import { useFetchChatRoomsQuery } from '@/stores/services/chatRooms.service';

interface ChatScreenProps extends AppStackScreenProps<'ChatScreen'> {}

export const ChatScreen: FC<ChatScreenProps> = () => {
  /**
   * Global State
   */
  const { themed, theme } = useAppTheme();
  const { onAudioMessage, messages, handleTextMessage, isFetching, setMessages } =
    useChatFunctions();
  const dispatch = useAppDispatch();
  const [createChatRoom] = useCreateChatRoomMutation();
  const { data: chatRooms = [] } = useFetchChatRoomsQuery();

  // Animation value for smooth transition
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // State for live mode
  const [isLiveMode, setIsLiveMode] = useState(false);

  // Handle fade animation when loading state changes
  useEffect(() => {
    if (!isFetching) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [isFetching, fadeAnim]);

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
        rightComponent={
          !isLiveMode && (
            <TouchableOpacity
              style={styles.liveModeButton}
              onPress={handleEnterLiveMode}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="radio" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          )
        }
      />
      {isFetching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <Chat messages={messages} />
        </Animated.View>
      )}
      {isLiveMode ? (
        <LiveModeInputBar onAudioRecorded={onAudioMessage} onExitLiveMode={handleExitLiveMode} />
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
  liveModeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 20,
    padding: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

const $screenContainerStyle: ViewStyle = {
  paddingTop: 10,
  height: '100%',
};
