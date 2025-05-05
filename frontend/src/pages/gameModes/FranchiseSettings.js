import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 10px;
  color: #C4CED4;
`;

const Subtitle = styled.h2`
  color: #B30E16;
  margin-bottom: 20px;
  font-size: 1.3rem;
`;

const Description = styled.p`
  margin-bottom: 30px;
  color: #aaa;
  line-height: 1.6;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const SettingsCategory = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const CategoryTitle = styled.h3`
  color: #C4CED4;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
`;

const SettingsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SettingItem = styled.div`
  margin-bottom: 20px;
`;

const SettingLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #aaa;
  font-weight: bold;
`;

const SettingDescription = styled.p`
  margin-top: 4px;
  color: #777;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  background-color: #2a2a2a;
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  background-color: #2a2a2a;
  color: #fff;
  border: 1px solid #444;
  border-radius: 4px;
  font-size: 16px;
  
  &[type="range"] {
    height: 5px;
    -webkit-appearance: none;
    width: 100%;
    background: #444;
    outline: none;
    
    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      background: #B30E16;
      border-radius: 50%;
      cursor: pointer;
    }
    
    &::-moz-range-thumb {
      width: 20px;
      height: 20px;
      background: #B30E16;
      border-radius: 50%;
      cursor: pointer;
    }
  }
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
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
`;

const RangeValueDisplay = styled.span`
  display: inline-block;
  margin-left: 10px;
  color: #B30E16;
  font-weight: bold;
  width: 40px;
  text-align: center;
