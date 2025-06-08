import { FC, useState, useEffect } from 'react';
import { View, ViewStyle, TextStyle, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { BaseStatusMessageItem } from './base/BaseStatusMessageItem';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';

interface BugReportProps {
  props: {
    url: string;
    title: string;
    description: string;
    stepsToReproduce: string;
    expectedBehavior: string;
    actualBehavior: string;
    browser?: string;
    device?: string;
    additionalInfo?: string;
  };
}

export const BugReportMessageItem: FC<BugReportProps> = ({ props }) => {
  const { themed, theme } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (props) {
      const timer = setTimeout(() => setLoading(false), 600);
      return () => clearTimeout(timer);
    }
  }, [props]);

  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  // Open GitHub issue creation URL
  const openGitHubIssue = () => {
    Linking.openURL(props.url);
  };

  const footer = (
    <View style={$footerContainer}>
      <Text preset="small" style={themed($smallTextStyle)}>
        Bug Report Card
      </Text>
      <TouchableOpacity style={$gitHubLinkButton} onPress={openGitHubIssue}>
        <Text style={themed($linkTextStyle)}>Create Issue</Text>
        <Ionicons name="logo-github" size={14} color={theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <BaseStatusMessageItem
        title="Bug Report"
        status="error"
        statusText="GitHub Issue"
        icon={<Ionicons name="bug" size={20} color={theme.colors.error} />}
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
      title="Bug Report"
      status="error"
      statusText="GitHub Issue"
      icon={<Ionicons name="bug" size={20} color={theme.colors.error} />}
      footer={footer}
    >
      <ScrollView style={$contentContainer} showsVerticalScrollIndicator={false}>
        {/* Issue Title */}
        <View style={themed($sectionContainer)}>
          <Text preset="small" style={themed($sectionLabelStyle)}>
            Issue Title
          </Text>
          <Text preset="pageHeading" style={themed($titleStyle)}>
            {props.title}
          </Text>
        </View>

        {/* Description */}
        <View style={themed($sectionContainer)}>
          <Text preset="small" style={themed($sectionLabelStyle)}>
            Description
          </Text>
          <Text style={themed($descriptionStyle)}>
            {expanded
              ? props.description
              : props.description.substring(0, 150) + (props.description.length > 150 ? '...' : '')}
          </Text>

          {props.description.length > 150 && (
            <TouchableOpacity onPress={handleExpandToggle} style={$readMoreButton}>
              <Text style={themed($readMoreTextStyle)}>{expanded ? 'Show less' : 'Read more'}</Text>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Steps to Reproduce */}
        <View style={themed($sectionContainer)}>
          <Text preset="small" style={themed($sectionLabelStyle)}>
            Steps to Reproduce
          </Text>
          <Text style={themed($contentTextStyle)}>{props.stepsToReproduce}</Text>
        </View>

        {/* Expected vs Actual */}
        <View style={$rowContainer}>
          <View style={[themed($sectionContainer), $halfWidthContainer]}>
            <Text preset="small" style={themed($sectionLabelStyle)}>
              Expected Behavior
            </Text>
            <Text style={themed($contentTextStyle)}>{props.expectedBehavior}</Text>
          </View>

          <View style={[themed($sectionContainer), $halfWidthContainer]}>
            <Text preset="small" style={themed($sectionLabelStyle)}>
              Actual Behavior
            </Text>
            <Text style={themed($contentTextStyle)}>{props.actualBehavior}</Text>
          </View>
        </View>

        {/* Browser and Device Info */}
        {(props.browser || props.device) && (
          <View style={$rowContainer}>
            {props.browser && (
              <View style={[themed($sectionContainer), $halfWidthContainer]}>
                <Text preset="small" style={themed($sectionLabelStyle)}>
                  Browser
                </Text>
                <Text style={themed($contentTextStyle)}>{props.browser}</Text>
              </View>
            )}

            {props.device && (
              <View style={[themed($sectionContainer), $halfWidthContainer]}>
                <Text preset="small" style={themed($sectionLabelStyle)}>
                  Device
                </Text>
                <Text style={themed($contentTextStyle)}>{props.device}</Text>
              </View>
            )}
          </View>
        )}

        {/* Additional Info */}
        {props.additionalInfo && (
          <View style={themed($additionalInfoContainer)}>
            <Text preset="small" style={themed($sectionLabelStyle)}>
              Additional Information
            </Text>
            <Text style={[themed($contentTextStyle), $italicTextStyle]}>
              {props.additionalInfo}
            </Text>
          </View>
        )}

        {/* Action Button */}
        <View style={$actionButtonContainer}>
          <TouchableOpacity style={themed($reportBugButton)} onPress={openGitHubIssue}>
            <Ionicons name="bug" size={20} color={theme.colors.text} />
            <Text style={themed($buttonTextStyle)}>Report Bug</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </BaseStatusMessageItem>
  );
};

// Styles
const $loadingContainer: ViewStyle = {
  padding: 40,
  justifyContent: 'center',
  alignItems: 'center',
};

const $contentContainer: ViewStyle = {
  flex: 1,
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

const $gitHubLinkButton: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
};

const $linkTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 14,
  color: theme.colors.primary,
});

const $sectionContainer: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
});

const $sectionLabelStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  marginBottom: 8,
});

const $titleStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 20,
  color: theme.colors.text,
});

const $descriptionStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 16,
  color: theme.colors.text,
  lineHeight: 22,
});

const $contentTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 14,
  color: theme.colors.text,
  lineHeight: 20,
});

const $readMoreButton: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 8,
  alignSelf: 'flex-start',
};

const $readMoreTextStyle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 14,
  color: theme.colors.primary,
  marginRight: 4,
});

const $rowContainer: ViewStyle = {
  flexDirection: 'row',
  gap: 12,
  marginBottom: 8,
};

const $halfWidthContainer: ViewStyle = {
  flex: 1,
};

const $additionalInfoContainer: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
  borderLeftWidth: 4,
  borderLeftColor: theme.colors.error,
});

const $italicTextStyle: TextStyle = {
  fontStyle: 'italic',
};

const $actionButtonContainer: ViewStyle = {
  marginTop: 8,
  marginBottom: 16,
};

const $reportBugButton: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.primary,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 12,
  gap: 8,
});

const $buttonTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 16,
  fontWeight: 'bold',
});
