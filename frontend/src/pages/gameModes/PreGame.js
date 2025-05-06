import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../../lib/supabase';
import { useSelector } from 'react-redux';
import { selectCommunityPack } from '../../store/slices/settingsSlice';

// Import team logos
import ANA from '../../assets/Logo_ANA.png';
import BOS from '../../assets/Logo_BOS.png';
import BUF from '../../assets/Logo_BUF.png';
import CAR from '../../assets/Logo_CAR.png';
import CBJ from '../../assets/Logo_CBJ.png';
import CGY from '../../assets/Logo_CGY.png';
import CHI from '../../assets/Logo_CHI.png';
import COL from '../../assets/Logo_COL.png';
import DAL from '../../assets/Logo_DAL.png';
import DET from '../../assets/Logo_DET.png';
import EDM from '../../assets/Logo_EDM.png';
import FLA from '../../assets/Logo_FLA.png';
import LAK from '../../assets/Logo_LAK.png';
import MIN from '../../assets/Logo_MIN.png';
import MTL from '../../assets/Logo_MTL.png';
import NJD from '../../assets/Logo_NJD.png';
import NSH from '../../assets/Logo_NSH.png';
import NYI from '../../assets/Logo_NYI.png';
import NYR from '../../assets/Logo_NYR.png';
import OTT from '../../assets/Logo_OTT.png';
import PHI from '../../assets/Logo_PHI.png';
import PIT from '../../assets/Logo_PIT.png';
import SEA from '../../assets/Logo_SEA.png';
import SJS from '../../assets/Logo_SJS.png';
import STL from '../../assets/Logo_STL.png';
import TBL from '../../assets/Logo_TBL.png';
import TOR from '../../assets/Logo_TOR.png';
import VAN from '../../assets/Logo_VAN.png';
import VGK from '../../assets/Logo_VGK.png';
import WPG from '../../assets/Logo_WPG.png';
import WSH from '../../assets/Logo_WSH.png';
import UTA from '../../assets/Logo_UTA.png';

// Create a mapping of team abbreviations to logo images
const teamLogos = {
  ANA, BOS, BUF, CAR, CBJ, CGY, CHI, COL, DAL, DET, 
  EDM, FLA, LAK, MIN, MTL, NJD, NSH, NYI, NYR, OTT, 
  PHI, PIT, SEA, SJS, STL, TBL, TOR, VAN, VGK, WPG, WSH, UTA
};

// For debugging API calls
const debugAPI = (message, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data);
};

const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 80vh;
`;

const Title = styled.h1`
  color: #C4CED4;
  margin-bottom: 20px;
  text-align: center;
`;

const TeamsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 100px;
  margin: 50px auto;
  flex: 1;
  width: 100%;
  max-width: 1100px;
`;

const TeamSection = styled.div`
  flex: 0 0 500px;
  width: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: ${props => props.side === 'home' ? 'rgba(179, 14, 22, 0.1)' : 'rgba(13, 72, 116, 0.1)'};
  border-radius: 10px;
  border: 2px solid ${props => props.side === 'home' ? '#B30E16' : '#0D4874'};
`;

const TeamSelectContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 10px 15px;
  background-color: #1e1e1e;
  color: #fff;
  border: 1px solid #333;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
`;

const TeamLogo = styled.div`
  width: 200px;
  height: 200px;
  background-color: ${props => props.hasLogo ? 'transparent' : '#333'};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  overflow: hidden;
`;

const TeamLogoImage = styled.img`
  max-width: 70%;
  max-height: 70%;
  object-fit: contain;
`;

const TeamLogoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
`;

const TeamRatings = styled.div`
  width: 100%;
  padding: 20px;
  background-color: #1e1e1e;
  border-radius: 5px;
`;

const RatingItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #333;
  font-size: ${props => props.isOverall ? '18px' : '14px'};
  font-weight: ${props => props.isOverall ? 'bold' : 'normal'};
  
  &:last-child {
    border-bottom: none;
  }
