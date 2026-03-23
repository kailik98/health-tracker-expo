import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import healthReducer from './slices/healthSlice';
import { reduxStorage } from './storage';

const rootReducer = combineReducers({
  health: healthReducer,
});

const persistConfig = {
  key: 'root',
  storage: reduxStorage,
  whitelist: ['health'], // Only persist health slice
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
