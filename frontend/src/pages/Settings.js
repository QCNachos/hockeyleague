import React from 'react';
import styled from 'styled-components';
import { FaCog, FaGamepad } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import CommunityPackToggle from '../components/settings/CommunityPackToggle';
import { 
  selectGameMode, 
  selectGameYear, 
  setGameMode, 
  setGameYear 
} from '../store/slices/settingsSlice';

const PageContainer = styled.div`
  padding: 20px;
`;

const PageTitle = styled.h1`
  color: #C4CED4;
  margin-bottom: 25px;
  font-size: 2rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 15px;
    color: #B30E16;
  }
`;

const SectionTitle = styled.h2`
  color: #C4CED4;
  margin: 20px 0 10px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 10px;
    color: #B30E16;
  }
`;

const SettingsContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const SettingsCard = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const Disclaimer = styled.div`
  margin-top: 30px;
  padding: 15px;
  background-color: rgba(179, 14, 22, 0.1);
  border-left: 4px solid #B30E16;
  border-radius: 4px;
  color: #C4CED4;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const GameModeSetting = styled.div`
  margin: 15px 0;
`;

const GameModeLabel = styled.div`
  color: #C4CED4;
  margin-bottom: 5px;
`;

const GameModeSelect = styled.select`
  background-color: #2a2a2a;
  color: #C4CED4;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #444;
  width: 100%;
  max-width: 300px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
`;

const YearInput = styled.input`
  background-color: #2a2a2a;
  color: #C4CED4;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #444;
  width: 100%;
  max-width: 100px;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
`;

const Settings = () => {
  const dispatch = useDispatch();
  const gameMode = useSelector(selectGameMode);
  const gameYear = useSelector(selectGameYear);
  
  const handleGameModeChange = (e) => {
    dispatch(setGameMode(e.target.value));
  };
  
  const handleYearChange = (e) => {
    dispatch(setGameYear(parseInt(e.target.value, 10)));
  };
  
  return (
    <PageContainer>
      <PageTitle>
        <FaCog /> Application Settings
      </PageTitle>
      
      <SettingsContainer>
        <SectionTitle>
          <FaCog /> Visual Settings
        </SectionTitle>
        <SettingsCard>
          <CommunityPackToggle />
        </SettingsCard>
        
        <SectionTitle>
          <FaGamepad /> Game Mode Settings
        </SectionTitle>
        <SettingsCard>
          <GameModeSetting>
            <GameModeLabel>Current Game Mode:</GameModeLabel>
            <GameModeSelect value={gameMode} onChange={handleGameModeChange}>
              <option value="MENU">Menu (No Game Active)</option>
              <option value="FRANCHISE">Franchise Mode</option>
              <option value="SEASON">Regular Season Mode</option>
              <option value="PLAYOFF">Playoff Tournament</option>
            </GameModeSelect>
          </GameModeSetting>
          
          <GameModeSetting>
            <GameModeLabel>Current Season Year:</GameModeLabel>
            <YearInput 
              type="number" 
              min="2000" 
              max="2100" 
              value={gameYear} 
              onChange={handleYearChange} 
            />
          </GameModeSetting>
        </SettingsCard>
        
        <Disclaimer>
          <strong>Legal Disclaimer:</strong> This application is developed for educational and entertainment purposes only. 
          All team logos, names, and related information are property of their respective owners. 
          The team logos feature allows users to toggle the display of team logos, which are not officially licensed.
          We do not claim ownership of any official team logos or branding elements.
        </Disclaimer>
      </SettingsContainer>
    </PageContainer>
  );
};

export default Settings; 