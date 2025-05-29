import { FC } from 'react';
import { View, ViewStyle, Text, useWindowDimensions, TextStyle } from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';

interface SimpleMessageItemProps {
  text: string;
}

export const SimpleMessageItem: FC<SimpleMessageItemProps> = ({ text }) => {
  const { themed, theme: _theme } = useAppTheme();
  const { height: screenHeight } = useWindowDimensions();

  return (
    <View style={themed($containerStyle)}>
      <View style={[themed($messageContentStyle), { maxHeight: screenHeight * 0.6 - 40 }]}>
        <Text style={themed($textStyle)}>{text}</Text>
      </View>
    </View>
  );
};

// Styles
const $containerStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: theme.colors.border,
  padding: 16,
  marginVertical: 8,
  width: '100%',
  shadowColor: theme.colors.text,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 6,
  elevation: 3,
});

const $messageContentStyle: ThemedStyle<ViewStyle> = _theme => ({});

const $textStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontFamily: 'regular',
  fontSize: 16,
  lineHeight: 24,
});
