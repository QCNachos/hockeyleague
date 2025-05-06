import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GameSimulation from '../../components/games/GameSimulation';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  background-color: #333;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  cursor: pointer;
  
  &:hover {
    background-color: #444;
  }
`;

const LoadingIndicator = styled.div`
  text-align: center;
  color: #C4CED4;
  font-size: 18px;
  margin-top: 50px;
`;

const ErrorDisplay = styled.div`
  text-align: center;
  color: #F44336;
  font-size: 18px;
  margin-top: 50px;
  padding: 20px;
  background-color: rgba(244, 67, 54, 0.1);
  border-radius: 8px;
`;

const GameSimulationPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const [gameData, setGameData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Check for game data in session storage first
        const storedGameData = sessionStorage.getItem('currentGame');
        
        if (storedGameData) {
          const parsedData = JSON.parse(storedGameData);
          setGameData(parsedData);
          setLoading(false);
          return;
        }
        
        // If no session storage data, check URL parameters
        const { homeTeamId, awayTeamId, mode } = params;
        
        if (homeTeamId && awayTeamId) {
          // Fetch team data from Supabase
          const [homeTeamResponse, awayTeamResponse] = await Promise.all([
            supabase.from('Team').select('*').eq('id', homeTeamId).single(),
            supabase.from('Team').select('*').eq('id', awayTeamId).single()
          ]);
          
          if (homeTeamResponse.error) throw new Error(`Home team error: ${homeTeamResponse.error.message}`);
          if (awayTeamResponse.error) throw new Error(`Away team error: ${awayTeamResponse.error.message}`);
          
          const homeTeam = homeTeamResponse.data;
          const awayTeam = awayTeamResponse.data;
          
          // Create game data
          const newGameData = {
            id: `${Date.now()}`,
            homeTeam: {
              id: homeTeam.id,
              name: homeTeam.team,
              abbreviation: homeTeam.abbreviation
            },
            awayTeam: {
              id: awayTeam.id,
              name: awayTeam.team,
              abbreviation: awayTeam.abbreviation
            },
            simulationMode: mode || 'fast_play_by_play'
          };
          
          setGameData(newGameData);
          
          // Store the data in session storage for potential refreshes
          sessionStorage.setItem('currentGame', JSON.stringify(newGameData));
        } else {
          throw new Error('Missing team information in URL');
        }
      } catch (err) {
        console.error('Error loading game data:', err);
        setError(err.message || 'Failed to load game data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params]);
  
  const handleBack = () => {
    // Clear the stored game data when going back
    sessionStorage.removeItem('currentGame');
    navigate('/game/pre-game');
  };
  
  if (loading) {
    return (
      <Container>
        <BackButton onClick={handleBack}>Back to Game Setup</BackButton>
        <LoadingIndicator>Loading game data...</LoadingIndicator>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container>
        <BackButton onClick={handleBack}>Back to Game Setup</BackButton>
        <ErrorDisplay>{error}</ErrorDisplay>
      </Container>
    );
  }
  
  if (!gameData) {
    return (
      <Container>
        <BackButton onClick={handleBack}>Back to Game Setup</BackButton>
        <ErrorDisplay>No game data available. Please set up a new game.</ErrorDisplay>
      </Container>
    );
  }
  
  return (
    <Container>
      <BackButton onClick={handleBack}>Back to Game Setup</BackButton>
      <GameSimulation 
        gameId={gameData.id}
        homeTeam={gameData.homeTeam}
        awayTeam={gameData.awayTeam}
        simulationMode={gameData.simulationMode}
      />
    </Container>
  );
};

export default GameSimulationPage; 