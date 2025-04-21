import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './navigationUtilities';
import { useThemeProvider } from '@/utils/useAppTheme';
import { ComponentProps } from 'react';
import { AppStackNavigator } from './AppNavigator';
import { WelcomeScreen } from '@/screens/WelcomeScreen';

export interface NavigationProps extends Partial<ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = function AppNavigator(props: NavigationProps) {
  const { themeScheme, navigationTheme, setThemeContextOverride, ThemeProvider } =
    useThemeProvider();

  return (
    <ThemeProvider value={{ themeScheme, setThemeContextOverride }}>
      <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
        <WelcomeScreen />
        <AppStackNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
};
