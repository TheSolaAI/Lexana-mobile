import { TxKeyPath } from '@/i18n';
import { FC } from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from '@/components/general';
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
      <View style={$headerStyle}>
        <Text preset="heading" tx={titleTx} text={title} />
        <Text preset="secondary" tx={subtitleTx} text={subtitle} />
      </View>
    </View>
  );
};

const $containerStyle: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'center',
};

const $headerStyle: ViewStyle = {
  flexDirection: 'column',
  alignItems: 'center',
};
