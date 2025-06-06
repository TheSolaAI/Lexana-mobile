import { FC, useEffect, useState, useCallback } from 'react';
import { View, ViewStyle, AppState } from 'react-native';
import { UIMessage } from '@ai-sdk/ui-utils';
import { LiveModeInputBar } from './LiveModeInputBar';
import { useRealtimeProvider } from '@/hooks/useRealtimeProvider';
import { toast } from 'sonner-native';
import { LiveModeDisplay } from './LiveModeDisplay';

interface LiveModeProps {
  /**
   * Callback function called when exiting live mode
   */
  onExitLiveMode: () => void;
  /**
   * Callback function to save messages when exiting live mode
   */
  onSaveMessages?: (messages: UIMessage[]) => void;
}

/**
 * LiveMode component that displays real-time conversation UI
 * and manages audio input/output through the realtime provider.
 * Messages are saved but not displayed.
 * @param {LiveModeProps} props - The props for the live mode component
 * @returns {JSX.Element} The rendered live mode interface
 */
export const LiveMode: FC<LiveModeProps> = ({ onExitLiveMode, onSaveMessages }) => {
  const {
    isMuted,
    startSession,
    stopSession,
    toggleMute,
    isSessionActive,
    connectionState,
    messages: allMessages,
    liveState,
  } = useRealtimeProvider();

  const [isLoadingFirstMessage, setIsLoadingFirstMessage] = useState(true);

  /**
   * Initializes and cleans up the live mode session.
   */
  useEffect(() => {
    const initializeSession = async () => {
      try {
        await startSession();
        setIsLoadingFirstMessage(true);
      } catch (error) {
        console.error('Failed to start live session:', error);
        toast.error('Failed to start live session');
        setIsLoadingFirstMessage(false);
      }
    };
    initializeSession();
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        stopSession();
      }
    };
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      stopSession();
      appStateSubscription.remove();
    };
  }, [startSession, stopSession]);

  /**
   * Updates the loading state based on conversation progress.
   */
  useEffect(() => {
    if (
      isLoadingFirstMessage &&
      (liveState.assistantResponse || allMessages.length > 0 || liveState.isAssistantSpeaking)
    ) {
      setIsLoadingFirstMessage(false);
    }

    if (allMessages.length === 0 && liveState.isUserSpeaking && !liveState.userTranscript) {
      setIsLoadingFirstMessage(true);
    } else if (
      liveState.userTranscript &&
      isLoadingFirstMessage &&
      !liveState.isAssistantSpeaking &&
      !liveState.assistantResponse
    ) {
      setIsLoadingFirstMessage(false);
    }
  }, [liveState, allMessages, isLoadingFirstMessage]);

  /**
   * Handles exiting live mode with cleanup and message saving.
   */
  const handleExitLiveMode = useCallback(() => {
    stopSession();
    if (onSaveMessages && allMessages.length > 0) {
      onSaveMessages(allMessages);
    }
    onExitLiveMode();
  }, [stopSession, onSaveMessages, allMessages, onExitLiveMode]);

  const assistantHasResponded =
    allMessages.some(m => m.role === 'assistant') || liveState.isAssistantSpeaking;

  return (
    <View style={$containerStyle}>
      <LiveModeDisplay
        isAssistantSpeaking={liveState.isAssistantSpeaking}
        isUserSpeaking={liveState.isUserSpeaking}
        isSessionActive={isSessionActive}
        connectionState={connectionState}
        isLoadingFirstMessage={isLoadingFirstMessage}
        assistantHasResponded={assistantHasResponded}
      />

      <LiveModeInputBar
        onExitLiveMode={handleExitLiveMode}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />
    </View>
  );
};

// Styles
const $containerStyle: ViewStyle = {
  flex: 1,
  backgroundColor: 'transparent',
};
