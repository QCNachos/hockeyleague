import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import gameReducer from './slices/gameSlice';
import playerReducer from './slices/playerSlice';
import teamReducer from './slices/teamSlice';
import settingsReducer from './slices/settingsSlice';

// Default state for initialization
const defaultState = {
  settings: {
    visualSettings: {
      communityPack: 1, // 0=disabled, 1=enabled (for team logos, etc.)
    },
    gameMode: {
      currentMode: 'MENU', // MENU, FRANCHISE, SEASON, PLAYOFF
      currentYear: 2024,
      seasonComplete: false,
      playoffComplete: false
    }
  }
};

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['settings'] // Persist settings including communityPack flag
};

// Combine reducers
const rootReducer = combineReducers({
  auth: authReducer, // Keep for backward compatibility
  game: gameReducer,
  players: playerReducer,
  teams: teamReducer,
  settings: settingsReducer
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create store with preloaded state
export const store = configureStore({
  reducer: persistedReducer,
  preloadedState: defaultState,
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

// Initialize store with default settings if empty
// This ensures we always have valid data even if persistence fails
if (!store.getState().settings?.visualSettings) {
  store.dispatch({ 
    type: 'settings/initializeState', 
    payload: defaultState.settings 
  });
} 