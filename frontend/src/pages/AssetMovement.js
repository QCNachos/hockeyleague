import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check for environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase credentials. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are defined in your .env file.'
  );
} else {
  console.log('Supabase URL configured for AssetMovement');
}

const supabase = createClient(
  supabaseUrl || 'https://your-supabase-url.supabase.co',
  supabaseKey || 'your-supabase-anon-key'
);

const PageContainer = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: #C4CED4;
`;

const Description = styled.p`
  margin-bottom: 30px;
  color: #aaa;
  line-height: 1.6;
`;

const AssetMovementContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
`;

const AssetSection = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const AssetSectionTitle = styled.h2`
  color: #C4CED4;
  font-size: 1.5rem;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
`;

const FilterContainer = styled.div`
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const AssetList = styled.div`
  margin-bottom: 20px;
`;

const AssetCategoryTitle = styled.h3`
  color: #B30E16;
  margin: 15px 0 10px;
  font-size: 1.2rem;
`;

const AssetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
`;

const AssetCard = styled.div`
  background-color: ${props => props.selected ? '#304050' : '#2a2a2a'};
  border: 1px solid ${props => props.selected ? '#B30E16' : '#444'};
  border-radius: 5px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.selected ? '#304050' : '#303030'};
    transform: translateY(-2px);
  }
`;

const AssetDetails = styled.div`
  font-size: 12px;
  color: #666;
`;

const AssetDetail = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 2px;
`;

const AssetName = styled.div`
  font-weight: bold;
  margin-bottom: 3px;
`;

const SelectedAssetsSection = styled.div`
  grid-column: span 2;
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: grid;
  grid-template-columns: 1fr 100px 1fr;
  gap: 15px;
`;

const SelectedAssetsContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  background-color: #1a1a1a;
`;

const SelectedTeamHeader = styled.h4`
  color: #ffffff;
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  font-weight: 500;
`;

const SelectedAssetsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const SelectedAssetCard = styled.div`
  background-color: #2a2a2a;
  border-radius: 6px;
  padding: 12px;
  min-width: 180px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SelectedAssetName = styled.div`
  color: #ffffff;
  font-weight: 500;
  font-size: 0.95rem;
`;

const SelectedAssetDetail = styled.div`
  color: #888888;
  font-size: 0.85rem;
`;

const TransferArrowSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
`;

const AssetMovementFooter = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const ConfirmButton = styled.button`
  padding: 15px 30px;
  background-color: #B30E16;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #950b12;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const SelectedAssetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const TransferArrow = styled.div`
  font-size: 1.5rem;
  color: #B30E16;
`;

// Add styled components for draft picks
const DraftPicksContainer = styled.div`
  margin-top: 20px;
`;

const YearRow = styled.div`
  margin-bottom: 15px;
`;

const YearLabel = styled.div`
  font-weight: bold;
  color: #C4CED4;
  margin-bottom: 5px;
`;

const PicksRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 5px;
`;

const TeamPicksLabel = styled.div`
  font-size: 0.85rem;
  color: #aaa;
  margin-right: 5px;
  white-space: nowrap;
`;

const SmallAssetCard = styled(AssetCard)`
  padding: 8px;
  min-width: 80px;
  max-width: 120px;
  text-align: center;
`;

const PickRound = styled.div`
  font-weight: bold;
  color: #fff;
`;

const PickTeam = styled.div`
  font-size: 0.8rem;
  color: #aaa;
`;

