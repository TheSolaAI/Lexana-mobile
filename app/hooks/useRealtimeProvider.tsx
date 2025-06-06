import { useState, useRef, useEffect, useCallback } from 'react';
import { Audio } from 'expo-av';
import { mediaDevices, RTCPeerConnection, MediaStream } from 'react-native-webrtc';
import { UIMessage } from '@ai-sdk/ui-utils';
import { REALTIME_MODEL } from '@/config/constants';
import { createAllTools, availableTools } from '@/tools';
import { ToolContext, ToolResult } from '@/types/tool';
import { privyClient } from '@/stores/services/ApiClient';

interface RealtimeEvent {
  type: string;
  [key: string]: any;
}

/**
 * @property {string} userTranscript - The user's transcribed speech.
 * @property {string} assistantResponse - The assistant's transcribed response.
 * @property {boolean} isAssistantSpeaking - True if the assistant is currently generating audio/text.
 * @property {boolean} isUserSpeaking - True if the user is currently speaking.
 */
interface LiveModeState {
  userTranscript: string;
  assistantResponse: string;
  isAssistantSpeaking: boolean;
  isUserSpeaking: boolean;
}

interface UseRealtimeProviderProps {
  /**
   * Whether the realtime session is currently active
   */
  isSessionActive: boolean;
  /**
   * Array of events received from the realtime API (for debugging)
   */
  events: RealtimeEvent[];
  /**
   * Current transcript from the conversation
   */
  transcript: string;
  /**
   * Whether the microphone is currently muted
   */
  isMuted: boolean;
  /**
   * Function to start a new realtime session
   */
  startSession: () => Promise<void>;
  /**
   * Function to stop the current realtime session
   */
  stopSession: () => void;
  /**
   * Function to toggle microphone mute state
   */
  toggleMute: () => void;
  /**
   * Function to send a text message to the realtime API
   */
  sendMessage: (message: string) => void;
  /**
   * Current connection state
   */
  connectionState: string;
  /**
   * Array of messages in UIMessage format for compatibility with normal chat
   */
  messages: UIMessage[];
  /**
   * Current live mode state (user transcript, assistant response, speaking states)
   */
  liveState: LiveModeState;
  /**
   * Audio intensity from 0 to 1 for visual feedback
   */
  audioIntensity: number;
}

/**
 * Hook for managing GPT realtime API sessions with audio capabilities
 * @returns {UseRealtimeProviderProps} Object containing session state and control functions
 */
