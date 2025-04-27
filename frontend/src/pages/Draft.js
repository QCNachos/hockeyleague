import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Import all flag images
import flagCanada from '../assets/Flag_Canada.png';
import flagUSA from '../assets/Flag_United States.png';
import flagSweden from '../assets/Flag_Sweden.png';
import flagGermany from '../assets/Flag_Germany.png';
import flagCzechia from '../assets/Flag_Czechia.png';
import flagRussia from '../assets/Flag_Russia.png';
import flagSlovakia from '../assets/Flag_Slovakia.png';
import flagSwitzerland from '../assets/Flag_Switzerland.png';

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
    white-space: nowrap;
  }
  
  td {
    padding: 12px 10px;
    border-bottom: 1px solid #333;
    color: #bbb;
  }
  
  tr:hover td {
    background-color: #2a2a2a;
  }
  
  .centered {
    text-align: center;
  }
  
  .age-column, .overall-column, .csr-column, .height-column {
    text-align: center;
  }
  
  /* Column widths */
  .name-column {
    width: 15%;
    max-width: 180px;
  }
  
  .position-column, .age-column, .height-column {
    width: 8%;
  }
  
  .league-column, .team-column {
    width: 12%;
  }
  
  .player-type-column {
    width: 10%;
  }
  
  /* Section styling */
  .section-border-right {
    border-right: 1px solid #444;
  }
  
  .section-border-left {
    border-left: 1px solid #444;
  }
  
  th.section-header {
    background-color: #292929;
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
`;

// Add new styled component for potential visualization
const PotentialBox = styled.div`
  background-color: ${props => {
    // Color based on potential precision/certainty
    switch(props.precision?.toLowerCase()) {
      case 'mature': return '#9E9E9E'; // Light grey
      case 'very high': return '#4FAEEA'; // Blue
      case 'high': return '#4EAD5B'; // Green
      case 'medium': return '#F5C242'; // Yellow
      case 'low': return '#E93323'; // Red
      case 'unknown':
      default: return '#AF2318'; // Dark Red
    }
  }};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
  font-weight: 500;
  text-align: center;
  min-width: 120px;
  width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Add styled component for accuracy bars
const AccuracyBars = styled.div`
  display: inline-flex;
  align-items: center;
  margin-left: 8px;
  vertical-align: middle;
`;

const AccuracyBar = styled.div`
  width: 6px;
  height: 14px;
  background-color: ${props => props.filled ? '#aaa' : '#333'};
  margin-right: 2px;
  
  &:last-child {
    margin-right: 0;
  }
`;

// Helper function to get standardized display text for potential
const getStandardizedPotential = (potential) => {
  if (!potential) return 'N/A';
  
  // Map potential values to standardized display text
  switch(potential) {
    case 'Generational Goalie': return 'Generational';
    case 'Generational Def': return 'Generational';
    case 'Generational': return 'Generational';
    case 'Franchise Goalie': return 'Franchise';
    case 'Franchise Def': return 'Franchise';
    case 'Franchise': return 'Franchise';
    case 'Game Breaker Goalie': return 'Game Breaker';
    case 'Game Breaker Def': return 'Game Breaker';
    case 'Game Breaker': return 'Game Breaker';
    case 'Elite Goalie': return 'Elite';
    case 'Elite Def': return 'Elite';
    case 'Elite': return 'Elite';
    case 'Lead Starter': return 'Lead Starter';
    case 'Top Pair': return 'Top Pair';
    case 'Top Line': return 'Top Line';
    case 'Starter': return 'Starter';
    case 'Top 3': return 'Top 3';
    case 'Top 6 F': return 'Top 6 F';
    case 'Occasional Starter': return 'Occ. Starter';
    case 'Top 4': return 'Top 4';
    case 'Middle 6': return 'Middle 6';
    case 'Backup': return 'Backup';
    case 'Top 6': return 'Top 6';
    case 'Bottom 6': return 'Bottom 6';
    case 'Fringe NHLer Goalie': return 'Fringe NHLer';
    case 'Fringe NHLer Def': return 'Fringe NHLer';
    case 'Fringe NHLer': return 'Fringe NHLer';
    case 'Lead Starter AHL': return 'AHL Lead Starter';
    case 'Top Pair AHL': return 'AHL Top Pair';
    case 'Top Line AHL': return 'AHL Top Line';
    case 'Starter AHL': return 'AHL Starter';
    case 'Top 3 AHL': return 'AHL Top 3';
    case 'Top 6 F AHL': return 'AHL Top 6 F';
    case 'Occasional Starter AHL': return 'AHL Occ. Starter';
    case 'Top 4 AHL': return 'AHL Top 4';
    case 'Middle 6 AHL': return 'AHL Middle 6';
    case 'Backup AHL': return 'AHL Backup';
    case 'Top 6 AHL': return 'AHL Top 6';
    case 'Bottom 6 AHL': return 'AHL Bottom 6';
    default: return potential;
  }
};

// Helper function to get flag image based on nationality
const getFlagImage = (nationality) => {
  switch(nationality?.toLowerCase()) {
    case 'canada':
    case 'canadian':
      return flagCanada;
    case 'united states':
    case 'usa':
    case 'american':
    case 'united states of america':
      return flagUSA;
    case 'sweden':
    case 'swedish':
      return flagSweden;
    case 'germany':
    case 'german':
      return flagGermany;
    case 'czechia':
    case 'czech':
    case 'czech republic':
      return flagCzechia;
    case 'russia':
    case 'russian':
      return flagRussia;
    case 'slovakia':
    case 'slovak':
      return flagSlovakia;
    case 'switzerland':
    case 'swiss':
      return flagSwitzerland;
    default:
      return null;
  }
};

// Generate a Central Scouting Ranking based on overall rating
const generateCSRanking = (overall, position) => {
  if (!overall) return 'N/R'; // Not Ranked
  
  // Determine if player is a skater or goalie
  const isSkater = position !== 'G';
  
  if (overall >= 85) {
    return isSkater ? '1-10' : '1-3';
  } else if (overall >= 75) {
    return isSkater ? '11-32' : '4-6';
  } else if (overall >= 65) {
    return isSkater ? '33-64' : '7-10';
  } else if (overall >= 55) {
    return isSkater ? '65-100' : '11-15';
  } else {
    return isSkater ? '101+' : '16+';
  }
};

// Flag image component
const FlagImage = styled.img`
  width: 24px;
  height: 16px;
  margin-right: 8px;
  vertical-align: middle;
  object-fit: contain;
  border: 1px solid #444;
`;

// Helper function to get number of accuracy bars based on volatility/certainty
const getAccuracyBars = (volatility) => {
  if (!volatility) return 0;
  
  // Map volatility values to number of bars (0-4)
  switch(volatility.toLowerCase()) {
    case 'minimal':
      return 4;
    case 'low':
      return 3;
    case 'medium':
      return 2;
    case 'high':
      return 1;
    case 'very high':
    case 'unknown':
    default:
      return 0;
  }
};

const Draft = () => {
  const [activeTab, setActiveTab] = useState('prospects');
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
  const [teamFilter, setTeamFilter] = useState('all');
  const [leagueFilter, setLeagueFilter] = useState('all');
  const [sortBy, setSortBy] = useState('overall');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  // Fetch draft order
  const fetchDraftOrder = useCallback(async () => {
    try {
      // Use our new draft order endpoint which follows the correct standings order
      console.log(`Fetching draft order using new endpoint for year ${draftYear}...`);
      const response = await axios.get(`${API_BASE_URL}/draft/order?year=${draftYear}&use_lottery=false`);
      
      if (response.data && Array.isArray(response.data)) {
        // Process the draft order data
        const picks = response.data;
        console.log(`Successfully loaded ${picks.length} picks from draft order endpoint`);
        
        // Log the first few picks to verify order
        if (picks.length > 0) {
          console.log("First 5 picks:", picks.slice(0, 5).map(p => 
            `${p.overall_pick}. ${p.team?.abbreviation || 'Unknown'}`
          ));
        }
        
        setDraftOrder(picks);
        setCompletedPicks([]);
        return picks;
      } else {
        console.error('Invalid data format from draft order endpoint:', response.data);
        
        // Fall back to the original endpoint
        try {
          console.log('Falling back to original draft/picks endpoint...');
          const fallbackResponse = await axios.get(`${API_BASE_URL}/draft/picks?year=${draftYear}`);
          
          if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
            console.log('Using data from fallback endpoint');
            setDraftOrder(fallbackResponse.data);
            setCompletedPicks([]);
            return fallbackResponse.data;
          }
        } catch (fallbackErr) {
          console.error('Fallback endpoint also failed:', fallbackErr);
        }
        
        setDraftOrder([]);
        setCompletedPicks([]);
        return [];
      }
    } catch (err) {
      console.error('Error fetching draft order:', err);
      
      // Try the original picks endpoint as fallback
      try {
        console.log('Trying original draft/picks endpoint as fallback...');
        const fallbackResponse = await axios.get(`${API_BASE_URL}/draft/picks?year=${draftYear}`);
        
        if (fallbackResponse.data && Array.isArray(fallbackResponse.data)) {
          console.log(`Loaded ${fallbackResponse.data.length} picks from fallback endpoint`);
          setDraftOrder(fallbackResponse.data);
          setCompletedPicks([]);
          return fallbackResponse.data;
        }
      } catch (fallbackErr) {
        console.error('Fallback endpoint also failed:', fallbackErr);
      }
      
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
        
        // Log detailed player data to inspect the response
        console.log('Detailed player data sample:', response.data.slice(0, 3));
        
        // Check if league information is present in the response
        const leaguesFound = response.data.filter(player => player.league && player.league !== 'N/A').length;
        console.log(`Found ${leaguesFound} players with league information out of ${response.data.length}`);
        
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
  
  // Also make sure to compute available positions and nationalities and teams
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
  
  const availableTeams = useMemo(() => {
    const teams = new Set();
    draftablePlayers.forEach(player => {
      if (player.team) teams.add(player.team);
    });
    return Array.from(teams).sort();
  }, [draftablePlayers]);
  
  const availableLeagues = useMemo(() => {
    const leagues = new Set();
    draftablePlayers.forEach(player => {
      if (player.league) leagues.add(player.league);
    });
    return Array.from(leagues).sort();
  }, [draftablePlayers]);
  
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
    
    // Then filter by team if a team filter is applied
    if (teamFilter !== 'all') {
      filtered = filtered.filter(player => 
        player.team === teamFilter
      );
    }
    
    // Then filter by league if a league filter is applied
    if (leagueFilter !== 'all') {
      filtered = filtered.filter(player => 
        player.league === leagueFilter
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
        const league = (player.league || '').toLowerCase();
        
        return fullName.includes(query) || 
               position.includes(query) || 
               nationality.includes(query) || 
               team.includes(query) ||
               league.includes(query);
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
        case 'team':
          aValue = a.team || '';
          bValue = b.team || '';
          break;
        case 'league':
          aValue = a.league || '';
          bValue = b.league || '';
          break;
        case 'player_type':
          aValue = a.player_type || '';
          bValue = b.player_type || '';
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
        case 'draft_ranking':
          aValue = parseInt(a.draft_ranking || 9999);
          bValue = parseInt(b.draft_ranking || 9999);
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
  }, [draftablePlayers, positionFilter, nationalityFilter, teamFilter, leagueFilter, searchQuery, sortBy, sortDirection]);
  
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
        console.log('FETCH API TEST: Requesting draft picks from new order endpoint...');
        const response = await fetch(`${API_BASE_URL}/draft/order?year=${draftYear}&use_lottery=false`);
        
        if (!response.ok) {
          console.error('FETCH API TEST: HTTP error', response.status);
          return;
        }
        
        const data = await response.json();
        console.log('FETCH API TEST RESULT:', data.slice(0, 5)); // Log just the first 5 for readability
        
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
          console.log('FETCH API TEST - Non-owned picks:', nonOwnedPicks.length);
          
          // Verify SJS (last place team) is picking first
          const sjsPick = data.find(p => p.team?.abbreviation === 'SJS' && p.round_num === 1);
          console.log('FETCH API TEST - SJS Pick:', sjsPick ? `Overall #${sjsPick.overall_pick}` : 'Not found');
          
          // Verify first 5 picks follow standings
          console.log('FETCH API TEST - First 5 picks:',
            data.filter(p => p.round_num === 1).sort((a, b) => a.overall_pick - b.overall_pick).slice(0, 5).map(p => 
              `${p.overall_pick}. ${p.team?.abbreviation || 'Unknown'}`
            )
          );
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
        console.log('TEAM API TEST RESULT:', data.slice(0, 5)); // Log just the first 5 for readability
        
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
  
  // Add a placeholder function for starting a mock draft
  const startMockDraft = () => {
    // This will be implemented in the future
    alert('Mock Draft feature coming soon!');
    // For now, just provide feedback to the user
    console.log('Mock Draft button clicked - feature not yet implemented');
  };
  
  if (loading) {
    return (
      <DraftContainer>
        <Header>
          <h1>NHL Draft Central</h1>
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
        </Header>
        
      {draftInfo && (
        <>
          {/* Replace simulation buttons with a single Start Mock Draft button */}
          <div style={{ marginTop: '10px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <Button 
                onClick={startMockDraft}
                style={{ backgroundColor: '#4CAF50', fontWeight: 'bold' }}
              >
                Start Mock Draft
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
            
            {/* Debug buttons - already hidden */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button onClick={checkSupabaseData} style={{ backgroundColor: '#3498db', display: 'none' }}>
                Check Raw Supabase Data
              </Button>
              <Button onClick={checkDebugEndpoints} style={{ backgroundColor: '#e74c3c', display: 'none' }}>
                Check Debug Endpoints
              </Button>
              <Button onClick={highlightNonOwnedPicks} style={{ backgroundColor: '#2ecc71', display: 'none' }}>
                Highlight Non-Owned Picks
              </Button>
            </div>
          </div>
        </>
      )}
      
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
      </TabContainer>
      
      {activeTab === 'draftBoard' && (
        <DraftBoard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>Pick Order</h2>
            <button 
              onClick={async () => {
                try {
                  setLoading(true);
                  console.log("Manually refreshing draft order...");
                  // Force reload using our specific endpoint
                  const response = await axios.get(`${API_BASE_URL}/draft/order?year=${draftYear}&use_lottery=false`);
                  if (response.data && Array.isArray(response.data)) {
                    console.log(`Refreshed ${response.data.length} draft picks`);
                    setDraftOrder(response.data);
                    setCompletedPicks([]);
                  } else {
                    console.error("Invalid response format when refreshing draft order");
                  }
                } catch (err) {
                  console.error("Error refreshing draft order:", err);
                } finally {
                  setLoading(false);
                }
              }}
              style={{
                backgroundColor: '#B30E16',
                color: 'white',
                border: 'none',
                padding: '8px 15px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              Refresh Order
            </button>
          </div>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading draft order...
            </div>
          ) : (
          <DraftPicksTable>
            <tbody>
              {Object.keys(picksByRound).sort((a, b) => Number(a) - Number(b)).map(roundNum => (
                <React.Fragment key={`round-${roundNum}`}>
                  <tr className="round-header">
                    <td colSpan="3">{roundNum === '1' ? '1st Round' : roundNum === '2' ? '2nd Round' : roundNum === '3' ? '3rd Round' : `${roundNum}th Round`}</td>
                  </tr>
                  {picksByRound[roundNum]
                    // Important: Always sort by overall_pick to ensure proper draft order
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
                            {receivedFrom || pick.received_from ? (
                              <span>
                                {pick.team?.name || teamAbbrev}
                                <ReceivedIndicator>
                                  ← {receivedFrom || pick.received_from}
                                </ReceivedIndicator>
                              </span>
                            ) : pickStatus === 'Traded' ? (
                              <span>
                                {pick.team?.name || teamAbbrev}
                                <span style={{ color: '#e74c3c', marginLeft: '8px' }}>
                                  (Traded)
                                </span>
                              </span>
                            ) : pickStatus === 'Top10Protected' ? (
                              <span>
                                {pick.team?.name || teamAbbrev}
                                <span style={{ color: '#f39c12', marginLeft: '8px' }}>
                                  (Protected)
                                </span>
                              </span>
                            ) : (
                              <span>{pick.team?.name || teamAbbrev}</span>
                            )}
                          </td>
                </tr>
                      );
                    })}
                </React.Fragment>
              ))}
            </tbody>
          </DraftPicksTable>
          )}
          
          {/* Add legend */}
          <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#222', borderRadius: '4px' }}>
            <h4 style={{ color: '#C4CED4', marginBottom: '10px' }}>Legend:</h4>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ color: '#bbb' }}>Team Name</div>
              <div style={{ color: '#4a90e2' }}>← Received From</div>
              <div style={{ color: '#e74c3c' }}>(Traded)</div>
              <div style={{ color: '#f39c12' }}>(Protected)</div>
            </div>
          </div>
        </DraftBoard>
      )}
      
      {activeTab === 'prospects' && (
        <ProspectPool>
          <h2>Prospect Pool</h2>
          
          {draftablePlayers.length === 0 ? (
            <LoadingMessage>
              Loading prospect data...
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
                flexWrap: 'wrap',
                gap: '15px',
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
                  <label style={{ marginRight: '5px' }}>Country:</label>
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
                    <option value="all">All Countries</option>
                    {availableNationalities.map(nat => (
                      <option key={nat} value={nat}>{nat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ marginRight: '5px' }}>Team:</label>
                  <select 
                    value={teamFilter} 
                    onChange={(e) => setTeamFilter(e.target.value)}
                    style={{ 
                      padding: '5px 10px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      border: '1px solid #333',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="all">All Teams</option>
                    {availableTeams.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ marginRight: '5px' }}>League:</label>
                  <select 
                    value={leagueFilter} 
                    onChange={(e) => setLeagueFilter(e.target.value)}
                    style={{ 
                      padding: '5px 10px',
                      backgroundColor: '#2a2a2a',
                      color: '#fff',
                      border: '1px solid #333',
                      borderRadius: '4px'
                    }}
                  >
                    <option value="all">All Leagues</option>
                    {availableLeagues.map(league => (
                      <option key={league} value={league}>{league}</option>
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
                    <option value="team">Team</option>
                    <option value="league">League</option>
                    <option value="player_type">Type</option>
                    <option value="certainty">Certainty</option>
                    <option value="draft_ranking">Ranking</option>
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
          </p>
          
              {filteredAndSortedPlayers.length === 0 ? (
            <div>
              <p>No players match your search criteria.</p>
            </div>
          ) : (
            <ProspectTable>
              <thead>
                <tr>
                  {/* Section 1: Player Identity */}
                  <th onClick={() => handleSortChange('name')} className="name-column section-header section-border-right" style={{cursor: 'pointer'}}>
                    Name {sortBy === 'name' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  
                  {/* Section 2: Physical */}
                  <th onClick={() => handleSortChange('position')} className="position-column section-header section-border-left" style={{cursor: 'pointer'}}>
                    Pos {sortBy === 'position' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="height-column section-header">Height</th>
                  <th className="age-column section-header section-border-right">Age</th>
                  
                  {/* Section 3: Team Info */}
                  <th onClick={() => handleSortChange('league')} className="league-column section-header section-border-left" style={{cursor: 'pointer'}}>
                    League {sortBy === 'league' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSortChange('team')} className="team-column section-header section-border-right" style={{cursor: 'pointer'}}>
                    Team {sortBy === 'team' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  
                  {/* Section 4: Player Evaluation */}
                  <th onClick={() => handleSortChange('player_type')} className="player-type-column section-header section-border-left" style={{cursor: 'pointer'}}>
                    Player Type {sortBy === 'player_type' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSortChange('potential')} className="section-header" style={{cursor: 'pointer', textAlign: 'center'}}>
                    Potential {sortBy === 'potential' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  <th onClick={() => handleSortChange('overall')} className="overall-column section-header section-border-right" style={{cursor: 'pointer'}}>
                    Overall {sortBy === 'overall' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                  
                  {/* Section 5: Ranking */}
                  <th onClick={() => handleSortChange('draft_ranking')} className="csr-column section-header section-border-left" style={{cursor: 'pointer'}}>
                    Ranking {sortBy === 'draft_ranking' && (sortDirection === 'asc' ? '▲' : '▼')}
                  </th>
                </tr>
              </thead>
              <tbody>
                    {filteredAndSortedPlayers.map((player) => {
                      const flagImg = getFlagImage(player.nationality);
                      const csRanking = generateCSRanking(player.overall_rating || player.overall, player.position_primary);
                      
                      // Use height directly as it's already in the right format in the database
                      const heightDisplay = player.height || 'N/A';
                      
                      return (
                        <tr key={player.id}>
                          <td className="name-column section-border-right">
                            {flagImg && (
                              <FlagImage 
                                src={flagImg} 
                                alt={`${player.nationality} flag`} 
                                title={player.nationality}
                              />
                            )}
                            <span 
                              style={{cursor: 'pointer', textDecoration: 'underline'}}
                              onClick={() => handlePlayerDetails(player)}
                            >
                              {player.first_name || ''} {player.last_name || ''}
                            </span>
                          </td>
                          
                          <td className="position-column section-border-left">{player.position_primary || player.position || 'N/A'}</td>
                          <td className="height-column">{heightDisplay}</td>
                          <td className="age-column section-border-right">{player.age || 'N/A'}</td>
                          
                          <td className="league-column section-border-left">{player.league || 'N/A'}</td>
                          <td className="team-column section-border-right">{player.team || 'N/A'}</td>
                          
                          <td className="player-type-column section-border-left">{player.player_type || 'N/A'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <PotentialBox precision={player.potential_precision || 'Unknown'}>
                                {getStandardizedPotential(player.potential)}
                              </PotentialBox>
                              <AccuracyBars>
                                {[...Array(4)].map((_, i) => (
                                  <AccuracyBar 
                                    key={i} 
                                    filled={i < getAccuracyBars(player.potential_volatility || 'unknown')}
                                  />
                                ))}
                              </AccuracyBars>
                            </div>
                          </td>
                          <td className="overall-column section-border-right" style={{color: ratingColor(player.overall_rating || 0)}}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span>{player.overall_rating || 'N/A'}</span>
                              <AccuracyBars>
                                {[...Array(4)].map((_, i) => (
                                  <AccuracyBar 
                                    key={i} 
                                    filled={i < getAccuracyBars(player.potential_volatility || 'unknown')}
                                  />
                                ))}
                              </AccuracyBars>
                            </div>
                          </td>
                          
                          <td className="csr-column section-border-left">
                            {player.draft_ranking || player.ranking_display || csRanking}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </ProspectTable>
              )}
              
              {/* Add Scouting Accuracy Legend */}
              <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#222', borderRadius: '4px' }}>
                <h4 style={{ color: '#C4CED4', marginBottom: '15px' }}>SCOUTING VOLATILITY LEGEND</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', color: '#bbb', marginBottom: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AccuracyBars style={{ marginRight: '10px' }}>
                      {[...Array(4)].map((_, i) => (
                        <AccuracyBar key={i} filled={i < 4} />
                      ))}
                    </AccuracyBars>
                    <span>MINIMAL VOLATILITY</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AccuracyBars style={{ marginRight: '10px' }}>
                      {[...Array(4)].map((_, i) => (
                        <AccuracyBar key={i} filled={i < 3} />
                      ))}
                    </AccuracyBars>
                    <span>LOW VOLATILITY</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AccuracyBars style={{ marginRight: '10px' }}>
                      {[...Array(4)].map((_, i) => (
                        <AccuracyBar key={i} filled={i < 2} />
                      ))}
                    </AccuracyBars>
                    <span>MEDIUM VOLATILITY</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AccuracyBars style={{ marginRight: '10px' }}>
                      {[...Array(4)].map((_, i) => (
                        <AccuracyBar key={i} filled={i < 1} />
                      ))}
                    </AccuracyBars>
                    <span>HIGH VOLATILITY</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <AccuracyBars style={{ marginRight: '10px' }}>
                      {[...Array(4)].map((_, i) => (
                        <AccuracyBar key={i} filled={false} />
                      ))}
                    </AccuracyBars>
                    <span>VERY HIGH VOLATILITY</span>
                  </div>
                </div>
                <p style={{ color: '#999', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>
                  The volatility indicates how much a player's potential could change. Lower volatility means more stable projections, while higher volatility suggests greater uncertainty in a player's future development.
                </p>
              </div>
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
                          <td>Potential:</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <PotentialBox precision={selectedPlayer.potential_precision || 'Unknown'}>
                                {getStandardizedPotential(selectedPlayer.potential)}
                              </PotentialBox>
                              <AccuracyBars>
                                {[...Array(4)].map((_, i) => (
                                  <AccuracyBar 
                                    key={i} 
                                    filled={i < getAccuracyBars(selectedPlayer.potential_volatility || 'unknown')}
                                  />
                                ))}
                              </AccuracyBars>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Scouted Overall:</td>
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
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '5px' }}>
                              <AccuracyBars>
                                {[...Array(4)].map((_, i) => (
                                  <AccuracyBar 
                                    key={i} 
                                    filled={i < getAccuracyBars(selectedPlayer.potential_volatility || 'unknown')}
                                  />
                                ))}
                              </AccuracyBars>
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
                        <tr>
                          <td>Central Scouting Rank:</td>
                          <td>
                            {generateCSRanking(selectedPlayer.overall_rating || selectedPlayer.overall, selectedPlayer.position_primary)}
                          </td>
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
    </DraftContainer>
  );
};

export default Draft;
