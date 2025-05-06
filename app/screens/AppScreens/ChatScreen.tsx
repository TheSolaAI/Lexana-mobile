/* eslint-disable react-native/no-color-literals */
import { AppStackScreenProps } from '@/navigators/AppNavigator';
import { FC, useState, useRef, useEffect } from 'react';
import { Screen } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { $styles } from '@/theme';
import { Screenheader } from '@/components/app/ScreenHeader';
import { ViewStyle, Animated, Dimensions, PanResponder } from 'react-native';
import { PushToTalkButton } from '@/components/chat/PushToTalkButton';
import { Sidebar } from '@/components/sidebar';
import { useChatFunctions } from '@/hooks/ChatHandler';
import { Chat } from '@/components/chat/Chat';

interface ChatScreenProps extends AppStackScreenProps<'ChatScreen'> {}

export const ChatScreen: FC<ChatScreenProps> = () => {
  /**
   * Global State
   */
  const { themed } = useAppTheme();
  const { onAudioMessage, messages } = useChatFunctions();

  /**
   * Local State
   */
  const [sidebarVisible, setSidebarVisible] = useState(false);

  // Animation for chat screen movement and opacity
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  // Create a shared animation value for the sidebar - this is the key improvement
  const swipeProgress = useRef(new Animated.Value(0)).current;

  const windowWidth = Dimensions.get('window').width;
  const slideDistance = windowWidth * 0.8; // must match sidebar width

  // Update animation when sidebar visibility changes (via button press)
  useEffect(() => {
    // This handles the case when sidebar is opened/closed via button rather than gesture
    Animated.parallel([
      Animated.spring(swipeProgress, {
        toValue: sidebarVisible ? slideDistance : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.spring(slideAnimation, {
        toValue: sidebarVisible ? slideDistance : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }),
      Animated.timing(fadeAnimation, {
        toValue: sidebarVisible ? 0.4 : 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [sidebarVisible, slideDistance]);

  // Create pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      // Allow becoming the responder on touch start - important for detecting initial touches
      onStartShouldSetPanResponder: () => {
        if (sidebarVisible) return false;
        return true;
      },
      onStartShouldSetPanResponderCapture: () => false,

      onMoveShouldSetPanResponder: (evt, gestureState) => {
        if (sidebarVisible) return false;
        return (
          gestureState.dx > 10 && // Must be moving right
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2) // More horizontal than vertical
        );
      },

      onMoveShouldSetPanResponderCapture: () => false,

      // Handle the actual swipe
      onPanResponderGrant: () => {
        // Touch started - prepare for gesture
        slideAnimation.setOffset(0);
        swipeProgress.setOffset(0);
        slideAnimation.setValue(0);
        swipeProgress.setValue(0);
      },

      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx > 0 && !sidebarVisible) {
          // Limit the drag to the sidebar width
          const newTranslateX = Math.min(gestureState.dx, slideDistance);

          // Update both animations
          slideAnimation.setValue(newTranslateX);
          swipeProgress.setValue(newTranslateX);

          // Calculate opacity based on position
          const newOpacity = 1 - (newTranslateX / slideDistance) * 0.6;
          fadeAnimation.setValue(newOpacity);
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        // Clear offsets
        slideAnimation.flattenOffset();
        swipeProgress.flattenOffset();

        // If swiped right more than 1/5 of the screen width, open sidebar
        if (gestureState.dx > windowWidth / 3 && !sidebarVisible) {
          Animated.parallel([
            Animated.spring(swipeProgress, {
              toValue: slideDistance,
              useNativeDriver: true,
              friction: 8,
              tension: 40,
            }),
            Animated.spring(slideAnimation, {
              toValue: slideDistance,
              useNativeDriver: true,
              friction: 8,
              tension: 40,
            }),
            Animated.timing(fadeAnimation, {
              toValue: 0.4,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Update state after animation completes
            setSidebarVisible(true);
          });
        } else if (!sidebarVisible) {
          // Otherwise, return to closed position
          Animated.parallel([
            Animated.spring(swipeProgress, {
              toValue: 0,
              useNativeDriver: true,
              friction: 8,
              tension: 40,
            }),
            Animated.spring(slideAnimation, {
              toValue: 0,
              useNativeDriver: true,
              friction: 8,
              tension: 40,
            }),
            Animated.timing(fadeAnimation, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },

      onPanResponderTerminate: () => {
        // Gesture was cancelled - reset to initial state
        Animated.parallel([
          Animated.spring(swipeProgress, {
            toValue: sidebarVisible ? slideDistance : 0,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnimation, {
            toValue: sidebarVisible ? slideDistance : 0,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnimation, {
            toValue: sidebarVisible ? 0.4 : 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      },
    })
  ).current;

  /**
   * Handle sidebar close with animation
   */
  const handleCloseSidebar = () => {
    // Animate back to closed state first
    Animated.parallel([
      Animated.timing(swipeProgress, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update state after animation completes
      setSidebarVisible(false);
    });
  };

  // Always attach the panResponder handlers to ensure gestures are captured
  const panHandlers = panResponder.panHandlers;

  return (
    <>
      <Animated.View
        style={{
          flex: 1,
          transform: [{ translateX: slideAnimation }],
          opacity: fadeAnimation,
          zIndex: 10,
        }}
        {...panHandlers} // Only attach panHandlers wwhen sidebar is closed
      >
        <Screen
          preset="fixed"
          safeAreaEdges={['top', 'bottom']}
          contentContainerStyle={[themed($styles.screenContainer), $screenContainerStyle]}
          backgroundColor="transparent"
        >
          <Screenheader
            titleTx="chatScreen:voiceMode.title"
            subtitle="nothing"
            onButtonPress={() => setSidebarVisible(true)}
          />
          <Chat messages={messages} />
        </Screen>
        <PushToTalkButton size={100} onAudioRecorded={onAudioMessage} />
      </Animated.View>
      <Sidebar
        isOpen={sidebarVisible}
        setIsOpen={handleCloseSidebar}
        swipeProgress={swipeProgress}
      />
    </>
  );
};

const $screenContainerStyle: ViewStyle = {
  paddingTop: 10,
  height: '100%',
};
