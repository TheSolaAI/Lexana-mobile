import { chatApi } from '../rootApi';

export const chatRoomsService = chatApi.injectEndpoints({
  endpoints: builder => ({
    /**
     * Fetch all chat rooms.
     */
    fetchChatRooms: builder.query({
      query: () => '',
      transformResponse: response =>
        response.map((room: any) => ({ id: room.id, name: room.name })),
      providesTags: ['ChatRoom'],
    }),
    /**
     * Create a new chat room.
     */
    createChatRoom: builder.mutation({
      query: room => ({
        url: '',
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
        url: `${room.id}`,
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
        url: `${roomId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['ChatRoom'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useFetchChatRoomsQuery,
  useCreateChatRoomMutation,
  useUpdateChatRoomMutation,
  useDeleteChatRoomMutation,
} = chatRoomsService;
