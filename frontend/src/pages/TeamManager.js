import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSelector } from 'react-redux';
import { selectCommunityPack } from '../store/slices/settingsSlice';

// Import team logos
import ANA from '../assets/Logo_ANA.png';
import BOS from '../assets/Logo_BOS.png';
import BUF from '../assets/Logo_BUF.png';
import CAR from '../assets/Logo_CAR.png';
import CBJ from '../assets/Logo_CBJ.png';
import CGY from '../assets/Logo_CGY.png';
import CHI from '../assets/Logo_CHI.png';
import COL from '../assets/Logo_COL.png';
import DAL from '../assets/Logo_DAL.png';
import DET from '../assets/Logo_DET.png';
import EDM from '../assets/Logo_EDM.png';
import FLA from '../assets/Logo_FLA.png';
import LAK from '../assets/Logo_LAK.png';
import MIN from '../assets/Logo_MIN.png';
import MTL from '../assets/Logo_MTL.png';
import NJD from '../assets/Logo_NJD.png';
import NSH from '../assets/Logo_NSH.png';
import NYI from '../assets/Logo_NYI.png';
import NYR from '../assets/Logo_NYR.png';
import OTT from '../assets/Logo_OTT.png';
import PHI from '../assets/Logo_PHI.png';
import PIT from '../assets/Logo_PIT.png';
import SEA from '../assets/Logo_SEA.png';
import SJS from '../assets/Logo_SJS.png';
import STL from '../assets/Logo_STL.png';
import TBL from '../assets/Logo_TBL.png';
import TOR from '../assets/Logo_TOR.png';
import VAN from '../assets/Logo_VAN.png';
import VGK from '../assets/Logo_VGK.png';
import WPG from '../assets/Logo_WPG.png';
import WSH from '../assets/Logo_WSH.png';
import UTA from '../assets/Logo_UTA.png';

// Create a mapping of team abbreviations to logo images
const teamLogos = {
  ANA, BOS, BUF, CAR, CBJ, CGY, CHI, COL, DAL, DET, 
  EDM, FLA, LAK, MIN, MTL, NJD, NSH, NYI, NYR, OTT, 
  PHI, PIT, SEA, SJS, STL, TBL, TOR, VAN, VGK, WPG, WSH, UTA
};

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
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

const CreateTeamButton = styled.button`
  padding: 10px 15px;
  background-color: #B30E16;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background-color: #950b12;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(1px);
  }
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

const TeamLogoContainer = styled.div`
  width: 50px;
  height: 50px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const TeamLogoImage = styled.img`
  max-width: 50px;
  max-height: 50px;
  object-fit: contain;
`;

const TeamLogoPlaceholder = styled.div`
  width: 50px;
  height: 50px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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

// New styled component for the best player section
const BestPlayerSection = styled.div`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const BestPlayerName = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
`;

const BestPlayerDetail = styled.div`
  font-size: 14px;
  opacity: 0.8;
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

// Improved sorting function that handles all edge cases
const sortLeaguesByStrength = (leagues) => {
  return [...leagues].sort((a, b) => {
    // Handle edge cases (null, undefined, or non-numeric values)
    let strengthA, strengthB;
    
    try {
      // Try to convert to integer with radix 10
      strengthA = a.league_strength !== null && a.league_strength !== undefined ? 
        parseInt(a.league_strength, 10) : null;
      
      // Check if parsing resulted in NaN
      if (isNaN(strengthA)) strengthA = null;
    } catch (e) {
      console.warn(`Error parsing league_strength for ${a.display}:`, e);
      strengthA = null;
    }
    
    try {
      // Try to convert to integer with radix 10
      strengthB = b.league_strength !== null && b.league_strength !== undefined ? 
        parseInt(b.league_strength, 10) : null;
      
      // Check if parsing resulted in NaN
      if (isNaN(strengthB)) strengthB = null;
    } catch (e) {
      console.warn(`Error parsing league_strength for ${b.display}:`, e);
      strengthB = null;
    }
    
    // Handle cases based on whether we have valid values
    if (strengthA === null && strengthB === null) {
      // If both values are invalid, sort alphabetically
      return a.display.localeCompare(b.display);
    } else if (strengthA === null) {
      // Put leagues with missing strength at the end
      return 1;
    } else if (strengthB === null) {
      // Put leagues with missing strength at the end
      return -1;
    } else {
      // Both values are valid numbers, sort highest to lowest
      return strengthB - strengthA;
    }
  });
};