// Add these styled components
const TradeActionsContainer = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
`;

const ConfirmTradeButton = styled.button`
  background-color: #c41e3a;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #a01830;
  }

  &:active {
    background-color: #8a152a;
  }

  &:disabled {
    background-color: #666;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const AssetMovement = () => {
  // Helper for safe ID comparison
  const isSameId = (id1, id2) => {
    if (id1 === undefined || id1 === null || id2 === undefined || id2 === null) return false;
    return String(id1).trim() === String(id2).trim();
  };
  
  // Normalize string for comparison (handle case and whitespace)
  const normalizeString = (str) => {
    if (!str) return '';
    return str.toLowerCase().trim();
  };
  
  // Team selection state
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  
  // Supabase data states
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [draftPicksData, setDraftPicksData] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states - similar to TeamManager.js
  const [, setLeagueTypes] = useState([]);
  const [, setLeagues] = useState([]);
  const [, setDivisions] = useState([]);
  
  // Filters for Team 1
  const [selectedLeagueType1, setSelectedLeagueType1] = useState('');
  const [selectedLeague1, setSelectedLeague1] = useState('');
  
  // Filters for Team 2
  const [selectedLeagueType2, setSelectedLeagueType2] = useState('');
  const [selectedLeague2, setSelectedLeague2] = useState('');
  
  // Available filter options
  const [availableLeagueTypes, setAvailableLeagueTypes] = useState([]);
  const [, setAvailableLeagues] = useState([]);
  
  // Added state variable for league type mapping
  const [leagueToTypeMap, setLeagueToTypeMap] = useState({});
  const [enhancedTeams, setEnhancedTeams] = useState([]);
  
  // Selected assets
  const [selectedTeam1Assets, setSelectedTeam1Assets] = useState([]);
  const [selectedTeam2Assets, setSelectedTeam2Assets] = useState([]);
  
  // Add this function near the top of the component
  const listAvailableTables = async () => {
    console.log('Checking available tables...');
    
    try {
      // Try to list tables we have access to
      const { data: tables, error } = await supabase
        .from('pg_catalog.pg_tables')
        .select('schemaname, tablename')
        .eq('schemaname', 'public');
        
      if (error) {
        console.error('Error listing tables:', error);
      } else {
        console.log('Available tables:', tables);
      }
    } catch (err) {
      console.error('Error checking tables:', err);
    }
  };
  
  // Call this function in useEffect
  useEffect(() => {
    listAvailableTables();
  }, []);
  
  // Fetch teams, players, and draft picks from Supabase when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      setError(null);
      
      try {
        console.log('Fetching data for AssetMovement...');
        
        // First, fetch league data to establish the relationship between leagues and league types
        // Note: league_type doesn't exist directly on Team table, but is related through the League table
        const { data: leagueData, error: leagueError } = await supabase
          .from('League')
          .select('*')
          .order('league');
          
        if (leagueError) {
          console.error('Error fetching leagues:', leagueError);
          throw leagueError;
        }
        
        // Create mapping of league names to their types
        // This maps each league (which is a foreign key in Team table) to its corresponding league_type
        const leagueToTypeMap = {};
        if (leagueData && leagueData.length > 0) {
          leagueData.forEach(league => {
            leagueToTypeMap[league.league] = league.league_level;
          });
        }
        
        console.log('League to type mapping:', leagueToTypeMap);
        
        // Store the mapping in state
        setLeagueToTypeMap(leagueToTypeMap);
        
        // Extract unique league types
        const uniqueLeagueTypes = [...new Set(
          leagueData
            .map(league => league.league_level)
            .filter(Boolean)
        )].sort();
        
        console.log('Unique league types:', uniqueLeagueTypes);
        setLeagueTypes(uniqueLeagueTypes);
        setAvailableLeagueTypes(uniqueLeagueTypes);
        
        // Extract unique leagues
        const uniqueLeagues = [...new Set(
          leagueData
            .map(league => league.league)
            .filter(Boolean)
        )];
        
        setLeagues(uniqueLeagues);
        setAvailableLeagues(uniqueLeagues);
        
        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('Team')
          .select('*, League(league_level)')
          .order('team');
          
        if (teamsError) {
          console.error('Error fetching teams:', teamsError);
          throw teamsError;
        }
        
        // Enhance teams with league_type from their League relationship
        const enhancedTeams = teamsData.map(team => ({
          ...team,
          league_type: team.League?.league_level || leagueToTypeMap[team.league] || 'Unknown'
        }));
        
        console.log('Teams fetched from Supabase:', enhancedTeams?.length || 0);
        if (enhancedTeams && enhancedTeams.length > 0) {
          console.log('Sample team data with league types:');
          enhancedTeams.slice(0, 3).forEach(team => {
            console.log(` - Team: ${team.team}, League: ${team.league}, League Type: ${team.league_type}`);
          });
        }
        
        setTeams(enhancedTeams || []);
        setEnhancedTeams(enhancedTeams || []);
        
        // Check the structure of a player to understand the relationship
        const { data: playerStructure, error: structureError } = await supabase
          .from('Player')
          .select('*')
          .limit(1);
          
        if (structureError) {
          console.error('Error fetching player structure:', structureError);
          throw structureError;
        }
        
        // Examine the player record to determine how team reference is stored
        console.log('Player record structure:', playerStructure[0]);
        
        // The team reference could be in various formats, try to determine it
        let playerTeamField = 'team';
        if (playerStructure[0]) {
          const playerKeys = Object.keys(playerStructure[0]);
          const possibleTeamFields = ['team', 'team_id', 'teamId'];
          for (const field of possibleTeamFields) {
            if (playerKeys.includes(field) && playerStructure[0][field] !== undefined) {
              playerTeamField = field;
              console.log(`Found likely team reference field: ${field} with value:`, playerStructure[0][field]);
              break;
            }
          }
        }
        
        console.log(`Using '${playerTeamField}' as the team reference field for Player table`);
        
        // Now construct our query based on what we found
        let query = supabase
          .from('Player')
          .select(`
            *,
            team:Team(id, team, abbreviation, league, League(league_level))
          `);
        
        // For AssetMovement, we'll fetch all players at once since we need them for different teams
        // We don't need pagination here since players will be filtered by team client-side
        
        const { data: playersData, error: playersError } = await query.order('last_name');
          
        if (playersError) {
          console.error('Error fetching players:', playersError);
          throw playersError;
        }
        
        console.log('Players fetched from Supabase:', playersData?.length || 0);
        // Log a few players to check their structure
        if (playersData && playersData.length > 0) {
          console.log('Sample player data:', playersData.slice(0, 3));
        }
        
        setPlayers(playersData || []);
        
        // Simple draft picks query
        console.log('Attempting basic draft picks query...');
        const { data: draftPicksData, error: draftPicksError } = await supabase
          .from('Draft_Picks')
          .select('*');
          
        if (draftPicksError) {
          console.error('Error fetching draft picks:', {
            message: draftPicksError.message,
            code: draftPicksError.code,
            details: draftPicksError.details,
            hint: draftPicksError.hint
          });
          
          // If we get a "relation does not exist" error, try to list all available tables
          if (draftPicksError.code === '42P01') {
            console.log('Table not found, checking available tables...');
            const { data: tables } = await supabase
              .from('pg_tables')
              .select('tablename')
              .eq('schemaname', 'public');
              
            console.log('Available tables:', tables);
          }
        } else {
          console.log('Draft picks data:', {
            count: draftPicksData?.length || 0,
            sample: draftPicksData?.[0]
          });
          setDraftPicksData(draftPicksData || []);
        }
        
      } catch (error) {
        console.error('Error in fetchData:', error);
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handler for team 1 selection
  const handleTeam1Change = (e) => {
    const value = e.target.value;
    console.log('Detailed analysis for selected team:', value);
    
    // Find the team in our data
    const team = teams.find(t => isSameId(t.id, value));
    if (team) {
      console.log('Found team details:', {
        id: team.id,
        name: team.team,
        abbreviation: team.abbreviation,
        league: team.league,
        league_type: team.league_type
      });
      
      // Check for matching draft picks
      const teamAbbr = team.abbreviation;
      if (draftPicksData) {
        const exactMatches = draftPicksData.filter(pick => pick.team === teamAbbr);
        console.log(`Exact case matches: ${exactMatches.length}`);
        
        const caseInsensitiveMatches = draftPicksData.filter(pick => 
          normalizeAbbreviation(pick.team) === normalizeAbbreviation(teamAbbr)
        );
        console.log(`Case-insensitive matches: ${caseInsensitiveMatches.length}`);
        
        if (caseInsensitiveMatches.length > 0) {
          console.log('Sample matching picks:', caseInsensitiveMatches.slice(0, 2));
        }
      }
    } else {
      console.log(`Couldn't find team with ID=${value} in teams array`);
    }
    
    console.log('...Directly checking for Draft_Picks table...');
    // Check if we can access the Draft_Picks table directly
    const checkDraftPicks = async () => {
      try {
        const { data, error } = await supabase
          .from('Draft_Picks')
          .select('*')
          .limit(1);
          
        console.log('Draft_Picks table exists and is accessible.');
        console.log('Sample row:', data);
        
        // Count total draft picks
        console.log('Counting draft picks...');
        const { count, error: countError } = await supabase
          .from('Draft_Picks')
          .select('*', { count: 'exact' });
          
        console.log('Draft picks count:', count);
        
        // Check for NHL data
        console.log('Checking for NHL data...');
        const nhlTeams = teams.filter(t => t.league === 'NHL');
        console.log(`Found ${nhlTeams.length} NHL teams:`, nhlTeams);
        
        console.log('Here are the NHL team abbreviations:');
        nhlTeams.forEach(team => {
          console.log(`${team.team}: ${team.abbreviation}`);
        });
        
      } catch (error) {
        console.error('Error checking Draft_Picks table:', error);
      }
    };
    
    checkDraftPicks();
    
    setTeam1(value);
    setSelectedTeam1Assets([]);
  };
  
  // Handler for team 2 selection
  const handleTeam2Change = (e) => {
    const value = e.target.value;
    console.log('Team 2 selected:', value);
    setTeam2(value);
    setSelectedTeam2Assets([]);
  };
  
  // Handler for league selection for team 1
  const handleLeague1Change = (e) => {
    const value = e.target.value;
    setSelectedLeague1(value);
    
    // Reset subsequent filters
    setSelectedLeague1('');
    setTeam1(''); // Reset team selection
    setSelectedTeam1Assets([]);
  };
  
  // Handler for league selection for team 2
  const handleLeague2Change = (e) => {
    const value = e.target.value;
    setSelectedLeague2(value);
    
    // Reset subsequent filters
    setSelectedLeague2('');
    setTeam2(''); // Reset team selection
    setSelectedTeam2Assets([]);
  };
  
  // Handler for league type selection for team 1
  const handleLeagueType1Change = (e) => {
    const newLeagueType = e.target.value;
    console.log(`League type 1 selected: "${newLeagueType}"`);
    
    // Log out available teams for this league type
    const matchingTeams = teams.filter(team => {
      return getTeamLeagueType(team) === newLeagueType;
    });
    
    console.log(`Found ${matchingTeams.length} teams with league type "${newLeagueType}":`);
    matchingTeams.slice(0, 5).forEach(team => {
      console.log(` - ${team.team} (${team.abbreviation}): league="${team.league}", league_type="${team.league_type}"`);
    });
    
    setSelectedLeagueType1(newLeagueType);
    
    // Reset subsequent filters
    setSelectedLeague1('');
    setTeam1(''); // Reset team selection
    setSelectedTeam1Assets([]);
  };
  
  // Handler for league type selection for team 2
  const handleLeagueType2Change = (e) => {
    const newLeagueType = e.target.value;
    console.log(`League type 2 selected: "${newLeagueType}"`);
    
    // Log out available teams for this league type
    const matchingTeams = teams.filter(team => {
      return getTeamLeagueType(team) === newLeagueType;
    });
    
    console.log(`Found ${matchingTeams.length} teams with league type "${newLeagueType}":`);
    matchingTeams.slice(0, 5).forEach(team => {
      console.log(` - ${team.team} (${team.abbreviation}): league="${team.league}", league_type="${team.league_type}"`);
    });
    
    setSelectedLeagueType2(newLeagueType);
    
    // Reset subsequent filters
    setSelectedLeague2('');
    setTeam2(''); // Reset team selection
    setSelectedTeam2Assets([]);
  };
  
  // Toggle for team 1 asset selection
  const toggleTeam1Asset = (asset) => {
    if (!asset) return;
    
    // Check if the asset is already selected
    const isSelected = selectedTeam1Assets.some(a => 
      a.id === asset.id && a.assetType === asset.assetType
    );
    
    if (isSelected) {
      // Remove the asset
      setSelectedTeam1Assets(selectedTeam1Assets.filter(a => 
        !(a.id === asset.id && a.assetType === asset.assetType)
      ));
    } else {
      // Add the asset
      setSelectedTeam1Assets([...selectedTeam1Assets, asset]);
    }
  };
  
  // Toggle for team 2 asset selection
  const toggleTeam2Asset = (asset) => {
    if (!asset) return;
    
    // Check if the asset is already selected
    const isSelected = selectedTeam2Assets.some(a => 
      a.id === asset.id && a.assetType === asset.assetType
    );
    
    if (isSelected) {
      // Remove the asset
      setSelectedTeam2Assets(selectedTeam2Assets.filter(a => 
        !(a.id === asset.id && a.assetType === asset.assetType)
      ));
    } else {
      // Add the asset
      setSelectedTeam2Assets([...selectedTeam2Assets, asset]);
    }
  };
  
  // Helper function to get league type from team
  const getTeamLeagueType = (team) => {
    if (!team) return null;
    
    // First try to get directly from the League relationship
    if (team.League && team.League.league_level) {
      return team.League.league_level;
    }
    
    // Fallback to our mapping
    return leagueToTypeMap?.[team.league] || 'Unknown';
  };
  
  // Filter teams for team 1 based on selected filters
  const getFilteredTeamsForTeam1 = () => {
    return teams.filter(team => {
      // Filter by league type if selected
      if (selectedLeagueType1 && getTeamLeagueType(team) !== selectedLeagueType1) {
        return false;
      }
      
      // Filter by league if selected
      if (selectedLeague1 && team.league !== selectedLeague1) {
        return false;
      }
      
      return true;
    });
  };
  
  // Filter teams for team 2 based on selected filters
  const getFilteredTeamsForTeam2 = () => {
    return teams.filter(team => {
      // Filter by league type if selected
      if (selectedLeagueType2 && getTeamLeagueType(team) !== selectedLeagueType2) {
        return false;
      }
      
      // Filter by league if selected
      if (selectedLeague2 && team.league !== selectedLeague2) {
        return false;
      }
      
      return true;
    });
  };
  
  // Check if a player is selected for team 1
  const isTeam1AssetSelected = (asset, type) => {
    return selectedTeam1Assets.some(a => 
      a.id === asset.id && 
      (a.assetType === type || a.assetType === asset.assetType)
    );
  };
  
  // Check if a player is selected for team 2
  const isTeam2AssetSelected = (asset, type) => {
    return selectedTeam2Assets.some(a => 
      a.id === asset.id && 
      (a.assetType === type || a.assetType === asset.assetType)
    );
  };
  
  // Get team name by ID
  const getTeamNameById = (id) => {
    if (!id) return 'Unknown';
    
    const team = teams.find(t => isSameId(t.id, id));
    if (team) {
      return team.team || 'Unknown';
    }
    return 'Unknown';
  };
  
  // Filter players based on team
  const getPlayersForTeam = (teamId) => {
    if (!teamId) return [];
    console.log(`Getting players for team ID: ${teamId}`);
    
    try {
      // Log all players to check their structure
      if (players.length > 0 && !players[0].team) {
        console.error("Player data does not have the expected team relationship structure:", players[0]);
      }
      
      // First try filtering by the team relationship
      const relationMatches = players.filter(player => {
        return player && player.team && player.team.id && isSameId(player.team.id, teamId);
      });
      
      console.log(`Found ${relationMatches.length} players with team.id=${teamId} using relation`);
      
      // If we didn't find any matches with the relation approach, try direct properties
      if (relationMatches.length === 0) {
        for (const field of ['team', 'team_id', 'teamId']) {
          if (players.some(p => p[field] !== undefined)) {
            const directMatches = players.filter(p => 
              p[field] !== null && isSameId(p[field], teamId)
            );
            
            console.log(`Found ${directMatches.length} players with ${field}=${teamId}`);
            
            if (directMatches.length > 0) {
              return directMatches;
            }
          }
        }
        
        // As a last resort, log information for debugging
        console.log("Team filtering failed. Check all players with team info:");
        const teamCounts = {};
        players.forEach(p => {
          if (p.team && p.team.id) {
            const tid = p.team.id.toString();
            teamCounts[tid] = (teamCounts[tid] || 0) + 1;
          }
        });
        console.log("Players per team ID:", teamCounts);
        
        return [];
      }
      
      return relationMatches;
    } catch (error) {
      console.error(`Error filtering players for team ${teamId}:`, error);
      return [];
    }
  };
  
  // Get player contract information formatted nicely
  const getPlayerContractInfo = (player) => {
    const salary = player.salary ? `$${(player.salary / 1000000).toFixed(1)}M` : 'N/A';
    const years = player.contract_years || 'N/A';
    return `${salary} x ${years} years`;
  };
  
  // Helper function to normalize abbreviation for comparison
  const normalizeAbbreviation = (abbr) => {
    if (!abbr) return '';
    return String(abbr).toLowerCase().trim();
  };
  
  // Check if two abbreviations match (case insensitive, ignoring whitespace)
  const abbreviationsMatch = (abbr1, abbr2) => {
    return normalizeAbbreviation(abbr1) === normalizeAbbreviation(abbr2);
  };
  
  // Updated getDraftPicksForTeam function to match by team abbreviation
  const getDraftPicksForTeam = (teamId) => {
    if (!teamId || !draftPicksData) {
      console.log('No team ID or draft picks data');
      return [];
    }
    
    // Find the team to get its abbreviation
    const team = teams.find(t => isSameId(t.id, teamId));
    if (!team || !team.abbreviation) {
      console.log(`No abbreviation found for team ID: ${teamId}`);
      return [];
    }
    
    const teamAbbr = team.abbreviation;
    console.log(`Looking for draft picks for ${team.team} (${teamAbbr})`);
    
    // Log the first few draft picks to verify structure
    if (draftPicksData.length > 0) {
      console.log('Sample draft pick structure:', draftPicksData[0]);
    }
    
    // Filter picks based on team abbreviation - case insensitive and trim whitespace
    const teamPicks = draftPicksData.filter(pick => {
      const pickTeam = pick.team;
      const matches = abbreviationsMatch(pickTeam, teamAbbr);
      console.log(`Comparing pick team "${pickTeam}" with "${teamAbbr}": ${matches}`);
      return matches;
    });
    
    console.log(`Found ${teamPicks.length} draft picks for ${teamAbbr}`);
    if (teamPicks.length > 0) {
      console.log('First matching pick:', teamPicks[0]);
    }
    
    return teamPicks;
  };
  
  // Group draft picks by year and original team
  const groupDraftPicksByYear = (picks) => {
    if (!picks || picks.length === 0) return {};
    
    // Group picks by year
    const groupedByYear = {};
    
    picks.forEach(pick => {
      if (!pick.year) return;
      
      if (!groupedByYear[pick.year]) {
        groupedByYear[pick.year] = [];
      }
      groupedByYear[pick.year].push(pick);
    });
    
    // Sort years in descending order (most recent first)
    const sortedYears = Object.keys(groupedByYear).sort((a, b) => b - a);
    
    // Take only the first 5 years
    const limitedYears = sortedYears.slice(0, 5);
    
    // Create final grouped object
    const result = {};
    limitedYears.forEach(year => {
      // Group by original team within each year
      const picksByTeam = {};
      const ownPicks = [];
      const otherPicks = [];
      
      groupedByYear[year].forEach(pick => {
        // Divide into own picks and received picks
        if (!pick.received_pick_1) {
          ownPicks.push(pick);
        } else {
          otherPicks.push(pick);
        }
      });
      
      // Add own picks first
      if (ownPicks.length > 0) {
        picksByTeam['Own'] = ownPicks;
      }
      
      // Then group other picks by the team they came from
      otherPicks.forEach(pick => {
        const teamKey = pick.received_pick_1;
        if (!picksByTeam[teamKey]) {
          picksByTeam[teamKey] = [];
        }
        picksByTeam[teamKey].push(pick);
      });
      
      result[year] = picksByTeam;
    });
    
    return result;
  };
  
  // Helper to get team abbreviation from team ID
  const getTeamAbbreviation = (id) => {
    if (!id) return '';
    
    const team = teams.find(t => isSameId(t.id, id));
    if (team) {
      return team.abbreviation || '';
    }
    return '';
  };
  
  // Handle confirming the trade
  const handleConfirmTrade = () => {
    // Format each team's assets for display
    const team1Assets = selectedTeam1Assets.map(asset => 
      asset.assetType === 'player' 
        ? `${asset.first_name} ${asset.last_name} (${asset.position_primary || 'N/A'})` 
        : `${asset.year} Round ${asset.round} Pick${asset.received_pick_1 ? ` (From ${getTeamByAbbreviation(asset.received_pick_1)})` : ""}`
    ).join(', ');
    
    const team2Assets = selectedTeam2Assets.map(asset => 
      asset.assetType === 'player' 
        ? `${asset.first_name} ${asset.last_name} (${asset.position_primary || 'N/A'})` 
        : `${asset.year} Round ${asset.round} Pick${asset.received_pick_1 ? ` (From ${getTeamByAbbreviation(asset.received_pick_1)})` : ""}`
    ).join(', ');
    
    const team1Name = getTeamNameById(team1);
    const team2Name = getTeamNameById(team2);
    
    // Show confirmation
    alert(`Trade confirmed!\n\n${team1Name} receives: ${team2Assets || 'Nothing'}\n${team2Name} receives: ${team1Assets || 'Nothing'}`);
  };
  
  // Update draft picks rendering to match the database structure
  const renderDraftPicks = (teamId) => {
    if (!teamId) {
      return <div>Select a team to view draft picks</div>;
    }
    
    // Find the team to get its abbreviation
    const team = teams.find(t => isSameId(t.id, teamId));
    if (!team || !team.abbreviation) {
      console.log(`No abbreviation found for team ID: ${teamId}`);
      return <div>Cannot find team abbreviation</div>;
    }
    
    const teamAbbr = team.abbreviation;
    console.log(`Rendering draft picks for ${team.team} (${teamAbbr})`);
    
    // Log draft picks data state
    console.log('Current draft picks data:', {
      total: draftPicksData?.length || 0,
      sample: draftPicksData?.[0]
    });
    
    // Filter draft picks based on team abbreviation
    const teamPicks = draftPicksData.filter(pick => {
      const matches = abbreviationsMatch(pick.team, teamAbbr);
      if (matches) {
        console.log('Found matching pick:', pick);
      }
      return matches;
    });
    
    console.log(`Found ${teamPicks.length} draft picks for ${teamAbbr}`);
    
    if (teamPicks.length === 0) {
      return <div>No draft picks available for this team</div>;
    }
    
    // Group picks by year and team
    const groupedPicks = groupDraftPicksByYear(teamPicks);
    console.log('Grouped picks:', groupedPicks);
    
    return (
      <DraftPicksContainer>
        {Object.entries(groupedPicks).map(([year, picksByTeam]) => (
          <YearRow key={year}>
            <YearLabel>{year}</YearLabel>
            {Object.entries(picksByTeam).map(([teamKey, picks]) => (
              <div key={`${year}-${teamKey}`}>
                <TeamPicksLabel>
                  {teamKey === 'Own' ? 'Own' : `From ${getTeamByAbbreviation(teamKey) || teamKey}`}
                </TeamPicksLabel>
                <PicksRow>
                  {picks.map(pick => (
                    <SmallAssetCard 
                      key={pick.id}
                      onClick={() => isSameId(teamId, team1)
                        ? toggleTeam1Asset({...pick, assetType: 'pick'}) 
                        : toggleTeam2Asset({...pick, assetType: 'pick'})
                      }
                      selected={isSameId(teamId, team1)
                        ? selectedTeam1Assets.some(asset => asset.id === pick.id && asset.assetType === 'pick')
                        : selectedTeam2Assets.some(asset => asset.id === pick.id && asset.assetType === 'pick')
                      }
                    >
                      <PickRound>Round {pick.round}</PickRound>
                      <PickTeam>
                        {pick.received_pick_1 
                          ? `From ${getTeamByAbbreviation(pick.received_pick_1) || pick.received_pick_1}`
                          : "Own Pick"
                        }
                      </PickTeam>
                    </SmallAssetCard>
                  ))}
                </PicksRow>
              </div>
            ))}
          </YearRow>
        ))}
      </DraftPicksContainer>
    );
  };
  
  // Helper function to get team name by abbreviation
  const getTeamByAbbreviation = (abbreviation) => {
    if (!abbreviation) return 'Unknown';
    
    // Case insensitive search using our helper
    const team = teams.find(t => 
      t.abbreviation && abbreviationsMatch(t.abbreviation, abbreviation)
    );
    return team ? team.team : abbreviation;
  };
  
  // Update the SelectedTeamSection component
  const SelectedTeamSection = ({ teamName, assets }) => (
    <SelectedAssetsContainer>
      <SelectedTeamHeader>{teamName}</SelectedTeamHeader>
      <SelectedAssetsGrid>
        {assets.length > 0 ? (
          assets.map((asset) => (
            <SelectedAssetCard key={`selected-${asset.id}-${asset.assetType}`}>
              {asset.assetType === 'player' ? (
                <>
                  <SelectedAssetName>{asset.first_name} {asset.last_name}</SelectedAssetName>
                  <SelectedAssetDetail>Position: {asset.position_primary || 'N/A'}</SelectedAssetDetail>
                  <SelectedAssetDetail>Age: {asset.age || 'N/A'}</SelectedAssetDetail>
                </>
              ) : (
                <>
                  <SelectedAssetName>{asset.year} Round {asset.round}</SelectedAssetName>
                  <SelectedAssetDetail>
                    {asset.received_pick_1 
                      ? `From ${getTeamByAbbreviation(asset.received_pick_1)}` 
                      : "Own Pick"}
                  </SelectedAssetDetail>
                </>
              )}
            </SelectedAssetCard>
          ))
        ) : (
          <SelectedAssetDetail>No assets selected</SelectedAssetDetail>
        )}
      </SelectedAssetsGrid>
    </SelectedAssetsContainer>
  );
  
  return (
    <PageContainer>
      <Title>Asset Movement</Title>
      <Description>
        Manage player trades, draft pick exchanges, and other asset movements between teams.
        Select teams, choose the assets to move, and confirm the transaction.
      </Description>
      
      {loadingData ? (
        <p>Loading data...</p>
      ) : error ? (
        <p style={{ color: '#B30E16' }}>{error}</p>
      ) : (
        <>
          {/* If there are issues with league filters, this debug info might help */}
          {teams.length > 0 && !teams[0].league_type && (
            <p style={{ color: '#B30E16', backgroundColor: '#301010', padding: '10px', borderRadius: '4px', marginBottom: '20px' }}>
              Note: League type information is derived from the League table. If filters aren't working correctly, 
              make sure the Team records have valid League references.
            </p>
          )}
          <AssetMovementContainer>
            {/* Team 1 Section */}
            <AssetSection>
              <AssetSectionTitle>Team 1</AssetSectionTitle>
              
              <FilterContainer>
                <FilterGroup>
                  <FilterLabel>League Type:</FilterLabel>
                  <FilterSelect value={selectedLeagueType1} onChange={handleLeagueType1Change}>
                    <option value="">All League Types</option>
                    {availableLeagueTypes.map((leagueType) => {
                      // Count teams in this league type
                      const count = teams.filter(team => 
                        normalizeString(team.league_type || getTeamLeagueType(team)) === normalizeString(leagueType)
                      ).length;
                      
                      return (
                        <option key={`lt1-${leagueType}`} value={leagueType}>
                          {leagueType} ({count} teams)
                        </option>
                      );
                    })}
                  </FilterSelect>
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>League:</FilterLabel>
                  <FilterSelect 
                    value={selectedLeague1} 
                    onChange={handleLeague1Change}
                  >
                    <option value="">All Leagues</option>
                    {teams
                      .filter(team => !selectedLeagueType1 || normalizeString(team.league_type) === normalizeString(selectedLeagueType1))
                      .map(team => team.league)
                      .filter((league, index, self) => league && self.indexOf(league) === index)
                      .sort()
                      .map(league => (
                        <option key={`league1-${league}`} value={league}>
                          {league}
                        </option>
                      ))
                    }
                  </FilterSelect>
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>Select Team:</FilterLabel>
                  <FilterSelect value={team1} onChange={handleTeam1Change}>
                    <option value="">Select a team</option>
                    {getFilteredTeamsForTeam1().map(team => (
                      <option key={`team1-${team.id}`} value={team.id}>
                        {team.team || 'Unknown'} ({team.abbreviation || '???'})
                      </option>
                    ))}
                  </FilterSelect>
                </FilterGroup>
              </FilterContainer>
              
              {team1 && (
                <AssetList>
                  <AssetCategoryTitle>Players</AssetCategoryTitle>
                  <AssetGrid>
                    {getPlayersForTeam(team1).map(player => (
                      <AssetCard 
                        key={`player1-${player.id}`}
                        selected={isTeam1AssetSelected(player, 'player')}
                        onClick={() => toggleTeam1Asset({...player, assetType: 'player'})}
                      >
                        <AssetName>{player.first_name} {player.last_name}</AssetName>
                        <AssetDetails>
                          {player.position_primary || 'N/A'} • {player.age || 'N/A'} yrs • {player.overall || 'N/A'} OVR
                          <br />
                          {getPlayerContractInfo(player)}
                        </AssetDetails>
                      </AssetCard>
                    ))}
                    {getPlayersForTeam(team1).length === 0 && (
                      <p style={{ color: '#aaa', gridColumn: 'span 3' }}>No players found for this team</p>
                    )}
                  </AssetGrid>
                  
                  <AssetCategoryTitle>Draft Picks</AssetCategoryTitle>
                  {renderDraftPicks(team1)}
                </AssetList>
              )}
            </AssetSection>
            
            {/* Team 2 Section */}
            <AssetSection>
              <AssetSectionTitle>Team 2</AssetSectionTitle>
              
              <FilterContainer>
                <FilterGroup>
                  <FilterLabel>League Type:</FilterLabel>
                  <FilterSelect value={selectedLeagueType2} onChange={handleLeagueType2Change}>
                    <option value="">All League Types</option>
                    {availableLeagueTypes.map((leagueType) => {
                      // Count teams in this league type
                      const count = teams.filter(team => 
                        normalizeString(team.league_type || getTeamLeagueType(team)) === normalizeString(leagueType)
                      ).length;
                      
                      return (
                        <option key={`lt2-${leagueType}`} value={leagueType}>
                          {leagueType} ({count} teams)
                        </option>
                      );
                    })}
                  </FilterSelect>
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>League:</FilterLabel>
                  <FilterSelect 
                    value={selectedLeague2} 
                    onChange={handleLeague2Change}
                  >
                    <option value="">All Leagues</option>
                    {teams
                      .filter(team => !selectedLeagueType2 || normalizeString(team.league_type) === normalizeString(selectedLeagueType2))
                      .map(team => team.league)
                      .filter((league, index, self) => league && self.indexOf(league) === index)
                      .sort()
                      .map(league => (
                        <option key={`league2-${league}`} value={league}>
                          {league}
                        </option>
                      ))
                    }
                  </FilterSelect>
                </FilterGroup>
                
                <FilterGroup>
                  <FilterLabel>Select Team:</FilterLabel>
                  <FilterSelect value={team2} onChange={handleTeam2Change}>
                    <option value="">Select a team</option>
                    {getFilteredTeamsForTeam2().map(team => (
                      <option key={`team2-${team.id}`} value={team.id}>
                        {team.team || 'Unknown'} ({team.abbreviation || '???'})
                      </option>
                    ))}
                  </FilterSelect>
                </FilterGroup>
              </FilterContainer>
              
              {team2 && (
                <AssetList>
                  <AssetCategoryTitle>Players</AssetCategoryTitle>
                  <AssetGrid>
                    {getPlayersForTeam(team2).map(player => (
                      <AssetCard 
                        key={`player2-${player.id}`}
                        selected={isTeam2AssetSelected(player, 'player')}
                        onClick={() => toggleTeam2Asset({...player, assetType: 'player'})}
                      >
                        <AssetName>{player.first_name} {player.last_name}</AssetName>
                        <AssetDetails>
                          {player.position_primary || 'N/A'} • {player.age || 'N/A'} yrs • {player.overall || 'N/A'} OVR
                          <br />
                          {getPlayerContractInfo(player)}
                        </AssetDetails>
                      </AssetCard>
                    ))}
                    {getPlayersForTeam(team2).length === 0 && (
                      <p style={{ color: '#aaa', gridColumn: 'span 3' }}>No players found for this team</p>
                    )}
                  </AssetGrid>
                  
                  <AssetCategoryTitle>Draft Picks</AssetCategoryTitle>
                  {renderDraftPicks(team2)}
                </AssetList>
              )}
            </AssetSection>
            
            {/* Selected Assets Section */}
            <SelectedAssetsSection>
              {/* Team 1 Assets */}
              <SelectedTeamSection teamName={team1 ? getTeamNameById(team1) : 'Team 1'} assets={selectedTeam1Assets} />
              
              {/* Transfer Arrow */}
              <TransferArrowSection>
                <TransferArrow>⇄</TransferArrow>
              </TransferArrowSection>
              
              {/* Team 2 Assets */}
              <SelectedTeamSection teamName={team2 ? getTeamNameById(team2) : 'Team 2'} assets={selectedTeam2Assets} />
            </SelectedAssetsSection>
          </AssetMovementContainer>
          
          <TradeActionsContainer>
            <ConfirmTradeButton 
              onClick={handleConfirmTrade}
              disabled={!team1 || !team2 || (selectedTeam1Assets.length === 0 && selectedTeam2Assets.length === 0)}
            >
              Confirm Asset Movement
            </ConfirmTradeButton>
          </TradeActionsContainer>
        </>
      )}
    </PageContainer>
  );
};

export default AssetMovement; 