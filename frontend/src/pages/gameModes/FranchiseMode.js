import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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

const FranchiseMode = () => {
  const [activeTab, setActiveTab] = useState('start');
  
  return (
    <Container>
      <Title>Franchise Mode</Title>
      <Description>
        Take control of your favorite NHL team or create a custom franchise in our comprehensive Franchise Mode.
        Manage every aspect of your organization including rosters, scouting, drafting, trading, contract negotiations,
        and more. Build a dynasty and compete for the Stanley Cup over multiple seasons.
      </Description>
      
      <div>
        <Tab active={activeTab === 'start'} onClick={() => setActiveTab('start')}>Start New Franchise</Tab>
        <Tab active={activeTab === 'continue'} onClick={() => setActiveTab('continue')}>Continue Franchise</Tab>
        <Tab active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Settings</Tab>
      </div>
      
      <TabContent>
        {activeTab === 'start' && (
          <>
            <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>Start a New Franchise</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>Create a new franchise and begin your journey as a GM.</p>
            
            <OptionsGrid>
              <OptionCard>
                <h3>Standard Franchise</h3>
                <p>
                  Take control of an existing NHL team with current rosters.
                  Manage your way to the Stanley Cup with authentic players, teams, and rules.
                </p>
                <ActionButton to="/franchise/create/standard">Start Standard</ActionButton>
              </OptionCard>
              
              <OptionCard>
                <h3>Expansion Franchise</h3>
                <p>
                  Create a brand new 33rd team in the NHL and build your roster through
                  an expansion draft. Design your team identity, arena, and more.
                </p>
                <ActionButton to="/franchise/create/expansion">Start Expansion</ActionButton>
              </OptionCard>
              
              <OptionCard>
                <h3>Junior Franchise</h3>
                <p>
                  Take control of a junior hockey league team and develop the next generation
                  of hockey superstars. Focus on player development.
                </p>
                <Button disabled>Coming Soon</Button>
              </OptionCard>
              
              <OptionCard>
                <h3>Historical Franchise</h3>
                <p>
                  Begin a franchise with historical rosters from past seasons.
                  Relive the glory days of your favorite team or rewrite history.
                </p>
                <Button disabled>Coming Soon</Button>
              </OptionCard>
            </OptionsGrid>
          </>
        )}
        
        {activeTab === 'continue' && (
          <>
            <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>Continue Franchise</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>Resume your existing franchise save files.</p>
            
            <div style={{ color: '#aaa', textAlign: 'center', marginTop: '50px' }}>
              <p>No saved franchises found.</p>
              <p>Start a new franchise to begin your GM journey.</p>
            </div>
          </>
        )}
        
        {activeTab === 'settings' && (
          <>
            <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>Franchise Settings</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>
              Configure your franchise mode settings before starting a new save.
              These settings cannot be changed once a franchise is created.
            </p>
            
            <div style={{ color: '#aaa', textAlign: 'center', marginTop: '50px' }}>
              <p>Settings functionality coming soon.</p>
            </div>
          </>
        )}
      </TabContent>
    </Container>
  );
};

export default FranchiseMode; 