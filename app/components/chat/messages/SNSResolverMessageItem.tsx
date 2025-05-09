import { FC } from 'react';
import { View, ViewStyle, TextStyle, TouchableOpacity, Linking, Alert } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseExpandableMessageItem } from './base/BaseExpandableMessageItem';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface SNSResolverResultData {
  domain: string;
  walletAddress: string;
  source: string;
}

interface SNSResolverMessageItemProps {
  props: SNSResolverResultData;
}

export const SNSResolverMessageItem: FC<SNSResolverMessageItemProps> = ({ props }) => {
  const { themed, theme } = useAppTheme();

  // Abbreviate address for display
  const getAbbreviatedAddress = (address: string) => {
    if (!address) return 'Unknown';
    return address.length > 12
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : address;
  };

  // Clipboard function
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  // Open Solscan link
  const openSolscan = () => {
    Linking.openURL(`https://solscan.io/account/${props.walletAddress}`);
  };

  // Compact content
  const compactContent = (
    <View style={$compactContentContainer}>
      <Text style={themed($domainStyle)}>
        {props.domain} → {getAbbreviatedAddress(props.walletAddress)}
      </Text>
    </View>
  );

  // Compact footer
  const compactFooter = (
    <View style={$footerContainer}>
      <View style={$footerActionsContainer}>
        <TouchableOpacity
          onPress={openSolscan}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={$iconButton}
        >
          <Ionicons name="open-outline" size={16} color={theme.colors.textDim} />
        </TouchableOpacity>
      </View>

      <View>
        <Text preset="small" style={themed($sourceTextStyle)}>
          Source: {props.source}
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
            <Ionicons name="search" size={28} color={theme.colors.primary} />
          </View>
          <Text preset="heading" style={themed($headerTitleStyle)}>
            SNS Domain Resolution
          </Text>
        </View>
      </View>

      {/* Content */}
      <View style={$expandedContentContainer}>
        <View style={$contentColumnContainer}>
          <View style={$gridContainer}>
            <View style={themed($infoBlockStyle)}>
              <Text preset="small" style={themed($labelStyle)}>
                Domain
              </Text>
              <Text preset="bold" style={themed($valueStyle)}>
                {props.domain}
              </Text>
            </View>

            <View style={themed($infoBlockStyle)}>
              <Text preset="small" style={themed($labelStyle)}>
                Source
              </Text>
              <Text preset="bold" style={themed($valueStyle)}>
                {props.source}
              </Text>
            </View>

            <View style={themed($infoBlockStyle)}>
              <Text preset="small" style={themed($labelStyle)}>
                Status
              </Text>
              <View style={$statusContainer}>
                <View style={$statusDotStyle} />
                <Text preset="bold" style={themed($valueStyle)}>
                  Success
                </Text>
              </View>
            </View>
          </View>

          {/* Wallet Address */}
          <View style={themed($walletAddressContainer)}>
            <Text preset="small" style={themed($labelStyle)}>
              Wallet Address:
            </Text>
            <View style={$walletAddressContentContainer}>
              <Text
                preset="monospace"
                style={themed($addressTextStyle)}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {props.walletAddress}
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(props.walletAddress)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={themed($copyButtonStyle)}
              >
                <Ionicons name="copy-outline" size={18} color={theme.colors.textDim} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Links and actions */}
          <TouchableOpacity style={themed($linkButtonStyle)} onPress={openSolscan}>
            <Text style={themed($linkTextStyle)}>View on Solscan</Text>
            <Ionicons name="open-outline" size={12} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={themed($expandedFooterStyle)}>
          <Text preset="small" style={themed($footerTextStyle)}>
            Solana domain resolved via {props.source}.
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <BaseExpandableMessageItem
      title="SNS Resolver"
      icon={<Ionicons name="search" size={16} color={theme.colors.primary} />}
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

const $domainStyle: ThemedStyle<TextStyle> = theme => ({
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
  minWidth: '30%',
});

const $labelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  marginBottom: 4,
});

const $valueStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 18,
});

const $statusContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

const $statusDotStyle: ViewStyle = {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: 'green',
};

const $walletAddressContainer: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: `${theme.colors.surface}30`,
  padding: 12,
  borderRadius: 12,
});

const $walletAddressContentContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 4,
};

const $addressTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 12,
  flex: 1,
});

const $copyButtonStyle: ThemedStyle<ViewStyle> = theme => ({
  padding: 4,
  borderRadius: 12,
  backgroundColor: `${theme.colors.surface}50`,
});

const $linkButtonStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  alignSelf: 'flex-start',
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
