/**
 * Season Service
 * 
 * This service manages season data operations with localStorage
 * It's designed to be easily replaced with real API calls in the future
 */

// Constants
const SAVED_SEASONS_KEY = 'savedSeasons';
const ACTIVE_SEASON_KEY = 'activeSeasonId';

// Get all saved seasons
export const getAllSeasons = async () => {
  try {
    const seasons = JSON.parse(localStorage.getItem(SAVED_SEASONS_KEY) || '[]');
    return { success: true, data: seasons };
  } catch (error) {
    console.error('Error loading seasons:', error);
    return { success: false, error: 'Failed to load seasons' };
  }
};

// Get season by ID
export const getSeasonById = async (seasonId) => {
  try {
    const seasons = JSON.parse(localStorage.getItem(SAVED_SEASONS_KEY) || '[]');
    const season = seasons.find(s => s.id === seasonId);
    
    if (!season) {
      return { success: false, error: 'Season not found' };
    }
    
    return { success: true, data: season };
  } catch (error) {
    console.error('Error loading season:', error);
    return { success: false, error: 'Failed to load season' };
  }
};

// Create a new season
export const createSeason = async (seasonData) => {
  try {
    // Create a unique ID for the season
    const seasonId = Date.now().toString();
    
    // Create the season object
    const season = {
      ...seasonData,
      id: seasonId,
      createdAt: new Date().toISOString(),
      currentDate: new Date().toISOString(),
      teams: [],
      games: [],
      standings: [],
      currentDay: 0
    };
    
    // Save to localStorage
    const savedSeasons = JSON.parse(localStorage.getItem(SAVED_SEASONS_KEY) || '[]');
    savedSeasons.push(season);
    localStorage.setItem(SAVED_SEASONS_KEY, JSON.stringify(savedSeasons));
    
    // Set as active season
    localStorage.setItem(ACTIVE_SEASON_KEY, seasonId);
    
    return { success: true, data: { seasonId, season } };
  } catch (error) {
    console.error('Error creating season:', error);
    return { success: false, error: 'Failed to create season' };
  }
};

// Update a season
export const updateSeason = async (seasonId, seasonData) => {
  try {
    const savedSeasons = JSON.parse(localStorage.getItem(SAVED_SEASONS_KEY) || '[]');
    const seasonIndex = savedSeasons.findIndex(s => s.id === seasonId);
    
    if (seasonIndex === -1) {
      return { success: false, error: 'Season not found' };
    }
    
    // Update the season data
    savedSeasons[seasonIndex] = {
      ...savedSeasons[seasonIndex],
      ...seasonData,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(SAVED_SEASONS_KEY, JSON.stringify(savedSeasons));
    
    return { success: true, data: savedSeasons[seasonIndex] };
  } catch (error) {
    console.error('Error updating season:', error);
    return { success: false, error: 'Failed to update season' };
  }
};

// Delete a season
export const deleteSeason = async (seasonId) => {
  try {
    const savedSeasons = JSON.parse(localStorage.getItem(SAVED_SEASONS_KEY) || '[]');
    const updatedSeasons = savedSeasons.filter(s => s.id !== seasonId);
    
    localStorage.setItem(SAVED_SEASONS_KEY, JSON.stringify(updatedSeasons));
    
    // If the active season was deleted, clear active season
    if (localStorage.getItem(ACTIVE_SEASON_KEY) === seasonId) {
      localStorage.removeItem(ACTIVE_SEASON_KEY);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting season:', error);
    return { success: false, error: 'Failed to delete season' };
  }
};

// Get the active season
export const getActiveSeason = async () => {
  try {
    const activeSeasonId = localStorage.getItem(ACTIVE_SEASON_KEY);
    
    if (!activeSeasonId) {
      return { success: false, error: 'No active season' };
    }
    
    return getSeasonById(activeSeasonId);
  } catch (error) {
    console.error('Error getting active season:', error);
    return { success: false, error: 'Failed to get active season' };
  }
};

// Set the active season
export const setActiveSeason = async (seasonId) => {
  try {
    // Verify the season exists
    const { success } = await getSeasonById(seasonId);
    
    if (!success) {
      return { success: false, error: 'Season not found' };
    }
    
    localStorage.setItem(ACTIVE_SEASON_KEY, seasonId);
    return { success: true };
  } catch (error) {
    console.error('Error setting active season:', error);
    return { success: false, error: 'Failed to set active season' };
  }
};

// Simulate a game
export const simulateGame = async (seasonId, gameId) => {
  // This would be a backend call in the future
  // For now, we'll generate a simple random result
  return { success: true, message: 'Game simulation is not implemented yet' };
};

// Simulate to next day
export const simulateToNextDay = async (seasonId) => {
  try {
    const { success, data: season, error } = await getSeasonById(seasonId);
    
    if (!success) {
      return { success: false, error };
    }
    
    // Update the current date
    const currentDate = new Date(season.currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    
    const updatedSeasonData = {
      ...season,
      currentDate: currentDate.toISOString(),
      currentDay: season.currentDay + 1
    };
    
    return updateSeason(seasonId, updatedSeasonData);
  } catch (error) {
    console.error('Error simulating to next day:', error);
    return { success: false, error: 'Failed to simulate to next day' };
  }
};

// Export/Import functions for saving/loading seasons as files
export const exportSeasonToJson = (season) => {
  try {
    const seasonJson = JSON.stringify(season, null, 2);
    const blob = new Blob([seasonJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${season.name.replace(/\s+/g, '_').toLowerCase()}_${season.id}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    console.error('Error exporting season:', error);
    return { success: false, error: 'Failed to export season' };
  }
};

// This function would be used in a file input component
export const importSeasonFromJson = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const seasonData = JSON.parse(e.target.result);
        
        // Ensure the imported season has a unique ID
        seasonData.id = Date.now().toString();
        seasonData.importedAt = new Date().toISOString();
        
        // Save the imported season
        const savedSeasons = JSON.parse(localStorage.getItem(SAVED_SEASONS_KEY) || '[]');
        savedSeasons.push(seasonData);
        localStorage.setItem(SAVED_SEASONS_KEY, JSON.stringify(savedSeasons));
        
        resolve({ success: true, data: seasonData });
      } catch (error) {
        console.error('Error parsing season file:', error);
        resolve({ success: false, error: 'Invalid season file format' });
      }
    };
    
    reader.onerror = () => {
      resolve({ success: false, error: 'Failed to read file' });
    };
    
    reader.readAsText(file);
  });
}; 