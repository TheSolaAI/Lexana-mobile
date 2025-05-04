import { FC } from 'react';
import { View, ViewStyle } from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import Markdown from 'react-native-markdown-display';

interface SimpleMessageItemProps {
  text: string;
}

export const SimpleMessageItem: FC<SimpleMessageItemProps> = ({ text }) => {
  const { themed } = useAppTheme();

  return (
    <View style={$containerStyle}>
      <View style={themed($messageStyle)}>
        <Markdown style={themed($markdownStyles)}>{text}</Markdown>
      </View>
    </View>
  );
};

// Styles
const $containerStyle: ViewStyle = {
  marginVertical: 16,
  maxWidth: '80%',
  alignSelf: 'flex-start',
};

const $messageStyle: ThemedStyle<ViewStyle> = theme => ({
  padding: 12,
  borderRadius: 16,
  borderBottomLeftRadius: 4,
  backgroundColor: theme.colors.secondaryBg,
});

const $markdownStyles: ThemedStyle<any> = theme => ({
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
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  code_inline: {
    backgroundColor: theme.colors.background,
    fontFamily: 'monospace',
    fontSize: 14,
    padding: 2,
    borderRadius: 2,
  },
});
