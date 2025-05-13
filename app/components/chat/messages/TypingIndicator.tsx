import { FC, useEffect, useRef } from 'react';
import { View, ViewStyle, Animated } from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';

interface TypingIndicatorProps {
  isVisible: boolean;
}

export const TypingIndicator: FC<TypingIndicatorProps> = ({ isVisible }) => {
  const { themed, theme } = useAppTheme();
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  // Pre-compute themed styles
  const themedDotStyle = themed($dotStyle);

  useEffect(() => {
    if (isVisible) {
      // Create a staggered animation for the dots
      const createDotAnimation = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
      };

      const animation1 = createDotAnimation(dot1Anim, 0);
      const animation2 = createDotAnimation(dot2Anim, 200);
      const animation3 = createDotAnimation(dot3Anim, 400);

      animation1.start();
      animation2.start();
      animation3.start();

      return () => {
        animation1.stop();
        animation2.stop();
        animation3.stop();
      };
    }
  }, [isVisible, dot1Anim, dot2Anim, dot3Anim]);

  if (!isVisible) return null;

  return (
    <View style={[$containerStyle, themed($messageStyle)]}>
      <View style={$dotsContainer}>
        <Animated.View
          style={[
            themedDotStyle,
            {
              opacity: dot1Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  scale: dot1Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            themedDotStyle,
            {
              opacity: dot2Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  scale: dot2Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            themedDotStyle,
            {
              opacity: dot3Anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  scale: dot3Anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </View>
  );
};

const $containerStyle: ViewStyle = {
  marginBottom: 8,
  alignSelf: 'flex-start',
};

const $messageStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  borderRadius: 16,
  padding: 12,
  maxWidth: '80%',
});

const $dotsContainer: ViewStyle = {
  flexDirection: 'row',
  gap: 4,
  alignItems: 'center',
};

const $dotStyle: ThemedStyle<ViewStyle> = theme => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.colors.primary,
}); 