import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URLS } from '@/config/constants';

/**
 * Root RTK Query API for chat-related endpoints.
 * Endpoints are injected from services.
 */
export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URLS.CHAT_ROOMS }),
  tagTypes: ['ChatRoom', 'Message'],
  endpoints: () => ({}),
});
