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
import { SimpleMessageItem } from '@/components/chat/messages/SimpleMessageItem';
import { UserInput } from './messages/UserInput';
import { ToolResult } from '@/types/tool';
import { TokenAddressResultMessageItem } from './messages/TokenAddressResultMessageItem';
import { TokenDataResultMessageItem } from './messages/TokenDataResultMessageItem';
import { BubbleMapMessageItem } from './messages/BubbleMapMessageItem';
import { TopHoldersMessageItem } from './messages/TopHoldersMessageItem';
import { AiProjectsMessageItem } from './messages/AiProjectsMessageItem';
import { ShowLimitOrderMessageItem } from './messages/ShowLimitOrderMessageItem';
import { LuloAssetsMessageItem } from './messages/LuloAssetsMessageItem';
import { NFTCollectionMessageItem } from './messages/NFTCollectionMessageItem';
import { SNSResolverMessageItem } from './messages/SNSResolverMessageItem';
import { SwapTokenMessageItem } from './messages/SwapTokenMessageItem';
// import { SignedTransactionsMessageItem } from './messages/SignedTransactionsMessageItem';
import { TransferTokenMessageItem } from './messages/TransferTokenMessageItem';
import { LoadingBubble } from './LoadingBubble';

interface ChatProps {
  /**
   * Array of chat messages to display
   */
  messages: UIMessage[];
  /**
   * Whether the system is currently processing a message
   */
  isProcessing?: boolean;
  /**
   * The current processing stage
   */
  processingStage?: 'convertingAudio' | 'analyzingMessage' | 'thinking' | null;
}

/**
 * Chat component renders the chat messages with an optional sticky header that auto-hides on scroll.
 * @param {ChatProps} props - The props for the chat component.
 * @returns {JSX.Element} The rendered chat list with header.
 */
