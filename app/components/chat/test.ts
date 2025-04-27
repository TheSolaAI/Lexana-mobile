// Test messages to demonstrate the Chat component functionality
import { UIMessage } from '@ai-sdk/ui-utils';

export const testMessages: UIMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hi! I’m SOLA, your AI guide to everything on Solana. How can I assist you today?',
    createdAt: new Date('2025-04-26T10:00:00'),
    parts: [
      {
        type: 'text',
        text: 'Hi! I’m SOLA, your AI guide to everything on Solana. How can I assist you today?',
      },
    ],
  },
  {
    id: '2',
    role: 'user',
    content: 'Can you explain what Solana is?',
    createdAt: new Date('2025-04-26T10:01:00'),
    parts: [
      {
        type: 'text',
        text: 'Can you explain what Solana is?',
      },
    ],
  },
  {
    id: '3',
    role: 'assistant',
    content:
      'Solana is a high-performance blockchain supporting fast, low-cost decentralized apps and crypto projects.',
    createdAt: new Date('2025-04-26T10:02:00'),
    parts: [
      {
        type: 'text',
        text: 'Solana is a high-performance blockchain supporting fast, low-cost decentralized apps and crypto projects.',
      },
    ],
  },
  {
    id: '4',
    role: 'user',
    content: 'How fast is Solana compared to Ethereum?',
    createdAt: new Date('2025-04-26T10:03:00'),
    parts: [
      {
        type: 'text',
        text: 'How fast is Solana compared to Ethereum?',
      },
    ],
  },
  {
    id: '5',
    role: 'assistant',
    content:
      'Solana can process over 50,000 transactions per second, far more than Ethereum today.',
    createdAt: new Date('2025-04-26T10:04:00'),
    parts: [
      {
        type: 'text',
        text: 'Solana can process over 50,000 transactions per second, far more than Ethereum today.',
      },
    ],
  },
  {
    id: '6',
    role: 'user',
    content: 'What is a Solana wallet?',
    createdAt: new Date('2025-04-26T10:05:00'),
    parts: [
      {
        type: 'text',
        text: 'What is a Solana wallet?',
      },
    ],
  },
  {
    id: '7',
    role: 'assistant',
    content:
      'A Solana wallet lets you store, send, and receive SOL and tokens built on the Solana blockchain.',
    createdAt: new Date('2025-04-26T10:06:00'),
    parts: [
      {
        type: 'step-start',
      },
      {
        type: 'text',
        text: 'A Solana wallet lets you store, send, and receive SOL and tokens built on the Solana blockchain. Some key points:',
      },
      {
        type: 'text',
        text: '1. Popular wallets include Phantom, Solflare, and Backpack\n2. Wallets can connect to decentralized apps (dApps)\n3. Wallets usually have a recovery phrase — never share it!',
      },
    ],
  },
  {
    id: '8',
    role: 'user',
    content: 'Can you show me how to create a Solana transaction?',
    createdAt: new Date('2025-04-26T10:07:00'),
    parts: [
      {
        type: 'text',
        text: 'Can you show me how to create a Solana transaction?',
      },
    ],
  },
  {
    id: '9',
    role: 'assistant',
    content: 'Sure! Here is an example transaction using Solana’s Web3.js library:',
    createdAt: new Date('2025-04-26T10:08:00'),
    parts: [
      {
        type: 'text',
        text: 'Sure! Here is an example transaction using Solana’s Web3.js library:',
      },
      {
        type: 'file',
        mimeType: 'text/plain',
        data: `import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';

const connection = new Connection('https://api.mainnet-beta.solana.com');
const transaction = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: senderPublicKey,
    toPubkey: receiverPublicKey,
    lamports: 1000000, // 0.001 SOL
  })
);
// Sign and send the transaction using your wallet
`,
      },
    ],
  },
  {
    id: '10',
    role: 'system',
    content: 'You are now connected to SOLA AI — ask anything about Solana!',
    createdAt: new Date('2025-04-26T10:09:00'),
    parts: [
      {
        type: 'text',
        text: 'You are now connected to SOLA AI — ask anything about Solana!',
      },
    ],
  },
];
