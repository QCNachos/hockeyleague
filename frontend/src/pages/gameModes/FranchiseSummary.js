import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

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

const SummaryContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummarySection = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
`;

const SectionTitle = styled.h3`
  color: #C4CED4;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
`;

const SummaryList = styled.div`
  margin-bottom: 20px;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dotted #333;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ItemLabel = styled.span`
  color: #aaa;
`;

const ItemValue = styled.span`
  color: #fff;
  font-weight: bold;
`;

const TeamCardsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const TeamCard = styled.div`
  display: flex;
  align-items: center;
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 15px;
  border-left: 5px solid #B30E16;
`;

const TeamLogo = styled.div`
  width: 60px;
  height: 60px;
  background-color: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  margin-right: 15px;
`;

const TeamInfo = styled.div`
  flex: 1;
`;

const TeamName = styled.h4`
  color: #fff;
  margin: 0 0 5px 0;
`;

const TeamDetails = styled.div`
  color: #aaa;
  font-size: 14px;
  
  span {
    margin-right: 15px;
  }
`;

const AffiliateCard = styled.div`
  margin-top: 10px;
  padding: 10px;
  background-color: #222;
  border-radius: 5px;
  
  h5 {
    margin: 0 0 5px 0;
    color: #C4CED4;
    font-size: 14px;
  }
  
  p {
    margin: 0;
    color: #aaa;
    font-size: 14px;
  }
`;

const StartButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 15px 40px;
  background-color: ${props => props.primary ? '#B30E16' : '#2a2a2a'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#950b12' : '#444'};
  }
`;

const FranchiseSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedTeams = [], settings = {} } = location.state || {};
  
  const formatSetting = (key, value) => {
    // Format specific settings for better display
    switch (key) {
      case 'franchiseLength':
        return `${value} Years`;
      case 'cap_amount':
        return `$${parseInt(value).toLocaleString()}`;
      case 'controlledTeams':
        return `${value} ${parseInt(value) === 1 ? 'Team' : 'Teams'}`;
      case 'injury_frequency':
        return `${value}%`;
      default:
        if (value === 'true') return 'Enabled';
        if (value === 'false') return 'Disabled';
        if (value === 'on') return 'Enabled';
        if (value === 'off') return 'Disabled';
        return value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ');
    }
  };
  
  const handleStartFranchise = () => {
    alert('Your franchise has been created! Ready to start playing.');
    navigate('/franchise');
  };
  
  // Group settings for display
  const settingGroups = {
    general: ['franchiseLength', 'controlledTeams', 'salary_cap', 'cap_amount'],
    simulation: ['sim_engine', 'player_progression', 'injury_frequency', 'morale_system', 'player_retirement'],
    rules: ['waivers', 'offside', 'icing', 'roster_limits', 'line_changes']
  };
  
  return (
    <Container>
      <Title>Franchise Summary</Title>
      <Description>
        Review your settings and selected teams before starting your franchise.
        Once you start, some settings can't be changed.
      </Description>
      
      <SummaryContainer>
        <SummarySection>
          <SectionTitle>Settings</SectionTitle>
          
          <SummaryList>
            <h4 style={{ color: '#C4CED4', marginBottom: '10px' }}>General</h4>
            {settingGroups.general.map(key => (
              settings[key] && (
                <SummaryItem key={key}>
                  <ItemLabel>{key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}</ItemLabel>
                  <ItemValue>{formatSetting(key, settings[key])}</ItemValue>
                </SummaryItem>
              )
            ))}
          </SummaryList>
          
          <SummaryList>
            <h4 style={{ color: '#C4CED4', marginBottom: '10px' }}>Simulation</h4>
            {settingGroups.simulation.map(key => (
              settings[key] && (
                <SummaryItem key={key}>
                  <ItemLabel>{key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}</ItemLabel>
                  <ItemValue>{formatSetting(key, settings[key])}</ItemValue>
                </SummaryItem>
              )
            ))}
          </SummaryList>
          
          <SummaryList>
            <h4 style={{ color: '#C4CED4', marginBottom: '10px' }}>Rules</h4>
            {settingGroups.rules.map(key => (
              settings[key] && (
                <SummaryItem key={key}>
                  <ItemLabel>{key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}</ItemLabel>
                  <ItemValue>{formatSetting(key, settings[key])}</ItemValue>
                </SummaryItem>
              )
            ))}
          </SummaryList>
        </SummarySection>
        
        <SummarySection>
          <SectionTitle>Your Teams</SectionTitle>
          
          <TeamCardsContainer>
            {selectedTeams.map(team => (
              <div key={team.id}>
                <TeamCard>
                  <TeamLogo>{team.abbreviation}</TeamLogo>
                  <TeamInfo>
                    <TeamName>{team.name}</TeamName>
                    <TeamDetails>
                      <span>{team.conference} Conference</span>
                      <span>{team.division} Division</span>
                    </TeamDetails>
                    <TeamDetails>
                      <span>Overall: {team.ratings.overall}</span>
                      <span>Off: {team.ratings.offense}</span>
                      <span>Def: {team.ratings.defense}</span>
                      <span>G: {team.ratings.goaltending}</span>
                    </TeamDetails>
                  </TeamInfo>
                </TeamCard>
                
                <AffiliateCard>
                  <h5>AHL Affiliate</h5>
                  <p>{team.farmTeam}</p>
                </AffiliateCard>
              </div>
            ))}
            
            {selectedTeams.length === 0 && (
              <p style={{ color: '#aaa', textAlign: 'center' }}>No teams selected</p>
            )}
          </TeamCardsContainer>
        </SummarySection>
      </SummaryContainer>
      
      <StartButtonContainer>
        <Button primary onClick={handleStartFranchise}>
          Start Franchise
        </Button>
      </StartButtonContainer>
    </Container>
  );
};

export default FranchiseSummary; 