import { API_URLS } from '@/config/constants';
import { authApi } from '../api/authApi';
import type { ChatRoomResponse } from '@/types/response';

export const chatRoomsService = authApi.injectEndpoints({
  endpoints: builder => ({
    /**
     * Fetch all chat rooms.
     */
    fetchChatRooms: builder.query<ChatRoomResponse[], void>({
      query: () => API_URLS.CHAT_ROOMS,
      transformResponse: (response: any): ChatRoomResponse[] => {
        if (Array.isArray(response)) {
          return response.map((room: ChatRoomResponse) => ({
            id: room.id,
            name: room.name,
            agent_id: room.agent_id,
            user: room.user,
          }));
        }
        if (response && Array.isArray(response.results)) {
          return response.results.map((room: ChatRoomResponse) => ({
            id: room.id,
            name: room.name,
            agent_id: room.agent_id,
            user: room.user,
          }));
        }
        return [];
      },
      providesTags: ['ChatRoom'],
    }),
    /**
     * Create a new chat room.
     */
    createChatRoom: builder.mutation({
      query: room => ({
        url: API_URLS.CHAT_ROOMS,
        method: 'POST',
        body: { name: room.name, session_id: 123 },
      }),
      invalidatesTags: ['ChatRoom'],
    }),
    /**
     * Update a chat room.
     */
    updateChatRoom: builder.mutation({
      query: room => ({
        url: `${API_URLS.CHAT_ROOMS}${room.id}/`,
        method: 'PATCH',
        body: room,
      }),
      invalidatesTags: ['ChatRoom'],
    }),
    /**
     * Delete a chat room by ID.
     */
    deleteChatRoom: builder.mutation({
      query: roomId => ({
        url: `${API_URLS.CHAT_ROOMS}${roomId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ChatRoom'],
    }),
  }),
  overrideExisting: __DEV__,
});

export const {
  useFetchChatRoomsQuery,
  useCreateChatRoomMutation,
  useUpdateChatRoomMutation,
  useDeleteChatRoomMutation,
} = chatRoomsService;
