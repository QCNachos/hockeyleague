import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check for environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase credentials. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are defined in your .env file.'
  );
} else {
  console.log('Supabase URL configured for TeamManager');
}

const supabase = createClient(
  supabaseUrl || 'https://your-supabase-url.supabase.co',
  supabaseKey || 'your-supabase-anon-key'
);

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

// New styled components for filter system
const FilterContainer = styled.div`
  margin-bottom: 30px;
  max-width: 1200px;
  display: flex;
  flex-wrap: nowrap;
  gap: 15px;
  align-items: flex-end;
  
  @media (max-width: 1200px) {
    flex-wrap: wrap;
  }
`;

const FilterStep = styled.div`
  flex: 1;
  min-width: 180px;
  max-width: 250px;
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
  padding: 12px 15px;
  border-radius: 4px;
  background-color: #1e1e1e;
  border: 1px solid #444;
  color: #fff;
  font-size: 16px;
  appearance: none;
  position: relative;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
  
  option {
    background-color: #1e1e1e;
  }
`;

const FilterSummary = styled.div`
  background-color: #1e1e1e;
  border-radius: 4px;
  padding: 12px 15px;
  margin-top: 15px;
  color: #C4CED4;
  font-size: 14px;
  width: 100%;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const TeamCard = styled.div`
  background-color: ${props => props.primaryColor || '#1e1e1e'};
  color: ${props => props.textColor || 'white'};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 360px;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.2);
`;

const TeamLogo = styled.div`
  width: 50px;
  height: 50px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-weight: bold;
  color: ${props => props.primaryColor || '#1e1e1e'};
`;

const TeamInfo = styled.div`
  flex: 1;
`;

const TeamName = styled.h3`
  margin: 0;
  font-size: 18px;
`;

const TeamCity = styled.p`
  margin: 5px 0 0;
  opacity: 0.8;
  font-size: 14px;
`;

const TeamDetails = styled.div`
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.1);
`;

const TeamDetail = styled.p`
  margin: 8px 0;
  display: flex;
  justify-content: space-between;
  
  span:first-child {
    opacity: 0.7;
  }
`;

const TabContainer = styled.div`
  margin-bottom: 30px;
`;

const TabButtons = styled.div`
  display: flex;
  border-bottom: 1px solid #333;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.active ? '#B30E16' : 'transparent'};
  color: white;
  border: none;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    background-color: ${props => props.active ? '#B30E16' : '#333'};
  }
`;

const NewTeamForm = styled.form`
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const ColorPreview = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-left: 10px;
  border: 1px solid #333;
`;

const ColorInputContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SubmitButton = styled.button`
  padding: 12px 20px;
  background-color: #B30E16;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background-color: #950b12;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

// Add TeamActions for buttons
const TeamActions = styled.div`
  padding: 15px;
  margin-top: auto;
  display: flex;
  gap: 10px;
  background-color: rgba(0, 0, 0, 0.2);
`;

const TeamButton = styled.button`
  padding: 8px 12px;
  background-color: #B30E16;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
  
  &:hover {
    background-color: #950b12;
  }
`;

