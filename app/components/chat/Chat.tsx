import { FC, useEffect, useRef } from 'react';
import {
  FlatList,
  View,
  ViewStyle,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useAppTheme } from '@/utils/useAppTheme';
import { ThemedStyle } from '@/theme';
import { UIMessage } from '@ai-sdk/ui-utils';
import { ChatMessage } from './ChatMessage';

interface ChatProps {
  messages: UIMessage[];
}

export const Chat: FC<ChatProps> = ({ messages }) => {
  const { themed } = useAppTheme();
  const flatListRef = useRef<FlatList>(null);
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});
  const scrollToBottomOnNextUpdate = useRef<boolean>(true);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0 && scrollToBottomOnNextUpdate.current) {
      scrollToBottom();
      // Create animation values for new messages that don't have them yet
      messages.forEach(message => {
        if (!animatedValues.current[message.id]) {
          animatedValues.current[message.id] = new Animated.Value(50); // Start from 50 (offscreen) and animate to 0
          // Animate the new message
          Animated.spring(animatedValues.current[message.id], {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 40,
          }).start();
        }
      });
    }
  }, [messages]);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // When user scrolls manually, disable auto-scrolling
    const currentScrollPosition = event.nativeEvent.contentOffset.y;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    const contentHeight = event.nativeEvent.contentSize.height;

    // If within ~20px of the bottom, enable auto-scroll for future updates
    if (contentHeight - currentScrollPosition - scrollViewHeight < 20) {
      scrollToBottomOnNextUpdate.current = true;
    } else {
      scrollToBottomOnNextUpdate.current = false;
    }
  };

  const renderItem = ({ item }: { item: UIMessage }) => {
    // Get the animation value for this item or create one if it doesn't exist
    if (!animatedValues.current[item.id]) {
      animatedValues.current[item.id] = new Animated.Value(0);
    }

    return (
      <Animated.View
        style={[
          $messageWrapperStyle,
          item.role === 'user' ? $userWrapperStyle : $assistantWrapperStyle,
          { transform: [{ translateY: animatedValues.current[item.id] }] },
        ]}
      >
        <ChatMessage message={item} />
      </Animated.View>
    );
  };

  return (
    <View style={themed($chatContainerStyle)}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={$listContentContainerStyle}
        onScroll={onScroll}
        ListFooterComponent={<View style={{ height: 100 }} />}
        scrollEventThrottle={16} // 60fps
        onContentSizeChange={() => {
          if (scrollToBottomOnNextUpdate.current) {
            scrollToBottom();
          }
        }}
        onLayout={() => {
          if (scrollToBottomOnNextUpdate.current) {
            scrollToBottom();
          }
        }}
      />
    </View>
  );
};

const $listContentContainerStyle: ViewStyle = {
  padding: 16,
  gap: 16,
};

const $messageWrapperStyle: ViewStyle = {
  flexDirection: 'row',
  marginBottom: 8,
};

const $userWrapperStyle: ViewStyle = {
  justifyContent: 'flex-end',
};

const $assistantWrapperStyle: ViewStyle = {
  justifyContent: 'flex-start',
};

const $chatContainerStyle: ThemedStyle<ViewStyle> = theme => {
  return {
    flex: 1,
    backgroundColor: theme.colors.background,
  };
};
