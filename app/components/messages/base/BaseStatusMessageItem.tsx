import { FC, ReactNode } from 'react';
import { View, ViewStyle, TouchableOpacity, Animated, TextStyle } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';

type StatusType = 'success' | 'error' | 'pending' | 'default';

interface BaseStatusMessageItemProps {
  title: string;
  status: StatusType;
  statusText?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onPress?: () => void;
}

export const BaseStatusMessageItem: FC<BaseStatusMessageItemProps> = ({
  title,
  status,
  statusText,
  icon,
  children,
  footer,
  onPress,
}) => {
  const { themed, theme } = useAppTheme();

  // Define color schemes based on status
  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return {
          bgColor: `${theme.colors.success}10`,
          iconBg: `${theme.colors.success}20`,
          textColor: theme.colors.success,
        };
      case 'error':
        return {
          bgColor: `${theme.colors.error}10`,
          iconBg: `${theme.colors.error}20`,
          textColor: theme.colors.error,
        };
      case 'pending':
        return {
          bgColor: `${theme.colors.warning}10`,
          iconBg: `${theme.colors.warning}20`,
          textColor: theme.colors.warning,
        };
      default:
        return {
          bgColor: `${theme.colors.primary}10`,
          iconBg: `${theme.colors.primary}20`,
          textColor: theme.colors.primary,
        };
    }
  };

  const colors = getStatusColors();

  // Create style objects with current color values
  const headerColorStyle = { backgroundColor: colors.bgColor };
  const iconBgStyle = { backgroundColor: colors.iconBg };
  const textColorStyle = { color: colors.textColor };

  return (
    <TouchableOpacity
      style={$wrapperStyle}
      activeOpacity={0.9}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={themed($containerStyle)}>
        {/* Decorative background element - using absolute positioning */}
        <View style={$backgroundDecoratorContainer}>
          <Animated.View style={[iconBgStyle, $topRightDecoratorStyle]} />
          <Animated.View style={[iconBgStyle, $bottomLeftDecoratorStyle]} />
        </View>

        {/* Header */}
        <View style={[themed($headerStyle), headerColorStyle]}>
          <View style={$headerContentStyle}>
            {icon && <View style={[iconBgStyle, $iconContainerStyle]}>{icon}</View>}
            <Text preset="pageSubHeading" style={themed($titleStyle)}>
              {title}
            </Text>
          </View>

          {statusText && (
            <View style={themed($statusContainerStyle)}>
              <Text style={[themed($statusTextStyle), textColorStyle]}>{statusText}</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={$contentStyle}>{children}</View>

        {/* Footer */}
        {footer && <View style={themed($footerStyle)}>{footer}</View>}
      </View>
    </TouchableOpacity>
  );
};

// Styles
const $wrapperStyle: ViewStyle = {
  marginVertical: 4,
  width: '100%',
};

const $containerStyle: ThemedStyle<ViewStyle> = theme => ({
  borderRadius: 16,
  backgroundColor: theme.colors.secondaryBg,
  borderWidth: 1,
  borderColor: theme.colors.border,
  // shadowColor: theme.colors.shadow,
  // shadowOffset: { width: 0, height: 2 },
  // shadowOpacity: 0.1,
  // shadowRadius: 4,
  elevation: 2,
  overflow: 'hidden',
  position: 'relative',
});

const $backgroundDecoratorContainer: ViewStyle = {
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
};

const $topRightDecoratorStyle: ViewStyle = {
  position: 'absolute',
  top: -50,
  right: -50,
  width: 100,
  height: 100,
  borderRadius: 50,
  opacity: 0.5,
};

const $bottomLeftDecoratorStyle: ViewStyle = {
  position: 'absolute',
  bottom: -50,
  left: -50,
  width: 100,
  height: 100,
  borderRadius: 50,
  opacity: 0.5,
};

const $headerStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
  zIndex: 2,
});

const $headerContentStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
};

const $iconContainerStyle: ViewStyle = {
  width: 40,
  height: 40,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
  elevation: 3,
};

const $titleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
});

const $statusContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: `${theme.colors.surface}50`,
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'center',
});

const $statusTextStyle: TextStyle = {
  fontSize: 12,
};

const $contentStyle: ViewStyle = {
  padding: 16,
  zIndex: 2,
};

const $footerStyle: ThemedStyle<ViewStyle> = theme => ({
  padding: 12,
  backgroundColor: `${theme.colors.surface}20`,
  borderTopWidth: 1,
  borderTopColor: theme.colors.border,
  zIndex: 2,
});
