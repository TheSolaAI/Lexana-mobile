import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ApiClient, createApiClient } from '@/lib/ApiClient';
import { ToolContext, ToolResult } from '@/types/tool';

interface TokenAddressResponse {
  token: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
}

export const createTokenAddressTool = (context: ToolContext) => {
  const Parameters = z.object({
    symbol: z
      .string()
      .describe('The token symbol to get the contract address for (e.g., SOL, USDC, JUP)'),
  });

  const tokenAddressTool = {
    id: 'token_getAddress' as const,
    description:
      'Get the contract address for a token by its symbol. Use this when you need to find the contract address of a specific token.',
    parameters: Parameters,
    openApiParameters: zodToJsonSchema(Parameters),
    execute: async (params: z.infer<typeof Parameters>): Promise<ToolResult> => {
      const { symbol } = params;

      try {
        if (!context.authToken) {
          return {
            success: false,
            error: 'No auth token provided',
            data: undefined,
          };
        }

        const apiClient = createApiClient(context.authToken);
        const response = await apiClient.get<TokenAddressResponse>(
          `data/token/symbol?symbol=${symbol}`,
          undefined,
          'data'
        );

        // Check if response is valid
        if (ApiClient.isApiResponse<TokenAddressResponse>(response)) {
          return {
            success: true,
            data: {
              symbol: symbol,
              address: response.data.token.address,
              name: response.data.token.name,
              decimals: response.data.token.decimals,
            },
            textResponse: false,
          };
        }

        // Handle invalid response
        return {
          success: false,
          error: response.errors[0].detail,
          data: undefined,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to fetch token address',
          data: undefined,
        };
      }
    },
  };

  return tokenAddressTool;
};
