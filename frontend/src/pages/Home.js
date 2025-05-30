import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HomeContainer = styled.div`
  padding: 20px 0;
`;

const WelcomeSection = styled.section`
  text-align: center;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    background: linear-gradient(45deg, #C4CED4, #fff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  p {
    font-size: 1.2rem;
    color: #aaa;
    max-width: 800px;
    margin: 0 auto;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const FeatureCard = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }
  
  h3 {
    color: #B30E16;
    margin-bottom: 15px;
  }
  
  p {
    color: #bbb;
    margin-bottom: 20px;
  }
`;

const DisabledCard = styled(FeatureCard)`
  opacity: 0.6;
  
  h3 {
    color: #666 !important;
  }
  
  p {
    color: #666 !important;
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

const ComingSoonButton = styled.div`
  display: inline-block;
  background-color: #555;
  color: #999;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: not-allowed;
  font-weight: 500;
  
  &:after {
    content: ' (Coming Soon)';
    font-size: 0.9em;
  }
`;

const SectionTitle = styled.h2`
  color: #C4CED4;
  margin: 40px 0 20px;
  font-size: 1.8rem;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
`;

const Home = () => {
  return (
    <HomeContainer>
      <WelcomeSection>
        <h1>Welcome to Hockey League Simulator</h1>
        <p>
          Create your ultimate hockey franchise, manage teams, simulate games, and
          lead your team to glory. Experience the life of a hockey GM with complete
          control over your hockey universe.
        </p>
      </WelcomeSection>
      
      <SectionTitle>Game Modes</SectionTitle>
      <FeaturesGrid>
        <FeatureCard>
          <h3>Franchise Mode</h3>
          <p>
            Take control of your favorite team or create a new franchise from scratch.
            Manage rosters, scout prospects, make trades, and guide your organization 
            to championship glory over multiple seasons.
          </p>
          <ActionButton to="/franchise">Play Franchise Mode</ActionButton>
        </FeatureCard>
        
        <FeatureCard>
          <h3>Be a Pro Mode</h3>
          <p>
            Create your own player and experience a career in professional hockey.
            Develop skills, earn ice time, sign contracts, and become a legend
            throughout your career journey from prospect to Hall of Famer.
          </p>
          <ActionButton to="/be-a-pro">Play Be a Pro</ActionButton>
        </FeatureCard>
        
        <FeatureCard>
          <h3>Quick Game</h3>
          <p>
            Jump into the action with a single match between any two teams.
            Choose your preferred teams, customize game settings, and select play style
            from real-time gameplay to fast simulation, 
            enjoy realistic game results.
          </p>
          <ActionButton to="/game">Play Quick Game</ActionButton>
        </FeatureCard>
        
        <FeatureCard>
          <h3>Season Mode</h3>
          <p>
            Play through a complete hockey season with your favorite team. Control scheduling,
            manage your team's operations, and compete for the playoffs and championship
            with a focus on the on-ice action.
          </p>
          <ActionButton to="/season">Play Season Mode</ActionButton>
        </FeatureCard>
        
        <FeatureCard>
          <h3>Tournaments</h3>
          <p>
            Compete in various tournament formats including Olympics, 8 Nations, 
            Memorial Cup, and Playoffs. Create custom tournaments or play through
            historical scenarios with your favorite teams and players.
          </p>
          <ActionButton to="/tournaments">Play Tournaments</ActionButton>
        </FeatureCard>

        <DisabledCard>
          <h3>Owner Mode</h3>
          <p>
            Take ownership of a hockey franchise and guide it to success. Control ticket prices,
            arena operations, marketing, and set goals for your GM while building a hockey dynasty.
          </p>
          <ComingSoonButton>Play Owner Mode</ComingSoonButton>
        </DisabledCard>
      </FeaturesGrid>
      
      <SectionTitle>Management Tools</SectionTitle>
      <FeaturesGrid>
        <FeatureCard>
          <h3>Player Management</h3>
          <p>
            Create, edit, and manage players with detailed attributes and ratings.
            Monitor player development and performance throughout the season.
          </p>
          <ActionButton to="/players">Manage Players</ActionButton>
        </FeatureCard>
        
        <FeatureCard>
          <h3>Team Management</h3>
          <p>
            Manage existing NHL teams or create your own franchise. Customize teams with unique logos, colors,
            and arenas. Set team strategies and create line combinations.
          </p>
          <ActionButton to="/teams">Manage Teams</ActionButton>
        </FeatureCard>
        
        <FeatureCard>
          <h3>Line Combinations</h3>
          <p>
            View and analyze team rosters and line combinations across all leagues.
            See detailed breakdowns of forward lines, defense pairs, special teams units, and more.
          </p>
          <ActionButton to="/lines">View Lines</ActionButton>
        </FeatureCard>
        
        <FeatureCard>
          <h3>Asset Movement</h3>
          <p>
            Manage player trades, free agent signings, and waiver wire transactions.
            Optimize your team's roster by strategically moving assets to build a championship contender.
          </p>
          <ActionButton to="/asset-movement">Manage Assets</ActionButton>
        </FeatureCard>
      </FeaturesGrid>
      
      <SectionTitle>Analytics</SectionTitle>
      
      <FeaturesGrid>
        <FeatureCard>
          <h3>Standings</h3>
          <p>
            Keep track of team rankings, points, and playoff positioning.
            View standings by division, conference, wild card, or league-wide.
          </p>
          <ActionButton to="/standings">View Standings</ActionButton>
        </FeatureCard>
        
        <FeatureCard>
          <h3>Statistics Tracking</h3>
          <p>
            Track player and team statistics throughout the season. 
            Analyze performance with detailed stats and visualizations.
          </p>
          <ActionButton to="/stats">View Stats</ActionButton>
        </FeatureCard>
        
        <FeatureCard>
          <h3>Awards & Trophies</h3>
          <p>
            View historical winners of major hockey awards and trophies.
            Browse by league, award type, or year to see the legends of the game.
          </p>
          <ActionButton to="/awards">View Awards</ActionButton>
        </FeatureCard>
        
        <FeatureCard>
          <h3>Draft Center</h3>
          <p>
            Discover the next generation of talent in the annual entry draft.
            Scout prospects and make strategic picks to build for the future.
          </p>
          <ActionButton to="/draft">Draft Center</ActionButton>
        </FeatureCard>
      </FeaturesGrid>
    </HomeContainer>
  );
};

export default Home;
