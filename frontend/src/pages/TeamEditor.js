import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../context/AuthContext';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase credentials. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are defined in your .env file.'
  );
} else {
  console.log('Supabase URL configured for TeamEditor');
}

const supabase = createClient(
  supabaseUrl || 'https://your-supabase-url.supabase.co',
  supabaseKey || 'your-supabase-anon-key'
);

// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #C4CED4;
  margin-bottom: 20px;
`;

const FormContainer = styled.form`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 25px;
  margin-bottom: 30px;
`;

const FormSection = styled.div`
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #333;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  color: #B30E16;
  font-size: 20px;
  margin-bottom: 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #C4CED4;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  background-color: #2a2a2a;
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
  padding: 12px 15px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
  
  option {
    background-color: #1e1e1e;
  }
`;

const ColorInputContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ColorPreview = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-left: 10px;
  border: 1px solid #333;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 12px 25px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SaveButton = styled(Button)`
  background-color: #B30E16;
  color: white;
  border: none;
  
  &:hover:not(:disabled) {
    background-color: #950b12;
  }
`;

const CancelButton = styled(Button)`
  background-color: transparent;
  color: #C4CED4;
  border: 1px solid #444;
  
  &:hover {
    background-color: #2a2a2a;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  
  &::after {
    content: "";
    width: 40px;
    height: 40px;
    border: 5px solid #333;
    border-top-color: #B30E16;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  background-color: rgba(179, 14, 22, 0.1);
  color: #B30E16;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid rgba(179, 14, 22, 0.3);
`;

const SuccessMessage = styled.div`
  background-color: rgba(75, 181, 67, 0.1);
  color: #4BB543;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
  border: 1px solid rgba(75, 181, 67, 0.3);
`;

const TeamEditor = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [divisions, setDivisions] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [conferences, setConferences] = useState([]);
  
  // Team data state
  const [teamData, setTeamData] = useState({
    team: '',
    location: '',
    abbreviation: '',
    primary_color: '#000000',
    secondary_color: '#FFFFFF',
    arena: '',
    capacity: 18000,
    prestige: 50,
    division: '',
    conference: '',
    league: '',
    salary_cap: 82500000,
    // Additional fields for staff, etc.
    head_coach: '',
    gm_name: '',
    assistant_coach: '',
    owner: '',
    founded_year: 2000
  });
  
  // Original data for comparison/reset
  const [originalTeamData, setOriginalTeamData] = useState({});
  
  // Load team data and reference data (leagues, divisions, etc.)
  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch the team data
        const { data: team, error: teamError } = await supabase
          .from('Team')
          .select('*')
          .eq('id', teamId)
          .single();
          
        if (teamError) throw teamError;
        
        if (!team) {
          throw new Error(`Team with ID ${teamId} not found`);
        }
        
        console.log('Team data fetched:', team);
        
        // Fetch leagues, conferences, and divisions for dropdown options
        const [leaguesResponse, conferencesResponse, divisionsResponse] = await Promise.all([
          supabase.from('League').select('*').order('league'),
          supabase.from('Conference').select('*').order('conference'),
          supabase.from('Division').select('*').order('division')
        ]);
        
        if (leaguesResponse.error) throw leaguesResponse.error;
        if (conferencesResponse.error) throw conferencesResponse.error;
        if (divisionsResponse.error) throw divisionsResponse.error;
        
        // Set reference data
        setLeagues(leaguesResponse.data || []);
        setConferences(conferencesResponse.data || []);
        setDivisions(divisionsResponse.data || []);
        
        // Transform team data for the form
        const formattedTeamData = {
          team: team.team || '',
          location: team.location || '',
          abbreviation: team.abbreviation || '',
          primary_color: team.primary_color || '#000000',
          secondary_color: team.secondary_color || '#FFFFFF',
          arena: team.arena || '',
          capacity: team.capacity || 18000,
          prestige: team.prestige || 50,
          division: team.division || '',
          conference: team.conference || '',
          league: team.league || '',
          salary_cap: team.salary_cap || 82500000,
          head_coach: team.head_coach || '',
          gm_name: team.gm_name || '',
          assistant_coach: team.assistant_coach || '',
          owner: team.owner || '',
          founded_year: team.founded_year || 2000
        };
        
        // Set form data and original data for comparison/reset
        setTeamData(formattedTeamData);
        setOriginalTeamData(formattedTeamData);
        
      } catch (error) {
        console.error('Error fetching team data:', error);
        setError(`Failed to load team data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (teamId) {
      fetchTeamData();
    } else {
      setError('No team ID provided');
      setLoading(false);
    }
  }, [teamId]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle numeric inputs
    if (type === 'number') {
      setTeamData(prev => ({
        ...prev,
        [name]: parseInt(value, 10) || 0
      }));
    } else {
      setTeamData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      setError('You must be logged in to save changes');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      // Update the team in Supabase
      const { error } = await supabase
        .from('Team')
        .update({
          team: teamData.team,
          location: teamData.location,
          abbreviation: teamData.abbreviation,
          primary_color: teamData.primary_color,
          secondary_color: teamData.secondary_color,
          arena: teamData.arena,
          capacity: teamData.capacity,
          prestige: teamData.prestige,
          division: teamData.division,
          conference: teamData.conference,
          league: teamData.league,
          salary_cap: teamData.salary_cap,
          head_coach: teamData.head_coach,
          gm_name: teamData.gm_name,
          assistant_coach: teamData.assistant_coach,
          owner: teamData.owner,
          founded_year: teamData.founded_year
        })
        .eq('id', teamId);
      
      if (error) throw error;
      
      setSuccess('Team information updated successfully');
      
      // Update original data
      setOriginalTeamData({...teamData});
      
      // Redirect after successful save (with a delay to show success message)
      setTimeout(() => {
        navigate('/team-manager');
      }, 2000);
      
    } catch (error) {
      console.error('Error updating team:', error);
      setError(`Failed to update team: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Handle canceling edits
  const handleCancel = () => {
    navigate('/team-manager');
  };
  
  // Handle resetting form to original values
  const handleReset = () => {
    setTeamData({...originalTeamData});
    setError(null);
    setSuccess(null);
  };
  
  if (loading) {
    return (
      <Container>
        <Title>Edit Team</Title>
        <LoadingSpinner />
      </Container>
    );
  }
  
  if (error && !teamData.team) {
    return (
      <Container>
        <Title>Edit Team</Title>
        <ErrorMessage>{error}</ErrorMessage>
        <ButtonContainer>
          <CancelButton onClick={handleCancel}>Back to Team Manager</CancelButton>
        </ButtonContainer>
      </Container>
    );
  }
  
  return (
    <Container>
      <Title>Edit Team: {teamData.location} {teamData.team}</Title>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <FormContainer onSubmit={handleSubmit}>
        <FormSection>
          <SectionTitle>Team Identity</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label htmlFor="team">Team Name</Label>
              <Input
                type="text"
                id="team"
                name="team"
                value={teamData.team}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="location">City/Location</Label>
              <Input
                type="text"
                id="location"
                name="location"
                value={teamData.location}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="abbreviation">Abbreviation (3 letters)</Label>
              <Input
                type="text"
                id="abbreviation"
                name="abbreviation"
                value={teamData.abbreviation}
                onChange={handleInputChange}
                maxLength={3}
                required
              />
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
                  value={teamData.primary_color}
                  onChange={handleInputChange}
                />
                <ColorPreview color={teamData.primary_color} />
              </ColorInputContainer>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <ColorInputContainer>
                <Input
                  type="color"
                  id="secondary_color"
                  name="secondary_color"
                  value={teamData.secondary_color}
                  onChange={handleInputChange}
                />
                <ColorPreview color={teamData.secondary_color} />
              </ColorInputContainer>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="founded_year">Founded Year</Label>
              <Input
                type="number"
                id="founded_year"
                name="founded_year"
                value={teamData.founded_year}
                onChange={handleInputChange}
                min={1800}
                max={new Date().getFullYear()}
              />
            </FormGroup>
          </FormRow>
        </FormSection>
        
        <FormSection>
          <SectionTitle>League Affiliation</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label htmlFor="league">League</Label>
              <Select
                id="league"
                name="league"
                value={teamData.league}
                onChange={handleInputChange}
                required
              >
                <option value="">Select League</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.abbreviation || league.league}>
                    {league.league} {league.abbreviation ? `(${league.abbreviation})` : ''}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="conference">Conference</Label>
              <Select
                id="conference"
                name="conference"
                value={teamData.conference}
                onChange={handleInputChange}
              >
                <option value="">Select Conference</option>
                {conferences.map((conference) => (
                  <option key={conference.id} value={conference.id}>
                    {conference.conference}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="division">Division</Label>
              <Select
                id="division"
                name="division"
                value={teamData.division}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Division</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.division}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>
        </FormSection>
        
        <FormSection>
          <SectionTitle>Arena Information</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label htmlFor="arena">Arena Name</Label>
              <Input
                type="text"
                id="arena"
                name="arena"
                value={teamData.arena}
                onChange={handleInputChange}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="capacity">Arena Capacity</Label>
              <Input
                type="number"
                id="capacity"
                name="capacity"
                value={teamData.capacity}
                onChange={handleInputChange}
                min={1000}
                max={100000}
                required
              />
            </FormGroup>
          </FormRow>
        </FormSection>
        
        <FormSection>
          <SectionTitle>Team Budget & Performance</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label htmlFor="salary_cap">Salary Cap ($)</Label>
              <Input
                type="number"
                id="salary_cap"
                name="salary_cap"
                value={teamData.salary_cap}
                onChange={handleInputChange}
                min={0}
                step={100000}
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="prestige">Team Prestige (1-100)</Label>
              <Input
                type="range"
                id="prestige"
                name="prestige"
                value={teamData.prestige}
                onChange={handleInputChange}
                min={1}
                max={100}
                required
              />
              <div style={{ textAlign: 'center', color: '#C4CED4' }}>{teamData.prestige}</div>
            </FormGroup>
          </FormRow>
        </FormSection>
        
        <FormSection>
          <SectionTitle>Staff Information</SectionTitle>
          <FormRow>
            <FormGroup>
              <Label htmlFor="head_coach">Head Coach</Label>
              <Input
                type="text"
                id="head_coach"
                name="head_coach"
                value={teamData.head_coach}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="assistant_coach">Assistant Coach</Label>
              <Input
                type="text"
                id="assistant_coach"
                name="assistant_coach"
                value={teamData.assistant_coach}
                onChange={handleInputChange}
              />
            </FormGroup>
          </FormRow>
          
          <FormRow>
            <FormGroup>
              <Label htmlFor="gm_name">General Manager</Label>
              <Input
                type="text"
                id="gm_name"
                name="gm_name"
                value={teamData.gm_name}
                onChange={handleInputChange}
              />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="owner">Owner</Label>
              <Input
                type="text"
                id="owner"
                name="owner"
                value={teamData.owner}
                onChange={handleInputChange}
              />
            </FormGroup>
          </FormRow>
        </FormSection>
        
        <ButtonContainer>
          <div>
            <CancelButton type="button" onClick={handleCancel} disabled={saving}>
              Cancel
            </CancelButton>
            <Button type="button" onClick={handleReset} disabled={saving} style={{ marginLeft: '10px' }}>
              Reset Form
            </Button>
          </div>
          <SaveButton type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </SaveButton>
        </ButtonContainer>
      </FormContainer>
    </Container>
  );
};

export default TeamEditor; 