import { FC, memo, useCallback } from 'react';
import {
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  FlatList,
  Linking,
  Alert,
} from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { formatNumber } from '@/utils/formatNumber';

interface Holder {
  address: string;
  amount: number;
  percentage: number;
  insider?: boolean;
}

interface TopHoldersProps {
  details: {
    owner: string;
    amount: number;
    insider?: boolean;
  }[];
  name?: string;
  address?: string;
}

interface TopHoldersMessageItemProps {
  props: TopHoldersProps;
}

export const TopHoldersMessageItem: FC<TopHoldersMessageItemProps> = memo(({ props }) => {
  const { themed, theme } = useAppTheme();

  // Process and transform the data to match our component needs
  const processData = () => {
    if (!props.details || !Array.isArray(props.details)) {
      return [];
    }

    // Calculate total supply for percentage calculation
    const totalSupply = props.details.reduce((sum, holder) => sum + holder.amount, 0);

    // Transform the data to match our component's expected structure
    return props.details.map(holder => ({
      address: holder.owner,
      amount: holder.amount,
      percentage: totalSupply > 0 ? holder.amount / totalSupply : 0,
      insider: holder.insider,
    }));
  };

  const processedData = processData();

  // Format percentage
  const formatPercentage = (percentage: number) => {
    return `${(percentage * 100).toFixed(2)}%`;
  };

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
  const openSolscan = (address: string) => {
    Linking.openURL(`https://solscan.io/account/${address}`);
  };

  // Render each holder row
  const renderHolderItem = useCallback(({ item, index }: { item: Holder; index: number }) => (
    <View style={themed($holderItemStyle)}>
      <View style={$numberAndAddressContainer}>
        <View style={themed($indexContainer)}>
          <Text preset="bold" style={themed($indexTextStyle)}>
            {index + 1}
          </Text>
        </View>

        <View style={$addressContainer}>
          <Text style={themed($addressTextStyle)}>{getAbbreviatedAddress(item.address)}</Text>

          <View style={$addressActionButtons}>
            <TouchableOpacity
              onPress={() => copyToClipboard(item.address)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="copy-outline" size={16} color={theme.colors.textDim} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openSolscan(item.address)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="open-outline" size={16} color={theme.colors.textDim} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={$amountAndPercentContainer}>
        <Text style={themed($amountTextStyle)}>{formatNumber(item.amount)}</Text>

        <Text style={themed($percentageTextStyle)}>{formatPercentage(item.percentage)}</Text>
      </View>

      <View style={themed($percentBarContainerStyle)}>
        <View
          style={[
            themed($percentBarFillStyle),
            { width: `${Math.max(item.percentage * 100, 1)}%` },
          ]}
        />
      </View>
    </View>
  ), [themed, theme]);

  const footer = (
    <TouchableOpacity
      style={$footerButton}
      onPress={() => Linking.openURL(`https://solscan.io/token/${props.address}#holders`)}
    >
      <Text style={themed($footerButtonTextStyle)}>View All Holders</Text>
      <Ionicons name="open-outline" size={14} color={theme.colors.primary} />
    </TouchableOpacity>
  );

  return (
    <BaseBorderedMessageItem
      title="Top Token Holders"
      subtitle={props.name || 'Token Analysis'}
      footer={footer}
    >
      <View>
        <View style={themed($headerRowStyle)}>
          <Text preset="small" style={themed($headerTextStyle)}>
            Holder
          </Text>
          <View style={$headerRightSection}>
            <Text preset="small" style={themed($headerTextStyle)}>
              Amount
            </Text>
            <Text preset="small" style={themed($headerTextStyle)}>
              Ownership
            </Text>
          </View>
        </View>

        <FlatList
          data={processedData}
          renderItem={renderHolderItem}
          keyExtractor={item => item.address}
          scrollEnabled={false}
          style={$listStyle}
          contentContainerStyle={$listContentStyle}
          ItemSeparatorComponent={() => <View style={themed($separatorStyle)} />}
        />
      </View>
    </BaseBorderedMessageItem>
  );
});

// Styles
const $headerRowStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingVertical: 8,
  marginBottom: 4,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
});

const $headerTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 12,
  textTransform: 'uppercase',
});

const $headerRightSection: ViewStyle = {
  flexDirection: 'row',
  width: '50%',
  justifyContent: 'space-between',
};

const $holderItemStyle: ViewStyle = {
  paddingVertical: 12,
  gap: 8,
};

const $numberAndAddressContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

const $indexContainer: ThemedStyle<ViewStyle> = theme => ({
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: `${theme.colors.primary}20`,
  justifyContent: 'center',
  alignItems: 'center',
});

const $indexTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.primary,
  fontSize: 12,
});

const $addressContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  flex: 1,
};

const $addressTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontFamily: 'monospace',
  color: theme.colors.text,
  fontSize: 13,
});

const $addressActionButtons: ViewStyle = {
  flexDirection: 'row',
  gap: 12,
  paddingRight: 4,
};

const $amountAndPercentContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  paddingLeft: 32,
};

const $amountTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 13,
});

const $percentageTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 13,
  fontWeight: 'bold',
  minWidth: 60,
  textAlign: 'right',
});

const $percentBarContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  height: 4,
  backgroundColor: `${theme.colors.surface}50`,
  borderRadius: 2,
  overflow: 'hidden',
  marginTop: 4,
  marginLeft: 32,
});

const $percentBarFillStyle: ThemedStyle<ViewStyle> = theme => ({
  height: '100%',
  backgroundColor: theme.colors.primary,
  borderRadius: 2,
});

const $separatorStyle: ThemedStyle<ViewStyle> = theme => ({
  height: 1,
  backgroundColor: `${theme.colors.border}80`,
});

const $listStyle: ViewStyle = {
  maxHeight: 440, // Limit height to show approx 5 items
};

const $listContentStyle: ViewStyle = {
  paddingVertical: 4,
};

const $footerButton: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  alignSelf: 'center',
};

const $footerButtonTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.primary,
  fontSize: 14,
});
