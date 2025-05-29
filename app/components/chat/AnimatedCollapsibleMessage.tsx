import { FC, useState, useEffect, useRef } from 'react';
import {
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { UIMessage } from '@ai-sdk/ui-utils';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { Text } from '@/components/general';
import { SimpleMessageItem } from './messages/SimpleMessageItem';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
// import LottieView from 'lottie-react-native'; // Uncomment if you have Lottie installed

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface AnimatedCollapsibleMessageProps {
  message: UIMessage | null;
  isAssistantSpeakingGlobal: boolean; // To show pill even before message object is ready
}

const AnimatedCollapsibleMessage: FC<AnimatedCollapsibleMessageProps> = ({
  message,
  isAssistantSpeakingGlobal,
}) => {
  const { themed, theme } = useAppTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [internalMessage, setInternalMessage] = useState<UIMessage | null>(message);
  const prevMessageId = useRef<string | null>(message?.id || null);

  const animOpacity = useSharedValue(0);

  useEffect(() => {
    if (message?.id !== prevMessageId.current && isExpanded) {
      // New message arrived while old one was expanded, collapse to show new pill
      setIsExpanded(false);
    }
    setInternalMessage(message);
    prevMessageId.current = message?.id || null;
  }, [message, isExpanded]);

  useEffect(() => {
    const shouldBeVisible = internalMessage || (isAssistantSpeakingGlobal && !internalMessage);
    animOpacity.value = withTiming(shouldBeVisible ? 1 : 0, { duration: 200 });

    // LayoutAnimation handles height changes when isExpanded or internalMessage changes causing content shifts.
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [internalMessage, isExpanded, isAssistantSpeakingGlobal, animOpacity]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: animOpacity.value,
    };
  });

  const toggleExpand = () => {
    if (internalMessage) {
      // Only allow expanding if there is a message to show
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExpanded(!isExpanded);
    }
  };

  const showPill =
    !isExpanded && (internalMessage || (isAssistantSpeakingGlobal && !internalMessage));
  const showExpandedContent = isExpanded && internalMessage;

  if (!showPill && !showExpandedContent && !isAssistantSpeakingGlobal) {
    const shouldBeVisible = internalMessage || (isAssistantSpeakingGlobal && !internalMessage);
    if (!shouldBeVisible) return null;
  }

  // Collapsed pill view
  if (showPill && !isExpanded) {
    return (
      <Animated.View style={[themed($messageWrapperStyle), animatedContainerStyle]}>
        <TouchableOpacity
          style={themed($messageContainerStyle)}
          onPress={toggleExpand}
          activeOpacity={0.8}
          disabled={!internalMessage}
        >
          {/* Header */}
          <View style={themed($headerStyle)}>
            <View style={$titleContainer}>
              <View style={themed($avatarStyle)}>
                <Text style={{ fontSize: 14, color: theme.colors.textDim }}>🎤</Text>
              </View>
              <Text preset="pageHeading" style={themed($titleStyle)}>
                Lexana
              </Text>
            </View>
            <View style={themed($subtitleContainerStyle)}>
              <Text preset="small" style={themed($subtitleStyle)}>
                {internalMessage ? 'Response' : 'Speaking...'}
              </Text>
            </View>
          </View>

          {/* Content Preview */}
          <View style={$contentStyle}>
            <Text style={themed($previewTextStyle)} numberOfLines={2}>
              {internalMessage
                ? internalMessage.content.substring(0, 100) +
                  (internalMessage.content.length > 100 ? '...' : '')
                : 'Lexana is generating a response...'}
            </Text>
          </View>

          {/* Footer */}
          <View style={themed($footerStyle)}>
            <View style={$actionButton}>
              <Text style={themed($actionTextStyle)}>
                {internalMessage ? 'Tap to expand' : 'Processing...'}
              </Text>
              <Ionicons
                name={
                  internalMessage ? 'chevron-expand-outline' : 'ellipsis-horizontal-circle-outline'
                }
                size={16}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Expanded view
  if (showExpandedContent && internalMessage) {
    return (
      <Animated.View style={[themed($messageWrapperStyle), animatedContainerStyle]}>
        <View style={themed($messageContainerStyle)}>
          {/* Header */}
          <TouchableOpacity onPress={toggleExpand} style={themed($headerStyle)} activeOpacity={0.8}>
            <View style={$titleContainer}>
              <View style={themed($avatarStyle)}>
                <Text style={{ fontSize: 14, color: theme.colors.textDim }}>🎤</Text>
              </View>
              <Text preset="pageHeading" style={themed($titleStyle)}>
                Lexana
              </Text>
            </View>
            <View style={themed($subtitleContainerStyle)}>
              <Text preset="small" style={themed($subtitleStyle)}>
                Response
              </Text>
            </View>
          </TouchableOpacity>

          {/* Content */}
          <View style={$contentStyle}>
            <SimpleMessageItem text={internalMessage.content} />
          </View>

          {/* Footer */}
          <View style={themed($footerStyle)}>
            <View style={$actionButton}>
              <Text style={themed($actionTextStyle)}>Tap to collapse</Text>
              <Ionicons name="chevron-collapse-outline" size={16} color={theme.colors.primary} />
            </View>
          </View>
        </View>
      </Animated.View>
    );
  }

  return null;
};

// Styles matching the Token Message design
const $messageWrapperStyle: ThemedStyle<ViewStyle> = _theme => ({
  marginVertical: 4,
  width: '100%',
  maxWidth: 500,
  alignSelf: 'center',
});

const $messageContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  borderRadius: 16,
  backgroundColor: theme.colors.secondaryBg,
  borderWidth: 1,
  borderColor: theme.colors.border,
  elevation: 2,
  overflow: 'hidden',
  shadowColor: theme.colors.text,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
});

const $headerStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
  backgroundColor: `${theme.colors.primary}10`,
});

const $titleContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

const $avatarStyle: ThemedStyle<ViewStyle> = theme => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: theme.colors.surface,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: theme.colors.border,
});

const $titleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 18,
});

const $subtitleContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: `${theme.colors.surface}50`,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 4,
});

const $subtitleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 12,
});

const $contentStyle: ViewStyle = {
  padding: 16,
};

const $previewTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 14,
  lineHeight: 20,
});

const $footerStyle: ThemedStyle<ViewStyle> = theme => ({
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
  backgroundColor: `${theme.colors.surface}20`,
});

const $actionButton: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
};

const $actionTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.primary,
  fontSize: 13,
});

export default AnimatedCollapsibleMessage;
