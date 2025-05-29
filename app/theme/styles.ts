import { ViewStyle } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';
import { timing } from './timing';
import { type ThemedStyle, type Theme } from '@/theme';

// Create a proper defaultTheme that matches the Theme interface
const defaultTheme: Theme = {
  colors,
  spacing,
  timing,
  isDark: false,
};

export const $styles = {
  // Static styles
  row: { flexDirection: 'row' } as ViewStyle,
  flex1: { flex: 1 } as ViewStyle,
  flexWrap: { flexWrap: 'wrap' } as ViewStyle,
  toggleInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  } as ViewStyle,

  // Themed styles
  screenContainer: ((theme: Theme): ViewStyle => ({
    backgroundColor: theme.colors.background,
    width: '100%',
    // paddingHorizontal: 15,
  })) as ThemedStyle<ViewStyle>,

  // Pre-computed themed styles with defaults
  get themedBottomContainer(): ViewStyle {
    return this.screenContainer(defaultTheme);
  },
};
