import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import * as seasonService from '../../services/seasonService';

// Import all components for direct embedding
import Calendar from '../../pages/Calendar';
import LineCombinations from '../../pages/LineCombinations';
import Statistics from '../../pages/Statistics';
import Standings from '../../pages/Standings';
import AssetMovement from '../../pages/AssetMovement';
import Awards from '../../pages/Awards';

// Styled components
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  height: 100vh; /* Set explicit height */
  background-color: #262626;
  overflow: hidden; /* Prevent scrolling on the container */
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #1a1a1a;
  color: #C4CED4;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid #333;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #333;
`;

const SidebarTeamInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #222;
  border-bottom: 1px solid #333;
`;

const TeamLogo = styled.div`
  width: 40px;
  height: 40px;
  background-color: #333;
  border-radius: 50%;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.textColor || 'white'};
`;

const TeamName = styled.div`
  h3 {
    margin: 0;
    font-size: 14px;
  }
  
  p {
    margin: 2px 0 0;
    font-size: 12px;
    color: #aaa;
  }
`;

const SeasonInfo = styled.div`
  padding: 10px 20px;
  font-size: 12px;
  color: #aaa;
  background-color: #222;
  border-bottom: 1px solid #333;
  
  p {
    margin: 5px 0;
    display: flex;
    justify-content: space-between;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
`;

const NavItem = styled.li`
  border-bottom: 1px solid #2a2a2a;
  
  a, div {
    display: block;
    padding: 14px 20px;
    color: ${props => props.active ? '#fff' : '#aaa'};
    background-color: ${props => props.active ? '#252525' : 'transparent'};
    border-left: 4px solid ${props => props.active ? '#B30E16' : 'transparent'};
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: #252525;
      color: #fff;
    }
  }
`;

const SidebarFooter = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #333;
  display: flex;
  justify-content: space-between;
`;

const FooterButton = styled.button`
  background-color: ${props => props.primary ? '#B30E16' : '#333'};
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#950b12' : '#444'};
  }
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full viewport height */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
`;

const Title = styled.h1`
  margin: 0;
  color: #C4CED4;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#B30E16' : '#333'};
  color: white;
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#950b12' : '#444'};
  }
`;

const ContentArea = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  min-height: calc(100vh - 80px); /* Take full height minus some padding */
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px 0;
  
  h3 {
    margin-bottom: 10px;
    color: #C4CED4;
  }
  
  p {
    color: #aaa;
    margin-bottom: 20px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const Card = styled.div`
  background-color: #252525;
  border-radius: 8px;
  padding: 15px;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  h3 {
    margin-top: 0;
    color: #C4CED4;
  }
  
  p {
    color: #aaa;
  }
