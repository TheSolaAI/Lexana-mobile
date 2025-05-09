/**
 * Store configuration with persistence and RTK Query API middlewares.
 */
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import { configureStore } from '@reduxjs/toolkit';
import { storage } from '@/utils/storage';
import { rootReducer } from './rootReducer';
import { authApi } from './api/authApi';

const loadingTransform = createTransform(
  inboundState => {
    if (typeof inboundState === 'object' && inboundState !== null && 'loading' in inboundState) {
      const state = { ...inboundState };
      delete state.loading;
      return state;
    }
    return inboundState;
  },
  outboundState => {
    if (typeof outboundState === 'object' && outboundState !== null) {
      return { ...outboundState, loading: false };
    }
    return outboundState;
  },
  { whitelist: ['rootStore'] }
);

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'],
  transform: [loadingTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const createEnhancers = (getDefaultEnhancers: any) => {
  if (__DEV__) {
    const reactotron = require('../devtools/ReactotronConfig').default;
    return getDefaultEnhancers().concat(reactotron.createEnhancer());
  } else {
    return getDefaultEnhancers();
  }
};

// Create the store with proper typing
const store = configureStore({
  reducer: persistedReducer,
  enhancers: createEnhancers,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(authApi.middleware),
  devTools: __DEV__, // Enable devTools only in development
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };
