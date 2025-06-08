import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { ToolContext, ToolResult } from '@/types/tool';
import Exa from 'exa-js';

interface WebSearchResult {
  title: string;
  url: string;
  content: string;
  publishedDate?: string;
}

/**
 * Creates a web search tool using Exa API for up-to-date web information
 * @param context - The tool context containing authentication information
 * @returns The configured web search tool
 */
export const createWebSearchTool = (context: ToolContext) => {
  const Parameters = z.object({
    query: z
      .string()
      .min(1)
      .max(100)
      .describe('The search query to find up-to-date information on the web'),
  });

  const webSearchTool = {
    id: 'web_search' as const,
    description:
      'Search the web for up-to-date information on blockchain and crypto topics, media articles, news to help you answer questions about the latest trends and developments in the crypto space.',
    parameters: Parameters,
    openApiParameters: zodToJsonSchema(Parameters),
    execute: async (params: z.infer<typeof Parameters>): Promise<ToolResult> => {
      const { query } = params;

      try {
        // Initialize Exa client
        const exa = new Exa(process.env.EXPO_PUBLIC_EXA_API_KEY);

        if (!process.env.EXPO_PUBLIC_EXA_API_KEY) {
          return {
            success: false,
            error: 'EXA_API_KEY environment variable is not configured',
            data: undefined,
          };
        }

        // Perform web search with live crawling
        const { results } = await exa.searchAndContents(query, {
          livecrawl: 'always',
          numResults: 3,
        });

        console.log('results', results);

        // Format results according to the interface
        const searchResults: WebSearchResult[] = results.map((result: any) => ({
          title: result.title,
          url: result.url,
          content: result.text?.slice(0, 1000) || '', // Take first 1000 characters
          publishedDate: result.publishedDate,
        }));

        return {
          success: true,
          data: {
            query: query,
            results: searchResults,
            count: searchResults.length,
          },
          textResponse: false,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to perform web search',
          data: undefined,
        };
      }
    },
  };

  return webSearchTool;
};
