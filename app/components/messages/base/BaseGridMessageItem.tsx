import { ReactNode, useState, useEffect, Children } from 'react';
import { View, ViewStyle, Dimensions, TextStyle } from 'react-native';
import { Text } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';

interface BaseGridMessageItemProps {
  col: number;
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export const BaseGridMessageItem = ({
  col,
  children,
  title,
  subtitle,
}: BaseGridMessageItemProps) => {
  const { themed } = useAppTheme();
  const [dynamicCols, setDynamicCols] = useState(col);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  // Update dimensions when the screen size changes
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  // Update dynamic columns based on screen width
  useEffect(() => {
    const { width } = dimensions;
    if (width < 400) {
      setDynamicCols(1);
    } else if (width < 700) {
      setDynamicCols(2);
    } else {
      setDynamicCols(Math.min(col, 3)); // Cap at 3 columns max for larger screens
    }
  }, [col, dimensions]);

  const renderContent = () => (
    <View style={$gridContainer}>
      {Children.toArray(children).map((child, index) => (
        <View key={index} style={[$gridItem, { width: `${100 / dynamicCols - 2}%` }]}>
          {child}
        </View>
      ))}
    </View>
  );

  if (title) {
    return (
      <View style={$wrapperStyle}>
        <View style={themed($containerStyle)}>
          {/* Optional Header */}
          <View style={themed($headerStyle)}>
            <Text preset="pageSubHeading" style={themed($titleStyle)}>
              {title}
            </Text>
            {subtitle && (
              <View style={themed($subtitleContainerStyle)}>
                <Text style={themed($subtitleStyle)}>{subtitle}</Text>
              </View>
            )}
          </View>

          {/* Content */}
          <View style={$contentStyle}>{renderContent()}</View>
        </View>
      </View>
    );
  }

  return <View style={$wrapperStyle}>{renderContent()}</View>;
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
  // elevation: 2,
  overflow: 'hidden',
});

const $headerStyle: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 12,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: theme.colors.border,
  backgroundColor: `${theme.colors.primary}10`, // 10% opacity
});

const $titleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
});

const $subtitleContainerStyle: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: `${theme.colors.surface}50`,
  paddingVertical: 4,
  paddingHorizontal: 8,
  borderRadius: 8,
});

const $subtitleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.textDim,
  fontSize: 12,
});

const $contentStyle: ViewStyle = {
  padding: 16,
};

const $gridContainer: ViewStyle = {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  width: '100%',
};

const $gridItem: ViewStyle = {
  marginBottom: 16,
  marginHorizontal: 4,
};
