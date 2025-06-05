import React from 'react';
import { FC, useRef, useEffect, useState, useMemo, createRef, useCallback } from 'react';
import { OnboardingStackScreenProps } from '@/navigators/OnboardingNavigator';
import { useAppTheme } from '@/utils/useAppTheme';
import { Button, Screen, Text, TextField } from '@/components/general';
import { $styles, ThemedStyle } from '@/theme';
import { View, ViewStyle, TextStyle, ScrollView, Keyboard } from 'react-native';
import { translate } from '@/i18n';
import { BottomSheetCard } from '@/components/general/BottomSheetCard';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLoginWithEmail } from '@privy-io/expo';
import { toast } from 'sonner-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { OTPInput } from '@/components/general/OTPInput';

interface WelcomeScreenProps extends OnboardingStackScreenProps<'WelcomeScreen'> {}

// Feature chips data - this will be configurable later
const featureChips = [
  { id: 1, title: 'Rolade™ Swap', icon: '🔄' },
  { id: 2, title: 'Kayano', icon: '🌊' },
  { id: 3, title: 'Teyeng Finance', icon: '📊' },
  { id: 4, title: 'Tengku', icon: '♾️' },
  { id: 5, title: 'Sangkalputung', icon: '🌙' },
  { id: 6, title: 'MagicSwap', icon: '✨' },
  { id: 7, title: 'DeFi Protocol', icon: '🏦' },
  { id: 8, title: 'NFT Marketplace', icon: '🎨' },
  { id: 9, title: 'Yield Farm', icon: '🌾' },
];

// Define chip type
interface Chip {
  id: number;
  title: string;
  icon: string;
}

// Prepare 6 rows of chips, repeating and shuffling as needed
function getRows(chips: Chip[], numRows: number): Chip[][] {
  const rows: Chip[][] = Array.from({ length: numRows }, () => []);
  let i = 0;
  // Repeat chips to fill all rows
  while (i < chips.length * 2) {
    for (let r = 0; r < numRows; r++) {
      rows[r].push(chips[i % chips.length]);
      i++;
    }
  }
  return rows;
}
const NUM_ROWS = 5;
const chipRows: Chip[][] = getRows(featureChips, NUM_ROWS);

