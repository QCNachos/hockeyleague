import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import gameReducer from './slices/gameSlice';
import playerReducer from './slices/playerSlice';
import teamReducer from './slices/teamSlice';
import settingsReducer, { initializeState } from './slices/settingsSlice';

// Define default settings for initialization
const defaultSettings = {
  visualSettings: {
    communityPack: 1, // 0=disabled, 1=enabled (for team logos, etc.)
  },
  gameMode: {
    currentMode: 'MENU', // MENU, FRANCHISE, SEASON, PLAYOFF
    currentYear: 2024,
    seasonComplete: false,
    playoffComplete: false
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

// Initialize store with default settings immediately
try {
  // Check if settings state exists
  const state = store.getState();
  const settingsExist = state && 
                        state.settings && 
                        state.settings.visualSettings && 
                        state.settings.visualSettings.communityPack !== undefined;
  
  // Initialize if not found or if communityPack is undefined
  if (!settingsExist) {
    console.log('[REDUX] Initializing settings with defaults');
    store.dispatch(initializeState(defaultSettings));
  } else {
    console.log('[REDUX] Settings already exist in store:', state.settings);
  }
} catch (error) {
  console.error('[REDUX] Error checking/initializing settings:', error);
  // Attempt to initialize settings anyway
  store.dispatch(initializeState(defaultSettings));
} 