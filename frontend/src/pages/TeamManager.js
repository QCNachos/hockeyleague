import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import axios from 'axios';

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const TeamCard = styled.div`
  background-color: ${props => props.primaryColor || '#1e1e1e'};
  color: ${props => props.textColor || 'white'};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.2);
`;

const TeamLogo = styled.div`
  width: 50px;
  height: 50px;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-weight: bold;
  color: ${props => props.primaryColor || '#1e1e1e'};
`;

const TeamInfo = styled.div`
  flex: 1;
`;

const TeamName = styled.h3`
  margin: 0;
  font-size: 18px;
`;

const TeamCity = styled.p`
  margin: 5px 0 0;
  opacity: 0.8;
  font-size: 14px;
`;

const TeamDetails = styled.div`
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.1);
`;

const TeamDetail = styled.p`
  margin: 8px 0;
  display: flex;
  justify-content: space-between;
  
  span:first-child {
    opacity: 0.7;
  }
`;

const TabContainer = styled.div`
  margin-bottom: 30px;
`;

const TabButtons = styled.div`
  display: flex;
  border-bottom: 1px solid #333;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.active ? '#B30E16' : 'transparent'};
  color: white;
  border: none;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    background-color: ${props => props.active ? '#B30E16' : '#333'};
  }
`;

const NewTeamForm = styled.form`
  background-color: #1e1e1e;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  background-color: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
`;

const ColorPreview = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-left: 10px;
  border: 1px solid #333;
