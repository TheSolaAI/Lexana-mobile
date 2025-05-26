import { TxKeyPath } from '@/i18n';
import { FC, ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';

interface ScreenHeaderProps {
  /**
   * i18n key for the title
   */
  titleTx?: TxKeyPath;
  /**
   * i18n key for the subtitle
   */
  subtitleTx?: TxKeyPath;
  /**
   * Fallback string for the title
   */
  title?: string;
  /**
   * Fallback string for the subtitle
   */
  subtitle?: string;
  /**
   * Optional right component (e.g. button)
   */
  rightComponent?: ReactNode;
  /**
   * Optional left component (e.g. back button)
   */
  leftComponent?: ReactNode;
}

/**
 * Screenheader displays a themed header for screens.
 * @param {ScreenHeaderProps} props - The props for the header.
 * @returns {JSX.Element} The rendered header.
 */
export const Screenheader: FC<ScreenHeaderProps> = ({
  titleTx,
  title,
  rightComponent,
  leftComponent,
}) => {
  const { themed } = useAppTheme();

  return (
    <View style={themed($containerStyle)}>
      <View style={$headerStyle}>
        {leftComponent && <View style={$leftComponent}>{leftComponent}</View>}
        <View style={$titleContainer}>
          <Text preset="bold" tx={titleTx} text={title} />
        </View>
        {rightComponent && <View style={$rightComponent}>{rightComponent}</View>}
      </View>
    </View>
  );
};

const $containerStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  justifyContent: 'center',
  padding: 16,
  backgroundColor: theme.colors.secondaryBg,
  borderBottomColor: theme.colors.border,
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
});

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

const $leftComponent: ViewStyle = {
  position: 'absolute',
  left: 0,
};
