import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import * as seasonService from '../../services/seasonService';
import * as teamService from '../../services/teamService';

// Styled components
const Container = styled.div`
  padding: 20px;
  color: #C4CED4;
`;

const Title = styled.h1`
  margin-bottom: 10px;
  color: #C4CED4;
`;

const Subtitle = styled.h2`
  color: #B30E16;
  margin-bottom: 20px;
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
`;

const Step = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#B30E16' : '#1e1e1e'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 10px;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    height: 2px;
    width: 100%;
    background-color: ${props => props.completed ? '#B30E16' : '#333'};
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
  }
`;

const StepLabel = styled.div`
  font-size: 12px;
  color: #aaa;
  text-align: center;
  margin-top: 5px;
`;

const Card = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#B30E16' : '#333'};
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#950b12' : '#444'};
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: -10px;
  color: #C4CED4;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #252525;
  color: #fff;
  margin-top: 5px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #333;
  background-color: #252525;
  color: #fff;
  margin-top: 5px;
`;

const ToggleGroup = styled.div`
  display: flex;
  margin-top: 5px;
`;

const ToggleOption = styled.div`
  padding: 8px 15px;
  background-color: ${props => props.selected ? '#B30E16' : '#252525'};
  color: white;
  cursor: pointer;
  border: 1px solid #333;
  
  &:first-child {
    border-radius: 4px 0 0 4px;
  }
  
  &:last-child {
    border-radius: 0 4px 4px 0;
  }
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
`;

const TeamCard = styled.div`
  background-color: ${props => props.selected ? '#2a2a2a' : '#252525'};
  border: 2px solid ${props => props.selected ? '#B30E16' : 'transparent'};
  border-radius: 6px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
  
  img {
    width: 50px;
    height: 50px;
    object-fit: contain;
    margin-bottom: 10px;
  }
  
  h4 {
    margin: 0 0 5px 0;
    color: #C4CED4;
  }
  
  p {
    margin: 0;
    font-size: 12px;
    color: #aaa;
  }
`;

