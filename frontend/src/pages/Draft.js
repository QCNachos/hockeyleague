import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check for environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase credentials. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are defined in your .env file.'
  );
}

const supabase = createClient(
  supabaseUrl || 'https://your-supabase-url.supabase.co',
  supabaseKey || 'your-supabase-anon-key'
);

const DraftContainer = styled.div`
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  h1 {
    margin: 0;
    background: linear-gradient(45deg, #C4CED4, #fff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const ControlPanel = styled.div`
  display: flex;
  gap: 15px;
`;

const Button = styled.button`
  background-color: #B30E16;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #950b12;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const DraftBoard = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  
  h2 {
    color: #C4CED4;
    margin-top: 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const Tab = styled.div`
  padding: 10px 20px;
  cursor: pointer;
  color: ${props => props.active ? '#B30E16' : '#C4CED4'};
  border-bottom: 2px solid ${props => props.active ? '#B30E16' : 'transparent'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    color: ${props => props.active ? '#B30E16' : '#fff'};
  }
`;

const TabButton = Tab;

const ProspectPool = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  
  h2 {
    color: #C4CED4;
    margin-top: 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
  }
`;

const SearchBar = styled.div`
  margin-bottom: 20px;
  
  input {
    width: 100%;
    padding: 10px;
    background-color: #2a2a2a;
    border: 1px solid #333;
    border-radius: 4px;
    color: #fff;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: #B30E16;
    }
  }
`;

const ProspectTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 10px;
    color: #C4CED4;
    border-bottom: 1px solid #333;
  }
  
  td {
    padding: 12px 10px;
    border-bottom: 1px solid #333;
    color: #bbb;
  }
  
  tr:hover td {
    background-color: #2a2a2a;
  }
`;

const YearSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  select {
    padding: 5px 10px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
`;

const DraftPicksTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  
  th, td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #444;
    color: #bbb;
  }
  
  thead {
    background-color: #333;
    color: #C4CED4;
  }
  
  tr.upcoming-pick {
    color: #aaa;
  }
  
  tr.round-header {
    background-color: #333;
    color: white;
    font-weight: bold;
  }
  
  tr.round-header td {
    padding: 12px 15px;
    font-size: 18px;
    text-align: left;
  }
`;

const ActionButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #45a049;
  }
`;

const SimulateButton = styled(Button)`
  background-color: #4CAF50;
  font-weight: bold;
  padding: 10px 16px;
  margin-left: auto;
`;

const ErrorDisplay = styled.div`
  margin: 20px 0;
  padding: 15px;
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 4px solid #B30E16;
  color: #fff;
`;

const InfoMessage = styled.div`
  margin: 20px 0;
  padding: 15px;
  background-color: rgba(0, 0, 255, 0.1);
  border-left: 4px solid #4a90e2;
  color: #fff;
`;

const ErrorContainer = styled.div`
  margin: 20px 0;
  padding: 15px;
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 4px solid #B30E16;
  color: #fff;
`;

const DraftControlPanel = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const RoundContainer = styled.div`
  margin-bottom: 20px;
`;

const PicksGrid = styled.div`
  display: flex;
  gap: 10px;
