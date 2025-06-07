import { FC, useEffect } from 'react';
import { View, ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { ThemedStyle } from '@/theme';
import { useAppTheme } from '@/utils/useAppTheme';
import { Text } from '@/components/general';
import { translate } from '@/i18n';

interface LoadingBubbleProps {
  /**
   * The processing stage to display appropriate message
   */
  stage: 'convertingAudio' | 'analyzingMessage' | 'thinking';
}

/**
 * LoadingBubble component that displays an animated loading indicator with three dots
 * and appropriate processing message based on the current stage
 * @param stage - The current processing stage
 */
export const LoadingBubble: FC<LoadingBubbleProps> = ({ stage }) => {
  const { themed, theme } = useAppTheme();
  
  // Animation values for the three dots
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    // Create a bouncing animation for each dot with different delays
    const animationConfig = {
      duration: 600,
    };

    dot1.value = withRepeat(
      withSequence(
        withTiming(1, animationConfig),
        withTiming(0, animationConfig)
      ),
      -1,
      false
    );

    dot2.value = withRepeat(
      withSequence(
        withDelay(200, withTiming(1, animationConfig)),
        withDelay(200, withTiming(0, animationConfig))
      ),
      -1,
      false
    );

    dot3.value = withRepeat(
      withSequence(
        withDelay(400, withTiming(1, animationConfig)),
        withDelay(400, withTiming(0, animationConfig))
      ),
      -1,
      false
    );
  }, []);

  // Animated styles for each dot
  const dot1Style = useAnimatedStyle(() => ({
    opacity: 0.3 + 0.7 * dot1.value,
    transform: [{ scale: 0.8 + 0.4 * dot1.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: 0.3 + 0.7 * dot2.value,
    transform: [{ scale: 0.8 + 0.4 * dot2.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: 0.3 + 0.7 * dot3.value,
    transform: [{ scale: 0.8 + 0.4 * dot3.value }],
  }));

  // Get appropriate message based on stage
  const getMessage = () => {
    switch (stage) {
      case 'convertingAudio':
        return translate('chatScreen:processing.convertingAudio');
      case 'analyzingMessage':
        return translate('chatScreen:processing.analyzingMessage');
      case 'thinking':
        return translate('chatScreen:processing.thinking');
      default:
        return translate('chatScreen:processing.thinking');
    }
  };

  return (
    <View style={themed($containerStyle)}>
      <View style={themed($bubbleStyle)}>
        <View style={$dotsContainer}>
          <Animated.View style={[themed($dotStyle), dot1Style]} />
          <Animated.View style={[themed($dotStyle), dot2Style]} />
          <Animated.View style={[themed($dotStyle), dot3Style]} />
        </View>
        <Text style={themed($messageStyle)}>{getMessage()}</Text>
      </View>
    </View>
  );
};

const $containerStyle: ThemedStyle<ViewStyle> = () => ({
  paddingHorizontal: 2,
  paddingVertical: 8,
  alignItems: 'flex-start',
});

const $bubbleStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.surface,
  borderRadius: 18,
  paddingHorizontal: 16,
  paddingVertical: 12,
  maxWidth: '85%',
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: theme.colors.border,
});

const $dotsContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginRight: 12,
};

const $dotStyle: ThemedStyle<ViewStyle> = theme => ({
  width: 4,
  height: 4,
  borderRadius: 4,
  backgroundColor: theme.colors.primary,
  marginHorizontal: 2,
});

const $messageStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 8,
  fontFamily: 'medium',
}); 