// SeasonSetup Component
const SeasonSetup = () => {
  const { seasonType } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  
  // Season settings state
  const [seasonSettings, setSeasonSettings] = useState({
    name: '',
    type: seasonType,
    length: seasonType === 'standard' ? 82 : 28,
    difficulty: 'normal',
    injuries: true,
    tradesDifficulty: 'normal',
    simulationSpeed: 'normal',
    draftSettings: 'realistic',
    selectedTeam: null
  });
  
  // Fetch teams using the team service
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { success, data, error } = await teamService.getAllTeams();
        
        if (success) {
          setTeams(data);
        } else {
          console.error('Error fetching teams:', error);
          // If API fails, use fallback mock data
          setTeams(Array(10).fill().map((_, i) => ({
            id: i + 1,
            name: `Mock Team ${i + 1}`,
            abbreviation: `MT${i + 1}`,
            location: `City ${i + 1}`,
            rating: Math.floor(Math.random() * 30) + 70
          })));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Unexpected error fetching teams:', error);
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, []);
  
  const handleSettingsChange = (field, value) => {
    setSeasonSettings({
      ...seasonSettings,
      [field]: value
    });
  };
  
  const handleTeamSelect = (team) => {
    setSeasonSettings({
      ...seasonSettings,
      selectedTeam: team
    });
  };
  
  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Save season and redirect to season dashboard
      saveSeasonAndRedirect();
    }
  };
  
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      // Go back to season mode
      navigate('/season');
    }
  };
  
  const saveSeasonAndRedirect = async () => {
    try {
      // Create the season using service
      const { success, data, error } = await seasonService.createSeason(seasonSettings);
      
      if (success) {
        // Redirect to season dashboard
        navigate(`/season/dashboard/${data.seasonId}`);
      } else {
        alert(`Failed to create season: ${error}`);
      }
    } catch (error) {
      console.error('Error creating season:', error);
      alert('An unexpected error occurred while creating the season');
    }
  };
  
  // Render appropriate step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return renderSettingsStep();
      case 2:
        return renderTeamSelectionStep();
      case 3:
        return renderNameAndSaveStep();
      default:
        return <div>Unknown step</div>;
    }
  };
  
  // Step 1: Configure season settings
  const renderSettingsStep = () => {
    return (
      <Card>
        <h3>Season Settings</h3>
        <p>Configure your season settings.</p>
        
        <FormGroup>
          <Label>Season Length</Label>
          <Select 
            value={seasonSettings.length} 
            onChange={(e) => handleSettingsChange('length', parseInt(e.target.value))}
          >
            <option value="82">Standard (82 games)</option>
            <option value="56">Medium (56 games)</option>
            <option value="28">Short (28 games)</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>Difficulty</Label>
          <ToggleGroup>
            <ToggleOption 
              selected={seasonSettings.difficulty === 'easy'} 
              onClick={() => handleSettingsChange('difficulty', 'easy')}
            >
              Easy
            </ToggleOption>
            <ToggleOption 
              selected={seasonSettings.difficulty === 'normal'} 
              onClick={() => handleSettingsChange('difficulty', 'normal')}
            >
              Normal
            </ToggleOption>
            <ToggleOption 
              selected={seasonSettings.difficulty === 'hard'} 
              onClick={() => handleSettingsChange('difficulty', 'hard')}
            >
              Hard
            </ToggleOption>
          </ToggleGroup>
        </FormGroup>
        
        <FormGroup>
          <Label>Injuries</Label>
          <ToggleGroup>
            <ToggleOption 
              selected={seasonSettings.injuries === true} 
              onClick={() => handleSettingsChange('injuries', true)}
            >
              On
            </ToggleOption>
            <ToggleOption 
              selected={seasonSettings.injuries === false} 
              onClick={() => handleSettingsChange('injuries', false)}
            >
              Off
            </ToggleOption>
          </ToggleGroup>
        </FormGroup>
        
        <FormGroup>
          <Label>Trades Difficulty</Label>
          <ToggleGroup>
            <ToggleOption 
              selected={seasonSettings.tradesDifficulty === 'easy'} 
              onClick={() => handleSettingsChange('tradesDifficulty', 'easy')}
            >
              Easy
            </ToggleOption>
            <ToggleOption 
              selected={seasonSettings.tradesDifficulty === 'normal'} 
              onClick={() => handleSettingsChange('tradesDifficulty', 'normal')}
            >
              Normal
            </ToggleOption>
            <ToggleOption 
              selected={seasonSettings.tradesDifficulty === 'hard'} 
              onClick={() => handleSettingsChange('tradesDifficulty', 'hard')}
            >
              Hard
            </ToggleOption>
          </ToggleGroup>
        </FormGroup>
        
        <FormGroup>
          <Label>Simulation Speed</Label>
          <Select 
            value={seasonSettings.simulationSpeed} 
            onChange={(e) => handleSettingsChange('simulationSpeed', e.target.value)}
          >
            <option value="quick">Quick</option>
            <option value="normal">Normal</option>
            <option value="detailed">Detailed</option>
          </Select>
        </FormGroup>
      </Card>
    );
  };
  
  // Step 2: Team selection
  const renderTeamSelectionStep = () => {
    if (loading) {
      return <Card><p>Loading teams...</p></Card>;
    }
    
    return (
      <Card>
        <h3>Select Your Team</h3>
        <p>Choose the team you want to manage during this season.</p>
        
        <TeamGrid>
          {teams.map(team => (
            <TeamCard 
              key={team.id} 
              selected={seasonSettings.selectedTeam?.id === team.id}
              onClick={() => handleTeamSelect(team)}
            >
              <h4>{team.name}</h4>
              <p>{team.location}</p>
              <p>Rating: {team.rating}</p>
            </TeamCard>
          ))}
        </TeamGrid>
      </Card>
    );
  };
  
  // Step 3: Name and save
  const renderNameAndSaveStep = () => {
    return (
      <Card>
        <h3>Name Your Season</h3>
        <p>Provide a name for your season save file.</p>
        
        <FormGroup>
          <Label>Season Name</Label>
          <Input 
            type="text" 
            value={seasonSettings.name} 
            onChange={(e) => handleSettingsChange('name', e.target.value)}
            placeholder="My Season 2023-24"
          />
        </FormGroup>
        
        <h3>Season Summary</h3>
        <p><strong>Type:</strong> {seasonSettings.type === 'standard' ? 'Standard Season' : 'Custom Season'}</p>
        <p><strong>Length:</strong> {seasonSettings.length} games</p>
        <p><strong>Team:</strong> {seasonSettings.selectedTeam?.name || 'No team selected'}</p>
        <p><strong>Difficulty:</strong> {seasonSettings.difficulty}</p>
      </Card>
    );
  };
  
  // Determine if next button should be disabled
  const isNextDisabled = () => {
    if (step === 2 && !seasonSettings.selectedTeam) return true;
    if (step === 3 && !seasonSettings.name) return true;
    return false;
  };
  
  return (
    <Container>
      <Title>Season Setup</Title>
      <Subtitle>
        {seasonType === 'standard' ? 'Standard Season Setup' : 
         seasonType === 'short' ? 'Short Season Setup' : 
         seasonType === 'playoffs' ? 'Playoff Season Setup' : 'Custom Season Setup'}
      </Subtitle>
      
      <StepIndicator>
        <div>
          <Step active={step === 1} completed={step > 1}>1</Step>
          <StepLabel>Settings</StepLabel>
        </div>
        <div>
          <Step active={step === 2} completed={step > 2}>2</Step>
          <StepLabel>Team</StepLabel>
        </div>
        <div>
          <Step active={step === 3}>3</Step>
          <StepLabel>Save</StepLabel>
        </div>
      </StepIndicator>
      
      {renderStepContent()}
      
      <ButtonContainer>
        <Button onClick={handlePrevStep}>
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>
        <Button 
          primary 
          onClick={handleNextStep}
          disabled={isNextDisabled()}
        >
          {step === 3 ? 'Create Season' : 'Next'}
        </Button>
      </ButtonContainer>
    </Container>
  );
};

export default SeasonSetup; 