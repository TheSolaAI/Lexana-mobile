import { OnboardingStackScreenProps } from '@/navigators/OnboardingNavigator';
import { FC } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

interface WelcomeScreenProps extends OnboardingStackScreenProps<'WelcomeScreen'> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = function WelcomeScreen() {
  return (
    <>
      <LinearGradient></LinearGradient>
    </>
  );
};
