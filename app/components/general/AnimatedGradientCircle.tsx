import { FC, useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import { Canvas, Circle, SweepGradient, vec, Group, BlurMask } from '@shopify/react-native-skia';
import { useWindowDimensions } from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import {
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useDerivedValue,
  interpolate,
} from 'react-native-reanimated';

/**
 * Type of speaker, which influences the gradient colors and animation
 */
export type SpeakerType = 'none' | 'user' | 'assistant';

/**
 * Props for the AnimatedGradientCircle component
 */
interface AnimatedGradientCircleProps {
  /**
   * Size of the circle as a fraction of the screen width (0-1)
   * @default 0.5
   */
  size?: number;

  /**
   * Who is currently speaking, affecting colors and animation
   * @default 'none'
   */
  speaker: SpeakerType;

  /**
   * Custom style for the container
   */
  style?: ViewStyle;

  /**
   * Intensity of the animation (0-1)
   * @default 0.5
   */
  intensity?: number;
}

/**
 * A beautiful animated gradient circle that responds to speaking state
 */
export const AnimatedGradientCircle: FC<AnimatedGradientCircleProps> = ({
  size = 0.5,
  speaker = 'none',
  style,
  intensity = 1,
}) => {
  const { width, height } = useWindowDimensions();
  const { theme } = useAppTheme();

  // Calculate fixed canvas dimensions
  const canvasSize = Math.min(width, height);

  // Center coordinates for the canvas
  const center = vec(canvasSize / 2, canvasSize / 2);

  // Circle radius based on canvas size
  const baseRadius = (canvasSize * size) / 2;

  // Animation values using Reanimated
  const rotationProgress = useSharedValue(0);
  const secondaryRotationProgress = useSharedValue(0);
  const pulseProgress = useSharedValue(0);

  // Color configurations for different speaker states
  const colorConfigs = {
    none: {
      colors: [
        theme.colors.background,
        theme.colors.primary + '60',
        theme.colors.background,
        theme.colors.secondaryBg + '80',
      ],
      rotationSpeed: 3000,
      pulseSpeed: 4000,
      pulseAmount: 0.1,
    },
    user: {
      colors: [
        theme.colors.primary + '90',
        theme.colors.secondaryBg + '60',
        theme.colors.primary + '40',
        theme.colors.primary + '80',
      ],
      rotationSpeed: 1500,
      pulseSpeed: 2000,
      pulseAmount: 0.15,
    },
    assistant: {
      colors: [
        theme.colors.primary + '80',
        theme.colors.textDim + '50',
        theme.colors.primary + '60',
        theme.colors.background + '90',
      ],
      rotationSpeed: 2000,
      pulseSpeed: 3000,
      pulseAmount: 0.12,
    },
  };

  // Select current color config based on speaker
  const currentConfig = colorConfigs[speaker];

  // Update animation parameters when speaker changes
  useEffect(() => {
    // Reset animations
    rotationProgress.value = 0;
    secondaryRotationProgress.value = 0;
    pulseProgress.value = 0;

    // Start primary rotation animation
    rotationProgress.value = withRepeat(
      withTiming(1, {
        duration: currentConfig.rotationSpeed / intensity,
        easing: Easing.linear,
      }),
      -1, // Infinite repeats
      false // Don't reverse
    );

    // Start secondary rotation (opposite direction, different speed)
    secondaryRotationProgress.value = withRepeat(
      withTiming(1, {
        duration: (currentConfig.rotationSpeed * 1.5) / intensity,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    // Start pulse animation
    pulseProgress.value = withRepeat(
      withTiming(1, {
        duration: currentConfig.pulseSpeed / intensity,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true // Reverse to create pulsing effect
    );
  }, [speaker, intensity, currentConfig]);

  // Create the animated Skia elements using useDerivedValue
  const animatedElements = useDerivedValue(() => {
    // Calculate rotation values
    const rotation = interpolate(rotationProgress.value, [0, 1], [0, 2 * Math.PI]);
    const secondaryRotation = interpolate(
      secondaryRotationProgress.value,
      [0, 1],
      [0, -2 * Math.PI]
    );

    // Calculate radius with pulse effect
    const pulseMultiplier = interpolate(
      pulseProgress.value,
      [0, 1],
      [1, 1 + currentConfig.pulseAmount * intensity]
    );
    const animatedRadius = baseRadius * pulseMultiplier;
    const secondaryRadius = animatedRadius * 0.8;

    return {
      rotation,
      secondaryRotation,
      animatedRadius,
      secondaryRadius,
    };
  });

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <Canvas style={{ height: canvasSize, width: canvasSize }}>
        <Group blendMode="screen">
          {/* Primary gradient circle */}
          <Group origin={center} transform={[{ rotate: animatedElements.value.rotation }]}>
            <Circle cx={center.x} cy={center.y} r={animatedElements.value.animatedRadius}>
              <SweepGradient
                c={center}
                colors={currentConfig.colors}
                positions={[0, 0.25, 0.5, 0.75, 1]}
              />
              <BlurMask blur={15 + 5 * intensity} style="normal" />
            </Circle>
          </Group>

          {/* Secondary gradient circle for added complexity */}
          <Group
            origin={center}
            transform={[{ rotate: animatedElements.value.secondaryRotation }]}
            opacity={0.7}
          >
            <Circle cx={center.x} cy={center.y} r={animatedElements.value.secondaryRadius}>
              <SweepGradient
                c={center}
                colors={[...currentConfig.colors].reverse()}
                positions={[0, 0.3, 0.6, 0.8, 1]}
              />
              <BlurMask blur={20 + 10 * intensity} style="normal" />
            </Circle>
          </Group>
        </Group>
      </Canvas>
    </View>
  );
};
