import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedRoomState {
  selectedRoomId: string | null;
}

const initialState: SelectedRoomState = {
  selectedRoomId: null,
};

export const selectedRoomSlice = createSlice({
  name: 'selectedRoom',
  initialState,
  reducers: {
    setSelectedRoomId: (state, action: PayloadAction<string | null>) => {
      state.selectedRoomId = action.payload;
    },
  },
});

export const { setSelectedRoomId } = selectedRoomSlice.actions;
export default selectedRoomSlice.reducer;
