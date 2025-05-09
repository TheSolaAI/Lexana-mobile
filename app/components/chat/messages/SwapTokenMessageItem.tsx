import { FC } from 'react';
import {
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
  ImageStyle,
} from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface SwapTokenDetails {
  fromToken: {
    address: string;
    amount: number;
    decimals?: number;
    logo?: string;
    symbol: string;
  };
  toToken: {
    address: string;
    amount?: number;
    decimals?: number;
    logo?: string;
    symbol: string;
  };
  price?: number;
  priceImpact?: number;
  fromUsd?: number;
  toUsd?: number;
  slippage?: number;
  transaction?: any;
  params?: any;
}

interface SwapTokenMessageItemProps {
  props: {
    transaction: string; // serializedTransaction
    details: SwapTokenDetails;
  };
}

export const SwapTokenMessageItem: FC<SwapTokenMessageItemProps> = ({ props }) => {
  const { themed, theme } = useAppTheme();

  // Guard against undefined props
  if (!props || !props.details) {
    return null;
  }

  const details = props.details;

  // Clipboard function
  const copyToClipboard = async (text: string, message = 'Address copied to clipboard') => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', message);
  };

  // Abbreviate address for display
  const getAbbreviatedAddress = (address: string) => {
    if (!address) return 'Unknown';
    return address.length > 12
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : address;
  };

  // Format currency value
  const formatCurrency = (value?: number) => {
    if (value === undefined) return 'N/A';
    return `$${value.toFixed(2)}`;
  };

  // Ensure token details exist and have required properties
  const fromToken = details.fromToken || { address: '', amount: 0, symbol: 'Unknown' };
  const toToken = details.toToken || { address: '', amount: undefined, symbol: 'Unknown' };

  // Compact content
  const compactContent = (
    <View style={$compactContentContainer}>
      <Text style={themed($swapTextStyle)}>
        {fromToken.amount} {fromToken.symbol} → {toToken.amount || '?'} {toToken.symbol}
      </Text>
    </View>
  );

  // Compact footer
  const compactFooter = (
    <View style={$footerContainer}>
      <View style={$footerActionsContainer}>
        <TouchableOpacity
          onPress={() => Linking.openURL(`https://solscan.io/token/${fromToken.address}`)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={$iconButton}
        >
          <Ionicons name="open-outline" size={16} color={theme.colors.textDim} />
        </TouchableOpacity>
      </View>

      <View style={$priceInfoContainer}>
        {details.price && (
          <Text preset="small" style={themed($priceTextStyle)}>
            Rate: 1 {fromToken.symbol} = {details.price} {toToken.symbol}
          </Text>
        )}
      </View>
    </View>
  );

  // Expanded content
  const expandedContent = (
    <View>
      {/* Header */}
      <View style={themed($expandedHeaderStyle)}>
        <View style={$headerTitleContainer}>
          <View style={themed($iconContainerStyle)}>
            <Ionicons name="swap-horizontal" size={28} color={theme.colors.primary} />
          </View>
          <Text preset="heading" style={themed($headerTitleStyle)}>
            Token Swap
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={$expandedContentContainer}>
        <View style={$contentColumnContainer}>
          {/* Swap Direction */}
          <View style={themed($swapDirectionContainer)}>
            {/* From Token */}
            <View style={themed($tokenContainerStyle)}>
              <View style={$tokenInfoContainer}>
                {fromToken.logo ? (
                  <Image
                    source={{ uri: fromToken.logo }}
                    style={$tokenLogoStyle}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={themed($placeholderLogoStyle)}>
                    <Text preset="bold">{fromToken.symbol.slice(0, 1)}</Text>
                  </View>
                )}
                <View style={$tokenNameContainer}>
                  <Text preset="bold" style={themed($tokenSymbolStyle)}>
                    {fromToken.symbol}
                  </Text>
                  <Text style={themed($tokenAddressStyle)} numberOfLines={1} ellipsizeMode="middle">
                    {getAbbreviatedAddress(fromToken.address)}
                  </Text>
                </View>
              </View>
              <View style={$tokenAmountContainer}>
                <Text preset="bold" style={themed($tokenAmountStyle)}>
                  {fromToken.amount}
                </Text>
                {details.fromUsd !== undefined && (
                  <Text style={themed($tokenUsdValueStyle)}>{formatCurrency(details.fromUsd)}</Text>
                )}
              </View>
            </View>

            {/* Swap Indicator */}
            <View style={themed($swapIndicatorStyle)}>
              <Ionicons name="arrow-down" size={24} color={theme.colors.primary} />
            </View>

            {/* To Token */}
            <View style={themed($tokenContainerStyle)}>
              <View style={$tokenInfoContainer}>
                {toToken.logo ? (
                  <Image
                    source={{ uri: toToken.logo }}
                    style={$tokenLogoStyle}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={themed($placeholderLogoStyle)}>
                    <Text preset="bold">{toToken.symbol.slice(0, 1)}</Text>
                  </View>
                )}
                <View style={$tokenNameContainer}>
                  <Text preset="bold" style={themed($tokenSymbolStyle)}>
                    {toToken.symbol}
                  </Text>
                  <Text style={themed($tokenAddressStyle)} numberOfLines={1} ellipsizeMode="middle">
                    {getAbbreviatedAddress(toToken.address)}
                  </Text>
                </View>
              </View>
              <View style={$tokenAmountContainer}>
                <Text preset="bold" style={themed($tokenAmountStyle)}>
                  {toToken.amount || '?'}
                </Text>
                {details.toUsd !== undefined && (
                  <Text style={themed($tokenUsdValueStyle)}>{formatCurrency(details.toUsd)}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Swap Details */}
          <View style={$swapDetailsContainer}>
            <View style={themed($detailRowStyle)}>
              <Text preset="small" style={themed($detailLabelStyle)}>
                Rate
              </Text>
              <Text style={themed($detailValueStyle)}>
                1 {fromToken.symbol} = {details.price || '?'} {toToken.symbol}
              </Text>
            </View>

            {details.priceImpact !== undefined && (
              <View style={themed($detailRowStyle)}>
                <Text preset="small" style={themed($detailLabelStyle)}>
                  Price Impact
                </Text>
                <Text style={themed($priceImpactStyle)}>
                  {(details.priceImpact * 100).toFixed(2)}%
                </Text>
              </View>
            )}

            {details.slippage !== undefined && (
              <View style={themed($detailRowStyle)}>
                <Text preset="small" style={themed($detailLabelStyle)}>
                  Slippage Tolerance
                </Text>
                <Text style={themed($detailValueStyle)}>
                  {(details.slippage * 100).toFixed(2)}%
                </Text>
              </View>
            )}
          </View>

          {/* Address links */}
          <View style={$actionsContainer}>
            <View style={$actionsRow}>
              <TouchableOpacity
                style={themed($actionButtonStyle)}
                onPress={() => copyToClipboard(fromToken.address, 'Token address copied')}
              >
                <Text style={themed($actionButtonTextStyle)}>Copy {fromToken.symbol} Address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={themed($actionButtonStyle)}
                onPress={() => Linking.openURL(`https://solscan.io/token/${fromToken.address}`)}
              >
                <Text style={themed($actionButtonTextStyle)}>View on Solscan</Text>
                <Ionicons name="open-outline" size={12} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={$actionsRow}>
              <TouchableOpacity
                style={themed($actionButtonStyle)}
                onPress={() => copyToClipboard(toToken.address, 'Token address copied')}
              >
                <Text style={themed($actionButtonTextStyle)}>Copy {toToken.symbol} Address</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={themed($actionButtonStyle)}
                onPress={() => Linking.openURL(`https://solscan.io/token/${toToken.address}`)}
              >
                <Text style={themed($actionButtonTextStyle)}>View on Solscan</Text>
                <Ionicons name="open-outline" size={12} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={themed($expandedFooterStyle)}>
          <Text preset="small" style={themed($footerTextStyle)}>
            This swap transaction is being prepared and will be submitted to the blockchain.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <BaseExpandableMessageItem
      title="Token Swap"
      icon={<Ionicons name="swap-horizontal" size={16} color={theme.colors.primary} />}
      compactContent={compactContent}
      expandedContent={expandedContent}
      footer={compactFooter}
    />
  );
};

// Styles
const $compactContentContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

const $swapTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 14,
  color: theme.colors.text,
  fontWeight: '500',
});

