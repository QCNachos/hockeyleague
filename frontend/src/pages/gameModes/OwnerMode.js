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

const OwnerMode = () => {
  const [activeTab, setActiveTab] = useState('start');
  
  return (
    <Container>
      <Title>Owner Mode</Title>
      <Description>
        Take ownership of a hockey franchise and guide it to financial and competitive success.
        As the owner, you'll control ticket prices, arena renovations, marketing campaigns,
        merchandise sales, and team budgets while setting goals for your General Manager.
        Build your team's brand, expand your fan base, and transform your franchise into a hockey dynasty.
      </Description>
      
      <div>
        <Tab active={activeTab === 'start'} onClick={() => setActiveTab('start')}>Start New Ownership</Tab>
        <Tab active={activeTab === 'continue'} onClick={() => setActiveTab('continue')}>Continue Ownership</Tab>
        <Tab active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Settings</Tab>
      </div>
      
      <TabContent>
        {activeTab === 'start' && (
          <>
            <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>Start as a New Owner</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>Select how you want to begin your ownership journey.</p>
            
            <OptionsGrid>
              <OptionCard>
                <h3>Buy Existing Team</h3>
                <p>
                  Purchase an existing NHL franchise and take control of its operations.
                  Each team has different financial situations, fan bases, and market sizes.
                </p>
                <ActionButton to="/owner/create/existing">Buy a Team</ActionButton>
              </OptionCard>
              
              <OptionCard>
                <h3>Expansion Franchise</h3>
                <p>
                  Create a brand new franchise from the ground up. Design your team's
                  identity, build a new arena, and establish your team in a new market.
                </p>
                <ActionButton to="/owner/create/expansion">Start Expansion</ActionButton>
              </OptionCard>
              
              <OptionCard>
                <h3>Financial Challenge</h3>
                <p>
                  Take over a struggling franchise with financial problems and turn it around.
                  Balance the budget, increase attendance, and restore profitability.
                </p>
                <ActionButton to="/owner/create/challenge">Accept Challenge</ActionButton>
              </OptionCard>
              
              <OptionCard>
                <h3>Billionaire Mode</h3>
                <p>
                  Start with unlimited funds and build a hockey empire without financial constraints.
                  Focus on hockey operations with no budget limitations.
                </p>
                <ActionButton to="/owner/create/billionaire">Start as Billionaire</ActionButton>
              </OptionCard>
            </OptionsGrid>
          </>
        )}
        
        {activeTab === 'continue' && (
          <>
            <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>Continue Ownership</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>Resume managing your hockey franchise.</p>
            
            <div style={{ color: '#aaa', textAlign: 'center', marginTop: '50px' }}>
              <p>No saved ownership data found.</p>
              <p>Start a new ownership to begin your journey as a team owner.</p>
            </div>
          </>
        )}
        
        {activeTab === 'settings' && (
          <>
            <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>Ownership Settings</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>
              Configure settings for your ownership experience before starting a new save.
            </p>
            
            <OptionsGrid>
              <OptionCard>
                <h3>Financial Difficulty</h3>
                <p>
                  Adjust how challenging the financial aspects will be. Higher difficulties
                  mean more demanding financial goals and tougher market conditions.
                </p>
                <Button disabled>Coming Soon</Button>
              </OptionCard>
              
              <OptionCard>
                <h3>Owner Involvement</h3>
                <p>
                  Set how hands-on you want to be as an owner. Higher involvement means
                  more control but also more responsibilities in day-to-day operations.
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

export default OwnerMode; 