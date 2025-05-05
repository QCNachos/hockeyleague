import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import HockeyRink from './HockeyRink';

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
  
  // Reference for animation frame
  const animationRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);
  
  // Load game data on component mount
  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setIsLoading(true);
        
        // In a production environment, this would make a real API call
        // For development without a connected backend, use mock data
        try {
          // Try to make the API call
          const response = await axios.post(`/api/games/simulate/${gameId}?mode=${simulationMode}`);
          setGameData(response.data);
          setEvents(response.data.events || []);
          
          // Initialize with the first positions
          if (response.data.positions) {
            setPositions(response.data.positions);
          }
        } catch (apiError) {
          console.warn('API call failed, using mock data', apiError);
          
          // Mock positions data for development
          const mockPositions = {
            "home": {
              "Player1": {"x": 10, "y": 50, "role": "center"},
              "Player2": {"x": 20, "y": 30, "role": "left_wing"},
              "Player3": {"x": 20, "y": 70, "role": "right_wing"},
              "Player4": {"x": 30, "y": 40, "role": "defense"},
              "Player5": {"x": 30, "y": 60, "role": "defense"},
              "Player6": {"x": 5, "y": 50, "role": "goalie"},
              "Player7": {"x": -10, "y": 20, "role": "bench"},
              "Player8": {"x": -10, "y": 25, "role": "bench"},
              "Player9": {"x": -10, "y": 30, "role": "bench"},
              "Player10": {"x": -10, "y": 35, "role": "bench"},
              "Player11": {"x": -10, "y": 40, "role": "bench"},
              "Player12": {"x": -10, "y": 45, "role": "backup_goalie"}
            },
            "away": {
              "Player1": {"x": 90, "y": 50, "role": "center"},
              "Player2": {"x": 80, "y": 30, "role": "left_wing"},
              "Player3": {"x": 80, "y": 70, "role": "right_wing"},
              "Player4": {"x": 70, "y": 40, "role": "defense"},
              "Player5": {"x": 70, "y": 60, "role": "defense"},
              "Player6": {"x": 95, "y": 50, "role": "goalie"},
              "Player7": {"x": 110, "y": 20, "role": "bench"},
              "Player8": {"x": 110, "y": 25, "role": "bench"},
              "Player9": {"x": 110, "y": 30, "role": "bench"},
              "Player10": {"x": 110, "y": 35, "role": "bench"},
              "Player11": {"x": 110, "y": 40, "role": "bench"},
              "Player12": {"x": 110, "y": 45, "role": "backup_goalie"}
            },
            "puck": {"x": 50, "y": 50, "possession": null}
          };
          
          // Mock events data
          const mockEvents = [];
          const periodLength = simulationMode === 'play_by_play' ? 1200 : 180;
          
          // Generate some random events
          for (let period = 1; period <= 3; period++) {
            // Add some shots
            for (let i = 0; i < 15; i++) {
              const time = Math.floor(Math.random() * periodLength);
              const team = Math.random() > 0.5 ? 'home' : 'away';
              const player = `Player${Math.floor(Math.random() * 5) + 1}`;
              
              mockEvents.push({
                type: 'shot',
                time,
                period,
                team,
                player,
                x: team === 'home' ? 70 + Math.random() * 20 : 10 + Math.random() * 20,
                y: 30 + Math.random() * 40
              });
            }
            
            // Add some goals
            for (let i = 0; i < 2; i++) {
              const time = Math.floor(Math.random() * periodLength);
              const team = Math.random() > 0.5 ? 'home' : 'away';
              const scorer = `Player${Math.floor(Math.random() * 5) + 1}`;
              const assist = `Player${Math.floor(Math.random() * 5) + 1}`;
              
              mockEvents.push({
                type: 'goal',
                time,
                period,
                team,
                scorer,
                assist,
                x: team === 'home' ? 90 : 10,
                y: 45 + Math.random() * 10
              });
            }
            
            // Add some penalties
            for (let i = 0; i < 3; i++) {
              const time = Math.floor(Math.random() * periodLength);
              const team = Math.random() > 0.5 ? 'home' : 'away';
              const player = `Player${Math.floor(Math.random() * 5) + 1}`;
              const penalty_types = ["tripping", "hooking", "interference", "slashing", "high-sticking"];
              
              mockEvents.push({
                type: 'penalty',
                time,
                period,
                team,
                player,
                penalty_type: penalty_types[Math.floor(Math.random() * penalty_types.length)],
                duration: 2
              });
            }
          }
          
          // Sort events by period and time
          mockEvents.sort((a, b) => {
            if (a.period !== b.period) return a.period - b.period;
            return a.time - b.time;
          });
          
          const mockGameData = {
            id: gameId,
            homeTeam: homeTeam,
            awayTeam: awayTeam,
            status: 'scheduled',
            events: mockEvents,
            positions: mockPositions
          };
          
          setGameData(mockGameData);
          setEvents(mockEvents);
          setPositions(mockPositions);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load game data');
        setIsLoading(false);
        console.error(err);
      }
    };
    
    fetchGameData();
    
    // Clean up animation frame on unmount
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameId, simulationMode, homeTeam, awayTeam]);
  
  // Animation loop
  useEffect(() => {
    if (!isPlaying || !events.length) return;
    
    const animate = (timestamp) => {
      if (!lastUpdateTimeRef.current) {
        lastUpdateTimeRef.current = timestamp;
      }
      
      const deltaTime = timestamp - lastUpdateTimeRef.current;
      
      // Update every X milliseconds based on speed
      if (deltaTime > 1000 / speed) {
        lastUpdateTimeRef.current = timestamp;
        
        // Increment time
        setElapsedTime(prevTime => {
          // Max time per period is 1200 seconds (20 min) or 180 seconds (3 min fast mode)
          const periodLength = simulationMode === 'play_by_play' ? 1200 : 180;
          
          // Calculate new time
          let newTime = prevTime + 1;
          
          // Check if period is complete
          if (newTime >= periodLength) {
            // Reset time for next period
            newTime = 0;
            
            // Increment period
            setCurrentPeriod(prevPeriod => {
              const nextPeriod = prevPeriod + 1;
              
              // Check if game is complete (3 periods)
              if (nextPeriod > 3) {
                setIsPlaying(false);
                return prevPeriod;
              }
              
              return nextPeriod;
            });
          }
          
          return newTime;
        });
        
        // Process events up to current time
        const currentTime = elapsedTime;
        const currentPeriodEvents = events.filter(
          event => event.period === currentPeriod && event.time <= currentTime
        );
        
        // Only update if we have new events to show
        if (currentPeriodEvents.length > currentEventIndex) {
          setCurrentEventIndex(currentPeriodEvents.length);
          
          // Update scores if goals were scored
          const goals = currentPeriodEvents.filter(event => event.type === 'goal');
          const homeGoals = goals.filter(event => event.team === 'home').length;
          const awayGoals = goals.filter(event => event.team === 'away').length;
          
          setHomeScore(homeGoals);
          setAwayScore(awayGoals);
          
          // Update positions based on the latest event
          if (currentPeriodEvents.length > 0) {
            const latestEvent = currentPeriodEvents[currentPeriodEvents.length - 1];
            
            // This is a simplification - in a real implementation, 
            // we would update positions based on event type and details
            if (gameData && gameData.positions) {
              // Deep clone positions to avoid mutation
              const updatedPositions = JSON.parse(JSON.stringify(gameData.positions));
              
              // Update puck position if it's a shot or goal
              if (latestEvent.type === 'shot' || latestEvent.type === 'goal') {
                updatedPositions.puck.x = latestEvent.x;
                updatedPositions.puck.y = latestEvent.y;
                
                // If it's a shot, update player position too
                if (latestEvent.type === 'shot' && latestEvent.player) {
                  const team = latestEvent.team;
                  updatedPositions[team][latestEvent.player].x = latestEvent.x;
                  updatedPositions[team][latestEvent.player].y = latestEvent.y;
                  updatedPositions.puck.possession = latestEvent.player;
                }
              }
              
              setPositions(updatedPositions);
            }
          }
        }
      }
      
      // Continue animation loop
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, events, currentEventIndex, elapsedTime, currentPeriod, simulationMode, gameData]);
  
  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    lastUpdateTimeRef.current = 0;
  };
  
  // Reset simulation
  const resetSimulation = () => {
    setIsPlaying(false);
    setElapsedTime(0);
    setCurrentPeriod(1);
    setHomeScore(0);
    setAwayScore(0);
    setCurrentEventIndex(0);
    
    // Reset positions to initial state
    if (gameData && gameData.positions) {
      setPositions(gameData.positions);
    }
    
    lastUpdateTimeRef.current = 0;
  };
  
  // Change simulation speed
  const changeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
  };
  
  // Calculate visible events (events that happened before current time)
  const visibleEvents = events.filter(
    event => event.period < currentPeriod || 
           (event.period === currentPeriod && event.time <= elapsedTime)
  );
  
  // If still loading, show loading indicator
  if (isLoading) {
    return <div>Loading game simulation...</div>;
  }
  
  // If there was an error, show error message
  if (error) {
    return <div>{error}</div>;
  }
  
  return (
    <SimulationContainer>
      <Header>
        <Title>Game Simulation</Title>
        <GameInfo>
          <TeamScore>
            <TeamName>{homeTeam || 'Home'}</TeamName>
            <Score>{homeScore}</Score>
          </TeamScore>
          <Versus>VS</Versus>
          <TeamScore>
            <TeamName>{awayTeam || 'Away'}</TeamName>
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
          <StatusValue>{formatTime(elapsedTime)}</StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Shots (Home)</StatusLabel>
          <StatusValue>
            {
              visibleEvents.filter(event => 
                event.type === 'shot' && event.team === 'home'
              ).length
            }
          </StatusValue>
        </StatusItem>
        <StatusItem>
          <StatusLabel>Shots (Away)</StatusLabel>
          <StatusValue>
            {
              visibleEvents.filter(event => 
                event.type === 'shot' && event.team === 'away'
              ).length
            }
          </StatusValue>
        </StatusItem>
      </GameStatus>
      
      <HockeyRink positions={positions} />
      
      <ControlPanel>
        <Button onClick={togglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={resetSimulation}>Reset</Button>
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
        {visibleEvents.length === 0 ? (
          <Event>No events yet</Event>
        ) : (
          [...visibleEvents].reverse().slice(0, 10).map((event, index) => (
            <Event key={index}>
              <EventTime>
                {formatPeriod(event.period)} - {formatTime(event.time)}
              </EventTime>
              {event.type === 'shot' && (
                `${event.team === 'home' ? homeTeam : awayTeam} - ${event.player} takes a shot`
              )}
              {event.type === 'goal' && (
                `GOAL! ${event.team === 'home' ? homeTeam : awayTeam} - ${event.scorer} scores! Assisted by ${event.assist}`
              )}
              {event.type === 'penalty' && (
                `PENALTY: ${event.team === 'home' ? homeTeam : awayTeam} - ${event.player} ${event.penalty_type}, ${event.duration} min`
              )}
              {event.type === 'face_off' && 'Face-off at center ice'}
            </Event>
          ))
        )}
      </EventLog>
      
      <StatsPanel>
        <TeamStats>
          <StatsTitle>{homeTeam || 'Home'} Stats</StatsTitle>
          <StatRow>
            <StatLabel>Shots</StatLabel>
            <StatValue>
              {
                visibleEvents.filter(event => 
                  (event.type === 'shot' || event.type === 'goal') && event.team === 'home'
                ).length
              }
            </StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>Goals</StatLabel>
            <StatValue>{homeScore}</StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>Penalties</StatLabel>
            <StatValue>
              {
                visibleEvents.filter(event => 
                  event.type === 'penalty' && event.team === 'home'
                ).length
              }
            </StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>Penalty Minutes</StatLabel>
            <StatValue>
              {
                visibleEvents.filter(event => 
                  event.type === 'penalty' && event.team === 'home'
                ).reduce((total, event) => total + (event.duration || 0), 0)
              }
            </StatValue>
          </StatRow>
        </TeamStats>
        
        <TeamStats>
          <StatsTitle>{awayTeam || 'Away'} Stats</StatsTitle>
          <StatRow>
            <StatLabel>Shots</StatLabel>
            <StatValue>
              {
                visibleEvents.filter(event => 
                  (event.type === 'shot' || event.type === 'goal') && event.team === 'away'
                ).length
              }
            </StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>Goals</StatLabel>
            <StatValue>{awayScore}</StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>Penalties</StatLabel>
            <StatValue>
              {
                visibleEvents.filter(event => 
                  event.type === 'penalty' && event.team === 'away'
                ).length
              }
            </StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>Penalty Minutes</StatLabel>
            <StatValue>
              {
                visibleEvents.filter(event => 
                  event.type === 'penalty' && event.team === 'away'
                ).reduce((total, event) => total + (event.duration || 0), 0)
              }
            </StatValue>
          </StatRow>
        </TeamStats>
      </StatsPanel>
    </SimulationContainer>
  );
};

export default GameSimulation; 