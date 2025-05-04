import { FC } from 'react';
import {
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Linking,
  Alert,
  FlatList,
} from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface TransactionInfo {
  signature?: string;
  err?: any;
  status?: string;
  message?: string;
  type?: string;
}

interface SignedTransactionProps {
  transactions: TransactionInfo[];
}

interface SignedTransactionsMessageItemProps {
  props: SignedTransactionProps;
}

export const SignedTransactionsMessageItem: FC<SignedTransactionsMessageItemProps> = ({
  props,
}) => {
  const { themed, theme } = useAppTheme();

  // Abbreviate signature for display
  const getAbbreviatedSignature = (signature: string | undefined) => {
    if (!signature) return 'Unknown';
    return signature.length > 12
      ? `${signature.substring(0, 8)}...${signature.substring(signature.length - 8)}`
      : signature;
  };

  // Clipboard function
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Signature copied to clipboard');
  };

  // Open Solscan link
  const openSolscan = (signature: string | undefined) => {
    if (signature) {
      Linking.openURL(`https://solscan.io/tx/${signature}`);
    }
  };

  // Get status styling
  const getStatusColor = (status: string | undefined) => {
    if (!status) return theme.colors.textDim;

    switch (status.toLowerCase()) {
      case 'success':
      case 'confirmed':
      case 'finalized':
        return theme.colors.success;
      case 'error':
      case 'failed':
        return theme.colors.error;
      case 'pending':
      case 'processing':
        return theme.colors.warning;
      default:
        return theme.colors.textDim;
    }
  };

  // Render a transaction item
  const renderTransactionItem = ({ item, index }: { item: TransactionInfo; index: number }) => {
    const status = item.err ? 'Error' : item.status || 'Pending';

    return (
      <View style={themed($transactionItemStyle)}>
        <View style={$transactionHeaderRow}>
          <View style={themed($indexContainerStyle)}>
            <Text style={themed($indexStyle)}>{index + 1}</Text>
          </View>

          <Text preset="bold" style={themed($typeStyle)}>
            {item.type || 'Transaction'}
          </Text>

          <View style={[$statusContainerStyle, { backgroundColor: `${getStatusColor(status)}20` }]}>
            <Text style={[themed($statusStyle), { color: getStatusColor(status) }]}>{status}</Text>
          </View>
        </View>

        <View style={$signatureContainer}>
          <Text preset="small" style={themed($labelStyle)}>
            Signature:
          </Text>
          <View style={$signatureRow}>
            <Text style={themed($signatureStyle)}>{getAbbreviatedSignature(item.signature)}</Text>

            <View style={$signatureActions}>
              {item.signature && (
                <>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(item.signature!)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="copy-outline" size={16} color={theme.colors.textDim} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => openSolscan(item.signature)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="open-outline" size={16} color={theme.colors.textDim} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </View>

        {item.message && (
          <View style={themed($messageContainerStyle)}>
            <Text preset="small" style={themed($messageStyle)}>
              {item.message}
            </Text>
          </View>
        )}

        {item.err && (
          <View style={themed($errorContainerStyle)}>
            <Text preset="small" style={themed($errorStyle)}>
              {typeof item.err === 'string'
                ? item.err
                : 'Transaction failed. Check blockchain explorer for details.'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const footer = (
    <View style={$footerContainer}>
      <Text preset="small" style={themed($footerTextStyle)}>
        Transaction{props.transactions.length > 1 ? 's' : ''} signed and sent to the Solana
        blockchain.
      </Text>
    </View>
  );

  return (
    <BaseBorderedMessageItem
      title={`Signed Transaction${props.transactions.length > 1 ? 's' : ''}`}
      subtitle={`${props.transactions.length} transaction${props.transactions.length > 1 ? 's' : ''}`}
      footer={footer}
    >
      <View style={$contentContainer}>
        <FlatList
          data={props.transactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item, index) => item.signature || `tx-${index}`}
          ItemSeparatorComponent={() => <View style={themed($separatorStyle)} />}
          scrollEnabled={false}
          contentContainerStyle={$listContentStyle}
        />
      </View>
    </BaseBorderedMessageItem>
  );
};

// Styles
const $contentContainer: ViewStyle = {
  paddingVertical: 8,
};

const $transactionItemStyle: ThemedStyle<ViewStyle> = theme => ({
  padding: 12,
  backgroundColor: `${theme.colors.surface}10`,
  borderRadius: 8,
  gap: 12,
});

const $transactionHeaderRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

const $indexContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: `${theme.colors.primary}20`,
  justifyContent: 'center',
  alignItems: 'center',
});

const $indexStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 12,
  fontWeight: 'bold',
  color: theme.colors.primary,
});

const $typeStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  flex: 1,
});

const $statusContainerStyle: ViewStyle = {
  paddingVertical: 2,
  paddingHorizontal: 8,
  borderRadius: 12,
};

const $statusStyle: TextStyle = {
  fontSize: 12,
  fontWeight: 'bold',
};

const $signatureContainer: ViewStyle = {
  gap: 4,
};

const $labelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
});

const $signatureRow: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const $signatureStyle: ThemedStyle<TextStyle> = theme => ({
  fontFamily: 'monospace',
  fontSize: 12,
  color: theme.colors.text,
});

const $signatureActions: ViewStyle = {
  flexDirection: 'row',
  gap: 12,
};

const $messageContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  padding: 8,
  backgroundColor: `${theme.colors.primary}10`,
  borderRadius: 4,
});

const $messageStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
});

const $errorContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  padding: 8,
  backgroundColor: `${theme.colors.error}10`,
  borderRadius: 4,
});

const $errorStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.error,
});

const $separatorStyle: ThemedStyle<ViewStyle> = theme => ({
  height: 1,
  backgroundColor: theme.colors.border,
  marginVertical: 12,
});

const $listContentStyle: ViewStyle = {
  gap: 8,
};

const $footerContainer: ViewStyle = {
  alignItems: 'center',
};

const $footerTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  textAlign: 'center',
});
