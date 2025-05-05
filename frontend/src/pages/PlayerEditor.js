import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';
import PlayerCard from '../components/PlayerCard';
import { useParams } from 'react-router-dom';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check for environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase credentials. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are defined in your .env file.'
  );
} else {
  console.log('Supabase URL configured for PlayerEditor');
}

const supabase = createClient(
  supabaseUrl || 'https://your-supabase-url.supabase.co',
  supabaseKey || 'your-supabase-anon-key'
);

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  color: #C4CED4;
  margin-bottom: 20px;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 10px 15px;
  background-color: #B30E16;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #950b12;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 15px;
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #C4CED4;
  margin-bottom: 8px;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 10px 15px;
  border-radius: 4px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #fff;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
`;

const FilterInput = styled.input`
  width: 100%;
  padding: 10px 15px;
  border-radius: 4px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #fff;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
`;

const PlayersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
`;

const TableContainer = styled.div`
  max-height: 800px;
  overflow-y: auto;
  border-radius: 8px;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 10px;
  }
  
  &::-webkit-scrollbar-track {
    background: #2a2a2a;
    border-radius: 8px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 8px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const TableHeader = styled.th`
  padding: 12px 15px;
  text-align: left;
  background-color: #232323;
  color: #B30E16;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background-color: #2a2a2a;
  }
  
  &::after {
    content: ${props => props.sorted === 'asc' ? '"▲"' : props.sorted === 'desc' ? '"▼"' : '""'};
    position: absolute;
    right: 8px;
    color: ${props => props.sorted ? '#B30E16' : 'transparent'};
  }
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #222;
  }
  
  &:hover {
    background-color: #2a2a2a;
  }
`;

const TableCell = styled.td`
  padding: 10px 15px;
  border-bottom: 1px solid #333;
  color: #C4CED4;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  
  &::after {
    content: "";
    width: 40px;
    height: 40px;
    border: 5px solid #333;
    border-top-color: #B30E16;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(179, 14, 22, 0.1);
  color: #B30E16;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid rgba(179, 14, 22, 0.3);
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

const PageInfo = styled.div`
  color: #C4CED4;
`;

const PageButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const PageButton = styled.button`
  padding: 8px 15px;
  background-color: ${props => props.active ? '#B30E16' : '#2a2a2a'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? '#950b12' : '#333'};
  }
`;

const FilterSummary = styled.div`
  background-color: #232323;
  padding: 12px 15px;
  margin: 0 0 15px 0;
  border-radius: 8px;
  color: #C4CED4;
  font-size: 14px;
  
  span {
    font-weight: 500;
    color: #fff;
  }
  
  span.highlight {
    color: #B30E16;
  }
`;

// Add this mapping constant near the top of the file, after the styled components
const LEAGUE_NAME_MAP = {
  'NHL': 'National Hockey League',
  'AHL': 'American Hockey League',
  'SHL': 'Swedish Hockey League',
  'KHL': 'Kontinental Hockey League',
  'ECHL': 'East Coast Hockey League',
  'Liiga': 'Finnish Elite League',
  'DEL': 'Deutsche Eishockey Liga',
  'NL': 'Swiss National League',
  'CZE': 'Czech Extraliga',
  'VHL': 'Vysshaya Hockey League',
  'NCAA': 'National Collegiate Athletic Association',
  'OHL': 'Ontario Hockey League',
  'WHL': 'Western Hockey League',
  'QMJHL': 'Quebec Major Junior Hockey League',
  'USHL': 'United States Hockey League',
  'BCHL': 'British Columbia Hockey League',
  'HA': 'Hockeyallsvenskan',
  'Mestis': 'Mestis',
  // Add more leagues as needed
};

// Create a reverse mapping for lookup by full name if needed
const LEAGUE_REVERSE_MAP = {};
Object.entries(LEAGUE_NAME_MAP).forEach(([abbr, fullName]) => {
  LEAGUE_REVERSE_MAP[fullName] = abbr;
});

// Get abbreviation from full name if needed
const getLeagueAbbreviation = (fullNameWithAbbr) => {
  if (!fullNameWithAbbr) return '';
  // If it contains parentheses with the abbreviation, extract it
  const match = fullNameWithAbbr.match(/\(([^)]+)\)$/);
  if (match) return match[1];
  
  // Otherwise check the reverse map
  return LEAGUE_REVERSE_MAP[fullNameWithAbbr] || fullNameWithAbbr;
};

// Special hard-coded helper for known team abbreviations that should be supported
const getTeamId = (abbrev) => {
  const teamMap = {
    'PIT': 1, // Example mapping - replace with actual IDs if known
    'CBJ': 2,
    'NYR': 3,
    'WSH': 4
  };
  return teamMap[abbrev] || abbrev;
};

// Add these new styled components before the PlayerEditor component
const PlayerModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PlayerCardContent = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

const PlayerCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background-color: #1a3042;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #333;
`;

const PlayerCardBody = styled.div`
  padding: 20px;
`;

const PlayerCardClose = styled.button`
  position: absolute;
  right: 15px;
  top: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: #B30E16;
  }
`;

const PlayerCardImage = styled.div`
  width: 120px;
  height: 140px;
  background-color: #B30E16;
  border-radius: 8px;
  margin-right: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
`;

const PlayerCardInfo = styled.div`
  flex: 1;
`;

const PlayerCardName = styled.h2`
  margin: 0 0 5px 0;
  font-size: 1.8rem;
`;

const PlayerCardDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

const PlayerCardDetail = styled.div`
  margin-right: 20px;
  margin-bottom: 5px;
  
  span {
    color: #aaa;
    margin-right: 5px;
  }
`;

const PlayerCardSection = styled.div`
  margin-top: 20px;
`;

const PlayerCardSectionTitle = styled.h3`
  background-color: #1a3042;
  color: white;
  padding: 8px 15px;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  border-bottom: 1px solid #333;
`;

const AttributeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const AttributeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #333;
`;

const AttributeName = styled.span`
  color: #aaa;
`;

const AttributeValue = styled.span`
  font-weight: bold;
  color: ${props => {
    if (props.value >= 90) return '#4CAF50';
    if (props.value >= 80) return '#8BC34A';
    if (props.value >= 70) return '#CDDC39';
    if (props.value >= 60) return '#FFC107';
    return '#FF5722';
  }};
`;

const SeasonStatsTable = styled.div`
  overflow-x: auto;
  margin-top: 15px;
`;

const StatsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
`;

const StatsTableHeader = styled.th`
  background-color: #1a3042;
  padding: 8px;
  font-weight: bold;
  color: white;
  border-bottom: 1px solid #333;
`;

const StatsTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #2a2a2a;
  }
  
  &:nth-child(odd) {
    background-color: #1e1e1e;
  }
`;

const StatsTableCell = styled.td`
  padding: 8px;
  border-bottom: 1px solid #333;
`;