export const WelcomeScreen: FC<WelcomeScreenProps> = function WelcomeScreen() {
  const { themed, theme } = useAppTheme();

  // Bottom sheet refs
  const emailSheetRef = useRef<BottomSheetModal>(null);
  const otpSheetRef = useRef<BottomSheetModal>(null);

  // Form state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otp, setOtp] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  const { sendCode, loginWithCode } = useLoginWithEmail();

  // ScrollView refs for each chip row (useMemo to keep stable across renders)
  const scrollRefs = useMemo(
    () => Array.from({ length: NUM_ROWS }, () => createRef<ScrollView>()),
    []
  );

  // Memoize animation functions to prevent unnecessary re-renders
  const randomScroll = useCallback((ref: React.RefObject<ScrollView>) => {
    if (ref.current && !isInputFocused) {
      const estimatedChipWidth = 140;
      const visibleChips = 3;
      const extendedChipsCount = chipRows[0].length;
      const maxOffset = Math.max(0, estimatedChipWidth * (extendedChipsCount - visibleChips));
      
      // Random direction: -1 (left) or 1 (right)
      const direction = Math.random() > 0.5 ? 1 : -1;
      // Random scroll amount (between 0.5 and 2 chip widths)
      const amount = estimatedChipWidth * (0.5 + Math.random() * 1.5) * direction;
      
      let randomOffset = Math.floor(Math.random() * maxOffset);
      randomOffset = Math.max(0, Math.min(maxOffset, randomOffset + amount));
      
      ref.current.scrollTo({ x: randomOffset, animated: true });
    }
  }, [isInputFocused]);

  const scheduleRandomScroll = useCallback((ref: React.RefObject<ScrollView>, rowIdx: number, timeouts: NodeJS.Timeout[]) => {
    if (isInputFocused) return; // Don't schedule new animations when input is focused
    
    const interval = 3000 + Math.random() * 4000; // 3-7 seconds, slightly longer intervals
    const timeout = setTimeout(() => {
      randomScroll(ref);
      scheduleRandomScroll(ref, rowIdx, timeouts);
    }, interval);
    timeouts[rowIdx] = timeout;
  }, [randomScroll, isInputFocused]);

  // On mount, set up random scroll intervals for each row
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    // Only start animations if input is not focused
    if (!isInputFocused) {
      // Initial random scroll for each row with staggered timing
      scrollRefs.forEach((ref, idx) => {
        setTimeout(() => randomScroll(ref), 500 + idx * 200);
        setTimeout(() => scheduleRandomScroll(ref, idx, timeouts), 1000 + idx * 200);
      });
    }

    return () => {
      timeouts.forEach(t => clearTimeout(t));
    };
  }, [randomScroll, scheduleRandomScroll, isInputFocused]);

  /**
   * Handler for sign in button press
   */
  const handleSignInPress = () => {
    setEmail('');
    setEmailError('');
    setOtpError('');
    setIsInputFocused(false);
    emailSheetRef.current?.present();
  };

  /**
   * Handler for email submission
   */
  const handleEmailSubmit = async () => {
    setEmailError('');

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setIsInputFocused(false);
    Keyboard.dismiss();

    try {
      toast.promise(sendCode({ email }), {
        loading: 'Sending code...',
        success: _result => {
          ReactNativeHapticFeedback.trigger('notificationSuccess');
          emailSheetRef.current?.close();
          setTimeout(() => {
            otpSheetRef.current?.present();
          }, 500);
          return 'Check your email for the code';
        },
        error: 'Failed to send code',
      });
    } catch {
      setEmailError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handler for OTP verification
   */
  const handleVerifyOtp = async (code: string) => {
    setOtpError('');
    setIsLoading(true);
    Keyboard.dismiss();

    try {
      toast.promise(loginWithCode({ email, code }), {
        loading: 'Verifying OTP...',
        success: _result => 'OTP verified successfully',
        error: 'Invalid OTP. Please try again.',
      });

      otpSheetRef.current?.close();
      // TODO: Handle successful verification (e.g., navigate to main app)
    } catch {
      setOtpError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handler for verify button press
   */
  const handleVerifyPress = () => {
    if (otp.length === 6) {
      handleVerifyOtp(otp);
    }
  };

  // Renders a row of chips in a horizontal ScrollView
  const renderChipRow = (chips: Chip[], scrollRef: React.RefObject<ScrollView>, rowIdx: number) => {
    return (
      <View style={$chipRowStyle} key={rowIdx}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={$chipRowContentStyle}
        >
          {chips.map((chip, chipIndex) => (
            <View key={`${chip.id}-${chipIndex}`} style={themed($chipInnerStyle)}>
              <Text preset="default">{chip.icon}</Text>
              <Text preset="default">{chip.title}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <>
      <Screen
        preset="fixed"
        safeAreaEdges={['top']}
        contentContainerStyle={[themed($styles.screenContainer), $contentContainerStyle]}
        backgroundColor="transparent"
      >
        {/* Header */}
        <View style={themed($headerStyle)}>
          <Text text={translate('common:appName').toUpperCase()} preset="onboardingHeading" />
        </View>

        {/* Main content */}
        <View style={$mainContentStyle}>
          <View style={$titleSectionStyle}>
            <Text tx="welcomeScreen:description" preset="onboardingSubHeading" />
          </View>

          <View style={$chipsContainerStyle}>
            {chipRows.map((chips, idx) => renderChipRow(chips, scrollRefs[idx], idx))}
          </View>
        </View>

        <View style={themed($bottomCardStyle)}>
          <Button tx="welcomeScreen:exploreButton" preset="primary" onPress={handleSignInPress} />
          <Text style={themed($termsTextStyle)}>
            <Text tx="welcomeScreen:terms" />
            <Text text=" " />
            <Text tx="welcomeScreen:termsLink" style={themed($linkTextStyle)} />
            <Text text=" " />
            <Text tx="welcomeScreen:privacy" />
            <Text text=" " />
            <Text tx="welcomeScreen:privacyLink" style={themed($linkTextStyle)} />
          </Text>
        </View>
      </Screen>

      {/* Email Bottom Sheet */}
      <BottomSheetCard sheetRef={emailSheetRef}>
        <View style={$sheetContentStyle}>
          <Text preset="pageHeading" text="Enter your email" style={themed($sheetTitleStyle)} />
          <TextField
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={emailError}
            containerStyle={$inputContainerStyle}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
          />
          <Button
            text="Continue"
            preset="primary"
            onPress={handleEmailSubmit}
            disabled={isLoading}
          />
        </View>
      </BottomSheetCard>

      {/* OTP Bottom Sheet */}
      <BottomSheetCard sheetRef={otpSheetRef}>
        <View style={$sheetContentStyle}>
          <Text preset="pageHeading" text="Enter OTP" style={themed($sheetTitleStyle)} />
          <Text
            preset="default"
            text={`Enter the 6-digit code sent to ${email}`}
            style={themed($subtitleStyle)}
          />
          <OTPInput
            numberOfDigits={6}
            focusColor={theme.colors.primary}
            autoFocus={true}
            hideStick={true}
            blurOnFilled={true}
            type="numeric"
            onFilled={(code: string) => {
              setOtp(code);
              handleVerifyOtp(code);
            }}
            error={otpError}
          />

          {otpError ? (
            <Text preset="default" text={otpError} style={themed($errorTextStyle)} />
          ) : null}

          <Button
            text="Verify"
            preset="primary"
            onPress={handleVerifyPress}
            disabled={isLoading}
            style={$verifyButtonStyle}
          />
        </View>
      </BottomSheetCard>
    </>
  );
};

const $contentContainerStyle: ViewStyle = {
  flex: 1,
};

const $headerStyle: ThemedStyle<ViewStyle> = () => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingTop: 20,
  paddingBottom: 10,
});

const $mainContentStyle: ViewStyle = {
  flex: 1,
  paddingHorizontal: 20,
};

const $titleSectionStyle: ViewStyle = {
  marginBottom: 40,
};

const $chipsContainerStyle: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  gap: 10,
  marginHorizontal: -20,
};

const $chipRowStyle: ViewStyle = {
  height: 64,
  overflow: 'hidden',
  position: 'relative',
};

const $chipRowContentStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
};

const $chipInnerStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.surface,
  borderRadius: 32,
  paddingHorizontal: 24,
  paddingVertical: 16,
  gap: 12,
});

const $bottomCardStyle: ThemedStyle<ViewStyle> = theme => ({
  // position: 'relative',
  backgroundColor: theme.colors.secondaryBg,
  borderTopLeftRadius: 32,
  borderTopRightRadius: 32,
  paddingHorizontal: 24,
  paddingTop: 44,
  paddingBottom: 44,
  gap: 20,
});

const $termsTextStyle: ThemedStyle<TextStyle> = theme => ({
  textAlign: 'center',
  color: theme.colors.text,
  fontSize: 13,
  lineHeight: 20,
  opacity: 0.9,
});

const $linkTextStyle: ThemedStyle<TextStyle> = theme => ({
  textDecorationLine: 'underline',
  color: theme.colors.text,
  opacity: 1,
});

// Bottom Sheet Styles
const $sheetContentStyle: ViewStyle = {
  padding: 24,
};

const $sheetTitleStyle: ThemedStyle<TextStyle> = theme => ({
  marginBottom: 8,
  color: theme.colors.text,
});

const $subtitleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  marginBottom: 24,
});

const $inputContainerStyle: ViewStyle = {
  marginBottom: 24,
};

const $errorTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.error,
  marginBottom: 16,
  textAlign: 'center',
});

const $verifyButtonStyle: ViewStyle = {
  marginTop: 8,
};