const $footerContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const $footerActionsContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
};

const $iconButton: ViewStyle = {
  padding: 4,
  borderRadius: 12,
};

const $priceInfoContainer: ViewStyle = {
  maxWidth: '70%',
};

const $priceTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 12,
  color: theme.colors.textDim,
});

// Expanded content styles
const $expandedHeaderStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
  backgroundColor: `${theme.colors.primary}10`,
});

const $headerTitleContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

const $iconContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: `${theme.colors.primary}20`,
  padding: 4,
  borderRadius: 8,
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
});

const $headerTitleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 18,
});

const $expandedContentContainer: ViewStyle = {
  padding: 16,
};

const $contentColumnContainer: ViewStyle = {
  gap: 24,
};

const $swapDirectionContainer: ThemedStyle<ViewStyle> = theme => ({
  gap: 8,
  backgroundColor: `${theme.colors.surface}20`,
  padding: 16,
  borderRadius: 12,
});

const $tokenContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  backgroundColor: theme.colors.secondaryBg,
});

const $tokenInfoContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
};

const $tokenLogoStyle: ImageStyle = {
  width: 30,
  height: 30,
  borderRadius: 15,
};

const $placeholderLogoStyle: ThemedStyle<ViewStyle> = theme => ({
  width: 30,
  height: 30,
  borderRadius: 15,
  backgroundColor: `${theme.colors.primary}30`,
  justifyContent: 'center',
  alignItems: 'center',
});

const $tokenNameContainer: ViewStyle = {
  gap: 2,
};

const $tokenSymbolStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 16,
});

const $tokenAddressStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 12,
});

const $tokenAmountContainer: ViewStyle = {
  alignItems: 'flex-end',
};

const $tokenAmountStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 16,
});

const $tokenUsdValueStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 12,
});

const $swapIndicatorStyle: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  height: 24,
};

const $swapDetailsContainer: ViewStyle = {
  gap: 8,
};

const $detailRowStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  backgroundColor: `${theme.colors.surface}20`,
});

const $detailLabelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
});

const $detailValueStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
});

const $priceImpactStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.warning, // Show in warning color
});

const $actionsContainer: ViewStyle = {
  gap: 12,
};

const $actionsRow: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12,
};

const $actionButtonStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
};

const $actionButtonTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.primary,
  fontSize: 13,
});

const $expandedFooterStyle: ThemedStyle<ViewStyle> = theme => ({
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
  marginTop: 16,
  paddingTop: 12,
});

const $footerTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
});
