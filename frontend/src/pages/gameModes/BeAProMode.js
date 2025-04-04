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

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
`;

const Tab = styled.div`
  padding: 15px 20px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
  background-color: ${props => props.active === 'true' ? '#1e1e1e' : '#151515'};
  color: ${props => props.active === 'true' ? '#B30E16' : '#aaa'};
  border-bottom: ${props => props.active === 'true' ? '2px solid #B30E16' : 'none'};
  
  &:hover {
    color: #B30E16;
  }
`;

const TabContent = styled.div`
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 0 4px 4px 4px;
  min-height: 300px;
`;

const BeAProMode = () => {
  const [activeTab, setActiveTab] = useState('create');
  
  return (
    <Container>
      <Title>Be a Pro Mode</Title>
      <Description>
        Create your own custom player and live the life of a professional hockey player.
        Start as a promising prospect, get drafted or sign as a free agent, and build your career
        towards becoming a league superstar and Hall of Fame legend. Make key decisions, improve 
        your skills, negotiate contracts, and experience hockey from a player's perspective.
      </Description>
      
      <TabContainer>
        <Tab active={(activeTab === 'create').toString()} onClick={() => setActiveTab('create')}>Create New Player</Tab>
        <Tab active={(activeTab === 'continue').toString()} onClick={() => setActiveTab('continue')}>Continue Career</Tab>
        <Tab active={(activeTab === 'settings').toString()} onClick={() => setActiveTab('settings')}>Settings</Tab>
      </TabContainer>
      
      <TabContent>
        {activeTab === 'create' && (
          <>
            <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>Create Your Player</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>Begin your journey by creating your hockey player and starting a new career.</p>
            
            <OptionsGrid>
              <OptionCard>
                <h3>Minor</h3>
                <p>
                  Start your career from its earliest stage in minor hockey.
                  Build your player from the ground up with the longest possible development path.
                </p>
                <ActionButton to="/be-a-pro/create/minor">Start in Minors</ActionButton>
              </OptionCard>
              
              <OptionCard>
                <h3>Sub-Junior</h3>
                <p>
                  Begin in sub-junior leagues as a developing prospect.
                  Work your way up through the ranks with more development time before the draft.
                </p>
                <ActionButton to="/be-a-pro/create/sub-junior">Start in Sub-Junior</ActionButton>
              </OptionCard>
              
              <OptionCard>
                <h3>Junior</h3>
                <p>
                  Start in major junior leagues like the CHL. Develop your skills and
                  improve your draft stock before making the jump to professional hockey.
                </p>
                <ActionButton to="/be-a-pro/create/junior">Start in Junior</ActionButton>
              </OptionCard>
              
              <OptionCard>
                <h3>Pro (Undrafted)</h3>
                <p>
                  Begin your career in professional hockey without being drafted.
                  Prove yourself in minor pro leagues to earn an NHL contract.
                </p>
                <ActionButton to="/be-a-pro/create/pro-undrafted">Start as Undrafted Pro</ActionButton>
              </OptionCard>
              
              <OptionCard>
                <h3>Pro (Drafted)</h3>
                <p>
                  Start with a player already in the NHL with established skills.
                  Choose your team and position in the lineup for immediate NHL action.
                </p>
                <ActionButton to="/be-a-pro/create/nhl-ready">Start as Drafted Pro</ActionButton>
              </OptionCard>
            </OptionsGrid>
          </>
        )}
        
        {activeTab === 'continue' && (
          <>
            <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>Continue Career</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>Resume your existing Be a Pro career.</p>
            
            <div style={{ color: '#aaa', textAlign: 'center', marginTop: '50px' }}>
              <p>No saved careers found.</p>
              <p>Create a new player to begin your professional hockey journey.</p>
            </div>
          </>
        )}
        
        {activeTab === 'settings' && (
          <>
            <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>Career Settings</h2>
            <p style={{ color: '#aaa', marginBottom: '30px' }}>
              Configure your Be a Pro career settings. These options determine how your 
              player develops and how challenging your career path will be.
            </p>
            
            <OptionsGrid>
              <OptionCard>
                <h3>Career Difficulty</h3>
                <p>
                  Adjust how challenging your career progression will be. 
                  Higher difficulties mean slower skill development and more demanding coaches.
                </p>
                <Button disabled>Coming Soon</Button>
              </OptionCard>
              
              <OptionCard>
                <h3>Gameplay Style</h3>
                <p>
                  Choose between a simulation-focused experience or more arcade-style gameplay
                  with your player.
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

export default BeAProMode; 