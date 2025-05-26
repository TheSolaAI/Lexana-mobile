import { FC, useState, useEffect } from 'react';
import { TextInput, TextStyle, View, ViewStyle, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
}

/**
 * InputCard component that provides a text input with animated mic/send button and live mode toggle
 * @param onSendMessage - Callback function to handle sending text messages
 * @param onAudioRecorded - Callback function to handle audio recording
 * @param onEnterLiveMode - Callback function to enter live mode
 */
export const InputCard: FC<InputCardProps> = ({
  onSendMessage,
  onAudioRecorded: _onAudioRecorded,
  onEnterLiveMode,
}) => {
  const { themed, theme } = useAppTheme();
  const [inputText, setInputText] = useState('');
  const hasText = inputText.trim().length > 0;
  const iconFade = useSharedValue(hasText ? 1 : 0);
  const liveModeAnim = useSharedValue(hasText ? 0 : 1);
  const toolbarAnim = useSharedValue(0); // 0: normal, 1: offscreen
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    iconFade.value = withTiming(hasText ? 1 : 0, { duration: 200 });
    liveModeAnim.value = withTiming(hasText ? 0 : 1, { duration: 250 });
  }, [hasText]);

  /**
   * Handles sending the message when send button is pressed
   */
  const handleSendPress = () => {
    if (hasText) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  /**
   * Handles text input changes
   */
  const handleTextChange = (text: string) => {
    setInputText(text);
  };

  // Animated style for send icon (fade in and rotate up)
  const sendIconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: iconFade.value,
    transform: [{ rotate: `${-90 * iconFade.value}deg` }],
  }));

  // Animated style for mic icon (fade out)
  const micIconAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 1 - iconFade.value,
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
    // Animate: fall (0->1)
    toolbarAnim.value = 0;
    toolbarAnim.value = withTiming(1, { duration: 400 }, () => {
      runOnJS(onEnterLiveMode)();
    });
  };

  return (
    <Animated.View style={[themed($containerStyle), toolbarAnimatedStyle]}>
      <TextInput
        placeholder={translate('chatScreen:voiceMode.placeholder')}
        placeholderTextColor={theme.colors.textDim}
        value={inputText}
        onChangeText={handleTextChange}
        autoFocus
        style={themed($inputStyle)}
        multiline
      />
      <View style={$bottomContainerStyle}>
        {/* Live Mode Button  */}
        <Animated.View style={liveModeButtonAnimatedStyle}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
            onPress={handleEnterLiveMode}
            activeOpacity={0.7}
          >
            <MaterialIcons name="graphic-eq" size={24} color={theme.colors.textDim} />
            <Animated.Text
              style={[themed($liveModeTextStyle), liveModeTextAnimatedStyle]}
              numberOfLines={1}
            >
              {translate('chatScreen:liveMode.title')}
            </Animated.Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Mic/Send Button (Right) */}
        <TouchableOpacity
          style={themed($micSendButtonStyle)}
          onPress={handleSendPress}
          activeOpacity={0.7}
        >
          <View style={$animatedButtonContainer}>
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
              <MaterialIcons name="mic" size={24} color={theme.colors.textDim} />
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
              <View style={$sendIconContainerStyle(theme)}>
                <MaterialIcons name="send" size={24} color={theme.colors.primary} />
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

const $sendIconContainerStyle = (theme: any): ViewStyle => ({
  backgroundColor: theme.colors.surface,
  borderRadius: 22,
  width: 44,
  height: 44,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: theme.colors.border,
});
