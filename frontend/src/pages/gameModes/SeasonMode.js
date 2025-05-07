import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import * as seasonService from '../../services/seasonService';

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: #C4CED4;
`;

const Description = styled.p`
  margin-bottom: 30px;
  color: #aaa;
  line-height: 1.6;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const OptionCard = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  h3 {
    color: #B30E16;
    margin-bottom: 15px;
  }
  
  p {
    color: #bbb;
    margin-bottom: 20px;
  }
`;

const Button = styled.button`
  background-color: #B30E16;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #950b12;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const ActionButton = styled(Link)`
  display: inline-block;
  background-color: #B30E16;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #950b12;
  }
`;

const Tab = styled.div`
  display: inline-block;
  padding: 10px 20px;
  cursor: pointer;
  margin-right: 5px;
  border-radius: 4px 4px 0 0;
  background-color: ${props => props.active ? '#1e1e1e' : '#151515'};
  color: ${props => props.active ? '#B30E16' : '#aaa'};
  border-bottom: ${props => props.active ? '2px solid #B30E16' : 'none'};
  
  &:hover {
    background-color: #1e1e1e;
  }
`;

const TabContent = styled.div`
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 0 4px 4px 4px;
  min-height: 300px;
`;

const DeleteButton = styled.button`
  background-color: #8B0000;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  margin-left: 10px;
  
  &:hover {
    background-color: #6B0000;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SeasonMode = () => {
  const [activeTab, setActiveTab] = useState('start');
  const [savedSeasons, setSavedSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load saved seasons when the component mounts
  useEffect(() => {
    loadSeasons();
  }, []);
  
  const loadSeasons = async () => {
    try {
      const { success, data } = await seasonService.getAllSeasons();
      if (success) {
        setSavedSeasons(data);
      }
    } catch (error) {
      console.error('Error loading seasons:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Add function to handle season deletion
  const handleDeleteSeason = async (seasonId, seasonName) => {
    if (window.confirm(`Are you sure you want to delete the season "${seasonName}"? This action cannot be undone.`)) {
      try {
        const { success, error } = await seasonService.deleteSeason(seasonId);
        
        if (success) {
          // Reload seasons after deletion
          loadSeasons();
        } else {
          alert(`Failed to delete season: ${error}`);
        }
      } catch (error) {
        console.error('Error deleting season:', error);
        alert('An unexpected error occurred while deleting the season');
      }
    }
  };
  
  return (
    <Container>
      <Title>Season Mode</Title>
      <Description>
        Play through a complete hockey season with your favorite team. Control game scheduling,
        manage the day-to-day operations of your team, and compete for the playoffs and championship.
        Focus on the on-ice action while still maintaining control of key team decisions throughout 
        the season.
      </Description>
      
      <div>
        <Tab active={activeTab === 'start'} onClick={() => setActiveTab('start')}>Start New Season</Tab>
        <Tab active={activeTab === 'continue'} onClick={() => setActiveTab('continue')}>Continue Season</Tab>
        <Tab active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Settings</Tab>
      </div>
      
      <TabContent>
        {activeTab === 'start' && (
          <>
            <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>Start a New Season</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>Choose your season format and begin your journey.</p>
            
            <OptionsGrid>
              <OptionCard>
                <h3>Standard Season</h3>
                <p>
                  Play a full-length regular season with your chosen team.
                  Compete through the 82-game schedule and aim for the playoffs.
                </p>
                <ActionButton to="/season/create/standard">Start Standard Season</ActionButton>
              </OptionCard>
              
              <OptionCard>
                <h3>Short Season</h3>
                <p>
                  Play a shortened 28-game season for a quicker experience.
                  Perfect for those who want to reach the playoffs faster.
                </p>
                <ActionButton to="/season/create/short">Start Short Season</ActionButton>
              </OptionCard>
              
              <OptionCard>
                <h3>Playoff Season</h3>
                <p>
                  Skip the regular season entirely and jump straight into the
                  playoffs with pre-determined seedings based on team ratings.
                </p>
                <ActionButton to="/season/create/playoffs">Start Playoff Season</ActionButton>
              </OptionCard>
              
              <OptionCard>
                <h3>Historical Season</h3>
                <p>
                  Relive a historical NHL season from the past. Choose a specific year
                  and team to rewrite hockey history.
                </p>
                <Button disabled>Coming Soon</Button>
              </OptionCard>
            </OptionsGrid>
          </>
        )}
        
        {activeTab === 'continue' && (
          <>
            <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>Continue Season</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>Resume a saved season in progress.</p>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>Loading saved seasons...</div>
            ) : savedSeasons.length === 0 ? (
              <div style={{ color: '#aaa', textAlign: 'center', marginTop: '50px' }}>
                <p>No saved seasons found.</p>
                <p>Start a new season to begin your journey.</p>
              </div>
            ) : (
              <OptionsGrid>
                {savedSeasons.map(season => (
                  <OptionCard key={season.id}>
                    <h3>{season.name}</h3>
                    <p>
                      {season.type === 'standard' ? 'Standard Season' : 'Custom Season'}<br />
                      Team: {season.selectedTeam?.name || 'Unknown'}<br />
                      Created: {new Date(season.createdAt).toLocaleDateString()}
                    </p>
                    <ButtonGroup>
                      <ActionButton to={`/season/dashboard/${season.id}`}>Continue Season</ActionButton>
                      <DeleteButton onClick={() => handleDeleteSeason(season.id, season.name)}>
                        Delete
                      </DeleteButton>
                    </ButtonGroup>
                  </OptionCard>
                ))}
              </OptionsGrid>
            )}
          </>
        )}
        
        {activeTab === 'settings' && (
          <>
            <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>Season Settings</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>
              Configure your season settings before starting a new save.
            </p>
            
            <OptionsGrid>
              <OptionCard>
                <h3>Game Simulation Speed</h3>
                <p>
                  Adjust how quickly games are simulated in your season.
                  Choose between quick results or more detailed simulations.
                </p>
                <Button disabled>Coming Soon</Button>
              </OptionCard>
              
              <OptionCard>
                <h3>Injuries & Fatigue</h3>
                <p>
                  Configure how injuries and player fatigue affect your season.
                  Higher settings mean more realistic but challenging gameplay.
                </p>
                <Button disabled>Coming Soon</Button>
              </OptionCard>
            </OptionsGrid>
          </>
        )}
      </TabContent>
    </Container>
  );
};

export default SeasonMode; 