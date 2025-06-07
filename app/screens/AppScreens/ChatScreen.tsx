/* eslint-disable react-native/no-color-literals */
import { AppStackScreenProps } from '@/navigators/AppNavigator';
import React, { FC, useState, useCallback, memo } from 'react';
import { Screen } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { $styles } from '@/theme';
import { Screenheader } from '@/components/app/ScreenHeader';
import { ViewStyle, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useStandardProvider } from '@/hooks/useStandardProvider';
import { Chat } from '@/components/chat/Chat';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { InputCard } from '@/components/chat/InputCard';
import { useAppDispatch } from '@/stores/hooks';
import { setSelectedRoomId } from '@/stores/slices/selectedRoomSlice';
import { useCreateChatRoomMutation } from '@/stores/services/chatRooms.service';
import { toast } from 'sonner-native';
import { useFetchChatRoomsQuery } from '@/stores/services/chatRooms.service';
import { LiveMode } from '@/components/chat/LiveMode';
import { Text } from '@/components/general';

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
  const { onAudioMessage, messages, handleTextMessage, isFetching, setMessages, isProcessing, processingStage } =
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
  const handleEnterLiveMode = useCallback(async () => {
    try {
      const result = await createChatRoom({ name: 'Live Chat' }).unwrap();
      dispatch(setSelectedRoomId(result.id));
      setIsLiveMode(true);
    } catch {
      toast.error('Failed to enter live mode');
    }
  }, [createChatRoom, dispatch]);

  /**
   * Handles exiting live mode by updating the state and creating a new chat room
   * @returns {Promise<void>}
   */
  const handleExitLiveMode = useCallback(async () => {
    setIsLiveMode(false);
  }, []);

  /**
   * Handles creating a new chat room and selecting it
   */
  const handleCreateNewChat = useCallback(async () => {
    try {
      const result = await createChatRoom({ name: 'New Chat' }).unwrap();
      dispatch(setSelectedRoomId(result.id));
      toast.success('Created new chat');
    } catch {
      toast.error('Error creating chat room');
    }
  }, [createChatRoom, dispatch]);

  const hasNoChats = chatRooms.length === 0;

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
      ) : hasNoChats ? (
        <EmptyState onCreateChat={handleCreateNewChat} />
      ) : (
        <>
          <Chat messages={messages} isProcessing={isProcessing} processingStage={processingStage} />
          <InputCard
            onSendMessage={handleTextMessage}
            onAudioRecorded={onAudioMessage}
            onEnterLiveMode={handleEnterLiveMode}
            isProcessing={isProcessing}
          />
        </>
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 20,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  createButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

const $screenContainerStyle: ViewStyle = {
  flex: 1,
};

/**
 * EmptyState component shown when there are no chats
 */
const EmptyState: FC<{ onCreateChat: () => void }> = memo(({ onCreateChat }) => {
  const { theme } = useAppTheme();
  return (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="mic" size={64} color={theme.colors.textDim} />
      <Text preset="onboardingSubHeading" style={styles.emptyTitle}>
        Welcome to Lexana
      </Text>
      <Text preset="default" style={styles.emptyDescription}>
        Explore the power of solana voice engine
      </Text>
      <TouchableOpacity style={[styles.createButton, { backgroundColor: theme.colors.primary }]} onPress={onCreateChat}>
        <Text style={styles.createButtonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
});
