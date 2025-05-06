import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import HockeyRink from './HockeyRink';
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

const SimulationContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #C4CED4;
  margin: 0;
`;

const GameInfo = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const TeamScore = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TeamName = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  color: #C4CED4;
`;

const Score = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #C4CED4;
`;

const TeamLogo = styled.div`
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
`;

const TeamLogoImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const TeamLogoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #333;
  border-radius: 50%;
  font-weight: bold;
  font-size: 1.2rem;
  color: #fff;
`;

const Versus = styled.div`
  font-size: 1.5rem;
  color: #aaa;
`;

const GameStatus = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
  background-color: #1e1e1e;
  padding: 10px;
  border-radius: 4px;
  color: #C4CED4;
`;

const StatusItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatusLabel = styled.div`
  font-size: 0.9rem;
  color: #aaa;
`;

const StatusValue = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
`;

const ControlPanel = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin: 20px 0;
`;

const Button = styled.button`
  background-color: #B30E16;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #950b12;
  }
  
  &:disabled {
    background-color: #666;
    cursor: not-allowed;
  }
`;

const EventLog = styled.div`
  background-color: #1e1e1e;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
  color: #C4CED4;
`;

const Event = styled.div`
  padding: 5px 0;
  border-bottom: 1px solid #333;
  
  &:last-child {
    border-bottom: none;
  }
`;

const EventTime = styled.span`
  color: #aaa;
  margin-right: 10px;
`;

const StatsPanel = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const TeamStats = styled.div`
  flex: 1;
  background-color: #1e1e1e;
  padding: 15px;
  border-radius: 4px;
  color: #C4CED4;
`;

const StatsTitle = styled.h3`
  margin-top: 0;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
  color: #C4CED4;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
`;

const StatLabel = styled.div`
  color: #aaa;
`;

const StatValue = styled.div`
  font-weight: bold;
