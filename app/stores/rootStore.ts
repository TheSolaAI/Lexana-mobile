import { persistStore, persistReducer, createTransform } from 'redux-persist';
import { configureStore } from '@reduxjs/toolkit';
import { storage } from '@/utils/storage';

const loadingTransform = createTransform(
  inboundState => {
    if (typeof inboundState === 'object' && inboundState !== null) {
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
    }),
  devTools: __DEV__, // Enable devTools only in development
});

const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { store, persistor };
