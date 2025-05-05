// Modified Sidebar.tsx
import { FC, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  TextStyle,
  ViewStyle,
  PanResponder,
  PanResponderGestureState,
} from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import { Feather } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { ThemedStyle } from '@/theme';
import { setCurrentRoom, createChatRoom } from '@/stores/slices/chatRoomsSlice';
import { Text } from '@/components/general';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  swipeProgress?: Animated.Value; // track swipe progress from ChatScreen
}

export const Sidebar: FC<SidebarProps> = ({ isOpen, setIsOpen, swipeProgress }) => {
  /**
   * Refs
   */
  const slideAnimation = useRef(new Animated.Value(isOpen ? 0 : -300)).current;
  const fadeAnimation = useRef(new Animated.Value(isOpen ? 1 : 0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const scrollEnabled = useRef(true);

  /**
   * Global State
   */
  const { themed, theme } = useAppTheme();
  const { rooms, currentRoom } = useAppSelector(state => state.chatRooms);
  const dispatch = useAppDispatch();

  /**
   * Local State
   */
  const windowWidth = Dimensions.get('window').width;
  const sidebarWidth = windowWidth * 0.8;

  useEffect(() => {
    if (swipeProgress) {
      const id = swipeProgress.addListener(({ value }) => {
        const sidebarPos = -sidebarWidth + value;
        const clampedPos = Math.min(0, Math.max(-sidebarWidth, sidebarPos)); // limiter
        slideAnimation.setValue(clampedPos);
        const progress = (clampedPos + sidebarWidth) / sidebarWidth;
        fadeAnimation.setValue(progress);
      });
      return () => {
        swipeProgress.removeListener(id);
      };
    }
  }, [swipeProgress, sidebarWidth, slideAnimation, fadeAnimation]);

  const handleSwipe = (gestureState: PanResponderGestureState) => {
    if (gestureState.dx < 0 && isOpen) {
      scrollEnabled.current = false;
      const newPosition = Math.max(gestureState.dx, -sidebarWidth);
      slideAnimation.setValue(newPosition);
      const newOpacity = Math.max(0, 1 + newPosition / sidebarWidth);
      fadeAnimation.setValue(newOpacity);
    }
  };

  // Create pan responder for swipe gestures within the sidebar
  const panResponder = useRef(
    PanResponder.create({
      // Ask to be the responder for left swipes to close the sidebar
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,

      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        if (isOpen && gestureState.dx < -5) {
          return true;
        }
        return false;
      },

      onPanResponderGrant: () => {
        scrollEnabled.current = false;
      },

      onPanResponderMove: (_, gestureState) => {
        handleSwipe(gestureState);
      },

      onPanResponderRelease: (_, gestureState) => {
        scrollEnabled.current = true;

        // If swiped left sufficiently, close the sidebar
        if (gestureState.dx < -sidebarWidth / 4 && isOpen) {
          setIsOpen(false);
        } else if (isOpen) {
          // Otherwise, return to open position
          Animated.parallel([
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
          ]).start();
        }
      },

      onPanResponderTerminate: () => {
        // Re-enable scrolling if terminated
        scrollEnabled.current = true;
        // Return sidebar to open position
        if (isOpen) {
          Animated.parallel([
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
          ]).start();
        }
      },
    })
  ).current;

  // Effect for animations when sidebar opens/closes using state rather than gesture
  useEffect(() => {
    // Only animate if we're not being controlled by swipeProgress
    if (!swipeProgress || !swipeProgress.hasListeners) {
      Animated.timing(slideAnimation, {
        toValue: isOpen ? 0 : -sidebarWidth,
        duration: 200,
        useNativeDriver: true,
      }).start();
      Animated.timing(fadeAnimation, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnimation, isOpen, sidebarWidth, slideAnimation, swipeProgress]);

  /**
   * Handle clicking on a chat room
   */
  const handleRoomClick = (roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      dispatch(setCurrentRoom(room));
      setIsOpen(false);
    }
  };

  /**
   * Create a new chat
   */
  const handleNewChat = () => {
    dispatch(createChatRoom({ name: 'New Chat' }));
    setIsOpen(false);
  };

  return (
    <View
      style={[
        themed($outerContainer),
        {
          width: sidebarWidth,
          transform: [{ translateX: 0 }],
          zIndex: 5,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Animated.View
        style={[
          themed($sidebarContainer),
          {
            width: sidebarWidth,
            transform: [{ translateX: slideAnimation }],
            opacity: fadeAnimation, // Make sure the sidebar fades in as it appears
          },
        ]}
      >
        {/* Header */}
        <View style={$headerContainer}>
          <Animated.View style={[$headerContent, { opacity: fadeAnimation }]}>
            <Text style={themed($titleStyle)} preset="heading" tx="common:appName" />
            <View style={themed($betaTag)}>
              <Text preset="default" tx="common:beta" />
            </View>
          </Animated.View>
        </View>

        {/* New Chat Button */}
        <View style={$newChatButtonContainer}>
          <Animated.View style={{ opacity: fadeAnimation, width: '100%' }}>
            <TouchableOpacity style={themed($newChatButton)} onPress={handleNewChat}>
              <Text style={themed($newChatButtonText)}>New Chat</Text>
              <Feather name="plus" size={18} color={theme.colors.text} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Chat Rooms List */}
        <Animated.View style={[$chatListContainer, { opacity: fadeAnimation }]}>
          <View style={$chatListHeaderContainer}>
            <Text preset="pageSubHeading">Recents</Text>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={$scrollViewStyle}
            showsVerticalScrollIndicator={false}
            scrollEnabled={scrollEnabled.current}
            bounces={false}
            onTouchStart={e => {
              if (!scrollEnabled.current) {
                e.stopPropagation();
              }
            }}
          >
            {rooms.map(room => {
              if (!room.id) return null;
              const isActive = currentRoom?.id === room.id;

              return (
                <View key={room.id} style={$roomItemWrapper}>
                  <TouchableOpacity
                    style={[themed($roomItem), isActive && themed($activeRoomItem)]}
                    onPress={() => handleRoomClick(room.id!)}
                  >
                    <Text preset="default" numberOfLines={1} ellipsizeMode="tail">
                      {room.name.charAt(0).toUpperCase() + room.name.slice(1)}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Bottom Section - Profile Button */}
        <View style={$bottomSection}>
          <Animated.View style={{ opacity: fadeAnimation }}></Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

// Styles
const $outerContainer: ViewStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  zIndex: 100,
  backgroundColor: 'transparent',
};

const $sidebarContainer: ThemedStyle<ViewStyle> = theme => ({
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  zIndex: 100,
  backgroundColor: theme.colors.secondaryBg,
  borderTopRightRadius: 16,
  borderBottomRightRadius: 16,
  borderRightWidth: 1,
  borderColor: theme.colors.border,
  padding: 10,
  paddingTop: 40,
  width: '100%',
  height: '100%',
});

const $headerContainer: ViewStyle = {
  height: 40,
  marginBottom: 30,
  justifyContent: 'center',
};

const $headerContent: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
};

const $titleStyle: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 24,
});

const $betaTag: ThemedStyle<TextStyle> = theme => ({
  backgroundColor: theme.colors.primary,
  paddingHorizontal: 5,
  paddingVertical: 1,
  borderRadius: 10,
  overflow: 'hidden',
  marginBottom: 15,
});

const $newChatButtonContainer: ViewStyle = {
  height: 50,
  marginBottom: 24,
  justifyContent: 'center',
  alignItems: 'center',
};

const $newChatButton: ThemedStyle<ViewStyle> = theme => ({
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.colors.background,
  borderWidth: 1,
  borderColor: theme.colors.primary,
  borderRadius: 12,
  paddingVertical: 12,
  paddingHorizontal: 16,
  width: '100%',
  gap: 8,
});

const $newChatButtonText: ThemedStyle<TextStyle> = theme => ({
  color: theme.colors.text,
  fontSize: 16,
  fontWeight: '500',
});

const $chatListContainer: ViewStyle = {
  flex: 1,
  marginBottom: 16,
};

const $chatListHeaderContainer: ViewStyle = {
  marginBottom: 8,
};

const $scrollViewStyle: ViewStyle = {
  flex: 1,
};

const $roomItemWrapper: ViewStyle = {
  marginBottom: 4,
  position: 'relative',
};

const $roomItem: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'transparent',
  paddingVertical: 10,
  paddingHorizontal: 8,
  borderRadius: 10,
};

const $activeRoomItem: ThemedStyle<ViewStyle> = theme => ({
  backgroundColor: theme.colors.surface,
});

const $bottomSection: ViewStyle = {
  height: 50,
  justifyContent: 'center',
  marginBottom: 16,
  position: 'relative',
};
