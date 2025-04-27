import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './navigationUtilities';
import { useThemeProvider } from '@/utils/useAppTheme';
import { ComponentProps } from 'react';
import { RootNavigator } from './RootNavigator';
import { usePrivy } from '@privy-io/expo';

export interface NavigationProps extends Partial<ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = function AppNavigator(props: NavigationProps) {
  const { themeScheme, navigationTheme, setThemeContextOverride, ThemeProvider } =
    useThemeProvider();

  const { isReady } = usePrivy();

  return (
    <ThemeProvider value={{ themeScheme, setThemeContextOverride }}>
      <NavigationContainer ref={navigationRef} theme={navigationTheme} {...props}>
        {/* Wait for Privy to be ready before rendering the navigator */}
        {isReady && <RootNavigator />}
        {/* Uncomment the line below to show the navigator even if Privy is not ready */}
        {/* <RootNavigator /> */}
      </NavigationContainer>
    </ThemeProvider>
  );
};
