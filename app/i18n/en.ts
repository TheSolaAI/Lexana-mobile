const en = {
  common: {
    ok: 'OK!',
    cancel: 'Cancel',
    back: 'Back',
    appName: 'Lexana AI',
    beta: 'Beta',
    save: 'Save',
  },
  welcomeScreen: {
    catchLine: 'Join to building the future.',
    description: 'Tap into the full Solana chain with only your voice from anywhere',
    exploreButton: 'Start Lexana',
    signInButton: 'Sign in with Email',
    terms: 'By continuing, you agree to our',
    termsLink: 'Terms of Service',
    privacy: 'and',
    privacyLink: 'Privacy Policy',
    button: 'Login to Continue',
  },
  chatScreen: {
    voiceMode: {
      title: 'Normal Mode',
      placeholder: 'Ask Lexana anything...',
    },
    liveMode: {
      title: 'Live Mode',
    },
  },
  liveMode: {
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    connection: 'Connection',
    transcript: 'Transcript',
    noTranscript: 'No transcript available yet...',
    start: 'Start Live Chat',
    stop: 'Stop',
    mute: 'Mute',
    unmute: 'Unmute',
    connecting: 'Connecting...',
    disconnected: 'Disconnected',
    listening: 'Listening...',
    speaking: 'Lexana is speaking...',
    readyToListen: 'Ready to listen',
    youSaid: 'You said',
    lexanaSays: 'Lexana says',
    listeningEllipsis: 'Listening...',
    thinkingEllipsis: 'Thinking...',
    startSpeaking: 'Start Speaking',
    startSpeakingDescription: 'Tap and hold the microphone to start a conversation',
    error: {
      title: 'Error',
      failedToStart:
        'Failed to start live session. Please check your internet connection and try again.',
    },
  },
  menuScreen: {
    recentChats: "Recent Chats",
    noChatsTitle: "No Chats Yet",
    noChatsDescription: "Start a new conversation to begin chatting.",
    createNewChat: "Create New Chat",
    recentSearches: 'Recent Searches',
    editChatName: 'Edit Chat Name',
    deleteChat: 'Delete Chat',
  },
};

export default en;
export type Translations = typeof en;