`;

const PickCard = styled.div`
  padding: 10px;
  border: 1px solid ${props => props.selected ? '#B30E16' : '#333'};
  border-radius: 4px;
  cursor: pointer;
  background-color: ${props => props.selected ? '#2a2a2a' : '#1e1e1e'};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.selected ? '#333' : '#2a2a2a'};
  }
  
  .pick-number {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .team-name {
    font-weight: bold;
  }
  
  .player-name {
    color: #2ecc71;
  }
  
  .no-pick {
    color: #777;
  }
`;

const LoadingMessage = styled.p`
  color: #bbb;
  margin: 20px 0;
  font-style: italic;
`;

// Define base URL
const API_BASE_URL = 'http://localhost:5001/api';

// Add a new styled component for trade indicators
const TradeIndicator = styled.span`
  color: #4a90e2;
  font-size: 14px;
  margin-right: 5px;
  position: relative;
  top: 0;
`;

const ReceivedPickInfo = styled.span`
  color: #999;
  font-size: 12px;
  margin-left: 5px;
  display: flex;
  align-items: center;
`;

// Add a styled component for the team indicator
const TeamIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Add a styled component for received pick indicator
const ReceivedIndicator = styled.span`
  color: #4a90e2;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  
  &::before {
    content: "→";
    margin-right: 4px;
  }
`;

const Draft = () => {
  const [activeTab, setActiveTab] = useState('draftBoard');
  const [searchQuery, setSearchQuery] = useState('');
  const [draftYear, setDraftYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [draftInfo, setDraftInfo] = useState(null);
  const [draftOrder, setDraftOrder] = useState([]);
  const [draftablePlayers, setDraftablePlayers] = useState([]);
  const [completedPicks, setCompletedPicks] = useState([]);
  const [canStartDraft, setCanStartDraft] = useState(false);
  
  // Added filtering states
  const [positionFilter, setPositionFilter] = useState('all');
  const [nationalityFilter, setNationalityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('overall');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  // Fetch draft order
  const fetchDraftOrder = useCallback(async () => {
    try {
      // Use the debug endpoint instead
      console.log(`Fetching draft picks for year ${draftYear}...`);
      const response = await axios.get(`${API_BASE_URL}/teams/draft-picks-debug?year=${draftYear}`);
      
      if (response.data) {
        // Debug: Log raw data
        console.log('Raw API response data:', response.data);
        
        // The debug endpoint has a different structure - use raw_data for the picks
        const picksData = response.data.raw_data || [];
        
        // Process the picks from the debug endpoint
        const picks = picksData.map(pick => {
          // Get the team abbreviation
          const teamAbbrev = pick.team || 'Unknown';
          
          // Check for received picks
          const receivedFrom = pick.received_pick_1 || pick.received_pick_2 || 
                              pick.received_pick_3 || pick.received_pick_4 || 
                              pick.received_pick_5 || pick.received_pick_6 || null;
          
          // Basic pick information
          return {
            id: pick.id,
            team_abbreviation: teamAbbrev,
            round_num: pick.round,
            pick_status: pick.pick_status || 'Owned',
            received_from: receivedFrom,
            // Add overall pick number based on round and id for display
            overall_pick: ((pick.round - 1) * 32) + (parseInt(pick.id) % 32) || pick.id,
            // Additional fields to maintain compatibility with UI
            player_id: null,
            team: {
              abbreviation: teamAbbrev,
              name: teamAbbrev, // Will be replaced with actual team name if available
              primary_color: '#333', // Default color
              secondary_color: '#fff' // Default color
            }
          };
        });
        
        // Sort picks by round and then by overall pick
        picks.sort((a, b) => {
          if (a.round_num !== b.round_num) {
            return a.round_num - b.round_num;
          }
          return a.overall_pick - b.overall_pick;
        });
        
        // Debug: Look for any pick with non-standard status
        const nonStandardPicks = picks.filter(p => p.pick_status !== 'Owned');
        console.log('Picks with non-standard status:', nonStandardPicks);
        console.log('Non-owned picks from API:', response.data.non_owned_picks);
        console.log('Status counts:', response.data.status_counts);
        
        // Try to fetch team details to add colors and full names
        try {
          const teamsResponse = await axios.get(`${API_BASE_URL}/teams/nhl`);
          if (teamsResponse.data && Array.isArray(teamsResponse.data)) {
            const teamMap = {};
            teamsResponse.data.forEach(team => {
              teamMap[team.abbreviation] = team;
            });
            
            // Update picks with team information
            picks.forEach(pick => {
              const team = teamMap[pick.team_abbreviation];
              if (team) {
                pick.team = {
                  id: team.id,
                  abbreviation: team.abbreviation,
                  name: team.name,
                  city: team.city,
                  primary_color: team.primary_color || '#333',
                  secondary_color: team.secondary_color || '#fff'
                };
              }
            });
          }
        } catch (teamErr) {
          console.error('Error fetching team details:', teamErr);
          // Continue with basic team info
        }
        
        setDraftOrder(picks);
        setCompletedPicks([]);
        
        console.log(`Loaded ${picks.length} picks from debug endpoint`);
        return picks;
      } else {
        console.error('Invalid data format for draft picks:', response.data);
        setDraftOrder([]);
        setCompletedPicks([]);
        return [];
      }
    } catch (err) {
      console.error('Error fetching draft order:', err);
      setDraftOrder([]);
      setCompletedPicks([]);
      return [];
    }
  }, [draftYear]);
  
  // Add a dedicated function for fetching prospects - Define this second
  const fetchDraftProspects = useCallback(async () => {
    try {
      console.log(`Fetching draft prospects for year ${draftYear}...`);
      const response = await axios.get(`${API_BASE_URL}/draft/prospects?year=${draftYear}`);
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Loaded ${response.data.length} draft prospects`);
      setDraftablePlayers(response.data);
        return response.data;
      } else {
        console.error('Invalid data format for draft prospects');
        setDraftablePlayers([]);
        return [];
      }
    } catch (err) {
      console.error('Error fetching draft prospects:', err);
      setDraftablePlayers([]);
      return [];
    }
  }, [draftYear]);
  
  // Fetch draft info - Define this third
  const fetchDraftInfo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/draft/?year=${draftYear}`);
      
      // Check if it's mock data and add a message if it is
      if (response.data && response.data.mock_data) {
        console.log('Using mock draft data:', response.data);
        setError('Using mock draft data - some features may be limited');
      }
      
      setDraftInfo(response.data);
      
      // Also fetch draft order and players
      await fetchDraftOrder();
      await fetchDraftProspects();
      
    } catch (err) {
      console.error('Error fetching draft info:', err);
      
      // If the main endpoint fails, try the mock endpoint
      try {
        console.log('Trying mock draft endpoint as fallback...');
        const mockResponse = await axios.get(`${API_BASE_URL}/draft/mock?year=${draftYear}`);
        setDraftInfo(mockResponse.data);
        console.log('Using mock draft data:', mockResponse.data);
        
        // Still try to fetch order and players
        await fetchDraftOrder();
        await fetchDraftProspects();
        
        setError('Using mock draft data - some features may be limited');
      } catch (mockErr) {
        console.error('Mock endpoint also failed:', mockErr);
        setError('Failed to load draft information - database may not be properly initialized');
      }
    } finally {
      setLoading(false);
    }
  }, [draftYear, fetchDraftOrder, fetchDraftProspects]);

  // Add a fetchData function that combines all data fetching - Define this last
  const fetchData = useCallback(() => {
    setLoading(true);
    
    // First get the draft info
    fetchDraftInfo()
      .then(() => {
        // Then get the draft order
        return fetchDraftOrder();
      })
      .then(() => {
        // Then get the draft prospects
        return fetchDraftProspects();
      })
      .catch(err => {
        console.error('Error during data fetch cycle:', err);
        setError('Failed to load some draft data. Limited functionality may be available.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fetchDraftInfo, fetchDraftOrder, fetchDraftProspects]);

  // Call this on component mount and when year changes
  useEffect(() => {
    fetchData();
  }, [fetchData, draftYear]);

  // Direct test of Supabase data
  useEffect(() => {
    const fetchDraftPicksDirectly = async () => {
      try {
        console.log('DIRECT TEST: Querying Draft_Picks table...');
        const { data, error } = await supabase
          .from('Draft_Picks')
          .select('*')
          .eq('year', draftYear)
          .limit(10);
          
        if (error) {
          console.error('DIRECT TEST ERROR:', error);
          } else {
          console.log('DIRECT TEST RESULT - First 10 draft picks:', data);
          
          // Check specific fields
          if (data && data.length > 0) {
            const samplePick = data[0];
            console.log('DIRECT TEST - Sample pick fields:', {
              id: samplePick.id,
              team: samplePick.team,
              year: samplePick.year,
              round: samplePick.round,
              pick_status: samplePick.pick_status,
              received_pick_1: samplePick.received_pick_1,
              all_keys: Object.keys(samplePick)
            });
            
            // Log picks with non-standard statuses
            const nonOwnedPicks = data.filter(p => p.pick_status !== 'Owned');
            console.log('DIRECT TEST - Non-owned picks:', nonOwnedPicks);
          }
        }
      } catch (err) {
        console.error('DIRECT TEST EXCEPTION:', err);
      }
    };
    
    // Run the direct test when component mounts or year changes
    if (supabase) {
      fetchDraftPicksDirectly();
    }
  }, [draftYear]);
  
  // Fetch NHL teams from Supabase
  useEffect(() => {
    const fetchNHLTeams = async () => {
      try {
        console.log('Attempting to fetch NHL teams from API...');
        const response = await axios.get(`${API_BASE_URL}/teams/nhl`);
        
        if (response.data && response.data.length > 0) {
          console.log('NHL Teams from API:', response.data);
          return response.data;
          } else {
          console.error('No NHL teams found in API response');
        }
      } catch (err) {
        console.error('Error fetching NHL teams from API:', err);
      }
    };
    
    fetchNHLTeams();
  }, []);
  
  // Helper function to get color based on rating
  const ratingColor = (rating) => {
    if (rating >= 90) return '#2ecc71'; // Green
    if (rating >= 80) return '#27ae60'; // Dark Green
    if (rating >= 70) return '#f1c40f'; // Yellow
    if (rating >= 60) return '#e67e22'; // Orange
    if (rating >= 50) return '#d35400'; // Dark Orange
    return '#c0392b'; // Red
  };
  
  // Define handleYearChange function here, before it's used in any rendering
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setDraftYear(newYear);
    
    // Refresh data when year changes
    setLoading(true);
    setTimeout(() => {
      fetchData();
    }, 100);
  };
  
  // Make a pick
  const makePick = async (pickId, playerId) => {
    try {
      const pickResponse = await axios.post(`${API_BASE_URL}/draft/pick`, {
        draft_pick_id: pickId,
        player_id: playerId,
        year: draftYear
      });
      
      // Update data after making pick
      await fetchData();
      
      return { success: true, data: pickResponse.data };
    } catch (err) {
      console.error('Error making draft pick:', err);
      return { error: err.response?.data?.error || 'Failed to make draft pick' };
    }
  };
  
  // Simulate next pick
  const simulateNextPick = async () => {
    try {
      // Check if there are any prospects first
      if (draftablePlayers.length === 0) {
        alert("No draft-eligible players available. Cannot simulate picks.");
        return { error: "No draft-eligible players available" };
      }
      
      const simResponse = await axios.post(`${API_BASE_URL}/draft/simulate/pick`, {
        year: draftYear
      });
      
      // Update data after simulating pick
      await fetchData();
      
      return { success: true, data: simResponse.data };
    } catch (err) {
      console.error('Error simulating pick:', err);
      return { error: err.response?.data?.error || 'Failed to simulate pick' };
    }
  };
  
  // Simulate round
  const simulateRound = async () => {
    try {
      // Check if there are any prospects first
      if (draftablePlayers.length === 0) {
        alert("No draft-eligible players available. Cannot simulate draft round.");
        return { error: "No draft-eligible players available" };
      }
      
      const roundResponse = await axios.post(`${API_BASE_URL}/draft/simulate/round`, {
        year: draftYear
      });
      
      // Update data after simulating round
      await fetchData();
      
      return { success: true, data: roundResponse.data };
    } catch (err) {
      console.error('Error simulating round:', err);
      return { error: err.response?.data?.error || 'Failed to simulate round' };
    }
  };
  
  // Simulate entire draft
  const simulateEntireDraft = async () => {
    try {
      // Check if there are any prospects first
      if (draftablePlayers.length === 0) {
        alert("No draft-eligible players available. Cannot simulate entire draft.");
        return { error: "No draft-eligible players available" };
      }
      
      const draftResponse = await axios.post(`${API_BASE_URL}/draft/simulate/all`, {
        year: draftYear
      });
      
      // Update data after simulating entire draft
      await fetchData();
      
      return { success: true, data: draftResponse.data };
    } catch (err) {
      console.error('Error simulating draft:', err);
      return { error: err.response?.data?.error || 'Failed to simulate draft' };
    }
  };
  
  // Handle pick selection (when user clicks on a player to draft)
  const handlePlayerSelect = async (playerId) => {
    if (!draftOrder.length) {
      alert('No more draft picks available');
      return;
    }
    
    if (!playerId) {
      alert('Invalid player selection');
      return;
    }
    
    // Get the next pick
    const nextPick = draftOrder[0];
    
    // Make the pick
    const result = await makePick(nextPick.id, playerId);
    
    if (result.error) {
      alert(result.error);
    }
  };
  
  // Create filteredAndSortedPlayers variable using useMemo
  const filteredAndSortedPlayers = useMemo(() => {
    // First filter by position if a position filter is applied
    let filtered = draftablePlayers;
    
    if (positionFilter !== 'all') {
      filtered = filtered.filter(player => 
        player.position_primary === positionFilter || 
        player.position_secondary === positionFilter
      );
    }
    
    // Then filter by nationality if a nationality filter is applied
    if (nationalityFilter !== 'all') {
      filtered = filtered.filter(player => 
        player.nationality === nationalityFilter
      );
    }
    
    // Then filter by search query if there is one
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(player => {
        const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
        const position = (player.position_primary || '').toLowerCase();
        const nationality = (player.nationality || '').toLowerCase();
        const team = (player.team || '').toLowerCase();
        
        return fullName.includes(query) || 
               position.includes(query) || 
               nationality.includes(query) || 
               team.includes(query);
      });
    }
    
    // Finally sort the filtered players
    return [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      // Determine values to compare based on sort column
      switch (sortBy) {
        case 'name':
          aValue = `${a.first_name} ${a.last_name}`.toLowerCase();
          bValue = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case 'position':
          aValue = a.position_primary || '';
          bValue = b.position_primary || '';
          break;
        case 'nationality':
          aValue = a.nationality || '';
          bValue = b.nationality || '';
          break;
        case 'overall':
          aValue = a.overall_rating || 0;
          bValue = b.overall_rating || 0;
          break;
        case 'potential':
          // Map potential strings to numeric values for sorting
          const potentialMap = {
            'Game Breaker': 95,
            'Game Breaker Def': 95,
            'Elite': 90,
            'Top Line': 85,
            'Top 3': 80,
            'Top Pair': 75,
            'Top 6 F': 70,
            'Top 4': 65,
            'Middle 6': 60
          };
          aValue = potentialMap[a.potential] || 0;
          bValue = potentialMap[b.potential] || 0;
          break;
        case 'certainty':
          // Map certainty strings to numeric values
          const certaintyMap = {
            'Very High': 5,
            'High': 4,
            'Medium': 3,
            'Low': 2,
            'Very Low': 1
          };
          aValue = certaintyMap[a.potential_precision] || 0;
          bValue = certaintyMap[b.potential_precision] || 0;
          break;
        default:
          aValue = a.overall_rating || 0;
          bValue = b.overall_rating || 0;
      }
      
      // Sort in ascending or descending order
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [draftablePlayers, positionFilter, nationalityFilter, searchQuery, sortBy, sortDirection]);
  
  // Also make sure to compute available positions and nationalities
  const availablePositions = useMemo(() => {
    const positions = new Set();
    draftablePlayers.forEach(player => {
      if (player.position_primary) positions.add(player.position_primary);
      if (player.position_secondary && player.position_secondary !== 'no') positions.add(player.position_secondary);
    });
    return Array.from(positions).sort();
  }, [draftablePlayers]);
  
  const availableNationalities = useMemo(() => {
    const nationalities = new Set();
    draftablePlayers.forEach(player => {
      if (player.nationality) nationalities.add(player.nationality);
    });
    return Array.from(nationalities).sort();
  }, [draftablePlayers]);
  
  // Make sure picksByRound is defined correctly
  const picksByRound = useMemo(() => {
    const picksByRoundObj = {};
    
    // Combine completed and upcoming picks
    const allPicks = [...completedPicks, ...draftOrder];
    
    // Group by round
    allPicks.forEach(pick => {
      const round = pick.round_num;
      if (!picksByRoundObj[round]) {
        picksByRoundObj[round] = [];
      }
      picksByRoundObj[round].push(pick);
    });
    
    // Sort picks within each round
    Object.keys(picksByRoundObj).forEach(round => {
      picksByRoundObj[round].sort((a, b) => a.overall_pick - b.overall_pick);
    });
    
    return picksByRoundObj;
  }, [completedPicks, draftOrder]);
  
  // Handle sort change
  const handleSortChange = (column) => {
    if (sortBy === column) {
      // If same column, toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If new column, set as sort column with default desc direction
      setSortBy(column);
      setSortDirection('desc');
    }
  };
  
  // Handle player selection for detailed view
  const handlePlayerDetails = (player) => {
    setSelectedPlayer(player);
  };
  
  // Close player detail modal
  const closePlayerDetails = () => {
    setSelectedPlayer(null);
  };
  
  // Update the API_BASE_URL with the following endpoint for Draft_Picks
  useEffect(() => {
    // Add endpoint for draft picks
    if (!loading && draftInfo) {
      // Add draft picks endpoint if not already defined
      console.log("Setting up draft picks API integration");
    }
  }, [draftInfo, loading]);
  
  // Add console log to the component rendering to check pick status when rendering
  useEffect(() => {
    // Log picks by round to verify pick status when rendering
    if (Object.keys(picksByRound).length > 0) {
      console.log('Rendering picks by round:', picksByRound);
      
      // Log picks with their status
      const picksWithStatus = Object.values(picksByRound).flat().map(pick => ({
        team: pick.team?.abbreviation || pick.team_abbreviation,
        round: pick.round_num,
        status: pick.pick_status,
        received_from: pick.received_from
      }));
      
      console.log('Pick status for rendering:', picksWithStatus);
    }
  }, [picksByRound]);
  
  // Direct test using fetch API
  useEffect(() => {
    const fetchDraftPicksWithFetch = async () => {
      try {
        console.log('FETCH API TEST: Requesting draft picks from API...');
        const response = await fetch(`${API_BASE_URL}/draft/picks?year=${draftYear}`);
        
        if (!response.ok) {
          console.error('FETCH API TEST: HTTP error', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('FETCH API TEST RESULT:', data);
        
        if (data && data.length > 0) {
          // Check pick status in the API data
          const pickStatusCounts = data.reduce((acc, pick) => {
            const status = pick.pick_status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
          }, {});
          
          console.log('FETCH API TEST - Pick status counts:', pickStatusCounts);
          
          // Log picks with special statuses
          const nonOwnedPicks = data.filter(p => p.pick_status && p.pick_status !== 'Owned');
          console.log('FETCH API TEST - Non-owned picks:', nonOwnedPicks);
        }
      } catch (err) {
        console.error('FETCH API TEST ERROR:', err);
      }
    };
    
    // Also test the team service endpoint
    const fetchDraftPicksFromTeamAPI = async () => {
      try {
        console.log('TEAM API TEST: Requesting draft picks from team API...');
        const response = await fetch(`${API_BASE_URL}/teams/draft-picks?year=${draftYear}`);
        
        if (!response.ok) {
          console.error('TEAM API TEST: HTTP error', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('TEAM API TEST RESULT:', data);
        
        if (data && data.length > 0) {
          // Log sample picks and their statuses
          console.log('TEAM API TEST - Sample picks:', data.slice(0, 5));
        }
      } catch (err) {
        console.error('TEAM API TEST ERROR:', err);
      }
    };
    
    fetchDraftPicksWithFetch();
    fetchDraftPicksFromTeamAPI();
  }, [draftYear, API_BASE_URL]);
  
  // Add a button to the draft board to directly check Supabase data
  const checkSupabaseData = async () => {
    try {
      console.log('Checking Supabase data directly...');
      
      // Get detailed data with pick_status and original raw fields
      const { data: rawPicks, error } = await supabase
        .from('Draft_Picks')
        .select('id, team, year, round, pick_status, received_pick_1, received_pick_2, received_pick_3')
        .eq('year', draftYear);
        
      if (error) {
        console.error('Supabase query error:', error);
        alert(`Error fetching data: ${error.message}`);
        return;
      }
      
      // Log full results
      console.log('Direct Supabase query results (raw):', rawPicks);
      
      // Count by status
      const statusCount = {};
      rawPicks.forEach(pick => {
        const status = pick.pick_status || 'null';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });
      
      console.log('Pick status counts:', statusCount);
      
      // Check for non-standard statuses
      const nonStandardPicks = rawPicks.filter(p => p.pick_status !== 'Owned');
      console.log('Non-standard statuses from direct query:', nonStandardPicks);
      
      // Now query the relationship with Team
      const { data: picksWithTeam, error: teamError } = await supabase
        .from('Draft_Picks')
        .select('id, team, year, round, pick_status, received_pick_1, Team(id, team, abbreviation)')
        .eq('year', draftYear)
        .limit(5);
        
      if (teamError) {
        console.error('Supabase team relationship query error:', teamError);
      } else {
        console.log('Sample picks with Team relationship:', picksWithTeam);
      }
      
      // Generate detailed debug information
      const debugInfo = {
        totalPicks: rawPicks.length,
        statusBreakdown: statusCount,
        nonStandardPickCount: nonStandardPicks.length,
        sampleNonStandardPicks: nonStandardPicks.slice(0, 5),
        pickWithTeamSample: picksWithTeam
      };
      
      // Show alert with results
      alert(`Draft Picks Debug Info:
        
