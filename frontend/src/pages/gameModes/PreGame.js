import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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
  justify-content: space-between;
  gap: 40px;
  margin: 30px 0;
  flex: 1;
`;

const TeamSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: ${props => props.side === 'home' ? 'rgba(179, 14, 22, 0.1)' : 'rgba(13, 72, 116, 0.1)'};
  border-radius: 10px;
  border: 2px solid ${props => props.side === 'home' ? '#B30E16' : '#0D4874'};
  position: relative;
`;

const VersusLabel = styled.div`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  font-size: 36px;
  font-weight: bold;
  color: #C4CED4;
  background-color: #1e1e1e;
  padding: 15px 20px;
  border-radius: 50%;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
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
  background-color: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  margin: 20px 0;
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
  
  &:last-child {
    border-bottom: none;
  }
`;

const RatingLabel = styled.span`
  font-weight: bold;
  color: #aaa;
`;

const RatingValue = styled.span`
  font-weight: bold;
  color: ${props => {
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
  const [homeTeam, setHomeTeam] = useState(null);
  const [awayTeam, setAwayTeam] = useState(null);
  const [gameMode, setGameMode] = useState('fast_play_by_play');
  
  // Mock team data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTeams([
        {
          id: 1,
          name: 'Toronto Maple Leafs',
          abbreviation: 'TOR',
          logoUrl: '',
          ratings: {
            overall: 87,
            offense: 90,
            defense: 84,
            specialTeams: 86,
            goaltending: 88
          }
        },
        {
          id: 2,
          name: 'Montreal Canadiens',
          abbreviation: 'MTL',
          logoUrl: '',
          ratings: {
            overall: 83,
            offense: 82,
            defense: 83,
            specialTeams: 81,
            goaltending: 85
          }
        },
        {
          id: 3,
          name: 'Boston Bruins',
          abbreviation: 'BOS',
          logoUrl: '',
          ratings: {
            overall: 89,
            offense: 88,
            defense: 89,
            specialTeams: 87,
            goaltending: 91
          }
        },
        {
          id: 4,
          name: 'New York Rangers',
          abbreviation: 'NYR',
          logoUrl: '',
          ratings: {
            overall: 85,
            offense: 86,
            defense: 82,
            specialTeams: 84,
            goaltending: 89
          }
        }
      ]);
      setLoading(false);
      
      // Set default teams
      setHomeTeam({
        id: 1,
        name: 'Toronto Maple Leafs',
        abbreviation: 'TOR',
        logoUrl: '',
        ratings: {
          overall: 87,
          offense: 90,
          defense: 84,
          specialTeams: 86,
          goaltending: 88
        }
      });
      
      setAwayTeam({
        id: 2,
        name: 'Montreal Canadiens',
        abbreviation: 'MTL',
        logoUrl: '',
        ratings: {
          overall: 83,
          offense: 82,
          defense: 83,
          specialTeams: 81,
          goaltending: 85
        }
      });
    }, 500);
  }, []);

  const handleHomeTeamChange = (e) => {
    const selectedTeam = teams.find(team => team.id === parseInt(e.target.value));
    setHomeTeam(selectedTeam);
  };

  const handleAwayTeamChange = (e) => {
    const selectedTeam = teams.find(team => team.id === parseInt(e.target.value));
    setAwayTeam(selectedTeam);
  };

  const handleGameModeSelect = (mode) => {
    setGameMode(mode);
  };

  const handleStartGame = () => {
    if (!homeTeam || !awayTeam || !gameMode) return;
    
    // Create a game object to pass to the simulation screen
    const gameData = {
      id: Date.now(), // Temporary ID for demo
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      simulationMode: gameMode
    };
    
    // Store game data in session storage for the simulation screen
    sessionStorage.setItem('currentGame', JSON.stringify(gameData));
    
    // Navigate to the simulation screen
    navigate('/game/simulation');
  };

  if (loading) {
    return (
      <Container>
        <Title>Loading teams...</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Game Setup</Title>
      
      <TeamsContainer>
        <TeamSection side="home">
          <h2>Home Team</h2>
          <TeamSelectContainer>
            <StyledSelect 
              value={homeTeam ? homeTeam.id : ''}
              onChange={handleHomeTeamChange}
            >
              <option value="" disabled>Select Home Team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </StyledSelect>
          </TeamSelectContainer>
          
          {homeTeam && (
            <>
              <TeamLogo>
                {homeTeam.abbreviation}
              </TeamLogo>
              <TeamRatings>
                <RatingItem>
                  <RatingLabel>Overall</RatingLabel>
                  <RatingValue value={homeTeam.ratings.overall}>{homeTeam.ratings.overall}</RatingValue>
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
        
        <VersusLabel>VS</VersusLabel>
        
        <TeamSection side="away">
          <h2>Away Team</h2>
          <TeamSelectContainer>
            <StyledSelect 
              value={awayTeam ? awayTeam.id : ''}
              onChange={handleAwayTeamChange}
            >
              <option value="" disabled>Select Away Team</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </StyledSelect>
          </TeamSelectContainer>
          
          {awayTeam && (
            <>
              <TeamLogo>
                {awayTeam.abbreviation}
              </TeamLogo>
              <TeamRatings>
                <RatingItem>
                  <RatingLabel>Overall</RatingLabel>
                  <RatingValue value={awayTeam.ratings.overall}>{awayTeam.ratings.overall}</RatingValue>
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
      </TeamsContainer>
      
      <GameOptionsContainer>
        <h2>Simulation Mode</h2>
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
        
        {gameMode && (
          <GameModeDescription>
            {SIMULATION_MODES[gameMode].description}
          </GameModeDescription>
        )}
      </GameOptionsContainer>
      
      <StartGameButton 
        onClick={handleStartGame}
        disabled={!homeTeam || !awayTeam || !gameMode}
      >
        Start Game
      </StartGameButton>
    </Container>
  );
};

export default PreGame; 