const TeamManager = () => {
  const [activeTab, setActiveTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [initMessage, setInitMessage] = useState(null);
  const [supabaseError, setSupabaseError] = useState(null);
  
  // New filter state
  // eslint-disable-next-line no-unused-vars
  const [leagueTypes, setLeagueTypes] = useState([]);
  // Use these state variables for historical reference but disable eslint warning
  // eslint-disable-next-line no-unused-vars
  const [leagues, setLeagues] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [conferences, setConferences] = useState([]);
  
  // Selected filter values
  const [selectedLeagueType, setSelectedLeagueType] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedConference, setSelectedConference] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  
  // Available options based on current selection
  const [availableLeagues, setAvailableLeagues] = useState([]);
  const [availableConferences, setAvailableConferences] = useState([]);
  const [availableDivisions, setAvailableDivisions] = useState([]);
  
  // New state variable for availableLeagueTypes
  const [availableLeagueTypes, setAvailableLeagueTypes] = useState([]);
  
  const [newTeam, setNewTeam] = useState({
    name: '',
    city: '',
    abbreviation: '',
    primary_color: '#000000',
    secondary_color: '#FFFFFF',
    division_id: '',
    arena_name: '',
    arena_capacity: 18000,
    prestige: 50
  });
  
  const { isAuthenticated, getAuthHeaders } = useAuth();
  
  // Fetch leagues and league types from Supabase
  const fetchLeaguesFromSupabase = async () => {
    try {
      console.log('Attempting to fetch leagues from Supabase...');
      
      const { data, error } = await supabase
        .from('League')
        .select('*')
        .order('league');
        
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Supabase League data found:', data);
      
      if (data && data.length > 0) {
        // Check the structure of the league data
        console.log('Sample league data item:', data[0]);
        
        // Create a mapping of league names to their league_levels
        const leagueToTypeMap = {};
        data.forEach(league => {
          const leagueName = league.abbreviation || league.league;
          const leagueLevel = league.league_level;
          
          if (leagueName && leagueLevel) {
            leagueToTypeMap[leagueName] = leagueLevel;
          }
        });
        
        console.log('League to Type mapping:', leagueToTypeMap);
        
        // Extract unique league types (ensuring only strings)
        const uniqueLeagueTypes = [...new Set(
          data
            .map(league => String(league.league_level || ''))
            .filter(Boolean)
        )];
        
        console.log('Unique league types:', uniqueLeagueTypes);
        setLeagueTypes(uniqueLeagueTypes);
        
        // Store the league data objects for reference
        setLeagues(data);
        
        // Extract league names/abbreviations for the dropdown (ensuring only strings)
        const leagueNames = [...new Set(
          data
            .map(league => String(league.abbreviation || league.league || ''))
            .filter(Boolean)
        )];
        console.log('Extracted league names:', leagueNames);
        
        // Set available leagues to strings only
        setAvailableLeagues(leagueNames);
        
        return { leagues: data, leagueToTypeMap };
      } else {
        console.log('No League data found in Supabase');
        setSupabaseError('No leagues found. Using mock data.');
        return { leagues: null, leagueToTypeMap: {} };
      }
    } catch (error) {
      console.error('Error fetching leagues from Supabase:', error);
      setSupabaseError(`Supabase connection failed: ${error.message}`);
      return { leagues: null, leagueToTypeMap: {} };
    }
  };
  
  // Fetch teams from Supabase
  const fetchTeamsFromSupabase = async (leagueToTypeMap = {}) => {
    try {
      console.log('Attempting to fetch teams from Supabase...');
      
      // First fetch conferences to map IDs to names
      const { data: conferencesData, error: conferencesError } = await supabase
        .from('Conference')
        .select('*');
        
      if (conferencesError) {
        console.error('Error fetching conferences:', conferencesError);
        throw conferencesError;
      }
      
      console.log('Conferences from Supabase:', conferencesData);
      console.log('Supabase URL & Key check:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey
      });
      
      // Create a mapping of conference IDs to names
      const conferenceMap = {};
      if (conferencesData) {
        conferencesData.forEach(conf => {
          conferenceMap[conf.id] = conf.conference;
        });
      }
      console.log('Conference mapping:', conferenceMap);
      
      // Fetch divisions to get the conference relationship
      const { data: divisionsData, error: divisionsError } = await supabase
        .from('Division')
        .select('*');
        
      if (divisionsError) {
        console.error('Error fetching divisions:', divisionsError);
        throw divisionsError;
      }
      
      console.log('Divisions from Supabase:', divisionsData);
      
      // Create a mapping of division IDs to conference names
      const divisionToConferenceMap = {};
      if (divisionsData) {
        divisionsData.forEach(division => {
          // Map division ID to conference name using the conferenceMap
          divisionToConferenceMap[division.id] = {
            conferenceId: division.conference,
            conferenceName: conferenceMap[division.conference] || 'Unknown',
            divisionName: division.division || `Division ${division.id}`,
            league: division.league,
            league_type: division.league_level
          };
        });
      }
      console.log('Division to Conference mapping:', divisionToConferenceMap);
      
      // Now fetch teams
      console.log('Attempting to fetch team data directly...');
      const { data, error } = await supabase
        .from('Team')
        .select('*')
        .order('team');
        
      if (error) {
        console.error('Supabase Team fetch error details:', error);
        throw error;
      }
      
      console.log('Supabase Team data found, count:', data?.length);
      
      if (data && data.length > 0) {
        // Log a few sample teams for debugging
        console.log('Sample team data (first 3):');
        data.slice(0, Math.min(3, data.length)).forEach((team, idx) => {
          const divisionInfo = divisionToConferenceMap[team.division] || {};
          console.log(`Team ${idx + 1}:`, {
            id: team.id,
            name: team.team,
            division: team.division,
            divisionName: divisionInfo.divisionName,
            conferenceId: team.conference || divisionInfo.conferenceId, 
            conferenceName: conferenceMap[team.conference] || divisionInfo.conferenceName,
            league: team.league,
            league_type: leagueToTypeMap[team.league] || divisionInfo.league_type || 'Professional'
          });
        });
        
        // Process teams with division and conference data
        const processedTeams = data.map(team => {
          // Get division and conference info from our mapping
          const divisionInfo = divisionToConferenceMap[team.division] || {};
          
          // Check if team has a direct conference reference (new schema) or use division's (old schema)
          const conferenceId = team.conference || divisionInfo.conferenceId;
          const conferenceName = conferenceId ? conferenceMap[conferenceId] || 'Unknown' : divisionInfo.conferenceName || 'Unknown';
          
          // Get the league abbreviation or name
          const leagueName = team.league || divisionInfo.league || 'NHL';
          
          // Get the league type from our mapping or use a default
          const leagueType = leagueToTypeMap[leagueName] || divisionInfo.league_type || 'Professional';
          
          return {
            id: team.id,
            name: team.team || 'Unknown',
            city: team.location || 'Unknown',
          abbreviation: team.abbreviation || '???',
          primary_color: team.primary_color || '#1e1e1e',
          secondary_color: team.secondary_color || '#FFFFFF',
            arena_name: team.arena || 'Unknown Arena',
            arena_capacity: team.capacity || 0,
            prestige: team.prestige || 50,
            division_id: team.division,
            divisionName: divisionInfo.divisionName || 'Unknown Division',
            // Store both for flexibility
            conferenceId: conferenceId,
            conference: conferenceName,
            // Use explicit league type from mapping
            league_type: leagueType,
            league: leagueName,
            salary_cap: team.salary_cap || 82500000
          };
        });
        
        console.log('Processed teams count:', processedTeams.length);
        
        // Ensure divisions have proper names
        const enhancedDivisions = divisionsData.map(division => ({
          id: division.id,
          name: division.division || `Division ${division.id}`,
          conferenceId: division.conference,
          conference: conferenceMap[division.conference] || 'Unknown',
          league: division.league || 'NHL',
          league_type: division.league_level || 'Professional'
        }));
        
        console.log('Enhanced divisions:', enhancedDivisions);
        
        // Set divisions state
        setDivisions(enhancedDivisions);
        
        // Initially set all divisions as available
        setAvailableDivisions(enhancedDivisions);
        
        // Set teams state
        setTeams(processedTeams);
        
        // Extract unique conferences as strings from processed teams
        const uniqueConferences = [...new Set(
          processedTeams
            .map(team => team.conference)
            .filter(Boolean)
        )].map(String);
        
        console.log('Unique conferences extracted:', uniqueConferences);
        setConferences(uniqueConferences);
        setAvailableConferences(uniqueConferences);
        
        // Extract unique leagues as strings from processed teams
        const uniqueLeagues = [...new Set(
          processedTeams
            .map(team => team.league)
            .filter(Boolean)
        )].map(String);
        
        setAvailableLeagues(uniqueLeagues);
        
        return processedTeams;
      } else {
        console.log('No Team data found in Supabase, data:', data);
        setSupabaseError("No teams found in database. Please check your Supabase connection and data.");
        return [];
      }
    } catch (error) {
      console.error('Error fetching teams from Supabase:', error);
      setSupabaseError(`Supabase team query failed: ${error.message}`);
      return [];
    }
  };
  
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setSupabaseError(null);
      
      try {
        console.log('Starting fetchAllData process...');
        console.log('Supabase connection config:', {
          url: supabaseUrl ? 'URL is set' : 'URL is missing',
          key: supabaseKey ? 'API key is set' : 'API key is missing'
        });
        
        // First fetch leagues from Supabase
        const { leagues: leagueData, leagueToTypeMap } = await fetchLeaguesFromSupabase();
        
        // Log league data for debugging
        console.log('Leagues data from Supabase:', leagueData);
        console.log('League to Type mapping for teams:', leagueToTypeMap);
        
        // Then fetch teams (which now also includes divisions and conferences)
        const teamsData = await fetchTeamsFromSupabase(leagueToTypeMap);
        
        if (teamsData.length === 0) {
          console.warn('No teams were returned from Supabase. Check your database connection and data.');
          setSupabaseError('No teams found in the database. Please check your Supabase connection or add teams to your database.');
        } else {
          console.log('Successfully loaded teams data from Supabase, count:', teamsData.length);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setSupabaseError(`Failed to load data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
    // Include fetchTeamsFromSupabase in the dependency array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Extract unique league types on component mount or when the teams array changes
  useEffect(() => {
    if (teams.length) {
      const uniqueLeagueTypes = [...new Set(
        teams
          .map(team => team.league_type)
          .filter(Boolean)
      )].sort();
      
      console.log('Unique league types from teams:', uniqueLeagueTypes);
      setLeagueTypes(uniqueLeagueTypes);
      setAvailableLeagueTypes(uniqueLeagueTypes);
    }
  }, [teams]);
  
  const handleNewTeamChange = (e) => {
    const { name, value } = e.target;
    setNewTeam(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNewTeamSubmit = (e) => {
    e.preventDefault();
    
    // Use the real API
    axios.post('/api/teams', newTeam, {
      headers: getAuthHeaders()
    })
      .then(response => {
        // Add the new team to the state
        setTeams([...teams, response.data]);
        
        // Reset form
        setNewTeam({
          name: '',
          city: '',
          abbreviation: '',
          primary_color: '#000000',
          secondary_color: '#FFFFFF',
          division_id: '',
          arena_name: '',
          arena_capacity: 18000,
          prestige: 50
        });
        
        // Switch to teams tab
        setActiveTab('teams');
      })
      .catch(error => {
        console.error('Error creating team:', error);
        alert('Failed to create team. Please try again.');
      });
  };
  
  const initializeNHLTeams = () => {
    setInitializing(true);
    setInitMessage(null);
    
    axios.post('/api/init/nhl-data', {}, {
      headers: getAuthHeaders()
    })
      .then(response => {
        setInitMessage({
          type: 'success',
          text: `Successfully initialized ${response.data.data.teams} NHL teams!`
        });
        
        // Refresh the teams list
        return axios.get('/api/teams');
      })
      .then(response => {
        // Ensure all team objects have required properties
        const processedTeams = response.data.map(team => ({
          ...team,
          name: team.name || 'Unknown Team',
          city: team.city || 'Unknown City',
          abbreviation: team.abbreviation || '???',
          primary_color: team.primary_color || '#1e1e1e',
          secondary_color: team.secondary_color || '#FFFFFF',
          arena_name: team.arena_name || 'Unknown Arena',
          arena_capacity: team.arena_capacity || 0,
          prestige: team.prestige || 50,
          league_type: team.league_type || 'Professional',
          league: team.league || 'NHL',
          conference: team.conference || (team.division_id <= 2 ? 'Eastern' : 'Western')
        }));
        
        // Sort teams alphabetically by name
        setTeams(processedTeams.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(error => {
        console.error('Error initializing NHL teams:', error);
        setInitMessage({
          type: 'error',
          text: 'Failed to initialize NHL teams. Please try again.'
        });
      })
      .finally(() => {
        setInitializing(false);
      });
  };
  
  // Determine text color based on background for contrast
  const getTextColor = (bgColor) => {
    // Default to a dark color if bgColor is undefined or null
    if (!bgColor) {
      return '#FFFFFF'; // Default to white text
    }
    
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return black or white text based on brightness
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };
  
  // Handle league type selection change
  const handleLeagueTypeChange = (e) => {
    const value = e && e.target ? e.target.value : e;
    console.log('League type selected:', value);
    
    // Set the selected league type
    setSelectedLeagueType(value);
    
    // Reset subsequent filters
    setSelectedLeague('');
    setSelectedConference('');
    setSelectedDivision('');
    
    // Filter available leagues based on the selected league type
    if (value) {
      const filteredLeagues = [...new Set(
        teams
          .filter(team => team.league_type === value)
          .map(team => team.league)
          .filter(Boolean)
      )].sort();
      
      console.log('Filtered leagues by league type:', filteredLeagues);
      setAvailableLeagues(filteredLeagues);
    } else {
      // If no league type is selected, show all leagues
      const allLeagues = [...new Set(
        teams
          .map(team => team.league)
          .filter(Boolean)
      )].sort();
      
      setAvailableLeagues(allLeagues);
    }
    
    // Reset available conferences and divisions
    setAvailableConferences([]);
    setAvailableDivisions([]);
  };
  
  // Handle league selection change
  const handleLeagueChange = (e) => {
    const value = e && e.target ? e.target.value : e;
    console.log('League selected:', value);
    
    // Set the selected league
    setSelectedLeague(value);
    
    // Reset subsequent filters
    setSelectedConference('');
    setSelectedDivision('');
    
    // Filter available conferences based on the selected league type and league
    if (value) {
      const filteredConferences = [...new Set(
        teams
          .filter(team => 
            (!selectedLeagueType || team.league_type === selectedLeagueType) &&
            team.league === value
          )
          .map(team => team.conference)
          .filter(Boolean)
      )].sort();
      
      console.log('Filtered conferences by league:', filteredConferences);
      setAvailableConferences(filteredConferences);
    } else {
      // If no league is selected, show all conferences for the selected league type
      const filteredConferences = [...new Set(
        teams
          .filter(team => !selectedLeagueType || team.league_type === selectedLeagueType)
          .map(team => team.conference)
          .filter(Boolean)
      )].sort();
      
      setAvailableConferences(filteredConferences);
    }
    
    // Reset available divisions
    setAvailableDivisions([]);
  };
  
  // Handle conference change
  const handleConferenceChange = (e) => {
    let conferenceName;
    
    // Handle both cases: when e is the event (e.target.value) or the direct value
    if (e && e.target && e.target.value !== undefined) {
      conferenceName = e.target.value;
    } else {
      conferenceName = e; // Direct value passed
    }
    
    setSelectedConference(conferenceName);
    setSelectedDivision("");  // Reset division when conference changes
    
    // Update available divisions based on conference selection
    if (conferenceName) {
      // Find divisions that belong to this conference
      const filteredDivisions = divisions.filter(division => 
        division.conference === conferenceName
      );
      
      setAvailableDivisions(filteredDivisions);
    } else {
      // If no conference selected, show all divisions
      setAvailableDivisions([...divisions]);
    }
  };
  
  // Handle division change
  const handleDivisionChange = (e) => {
    const divisionId = e.target.value;
    setSelectedDivision(divisionId);
  };
  
  // Get filtered teams based on selected filters
  const getFilteredTeams = useCallback(() => {
    return teams.filter(team => {
      // Filter by league type if selected
      if (selectedLeagueType && team.league_type !== selectedLeagueType) {
        return false;
      }
      
      // Filter by league if selected
      if (selectedLeague && team.league !== selectedLeague) {
        return false;
      }
      
      // Filter by conference if selected
      if (selectedConference && team.conference !== selectedConference) {
        return false;
      }
      
      // Filter by division if selected
      if (selectedDivision && team.division_id !== selectedDivision) {
        return false;
      }
      
      // Include this team in the filtered results
      return true;
    });
  }, [teams, selectedLeagueType, selectedLeague, selectedConference, selectedDivision]);
  
  // Add function to handle navigation to Line Combinations
  const handleEditLines = async (teamId) => {
    try {
      // Get the full team data including league information
      const { data: team, error: teamError } = await supabase
        .from('Team')
        .select(`
          *,
          League!inner (
            league_level
          )
        `)
        .eq('id', teamId)
        .single();
        
      if (teamError) throw teamError;
      
      if (!team) {
        console.error('Team not found:', teamId);
        return;
      }
      
      // Navigate to line combinations with team info - use the correct URL format
      window.location.href = `/line-combinations/${team.league}/${teamId}`;
      
    } catch (error) {
      console.error('Error handling edit lines:', error);
    }
  };

  // Add function to handle navigation to Player Editor
  const handleEditPlayers = async (teamId) => {
    try {
      console.log(`[DEBUG] handleEditPlayers called with teamId: ${teamId}`);
      
      // Get the team data with league relationship info
      const { data: team, error: teamError } = await supabase
        .from('Team')
        .select('*, League:league(league_level)')
        .eq('id', teamId)
        .single();
        
      if (teamError) {
        console.error('[DEBUG] Error fetching team data:', teamError);
        throw teamError;
      }
      
      if (!team || !team.abbreviation) {
        console.error('[DEBUG] Team or team abbreviation not found');
        throw new Error('Team not found');
      }
      
      // Verify we have the league information
      if (!team.League || !team.League.league_level) {
        console.error(`[DEBUG] League information missing for team ${team.team} (${team.abbreviation})`);
        console.log('[DEBUG] Available team data:', team);
        // Still continue with just the team
      } else {
        console.log(`[DEBUG] Team ${team.team} (${team.abbreviation}) has league ${team.league} at level ${team.League.league_level}`);
      }
      
      // Just pass team abbreviation to PlayerEditor
      console.log(`[DEBUG] Navigating to PlayerEditor with team abbreviation: ${team.abbreviation}`);
      window.location.href = `/players?teamId=${team.abbreviation}`;
    } catch (error) {
      console.error('[DEBUG] Error in handleEditPlayers:', error);
      alert(`Error loading players: ${error.message}`);
    }
  };

  // Add function to handle navigation to Team Editor
  const handleEditTeam = async (teamId) => {
    try {
      console.log(`[DEBUG] handleEditTeam called with teamId: ${teamId}`);
      
      // Get the team data
      const { data: team, error: teamError } = await supabase
        .from('Team')
        .select('*')
        .eq('id', teamId)
        .single();
        
      if (teamError) {
        console.error('[DEBUG] Error fetching team data:', teamError);
        throw teamError;
      }
      
      if (!team) {
        console.error('[DEBUG] Team not found');
        throw new Error('Team not found');
      }
      
      // Navigate to team editor page with team ID
      console.log(`[DEBUG] Navigating to TeamEditor with team ID: ${teamId}`);
      window.location.href = `/team-editor/${teamId}`;
    } catch (error) {
      console.error('[DEBUG] Error in handleEditTeam:', error);
      alert(`Error loading team editor: ${error.message}`);
    }
  };
  
  return (
    <Container>
      <Title>Team Management</Title>
      
      {isAuthenticated() && (
        <div style={{ marginBottom: '20px' }}>
          <SubmitButton 
            onClick={initializeNHLTeams} 
            disabled={initializing}
            style={{ marginRight: '15px' }}
          >
            {initializing ? 'Initializing...' : 'Initialize NHL Teams'}
          </SubmitButton>
          
          {initMessage && (
            <span style={{ 
              color: initMessage.type === 'success' ? '#4CAF50' : '#F44336',
              marginLeft: '10px'
            }}>
              {initMessage.text}
            </span>
          )}
          
          {supabaseError && (
            <span style={{ 
              color: '#F44336',
              marginLeft: '10px'
            }}>
              {supabaseError}
            </span>
          )}
        </div>
      )}
      
      <TabContainer>
        <TabButtons>
          <TabButton 
            active={activeTab === 'teams'} 
            onClick={() => setActiveTab('teams')}
          >
            Current Teams
          </TabButton>
          {isAuthenticated() && (
            <TabButton 
              active={activeTab === 'create'} 
              onClick={() => setActiveTab('create')}
            >
              Create New Team
            </TabButton>
          )}
        </TabButtons>
        
        {activeTab === 'create' && isAuthenticated() && (
          <NewTeamForm onSubmit={handleNewTeamSubmit}>
            <h2>Create New Team</h2>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="name">Team Name</Label>
                <Input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={newTeam.name}
                  onChange={handleNewTeamChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="city">City</Label>
                <Input 
                  type="text" 
                  id="city" 
                  name="city"
                  value={newTeam.city}
                  onChange={handleNewTeamChange}
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="abbreviation">Abbreviation (3 letters)</Label>
                <Input 
                  type="text" 
                  id="abbreviation" 
                  name="abbreviation"
                  value={newTeam.abbreviation}
                  onChange={handleNewTeamChange}
                  maxLength={3}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="division_id">Division</Label>
                <Select 
                  id="division_id" 
                  name="division_id"
                  value={newTeam.division_id}
                  onChange={handleNewTeamChange}
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map(division => (
                    <option key={division.id} value={division.id}>
                      {division.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="primary_color">Primary Color</Label>
                <ColorInputContainer>
                  <Input 
                    type="color" 
                    id="primary_color" 
                    name="primary_color"
                    value={newTeam.primary_color}
                    onChange={handleNewTeamChange}
                  />
                  <ColorPreview color={newTeam.primary_color} />
                </ColorInputContainer>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <ColorInputContainer>
                  <Input 
                    type="color" 
                    id="secondary_color" 
                    name="secondary_color"
                    value={newTeam.secondary_color}
                    onChange={handleNewTeamChange}
                  />
                  <ColorPreview color={newTeam.secondary_color} />
                </ColorInputContainer>
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="arena_name">Arena Name</Label>
                <Input 
                  type="text" 
                  id="arena_name" 
                  name="arena_name"
                  value={newTeam.arena_name}
                  onChange={handleNewTeamChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="arena_capacity">Arena Capacity</Label>
                <Input 
                  type="number" 
                  id="arena_capacity" 
                  name="arena_capacity"
                  value={newTeam.arena_capacity}
                  onChange={handleNewTeamChange}
                  min={1000}
                  max={25000}
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormGroup>
              <Label htmlFor="prestige">Team Prestige (1-100)</Label>
              <Input 
                type="range" 
                id="prestige" 
                name="prestige"
                value={newTeam.prestige}
                onChange={handleNewTeamChange}
                min={1}
                max={100}
                required
              />
              <div className="text-center">{newTeam.prestige}</div>
            </FormGroup>
            
            <SubmitButton type="submit">Create Team</SubmitButton>
          </NewTeamForm>
        )}
      </TabContainer>
      
      {activeTab === 'teams' && (
        <>
          <p>Below are the teams in the league. Click on a team to view details and manage roster.</p>
          
          {/* Filter bar */}
          <FilterContainer>
            {/* Filter Step 1: League Type */}
            <FilterStep>
              <FilterLabel>League Type:</FilterLabel>
              <FilterSelect
                value={selectedLeagueType || ""}
                onChange={handleLeagueTypeChange}
              >
                <option value="">All League Types</option>
                {availableLeagueTypes.map((leagueType) => (
                  <option key={leagueType} value={leagueType}>
                    {leagueType}
                  </option>
                ))}
              </FilterSelect>
            </FilterStep>

            {/* Filter Step 2: League */}
            <FilterStep>
              <FilterLabel>League:</FilterLabel>
              <FilterSelect
                value={selectedLeague || ""}
                onChange={handleLeagueChange}
                disabled={availableLeagues.length === 0}
              >
                <option value="">All Leagues</option>
                {availableLeagues.map((league) => (
                  <option key={league} value={league}>
                    {league}
                  </option>
                ))}
              </FilterSelect>
            </FilterStep>

            {/* Filter Step 3: Conference */}
            <FilterStep>
              <FilterLabel>Conference:</FilterLabel>
              <FilterSelect
                value={selectedConference || ""}
                onChange={handleConferenceChange}
              >
                <option value="">All Conferences</option>
                {availableConferences.map((conference) => (
                  <option key={conference} value={conference}>
                    {conference}
                  </option>
                ))}
              </FilterSelect>
            </FilterStep>

            {/* Filter Step 4: Division */}
            <FilterStep>
              <FilterLabel>Division:</FilterLabel>
              <FilterSelect
                value={selectedDivision || ""}
                onChange={handleDivisionChange}
                disabled={availableDivisions.length === 0}
              >
                <option value="">All Divisions</option>
                {availableDivisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name || "Unknown Division"}
                  </option>
                ))}
              </FilterSelect>
            </FilterStep>
          </FilterContainer>
          
          {/* Filter summary - shows how many teams match the current filters */}
          <FilterSummary>
            Showing {getFilteredTeams().length} of {teams.length} teams
            {selectedLeagueType && ` in ${selectedLeagueType}`}
            {selectedLeague && ` from ${selectedLeague}`}
            {selectedConference && ` in the ${selectedConference} Conference`}
            {selectedDivision && ` from the ${
              // Get division name from its ID
              divisions.find(d => d.id.toString() === selectedDivision)?.name || 
              // Fallback to the division value itself if not found by ID
              selectedDivision
            } Division`}
          </FilterSummary>
          
          {loading ? (
            <p>Loading teams...</p>
          ) : teams.length === 0 ? (
            <div>
              <p>No teams found. Try adjusting your filters or check your database connection.</p>
            </div>
          ) : getFilteredTeams().length === 0 ? (
            <div>
              <p>No teams match your current filter criteria. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
            <TeamGrid>
                {getFilteredTeams().map((team, index) => {
                  // Debugging
                  if (!team) {
                    console.error('Undefined team in getFilteredTeams');
                    return null;
                  }
                  
                  return (
                <TeamCard 
                      key={team.id || index} 
                  primaryColor={team.primary_color || '#1e1e1e'}
                  textColor={getTextColor(team.primary_color)}
                >
                  <TeamHeader>
                    <TeamLogo primaryColor={team.primary_color || '#1e1e1e'}>
                      {team.abbreviation}
                    </TeamLogo>
                    <TeamInfo>
                      <TeamName>{team.name}</TeamName>
                      <TeamCity>{team.city}</TeamCity>
                    </TeamInfo>
                  </TeamHeader>
                  <TeamDetails>
                          <TeamDetail>
                            <span>League:</span>
                            <span>{team.league || 'NHL'}</span>
                          </TeamDetail>
                          <TeamDetail>
                            <span>Conference:</span>
                            <span>{team.conference || (team.division_id <= 2 ? 'Eastern' : 'Western')}</span>
                          </TeamDetail>
                    <TeamDetail>
                      <span>Division:</span>
                      <span>
                            {divisions.find(d => d.id === team.division_id)?.name || team.divisionName || 'Unknown'}
                      </span>
                    </TeamDetail>
                    <TeamDetail>
                      <span>Arena:</span>
                      <span>{team.arena_name}</span>
                    </TeamDetail>
                    <TeamDetail>
                      <span>Capacity:</span>
                      <span>{team.arena_capacity?.toLocaleString() || 'Unknown'}</span>
                    </TeamDetail>
                    <TeamDetail>
                      <span>Prestige:</span>
                      <span>{team.prestige}/100</span>
                        </TeamDetail>
                          <TeamDetail>
                            <span>Salary Cap:</span>
                            <span>${(team.salary_cap || 82500000).toLocaleString()}</span>
                    </TeamDetail>
                  </TeamDetails>
                        <TeamActions>
                          <TeamButton 
                            onClick={() => handleEditLines(team.id)}
                          >
                            Edit Lines
                          </TeamButton>
                          <TeamButton onClick={() => handleEditPlayers(team.id)}>
                            Edit Players
                          </TeamButton>
                          <TeamButton onClick={() => handleEditTeam(team.id)}>
                            Edit Team
                          </TeamButton>
                        </TeamActions>
                </TeamCard>
                  );
                })}
            </TeamGrid>
            </>
          )}
        </>
      )}
    </Container>
  );
};

export default TeamManager;
