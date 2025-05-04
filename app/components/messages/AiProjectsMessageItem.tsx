import { FC, useState, useEffect } from 'react';
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
import { BaseGridMessageItem } from './base/BaseGridMessageItem';
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

export const AiProjectsMessageItem: FC<AiProjectsMessageItemProps> = ({ props }) => {
  const { themed, theme } = useAppTheme();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (props.projects && props.projects.length > 0) {
      setLoading(false);
    }
  }, [props.projects]);

  // Open Twitter
  const openTwitterLink = (twitterUrl: string) => {
    Linking.openURL(twitterUrl);
  };

  // Open project details (this would need to be customized for mobile workflow)
  const openProjectDetails = (contractAddress: string) => {
    // In a real app, this would navigate to a project details screen
    // For now, we'll just open the contract address in a blockchain explorer
    Linking.openURL(`https://etherscan.io/address/${contractAddress}`);
  };

  const footer = (
    <View>
      <Text preset="small" style={themed($footerTextStyle)}>
        Click on any project to view detailed analytics. Projects are ranked by mindshare in the AI
        ecosystem.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <BaseBorderedMessageItem title="AI Projects" subtitle={props.category} footer={footer}>
        <View style={$loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </BaseBorderedMessageItem>
    );
  }

  return (
    <BaseBorderedMessageItem title="AI Projects" subtitle={props.category} footer={footer}>
      <BaseGridMessageItem col={2}>
        {props.projects.slice(0, 6).map((token, index) => (
          <TouchableOpacity
            key={index}
            style={themed($projectCardStyle)}
            activeOpacity={0.7}
            onPress={() => openProjectDetails(token.contractAddress)}
          >
            <View style={$cardContentContainer}>
              <Image source={{ uri: token.image }} style={$projectImageStyle} resizeMode="cover" />
              <View style={$projectInfoContainer}>
                <Text preset="bold" style={themed($projectNameStyle)}>
                  {token.name}
                </Text>
                <Text style={themed($symbolStyle)}>${token.symbol}</Text>
                <Text style={themed($mindshareStyle)}>
                  Mindshare: {Number(token.mindShare).toFixed(3)}
                </Text>
              </View>
            </View>

            <View style={$socialContainer}>
              <Text style={themed($socialTextStyle)}>Follow:</Text>
              <TouchableOpacity
                onPress={() => openTwitterLink(token.twitter)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="logo-twitter" size={16} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </BaseGridMessageItem>
    </BaseBorderedMessageItem>
  );
};

// Styles
const $loadingContainer: ViewStyle = {
  padding: 40,
  justifyContent: 'center',
  alignItems: 'center',
};

const $projectCardStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  borderRadius: 12,
  padding: 12,
  // shadowColor: theme.colors.shadow,
  // shadowOffset: { width: 0, height: 2 },
  // shadowOpacity: 0.1,
  // shadowRadius: 4,
  // elevation: 2,
  marginBottom: 8,
});

const $cardContentContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
};

const $projectImageStyle: ImageStyle = {
  width: 64,
  height: 64,
  borderRadius: 8,
};

const $projectInfoContainer: ViewStyle = {
  flex: 1,
};

const $projectNameStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 16,
  color: theme.colors.text,
  marginBottom: 2,
});

const $symbolStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 14,
  color: theme.colors.textDim,
  fontWeight: '500',
  marginBottom: 2,
});

const $mindshareStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 14,
  color: theme.colors.text,
});

const $socialContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  marginTop: 8,
  paddingTop: 8,
  borderTopWidth: 1,
  borderTopColor: '#33333320',
};

const $socialTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 12,
  color: theme.colors.textDim,
});

const $footerTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 12,
});
