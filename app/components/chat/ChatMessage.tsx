import { useAppTheme } from '@/utils/useAppTheme';
import { UIMessage } from '@ai-sdk/ui-utils';
import { FC } from 'react';
import { TextStyle, View, ViewStyle } from 'react-native';
import { Text } from '@/components/general';
import { ThemedStyle } from '@/theme';

// ChatMessage Component
interface ChatMessageProps {
  message: UIMessage;
}

export const ChatMessage: FC<ChatMessageProps> = ({ message }) => {
  const { themed } = useAppTheme();
  const isUser = message.role === 'user';

  // Render different message content based on parts
  const renderMessageContent = () => {
    if (!message.parts || message.parts.length === 0) {
      return <Text style={themed($messageTextStyle)}>{message.content}</Text>;
    }

    return message.parts.map((part, index) => {
      if (part.type === 'text') {
        return (
          <Text key={index} style={themed($messageTextStyle)}>
            {part.text}
          </Text>
        );
      } else if (part.type === 'reasoning') {
        return (
          <View key={index} style={themed($reasoningContainerStyle)}>
            <Text style={themed($reasoningTextStyle)}>{part.reasoning}</Text>
          </View>
        );
      } else if (part.type === 'file') {
        return (
          <Text key={index} style={themed($messageTextStyle)}>
            [File attachment]
          </Text>
        );
      } else if (part.type === 'tool-invocation') {
        return (
          <Text key={index} style={themed($messageTextStyle)}>
            [Tool invocation]
          </Text>
        );
      } else if (part.type === 'source') {
        return (
          <Text key={index} style={themed($messageTextStyle)}>
            [Source reference]
          </Text>
        );
      } else if (part.type === 'step-start') {
        return <View key={index} style={$stepSeparatorStyle} />;
      }
      return null;
    });
  };

  return (
    <View
      style={[
        $messageContainerStyle,
        isUser ? themed($userMessageStyle) : themed($assistantMessageStyle),
      ]}
    >
      {renderMessageContent()}
    </View>
  );
};

const $messageContainerStyle: ViewStyle = {
  padding: 12,
  borderRadius: 16,
  maxWidth: '80%',
};

const $stepSeparatorStyle: ViewStyle = {
  height: 1,
  marginVertical: 8,
};

const $userMessageStyle: ThemedStyle<ViewStyle> = theme => {
  return {
    backgroundColor: theme.colors.primary,
    marginLeft: 'auto',
    borderBottomRightRadius: 4,
  };
};

const $assistantMessageStyle: ThemedStyle<ViewStyle> = theme => {
  return {
    backgroundColor: theme.colors.secondaryBg,
    marginRight: 'auto',
    borderBottomLeftRadius: 4,
  };
};

const $messageTextStyle: ThemedStyle<TextStyle> = theme => {
  return {
    color: theme.colors.text,
    fontFamily: 'regular',
  };
};

const $reasoningContainerStyle: ThemedStyle<ViewStyle> = theme => {
  return {
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: 8,
    marginTop: 4,
  };
};

const $reasoningTextStyle: ThemedStyle<TextStyle> = theme => {
  return {
    color: theme.colors.textDim,
    fontFamily: 'light',
    fontSize: 14,
  };
};
