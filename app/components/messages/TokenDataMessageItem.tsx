import { FC } from 'react';
import { View, ViewStyle, TextStyle, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { formatNumber } from '@/utils/formatNumber';

interface TokenDataProps {
  address: string;
  totalSupply: number;
  tokenName: string;
  tokenSymbol: string;
  image?: string;
  price?: number;
  mktCap?: number;
  holderCount?: number;
  decimal?: number;
  [key: string]: any;
}

interface TokenDataMessageItemProps {
  props: TokenDataProps;
}

export const TokenDataMessageItem: FC<TokenDataMessageItemProps> = ({ props }) => {
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

  const footer = (
    <View style={$footerContainer}>
      <TouchableOpacity style={themed($linkButtonStyle)} onPress={openSolscan}>
        <Text style={themed($linkTextStyle)}>View on Solscan</Text>
        <Ionicons name="open-outline" size={14} color={theme.colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={themed($linkButtonStyle)}
        onPress={() => copyToClipboard(props.address)}
      >
        <Text style={themed($linkTextStyle)}>Copy Address</Text>
        <Ionicons name="copy-outline" size={14} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <BaseBorderedMessageItem
      title={props.tokenName || 'Token Data'}
      subtitle={props.tokenSymbol}
      footer={footer}
      onPress={openSolscan}
    >
      <View style={$contentContainer}>
        {/* First row - Address and Supply */}
        <View style={$infoRowContainer}>
          <View style={themed($infoBlockStyle)}>
            <Text preset="small" style={themed($labelStyle)}>
              Token Address
            </Text>
            <Text style={themed($addressTextStyle)} numberOfLines={1} ellipsizeMode="middle">
              {props.address}
            </Text>
          </View>

          <View style={themed($infoBlockStyle)}>
            <Text preset="small" style={themed($labelStyle)}>
              Total Supply
            </Text>
            <Text style={themed($valueTextStyle)}>{formatNumber(props.totalSupply)}</Text>
          </View>
        </View>

        {/* Second row - Price and Market Cap if available */}
        {(props.price !== undefined || props.mktCap !== undefined) && (
          <View style={$infoRowContainer}>
            {props.price !== undefined && (
              <View style={themed($infoBlockStyle)}>
                <Text preset="small" style={themed($labelStyle)}>
                  Price
                </Text>
                <Text style={themed($valueTextStyle)}>${formatNumber(props.price)}</Text>
              </View>
            )}

            {props.mktCap !== undefined && (
              <View style={themed($infoBlockStyle)}>
                <Text preset="small" style={themed($labelStyle)}>
                  Market Cap
                </Text>
                <Text style={themed($valueTextStyle)}>${formatNumber(props.mktCap)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Third row - Holders and Decimals if available */}
        {(props.holderCount !== undefined || props.decimal !== undefined) && (
          <View style={$infoRowContainer}>
            {props.holderCount !== undefined && (
              <View style={themed($infoBlockStyle)}>
                <Text preset="small" style={themed($labelStyle)}>
                  Holders
                </Text>
                <Text style={themed($valueTextStyle)}>{formatNumber(props.holderCount)}</Text>
              </View>
            )}

            {props.decimal !== undefined && (
              <View style={themed($infoBlockStyle)}>
                <Text preset="small" style={themed($labelStyle)}>
                  Decimals
                </Text>
                <Text style={themed($valueTextStyle)}>{props.decimal}</Text>
              </View>
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

const $infoBlockStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: `${theme.colors.surface}30`,
  padding: 12,
  borderRadius: 12,
  flex: 1,
});

const $labelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  marginBottom: 4,
});

const $addressTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontFamily: 'monospace',
  fontSize: 12,
  color: theme.colors.text,
});

const $valueTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 16,
});

const $footerContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
};

const $linkButtonStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
};

const $linkTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.primary,
  fontSize: 13,
});
