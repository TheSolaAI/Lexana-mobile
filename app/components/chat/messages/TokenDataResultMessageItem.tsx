import { FC, memo } from 'react';
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
import { toast } from 'sonner-native';

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

/**
 * A memoized component that displays the result of a token data query.
 * It includes details like price, market cap, volume, and links to external resources.
 * The component is designed to be responsive and visually clean.
 */
export const TokenDataResultMessageItem: FC<TokenDataResultMessageItemProps> = memo(({ props }) => {
  const { themed, theme } = useAppTheme();

  // Clipboard function
  const copyToClipboard = async (text: string, message = 'Token address copied to clipboard') => {
    await Clipboard.setStringAsync(text);
    toast.success(message);
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
        <Text style={themed($actionTextStyle)}>Solscan</Text>
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
        {/* Price Info Section */}
        <View style={$priceInfoContainer}>
          <Text style={themed($priceValueStyle)}>${Number(props.price).toFixed(7)}</Text>
          <View style={themed($priceChangeContainer)}>
            {isPricePositive ? (
              <Ionicons name="trending-up" size={16} color={priceChangeColor} />
            ) : (
              <Ionicons name="trending-down" size={16} color={priceChangeColor} />
            )}
            <Text style={[{ color: priceChangeColor }, themed($priceChangeTextStyle)]}>
              {isPricePositive ? '+' : ''}
              {Number(props.priceChange24hPercent).toFixed(2)}% (24h)
            </Text>
          </View>
        </View>

        <View style={themed($dividerStyle)} />

        {/* Key Metrics */}
        <View style={$metricsContainer}>
          <View style={$metricRow}>
            <View style={$metricItem}>
              <Text preset="small" style={themed($labelStyle)}>
                Market Cap
              </Text>
              <Text style={themed($valueTextStyle)}>${formatNumber(props.marketCap)}</Text>
            </View>
            <View style={$metricItem}>
              <Text preset="small" style={themed($labelStyle)}>
                FDV
              </Text>
              <Text style={themed($valueTextStyle)}>${formatNumber(props.fdv)}</Text>
            </View>
          </View>
          <View style={$metricRow}>
            <View style={$metricItem}>
              <Text preset="small" style={themed($labelStyle)}>
                Liquidity
              </Text>
              <Text style={themed($valueTextStyle)}>${formatNumber(props.liquidity)}</Text>
            </View>
            <View style={$metricItem}>
              <Text preset="small" style={themed($labelStyle)}>
                Holders
              </Text>
              <Text style={themed($valueTextStyle)}>{formatNumber(props.holder)}</Text>
            </View>
          </View>
        </View>

        <View style={themed($dividerStyle)} />

        {/* Volume Data */}
        <View>
          <Text preset="pageHeading" style={themed($sectionTitleStyle)}>
            24h Volume
          </Text>
          <View style={$volumeMetricsContainer}>
            <View style={$metricItem}>
              <Text preset="small" style={themed($labelStyle)}>
                Total
              </Text>
              <Text style={themed($valueTextStyle)}>
                ${formatNumber(props.vBuy24hUSD + props.vSell24hUSD)}
              </Text>
            </View>
            <View style={$metricItem}>
              <Text preset="small" style={themed($labelStyle)}>
                Buys
              </Text>
              <Text style={[themed($valueTextStyle), { color: theme.colors.success }]}>
                ${formatNumber(props.vBuy24hUSD)}
              </Text>
            </View>
            <View style={$metricItem}>
              <Text preset="small" style={themed($labelStyle)}>
                Sells
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
            <View style={themed($ratioBarContainerStyle)}>
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

        <View style={themed($dividerStyle)} />

        {/* Token Info */}
        <View>
          <Text preset="small" style={themed($labelStyle)}>
            Token Address
          </Text>
          <TouchableOpacity
            onPress={() => copyToClipboard(props.address)}
            style={$addressContainer}
          >
            <Text style={themed($addressTextStyle)} numberOfLines={1} ellipsizeMode="middle">
              {props.address}
            </Text>
            <Ionicons name="copy-outline" size={18} color={theme.colors.textDim} />
          </TouchableOpacity>
        </View>
        {props.decimals !== undefined && (
          <View>
            <Text preset="small" style={themed($labelStyle)}>
              Decimals
            </Text>
            <Text style={themed($valueTextStyle)}>{props.decimals}</Text>
          </View>
        )}

        {/* Links and Socials Section */}
        {(props.extensions?.website ||
          props.extensions?.twitter ||
          props.extensions?.discord) && <View style={themed($dividerStyle)} />}
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
});

// Styles
const $contentContainer: ViewStyle = {
  gap: 16,
  overflow: 'hidden',
};

const $priceInfoContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 8,
  maxWidth: '100%',
  overflow: 'hidden',
};

const $priceValueStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 28,
  fontWeight: 'bold',
  flexShrink: 1,
});

const $priceChangeTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 14,
  fontWeight: '500',
  flexShrink: 1,
});

const $priceChangeContainer: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 12,
  backgroundColor: `${theme.colors.surface}50`,
  flexShrink: 1,
  overflow: 'hidden',
});

const $dividerStyle: ThemedStyle<ViewStyle> = theme => ({
  height: 1,
  backgroundColor: theme.colors.surface,
  opacity: 0.5,
});

const $metricsContainer: ViewStyle = {
  gap: 12,
  overflow: 'hidden',
};

const $metricRow: ViewStyle = {
  flexDirection: 'row',
  gap: 12,
  overflow: 'hidden',
};

const $metricItem: ViewStyle = {
  flex: 1,
  gap: 2,
  minWidth: 0,
  overflow: 'hidden',
};

const $labelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  marginBottom: 4,
});

const $valueTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 16,
  fontWeight: '500',
  flexShrink: 1,
});

const $sectionTitleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  marginBottom: 8,
  fontSize: 16,
  fontWeight: '600',
});

const $volumeMetricsContainer: ViewStyle = {
  flexDirection: 'row',
  gap: 12,
  marginBottom: 12,
  overflow: 'hidden',
};

const $ratioContainerStyle: ViewStyle = {
  marginTop: 4,
};

const $ratioLabelContainer: ViewStyle = {
  marginBottom: 4,
};

const $ratioLabelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 12,
});

const $ratioBarContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  height: 8,
  borderRadius: 4,
  overflow: 'hidden',
  backgroundColor: `${theme.colors.surface}30`,
});

const $buyRatioStyle: ViewStyle = {
  backgroundColor: '#22c55e', // green-500
  height: '100%',
};

const $sellRatioStyle: ViewStyle = {
  backgroundColor: '#ef4444', // red-500
  height: '100%',
};

const $addressContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 8,
  maxWidth: '100%',
  overflow: 'hidden',
};

const $addressTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontFamily: 'monospace',
  fontSize: 14,
  flex: 1,
  minWidth: 0,
});

const $footerContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-around',
  paddingTop: 8,
  overflow: 'hidden',
};

const $actionButton: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 16,
};

const $actionTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.primary,
  fontSize: 13,
  fontWeight: '600',
});

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
  overflow: 'hidden',
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
