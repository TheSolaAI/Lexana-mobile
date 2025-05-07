import { useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, ViewStyle, TextStyle } from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import { Feather } from '@expo/vector-icons';
import { usePrivy } from '@privy-io/expo';
import { ThemedStyle } from '@/theme';
import { navigate } from '@/navigators/navigationUtilities';

interface ProfileSectionProps {
  opacity?: Animated.Value;
  onClose?: () => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  opacity = new Animated.Value(1),
  onClose,
}) => {
  const { themed, theme } = useAppTheme();
  const { user } = usePrivy();

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      friction: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  const handleNavigateToSettings = () => {
    if (onClose) onClose(); // Close sidebar if needed
    navigate('SettingsScreen');
  };

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        style={themed($profileButton)}
        activeOpacity={0.8}
        onPress={handleNavigateToSettings}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={themed($avatarContainer)}>
          <View style={themed($avatarFallback)}>
            <Feather name="user" size={20} color={theme.colors.background} />
          </View>
        </View>

        <View style={$profileTextContainer}>
          <Text style={themed($nameText)} numberOfLines={1}>
            {user?.id ? `${user.id.slice(12, 16)}...${user.id.slice(-4)}` : 'User'}
          </Text>
        </View>

        <Feather name="settings" size={18} color={theme.colors.textDim} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const $profileButton: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.background,
  borderRadius: 12,
  padding: 12,
  borderWidth: 1,
  borderColor: theme.colors.border,
});

const $avatarContainer: ThemedStyle<ViewStyle> = theme => ({
  width: 36,
  height: 36,
  borderRadius: 18,
  overflow: 'hidden',
  marginRight: 12,
  backgroundColor: theme.colors.surface,
});

const $avatarFallback: ThemedStyle<ViewStyle> = theme => ({
  width: '100%',
  height: '100%',
  backgroundColor: theme.colors.primary,
  borderRadius: 18,
  justifyContent: 'center',
  alignItems: 'center',
});

const $profileTextContainer: ViewStyle = {
  flex: 1,
  marginRight: 8,
};

const $nameText: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 14,
  fontWeight: '500',
});
