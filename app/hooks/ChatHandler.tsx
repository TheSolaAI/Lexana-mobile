import FormData from 'form-data';
import { Message, generateId } from 'ai';
import { ApiClient, apiClient, privyClient } from '@/stores/services/ApiClient';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';
import { ApiResponse } from '@/types/api';
import { useAppSelector } from '@/stores/hooks';
import { useEffect, useState } from 'react';
import { ToolSetResponse } from '@/types/response';
import { toast } from 'sonner-native';

export const useChatFunctions = () => {
  /**
   * Global State
   */
  const { wallets } = useEmbeddedSolanaWallet();
  const { currentRoom } = useAppSelector(state => state.chatRooms);
  const [bearerToken, setBearerToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await privyClient.getAccessToken();
        setBearerToken(token);
      } catch (error) {
        console.error('Error fetching auth token:', error);
      }
    };

    fetchToken();
  }, []);

  const { messages, setMessages, append } = useChat({
    api: `http://192.168.1.13:5173/api/chat`,
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    headers: {
      'Content-Type': 'application/json',
      'x-mobile-client-id': process.env.EXPO_PUBLIC_CLIENT_ID!,
      'x-mobile-api-key': process.env.EXPO_PUBLIC_ANDROID_MOBILE_API_KEY!,
      authorization: bearerToken ? `Bearer ${bearerToken}` : '',
    },
    body: {
      walletPublicKey: wallets?.[0].publicKey,
      currentRoomID: currentRoom?.id,
    },
    onError: error => {
      console.error('Error in chat:', error);
    },
  });

  const speechToText = async (audioURI: string) => {
    const formData = new FormData();
    formData.append('audio', {
      uri: audioURI,
      name: 'audio.m4a',
      type: 'audio/m4a',
    });

    const response = await apiClient.post('main', '/api/speech-to-text', formData, true);

    if (!ApiClient.isApiResponse(response)) {
      toast.error('Failed to convert speech to text');
      throw new Error('Failed to convert speech to text');
    }

    const newMessage: Message = {
      id: generateId(),
      content: (response as ApiResponse<{ text: string }>).data.text,
      role: 'user',
      createdAt: new Date(),
    };

    return newMessage;
  };

  const getToolSet = async (newMessage: Message, history: Message[]) => {
    const toolsetResponse = await apiClient.post<ToolSetResponse>(
      'main',
      '/api/get-required-toolsets',
      {
        walletPublicKey: wallets?.[0].publicKey,
        message: newMessage,
        previousMessages: history,
        currentRoomID: currentRoom?.id,
      }
    );

    if (ApiClient.isApiResponse(toolsetResponse)) {
      return toolsetResponse.data;
    } else {
      toast.error('Failed to get toolset');
      throw new Error('Failed to get toolset');
    }
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

  const onAudioMessage = async (audioURI: string) => {
    try {
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
        handleAddUserMessage(newMessage);
        handleAddAIResponse(toolsetResponse.fallbackResponse);

        if (toolsetResponse.audioData) {
          // playAudio(toolsetResponse.audioData);
        }
        return;
      }

      // Handle case with toolsets
      handleAddUserMessage(newMessage);
      await handleSendMessage(newMessage.content, toolsetResponse.selectedToolset);
    } catch (error) {
      console.error('Error processing audio message:', error);
    }
  };

  return {
    messages,
    onAudioMessage,
    handleSendMessage,
  };
};
