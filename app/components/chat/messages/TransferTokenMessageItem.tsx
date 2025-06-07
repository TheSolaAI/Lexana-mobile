import { FC, memo } from 'react';
import { View, ViewStyle, TextStyle, TouchableOpacity, Alert, Linking } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { SOLA_TOKEN_ADDRESS } from '@/config/constants';

interface TransferTokenData {
  transaction: string; // serializedTransaction
  details: {
    senderAddress: string;
    recipientAddress: string;
    tokenMint?: string;
    amount: number;
    transaction?: any; // This seems redundant with the parent transaction
    params?: any;
    tokenTicker?: string;
  };
}

interface TransferTokenMessageItemProps {
  props: TransferTokenData;
}

export const TransferTokenMessageItem: FC<TransferTokenMessageItemProps> = memo(({ props }) => {
  const { themed, theme } = useAppTheme();

  // Abbreviate address for display
  const getAbbreviatedAddress = (address: string) => {
    if (!address) return 'Unknown';
    return address.length > 12
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : address;
  };

  // Get token symbol - default to SOL if not provided
  const getTokenSymbol = () => {
    if (props.details.tokenTicker) {
      return props.details.tokenTicker;
    }
    return 'SOL';
  };

  // Clipboard function
  const copyToClipboard = async (text: string, message = 'Address copied to clipboard') => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', message);
  };

  // Open Solscan link
  const openSolscan = (address: string) => {
    Linking.openURL(`https://solscan.io/account/${address}`);
  };

  // Compact content
  const compactContent = (
    <View style={$compactContentContainer}>
      <Text style={themed($transferTextStyle)}>
        {props.details.amount} {getTokenSymbol()} →{' '}
        {getAbbreviatedAddress(props.details.recipientAddress)}
      </Text>
    </View>
  );

  // Compact footer
  const compactFooter = (
    <View style={$footerContainer}>
      <View style={$footerActionsContainer}>
        <TouchableOpacity
          onPress={() => openSolscan(props.details.senderAddress)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={$iconButton}
        >
          <Ionicons name="open-outline" size={16} color={theme.colors.textDim} />
        </TouchableOpacity>
      </View>

      <View>
        <Text preset="small" style={themed($sourceTextStyle)}>
          From: {getAbbreviatedAddress(props.details.senderAddress)}
        </Text>
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
            <Ionicons name="arrow-up-outline" size={28} color={theme.colors.primary} />
          </View>
          <Text preset="pageHeading" style={themed($headerTitleStyle)}>
            Token Transfer
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={$expandedContentContainer}>
        <View style={$contentColumnContainer}>
          <View style={$gridContainer}>
            <View style={themed($infoBlockStyle)}>
              <Text preset="small" style={themed($labelStyle)}>
                Token
              </Text>
              <View style={$valueContainer}>
                <Text preset="bold" style={themed($valueStyle)}>
                  {getTokenSymbol()}
                </Text>
              </View>
              {props.details.tokenTicker && (
                <Text preset="small" style={themed($subValueStyle)}>
                  {props.details.tokenTicker}
                </Text>
              )}
            </View>

            <View style={themed($infoBlockStyle)}>
              <Text preset="small" style={themed($labelStyle)}>
                Amount
              </Text>
              <View style={$valueContainer}>
                <Text preset="bold" style={themed($valueStyle)}>
                  {props.details.amount}
                </Text>
              </View>
            </View>
          </View>

          {/* Sender and Recipient addresses */}
          <View style={$addressesContainer}>
            {/* Sender address */}
            <View style={themed($addressBlockStyle)}>
              <Text preset="small" style={themed($labelStyle)}>
                From:
              </Text>
              <View style={$addressContentContainer}>
                <Text style={themed($addressTextStyle)} numberOfLines={1} ellipsizeMode="middle">
                  {props.details.senderAddress}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(props.details.senderAddress)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={themed($copyButtonStyle)}
                >
                  <Ionicons name="copy-outline" size={18} color={theme.colors.textDim} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Recipient address */}
            <View style={themed($addressBlockStyle)}>
              <Text preset="small" style={themed($labelStyle)}>
                To:
              </Text>
              <View style={$addressContentContainer}>
                <Text style={themed($addressTextStyle)} numberOfLines={1} ellipsizeMode="middle">
                  {props.details.recipientAddress}
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(props.details.recipientAddress)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={themed($copyButtonStyle)}
                >
                  <Ionicons name="copy-outline" size={18} color={theme.colors.textDim} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Token Mint if available */}
            {props.details.tokenMint && (
              <View style={themed($addressBlockStyle)}>
                <Text preset="small" style={themed($labelStyle)}>
                  Token Mint:
                </Text>
                <View style={$addressContentContainer}>
                  <Text style={themed($addressTextStyle)} numberOfLines={1} ellipsizeMode="middle">
                    {props.details.tokenMint}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      copyToClipboard(
                        props.details.tokenMint || SOLA_TOKEN_ADDRESS,
                        'Token mint copied to clipboard'
                      )
                    }
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={themed($copyButtonStyle)}
                  >
                    <Ionicons name="copy-outline" size={18} color={theme.colors.textDim} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Links section */}
          <View style={$linksSectionStyle}>
            <TouchableOpacity
              style={themed($linkButtonStyle)}
              onPress={() => openSolscan(props.details.senderAddress)}
            >
              <Text style={themed($linkTextStyle)}>View Sender</Text>
              <Ionicons name="open-outline" size={12} color={theme.colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={themed($linkButtonStyle)}
              onPress={() => openSolscan(props.details.recipientAddress)}
            >
              <Text style={themed($linkTextStyle)}>View Recipient</Text>
              <Ionicons name="open-outline" size={12} color={theme.colors.primary} />
            </TouchableOpacity>

            {props.details.tokenMint && (
              <TouchableOpacity
                style={themed($linkButtonStyle)}
                onPress={() =>
                  Linking.openURL(`https://solscan.io/token/${props.details.tokenMint}`)
                }
              >
                <Text style={themed($linkTextStyle)}>View Token</Text>
                <Ionicons name="open-outline" size={12} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={themed($expandedFooterStyle)}>
          <Text preset="small" style={themed($footerTextStyle)}>
            This transaction is being prepared and will be submitted to the blockchain.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <BaseExpandableMessageItem
      title="Token Transfer"
      icon={<Ionicons name="arrow-up-outline" size={16} color={theme.colors.primary} />}
      compactContent={compactContent}
      expandedContent={expandedContent}
      footer={compactFooter}
    />
  );
});

// Styles
const $compactContentContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

const $transferTextStyle: ThemedStyle<TextStyle> = theme => ({
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

const $sourceTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 12,
  color: theme.colors.textDim,
});

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
  gap: 16,
};

const $gridContainer: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: 12,
};

const $infoBlockStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.background,
  padding: 12,
  borderRadius: 12,
  flex: 1,
});

const $valueContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 4,
};

const $labelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  marginBottom: 4,
});

const $valueStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 18,
});

const $subValueStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 12,
  marginTop: 4,
});

const $addressesContainer: ViewStyle = {
  gap: 8,
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

const $linksSectionStyle: ViewStyle = {
  flexDirection: 'row',
  gap: 12,
  flexWrap: 'wrap',
  marginTop: 8,
};

const $linkButtonStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
};

const $linkTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.primary,
  fontSize: 12,
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
