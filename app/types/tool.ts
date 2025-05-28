export interface ToolContext {
  authToken?: string | null;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  textResponse?: boolean;
}
