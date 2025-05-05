import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameSimulation from '../../components/games/GameSimulation';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
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

const GameSimulationPage = () => {
  const navigate = useNavigate();
  const [gameData, setGameData] = useState(null);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Retrieve game data from session storage
    const storedGameData = sessionStorage.getItem('currentGame');
    
    if (storedGameData) {
      try {
        const parsedData = JSON.parse(storedGameData);
        setGameData(parsedData);
      } catch (err) {
        setError('Failed to load game data');
        console.error('Error parsing game data:', err);
      }
    } else {
      setError('No game data found');
    }
  }, []);
  
  const handleBack = () => {
    navigate('/game/pre-game');
  };
  
  if (error) {
    return (
      <Container>
        <BackButton onClick={handleBack}>Back to Game Setup</BackButton>
        <div>{error}</div>
      </Container>
    );
  }
  
  if (!gameData) {
    return (
      <Container>
        <BackButton onClick={handleBack}>Back to Game Setup</BackButton>
        <div>Loading game data...</div>
      </Container>
    );
  }
  
  return (
    <Container>
      <BackButton onClick={handleBack}>Back to Game Setup</BackButton>
      <GameSimulation 
        gameId={gameData.id}
        homeTeam={gameData.homeTeam.name}
        awayTeam={gameData.awayTeam.name}
        simulationMode={gameData.simulationMode}
      />
    </Container>
  );
};

export default GameSimulationPage; 