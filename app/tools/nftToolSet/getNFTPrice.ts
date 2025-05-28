import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ApiClient, createApiClient } from '@/lib/ApiClient';
import { ToolContext, ToolResult } from '@/types/tool';

interface NFTPriceData {
  collection: string;
  floorPrice: number;
  volume24h: number;
  change24h: number;
  listings: number;
}

export function createGetNFTPriceTool(context: ToolContext) {
  const Parameters = z.object({
    collection_id: z
      .string()
      .describe('The NFT collection ID or name to get price information for'),
  });

  const getNFTPriceTool = {
    id: 'nft_get_price' as const,
    description:
      'Get current floor price, volume, and market data for a specific NFT collection on Solana.',
    parameters: Parameters,
    openApiParameters: zodToJsonSchema(Parameters),
    execute: async (params: z.infer<typeof Parameters>): Promise<ToolResult> => {
      if (!context.authToken) {
        return {
          success: false,
          error: 'No auth token provided',
          data: undefined,
        };
      }

      try {
        const apiClient = createApiClient(context.authToken);
        const response = await apiClient.get<NFTPriceData>(
          `data/nft/price?collection=${params.collection_id}`,
          undefined,
          'data'
        );

        if (ApiClient.isApiError(response)) {
          return {
            success: false,
            error: 'Failed to fetch NFT price data',
            data: undefined,
          };
        }

        return {
          success: true,
          data: {
            type: 'nft_price',
            collection: params.collection_id,
            details: response.data,
          },
          error: undefined,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Unable to retrieve NFT price information',
          data: undefined,
        };
      }
    },
  };

  return getNFTPriceTool;
}
