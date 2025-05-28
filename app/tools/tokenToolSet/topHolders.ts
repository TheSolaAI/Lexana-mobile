import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ApiClient, createApiClient } from '@/lib/ApiClient';
import { ToolContext, ToolResult } from '@/types/tool';

interface TopHolder {
  address: string;
  balance: number;
  percentage: number;
}

interface TopHoldersResponse {
  topHolders: TopHolder[];
}

export function createTopHoldersTool(context: ToolContext) {
  const Parameters = z.object({
    token_address: z
      .string()
      .describe(
        'The token address (contract address) to get top holders for. Must be a valid Solana SPL token address.'
      ),
  });

  const topHoldersTool = {
    id: 'token_topHolders' as const,
    description:
      'Get the top holders for a specific token on the Solana blockchain. Use this to analyze token distribution, whale concentration, and insider holdings.',
    parameters: Parameters,
    openApiParameters: zodToJsonSchema(Parameters),
    execute: async (params: z.infer<typeof Parameters>): Promise<ToolResult> => {
      try {
        if (!context.authToken) {
          return {
            success: false,
            error: 'No auth token provided',
            data: undefined,
          };
        }

        const topHolders = await getTopHoldersHandler(params.token_address, context.authToken);

        if (!topHolders) {
          return {
            success: false,
            error:
              'Failed to fetch top holders information. Please check the token address and try again.',
            data: undefined,
          };
        }

        return {
          success: true,
          data: {
            details: topHolders,
          },
          error: undefined,
          textResponse: false,
        };
      } catch (error) {
        console.error('Error getting top holders:', error);
        return {
          success: false,
          error:
            'Error getting top holders information. The token may not exist or there might be a network issue.',
          data: undefined,
        };
      }
    },
  };

  return topHoldersTool;
}

export async function getTopHoldersHandler(
  token: string,
  authToken: string
): Promise<TopHolder[] | null> {
  try {
    const apiClient = createApiClient(authToken);
    const response = await apiClient.get<TopHoldersResponse>(
      `data/token/top_holders?token_address=${token}`,
      undefined,
      'data'
    );

    if (ApiClient.isApiResponse<TopHoldersResponse>(response)) {
      return response.data.topHolders;
    }

    console.error('Failed to fetch top holders:', response.errors[0]?.detail);
    return null;
  } catch (error) {
    console.error('Error in getTopHoldersHandler:', error);
    return null;
  }
}
