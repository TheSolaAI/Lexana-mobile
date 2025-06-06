import { FC } from 'react';
import { View, TouchableOpacity, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';

interface LiveModeInputBarProps {
  /**
   * Callback function called when exiting live mode
   */
  onExitLiveMode: () => void;
  /**
   * Whether the microphone is currently muted
   */
  isMuted?: boolean;
  /**
   * Callback function to toggle microphone mute state
   */
  onToggleMute?: () => void;
}

/**
 * LiveModeInputBar component that provides controls for live mode interaction
 * @param {LiveModeInputBarProps} props - The props for the input bar
 * @returns {JSX.Element} The rendered input bar with controls
 */
export const LiveModeInputBar: FC<LiveModeInputBarProps> = ({
  onExitLiveMode,
  isMuted = false,
  onToggleMute,
}) => {
  const { theme, themed } = useAppTheme();

  return (
    <View style={themed($barContainerStyle)}>
      {/* Close Button */}
      <TouchableOpacity
        style={themed($iconButtonStyle)}
        onPress={onExitLiveMode}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <Feather name="x" size={32} color={theme.colors.text} />
      </TouchableOpacity>

      {/* Microphone Button - Centered */}
      {onToggleMute && (
        <TouchableOpacity
          style={themed(isMuted ? $mutedMicButtonStyle : $activeMicButtonStyle)}
          onPress={onToggleMute}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Feather
            name={isMuted ? 'mic-off' : 'mic'}
            size={32}
            color={isMuted ? theme.colors.error : theme.colors.text}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

// Styles
const $barContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  paddingHorizontal: 20,
  paddingVertical: 20,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  backgroundColor: theme.colors.secondaryBg,
});

const $baseCircleButtonStyle: ThemedStyle<ViewStyle> = _theme => ({
  width: 64,
  height: 64,
  borderRadius: 32,
  alignItems: 'center',
  justifyContent: 'center',
});

const $iconButtonStyle: ThemedStyle<ViewStyle> = theme => ({
  ...$baseCircleButtonStyle(theme),
  backgroundColor: theme.colors.surface,
  borderWidth: 1,
  borderColor: theme.colors.border,
});

const $micButtonStyle: ThemedStyle<ViewStyle> = theme => ({
  ...$baseCircleButtonStyle(theme),
  padding: 16,
});

const $activeMicButtonStyle: ThemedStyle<ViewStyle> = theme => ({
  ...$micButtonStyle(theme),
  backgroundColor: theme.colors.primary,
});

const $mutedMicButtonStyle: ThemedStyle<ViewStyle> = theme => ({
  ...$micButtonStyle(theme),
  backgroundColor: theme.colors.surface,
  borderWidth: 2,
  borderColor: theme.colors.error,
});
