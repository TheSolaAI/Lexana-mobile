/* eslint-disable react-native/no-color-literals */
import { AppStackScreenProps } from '@/navigators/AppNavigator';
import { FC } from 'react';
import { Screen } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { $styles } from '@/theme';
import { Screenheader } from '@/components/app/ScreenHeader';
import { ViewStyle, View, TouchableOpacity } from 'react-native';
import { PushToTalkButton } from '@/components/chat/PushToTalkButton';
import { useChatFunctions } from '@/hooks/ChatHandler';
import { Chat } from '@/components/chat/Chat';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import type { AppStackParamList } from '@/navigators/AppNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface ChatScreenProps extends AppStackScreenProps<'ChatScreen'> {}

export const ChatScreen: FC<ChatScreenProps> = () => {
  /**
   * Global State
   */
  const { themed } = useAppTheme();
  const { onAudioMessage, messages } = useChatFunctions();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

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
      <PushToTalkButton size={100} onAudioRecorded={onAudioMessage} />
      {/* Floating Menu Button (bottom left) */}
      <View style={$menuButtonContainer}>
        <TouchableOpacity
          style={$menuButton}
          onPress={() => navigation.navigate('SidebarScreen')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="menu" size={28} color={themed({ color: 'white' }).color} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const $screenContainerStyle: ViewStyle = {
  paddingTop: 10,
  height: '100%',
};

const $menuButtonContainer: ViewStyle = {
  position: 'absolute',
  left: 16,
  bottom: 32,
  zIndex: 20,
};

const $menuButton: ViewStyle = {
  backgroundColor: '#222',
  borderRadius: 24,
  padding: 12,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4,
};
