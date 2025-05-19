/* eslint-disable react-native/no-color-literals */
import React from 'react';
import { AppStackScreenProps } from '@/navigators/AppNavigator';
import { FC } from 'react';
import { Screen } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { $styles } from '@/theme';
import { Screenheader } from '@/components/app/ScreenHeader';
import { ViewStyle, View, TouchableOpacity, TextInput, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { PushToTalkButton } from '@/components/chat/PushToTalkButton';
import { useChatFunctions } from '@/hooks/ChatHandler';
import { Chat } from '@/components/chat/Chat';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import type { AppStackParamList } from '@/navigators/AppNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LiveModeInputBar } from '@/components/chat/LiveModeInputBar';
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
  const { onAudioMessage, messages, handleTextMessage, isFetching, status, setMessages } = useChatFunctions();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const dispatch = useAppDispatch();
  const [createChatRoom] = useCreateChatRoomMutation();
  const { data: chatRooms = [] } = useFetchChatRoomsQuery();


  // Animation value for smooth transition
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // State for live mode
  const [isLiveMode, setIsLiveMode] = React.useState(false);

  // Handle fade animation when loading state changes
  React.useEffect(() => {
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

  // State for the text input
  const [input, setInput] = React.useState('');

  const onSend = () => {
    if (input.trim()) {
      handleTextMessage(input);
      setInput('');
    }
  };

  const handleEnterLiveMode = async () => {
    try {
      const result = await createChatRoom({ name: 'Live Chat' }).unwrap();
      dispatch(setSelectedRoomId(result.id));
      setIsLiveMode(true);
    } catch (error) {
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
      setInput('');
    } catch (error) {
      toast.error('Failed to create new chat');
      // If creating new chat fails, try to go back to the previous chat
      if (chatRooms.length > 0) {
        dispatch(setSelectedRoomId(chatRooms[0].id));
      }
    }
  };

  return (
    <View style={themed($containerStyle)}>
      <Screen
        preset="fixed"
        safeAreaEdges={['top', 'bottom']}
        contentContainerStyle={[themed($styles.screenContainer), $screenContainerStyle]}
        backgroundColor="transparent"
      >
        <Screenheader 
          titleTx={isLiveMode ? "chatScreen:liveMode.title" : "chatScreen:voiceMode.title"} 
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
            <Chat messages={messages} isLiveMode={isLiveMode} status={status} />
          </Animated.View>
        )}
      </Screen>
      {/* Input bar based on mode */}
      {isLiveMode ? (
        <LiveModeInputBar
          onAudioRecorded={onAudioMessage}
          onExitLiveMode={handleExitLiveMode}
        />
      ) : (
        <View style={[styles.inputBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, shadowColor: theme.colors.border }]}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate('MenuScreen')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="menu" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TextInput
            style={[styles.textInput, { color: theme.colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textDim}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={onSend}
            returnKeyType="send"
            multiline={true}
            scrollEnabled={true}
            textAlignVertical="top"
          />
          <View style={styles.rightButtonsRow}>
            <TouchableOpacity style={styles.iconButton} onPress={onSend}>
              <Feather name="send" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <View style={styles.voiceButtonWrapper}>
              <PushToTalkButton size={40} onAudioRecorded={onAudioMessage} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  rightButtonsRow: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    alignItems: 'center',
    alignSelf: 'center',
  },
  voiceButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  liveModeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const $screenContainerStyle: ViewStyle = {
  paddingTop: 10,
  height: '100%',
};

const $containerStyle: ViewStyle = {
  flex: 1,
};