// Add these new styled components for the error analysis modal
const ErrorAnalysisModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ErrorAnalysisContent = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  position: relative;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

const ErrorAnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #1a3042;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #333;
`;

const ErrorAnalysisTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const ErrorAnalysisClose = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: #B30E16;
  }
`;

const ErrorAnalysisBody = styled.div`
  padding: 20px;
`;

const ErrorAnalysisButton = styled.button`
  padding: 12px 20px;
  background-color: #B30E16;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  width: 100%;
  margin-top: 10px;
  
  &:hover {
    background-color: #950b12;
  }
`;

const PlayerEditor = () => {
  // Add a utility function for normalizing strings for comparison
  const normalizeString = (str) => {
    if (!str) return '';
    return String(str).toLowerCase().trim();
  };

  // Get URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const urlLeagueType = searchParams.get('leagueType');
  const urlLeague = searchParams.get('league');
  const urlTeamId = searchParams.get('teamId');

  // Log URL parameters
  console.log('[DEBUG] URL parameters:');
  console.log('- urlLeagueType:', urlLeagueType);
  console.log('- urlLeague:', urlLeague);
  console.log('- urlTeamId:', urlTeamId, typeof urlTeamId);

  // State variables
  const [players, setPlayers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // Static data
  const [allLeagueTypesData, setAllLeagueTypesData] = useState([]);
  const [allLeaguesData, setAllLeaguesData] = useState([]);
  const [allTeamsData, setAllTeamsData] = useState([]);

  // Selected filter values
  const [selectedLeagueType, setSelectedLeagueType] = useState(urlLeagueType || '');
  const [selectedLeague, setSelectedLeague] = useState(urlLeague || '');
  const [selectedTeam, setSelectedTeam] = useState(urlTeamId || '');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Track initialization status
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);

  // For pagination and sorting
  const [sortColumn, setSortColumn] = useState('last_name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [playersPerPage, setPlayersPerPage] = useState(100);
  const [totalPlayerCount, setTotalPlayerCount] = useState(0);

  // Maps for lookup
  const [leagueToTypeMap, setLeagueToTypeMap] = useState({});
  const [leagueTypeMap, setLeagueTypeMap] = useState({ counts: {} });

  // Add these new state variables
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  // Add these new state variables for the error analysis modal
  const [showErrorAnalysisModal, setShowErrorAnalysisModal] = useState(false);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [analysisResults, setAnalysisResults] = useState([]);

  // Single initialization effect
  useEffect(() => {
    const initializeComponent = async () => {
      console.log('[DEBUG] Starting component initialization');
      setLoadingData(true);
      setError(null);
      setInitializedFromUrl(false);

      try {
        // Step 1: Load all static data
        console.log('[DEBUG] Loading all static data...');
        
        // Fetch league types from League_Level_Rules table and leagues/teams with proper relationships
        const [leagueTypesRes, leaguesRes, teamsRes] = await Promise.all([
          supabase.from('League_Level_Rules').select('*'),
          supabase.from('League').select('*'),
          supabase.from('Team').select('*, League(league_level)')
        ]);

        // Check for errors
        if (leagueTypesRes.error) throw new Error(`League Types Error: ${leagueTypesRes.error.message}`);
        if (leaguesRes.error) throw new Error(`Leagues Error: ${leaguesRes.error.message}`);
        if (teamsRes.error) throw new Error(`Teams Error: ${teamsRes.error.message}`);

        // Get league types from League_Level_Rules table
        const allLeagueTypes = leagueTypesRes.data
          .map(lt => lt.league_level)
          .filter(Boolean)
          .sort();
        
        const allLeagues = leaguesRes.data || [];
        const allTeams = teamsRes.data || [];

        console.log(`[DEBUG] Loaded: ${allLeagueTypes.length} league types, ${allLeagues.length} leagues, ${allTeams.length} teams`);
        
        // Create a mapping from league abbreviation to league type
        // This is the key part that was missing before
        const leagueToTypeMapping = {};
        
        // Populate the mapping directly from the League table data
        allLeagues.forEach(league => {
          if (league.abbreviation && league.league_level) {
            leagueToTypeMapping[league.abbreviation] = league.league_level;
          }
        });
        
        console.log('[DEBUG] League to League Type mapping created from database:');
        Object.entries(leagueToTypeMapping).forEach(([league, type]) => {
          console.log(`  "${league}" => "${type}"`);
        });
        
        // Count teams by league type for the dropdown
        const typeCounts = {};
        
        // For each type, count teams that have leagues of that type
        allLeagueTypes.forEach(type => {
          // Count teams in these leagues
          typeCounts[type] = allTeams.filter(team => {
            // First try to get league type from the League relation
            if (team.League && team.League.league_level === type) {
              return true;
            }
            // Fallback to our mapping
            return leagueToTypeMapping[team.league] === type;
          }).length;
          
          console.log(`[DEBUG] League type "${type}" has ${typeCounts[type]} teams`);
        });
        
        // Set all the static data states
        setAllLeagueTypesData(allLeagueTypes);
        setAllLeaguesData(allLeagues);
        setAllTeamsData(allTeams);
        setLeagueToTypeMap(leagueToTypeMapping);
        setLeagueTypeMap({ counts: typeCounts });
        
        console.log('[DEBUG] Static data processed and set in state');
        
        // Step 2: Determine initial selections based on URL parameters
        let derivedLeagueType = '';
        let derivedLeague = '';
        let derivedTeam = '';
        let didInitFromUrl = false;

        // If we have a team ID from URL
        if (urlTeamId) {
          console.log(`[DEBUG] Initializing from team abbreviation: ${urlTeamId}`);
          
          // Find the team
          const team = allTeams.find(t => t.abbreviation === urlTeamId);
          if (team) {
            derivedTeam = team.abbreviation;
            derivedLeague = team.league;
            
            // Get league type from League relation or mapping
            derivedLeagueType = team.League?.league_level || leagueToTypeMapping[team.league];
            
            console.log(`[DEBUG] Found team ${team.team} (${derivedTeam})`);
            console.log(`[DEBUG] Derived league: ${derivedLeague}, type: ${derivedLeagueType}`);
            didInitFromUrl = true;
          } else {
            console.warn(`[DEBUG] Team ${urlTeamId} not found in loaded data`);
            derivedTeam = urlTeamId; // Keep the team abbr even if not found
            didInitFromUrl = true;
          }
        }
        // Check league parameter
        else if (urlLeague) {
          derivedLeague = urlLeague;
          derivedLeagueType = leagueToTypeMapping[urlLeague];
          didInitFromUrl = true;
        }
        // Check league type parameter
        else if (urlLeagueType) {
          derivedLeagueType = urlLeagueType;
          didInitFromUrl = true;
        }

        // Set selected values based on derived data
        setSelectedLeagueType(derivedLeagueType);
        setSelectedLeague(derivedLeague);
        setSelectedTeam(derivedTeam);
        setInitializedFromUrl(didInitFromUrl);

        // Log the final initialization state
        console.log('[DEBUG] Initialization complete with:');
        console.log(`- League Type: ${derivedLeagueType || 'Not set'}`);
        console.log(`- League: ${derivedLeague || 'Not set'}`);
        console.log(`- Team: ${derivedTeam || 'Not set'}`);
        
        setInitialDataLoaded(true);
      } catch (error) {
        console.error('[DEBUG] Initialization error:', error);
        setError(`Failed to initialize: ${error.message}`);
        setInitialDataLoaded(true); // Mark as loaded even on error
      } finally {
        setLoadingData(false);
      }
    };

    if (!initialDataLoaded) {
      initializeComponent();
    }
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get leagues filtered by selected league type
  const getFilteredLeagues = () => {
    if (!initialDataLoaded || !allLeaguesData) return [];
    
    if (selectedLeagueType) {
      // Filter leagues to only those of the selected type
      return allLeaguesData.filter(league => league.league_level === selectedLeagueType);
    }
    
    // Return all leagues if no league type is selected
    return allLeaguesData;
  };

  const getFilteredTeams = () => {
    // First, check if data is loaded
    if (!initialDataLoaded || !allTeamsData || allTeamsData.length === 0) {
      console.log('[DEBUG] Cannot filter teams - initialization not complete');
      return [];
    }

    return allTeamsData.filter(team => {
      // Skip teams with no league information
      if (!team.league) return false;
      
      // Filter by league type if selected
      if (selectedLeagueType) {
        // First check if team has a League relation with league_level
        const teamLeagueType = team.League?.league_level || leagueToTypeMap[team.league];
        if (teamLeagueType !== selectedLeagueType) {
          return false;
        }
      }
      
      // Filter by league if selected
      if (selectedLeague && team.league !== selectedLeague) {
        return false;
      }
      
      return true;
    });
  };

  // Handle league type change
  const handleLeagueTypeChange = (e) => {
    const value = e.target.value;
    console.log(`[DEBUG] League type changed to: ${value}`);
    
    setSelectedLeagueType(value);
    
    // Reset league and team if they don't match the new type
    if (selectedLeague) {
      const leagueType = leagueToTypeMap[selectedLeague];
      if (value && leagueType !== value) {
        console.log(`[DEBUG] Resetting league ${selectedLeague} as it doesn't match new type ${value}`);
        setSelectedLeague('');
        setSelectedTeam('');
      }
    } else {
      // If no league is selected, also reset the team
      setSelectedTeam('');
    }
    
    setCurrentPage(1); // Reset pagination
  };

  // Handle league change
  const handleLeagueChange = (e) => {
    const value = e.target.value;
    console.log(`[DEBUG] League changed to: "${value}"`);
    
    // Check if this league exists in our League table data
    const leagueData = allLeaguesData.find(l => l.league === value);
    if (!leagueData) {
      console.warn(`[DEBUG] Selected league "${value}" not found in League table!`);
    } else {
      console.log(`[DEBUG] Found league data:`, leagueData);
    }
    
    // Log all teams with this league value to verify our data
    const teamsWithThisLeague = allTeamsData.filter(t => t.league === value);
    console.log(`[DEBUG] Found ${teamsWithThisLeague.length} teams with league="${value}":`, 
      teamsWithThisLeague.map(t => `${t.team} (${t.abbreviation})`).join(', '));
    
    // Set the selected league
    setSelectedLeague(value);
    
    // Reset team if it doesn't belong to the new league
    if (selectedTeam) {
      const teamObject = allTeamsData.find(t => t.abbreviation === selectedTeam);
      const teamLeague = teamObject?.league;
      if (value && teamLeague !== value) {
        console.log(`[DEBUG] Resetting team ${selectedTeam} as it doesn't belong to new league ${value}`);
        setSelectedTeam('');
      }
    } else {
      // If no team is selected yet, just reset it for consistency
      setSelectedTeam('');
    }
    
    setCurrentPage(1); // Reset pagination
  };

  // Handle team change
  const handleTeamChange = (e) => {
    const value = e.target.value;
    console.log(`[DEBUG] Team changed to: ${value}`);
    setSelectedTeam(value);
    setCurrentPage(1);
  };

  // Fetch players based on current filters
  useEffect(() => {
    if (!initialDataLoaded) {
      console.log('[DEBUG] Skipping player fetch - initialization not complete');
      return;
    }

    const fetchPlayers = async () => {
      console.log('[DEBUG] Fetching players with filters:', {
        team: selectedTeam,
        league: selectedLeague,
        leagueType: selectedLeagueType,
        position: selectedPosition,
        search: searchQuery
      });
      
      setLoadingData(true);
      
      try {
        // Build the query
        let query = supabase.from('Player').select('*', { count: 'exact' });
        
        // Get teams matching our filters - similar to AssetMovement.js approach
        let filteredTeams = allTeamsData;
        
        // Apply league type filter if selected
        if (selectedLeagueType) {
          // Find all leagues of this type first
          const leaguesOfType = Object.entries(leagueToTypeMap)
            .filter(([_, type]) => type === selectedLeagueType)
            .map(([league, _]) => league);
            
          console.log(`[DEBUG] Leagues of type "${selectedLeagueType}": ${leaguesOfType.join(', ')}`);
          
          // Then filter teams to only those in these leagues
          filteredTeams = filteredTeams.filter(team => 
            team.league && leaguesOfType.includes(team.league)
          );
        }
        
        // Apply league filter if selected
        if (selectedLeague) {
          filteredTeams = filteredTeams.filter(team => team.league === selectedLeague);
        }
        
        // Extract team abbreviations
        const teamAbbreviations = filteredTeams.map(t => t.abbreviation).filter(Boolean);
        
        // Apply team filter if selected
        if (selectedTeam) {
          // Direct team filter
          query = query.eq('team', selectedTeam);
        } else if (teamAbbreviations.length > 0) {
          // Filter by all teams matching our league/type filters
          console.log(`[DEBUG] Filtering by ${teamAbbreviations.length} teams:`, 
                      teamAbbreviations.slice(0, 10).join(', ') + 
                      (teamAbbreviations.length > 10 ? '...' : ''));
          query = query.in('team', teamAbbreviations);
        } else {
          console.log('[DEBUG] No teams match the filters, returning empty result');
          setPlayers([]);
          setTotalPages(0);
          setTotalPlayerCount(0);
          setLoadingData(false);
          return;
        }
        
        // Apply position filter
        if (selectedPosition) {
          query = query.eq('position_primary', selectedPosition);
        }
        
        // Apply search filter
        if (searchQuery) {
          query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
        }
        
        // Apply sorting
        query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
        
        // Apply pagination
        const startIndex = (currentPage - 1) * playersPerPage;
        query = query.range(startIndex, startIndex + playersPerPage - 1);
        
        // Execute the query
        const { data: playersData, error: playersError, count } = await query;
        
        if (playersError) {
          throw new Error(`Player query error: ${playersError.message}`);
        }
        
        console.log(`[DEBUG] Player query successful. Count: ${count}, Fetched: ${playersData?.length || 0}`);
        
        // Enhance players with team and league information
        const enhancedPlayers = playersData.map(player => {
          // Find team for this player
          const teamObj = allTeamsData.find(t => t.abbreviation === player.team);
          
          // Get league information if team found
          let league = null;
          let league_type = null;
          
          if (teamObj) {
            league = teamObj.league;
            league_type = getTeamLeagueType(teamObj);
          }
          
          return {
            ...player,
            teamObj: teamObj || null,
            league: league,
            league_type: league_type
          };
        });
        
        // Process results
        setPlayers(enhancedPlayers || []);
        setTotalPlayerCount(count || 0);
        setTotalPages(Math.ceil((count || 0) / playersPerPage));
        
      } catch (error) {
        console.error('[DEBUG] Error fetching players:', error);
        setError(`Failed to fetch players: ${error.message}`);
        setPlayers([]);
        setTotalPages(0);
        setTotalPlayerCount(0);
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchPlayers();
    
  }, [
    initialDataLoaded,
    selectedTeam,
    selectedLeague,
    selectedLeagueType,
    selectedPosition,
    searchQuery,
    sortColumn,
    sortDirection,
    currentPage,
    playersPerPage,
    allTeamsData,
    allLeaguesData
  ]);

  // Format player salary to display as millions
  const formatSalary = (salary) => {
    if (salary === null || salary === undefined) return 'N/A';
    // Ensure salary is a number before division
    const numericSalary = Number(salary);
    if (isNaN(numericSalary)) return 'Invalid';
    return `$${(numericSalary / 1000000).toFixed(1)}M`;
  };

  // Handler for sorting
  const handleSort = (column) => {
    console.log(`[DEBUG] handleSort called for column: ${column}`);
    if (sortColumn === column) {
      // Toggle direction
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Set new column, default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const getTeamLeagueType = (team) => {
    if (!team) {
      console.warn('[DEBUG] getTeamLeagueType called with null/undefined team');
      return null;
    }
    
    if (!team.league) {
      console.warn(`[DEBUG] Team ${team.team || team.abbreviation} has no league`);
      return null;
    }
    
    console.log(`[DEBUG] Getting league type for team ${team.team} (${team.abbreviation}), league: "${team.league}"`);
    
    // First try to get the league type directly from the League relation
    if (team.League && team.League.league_level) {
      console.log(`[DEBUG] Found league type "${team.League.league_level}" from League relation for team ${team.team}`);
      return team.League.league_level;
    }
    
    // Fallback to our mapping
    const leagueType = leagueToTypeMap[team.league];
    
    if (!leagueType) {
      console.warn(`[DEBUG] No league type mapping found for league "${team.league}"`);
      return null;
    }
    
    console.log(`[DEBUG] Found league type "${leagueType}" for team ${team.team} from mapping`);
    return leagueType;
  };

  // Add handlePlayerClick function
  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  // Add closePlayerModal function
  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setSelectedPlayer(null);
  };

  // Add renderPlayerModal function
  const renderPlayerModal = () => {
    if (!showPlayerModal || !selectedPlayer) return null;
    
    // Mock player attributes (would come from the API in a real implementation)
    const mockAttributes = {
      skating: Math.floor(Math.random() * 20) + 70,
      shooting: Math.floor(Math.random() * 20) + 70,
      hands: Math.floor(Math.random() * 20) + 70,
      checking: Math.floor(Math.random() * 20) + 70,
      defense: Math.floor(Math.random() * 20) + 70,
      physical: Math.floor(Math.random() * 20) + 70
    };
    
    // Format team name safely - important for avoiding the React child error
    const getTeamDisplay = () => {
      if (selectedPlayer.team_id) {
        return getTeamNameById(selectedPlayer.team_id);
      } else if (selectedPlayer.team) {
        if (typeof selectedPlayer.team === 'object') {
          return selectedPlayer.team.team || 'N/A';
        } else {
          return String(selectedPlayer.team);
        }
      }
      return 'N/A';
    };
    
    // Get team abbreviation safely
    const getTeamAbbr = () => {
      if (!selectedPlayer.team) {
        return 'N/A'; // No team assigned (prospect)
      }
      
      if (typeof selectedPlayer.team === 'object') {
        return selectedPlayer.team.abbreviation || 'N/A';
      } else {
        const teamObj = allTeamsData.find(t => 
          isSameId(t.id, selectedPlayer.team) || 
          t.abbreviation === selectedPlayer.team
        );
        return teamObj ? teamObj.abbreviation : String(selectedPlayer.team);
      }
    };
    
    const isProspect = !selectedPlayer.team || selectedPlayer.team === 'N/A';
    const teamAbbr = getTeamAbbr();
    
    // Get actual league based on team or default to prospect league
    const getLeague = () => {
      if (isProspect) {
        return selectedPlayer.prospect_league || 'Prospect';
      }
      
      if (selectedPlayer.teamObj?.league) {
        return selectedPlayer.teamObj.league;
      } else if (selectedPlayer.league) {
        return selectedPlayer.league;
      }
      
      return 'NHL'; // Default to NHL if not available
    };
    
    const league = getLeague();
    
    // Mock season stats data with the safely obtained team abbreviation
    const seasonStats = isProspect ? 
      // For prospects, show prospect league stats if available
      [
        { season: '2023-24', team: selectedPlayer.prospect_team || 'NCAA', league: selectedPlayer.prospect_league || 'NCAA', gp: 32, goals: 12, assists: 18, points: 30, plusMinus: 8, pim: 16 },
        { season: '2022-23', team: selectedPlayer.prospect_team || 'NCAA', league: selectedPlayer.prospect_league || 'NCAA', gp: 28, goals: 8, assists: 12, points: 20, plusMinus: 5, pim: 14 }
      ] : 
      // For NHL/pro players, show regular career path
      [
        { season: '2023-24', team: teamAbbr, league: league, gp: 82, goals: 9, assists: 33, points: 42, plusMinus: -7, pim: 51 },
        { season: '2022-23', team: teamAbbr, league: league, gp: 82, goals: 5, assists: 37, points: 42, plusMinus: -11, pim: 40 },
        { season: '2021-22', team: teamAbbr, league: league, gp: 82, goals: 7, assists: 43, points: 50, plusMinus: -9, pim: 34 },
        { season: '2020-21', team: 'SWE', league: 'SweHL', gp: 41, goals: 7, assists: 21, points: 28, plusMinus: 14, pim: 16 },
        { season: '2019-20', team: 'GRG', league: 'AHL', gp: 49, goals: 2, assists: 20, points: 22, plusMinus: -5, pim: 28 },
        { season: '2018-19', team: 'MEA', league: 'DEL', gp: 29, goals: 2, assists: 4, points: 6, plusMinus: 2, pim: 8 },
        { season: '2017-18', team: 'MEA', league: 'DEL', gp: 4, goals: 0, assists: 0, points: 0, plusMinus: 0, pim: 0 },
      ];
    
    // Mock playoff stats
    const playoffStats = [
      { season: '2020-21', team: 'SWE', gp: 13, goals: 1, assists: 4, points: 5, pim: 8 },
      { season: '2018-19', team: 'MEA', gp: 14, goals: 0, assists: 5, points: 5, pim: 0 },
    ];
    
    // Get NHL totals
    const nhlStats = seasonStats.filter(s => s.league === 'NHL');
    const hasNhlStats = nhlStats.length > 0;
    const nhlTotals = hasNhlStats ? {
      gp: nhlStats.reduce((sum, s) => sum + s.gp, 0),
      goals: nhlStats.reduce((sum, s) => sum + s.goals, 0),
      assists: nhlStats.reduce((sum, s) => sum + s.assists, 0),
      points: nhlStats.reduce((sum, s) => sum + (s.points || s.goals + s.assists), 0),
      pim: nhlStats.reduce((sum, s) => sum + s.pim, 0)
    } : {
      gp: 0,
      goals: 0,
      assists: 0,
      points: 0,
      pim: 0
    };
    
    // Mock tournaments data
    const tournaments = [
      { 
        year: 2020, 
        tournament: 'World Junior U-20 Championships', 
        team: 'Germany U-20',
        gp: 7,
        goals: 0,
        assists: 6,
        points: 6,
        pim: 6,
        plusMinus: 0
      }
    ];
    
    // Mock awards data
    const awards = [
      { year: '2021-22', league: 'NHL', award: 'Calder Memorial Trophy' }
    ];
    
    return (
      <PlayerModal onClick={closePlayerModal}>
        <PlayerCardContent onClick={(e) => e.stopPropagation()}>
          <PlayerCardClose onClick={closePlayerModal}>×</PlayerCardClose>
          
          <PlayerCardHeader>
            <PlayerCardInfo>
              <PlayerCardName>{selectedPlayer.first_name} {selectedPlayer.last_name}</PlayerCardName>
              <PlayerCardDetails>
                <PlayerCardDetail>
                  <span>Position:</span> {selectedPlayer.position_primary || 'N/A'} -- shoots {selectedPlayer.shoots || 'R'}
                </PlayerCardDetail>
                <PlayerCardDetail>
                  <span>Born:</span> {selectedPlayer.birthdate || 'Apr 6 2001'} -- {selectedPlayer.birth_city || 'Zell'}, {selectedPlayer.birth_country || 'Germany'}
                </PlayerCardDetail>
                <PlayerCardDetail>
                  <span>Age:</span> [{selectedPlayer.age || '24'} yrs. ago]
                </PlayerCardDetail>
                <PlayerCardDetail>
                  <span>Height/Weight:</span> {selectedPlayer.height || '6.03'} -- {selectedPlayer.weight || '205'} [{selectedPlayer.height_cm || '191'} cm/{selectedPlayer.weight_kg || '93'} kg]
                </PlayerCardDetail>
                
                {/* Team or Prospect Status */}
                <PlayerCardDetail>
                  <span>Status:</span> {isProspect ? (
                    <span style={{color: '#4CAF50', fontWeight: 'bold'}}>Prospect{selectedPlayer.prospect_league ? ` (${selectedPlayer.prospect_league})` : ''}</span>
                  ) : (
                    <span>{getTeamDisplay()}</span>
                  )}
                </PlayerCardDetail>
                
                {isProspect && selectedPlayer.prospect_team && (
                  <PlayerCardDetail>
                    <span>Current Team:</span> {selectedPlayer.prospect_team}
                  </PlayerCardDetail>
                )}
                
                <PlayerCardDetail>
                  <span>Drafted by:</span> <span style={{color: '#B30E16', fontWeight: 'bold'}}>{selectedPlayer.draft_team || 'Detroit Red Wings'}</span>
                </PlayerCardDetail>
                <PlayerCardDetail>
                  <span>Draft Position:</span> round 1 <span style={{color: '#B30E16', fontWeight: 'bold'}}>#{selectedPlayer.draft_position || '6'}</span> overall {selectedPlayer.draft_year || '2019'} NHL Entry Draft
                </PlayerCardDetail>
              </PlayerCardDetails>
            </PlayerCardInfo>
            <PlayerCardImage 
              style={{
                backgroundImage: selectedPlayer.image_url ? `url(${selectedPlayer.image_url})` : 'none',
                backgroundColor: '#B30E16',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}
            >
              {!selectedPlayer.image_url && (selectedPlayer.jersey_number || '#')}
            </PlayerCardImage>
          </PlayerCardHeader>
          
          <PlayerCardBody>
            {/* Regular Season / Playoffs Stats Table Header */}
            <div style={{display: 'flex', backgroundColor: '#1a3042'}}>
              <div style={{flex: 1, textAlign: 'center', padding: '8px', fontWeight: 'bold', color: 'white'}}>
                Regular Season
              </div>
              <div style={{flex: 1, textAlign: 'center', padding: '8px', fontWeight: 'bold', color: 'white'}}>
                Playoffs
              </div>
            </div>
            
            <SeasonStatsTable>
              <StatsTable>
                <thead>
                  <tr>
                    <StatsTableHeader>Season</StatsTableHeader>
                    <StatsTableHeader>Team</StatsTableHeader>
                    <StatsTableHeader>Lge</StatsTableHeader>
                    <StatsTableHeader>GP</StatsTableHeader>
                    <StatsTableHeader>G</StatsTableHeader>
                    <StatsTableHeader>A</StatsTableHeader>
                    <StatsTableHeader>Pts</StatsTableHeader>
                    <StatsTableHeader>PIM</StatsTableHeader>
                    <StatsTableHeader>+/-</StatsTableHeader>
                    <StatsTableHeader>GP</StatsTableHeader>
                    <StatsTableHeader>G</StatsTableHeader>
                    <StatsTableHeader>A</StatsTableHeader>
                    <StatsTableHeader>Pts</StatsTableHeader>
                    <StatsTableHeader>PIM</StatsTableHeader>
                  </tr>
                </thead>
                <tbody>
                  {seasonStats.map((season, index) => {
                    // Find matching playoff stats
                    const playoff = playoffStats.find(p => p.season === season.season);
                    
                    // Determine text color based on league
                    const isAHL = season.league === 'AHL';
                    const isSweHL = season.league === 'SweHL';
                    const isNHL = season.league === 'NHL';
                    
                    let textColor = '#fff'; // Default white text
                    if (isAHL) textColor = '#e6b5bc'; // Pink for AHL
                    if (isSweHL) textColor = '#a5d6a7'; // Green for SweHL
                    if (isNHL) textColor = '#ffcc80'; // Gold/orange for NHL
                    
                    return (
                      <tr key={index} style={{ color: textColor, backgroundColor: index % 2 === 0 ? '#2a2a2a' : '#1e1e1e' }}>
                        <StatsTableCell>{season.season}</StatsTableCell>
                        <StatsTableCell>{season.team}</StatsTableCell>
                        <StatsTableCell>{season.league}</StatsTableCell>
                        <StatsTableCell>{season.gp}</StatsTableCell>
                        <StatsTableCell>{season.goals}</StatsTableCell>
                        <StatsTableCell>{season.assists}</StatsTableCell>
                        <StatsTableCell>{season.points}</StatsTableCell>
                        <StatsTableCell>{season.pim}</StatsTableCell>
                        <StatsTableCell>{season.plusMinus}</StatsTableCell>
                        <StatsTableCell>{playoff ? playoff.gp : '--'}</StatsTableCell>
                        <StatsTableCell>{playoff ? playoff.goals : '--'}</StatsTableCell>
                        <StatsTableCell>{playoff ? playoff.assists : '--'}</StatsTableCell>
                        <StatsTableCell>{playoff ? playoff.points : '--'}</StatsTableCell>
                        <StatsTableCell>{playoff ? playoff.pim : '--'}</StatsTableCell>
                      </tr>
                    );
                  })}
                  {/* NHL Totals row */}
                  {hasNhlStats && (
                    <tr style={{ color: '#ffcc80', fontWeight: 'bold', backgroundColor: '#1e1e1e' }}>
                      <StatsTableCell>NHL Totals</StatsTableCell>
                      <StatsTableCell></StatsTableCell>
                      <StatsTableCell></StatsTableCell>
                      <StatsTableCell>{nhlTotals.gp}</StatsTableCell>
                      <StatsTableCell>{nhlTotals.goals}</StatsTableCell>
                      <StatsTableCell>{nhlTotals.assists}</StatsTableCell>
                      <StatsTableCell>{nhlTotals.points}</StatsTableCell>
                      <StatsTableCell>{nhlTotals.pim}</StatsTableCell>
                      <StatsTableCell></StatsTableCell>
                      <StatsTableCell></StatsTableCell>
                      <StatsTableCell></StatsTableCell>
                      <StatsTableCell></StatsTableCell>
                      <StatsTableCell></StatsTableCell>
                      <StatsTableCell></StatsTableCell>
                    </tr>
                  )}
                </tbody>
              </StatsTable>
            </SeasonStatsTable>
            
            {/* Tournaments Section */}
            <PlayerCardSection>
              <PlayerCardSectionTitle>Tournaments</PlayerCardSectionTitle>
              <SeasonStatsTable>
                <StatsTable>
                  <thead>
                    <tr>
                      <StatsTableHeader>Year</StatsTableHeader>
                      <StatsTableHeader>Tournament</StatsTableHeader>
                      <StatsTableHeader>Team</StatsTableHeader>
                      <StatsTableHeader>GP</StatsTableHeader>
                      <StatsTableHeader>G</StatsTableHeader>
                      <StatsTableHeader>A</StatsTableHeader>
                      <StatsTableHeader>Pts</StatsTableHeader>
                      <StatsTableHeader>PIM</StatsTableHeader>
                      <StatsTableHeader>+/-</StatsTableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map((tournament, index) => {
                      const rowBackground = index % 2 === 0 ? '#2a2a2a' : '#1e1e1e';
                      return (
                        <StatsTableRow key={index} style={{ color: '#e6b5bc', backgroundColor: rowBackground }}>
                          <StatsTableCell>{tournament.year}</StatsTableCell>
                          <StatsTableCell>{tournament.tournament}</StatsTableCell>
                          <StatsTableCell>{tournament.team}</StatsTableCell>
                          <StatsTableCell>{tournament.gp}</StatsTableCell>
                          <StatsTableCell>{tournament.goals}</StatsTableCell>
                          <StatsTableCell>{tournament.assists}</StatsTableCell>
                          <StatsTableCell>{tournament.points}</StatsTableCell>
                          <StatsTableCell>{tournament.pim}</StatsTableCell>
                          <StatsTableCell>{tournament.plusMinus}</StatsTableCell>
                        </StatsTableRow>
                      );
                    })}
                  </tbody>
                </StatsTable>
              </SeasonStatsTable>
            </PlayerCardSection>
            
            {/* Awards Section */}
            <PlayerCardSection>
              <PlayerCardSectionTitle>Awards</PlayerCardSectionTitle>
              <SeasonStatsTable>
                <StatsTable>
                  <thead>
                    <tr>
                      <StatsTableHeader>Year</StatsTableHeader>
                      <StatsTableHeader>League</StatsTableHeader>
                      <StatsTableHeader>Award</StatsTableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {awards.map((award, index) => {
                      const rowBackground = index % 2 === 0 ? '#2a2a2a' : '#1e1e1e';
                      return (
                        <StatsTableRow key={index} style={{ color: '#81c784', backgroundColor: rowBackground }}>
                          <StatsTableCell>{award.year}</StatsTableCell>
                          <StatsTableCell>{award.league}</StatsTableCell>
                          <StatsTableCell style={{textAlign: 'left'}}>{award.award}</StatsTableCell>
                        </StatsTableRow>
                      );
                    })}
                  </tbody>
                </StatsTable>
              </SeasonStatsTable>
            </PlayerCardSection>
            
            {/* Player Attributes Section */}
            <PlayerCardSection>
              <PlayerCardSectionTitle>Player Attributes</PlayerCardSectionTitle>
              <AttributeGrid>
                {Object.entries(mockAttributes).map(([key, value]) => (
                  <AttributeItem key={key}>
                    <AttributeName>{key.charAt(0).toUpperCase() + key.slice(1)}</AttributeName>
                    <AttributeValue value={value}>{value}</AttributeValue>
                  </AttributeItem>
                ))}
              </AttributeGrid>
            </PlayerCardSection>
          </PlayerCardBody>
        </PlayerCardContent>
      </PlayerModal>
    );
  };

  // --- Render Logic ---
  const renderPositionIcon = (position) => {
    // ... existing code ...
  };
  
  // Fix missing helper functions - move inside component
  const getTeamNameById = (id) => {
    if (!id) return 'Unknown';
    
    const team = allTeamsData.find(t => t.id == id); // Use loose equality for id comparison
    if (team) {
      return team.team || 'Unknown';
    }
    return 'Unknown';
  };

  // Helper for safe ID comparison  
  const isSameId = (id1, id2) => {
    if (id1 === undefined || id1 === null || id2 === undefined || id2 === null) return false;
    return String(id1).trim() === String(id2).trim();
  };

  // Get full league name with abbreviation
  const getLeagueFullName = (abbreviation) => {
    if (!abbreviation) return '';
    
    // Log to debug potential issues
    console.log(`[DEBUG] Getting full name for league abbreviation: "${abbreviation}"`);
    
    // First try to get from our database
    const leagueData = allLeaguesData?.find(l => l.abbreviation === abbreviation);
    if (leagueData && leagueData.league) {
      return `${leagueData.league} (${abbreviation})`;
    }
    
    // Fallback to the static mapping
    const fullName = LEAGUE_NAME_MAP[abbreviation];
    if (!fullName) {
      console.warn(`[DEBUG] No full name found in mapping for abbreviation: "${abbreviation}"`);
      return abbreviation;
    }
    
    return `${fullName} (${abbreviation})`;
  };

  // Add this logging before the return statement for easier debugging
  console.log('[DEBUG] Render state:', {
    initialDataLoaded,
    loadingData, // Is any loading happening (init or player fetch)
    error,
    selectedLeagueType,
    selectedLeague,
    selectedTeam,
    availableLeagueTypesCount: allLeagueTypesData.length, // Use static data length
    availableLeaguesDropdownCount: getFilteredLeagues().length, // Dynamic dropdown state
    teamsDropdownCount: getFilteredTeams().length, // Dynamic dropdown state
    playersDisplayed: players.length,
    totalPlayerCount, // From query
    currentPage,
    totalPages,
  });
  // *** Add specific log for league types before render ***
  console.log(`[DEBUG] Pre-render check: allLeagueTypesData length = ${allLeagueTypesData.length}`);

  // Handler for Create Player button - navigate to player creation page
  const handleCreatePlayer = () => {
    console.log('Create Player button clicked');
    // Navigate to player creation page
    window.location.href = '/create-player';
  };

  // Handler for Run Player Error Analysis button
  const handleRunErrorAnalysis = () => {
    console.log('Run Player Error Analysis button clicked');
    setShowErrorAnalysisModal(true);
  };

  // Handler for closing error analysis modal
  const closeErrorAnalysisModal = () => {
    setShowErrorAnalysisModal(false);
    setAnalysisResults([]);
  };

  // Handler for running similar name analysis
  const runSimilarNameAnalysis = async () => {
    setIsRunningAnalysis(true);
    
    try {
      console.log('Running similar name analysis');
      
      // Example mock implementation - in a real app, this would be a backend call
      // that returns players with similar names
      const { data, error } = await supabase
        .from('Player')
        .select('id, first_name, last_name, team, position_primary')
        .order('last_name', { ascending: true });
        
      if (error) {
        throw new Error(`Error fetching players: ${error.message}`);
      }
      
      // Find players with similar names
      const nameMap = {};
      const similarNames = [];
      
      // Group players by normalized name
      data.forEach(player => {
        const normalizedName = `${player.first_name.toLowerCase()} ${player.last_name.toLowerCase()}`;
        if (!nameMap[normalizedName]) {
          nameMap[normalizedName] = [];
        }
        nameMap[normalizedName].push(player);
      });
      
      // Find names with multiple players
      Object.values(nameMap).forEach(playerGroup => {
        if (playerGroup.length > 1) {
          similarNames.push(...playerGroup);
        }
      });
      
      console.log('Similar name analysis complete', similarNames);
      setAnalysisResults(similarNames);
      
    } catch (err) {
      console.error('Error running similar name analysis:', err);
      setAnalysisResults([]);
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  // Handler for players per page change
  const handlePlayersPerPageChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setPlayersPerPage(value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Render error analysis modal
  const renderErrorAnalysisModal = () => {
    if (!showErrorAnalysisModal) return null;
    
    return (
      <ErrorAnalysisModal onClick={closeErrorAnalysisModal}>
        <ErrorAnalysisContent onClick={(e) => e.stopPropagation()}>
          <ErrorAnalysisHeader>
            <ErrorAnalysisTitle>Player Error Analysis</ErrorAnalysisTitle>
            <ErrorAnalysisClose onClick={closeErrorAnalysisModal}>×</ErrorAnalysisClose>
          </ErrorAnalysisHeader>
          <ErrorAnalysisBody>
            <p>Select an analysis to run on the player database to identify potential errors:</p>
            
            <ErrorAnalysisButton 
              onClick={runSimilarNameAnalysis}
              disabled={isRunningAnalysis}
            >
              {isRunningAnalysis ? 'Running Analysis...' : 'Run Similar Name Analysis'}
            </ErrorAnalysisButton>
            
            {isRunningAnalysis && (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <LoadingSpinner style={{ height: '50px' }} />
              </div>
            )}
            
            {analysisResults.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>Results</h3>
                <p>Found {analysisResults.length} players with similar names:</p>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '10px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #333' }}>Name</th>
                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #333' }}>Team</th>
                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #333' }}>Position</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysisResults.map(player => (
                        <tr key={player.id} style={{ cursor: 'pointer' }} onClick={() => handlePlayerClick(player)}>
                          <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                            {player.first_name} {player.last_name}
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                            {player.team || 'N/A'}
                          </td>
                          <td style={{ padding: '8px', borderBottom: '1px solid #333' }}>
                            {player.position_primary || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </ErrorAnalysisBody>
        </ErrorAnalysisContent>
      </ErrorAnalysisModal>
    );
  };

  return (
    <Container>
      <TitleContainer>
        <Title>Player Management</Title>
        <ButtonsContainer>
          <ActionButton onClick={handleCreatePlayer}>
            Create Player
          </ActionButton>
          <ActionButton onClick={handleRunErrorAnalysis}>
            Run Player Error Analysis
          </ActionButton>
        </ButtonsContainer>
      </TitleContainer>
      
      {/* Filters Section */}
      <FiltersContainer>
        {/* Search Input */}
        <FilterGroup>
          <FilterLabel>Search Players</FilterLabel>
          <FilterInput 
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </FilterGroup>
        
        {/* League Type Dropdown */}
        <FilterGroup>
          <FilterLabel>League Type</FilterLabel>
          <FilterSelect 
            value={selectedLeagueType}
            onChange={handleLeagueTypeChange}
            disabled={!initialDataLoaded || loadingData}
          >
            <option value="">All League Types</option>
            {initialDataLoaded && allLeagueTypesData && allLeagueTypesData.map(leagueType => (
              <option key={leagueType} value={leagueType}>
                {leagueType} ({leagueTypeMap.counts[leagueType] || 0} teams)
              </option>
            ))}
          </FilterSelect>
        </FilterGroup>
        
        {/* League Dropdown */}
        <FilterGroup>
          <FilterLabel>League</FilterLabel>
          <FilterSelect 
            value={selectedLeague}
            onChange={handleLeagueChange}
            disabled={!initialDataLoaded || loadingData}
          >
            <option value="">All Leagues</option>
            {initialDataLoaded && getFilteredLeagues().map(league => {
              // Handle cases where either league.league or league.abbreviation might be missing
              const abbreviation = league.abbreviation || league.league;
              const leagueName = league.league || league.abbreviation;
              
              // Skip if we don't have either a name or abbreviation
              if (!abbreviation) return null;
              
              // Count teams in this league
              const teamsInLeague = allTeamsData.filter(t => t.league === abbreviation);
              return (
                <option key={abbreviation} value={abbreviation}>
                  {leagueName} ({teamsInLeague.length} teams)
                </option>
              );
            })}
          </FilterSelect>
        </FilterGroup>
        
        {/* Team Dropdown */}
        <FilterGroup>
          <FilterLabel>Team</FilterLabel>
          <FilterSelect 
            value={selectedTeam}
            onChange={handleTeamChange}
            disabled={!initialDataLoaded || loadingData}
          >
            <option value="">All Teams</option>
            {initialDataLoaded && getFilteredTeams().map(team => (
              <option key={team.id} value={team.abbreviation}>
                {team.team} ({team.abbreviation})
              </option>
            ))}
          </FilterSelect>
        </FilterGroup>
        
        {/* Position Dropdown */}
        <FilterGroup>
          <FilterLabel>Position</FilterLabel>
          <FilterSelect 
            value={selectedPosition}
            onChange={(e) => {
              setSelectedPosition(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Positions</option>
            {['C', 'LW', 'RW', 'D', 'G'].map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </FilterSelect>
        </FilterGroup>
      </FiltersContainer>
      
      {/* Filter Summary */}
      <FilterSummary>
        {(selectedLeagueType || selectedLeague || selectedTeam || selectedPosition || searchQuery) ? (
          <>
            {totalPlayerCount > 0 ? (
              <>Displaying <span>{players.length}</span> of <span>{totalPlayerCount}</span> player{totalPlayerCount !== 1 ? 's' : ''}</>
            ) : (
              <>No players found</>
            )}
            {selectedLeagueType && <> from <span className="highlight">{selectedLeagueType}</span> level</>}
            {selectedLeague && <> in <span className="highlight">{getLeagueFullName(selectedLeague)}</span></>}
            {selectedTeam && (
              <> on <span className="highlight">
                {(() => {
                  const team = allTeamsData.find(t => t.abbreviation === selectedTeam);
                  return team ? `${team.team} (${selectedTeam})` : selectedTeam;
                })()}
              </span></>
            )}
            {selectedPosition && <> playing <span className="highlight">{selectedPosition}</span></>}
            {searchQuery && <> matching "<span>{searchQuery}</span>"</>}
          </>
        ) : (
          <>&nbsp;</>
        )}
      </FilterSummary>
      
      {/* Main Content Area: Loading / Error / Table */}
      {loadingData && !initialDataLoaded ? (
        // Initial loading state
        <LoadingSpinner />
      ) : error && !initialDataLoaded ? (
          // Show only critical initialization error if it prevents loading
         <ErrorMessage>{error}</ErrorMessage>
      ) : !initialDataLoaded ? (
          // Fallback if stuck somehow before initial load completes without error
         <ErrorMessage>Component initialization pending...</ErrorMessage>
      ): (
         // After initial load: show loading for player fetches, errors, or the table
         <>
           {loadingData && <LoadingSpinner />}
           {error && <ErrorMessage>{error}</ErrorMessage>}
           {!loadingData && !error && players.length === 0 && (
             <ErrorMessage>No players found matching your criteria.</ErrorMessage>
           )}
           {!loadingData && !error && players.length > 0 && (
             <>
               <TableContainer>
                 <PlayersTable>
                   <thead>
                      {/* Table Headers - No Changes Needed */}
                     <tr>
                        <TableHeader onClick={() => handleSort('last_name')} sorted={sortColumn === 'last_name' ? sortDirection : null}>Name</TableHeader>
                        <TableHeader onClick={() => handleSort('position_primary')} sorted={sortColumn === 'position_primary' ? sortDirection : null}>Position</TableHeader>
                        <TableHeader onClick={() => handleSort('age')} sorted={sortColumn === 'age' ? sortDirection : null}>Age</TableHeader>
                        <TableHeader onClick={() => handleSort('height')} sorted={sortColumn === 'height' ? sortDirection : null}>Height</TableHeader>
                        <TableHeader onClick={() => handleSort('weight')} sorted={sortColumn === 'weight' ? sortDirection : null}>Weight</TableHeader>
                        <TableHeader onClick={() => handleSort('overall')} sorted={sortColumn === 'overall' ? sortDirection : null}>OVR</TableHeader>
                        <TableHeader onClick={() => handleSort('salary')} sorted={sortColumn === 'salary' ? sortDirection : null}>Salary</TableHeader>
                        <TableHeader>League</TableHeader>
                        <TableHeader>League Type</TableHeader>
                        <TableHeader onClick={() => handleSort('team')} sorted={sortColumn === 'team' ? sortDirection : null}>Team</TableHeader>
                     </tr>
                   </thead>
                   <tbody>
                     {players.map(player => (
                       <TableRow 
                         key={player.id} 
                         onClick={() => handlePlayerClick(player)}
                         style={{ cursor: 'pointer' }}
                       >
                         <TableCell>{player.first_name} {player.last_name}</TableCell>
                         <TableCell>{player.position_primary || 'N/A'}</TableCell>
                         <TableCell>{player.age || 'N/A'}</TableCell>
                         <TableCell>{player.height || 'N/A'}</TableCell>
                         <TableCell>{player.weight || 'N/A'}</TableCell>
                         <TableCell>{player.overall || 'N/A'}</TableCell>
                         <TableCell>{formatSalary(player.salary)}</TableCell>
                         <TableCell>{player.league ? getLeagueFullName(player.league) : 'N/A'}</TableCell>
                         <TableCell>{player.league_type || 'N/A'}</TableCell>
                         <TableCell>{player.teamObj ? `${player.teamObj.team} (${player.team})` : (player.team || 'N/A')}</TableCell>
                       </TableRow>
                     ))}
                   </tbody>
                 </PlayersTable>
               </TableContainer>

               {/* Pagination Controls */}
               <PaginationContainer>
                 <PageInfo>
                   Page {currentPage} of {totalPages} ({totalPlayerCount} total players)
                 </PageInfo>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div>
                     <label style={{ color: '#C4CED4', marginRight: '8px' }}>Show:</label>
                     <select 
                       value={playersPerPage} 
                       onChange={handlePlayersPerPageChange}
                       style={{
                         padding: '5px 10px',
                         borderRadius: '4px',
                         backgroundColor: '#2a2a2a',
                         border: '1px solid #444',
                         color: '#fff'
                       }}
                     >
                       <option value={100}>100</option>
                       <option value={200}>200</option>
                       <option value={500}>500</option>
                     </select>
                   </div>
                   <PageButtons>
                     <PageButton onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</PageButton>
                     <PageButton onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>Previous</PageButton>
                     <PageButton onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next</PageButton>
                     <PageButton onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</PageButton>
                   </PageButtons>
                 </div>
               </PaginationContainer>
             </>
           )}
         </>
      )}
      
      {/* Render the player modal */}
      {renderPlayerModal()}
      
      {/* Render the error analysis modal */}
      {renderErrorAnalysisModal()}
    </Container>
  );
};

export default PlayerEditor;
