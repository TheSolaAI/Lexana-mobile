import { FC } from 'react';
import {
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
  ImageStyle,
} from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { formatNumber } from '@/utils/formatNumber';

export interface TokenDataResponse {
  address: string;
  decimals: number;
  symbol: string;
  name: string;
  marketCap: number;
  fdv: number;
  extensions: TokenExtensions;
  logoURI: string;
  liquidity: number;
  price: number;
  priceChange30mPercent: number;
  priceChange1hPercent: number;
  priceChange4hPercent: number;
  priceChange24hPercent: number;
  uniqueWallet30m: number;
  uniqueWallet1h: number;
  uniqueWallet4h: number;
  uniqueWallet24h: number;
  holder: number;
  sell30m: number;
  buy30m: number;
  vBuy30mUSD: number;
  vSell30mUSD: number;
  sell1h: number;
  buy1h: number;
  vBuy1hUSD: number;
  vSell1hUSD: number;
  sell4h: number;
  buy4h: number;
  vBuy4hUSD: number;
  vSell4hUSD: number;
  sell24h: number;
  buy24h: number;
  vBuy24hUSD: number;
  vSell24hUSD: number;
}

export interface TokenExtensions {
  coingeckoId: string;
  website: string;
  telegram: string | null;
  twitter: string;
  description: string;
  discord: string;
}

interface TokenDataResultMessageItemProps {
  props: TokenDataResponse;
}

