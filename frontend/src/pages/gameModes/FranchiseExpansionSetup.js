import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { supabase } from '../../lib/supabase';

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

const ExpansionContainer = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  color: #C4CED4;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #333;
`;

const YearTable = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #333;
  border-radius: 5px;
  overflow: hidden;
  margin-top: 20px;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  background-color: #2a2a2a;
  padding: 15px;
  border-bottom: 1px solid #333;
  
  h4 {
    margin: 0;
    color: #B30E16;
    font-size: 16px;
  }
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  padding: 15px;
  border-bottom: 1px solid #333;
  background-color: ${props => props.selected ? 'rgba(179, 14, 22, 0.1)' : 'transparent'};
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #2a2a2a;
  }
`;

const YearCell = styled.div`
  color: #fff;
  font-weight: bold;
  display: flex;
  align-items: center;
`;

const YearSelectCell = styled.div`
  display: flex;
  align-items: center;
  
  select {
    background-color: #2a2a2a;
    border: 1px solid #444;
    border-radius: 4px;
    padding: 8px;
    color: #fff;
    width: 100%;
    max-width: 150px;
    
    &:focus {
      outline: none;
      border-color: #B30E16;
    }
  }
`;

const ExpansionCell = styled.div`
  color: #aaa;
  display: flex;
  align-items: center;
  gap: 10px;
  
  .team-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  
  .team-name {
    font-weight: bold;
    color: #fff;
  }
  
  .team-location {
    font-size: 0.9em;
  }
`;

const TeamLogo = styled.div`
  width: 40px;
  height: 40px;
  background-color: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
  margin-right: 10px;
`;

const ActionCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
`;

const ActionButton = styled.button`
  background-color: ${props => props.danger ? '#B30E16' : '#2a2a2a'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.danger ? '#950b12' : '#444'};
  }
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
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const ComingSoonOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  
  h2 {
    color: #B30E16;
    margin-bottom: 20px;
    font-size: 2rem;
  }
  
  p {
    color: #C4CED4;
    text-align: center;
    max-width: 500px;
    line-height: 1.6;
  }
`;

const NotificationBanner = styled.div`
  background-color: rgba(179, 14, 22, 0.1);
  border-left: 4px solid #B30E16;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 0 4px 4px 0;
  
  h4 {
    margin: 0 0 5px;
    color: #B30E16;
  }
  
  p {
    margin: 0;
    color: #C4CED4;
  }
