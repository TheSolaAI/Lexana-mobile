import { AppStackScreenProps } from '@/navigators/AppNavigator';
import { FC } from 'react';
import { Screen } from '@/components/general';
import { useAppTheme } from '@/utils/useAppTheme';
import { $styles } from '@/theme';
import { Screenheader } from '@/components/app/ScreenHeader';
import { ViewStyle } from 'react-native';

import { Message, useChat } from '@ai-sdk/react';
import { Chat } from '@/components/chat/Chat';
import { testMessages } from '@/components/chat/test';
import { PushToTalkButton } from '@/components/chat/PushToTalkButton';
import Config from '@/config';
import { useEmbeddedSolanaWallet, usePrivy } from '@privy-io/expo';
import FormData from 'form-data';
import { fetch as expoFetch } from 'expo/fetch';
import { generateId } from 'ai';

interface ChatScreenProps extends AppStackScreenProps<'ChatScreen'> {}

export const ChatScreen: FC<ChatScreenProps> = () => {
  const { themed } = useAppTheme();

  const { getAccessToken } = usePrivy();
  const { wallets } = useEmbeddedSolanaWallet();

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

  return (
    <>
      <Screen
        preset="fixed"
        safeAreaEdges={['top', 'bottom']}
        contentContainerStyle={[themed($styles.screenContainer), $screenContainerStyle]}
        backgroundColor="transparent"
      >
        <Screenheader titleTx="chatScreen:voiceMode.title" subtitle="nothing" />
        <Chat messages={messages} />
      </Screen>
      <PushToTalkButton size={100} onAudioRecorded={mainFlow} />
    </>
  );
};

const $screenContainerStyle: ViewStyle = {
  paddingTop: 10,
  height: '100%',
};