export const TokenDataResultMessageItem: FC<TokenDataResultMessageItemProps> = ({ props }) => {
  const { themed, theme } = useAppTheme();

  // Clipboard function
  const copyToClipboard = async (text: string, message = 'Token address copied to clipboard') => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', message);
  };

  // Open Solscan link
  const openSolscan = () => {
    Linking.openURL(`https://solscan.io/token/${props.address}`);
  };

  // Open DexScreener link
  const openDexScreener = () => {
    Linking.openURL(`https://dexscreener.com/solana/${props.address}`);
  };

  // Calculate and format price change with color indicator
  const isPricePositive = (props.priceChange24hPercent || 0) > 0;
  const priceChangeColor = isPricePositive ? theme.colors.success : theme.colors.error;

  const footer = (
    <View style={$footerContainer}>
      <TouchableOpacity style={$actionButton} onPress={openDexScreener}>
        <Text style={themed($actionTextStyle)}>DexScreener</Text>
        <Ionicons name="stats-chart" size={14} color={theme.colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={$actionButton} onPress={() => copyToClipboard(props.address)}>
        <Text style={themed($actionTextStyle)}>Copy Address</Text>
        <Ionicons name="copy-outline" size={14} color={theme.colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={$actionButton} onPress={openSolscan}>
        <Text style={themed($actionTextStyle)}>View on Solscan</Text>
        <Ionicons name="open-outline" size={14} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  // Token logo image or placeholder
  const tokenLogo = props.logoURI ? (
    <Image source={{ uri: props.logoURI }} style={$logoStyle} resizeMode="cover" />
  ) : (
    <View style={themed($placeholderLogoStyle)}>
      <Text preset="bold">{props.symbol?.slice(0, 1) || 'T'}</Text>
    </View>
  );

  return (
    <BaseBorderedMessageItem
      title={`${props.name || 'Unknown Token'} ${props.symbol ? `(${props.symbol})` : ''}`}
      subtitle="Token Data"
      icon={tokenLogo}
      footer={footer}
      onPress={openSolscan}
    >
      <View style={$contentContainer}>
        {/* Token Address */}
        <View style={themed($addressBlockStyle)}>
          <Text preset="small" style={themed($labelStyle)}>
            Token Address
          </Text>
          <View style={$addressContentContainer}>
            <Text style={themed($addressTextStyle)} numberOfLines={1} ellipsizeMode="middle">
              {props.address}
            </Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(props.address)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={themed($copyButtonStyle)}
            >
              <Ionicons name="copy-outline" size={18} color={theme.colors.textDim} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Info Section */}
        <View style={$infoRowContainer}>
          <View style={themed($infoBlockStyle)}>
            <Text preset="small" style={themed($labelStyle)}>
              Current Price
            </Text>
            <Text style={themed($priceTextStyle)}>${Number(props.price).toFixed(7)}</Text>
          </View>

          <View style={themed($infoBlockStyle)}>
            <Text preset="small" style={themed($labelStyle)}>
              24h Change
            </Text>
            <View style={$priceChangeContainer}>
              {isPricePositive ? (
                <Ionicons name="trending-up" size={18} color={priceChangeColor} />
              ) : (
                <Ionicons name="trending-down" size={18} color={priceChangeColor} />
              )}
              <Text style={[themed($valueTextStyle), { color: priceChangeColor }]}>
                {isPricePositive ? '+' : ''}
                {Number(props.priceChange24hPercent).toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Market Data Section */}
        <View style={$infoRowContainer}>
          <View style={themed($infoBlockStyle)}>
            <Text preset="small" style={themed($labelStyle)}>
              Market Cap
            </Text>
            <Text style={themed($valueTextStyle)}>
              ${formatNumber(props.marketCap) || 'Unknown'}
            </Text>
          </View>

          <View style={themed($infoBlockStyle)}>
            <Text preset="small" style={themed($labelStyle)}>
              Holders
            </Text>
            <Text style={themed($valueTextStyle)}>{formatNumber(props.holder) || 'Unknown'}</Text>
          </View>
        </View>

        {/* Volume Data */}
        <Text preset="heading" style={themed($sectionTitleStyle)}>
          24h Volume
        </Text>
        <View style={themed($volumeContainerStyle)}>
          <View style={$volumeRowStyle}>
            <View style={$volumeItemStyle}>
              <Text preset="small" style={themed($volumeLabelStyle)}>
                Total Volume
              </Text>
              <Text style={themed($valueTextStyle)}>
                ${formatNumber(props.vBuy24hUSD + props.vSell24hUSD)}
              </Text>
            </View>

            <View style={$volumeItemStyle}>
              <Text preset="small" style={themed($volumeLabelStyle)}>
                Buy Volume
              </Text>
              <Text style={[themed($valueTextStyle), { color: theme.colors.success }]}>
                ${formatNumber(props.vBuy24hUSD)}
              </Text>
            </View>

            <View style={$volumeItemStyle}>
              <Text preset="small" style={themed($volumeLabelStyle)}>
                Sell Volume
              </Text>
              <Text style={[themed($valueTextStyle), { color: theme.colors.error }]}>
                ${formatNumber(props.vSell24hUSD)}
              </Text>
            </View>
          </View>

          {/* Buy/Sell Ratio Bar */}
          <View style={$ratioContainerStyle}>
            <View style={$ratioLabelContainer}>
              <Text preset="small" style={themed($ratioLabelStyle)}>
                Buy/Sell Ratio:
              </Text>
            </View>
            <View style={$ratioBarContainerStyle}>
              <View
                style={[
                  $buyRatioStyle,
                  {
                    width: `${(props.vBuy24hUSD / (props.vBuy24hUSD + props.vSell24hUSD)) * 100}%`,
                  },
                ]}
              />
              <View
                style={[
                  $sellRatioStyle,
                  {
                    width: `${(props.vSell24hUSD / (props.vBuy24hUSD + props.vSell24hUSD)) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Token Details */}
        {props.decimals !== undefined && (
          <View style={$infoRowContainer}>
            <View style={themed($infoBlockStyle)}>
              <Text preset="small" style={themed($labelStyle)}>
                Decimals
              </Text>
              <Text style={themed($valueTextStyle)}>{props.decimals}</Text>
            </View>

            <View style={themed($infoBlockStyle)}>
              <Text preset="small" style={themed($labelStyle)}>
                Liquidity
              </Text>
              <Text style={themed($valueTextStyle)}>
                ${formatNumber(props.liquidity) || 'Unknown'}
              </Text>
            </View>
          </View>
        )}

        {/* Links and Socials Section */}
        {(props.extensions?.website || props.extensions?.twitter) && (
          <View style={$socialsContainer}>
            {props.extensions.website && (
              <TouchableOpacity
                style={themed($socialButtonStyle)}
                onPress={() => Linking.openURL(props.extensions.website)}
              >
                <Ionicons name="globe-outline" size={16} color={theme.colors.primary} />
                <Text style={themed($socialTextStyle)}>Website</Text>
              </TouchableOpacity>
            )}
            {props.extensions.twitter && (
              <TouchableOpacity
                style={themed($socialButtonStyle)}
                onPress={() => Linking.openURL(`https://twitter.com/${props.extensions.twitter}`)}
              >
                <Ionicons name="logo-twitter" size={16} color={theme.colors.primary} />
                <Text style={themed($socialTextStyle)}>Twitter</Text>
              </TouchableOpacity>
            )}
            {props.extensions.discord && (
              <TouchableOpacity
                style={themed($socialButtonStyle)}
                onPress={() => Linking.openURL(props.extensions.discord)}
              >
                <Ionicons name="logo-discord" size={16} color={theme.colors.primary} />
                <Text style={themed($socialTextStyle)}>Discord</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </BaseBorderedMessageItem>
  );
};

// Styles
const $contentContainer: ViewStyle = {
  gap: 16,
};

const $infoRowContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,
};

const $addressBlockStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: `${theme.colors.surface}30`,
  padding: 12,
  borderRadius: 12,
});

const $addressContentContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 4,
};

