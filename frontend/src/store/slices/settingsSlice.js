import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Visual Settings
  visualSettings: {
    communityPack: 1, // 0=disabled, 1=enabled (for team logos, etc.)
    // Add other visual settings here as needed
  },
  
  // Game Mode Settings
  gameMode: {
    currentMode: 'MENU', // MENU, FRANCHISE, SEASON, PLAYOFF
    currentYear: 2024,
    seasonComplete: false,
    playoffComplete: false
  }
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Visual Settings Actions
    toggleCommunityPack: (state) => {
      state.visualSettings.communityPack = state.visualSettings.communityPack === 0 ? 1 : 0;
    },
    setCommunityPack: (state, action) => {
      state.visualSettings.communityPack = action.payload;
    },
    
    // Game Mode Actions
    setGameMode: (state, action) => {
      state.gameMode.currentMode = action.payload;
    },
    setGameYear: (state, action) => {
      state.gameMode.currentYear = action.payload;
    },
    setSeasonStatus: (state, action) => {
      state.gameMode.seasonComplete = action.payload;
    },
    setPlayoffStatus: (state, action) => {
      state.gameMode.playoffComplete = action.payload;
    },
    // Reset game status (for new seasons/games)
    resetGameStatus: (state) => {
      state.gameMode.seasonComplete = false;
      state.gameMode.playoffComplete = false;
    },
    // Initialize state with defaults (used for recovery if state is broken)
    initializeState: (state, action) => {
      return action.payload || initialState;
    }
  }
});

export const { 
  toggleCommunityPack, 
  setCommunityPack,
  setGameMode,
  setGameYear,
  setSeasonStatus,
  setPlayoffStatus,
  resetGameStatus,
  initializeState
} = settingsSlice.actions;

// Selectors with safe fallbacks
export const selectCommunityPack = (state) => {
  // Check if state exists and has the expected structure
  if (state === undefined || state.settings === undefined) {
    return 1; // Default to enabled if state is malformed
  }
  
  // Check if visualSettings exists
  if (state.settings.visualSettings === undefined) {
    return 1; // Default to enabled if visualSettings is missing
  }
  
  // Return communityPack value or default to enabled
  return state.settings.visualSettings.communityPack ?? 1;
};

export const selectGameMode = (state) => state.settings?.gameMode?.currentMode || 'MENU';
export const selectGameYear = (state) => state.settings?.gameMode?.currentYear || 2024;
export const selectSeasonStatus = (state) => state.settings?.gameMode?.seasonComplete || false;
export const selectPlayoffStatus = (state) => state.settings?.gameMode?.playoffComplete || false;

export default settingsSlice.reducer; 