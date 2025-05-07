import { useRef, useEffect } from 'react';
import { TouchableOpacity, ViewStyle, Animated, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';

export const ThemeToggleButton: React.FC = () => {
  const { theme, themeContext, setThemeContextOverride, themed } = useAppTheme();
  const isDark = themeContext === 'dark';

  // Animation values
  const rotateAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Update animation when theme changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isDark ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [isDark, rotateAnim, scaleAnim]);

  // Calculate interpolated rotation
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  // Toggle theme handler
  const toggleTheme = () => {
    setThemeContextOverride(isDark ? 'light' : 'dark');
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={toggleTheme}
      activeOpacity={0.7}
      hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
    >
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
    </TouchableOpacity>
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
