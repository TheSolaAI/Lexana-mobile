import { useAppTheme } from '@/utils/useAppTheme';
import { UIMessage } from '@ai-sdk/ui-utils';
import { FC } from 'react';
import { TextStyle, View, ViewStyle } from 'react-native';
import { Text } from '@/components/general';
import { ThemedStyle } from '@/theme';
import Markdown from 'react-native-markdown-display';

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
      return <Markdown style={themed($markdownStyles)}>{message.content}</Markdown>;
    }

    return message.parts.map((part, index) => {
      if (part.type === 'text') {
        return (
          <Markdown key={index} style={themed($markdownStyles)}>
            {part.text}
          </Markdown>
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

// Styles
const $messageContainerStyle: ViewStyle = {
  padding: 12,
  borderRadius: 16,
  maxWidth: '100%',
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

const $markdownStyles: ThemedStyle<Record<string, TextStyle | ViewStyle>> = theme => {
  return {
    body: {
      color: theme.colors.text,
      fontFamily: 'regular',
    },
    heading1: {
      color: theme.colors.text,
      fontFamily: 'bold',
      fontSize: 24,
      marginBottom: 8,
    },
    heading2: {
      color: theme.colors.text,
      fontFamily: 'bold',
      fontSize: 20,
      marginBottom: 6,
    },
    heading3: {
      color: theme.colors.text,
      fontFamily: 'semiBold',
      fontSize: 18,
      marginBottom: 4,
    },
    paragraph: {
      color: theme.colors.text,
      fontFamily: 'regular',
      marginBottom: 2,
    },
    link: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    strong: {
      fontFamily: 'bold',
    },
    em: {
      fontFamily: 'italic',
    },
    code_block: {
      backgroundColor: theme.colors.surface,
      padding: 8,
      borderRadius: 4,
      fontFamily: 'monospace',
      fontSize: 14,
    },
    code_inline: {
      backgroundColor: theme.colors.surface,
      fontFamily: 'monospace',
      fontSize: 14,
      padding: 2,
      borderRadius: 2,
    },
    bullet_list: {
      marginLeft: 8,
    },
    ordered_list: {
      marginLeft: 8,
    },
  };
};
