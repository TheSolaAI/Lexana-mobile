import { FC } from 'react';
import { View, ViewStyle, TextStyle, Image, ImageStyle } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseGridMessageItem } from './base/BaseGridMessageItem';
import { formatNumber } from '@/utils/formatNumber';

interface TrendingNFTData {
  image: string;
  name: string;
  floor_price: number | string;
  listed_count: number | string;
  volume_24hr: number;
  volume_all: number;
}

interface GetTrendingNFTSChatContent {
  data: TrendingNFTData[];
}

interface GetTrendingNFTSChatItemProps {
  props: GetTrendingNFTSChatContent;
}

export const TrendingNFTMessageItem: FC<GetTrendingNFTSChatItemProps> = ({ props }) => {
  const { themed } = useAppTheme();

  return (
    <BaseGridMessageItem col={2}>
      {props.data.map((trendingNFTCard, index) => (
        <View key={trendingNFTCard.name || index.toString()} style={themed($cardStyle)}>
          <View style={$cardContentStyle}>
            <Image source={{ uri: trendingNFTCard.image }} style={$imageStyle} resizeMode="cover" />
            <View style={$infoContainerStyle}>
              <Text preset="bold" style={themed($nameStyle)}>
                {trendingNFTCard.name}
              </Text>
              <Text preset="bold" style={themed($floorPriceStyle)}>
                Floor: {trendingNFTCard.floor_price}
              </Text>
              <Text style={themed($statsStyle)}>Listed: {trendingNFTCard.listed_count}</Text>
              <Text style={themed($statsStyle)}>
                Volume (24hr): {formatNumber(trendingNFTCard.volume_24hr / 10 ** 9)}
              </Text>
              <Text style={themed($statsStyle)}>
                Total Volume: {formatNumber(trendingNFTCard.volume_all / 10 ** 9)}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </BaseGridMessageItem>
  );
};

// Styles
const $cardStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  padding: 12,
  borderRadius: 12,
  overflow: 'hidden',
  // shadowColor: theme.colors.shadow,
  // shadowOffset: { width: 0, height: 2 },
  // shadowOpacity: 0.1,
  // shadowRadius: 4,
  // elevation: 2,
  width: '100%',
});

const $cardContentStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 16,
};

const $imageStyle: ImageStyle = {
  width: 64,
  height: 64,
  borderRadius: 8,
};

const $infoContainerStyle: ViewStyle = {
  flex: 1,
};

const $nameStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 16,
  marginBottom: 2,
  color: theme.colors.text,
});

const $floorPriceStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 16,
  marginBottom: 4,
  color: theme.colors.text,
});

const $statsStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 14,
  marginBottom: 2,
  color: theme.colors.textDim,
});
