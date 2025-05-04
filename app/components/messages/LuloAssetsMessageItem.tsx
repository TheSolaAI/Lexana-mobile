import { FC, useState, useEffect, useRef } from 'react';
import {
  View,
  ViewStyle,
  TextStyle,
  Image,
  ImageStyle,
  TouchableOpacity,
  Linking,
  FlatList,
  Animated,
} from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseStatusMessageItem } from './base/BaseStatusMessageItem';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';

interface TokenBalance {
  mint: string;
  balance: number;
  usdValue: number;
}

interface AssetsResponse {
  depositValue: number;
  interestEarned: number;
  totalValue: number;
  tokenBalance: TokenBalance[];
}

interface LuloAssetsMessageItemProps {
  props: AssetsResponse;
}

export const LuloAssetsMessageItem: FC<LuloAssetsMessageItemProps> = ({ props }) => {
  const { themed, theme } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(-1);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (props) {
      const timer = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [props]);

  useEffect(() => {
    // Auto-rotate focus through token items
    if (!loading && props.tokenBalance.length > 0) {
      const interval = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % props.tokenBalance.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [loading, props.tokenBalance]);

  useEffect(() => {
    // Create pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Open DexScreener link
  const openDexScreener = (mint: string) => {
    Linking.openURL(`https://dexscreener.com/solana/${mint}`);
  };

  const footer = (
    <View style={$footerContainer}>
      <Text preset="small" style={themed($smallTextStyle)}>
        Powered by Lulo Finance
      </Text>
      <TouchableOpacity
        style={$learnMoreButton}
        onPress={() => Linking.openURL('https://lulo.finance')}
      >
        <Text style={themed($linkTextStyle)}>Learn more</Text>
        <Ionicons name="arrow-forward-outline" size={14} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <BaseStatusMessageItem
        title="Lulo Finance"
        status="default"
        statusText="Portfolio Overview"
        icon={<Image source={require('@/assets/images/lulo.png')} style={$iconStyle} />}
        footer={footer}
      >
        <View style={$loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </BaseStatusMessageItem>
    );
  }

  return (
    <BaseStatusMessageItem
      title="Lulo Finance"
      status="default"
      statusText="Portfolio Overview"
      icon={<Image source={require('@/assets/images/lulo.png')} style={$iconStyle} />}
      footer={footer}
    >
      {/* Stats Section */}
      <View style={$statsContainer}>
        <View style={themed($statCardStyle)}>
          <Text preset="small" style={themed($statLabelStyle)}>
            Deposit Value
          </Text>
          <Text preset="heading" style={themed($statValueStyle)}>
            ${props.depositValue.toFixed(2)}
          </Text>
        </View>

        <View style={themed($statCardStyle)}>
          <Text preset="small" style={themed($statLabelStyle)}>
            Interest Earned
          </Text>
          <Text preset="heading" style={[themed($statValueStyle), $positiveValueStyle]}>
            +${props.interestEarned.toFixed(2)}
          </Text>
        </View>

        <View style={themed($statCardStyle)}>
          <Text preset="small" style={themed($statLabelStyle)}>
            Total Value
          </Text>
          <Text preset="heading" style={themed($statValueStyle)}>
            ${props.totalValue.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Token Balances */}
      <View style={$tokenBalancesSection}>
        <Text preset="heading" style={themed($sectionTitleStyle)}>
          Token Balances
        </Text>

        <FlatList
          data={props.tokenBalance}
          keyExtractor={item => item.mint}
          numColumns={1}
          scrollEnabled={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                themed($tokenCardStyle),
                activeIndex === index && themed($activeTokenCardStyle),
              ]}
              onPress={() => openDexScreener(item.mint)}
              activeOpacity={0.7}
            >
              <View style={$tokenCardContentRow}>
                <View style={$tokenIconContainer}>
                  <Image
                    source={{
                      uri: `https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${item.mint}/logo.png`,
                    }}
                    style={$tokenIconStyle}
                    defaultSource={require('@/assets/images/placeholder.png')}
                  />
                  {activeIndex === index && (
                    <Animated.View
                      style={[
                        $pulseRingStyle,
                        {
                          opacity: pulseAnim,
                          transform: [
                            {
                              scale: pulseAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 1.2],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                  )}
                </View>

                <View style={$tokenInfoContainer}>
                  <Text preset="bold" style={themed($tokenBalanceStyle)}>
                    {item.balance.toFixed(2)}
                  </Text>
                  <Text style={themed($tokenMintStyle)}>
                    {item.mint.substring(0, 4)}...{item.mint.slice(-4)}
                  </Text>
                </View>
              </View>

              <View style={$tokenCardBottomRow}>
                <Text style={themed($usdValueStyle)}>${item.usdValue.toFixed(2)}</Text>
                <Ionicons
                  name="open-outline"
                  size={16}
                  color={theme.colors.primary}
                  style={{ opacity: activeIndex === index ? 1 : 0.5 }}
                />
              </View>

              {activeIndex === index && <View style={themed($highlightLineStyle)} />}
            </TouchableOpacity>
          )}
        />
      </View>
    </BaseStatusMessageItem>
  );
};

// Styles
const $loadingContainer: ViewStyle = {
  padding: 40,
  justifyContent: 'center',
  alignItems: 'center',
};

const $iconStyle: ImageStyle = {
  width: 40,
  height: 40,
  borderRadius: 8,
};

const $footerContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const $smallTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 12,
  color: theme.colors.textDim,
});

const $learnMoreButton: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
};

const $linkTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 14,
  color: theme.colors.primary,
});

