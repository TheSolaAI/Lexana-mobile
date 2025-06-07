import { FC, memo } from 'react';
import { View, ViewStyle, TextStyle, Image, ImageStyle } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseGridMessageItem } from './base/BaseGridMessageItem';
import { formatNumber } from '@/utils/formatNumber';

interface NFTCollection {
  symbol: string;
  image: string;
  floor_price: number;
  listed_count: number;
  avg_price_24hr: number;
  volume_all: number;
}

interface NFTCollectionMessageItemProps {
  props: NFTCollection;
}

/**
 * This component displays basic details of an NFT collection, including its
 * image, title, price, and the number of listed items.
 */
export const NFTCollectionMessageItem: FC<NFTCollectionMessageItemProps> = memo(({ props }) => {
  const { themed } = useAppTheme();

  return (
    <BaseGridMessageItem col={2}>
      <View style={themed($collectionCardStyle)}>
        <View style={$contentContainer}>
          <Image source={{ uri: props.image }} style={$imageStyle} resizeMode="cover" />
          <View style={$infoContainer}>
            <Text preset="bold" style={themed($symbolStyle)}>
              {props.symbol}
            </Text>
            <Text style={themed($priceStyle)}>Floor: {props.floor_price}</Text>
            <Text preset="small" style={themed($detailStyle)}>
              Listed: {props.listed_count}
            </Text>
            <Text preset="small" style={themed($detailStyle)}>
              Avg Floor (24hr): {formatNumber(props.avg_price_24hr / 10 ** 9)}
            </Text>
            <Text preset="small" style={themed($detailStyle)}>
              Total Volume: {formatNumber(props.volume_all / 10 ** 9)}
            </Text>
          </View>
        </View>
      </View>
    </BaseGridMessageItem>
  );
});

// Styles
const $collectionCardStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  borderRadius: 12,
  padding: 12,
  // shadowColor: theme.colors.shadow,
  // shadowOffset: { width: 0, height: 2 },
  // shadowOpacity: 0.1,
  // shadowRadius: 4,
  // elevation: 2,
});

const $contentContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16,
};

const $imageStyle: ImageStyle = {
  width: 64,
  height: 64,
  borderRadius: 8,
};

const $infoContainer: ViewStyle = {
  flex: 1,
};

const $symbolStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 16,
  color: theme.colors.text,
  marginBottom: 2,
});

const $priceStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 16,
  color: theme.colors.text,
  fontWeight: '500',
  marginBottom: 2,
});

const $detailStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 12,
  color: theme.colors.textDim,
  marginBottom: 2,
});
