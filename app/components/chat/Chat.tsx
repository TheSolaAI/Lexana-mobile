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

interface ChatProps {
  /**
   * Array of chat messages to display
   */
  messages: UIMessage[];
}

/**
 * Chat component renders the chat messages with an optional sticky header that auto-hides on scroll.
 * @param {ChatProps} props - The props for the chat component.
 * @returns {JSX.Element} The rendered chat list with header.
 */
export const Chat: FC<ChatProps> = ({ messages }) => {
  const flatListRef = useRef<FlatList>(null);
  const animatedValues = useRef<{ [key: string]: Animated.Value }>({});
  const scrollToBottomOnNextUpdate = useRef<boolean>(true);

  /**
   * Scrolls the chat to the bottom with animation
   */
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
          animatedValues.current[message.id] = new Animated.Value(50);
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

  /**
   * Handles scroll events to manage auto-scrolling behavior
   */
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
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

  /**
   * Renders tool result components based on tool name and result data
   */
  const renderToolResult = (toolName: string, args: ToolResult | undefined): React.ReactNode => {
    if (args === undefined) {
      return null;
    }

    if (!args.success) {
      return <SimpleMessageItem text={`Error: ${args.error}`} />;
    }

    switch (toolName) {
      case 'tokenAddressTool':
        return <TokenAddressResultMessageItem props={args.data} />;
      case 'getTokenData':
        return <TokenDataResultMessageItem props={args.data} />;
      case 'bubblemap':
        return <BubbleMapMessageItem props={args.data} />;
      case 'topHolders':
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
      case 'swapTokens':
        return <SwapTokenMessageItem props={args.data} />;
      // case 'sign_and_send_tx':
      //   return <SignedTransactionsMessageItem props={args.data} />;
      case 'transferSol':
        return <TransferTokenMessageItem props={args.data} />;
      case 'transferSpl':
        return <TransferTokenMessageItem props={args.data} />;
      // default:
      //   return <SimpleMessageItem text={JSON.stringify(args.data)} />;
    }
  };

  /**
   * Renders the content of a single message
   */
  const renderMessageContent = (message: UIMessage) => {
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
  };

  /**
   * Renders a single message item with animation
   */
  const renderItem = ({ item }: { item: UIMessage }) => {
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
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      onScroll={onScroll}
      ListFooterComponent={<View style={$footerSpacing} />}
      scrollEventThrottle={16}
      contentContainerStyle={$flatListContentContainer}
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

const $footerSpacing: ViewStyle = {
  height: 100,
};

const $flatListContentContainer: ViewStyle = {
  paddingHorizontal: 16,
};
