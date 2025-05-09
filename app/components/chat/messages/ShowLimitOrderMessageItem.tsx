import { FC } from 'react';
import { View, ViewStyle, TextStyle, TouchableOpacity, Linking } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseStatusMessageItem } from './base/BaseStatusMessageItem';
import { Ionicons } from '@expo/vector-icons';
import { formatNumber } from '@/utils/formatNumber';

interface LimitOrderToken {
  symbol: string;
  amount: number;
  decimals?: number;
  address: string;
}

interface LimitOrder {
  inputToken: LimitOrderToken;
  outputToken: LimitOrderToken;
  limitPrice: number;
  marketPrice?: number;
  status?: 'open' | 'filled' | 'canceled' | 'expired';
  createdAt?: string;
  expiresAt?: string;
  orderId?: string;
  id?: string;
}

interface ShowLimitOrderMessageItemProps {
  props: LimitOrder;
}

export const ShowLimitOrderMessageItem: FC<ShowLimitOrderMessageItemProps> = ({ props }) => {
  const { themed, theme } = useAppTheme();

  // Format date/time
  const formatDateTime = (timestamp: string | undefined) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Determine status for styling
  const getStatusType = () => {
    switch (props.status?.toLowerCase()) {
      case 'filled':
        return 'success';
      case 'canceled':
      case 'expired':
        return 'error';
      case 'open':
      default:
        return 'pending';
    }
  };

  // Status text
  const getStatusText = () => {
    return props.status ? props.status.charAt(0).toUpperCase() + props.status.slice(1) : 'Open';
  };

  // Icon based on status
  const getIcon = () => {
    switch (props.status?.toLowerCase()) {
      case 'filled':
        return <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />;
      case 'canceled':
      case 'expired':
        return <Ionicons name="close-circle" size={24} color={theme.colors.error} />;
      case 'open':
      default:
        return <Ionicons name="time" size={24} color={theme.colors.warning} />;
    }
  };

  // Calculate price difference from market (if available)
  const getPriceDifferencePercentage = () => {
    if (props.marketPrice && props.limitPrice) {
      const diff = ((props.limitPrice - props.marketPrice) / props.marketPrice) * 100;
      const sign = diff > 0 ? '+' : '';
      return `${sign}${diff.toFixed(2)}%`;
    }
    return null;
  };

  const priceDiff = getPriceDifferencePercentage();

  // Open Jupiter Limit Order in browser
  const viewOnJupiter = () => {
    if (props.orderId) {
      Linking.openURL(`https://jup.ag/limit/${props.orderId}`);
    }
  };

  const footer = (
    <View style={$footerContainer}>
      <Text preset="small" style={themed($timestampStyle)}>
        {props.createdAt && `Created: ${formatDateTime(props.createdAt)}`}
      </Text>
      {props.expiresAt && (
        <Text preset="small" style={themed($timestampStyle)}>
          Expires: {formatDateTime(props.expiresAt)}
        </Text>
      )}
    </View>
  );

  return (
    <BaseStatusMessageItem
      title="Limit Order"
      status={getStatusType()}
      statusText={getStatusText()}
      icon={getIcon()}
      footer={footer}
      onPress={props.orderId ? viewOnJupiter : undefined}
    >
      <View style={$contentContainer}>
        {/* Order Summary */}
        <View style={$orderSummaryContainer}>
          <Text style={themed($orderTextStyle)}>
            {formatNumber(props.inputToken.amount)} {props.inputToken.symbol} →{' '}
            {formatNumber(props.outputToken.amount)} {props.outputToken.symbol}
          </Text>

          <View style={$priceContainer}>
            <Text preset="small" style={themed($labelStyle)}>
              Limit Price:
            </Text>
            <Text style={themed($valueStyle)}>
              1 {props.inputToken.symbol} = {formatNumber(props.limitPrice)}{' '}
              {props.outputToken.symbol}
            </Text>
          </View>

          {props.marketPrice && (
            <View style={$priceContainer}>
              <Text preset="small" style={themed($labelStyle)}>
                Market Price:
              </Text>
              <View style={$marketPriceContainer}>
                <Text style={themed($valueStyle)}>
                  {formatNumber(props.marketPrice)} {props.outputToken.symbol}
                </Text>
                {priceDiff && (
                  <Text
                    style={[
                      themed($diffStyle),
                      {
                        color: priceDiff.includes('+') ? theme.colors.success : theme.colors.error,
                      },
                    ]}
                  >
                    ({priceDiff})
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={$actionsContainer}>
          {props.orderId && (
            <TouchableOpacity style={themed($actionButtonStyle)} onPress={viewOnJupiter}>
              <Text style={themed($actionTextStyle)}>View on Jupiter</Text>
              <Ionicons name="open-outline" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </BaseStatusMessageItem>
  );
};

// Styles
const $contentContainer: ViewStyle = {
  gap: 16,
};

const $orderSummaryContainer: ViewStyle = {
  gap: 8,
};

const $orderTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 16,
  color: theme.colors.text,
  fontWeight: 'bold',
  marginBottom: 4,
});

const $priceContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: 'transparent',
};

const $labelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
});

const $valueStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
});

const $marketPriceContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
};

const $diffStyle: TextStyle = {
  fontSize: 12,
};

const $actionsContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'center',
  paddingTop: 8,
};

const $actionButtonStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  paddingVertical: 8,
  paddingHorizontal: 16,
  borderRadius: 20,
  backgroundColor: `${theme.colors.primary}20`,
});

const $actionTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.primary,
});

const $footerContainer: ViewStyle = {
  gap: 4,
};

const $timestampStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
});
