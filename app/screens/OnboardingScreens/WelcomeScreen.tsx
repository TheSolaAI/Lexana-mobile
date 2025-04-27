import { OnboardingStackScreenProps } from '@/navigators/OnboardingNavigator';
import { FC } from 'react';
import { useAppTheme } from '@/utils/useAppTheme';
import { AutoImage, Button, Screen, Text } from '@/components/general';
import { $styles, ThemedStyle } from '@/theme';
import { TextStyle, View, ViewStyle, ImageStyle } from 'react-native';
import { translate } from '@/i18n';
import { WebView } from 'react-native-webview';
import { useLogin } from '@privy-io/expo/ui';

interface WelcomeScreenProps extends OnboardingStackScreenProps<'WelcomeScreen'> {}

export const WelcomeScreen: FC<WelcomeScreenProps> = function WelcomeScreen() {
  const { themed } = useAppTheme();
  const { login } = useLogin();

  return (
    <View style={{ flex: 1 }}>
      {/* Content layers */}
      <Screen
        preset="auto"
        safeAreaEdges={['top', 'bottom']}
        contentContainerStyle={[themed($styles.screenContainer), themed($contentContainerStyle)]}
        backgroundColor="transparent"
      >
        <View style={themed($headerStyle)} pointerEvents="box-none">
          <View style={themed($topContainerStyle)} pointerEvents="auto">
            <AutoImage
              source={require('assets/images/transparent-logo.png')}
              style={themed($logoStyle)}
            />
            <Text text={translate('common:appName').toUpperCase()} preset="pageHeading" />
          </View>
          <Text tx="welcomeScreen:catchLine" preset="pageSubHeading" />
        </View>

        {/* Spacer to push footer to bottom */}
        <View style={themed($webViewContainerStyle)}>
          <WebView
            source={{
              uri: 'https://my.spline.design/celestialflowabstractdigitalform-FbeaQLNxjE31BWUmKIBovl4A/',
            }}
            cacheEnabled={false}
            cacheMode="LOAD_NO_CACHE"
            style={themed($webViewStyle)}
            scrollEnabled={false}
            bounces={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        </View>
      </Screen>
      {/* Footer */}
      <View style={themed($footerStyle)} pointerEvents="auto">
        <Button
          tx="welcomeScreen:button"
          preset="primary"
          onPress={() => {
            login({
              loginMethods: ['email', 'discord', 'twitter'],
              appearance: {
                logo: 'https://beta.solaai.xyz/#https://beta.solaai.xyz/icon.png',
              },
            })
              .then(session => {
                console.log('User logged in', session.user);
              })
              .catch(err => {
                console.log('Error logging in', err);
              });
          }}
        />
        <Text>
          <Text
            text={translate('welcomeScreen:terms') + '\n'}
            preset="default"
            style={themed($centerTncStyle)}
          />
          <Text
            text={translate('welcomeScreen:termsLink') + ' '}
            preset="default"
            style={themed($centerTncLinkStyle)}
          />
          <Text
            text={translate('welcomeScreen:privacy') + ' '}
            preset="default"
            style={themed($centerTncStyle)}
          />
          <Text
            text={translate('welcomeScreen:privacyLink') + ' '}
            preset="default"
            style={themed($centerTncLinkStyle)}
          />
        </Text>
      </View>
    </View>
  );
};

const $contentContainerStyle: ViewStyle = {
  backgroundColor: 'transparent',
  flex: 1,
};

const $webViewContainerStyle: ViewStyle = {
  flex: 1,
  marginBottom: -80,
};

const $headerStyle: ViewStyle = {
  backgroundColor: 'transparent',
  paddingTop: 20,
  paddingBottom: 20,
  alignItems: 'flex-start',
  gap: 5,
  zIndex: 1,
};

const $topContainerStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
};

const $logoStyle: ThemedStyle<ImageStyle> = theme => {
  return {
    width: 60,
    height: 60,
    tintColor: theme.colors.text,
    marginLeft: -10,
  };
};

const $webViewStyle: ViewStyle = {
  flex: 1,
  backgroundColor: 'transparent',
};

const $footerStyle: ThemedStyle<ViewStyle> = theme => {
  return {
    backgroundColor: theme.colors.secondaryBg,
    paddingHorizontal: 15,
    borderRadius: 20,
    paddingTop: 40,
    paddingBottom: 20,
    zIndex: 1,
    gap: 10,
  };
};

const $centerTncStyle: ThemedStyle<TextStyle> = theme => {
  return {
    textAlign: 'center',
    color: theme.colors.text,
    fontFamily: 'light',
  };
};

const $centerTncLinkStyle: ThemedStyle<TextStyle> = theme => {
  return {
    textAlign: 'center',
    color: theme.colors.primary,
    fontFamily: 'regular',
  };
};
