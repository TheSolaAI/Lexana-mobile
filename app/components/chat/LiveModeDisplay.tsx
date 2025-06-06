import { FC } from 'react';
import { View, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { translate } from '@/i18n';
import { Text } from '@/components/general';
import { AnimatedGradientCircle } from '@/components/general/AnimatedGradientCircle';

interface LiveModeDisplayProps {
  /**
   * Whether the assistant is currently speaking
   */
  isAssistantSpeaking: boolean;
  /**
   * Whether the user is currently speaking
   */
  isUserSpeaking: boolean;
  /**
   * Whether the realtime session is active
   */
  isSessionActive: boolean;
  /**
   * Current connection state
   */
  connectionState: string;
  /**
   * Indicates if the first message is being loaded
   */
  isLoadingFirstMessage: boolean;
  /**
   * Whether assistant has responded at least once
   */
  assistantHasResponded: boolean;
}

/**
 * LiveModeDisplay component that shows session status.
 * Displays minimal UI with only status indicators.
 * @param {LiveModeDisplayProps} props - The props for the live mode display
 * @returns {JSX.Element} The rendered live mode display
 */
export const LiveModeDisplay: FC<LiveModeDisplayProps> = ({
  isAssistantSpeaking,
  isUserSpeaking,
  isSessionActive,
  connectionState,
  isLoadingFirstMessage,
  assistantHasResponded,
}) => {
  const { themed } = useAppTheme();

  /**
   * Gets the status message based on current state
   */
  const getStatusMessage = (): string => {
    if (!isSessionActive) {
      return connectionState === 'connecting'
        ? translate('liveMode:connecting')
        : translate('liveMode:disconnected');
    }
    if (isLoadingFirstMessage && !isAssistantSpeaking && !assistantHasResponded)
      return translate('liveMode:listening');

    // When session is active but not in initial listening state
    if (isAssistantSpeaking) return translate('liveMode:speaking');

    return '';
  };

  const statusMessage = getStatusMessage();

  return (
    <View style={themed($containerStyle)}>
      {/* AnimatedGradientCircle visualizer, only when session is active */}
      <AnimatedGradientCircle
        speaker={isAssistantSpeaking ? 'assistant' : isUserSpeaking ? 'user' : 'none'}
        intensity={1}
        style={{
          height: 100,
          width: 100,
        }}
      />
      {statusMessage !== '' && (
        <View style={themed($statusContainer)}>
          <Text style={themed($statusText)} preset="small" text={statusMessage} />
        </View>
      )}
    </View>
  );
};

// Styles
const $containerStyle: ThemedStyle<ViewStyle> = theme => ({
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.colors.background,
});

const $statusContainer: ThemedStyle<ViewStyle> = theme => ({
  position: 'absolute',
  bottom: 120, // Positioned above the input bar (80) + some padding (20) + its own height approx
  alignSelf: 'center',
  paddingVertical: 5,
  paddingHorizontal: 10,
  backgroundColor: `${theme.colors.surface}99`,
  borderRadius: 8,
});

const $statusText: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  textAlign: 'center',
  fontSize: 12,
  fontWeight: '500',
});