export const Chat: FC<ChatProps> = ({ messages, isProcessing, processingStage }) => {
  const flatListRef = useRef<FlatList>(null);
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});
  const shouldAutoScroll = useRef<boolean>(true);
  const isUserScrolling = useRef<boolean>(false);
  const previousMessagesLength = useRef<number>(0);
  const contentHeight = useRef<number>(0);
  const layoutHeight = useRef<number>(0);

  /**
   * Scrolls the chat to the bottom immediately
   */
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && shouldAutoScroll.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, []);

  /**
   * Forces immediate scroll to bottom without checking shouldAutoScroll
   */
  const forceScrollToBottom = useCallback(() => {
    if (flatListRef.current) {
      // First try immediate scroll without animation
      flatListRef.current.scrollToEnd({ animated: false });
      // Then follow with animated scroll for smooth UX
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  }, []);

  /**
   * Handles content size changes (important for streaming content)
   */
  const onContentSizeChange = useCallback((contentWidth: number, newContentHeight: number) => {
    const heightIncreased = newContentHeight > contentHeight.current;
    contentHeight.current = newContentHeight;
    
    // Auto-scroll when content grows and auto-scroll is enabled
    if (heightIncreased && shouldAutoScroll.current && !isUserScrolling.current) {
      scrollToBottom();
    }
  }, [scrollToBottom]);

  /**
   * Handles layout changes to track visible area
   */
  const onLayout = useCallback((event: any) => {
    layoutHeight.current = event.nativeEvent.layout.height;
  }, []);

  // Handle message updates with improved logic
  useEffect(() => {
    const currentMessagesLength = messages.length;
    const isNewMessage = currentMessagesLength > previousMessagesLength.current;
    const isInitialLoad = previousMessagesLength.current === 0 && currentMessagesLength > 0;

    if (isInitialLoad) {
      // Force scroll to bottom on initial load with delay to ensure rendering
      shouldAutoScroll.current = true;
      setTimeout(() => {
        forceScrollToBottom();
      }, 100);
    } else if (isNewMessage && shouldAutoScroll.current) {
      // Scroll for new messages with shorter delay
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }

    // Create animation values for new messages
    if (currentMessagesLength > 0) {
      messages.forEach(message => {
        if (!animatedValues.current[message.id]) {
          animatedValues.current[message.id] = new Animated.Value(30);
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

    previousMessagesLength.current = currentMessagesLength;
  }, [messages, scrollToBottom, forceScrollToBottom]);

  // Handle processing state changes (for streaming responses)
  useEffect(() => {
    if (isProcessing && shouldAutoScroll.current && !isUserScrolling.current) {
      // For streaming, scroll more frequently
      const interval = setInterval(() => {
        if (shouldAutoScroll.current && !isUserScrolling.current) {
          scrollToBottom();
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isProcessing, scrollToBottom]);

  /**
   * Handles the start of user scrolling
   */
  const onScrollBeginDrag = useCallback(() => {
    isUserScrolling.current = true;
    // Don't disable auto-scroll immediately, wait to see where they scroll
  }, []);

  /**
   * Handles the end of user scrolling
   */
  const onScrollEndDrag = useCallback(() => {
    // Small delay to allow momentum scrolling to continue
    setTimeout(() => {
      isUserScrolling.current = false;
    }, 200);
  }, []);

  /**
   * Handles scroll events to manage auto-scrolling behavior
   */
  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Calculate if user is near the bottom
    const distanceFromBottom = contentSize.height - contentOffset.y - layoutMeasurement.height;
    const isNearBottom = distanceFromBottom <= 50; // Increased threshold
    
    // Update auto-scroll state based on position
    if (isNearBottom) {
      shouldAutoScroll.current = true;
    } else {
      // Only disable auto-scroll if user is actively scrolling and moved significantly away from bottom
      if (isUserScrolling.current && distanceFromBottom > 100) {
        shouldAutoScroll.current = false;
      }
    }
  }, []);

  /**
   * Renders tool result components based on tool name and result data
   */
  const renderToolResult = useCallback((toolName: string, args: ToolResult | undefined): React.ReactNode => {
    if (args === undefined) {
      return null;
    }

    if (!args.success) {
      return <SimpleMessageItem text={`Error: ${args.error}`} />;
    }

    switch (toolName) {
      case 'tokenAddressTool':
        return <TokenAddressResultMessageItem props={args.data as any} />;
      case 'getTokenData':
        return <TokenDataResultMessageItem props={args.data as any} />;
      case 'bubblemap':
        return <BubbleMapMessageItem props={args.data as any} />;
      case 'topHolders':
        return <TopHoldersMessageItem props={args.data as any} />;
      case 'trendingAiProjects':
        return <AiProjectsMessageItem props={args.data as any} />;
      case 'getLimitOrderTool':
        return <ShowLimitOrderMessageItem props={args.data as any} />;
      case 'getLuloAssetsTool':
        return <LuloAssetsMessageItem props={args.data as any} />;
      case 'getNFTPrice':
        return <NFTCollectionMessageItem props={args.data as any} />;
      case 'getTrendingNFTs':
        return <NFTCollectionMessageItem props={args.data as any} />;
      case 'resolveSnsNameTool':
        return <SNSResolverMessageItem props={args.data as any} />;
      case 'swapTokens':
        return <SwapTokenMessageItem props={args.data as any} />;
      // case 'sign_and_send_tx':
      //   return <SignedTransactionsMessageItem props={args.data as any} />;
      case 'transferSol':
        return <TransferTokenMessageItem props={args.data as any} />;
      case 'transferSpl':
        return <TransferTokenMessageItem props={args.data as any} />;
      default:
        return null;
    }
  }, []);

  /**
   * Renders the content of a single message
   */
  const renderMessageContent = useCallback((message: UIMessage) => {
    const role = message.role;
    if (message.role === 'user') {
      return <UserInput text={message.content} transcript={true} />;
    }

    if (message.parts) {
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

      return <View style={$messagePartsContainer}>{messageParts}</View>;
    }

    return <SimpleMessageItem text={message.content} />;
  }, [renderToolResult]);

  /**
   * Renders a single message item with animation
   */
  const renderItem = useCallback(({ item }: { item: UIMessage }) => {
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
  }, [renderMessageContent]);

  /**
   * Renders the footer component with loading indicator and spacing
   */
  const renderFooter = useCallback(() => (
    <View style={$footerContainer}>
      {isProcessing && processingStage && (
        <LoadingBubble stage={processingStage} />
      )}
      <View style={$footerSpacing} />
    </View>
  ), [isProcessing, processingStage]);

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      onScroll={onScroll}
      onScrollBeginDrag={onScrollBeginDrag}
      onScrollEndDrag={onScrollEndDrag}
      onContentSizeChange={onContentSizeChange}
      onLayout={onLayout}
      ListFooterComponent={renderFooter}
      scrollEventThrottle={16}
      contentContainerStyle={$flatListContentContainer}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      removeClippedSubviews={false}
    />
  );
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

const $messagePartsContainer: ViewStyle = {
  flexDirection: 'column',
  backgroundColor: 'transparent',
};

const $footerContainer: ViewStyle = {
  alignItems: 'flex-start',
};

const $footerSpacing: ViewStyle = {
  height: 80,
};

const $flatListContentContainer: ViewStyle = {
  paddingHorizontal: 16,
  paddingBottom: 20,
};
