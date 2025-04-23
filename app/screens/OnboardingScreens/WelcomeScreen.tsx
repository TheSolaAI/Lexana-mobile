import { OnboardingStackScreenProps } from '@/navigators/OnboardingNavigator';
import { FC } from 'react';
import { useAppTheme } from '@/utils/useAppTheme';
import { Screen } from '@/components';
import { $styles } from '@/theme';

interface WelcomeScreenProps extends OnboardingStackScreenProps<'WelcomeScreen'> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = function WelcomeScreen() {
  const { themed, theme } = useAppTheme();

  return (
    <Screen
      preset="auto"
      safeAreaEdges={['top', 'bottom']}
      contentContainerStyle={[
        themed($styles.screenContainer),
        { backgroundColor: theme.colors.background, paddingTop: 20 },
      ]}
    ></Screen>
  );
};
