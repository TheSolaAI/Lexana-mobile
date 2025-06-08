import { FC, useState, useEffect, memo } from 'react';
import {
  View,
  ViewStyle,
  TextStyle,
  Image,
  ImageStyle,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseBorderedMessageItem } from './base/BaseBorderedMessageItem';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';

interface GoatIndexTokenData {
  contractAddress: string;
  name: string;
  symbol: string;
  mindShare: number;
  image: string;
  twitter: string;
}

interface AiProjectsMessageItemProps {
  props: {
    category: string;
    projects: GoatIndexTokenData[];
  };
}

/**
 * Component that displays AI projects in a grid layout with ranking and mindshare information
 * @param props - Contains category and projects data
 * @returns Rendered AI projects message item component
 */
export const AiProjectsMessageItem: FC<AiProjectsMessageItemProps> = memo(({ props }) => {
  const { themed, theme } = useAppTheme();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (props.projects && props.projects.length > 0) {
      setLoading(false);
    }
  }, [props.projects]);

  /**
   * Opens the provided Twitter URL in the default browser
   * @param twitterUrl - The Twitter profile URL to open
   */
  const openTwitterLink = (twitterUrl: string) => {
    Linking.openURL(twitterUrl);
  };

  /**
   * Opens project details by navigating to the contract address on Etherscan
   * @param contractAddress - The smart contract address of the project
   */
  const openProjectDetails = (contractAddress: string) => {
    // In a real app, this would navigate to a project details screen
    // For now, we'll just open the contract address in a blockchain explorer
    Linking.openURL(`https://solscan.io/token/${contractAddress}`);
  };

  /**
   * Returns the appropriate ranking badge style based on position
   * @param index - The position/rank of the project (0-based)
   * @returns Style object for the ranking badge
   */
  const getRankingBadgeStyle = (index: number): ThemedStyle<ViewStyle> => {
    if (index === 0) return $goldBadgeStyle;
    if (index === 1) return $silverBadgeStyle;
    if (index === 2) return $bronzeBadgeStyle;
    return $defaultBadgeStyle;
  };

  /**
   * Returns the appropriate ranking badge color based on position
   * @param index - The position/rank of the project (0-based)
   * @returns Color string for the ranking badge text
   */
  const getRankingBadgeColor = (index: number): string => {
    if (index === 0) return '#FFD700';
    if (index === 1) return '#C0C0C0';
    if (index === 2) return '#CD7F32';
    return theme.colors.primary;
  };

  const footer = (
    <View style={$footerContainer}>
      <View style={$footerIconContainer}>
        <Ionicons name="information-circle-outline" size={16} color={theme.colors.textDim} />
      </View>
      <Text preset="small" style={themed($footerTextStyle)}>
        Tap any project for detailed analytics. Rankings based on AI ecosystem mindshare.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <BaseBorderedMessageItem title="🤖 AI Projects" subtitle={props.category} footer={footer}>
        <View style={$loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text preset="small" style={themed($loadingTextStyle)}>
            Loading AI projects...
          </Text>
        </View>
      </BaseBorderedMessageItem>
    );
  }

  return (
    <BaseBorderedMessageItem title="🤖 AI Projects" subtitle={`${props.category} • Top ${props.projects.length}`} footer={footer}>
      <View style={$projectsContainer}>
        {props.projects.slice(0, 6).map((token, index) => (
          <TouchableOpacity
            key={`${token.contractAddress}-${index}`}
            style={themed($projectCardStyle)}
            activeOpacity={0.8}
            onPress={() => openProjectDetails(token.contractAddress)}
          >
            {/* Ranking Badge */}
            <View style={[themed(getRankingBadgeStyle(index)), $rankingBadge]}>
              <Text style={[themed($rankingTextStyle), { color: getRankingBadgeColor(index) }]}>
                #{index + 1}
              </Text>
            </View>

            {/* Project Image with Border */}
            <View style={$imageContainer}>
              <Image source={{ uri: token.image }} style={$projectImageStyle} resizeMode="cover" />
              <View style={themed($imageBorderStyle)} />
            </View>

            {/* Project Info */}
            <View style={$projectInfoContainer}>
              <Text preset="bold" style={themed($projectNameStyle)} numberOfLines={1}>
                {token.name}
              </Text>
              <Text style={themed($symbolStyle)} numberOfLines={1}>
                ${token.symbol}
              </Text>
              
              {/* Mindshare Display */}
              <View style={$mindshareContainer}>
                <View style={themed($mindshareBarBackground)}>
                  <View 
                    style={[
                      themed($mindshareBarFill), 
                      { width: `${Math.min(token.mindShare * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <Text style={themed($mindshareValueStyle)}>
                  {(token.mindShare * 100).toFixed(1)}%
                </Text>
              </View>
            </View>

            {/* Social Action */}
            <TouchableOpacity
              style={themed($socialButtonStyle)}
              onPress={(e) => {
                e.stopPropagation();
                openTwitterLink(token.twitter);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="logo-twitter" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </BaseBorderedMessageItem>
  );
});

// Container Styles
const $loadingContainer: ViewStyle = {
  padding: 32,
  justifyContent: 'center',
  alignItems: 'center',
  gap: 12,
};

const $projectsContainer: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12,
  padding: 4,
};

const $footerContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'flex-start',
  gap: 8,
  paddingTop: 4,
};

const $footerIconContainer: ViewStyle = {
  paddingTop: 2,
};

// Card Styles
const $projectCardStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  borderRadius: 16,
  padding: 16,
  width: '48%',
  minHeight: 180,
  shadowColor: theme.colors.text,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
  borderWidth: 1,
  borderColor: theme.colors.border + '20',
  position: 'relative',
});

// Ranking Badge Styles
const $rankingBadge: ViewStyle = {
  position: 'absolute',
  top: 12,
  right: 12,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
  zIndex: 1,
};

const $goldBadgeStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: '#FFD70020',
  borderWidth: 1,
  borderColor: '#FFD700',
});

const $silverBadgeStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: '#C0C0C020',
  borderWidth: 1,
  borderColor: '#C0C0C0',
});

const $bronzeBadgeStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: '#CD7F3220',
  borderWidth: 1,
  borderColor: '#CD7F32',
});

const $defaultBadgeStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.primary + '20',
  borderWidth: 1,
  borderColor: theme.colors.primary,
});

// Image Styles
const $imageContainer: ViewStyle = {
  alignItems: 'center',
  marginBottom: 12,
  position: 'relative',
};

const $projectImageStyle: ImageStyle = {
  width: 56,
  height: 56,
  borderRadius: 28,
};

const $imageBorderStyle: ThemedStyle<ViewStyle> = theme => ({
  position: 'absolute',
  width: 60,
  height: 60,
  borderRadius: 30,
  borderWidth: 2,
  borderColor: theme.colors.primary + '30',
});

// Text Styles
const $projectInfoContainer: ViewStyle = {
  flex: 1,
  gap: 6,
};

const $projectNameStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 16,
  color: theme.colors.text,
  textAlign: 'center',
  lineHeight: 20,
});

const $symbolStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 14,
  color: theme.colors.textDim,
  fontWeight: '600',
  textAlign: 'center',
  letterSpacing: 0.5,
});

const $rankingTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 12,
  fontWeight: 'bold',
});

const $loadingTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  marginTop: 8,
});

// Mindshare Styles
const $mindshareContainer: ViewStyle = {
  gap: 4,
  marginTop: 4,
};

const $mindshareBarBackground: ThemedStyle<ViewStyle> = theme => ({
  height: 6,
  backgroundColor: theme.colors.border,
  borderRadius: 3,
  overflow: 'hidden',
});

const $mindshareBarFill: ThemedStyle<ViewStyle> = theme => ({
  height: '100%',
  backgroundColor: theme.colors.primary,
  borderRadius: 3,
});

const $mindshareValueStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 12,
  color: theme.colors.primary,
  fontWeight: '600',
  textAlign: 'center',
});

// Social Styles
const $socialButtonStyle: ThemedStyle<ViewStyle> = theme => ({
  position: 'absolute',
  bottom: 12,
  right: 12,
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: theme.colors.primary + '15',
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: theme.colors.primary + '30',
});

const $footerTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 12,
  lineHeight: 16,
  flex: 1,
});
