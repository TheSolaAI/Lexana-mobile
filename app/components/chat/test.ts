// Test messages to demonstrate the Chat component functionality
import { UIMessage } from '@ai-sdk/ui-utils';

export const testMessages: UIMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! How can I help you today?',
    createdAt: new Date('2025-04-26T10:00:00'),
    parts: [
      {
        type: 'text',
        text: 'Hello! How can I help you today?',
      },
    ],
  },
  {
    id: '2',
    role: 'user',
    content: 'Can you tell me about React Native?',
    createdAt: new Date('2025-04-26T10:01:00'),
    parts: [
      {
        type: 'text',
        text: 'Can you tell me about React Native?',
      },
    ],
  },
  {
    id: '3',
    role: 'assistant',
    content:
      'React Native is a framework for building native mobile apps using JavaScript and React.',
    createdAt: new Date('2025-04-26T10:02:00'),
    parts: [
      {
        type: 'text',
        text: 'React Native is a framework for building native mobile apps using JavaScript and React.',
      },
    ],
  },
  {
    id: '4',
    role: 'user',
    content: 'Can you show me a simple example?',
    createdAt: new Date('2025-04-26T10:03:00'),
    parts: [
      {
        type: 'text',
        text: 'Can you show me a simple example?',
      },
    ],
  },
  {
    id: '5',
    role: 'assistant',
    content: 'Here is a simple React Native component example:',
    createdAt: new Date('2025-04-26T10:04:00'),
    parts: [
      {
        type: 'text',
        text: 'Here is a simple React Native component example:',
      },
    ],
  },
  {
    id: '6',
    role: 'user',
    content: 'Thanks! What about styling in React Native?',
    createdAt: new Date('2025-04-26T10:05:00'),
    parts: [
      {
        type: 'text',
        text: 'Thanks! What about styling in React Native?',
      },
    ],
  },
  {
    id: '7',
    role: 'assistant',
    content: 'React Native uses a styling system similar to CSS, but with JavaScript objects.',
    createdAt: new Date('2025-04-26T10:06:00'),
    parts: [
      {
        type: 'step-start',
      },
      {
        type: 'text',
        text: 'React Native uses a styling system similar to CSS, but with JavaScript objects. Here are the key points:',
      },
      {
        type: 'text',
        text: '1. Styles are defined as JavaScript objects\n2. Property names are camelCased (e.g., backgroundColor instead of background-color)\n3. Values are usually strings or numbers\n4. You can use StyleSheet.create() for better performance',
      },
    ],
  },
  {
    id: '8',
    role: 'user',
    content: 'Can you attach an example file?',
    createdAt: new Date('2025-04-26T10:07:00'),
    parts: [
      {
        type: 'text',
        text: 'Can you attach an example file?',
      },
    ],
  },
  {
    id: '9',
    role: 'assistant',
    content: 'Here is an example style file for React Native:',
    createdAt: new Date('2025-04-26T10:08:00'),
    parts: [
      {
        type: 'text',
        text: 'Here is an example style file for React Native:',
      },
      {
        type: 'file',
        mimeType: 'text/plain',
        data: 'Example file content with React Native styles',
      },
    ],
  },
  {
    id: '10',
    role: 'system',
    content: 'This is a system message.',
    createdAt: new Date('2025-04-26T10:09:00'),
    parts: [
      {
        type: 'text',
        text: 'This is a system message.',
      },
    ],
  },
];
