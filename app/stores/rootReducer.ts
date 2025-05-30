/**
 * Root reducer combining all slices and RTK Query API reducers.
 */
import { combineReducers, AnyAction } from '@reduxjs/toolkit';
import selectedRoomReducer from './slices/selectedRoomSlice';
import { authApi } from './api/authApi';

const appReducer = combineReducers({
  selectedRoom: selectedRoomReducer,
  [authApi.reducerPath]: authApi.reducer,
});

export type AppState = ReturnType<typeof appReducer>;
export const rootReducer = (state: AppState | undefined, action: AnyAction): AppState => {
  if (action.type === 'LOGOUT') {
    // Reset state on logout
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};
