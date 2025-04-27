import { FC } from 'react';
import { FlatList, View, ViewStyle } from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { UIMessage } from '@ai-sdk/ui-utils';
import { ChatMessage } from './ChatMessage';

interface ChatProps {
  messages: UIMessage[];
}

export const Chat: FC<ChatProps> = ({ messages }) => {
  const { themed } = useAppTheme();

  const renderItem = ({ item }: { item: UIMessage }) => {
    return (
      <View
        style={[
          $messageWrapperStyle,
          item.role === 'user' ? $userWrapperStyle : $assistantWrapperStyle,
        ]}
      >
        <ChatMessage message={item} />
      </View>
    );
  };

  return (
    <View style={themed($chatContainerStyle)}>
      <FlatList
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={$listContentContainerStyle}
      />
    </View>
  );
};

const $listContentContainerStyle: ViewStyle = {
  padding: 16,
  gap: 16,
};

const $messageWrapperStyle: ViewStyle = {
  flexDirection: 'row',
  marginBottom: 8,
};

const $userWrapperStyle: ViewStyle = {
  justifyContent: 'flex-end',
};

const $assistantWrapperStyle: ViewStyle = {
  justifyContent: 'flex-start',
};

const $chatContainerStyle: ThemedStyle<ViewStyle> = theme => {
  return {
    flex: 1,
    backgroundColor: theme.colors.background,
  };
};
