import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './navigationUtilities';
import { ComponentProps } from 'react';
import { RootNavigator } from './RootNavigator';

export interface NavigationProps extends Partial<ComponentProps<typeof NavigationContainer>> {}

export const AppNavigator = function AppNavigator(props: NavigationProps) {
  return (
    <NavigationContainer ref={navigationRef} {...props}>
      <RootNavigator />
    </NavigationContainer>
  );
};