Found ${rawPicks.length} picks for year ${draftYear}
        
Status breakdown: 
${Object.entries(statusCount).map(([status, count]) => `  ${status}: ${count}`).join('\n')}
        
Non-standard picks: ${nonStandardPicks.length}
        
Check console for full details.`);
      
      console.log('DETAILED DEBUG INFO:', debugInfo);
      
    } catch (err) {
      console.error('Error checking Supabase data:', err);
      alert(`Error: ${err.message}`);
    }
  };
  
  // Add functions to check debug endpoints
  const checkDebugEndpoints = async () => {
    try {
      console.log('Checking debug endpoints...');
      
      // First check the draft picks debug endpoint
      console.log('Checking draft picks debug endpoint...');
      const draftResponse = await fetch(`${API_BASE_URL}/draft/picks-debug?year=${draftYear}`);
      const draftData = await draftResponse.json();
      console.log('Draft picks debug endpoint response:', draftData);
      
      // Then check the team service debug endpoint
      console.log('Checking team service debug endpoint...');
      const teamResponse = await fetch(`${API_BASE_URL}/teams/draft-picks-debug?year=${draftYear}`);
      const teamData = await teamResponse.json();
      console.log('Team service debug endpoint response:', teamData);
      
      // Compare the results
      console.log('Comparing results from both endpoints:');
      console.log('Draft endpoint status counts:', draftData.status_counts);
      console.log('Team endpoint status counts:', teamData.status_counts);
      
      // Display results in alert
      alert(
        `Draft Picks Debug Results:
         
        Draft Endpoint: ${draftData.count} picks
        Status Counts: ${JSON.stringify(draftData.status_counts)}
        Non-Owned Picks: ${draftData.non_owned_picks.length}
        
        Team Endpoint: ${teamData.count} picks
        Status Counts: ${JSON.stringify(teamData.status_counts)}
        Non-Owned Picks: ${teamData.non_owned_picks.length}`
      );
      
    } catch (err) {
      console.error('Error checking debug endpoints:', err);
      alert(`Error checking debug endpoints: ${err.message}`);
    }
  };

  // Add function to modify the UI to make pick status more visible
  const highlightNonOwnedPicks = async () => {
    try {
      // First get raw data from Supabase
      const { data: picks, error } = await supabase
        .from('Draft_Picks')
        .select('*')
        .eq('year', draftYear);
        
      if (error) throw error;
      
      // Log raw data
      console.log('Raw picks for UI highlighting:', picks);
      
      // Find non-owned picks
      const nonOwned = picks.filter(pick => pick.pick_status !== 'Owned' && pick.pick_status);
      console.log('Non-owned picks for highlighting:', nonOwned);
      
      // Create a map for easy lookup
      const pickStatusMap = {};
      picks.forEach(pick => {
        pickStatusMap[pick.id] = {
          team: pick.team,
          pick_status: pick.pick_status,
          received_from: pick.received_pick_1
        };
      });
      
      // Store the map in window for debugging
      window.pickStatusMap = pickStatusMap;
      
      // Apply highlighting
      document.querySelectorAll('[data-pick-id]').forEach(element => {
        const pickId = element.getAttribute('data-pick-id');
        const pickInfo = pickStatusMap[pickId];
        
        if (pickInfo && pickInfo.pick_status !== 'Owned') {
          element.style.border = pickInfo.pick_status === 'Traded' ? '2px solid red' : '2px solid orange';
          element.setAttribute('title', `Status: ${pickInfo.pick_status}, From: ${pickInfo.received_from || 'N/A'}`);
        }
      });
      
      alert(`Found ${nonOwned.length} non-owned picks out of ${picks.length} total picks.`);
      
    } catch (err) {
      console.error('Error highlighting non-owned picks:', err);
      alert(`Error highlighting: ${err.message}`);
    }
  };
  
  if (loading) {
    return (
      <DraftContainer>
        <Header>
          <h1>NHL Draft Central</h1>
          <p>{draftYear} Draft Class</p>
        </Header>
        <div style={{ textAlign: 'center', margin: '40px 0', color: '#fff' }}>
          <h2>Loading draft information...</h2>
          <p>Please wait while we fetch draft data from the server.</p>
        </div>
      </DraftContainer>
    );
  }
  
    return (
      <DraftContainer>
        <Header>
        <h1>NHL Draft Central</h1>
        <p>{draftYear} Draft Class</p>
        </Header>
        
      {error ? (
        <ErrorContainer>
          <h3>Error Loading Draft Information</h3>
          <p>{error}</p>
          <p>Prospect information is still available below. You can view prospect details but cannot make draft picks until this error is resolved.</p>
          <button 
            onClick={fetchData} 
            style={{
              padding: '8px 15px',
              backgroundColor: '#555',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
          >
            Retry
          </button>
        </ErrorContainer>
      ) : null}
        
      {draftInfo && !error && (
        <>
          {draftInfo.mock_data && (
            <InfoMessage>
              <h3>Using Demo Draft Data</h3>
              <p>Some features may be limited in demo mode.</p>
            </InfoMessage>
          )}
          
          {/* Draft Controls Section */}
          <div style={{ marginTop: '10px', marginBottom: '20px' }}>
            {/* Simulation buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <Button onClick={simulateNextPick} style={{ backgroundColor: '#4CAF50' }}>
                Simulate Next Pick
              </Button>
              <Button onClick={simulateRound} style={{ backgroundColor: '#4CAF50' }}>
                Simulate Round
              </Button>
              <Button onClick={simulateEntireDraft} style={{ backgroundColor: '#4CAF50' }}>
                Simulate Entire Draft
              </Button>
              
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ color: '#C4CED4' }}>Year:</label>
                <select
                  value={draftYear}
                  onChange={handleYearChange}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: '4px'
                  }}
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                </select>
              </div>
            </div>
            
            {/* Debug buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button onClick={checkSupabaseData} style={{ backgroundColor: '#3498db' }}>
                Check Raw Supabase Data
              </Button>
              <Button onClick={checkDebugEndpoints} style={{ backgroundColor: '#e74c3c' }}>
                Check Debug Endpoints
              </Button>
              <Button onClick={highlightNonOwnedPicks} style={{ backgroundColor: '#2ecc71' }}>
                Highlight Non-Owned Picks
              </Button>
          </div>
          </div>
        </>
      )}
      
      {/* Add debug info about players being loaded */}
      <div style={{color: '#aaa', fontSize: '0.8rem', marginBottom: '10px', textAlign: 'right'}}>
        {draftablePlayers.length > 0 ? 
          `${draftablePlayers.length} draft-eligible players loaded. ` : 
          'No draft-eligible players loaded. '
        }
        {filteredAndSortedPlayers.length !== draftablePlayers.length && 
          `${filteredAndSortedPlayers.length} players after filtering.`
        }
      </div>
      
      <TabContainer>
        <TabButton 
          active={activeTab === 'prospects'} 
          onClick={() => setActiveTab('prospects')}
        >
          Prospect Pool
        </TabButton>
        <TabButton 
          active={activeTab === 'draftBoard'} 
          onClick={() => setActiveTab('draftBoard')}
        >
          Pick Order
        </TabButton>
        <TabButton 
          active={activeTab === 'yourPicks'} 
          onClick={() => setActiveTab('yourPicks')}
        >
          Your Picks
        </TabButton>
        <TabButton 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </TabButton>
      </TabContainer>
      
      {activeTab === 'draftBoard' && (
        <DraftBoard>
          <h2>Pick Order {!draftInfo && '(Limited Information Available)'}</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ color: '#C4CED4' }}>Draft Year:</label>
              <select
                value={draftYear}
                onChange={handleYearChange}
                style={{
                  padding: '5px 10px',
                  backgroundColor: '#2a2a2a',
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: '4px'
                }}
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
              </select>
              
              {!draftInfo && (
                <Button onClick={fetchData} style={{ marginLeft: '10px' }}>
                  Refresh Data
                </Button>
              )}
            </div>
          </div>
          
          {!draftInfo && (
            <div style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              backgroundColor: 'rgba(255, 0, 0, 0.1)', 
              borderLeft: '4px solid #B30E16', 
              color: '#fff' 
            }}>
              <p>Draft information is not available due to an error. Using picks data directly from database.</p>
              <p>You can still view and interact with the draft picks below.</p>
            </div>
          )}
          
          <DraftPicksTable>
            <tbody>
              {Object.keys(picksByRound).sort((a, b) => Number(a) - Number(b)).map(roundNum => (
                <React.Fragment key={`round-${roundNum}`}>
                  <tr className="round-header">
                    <td colSpan="3">{roundNum === '1' ? '1st Round' : roundNum === '2' ? '2nd Round' : roundNum === '3' ? '3rd Round' : `${roundNum}th Round`}</td>
                  </tr>
                  {picksByRound[roundNum]
                    .sort((a, b) => a.overall_pick - b.overall_pick)
                    .map(pick => {
                      // Get team abbreviation and received from info
                      const teamAbbrev = pick.team?.abbreviation || pick.team_abbreviation || 'Unknown';
                      const receivedFrom = pick.received_from || '';
                      
                      // Determine pick status
                      const pickStatus = pick.pick_status || 'Owned';
                      
                      return (
                <tr key={pick.id}>
                          <td style={{ width: '50px', textAlign: 'center' }}>{pick.overall_pick}</td>
                          <td style={{ width: '50px', textAlign: 'center' }}>
                            {teamAbbrev}
                          </td>
                          <td>
                            {pick.team?.name || teamAbbrev}
                            {receivedFrom && (
                              <ReceivedIndicator>
                                {receivedFrom}
                              </ReceivedIndicator>
                            )}
                            {pickStatus === 'Traded' && (
                              <span style={{ color: '#e74c3c', marginLeft: '8px' }}>
                                (Traded)
                              </span>
                            )}
                            {pickStatus === 'Top10Protected' && (
                              <span style={{ color: '#f39c12', marginLeft: '8px' }}>
                                (Protected)
                              </span>
                            )}
                          </td>
                </tr>
                      );
                    })}
                </React.Fragment>
              ))}
            </tbody>
          </DraftPicksTable>
          
          {/* Add legend */}
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#222', borderRadius: '4px' }}>
            <h4 style={{ color: '#C4CED4', marginBottom: '10px' }}>Legend:</h4>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ color: '#bbb' }}>Team Name</div>
              <div style={{ color: '#4a90e2' }}>→ Received From</div>
              <div style={{ color: '#e74c3c' }}>(Traded)</div>
              <div style={{ color: '#f39c12' }}>(Protected)</div>
            </div>
          </div>
        </DraftBoard>
      )}
      
      {activeTab === 'prospects' && (
        <ProspectPool>
          <h2>Prospect Pool {!draftInfo && '(Draft Information Unavailable)'}</h2>
          
          {draftablePlayers.length === 0 ? (
            <LoadingMessage>
              {error ? 
                'Loading prospect data. Available players may be limited due to the error above.' : 
                'Loading prospect data. If this persists, draft information may be unavailable.'
              }
            </LoadingMessage>
          ) : (
            <>
          <SearchBar>
            <input 
              type="text" 
              placeholder="Search prospects by name, position, nationality..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '20px',
                color: '#C4CED4'
              }}>
                <div>
                  <label style={{ marginRight: '5px' }}>Position:</label>
                  <select 
                    value={positionFilter} 
                    onChange={(e) => setPositionFilter(e.target.value)}
                    style={{ 
                      padding: '5px 10px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      border: '1px solid #333',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="all">All Positions</option>
                    {availablePositions.map(pos => (
                      <option key={pos} value={pos}>{pos}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ marginRight: '5px' }}>Nationality:</label>
                  <select 
                    value={nationalityFilter} 
                    onChange={(e) => setNationalityFilter(e.target.value)}
                    style={{ 
                      padding: '5px 10px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      border: '1px solid #333',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="all">All Nationalities</option>
                    {availableNationalities.map(nat => (
                      <option key={nat} value={nat}>{nat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ marginRight: '5px' }}>Sort By:</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ 
                      padding: '5px 10px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      border: '1px solid #333',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="overall">Overall Rating</option>
                    <option value="potential">Potential</option>
                    <option value="name">Name</option>
                    <option value="position">Position</option>
                    <option value="nationality">Nationality</option>
                    <option value="certainty">Potential Certainty</option>
                  </select>
                  
                  <button 
                    onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                    style={{ 
                      marginLeft: '5px',
                      backgroundColor: '#2a2a2a',
                      border: '1px solid #333',
                      borderRadius: '4px',
                      color: '#fff',
                      padding: '5px 10px',
                      cursor: 'pointer'
                    }}
                  >
                    {sortDirection === 'asc' ? '▲' : '▼'}
                  </button>
                </div>
              </div>
          
          <p style={{ color: '#bbb', marginBottom: '20px' }}>
                Displaying {filteredAndSortedPlayers.length} draft-eligible players out of {draftablePlayers.length} total prospects.
                These players are automatically eligible for the {draftYear} draft.
                {!draftInfo && " Note: Full draft functionality is limited due to errors loading draft information."}
          </p>
          
              {filteredAndSortedPlayers.length === 0 ? (
            <InfoMessage>
              <h3>No Draft-Eligible Players Found</h3>
                  <p>There are currently no players matching your search criteria.</p>
              <p>Players will appear here automatically once they meet the draft eligibility criteria (age 17 and not previously drafted).</p>
            </InfoMessage>
          ) : (
            <ProspectTable>
              <thead>
                <tr>
                      <th onClick={() => handleSortChange('name')} style={{cursor: 'pointer'}}>
                        Name {sortBy === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSortChange('position')} style={{cursor: 'pointer'}}>
                        Position {sortBy === 'position' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </th>
                  <th>Age</th>
                      <th onClick={() => handleSortChange('nationality')} style={{cursor: 'pointer'}}>
                        Nationality {sortBy === 'nationality' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSortChange('overall')} style={{cursor: 'pointer'}}>
                        Overall {sortBy === 'overall' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSortChange('potential')} style={{cursor: 'pointer'}}>
                        Potential {sortBy === 'potential' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </th>
                      <th onClick={() => handleSortChange('certainty')} style={{cursor: 'pointer'}}>
                        Certainty {sortBy === 'certainty' && (sortDirection === 'asc' ? '▲' : '▼')}
                      </th>
                  <th>Volatility</th>
                </tr>
              </thead>
              <tbody>
                    {filteredAndSortedPlayers.map((player) => (
                  <tr key={player.id}>
                        <td>
                          <span 
                            style={{cursor: 'pointer', textDecoration: 'underline'}}
                            onClick={() => handlePlayerDetails(player)}
                          >
                            {player.first_name || ''} {player.last_name || ''}
                          </span>
                    </td>
                        <td>{player.position_primary || player.position || 'N/A'}</td>
                        <td>{player.age || 'N/A'}</td>
                        <td>{player.nationality || 'N/A'}</td>
                        <td>{player.overall_rating || player.overall || 'N/A'}</td>
                        <td>{player.potential || 'N/A'}</td>
                        <td>{typeof player.potential_precision === 'string' ? player.potential_precision : (player.potential_precision ? `${player.potential_precision}%` : 'N/A')}</td>
                        <td>{typeof player.potential_volatility === 'string' ? player.potential_volatility : (player.potential_volatility ? `${player.potential_volatility}%` : 'N/A')}</td>
                  </tr>
                ))}
              </tbody>
            </ProspectTable>
              )}
            </>
          )}
          
          {/* Player Detail Modal */}
          {selectedPlayer && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: '#1e1e1e',
                padding: '20px',
                borderRadius: '8px',
                width: '80%',
                maxWidth: '800px',
                maxHeight: '90vh',
                overflow: 'auto',
                border: '1px solid #444',
                boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center'}}>
                  <div>
                    <h2 style={{
                      color: '#fff',
                      margin: '0 0 5px 0',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}>
                      {selectedPlayer.first_name} {selectedPlayer.last_name}
                    </h2>
                    <div style={{
                      color: '#aaa',
                      fontSize: '14px'
                    }}>
                      {selectedPlayer.position_primary} | Age: {selectedPlayer.age} | {selectedPlayer.nationality}
                    </div>
                  </div>
                  <button 
                    onClick={closePlayerDetails} 
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#C4CED4',
                      fontSize: '24px',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '20px',
                  backgroundColor: '#2a2a2a',
                  padding: '15px',
                  borderRadius: '8px'
                }}>
                  <div>
                    <h3 style={{color: '#B30E16', borderBottom: '1px solid #444', paddingBottom: '5px'}}>Basic Info</h3>
                    <table style={{width: '100%', color: '#C4CED4'}}>
                      <tbody>
                        <tr>
                          <td>Position:</td>
                          <td><strong>{selectedPlayer.position_primary}</strong></td>
                        </tr>
                        <tr>
                          <td>Age:</td>
                          <td><strong>{selectedPlayer.age}</strong></td>
                        </tr>
                        <tr>
                          <td>Nationality:</td>
                          <td><strong>{selectedPlayer.nationality}</strong></td>
                        </tr>
                        <tr>
                          <td>Height:</td>
                          <td><strong>{selectedPlayer.height || 'N/A'}</strong></td>
                        </tr>
                        <tr>
                          <td>Weight:</td>
                          <td><strong>{selectedPlayer.weight ? `${selectedPlayer.weight} lbs` : 'N/A'}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <h3 style={{color: '#B30E16', borderBottom: '1px solid #444', paddingBottom: '5px'}}>Ratings</h3>
                    <table style={{width: '100%', color: '#C4CED4'}}>
                      <tbody>
                        <tr>
                          <td>Overall Rating:</td>
                          <td>
                            <div style={{
                              backgroundColor: '#333',
                              borderRadius: '4px',
                              padding: '2px',
                              width: '100%'
                            }}>
                              <div style={{
                                backgroundColor: ratingColor(selectedPlayer.overall_rating || 0),
                                width: `${selectedPlayer.overall_rating || 0}%`,
                                height: '20px',
                                borderRadius: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }}>
                                {selectedPlayer.overall_rating}
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Potential:</td>
                          <td>
                            <div style={{
                              backgroundColor: '#333',
                              borderRadius: '4px',
                              padding: '2px',
                              width: '100%'
                            }}>
                              <div style={{
                                backgroundColor: ratingColor(selectedPlayer.potential || 0),
                                width: `${selectedPlayer.potential || 0}%`,
                                height: '20px',
                                borderRadius: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '12px'
                              }}>
                                {selectedPlayer.potential}
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Potential Certainty:</td>
                          <td>{typeof selectedPlayer.potential_precision === 'string' ? selectedPlayer.potential_precision : (selectedPlayer.potential_precision ? `${selectedPlayer.potential_precision}%` : 'N/A')}</td>
                        </tr>
                        <tr>
                          <td>Potential Volatility:</td>
                          <td>{typeof selectedPlayer.potential_volatility === 'string' ? selectedPlayer.potential_volatility : (selectedPlayer.potential_volatility ? `${selectedPlayer.potential_volatility}%` : 'N/A')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Additional attributes section if any */}
                {(selectedPlayer.shooting || selectedPlayer.skating || selectedPlayer.hockey_sense) && (
                  <div style={{marginTop: '20px', backgroundColor: '#2a2a2a', padding: '15px', borderRadius: '8px'}}>
                    <h3 style={{color: '#B30E16', borderBottom: '1px solid #444', paddingBottom: '5px'}}>Attributes</h3>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', color: '#C4CED4'}}>
                      {selectedPlayer.shooting && (
                        <div style={{backgroundColor: '#333', padding: '10px', borderRadius: '4px'}}>
                          <h4 style={{margin: '0 0 5px 0', color: '#B30E16'}}>Shooting</h4>
                          <p style={{margin: 0}}>{selectedPlayer.shooting}</p>
                        </div>
                      )}
                      {selectedPlayer.skating && (
                        <div style={{backgroundColor: '#333', padding: '10px', borderRadius: '4px'}}>
                          <h4 style={{margin: '0 0 5px 0', color: '#B30E16'}}>Skating</h4>
                          <p style={{margin: 0}}>{selectedPlayer.skating}</p>
                        </div>
                      )}
                      {selectedPlayer.hockey_sense && (
                        <div style={{backgroundColor: '#333', padding: '10px', borderRadius: '4px'}}>
                          <h4 style={{margin: '0 0 5px 0', color: '#B30E16'}}>Hockey Sense</h4>
                          <p style={{margin: 0}}>{selectedPlayer.hockey_sense}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div style={{marginTop: '20px', display: 'flex', justifyContent: 'center'}}>
                  <ActionButton 
                    onClick={() => {
                      handlePlayerSelect(selectedPlayer.id);
                      closePlayerDetails();
                    }}
                    style={{
                      padding: '10px 20px',
                      fontSize: '16px',
                      backgroundColor: '#B30E16',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'white'
                    }}
                    disabled={!draftInfo || draftOrder.length === 0}
                  >
                    {draftInfo && draftOrder.length > 0 ? 'Draft This Player' : (draftInfo ? 'No Picks Available' : 'Draft Information Unavailable')}
                  </ActionButton>
                </div>
              </div>
            </div>
          )}
        </ProspectPool>
      )}
      
      {activeTab === 'yourPicks' && (
        <DraftBoard>
          <h2>My Draft Picks</h2>
          <p>Your team's upcoming draft selections will appear here.</p>
        </DraftBoard>
      )}
      
      {activeTab === 'settings' && (
        <DraftBoard>
          <h2>Draft Settings</h2>
          <p>Configure draft options and settings here.</p>
        </DraftBoard>
      )}
    </DraftContainer>
  );
};

export default Draft;
