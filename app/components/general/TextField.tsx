import { useRef, useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleProp,
  TextStyle,
  ViewStyle,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { type ThemedStyle, type ThemedStyleArray } from '@/theme';
import { Text } from '@/components/general/';
import { useAppTheme } from '@/utils/useAppTheme';
import { translate, TxKeyPath } from '@/i18n';
import { TOptions } from 'i18next';
import { useBottomSheetInternal } from '@gorhom/bottom-sheet';

type Presets = 'primary';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  /**
   * Label displayed on the top border of the input.
   */
  label?: string;
  /**
   * Label translation key.
   */
  labelTx?: TxKeyPath;
  /**
   * Optional options to pass to i18n for label.
   */
  labelTxOptions?: TOptions;
  /**
   * Placeholder text which is looked up via i18n.
   */
  placeholderTx?: TxKeyPath;
  /**
   * Optional options to pass to i18n for placeholder.
   */
  placeholderTxOptions?: TOptions;
  /**
   * Style override for the container
   */
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Style override for the input
   */
  inputStyle?: StyleProp<TextStyle>;
  /**
   * Style override for the label
   */
  labelStyle?: StyleProp<TextStyle>;
  /**
   * Input preset type
   */
  preset?: Presets;
  /**
   * A React component to render on the right side of the input.
   */
  rightAccessory?: React.ReactNode;
  /**
   * A React component to render on the left side of the input.
   */
  leftAccessory?: React.ReactNode;
  /**
   * Error message to display below the input
   */
  error?: string;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
  /**
   * Animation duration in milliseconds
   */
  animationDuration?: number;

  /**
   * Is triggered when the input container is clicked
   */
  onContainerPress?: () => void;
}

export function TextField(props: TextFieldProps) {
  const {
    label,
    labelTx,
    labelTxOptions,
    placeholderTx,
    placeholderTxOptions,
    containerStyle,
    inputStyle,
    labelStyle,
    rightAccessory,
    leftAccessory,
    error,
    disabled,
    animationDuration = 150,
    placeholder,
    keyboardType,
    autoComplete,
    secureTextEntry,
    onContainerPress,
    ...rest
  } = props;

  const [isFocused, setIsFocused] = useState(false);
  const { themed, theme } = useAppTheme();
  const inputRef = useRef<TextInput>(null);
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  const preset: Presets = props.preset ?? 'primary';
  const placeholderText = placeholderTx
    ? translate(placeholderTx, placeholderTxOptions)
    : placeholder;

  const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

  const handleFocus = (e: any) => {
    setIsFocused(true);
    Animated.timing(animatedOpacity, {
      toValue: 0.8,
      duration: animationDuration,
      useNativeDriver: true,
    }).start();
    shouldHandleKeyboardEvents.value = true;
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    Animated.timing(animatedOpacity, {
      toValue: 1,
      duration: animationDuration,
      useNativeDriver: true,
    }).start();
    shouldHandleKeyboardEvents.value = false;
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const handleContainerPress = () => {
    if (onContainerPress) {
      onContainerPress();
    }
    inputRef.current?.focus();
  };

  const hasError = !!error;

  return (
    <View style={[themed($containerStyle), containerStyle]}>
      <View style={themed($labelContainerStyle)}>
        {/* This empty View creates space for the label in the border */}
        <View style={themed($labelSpacerStyle)} />

        {/* The actual label that sits on the border */}
        {(label || labelTx) && (
          <Text
            tx={labelTx}
            text={label}
            txOptions={labelTxOptions}
            style={[
              themed($labelStyle),
              isFocused && themed($focusedLabelStyle),
              hasError && themed($errorLabelStyle),
              labelStyle,
            ]}
          />
        )}
      </View>

      <TouchableWithoutFeedback onPress={handleContainerPress} disabled={disabled}>
        <Animated.View
          style={[
            themed($viewPresets[preset]),
            isFocused && themed($focusedStyle),
            hasError && themed($errorInputStyle),
            disabled && themed($disabledStyle),
            { opacity: animatedOpacity },
          ]}
        >
          {leftAccessory && <View style={themed($leftAccessoryStyle)}>{leftAccessory}</View>}

          <TextInput
            ref={inputRef}
            style={[themed($inputStyle), inputStyle]}
            placeholder={placeholderText}
            placeholderTextColor={theme.colors.textDim}
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            keyboardType={keyboardType}
            autoCapitalize="none"
            autoComplete={autoComplete}
            secureTextEntry={secureTextEntry}
            {...rest}
          />

          {rightAccessory && <View style={themed($rightAccessoryStyle)}>{rightAccessory}</View>}
        </Animated.View>
      </TouchableWithoutFeedback>

      {hasError && <Text text={error} style={themed($errorTextStyle)} />}
    </View>
  );
}

const $containerStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginVertical: spacing.xs,
  position: 'relative',
});

const $labelContainerStyle: ThemedStyle<ViewStyle> = () => ({
  position: 'absolute',
  top: 0,
  left: 5,
  zIndex: 1,
  flexDirection: 'row',
  alignItems: 'center',
});

const $labelSpacerStyle: ThemedStyle<ViewStyle> = () => ({
  width: 10,
});

const $labelStyle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  fontFamily: 'semiBold',
  color: colors.text,
  backgroundColor: colors.background,
  paddingHorizontal: spacing.xxs,
});

const $focusedLabelStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.primary,
});

const $errorLabelStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
});

const $inputStyle: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  color: colors.text,
  fontSize: 20,
  fontFamily: 'medium',
  height: 50,
  paddingHorizontal: 5,
});

const $focusedStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.palette.primary,
  borderWidth: 2,
});

const $errorInputStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderColor: colors.error,
  borderWidth: 2,
});

const $errorTextStyle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  fontSize: 14,
  marginTop: spacing.xxs,
});

const $disabledStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.border,
  borderColor: colors.border,
  opacity: 0.7,
});

const $rightAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginStart: spacing.xs,
  justifyContent: 'center',
});

const $leftAccessoryStyle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginEnd: spacing.xs,
  justifyContent: 'center',
});

const $baseViewStyle: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 2,
  borderRadius: 15,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.sm,
  backgroundColor: colors.background,
  borderColor: colors.border,
  minHeight: 60,
  marginTop: 10,
});

const $viewPresets: Record<Presets, ThemedStyleArray<ViewStyle>> = {
  primary: [$baseViewStyle],
};
