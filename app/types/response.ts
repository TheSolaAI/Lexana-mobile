export interface ChatRoomResponse {
  id: number;
  name: string;
  agent_id: number;
  user: number;
}

export interface ChatMessagesResponse {
  count: number;
  next: string;
  previous: string;
  results: ChatMessageResponseWrapper[];
}

export interface ChatMessageResponseWrapper {
  id: number;
  message: string; // this is JSON string of our ChatContent
  created_at: string;
}

export interface ToolSetResponse {
  selectedToolset: string[];
  fallbackResponse: string;
  audioData?: string;
  needsToolset: boolean;
  usageLimit: {
    active: boolean;
    tier: number;
    usageLimitUSD: number;
    percentageUsed: number;
  };
}
