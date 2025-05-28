import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ApiClient, createApiClient } from '@/lib/ApiClient';
import { ToolContext, ToolResult } from '@/types/tool';

interface TokenDataResponse {
  token: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logoURI?: string;
  };
  price: {
    current: number;
    change24h: number;
    change24hPercent: number;
  };
  market: {
    marketCap: number;
    volume24h: number;
    liquidity: number;
  };
  holders: {
    count: number;
    topHolders?: Array<{
      address: string;
      balance: number;
      percentage: number;
    }>;
  };
}

export const createGetTokenDataTool = (context: ToolContext) => {
  const Parameters = z.object({
    token_address: z
      .string()
      .describe(
        'The exact token contract address, symbol, or name. For symbols provide the $ symbol (e.g., $SOL, $JUP, $BONK)'
      ),
  });

  const getTokenDataTool = {
    id: 'token_getTokenData' as const,
    description:
      'Get details such as the price, market cap, liquidity, price change, holders, volume of buy and sell, amount of holders, top holders and much more',
    parameters: Parameters,
    openApiParameters: zodToJsonSchema(Parameters),
    execute: async (params: z.infer<typeof Parameters>): Promise<ToolResult> => {
      const { token_address } = params;

      try {
        // Determine if input is an address or symbol
        const isAddress = token_address.length > 35;
        const url = isAddress
          ? `data/token/address?token_address=${token_address}`
          : `data/token/symbol?symbol=${token_address}`;

        // Fetch token data
        if (!context.authToken) {
          return {
            success: false,
            error: 'No auth token provided',
            data: undefined,
          };
        }

        const apiClient = createApiClient(context.authToken);
        const response = await apiClient.get<TokenDataResponse>(url, undefined, 'data');

        // Check if response is valid
        if (ApiClient.isApiResponse<TokenDataResponse>(response)) {
          return {
            success: true,
            data: response.data,
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
          error: error.message || 'Failed to fetch token data',
          data: undefined,
        };
      }
    },
  };

  return getTokenDataTool;
};
