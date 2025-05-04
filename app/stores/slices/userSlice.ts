import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  name: string;
  profilePicture: string;
}

const initialState: UserState = {
  name: '',
  profilePicture: '',
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
});
