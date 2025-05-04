import { combineReducers, AnyAction } from '@reduxjs/toolkit';
import { userSlice } from './slices/userSlice';

const appReducer = combineReducers({
  user: userSlice.reducer,
});

export type AppState = ReturnType<typeof appReducer>;
export const rootReducer = (state: AppState | undefined, action: AnyAction): AppState => {
  if (action.type === 'LOGOUT') {
    // Reset state on logout
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};
