import { FC } from 'react';
import { View, ViewStyle, Linking, TextStyle } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

interface BubbleMapMessageItemProps {
  props: { token: string };
}

export const BubbleMapMessageItem: FC<BubbleMapMessageItemProps> = ({ props }) => {
  const { themed, theme } = useAppTheme();

  if (!props || !props.token) {
    return null;
  }

  const tokenAddress = props.token;
  const shortenedAddress = `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`;

  const openSolscan = () => {
    Linking.openURL(`https://solscan.io/token/${tokenAddress}`);
  };

  const footer = (
    <View>
      <Text preset="small" style={themed($footerTextStyle)}>
        This Bubblemap shows the token ownership structure. Larger bubbles represent wallets with
        higher token concentrations. Connected bubbles indicate transaction relationships.
      </Text>
    </View>
  );

  return (
    <BaseBorderedMessageItem
      title="Token Ownership Map"
      subtitle={shortenedAddress}
      footer={footer}
      onPress={openSolscan}
    >
      <View style={$webviewContainer}>
        <WebView
          source={{ uri: `https://app.bubblemaps.io/sol/token/${props.token}` }}
          style={$webviewStyle}
          startInLoadingState
          renderLoading={() => (
            <View style={themed($loadingContainer)}>
              <Text>Loading Bubble Map...</Text>
            </View>
          )}
        />
        <View style={$linkOverlayContainer}>
          <Text style={themed($linkTextStyle)} onPress={openSolscan}>
            <Ionicons name="open-outline" size={14} color={theme.colors.primary} /> View on Solscan
          </Text>
        </View>
      </View>
    </BaseBorderedMessageItem>
  );
};

// Styles
const $webviewContainer: ViewStyle = {
  height: 400,
  width: '100%',
  position: 'relative',
  borderRadius: 8,
  overflow: 'hidden',
};

const $webviewStyle: ViewStyle = {
  flex: 1,
};

const $loadingContainer: ThemedStyle<ViewStyle> = theme => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.colors.background,
});

const $linkOverlayContainer: ViewStyle = {
  position: 'absolute',
  bottom: 10,
  right: 10,
  zIndex: 999,
};

const $linkTextStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: `${theme.colors.background}CC`,
  padding: 8,
  borderRadius: 8,
  color: theme.colors.primary,
  fontSize: 12,
});

const $footerTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
});
