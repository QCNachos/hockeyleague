import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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

const SelectContainer = styled.div`
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #fff;
    pointer-events: none;
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
  const [leagueTypes, setLeagueTypes] = useState([]);
  const [leagues, setLeagues] = useState([]);
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
  
  const { isAuthenticated, token } = useSelector(state => state.auth);
  
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
        
        // Extract unique league types (ensuring only strings)
        const uniqueLeagueTypes = [...new Set(
          data
            .map(league => String(league.league_level || ''))
            .filter(Boolean)
        )];
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
        
        return data;
      } else {
        console.log('No League data found in Supabase');
        setSupabaseError('No leagues found. Using mock data.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching leagues from Supabase:', error);
      setSupabaseError(`Supabase connection failed: ${error.message}`);
      return null;
    }
  };
  
  // Fetch teams from Supabase
  const fetchTeamsFromSupabase = async () => {
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
      
      // Create a mapping of conference IDs to names
      const conferenceMap = {};
      if (conferencesData) {
        conferencesData.forEach(conf => {
          conferenceMap[conf.id] = conf.conference;
        });
      }
      console.log('Conference mapping:', conferenceMap);
      
      // Get teams data
      const { data, error } = await supabase
        .from('Team')
        .select('*')
        .order('team');
        
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Supabase Team data found, count:', data?.length);
      
      if (data && data.length > 0) {
        // Log a few sample teams for debugging
        console.log('Sample team data (first 3):');
        data.slice(0, 3).forEach((team, idx) => {
          console.log(`Team ${idx + 1}:`, {
            id: team.id,
            name: team.team,
            division: team.division,
            conference: team.conference,
            conferenceId: team.conference,
            conferenceName: conferenceMap[team.conference] || 'Unknown'
          });
        });
        
        // Separately fetch divisions to map to teams
        const { data: divisionsData, error: divisionsError } = await supabase
          .from('Division')
          .select('*');
          
        if (divisionsError) {
          console.error('Error fetching divisions:', divisionsError);
        }
        
        const divisions = divisionsData || [];
        console.log('Divisions for mapping:', divisions.length);
        
        // Process teams with division data
        const processedTeams = data.map(team => {
          // Find matching division
          const divisionData = divisions.find(d => d.id === team.division) || {};
          
          // Map conference ID to name
          const conferenceName = conferenceMap[team.conference] || 'Unknown';
          
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
            league_type: divisionData.league_level || 'Professional',
            league: team.league || divisionData.league || 'NHL',
            conferenceId: team.conference,
            conference: conferenceName,
            division_id: team.division,
            divisionName: divisionData.name || 'Unknown Division',
            salary_cap: team.salary_cap || 82500000
          };
        });
        
        console.log('Processed teams count:', processedTeams.length);
        
        // Set teams state
        setTeams(processedTeams);
        
        // Extract unique conferences as strings
        const uniqueConferences = [...new Set(
          processedTeams
            .map(team => team.conference)
            .filter(Boolean)
        )].map(String);
        
        console.log('Unique conferences extracted:', uniqueConferences);
        setConferences(uniqueConferences);
        setAvailableConferences(uniqueConferences);
        
        // Extract unique leagues as strings
        const uniqueLeagues = [...new Set(
          processedTeams
            .map(team => team.league)
            .filter(Boolean)
        )].map(String);
        
        setAvailableLeagues(uniqueLeagues);
        
        return processedTeams;
      } else {
        console.log('No Team data found in Supabase');
        return null;
      }
    } catch (error) {
      console.error('Error fetching teams from Supabase:', error);
      setSupabaseError(`Supabase team query failed: ${error.message}`);
      return null;
    }
  };
  
  // Fetch divisions from Supabase
  const fetchDivisionsFromSupabase = async () => {
    try {
      console.log('Attempting to fetch divisions from Supabase...');
      
      // First fetch conferences to map IDs to names
      const { data: conferencesData, error: conferencesError } = await supabase
        .from('Conference')
        .select('*');
        
      if (conferencesError) {
        console.error('Error fetching conferences:', conferencesError);
      }
      
      // Create a mapping of conference IDs to names
      const conferenceMap = {};
      if (conferencesData) {
        conferencesData.forEach(conf => {
          conferenceMap[conf.id] = conf.conference;
        });
      }
      
      // Now fetch divisions
      const { data, error } = await supabase
        .from('Division')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Supabase Division data found, count:', data?.length);
      
      if (data && data.length > 0) {
        // Log sample division data for debugging
        console.log('Sample division data:', data[0]);
        
        // Process divisions to ensure we have correct data structure
        const processedDivisions = data.map(division => {
          // Map the conference ID to its name
          const conferenceName = conferenceMap[division.conference] || 'Unknown';
          
          return {
            id: division.id,
            name: division.name || 'Unknown Division',
            conferenceId: division.conference,
            conference: conferenceName,
            league: division.league || 'NHL',
            league_type: division.league_level || 'Professional'
          };
        });
        
        console.log('Processed divisions with conference names:', processedDivisions);
        
        // Set divisions state
        setDivisions(processedDivisions);
        setAvailableDivisions(processedDivisions);
        
        return processedDivisions;
      } else {
        console.log('No Division data found in Supabase');
        return null;
      }
    } catch (error) {
      console.error('Error fetching divisions from Supabase:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      try {
        // First fetch leagues from Supabase
        const leaguesData = await fetchLeaguesFromSupabase();
        
        // Log league data for debugging
        console.log('Leagues data from Supabase:', leaguesData);
        console.log('Current leagues state:', leagues);
        console.log('Current availableLeagues state:', availableLeagues);
        
        // Then fetch teams and divisions
        const teamsData = await fetchTeamsFromSupabase();
        const divisionsData = await fetchDivisionsFromSupabase();
        
        // If no data was returned from Supabase, use mock data
        if (!teamsData || teamsData.length === 0) {
          console.log('No teams returned from Supabase, using mock data');
          
          // Fall back to mock data if Supabase fails
        const mockTeams = [
          // Atlantic Division
          {
            id: 1,
            name: "Boston Bruins",
            city: "Boston",
            abbreviation: "BOS",
            primary_color: "#FFB81C",
            secondary_color: "#000000",
            division_id: 1,
            divisionName: "Atlantic Division",
            arena_name: "TD Garden",
            arena_capacity: 17565,
              prestige: 85,
              league_type: "Professional",
              league: "NHL",
              conference: "Eastern"
          },
            // Add more mock teams
          {
            id: 2,
            name: "Buffalo Sabres",
            city: "Buffalo",
            abbreviation: "BUF",
            primary_color: "#002654",
            secondary_color: "#FCB514",
            division_id: 1,
            divisionName: "Atlantic Division",
            arena_name: "KeyBank Center",
            arena_capacity: 19070,
              prestige: 65,
              league_type: "Professional",
              league: "NHL",
              conference: "Eastern"
          },
          {
            id: 3,
            name: "Detroit Red Wings",
            city: "Detroit",
            abbreviation: "DET",
            primary_color: "#CE1126",
            secondary_color: "#FFFFFF",
            division_id: 1,
            divisionName: "Atlantic Division",
            arena_name: "Little Caesars Arena",
            arena_capacity: 19515,
              prestige: 70,
              league_type: "Professional",
              league: "NHL",
              conference: "Eastern"
            }
          ];
          
          // Add missing properties to mock teams
        const processedMockTeams = mockTeams.map(team => ({
          ...team,
          primary_color: team.primary_color || team.primaryColor || '#1e1e1e',
          secondary_color: team.secondary_color || team.secondaryColor || '#FFFFFF',
          division_id: team.division_id || team.divisionId,
          arena_name: team.arena_name || team.arenaName || 'Unknown Arena',
            arena_capacity: team.arena_capacity || team.arenaCapacity || 0,
            league_type: team.league_type || 'Professional',
            league: team.league || 'NHL',
            conference: team.conference || (team.division_id <= 2 ? 'Eastern' : 'Western'),
            salary_cap: team.salary_cap || 82500000
          }));
          
          console.log('Setting teams with mock data, count:', processedMockTeams.length);
        setTeams(processedMockTeams.sort((a, b) => a.name.localeCompare(b.name)));
          
          // Extract unique filter options from mock data
          const uniqueLeagueTypes = [...new Set(processedMockTeams.map(team => team.league_type))].filter(Boolean);
          const uniqueLeagues = [...new Set(processedMockTeams.map(team => team.league))].filter(Boolean);
          const uniqueConferences = [...new Set(processedMockTeams.map(team => team.conference))].filter(Boolean);
          
          setLeagueTypes(uniqueLeagueTypes.length > 0 ? uniqueLeagueTypes : ['Professional', 'Junior', 'College']);
          
          // Make sure we only store strings in leagues state
          setLeagues(uniqueLeagues);
          setConferences(uniqueConferences);
          
          // Initialize available options with strings only
          setAvailableLeagues(uniqueLeagues);
          setAvailableConferences(uniqueConferences);
        } else {
          console.log('Using teams data from Supabase, count:', teamsData.length);
        }
        
        if (!divisionsData || divisionsData.length === 0) {
          console.log('No divisions returned from Supabase, using mock data');
          
        // Fall back to mock division data
          const mockDivisions = [
            { id: 1, name: "Atlantic Division", conference: "Eastern", league: "NHL", league_type: "Professional" },
            { id: 2, name: "Metropolitan Division", conference: "Eastern", league: "NHL", league_type: "Professional" },
            { id: 3, name: "Central Division", conference: "Western", league: "NHL", league_type: "Professional" },
            { id: 4, name: "Pacific Division", conference: "Western", league: "NHL", league_type: "Professional" }
          ];
          
          console.log('Setting divisions with mock data, count:', mockDivisions.length);
          setDivisions(mockDivisions);
          setAvailableDivisions(mockDivisions);
        } else {
          console.log('Using divisions data from Supabase, count:', divisionsData.length);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setSupabaseError(`Failed to load data: ${error.message}`);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);
  
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
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
  
  // Handle league type change
  const handleLeagueTypeChange = (e) => {
    const type = e.target.value;
    setSelectedLeagueType(type);
    
    // Reset subsequent filters
    setSelectedLeague('');
    setSelectedConference('');
    setSelectedDivision('');
    
    if (type) {
      // Filter available leagues based on selected league type
      const filteredLeagues = [...new Set(
        teams
          .filter(team => team.league_type === type)
          .map(team => team.league)
      )].filter(Boolean);
      
      setAvailableLeagues(filteredLeagues);
    } else {
      // If no league type selected, show all leagues
      setAvailableLeagues([...new Set(teams.map(team => team.league))].filter(Boolean));
    }
    
    // Reset available conferences and divisions
    setAvailableConferences([]);
    setAvailableDivisions([]);
  };
  
  // Handle league change
  const handleLeagueChange = (e) => {
    const league = e.target.value;
    setSelectedLeague(league);
    
    // Reset subsequent filters
    setSelectedConference('');
    setSelectedDivision('');
    
    if (league) {
      // Filter available conferences based on selected league type and league
      const filteredConferences = [...new Set(
        teams
          .filter(team => 
            (selectedLeagueType ? team.league_type === selectedLeagueType : true) && 
            team.league === league
          )
          .map(team => team.conference)
      )].filter(Boolean);
      
      setAvailableConferences(filteredConferences);
    } else {
      // If no league selected, show all conferences for the selected league type
      const filteredConferences = [...new Set(
        teams
          .filter(team => selectedLeagueType ? team.league_type === selectedLeagueType : true)
          .map(team => team.conference)
      )].filter(Boolean);
      
      setAvailableConferences(filteredConferences);
    }
    
    // Reset available divisions
    setAvailableDivisions([]);
  };
  
  // Handle conference change
  const handleConferenceChange = (e) => {
    const conferenceName = e.target.value;
    console.log('Conference changed to:', conferenceName);
    setSelectedConference(conferenceName);
    setSelectedDivision("");  // Reset division when conference changes
    
    // Filter divisions based on the selected conference
    if (conferenceName) {
      // Find divisions that belong to this conference
      const filteredDivisions = divisions.filter(division => 
        division.conference === conferenceName
      );
      
      console.log(`Divisions in conference ${conferenceName}:`, filteredDivisions);
      setAvailableDivisions(filteredDivisions);
    } else {
      // If no conference selected, show all divisions
      setAvailableDivisions(divisions);
    }
  };
  
  // Handle division change
  const handleDivisionChange = (e) => {
    const division = e.target.value;
    setSelectedDivision(division);
    console.log('Division selected:', division);
  };
  
  // Get filtered teams based on all selected filters
  const getFilteredTeams = () => {
    console.log('Filtering teams with:', {
      selectedLeagueType,
      selectedLeague,
      selectedConference,
      selectedDivision
    });
    
    let filtered = [...teams];
    
    // Apply filters sequentially
    if (selectedLeagueType) {
      filtered = filtered.filter(team => team.league_type === selectedLeagueType);
    }
    
    if (selectedLeague) {
      filtered = filtered.filter(team => team.league === selectedLeague);
    }
    
    if (selectedConference) {
      filtered = filtered.filter(team => team.conference === selectedConference);
    }
    
    if (selectedDivision) {
      // Handle both ID and name comparisons for division
      filtered = filtered.filter(team => {
        // Try to match by ID (if it's a number)
        if (!isNaN(selectedDivision)) {
          return team.division_id === Number(selectedDivision);
        }
        // Otherwise match by name
        return team.divisionName === selectedDivision;
      });
    }
    
    console.log('Filtered teams count:', filtered.length);
    return filtered;
  };
  
  // Add function to handle navigation to Line Combinations
  const handleEditLines = (teamId, teamName) => {
    window.location.href = `/line-combinations/${teamId}`;
  };
  
  return (
    <Container>
      <Title>Team Management</Title>
      
      {/* Debug section */}
      <div style={{ 
        padding: '10px', 
        background: '#333',
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '14px',
        fontFamily: 'monospace'
      }}>
        <p>Debug - Team Data:</p>
        <div>Number of teams in state: {teams.length}</div>
        {teams.length > 0 && (
          <div>
            <p>First team data:</p>
            <pre style={{ maxHeight: '100px', overflow: 'auto' }}>
              {JSON.stringify(teams[0], null, 2)}
            </pre>
          </div>
        )}
      </div>
      
      {isAuthenticated && (
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
          {isAuthenticated && (
            <TabButton 
              active={activeTab === 'create'} 
              onClick={() => setActiveTab('create')}
            >
              Create New Team
            </TabButton>
          )}
        </TabButtons>
        
        {activeTab === 'create' && isAuthenticated && (
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
                value={selectedLeagueType}
                onChange={(e) => handleLeagueTypeChange(e.target.value)}
              >
                <option value="">All League Types</option>
                {leagueTypes.map((leagueType) => (
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
                value={selectedLeague}
                onChange={(e) => handleLeagueChange(e.target.value)}
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
                value={selectedConference}
                onChange={(e) => handleConferenceChange(e.target.value)}
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
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
              >
                <option value="">All Divisions</option>
                {availableDivisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
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
              // Handle division being either a string or an ID
              typeof selectedDivision === 'string' && !isNaN(parseInt(selectedDivision))
                ? divisions.find(d => d.id === parseInt(selectedDivision))?.name
                : selectedDivision
            } Division`}
          </FilterSummary>
          
          {loading ? (
            <p>Loading teams...</p>
          ) : teams.length === 0 ? (
            <div>
              <p>No teams found. Try adjusting your filters or check your database connection.</p>
              <pre>Debug: teams state is empty array</pre>
            </div>
          ) : getFilteredTeams().length === 0 ? (
            <div>
              <p>No teams match your current filter criteria. Try adjusting your filters.</p>
              <pre>Debug: teams.length = {teams.length}, but all were filtered out</pre>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '15px', padding: '10px', background: '#1e1e1e', borderRadius: '4px' }}>
                <p>Debug Info:</p>
                <ul>
                  <li>Total teams in state: {teams.length}</li>
                  <li>Filtered teams: {getFilteredTeams().length}</li>
                  <li>First team: {teams.length > 0 ? teams[0].name : 'None'}</li>
                </ul>
              </div>
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
                            onClick={() => handleEditLines(team.id, team.name)}
                          >
                            Edit Lines
                          </TeamButton>
                          <TeamButton>
                            Edit Players
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