const $addressTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontFamily: 'monospace',
  fontSize: 12,
  flex: 1,
  marginRight: 8,
});

const $copyButtonStyle: ThemedStyle<ViewStyle> = theme => ({
  padding: 4,
  borderRadius: 12,
  backgroundColor: `${theme.colors.surface}50`,
});

const $infoBlockStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: `${theme.colors.surface}30`,
  padding: 12,
  borderRadius: 12,
  flex: 1,
});

const $volumeContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: `${theme.colors.surface}30`,
  padding: 12,
  borderRadius: 12,
  gap: 12,
});

const $volumeRowStyle: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 12,
};

const $volumeItemStyle: ViewStyle = {
  flex: 1,
  minWidth: 80,
};

const $priceChangeContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
};

const $labelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  marginBottom: 4,
});

const $volumeLabelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  marginBottom: 4,
  fontSize: 12,
});

const $valueTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 16,
});

const $priceTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 20,
  fontWeight: 'bold',
});

const $sectionTitleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  marginBottom: 4,
});

const $footerContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
};

const $actionButton: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
};

const $actionTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.primary,
  fontSize: 13,
});

const $ratioContainerStyle: ViewStyle = {
  marginTop: 8,
};

const $ratioLabelContainer: ViewStyle = {
  marginBottom: 4,
};

const $ratioLabelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 12,
});

const $ratioBarContainerStyle: ViewStyle = {
  flexDirection: 'row',
  height: 8,
  borderRadius: 4,
  overflow: 'hidden',
};

const $buyRatioStyle: ViewStyle = {
  backgroundColor: '#22c55e', // green
  height: '100%',
};

const $sellRatioStyle: ViewStyle = {
  backgroundColor: '#ef4444', // red
  height: '100%',
};

const $logoStyle: ImageStyle = {
  width: 32,
  height: 32,
  borderRadius: 16,
};

const $placeholderLogoStyle: ThemedStyle<ViewStyle> = theme => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: `${theme.colors.primary}30`,
  justifyContent: 'center',
  alignItems: 'center',
});

const $socialsContainer: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
};

const $socialButtonStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  backgroundColor: `${theme.colors.surface}40`,
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 16,
});

const $socialTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.primary,
  fontSize: 12,
});
