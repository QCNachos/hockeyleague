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

const PlayerEditor = () => {
  // Normalize string for comparison (handle case and whitespace)
  const normalizeString = (str) => {
    if (!str) return '';
    return str.toLowerCase().trim();
  };
  
  // State variables
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [positions, setPositions] = useState([]);
  
  // League-related states
  const [leagueTypes, setLeagueTypes] = useState([]);
  const [leagues, setLeagues] = useState([]);
  
  // Selected filter values
  const [selectedLeagueType, setSelectedLeagueType] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Available options based on current selection
  const [availableLeagueTypes, setAvailableLeagueTypes] = useState([]);
  const [availableLeagues, setAvailableLeagues] = useState([]);
  
  // Sorting state
  const [sortColumn, setSortColumn] = useState('last_name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [playersPerPage] = useState(15);
  
  // New state for league type mapping
  const [leagueTypeMap, setLeagueTypeMap] = useState({});
  
  // Fetch players and teams from Supabase on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First, fetch league data to establish the relationship between leagues and league types
        const { data: leagueData, error: leagueError } = await supabase
          .from('League')
          .select('*')
          .order('league');
          
        if (leagueError) {
          console.error('Error fetching leagues:', leagueError);
          throw new Error(`Failed to fetch leagues: ${leagueError.message}`);
        }
        
        console.log('Leagues fetched from database:', leagueData?.length || 0);
        if (leagueData && leagueData.length > 0) {
          console.log('First few leagues:');
          leagueData.slice(0, 5).forEach(league => {
            console.log(` - League: "${league.league}", Level: "${league.league_level}", ID: ${league.id}`);
          });
        } else {
          console.warn('No leagues found in the database!');
        }
        
        // Create mapping of league names to their types
        const leagueToTypeMap = {};
        if (leagueData && leagueData.length > 0) {
          leagueData.forEach(league => {
            if (league.league && league.league_level) {
              leagueToTypeMap[league.league] = league.league_level;
            } else {
              console.warn(`League record missing data: ID=${league.id}, league=${league.league}, level=${league.league_level}`);
            }
          });
        }
        
        console.log('League to type mapping:', leagueToTypeMap);
        
        // Store the mapping in state so we can use it in the table display
        setLeagueTypeMap(leagueToTypeMap);
        
        // Extract unique league types
        const uniqueLeagueTypes = [...new Set(
          leagueData
            .map(league => league.league_level)
            .filter(Boolean)
        )].sort();
        
        console.log('Unique league types:', uniqueLeagueTypes);
        
        // Make sure all league types are properly normalized
        // This ensures consistent filtering regardless of case/whitespace
        const normalizedLeagueTypes = uniqueLeagueTypes.map(type => ({
          original: type,
          normalized: normalizeString(type)
        }));
        
        console.log('Normalized league types:');
        normalizedLeagueTypes.forEach(({ original, normalized }) => {
          console.log(`- Original: "${original}", Normalized: "${normalized}"`);
        });
        
        setLeagueTypes(uniqueLeagueTypes);
        setAvailableLeagueTypes(uniqueLeagueTypes);
        
        // Fetch teams with relevant league data
        const { data: teamsData, error: teamsError } = await supabase
          .from('Team')
          .select('id, team, abbreviation, league, League(league_level)')
          .order('team');
          
        if (teamsError) {
          throw teamsError;
        }
        
        // Enhance teams with league_type from League relationship
        const enhancedTeams = teamsData.map(team => ({
          ...team,
          league_type: team.League?.league_level || leagueToTypeMap[team.league] || 'Unknown'
        }));
        
        console.log('Enhanced teams with league types:', enhancedTeams);
        setTeams(enhancedTeams);
        
        // Extract unique leagues from teams
        const uniqueLeagues = [...new Set(
          enhancedTeams
            .map(team => team.league)
            .filter(Boolean)
        )].sort();
        
        setLeagues(uniqueLeagues);
        setAvailableLeagues(uniqueLeagues);
        
        // Fetch players data - Update to respect the actual schema
        // First, check the structure of a player record to understand the relationship
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
        
        // Now construct our query based on the database schema
        let query = supabase
          .from('Player')
          .select(`
            *,
            team:Team(id, team, abbreviation, league, League(league_level))
          `);
        
        // We'll apply minimal filters on the server side and do most filtering client-side
        // since we need to handle league_type which is derived from the league
        
        // Only apply direct filters to the query
        if (selectedPosition) {
          query = query.eq('position_primary', selectedPosition);
        }
        
        if (searchQuery) {
          query = query.or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%`);
        }
        
        // Apply sorting
        query = query.order(sortColumn, { ascending: sortDirection === 'asc' });
        
        // Get all the data first to apply client-side filtering
        const { data: allPlayersData, error: allPlayersError } = await query;
        
        if (allPlayersError) {
          throw allPlayersError;
        }
        
        console.log('All players fetched from DB:', allPlayersData?.length || 0);
        
        // Apply client-side filtering for league type, league, and team
        let filteredPlayers = allPlayersData || [];
        
        // Log some sample players to see their structure
        if (filteredPlayers.length > 0) {
          console.log('Sample player before filtering:', filteredPlayers[0]);
          console.log('Player team relationship:', filteredPlayers[0]?.team);
        }
        
        // Apply league type filter
        if (selectedLeagueType) {
          console.log(`Filtering by league type: ${selectedLeagueType}`);
          console.log('League to type mapping available:', Object.keys(leagueToTypeMap));
          
          const normalizedSelectedType = normalizeString(selectedLeagueType);
          console.log(`Normalized selected league type: "${normalizedSelectedType}"`);
          
          // Debug all league types available in the mapping
          console.log('Available league types in mapping:');
          Object.entries(leagueToTypeMap).forEach(([league, type]) => {
            console.log(`- League "${league}" has type "${type}" (normalized: "${normalizeString(type)}")`);
          });
          
          filteredPlayers = filteredPlayers.filter(player => {
            // First check if player has a team
            if (!player || !player.team) {
              return false;
            }
            
            // First try to get league type directly from the League relationship
            let leagueType = null;
            
            if (player.team.League && player.team.League.league_level) {
              // If we have League data directly from the relationship
              leagueType = player.team.League.league_level;
              console.log(`Using direct League relationship for player ${player.id}: ${leagueType}`);
            }
            else if (player.team.league) {
              // Otherwise use our mapping (this is a fallback)
              leagueType = leagueToTypeMap[player.team.league];
              console.log(`Using league mapping for player ${player.id}: league=${player.team.league} -> type=${leagueType}`);
            }
            
            if (!leagueType) {
              console.log(`Player ${player.id} (${player.first_name} ${player.last_name}) has no determinable league type`);
              return false;
            }
            
            const normalizedLeagueType = normalizeString(leagueType);
            const matches = normalizedLeagueType === normalizedSelectedType;
            
            if (Math.random() < 0.1) { // Log ~10% of checks to avoid flooding console
              console.log(`Player ${player.id} (${player.first_name} ${player.last_name}): league="${player.team.league}", leagueType="${leagueType}" (normalized: "${normalizedLeagueType}"), selectedType="${selectedLeagueType}" (normalized: "${normalizedSelectedType}"), matches=${matches}`);
            }
            
            return matches;
          });
          
          console.log(`After league type filter: ${filteredPlayers.length} players`);
        }
        
        // Apply league filter
        if (selectedLeague) {
          console.log(`Filtering by league: ${selectedLeague}`);
          filteredPlayers = filteredPlayers.filter(player => 
            player.team && player.team.league === selectedLeague
          );
          
          console.log(`After league filter: ${filteredPlayers.length} players`);
        }
        
        // Apply team filter
        if (selectedTeam) {
          console.log(`Filtering by team ID: ${selectedTeam}`);
          
          // Check if we have players with this team ID
          const teamMatches = filteredPlayers.filter(player => 
            player.team && player.team.id && player.team.id.toString() === selectedTeam.toString()
          );
          
          console.log(`Found ${teamMatches.length} players with team.id=${selectedTeam}`);
          
          // If we didn't find any matches with the team relation, check direct properties
          if (teamMatches.length === 0) {
            // Look for team references in the raw player record
            for (const field of ['team', 'team_id', 'teamId']) {
              if (filteredPlayers.some(p => p[field] !== undefined)) {
                const directMatches = filteredPlayers.filter(p => 
                  p[field] !== null && p[field].toString() === selectedTeam.toString()
                );
                console.log(`Found ${directMatches.length} players with ${field}=${selectedTeam}`);
                
                if (directMatches.length > 0) {
                  // If we found matches using a direct field, use that instead
                  filteredPlayers = directMatches;
                  console.log(`Using direct field ${field} to match team ID`);
                  break;
                }
              }
            }
          } else {
            // Use the relation-based filtering as originally intended
            filteredPlayers = teamMatches;
          }
          
          console.log(`After team filter: ${filteredPlayers.length} players`);
        }
        
        // Log number of players after all filters
        console.log(`Final filtered players: ${filteredPlayers.length}`);
        
        // Calculate total count for pagination
        const totalCount = filteredPlayers.length;
        
        // Apply pagination to filtered results
        const from = (currentPage - 1) * playersPerPage;
        const to = Math.min(from + playersPerPage, filteredPlayers.length);
        
        // Get the slice for current page
        const playersForCurrentPage = filteredPlayers.slice(from, to);
        
        console.log(`Players for page ${currentPage}: ${playersForCurrentPage.length}`);
        
        // Update state
        setPlayers(playersForCurrentPage);
        setTotalPages(Math.max(1, Math.ceil(totalCount / playersPerPage)));
        
        // Extract unique positions for filtering
        const uniquePositions = [...new Set(
          playersForCurrentPage
            .map(player => player.position_primary)
            .filter(Boolean)
        )];
        
        setPositions(uniquePositions);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedLeagueType, selectedLeague, selectedTeam, selectedPosition, searchQuery, sortColumn, sortDirection, currentPage, playersPerPage]);
  
  // Handler for sorting
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to ascending for a new column
      setSortColumn(column);
      setSortDirection('asc');
    }
    
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };
  
  // Format player salary to display as millions
  const formatSalary = (salary) => {
    if (!salary) return 'N/A';
    return `$${(salary / 1000000).toFixed(1)}M`;
  };
  
  // Handler for league type selection change
  const handleLeagueTypeChange = (e) => {
    const value = e.target.value;
    console.log(`League type selected: "${value}"`);
    
    // Log all league types in the teams data
    console.log('League types in teams data:');
    const leagueTypesByTeam = {};
    teams.forEach(team => {
      if (team.league_type) {
        if (!leagueTypesByTeam[team.league_type]) {
          leagueTypesByTeam[team.league_type] = [];
        }
        leagueTypesByTeam[team.league_type].push(`${team.team} (${team.abbreviation})`);
      }
    });
    
    Object.entries(leagueTypesByTeam).forEach(([type, teamsList]) => {
      console.log(`- "${type}" (${teamsList.length} teams): ${teamsList.slice(0, 3).join(', ')}${teamsList.length > 3 ? '...' : ''}`);
    });
    
    // Log out available teams for this league type
    if (value) {
      const matchingTeams = teams.filter(team => 
        normalizeString(team.league_type) === normalizeString(value)
      );
      
      console.log(`Found ${matchingTeams.length} teams with league type "${value}":`);
      matchingTeams.slice(0, 10).forEach(team => {
        console.log(` - ${team.team} (${team.abbreviation}): league="${team.league}", league_type="${team.league_type}"`);
      });
      
      if (matchingTeams.length === 0) {
        console.warn(`No teams found with league type "${value}" - this may indicate a data issue`);
      }
    }
    
    // Set the selected league type
    setSelectedLeagueType(value);
    
    // Reset subsequent filters
    setSelectedLeague('');
    setSelectedTeam('');
    
    // Reset to first page
    setCurrentPage(1);
    
    // Filter available leagues based on selected league type
    if (value) {
      const normalizedValue = normalizeString(value);
      console.log(`Filtering leagues by normalized league type: "${normalizedValue}"`);
      
      const filteredLeagues = [...new Set(
        teams
          .filter(team => {
            const normalizedTeamType = normalizeString(team.league_type);
            const matches = normalizedTeamType === normalizedValue;
            if (Math.random() < 0.1) { // Log some examples
              console.log(`Team: ${team.team}, league_type: "${team.league_type}" (normalized: "${normalizedTeamType}"), matches: ${matches}`);
            }
            return matches;
          })
          .map(team => team.league)
          .filter(Boolean)
      )].sort();
      
      console.log(`Found ${filteredLeagues.length} leagues for league type "${value}":`, filteredLeagues);
      
      if (filteredLeagues.length === 0) {
        console.warn(`No leagues found for league type "${value}" (normalized: "${normalizedValue}"). This could indicate a data issue.`);
      }
      
      setAvailableLeagues(filteredLeagues);
    } else {
      // If no league type selected, show all leagues
      const allLeagues = [...new Set(
        teams
          .map(team => team.league)
          .filter(Boolean)
      )].sort();
      
      setAvailableLeagues(allLeagues);
    }
  };
  
  // Handler for league selection change
  const handleLeagueChange = (e) => {
    const value = e.target.value;
    console.log('League selected:', value);
    
    // Set the selected league
    setSelectedLeague(value);
    
    // Reset team selection
    setSelectedTeam('');
    
    // Reset to first page
    setCurrentPage(1);
  };
  
  return (
    <Container>
      <Title>Player Management</Title>
      
      <FiltersContainer>
        <FilterGroup>
          <FilterLabel>Search Players</FilterLabel>
          <FilterInput 
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on new search
            }}
          />
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>League Type</FilterLabel>
          <FilterSelect 
            value={selectedLeagueType}
            onChange={handleLeagueTypeChange}
          >
            <option value="">All League Types</option>
            {availableLeagueTypes.map(leagueType => {
              // Count teams in this league type
              const count = teams.filter(team => 
                normalizeString(team.league_type) === normalizeString(leagueType)
              ).length;
              
              return (
                <option key={leagueType} value={leagueType}>
                  {leagueType} ({count} teams)
                </option>
              );
            })}
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>League</FilterLabel>
          <FilterSelect 
            value={selectedLeague}
            onChange={handleLeagueChange}
            disabled={availableLeagues.length === 0}
          >
            <option value="">All Leagues</option>
            {availableLeagues.map(league => (
              <option key={league} value={league}>
                {league}
              </option>
            ))}
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Team</FilterLabel>
          <FilterSelect 
            value={selectedTeam}
            onChange={(e) => {
              const value = e.target.value;
              console.log(`Team selected: ID=${value}`);
              
              // Find the team in our data
              const team = teams.find(t => t.id.toString() === value.toString());
              if (team) {
                console.log(`Found team: ${team.team} (${team.abbreviation}), ID=${team.id}, type=${typeof team.id}`);
              } else {
                console.log(`Couldn't find team with ID=${value} in teams array`);
              }
              
              setSelectedTeam(value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            <option value="">All Teams</option>
            {teams
              .filter(team => 
                (!selectedLeagueType || normalizeString(team.league_type) === normalizeString(selectedLeagueType)) &&
                (!selectedLeague || team.league === selectedLeague)
              )
              .map(team => {
                // Log team details once to help with debugging
                if (!window.teamsLogged) {
                  window.teamsLogged = {};
                }
                if (!window.teamsLogged[team.id]) {
                  console.log(`Team option: ${team.team} (${team.abbreviation}), ID=${team.id}, type=${typeof team.id}, league_type="${team.league_type}"`);
                  window.teamsLogged[team.id] = true;
                }
                
                return (
                  <option key={team.id} value={team.id}>
                    {team.team} ({team.abbreviation})
                  </option>
                );
              })}
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Position</FilterLabel>
          <FilterSelect 
            value={selectedPosition}
            onChange={(e) => {
              setSelectedPosition(e.target.value);
              setCurrentPage(1); // Reset to first page on filter change
            }}
          >
            <option value="">All Positions</option>
            {['C', 'LW', 'RW', 'D', 'G'].map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </FilterSelect>
        </FilterGroup>
      </FiltersContainer>
      
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : players.length === 0 ? (
        <ErrorMessage>No players found matching your criteria.</ErrorMessage>
      ) : (
        <>
          <PlayersTable>
            <thead>
              <tr>
                <TableHeader 
                  onClick={() => handleSort('last_name')}
                  sorted={sortColumn === 'last_name' ? sortDirection : null}
                >
                  Name
                </TableHeader>
                <TableHeader 
                  onClick={() => handleSort('position_primary')}
                  sorted={sortColumn === 'position_primary' ? sortDirection : null}
                >
                  Position
                </TableHeader>
                <TableHeader 
                  onClick={() => handleSort('age')}
                  sorted={sortColumn === 'age' ? sortDirection : null}
                >
                  Age
                </TableHeader>
                <TableHeader 
                  onClick={() => handleSort('height')}
                  sorted={sortColumn === 'height' ? sortDirection : null}
                >
                  Height
                </TableHeader>
                <TableHeader 
                  onClick={() => handleSort('weight')}
                  sorted={sortColumn === 'weight' ? sortDirection : null}
                >
                  Weight
                </TableHeader>
                <TableHeader 
                  onClick={() => handleSort('overall')}
                  sorted={sortColumn === 'overall' ? sortDirection : null}
                >
                  OVR
                </TableHeader>
                <TableHeader 
                  onClick={() => handleSort('salary')}
                  sorted={sortColumn === 'salary' ? sortDirection : null}
                >
                  Salary
                </TableHeader>
                <TableHeader>
                  League
                </TableHeader>
                <TableHeader>
                  League Type
                </TableHeader>
                <TableHeader 
                  onClick={() => handleSort('team')}
                  sorted={sortColumn === 'team' ? sortDirection : null}
                >
                  Team
                </TableHeader>
              </tr>
            </thead>
            <tbody>
              {players.map(player => (
                <TableRow key={player.id}>
                  <TableCell>{player.first_name} {player.last_name}</TableCell>
                  <TableCell>{player.position_primary || 'N/A'}</TableCell>
                  <TableCell>{player.age || 'N/A'}</TableCell>
                  <TableCell>{player.height || 'N/A'}</TableCell>
                  <TableCell>{player.weight || 'N/A'}</TableCell>
                  <TableCell>{player.overall || 'N/A'}</TableCell>
                  <TableCell>{formatSalary(player.salary)}</TableCell>
                  <TableCell>{player.team?.league || 'N/A'}</TableCell>
                  <TableCell>{leagueTypeMap?.[player.team?.league] || 'N/A'}</TableCell>
                  <TableCell>{player.team ? player.team.abbreviation : 'N/A'}</TableCell>
                </TableRow>
              ))}
            </tbody>
          </PlayersTable>
          
          <PaginationContainer>
            <PageInfo>
              Page {currentPage} of {totalPages} 
              ({(currentPage - 1) * playersPerPage + 1}-
              {Math.min(currentPage * playersPerPage, players.length + (currentPage - 1) * playersPerPage)} players)
            </PageInfo>
            <PageButtons>
              <PageButton 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1}
              >
                First
              </PageButton>
              <PageButton 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
              >
                Previous
              </PageButton>
              <PageButton 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
              >
                Next
              </PageButton>
              <PageButton 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages}
              >
                Last
              </PageButton>
            </PageButtons>
          </PaginationContainer>
        </>
      )}
    </Container>
  );
};

export default PlayerEditor;