`;

const FranchiseExpansionSetup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings = {} } = location.state || {};
  const [loading, setLoading] = useState(true);
  const [expansionTeams, setExpansionTeams] = useState([]);
  const [removedTeams, setRemovedTeams] = useState([]); // Track removed teams
  const [showOverlay, setShowOverlay] = useState(false); // Set to false to make the feature available
  
  // Generate years based on franchise length
  const franchiseLength = parseInt(settings.franchiseLength || 25);
  const startYear = 2026;
  const years = Array.from({ length: franchiseLength }, (_, i) => startYear + i);
  
  useEffect(() => {
    // Fetch expansion teams from Supabase
    const fetchExpansionTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('Team_NHL_Expansion')
          .select('id, name, location, abbreviation, entry_year');
        
        if (error) {
          console.error('Error fetching expansion teams:', error);
          return;
        }
        
        // Sort teams by entry year
        const sortedTeams = data.sort((a, b) => a.entry_year - b.entry_year);
        setExpansionTeams(sortedTeams);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpansionTeams();
  }, []);
  
  const handleChangeYear = (teamId, newYear) => {
    setExpansionTeams(prev => 
      prev.map(team => 
        team.id === teamId 
          ? { ...team, entry_year: parseInt(newYear) } 
          : team
      )
    );
  };
  
  const handleRemoveTeam = (teamId) => {
    // Find the team being removed
    const teamToRemove = expansionTeams.find(team => team.id === teamId);
    
    // Add to removed teams list
    if (teamToRemove) {
      setRemovedTeams(prev => [...prev, teamToRemove]);
    }
    
    // Remove from active teams
    setExpansionTeams(prev => prev.filter(team => team.id !== teamId));
  };
  
  const handleRestoreTeam = (teamId) => {
    // Find the team to restore
    const teamToRestore = removedTeams.find(team => team.id === teamId);
    
    // Add back to expansion teams
    if (teamToRestore) {
      setExpansionTeams(prev => [...prev, teamToRestore].sort((a, b) => a.entry_year - b.entry_year));
    }
    
    // Remove from removed teams
    setRemovedTeams(prev => prev.filter(team => team.id !== teamId));
  };
  
  const handleContinue = async () => {
    try {
      setLoading(true);
      
      // Only update entry years for the teams that remain in the UI
      // We won't delete teams from the database
      for (const team of expansionTeams) {
        const { error: updateError } = await supabase
          .from('Team_NHL_Expansion')
          .update({ entry_year: team.entry_year })
          .eq('id', team.id);
          
        if (updateError) {
          console.error('Error updating team:', updateError);
          alert('There was an error saving your changes. Please try again.');
          setLoading(false);
          return;
        }
      }
      
      // Get all settings from the previous page
      const allSettings = location.state?.settings || {};
      
      // Navigate to the team selection page with all relevant information
      navigate('/franchise/team-selection', { 
        state: { 
          settings: {
            ...allSettings,
            franchiseType: 'expansion',
            expansionTeams
          }
        } 
      });
    } catch (error) {
      console.error('Error:', error);
      alert('There was an error saving your changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/franchise');
  };
  
  if (loading) {
    return (
      <Container>
        <Title>Loading expansion data...</Title>
      </Container>
    );
  }
  
  return (
    <Container style={{ position: 'relative' }}>
      {showOverlay && (
        <ComingSoonOverlay>
          <h2>Coming Soon</h2>
          <p>
            The Expansion Franchise mode is under development. You'll soon be able to 
            create your own NHL expansion team and build it from the ground up through
            an expansion draft.
          </p>
          <Button onClick={handleCancel} style={{ marginTop: '20px' }}>Return to Franchise Mode</Button>
        </ComingSoonOverlay>
      )}
      
      {!showOverlay && (
        <NotificationBanner>
          <h4>Development Feature</h4>
          <p>
            The Expansion Franchise mode is currently in development. You can schedule when existing expansion teams 
            will enter the league or remove them from your view. Teams you remove won't appear in your franchise but 
            remain in the database. Creating your own expansion team will be available in a future update.
          </p>
        </NotificationBanner>
      )}
      
      <Title>Expansion Franchise Setup</Title>
      <Description>
        Review and modify the scheduled expansion teams for your franchise. You can change
        the entry year or remove teams from the schedule. These settings will determine 
        when new teams join the league during your franchise.
      </Description>
      
      <ExpansionContainer>
        <SectionTitle>Scheduled Expansion Teams</SectionTitle>
        <p style={{ color: '#aaa', marginBottom: '20px' }}>
          The following teams are scheduled to join the NHL during your franchise. 
          You can modify when they enter or remove them completely.
        </p>
        
        <YearTable>
          <TableHeader>
            <h4>Entry Year</h4>
            <h4>Expansion Team</h4>
            <h4>Actions</h4>
          </TableHeader>
          
          {expansionTeams.map(team => (
            <TableRow key={team.id}>
              <YearSelectCell>
                <select 
                  value={team.entry_year}
                  onChange={(e) => handleChangeYear(team.id, e.target.value)}
                >
                  {years.map(year => (
                    <option key={year} value={year}>
                      {year}-{(year + 1).toString().substring(2)}
                    </option>
                  ))}
                </select>
              </YearSelectCell>
              
              <ExpansionCell>
                <TeamLogo>{team.abbreviation}</TeamLogo>
                <div className="team-info">
                  <span className="team-name">{team.name}</span>
                  <span className="team-location">{team.location}</span>
                </div>
              </ExpansionCell>
              
              <ActionCell>
                <ActionButton 
                  danger
                  onClick={() => handleRemoveTeam(team.id)}
                  title="Remove from your franchise (team will remain in database)"
                >
                  Hide from Franchise
                </ActionButton>
              </ActionCell>
            </TableRow>
          ))}
          
          {expansionTeams.length === 0 && (
            <TableRow>
              <ExpansionCell colSpan="3" style={{ justifyContent: 'center' }}>
                No expansion teams scheduled
              </ExpansionCell>
            </TableRow>
          )}
        </YearTable>
      </ExpansionContainer>
      
      {/* Hidden Teams Section */}
      {removedTeams.length > 0 && (
        <ExpansionContainer>
          <SectionTitle>Hidden Teams</SectionTitle>
          <p style={{ color: '#aaa', marginBottom: '20px' }}>
            These teams have been hidden from your franchise. You can restore them if you change your mind.
          </p>
          
          <YearTable>
            <TableHeader>
              <h4>Team</h4>
              <h4>Details</h4>
              <h4>Actions</h4>
            </TableHeader>
            
            {removedTeams.map(team => (
              <TableRow key={team.id}>
                <ExpansionCell>
                  <TeamLogo>{team.abbreviation}</TeamLogo>
                </ExpansionCell>
                
                <ExpansionCell>
                  <div className="team-info">
                    <span className="team-name">{team.name}</span>
                    <span className="team-location">{team.location}</span>
                  </div>
                </ExpansionCell>
                
                <ActionCell>
                  <ActionButton 
                    onClick={() => handleRestoreTeam(team.id)}
                    title="Add this team back to your franchise"
                  >
                    Restore
                  </ActionButton>
                </ActionCell>
              </TableRow>
            ))}
          </YearTable>
        </ExpansionContainer>
      )}
      
      <ButtonsContainer>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button 
          primary 
          onClick={handleContinue}
          disabled={loading}
        >
          Continue
        </Button>
      </ButtonsContainer>
    </Container>
  );
};

export default FranchiseExpansionSetup; 