`;

// SeasonDashboard Component
const SeasonDashboard = () => {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Mock calendar data
  const [calendarData] = useState({
    currentDate: new Date().toLocaleDateString(),
    nextGame: { 
      opponent: 'Team 5', 
      date: new Date(Date.now() + 86400000).toLocaleDateString(),
      isHome: true 
    },
    recentResults: [
      { opponent: 'Team 2', result: 'W 3-2', date: '3 days ago' },
      { opponent: 'Team 7', result: 'L 1-4', date: '5 days ago' }
    ]
  });
  
  useEffect(() => {
    // Load season data from service
    const loadSeason = async () => {
      try {
        const { success, data, error } = await seasonService.getSeasonById(seasonId);
        
        if (success) {
          setSeason(data);
        } else {
          console.error('Error loading season:', error);
          // Season not found, redirect to season mode
          navigate('/season');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Unexpected error loading season:', error);
        navigate('/season');
        setLoading(false);
      }
    };
    
    loadSeason();
  }, [seasonId, navigate]);
  
  const handleSave = async () => {
    try {
      // Save current season state
      const { success, error } = await seasonService.updateSeason(seasonId, season);
      
      if (success) {
        alert('Season saved successfully!');
      } else {
        alert(`Failed to save season: ${error}`);
      }
    } catch (error) {
      console.error('Error saving season:', error);
      alert('An unexpected error occurred while saving the season');
    }
  };
  
  const handleExitToMenu = async () => {
    // Prompt user if they want to save before exiting
    if (window.confirm('Do you want to save before exiting?')) {
      await handleSave();
    }
    navigate('/season');
  };
  
  // Function to simulate next game
  const simulateNextGame = () => {
    alert('Game simulation feature is under development');
  };
  
  // Function to simulate to next day
  const simulateToNextDay = async () => {
    try {
      const { success, data, error } = await seasonService.simulateToNextDay(seasonId);
      
      if (success) {
        setSeason(data);
      } else {
        alert(`Failed to simulate to next day: ${error}`);
      }
    } catch (error) {
      console.error('Error simulating to next day:', error);
      alert('An unexpected error occurred during simulation');
    }
  };
  
  // Function to render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return renderHomeContent();
      case 'calendar':
        return renderCalendarContent();
      case 'lines':
        return renderLinesContent();
      case 'team':
        return renderTeamContent();
      case 'stats':
        return renderStatsContent();
      case 'standings':
        return renderStandingsContent();
      case 'trades':
        return renderTradesContent();
      case 'awards':
        return renderAwardsContent();
      default:
        return <div>Content not implemented</div>;
    }
  };
  
  // Home dashboard tab
  const renderHomeContent = () => {
    return (
      <>
        <Header>
          <Title>Season Dashboard</Title>
          <ActionButtons>
            <Button primary onClick={simulateNextGame}>
              Simulate Next Game
            </Button>
            <Button onClick={simulateToNextDay}>
              Simulate to Next Day
            </Button>
          </ActionButtons>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <p>Welcome to your season. Here's a quick overview of your team's status.</p>
          
          <Grid>
            <Card>
              <h3>Next Game</h3>
              <p>{calendarData.nextGame.isHome ? 'vs' : '@'} {calendarData.nextGame.opponent}</p>
              <p>{calendarData.nextGame.date}</p>
            </Card>
            
            <Card>
              <h3>Recent Results</h3>
              {calendarData.recentResults.map((game, index) => (
                <p key={index}>
                  {game.result} {game.isHome ? 'vs' : '@'} {game.opponent} ({game.date})
                </p>
              ))}
            </Card>
            
            <Card>
              <h3>Team Record</h3>
              <p>10-5-2 (22 pts)</p>
              <p>Standing: 3rd in Division</p>
            </Card>
            
            <Card>
              <h3>Team Stats</h3>
              <p>Goals For: 45</p>
              <p>Goals Against: 38</p>
              <p>Power Play: 18.5%</p>
            </Card>
          </Grid>
        </div>
      </>
    );
  };
  
  // Calendar content
  const renderCalendarContent = () => {
    return (
      <>
        <Header>
          <Title>Calendar</Title>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Calendar isEmbedded={true} />
        </div>
      </>
    );
  };
  
  // Lines content
  const renderLinesContent = () => {
    const teamId = season?.selectedTeam?.id || 1;
    return (
      <>
        <Header>
          <Title>Line Combinations</Title>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <LineCombinations 
            isEmbedded={true} 
            league="nhl" 
            teamId={teamId.toString()} 
          />
        </div>
      </>
    );
  };
  
  // Team management content
  const renderTeamContent = () => {
    return (
      <>
        <Header>
          <Title>Team Management</Title>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <EmptyState>
            <h3>Team Management</h3>
            <p>Manage your team's roster, call-ups, and send-downs.</p>
            <Button primary disabled>Coming Soon</Button>
          </EmptyState>
        </div>
      </>
    );
  };
  
  // Stats content
  const renderStatsContent = () => {
    return (
      <>
        <Header>
          <Title>Statistics</Title>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Statistics isEmbedded={true} />
        </div>
      </>
    );
  };
  
  // Standings content
  const renderStandingsContent = () => {
    return (
      <>
        <Header>
          <Title>Standings</Title>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Standings isEmbedded={true} />
        </div>
      </>
    );
  };
  
  // Trades content
  const renderTradesContent = () => {
    return (
      <>
        <Header>
          <Title>Trades & Transactions</Title>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <AssetMovement isEmbedded={true} />
        </div>
      </>
    );
  };
  
  // Awards content
  const renderAwardsContent = () => {
    return (
      <>
        <Header>
          <Title>Awards & Recognition</Title>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Awards isEmbedded={true} />
        </div>
      </>
    );
  };
  
  // Show loading indicator while fetching season data
  if (loading) {
    return (
      <PageContainer>
        <div style={{ margin: 'auto', textAlign: 'center', color: '#C4CED4' }}>
          <p>Loading season data...</p>
        </div>
      </PageContainer>
    );
  }
  
  // Season not found
  if (!season) {
    return (
      <PageContainer>
        <div style={{ margin: 'auto', textAlign: 'center', color: '#C4CED4' }}>
          <p>Season not found. <Link to="/season" style={{ color: '#B30E16' }}>Return to Season Mode</Link></p>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <Sidebar>
        <SidebarHeader>
          <h2 style={{ margin: 0 }}>{season.name}</h2>
        </SidebarHeader>
        
        <SidebarTeamInfo>
          <TeamLogo textColor={season.selectedTeam?.colors?.secondary || 'white'}>
            {season.selectedTeam ? season.selectedTeam.abbreviation : '?'}
          </TeamLogo>
          <TeamName>
            <h3>{season.selectedTeam ? season.selectedTeam.name : 'Unknown Team'}</h3>
            <p>{season.selectedTeam ? season.selectedTeam.location : ''}</p>
          </TeamName>
        </SidebarTeamInfo>
        
        <SeasonInfo>
          <p>
            <span>Current Date:</span>
            <span>{new Date(season.currentDate).toLocaleDateString()}</span>
          </p>
          <p>
            <span>Season Type:</span>
            <span>{season.type === 'standard' ? 'Standard' : 'Custom'}</span>
          </p>
          <p>
            <span>Current Day:</span>
            <span>{season.currentDay}</span>
          </p>
        </SeasonInfo>
        
        <NavList>
          <NavItem active={activeSection === 'home'}>
            <div onClick={() => setActiveSection('home')}>Dashboard</div>
          </NavItem>
          <NavItem active={activeSection === 'calendar'}>
            <div onClick={() => setActiveSection('calendar')}>Calendar</div>
          </NavItem>
          <NavItem active={activeSection === 'lines'}>
            <div onClick={() => setActiveSection('lines')}>Line Combinations</div>
          </NavItem>
          <NavItem active={activeSection === 'team'}>
            <div onClick={() => setActiveSection('team')}>Team Management</div>
          </NavItem>
          <NavItem active={activeSection === 'stats'}>
            <div onClick={() => setActiveSection('stats')}>Statistics</div>
          </NavItem>
          <NavItem active={activeSection === 'standings'}>
            <div onClick={() => setActiveSection('standings')}>Standings</div>
          </NavItem>
          <NavItem active={activeSection === 'trades'}>
            <div onClick={() => setActiveSection('trades')}>Trades</div>
          </NavItem>
          <NavItem active={activeSection === 'awards'}>
            <div onClick={() => setActiveSection('awards')}>Awards</div>
          </NavItem>
        </NavList>
        
        <SidebarFooter>
          <FooterButton onClick={handleSave}>Save Season</FooterButton>
          <FooterButton primary onClick={handleExitToMenu}>Exit to Menu</FooterButton>
        </SidebarFooter>
      </Sidebar>
      
      <MainContent>
        <ContentArea>
          {renderContent()}
        </ContentArea>
      </MainContent>
    </PageContainer>
  );
};

export default SeasonDashboard; 