export const useRealtimeProvider = (): UseRealtimeProviderProps => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [transcript, setTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [connectionState, setConnectionState] = useState('new');
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [liveState, setLiveState] = useState<LiveModeState>({
    userTranscript: '',
    assistantResponse: '',
    isAssistantSpeaking: false,
    isUserSpeaking: false,
  });
  const [audioIntensity, setAudioIntensity] = useState(0);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<ReturnType<RTCPeerConnection['createDataChannel']> | null>(null);
  const localMediaStream = useRef<MediaStream | null>(null);
  const remoteMediaStream = useRef<MediaStream>(new MediaStream());

  // Use refs to track current response text immediately to avoid state batching issues
  const currentResponseText = useRef<string>('');
  const currentResponseId = useRef<string | null>(null);

  // Define sendToolCallResponse first as handleToolCall depends on it
  const sendToolCallResponse = useCallback((callId: string, result: ToolResult) => {
    if (!dataChannel.current || dataChannel.current.readyState !== 'open') {
      console.error('DataChannel not open, cannot send tool response');
      return;
    }

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'function_call_output',
        call_id: callId,
        output: JSON.stringify(result),
      },
    };

    const generateEventResponse = {
      type: 'response.create',
    };

    try {
      dataChannel.current.send(JSON.stringify(event));
      console.log('Tool response sent:', { callId, result });
      dataChannel.current.send(JSON.stringify(generateEventResponse));
    } catch (error) {
      console.error('Failed to send tool response:', error);
    }
  }, []); // sendToolCallResponse has no external dependencies from the hook's state/props

  const handleToolCall = useCallback(
    async (callId: string, toolName: string, args: string) => {
      try {
        console.log('Executing tool call:', { callId, toolName, args });

        const toolContext: ToolContext = {
          authToken: await privyClient.getAccessToken(),
        };

        const tools = createAllTools(toolContext);
        const tool = Object.values(tools).find(t => t.id === toolName);

        if (!tool) {
          console.error('Tool not found:', toolName);
          sendToolCallResponse(callId, {
            success: false,
            error: `Tool ${toolName} not found`,
          });
          return;
        }

        let parsedArgs;
        try {
          parsedArgs = JSON.parse(args);
        } catch (error) {
          console.error('Failed to parse tool arguments:', error);
          sendToolCallResponse(callId, {
            success: false,
            error: 'Invalid tool arguments',
          });
          return;
        }

        const result = await tool.execute(parsedArgs);
        sendToolCallResponse(callId, result);

        if (result.success && result.data) {
          const toolMessage: UIMessage = {
            id: `tool-${Date.now()}`,
            role: 'assistant',
            content: `Tool ${toolName} executed successfully.`,
            createdAt: new Date(),
            parts: [
              {
                type: 'tool-invocation', // Corrected type
                toolInvocation: {
                  toolCallId: callId,
                  toolName: toolName,
                  args: args,
                  result: result.data,
                  state: 'result',
                },
              },
            ],
          };
          setMessages(prev => [...prev, toolMessage]);
        }
      } catch (error) {
        console.error('Error executing tool call:', error);
        sendToolCallResponse(callId, {
          success: false,
          error: 'Tool execution failed',
        });
      }
    },
    [sendToolCallResponse]
  ); // Added sendToolCallResponse to dependencies

  const processRealtimeEvent = useCallback(
    (event: RealtimeEvent) => {
      switch (event.type) {
        case 'input_audio_buffer.speech_started':
          console.log('User started speaking');
          setAudioIntensity(0.6);
          setLiveState(prev => ({
            ...prev,
            isUserSpeaking: true,
            userTranscript: '',
          }));
          break;

        case 'input_audio_buffer.speech_stopped':
          console.log('User stopped speaking');
          setAudioIntensity(0.2);
          setLiveState(prev => ({
            ...prev,
            isUserSpeaking: false,
          }));
          break;

        case 'conversation.item.input_audio_transcription.completed':
          const userTranscript = event.transcript || '';
          console.log('User transcript completed:', userTranscript);
          setAudioIntensity(0.1);
          setLiveState(prev => ({
            ...prev,
            userTranscript,
          }));

          if (userTranscript.trim()) {
            const userMessage: UIMessage = {
              id: `user-${Date.now()}`,
              role: 'user',
              content: userTranscript,
              createdAt: new Date(),
              parts: [
                {
                  type: 'text',
                  text: userTranscript,
                },
              ],
            };
            setMessages(prev => [...prev, userMessage]);
          }
          break;

        case 'response.created':
          const newResponseId = event.response?.id || null;
          console.log('New response created:', newResponseId);
          currentResponseText.current = '';
          currentResponseId.current = newResponseId;
          setAudioIntensity(0.3);
          setLiveState(prev => ({
            ...prev,
            assistantResponse: '',
            isAssistantSpeaking: false,
          }));
          break;

        case 'response.audio_transcript.delta':
          const delta = event.delta || '';
          const responseId = event.response_id;
          if (responseId === currentResponseId.current) {
            currentResponseText.current += delta;
            setAudioIntensity(0.8 + Math.random() * 0.2);
            setLiveState(prev => ({
              ...prev,
              assistantResponse: currentResponseText.current,
            }));
          }
          break;

        case 'response.audio_transcript.done':
          const finalTranscript = event.transcript || '';
          const responseIdDone = event.response_id;
          if (responseIdDone === currentResponseId.current) {
            currentResponseText.current = finalTranscript;
            setAudioIntensity(0.4);
            setLiveState(prev => ({
              ...prev,
              assistantResponse: finalTranscript,
            }));
            if (finalTranscript.trim()) {
              const assistantMessage: UIMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: finalTranscript,
                createdAt: new Date(),
                parts: [
                  {
                    type: 'text',
                    text: finalTranscript,
                  },
                ],
              };
              setMessages(prev => [...prev, assistantMessage]);
            }
          }
          break;

        case 'response.done':
          console.log('Response done:', event.response_id);
          setAudioIntensity(0.1);
          break;

        case 'response.function_call_arguments.delta':
          // console.log('Function call arguments delta:', event); // Can be noisy
          break;

        case 'response.function_call_arguments.done':
          console.log('Function call arguments done:', event);
          if (event.call_id && event.name && event.arguments) {
            handleToolCall(event.call_id, event.name, event.arguments);
          }
          break;

        case 'response.output_item.added':
          // console.log('Output item added:', event); // Can be noisy
          break;

        case 'response.output_item.done':
          // console.log('Output item done:', event); // Can be noisy
          break;
        case 'output_audio_buffer.started':
          setLiveState(prev => ({
            ...prev,
            isAssistantSpeaking: true,
          }));
          break;

        case 'output_audio_buffer.stopped':
          setLiveState(prev => ({
            ...prev,
            isAssistantSpeaking: false,
          }));
          break;
        default:
          break;
      }
    },
    [handleToolCall] // Added handleToolCall to dependencies
  );

  /**
   * Configures the realtime session with instructions and tools
   */
  const configureSession = useCallback(() => {
    if (!dataChannel.current || dataChannel.current.readyState !== 'open') return;

    // TODO: This context should be created once and memoized, or passed in.
    // For now, creating it on each configureSession call for simplicity.
    const toolContext: ToolContext = {
      authToken: null, // TODO: Get from your auth system
    };
    const allTools = createAllTools(toolContext); // Get all tool instances

    const event = {
      type: 'session.update',
      session: {
        modalities: ['text', 'audio'],
        instructions:
          'You are a helpful assistant for a cryptocurrency and blockchain application called Lexana. You can help users with various crypto-related tasks, answer questions about tokens, trading, and blockchain technology. Use the available tools to provide accurate and up-to-date information. Be concise and helpful in your responses.',
        voice: 'alloy',
        input_audio_format: 'pcm16',
        output_audio_format: 'pcm16',
        input_audio_transcription: {
          model: 'whisper-1',
        },
        tools: availableTools
          .map(toolId => {
            // Find the specific tool from the allTools object by its ID.
            // The keys in allTools might not directly match toolId strings like 'token.getTokenData'.
            // We need a way to map toolId to the correct key in allTools.
            // For now, let's assume a direct mapping or a helper to get the tool.
            // This part needs careful review based on how `createAllTools` structures its output and how `availableTools` elements relate to those keys.

            // Find the tool by its ID from the allTools collection
            // This requires knowing the structure of allTools and how toolId maps to it.
            // Example: if allTools is { getTokenData: { id: 'token.getTokenData', ... } }
            // and toolId is 'token.getTokenData', we need to find the tool whose `id` matches.

            const tool = Object.values(allTools).find(t => t.id === toolId);

            if (!tool) {
              console.warn(`Tool with ID ${toolId} not found in allTools. Skipping.`);
              return null; // Or handle as an error
            }

            return {
              type: 'function',
              name: tool.id, // Use tool.id which should match toolId
              description: tool.description,
              parameters: tool.openApiParameters, // Use the new openApiParameters
            };
          })
          .filter(Boolean), // Filter out any nulls if tools weren't found
      },
    };

    try {
      dataChannel.current.send(JSON.stringify(event));
      console.log('Session configured successfully with tools');
    } catch (error) {
      console.error('Failed to configure session:', error);
    }
  }, []);

  /**
   * Sets up data channel event listeners
   */
  const setupDataChannelListeners = useCallback(
    (dc: ReturnType<RTCPeerConnection['createDataChannel']>) => {
      const handleMessage = async (e: any) => {
        try {
          const data = JSON.parse(e.data);
          console.log('DataChannel message received:', data.type);

          setEvents(prev => [data, ...prev]);

          // Process the event immediately to avoid batching
          processRealtimeEvent(data);

          // Handle transcript updates for legacy compatibility
          if (data.type === 'response.audio_transcript.done') {
            setTranscript(data.transcript);
          }
        } catch (error) {
          console.error('Error parsing dataChannel message:', error);
        }
      };

      const handleOpen = () => {
        console.log('DataChannel opened');
        setIsSessionActive(true);
        setEvents([]);
        // Reset state when session starts
        setMessages([]);
        setLiveState({
          userTranscript: '',
          assistantResponse: '',
          isAssistantSpeaking: false,
          isUserSpeaking: false,
        });
        currentResponseText.current = '';
        currentResponseId.current = null;

        // Configure session once the channel is open
        configureSession();
      };

      const handleClose = () => {
        console.log('DataChannel closed');
        setIsSessionActive(false);
      };

      const handleError = (error: any) => {
        console.error('DataChannel error:', error);
        setIsSessionActive(false);
      };

      // Add event listeners
      dc.addEventListener('message', handleMessage);
      dc.addEventListener('open', handleOpen);
      dc.addEventListener('close', handleClose);
      dc.addEventListener('error', handleError);

      // Return cleanup function
      return () => {
        dc.removeEventListener('message', handleMessage);
        dc.removeEventListener('open', handleOpen);
        dc.removeEventListener('close', handleClose);
        dc.removeEventListener('error', handleError);
      };
    },
    [configureSession, processRealtimeEvent]
  );

  /**
   * Stops the current realtime session and cleans up resources
   */
  const stopSession = useCallback(() => {
    console.log('Stopping session');

    if (dataChannel.current) {
      dataChannel.current.close();
      dataChannel.current = null;
    }

    if (localMediaStream.current) {
      localMediaStream.current.getTracks().forEach((track: any) => track.stop());
      localMediaStream.current = null;
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    setIsSessionActive(false);
    setConnectionState('closed');
    setEvents([]);
    setTranscript('');
    setIsMuted(false);
    setMessages([]);
    setLiveState({
      userTranscript: '',
      assistantResponse: '',
      isAssistantSpeaking: false,
      isUserSpeaking: false,
    });
    currentResponseText.current = '';
    currentResponseId.current = null;
  }, []);

  /**
   * Starts a new realtime session with the provided realtime model
   */
  const startSession = useCallback(async () => {
    try {
      // Clean up any existing session first
      if (peerConnection.current || dataChannel.current) {
        stopSession();
      }

      const REALTIME_KEY = process.env.EXPO_PUBLIC_REALTIME_PROVIDER_KEY;
      const REALTIME_PROVIDER_URL = process.env.EXPO_PUBLIC_REALTIME_PROVIDER_URL;
      if (!REALTIME_KEY || !REALTIME_PROVIDER_URL) {
        throw new Error('REALTIME_KEY or REALTIME_PROVIDER_URL environment variable not found');
      }

      // Enable audio
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });

      const pc = new RTCPeerConnection();

      pc.addEventListener('connectionstatechange', _e => {
        setConnectionState(pc.connectionState);
        console.log('Connection state changed:', pc.connectionState);
      });

      pc.addEventListener('track', event => {
        if (event.track) {
          remoteMediaStream.current.addTrack(event.track);
          console.log('Remote track added');
        }
      });

      // Add local audio track for microphone input
      const microphoneStream = await mediaDevices.getUserMedia({
        audio: true,
      });

      localMediaStream.current = microphoneStream;
      pc.addTrack(microphoneStream.getTracks()[0]);

      // Set up data channel for sending and receiving events
      const dc = pc.createDataChannel('oai-events');
      dataChannel.current = dc;

      // Set up listeners immediately after creating the data channel
      const cleanupListeners = setupDataChannelListeners(dc);

      // Store cleanup function for later use
      dc.addEventListener('close', cleanupListeners, { once: true });

      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer({});
      await pc.setLocalDescription(offer);

      const sdpResponse = await fetch(`${REALTIME_PROVIDER_URL}?model=${REALTIME_MODEL}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${REALTIME_KEY}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpResponse.ok) {
        throw new Error(`Failed to start session: ${sdpResponse.statusText}`);
      }

      const answer = {
        type: 'answer',
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);

      peerConnection.current = pc;
      console.log('Session started successfully');
    } catch (error) {
      console.error('Failed to start session:', error);
      // Clean up on error
      stopSession();
      throw error;
    }
  }, [setupDataChannelListeners, stopSession]);

  /**
   * Toggles the microphone mute state
   */
  const toggleMute = useCallback(() => {
    if (localMediaStream.current) {
      const audioTrack = localMediaStream.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log('Microphone', audioTrack.enabled ? 'unmuted' : 'muted');
      }
    }
  }, []);

  /**
   * Sends a text message to the realtime API
   */
  const sendMessage = useCallback(
    (message: string) => {
      if (!dataChannel.current || dataChannel.current.readyState !== 'open' || !isSessionActive) {
        console.warn('Cannot send message: data channel not ready or session not active');
        return;
      }

      try {
        const event = {
          type: 'conversation.item.create',
          item: {
            type: 'message',
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: message,
              },
            ],
          },
        };

        dataChannel.current.send(JSON.stringify(event));

        // Trigger response
        const responseEvent = {
          type: 'response.create',
        };
        dataChannel.current.send(JSON.stringify(responseEvent));
        console.log('Message sent:', message);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    },
    [isSessionActive]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return {
    isSessionActive,
    events,
    transcript,
    isMuted,
    startSession,
    stopSession,
    toggleMute,
    sendMessage,
    connectionState,
    messages,
    liveState,
    audioIntensity,
  };
};
