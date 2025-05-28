import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ApiClient, createApiClient } from '@/lib/ApiClient';
import { ToolContext, ToolResult } from '@/types/tool';

interface TrendingNFT {
  name: string;
  image: string;
  floor_price: number;
  volume_24hr: number;
}

export function createGetTrendingNFTsTool(context: ToolContext) {
  const Parameters = z.object({});

  const getTrendingNFTsTool = {
    id: 'nft_get_trending' as const,
    description:
      'Retrieves the currently trending NFT collections on Solana. Use when the user wants to know what NFTs are currently popular or trending.',
    parameters: Parameters,
    openApiParameters: zodToJsonSchema(Parameters),
    execute: async (): Promise<ToolResult> => {
      if (!context.authToken) {
        return {
          success: false,
          error: 'No auth token provided',
          data: undefined,
        };
      }

      try {
        const apiClient = createApiClient(context.authToken);
        const response = await apiClient.get<TrendingNFT[]>('data/nft/top_nft', undefined, 'data');

        if (ApiClient.isApiError(response)) {
          return {
            success: false,
            error: 'Failed to fetch trending NFT collections',
            data: undefined,
          };
        }

        const trendingNFTs = response.data;

        return {
          success: true,
          data: {
            type: 'get_trending_nfts',
            details: {
              collections: trendingNFTs.map(nft => ({
                name: nft.name,
                symbol: nft.image,
                floor_price: nft.floor_price,
                volume_24hr: nft.volume_24hr,
              })),
            },
            response_id: 'temp',
            sender: 'system',
            timestamp: new Date().toISOString(),
          },
          error: undefined,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Unable to retrieve trending NFT collections',
          data: undefined,
        };
      }
    },
  };

  return getTrendingNFTsTool;
}
