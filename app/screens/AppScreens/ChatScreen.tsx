/* eslint-disable react-native/no-color-literals */
// Modified ChatScreen.tsx
import { AppStackScreenProps } from '@/navigators/AppNavigator';
import { FC, useState, useRef, useEffect } from 'react';
import { Screen } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { $styles } from '@/theme';
import { Screenheader } from '@/components/app/ScreenHeader';
import {
  ViewStyle,
  Animated,
  Dimensions,
  PanResponder,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { Message, useChat } from '@ai-sdk/react';
import { Chat } from '@/components/chat/Chat';
import { testMessages } from '@/components/chat/test';
import { PushToTalkButton } from '@/components/chat/PushToTalkButton';
import Config from '@/config';
import { useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo';
import FormData from 'form-data';
import { fetch as expoFetch } from 'expo/fetch';
import { generateId } from 'ai';
import { Sidebar } from '@/components/sidebar';

interface ChatScreenProps extends AppStackScreenProps<'ChatScreen'> {}

export const ChatScreen: FC<ChatScreenProps> = () => {
  /**
   * Global State
   */
  const { themed } = useAppTheme();
  const { getAccessToken } = usePrivy();
  const { wallets } = useEmbeddedSolanaWallet();

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
        console.log('Moving with dx:', gestureState.dx); // Debugging log
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
        console.log('Released with dx:', gestureState.dx); // Debugging log

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

  /**
   * Primary Use Chat Hook
   */
  const { messages, setMessages, append } = useChat({
    api: `http://192.168.1.6:3000/api/chat`,
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    headers: {
      // Authorization: 'Bearer ' + (await getAccessToken()),
      'Content-Type': 'application/json',
    },
    initialMessages: testMessages,
    body: {
      walletPublicKey: wallets?.[0].publicKey,
    },
    onError: error => {
      console.error('Error in chat:', error);
    },
  });

  const mainFlow = async (audioURI: string) => {
    // First we convert the audio to text
    const newMessage = await speechToText(audioURI);
    // now we collect context
    const messageHistory = messages.slice(-5).map(message => ({
      id: message.id,
      content: message.content,
      role: message.role,
      createdAt: new Date(),
    }));
    // now we get the toolset
    const toolsetResponse = await getToolSet(newMessage, messageHistory);
    // now we determine if we need to pass this to the next stage to get the actual tool and process or we can just show the response
    if (toolsetResponse.selectedToolset.length === 0) {
      console.log('Direct response (no toolset needed):', toolsetResponse.fallbackResponse);

      handleAddUserMessage(newMessage);
      handleAddAIResponse(toolsetResponse.fallbackResponse);

      if (toolsetResponse.audioData) {
        // playAudio(toolsetResponse.audioData);
      }
      return;
    }

    await handleSendMessage(newMessage.content, toolsetResponse.selectedToolset);
  };

  /**
   * Makes a request to our NextJS server with the audio file to transcribe it to text
   * @param audioURI
   */
  const speechToText = async (audioURI: string) => {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioURI,
      name: 'audio.m4a',
      type: 'audio/m4a',
    });

    const response = await fetch(Config.CORE_SERVER + '/api/speech-to-text', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + (await getAccessToken()),
        'Content-Type': 'multipart/form-data',
      },
      body: formData as any,
    });

    // create a new message with the response
    const newMessage: Message = {
      id: generateId(),
      content: (await response.json()).text,
      role: 'user',
      createdAt: new Date(),
    };

    return newMessage;
  };

  /**
   * Makes a request to our NextJS server to figure out which toolset to use or if we should just give a textual response
   */
  const getToolSet = async (newMessage: Message, history: Message[]) => {
    console.log(wallets?.[0]);
    const toolsetResponse = await fetch(Config.CORE_SERVER + '/api/get-required-toolsets', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + (await getAccessToken()),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletPublicKey: wallets?.[0].publicKey,
        message: newMessage,
        previousMessages: history,
      }),
    });
    if (!toolsetResponse.ok) {
      throw new Error('Failed to determine required toolset');
    }

    const toolsetData = await toolsetResponse.json();
    console.log('Toolset determination result:', toolsetData.selectedToolset);
    return toolsetData;
  };

  const handleAddUserMessage = (userMessage: Message) => {
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: generateId(),
        role: 'user',
        content: userMessage.content,
        parts: [{ type: 'text', text: userMessage.content }],
      },
    ]);
  };

  const handleAddAIResponse = (responseText: string) => {
    try {
      const latestUserMsg = messages.findLast(m => m.role === 'user');

      if (!latestUserMsg) {
        console.warn('No user message found to respond to');
      }

      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: generateId(),
          role: 'assistant',
          content: responseText,
          parts: [
            {
              type: 'text',
              text: responseText,
            },
          ],
        },
      ]);
    } catch (error) {
      console.error('Error adding AI response:', error);
    }
  };

  const handleSendMessage = async (text: string, toolsets: string[]) => {
    console.log('Sending message:', text);
    console.log('Toolsets:', toolsets);

    try {
      await append(
        {
          role: 'user',
          content: text,
        },
        { body: { requiredToolSets: toolsets } }
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
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
          zIndex: 10, // Ensure it's above the sidebar for touch handling
        }}
        {...(sidebarVisible ? {} : panHandlers)} // Only attach panHandlers when sidebar is closed
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
        <PushToTalkButton size={100} onAudioRecorded={mainFlow} />
      </Animated.View>

      {/* 
        Important: The Sidebar is always rendered (even when closed)
        Pass the swipeProgress to synchronize animations
      */}
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
