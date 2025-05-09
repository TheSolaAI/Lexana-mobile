/* eslint-disable react-native/no-color-literals */
import { FC, useEffect, useRef } from 'react';
import { Animated, ViewStyle, ImageStyle, TextStyle } from 'react-native';
import { useFetchChatRoomsQuery } from '../../stores/services/chatRooms.service';
import { useAppTheme } from '@/utils/useAppTheme';
import { Screen, AutoImage, Text } from '@/components/general';
import { translate } from '@/i18n';
import type { Theme } from '@/theme';
import { RootStackScreenProps } from '@/navigators/RootNavigator';
import { usePrivy } from '@privy-io/expo';

interface SplashScreenProps extends RootStackScreenProps<'Splash'> {}

export const SplashScreen: FC<SplashScreenProps> = function SplashScreen() {
  const { user } = usePrivy();

  // Animation setup
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const { themed, theme } = useAppTheme();

  useFetchChatRoomsQuery(undefined, { skip: !user });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <Screen
      preset="fixed"
      safeAreaEdges={['top', 'bottom']}
      contentContainerStyle={themed($containerStyle)}
      backgroundColor={theme.colors.background}
    >
      <Animated.View
        style={{
          alignItems: 'center' as ViewStyle['alignItems'],
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <AutoImage
          source={require('assets/images/app-icon-all.png')}
          style={$logoStyle}
          // resizeMode="contain"
        />
        <Text
          text={translate('common:appName').toUpperCase()}
          preset="pageHeading"
          style={themed($appNameStyle)}
        />
      </Animated.View>
    </Screen>
  );
};

const $containerStyle = (theme: Theme): ViewStyle => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.colors.background,
});

const $logoStyle: ImageStyle = {
  marginBottom: 24,
  width: 100,
  height: 100,
  borderRadius: 20,
};

const $appNameStyle: TextStyle = {
  letterSpacing: 2,
  marginTop: 8,
};
