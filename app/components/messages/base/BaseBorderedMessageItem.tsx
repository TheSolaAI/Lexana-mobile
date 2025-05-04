import { FC, ReactNode } from 'react';
import { View, ViewStyle, TouchableOpacity, TextStyle } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';

interface BaseBorderedMessageItemProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onPress?: () => void;
}

export const BaseBorderedMessageItem: FC<BaseBorderedMessageItemProps> = ({
  title,
  subtitle,
  icon,
  children,
  footer,
  onPress,
}) => {
  const { themed } = useAppTheme();

  return (
    <View style={$messageWrapperStyle}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={themed($messageContainerStyle)}
        onPress={onPress}
        disabled={!onPress}
      >
        {/* Header */}
        <View style={themed($headerStyle)}>
          <View style={$titleContainer}>
            {icon && <View style={$iconContainer}>{icon}</View>}
            <Text preset="heading" style={themed($titleStyle)}>
              {title}
            </Text>
          </View>
          {subtitle && (
            <View style={themed($subtitleContainerStyle)}>
              <Text preset="small" style={themed($subtitleStyle)}>
                {subtitle}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={$contentStyle}>{children}</View>

        {/* Footer */}
        {footer && <View style={themed($footerStyle)}>{footer}</View>}
      </TouchableOpacity>
    </View>
  );
};

// Styles
const $messageWrapperStyle: ViewStyle = {
  marginVertical: 4,
  width: '100%',
};

const $messageContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  borderRadius: 16,
  backgroundColor: theme.colors.secondaryBg,
  borderWidth: 1,
  borderColor: theme.colors.border,
  // shadowColor: theme.colors.shadow,
  // shadowOffset: { width: 0, height: 2 },
  // shadowOpacity: 0.1,
  // shadowRadius: 8,
  elevation: 2,
  overflow: 'hidden',
});

const $headerStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
  backgroundColor: `${theme.colors.primary}10`,
});

const $titleContainer: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

const $iconContainer: ViewStyle = {
  marginRight: 4,
};

const $titleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 18,
});

const $subtitleContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: `${theme.colors.surface}50`,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 4,
});

const $subtitleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 12,
});

const $contentStyle: ViewStyle = {
  padding: 16,
};

const $footerStyle: ThemedStyle<ViewStyle> = theme => ({
  paddingHorizontal: 16,
  paddingVertical: 12,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
  backgroundColor: `${theme.colors.surface}20`,
});
