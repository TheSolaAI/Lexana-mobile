import { AppStackScreenProps } from '@/navigators/AppNavigator';
import { FC } from 'react';
import { Screen } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { $styles } from '@/theme';
import { Screenheader } from '@/components/app/ScreenHeader';
import { ViewStyle } from 'react-native';

import { useChat } from '@ai-sdk/react';
import { Chat } from '@/components/chat/Chat';
import { testMessages } from '@/components/chat/test';
import { PushToTalkButton } from '@/components/chat/PushToTalkButton';

interface ChatScreenProps extends AppStackScreenProps<'ChatScreen'> {}

export const ChatScreen: FC<ChatScreenProps> = () => {
  const { themed } = useAppTheme();

  const { messages } = useChat();

  return (
    <>
      <Screen
        preset="fixed"
        safeAreaEdges={['top', 'bottom']}
        contentContainerStyle={[themed($styles.screenContainer), $screenContainerStyle]}
        backgroundColor="transparent"
      >
        <Screenheader titleTx="chatScreen:voiceMode.title" subtitle="nothing" />
        <Chat messages={testMessages} />
      </Screen>
      <PushToTalkButton size={100} />
    </>
  );
};

const $screenContainerStyle: ViewStyle = {
  paddingTop: 10,
  height: '100%',
};
