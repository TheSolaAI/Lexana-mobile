import { ToolContext } from '@/types/tool';

// Import all tool creators
import { createGetTokenDataTool, createTopHoldersTool } from './tokenToolSet';
import { createGetTrendingNFTsTool, createGetNFTPriceTool } from './nftToolSet';
import { createTrendingAiProjectsTool } from './aiProjectsToolSet';
import { createTokenAddressTool } from './commonToolSet';

export function createAllTools(context: ToolContext) {
  return {
    // Token tools
    getTokenData: createGetTokenDataTool(context),
    topHolders: createTopHoldersTool(context),
    tokenAddress: createTokenAddressTool(context),

    // NFT tools
    getTrendingNFTs: createGetTrendingNFTsTool(context),
    getNFTPrice: createGetNFTPriceTool(context),

    // AI Projects tools
    filterTrendingAiProjects: createTrendingAiProjectsTool(),
  };
}

export const availableTools = [
  'token_getTokenData',
  'token_topHolders',
  'token_getAddress',
  'nft_get_trending',
  'nft_get_price',
  'aiProjects_filterTrendingAiProjectsTool',
] as const;

export type AvailableToolIds = (typeof availableTools)[number];

// Re-export all individual tool creators
export * from './tokenToolSet';
export * from './nftToolSet';
export * from './aiProjectsToolSet';
export * from './commonToolSet';
