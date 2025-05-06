import { Message } from 'ai';
import { ChatMessageResponseWrapper, ChatMessagesResponse } from '../../types/response';
import { API_URLS } from '@/config/constants';
import { ApiClient, apiClient } from '../services/ApiClient';
import { toast } from 'sonner-native';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

interface MessagesState {
  messages: Message[];
  loading: boolean;
  next: string; // contains the next page URL
}

const initialState: MessagesState = {
  messages: [],
  loading: false,
  next: '',
};

export const fetchMessages = createAsyncThunk(
  'messages/fetchAll',
  async (roomId: number, { rejectWithValue }) => {
    const response = await apiClient.get<ChatMessagesResponse>(
      'auth',
      API_URLS.CHAT_ROOMS + `${roomId}/messages/?limit=40`
    );
    if (ApiClient.isApiResponse<ChatMessagesResponse>(response)) {
      const messages = response.data.results
        .reduce((acc: Message[], message: ChatMessageResponseWrapper) => {
          const item = parseChatItemContent(message);
          if (item) {
            acc.push(item);
          }
          return acc;
        }, [])
        .reverse();
      return {
        messages,
        next: response.data.next,
      };
    } else {
      toast.error('Failed to fetch messages');
      return rejectWithValue('Failed to fetch messages');
    }
  }
);

export const fetchMoreMessages = createAsyncThunk(
  'messages/fetchMore',
  async (nextPageUrl: string, { rejectWithValue }) => {
    const response = await apiClient.get<ChatMessagesResponse>('auth', nextPageUrl);
    if (ApiClient.isApiResponse<ChatMessagesResponse>(response)) {
      const messages = response.data.results
        .reduce((acc: Message[], message: ChatMessageResponseWrapper) => {
          const item = parseChatItemContent(message);
          if (item) {
            acc.push(item);
          }
          return acc;
        }, [])
        .reverse();
      return {
        messages,
        next: response.data.next,
      };
    } else {
      toast.error('Failed to fetch more messages');
      return rejectWithValue('Failed to fetch more messages');
    }
  }
);

export const parseChatItemContent = (item: ChatMessageResponseWrapper): Message | null => {
  try {
    // Parse the JSON string
    const parsedContent = JSON.parse(item.message);
    return parsedContent as Message;
  } catch (error) {
    console.error('Error parsing chat item content:', error);
    return null;
  }
};

export const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMessages.pending, state => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messages = action.payload.messages;
        state.next = action.payload.next;
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload as string);
      })
      .addCase(fetchMoreMessages.pending, state => {
        state.loading = true;
      })
      .addCase(fetchMoreMessages.fulfilled, (state, action) => {
        state.messages = [...action.payload.messages, ...state.messages];
        state.loading = false;
        state.next = action.payload.next;
      })
      .addCase(fetchMoreMessages.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload as string);
      });
  },
});

export const { setLoading } = messagesSlice.actions;
export default messagesSlice.reducer;
