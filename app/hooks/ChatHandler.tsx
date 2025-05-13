import FormData from 'form-data';
import { Message, generateId } from 'ai';
import { ApiClient, apiClient, privyClient } from '@/stores/services/ApiClient';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { useEmbeddedSolanaWallet } from '@privy-io/expo';
import { ApiResponse } from '@/types/api';
import { useEffect, useState } from 'react';
import { ToolSetResponse } from '@/types/response';
import { toast } from 'sonner-native';
import { Audio } from 'expo-av';
import { ToolResult } from '@/types/tool';
import { Connection, Transaction } from '@solana/web3.js';
import base58 from 'bs58';
import { useFetchMessagesQuery } from '@/stores/services/messages.service';
import { useFetchChatRoomsQuery } from '@/stores/services/chatRooms.service';
import { useAppSelector, useAppDispatch } from '@/stores/hooks';
import { setSelectedRoomId } from '@/stores/slices/selectedRoomSlice';

interface TransactionArgs {
  transactionHash: string;
}

export const useChatFunctions = () => {
  /**
   * Global State
   */
  const { wallets } = useEmbeddedSolanaWallet();
  const { data: chatRooms = [] } = useFetchChatRoomsQuery(undefined);
  const dispatch = useAppDispatch();
  const selectedRoomId = useAppSelector(state => state.selectedRoom.selectedRoomId);
  // Update selectedRoomId if chatRooms changes and selectedRoomId is not valid
  useEffect(() => {
    if (
      chatRooms.length > 0 &&
      selectedRoomId == null
    ) {
      dispatch(setSelectedRoomId(chatRooms[0].id));
    }
  }, [chatRooms, selectedRoomId, dispatch]);
  const currentRoom = chatRooms.find((room: any) => room.id === selectedRoomId) || chatRooms[0];
  const [bearerToken, setBearerToken] = useState<string | null>(null);

  // Fetch messages for the current room using RTK Query
  const roomId = currentRoom?.id;
  const { data: messagesData, isFetching } = useFetchMessagesQuery(roomId, { skip: !roomId });

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

  /**
   * Handles signing and sending a transaction using the Privy embedded wallet
   * @param args The transaction arguments containing the transaction hash
   * @returns A ToolResult object with the transaction status
   */
  const handleSignTransaction = async (args: TransactionArgs): Promise<ToolResult> => {
    try {
      if (!wallets || wallets.length === 0) {
        return {
          success: false,
          error: 'No wallet available. Please connect a wallet first.',
        };
      }

      const wallet = wallets[0];
      const provider = await wallet.getProvider();
      const connection = new Connection('https://api.mainnet-beta.solana.com');

      // Decode the transaction from base58 string
      const transactionBuffer = base58.decode(args.transactionHash);
      const transaction = Transaction.from(transactionBuffer);

      const { signature } = await provider.request({
        method: 'signAndSendTransaction',
        params: {
          transaction: transaction,
          connection: connection,
        },
      });

      console.log('Transaction sent with signature:', signature);

      toast.success('Transaction signed and sent successfully');

      return {
        success: true,
        data: {
          signature,
          message: 'Transaction signed and sent successfully',
        },
      };
    } catch (error: any) {
      console.error('Error signing transaction:', error);

      const errorMessage = error.message || 'Failed to sign and send transaction';
      toast.error(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const { messages, setMessages, append } = useChat({
    api: `${process.env.EXPO_PUBLIC_MAIN_SERVICE_URL}/api/chat`,
    id: `chat-${roomId}`,
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    initialMessages: messagesData?.messages || [],
    headers: {
      'Content-Type': 'application/json',
      'x-mobile-client-id': process.env.EXPO_PUBLIC_CLIENT_ID!,
      'x-mobile-api-key': process.env.EXPO_PUBLIC_ANDROID_MOBILE_API_KEY!,
      authorization: bearerToken ? `Bearer ${bearerToken}` : '',
    },
    body: {
      walletPublicKey: wallets?.[0].publicKey,
      currentRoomID: roomId,
    },
    onToolCall: async ({ toolCall }) => {
      let result: ToolResult | undefined;
      if (toolCall.toolName === 'sign_and_send_tx') {
        result = await handleSignTransaction(toolCall.args as TransactionArgs);
        console.log('Transaction result:', result);
        
      }
      return result;
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
        currentRoomID: roomId,
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

  // Function to play audio from base64 data
  const playAudio = async (base64AudioData: string) => {
    try {
      // Convert base64 to URI that Audio can play
      const audioUri = `data:audio/mp3;base64,${base64AudioData}`;

      // Create a new Sound object from the URI
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true });

      // Set up audio playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Play audio
      await sound.playAsync();

      // Clean up when sound finishes playing
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
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
          // Play audio response
          playAudio(toolsetResponse.audioData);
        }
        return;
      }

      // Handle case with toolsets
      await handleSendMessage(newMessage.content, toolsetResponse.selectedToolset);
    } catch (error) {
      console.error('Error processing audio message:', error);
    }
  };

  return {
    messages,
    onAudioMessage,
    handleSendMessage,
    selectedRoomId,
    setSelectedRoomId: (id: number) => dispatch(setSelectedRoomId(id)),
    chatRooms,
    isFetching,
  };
};
