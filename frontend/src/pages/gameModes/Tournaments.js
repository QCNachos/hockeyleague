import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

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

const TournamentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const TournamentCard = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
`;

const TournamentImage = styled.div`
  height: 180px;
  background-image: ${props => `url(${props.image})`};
  background-size: cover;
  background-position: center;
  border-bottom: 3px solid #B30E16;
`;

const TournamentInfo = styled.div`
  padding: 20px;
  
  h3 {
    color: #B30E16;
    margin-bottom: 10px;
  }
  
  p {
    color: #bbb;
    margin-bottom: 20px;
    height: 80px;
    overflow: hidden;
  }
`;

const ActionButton = styled(Link)`
  display: inline-block;
  background-color: #B30E16;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #950b12;
  }
`;

const Button = styled.button`
  display: inline-block;
  background-color: #B30E16;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #950b12;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const SectionTitle = styled.h2`
  color: #C4CED4;
  margin: 40px 0 20px;
  font-size: 1.8rem;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
`;

// Placeholder images - in a real implementation, these would be imported properly
const placeholderImages = {
  olympics: 'https://via.placeholder.com/300x180?text=Olympics',
  worldChampionship: 'https://via.placeholder.com/300x180?text=World+Championship',
  memorialCup: 'https://via.placeholder.com/300x180?text=Memorial+Cup',
  playoffs: 'https://via.placeholder.com/300x180?text=Playoffs',
  worldJuniors: 'https://via.placeholder.com/300x180?text=World+Juniors',
  customTournament: 'https://via.placeholder.com/300x180?text=Custom+Tournament'
};

const Tournaments = () => {
  return (
    <Container>
      <Title>Tournaments</Title>
      <Description>
        Compete in various hockey tournaments from around the world. Choose from international
        competitions, junior championships, professional playoffs, or create your own custom
        tournament format with the teams and rules you want.
      </Description>
      
      <SectionTitle>International Tournaments</SectionTitle>
      <TournamentsGrid>
        <TournamentCard>
          <TournamentImage image={placeholderImages.olympics} />
          <TournamentInfo>
            <h3>Olympic Tournament</h3>
            <p>
              Represent your country on the biggest international stage. Compete with the
              best players from around the world in this prestigious tournament.
            </p>
            <ActionButton to="/tournaments/olympics">Play Olympics</ActionButton>
          </TournamentInfo>
        </TournamentCard>
        
        <TournamentCard>
          <TournamentImage image={placeholderImages.worldChampionship} />
          <TournamentInfo>
            <h3>World Championship (8 Nations)</h3>
            <p>
              Annual tournament featuring the top 8 hockey nations. Group stage
              followed by elimination rounds to determine the world champion.
            </p>
            <ActionButton to="/tournaments/world-championship">Play World Championship</ActionButton>
          </TournamentInfo>
        </TournamentCard>
        
        <TournamentCard>
          <TournamentImage image={placeholderImages.worldJuniors} />
          <TournamentInfo>
            <h3>World Junior Championship</h3>
            <p>
              The premier international tournament for under-20 players. See which
              nation's prospects reign supreme in this exciting competition.
            </p>
            <ActionButton to="/tournaments/world-juniors">Play World Juniors</ActionButton>
          </TournamentInfo>
        </TournamentCard>
      </TournamentsGrid>
      
      <SectionTitle>Club Tournaments</SectionTitle>
      <TournamentsGrid>
        <TournamentCard>
          <TournamentImage image={placeholderImages.memorialCup} />
          <TournamentInfo>
            <h3>Memorial Cup</h3>
            <p>
              The championship tournament for Canadian junior hockey. The champions from
              the WHL, OHL, and QMJHL compete along with a host team for junior supremacy.
            </p>
            <ActionButton to="/tournaments/memorial-cup">Play Memorial Cup</ActionButton>
          </TournamentInfo>
        </TournamentCard>
        
        <TournamentCard>
          <TournamentImage image={placeholderImages.playoffs} />
          <TournamentInfo>
            <h3>Stanley Cup Playoffs</h3>
            <p>
              The ultimate prize in professional hockey. 16 teams compete in four
              grueling best-of-seven series to hoist Lord Stanley's Cup.
            </p>
            <ActionButton to="/tournaments/stanley-cup">Play Stanley Cup Playoffs</ActionButton>
          </TournamentInfo>
        </TournamentCard>
        
        <TournamentCard>
          <TournamentImage image={placeholderImages.customTournament} />
          <TournamentInfo>
            <h3>Custom Tournament</h3>
            <p>
              Create your own tournament with custom rules, teams, and format.
              Design the perfect competition for any hockey scenario.
            </p>
            <ActionButton to="/tournaments/custom">Create Custom Tournament</ActionButton>
          </TournamentInfo>
        </TournamentCard>
      </TournamentsGrid>
      
      <SectionTitle>Historical Tournaments</SectionTitle>
      <TournamentsGrid>
        <TournamentCard>
          <TournamentImage image="https://via.placeholder.com/300x180?text=Summit+Series" />
          <TournamentInfo>
            <h3>1972 Summit Series</h3>
            <p>
              Recreate the legendary eight-game series between Canada and the Soviet Union
              that changed hockey history.
            </p>
            <Button disabled>Coming Soon</Button>
          </TournamentInfo>
        </TournamentCard>
        
        <TournamentCard>
          <TournamentImage image="https://via.placeholder.com/300x180?text=Canada+Cup" />
          <TournamentInfo>
            <h3>Canada Cup</h3>
            <p>
              Play through iconic Canada Cup tournaments from 1976 to 1991, featuring
              some of the greatest international hockey ever played.
            </p>
            <Button disabled>Coming Soon</Button>
          </TournamentInfo>
        </TournamentCard>
      </TournamentsGrid>
    </Container>
  );
};

export default Tournaments; 