import React, { useState, useEffect } from 'react';
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

const TeamSelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
`;

const TeamDisplayContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin-bottom: 30px;
`;

const NavigationButton = styled.button`
  background: none;
  border: none;
  font-size: 36px;
  color: #B30E16;
  cursor: pointer;
  padding: 10px;
  transition: color 0.2s;
  
  &:hover {
    color: #950b12;
  }
  
  &:disabled {
    color: #555;
    cursor: not-allowed;
  }
`;

const TeamCard = styled.div`
  width: 500px;
  background-color: #1e1e1e;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  margin: 0 20px;
`;

const TeamLogo = styled.div`
  width: 200px;
  height: 200px;
  background-color: #333;
  border-radius: 50%;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  color: #fff;
`;

const TeamName = styled.h2`
  color: #fff;
  margin-bottom: 5px;
`;

const TeamDetails = styled.div`
  margin: 20px 0;
  color: #aaa;
  
  p {
    margin: 5px 0;
  }
`;

const TeamStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 20px;
`;

const StatItem = styled.div`
  background-color: #2a2a2a;
  padding: 10px;
  border-radius: 5px;
  
  h4 {
    margin: 0;
    font-size: 14px;
    color: #aaa;
  }
  
  p {
    margin: 5px 0 0;
    font-size: 18px;
    font-weight: bold;
    color: ${props => {
      if (props.value >= 90) return '#4CAF50';
      if (props.value >= 80) return '#8BC34A';
      if (props.value >= 70) return '#FFEB3B';
      if (props.value >= 60) return '#FF9800';
      return '#F44336';
    }};
  }
