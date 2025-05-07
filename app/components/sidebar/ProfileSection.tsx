import { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, ViewStyle, TextStyle, Modal } from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import { Feather, Ionicons } from '@expo/vector-icons';
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
  const [modalVisible, setModalVisible] = useState(false);
  const { user, logout } = usePrivy();

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

  const handleLogout = async () => {
    setModalVisible(false);
    if (onClose) onClose();
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigate = (screen: string) => {
    setModalVisible(false);
    if (onClose) onClose();
    navigate(screen);
  };

  return (
    <>
      <Animated.View
        style={{
          opacity,
          transform: [{ scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          style={themed($profileButton)}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
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

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={$modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={themed($modalContainer)}>
            <View style={themed($modalHeader)}>
              <Text style={themed($modalTitle)}>Account</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={themed($menuItems)}>
              <TouchableOpacity
                style={themed($menuItem)}
                onPress={() => handleNavigate('SettingsScreen')}
              >
                <Feather name="settings" size={20} color={theme.colors.text} />
                <Text style={themed($menuItemText)}>Settings</Text>
              </TouchableOpacity>

              <View style={themed($divider)} />

              <TouchableOpacity
                style={{
                  ...themed($menuItem),
                  ...themed($logoutButton),
                }}
                onPress={handleLogout}
              >
                <Feather name="log-out" size={20} color={theme.colors.error} />
                <Text
                  style={{
                    ...themed($menuItemText),
                    ...themed($logoutText),
                  }}
                >
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
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

const $modalOverlay: ViewStyle = {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  justifyContent: 'flex-end',
};

const $modalContainer: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  paddingBottom: 24,
  elevation: 5,
});

const $modalHeader: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 14,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
});

const $modalTitle: ThemedStyle<TextStyle> = theme => ({
  fontSize: 18,
  fontWeight: 'bold',
  color: theme.colors.text,
});

const $menuItems: ThemedStyle<ViewStyle> = theme => ({
  padding: 16,
});

const $menuItem: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  borderRadius: 8,
  paddingHorizontal: 8,
  gap: 12,
});

const $menuItemText: ThemedStyle<TextStyle> = theme => ({
  fontSize: 16,
  color: theme.colors.text,
});

const $divider: ThemedStyle<ViewStyle> = theme => ({
  height: 1,
  backgroundColor: theme.colors.border,
  marginVertical: 12,
});

const $logoutButton: ThemedStyle<ViewStyle> = theme => ({
  marginTop: 4,
});

const $logoutText: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.error,
});
