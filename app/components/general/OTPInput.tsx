import { FC } from 'react';
import { View, ViewStyle } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { useAppTheme } from '@/utils/useAppTheme';
import { useBottomSheetInternal } from '@gorhom/bottom-sheet';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Text } from '@/components/general';
import { ThemedStyle } from '@/theme';

/**
 * Props for the OTPInput component.
 */
export interface OTPInputProps {
  /**
   * Number of OTP digits (default: 6)
   */
  numberOfDigits?: number;
  /**
   * Color for the focused input
   */
  focusColor?: string;
  /**
   * Autofocus the input
   */
  autoFocus?: boolean;
  /**
   * Hide the stick/cursor
   */
  hideStick?: boolean;
  /**
   * Blur on filled
   */
  blurOnFilled?: boolean;
  /**
   * Input type (e.g., 'numeric')
   */
  type?: 'numeric' | 'alphanumeric';
  /**
   * Handler when all digits are filled
   */
  onFilled?: (code: string) => void;
  /**
   * Error message to display
   */
  error?: string;
  /**
   * Handler for value change
   */
  onChange?: (value: string[], index: number) => void;
}

/**
 * OTPInput component for entering one-time passwords, with keyboard and haptic feedback integration.
 */
export const OTPInput: FC<OTPInputProps> = function OTPInput({
  numberOfDigits = 6,
  focusColor,
  autoFocus = true,
  hideStick = true,
  blurOnFilled = true,
  type = 'numeric',
  onFilled,
  error,
  onChange,
}) {
  const { theme, themed } = useAppTheme();
  const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

  return (
    <View style={$containerStyle}>
      <OtpInput
        numberOfDigits={numberOfDigits}
        focusColor={focusColor || theme.colors.primary}
        autoFocus={autoFocus}
        hideStick={hideStick}
        blurOnFilled={blurOnFilled}
        type={type}
        onFilled={onFilled}
        onFocus={() => {
          ReactNativeHapticFeedback.trigger('effectClick');
          shouldHandleKeyboardEvents.value = true;
        }}
        onBlur={() => {
          ReactNativeHapticFeedback.trigger('effectClick');
          shouldHandleKeyboardEvents.value = false;
        }}
        onTextChange={(code: string) => {
          if (onChange) {
            const arr = code.split('').slice(0, numberOfDigits);
            onChange(arr, arr.length - 1);
          }
        }}
        theme={{
          pinCodeTextStyle: {
            color: theme.colors.text,
          },
        }}
      />
      {!!error && <Text preset="default" text={error} style={themed($errorTextStyle)} />}
    </View>
  );
};

const $containerStyle: ViewStyle = {
  alignItems: 'center',
  width: '100%',
};

const $errorTextStyle: ThemedStyle<any> = theme => ({
  color: theme.colors.error,
  marginTop: 16,
  textAlign: 'center',
});
