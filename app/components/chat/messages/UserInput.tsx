import { FC, memo } from 'react';
import { View, ViewStyle, TextStyle } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';

interface UserInputProps {
  text: string;
  transcript?: boolean;
}

export const UserInput: FC<UserInputProps> = memo(({ text, transcript = false }) => {
  const { themed } = useAppTheme();

  return (
    <View style={$containerStyle}>
      <View style={themed($messageStyle)}>
        <Text style={themed($textStyle)}>{text}</Text>
      </View>
    </View>
  );
});

// Styles
const $containerStyle: ViewStyle = {
  marginVertical: 8,
  maxWidth: '90%',
  alignSelf: 'flex-end',
};

const $messageStyle: ThemedStyle<ViewStyle> = theme => ({
  padding: 12,
  borderRadius: 16,
  borderBottomRightRadius: 4,
  backgroundColor: theme.colors.primary,
});

const $textStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.background,
  fontFamily: 'regular',
});