`;

const FranchiseSettings = () => {
  const { franchiseType } = useParams();
  const navigate = useNavigate();
  
  // Initialize state with default settings
  const [settings, setSettings] = useState({
    // General Settings
    franchiseLength: '25',
    salary_cap: 'on',
    cap_amount: '82500000',
    starting_year: '2025',
    starting_time: 'pre_draft',
    controlledTeams: '1',
    
    // Difficulty Settings
    game_difficulty: 'regular',
    trade_difficulty: 'medium',
    draft_quality: 'medium',
    
    // Simulation Settings
    sim_engine: 'realistic',
    player_progression: 'standard',
    injury_frequency: '50',
    morale_system: 'true',
    player_retirement: 'true',
    
    // Customization
    auto_save: 'true',
    save_frequency: 'weekly',
    auto_roll: 'false',
    draft_class_quality: 'standard',
    
    // Rules
    waivers: 'true',
    offside: 'true',
    icing: 'true',
    roster_limits: 'true',
    line_changes: 'manual',
    contract_extensions: 'realistic',
    
    // Advanced Settings
    stat_tracking: 'detailed',
    player_moods: 'true',
    farm_system: 'true',
    free_agency: 'realistic',
    regression_model: 'standard',
    
    // Financial Settings
    team_budget: 'true',
    ticket_pricing: 'true',
    market_size_impact: 'true',
    revenue_sharing: 'false',
    
    // Draft Settings
    draft_lottery: 'true',
    prospect_visibility: 'realistic',
    scouting_accuracy: 'medium',
    international_players: 'true'
  });
  
  const franchiseTypeNames = {
    'standard': 'Standard Franchise',
    'expansion': 'Expansion Franchise',
    'fantasy': 'Fantasy Draft Franchise',
    'historical': 'Historical Franchise'
  };
  
  const handleSettingChange = (setting, value) => {
    setSettings({
      ...settings,
      [setting]: value
    });
  };
  
  const handleSubmit = () => {
    // Here you would typically save settings to state/backend
    console.log('Franchise settings saved:', settings);
    
    // Navigate to next step based on franchise type
    if (franchiseType === 'standard') {
      navigate('/franchise/team-selection', { state: { settings } });
    } else if (franchiseType === 'expansion') {
      navigate('/franchise/expansion-setup', { state: { settings } });
    } else {
      // For other modes (which are currently disabled/coming soon)
      alert('This franchise mode is coming soon!');
      navigate('/franchise');
    }
  };
  
  const handleCancel = () => {
    navigate('/franchise');
  };

  return (
    <Container>
      <Title>Franchise Settings</Title>
      <Subtitle>{franchiseTypeNames[franchiseType] || 'Custom Franchise'}</Subtitle>
      <Description>
        Customize your franchise experience with the settings below. These settings will
        affect how your franchise operates throughout its entire lifespan.
      </Description>

      <SettingsGrid>
        <SettingsCategory>
          <CategoryTitle>General Settings</CategoryTitle>
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="franchiseLength">Franchise Length (Years)</SettingLabel>
              <Select 
                id="franchiseLength" 
                value={settings.franchiseLength}
                onChange={(e) => handleSettingChange('franchiseLength', e.target.value)}
              >
                <option value="5">5 Years</option>
                <option value="10">10 Years</option>
                <option value="15">15 Years</option>
                <option value="25">25 Years</option>
                <option value="50">50 Years</option>
              </Select>
              <SettingDescription>
                How many years your franchise can run before completion.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="controlledTeams">Teams You Control</SettingLabel>
              <Select 
                id="controlledTeams" 
                value={settings.controlledTeams}
                onChange={(e) => handleSettingChange('controlledTeams', e.target.value)}
              >
                <option value="1">1 Team</option>
                <option value="2">2 Teams</option>
                <option value="3">3 Teams</option>
              </Select>
              <SettingDescription>
                How many teams you can control simultaneously in this franchise.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
          
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="salary_cap">Salary Cap</SettingLabel>
              <Select 
                id="salary_cap" 
                value={settings.salary_cap}
                onChange={(e) => handleSettingChange('salary_cap', e.target.value)}
              >
                <option value="on">Enabled</option>
                <option value="off">Disabled</option>
              </Select>
              <SettingDescription>
                Enable or disable the salary cap in your franchise.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="cap_amount">Salary Cap Amount ($)</SettingLabel>
              <Input 
                type="text" 
                id="cap_amount" 
                value={settings.cap_amount}
                onChange={(e) => handleSettingChange('cap_amount', e.target.value)}
                disabled={settings.salary_cap === 'off'}
              />
              <SettingDescription>
                Set the amount for the salary cap in your franchise.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
          
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="starting_year">Starting Year</SettingLabel>
              <Select 
                id="starting_year" 
                value={settings.starting_year}
                onChange={(e) => handleSettingChange('starting_year', e.target.value)}
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
                <option value="2029">2029</option>
                <option value="2030">2030</option>
              </Select>
              <SettingDescription>
                The year in which your franchise will begin.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="starting_time">Starting Time</SettingLabel>
              <Select 
                id="starting_time" 
                value={settings.starting_time}
                onChange={(e) => handleSettingChange('starting_time', e.target.value)}
              >
                <option value="pre_draft">Pre-Entry Draft</option>
                <option value="pre_season">Pre-Season</option>
                <option value="july_1" disabled>July 1st (Coming Soon)</option>
                <option value="season_opener" disabled>Season Opener (Coming Soon)</option>
                <option value="christmas_break" disabled>Christmas Break (Coming Soon)</option>
                <option value="trade_deadline" disabled>Trade Deadline (Coming Soon)</option>
                <option value="post_trade_deadline" disabled>Post Trade Deadline (Coming Soon)</option>
                <option value="playoff_race" disabled>Playoff Race (12 games) (Coming Soon)</option>
                <option value="playoff_start" disabled>Playoff Start (Coming Soon)</option>
              </Select>
              <SettingDescription>
                The point in the season at which your franchise will begin.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
        </SettingsCategory>
        
        <SettingsCategory>
          <CategoryTitle>Fantasy Draft Settings</CategoryTitle>
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="fantasy_draft">Fantasy Draft Mode</SettingLabel>
              <Select 
                id="fantasy_draft" 
                value="false"
                disabled
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Start with a clean slate by placing all NHL players into a draft pool. (Coming Soon)
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
        </SettingsCategory>
        
        <SettingsCategory>
          <CategoryTitle>Difficulty Settings</CategoryTitle>
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="game_difficulty">Game Difficulty</SettingLabel>
              <Select 
                id="game_difficulty" 
                value={settings.game_difficulty}
                onChange={(e) => handleSettingChange('game_difficulty', e.target.value)}
              >
                <option value="rookie">Rookie</option>
                <option value="regular">Regular</option>
                <option value="all-star">All-Star</option>
                <option value="superstar">Superstar</option>
                <option value="custom">Custom</option>
              </Select>
              <SettingDescription>
                Difficulty level for gameplay when playing games manually.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="trade_difficulty">Trade Difficulty</SettingLabel>
              <Select 
                id="trade_difficulty" 
                value={settings.trade_difficulty}
                onChange={(e) => handleSettingChange('trade_difficulty', e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="realistic">Realistic</option>
              </Select>
              <SettingDescription>
                How difficult it is to make trades with AI general managers.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
          
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="draft_quality">Draft Quality</SettingLabel>
              <Select 
                id="draft_quality" 
                value={settings.draft_quality}
                onChange={(e) => handleSettingChange('draft_quality', e.target.value)}
              >
                <option value="low">Low Quality</option>
                <option value="medium">Medium Quality</option>
                <option value="high">High Quality</option>
              </Select>
              <SettingDescription>
                The quality of players available in drafts throughout your franchise.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
        </SettingsCategory>
        
        <SettingsCategory>
          <CategoryTitle>Simulation Settings</CategoryTitle>
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="sim_engine">Simulation Engine</SettingLabel>
              <Select 
                id="sim_engine" 
                value={settings.sim_engine}
                onChange={(e) => handleSettingChange('sim_engine', e.target.value)}
              >
                <option value="arcadey">Arcadey</option>
                <option value="balanced">Balanced</option>
                <option value="realistic">Realistic</option>
              </Select>
              <SettingDescription>
                The type of simulation engine used for simulating games.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="player_progression">Player Progression</SettingLabel>
              <Select 
                id="player_progression" 
                value={settings.player_progression}
                onChange={(e) => handleSettingChange('player_progression', e.target.value)}
              >
                <option value="slow">Slow</option>
                <option value="standard">Standard</option>
                <option value="fast">Fast</option>
              </Select>
              <SettingDescription>
                How quickly players develop and improve their attributes.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
          
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="injury_frequency">Injury Frequency</SettingLabel>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Input 
                  type="range" 
                  id="injury_frequency" 
                  min="0" 
                  max="100" 
                  value={settings.injury_frequency}
                  onChange={(e) => handleSettingChange('injury_frequency', e.target.value)}
                />
                <RangeValueDisplay>{settings.injury_frequency}%</RangeValueDisplay>
              </div>
              <SettingDescription>
                The frequency of injuries occurring during games and simulations.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="morale_system">Morale System</SettingLabel>
              <Select 
                id="morale_system" 
                value={settings.morale_system}
                onChange={(e) => handleSettingChange('morale_system', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Enable or disable the player morale and chemistry system.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
          
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="player_retirement">Player Retirement</SettingLabel>
              <Select 
                id="player_retirement" 
                value={settings.player_retirement}
                onChange={(e) => handleSettingChange('player_retirement', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Enable or disable players retiring as they age.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
        </SettingsCategory>
        
        <SettingsCategory>
          <CategoryTitle>Customization</CategoryTitle>
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="auto_save">Auto Save</SettingLabel>
              <Select 
                id="auto_save" 
                value={settings.auto_save}
                onChange={(e) => handleSettingChange('auto_save', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Automatically save your franchise progress.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="save_frequency">Save Frequency</SettingLabel>
              <Select 
                id="save_frequency" 
                value={settings.save_frequency}
                onChange={(e) => handleSettingChange('save_frequency', e.target.value)}
                disabled={settings.auto_save === 'false'}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </Select>
              <SettingDescription>
                How often your franchise will automatically save.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
          
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="auto_roll">Auto Roll</SettingLabel>
              <Select 
                id="auto_roll" 
                value={settings.auto_roll}
                onChange={(e) => handleSettingChange('auto_roll', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Automatically progress days when there are no actions required.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="draft_class_quality">Draft Class Quality</SettingLabel>
              <Select 
                id="draft_class_quality" 
                value={settings.draft_class_quality}
                onChange={(e) => handleSettingChange('draft_class_quality', e.target.value)}
              >
                <option value="weak">Weak</option>
                <option value="standard">Standard</option>
                <option value="strong">Strong</option>
                <option value="random">Random</option>
              </Select>
              <SettingDescription>
                The overall quality of draft classes throughout your franchise.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
        </SettingsCategory>
        
        <SettingsCategory>
          <CategoryTitle>Rules</CategoryTitle>
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="waivers">Waivers</SettingLabel>
              <Select 
                id="waivers" 
                value={settings.waivers}
                onChange={(e) => handleSettingChange('waivers', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Enable or disable the waiver wire system.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="offside">Offside</SettingLabel>
              <Select 
                id="offside" 
                value={settings.offside}
                onChange={(e) => handleSettingChange('offside', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Enable or disable offside rules during gameplay.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
          
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="icing">Icing</SettingLabel>
              <Select 
                id="icing" 
                value={settings.icing}
                onChange={(e) => handleSettingChange('icing', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Enable or disable icing rules during gameplay.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="roster_limits">Roster Limits</SettingLabel>
              <Select 
                id="roster_limits" 
                value={settings.roster_limits}
                onChange={(e) => handleSettingChange('roster_limits', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Enable or disable roster size limitations.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
          
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="line_changes">Line Changes</SettingLabel>
              <Select 
                id="line_changes" 
                value={settings.line_changes}
                onChange={(e) => handleSettingChange('line_changes', e.target.value)}
              >
                <option value="manual">Manual</option>
                <option value="automatic">Automatic</option>
                <option value="hybrid">Hybrid</option>
              </Select>
              <SettingDescription>
                How line changes are handled during gameplay.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="contract_extensions">Contract Extensions</SettingLabel>
              <Select 
                id="contract_extensions" 
                value={settings.contract_extensions}
                onChange={(e) => handleSettingChange('contract_extensions', e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="realistic">Realistic</option>
                <option value="challenging">Challenging</option>
              </Select>
              <SettingDescription>
                How difficult it is to negotiate contract extensions with players.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
        </SettingsCategory>
        
        <SettingsCategory>
          <CategoryTitle>Financial Settings</CategoryTitle>
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="team_budget">Team Budget</SettingLabel>
              <Select 
                id="team_budget" 
                value={settings.team_budget}
                onChange={(e) => handleSettingChange('team_budget', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Enable or disable team budgets for non-player expenses.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="ticket_pricing">Ticket Pricing</SettingLabel>
              <Select 
                id="ticket_pricing" 
                value={settings.ticket_pricing}
                onChange={(e) => handleSettingChange('ticket_pricing', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Enable or disable control over ticket pricing.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
          
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="market_size_impact">Market Size Impact</SettingLabel>
              <Select 
                id="market_size_impact" 
                value={settings.market_size_impact}
                onChange={(e) => handleSettingChange('market_size_impact', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Enable or disable the impact of market size on team finances.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="revenue_sharing">Revenue Sharing</SettingLabel>
              <Select 
                id="revenue_sharing" 
                value={settings.revenue_sharing}
                onChange={(e) => handleSettingChange('revenue_sharing', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Enable or disable revenue sharing between teams.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
        </SettingsCategory>
        
        <SettingsCategory>
          <CategoryTitle>Draft Settings</CategoryTitle>
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="draft_lottery">Draft Lottery</SettingLabel>
              <Select 
                id="draft_lottery" 
                value={settings.draft_lottery}
                onChange={(e) => handleSettingChange('draft_lottery', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Enable or disable the draft lottery for determining draft order.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="prospect_visibility">Prospect Visibility</SettingLabel>
              <Select 
                id="prospect_visibility" 
                value={settings.prospect_visibility}
                onChange={(e) => handleSettingChange('prospect_visibility', e.target.value)}
              >
                <option value="full">Full Visibility</option>
                <option value="realistic">Realistic (Scouting Required)</option>
                <option value="hidden">Hidden (Heavy Scouting Required)</option>
              </Select>
              <SettingDescription>
                How much information is visible about prospects without scouting.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
          
          <SettingsRow>
            <SettingItem>
              <SettingLabel htmlFor="scouting_accuracy">Scouting Accuracy</SettingLabel>
              <Select 
                id="scouting_accuracy" 
                value={settings.scouting_accuracy}
                onChange={(e) => handleSettingChange('scouting_accuracy', e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </Select>
              <SettingDescription>
                How accurate scouting reports are for prospects.
              </SettingDescription>
            </SettingItem>
            
            <SettingItem>
              <SettingLabel htmlFor="international_players">International Players</SettingLabel>
              <Select 
                id="international_players" 
                value={settings.international_players}
                onChange={(e) => handleSettingChange('international_players', e.target.value)}
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </Select>
              <SettingDescription>
                Enable or disable international players in draft classes.
              </SettingDescription>
            </SettingItem>
          </SettingsRow>
        </SettingsCategory>
      </SettingsGrid>
      
      <ButtonsContainer>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button primary onClick={handleSubmit}>Continue</Button>
      </ButtonsContainer>
    </Container>
  );
};

export default FranchiseSettings; 