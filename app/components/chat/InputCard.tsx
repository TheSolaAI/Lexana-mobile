import { FC, useState, useEffect } from 'react';
import { TextInput, TextStyle, View, ViewStyle, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { toast } from 'sonner-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { ThemedStyle } from '@/theme';
import { useAppTheme } from '@/utils/useAppTheme';
import { translate } from '@/i18n';

interface InputCardProps {
  onSendMessage: (message: string) => void;
  onAudioRecorded: (audioUri: string) => void;
  onEnterLiveMode: () => void;
  /**
   * Whether the system is currently processing a message
   */
  isProcessing?: boolean;
}

/**
 * InputCard component that provides a text input with animated mic/send button and live mode toggle
 * Automatically disables all input methods when the system is processing a message
 * @param onSendMessage - Callback function to handle sending text messages
 * @param onAudioRecorded - Callback function to handle audio recording
 * @param onEnterLiveMode - Callback function to enter live mode
 * @param isProcessing - Whether the system is currently processing a message (disables input)
 */
export const InputCard: FC<InputCardProps> = ({
  onSendMessage,
  onAudioRecorded,
  onEnterLiveMode,
  isProcessing = false,
}) => {
  const { themed, theme } = useAppTheme();
  const [inputText, setInputText] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([]);
  const [shouldStopRecording, setShouldStopRecording] = useState(false); // Track stop intent
  const hasText = inputText.trim().length > 0;
  const iconFade = useSharedValue(hasText ? 1 : 0);
  const liveModeAnim = useSharedValue(hasText ? 0 : 1);
  const toolbarAnim = useSharedValue(0); // 0: normal, 1: offscreen
  const recordingAnim = useSharedValue(0); // Animation for recording state
  const screenHeight = Dimensions.get('window').height;

  // Disable interactions when processing
  const isInputDisabled = isProcessing || isRecording;

  useEffect(() => {
    iconFade.value = withTiming(hasText ? 1 : 0, { duration: 200 });
    liveModeAnim.value = withTiming(hasText ? 0 : 1, { duration: 250 });
  }, [hasText]);

  useEffect(() => {
    recordingAnim.value = withTiming(isRecording ? 1 : 0, { duration: 200 });
  }, [isRecording]);

  // Auto-stop recording if shouldStopRecording is true and recording has started
  useEffect(() => {
    if (shouldStopRecording && isRecording) {
      setShouldStopRecording(false);
      stopRecording();
    }
  }, [shouldStopRecording, isRecording]);

  // Cleanup function to handle app state changes
  useEffect(() => {
    return () => {
      if (recording) {
        // Check if recording is still loaded before trying to unload
        recording.getStatusAsync()
          .then((status) => {
            if (!status.isDoneRecording) {
              return recording.stopAndUnloadAsync();
            }
          })
          .catch((error) => {
            // Only log if it's not an "already unloaded" error
            if (!error.message?.includes('already been unloaded')) {
              console.error('Cleanup recording error:', error);
            }
          });
      }
    };
  }, [recording]);

  /**
   * Requests microphone permissions
   */
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  /**
   * Analyzes audio levels to detect if there's meaningful content
   * @param levels - Array of audio level readings in dB
   * @returns true if meaningful audio content is detected
   */
  const hasAudioContent = (levels: number[]): boolean => {
    if (levels.length === 0) return false;
    
    // Filter out invalid readings and silence
    const validLevels = levels.filter(level => level > -160);
    if (validLevels.length === 0) return false;
    
    // Check if we have levels above -40dB (indicating speech/sound)
    const significantLevels = validLevels.filter(level => level > -40);
    
    // Need at least 20% of readings to be above threshold
    const contentRatio = significantLevels.length / validLevels.length;
    
    console.log(`Audio analysis: ${validLevels.length} readings, ${significantLevels.length} significant, ratio: ${contentRatio.toFixed(2)}`);
    
    return contentRatio > 0.2;
  };

  /**
   * Starts audio recording with noise cancellation and metering
   */
  const startRecording = async () => {
    try {
      // Prevent multiple recordings
      if (recording || isRecording) {
        console.warn('Recording already in progress');
        return;
      }

      // Set recording state immediately to prevent race conditions
      setIsRecording(true);
      setRecordingStartTime(Date.now());
      setAudioLevels([]); // Reset audio levels

      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        console.error('Microphone permission denied');
        toast.error(translate('chatScreen:voiceMode.permissionDenied'));
        
        // Reset state on permission failure
        setIsRecording(false);
        setRecordingStartTime(null);
        setShouldStopRecording(false);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Enhanced recording options with noise cancellation and metering
      const recordingOptions: Audio.RecordingOptions = {
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true, // Enable audio level monitoring
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1, // Mono for voice recording
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 1, // Mono for voice recording
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      const { recording: newRecording } = await Audio.Recording.createAsync(recordingOptions);

      // Set up audio level monitoring
      newRecording.setOnRecordingStatusUpdate((status) => {
        if (status.metering !== undefined) {
          setAudioLevels(prev => [...prev.slice(-50), status.metering!]); // Keep last 50 readings
        }
      });

      setRecording(newRecording);

      console.log('Recording started with enhanced options');

      // Check if user released button while we were setting up
      if (shouldStopRecording) {
        setShouldStopRecording(false);
        stopRecording();
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast.error(translate('chatScreen:voiceMode.recordingError'));
      
      // Cleanup on error
      setIsRecording(false);
      setRecording(null);
      setRecordingStartTime(null);
      setAudioLevels([]);
      setShouldStopRecording(false);
    }
  };

  /**
   * Stops audio recording and processes the result with silence detection
   */
  const stopRecording = async () => {
    if (!recording || !isRecording) {
      console.warn('No active recording to stop');
      return;
    }

    try {
      // Get the status before stopping
      const status = await recording.getStatusAsync();
      if (!status.isRecording) {
        console.warn('Recording was not active');
        setIsRecording(false);
        setRecording(null);
        setRecordingStartTime(null);
        setAudioLevels([]);
        setShouldStopRecording(false);
        return;
      }

      // Stop the recording (no minimum duration check for push-to-talk)
      await recording.stopAndUnloadAsync();
      
      // Check if recording has meaningful content
      const hasContent = hasAudioContent(audioLevels);
      
      // Get the URI after stopping (before clearing the reference)
      const uri = recording.getURI();
      
      // Clear the recording reference immediately after getting URI and unloading
      setRecording(null);
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      // Calculate recording duration for logging
      const recordingDuration = recordingStartTime ? Date.now() - recordingStartTime : 0;

      if (uri) {
        if (hasContent) {
          console.log(`Recording completed successfully with meaningful content (${recordingDuration}ms): ${uri}`);
          onAudioRecorded(uri);
        } else {
          console.log(`Recording completed but appears to be mostly silence (${recordingDuration}ms), discarding`);
          // Silently ignore recordings that are mostly silence
        }
      } else {
        console.warn('No recording URI available');
      }

      // Cleanup state
      setIsRecording(false);
      setRecordingStartTime(null);
      setAudioLevels([]);
      setShouldStopRecording(false);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      
      // Clear the recording reference on error to prevent cleanup issues
      setRecording(null);
      setIsRecording(false);
      setRecordingStartTime(null);
      setAudioLevels([]);
      setShouldStopRecording(false);
      
      // Try to reset audio mode
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      } catch (audioError) {
        console.error('Failed to reset audio mode:', audioError);
      }
      
      // Only show error for non-trivial failures
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage && !errorMessage.includes('no valid audio data')) {
        toast.error(translate('chatScreen:voiceMode.recordingError'));
      }
    }
  };

  /**
   * Handles sending the message when send button is pressed
   */
  const handleSendPress = () => {
    if (hasText && !isProcessing) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  /**
   * Handles text input changes
   */
  const handleTextChange = (text: string) => {
    if (!isProcessing) {
      setInputText(text);
    }
  };

  /**
   * Handles mic button press start (push-to-talk)
   */
  const handleMicPressIn = () => {
    if (!hasText && !isRecording && !isProcessing) {
      setShouldStopRecording(false); // Clear any pending stop
      startRecording();
    }
  };

  /**
   * Handles mic button press end (push-to-talk)
   */
  const handleMicPressOut = () => {
    if (isRecording && !isProcessing) {
      stopRecording();
    } else {
      // If recording hasn't started yet, mark it to stop when it does
      setShouldStopRecording(true);
    }
  };

  // Animated style for send icon (fade in and rotate up)
  const sendIconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconFade.value,
    transform: [{ rotate: `${-90 * iconFade.value}deg` }],
  }));

  // Animated style for mic icon (fade out and recording pulse)
  const micIconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - iconFade.value,
    transform: [{ scale: 1 + 0.1 * recordingAnim.value }],
  }));

  // Animated style for recording indicator
  const recordingIndicatorStyle = useAnimatedStyle(() => ({
    opacity: recordingAnim.value,
    transform: [{ scale: recordingAnim.value }],
  }));

  // Animated style for live mode pill
  const liveModeButtonAnimatedStyle = useAnimatedStyle(() => {
    const minWidth = 44;
    const maxWidth = 140;
    return {
      width: minWidth + (maxWidth - minWidth) * liveModeAnim.value,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      height: 44,
    };
  });
  const liveModeTextAnimatedStyle = useAnimatedStyle(() => ({
    opacity: liveModeAnim.value,
    marginLeft: 8,
  }));

  // Animation for falling toolbar only
  const toolbarAnimatedStyle = useAnimatedStyle(() => {
    // 0: normal, 1: offscreen
    const translateY = toolbarAnim.value * (screenHeight * 0.5 + 100);
    return {
      transform: [{ translateY }],
      opacity: 1 - 0.5 * toolbarAnim.value,
    };
  });

  // Wrap the onEnterLiveMode to trigger the animation
  const handleEnterLiveMode = () => {
    if (isProcessing) return; // Prevent entering live mode when processing
    
    // Animate: fall (0->1)
    toolbarAnim.value = 0;
    toolbarAnim.value = withTiming(1, { duration: 400 }, () => {
      runOnJS(onEnterLiveMode)();
    });
  };

  return (
    <Animated.View style={[themed($containerStyle), toolbarAnimatedStyle]}>
      <TextInput
        placeholder={isProcessing ? translate('chatScreen:processing.thinking') : translate('chatScreen:voiceMode.placeholder')}
        placeholderTextColor={theme.colors.textDim}
        value={inputText}
        onChangeText={handleTextChange}
        autoFocus={!isProcessing}
        editable={!isProcessing}
        style={[themed($inputStyle), isInputDisabled && themed($disabledInputStyle)]}
        multiline
      />
      <View style={$bottomContainerStyle}>
        {/* Live Mode Button  */}
        <Animated.View style={liveModeButtonAnimatedStyle}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            onPress={handleEnterLiveMode}
            activeOpacity={isProcessing ? 1 : 0.7}
            disabled={isProcessing}
          >
            <MaterialIcons name="graphic-eq" size={24} color={isProcessing ? theme.colors.textDim + '50' : theme.colors.textDim} />
            <Animated.Text
              style={[themed($liveModeTextStyle), liveModeTextAnimatedStyle, isProcessing && { opacity: 0.5 }]}
              numberOfLines={1}
            >
              {translate('chatScreen:liveMode.title')}
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Mic/Send Button (Right) */}
        <TouchableOpacity
          style={themed($micSendButtonStyle)}
          onPress={hasText && !isProcessing ? handleSendPress : undefined}
          onPressIn={!hasText && !isProcessing ? handleMicPressIn : undefined}
          onPressOut={!hasText && !isProcessing ? handleMicPressOut : undefined}
          activeOpacity={isInputDisabled ? 1 : 0.7}
          disabled={isInputDisabled}
        >
          <View style={$animatedButtonContainer}>
            {/* Recording indicator background */}
            <Animated.View
              style={[
                recordingIndicatorStyle,
                {
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundColor: theme.colors.primary + '20',
                  borderRadius: 25,
                },
              ]}
            />
            {/* Mic Icon */}
            <Animated.View
              style={[
                micIconAnimatedStyle,
                {
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <MaterialIcons 
                name="mic" 
                size={24} 
                color={isInputDisabled ? theme.colors.textDim + '50' : (isRecording ? theme.colors.primary : theme.colors.textDim)} 
              />
            </Animated.View>
            {/* Send Icon with surface container */}
            <Animated.View
              style={[
                sendIconAnimatedStyle,
                {
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <View style={$sendIconContainerStyle(theme, isInputDisabled)}>
                <MaterialIcons name="send" size={24} color={isInputDisabled ? theme.colors.textDim + '50' : theme.colors.primary} />
              </View>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const $inputStyle: ThemedStyle<TextStyle> = theme => ({
  paddingHorizontal: 15,
  fontSize: 16,
  fontFamily: 'semibold',
  color: theme.colors.text,
  maxHeight: 120,
  minHeight: 50,
});

const $containerStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  paddingHorizontal: 15,
  paddingTop: 10,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
});

const $bottomContainerStyle: ViewStyle = {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: 5,
  paddingBottom: 10,
};

const $liveModeTextStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 16,
  fontFamily: 'semibold',
});

const $micSendButtonStyle: ThemedStyle<ViewStyle> = () => ({
  borderRadius: 25,
  overflow: 'hidden',
});

const $animatedButtonContainer: ViewStyle = {
  width: 50,
  height: 50,
  borderRadius: 25,
  justifyContent: 'center',
  alignItems: 'center',
};

const $sendIconContainerStyle = (theme: any, isDisabled?: boolean): ViewStyle => ({
  backgroundColor: isDisabled ? theme.colors.surface + '50' : theme.colors.surface,
  borderRadius: 22,
  width: 44,
  height: 44,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: isDisabled ? theme.colors.border + '50' : theme.colors.border,
});

const $disabledInputStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
});
