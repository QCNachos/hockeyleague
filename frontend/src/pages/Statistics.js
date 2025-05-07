import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import StatsLeaderboard from '../components/stats/StatsLeaderboard';

const Statistics = ({ isEmbedded = false }) => {
  const [timeFrame, setTimeFrame] = useState('current'); // 'current' or 'allTime'
  const [league, setLeague] = useState('NHL'); // Default to NHL
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch players data
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        // In a real app, you would pass parameters to filter by league, season, etc.
        const response = await axios.get('/api/players');
        setPlayers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching player data:', error);
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [timeFrame, league]); // Re-fetch when timeFrame or league changes

  // Mock player statistics data (remove this in production)
  const mockSkaterStats = [
    { id: 1, first_name: 'Nikita', last_name: 'Kucherov', team: 'TBL', jersey: 86, position: 'R', points: 109 },
    { id: 2, first_name: 'Nathan', last_name: 'MacKinnon', team: 'COL', jersey: 29, position: 'C', points: 109 },
    { id: 3, first_name: 'Leon', last_name: 'Draisaitl', team: 'EDM', jersey: 29, position: 'C', points: 104 },
    { id: 4, first_name: 'Jack', last_name: 'Eichel', team: 'VGK', jersey: 9, position: 'C', points: 93 },
    { id: 5, first_name: 'Mitch', last_name: 'Marner', team: 'TOR', jersey: 16, position: 'R', points: 91 },
    { id: 6, first_name: 'Connor', last_name: 'McDavid', team: 'EDM', jersey: 97, position: 'C', points: 90 },
    { id: 7, first_name: 'Kyle', last_name: 'Connor', team: 'WPG', jersey: 81, position: 'L', points: 90 },
    { id: 8, first_name: 'David', last_name: 'Pastrnak', team: 'BOS', jersey: 88, position: 'R', points: 86 },
    { id: 9, first_name: 'Jesper', last_name: 'Bratt', team: 'NJD', jersey: 63, position: 'R', points: 86 },
    { id: 10, first_name: 'Cale', last_name: 'Makar', team: 'COL', jersey: 8, position: 'D', points: 84 },
  ];

  const mockGoalieStats = [
    { id: 101, first_name: 'Connor', last_name: 'Hellebuyck', team: 'WPG', jersey: 37, position: 'G', gaa: 2.01 },
    { id: 102, first_name: 'Darcy', last_name: 'Kuemper', team: 'WAS', jersey: 35, position: 'G', gaa: 2.10 },
    { id: 103, first_name: 'Andrei', last_name: 'Vasilevskiy', team: 'TBL', jersey: 88, position: 'G', gaa: 2.18 },
    { id: 104, first_name: 'Anthony', last_name: 'Stolarz', team: 'FLA', jersey: 41, position: 'G', gaa: 2.35 },
    { id: 105, first_name: 'Logan', last_name: 'Thompson', team: 'VGK', jersey: 36, position: 'G', gaa: 2.43 },
    { id: 106, first_name: 'Sergei', last_name: 'Bobrovsky', team: 'FLA', jersey: 72, position: 'G', gaa: 2.44 },
    { id: 107, first_name: 'Mackenzie', last_name: 'Blackwood', team: 'SJS', jersey: 29, position: 'G', gaa: 2.45 },
    { id: 108, first_name: 'Adin', last_name: 'Hill', team: 'VGK', jersey: 33, position: 'G', gaa: 2.46 },
    { id: 109, first_name: 'Jake', last_name: 'Oettinger', team: 'DAL', jersey: 29, position: 'G', gaa: 2.47 },
    { id: 110, first_name: 'Jacob', last_name: 'Markstrom', team: 'CGY', jersey: 25, position: 'G', gaa: 2.48 },
  ];

  const mockDefensemenStats = [
    { id: 10, first_name: 'Cale', last_name: 'Makar', team: 'COL', jersey: 8, position: 'D', points: 84 },
    { id: 11, first_name: 'Zach', last_name: 'Werenski', team: 'CBJ', jersey: 8, position: 'D', points: 72 },
    { id: 12, first_name: 'Quinn', last_name: 'Hughes', team: 'VAN', jersey: 43, position: 'D', points: 70 },
    { id: 13, first_name: 'Victor', last_name: 'Hedman', team: 'TBL', jersey: 77, position: 'D', points: 59 },
    { id: 14, first_name: 'Lane', last_name: 'Hutson', team: 'MTL', jersey: 48, position: 'D', points: 59 },
    { id: 15, first_name: 'Evan', last_name: 'Bouchard', team: 'EDM', jersey: 2, position: 'D', points: 58 },
    { id: 16, first_name: 'Rasmus', last_name: 'Dahlin', team: 'BUF', jersey: 26, position: 'D', points: 57 },
    { id: 17, first_name: 'Adam', last_name: 'Fox', team: 'NYR', jersey: 23, position: 'D', points: 56 },
    { id: 18, first_name: 'Josh', last_name: 'Morrissey', team: 'WPG', jersey: 44, position: 'D', points: 56 },
    { id: 19, first_name: 'Shea', last_name: 'Theodore', team: 'VGK', jersey: 27, position: 'D', points: 51 },
  ];

  const mockRookieStats = [
    { id: 14, first_name: 'Lane', last_name: 'Hutson', team: 'MTL', jersey: 48, position: 'D', points: 59 },
    { id: 21, first_name: 'Matvei', last_name: 'Michkov', team: 'PHI', jersey: 39, position: 'R', points: 58 },
    { id: 22, first_name: 'Macklin', last_name: 'Celebrini', team: 'SJS', jersey: 71, position: 'C', points: 53 },
    { id: 23, first_name: 'Cutter', last_name: 'Gauthier', team: 'ANA', jersey: 19, position: 'L', points: 38 },
    { id: 24, first_name: 'Will', last_name: 'Smith', team: 'SJS', jersey: 20, position: 'C', points: 37 },
    { id: 25, first_name: 'Logan', last_name: 'Stankoven', team: 'DAL', jersey: 11, position: 'C', points: 34 },
    { id: 26, first_name: 'Zack', last_name: 'Bolduc', team: 'STL', jersey: 76, position: 'C', points: 31 },
    { id: 27, first_name: 'Maxim', last_name: 'Tsyplakov', team: 'CBJ', jersey: 16, position: 'L', points: 31 },
    { id: 28, first_name: 'Marco', last_name: 'Kasper', team: 'DET', jersey: 92, position: 'C', points: 30 },
    { id: 29, first_name: 'Jackson', last_name: 'Blake', team: 'CAR', jersey: 94, position: 'R', points: 28 },
  ];

  // Extra categories for additional stats
  const mockPlusMinusStats = [
    { id: 31, first_name: 'Quinn', last_name: 'Hughes', team: 'VAN', jersey: 43, position: 'D', plusMinus: 32 },
    { id: 32, first_name: 'Jake', last_name: 'McCabe', team: 'TOR', jersey: 22, position: 'D', plusMinus: 29 },
    { id: 33, first_name: 'Gabriel', last_name: 'Landeskog', team: 'COL', jersey: 92, position: 'L', plusMinus: 27 },
    { id: 34, first_name: 'Mikko', last_name: 'Rantanen', team: 'COL', jersey: 96, position: 'R', plusMinus: 25 },
    { id: 35, first_name: 'Dylan', last_name: 'Larkin', team: 'DET', jersey: 71, position: 'C', plusMinus: 24 },
    { id: 36, first_name: 'Elias', last_name: 'Pettersson', team: 'VAN', jersey: 40, position: 'C', plusMinus: 22 },
    { id: 37, first_name: 'Brady', last_name: 'Tkachuk', team: 'OTT', jersey: 7, position: 'L', plusMinus: 21 },
    { id: 38, first_name: 'Jack', last_name: 'Hughes', team: 'NJD', jersey: 86, position: 'C', plusMinus: 19 },
    { id: 39, first_name: 'Sebastian', last_name: 'Aho', team: 'CAR', jersey: 20, position: 'C', plusMinus: 19 },
    { id: 40, first_name: 'Aleksander', last_name: 'Barkov', team: 'FLA', jersey: 16, position: 'C', plusMinus: 18 },
  ];

  const mockTimeOnIceStats = [
    { id: 41, first_name: 'Drew', last_name: 'Doughty', team: 'LAK', jersey: 8, position: 'D', timeOnIce: 26.1 },
    { id: 42, first_name: 'Charlie', last_name: 'McAvoy', team: 'BOS', jersey: 73, position: 'D', timeOnIce: 25.8 },
    { id: 43, first_name: 'Roman', last_name: 'Josi', team: 'NSH', jersey: 59, position: 'D', timeOnIce: 25.4 },
    { id: 44, first_name: 'Cale', last_name: 'Makar', team: 'COL', jersey: 8, position: 'D', timeOnIce: 25.1 },
    { id: 45, first_name: 'Victor', last_name: 'Hedman', team: 'TBL', jersey: 77, position: 'D', timeOnIce: 24.9 },
    { id: 46, first_name: 'Kris', last_name: 'Letang', team: 'PIT', jersey: 58, position: 'D', timeOnIce: 24.8 },
    { id: 47, first_name: 'Miro', last_name: 'Heiskanen', team: 'DAL', jersey: 4, position: 'D', timeOnIce: 24.7 },
    { id: 48, first_name: 'Quinn', last_name: 'Hughes', team: 'VAN', jersey: 43, position: 'D', timeOnIce: 24.5 },
    { id: 49, first_name: 'Aaron', last_name: 'Ekblad', team: 'FLA', jersey: 5, position: 'D', timeOnIce: 24.2 },
    { id: 50, first_name: 'Devon', last_name: 'Toews', team: 'COL', jersey: 7, position: 'D', timeOnIce: 24.0 },
  ];

  return (
    <StatsContainer isEmbedded={isEmbedded}>
      <StatsHeader>
        <FilterSection>
          <SelectWrapper>
            <label>Season:</label>
            <select 
              value={timeFrame} 
              onChange={(e) => setTimeFrame(e.target.value)}
            >
              <option value="current">2023-24</option>
              <option value="allTime">All-Time</option>
            </select>
          </SelectWrapper>
          
          <SelectWrapper>
            <label>League:</label>
            <select 
              value={league} 
              onChange={(e) => setLeague(e.target.value)}
            >
              <option value="NHL">NHL</option>
              <option value="AHL">AHL</option>
              <option value="CHL">CHL</option>
            </select>
          </SelectWrapper>
        </FilterSection>
      </StatsHeader>

      {loading ? (
        <LoadingMessage>Loading statistics...</LoadingMessage>
      ) : (
        <>
          <StatsCategoryGridContainer>
            {/* Top Row */}
            <GridItem>
              <CategoryTitle>
                <CategoryName>Skaters</CategoryName>
              </CategoryTitle>
              <StatsLeaderboard 
                players={mockSkaterStats} 
                category="points"
                playerType="skaters"
                showTitle={false}
              />
            </GridItem>
            <GridItem>
              <CategoryTitle>
                <CategoryName>Goalies</CategoryName>
              </CategoryTitle>
              <StatsLeaderboard 
                players={mockGoalieStats} 
                category="gaa"
                playerType="goalies"
                showTitle={false}
              />
            </GridItem>

            {/* Bottom Row */}
            <GridItem>
              <CategoryTitle>
                <CategoryName>Defensemen</CategoryName>
              </CategoryTitle>
              <StatsLeaderboard 
                players={mockDefensemenStats} 
                category="points"
                playerType="defensemen"
                showTitle={false}
              />
            </GridItem>
            <GridItem>
              <CategoryTitle>
                <CategoryName>Rookies</CategoryName>
              </CategoryTitle>
              <StatsLeaderboard 
                players={mockRookieStats} 
                category="points"
                playerType="rookies"
                showTitle={false}
              />
            </GridItem>

            {/* Extra Row (for +/- and TOI) */}
            <GridItem>
              <CategoryTitle>
                <CategoryName>+/-</CategoryName>
              </CategoryTitle>
              <StatsLeaderboard 
                players={mockPlusMinusStats} 
                category="plusMinus"
                playerType="skaters"
                showTitle={false}
              />
            </GridItem>
            <GridItem>
              <CategoryTitle>
                <CategoryName>Time on Ice</CategoryName>
              </CategoryTitle>
              <StatsLeaderboard 
                players={mockTimeOnIceStats} 
                category="timeOnIce"
                playerType="skaters"
                showTitle={false}
              />
            </GridItem>
          </StatsCategoryGridContainer>
        </>
      )}
    </StatsContainer>
  );
};

// Styled Components
const StatsContainer = styled.div`
  max-width: ${props => props.isEmbedded ? '100%' : '1200px'};
  margin: 0 auto;
  padding: ${props => props.isEmbedded ? '0' : '20px'};
  color: #C4CED4;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const StatsHeader = styled.div`
  margin-bottom: 20px;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
`;

const SelectWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  label {
    font-weight: 500;
  }

  select {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #ddd;
    background-color: white;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
`;

const StatsCategoryGridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const GridItem = styled.div`
  margin-bottom: 20px;
`;

const CategoryTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CategoryName = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
`;

export default Statistics;
