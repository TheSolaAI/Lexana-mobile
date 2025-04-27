import { AppStackScreenProps } from '@/navigators/AppNavigator';
import { FC } from 'react';
import { View } from 'react-native';
import { Text } from '@/components/general';

interface ChatScreenProps extends AppStackScreenProps<'ChatScreen'> {}

export const ChatScreen: FC<ChatScreenProps> = function ChatScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Chat Screen</Text>
    </View>
  );
};
