import { combineReducers, AnyAction } from '@reduxjs/toolkit';

const appReducer = combineReducers({});

export type AppState = ReturnType<typeof appReducer>;
export const rootReducer = (state: AppState | undefined, action: AnyAction): AppState => {
  if (action.type === 'LOGOUT') {
    // Reset state on logout
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};
