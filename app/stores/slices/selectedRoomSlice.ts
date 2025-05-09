import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedRoomState {
  selectedRoomId: number | null;
}

const initialState: SelectedRoomState = {
  selectedRoomId: null,
};

export const selectedRoomSlice = createSlice({
  name: 'selectedRoom',
  initialState,
  reducers: {
    setSelectedRoomId: (state, action: PayloadAction<number | null>) => {
      state.selectedRoomId = action.payload;
    },
  },
});

export const { setSelectedRoomId } = selectedRoomSlice.actions;
export default selectedRoomSlice.reducer;
