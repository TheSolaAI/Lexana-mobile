import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { privyClient } from '@/stores/services/ApiClient';

/**
 * Root RTK Query API for auth-related endpoints.
 * Endpoints are injected from services.
 */
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_AUTH_SERVICE_URL,
    prepareHeaders: async headers => {
      const token = await privyClient.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['ChatRoom', 'Message'],
  endpoints: () => ({}),
});
