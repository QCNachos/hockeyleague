import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check for environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase credentials. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are defined in your .env file.'
  );
} else {
  console.log('Supabase URL: ', supabaseUrl);
  console.log('Supabase Key valid: ', supabaseKey && supabaseKey.length > 0);
}

const supabase = createClient(
  supabaseUrl || 'https://your-supabase-url.supabase.co',
  supabaseKey || 'your-supabase-anon-key'
);

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
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

const FormCard = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #C4CED4;
  font-weight: 500;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 15px;
  border-radius: 4px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #fff;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
  
  option {
    background-color: #2a2a2a;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 15px;
  border-radius: 4px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  color: #fff;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
  
  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
`;

const Button = styled.button`
  background-color: #B30E16;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #950b12;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 14px;
  margin-top: 5px;
`;

const LoadingIndicator = styled.div`
  color: #aaa;
  text-align: center;
  padding: 20px;
`;

const Row = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const BeAProCreate = () => {
  const { startType } = useParams();
  const navigate = useNavigate();
  
  // Player information state
  const [formData, setFormData] = useState({
    league: '',
    team: '',
    age: '18',
    position: 'C',
    height: '183',
    weight: '84',
    number: '97'
  });
  
  // Data for form options
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get career start type label
  const getStartTypeLabel = () => {
    switch(startType) {
      case 'minor':
        return 'Minor League';
      case 'sub-junior':
        return 'Sub-Junior League';
      case 'junior':
        return 'Junior League';
      case 'pro-undrafted':
        return 'Professional (Undrafted)';
      case 'nhl-ready':
        return 'Professional (Drafted)';
      default:
        return 'Unknown Start Type';
    }
  };
  
  // Get age range based on start type
  const getAgeRange = () => {
    switch(startType) {
      case 'minor':
        return { min: 12, max: 15 };
      case 'sub-junior':
        return { min: 13, max: 17 };
      case 'junior':
        return { min: 15, max: 17 };
      case 'pro-undrafted':
        return { min: 16, max: 19 };
      case 'nhl-ready':
        return { min: 18, max: 23 }; // Pro (Drafted) typically allows older players
      default:
        return { min: 16, max: 40 }; // Default wide range
    }
  };
  
  // Get default age for each career start type
  const getDefaultAge = () => {
    switch(startType) {
      case 'minor':
        return 13;
      case 'sub-junior':
        return 14;
      case 'junior':
        return 16;
      case 'pro-undrafted':
        return 17;
      case 'nhl-ready':
        return 18;
      default:
        return 18;
    }
  };
  
  // Fetch leagues from Supabase
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true);
        
        console.log('Attempting to fetch leagues from Supabase...');
        console.log('Using URL:', supabaseUrl);
        console.log('Auth key valid:', !!supabaseKey);
        
        // Remove the tables query which won't work with public access
        
        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('League')
          .select('*')
          .order('league');
          
        if (error) {
          console.error('Supabase error details:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Error details:', error.details);
          throw error;
        }
        
        console.log('Supabase response received:', data);
        
        if (data && data.length > 0) {
          console.log('Supabase League data found:', data);
          
          // Filter leagues based on startType
          let filteredLeagues = data;
          
          // If startType is specified, filter leagues by level
          if (startType) {
            switch(startType) {
              case 'minor':
                filteredLeagues = data.filter(league => league.league_level === 'Minor');
                break;
              case 'sub-junior':
                filteredLeagues = data.filter(league => league.league_level === 'Sub-Junior');
                break;
              case 'junior':
                filteredLeagues = data.filter(league => league.league_level === 'Junior');
                break;
              case 'pro-undrafted':
              case 'nhl-ready':
                filteredLeagues = data.filter(league => league.league_level === 'Pro');
                break;
              default:
                // No filtering if startType is unknown
                break;
            }
          }
          
          setLeagues(filteredLeagues);
        } else {
          // If no data returned from Supabase
          console.log('No League data found in Supabase');
          setLeagues([]);
          setError('No leagues found. Please check your Supabase database or RLS policies.');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leagues:', error);
        
        // No mock data, just show the error
        setLeagues([]);
        setError('Supabase connection failed: ' + error.message);
        setLoading(false);
      }
    };
    
    fetchLeagues();
  }, [startType]);
  
  // Fetch teams based on selected league
  useEffect(() => {
    const fetchTeams = async () => {
      if (!formData.league) {
        setTeams([]);
        return;
      }
      
      try {
        setLoading(true);
        
        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('Team')
          .select('*')
          .eq('league', formData.league)  // Use 'league' instead of 'league_id'
          .order('team');  // Assuming 'team' is the column with the team name
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          console.log('Supabase Team data:', data);
          setTeams(data);
        } else {
          // If no data found for teams
          console.log('No Team data found in Supabase for the selected league');
          setTeams([]);
          setError(`No teams found for league "${formData.league}". Please check your Supabase database.`);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching teams:', error);
        
        // Just show the error without mock data
        setTeams([]);
        setError('Supabase team query failed: ' + error.message);
        setLoading(false);
      }
    };
    
    fetchTeams();
  }, [formData.league]);
  
  // Initial state based on age range
  useEffect(() => {
    // Set age to the default age for the selected career path
    setFormData(prev => ({
      ...prev,
      age: String(getDefaultAge())
    }));
  }, [startType]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for age to enforce limits
    if (name === 'age') {
      const ageRange = getAgeRange();
      const numValue = parseInt(value, 10);
      
      // Enforce minimum and maximum age based on career type
      if (numValue < ageRange.min) {
        setFormData(prev => ({
          ...prev,
          age: String(ageRange.min)
        }));
        return;
      } else if (numValue > ageRange.max) {
        setFormData(prev => ({
          ...prev,
          age: String(ageRange.max)
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Start the career with selected options
  const handleStartCareer = async () => {
    try {
      // Validate age is within range before proceeding
      const ageRange = getAgeRange();
      const playerAge = parseInt(formData.age, 10);
      
      if (playerAge < ageRange.min || playerAge > ageRange.max) {
        setError(`Age must be between ${ageRange.min} and ${ageRange.max} for a ${getStartTypeLabel()} career start.`);
        return;
      }
      
      // Here you would save the player data to your database
      // For now, just navigate to a success page or the game itself
      navigate('/be-a-pro/career');
    } catch (error) {
      console.error('Error starting career:', error);
      setError('Failed to start career. Please try again.');
    }
  };
  
  const positions = ['C', 'LW', 'RW', 'D', 'G'];
  
  if (loading && leagues.length === 0) {
    return <LoadingIndicator>Loading...</LoadingIndicator>;
  }
  
  return (
    <Container>
      <Title>Create Your Player</Title>
      <Description>
        Set up your player for a {getStartTypeLabel()} career start. 
        Customize your player's details before beginning your journey to hockey stardom.
      </Description>
      
      <FormCard>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <FormGroup>
          <Label htmlFor="league">League</Label>
          <Select 
            id="league" 
            name="league" 
            value={formData.league}
            onChange={handleChange}
            required
          >
            <option value="">Select a League</option>
            {leagues.map(league => (
              <option key={league.abbreviation} value={league.abbreviation}>
                {league.abbreviation} - {league.league}
              </option>
            ))}
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label htmlFor="team">Team</Label>
          <Select 
            id="team" 
            name="team" 
            value={formData.team}
            onChange={handleChange}
            disabled={!formData.league || teams.length === 0}
            required
          >
            <option value="">Select a Team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.location} {team.team} ({team.league})
              </option>
            ))}
          </Select>
        </FormGroup>
        
        <Row>
          <FormGroup>
            <Label htmlFor="position">Position</Label>
            <Select 
              id="position" 
              name="position" 
              value={formData.position}
              onChange={handleChange}
              required
            >
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="age">Age</Label>
            <Input 
              id="age" 
              name="age" 
              type="number" 
              min={getAgeRange().min}
              max={getAgeRange().max}
              value={formData.age}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="number">Jersey Number</Label>
            <Input 
              id="number" 
              name="number" 
              type="number" 
              min="1" 
              max="99" 
              value={formData.number}
              onChange={handleChange}
              required
            />
          </FormGroup>
        </Row>
        
        <Row>
          <FormGroup>
            <Label htmlFor="height">Height (cm)</Label>
            <Input 
              id="height" 
              name="height" 
              type="number" 
              min="150" 
              max="220" 
              value={formData.height}
              onChange={handleChange}
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input 
              id="weight" 
              name="weight" 
              type="number" 
              min="60" 
              max="130" 
              value={formData.weight}
              onChange={handleChange}
              required
            />
          </FormGroup>
        </Row>
        
        <ButtonContainer>
          <Button 
            onClick={handleStartCareer}
            disabled={!formData.league || !formData.team}
          >
            Start Career
          </Button>
        </ButtonContainer>
      </FormCard>
    </Container>
  );
};

export default BeAProCreate; 