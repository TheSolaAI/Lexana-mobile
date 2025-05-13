import { useRef, useState, useEffect } from 'react';
import { View, TouchableOpacity, Animated, Easing, ViewStyle } from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { Audio, InterruptionModeAndroid } from 'expo-av';
import Feather from '@expo/vector-icons/Feather';

interface PushToTalkButtonProps {
  onAudioRecorded?: (uri: string) => void;
  size?: number;
}

export const PushToTalkButton: React.FC<PushToTalkButtonProps> = ({
  onAudioRecorded,
  size = 64,
}) => {
  const { themed, theme } = useAppTheme(); // Get theme object for color interpolation
  const [isPressed, setIsPressed] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioLevel, setAudioLevel] = useState(0); // Normalized 0-1 audio level
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const scaleAnim = useRef(new Animated.Value(1)).current; // Button press scale
  const pulseAnim = useRef(new Animated.Value(0)).current; // Continuous pulse when pressed
  const audioLevelAnimated = useRef(new Animated.Value(0)).current; // Smoothed audio level for animation

  useEffect(() => {
    Animated.timing(audioLevelAnimated, {
      toValue: isPressed ? audioLevel : 0,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  }, [audioLevel, isPressed, audioLevelAnimated]);

  const checkAndRequestPermissions = async () => {
    let currentStatus = permissionResponse;
    if (!currentStatus) {
      currentStatus = await Audio.getPermissionsAsync();
    }

    if (currentStatus?.status !== 'granted') {
      const response = await requestPermission();
      return response.granted;
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await checkAndRequestPermissions();
    if (!hasPermission) {
      setIsPressed(false);
      scaleAnim.setValue(1);
      pulseAnim.setValue(0);
      audioLevelAnimated.setValue(0);
      return; // Don't proceed
    }

    // Prevent starting a new recording if one is already in progress
    if (recording) {
      console.warn('Recording already in progress. Ignoring start request.');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });

      const { recording: newRecording, status } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        onRecordingStatusUpdate,
        100
      );
      if (status.isRecording) {
        setRecording(newRecording);
      } else {
        console.error('Recording did not start despite creation call. Status:', status);
        await newRecording
          ?.stopAndUnloadAsync()
          .catch(e => console.error('Error unloading failed recording:', e));
        throw new Error('Recording failed to start');
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
      setIsPressed(false);
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
      pulseAnim.stopAnimation(); // Ensure pulse stops
      pulseAnim.setValue(0);
      audioLevelAnimated.setValue(0);
      setRecording(null);
    }
  };

  const onRecordingStatusUpdate = (status: Audio.RecordingStatus) => {
    // If the recording has stopped unexpectedly (e.g., system interruption)
    if (!status.isRecording && status.isDoneRecording) {
      // Check if the button is still considered pressed by the UI state
      if (isPressed) {
        console.warn('Recording stopped unexpectedly while button was pressed.');
        // Treat this as if the user released the button
        handlePressOut();
      }
      // If !isPressed, it stopped normally via handlePressOut, so do nothing here.
      return;
    }

    // Only update audio level if actively recording
    if (status.isRecording) {
      // Metering is usually dBFS (0 is max, negative values are quieter)
      const metering = status.metering ?? -160; // Default to lowest if undefined
      // Normalize: Clamp between -60dB (very quiet) and 0dB (max)
      // Adjust the range (-60) based on testing for sensitivity
      const clampedMetering = Math.max(-60, Math.min(0, metering));
      // Map the clamped dB range to a 0-1 scale (0 quiet, 1 loud)
      const normalizedLevel = (clampedMetering + 60) / 60;
      setAudioLevel(normalizedLevel);
    }
  };

  const stopRecording = async () => {
    // Ensure there is a recording object to stop
    if (!recording) {
      return;
    }

    try {
      // Stop and unload the recording resources
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setAudioLevel(0);
      if (uri && onAudioRecorded) {
        onAudioRecorded(uri);
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setRecording(null);
      setAudioLevel(0);
    }
  };

  // --- Animation Handlers ---

  const handlePressIn = () => {
    // Prevent multiple triggers if already pressed or no permission
    if (isPressed || permissionResponse?.status === 'denied') return;
    setIsPressed(true);
    startRecording();

    // --- Start Animations ---

    // Button scale down
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 150,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  };

  const handlePressOut = () => {
    // Prevent multiple triggers if not currently pressed
    if (!isPressed) return;
    setIsPressed(false);
    stopRecording(); // Stop recording process

    // --- Reset Animations ---

    // Scale back to normal
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();
  };

  // --- Dynamic Styles ---

  const iconSize = size * 0.45; // Slightly smaller mic icon

  // Enhanced Audio level scaling for mic icon (more pronounced)
  const micIconScale = audioLevelAnimated.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.3, 1.6], // Scale up more significantly
    extrapolate: 'clamp', // Prevent scaling beyond 1.6
  });

  const primaryColor = theme?.colors?.primary;
  const secondaryColor = theme?.colors?.primaryDark;
  const accentColor = theme?.colors.success;

  const buttonBackgroundColor = isPressed
    ? audioLevelAnimated.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [primaryColor, secondaryColor, accentColor],
        extrapolate: 'clamp', // Prevent unexpected colors outside 0-1 range
      })
    : primaryColor;

  return (
    <View style={$containerStyle}>
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Audio Level Rings (Scaling based on audio level) */}
        {isPressed &&
          [...Array(3)].map((_, index) => {
            const ringBaseSize = size * (1.2 + index * 0.3); // Rings start slightly larger and spread out more
            const ringScale = audioLevelAnimated.interpolate({
              inputRange: [0, 0.5, 1],
              // Rings scale up significantly with volume, outer rings scale more
              outputRange: [0.8, 1 + index * 0.2, 1.3 + index * 0.3],
              extrapolate: 'clamp', // Don't scale beyond 1.3 + index * 0.3
            });
            const ringOpacity = audioLevelAnimated.interpolate({
              inputRange: [0, 0.2, 0.6, 1],
              outputRange: [0, 0.6 / (index + 1), 0.5 / (index + 1), 0.1 / (index + 1)],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={`audio-ring-${index}`}
                style={[
                  themed($audioLevelRingStyle),
                  {
                    width: ringBaseSize,
                    height: ringBaseSize,
                    borderRadius: ringBaseSize / 2,
                    opacity: ringOpacity,
                    transform: [{ scale: ringScale }],
                    borderWidth: 1.5,
                  },
                ]}
              />
            );
          })}

        {/* Main button */}
        <TouchableOpacity activeOpacity={1} onPressIn={handlePressIn} onPressOut={handlePressOut}>
          {/* Animated View for background color and scale */}
          <Animated.View
            style={[
              themed($buttonStyle(size)), // Pass size to style function
              {
                borderRadius: size / 2, // Ensure inner view matches shape
                // Apply animated background color
                backgroundColor: buttonBackgroundColor,
                // Apply press-in scale animation
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Animated.View
              style={{
                width: iconSize,
                height: iconSize,
                transform: [{ scale: micIconScale }],
              }}
            >
              <Feather name="mic" size={iconSize} color={theme.colors.text} />
            </Animated.View>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const $containerStyle: ViewStyle = {
  alignItems: 'center',
  justifyContent: 'center',
  paddingBottom: 0,
};

const $buttonStyle = (size: number): ViewStyle => ({
  width: size,
  height: size,
  alignItems: 'center',
  justifyContent: 'center',
});

const $audioLevelRingStyle: ThemedStyle<ViewStyle> = theme => ({
  position: 'absolute',
  borderWidth: 1.5,
  borderColor: theme?.colors?.primary,
});
