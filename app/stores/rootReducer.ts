import { combineReducers, AnyAction } from '@reduxjs/toolkit';
import { userSlice } from './slices/userSlice';
import chatRoomsReducer from './slices/chatRoomsSlice';
import messagesReducer from './slices/messagesSlice';

const appReducer = combineReducers({
  user: userSlice.reducer,
  chatRooms: chatRoomsReducer,
  messages: messagesReducer,
});

export type AppState = ReturnType<typeof appReducer>;
export const rootReducer = (state: AppState | undefined, action: AnyAction): AppState => {
  if (action.type === 'LOGOUT') {
    // Reset state on logout
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};
