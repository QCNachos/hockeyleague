import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import PlayoffBracket from '../../components/PlayoffBracket';
import TeamSelector from '../../components/TeamSelector';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const Container = styled.div`
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
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

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  margin-top: 40px;
`;

const OptionCard = styled.div`
  background-color: #1e1e1e;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    border-color: #B30E16;
  }
`;

const OptionIcon = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
  color: #B30E16;
`;

const OptionTitle = styled.h2`
  color: #C4CED4;
  margin-bottom: 15px;
`;

const OptionDescription = styled.p`
  color: #aaa;
  line-height: 1.6;
`;

const SetupContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  margin-top: 30px;
`;

const SettingsPanel = styled.div`
  background-color: #1e1e1e;
  border-radius: 12px;
  padding: 20px;
`;

const SettingGroup = styled.div`
  margin-bottom: 25px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingLabel = styled.label`
  display: block;
  color: #C4CED4;
  margin-bottom: 10px;
  font-weight: 500;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  background-color: #252525;
  border: 1px solid #333;
  border-radius: 4px;
  color: #C4CED4;
  margin-bottom: 15px;
  
  &:focus {
    border-color: #B30E16;
    outline: none;
  }
`;

const BracketPreview = styled.div`
  background-color: #1e1e1e;
  border-radius: 12px;
  padding: 20px;
  overflow: auto;
`;

const TeamSelectionArea = styled.div`
  margin-top: 30px;
`;

const ConferenceSection = styled.div`
  margin-bottom: 30px;
`;

const ConferenceTitle = styled.h3`
  color: #C4CED4;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
`;

const TeamGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
`;

const TeamCard = styled.div`
  background-color: ${props => props.selected ? '#2a3f52' : '#252525'};
  border: 2px solid ${props => props.selected ? '#4a89dc' : '#333'};
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    background-color: #2a3f52;
    border-color: #4a89dc;
  }
`;

const TeamLogo = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 10px;
  background-image: ${props => `url(${props.src})`};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
`;

const TeamName = styled.div`
  color: ${props => props.selected ? '#fff' : '#bbb'};
  text-align: center;
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
`;

const SeedNumber = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: #B30E16;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
`;

const StartButton = styled.button`
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 30px auto 0;
  background-color: #B30E16;
  color: white;
  padding: 15px 30px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 1.1em;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #950b12;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const AvailableTeamsPanel = styled.div`
  background-color: #1e1e1e;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const AvailableTeamsTitle = styled.h3`
  color: #C4CED4;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
`;

const TeamsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background-color: #252525;
  border-radius: 8px;
`;

const DraggableTeamCard = styled.div`
  background-color: ${props => props.isDragging ? '#2a3f52' : '#1e1e1e'};
  border: 2px solid ${props => props.isDragging ? '#4a89dc' : '#333'};
  border-radius: 8px;
  padding: 10px;
  cursor: grab;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background-color: #2a3f52;
    border-color: #4a89dc;
  }
`;

const TeamInfo = styled.div`
  flex-grow: 1;
`;

const TeamRecord = styled.div`
  color: #aaa;
  font-size: 12px;
`;

const StanleyCupSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('options');
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState(Array(16).fill(null));
  const [settings, setSettings] = useState({
    seriesLength: '7',
    homeIceAdvantage: true,
    injuries: true,
    fatigue: true
  });

  useEffect(() => {
    fetchNHLTeams();
  }, []);

  const fetchNHLTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('Team')
        .select('*')
        .eq('league', 'NHL')
        .order('conference', { ascending: true })
        .order('division', { ascending: true });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching NHL teams:', error);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    // Handle drag from available teams to playoff spots
    if (result.draggableId.startsWith('available-team-')) {
      const teamId = result.draggableId.split('-')[2];
      const team = teams.find(t => t.id.toString() === teamId);
      
      if (team && destination.droppableId.startsWith('playoffSpot-0-')) {
        const [, , matchupIndex, position] = destination.droppableId.split('-');
        const index = parseInt(matchupIndex) * 2 + (position === 'top' ? 0 : 1);
        
        setSelectedTeams(prev => {
          const newTeams = [...prev];
          newTeams[index] = team;
          return newTeams;
        });
      }
    }
    
    // Handle drag between playoff spots
    else if (result.draggableId.startsWith('playoff-team-')) {
      const teamId = result.draggableId.split('-')[2];
      const team = selectedTeams.find(t => t && t.id.toString() === teamId);
      
      if (team && destination.droppableId.startsWith('playoffSpot-0-')) {
        const [, , matchupIndex, position] = destination.droppableId.split('-');
        const destIndex = parseInt(matchupIndex) * 2 + (position === 'top' ? 0 : 1);
        
        setSelectedTeams(prev => {
          const newTeams = [...prev];
          const sourceIndex = prev.findIndex(t => t && t.id === team.id);
          newTeams[sourceIndex] = null;
          newTeams[destIndex] = team;
          return newTeams;
        });
      }
    }
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const renderOptions = () => (
    <>
      <Title>Stanley Cup Playoffs</Title>
      <Description>
        Begin your journey to hockey's ultimate prize. Choose to start a new playoff run
        or continue an existing series.
      </Description>
      
      <OptionsContainer>
        <OptionCard onClick={() => setStep('setup')}>
          <OptionIcon>🏆</OptionIcon>
          <OptionTitle>Start New Playoffs</OptionTitle>
          <OptionDescription>
            Begin a fresh playoff run. Select your teams, customize settings,
            and start your quest for the Stanley Cup.
          </OptionDescription>
        </OptionCard>
        
        <OptionCard>
          <OptionIcon>⏯️</OptionIcon>
          <OptionTitle>Continue Playoffs</OptionTitle>
          <OptionDescription>
            Resume an existing playoff series. Pick up where you left off
            in your journey to the championship.
          </OptionDescription>
        </OptionCard>
      </OptionsContainer>
    </>
  );

  const renderSetup = () => (
    <>
      <Title>Stanley Cup Playoffs Setup</Title>
      <Description>
        Customize your playoff settings and arrange the teams in the bracket.
        Drag and drop teams to set up the first-round matchups.
      </Description>
      
      <SetupContainer>
        <SettingsPanel>
          <SettingGroup>
            <SettingLabel>Series Length</SettingLabel>
            <Select
              value={settings.seriesLength}
              onChange={(e) => handleSettingChange('seriesLength', e.target.value)}
            >
              <option value="1">Single Game</option>
              <option value="3">Best of 3</option>
              <option value="5">Best of 5</option>
              <option value="7">Best of 7</option>
            </Select>
          </SettingGroup>
          
          <SettingGroup>
            <SettingLabel>Home Ice Advantage</SettingLabel>
            <Select
              value={settings.homeIceAdvantage.toString()}
              onChange={(e) => handleSettingChange('homeIceAdvantage', e.target.value === 'true')}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </Select>
          </SettingGroup>
          
          <SettingGroup>
            <SettingLabel>Injuries</SettingLabel>
            <Select
              value={settings.injuries.toString()}
              onChange={(e) => handleSettingChange('injuries', e.target.value === 'true')}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </Select>
          </SettingGroup>
          
          <SettingGroup>
            <SettingLabel>Fatigue</SettingLabel>
            <Select
              value={settings.fatigue.toString()}
              onChange={(e) => handleSettingChange('fatigue', e.target.value === 'true')}
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </Select>
          </SettingGroup>
        </SettingsPanel>

        <TeamSelector teams={teams.filter(team => !selectedTeams.includes(team))} />
        
        <BracketPreview>
          <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>Playoff Bracket</h2>
          <PlayoffBracket teams={selectedTeams} />
        </BracketPreview>
      </SetupContainer>
      
      <StartButton
        disabled={selectedTeams.filter(Boolean).length !== 16}
        onClick={() => navigate('/tournaments/stanley-cup/play')}
      >
        Start Playoffs
      </StartButton>
    </>
  );

  return (
    <Container>
      {step === 'options' ? (
        renderOptions()
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          {renderSetup()}
        </DragDropContext>
      )}
    </Container>
  );
};

export default StanleyCupSetup; 