`;

const ColorInputContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SubmitButton = styled.button`
  padding: 12px 20px;
  background-color: #B30E16;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  
  &:hover {
    background-color: #950b12;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const TeamManager = () => {
  const [activeTab, setActiveTab] = useState('teams');
  const [teams, setTeams] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [initMessage, setInitMessage] = useState(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    city: '',
    abbreviation: '',
    primary_color: '#000000',
    secondary_color: '#FFFFFF',
    division_id: '',
    arena_name: '',
    arena_capacity: 18000,
    prestige: 50
  });
  
  const { isAuthenticated, token } = useSelector(state => state.auth);
  
  useEffect(() => {
    // Fetch teams from API
    axios.get('/api/teams')
      .then(response => {
        // Ensure all team objects have required properties
        const processedTeams = response.data.map(team => ({
          ...team,
          name: team.name || 'Unknown Team',
          city: team.city || 'Unknown City',
          abbreviation: team.abbreviation || '???',
          primary_color: team.primary_color || '#1e1e1e',
          secondary_color: team.secondary_color || '#FFFFFF',
          arena_name: team.arena_name || 'Unknown Arena',
          arena_capacity: team.arena_capacity || 0,
          prestige: team.prestige || 50
        }));
        
        // Sort teams alphabetically by name
        setTeams(processedTeams.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching teams:', error);
        // Fall back to mock data if API fails
        const mockTeams = [
          // Atlantic Division
          {
            id: 1,
            name: "Boston Bruins",
            city: "Boston",
            abbreviation: "BOS",
            primary_color: "#FFB81C",
            secondary_color: "#000000",
            division_id: 1,
            divisionName: "Atlantic Division",
            arena_name: "TD Garden",
            arena_capacity: 17565,
            prestige: 85
          },
          {
            id: 2,
            name: "Buffalo Sabres",
            city: "Buffalo",
            abbreviation: "BUF",
            primary_color: "#002654",
            secondary_color: "#FCB514",
            division_id: 1,
            divisionName: "Atlantic Division",
            arena_name: "KeyBank Center",
            arena_capacity: 19070,
            prestige: 65
          },
          {
            id: 3,
            name: "Detroit Red Wings",
            city: "Detroit",
            abbreviation: "DET",
            primary_color: "#CE1126",
            secondary_color: "#FFFFFF",
            division_id: 1,
            divisionName: "Atlantic Division",
            arena_name: "Little Caesars Arena",
            arena_capacity: 19515,
            prestige: 75
          },
          {
            id: 4,
            name: "Florida Panthers",
            city: "Sunrise",
            abbreviation: "FLA",
            primary_color: "#041E42",
            secondary_color: "#C8102E",
            division_id: 1,
            divisionName: "Atlantic Division",
            arena_name: "Amerant Bank Arena",
            arena_capacity: 19250,
            prestige: 90
          },
          {
            id: 5,
            name: "Montreal Canadiens",
            city: "Montreal",
            abbreviation: "MTL",
            primary_color: "#AF1E2D",
            secondary_color: "#192168",
            division_id: 1,
            divisionName: "Atlantic Division",
            arena_name: "Bell Centre",
            arena_capacity: 21302,
            prestige: 80
          },
          {
            id: 6,
            name: "Ottawa Senators",
            city: "Ottawa",
            abbreviation: "OTT",
            primary_color: "#E31837",
            secondary_color: "#000000",
            division_id: 1,
            divisionName: "Atlantic Division",
            arena_name: "Canadian Tire Centre",
            arena_capacity: 18652,
            prestige: 70
          },
          {
            id: 7,
            name: "Tampa Bay Lightning",
            city: "Tampa Bay",
            abbreviation: "TBL",
            primary_color: "#002868",
            secondary_color: "#FFFFFF",
            division_id: 1,
            divisionName: "Atlantic Division",
            arena_name: "Amalie Arena",
            arena_capacity: 19092,
            prestige: 85
          },
          {
            id: 8,
            name: "Toronto Maple Leafs",
            city: "Toronto",
            abbreviation: "TOR",
            primary_color: "#00205B",
            secondary_color: "#FFFFFF",
            division_id: 1,
            divisionName: "Atlantic Division",
            arena_name: "Scotiabank Arena",
            arena_capacity: 18819,
            prestige: 85
          },
          
          // Metropolitan Division
          {
            id: 9,
            name: "Carolina Hurricanes",
            city: "Raleigh",
            abbreviation: "CAR",
            primary_color: "#CC0000",
            secondary_color: "#000000",
            division_id: 2,
            divisionName: "Metropolitan Division",
            arena_name: "PNC Arena",
            arena_capacity: 18680,
            prestige: 85
          },
          {
            id: 10,
            name: "Columbus Blue Jackets",
            city: "Columbus",
            abbreviation: "CBJ",
            primary_color: "#002654",
            secondary_color: "#CE1126",
            division_id: 2,
            divisionName: "Metropolitan Division",
            arena_name: "Nationwide Arena",
            arena_capacity: 18500,
            prestige: 65
          },
          {
            id: 11,
            name: "New Jersey Devils",
            city: "Newark",
            abbreviation: "NJD",
            primary_color: "#CE1126",
            secondary_color: "#000000",
            division_id: 2,
            divisionName: "Metropolitan Division",
            arena_name: "Prudential Center",
            arena_capacity: 16514,
            prestige: 80
          },
          {
            id: 12,
            name: "New York Islanders",
            city: "Elmont",
            abbreviation: "NYI",
            primary_color: "#00539B",
            secondary_color: "#F47D30",
            division_id: 2,
            divisionName: "Metropolitan Division",
            arena_name: "UBS Arena",
            arena_capacity: 17250,
            prestige: 75
          },
          {
            id: 13,
            name: "New York Rangers",
            city: "New York",
            abbreviation: "NYR",
            primary_color: "#0038A8",
            secondary_color: "#CE1126",
            division_id: 2,
            divisionName: "Metropolitan Division",
            arena_name: "Madison Square Garden",
            arena_capacity: 18006,
            prestige: 85
          },
          {
            id: 14,
            name: "Philadelphia Flyers",
            city: "Philadelphia",
            abbreviation: "PHI",
            primary_color: "#F74902",
            secondary_color: "#000000",
            division_id: 2,
            divisionName: "Metropolitan Division",
            arena_name: "Wells Fargo Center",
            arena_capacity: 19543,
            prestige: 70
          },
          {
            id: 15,
            name: "Pittsburgh Penguins",
            city: "Pittsburgh",
            abbreviation: "PIT",
            primary_color: "#000000",
            secondary_color: "#FCB514",
            division_id: 2,
            divisionName: "Metropolitan Division",
            arena_name: "PPG Paints Arena",
            arena_capacity: 18387,
            prestige: 80
          },
          {
            id: 16,
            name: "Washington Capitals",
            city: "Washington",
            abbreviation: "WSH",
            primary_color: "#041E42",
            secondary_color: "#C8102E",
            division_id: 2,
            divisionName: "Metropolitan Division",
            arena_name: "Capital One Arena",
            arena_capacity: 18573,
            prestige: 80
          },
          
          // Central Division
          {
            id: 17,
            name: "Arizona Coyotes",
            city: "Tempe",
            abbreviation: "ARI",
            primary_color: "#8C2633",
            secondary_color: "#E2D6B5",
            division_id: 3,
            divisionName: "Central Division",
            arena_name: "Mullett Arena",
            arena_capacity: 4600,
            prestige: 50
          },
          {
            id: 18,
            name: "Chicago Blackhawks",
            city: "Chicago",
            abbreviation: "CHI",
            primary_color: "#CF0A2C",
            secondary_color: "#000000",
            division_id: 3,
            divisionName: "Central Division",
            arena_name: "United Center",
            arena_capacity: 19717,
            prestige: 65
          },
          {
            id: 19,
            name: "Colorado Avalanche",
            city: "Denver",
            abbreviation: "COL",
            primary_color: "#6F263D",
            secondary_color: "#236192",
            division_id: 3,
            divisionName: "Central Division",
            arena_name: "Ball Arena",
            arena_capacity: 18007,
            prestige: 90
          },
          {
            id: 20,
            name: "Dallas Stars",
            city: "Dallas",
            abbreviation: "DAL",
            primary_color: "#006847",
            secondary_color: "#8F8F8C",
            division_id: 3,
            divisionName: "Central Division",
            arena_name: "American Airlines Center",
            arena_capacity: 18532,
            prestige: 80
          },
          {
            id: 21,
            name: "Minnesota Wild",
            city: "Saint Paul",
            abbreviation: "MIN",
            primary_color: "#154734",
            secondary_color: "#A6192E",
            division_id: 3,
            divisionName: "Central Division",
            arena_name: "Xcel Energy Center",
            arena_capacity: 17954,
            prestige: 75
          },
          {
            id: 22,
            name: "Nashville Predators",
            city: "Nashville",
            abbreviation: "NSH",
            primary_color: "#FFB81C",
            secondary_color: "#041E42",
            division_id: 3,
            divisionName: "Central Division",
            arena_name: "Bridgestone Arena",
            arena_capacity: 17159,
            prestige: 75
          },
          {
            id: 23,
            name: "St. Louis Blues",
            city: "St. Louis",
            abbreviation: "STL",
            primary_color: "#002F87",
            secondary_color: "#FCB514",
            division_id: 3,
            divisionName: "Central Division",
            arena_name: "Enterprise Center",
            arena_capacity: 18096,
            prestige: 75
          },
          {
            id: 24,
            name: "Winnipeg Jets",
            city: "Winnipeg",
            abbreviation: "WPG",
            primary_color: "#041E42",
            secondary_color: "#004C97",
            division_id: 3,
            divisionName: "Central Division",
            arena_name: "Canada Life Centre",
            arena_capacity: 15321,
            prestige: 75
          },
          
          // Pacific Division
          {
            id: 25,
            name: "Anaheim Ducks",
            city: "Anaheim",
            abbreviation: "ANA",
            primary_color: "#F47A38",
            secondary_color: "#B9975B",
            division_id: 4,
            divisionName: "Pacific Division",
            arena_name: "Honda Center",
            arena_capacity: 17174,
            prestige: 60
          },
          {
            id: 26,
            name: "Calgary Flames",
            city: "Calgary",
            abbreviation: "CGY",
            primary_color: "#C8102E",
            secondary_color: "#F1BE48",
            division_id: 4,
            divisionName: "Pacific Division",
            arena_name: "Scotiabank Saddledome",
            arena_capacity: 19289,
            prestige: 75
          },
          {
            id: 27,
            name: "Edmonton Oilers",
            city: "Edmonton",
            abbreviation: "EDM",
            primary_color: "#041E42",
            secondary_color: "#FF4C00",
            division_id: 4,
            divisionName: "Pacific Division",
            arena_name: "Rogers Place",
            arena_capacity: 18347,
            prestige: 85
          },
          {
            id: 28,
            name: "Los Angeles Kings",
            city: "Los Angeles",
            abbreviation: "LAK",
            primary_color: "#111111",
            secondary_color: "#A2AAAD",
            division_id: 4,
            divisionName: "Pacific Division",
            arena_name: "Crypto.com Arena",
            arena_capacity: 18230,
            prestige: 80
          },
          {
            id: 29,
            name: "San Jose Sharks",
            city: "San Jose",
            abbreviation: "SJS",
            primary_color: "#006D75",
            secondary_color: "#000000",
            division_id: 4,
            divisionName: "Pacific Division",
            arena_name: "SAP Center",
            arena_capacity: 17562,
            prestige: 60
          },
          {
            id: 30,
            name: "Seattle Kraken",
            city: "Seattle",
            abbreviation: "SEA",
            primary_color: "#001628",
            secondary_color: "#99D9D9",
            division_id: 4,
            divisionName: "Pacific Division",
            arena_name: "Climate Pledge Arena",
            arena_capacity: 17100,
            prestige: 70
          },
          {
            id: 31,
            name: "Vancouver Canucks",
            city: "Vancouver",
            abbreviation: "VAN",
            primary_color: "#00205B",
            secondary_color: "#00843D",
            division_id: 4,
            divisionName: "Pacific Division",
            arena_name: "Rogers Arena",
            arena_capacity: 18910,
            prestige: 85
          },
          {
            id: 32,
            name: "Vegas Golden Knights",
            city: "Las Vegas",
            abbreviation: "VGK",
            primary_color: "#B4975A",
            secondary_color: "#333F42",
            division_id: 4,
            divisionName: "Pacific Division",
            arena_name: "T-Mobile Arena",
            arena_capacity: 17500,
            prestige: 90
          }
        ];
        
        // Process and sort mock teams alphabetically
        const processedMockTeams = mockTeams.map(team => ({
          ...team,
          primary_color: team.primary_color || team.primaryColor || '#1e1e1e',
          secondary_color: team.secondary_color || team.secondaryColor || '#FFFFFF',
          division_id: team.division_id || team.divisionId,
          arena_name: team.arena_name || team.arenaName || 'Unknown Arena',
          arena_capacity: team.arena_capacity || team.arenaCapacity || 0
        }));
        
        setTeams(processedMockTeams.sort((a, b) => a.name.localeCompare(b.name)));
        setLoading(false);
      });
    
    // Fetch divisions
    axios.get('/api/teams/divisions')
      .then(response => {
        setDivisions(response.data);
      })
      .catch(error => {
        console.error('Error fetching divisions:', error);
        // Fall back to mock division data
        setDivisions([
          { id: 1, name: "Atlantic Division" },
          { id: 2, name: "Metropolitan Division" },
          { id: 3, name: "Central Division" },
          { id: 4, name: "Pacific Division" }
        ]);
      });
  }, []);
  
  const handleNewTeamChange = (e) => {
    const { name, value } = e.target;
    setNewTeam(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNewTeamSubmit = (e) => {
    e.preventDefault();
    
    // Use the real API
    axios.post('/api/teams', newTeam, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        // Add the new team to the state
        setTeams([...teams, response.data]);
        
        // Reset form
        setNewTeam({
          name: '',
          city: '',
          abbreviation: '',
          primary_color: '#000000',
          secondary_color: '#FFFFFF',
          division_id: '',
          arena_name: '',
          arena_capacity: 18000,
          prestige: 50
        });
        
        // Switch to teams tab
        setActiveTab('teams');
      })
      .catch(error => {
        console.error('Error creating team:', error);
        alert('Failed to create team. Please try again.');
      });
  };
  
  const initializeNHLTeams = () => {
    setInitializing(true);
    setInitMessage(null);
    
    axios.post('/api/init/nhl-data', {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        setInitMessage({
          type: 'success',
          text: `Successfully initialized ${response.data.data.teams} NHL teams!`
        });
        
        // Refresh the teams list
        return axios.get('/api/teams');
      })
      .then(response => {
        // Ensure all team objects have required properties
        const processedTeams = response.data.map(team => ({
          ...team,
          name: team.name || 'Unknown Team',
          city: team.city || 'Unknown City',
          abbreviation: team.abbreviation || '???',
          primary_color: team.primary_color || '#1e1e1e',
          secondary_color: team.secondary_color || '#FFFFFF',
          arena_name: team.arena_name || 'Unknown Arena',
          arena_capacity: team.arena_capacity || 0,
          prestige: team.prestige || 50
        }));
        
        // Sort teams alphabetically by name
        setTeams(processedTeams.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(error => {
        console.error('Error initializing NHL teams:', error);
        setInitMessage({
          type: 'error',
          text: 'Failed to initialize NHL teams. Please try again.'
        });
      })
      .finally(() => {
        setInitializing(false);
      });
  };
  
  // Determine text color based on background for contrast
  const getTextColor = (bgColor) => {
    // Default to a dark color if bgColor is undefined or null
    if (!bgColor) {
      return '#FFFFFF'; // Default to white text
    }
    
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Calculate brightness
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return black or white text based on brightness
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };
  
  return (
    <Container>
      <Title>Team Management</Title>
      
      {isAuthenticated && (
        <div style={{ marginBottom: '20px' }}>
          <SubmitButton 
            onClick={initializeNHLTeams} 
            disabled={initializing}
            style={{ marginRight: '15px' }}
          >
            {initializing ? 'Initializing...' : 'Initialize NHL Teams'}
          </SubmitButton>
          
          {initMessage && (
            <span style={{ 
              color: initMessage.type === 'success' ? '#4CAF50' : '#F44336',
              marginLeft: '10px'
            }}>
              {initMessage.text}
            </span>
          )}
        </div>
      )}
      
      <TabContainer>
        <TabButtons>
          <TabButton 
            active={activeTab === 'teams'} 
            onClick={() => setActiveTab('teams')}
          >
            Current Teams
          </TabButton>
          {isAuthenticated && (
            <TabButton 
              active={activeTab === 'create'} 
              onClick={() => setActiveTab('create')}
            >
              Create New Team
            </TabButton>
          )}
        </TabButtons>
        
        {activeTab === 'create' && isAuthenticated && (
          <NewTeamForm onSubmit={handleNewTeamSubmit}>
            <h2>Create New Team</h2>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="name">Team Name</Label>
                <Input 
                  type="text" 
                  id="name" 
                  name="name"
                  value={newTeam.name}
                  onChange={handleNewTeamChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="city">City</Label>
                <Input 
                  type="text" 
                  id="city" 
                  name="city"
                  value={newTeam.city}
                  onChange={handleNewTeamChange}
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="abbreviation">Abbreviation (3 letters)</Label>
                <Input 
                  type="text" 
                  id="abbreviation" 
                  name="abbreviation"
                  value={newTeam.abbreviation}
                  onChange={handleNewTeamChange}
                  maxLength={3}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="division_id">Division</Label>
                <Select 
                  id="division_id" 
                  name="division_id"
                  value={newTeam.division_id}
                  onChange={handleNewTeamChange}
                  required
                >
                  <option value="">Select Division</option>
                  {divisions.map(division => (
                    <option key={division.id} value={division.id}>
                      {division.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="primary_color">Primary Color</Label>
                <ColorInputContainer>
                  <Input 
                    type="color" 
                    id="primary_color" 
                    name="primary_color"
                    value={newTeam.primary_color}
                    onChange={handleNewTeamChange}
                  />
                  <ColorPreview color={newTeam.primary_color} />
                </ColorInputContainer>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <ColorInputContainer>
                  <Input 
                    type="color" 
                    id="secondary_color" 
                    name="secondary_color"
                    value={newTeam.secondary_color}
                    onChange={handleNewTeamChange}
                  />
                  <ColorPreview color={newTeam.secondary_color} />
                </ColorInputContainer>
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="arena_name">Arena Name</Label>
                <Input 
                  type="text" 
                  id="arena_name" 
                  name="arena_name"
                  value={newTeam.arena_name}
                  onChange={handleNewTeamChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="arena_capacity">Arena Capacity</Label>
                <Input 
                  type="number" 
                  id="arena_capacity" 
                  name="arena_capacity"
                  value={newTeam.arena_capacity}
                  onChange={handleNewTeamChange}
                  min={1000}
                  max={25000}
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormGroup>
              <Label htmlFor="prestige">Team Prestige (1-100)</Label>
              <Input 
                type="range" 
                id="prestige" 
                name="prestige"
                value={newTeam.prestige}
                onChange={handleNewTeamChange}
                min={1}
                max={100}
                required
              />
              <div className="text-center">{newTeam.prestige}</div>
            </FormGroup>
            
            <SubmitButton type="submit">Create Team</SubmitButton>
          </NewTeamForm>
        )}
      </TabContainer>
      
      {activeTab === 'teams' && (
        <>
          <p>Below are the teams in the league. Click on a team to view details and manage roster.</p>
          
          {loading ? (
            <p>Loading teams...</p>
          ) : (
            <TeamGrid>
              {teams.map(team => (
                <TeamCard 
                  key={team.id} 
                  primaryColor={team.primary_color || '#1e1e1e'}
                  textColor={getTextColor(team.primary_color)}
                >
                  <TeamHeader>
                    <TeamLogo primaryColor={team.primary_color || '#1e1e1e'}>
                      {team.abbreviation}
                    </TeamLogo>
                    <TeamInfo>
                      <TeamName>{team.name}</TeamName>
                      <TeamCity>{team.city}</TeamCity>
                    </TeamInfo>
                  </TeamHeader>
                  <TeamDetails>
                    <TeamDetail>
                      <span>Division:</span>
                      <span>
                        {divisions.find(d => d.id === team.division_id)?.name || 'Unknown'}
                      </span>
                    </TeamDetail>
                    <TeamDetail>
                      <span>Arena:</span>
                      <span>{team.arena_name}</span>
                    </TeamDetail>
                    <TeamDetail>
                      <span>Capacity:</span>
                      <span>{team.arena_capacity?.toLocaleString() || 'Unknown'}</span>
                    </TeamDetail>
                    <TeamDetail>
                      <span>Prestige:</span>
                      <span>{team.prestige}/100</span>
                    </TeamDetail>
                  </TeamDetails>
                </TeamCard>
              ))}
            </TeamGrid>
          )}
        </>
      )}
    </Container>
  );
};

export default TeamManager;
