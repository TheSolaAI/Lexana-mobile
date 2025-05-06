import { FC } from 'react';
import { View, ViewStyle, TextStyle, TouchableOpacity, Linking, Alert } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface TokenAddressData {
  address: string;
  name?: string;
  symbol?: string;
}

interface TokenAddressResultMessageItemProps {
  props: TokenAddressData;
}

export const TokenAddressResultMessageItem: FC<TokenAddressResultMessageItemProps> = ({
  props,
}) => {
  const { themed, theme } = useAppTheme();

  // Clipboard function
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Token address copied to clipboard');
  };

  // Open Solscan link
  const openSolscan = () => {
    Linking.openURL(`https://solscan.io/token/${props.address}`);
  };

  const footer = (
    <View style={$footerContainer}>
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

  return (
    <BaseBorderedMessageItem
      title="Token Address"
      subtitle={props.symbol || 'Unknown Token'}
      footer={footer}
      onPress={openSolscan}
    >
      <View style={$contentContainer}>
        <Text preset="small" style={themed($labelStyle)}>
          Token Name
        </Text>
        <Text style={themed($valueStyle)}>{props.name || 'Unknown'}</Text>

        <Text preset="small" style={themed($labelStyle)}>
          Token Symbol
        </Text>
        <Text style={themed($valueStyle)}>{props.symbol || 'Unknown'}</Text>

        <Text preset="small" style={themed($labelStyle)}>
          Address
        </Text>
        <Text style={themed($addressStyle)} numberOfLines={1} ellipsizeMode="middle">
          {props.address}
        </Text>
      </View>
    </BaseBorderedMessageItem>
  );
};

// Styles
const $contentContainer: ViewStyle = {
  gap: 8,
};

const $labelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  marginBottom: 2,
});

const $valueStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 16,
  marginBottom: 8,
});

const $addressStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 14,
  fontFamily: 'monospace',
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
