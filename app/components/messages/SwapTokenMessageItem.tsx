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

  // Compact content
  const compactContent = (
    <View style={$compactContentContainer}>
      <Text style={themed($swapTextStyle)}>
        {props.details.fromToken.amount} {props.details.fromToken.symbol} →{' '}
        {props.details.toToken.amount || '?'} {props.details.toToken.symbol}
      </Text>
    </View>
  );

  // Compact footer
  const compactFooter = (
    <View style={$footerContainer}>
      <View style={$footerActionsContainer}>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(`https://solscan.io/token/${props.details.fromToken.address}`)
          }
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={$iconButton}
        >
          <Ionicons name="open-outline" size={16} color={theme.colors.textDim} />
        </TouchableOpacity>
      </View>

      <View style={$priceInfoContainer}>
        {props.details.price && (
          <Text preset="small" style={themed($priceTextStyle)}>
            Rate: 1 {props.details.fromToken.symbol} = {props.details.price}{' '}
            {props.details.toToken.symbol}
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
                {props.details.fromToken.logo ? (
                  <Image
                    source={{ uri: props.details.fromToken.logo }}
                    style={$tokenLogoStyle}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={themed($placeholderLogoStyle)}>
                    <Text preset="bold">{props.details.fromToken.symbol.slice(0, 1)}</Text>
                  </View>
                )}
                <View style={$tokenNameContainer}>
                  <Text preset="bold" style={themed($tokenSymbolStyle)}>
                    {props.details.fromToken.symbol}
                  </Text>
                  <Text style={themed($tokenAddressStyle)} numberOfLines={1} ellipsizeMode="middle">
                    {getAbbreviatedAddress(props.details.fromToken.address)}
                  </Text>
                </View>
              </View>
              <View style={$tokenAmountContainer}>
                <Text preset="bold" style={themed($tokenAmountStyle)}>
                  {props.details.fromToken.amount}
                </Text>
                {props.details.fromUsd !== undefined && (
                  <Text style={themed($tokenUsdValueStyle)}>
                    {formatCurrency(props.details.fromUsd)}
                  </Text>
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
                {props.details.toToken.logo ? (
                  <Image
                    source={{ uri: props.details.toToken.logo }}
                    style={$tokenLogoStyle}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={themed($placeholderLogoStyle)}>
                    <Text preset="bold">{props.details.toToken.symbol.slice(0, 1)}</Text>
                  </View>
                )}
                <View style={$tokenNameContainer}>
                  <Text preset="bold" style={themed($tokenSymbolStyle)}>
                    {props.details.toToken.symbol}
                  </Text>
                  <Text style={themed($tokenAddressStyle)} numberOfLines={1} ellipsizeMode="middle">
                    {getAbbreviatedAddress(props.details.toToken.address)}
                  </Text>
                </View>
              </View>
              <View style={$tokenAmountContainer}>
                <Text preset="bold" style={themed($tokenAmountStyle)}>
                  {props.details.toToken.amount || '?'}
                </Text>
                {props.details.toUsd !== undefined && (
                  <Text style={themed($tokenUsdValueStyle)}>
                    {formatCurrency(props.details.toUsd)}
                  </Text>
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
                1 {props.details.fromToken.symbol} = {props.details.price || '?'}{' '}
                {props.details.toToken.symbol}
              </Text>
            </View>

            {props.details.priceImpact !== undefined && (
              <View style={themed($detailRowStyle)}>
                <Text preset="small" style={themed($detailLabelStyle)}>
                  Price Impact
                </Text>
                <Text style={themed($priceImpactStyle)}>
                  {(props.details.priceImpact * 100).toFixed(2)}%
                </Text>
              </View>
            )}

            {props.details.slippage !== undefined && (
              <View style={themed($detailRowStyle)}>
                <Text preset="small" style={themed($detailLabelStyle)}>
                  Slippage Tolerance
                </Text>
                <Text style={themed($detailValueStyle)}>
                  {(props.details.slippage * 100).toFixed(2)}%
                </Text>
              </View>
            )}
          </View>

          {/* Address links */}
          <View style={$actionsContainer}>
            <View style={$actionsRow}>
              <TouchableOpacity
                style={themed($actionButtonStyle)}
                onPress={() =>
                  copyToClipboard(props.details.fromToken.address, 'Token address copied')
                }
              >
                <Text style={themed($actionButtonTextStyle)}>
                  Copy {props.details.fromToken.symbol} Address
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={themed($actionButtonStyle)}
                onPress={() =>
                  Linking.openURL(`https://solscan.io/token/${props.details.fromToken.address}`)
                }
              >
                <Text style={themed($actionButtonTextStyle)}>View on Solscan</Text>
                <Ionicons name="open-outline" size={12} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={$actionsRow}>
              <TouchableOpacity
                style={themed($actionButtonStyle)}
                onPress={() =>
                  copyToClipboard(props.details.toToken.address, 'Token address copied')
                }
              >
                <Text style={themed($actionButtonTextStyle)}>
                  Copy {props.details.toToken.symbol} Address
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={themed($actionButtonStyle)}
                onPress={() =>
                  Linking.openURL(`https://solscan.io/token/${props.details.toToken.address}`)
                }
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