`;

const RatingLabel = styled.span`
  font-weight: bold;
  color: ${props => props.isOverall ? '#C4CED4' : '#aaa'};
`;

const RatingValue = styled.span`
  font-weight: bold;
  font-size: ${props => props.isOverall ? '20px' : 'inherit'};
  color: ${props => {
    if (props.isOverall) return '#FFFFFF';
    if (props.value >= 90) return '#4CAF50';
    if (props.value >= 80) return '#8BC34A';
    if (props.value >= 70) return '#FFEB3B';
    if (props.value >= 60) return '#FF9800';
    return '#F44336';
  }};
`;

const GameOptionsContainer = styled.div`
  margin-top: 30px;
  padding: 20px;
  background-color: #1e1e1e;
  border-radius: 10px;
`;

const GameModeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const GameModeButton = styled.button`
  padding: 15px 10px;
  border: none;
  border-radius: 5px;
  background-color: ${props => props.selected ? '#B30E16' : '#333'};
  color: white;
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.selected ? '#950b12' : '#444'};
  }
`;

const GameModeDescription = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #2a2a2a;
  border-radius: 5px;
  color: #C4CED4;
`;

const StartGameButton = styled.button`
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  background-color: #B30E16;
  color: white;
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
  margin-top: 30px;
  align-self: center;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #950b12;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

// Game simulation modes with descriptions
const SIMULATION_MODES = {
  play_by_play: {
    label: 'Play-by-Play',
    description: 'Full play-by-play simulation with 20 minute periods. Watch the game unfold on the rink with realistic player movements.'
  },
  fast_play_by_play: {
    label: 'Fast Play-by-Play',
    description: 'Condensed play-by-play simulation with 3 minute periods. Visually see the game on the rink but at a faster pace.'
  },
  simulation: {
    label: 'Simulation',
    description: 'Simple simulation with key game events. No rink visual, but includes a game feed with approximately 30 seconds per period.'
  },
  fast_simulation: {
    label: 'Fast Simulation',
    description: 'Instant simulation with no visual feedback. Just the final game results and statistics.'
  }
};

const PreGame = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const communityPack = useSelector(selectCommunityPack);
  
  // League filtering
  const [availableLeagues, setAvailableLeagues] = useState([]);
  const [selectedHomeLeague, setSelectedHomeLeague] = useState('NHL');
  const [selectedAwayLeague, setSelectedAwayLeague] = useState('NHL');
  
  // Team selection
  const [homeTeam, setHomeTeam] = useState(null);
  const [awayTeam, setAwayTeam] = useState(null);
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  
  // Game settings
  const [gameMode, setGameMode] = useState('fast_play_by_play');

  // Team ratings loading states
  const [homeTeamRatings, setHomeTeamRatings] = useState(null);
  const [awayTeamRatings, setAwayTeamRatings] = useState(null);
  const [loadingHomeRatings, setLoadingHomeRatings] = useState(false);
  const [loadingAwayRatings, setLoadingAwayRatings] = useState(false);
  
  // Fetch all teams and leagues data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch leagues
        const { data: leaguesData, error: leaguesError } = await supabase
          .from('League')
          .select('*')
          .order('league_strength', { ascending: false });
          
        if (leaguesError) {
          throw leaguesError;
        }
        
        // Format leagues for dropdown
        const formattedLeagues = leaguesData.map(league => ({
          id: league.abbreviation,
          value: league.abbreviation,
          display: `${league.league} (${league.abbreviation})`,
          league_level: league.league_level,
          league_strength: league.league_strength || 0
        }));
        
        setAvailableLeagues(formattedLeagues);
        
        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase
          .from('Team')
          .select('*, League(league_level)')
          .order('team');
          
        if (teamsError) {
          throw teamsError;
        }
        
        // Process teams but don't set mock ratings yet
        const enhancedTeams = teamsData.map(team => ({
          ...team,
          id: team.id,
          name: team.team,
          abbreviation: team.abbreviation,
          logoUrl: ''
        }));
        
        setTeams(enhancedTeams);
        
        // Set default teams
        const nhlTeams = enhancedTeams.filter(team => team.league === 'NHL');
        if (nhlTeams.length >= 2) {
          // Sort by location for consistent default selection
          const sortedTeams = [...nhlTeams].sort((a, b) => (a.location || '').localeCompare(b.location || ''));
          if (sortedTeams.length >= 2) {
            setHomeTeam(sortedTeams[0]);
            setAwayTeam(sortedTeams[1]);
            setHomeTeamId(sortedTeams[0].id);
            setAwayTeamId(sortedTeams[1].id);
            
            // Fetch ratings for default teams
            fetchTeamRatings(sortedTeams[0], 'home');
            fetchTeamRatings(sortedTeams[1], 'away');
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load teams data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Function to fetch team ratings from backend API
  const fetchTeamRatings = async (team, side) => {
    if (!team || !team.abbreviation) return;
    
    // Set loading state for appropriate team
    if (side === 'home') {
      setLoadingHomeRatings(true);
    } else {
      setLoadingAwayRatings(true);
    }
    
    try {
      debugAPI(`Fetching ratings for ${side} team:`, team.abbreviation);
      
      // Try formation API first (most complete data)
      let ratings = null;
      
      try {
        // First try the formation API endpoint which includes team ratings
        const formationUrl = `http://localhost:5001/api/lines/formation/${team.abbreviation}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const formationResponse = await fetch(formationUrl, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (formationResponse.ok) {
          const formationData = await formationResponse.json();
          
          if (formationData && formationData.team_rating) {
            debugAPI(`Got team ratings from formation API for ${side} team:`, formationData.team_rating);
            ratings = {
              overall: formationData.team_rating.overall || 0,
              offense: formationData.team_rating.offense || 0,
              defense: formationData.team_rating.defense || 0,
              specialTeams: formationData.team_rating.special_teams || 0,
              goaltending: formationData.team_rating.goaltending || 0
            };
          }
        }
      } catch (formationError) {
        debugAPI(`Formation API error for ${side} team:`, formationError);
      }
      
      // If formation API failed, try lines API
      if (!ratings) {
        try {
          const linesUrl = `http://localhost:5001/api/lines/update-team-overall/${team.abbreviation}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          const linesResponse = await fetch(linesUrl, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (linesResponse.ok) {
            const linesData = await linesResponse.json();
            
            if (linesData && linesData.overall_rating) {
              debugAPI(`Got team ratings from lines API for ${side} team:`, linesData);
              ratings = {
                overall: linesData.overall_rating || 0,
                offense: linesData.offense || 0,
                defense: linesData.defense || 0,
                specialTeams: linesData.special_teams || 0,
                goaltending: linesData.goaltending || 0
              };
            }
          }
        } catch (linesError) {
          debugAPI(`Lines API error for ${side} team:`, linesError);
        }
      }
      
      // If lines API failed, try team rating API
      if (!ratings) {
        try {
          const ratingUrl = `http://localhost:5001/api/team_rating/calculate/${team.abbreviation}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          
          const ratingResponse = await fetch(ratingUrl, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json();
            
            if (ratingData) {
              debugAPI(`Got team ratings from team_rating API for ${side} team:`, ratingData);
              ratings = {
                overall: ratingData.overall || 0,
                offense: ratingData.offense || 0,
                defense: ratingData.defense || 0,
                specialTeams: ratingData.special_teams || 0,
                goaltending: ratingData.goaltending || 0
              };
            }
          }
        } catch (ratingError) {
          debugAPI(`Team rating API error for ${side} team:`, ratingError);
        }
      }
      
      // If all APIs failed, use fallback random ratings
      if (!ratings) {
        debugAPI(`Using fallback random ratings for ${side} team`, team.abbreviation);
        ratings = {
          overall: Math.floor(Math.random() * 10) + 80,
          offense: Math.floor(Math.random() * 10) + 80,
          defense: Math.floor(Math.random() * 10) + 80,
          specialTeams: Math.floor(Math.random() * 10) + 80,
          goaltending: Math.floor(Math.random() * 10) + 80
        };
      }
      
      // Round all ratings to whole numbers
      Object.keys(ratings).forEach(key => {
        ratings[key] = Math.round(ratings[key]);
      });
      
      // Set ratings for appropriate team
      if (side === 'home') {
        setHomeTeamRatings(ratings);
        setHomeTeam(prevTeam => ({
          ...prevTeam,
          ratings
        }));
        setLoadingHomeRatings(false);
      } else {
        setAwayTeamRatings(ratings);
        setAwayTeam(prevTeam => ({
          ...prevTeam,
          ratings
        }));
        setLoadingAwayRatings(false);
      }
    } catch (error) {
      console.error(`Error fetching ${side} team ratings:`, error);
      
      // Set fallback ratings
      const fallbackRatings = {
        overall: Math.floor(Math.random() * 10) + 80,
        offense: Math.floor(Math.random() * 10) + 80,
        defense: Math.floor(Math.random() * 10) + 80,
        specialTeams: Math.floor(Math.random() * 10) + 80,
        goaltending: Math.floor(Math.random() * 10) + 80
      };
      
      if (side === 'home') {
        setHomeTeamRatings(fallbackRatings);
        setHomeTeam(prevTeam => ({
          ...prevTeam,
          ratings: fallbackRatings
        }));
        setLoadingHomeRatings(false);
      } else {
        setAwayTeamRatings(fallbackRatings);
        setAwayTeam(prevTeam => ({
          ...prevTeam,
          ratings: fallbackRatings
        }));
        setLoadingAwayRatings(false);
      }
    }
  };
  
  // Filter teams by league for selectors
  const getTeamsByLeague = (leagueAbbr) => {
    // Filter teams by league and sort them alphabetically by location
    return teams
      .filter(team => team.league === leagueAbbr)
      .sort((a, b) => {
        // Sort by location (city name) alphabetically
        return (a.location || '').localeCompare(b.location || '');
      });
  };
  
  const homeTeamsByLeague = getTeamsByLeague(selectedHomeLeague);
  const awayTeamsByLeague = getTeamsByLeague(selectedAwayLeague);
  
  // Function to format team display name
  const formatTeamName = (team) => {
    return `${team.location} ${team.team} (${team.abbreviation})`;
  };
  
  // Function to get team logo with proper handling for communityPack setting
  const getTeamLogo = (teamAbbr) => {
    if (!teamAbbr) {
      return null;
    }
    
    try {
      // Only proceed if communityPack is enabled
      if (communityPack !== 1) {
        return null;
      }
      
      // Normalize the team abbreviation to uppercase
      const normalizedAbbr = teamAbbr.toUpperCase();
      
      // First try the static mapping for NHL teams (no spaces)
      if (teamLogos[normalizedAbbr]) {
        return teamLogos[normalizedAbbr];
      }
      
      // If not in static mapping, try dynamic import for teams with spaces
      try {
        // This approach handles filenames with spaces
        return require(`../../assets/Logo_${normalizedAbbr}.png`);
      } catch (error) {
        // If dynamic import fails, return null
        return null;
      }
    } catch (error) {
      console.error(`Error getting logo: ${error.message}`);
      return null;
    }
  };
  
  // Handle league changes
  const handleHomeLeagueChange = (e) => {
    const newLeague = e.target.value;
    setSelectedHomeLeague(newLeague);
    setHomeTeamId('');
    setHomeTeam(null);
    setHomeTeamRatings(null);
  };
  
  const handleAwayLeagueChange = (e) => {
    const newLeague = e.target.value;
    setSelectedAwayLeague(newLeague);
    setAwayTeamId('');
    setAwayTeam(null);
    setAwayTeamRatings(null);
  };
  
  // Handle team selection
  const handleHomeTeamChange = (e) => {
    const id = parseInt(e.target.value);
    setHomeTeamId(id);
    const team = teams.find(t => t.id === id);
    setHomeTeam(team);
    fetchTeamRatings(team, 'home');
  };
  
  const handleAwayTeamChange = (e) => {
    const id = parseInt(e.target.value);
    setAwayTeamId(id);
    const team = teams.find(t => t.id === id);
    setAwayTeam(team);
    fetchTeamRatings(team, 'away');
  };
  
  const handleGameModeSelect = (mode) => {
    setGameMode(mode);
  };
  
  const handleStartGame = () => {
    if (!homeTeam || !awayTeam) return;
    
    // Store game data in session storage for the GameSimulationPage to retrieve
    const gameData = {
      id: `${Date.now()}`, // Generate a unique ID for the game
      homeTeam: {
        id: homeTeam.id,
        name: homeTeam.team,
        abbreviation: homeTeam.abbreviation,
      },
      awayTeam: {
        id: awayTeam.id, 
        name: awayTeam.team,
        abbreviation: awayTeam.abbreviation,
      },
      simulationMode: gameMode
    };
    
    sessionStorage.setItem('currentGame', JSON.stringify(gameData));
    
    // Navigate to game with selected teams and mode
    navigate(`/game/simulation/${homeTeam.id}/${awayTeam.id}/${gameMode}`);
  };
  
  if (loading) {
    return (
      <Container>
        <Title>Loading teams...</Title>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <Title>Error</Title>
        <div style={{ color: '#F44336', textAlign: 'center' }}>{error}</div>
      </Container>
    );
  }
  
  // Render team ratings with loading state
  const renderTeamRatings = (team, ratings, isLoading, side) => {
    if (isLoading) {
      return (
        <TeamRatings>
          <div style={{ textAlign: 'center', padding: '20px' }}>Loading ratings...</div>
        </TeamRatings>
      );
    }
    
    if (!team || !ratings) {
      return null;
    }
    
    return (
      <TeamRatings>
        <RatingItem isOverall={true}>
          <RatingLabel isOverall={true}>Overall</RatingLabel>
          <RatingValue isOverall={true} value={ratings.overall}>{ratings.overall}</RatingValue>
        </RatingItem>
        <RatingItem>
          <RatingLabel>Offense</RatingLabel>
          <RatingValue value={ratings.offense}>{ratings.offense}</RatingValue>
        </RatingItem>
        <RatingItem>
          <RatingLabel>Defense</RatingLabel>
          <RatingValue value={ratings.defense}>{ratings.defense}</RatingValue>
        </RatingItem>
        <RatingItem>
          <RatingLabel>Special Teams</RatingLabel>
          <RatingValue value={ratings.specialTeams}>{ratings.specialTeams}</RatingValue>
        </RatingItem>
        <RatingItem>
          <RatingLabel>Goaltending</RatingLabel>
          <RatingValue value={ratings.goaltending}>{ratings.goaltending}</RatingValue>
        </RatingItem>
      </TeamRatings>
    );
  };
  
  return (
    <Container>
      <Title>Game Setup</Title>
      
      <div style={{ position: 'relative' }}>
        <TeamsContainer>
          <TeamSection side="away">
            <h2>Away Team</h2>
            
            <TeamSelectContainer>
              <label>League:</label>
              <StyledSelect 
                value={selectedAwayLeague} 
                onChange={handleAwayLeagueChange}
              >
                {availableLeagues.map(league => (
                  <option key={league.id} value={league.value}>
                    {league.display}
                  </option>
                ))}
              </StyledSelect>
            </TeamSelectContainer>
            
            <TeamSelectContainer>
              <label>Team:</label>
              <StyledSelect 
                value={awayTeamId} 
                onChange={handleAwayTeamChange}
              >
                <option value="">Select Team</option>
                {awayTeamsByLeague.map(team => (
                  <option key={team.id} value={team.id}>
                    {formatTeamName(team)}
                  </option>
                ))}
              </StyledSelect>
            </TeamSelectContainer>
            
            {awayTeam && (
              <>
                <TeamLogo hasLogo={getTeamLogo(awayTeam.abbreviation) && communityPack === 1}>
                  {getTeamLogo(awayTeam.abbreviation) && communityPack === 1 ? (
                    <TeamLogoImage src={getTeamLogo(awayTeam.abbreviation)} alt={`${awayTeam.team} logo`} />
                  ) : (
                    <TeamLogoPlaceholder>
                      <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{awayTeam.abbreviation}</div>
                      <div style={{ fontSize: '14px', marginTop: '5px' }}>{awayTeam.team}</div>
                    </TeamLogoPlaceholder>
                  )}
                </TeamLogo>
                
                {renderTeamRatings(awayTeam, awayTeamRatings, loadingAwayRatings, 'away')}
              </>
            )}
          </TeamSection>
          
          <TeamSection side="home">
            <h2>Home Team</h2>
            
            <TeamSelectContainer>
              <label>League:</label>
              <StyledSelect 
                value={selectedHomeLeague} 
                onChange={handleHomeLeagueChange}
              >
                {availableLeagues.map(league => (
                  <option key={league.id} value={league.value}>
                    {league.display}
                  </option>
                ))}
              </StyledSelect>
            </TeamSelectContainer>
            
            <TeamSelectContainer>
              <label>Team:</label>
              <StyledSelect 
                value={homeTeamId} 
                onChange={handleHomeTeamChange}
              >
                <option value="">Select Team</option>
                {homeTeamsByLeague.map(team => (
                  <option key={team.id} value={team.id}>
                    {formatTeamName(team)}
                  </option>
                ))}
              </StyledSelect>
            </TeamSelectContainer>
            
            {homeTeam && (
              <>
                <TeamLogo hasLogo={getTeamLogo(homeTeam.abbreviation) && communityPack === 1}>
                  {getTeamLogo(homeTeam.abbreviation) && communityPack === 1 ? (
                    <TeamLogoImage src={getTeamLogo(homeTeam.abbreviation)} alt={`${homeTeam.team} logo`} />
                  ) : (
                    <TeamLogoPlaceholder>
                      <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{homeTeam.abbreviation}</div>
                      <div style={{ fontSize: '14px', marginTop: '5px' }}>{homeTeam.team}</div>
                    </TeamLogoPlaceholder>
                  )}
                </TeamLogo>
                
                {renderTeamRatings(homeTeam, homeTeamRatings, loadingHomeRatings, 'home')}
              </>
            )}
          </TeamSection>
        </TeamsContainer>
        <div 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#C4CED4',
            backgroundColor: '#1e1e1e',
            padding: '15px 20px',
            borderRadius: '50%',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.5)'
          }}
        >
          VS
        </div>
      </div>
      
      <GameOptionsContainer>
        <h2>Game Options</h2>
        <GameModeGrid>
          {Object.entries(SIMULATION_MODES).map(([key, { label }]) => (
            <GameModeButton 
              key={key}
              selected={gameMode === key}
              onClick={() => handleGameModeSelect(key)}
            >
              {label}
            </GameModeButton>
          ))}
        </GameModeGrid>
        
        <GameModeDescription>
          {SIMULATION_MODES[gameMode].description}
        </GameModeDescription>
      </GameOptionsContainer>
      
      <StartGameButton 
        onClick={handleStartGame}
        disabled={!homeTeam || !awayTeam}
      >
        Start Game
      </StartGameButton>
    </Container>
  );
};

export default PreGame; 