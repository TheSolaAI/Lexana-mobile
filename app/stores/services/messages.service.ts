import { chatApi } from '../rootApi';
import { Message } from 'ai';
import { ChatMessageResponseWrapper, ChatMessagesResponse } from '../../types/response';

export const messagesService = chatApi.injectEndpoints({
  endpoints: builder => ({
    /**
     * Fetch messages for a given chat room.
     */
    fetchMessages: builder.query<{ messages: Message[]; next: string }, number>({
      query: roomId => `${roomId}/messages/?limit=40`,
      transformResponse: (response: ChatMessagesResponse) => {
        const messages = response.results
          .reduce((acc: Message[], message: ChatMessageResponseWrapper) => {
            const item = parseChatItemContent(message);
            if (item) acc.push(item);
            return acc;
          }, [])
          .reverse();
        return { messages, next: response.next };
      },
    }),
    /**
     * Fetch more messages using the next page URL.
     */
    fetchMoreMessages: builder.query<{ messages: Message[]; next: string }, string>({
      query: nextPageUrl => nextPageUrl,
      transformResponse: (response: ChatMessagesResponse) => {
        const messages = response.results
          .reduce((acc: Message[], message: ChatMessageResponseWrapper) => {
            const item = parseChatItemContent(message);
            if (item) acc.push(item);
            return acc;
          }, [])
          .reverse();
        return { messages, next: response.next };
      },
    }),
  }),
  overrideExisting: false,
});

export const { useFetchMessagesQuery, useFetchMoreMessagesQuery } = messagesService;

/**
 * Parse a chat message response wrapper into a Message object.
 * @param item The chat message response wrapper.
 * @returns The parsed Message object or null if parsing fails.
 */
export const parseChatItemContent = (item: ChatMessageResponseWrapper): Message | null => {
  try {
    const parsedContent = JSON.parse(item.message);
    return parsedContent as Message;
  } catch (error) {
    console.error('Error parsing chat item content:', error);
    return null;
  }
};
