import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '../rootReducer';
import { ApiClient, apiClient } from '../services/ApiClient';
import { API_URLS } from '@/config/constants';
import { toast } from 'sonner-native';

export interface ChatRoom {
  id?: number;
  name: string;
}

export interface ChatRoomPatch {
  id?: number;
  name?: string;
}

export interface ChatRoomResponse {
  id: number;
  name: string;
}

interface ChatRoomsState {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChatRoomsState = {
  rooms: [],
  currentRoom: null,
  loading: false,
  error: null,
};

export const fetchChatRooms = createAsyncThunk(
  'chatRooms/fetchAll',
  async (_, { rejectWithValue }) => {
    const response = await apiClient.get<ChatRoomResponse>('auth', API_URLS.CHAT_ROOMS, undefined);
    if (ApiClient.isApiResponse<ChatRoomResponse[]>(response)) {
      return response.data.map(
        (room: ChatRoomResponse): ChatRoom => ({
          id: room.id,
          name: room.name,
        })
      );
    } else {
      toast.error('Failed to fetch chat rooms');
      return rejectWithValue('Failed to fetch chat rooms');
    }
  }
);

export const deleteChatRoom = createAsyncThunk(
  'chatRooms/delete',
  async (roomId: number, { rejectWithValue, getState }) => {
    const state = getState() as AppState;
    const roomExists = state.chatRooms.rooms.some(room => room.id === roomId);

    if (!roomExists) {
      return rejectWithValue('Room not found');
    }

    const response = await apiClient.delete('auth', API_URLS.CHAT_ROOMS + roomId);

    if (ApiClient.isApiResponse(response)) {
      return roomId;
    } else {
      toast.error('Failed to delete room');
      return rejectWithValue('Failed to delete room');
    }
  }
);

export const updateChatRoom = createAsyncThunk(
  'chatRooms/update',
  async (room: ChatRoomPatch, { rejectWithValue, getState }) => {
    const state = getState() as AppState;
    const roomExists = state.chatRooms.rooms.some(r => r.id === room.id);

    if (!roomExists) {
      return rejectWithValue('Room not found');
    }

    const response = await apiClient.patch('auth', API_URLS.CHAT_ROOMS + room.id, room);

    if (ApiClient.isApiResponse<ChatRoomResponse>(response)) {
      return room;
    } else {
      toast.error('Failed to update room');
      return rejectWithValue('Failed to update room');
    }
  }
);

export const createChatRoom = createAsyncThunk(
  'chatRooms/create',
  async (room: ChatRoom, { rejectWithValue }) => {
    const response = await apiClient.post<ChatRoomResponse>('auth', API_URLS.CHAT_ROOMS, {
      name: room.name,
      session_id: 123,
    });

    if (ApiClient.isApiResponse(response)) {
      return {
        id: response.data.id,
        name: response.data.name,
      } as ChatRoom;
    } else {
      toast.error('Error creating room');
      return rejectWithValue('Failed to create room');
    }
  }
);

export const chatRoomsSlice = createSlice({
  name: 'chatRooms',
  initialState,
  reducers: {
    setCurrentRoom: (state, action: PayloadAction<ChatRoom | null>) => {
      state.currentRoom = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch chat rooms
      .addCase(fetchChatRooms.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.rooms = action.payload;
        state.loading = false;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete chat room
      .addCase(deleteChatRoom.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteChatRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter(room => room.id !== action.payload);
        state.loading = false;

        // Reset current room if it was deleted
        if (state.currentRoom?.id === action.payload) {
          state.currentRoom = null;
        }
      })
      .addCase(deleteChatRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update chat room
      .addCase(updateChatRoom.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateChatRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.map(room =>
          room.id === action.payload.id ? { ...room, ...action.payload } : room
        );
        state.loading = false;
      })
      .addCase(updateChatRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create chat room
      .addCase(createChatRoom.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createChatRoom.fulfilled, (state, action) => {
        state.rooms = [action.payload, ...state.rooms];
        state.loading = false;
        state.currentRoom = action.payload;
      })
      .addCase(createChatRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentRoom } = chatRoomsSlice.actions;
export default chatRoomsSlice.reducer;