const TeamManager = () => {
  const communityPack = useSelector(selectCommunityPack);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [divisions, setDivisions] = useState([]); // Used for the new team form
  // eslint-disable-next-line no-unused-vars
  const [leaguesData, setLeaguesData] = useState([]); // Store leagues data for reference
  
  // Filter states
  const [selectedLeagueType, setSelectedLeagueType] = useState('');
  const [selectedLeague, setSelectedLeague] = useState('');
  const [selectedConference, setSelectedConference] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  
  // Available options for filters
  const [availableLeagueTypes, setAvailableLeagueTypes] = useState([]);
  const [availableLeagues, setAvailableLeagues] = useState([]);
  const [availableConferences, setAvailableConferences] = useState([]);
  const [availableDivisions, setAvailableDivisions] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  
  const [activeTab, setActiveTab] = useState('teams');
  const [supabaseError, setSupabaseError] = useState(null);
  const [initializing, setInitializing] = useState(false);
  const [initMessage, setInitMessage] = useState(null);
  
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
  
  // Add console log to check authentication status
  useEffect(() => {
    console.log("Authentication status:", isAuthenticated());
  }, [isAuthenticated]);
  
  // Set up leagueToTypeMap - will be populated from API
  // eslint-disable-next-line no-unused-vars
  const [leagueToTypeMap, setLeagueToTypeMap] = useState({});
  // eslint-disable-next-line no-unused-vars
  const [abbreviationToLeagueMap, setAbbreviationToLeagueMap] = useState({});
  
  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setSupabaseError(null);
      
      try {
        console.log('Starting fetchAllData process...');
        
        // First fetch leagues from backend
        const { 
          leagues: leagueData, 
          leagueToTypeMap, 
          abbreviationToLeagueMap,
          divisionToConferenceMap 
        } = await fetchLeaguesFromBackend();
        
        // Log league data for debugging
        console.log('Leagues data from backend:', leagueData);
        console.log('League to Type mapping for teams:', leagueToTypeMap);
        console.log('Division to Conference mapping:', divisionToConferenceMap);
        
        // Then fetch teams
        const teamsData = await fetchTeamsFromBackend(leagueToTypeMap, divisionToConferenceMap);
        
        if (teamsData.length === 0) {
          console.warn('No teams were returned from backend. Check your API endpoint.');
          setSupabaseError('No teams found. Check server logs for more information.');
        } else {
          console.log(`Successfully loaded ${teamsData.length} teams from backend.`);
          
          // Fetch player, coach, and GM data for teams
          try {
            // Enhance teams with best player data for NHL teams
            const enhancedTeams = await fetchTeamEnhancements(teamsData);
            setTeams(enhancedTeams);
            console.log('Teams enhanced with player, coach, and GM data:', enhancedTeams.slice(0, 3));
          } catch (err) {
            console.error('Error enhancing teams with player data:', err);
            // Still set teams even if enhancement fails
            setTeams(teamsData);
          }
          
          // Extract available countries from teams
          const countries = [...new Set(teamsData
            .map(team => team.country)
            .filter(Boolean)
          )].sort();
          
          setAvailableCountries(countries);
          console.log(`Extracted ${countries.length} countries from team data.`);
        }
      } catch (err) {
        console.error('Error during data initialization:', err);
        setSupabaseError(`Failed to load data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);
  
  // Fetch team enhancements (players, coaches, GMs)
  const fetchTeamEnhancements = async (teams) => {
    console.log('Enhancing teams with player, coach, and GM data...');
    
    try {
      // For all teams, fetch:
      // 1. Best player (highest overall rating) for each team
      // 2. Coach information
      // 3. GM information
      
      // Clone the teams array so we don't modify the original
      const enhancedTeams = [...teams];
      
      // First, get best players for all teams
      try {
        console.log('Fetching best players for all teams...');
        const { data: playersData } = await axios.get('/api/players/best-by-team');
        
        if (playersData && Array.isArray(playersData)) {
          console.log(`Received ${playersData.length} best players for teams`);
          console.log('Sample player data:', playersData.slice(0, 1));
          
          // Add best player data to corresponding teams
          playersData.forEach(player => {
            // Handle team_id field which might be a team abbreviation rather than an ID
            const teamId = player.team_id || player.team;
            if (!teamId) {
              console.warn('Player has no team_id or team field:', player);
              return;
            }
            
            // First try to find by ID
            let teamIndex = enhancedTeams.findIndex(t => t.id === teamId);
            
            // If not found by ID, try to find by abbreviation (case-insensitive)
            if (teamIndex < 0) {
              teamIndex = enhancedTeams.findIndex(t => 
                t.abbreviation && t.abbreviation.toUpperCase() === String(teamId).toUpperCase()
              );
            }
            
            if (teamIndex >= 0) {
              enhancedTeams[teamIndex].best_player = {
                id: player.id,
                name: `${player.first_name || ''} ${player.last_name || ''}`.trim(),
                overall: player.overall,
                position: player.position
              };
              console.log(`Assigned best player to team ${enhancedTeams[teamIndex].name} (${enhancedTeams[teamIndex].abbreviation}): ${enhancedTeams[teamIndex].best_player.name}`);
            } else {
              console.warn(`No matching team found for player with team_id ${teamId}`);
              if (typeof teamId === 'string' && teamId.length <= 3) {
                console.log('Available team abbreviations:', enhancedTeams.map(t => t.abbreviation));
              }
            }
          });
        } else {
          console.warn('No player data returned from API or data is not an array');
          console.log('Raw player data:', playersData);
        }
      } catch (error) {
        console.error('Error fetching best players:', error);
      }
      
      // Next, get coaches for all teams
      try {
        console.log('Fetching coaches for all teams...');
        const { data: coachesData } = await axios.get('/api/staff/coaches');
        
        if (coachesData && Array.isArray(coachesData)) {
          console.log(`Received ${coachesData.length} coaches`);
          console.log('Sample coach data:', coachesData.slice(0, 1));
          
          // Add coach data to corresponding teams
          coachesData.forEach(coach => {
            // IMPORTANT: In Supabase, the 'team' field contains the team abbreviation (e.g., 'ANA')
            // not the team ID. We need to match based on abbreviation.
            const teamAbbr = coach.team;
            if (!teamAbbr) {
              console.warn('Coach has no team abbreviation:', coach);
              return;
            }
            
            // Find team by abbreviation
            const teamIndex = enhancedTeams.findIndex(t => 
              t.abbreviation && t.abbreviation.toUpperCase() === teamAbbr.toUpperCase()
            );
            
            if (teamIndex >= 0) {
              enhancedTeams[teamIndex].coach = `${coach.first_name || ''} ${coach.last_name || ''}`.trim();
              console.log(`Assigned coach to team ${enhancedTeams[teamIndex].name} (${enhancedTeams[teamIndex].abbreviation}): ${enhancedTeams[teamIndex].coach}`);
            } else {
              console.warn(`No matching team found for coach with team abbreviation ${teamAbbr}`);
              // Log available team abbreviations to help debug
              console.log('Available team abbreviations:', enhancedTeams.map(t => t.abbreviation));
            }
          });
        } else {
          console.warn('No coach data returned from API or data is not an array');
          console.log('Raw coach data:', coachesData);
        }
      } catch (error) {
        console.error('Error fetching coaches:', error);
      }
      
      // Finally, get GMs for all teams
      try {
        console.log('Fetching GMs for all teams...');
        const { data: gmsData } = await axios.get('/api/staff/gms');
        
        if (gmsData && Array.isArray(gmsData)) {
          console.log(`Received ${gmsData.length} GMs`);
          console.log('Sample GM data:', gmsData.slice(0, 1));
          
          // Add GM data to corresponding teams
          gmsData.forEach(gm => {
            // IMPORTANT: In Supabase, the 'team' field contains the team abbreviation (e.g., 'ANA')
            // not the team ID. We need to match based on abbreviation.
            const teamAbbr = gm.team;
            if (!teamAbbr) {
              console.warn('GM has no team abbreviation:', gm);
              return;
            }
            
            // Find team by abbreviation
            const teamIndex = enhancedTeams.findIndex(t => 
              t.abbreviation && t.abbreviation.toUpperCase() === teamAbbr.toUpperCase()
            );
            
            if (teamIndex >= 0) {
              enhancedTeams[teamIndex].general_manager = `${gm.first_name || ''} ${gm.last_name || ''}`.trim();
              console.log(`Assigned GM to team ${enhancedTeams[teamIndex].name} (${enhancedTeams[teamIndex].abbreviation}): ${enhancedTeams[teamIndex].general_manager}`);
            } else {
              console.warn(`No matching team found for GM with team abbreviation ${teamAbbr}`);
              // Log available team abbreviations to help debug
              console.log('Available team abbreviations:', enhancedTeams.map(t => t.abbreviation));
            }
          });
        } else {
          console.warn('No GM data returned from API or data is not an array');
          console.log('Raw GM data:', gmsData);
        }
      } catch (error) {
        console.error('Error fetching GMs:', error);
      }
      
      // Return the enhanced teams
      const enhancedCount = enhancedTeams.reduce((count, team) => {
        if (team.best_player) count.bestPlayer++;
        if (team.coach && team.coach !== 'Not assigned') count.coach++;
        if (team.general_manager && team.general_manager !== 'Not assigned') count.gm++;
        return count;
      }, { bestPlayer: 0, coach: 0, gm: 0 });
      
      console.log(`Enhanced ${enhancedTeams.length} teams with:
        - ${enhancedCount.bestPlayer} best players
        - ${enhancedCount.coach} coaches
        - ${enhancedCount.gm} GMs`);
      return enhancedTeams;
    } catch (error) {
      console.error('Error in fetchTeamEnhancements:', error);
      // If there's an error, just return the original teams
      return teams;
    }
  };
  
  // Fetch leagues from backend API
  const fetchLeaguesFromBackend = async () => {
    try {
      console.log('Attempting to fetch leagues from backend API...');
      
      // Using the correct API endpoint path
      const { data } = await axios.get('/api/leagues/');
      
      console.log('Backend League data found:', data);
      
      // Fetch conferences and divisions to create the mappings
      let conferences = [];
      let divisions = [];
      
      try {
        // Fetch conferences with correct endpoint
        const confResponse = await axios.get('/api/teams/conferences');
        conferences = confResponse.data || [];
        console.log(`Fetched ${conferences.length} conferences from backend`);
        
        // Fetch divisions with correct endpoint
        const divResponse = await axios.get('/api/teams/divisions');
        divisions = divResponse.data || [];
        console.log(`Fetched ${divisions.length} divisions from backend`);
      } catch (error) {
        console.warn('Error fetching conferences or divisions:', error);
        console.warn('API path might be incorrect. Check backend routes.');
        // Continue with default values if needed
      }
      
      // Create conference ID to name mapping
      const conferenceMap = {};
      conferences.forEach(conf => {
        conferenceMap[conf.id] = conf.conference || conf.name;
      });
      
      // Create division ID to name mapping and division to conference mapping
      const divisionMap = {};
      const divisionToConferenceMap = {};
      
      divisions.forEach(div => {
        divisionMap[div.id] = div.division || div.name;
        // Map division ID to conference name using the conference map
        if (div.conference) {
          const confName = conferenceMap[div.conference] || `Conference ${div.conference}`;
          divisionToConferenceMap[div.id] = confName;
        }
      });
      
      console.log('Division to Conference mapping:', divisionToConferenceMap);
      
      if (data && data.length > 0) {
        // Log the first few league items to check for league_strength field
        console.log('First few leagues from backend (checking league_strength):', data.slice(0, 3));
        
        // Check all NHL, KHL, and SHL leagues to verify their league_strength values
        console.log('-------------------------------------');
        console.log('LEAGUE STRENGTH VERIFICATION:');
        ['NHL', 'KHL', 'SHL', 'LIIGA', 'NLA', 'DEL'].forEach(abbr => {
          const league = data.find(l => l.abbreviation === abbr);
          if (league) {
            console.log(`${league.league} (${league.abbreviation}): league_strength=${league.league_strength}, type=${typeof league.league_strength}`);
          } else {
            console.log(`${abbr}: Not found in data`);
          }
        });
        console.log('-------------------------------------');
        
        // Check if any league lacks the league_strength field
        const missingStrength = data.filter(league => league.league_strength === null || league.league_strength === undefined);
        console.log(`Found ${missingStrength.length} out of ${data.length} leagues WITHOUT league_strength values`);
        if (missingStrength.length > 0) {
          console.log('Leagues missing strength values:', missingStrength.slice(0, 5).map(l => l.league));
        }
        
        // Log all leagues with their strength values for the top Pro leagues
        console.log('Pro leagues with strength values:');
        data.filter(l => l.league_level === 'Pro').slice(0, 15).forEach(league => {
          console.log(`${league.league} (${league.abbreviation || 'N/A'}): strength=${league.league_strength || 'N/A'}`);
        });
        
        // Count leagues with league_strength values
        const leaguesWithStrength = data.filter(league => league.league_strength !== null && league.league_strength !== undefined).length;
        console.log(`Found ${leaguesWithStrength} out of ${data.length} leagues with league_strength values`);
        
        // Log league strength distribution
        const strengthGroups = {
          'null/undefined': 0,
          '0-25': 0,
          '26-50': 0, 
          '51-75': 0,
          '76-100': 0,
          'invalid': 0
        };
        
        data.forEach(league => {
          const strength = league.league_strength;
          if (strength === null || strength === undefined) {
            strengthGroups['null/undefined']++;
          } else {
            const numStrength = Number(strength);
            if (isNaN(numStrength)) {
              strengthGroups['invalid']++;
            } else if (numStrength >= 0 && numStrength <= 25) {
              strengthGroups['0-25']++;
            } else if (numStrength > 25 && numStrength <= 50) {
              strengthGroups['26-50']++;
            } else if (numStrength > 50 && numStrength <= 75) {
              strengthGroups['51-75']++;
            } else if (numStrength > 75 && numStrength <= 100) {
              strengthGroups['76-100']++;
            } else {
              strengthGroups['invalid']++;
            }
          }
        });
        
        console.log('League strength distribution:', strengthGroups);
        
        // Create a mapping of league to league type for easy lookup
        const leagueToTypeMapping = {};
        const abbreviationToLeagueMapping = {};
        
        data.forEach(league => {
          // Map full league name to league type
          leagueToTypeMapping[league.league] = league.league_level;
          
          // Map abbreviation to league type - this is crucial because Team.league contains the abbreviation
          if (league.abbreviation) {
            leagueToTypeMapping[league.abbreviation] = league.league_level;
            // Also create a mapping from abbreviation to full league name
            abbreviationToLeagueMapping[league.abbreviation] = league.league;
          }
        });
        
        // Store the mappings in state
        setLeagueToTypeMap(leagueToTypeMapping);
        setAbbreviationToLeagueMap(abbreviationToLeagueMapping);
        
        console.log('League name to type mapping:', leagueToTypeMapping);
        console.log('Abbreviation to League mapping:', abbreviationToLeagueMapping);
        
        // Get unique league types for filtering
        const uniqueLeagueTypes = [...new Set(
          data
            .map(league => league.league_level)
            .filter(Boolean)
        )];
        
        // Order league types in the specific order: Pro, Junior, Sub-Junior, Minor
        const orderedLeagueTypes = ['Pro', 'Junior', 'Sub-Junior', 'Minor'].filter(
          type => uniqueLeagueTypes.includes(type)
        );

        // Add any other league types that weren't in our predefined order
        uniqueLeagueTypes.forEach(type => {
          if (!orderedLeagueTypes.includes(type)) {
            orderedLeagueTypes.push(type);
          }
        });
        
        setAvailableLeagueTypes(orderedLeagueTypes);
        console.log('Ordered league types:', orderedLeagueTypes);
        
        // Format leagues for the dropdown - we need to use abbreviation as the value
        // because team.league contains abbreviations (e.g., NHL, KHL, etc.)
        const formattedLeagues = data.map(league => {
          return {
            id: league.id,
            value: league.abbreviation || league.league, // Use abbreviation as value since team.league contains abbreviations
            display: `${league.league}${league.abbreviation ? ` (${league.abbreviation})` : ''}`,
            league_level: league.league_level,
            fullName: league.league,
            league_strength: league.league_strength
          };
        });

        // Log the strength values before sorting
        console.log('League strength values before sorting:');
        formattedLeagues.slice(0, 10).forEach(league => {
          console.log(`${league.display}: ${league.league_strength}`);
        });
        
        // Sort leagues by league_strength from highest to lowest (0-100 value)
        const sortedLeagues = sortLeaguesByStrength(formattedLeagues);
        
        // Log sorted leagues for verification
        console.log('Top 10 leagues after sorting by strength:');
        sortedLeagues.slice(0, 10).forEach((league, index) => {
          console.log(`${index + 1}. ${league.display}: ${league.league_strength}`);
        });
        
        setAvailableLeagues(sortedLeagues);
        console.log(`Formatted ${sortedLeagues.length} leagues for dropdown (sorted by strength)`);
        
        // Debug: Show league strengths for top leagues
        console.log("Top 10 leagues in dropdown (after sorting):");
        sortedLeagues.slice(0, 10).forEach((league, idx) => {
          console.log(`${idx+1}. ${league.display}: strength=${league.league_strength}, level=${league.league_level}`);
        });
        
        // Store leagues for use in FilterSummary
        setLeaguesData(sortedLeagues);
        
        return { 
          leagues: sortedLeagues,
          leagueToTypeMap: leagueToTypeMapping,
          abbreviationToLeagueMap: abbreviationToLeagueMapping,
          divisionToConferenceMap: divisionToConferenceMap,
          conferenceMap: conferenceMap,
          divisionMap: divisionMap
        };
      } else {
        console.warn('No league data found in backend response.');
        return { 
          leagues: [],
          leagueToTypeMap: {},
          abbreviationToLeagueMap: {},
          divisionToConferenceMap: {},
          conferenceMap: {},
          divisionMap: {}
        };
      }
    } catch (error) {
      console.error('Error fetching leagues from backend:', error);
      setSupabaseError(`Failed to fetch leagues: ${error.message}`);
      return { 
        leagues: [],
        leagueToTypeMap: {},
        abbreviationToLeagueMap: {},
        divisionToConferenceMap: {},
        conferenceMap: {},
        divisionMap: {}
      };
    }
  };
  
  // Fetch teams from backend API
  const fetchTeamsFromBackend = async (leagueToTypeMap, divisionToConferenceMap = {}) => {
    try {
      console.log('Attempting to fetch teams from backend API...');
      const { data } = await axios.get('/api/teams');
      
      console.log(`Backend returned ${data ? data.length : 0} teams`);
      
      if (data && data.length > 0) {
        // Log the first few teams from the backend response
        console.log('First 3 teams from backend:', data.slice(0, 3));
        
        // Check if league_type already exists in the API response
        const hasLeagueType = data[0].hasOwnProperty('league_type');
        console.log(`Teams already have league_type property: ${hasLeagueType}`);
        
        // Process teams to add required properties
        const processedTeams = data.map(team => {
          // First, get the league type
          const leagueType = team.league ? leagueToTypeMap[team.league] : null;
          
          // Add conference based on division
          let conference = team.conference; // Use existing conference if available
          
          // Special case for NHL teams (divisions 1-4 map to specific conferences)
          if (team.league === 'NHL') {
            const divId = parseInt(team.division || team.division_id || '0');
            if (divId > 0) {
              conference = divId <= 2 ? 'Eastern' : 'Western';
            }
          } else if (team.division && divisionToConferenceMap[team.division]) {
            conference = divisionToConferenceMap[team.division];
          }
          
          return {
            ...team,
            league_type: team.league_type || leagueType || 'Unknown',
            conference: conference || team.conference || 'Unknown',
          };
        });
        
        console.log(`Processed ${processedTeams.length} teams`);
        
        // Enhance teams with player, coach, and GM data if NHL teams
        const enhancedTeams = await fetchTeamEnhancements(processedTeams);
        
        return enhancedTeams;
      } else {
        console.warn('No teams returned from backend');
        return [];
      }
    } catch (error) {
      console.error('Error fetching teams from backend:', error);
      return [];
    }
  };
  
  // Filter teams based on league type selection
  const handleLeagueTypeChange = (selectedType) => {
    console.log(`League type filter changed to: "${selectedType}"`);
    setSelectedLeagueType(selectedType);
    setSelectedLeague('');
    setSelectedConference('');
    setSelectedDivision('');
    setSelectedCountry('');
    
    // Filter teams based on the selected league type
    const filteredTeams = selectedType === '' 
      ? teams 
      : teams.filter(team => {
          // Ensure exact string comparison for league_type, case-insensitive
          return String(team.league_type || '').trim().toLowerCase() === String(selectedType).trim().toLowerCase();
        });
    
    console.log(`Found ${filteredTeams.length} teams matching league type "${selectedType}"`);
    
    // Debug the first few filtered teams
    if (filteredTeams.length > 0) {
      console.log("First 3 matching teams:", filteredTeams.slice(0, 3).map(t => 
        ({ name: t.name, league: t.league, conference: t.conference, league_type: t.league_type })
      ));
    }
    
    // Update available leagues based on the selected type
    // If no league type is selected, show all leagues
    // Otherwise, only show leagues with the matching league_level
    let leaguesForType = selectedType === '' 
      ? availableLeagues 
      : availableLeagues.filter(league => {
          return league.league_level === selectedType;
        });
    
    // Sort leagues by league_strength from highest to lowest (0-100 value)
    leaguesForType.sort((a, b) => {
      // Convert to numbers and handle null/undefined values
      // Use explicit parseInt with radix to ensure proper conversion
      const strengthA = a.league_strength !== null && a.league_strength !== undefined ? parseInt(a.league_strength, 10) : 0;
      const strengthB = b.league_strength !== null && b.league_strength !== undefined ? parseInt(b.league_strength, 10) : 0;
      
      // Check for NaN after conversion and provide a fallback value
      const valueA = isNaN(strengthA) ? 0 : strengthA;
      const valueB = isNaN(strengthB) ? 0 : strengthB;
      
      // Sort by strength in descending order (higher values first)
      if (valueA !== valueB) {
        return valueB - valueA;
      }
      
      // If strengths are equal or both 0, fallback to alphabetical sort
      return a.display.localeCompare(b.display);
    });
    
    // Log the top leagues after sorting
    console.log(`Top leagues for type "${selectedType}" after sorting:`, 
      leaguesForType.slice(0, 5).map(l => ({
        league: l.display,
        strength: l.league_strength
      }))
    );
    
    setAvailableLeagues(leaguesForType);
    console.log(`Available leagues updated: ${leaguesForType.length} leagues available for type "${selectedType}"`);
    
    // Get unique leagues from filtered teams as a fallback
    if (leaguesForType.length === 0 && filteredTeams.length > 0) {
      const uniqueLeagues = [...new Set(filteredTeams.map(team => team.league))].filter(Boolean);
      const formattedLeagues = uniqueLeagues.map(leagueName => {
        return {
          id: leagueName,
          value: leagueName,
          display: leagueName,
          league_level: selectedType,
          league_strength: 0 // Default strength since we don't have the data
          };
        });
      
      setAvailableLeagues(formattedLeagues);
      console.log(`Fallback: Created ${formattedLeagues.length} leagues from filtered teams`);
    }
    
    // Extract unique conferences from filtered teams
    const conferencesForType = [...new Set(
      filteredTeams
        .map(team => team.conference)
        .filter(Boolean)
    )].sort();
    
    console.log(`Found ${conferencesForType.length} unique conferences for league type "${selectedType}":`, conferencesForType);
    
    setAvailableConferences(conferencesForType);
    setAvailableDivisions([]);
  };
  
  // Filter teams based on league selection
  const handleLeagueChange = (selectedLeague) => {
    console.log(`League filter changed to: "${selectedLeague}"`);
    setSelectedLeague(selectedLeague);
    setSelectedConference('');
    setSelectedDivision('');
    setSelectedCountry('');
    
    // Filter teams based on the selected league
    const filteredTeams = teams.filter(team => {
      // If no league is selected, return all teams (or those matching league type if set)
      if (!selectedLeague) {
        return selectedLeagueType ? 
          String(team.league_type || '').trim() === String(selectedLeagueType).trim() : 
          true;
      }
      
      // The "league" in Team is actually the abbreviation, not the full league name
      return team.league === selectedLeague;
    });
    
    console.log(`Found ${filteredTeams.length} teams matching league "${selectedLeague}"`);
    
    // Debug the first few filtered teams - show the conferences
    if (filteredTeams.length > 0) {
      console.log("First 3 filtered teams:", filteredTeams.slice(0, 3).map(t => 
        ({ name: t.name, league: t.league, conference: t.conference, division_id: t.division_id, divisionName: t.divisionName })
      ));
    } else {
      console.log("WARNING: No teams found for selected league:", selectedLeague);
    }
    
    // Extract conferences from filtered teams - force to an empty array if undefined
    const uniqueConferences = [];
    
    // Only include conferences that actually exist in the filtered teams
    filteredTeams.forEach(team => {
      if (team.conference && !uniqueConferences.includes(team.conference)) {
        uniqueConferences.push(team.conference);
      }
    });
    
    // Special case for NHL which should have Eastern and Western
    if (selectedLeague === 'NHL' && uniqueConferences.length < 2) {
      // If Eastern isn't already in the list, add it
      if (!uniqueConferences.includes('Eastern')) {
        uniqueConferences.push('Eastern');
      }
      // If Western isn't already in the list, add it
      if (!uniqueConferences.includes('Western')) {
        uniqueConferences.push('Western');
      }
      console.log("Added default Eastern and Western conferences for NHL");
    }
    
    // Sort conferences alphabetically
    uniqueConferences.sort();
    
    console.log(`Found ${uniqueConferences.length} conferences for teams in league "${selectedLeague}":`, uniqueConferences);
    
    // Update the available conferences
    setAvailableConferences(uniqueConferences);
    
    // Extract divisions directly from the league's teams, without requiring conference selection
    const divisionMap = {};
    
    // Build a map of division_id -> division name from all teams in this league
    filteredTeams.forEach(team => {
      if (team.division_id && !divisionMap[team.division_id]) {
        divisionMap[team.division_id] = {
          id: team.division_id,
          name: team.divisionName || getDivisionNameById(team.division_id, selectedLeague),
          conference: team.conference // Track which conference this division belongs to
        };
      }
      // Also check the division field in case division_id is missing
      if (team.division && !divisionMap[team.division] && team.division !== team.division_id) {
        divisionMap[team.division] = {
          id: team.division,
          name: team.divisionName || getDivisionNameById(team.division, selectedLeague),
          conference: team.conference // Track which conference this division belongs to
        };
      }
    });
    
    // Special case for NHL which should have default divisions
    if (selectedLeague === 'NHL' && Object.keys(divisionMap).length < 4) {
      // Add any missing NHL divisions
      if (!divisionMap[1]) {
        divisionMap[1] = { id: 1, name: 'Atlantic', conference: 'Eastern' };
      }
      if (!divisionMap[2]) {
        divisionMap[2] = { id: 2, name: 'Metropolitan', conference: 'Eastern' };
      }
      if (!divisionMap[3]) {
        divisionMap[3] = { id: 3, name: 'Central', conference: 'Western' };
      }
      if (!divisionMap[4]) {
        divisionMap[4] = { id: 4, name: 'Pacific', conference: 'Western' };
      }
      console.log("Added default NHL divisions");
    }
    
    // Convert the map to an array
    const divisionArray = Object.values(divisionMap);
    
    // Sort divisions by name
    divisionArray.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`Found ${divisionArray.length} divisions for league "${selectedLeague}":`, divisionArray);
    
    // Update available divisions
    setAvailableDivisions(divisionArray);
  };
  
  // Helper function to get division name from ID - used for NHL divisions
  const getDivisionNameById = (divisionId, leagueAbbr) => {
    if (leagueAbbr === 'NHL') {
      switch (Number(divisionId)) {
        case 1: return 'Atlantic';
        case 2: return 'Metropolitan';
        case 3: return 'Central';
        case 4: return 'Pacific';
        default: return `Division ${divisionId}`;
      }
    }
    return `Division ${divisionId}`;
  };
  
  // Filter teams based on conference selection
  const handleConferenceChange = (selectedConf) => {
    console.log(`Conference filter changed to: "${selectedConf}"`);
    setSelectedConference(selectedConf);
    setSelectedDivision('');
    setSelectedCountry('');
    
    // Filter teams based on the selected conference and previous filters
    const filteredTeams = teams.filter(team => {
      // First check if league and league type match (if selected)
      if (selectedLeagueType && String(team.league_type || '').trim() !== String(selectedLeagueType).trim()) {
        return false;
      }
      if (selectedLeague && team.league !== selectedLeague) {
        return false;
      }
      
      // Then check if conference matches (case-insensitive)
      return selectedConf && team.conference ? 
        String(team.conference).trim().toLowerCase() === String(selectedConf).trim().toLowerCase() : 
        false;
    });
    
    console.log(`Found ${filteredTeams.length} teams in conference "${selectedConf}"`);
    
    // Debug info on the filtered teams to see their division_id values
    if (filteredTeams.length > 0) {
      console.log("First 3 filtered teams by conference:", filteredTeams.slice(0, 3).map(t => 
        ({ name: t.team || t.name, league: t.league, conference: t.conference, division_id: t.division_id, division: t.division })
      ));
      } else {
      console.log("WARNING: No teams found for selected conference:", selectedConf);
      
      // Debug: show conferences found in teams
      const conferencesInData = [...new Set(teams.map(t => t.conference).filter(Boolean))];
      console.log("Available conferences in data:", conferencesInData);
    }
    
    // Filter the available divisions based on conference
    // Note: Divisions should already be loaded from the league selection
    let conferenceDivisions = availableDivisions;
    
    if (selectedConf) {
      // Filter to only show divisions that belong to this conference
      conferenceDivisions = availableDivisions.filter(division => 
        division.conference && selectedConf ?
        String(division.conference).trim().toLowerCase() === String(selectedConf).trim().toLowerCase() :
        false
      );
      
      console.log(`Filtered ${availableDivisions.length} divisions to ${conferenceDivisions.length} for conference "${selectedConf}"`);
    }
    
    // Special case for NHL which should have default divisions
    if (selectedLeague === 'NHL' && conferenceDivisions.length === 0) {
      if (selectedConf.toLowerCase() === 'eastern') {
        conferenceDivisions = [
          { id: 1, name: 'Atlantic', conference: 'Eastern' },
          { id: 2, name: 'Metropolitan', conference: 'Eastern' }
        ];
        console.log("Added default Atlantic and Metropolitan divisions for Eastern Conference");
      } else if (selectedConf.toLowerCase() === 'western') {
        conferenceDivisions = [
          { id: 3, name: 'Central', conference: 'Western' },
          { id: 4, name: 'Pacific', conference: 'Western' }
        ];
        console.log("Added default Central and Pacific divisions for Western Conference");
      }
    }
    
    // Sort divisions by name
    conferenceDivisions.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`Found ${conferenceDivisions.length} divisions for conference "${selectedConf}":`, conferenceDivisions);
    
    // Update available divisions
    setAvailableDivisions(conferenceDivisions);
  };
  
  // Filter teams based on division selection
  const handleDivisionChange = (selectedDiv) => {
    console.log(`Division filter changed to: "${selectedDiv}" (type: ${typeof selectedDiv})`);
    setSelectedDivision(selectedDiv);
    setSelectedCountry('');
    
    // Find the division object for this ID
    const selectedDivObject = availableDivisions.find(d => String(d.id) === String(selectedDiv));
    console.log("Selected division object:", selectedDivObject);
    
    // Filter teams based on the selected division
    const filteredTeams = teams.filter(team => {
      // Apply all current filters
      if (selectedLeagueType && String(team.league_type || '').trim() !== String(selectedLeagueType).trim()) {
        return false;
      }
      if (selectedLeague && team.league !== selectedLeague) {
        return false;
      }
      if (selectedConference && team.conference) {
        const normalizedTeamConf = String(team.conference).trim().toLowerCase();
        const normalizedSelectedConf = String(selectedConference).trim().toLowerCase();
        if (normalizedTeamConf !== normalizedSelectedConf) {
          return false;
        }
      }
      
      // Handle the special case for NHL with default division IDs
      if (selectedLeague === 'NHL') {
        // For NHL teams, compare the division as numbers if possible
        const teamDivId = parseInt(team.division || team.division_id);
        const selectedDivId = parseInt(selectedDiv);
        if (!isNaN(teamDivId) && !isNaN(selectedDivId)) {
          return teamDivId === selectedDivId;
        }
      }
      
      // Check both division_id and division fields
      const divisionMatches = 
        (team.division_id && String(team.division_id) === String(selectedDiv)) ||
        (team.division && String(team.division) === String(selectedDiv));
        
      return divisionMatches;
    });
    
    console.log(`Found ${filteredTeams.length} teams matching division ID "${selectedDiv}" (${selectedDivObject?.name || 'Unknown'})`);
    
    // Debug the first few teams to verify they have the right division
    if (filteredTeams.length > 0) {
      console.log("First 3 filtered teams by division:", filteredTeams.slice(0, 3).map(t => 
        ({ 
          name: t.team || t.name, 
          league: t.league, 
          conference: t.conference, 
          division_id: t.division_id, 
          division: t.division,
          country: t.country 
        })
      ));
    } else {
      console.log("WARNING: No teams found for selected division:", selectedDiv);
      console.log("Division ID type:", typeof selectedDiv);
      console.log("Division name:", selectedDivObject ? selectedDivObject.name : 'Unknown');
      
      // Look for teams that might match this division by searching all teams
      const matchingTeams = teams.filter(team => 
        String(team.division || '') === String(selectedDiv) || 
        String(team.division_id || '') === String(selectedDiv)
      );
      console.log(`Found ${matchingTeams.length} teams with division matching "${selectedDiv}" in the full dataset`);
      if (matchingTeams.length > 0) {
        console.log("First matching team:", matchingTeams[0]);
      }
    }
    
    // Make sure we only include non-empty country values
    const countries = [...new Set(
      filteredTeams
        .map(team => team.country)
        .filter(country => country && country.trim() !== '')
    )].sort();
    
    console.log(`Found ${countries.length} countries for teams in division "${selectedDiv}" (${selectedDivObject?.name || 'Unknown'}):`, countries);
    
    // Update available countries based on the filtered teams
    setAvailableCountries(countries);
  };
  
  // Filter teams based on country selection
  const handleCountryChange = (selectedCountry) => {
    console.log(`Country filter changed to: "${selectedCountry}"`);
    setSelectedCountry(selectedCountry);
    
    // Filter teams based on the selected country
    const filteredTeams = teams.filter(team => {
      // Apply all current filters
      if (selectedLeagueType && String(team.league_type || '').trim() !== String(selectedLeagueType).trim()) {
        return false;
      }
      if (selectedLeague && team.league !== selectedLeague) {
        return false;
      }
      if (selectedConference && String(team.conference || '').trim() !== String(selectedConference).trim()) {
        return false;
      }
      if (selectedDivision) {
        // Special case for NHL with numeric division IDs
        if (team.league === 'NHL') {
          const teamDivId = parseInt(team.division || team.division_id);
          const selectedDivId = parseInt(selectedDivision);
          if (!(!isNaN(teamDivId) && !isNaN(selectedDivId) && teamDivId === selectedDivId)) {
            return false;
          }
        } else {
          // Check both division_id and division fields
          const divisionMatches = 
            (team.division_id && String(team.division_id) === String(selectedDivision)) ||
            (team.division && String(team.division) === String(selectedDivision));
            
          if (!divisionMatches) {
            return false;
          }
        }
      }
      if (selectedCountry && team.country !== selectedCountry) {
        return false;
      }
      return true;
    });
    
    console.log(`Found ${filteredTeams.length} teams in country "${selectedCountry}"`);
    
    // Debug the first few teams to verify they have the right country
    if (filteredTeams.length > 0) {
      console.log("First 3 filtered teams by country:", filteredTeams.slice(0, 3).map(t => 
        ({ name: t.name, league: t.league, conference: t.conference, division_id: t.division_id, country: t.country })
      ));
    }
  };
  
  // Get filtered teams based on selected filters
  const getFilteredTeams = useCallback(() => {
    if (!teams || !Array.isArray(teams)) {
      console.warn("Teams array is not available yet");
      return [];
    }
    
    // Log a few sample teams with their league_type values
    if (teams.length > 0) {
      console.log("First 5 teams and their league_type values:");
      teams.slice(0, 5).forEach((team, index) => {
        console.log(`Team ${index+1}: ${team.name}, League: ${team.league}, League Type: "${team.league_type}" (type: ${typeof team.league_type})`);
      });
      console.log(`selectedLeagueType: "${selectedLeagueType}" (type: ${typeof selectedLeagueType})`);
      
      // Count teams by league_type
      const leagueTypeCounts = {};
      teams.forEach(team => {
        const type = team.league_type || "No Type";
        leagueTypeCounts[type] = (leagueTypeCounts[type] || 0) + 1;
      });
      console.log("Teams by league_type:", leagueTypeCounts);
      
      // Log Pro teams specifically to debug
      if (selectedLeagueType === 'Pro') {
        const proTeams = teams.filter(team => team.league_type === 'Pro');
        console.log(`Found ${proTeams.length} Pro teams. First 3:`, proTeams.slice(0, 3));
      }
    }
    
    const filteredTeams = teams.filter(team => {
      // Filter by league type if selected
      if (selectedLeagueType && selectedLeagueType !== '') {
        if (!team.league_type) {
          console.log(`Team ${team.name} (${team.id}) has no league_type property, filtering out`);
          return false;
        }
        
        // Compare values for debugging
        const normalizedTeamType = String(team.league_type).trim().toLowerCase();
        const normalizedSelectedType = String(selectedLeagueType).trim().toLowerCase();
        
        if (normalizedTeamType !== normalizedSelectedType) {
          // Log detailed info for precise debugging
          if (teams.length < 50) { // Only log if not too many teams
            console.log(`Team ${team.name} league_type "${normalizedTeamType}" doesn't match selected "${normalizedSelectedType}"`);
          }
          return false;
        }
      }
      
      // Filter by league if selected
      if (selectedLeague && selectedLeague !== '') {
        // Compare values for debugging
        if (team.league !== selectedLeague) {
          // Log detailed info for precise debugging
          if (teams.length < 50) { // Only log if not too many teams
            console.log(`Team ${team.name} league "${team.league}" doesn't match selected league "${selectedLeague}"`);
          }
          return false;
        }
      }
      
      // Filter by conference if selected
      if (selectedConference && selectedConference !== '') {
        // Check if the team has a conference property
        if (!team.conference) {
          return false;
        }
        
        // Normalize both values for comparison
        const normalizedTeamConf = String(team.conference).trim().toLowerCase();
        const normalizedSelectedConf = String(selectedConference).trim().toLowerCase();
        
        if (normalizedTeamConf !== normalizedSelectedConf) {
          return false;
        }
      }
      
      // Filter by division if selected
      if (selectedDivision && selectedDivision !== '') {
        // Special case for NHL - handle numeric division IDs
        if (team.league === 'NHL') {
          const teamDivId = parseInt(team.division || team.division_id);
          const selectedDivId = parseInt(selectedDivision);
          if (!isNaN(teamDivId) && !isNaN(selectedDivId) && teamDivId === selectedDivId) {
            // If we're only checking division, and it passes, don't return false
            // We'll continue with other filters below
          } else {
            return false;
          }
        } else {
          // Check both division_id and division fields
          const divisionMatchesString = 
            (team.division_id && String(team.division_id) === String(selectedDivision)) ||
            (team.division && String(team.division) === String(selectedDivision));
          
          if (!divisionMatchesString) {
            return false;
          }
        }
      }
      
      // Filter by country if selected
      if (selectedCountry && team.country !== selectedCountry) {
        return false;
      }
      
      return true;
    });
    
    console.log(`GetFilteredTeams: Filtered ${teams.length} teams to ${filteredTeams.length} for current filters`);
    if (filteredTeams.length > 0) {
      console.log("First matching team:", filteredTeams[0]);
    }
    
    // Sort teams by city alphabetically
    return [...filteredTeams].sort((a, b) => {
      if (!a.city && !b.city) return 0;
      if (!a.city) return 1;
      if (!b.city) return -1;
      return a.city.localeCompare(b.city);
    });
  }, [teams, selectedLeagueType, selectedLeague, selectedConference, selectedDivision, selectedCountry]);
  
  // Fetch league types directly from Supabase - call early in component lifecycle
  useEffect(() => {
    const fetchLeagueTypes = async () => {
      try {
        // Use axios to fetch league level rules via the backend
        const { data } = await axios.get('/api/league-types');
        
        if (data && data.length > 0) {
          console.log('Fetched league types:', data);
          // If you have a dedicated endpoint
          setAvailableLeagueTypes(data);
        } else {
          console.warn('No league types found via API endpoint');
        }
      } catch (error) {
        console.error('Error fetching league types:', error);
        setSupabaseError(`Failed to fetch league types: ${error.message}`);
      }
    };
    
    fetchLeagueTypes();
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
  
  // Add function to handle navigation to Line Combinations
  const handleEditLines = async (teamId) => {
    try {
      // Get the full team data including league information from backend API
      const { data: team } = await axios.get(`/api/teams/${teamId}`);
      
      if (!team) {
        console.error('[DEBUG] Team not found');
        throw new Error('Team not found');
      }
      
      // Navigate to line editor page with team ID
      window.location.href = `/line-combinations/${team.league}/${teamId}`;
      
    } catch (error) {
      console.error(`Error navigating to line editor: ${error}`);
      setSupabaseError(`Error: ${error.message}`);
    }
  };

  // Add function to handle navigation to Player Editor
  const handleEditPlayers = async (teamId) => {
    try {
      console.log(`[DEBUG] handleEditPlayers called with teamId: ${teamId}`);
      
      // Get the team data from backend API
      const { data: team } = await axios.get(`/api/teams/${teamId}`);
      
      if (!team || !team.abbreviation) {
        console.error('[DEBUG] Team or team abbreviation not found');
        throw new Error('Team not found');
      }
      
      // Just pass team abbreviation to PlayerEditor
      window.location.href = `/player-editor?team=${team.abbreviation}`;
    } catch (error) {
      console.error(`[DEBUG] Error navigating to player editor: ${error}`);
      setSupabaseError(`Error: ${error.message}`);
    }
  };

  // Add function to handle navigation to Team Editor
  const handleEditTeam = async (teamId) => {
    try {
      console.log(`[DEBUG] handleEditTeam called with teamId: ${teamId}`);
      
      // Navigate to team editor page with team ID
      window.location.href = `/team-editor/${teamId}`;
    } catch (error) {
      console.error(`[DEBUG] Error navigating to team editor: ${error}`);
      setSupabaseError(`Error: ${error.message}`);
    }
  };
  
  // Handler for Create Team button
  const handleCreateTeam = () => {
    setActiveTab('create');
  };
  
  // Add a function to normalize abbreviations consistently
  const normalizeAbbreviation = (abbr) => {
    if (!abbr) return '';
    return abbr.trim().toUpperCase();
  };

  // Try to get team logo
  const getTeamLogo = (teamAbbr) => {
    if (!teamAbbr) {
      return null;
    }
    
    try {
      // Normalize the team abbreviation to uppercase
      const normalizedAbbr = normalizeAbbreviation(teamAbbr);
      // Remove debug logs
      
      // Check if we have the logo in our imported collection - always allow logo display regardless of communityPack setting
      if (teamLogos[normalizedAbbr]) {
        // Remove debug logs
        return teamLogos[normalizedAbbr];
      } else {
        // Remove debug logs
        return null;
      }
    } catch (error) {
      // Keep error log but make it less verbose
      console.error(`Error getting logo: ${error.message}`);
      return null;
    }
  };
  
  // Add a useEffect to monitor filter state changes
  useEffect(() => {
    // Remove verbose debugging console logs
    /*
    console.log("Filter state changed:");
    console.log("- selectedLeagueType:", selectedLeagueType);
    console.log("- selectedLeague:", selectedLeague);
    console.log("- selectedConference:", selectedConference);
    console.log("- selectedDivision:", selectedDivision);
    console.log("- selectedCountry:", selectedCountry);
    
    console.log("Available filter options:");
    console.log("- availableLeagueTypes:", availableLeagueTypes.length);
    console.log("- availableLeagues:", availableLeagues.length);
    console.log("- availableConferences:", availableConferences.length);
    console.log("- availableDivisions:", availableDivisions.length);
    console.log("- availableCountries:", availableCountries.length);
    */
  }, [
    selectedLeagueType, selectedLeague, selectedConference, selectedDivision, selectedCountry,
    availableLeagueTypes, availableLeagues, availableConferences, availableDivisions, availableCountries
  ]);
  
  return (
    <Container>
      <TitleContainer>
        <Title>Team Management</Title>
        <ButtonsContainer>
          <CreateTeamButton onClick={handleCreateTeam}>
            Create Team
          </CreateTeamButton>
        </ButtonsContainer>
      </TitleContainer>
      
      {/* Debug info - show filter states */}
      <div style={{ 
        margin: '10px', 
        padding: '10px', 
        border: '1px dashed #ccc', 
        borderRadius: '4px',
        fontSize: '12px',
        backgroundColor: '#f0f0f0',
        color: '#333',
        display: 'none', // Hide debugging info
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        <h4 style={{ margin: '0 0 5px 0' }}>Filter Debug Info:</h4>
        <div><strong>Selected League Type:</strong> {selectedLeagueType || '(none)'}</div>
        <div><strong>Selected League:</strong> {selectedLeague || '(none)'}</div>
        <div><strong>Selected Conference:</strong> {selectedConference || '(none)'}</div>
        <div><strong>Selected Division:</strong> {selectedDivision || '(none)'}</div>
        <div><strong>Selected Country:</strong> {selectedCountry || '(none)'}</div>
        <div><strong>Available League Types:</strong> {availableLeagueTypes.length}</div>
        <div><strong>Available Leagues:</strong> {availableLeagues.length}</div>
        <div><strong>Available Conferences:</strong> {availableConferences.length} - {availableConferences.join(', ')}</div>
        <div><strong>Available Divisions:</strong> {availableDivisions.length} - {availableDivisions.map(d => d.name).join(', ')}</div>
        <div><strong>Available Countries:</strong> {availableCountries.length}</div>
        <div><strong>Total Teams:</strong> {teams.length}</div>
        <div><strong>Filtered Teams:</strong> {getFilteredTeams().length}</div>
      </div>
      
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
      
      <TabContainer>
        <TabButtons>
          <TabButton 
            active={activeTab === 'teams'} 
            onClick={() => setActiveTab('teams')}
          >
            Teams
          </TabButton>
          <TabButton 
            active={activeTab === 'create'} 
            onClick={() => setActiveTab('create')}
          >
            Create Team
          </TabButton>
        </TabButtons>
        
        {activeTab === 'create' && (
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
          {/* Filter bar */}
          <FilterContainer>
            {/* Filter Dropdown for League Type */}
            <FilterLabel htmlFor="leagueTypeFilter">League Type:</FilterLabel>
              <FilterSelect
                value={selectedLeagueType || ""}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log(`Changing league type from "${selectedLeagueType}" to "${newValue}"`);
                handleLeagueTypeChange(newValue);
              }}
              >
                <option value="">All League Types</option>
              {availableLeagueTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
                ))}
              </FilterSelect>

            {/* Filter Dropdown for League */}
            <FilterLabel htmlFor="leagueFilter">League:</FilterLabel>
              <FilterSelect
                value={selectedLeague || ""}
              onChange={(e) => {
                console.log("Selected league changed to:", e.target.value);
                console.log("Available leagues:", availableLeagues);
                handleLeagueChange(e.target.value);
              }}
              disabled={!availableLeagues || availableLeagues.length === 0}
            >
              <option value="">All Leagues ({availableLeagues.length})</option>
                {availableLeagues.map((league) => (
                <option key={league.id} value={league.value}>
                  {league.display} {league.league_strength !== null && league.league_strength !== undefined ? `[${league.league_strength}]` : ''}
                  </option>
                ))}
              </FilterSelect>

            {/* Filter Dropdown for Conference */}
            <FilterLabel htmlFor="conferenceFilter">Conference:</FilterLabel>
              <FilterSelect
                value={selectedConference || ""}
              onChange={(e) => {
                console.log("Selected conference changed to:", e.target.value);
                console.log("Available conferences:", availableConferences);
                handleConferenceChange(e.target.value);
              }}
              disabled={!availableConferences || availableConferences.length === 0}
            >
              <option value="">All Conferences ({availableConferences.length})</option>
              {availableConferences.map((conf) => (
                <option key={conf} value={conf}>{conf}</option>
                ))}
              </FilterSelect>

            {/* Filter Dropdown for Division */}
            <FilterLabel htmlFor="divisionFilter">Division:</FilterLabel>
              <FilterSelect
                value={selectedDivision || ""}
              onChange={(e) => {
                console.log("Selected division changed to:", e.target.value);
                console.log("Available divisions:", availableDivisions);
                handleDivisionChange(e.target.value);
              }}
              disabled={!availableDivisions || availableDivisions.length === 0}
            >
              <option value="">All Divisions ({availableDivisions.length})</option>
              {availableDivisions.map((div) => (
                <option key={div.id} value={div.id}>
                  {div.name}{selectedConference ? '' : div.conference ? ` (${div.conference})` : ''}
                  </option>
                ))}
              </FilterSelect>
            
            {/* Filter Dropdown for Country */}
            <FilterLabel htmlFor="countryFilter">Country:</FilterLabel>
            <FilterSelect
              value={selectedCountry || ""}
              onChange={(e) => handleCountryChange(e.target.value)}
              disabled={!availableCountries.length}
            >
              <option value="">All Countries ({availableCountries.length})</option>
              {availableCountries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </FilterSelect>
          </FilterContainer>
          
          {/* Filter summary - shows how many teams match the current filters */}
          <FilterSummary>
            Showing {getFilteredTeams().length} of {teams.length} teams
            {selectedLeagueType && ` in ${selectedLeagueType} level`}
            {selectedLeague && ` from ${
              // Find the league display name from the league value
              availableLeagues.find(l => l.value === selectedLeague)?.display || 
              // Or use the mapping if available
              abbreviationToLeagueMap[selectedLeague] || 
              // Or just use the selected league value
              selectedLeague
            }`}
            {selectedConference && ` in the ${selectedConference} Conference`}
            {selectedDivision && ` from the ${
              // Get division name from its ID
              availableDivisions.find(d => String(d.id) === String(selectedDivision))?.name || 
              // Fallback to the division value itself if not found by ID
              selectedDivision
            } Division`}
            {selectedCountry && ` from ${selectedCountry}`}
          </FilterSummary>
          
          {loading ? (
            <p>Loading teams...</p>
          ) : teams.length === 0 ? (
            <div>
              <p>No teams found. Try adjusting your filters or check your API connection.</p>
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
                    {/* Remove debug logging */}
                    <TeamLogoContainer>
                      {(communityPack === 1 || communityPack === undefined) && getTeamLogo(normalizeAbbreviation(team.abbreviation)) ? (
                        <TeamLogoImage 
                          src={getTeamLogo(normalizeAbbreviation(team.abbreviation))} 
                          alt={`${team.name} logo`} 
                        />
                      ) : (
                        <TeamLogoPlaceholder primaryColor={team.primary_color || '#1e1e1e'}>
                      {team.abbreviation}
                        </TeamLogoPlaceholder>
                      )}
                    </TeamLogoContainer>
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
                          {/* Show conference only for Pro teams */}
                          {(team.league_type === 'Pro') && (
                          <TeamDetail>
                            <span>Conference:</span>
                            <span>{team.conference || (team.division_id <= 2 ? 'Eastern' : 'Western')}</span>
                          </TeamDetail>
                          )}
                          {/* Show division only for Pro and Junior teams */}
                          {(['Pro', 'Junior'].includes(team.league_type)) && (
                    <TeamDetail>
                      <span>Division:</span>
                      <span>
                                {team.divisionName || getDivisionNameById(team.division_id || team.division, team.league)}
                      </span>
                    </TeamDetail>
                          )}
                          {/* Add country for all teams */}
                          <TeamDetail>
                            <span>Country:</span>
                            <span>{team.country || 'Canada'}</span>
                          </TeamDetail>
                    {/* Only show arena name for Junior or Pro teams */}
                    {(team.league_type === 'Pro' || team.league_type === 'Junior') && (
                    <TeamDetail>
                      <span>Arena:</span>
                      <span>{team.arena_name}</span>
                    </TeamDetail>
                    )}
                    {/* Only show arena capacity for Junior or Pro teams */}
                    {(team.league_type === 'Pro' || team.league_type === 'Junior') && (
                    <TeamDetail>
                        <span>Arena Capacity:</span>
                      <span>{team.arena_capacity?.toLocaleString() || 'Unknown'}</span>
                    </TeamDetail>
                    )}
                    {/* Show In-League Prestige for all teams */}
                    <TeamDetail>
                      <span>In-League Prestige:</span>
                      <span>{team.prestige}/100</span>
                        </TeamDetail>
                    {/* Only show Salary Cap for NHL teams */}
                    {team.league === 'NHL' && (
                          <TeamDetail>
                            <span>Salary Cap:</span>
                            <span>${(team.salary_cap || 82500000).toLocaleString()}</span>
                    </TeamDetail>
                    )}
                    {/* Add GM and Coach for NHL teams */}
                    {team.league === 'NHL' && (
                      <>
                        <TeamDetail>
                          <span>General Manager:</span>
                          <span>{team.general_manager || 'Not assigned'}</span>
                        </TeamDetail>
                        <TeamDetail>
                          <span>Coach:</span>
                          <span>{team.coach || 'Not assigned'}</span>
                        </TeamDetail>
                      </>
                    )}
                    {/* Best Player section for all teams */}
                    <BestPlayerSection>
                      <BestPlayerName>Best Player</BestPlayerName>
                      <BestPlayerDetail>
                        {team.best_player ? 
                          `${team.best_player.name || 'Unknown'} ${team.best_player.position ? `(${team.best_player.position}) ` : ''}${team.best_player.overall ? `${team.best_player.overall} OVR` : ''}` 
                          : 'Not assigned'}
                      </BestPlayerDetail>
                    </BestPlayerSection>
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
