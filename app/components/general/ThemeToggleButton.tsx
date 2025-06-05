import { useRef, useEffect } from 'react';
import { ViewStyle, Animated, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';

interface ThemeToggleButtonProps {
  isDark: boolean;
}

/**
 * A presentational component that displays the theme toggle button with animation
 * @param isDark - Whether the current theme is dark mode
 */
export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ isDark }) => {
  // Animation values
  const rotateAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Update animation when theme changes
  useEffect(() => {
    // Immediately update the icon
    rotateAnim.setValue(isDark ? 1 : 0);
    
    // Quick scale animation for feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isDark, rotateAnim, scaleAnim]);

  // Calculate interpolated rotation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const { theme, themed } = useAppTheme();

  return (
    <Animated.View
      style={[
        styles.iconContainer,
        themed($iconContainer),
        {
          transform: [{ rotate: spin }, { scale: scaleAnim }],
        },
      ]}
    >
      {isDark ? (
        <Feather name="moon" size={20} color={theme.colors.text} />
      ) : (
        <Feather name="sun" size={20} color={theme.colors.text} />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 'auto',
  },
  iconContainer: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});

const $iconContainer: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.surface,
  borderWidth: 1,
  borderColor: theme.colors.border,
});
