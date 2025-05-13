/* eslint-disable react-native/no-color-literals */
import React from 'react';
import { AppStackScreenProps } from '@/navigators/AppNavigator';
import { FC } from 'react';
import { Screen } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { $styles } from '@/theme';
import { Screenheader } from '@/components/app/ScreenHeader';
import { ViewStyle, View, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { PushToTalkButton } from '@/components/chat/PushToTalkButton';
import { useChatFunctions } from '@/hooks/ChatHandler';
import { Chat } from '@/components/chat/Chat';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import type { AppStackParamList } from '@/navigators/AppNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { KeyboardInputButton } from '@/components/chat/KeyboardInputButton';

interface ChatScreenProps extends AppStackScreenProps<'ChatScreen'> {}

export const ChatScreen: FC<ChatScreenProps> = () => {
  /**
   * Global State
   */
  const { themed, theme } = useAppTheme();
  const { onAudioMessage, messages, handleSendMessage } = useChatFunctions();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const handleTextMessage = async (text: string) => {
    // Send the message to the AI with empty toolsets array
    // The backend will determine which toolsets are needed
    await handleSendMessage(text, []);
  };

  // State for the text input
  const [input, setInput] = React.useState('');

  const onSend = () => {
    if (input.trim()) {
      handleTextMessage(input);
      setInput('');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen
        preset="fixed"
        safeAreaEdges={['top', 'bottom']}
        contentContainerStyle={[themed($styles.screenContainer), $screenContainerStyle]}
        backgroundColor="transparent"
      >
        <Screenheader titleTx="chatScreen:voiceMode.title" subtitle="nothing" />
        <Chat messages={messages} />
      </Screen>
      {/* Modern input bar at the bottom */}
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
  paddingHorizontal:6,
  alignItems: 'center',
  alignSelf: 'center',
},
voiceButtonWrapper: {
  justifyContent: 'center',
  alignItems: 'center',
  marginLeft: 24, 
},
});

const $screenContainerStyle: ViewStyle = {
  paddingTop: 10,
  height: '100%',
};
