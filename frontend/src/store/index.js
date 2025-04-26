import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import gameReducer from './slices/gameSlice';
import playerReducer from './slices/playerSlice';
import teamReducer from './slices/teamSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: [] // We're using AuthContext now, so no need to persist auth
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer, // Keep for backward compatibility
  game: gameReducer,
  players: playerReducer,
  teams: teamReducer
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore persisted actions in serializable check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      }
    })
});

// Create persistor
export const persistor = persistStore(store); 