import { FC, Fragment, useEffect, useRef, useCallback } from 'react';
import {
  FlatList,
  View,
  ViewStyle,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { UIMessage } from '@ai-sdk/ui-utils';
import { SimpleMessageItem } from '@/components/messages/SimpleMessageItem';
import { UserInput } from '../messages/UserInput';
import { ToolResult } from '@/types/tool';
import { TokenAddressResultMessageItem } from '../messages/TokenAddressResultMessageItem';
import { TokenDataResultMessageItem } from '../messages/TokenDataResultMessageItem';
import { BubbleMapMessageItem } from '../messages/BubbleMapMessageItem';
import { TopHoldersMessageItem } from '../messages/TopHoldersMessageItem';
import { AiProjectsMessageItem } from '../messages/AiProjectsMessageItem';
import { ShowLimitOrderMessageItem } from '../messages/ShowLimitOrderMessageItem';
import { LuloAssetsMessageItem } from '../messages/LuloAssetsMessageItem';
import { NFTCollectionMessageItem } from '../messages/NFTCollectionMessageItem';
import { SNSResolverMessageItem } from '../messages/SNSResolverMessageItem';

interface ChatProps {
  messages: UIMessage[];
}

export const Chat: FC<ChatProps> = ({ messages }) => {
  const flatListRef = useRef<FlatList>(null);
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});
  const scrollToBottomOnNextUpdate = useRef<boolean>(true);

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

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
  }, [messages, scrollToBottom]);

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

  const renderToolResult = (toolName: string, args: ToolResult | undefined): React.ReactNode => {
    // In case we have a caught error in the tool and propagated it to the frontend
    if (args === undefined) {
      return null;
    }

    if (!args.success) {
      return <SimpleMessageItem text={`Error: ${args.error}`} />;
    }

    switch (toolName) {
      case 'tokenAddressTool':
        return <TokenAddressResultMessageItem props={args.data} />;
      case 'getTokenDataTool':
        return <TokenDataResultMessageItem props={args.data} />;
      case 'bubblemapTool':
        return <BubbleMapMessageItem props={args.data} />;
      case 'topHoldersTool':
        return <TopHoldersMessageItem props={args.data} />;
      case 'trendingAiProjects':
        return <AiProjectsMessageItem props={args.data} />;
      case 'getLimitOrderTool':
        return <ShowLimitOrderMessageItem props={args.data} />;
      case 'getLuloAssetsTool':
        return <LuloAssetsMessageItem props={args.data} />;
      case 'getNFTPrice':
        return <NFTCollectionMessageItem props={args.data} />;
      case 'getTrendingNFTs':
        return <NFTCollectionMessageItem props={args.data} />;
      case 'resolveSnsNameTool':
        return <SNSResolverMessageItem props={args.data} />;
      default:
        return <SimpleMessageItem text={JSON.stringify(args.data)} />;
    }
  };

  const renderMessageContent = (message: UIMessage) => {
    const role = message.role;
    if (message.role === 'user') {
      return <UserInput text={message.content} transcript={true} />;
    }

    if (message.parts) {
      // If we have multiple parts, wrap them in a View with column layout
      const messageParts = message.parts
        .map((part, partIndex) => {
          if (part.type === 'text') {
            return role === 'user' ? (
              <UserInput key={`text-${partIndex}`} text={message.content} transcript={true} />
            ) : (
              <SimpleMessageItem key={`text-${partIndex}`} text={part.text} />
            );
          } else if (part.type === 'tool-invocation' && part.toolInvocation.state === 'result') {
            return (
              <Fragment key={`tool-${message.id}-${partIndex}`}>
                {renderToolResult(part.toolInvocation.toolName, part.toolInvocation.result)}
              </Fragment>
            );
          }
          return null;
        })
        .filter(Boolean);

      // Wrap in column container if there are multiple parts
      return <View style={$messagePartsContainer}>{messageParts}</View>;
    }

    // Handle simple text messages
    return <SimpleMessageItem text={message.content} />;
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
        {renderMessageContent(item)}
      </Animated.View>
    );
  };

  return (
    <View style={$chatContainerStyle}>
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

const $chatContainerStyle: ViewStyle = {
  flex: 1,
  paddingVertical: 16,
};

const $messagePartsContainer: ViewStyle = {
  flexDirection: 'column',
};
