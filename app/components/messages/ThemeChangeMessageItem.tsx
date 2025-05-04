import { FC, useEffect } from 'react';
import { View, ViewStyle, TouchableOpacity, TextStyle } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { Ionicons } from '@expo/vector-icons';

interface ThemeChangeMessageItemProps {
  props: {
    themeName: string;
    autoSwitched: boolean;
  };
}

export const ThemeChangeMessageItem: FC<ThemeChangeMessageItemProps> = ({ props }) => {
  const { themed, theme } = useAppTheme();

  /**
   * Effects
   */
  useEffect(() => {
    if (props.autoSwitched) {
      console.log('changing theme please');
      // You could add additional theme change logic here if needed
    }
  }, [props.autoSwitched]);

  /**
   * Get appropriate theme icon
   */
  const getThemeIcon = () => {
    if (props.themeName === 'dark') {
      return <Ionicons name="moon" size={20} color={theme.colors.text} />;
    } else {
      return <Ionicons name="sunny" size={20} color={theme.colors.text} />;
    }
  };

  const footer = (
    <View>
      <Text preset="small" style={themed($footerTextStyle)}>
        {props.autoSwitched
          ? 'Theme was automatically changed based on your system preferences.'
          : 'Press the button to change the theme manually.'}
      </Text>
    </View>
  );

  return (
    <BaseBorderedMessageItem
      title="Theme Settings"
      subtitle={`Current theme: ${props.themeName}`}
      footer={footer}
    >
      <View style={$contentContainer}>
        <View style={$themeInfoContainer}>
          {getThemeIcon()}
          <Text preset="bold" style={themed($themeTextStyle)}>
            {props.themeName.charAt(0).toUpperCase() + props.themeName.slice(1)} Mode
          </Text>
        </View>

        {!props.autoSwitched && (
          <TouchableOpacity style={themed($switchButtonStyle)}>
            {props.themeName === 'dark' ? (
              <Ionicons name="sunny" size={16} color={theme.colors.text} />
            ) : (
              <Ionicons name="moon" size={16} color={theme.colors.text} />
            )}
            <Text style={themed($buttonTextStyle)}>
              Switch to {props.themeName === 'dark' ? 'Light' : 'Dark'} Mode
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </BaseBorderedMessageItem>
  );
};

// Styles
const $contentContainer: ViewStyle = {
  padding: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const $themeInfoContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

const $themeTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
});

const $switchButtonStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.surface,
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
});

const $buttonTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
});

const $footerTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
});
