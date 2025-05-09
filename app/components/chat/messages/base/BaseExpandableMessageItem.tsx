import { FC, ReactNode, useState, useRef } from 'react';
import {
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';

interface BaseExpandableMessageItemProps {
  title: string;
  icon?: ReactNode;
  compactContent: ReactNode;
  expandedContent: ReactNode;
  footer?: ReactNode;
  initialExpanded?: boolean;
  maxHeight?: number;
  onPress?: () => void;
}

export const BaseExpandableMessageItem: FC<BaseExpandableMessageItemProps> = ({
  title,
  icon,
  compactContent,
  expandedContent,
  footer,
  initialExpanded = false,
  maxHeight = 500,
  onPress,
}) => {
  const { themed } = useAppTheme();
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const animatedHeight = useRef(new Animated.Value(initialExpanded ? maxHeight : 100)).current;
  const animatedOpacity = useRef(new Animated.Value(1)).current;
  const animatedScale = useRef(new Animated.Value(1)).current;

  const toggleExpand = () => {
    // Trigger animations
    Animated.parallel([
      Animated.timing(animatedHeight, {
        toValue: isExpanded ? 100 : contentHeight || maxHeight,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(animatedOpacity, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
      Animated.sequence([
        Animated.timing(animatedScale, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: false,
        }),
        Animated.timing(animatedScale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]),
    ]).start();

    setIsExpanded(!isExpanded);

    if (onPress) {
      onPress();
    }
  };

  // Handler for measuring expanded content height
  const onExpandedContentLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    if (height > 0 && contentHeight !== height) {
      setContentHeight(Math.min(height + 32, maxHeight)); // Add padding and cap at maxHeight

      // If already expanded, update the animated height
      if (isExpanded) {
        animatedHeight.setValue(Math.min(height + 32, maxHeight));
      }
    }
  };

  // Compact view content
  const CompactView = () => (
    <View>
      {/* Compact Header */}
      <View style={themed($compactHeaderStyle)}>
        <View style={$headerLeftContentStyle}>
          {icon && <View style={themed($iconContainerStyle)}>{icon}</View>}
          <Text preset="pageSubHeading" style={themed($titleStyle)}>
            {title}
          </Text>
        </View>
        <View>{compactContent}</View>
      </View>

      {/* Compact Footer */}
      {footer && <View style={themed($footerStyle)}>{footer}</View>}
    </View>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={toggleExpand}
      style={[
        $wrapperStyle,
        {
          maxWidth: isExpanded ? '100%' : '80%',
        },
      ]}
    >
      <Animated.View
        style={[
          themed($containerStyle),
          {
            maxHeight: animatedHeight,
            opacity: animatedOpacity,
            transform: [{ scale: animatedScale }],
          },
        ]}
      >
        {isExpanded ? (
          <View onLayout={onExpandedContentLayout}>{expandedContent}</View>
        ) : (
          <CompactView />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Styles
const $wrapperStyle: ViewStyle = {
  marginVertical: 4,
  alignSelf: 'flex-start',
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
});

const $compactHeaderStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
});

const $headerLeftContentStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

const $iconContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: `${theme.colors.surface}30`,
  padding: 4,
  borderRadius: 8,
});

const $titleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 14,
});

const $footerStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: `${theme.colors.surface}20`,
});
