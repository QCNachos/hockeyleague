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
        
        // Process teams with ratings
        const enhancedTeams = teamsData.map(team => ({
          ...team,
          id: team.id,
          name: team.team,
          abbreviation: team.abbreviation,
          logoUrl: '',
          ratings: {
            overall: Math.floor(Math.random() * 10) + 80, // Simulate ratings until we have real data
            offense: Math.floor(Math.random() * 10) + 80,
            defense: Math.floor(Math.random() * 10) + 80,
            specialTeams: Math.floor(Math.random() * 10) + 80,
            goaltending: Math.floor(Math.random() * 10) + 80
          }
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
      // Normalize the team abbreviation to uppercase
      const normalizedAbbr = teamAbbr.toUpperCase();
      
      // Check if we have the logo in our imported collection
      if (teamLogos[normalizedAbbr] && (communityPack === 1)) {
        return teamLogos[normalizedAbbr];
      } else {
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
  };
  
  const handleAwayLeagueChange = (e) => {
    const newLeague = e.target.value;
    setSelectedAwayLeague(newLeague);
    setAwayTeamId('');
    setAwayTeam(null);
  };
  
  // Handle team selection
  const handleHomeTeamChange = (e) => {
    const id = parseInt(e.target.value);
    setHomeTeamId(id);
    const team = teams.find(t => t.id === id);
    setHomeTeam(team);
  };
  
  const handleAwayTeamChange = (e) => {
    const id = parseInt(e.target.value);
    setAwayTeamId(id);
    const team = teams.find(t => t.id === id);
    setAwayTeam(team);
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
                
                <TeamRatings>
                  <RatingItem isOverall={true}>
                    <RatingLabel isOverall={true}>Overall</RatingLabel>
                    <RatingValue isOverall={true} value={awayTeam.ratings.overall}>{awayTeam.ratings.overall}</RatingValue>
                  </RatingItem>
                  <RatingItem>
                    <RatingLabel>Offense</RatingLabel>
                    <RatingValue value={awayTeam.ratings.offense}>{awayTeam.ratings.offense}</RatingValue>
                  </RatingItem>
                  <RatingItem>
                    <RatingLabel>Defense</RatingLabel>
                    <RatingValue value={awayTeam.ratings.defense}>{awayTeam.ratings.defense}</RatingValue>
                  </RatingItem>
                  <RatingItem>
                    <RatingLabel>Special Teams</RatingLabel>
                    <RatingValue value={awayTeam.ratings.specialTeams}>{awayTeam.ratings.specialTeams}</RatingValue>
                  </RatingItem>
                  <RatingItem>
                    <RatingLabel>Goaltending</RatingLabel>
                    <RatingValue value={awayTeam.ratings.goaltending}>{awayTeam.ratings.goaltending}</RatingValue>
                  </RatingItem>
                </TeamRatings>
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
                
                <TeamRatings>
                  <RatingItem isOverall={true}>
                    <RatingLabel isOverall={true}>Overall</RatingLabel>
                    <RatingValue isOverall={true} value={homeTeam.ratings.overall}>{homeTeam.ratings.overall}</RatingValue>
                  </RatingItem>
                  <RatingItem>
                    <RatingLabel>Offense</RatingLabel>
                    <RatingValue value={homeTeam.ratings.offense}>{homeTeam.ratings.offense}</RatingValue>
                  </RatingItem>
                  <RatingItem>
                    <RatingLabel>Defense</RatingLabel>
                    <RatingValue value={homeTeam.ratings.defense}>{homeTeam.ratings.defense}</RatingValue>
                  </RatingItem>
                  <RatingItem>
                    <RatingLabel>Special Teams</RatingLabel>
                    <RatingValue value={homeTeam.ratings.specialTeams}>{homeTeam.ratings.specialTeams}</RatingValue>
                  </RatingItem>
                  <RatingItem>
                    <RatingLabel>Goaltending</RatingLabel>
                    <RatingValue value={homeTeam.ratings.goaltending}>{homeTeam.ratings.goaltending}</RatingValue>
                  </RatingItem>
                </TeamRatings>
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