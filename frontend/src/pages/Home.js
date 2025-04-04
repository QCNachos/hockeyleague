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
          <h3>Tournaments</h3>
          <p>
            Compete in various tournament formats including Olympics, 8 Nations, 
            Memorial Cup, and Playoffs. Create custom tournaments or play through
            historical scenarios with your favorite teams and players.
          </p>
          <ActionButton to="/tournaments">Play Tournaments</ActionButton>
        </FeatureCard>
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
          <h3>Draft Center</h3>
          <p>
            Discover the next generation of talent in the annual entry draft.
            Scout prospects and make strategic picks to build for the future.
          </p>
          <ActionButton to="/draft">Enter Draft</ActionButton>
        </FeatureCard>
      </FeaturesGrid>
    </HomeContainer>
  );
};

export default Home;
