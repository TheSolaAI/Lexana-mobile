import { useRef } from 'react';
import { Pressable, PressableProps, StyleProp, TextStyle, ViewStyle, Animated } from 'react-native';
import { $styles, type ThemedStyle, type ThemedStyleArray } from '@/theme';
import { useAppTheme } from '@/utils/useAppTheme';
import { TextProps, Text } from './Text';

type Presets = 'primary' | 'secondary';

export interface ButtonProps extends PressableProps {
  /**
   * Text which is looked up via i18n.
   */
  tx?: TextProps['tx'];
  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: TextProps['text'];
  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: TextProps['txOptions'];
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * An optional style override for the button text.
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * An optional style override for the button text when in the "disabled" state.
   */
  disabledTextStyle?: StyleProp<TextStyle>;
  /**
   * One of the different types of button presets.
   */
  preset?: Presets;
  /**
   * A React component to render on the right side of the text.
   * Example: rightAccessory={<Ionicons name="chevron-forward" size={20} color="white" />}
   */
  rightAccessory?: React.ReactNode;
  /**
   * Style for the right accessory container
   */
  rightAccessoryStyle?: StyleProp<ViewStyle>;
  /**
   * A React component to render on the left side of the text.
   * Example: leftAccessory={<Ionicons name="chevron-back" size={20} color="white" />}
   */
  leftAccessory?: React.ReactNode;
  /**
   * Style for the left accessory container
   */
  leftAccessoryStyle?: StyleProp<ViewStyle>;
  /**
   * Children components.
   */
  children?: React.ReactNode;
  /**
   * disabled prop, accessed directly for declarative styling reasons.
   * https://reactnative.dev/docs/pressable#disabled
   */
  disabled?: boolean;
  /**
   * An optional style override for the disabled state
   */
  disabledStyle?: StyleProp<ViewStyle>;
  /**
   * Animation duration in milliseconds
   */
  animationDuration?: number;
}

export function Button(props: ButtonProps) {
  const {
    tx,
    text,
    txOptions,
    style: $viewStyleOverride,
    textStyle: $textStyleOverride,
    disabledTextStyle: $disabledTextStyleOverride,
    children,
    rightAccessory,
    rightAccessoryStyle: $rightAccessoryStyleOverride,
    leftAccessory,
    leftAccessoryStyle: $leftAccessoryStyleOverride,
    disabled,
    disabledStyle: $disabledViewStyleOverride,
    animationDuration = 150,
    onPressIn: $onPressIn,
    onPressOut: $onPressOut,
    ...rest
  } = props;

  const { themed, theme } = useAppTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const preset: Presets = props.preset ?? 'primary';

  const onPressIn = (e: any) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: animationDuration,
        useNativeDriver: true,
      }),
    ]).start();

    $onPressIn?.(e);
  };

  const onPressOut = (e: any) => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      }),
    ]).start();

    $onPressOut?.(e);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={() => [
          themed($viewPresets[preset]),
          $viewStyleOverride,
          !!disabled && $disabledViewStyleOverride,
        ]}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        android_ripple={{ color: theme.colors.primary, foreground: true }}
        {...rest}
      >
        {_ => (
          <>
            {leftAccessory && (
              <Animated.View
                style={[
                  themed($leftAccessoryStyle),
                  $leftAccessoryStyleOverride,
                  { opacity: opacityAnim },
                ]}
              >
                {leftAccessory}
              </Animated.View>
            )}

            <Animated.View style={{ opacity: opacityAnim }}>
              <Text
                tx={tx}
                text={text}
                txOptions={txOptions}
                style={[
                  themed($textPresets[preset]),
                  $textStyleOverride,
                  !!disabled && $disabledTextStyleOverride,
                ]}
              >
                {children}
              </Text>
            </Animated.View>

            {rightAccessory && (
              <Animated.View
                style={[
                  themed($rightAccessoryStyle),
                  $rightAccessoryStyleOverride,
                  { opacity: opacityAnim },
                ]}
              >
                {rightAccessory}
              </Animated.View>
            )}
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const $baseViewStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  minHeight: 60,
  width: '100%',
  borderRadius: 15,
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: spacing.sm,
  paddingHorizontal: spacing.sm,
  overflow: 'hidden',
});

const $baseTextStyle: ThemedStyle<TextStyle> = () => ({
  fontSize: 18,
  fontFamily: 'bold',
  lineHeight: 20,
  textAlign: 'center',
  flexShrink: 1,
  flexGrow: 0,
  zIndex: 2,
});

const $rightAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginStart: spacing.xs,
  zIndex: 1,
});

const $leftAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginEnd: spacing.xs,
  zIndex: 1,
});

const $viewPresets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
  primary: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: colors.palette.primary,
    }),
  ],
  secondary: [
    $styles.row,
    $baseViewStyle,
    ({ colors }) => ({
      backgroundColor: colors.transparent,
      borderWidth: 1,
      borderColor: colors.palette.primary,
    }),
  ],
};

const $textPresets: Record<Presets, ThemedStyleArray<TextStyle>> = {
  primary: [$baseTextStyle, ({ colors }) => ({ color: colors.text })],
  secondary: [$baseTextStyle, ({ colors }) => ({ color: colors.palette.primary })],
};