`;

// Convert seconds to MM:SS format
const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Format period name
const formatPeriod = (period) => {
  if (period === 1) return '1st Period';
  if (period === 2) return '2nd Period';
  if (period === 3) return '3rd Period';
  if (period > 3) return `OT${period - 3}`;
  return '';
};

const GameSimulation = ({ gameId, homeTeam, awayTeam, simulationMode = 'fast_play_by_play' }) => {
  // State variables
  const [gameData, setGameData] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentPeriod, setCurrentPeriod] = useState(1);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [positions, setPositions] = useState(null);
  const communityPack = useSelector(selectCommunityPack);
  
  // Reference for animation frame
  const animationRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  
  // Function to get team logo
  const getTeamLogo = (teamAbbr) => {
    if (!teamAbbr) return null;
    
    try {
      // Normalize the team abbreviation to uppercase
      const normalizedAbbr = teamAbbr.toUpperCase();
      
      // Check if we have the logo in our imported collection and if community pack is enabled
      if (teamLogos[normalizedAbbr] && communityPack === 1) {
        return teamLogos[normalizedAbbr];
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error getting logo: ${error.message}`);
      return null;
    }
  };
  
  // Get home and away team names and abbreviations safely
  const homeTeamName = homeTeam?.name || (typeof homeTeam === 'string' ? homeTeam : 'Home Team');
  const awayTeamName = awayTeam?.name || (typeof awayTeam === 'string' ? awayTeam : 'Away Team');
  const homeTeamAbbr = homeTeam?.abbreviation || '';
  const awayTeamAbbr = awayTeam?.abbreviation || '';
  
  // Get team logos
  const homeTeamLogo = getTeamLogo(homeTeamAbbr);
  const awayTeamLogo = getTeamLogo(awayTeamAbbr);
  
  // Fetch game data on component mount
  useEffect(() => {
    const fetchGameData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // For now, we'll just simulate the data
        // In a real implementation, you would fetch actual simulation data from your backend
        
        // Create mock game data
        const mockGameData = {
          id: gameId || 'mock-game-1',
          homeTeam: {
            name: homeTeamName,
            abbreviation: homeTeamAbbr
          },
          awayTeam: {
            name: awayTeamName,
            abbreviation: awayTeamAbbr
          },
          periodLength: simulationMode === 'play_by_play' ? 1200 : 180, // 20 min or 3 min in seconds
          totalPeriods: 3,
          stats: {
            home: {
              shots: 0,
              saves: 0,
              faceoffsWon: 0,
              pim: 0,
              hits: 0,
              powerPlays: 0,
              powerPlayGoals: 0
            },
            away: {
              shots: 0,
              saves: 0,
              faceoffsWon: 0,
              pim: 0,
              hits: 0,
              powerPlays: 0,
              powerPlayGoals: 0
            }
          }
        };
        
        setGameData(mockGameData);
        
        // Generate mock events
        const mockEvents = generateMockEvents(mockGameData);
        setEvents(mockEvents);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching game data:', err);
        setError('Failed to load game data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchGameData();
    
    // Clean up animation on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameId, homeTeamName, awayTeamName, homeTeamAbbr, awayTeamAbbr, simulationMode]);
  
  // Generate mock events for the simulation
  const generateMockEvents = (game) => {
    const events = [];
    let time = 0;
    const periodLength = game.periodLength;
    const totalPeriods = game.totalPeriods;
    
    // Add period start events
    for (let period = 1; period <= totalPeriods; period++) {
      events.push({
        type: 'periodStart',
        period,
        time: (period - 1) * periodLength,
        description: `Start of ${formatPeriod(period)}`
      });
      
      // Add random game events throughout the period
      const numEvents = Math.floor(Math.random() * 15) + 10; // 10-25 events per period
      
      for (let i = 0; i < numEvents; i++) {
        const eventTime = (period - 1) * periodLength + Math.floor(Math.random() * periodLength);
        const eventType = getRandomEventType();
        
        events.push(createGameEvent(eventType, period, eventTime, game));
      }
      
      // Add period end event
      events.push({
        type: 'periodEnd',
        period,
        time: period * periodLength,
        description: `End of ${formatPeriod(period)}`
      });
    }
    
    // Sort events by time
    return events.sort((a, b) => a.time - b.time);
  };
  
  // Get a random event type
  const getRandomEventType = () => {
    const eventTypes = [
      'shot', 'shot', 'shot', 'shot', 'shot', // More frequent
      'goal', // Less frequent
      'penalty',
      'hit',
      'faceoff',
      'save', 'save', 'save', // More frequent
      'offside',
      'icing'
    ];
    
    return eventTypes[Math.floor(Math.random() * eventTypes.length)];
  };
  
  // Create a game event
  const createGameEvent = (type, period, time, game) => {
    const isHomeTeam = Math.random() > 0.5;
    const team = isHomeTeam ? game.homeTeam : game.awayTeam;
    const teamName = team.name;
    
    switch (type) {
      case 'shot':
        return {
          type,
          period,
          time,
          isHomeTeam,
          team: teamName,
          description: `Shot by ${teamName}`
        };
      case 'goal':
        return {
          type,
          period,
          time,
          isHomeTeam,
          team: teamName,
          description: `Goal scored by ${teamName}!`
        };
      case 'save':
        return {
          type,
          period,
          time,
          isHomeTeam: !isHomeTeam, // Save is by the opposing goalie
          team: isHomeTeam ? game.awayTeam.name : game.homeTeam.name,
          description: `Save by ${isHomeTeam ? game.awayTeam.name : game.homeTeam.name}`
        };
      case 'penalty':
        return {
          type,
          period,
          time,
          isHomeTeam,
          team: teamName,
          description: `Penalty called on ${teamName}`
        };
      case 'hit':
        return {
          type,
          period,
          time,
          isHomeTeam,
          team: teamName,
          description: `Hit by ${teamName}`
        };
      case 'faceoff':
        return {
          type,
          period,
          time,
          isHomeTeam,
          team: teamName,
          description: `Faceoff won by ${teamName}`
        };
      case 'offside':
        return {
          type,
          period,
          time,
          isHomeTeam,
          team: teamName,
          description: `Offside called on ${teamName}`
        };
      case 'icing':
        return {
          type,
          period,
          time,
          isHomeTeam,
          team: teamName,
          description: `Icing called on ${teamName}`
        };
      default:
        return {
          type: 'other',
          period,
          time,
          isHomeTeam,
          team: teamName,
          description: `Event by ${teamName}`
        };
    }
  };
  
  // Animation loop for simulation
  useEffect(() => {
    if (isPlaying && events.length > 0 && currentEventIndex < events.length) {
      const animate = (timestamp) => {
        if (!lastUpdateTimeRef.current) {
          lastUpdateTimeRef.current = timestamp;
        }
        
        const deltaTime = timestamp - lastUpdateTimeRef.current;
        
        if (deltaTime > 1000 / speed) {
          // Update simulation time
          const currentEvent = events[currentEventIndex];
          setElapsedTime(currentEvent.time);
          
          // Update period if necessary
          if (currentEvent.type === 'periodStart') {
            setCurrentPeriod(currentEvent.period);
          }
          
          // Process event
          processEvent(currentEvent);
          
          // Move to next event
          setCurrentEventIndex(prevIndex => prevIndex + 1);
          
          lastUpdateTimeRef.current = timestamp;
        }
        
        // Continue animation if there are more events
        if (currentEventIndex < events.length - 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setIsPlaying(false);
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, events, currentEventIndex, speed]);
  
  // Process an event and update game state
  const processEvent = (event) => {
    // Update stats based on event type
    if (gameData) {
      const newGameData = { ...gameData };
      const stats = newGameData.stats;
      
      if (event.isHomeTeam) {
        switch (event.type) {
          case 'shot':
            stats.home.shots += 1;
            break;
          case 'goal':
            setHomeScore(prevScore => prevScore + 1);
            stats.home.shots += 1;
            break;
          case 'save':
            stats.home.saves += 1;
            break;
          case 'penalty':
            stats.home.pim += 2;
            stats.away.powerPlays += 1;
            break;
          case 'hit':
            stats.home.hits += 1;
            break;
          case 'faceoff':
            stats.home.faceoffsWon += 1;
            break;
          default:
            break;
        }
      } else {
        switch (event.type) {
          case 'shot':
            stats.away.shots += 1;
            break;
          case 'goal':
            setAwayScore(prevScore => prevScore + 1);
            stats.away.shots += 1;
            break;
          case 'save':
            stats.away.saves += 1;
            break;
          case 'penalty':
            stats.away.pim += 2;
            stats.home.powerPlays += 1;
            break;
          case 'hit':
            stats.away.hits += 1;
            break;
          case 'faceoff':
            stats.away.faceoffsWon += 1;
            break;
          default:
            break;
        }
      }
      
      setGameData(newGameData);
    }
    
    // Update player positions for rink visualization
    if (event.type === 'shot' || event.type === 'goal' || event.type === 'save') {
      // Generate random player positions for visualization
      const newPositions = {
        home: Array.from({ length: 6 }, () => ({
          x: Math.random() * 100,
          y: Math.random() * 50
        })),
        away: Array.from({ length: 6 }, () => ({
          x: Math.random() * 100,
          y: 50 + Math.random() * 50
        })),
        puck: {
          x: Math.random() * 100,
          y: Math.random() * 100
        }
      };
      
      setPositions(newPositions);
    }
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    lastUpdateTimeRef.current = 0;
  };
  
  // Reset simulation
  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentEventIndex(0);
    setElapsedTime(0);
    setCurrentPeriod(1);
    setHomeScore(0);
    setAwayScore(0);
    
    if (gameData) {
      const resetData = { ...gameData };
      resetData.stats = {
        home: {
          shots: 0,
          saves: 0,
          faceoffsWon: 0,
          pim: 0,
          hits: 0,
          powerPlays: 0,
          powerPlayGoals: 0
        },
        away: {
          shots: 0,
          saves: 0,
          faceoffsWon: 0,
          pim: 0,
          hits: 0,
          powerPlays: 0,
          powerPlayGoals: 0
        }
      };
      
      setGameData(resetData);
    }
    
    setPositions(null);
    lastUpdateTimeRef.current = 0;
  };
  
  // Change simulation speed
  const changeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <SimulationContainer>
        <Title>Loading game data...</Title>
      </SimulationContainer>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <SimulationContainer>
        <Title>Error</Title>
        <div style={{ color: '#F44336' }}>{error}</div>
      </SimulationContainer>
    );
  }
  
  // Get visible events for the event log
  const visibleEvents = events.slice(0, currentEventIndex);
  const recentEvents = visibleEvents.slice(-10);
  
  return (
    <SimulationContainer>
      <Header>
        <Title>Game Simulation</Title>
        <GameInfo>
          <TeamScore>
            <TeamLogo>
              {homeTeamLogo ? (
                <TeamLogoImage src={homeTeamLogo} alt={`${homeTeamName} logo`} />
              ) : (
                <TeamLogoPlaceholder>{homeTeamAbbr}</TeamLogoPlaceholder>
              )}
            </TeamLogo>
            <TeamName>{homeTeamName}</TeamName>
            <Score>{homeScore}</Score>
          </TeamScore>
          
          <Versus>VS</Versus>
          
          <TeamScore>
            <TeamLogo>
              {awayTeamLogo ? (
                <TeamLogoImage src={awayTeamLogo} alt={`${awayTeamName} logo`} />
              ) : (
                <TeamLogoPlaceholder>{awayTeamAbbr}</TeamLogoPlaceholder>
              )}
            </TeamLogo>
            <TeamName>{awayTeamName}</TeamName>
            <Score>{awayScore}</Score>
          </TeamScore>
        </GameInfo>
      </Header>
      
      <GameStatus>
        <StatusItem>
          <StatusLabel>Period</StatusLabel>
          <StatusValue>{formatPeriod(currentPeriod)}</StatusValue>
        </StatusItem>
        
        <StatusItem>
          <StatusLabel>Time</StatusLabel>
          <StatusValue>
            {formatTime(
              gameData ? 
                gameData.periodLength - (elapsedTime % gameData.periodLength) :
                0
            )}
          </StatusValue>
        </StatusItem>
        
        <StatusItem>
          <StatusLabel>Shots</StatusLabel>
          <StatusValue>
            {gameData ? `${gameData.stats.home.shots} - ${gameData.stats.away.shots}` : '0 - 0'}
          </StatusValue>
        </StatusItem>
        
        <StatusItem>
          <StatusLabel>Faceoffs</StatusLabel>
          <StatusValue>
            {gameData ? `${gameData.stats.home.faceoffsWon} - ${gameData.stats.away.faceoffsWon}` : '0 - 0'}
          </StatusValue>
        </StatusItem>
      </GameStatus>
      
      {/* Hockey rink visualization only in play-by-play modes */}
      {(simulationMode === 'play_by_play' || simulationMode === 'fast_play_by_play') && (
        <HockeyRink 
          homeTeam={homeTeamName}
          awayTeam={awayTeamName}
          homeTeamAbbr={homeTeamAbbr}
          awayTeamAbbr={awayTeamAbbr}
          positions={positions}
        />
      )}
      
      <ControlPanel>
        <Button onClick={togglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        
        <Button onClick={resetSimulation}>
          Reset
        </Button>
        
        <Button 
          onClick={() => changeSpeed(1)}
          disabled={speed === 1}
        >
          1x
        </Button>
        
        <Button 
          onClick={() => changeSpeed(2)}
          disabled={speed === 2}
        >
          2x
        </Button>
        
        <Button 
          onClick={() => changeSpeed(4)}
          disabled={speed === 4}
        >
          4x
        </Button>
      </ControlPanel>
      
      <EventLog>
        {recentEvents.length === 0 ? (
          <div>No events yet. Press Play to start the simulation.</div>
        ) : (
          recentEvents.map((event, index) => (
            <Event key={index}>
              <EventTime>
                {formatPeriod(event.period)} - {formatTime(gameData.periodLength - (event.time % gameData.periodLength))}
              </EventTime>
              {event.description}
            </Event>
          ))
        )}
      </EventLog>
      
      <StatsPanel>
        <TeamStats>
          <StatsTitle>{homeTeamName}</StatsTitle>
          {gameData && (
            <>
              <StatRow>
                <StatLabel>Shots</StatLabel>
                <StatValue>{gameData.stats.home.shots}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Saves</StatLabel>
                <StatValue>{gameData.stats.home.saves}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Faceoffs Won</StatLabel>
                <StatValue>{gameData.stats.home.faceoffsWon}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>PIM</StatLabel>
                <StatValue>{gameData.stats.home.pim}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Hits</StatLabel>
                <StatValue>{gameData.stats.home.hits}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Power Plays</StatLabel>
                <StatValue>
                  {gameData.stats.home.powerPlayGoals}/{gameData.stats.home.powerPlays}
                </StatValue>
              </StatRow>
            </>
          )}
        </TeamStats>
        
        <TeamStats>
          <StatsTitle>{awayTeamName}</StatsTitle>
          {gameData && (
            <>
              <StatRow>
                <StatLabel>Shots</StatLabel>
                <StatValue>{gameData.stats.away.shots}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Saves</StatLabel>
                <StatValue>{gameData.stats.away.saves}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Faceoffs Won</StatLabel>
                <StatValue>{gameData.stats.away.faceoffsWon}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>PIM</StatLabel>
                <StatValue>{gameData.stats.away.pim}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Hits</StatLabel>
                <StatValue>{gameData.stats.away.hits}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Power Plays</StatLabel>
                <StatValue>
                  {gameData.stats.away.powerPlayGoals}/{gameData.stats.away.powerPlays}
                </StatValue>
              </StatRow>
            </>
          )}
        </TeamStats>
      </StatsPanel>
    </SimulationContainer>
  );
};

export default GameSimulation; 