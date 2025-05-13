import { TxKeyPath } from '@/i18n';
import { FC, ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';

interface ScreenHeaderProps {
  titleTx?: TxKeyPath;
  subtitleTx?: TxKeyPath;
  title?: string;
  subtitle?: string;
  rightComponent?: ReactNode;
}

export const Screenheader: FC<ScreenHeaderProps> = ({ titleTx, subtitleTx, title, subtitle, rightComponent }) => {
  const { theme } = useAppTheme();

  return (
    <View style={$containerStyle}>
      <View style={$headerStyle}>
        <View style={$titleContainer}>
          <Text preset="pageHeading" tx={titleTx} text={title} />
          <Text preset="secondary" tx={subtitleTx} text={subtitle} />
        </View>
        {rightComponent && <View style={$rightComponent}>{rightComponent}</View>}
      </View>
    </View>
  );
};

const $containerStyle: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'center',
  paddingHorizontal: 16,
};

const $headerStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
};

const $titleContainer: ViewStyle = {
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
};

const $rightComponent: ViewStyle = {
  position: 'absolute',
  right: 0,
};
