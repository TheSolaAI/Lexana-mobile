import { TxKeyPath } from '@/i18n';
import { FC } from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from '@/components/general';
import Feather from '@expo/vector-icons/Feather';
import { useAppTheme } from '@/utils/useAppTheme';

interface ScreenHeaderProps {
  titleTx?: TxKeyPath;
  subtitleTx?: TxKeyPath;
  title?: string;
  subtitle?: string;
}

export const Screenheader: FC<ScreenHeaderProps> = ({ titleTx, subtitleTx, title, subtitle }) => {
  const { theme } = useAppTheme();

  return (
    <View style={$containerStyle}>
      <Feather name="menu" size={28} color={theme.colors.text} />
      <View style={$headerStyle}>
        <Text preset="heading" tx={titleTx} text={title} />
        <Text preset="secondary" tx={subtitleTx} text={subtitle} />
      </View>
      <Feather name="check-circle" size={28} color={'transparent'} />
    </View>
  );
};

const $containerStyle: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
};

const $headerStyle: ViewStyle = {
  flexDirection: 'column',
  alignItems: 'center',
};
