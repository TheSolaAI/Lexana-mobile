import { View, ViewStyle, TextStyle, ScrollView } from 'react-native';
import { Screen, Text, ThemeToggleButton } from '@/components/general';
import { ThemedStyle } from '@/theme';
import { useAppTheme } from '@/utils/useAppTheme';
import { Feather } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useEmbeddedSolanaWallet, useHeadlessDelegatedActions, usePrivy } from '@privy-io/expo';
import { navigate } from '@/navigators/navigationUtilities';
import { AppStackScreenProps } from '@/navigators/AppNavigator';
import { useFundSolanaWallet } from '@privy-io/expo/ui';

interface SettingsScreenProps extends AppStackScreenProps<'SettingsScreen'> {}

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const { themed, theme } = useAppTheme();
  const { user, logout } = usePrivy();
  const { wallets } = useEmbeddedSolanaWallet();
  const { fundWallet } = useFundSolanaWallet();
  const { delegateWallet } = useHeadlessDelegatedActions();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBack = () => {
    navigate('ChatScreen');
  };

  return (
    <Screen
      preset="scroll"
      contentContainerStyle={themed($contentContainer)}
      safeAreaEdges={['top', 'bottom']}
    >
      {/* Header with back button */}
      <View style={$headerContainer}>
        <TouchableOpacity
          onPress={handleBack}
          style={$backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text preset="pageHeading" text="Settings" style={$headerTitle} />
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={$scrollViewStyle} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={themed($sectionContainer)}>
          <Text preset="pageHeading" text="Account" style={$sectionTitle} />
          <View style={themed($cardContainer)}>
            <View style={$userInfoContainer}>
              <View style={themed($avatarContainer)}>
                <Feather name="user" size={24} color={theme.colors.background} />
              </View>
              <View style={$userTextContainer}>
                <Text preset="bold" style={themed($userName)}>
                  {user?.id ? `${user.id.slice(0, 6)}...${user.id.slice(-4)}` : 'User'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Wallet Section */}
        <View style={themed($sectionContainer)}>
          <Text preset="pageHeading" text="Wallet" style={$sectionTitle} />
          <View style={themed($cardContainer)}>
            <View style={$walletContainer}>
              <View style={$walletHeader}>
                <Text preset="bold" style={themed($walletTitle)}>
                  Privy Embedded Wallet
                </Text>
                <View style={themed($defaultBadge)}>
                  <Text preset="small" style={themed($defaultText)}>
                    Default
                  </Text>
                </View>
              </View>

              <View style={$keyContainer}>
                <Text preset="default" style={themed($keyLabel)}>
                  Public Key
                </Text>
                <View style={themed($keyValueContainer)}>
                  <Text preset="default" style={themed($keyValue)} numberOfLines={1}>
                    {wallets?.map(wallet => wallet.publicKey) || 'Not available'}
                  </Text>
                  <TouchableOpacity
                    style={$copyButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather name="copy" size={20} color={theme.colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={$exportButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Feather name="external-link" size={20} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={$walletActions}>
                <TouchableOpacity
                  style={themed($walletActionButton)}
                  onPress={() => fundWallet({ address: wallets ? wallets[0].address : '' })}
                >
                  <Feather name="dollar-sign" size={18} color={theme.colors.text} />
                  <Text style={themed($actionButtonText)}>Fund</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={themed($walletActionButton)}
                  onPress={async () =>
                    delegateWallet({
                      address: wallets ? wallets[0].address : '',
                      chainType: 'solana',
                    })
                  }
                >
                  <Feather name="users" size={18} color={theme.colors.text} />
                  <Text style={themed($actionButtonText)}>Delegate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={themed($sectionContainer)}>
          <Text preset="pageHeading" text="Appearance" style={$sectionTitle} />
          <View style={themed($cardContainer)}>
            <View style={$appearanceContainer}>
              <Text style={themed($settingLabel)}>Theme</Text>
              <ThemeToggleButton />
            </View>
          </View>
        </View>

        {/* Logout Section */}
        <View style={themed($sectionContainer)}>
          <View style={themed($cardContainer)}>
            <TouchableOpacity style={$logoutButton} onPress={handleLogout}>
              <Feather name="log-out" size={20} color={theme.colors.error} />
              <Text style={themed($logoutText)}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const $contentContainer: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.background,
  flexGrow: 1,
});

const $headerContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginBottom: 8,
};

const $backButton: ViewStyle = {
  padding: 8,
};

const $headerTitle: TextStyle = {
  textAlign: 'center',
};

const $scrollViewStyle: ViewStyle = {
  flex: 1,
};

const $sectionContainer: ThemedStyle<ViewStyle> = theme => ({
  marginBottom: 24,
  paddingHorizontal: 16,
});

const $sectionTitle: TextStyle = {
  marginBottom: 8,
};

const $cardContainer: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.secondaryBg,
  borderRadius: 12,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: theme.colors.border,
});

const $userInfoContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 16,
};

const $avatarContainer: ThemedStyle<ViewStyle> = theme => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: theme.colors.primary,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
});

const $userTextContainer: ViewStyle = {
  flex: 1,
};

const $userName: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 16,
});

const $walletContainer: ViewStyle = {
  padding: 16,
};

const $walletHeader: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
};

const $walletTitle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 16,
});

const $defaultBadge: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.primaryDark,
  borderRadius: 4,
  paddingHorizontal: 8,
  paddingVertical: 2,
  marginLeft: 8,
});

const $defaultText: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 12,
});

const $keyContainer: ViewStyle = {
  marginBottom: 16,
};

const $keyLabel: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  marginBottom: 4,
});

const $keyValueContainer: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: theme.colors.secondaryBg,
  borderRadius: 4,
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderWidth: 1,
  borderColor: theme.colors.border,
});

const $keyValue: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  flex: 1,
});

const $copyButton: ViewStyle = {
  padding: 4,
  marginLeft: 8,
};

const $exportButton: ViewStyle = {
  padding: 4,
  marginLeft: 8,
};

const $walletActions: ViewStyle = {
  flexDirection: 'row',
  width: '100%',
  justifyContent: 'space-between',
};

const $walletActionButton: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48%',
  padding: 8,
  borderWidth: 1,
  borderColor: theme.colors.border,
  borderRadius: 4,
});

const $actionButtonText: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  marginLeft: 4,
});

const $appearanceContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 16,
};

const $settingLabel: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 16,
});

const $logoutButton: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
};

const $logoutText: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.error,
  marginLeft: 8,
  fontSize: 16,
});
