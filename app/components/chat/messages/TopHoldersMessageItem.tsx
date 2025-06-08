import { FC, memo, useCallback } from 'react';
import {
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  FlatList,
  Linking,
} from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { formatNumber } from '@/utils/formatNumber';
import { toast } from 'sonner-native';

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

  /**
   * Process and transform the holder data to match component requirements.
   * Sorts holders by amount (descending) and limits to top 10 holders.
   * @returns Array of processed holder data with calculated percentages
   */
  const processData = () => {
    if (!props.details || !Array.isArray(props.details)) {
      return [];
    }

    // Sort holders by amount in descending order to get the actual top holders
    const sortedHolders = [...props.details].sort((a, b) => b.amount - a.amount);
    
    // Take only the top 10 holders
    const top10Holders = sortedHolders.slice(0, 10);

    // Calculate total supply for percentage calculation
    const totalSupply = props.details.reduce((sum, holder) => sum + holder.amount, 0);

    // Transform the data to match our component's expected structure
    return top10Holders.map(holder => ({
      address: holder.owner,
      amount: holder.amount,
      percentage: totalSupply > 0 ? holder.amount / totalSupply : 0,
      insider: holder.insider,
    }));
  };

  const processedData = processData();

  /**
   * Format percentage value for display.
   * @param percentage - The percentage value (0-1)
   * @returns Formatted percentage string with 2 decimal places
   */
  const formatPercentage = (percentage: number) => {
    return `${(percentage * 100).toFixed(2)}%`;
  };

  /**
   * Abbreviate long blockchain addresses for better UI display.
   * @param address - The full blockchain address
   * @returns Abbreviated address in format: first6...last4
   */
  const getAbbreviatedAddress = (address: string) => {
    if (!address) return 'Unknown';
    return address.length > 12
      ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      : address;
  };

  /**
   * Copy text to device clipboard and show confirmation alert.
   * @param text - The text to copy to clipboard
   */
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    toast.success('Address copied to clipboard');
  };

  /**
   * Open Solscan explorer page for the given address.
   * @param address - The blockchain address to view on Solscan
   */
  const openSolscan = (address: string) => {
    Linking.openURL(`https://solscan.io/account/${address}`);
  };

  /**
   * Render individual holder item in the list.
   * @param item - The holder data to render
   * @param index - The index position in the list
   * @returns JSX element for the holder row
   */
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


  return (
    <BaseBorderedMessageItem
      title="Top Token Holders"
      subtitle={props.name || 'Token Analysis'}
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
  flex: 1,
  justifyContent: 'space-between',
  paddingLeft: 8,
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
  alignItems: 'center',
};

const $amountTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 13,
  flex: 1,
});

const $percentageTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 13,
  fontWeight: 'bold',
  minWidth: 55,
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
  maxHeight: 520, // Optimized for up to 10 items (52px per item)
};

const $listContentStyle: ViewStyle = {
  paddingVertical: 4,
};
