import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

const TournamentDetails = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #333;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const DetailLabel = styled.span`
  color: #aaa;
`;

const DetailValue = styled.span`
  color: #C4CED4;
  font-weight: 500;
`;

const TeamSelectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const TeamCard = styled.div`
  background-color: ${props => props.selected ? '#2a3f52' : '#1e1e1e'};
  border: 2px solid ${props => props.selected ? '#4a89dc' : '#333'};
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #2a3f52;
    border-color: #4a89dc;
  }
`;

const TeamName = styled.div`
  color: ${props => props.selected ? '#fff' : '#bbb'};
  font-weight: ${props => props.selected ? 'bold' : 'normal'};
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

const TournamentSetup = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournamentDetails();
    fetchTeams();
  }, [tournamentId]);

  const fetchTournamentDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('Events')
        .select('*')
        .eq('id', tournamentId)
        .single();
      
      if (error) throw error;
      setTournament(data);
    } catch (error) {
      console.error('Error fetching tournament details:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('Team')
        .select('*');
      
      if (error) throw error;
      setTeams(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setLoading(false);
    }
  };

  const handleTeamSelect = (team) => {
    setSelectedTeams(prev => {
      const maxTeams = tournament?.team_amount || 0;
      const isSelected = prev.find(t => t.id === team.id);
      
      if (isSelected) {
        return prev.filter(t => t.id !== team.id);
      } else if (prev.length < maxTeams) {
        return [...prev, team];
      }
      return prev;
    });
  };

  const handleStartTournament = () => {
    // TODO: Implement tournament start logic
    console.log('Starting tournament with teams:', selectedTeams);
    navigate('/tournaments/play');
  };

  if (loading || !tournament) {
    return (
      <Container>
        <Title>Loading tournament setup...</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Title>{tournament.events}</Title>
      <Description>
        Configure your tournament settings and select the participating teams.
      </Description>

      <TournamentDetails>
        <DetailRow>
          <DetailLabel>Tournament Type</DetailLabel>
          <DetailValue>{tournament.category}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Teams Required</DetailLabel>
          <DetailValue>{tournament.team_amount}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Age Range</DetailLabel>
          <DetailValue>{tournament.min_age} - {tournament.max_age}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Duration</DetailLabel>
          <DetailValue>
            {new Date(tournament.start_date).toLocaleDateString()} - {new Date(tournament.end_date).toLocaleDateString()}
          </DetailValue>
        </DetailRow>
      </TournamentDetails>

      <h2 style={{ color: '#C4CED4', marginBottom: '20px' }}>
        Select Teams ({selectedTeams.length}/{tournament.team_amount})
      </h2>
      
      <TeamSelectionGrid>
        {teams.map(team => (
          <TeamCard
            key={team.id}
            selected={selectedTeams.some(t => t.id === team.id)}
            onClick={() => handleTeamSelect(team)}
          >
            <TeamName selected={selectedTeams.some(t => t.id === team.id)}>
              {team.name}
            </TeamName>
          </TeamCard>
        ))}
      </TeamSelectionGrid>

      <StartButton
        disabled={selectedTeams.length !== tournament.team_amount}
        onClick={handleStartTournament}
      >
        Start Tournament
      </StartButton>
    </Container>
  );
};

export default TournamentSetup; 