`;

const SelectedTeamsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const SelectedTeamBadge = styled.div`
  background-color: ${props => props.selected ? '#B30E16' : '#2a2a2a'};
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.selected ? '#950b12' : '#444'};
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 12px 25px;
  background-color: ${props => props.primary ? '#B30E16' : '#2a2a2a'};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#950b12' : '#444'};
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const FranchiseTeamSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [maxTeams, setMaxTeams] = useState(1);
  
  useEffect(() => {
    // Get the max number of teams from settings that were passed from previous page
    const settingsMaxTeams = location.state?.settings?.controlledTeams 
      ? parseInt(location.state.settings.controlledTeams) 
      : 1;
    
    setMaxTeams(settingsMaxTeams);
    
    // Simulate API call to get teams
    setTimeout(() => {
      setTeams([
        {
          id: 1,
          name: "Toronto Maple Leafs",
          abbreviation: "TOR",
          division: "Atlantic",
          conference: "Eastern",
          logo: "",
          primaryColor: "#00205B",
          farmTeam: "Toronto Marlies",
          ratings: {
            overall: 87,
            offense: 90,
            defense: 84,
            goaltending: 88
          }
        },
        {
          id: 2,
          name: "Montreal Canadiens",
          abbreviation: "MTL",
          division: "Atlantic",
          conference: "Eastern",
          logo: "",
          primaryColor: "#AF1E2D",
          farmTeam: "Laval Rocket",
          ratings: {
            overall: 82,
            offense: 81,
            defense: 82,
            goaltending: 84
          }
        },
        {
          id: 3,
          name: "Boston Bruins",
          abbreviation: "BOS",
          division: "Atlantic",
          conference: "Eastern",
          logo: "",
          primaryColor: "#FFB81C",
          farmTeam: "Providence Bruins",
          ratings: {
            overall: 88,
            offense: 85,
            defense: 90,
            goaltending: 89
          }
        },
        {
          id: 4,
          name: "New York Rangers",
          abbreviation: "NYR",
          division: "Metropolitan",
          conference: "Eastern",
          logo: "",
          primaryColor: "#0038A8",
          farmTeam: "Hartford Wolf Pack",
          ratings: {
            overall: 86,
            offense: 87,
            defense: 85,
            goaltending: 86
          }
        },
        {
          id: 5,
          name: "Tampa Bay Lightning",
          abbreviation: "TBL",
          division: "Atlantic",
          conference: "Eastern",
          logo: "",
          primaryColor: "#002868",
          farmTeam: "Syracuse Crunch",
          ratings: {
            overall: 89,
            offense: 91,
            defense: 87,
            goaltending: 89
          }
        }
      ]);
      setLoading(false);
    }, 500);
  }, []);
  
  const handlePreviousTeam = () => {
    setCurrentTeamIndex(prev => (prev - 1 + teams.length) % teams.length);
  };
  
  const handleNextTeam = () => {
    setCurrentTeamIndex(prev => (prev + 1) % teams.length);
  };
  
  const handleTeamSelect = () => {
    const currentTeam = teams[currentTeamIndex];
    
    setSelectedTeams(prev => {
      // If team is already selected, remove it
      if (prev.some(team => team.id === currentTeam.id)) {
        return prev.filter(team => team.id !== currentTeam.id);
      }
      
      // If max teams reached, don't add
      if (prev.length >= maxTeams) {
        return prev;
      }
      
      // Add team to selection
      return [...prev, currentTeam];
    });
  };
  
  const isTeamSelected = () => {
    return selectedTeams.some(team => team.id === teams[currentTeamIndex]?.id);
  };
  
  const handleContinue = () => {
    // In a real application, you would pass the selected teams to the next page
    // or save them in state
    navigate("/franchise/summary", { 
      state: { 
        selectedTeams,
        settings: location.state?.settings || {} 
      } 
    });
  };
  
  const handleCancel = () => {
    navigate("/franchise");
  };
  
  if (loading) {
    return (
      <Container>
        <Title>Loading teams...</Title>
      </Container>
    );
  }
  
  const currentTeam = teams[currentTeamIndex];
  
  return (
    <Container>
      <Title>Select Your Team</Title>
      <Description>
        Choose up to {maxTeams} {maxTeams === 1 ? 'team' : 'teams'} to control in your franchise.
        Navigate through the available teams and add your favorites to your selection.
      </Description>
      
      <TeamSelectionContainer>
        <TeamDisplayContainer>
          <NavigationButton onClick={handlePreviousTeam}>&lt;</NavigationButton>
          
          <TeamCard>
            <TeamLogo>{currentTeam.abbreviation}</TeamLogo>
            <TeamName>{currentTeam.name}</TeamName>
            <p>{currentTeam.conference} Conference | {currentTeam.division} Division</p>
            
            <TeamDetails>
              <p>AHL Affiliate: {currentTeam.farmTeam}</p>
            </TeamDetails>
            
            <TeamStatsGrid>
              <StatItem value={currentTeam.ratings.overall}>
                <h4>Overall</h4>
                <p>{currentTeam.ratings.overall}</p>
              </StatItem>
              <StatItem value={currentTeam.ratings.offense}>
                <h4>Offense</h4>
                <p>{currentTeam.ratings.offense}</p>
              </StatItem>
              <StatItem value={currentTeam.ratings.defense}>
                <h4>Defense</h4>
                <p>{currentTeam.ratings.defense}</p>
              </StatItem>
              <StatItem value={currentTeam.ratings.goaltending}>
                <h4>Goaltending</h4>
                <p>{currentTeam.ratings.goaltending}</p>
              </StatItem>
            </TeamStatsGrid>
            
            <Button 
              primary 
              onClick={handleTeamSelect} 
              style={{ marginTop: "20px" }}
              disabled={selectedTeams.length >= maxTeams && !isTeamSelected()}
            >
              {isTeamSelected() ? "Remove Team" : "Select Team"}
            </Button>
          </TeamCard>
          
          <NavigationButton onClick={handleNextTeam}>&gt;</NavigationButton>
        </TeamDisplayContainer>
        
        <h3 style={{ color: "#C4CED4", marginBottom: "15px" }}>
          Selected Teams ({selectedTeams.length}/{maxTeams})
        </h3>
        
        <SelectedTeamsContainer>
          {selectedTeams.length > 0 ? (
            selectedTeams.map(team => (
              <SelectedTeamBadge 
                key={team.id} 
                selected
              >
                {team.name}
              </SelectedTeamBadge>
            ))
          ) : (
            <p style={{ color: "#aaa" }}>No teams selected. Please select at least one team to continue.</p>
          )}
        </SelectedTeamsContainer>
      </TeamSelectionContainer>
      
      <ButtonsContainer>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button 
          primary 
          onClick={handleContinue}
          disabled={selectedTeams.length === 0}
        >
          Continue
        </Button>
      </ButtonsContainer>
    </Container>
  );
};

export default FranchiseTeamSelection; 