const $statsContainer: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 16,
  gap: 8,
};

const $statCardStyle: ThemedStyle<ViewStyle> = theme => ({
  flex: 1,
  backgroundColor: theme.colors.secondaryBg,
  borderRadius: 12,
  padding: 12,
  // shadowColor: theme.colors.shadow,
  // shadowOffset: { width: 0, height: 2 },
  // shadowOpacity: 0.1,
  // shadowRadius: 4,
  // elevation: 1,
});

const $statLabelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  marginBottom: 4,
});

const $statValueStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 20,
  color: theme.colors.text,
});

const $positiveValueStyle: TextStyle = {
  color: '#22c55e', // green-500
};

const $tokenBalancesSection: ViewStyle = {
  marginTop: 20,
};

const $sectionTitleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 16,
  marginBottom: 12,
});

const $tokenCardStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  borderRadius: 12,
  padding: 16,
  marginBottom: 8,
  position: 'relative',
  overflow: 'hidden',
});

const $activeTokenCardStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: `${theme.colors.primary}10`,
  borderWidth: 2,
  borderColor: theme.colors.primary,
});

const $tokenCardContentRow: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
};

const $tokenIconContainer: ViewStyle = {
  position: 'relative',
};

const $tokenIconStyle: ImageStyle = {
  width: 40,
  height: 40,
  borderRadius: 20,
};

const $pulseRingStyle: ViewStyle = {
  position: 'absolute',
  top: -4,
  left: -4,
  right: -4,
  bottom: -4,
  borderRadius: 24,
  backgroundColor: 'rgba(59, 130, 246, 0.2)', // primary color with opacity
};

const $tokenInfoContainer: ViewStyle = {
  flex: 1,
};

const $tokenBalanceStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 16,
  color: theme.colors.text,
});

const $tokenMintStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 12,
  color: theme.colors.textDim,
  marginTop: 2,
});

const $tokenCardBottomRow: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 8,
};

const $usdValueStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 14,
  color: theme.colors.textDim,
  fontWeight: '500',
});

const $highlightLineStyle: ThemedStyle<ViewStyle> = theme => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 2,
  backgroundColor: theme.colors.primary,
});
