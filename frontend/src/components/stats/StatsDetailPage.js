import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StatsDetailPage = () => {
  const { playerType, category } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(20);

  // Fetch players data
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        // In a real app, you would pass parameters to filter by league, season, etc.
        const response = await axios.get('/api/players');
        setPlayers(response.data || getMockData());
        setLoading(false);
      } catch (error) {
        console.error('Error fetching player data:', error);
        // Use mock data if API fails
        setPlayers(getMockData());
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [playerType, category]);

  // Helper to get mock data
  const getMockData = () => {
    switch (playerType) {
      case 'skaters':
        return mockSkaterStats;
      case 'goalies':
        return mockGoalieStats;
      case 'defensemen':
        return mockDefensemenStats;
      case 'rookies':
        return mockRookieStats;
      default:
        return mockSkaterStats;
    }
  };

  // Mock data for development
  const mockSkaterStats = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    first_name: `FirstName${index}`,
    last_name: `LastName${index}`,
    team: ['TBL', 'COL', 'EDM', 'VGK', 'TOR'][index % 5],
    jersey: Math.floor(Math.random() * 99) + 1,
    position: ['C', 'L', 'R', 'D'][index % 4],
    points: 100 - index,
    goals: Math.floor(Math.random() * 50),
    assists: Math.floor(Math.random() * 70),
    plusMinus: Math.floor(Math.random() * 40) - 20,
    timeOnIce: (Math.random() * 10 + 15).toFixed(1)
  }));

  const mockGoalieStats = Array.from({ length: 30 }, (_, index) => ({
    id: 1000 + index,
    first_name: `Goalie${index}`,
    last_name: `LastName${index}`,
    team: ['TBL', 'COL', 'EDM', 'VGK', 'TOR'][index % 5],
    jersey: Math.floor(Math.random() * 99) + 1,
    position: 'G',
    gaa: (2 + Math.random()).toFixed(2),
    savePercentage: (0.900 + Math.random() * 0.099).toFixed(3),
    shutouts: Math.floor(Math.random() * 10),
    wins: Math.floor(Math.random() * 40)
  }));

  const mockDefensemenStats = Array.from({ length: 40 }, (_, index) => ({
    id: 2000 + index,
    first_name: `Defense${index}`,
    last_name: `LastName${index}`,
    team: ['TBL', 'COL', 'EDM', 'VGK', 'TOR'][index % 5],
    jersey: Math.floor(Math.random() * 99) + 1,
    position: 'D',
    points: 80 - index,
    goals: Math.floor(Math.random() * 20),
    assists: Math.floor(Math.random() * 60),
    plusMinus: Math.floor(Math.random() * 40) - 10,
    blocks: Math.floor(Math.random() * 200)
  }));

  const mockRookieStats = Array.from({ length: 35 }, (_, index) => ({
    id: 3000 + index,
    first_name: `Rookie${index}`,
    last_name: `LastName${index}`,
    team: ['TBL', 'COL', 'EDM', 'VGK', 'TOR'][index % 5],
    jersey: Math.floor(Math.random() * 99) + 1,
    position: ['C', 'L', 'R', 'D'][index % 4],
    points: 70 - index,
    goals: Math.floor(Math.random() * 30),
    assists: Math.floor(Math.random() * 40),
    plusMinus: Math.floor(Math.random() * 30) - 15,
    games: Math.floor(Math.random() * 82)
  }));

  // Get label for category
  const getCategoryLabel = () => {
    if (playerType === 'goalies') {
      switch (category) {
        case 'gaa': return 'GAA';
        case 'savePercentage': return 'Save %';
        case 'shutouts': return 'Shutouts';
        case 'wins': return 'Wins';
        default: return 'GAA';
      }
    } else {
      switch (category) {
        case 'points': return 'Points';
        case 'goals': return 'Goals';
        case 'assists': return 'Assists';
        case 'plusMinus': return '+/-';
        case 'blocks': return 'Blocks';
        case 'games': return 'GP';
        case 'timeOnIce': return 'TOI';
        default: return 'Points';
      }
    }
  };

  // Get player type label
  const getPlayerTypeLabel = () => {
    switch (playerType) {
      case 'skaters': return 'SKATERS';
      case 'goalies': return 'GOALIES';
      case 'defensemen': return 'DEFENSEMEN';
      case 'rookies': return 'ROOKIES';
      default: return 'PLAYERS';
    }
  };

  // Sort players
  const sortedPlayers = [...players].sort((a, b) => {
    if (category === 'gaa') {
      return sortOrder === 'asc' ? b[category] - a[category] : a[category] - b[category];
    }
    return sortOrder === 'asc' ? a[category] - b[category] : b[category] - a[category];
  });

  // Pagination logic
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = sortedPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer);
  const totalPages = Math.ceil(sortedPlayers.length / playersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle sort toggle
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  // Handle back click
  const handleBackClick = () => {
    navigate('/stats');
  };

  return (
    <DetailPageContainer>
      <DetailPageHeader>
        <BackButton onClick={handleBackClick}>← Back to Stats Overview</BackButton>
        <PageTitle>
          {getPlayerTypeLabel()} - {getCategoryLabel()} Leaders
        </PageTitle>
        <SortButton onClick={toggleSortOrder}>
          Sort {sortOrder === 'asc' ? '↑' : '↓'}
        </SortButton>
      </DetailPageHeader>

      {loading ? (
        <LoadingMessage>Loading statistics...</LoadingMessage>
      ) : (
        <>
          <StatsTable>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Team</th>
                <th>Pos</th>
                <th className="numeric">{getCategoryLabel()}</th>
                {playerType !== 'goalies' && <th className="numeric">GP</th>}
                {playerType === 'skaters' && <th className="numeric">G</th>}
                {playerType === 'skaters' && <th className="numeric">A</th>}
                {playerType === 'skaters' && <th className="numeric">+/-</th>}
              </tr>
            </thead>
            <tbody>
              {currentPlayers.map((player, index) => (
                <tr key={player.id}>
                  <td>{indexOfFirstPlayer + index + 1}</td>
                  <td>
                    <PlayerName>
                      {player.first_name} {player.last_name}
                    </PlayerName>
                  </td>
                  <td>
                    <TeamName>{player.team}</TeamName>
                  </td>
                  <td>{player.position}</td>
                  <td className="numeric">{player[category]}</td>
                  {playerType !== 'goalies' && <td className="numeric">{player.games || '82'}</td>}
                  {playerType === 'skaters' && <td className="numeric">{player.goals}</td>}
                  {playerType === 'skaters' && <td className="numeric">{player.assists}</td>}
                  {playerType === 'skaters' && <td className="numeric">{player.plusMinus}</td>}
                </tr>
              ))}
            </tbody>
          </StatsTable>

          <PaginationContainer>
            <PaginationButton 
              disabled={currentPage === 1} 
              onClick={() => paginate(currentPage - 1)}
            >
              Previous
            </PaginationButton>
            <PageInfo>
              Page {currentPage} of {totalPages}
            </PageInfo>
            <PaginationButton 
              disabled={currentPage === totalPages} 
              onClick={() => paginate(currentPage + 1)}
            >
              Next
            </PaginationButton>
          </PaginationContainer>
        </>
      )}
    </DetailPageContainer>
  );
};

// Styled Components
const DetailPageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 18px;
  color: #C4CED4;
`;

const DetailPageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 27px;
  background-color: #2a2a2a;
  border-radius: 6px;
  padding: 13px 18px;
  border-left: 3px solid #B30E16;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #B30E16;
  font-size: 15px;
  cursor: pointer;
  padding: 4px 9px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const PageTitle = styled.h1`
  font-size: 22px;
  margin: 0;
  color: #FFFFFF;
  display: flex;
  align-items: center;
`;

const SortButton = styled.button`
  background-color: #1e1e1e;
  border: 1px solid #333;
  color: #FFFFFF;
  padding: 7px 13px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background-color: #2a2a2a;
  }
`;

const StatsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 27px;
  background-color: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  
  th, td {
    padding: 11px 13px;
    text-align: left;
    border-bottom: 1px solid #333;
  }
  
  th {
    background-color: #2a2a2a;
    color: #FFFFFF;
    font-weight: 600;
    font-size: 14px;
    
    &.numeric {
      text-align: right;
    }
  }
  
  td {
    color: #C4CED4;
    font-size: 14px;
    
    &.numeric {
      text-align: right;
    }
  }
  
  tbody tr:hover {
    background-color: #252525;
  }
  
  thead tr {
    border-bottom: 2px solid #333;
  }
  
  tbody tr:last-child td {
    border-bottom: none;
  }
`;

const PlayerName = styled.span`
  font-weight: 500;
  color: #FFFFFF;
`;

const TeamName = styled.span`
  font-weight: 600;
  color: #B30E16;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 18px;
  margin-bottom: 27px;
`;

const PaginationButton = styled.button`
  background-color: #1e1e1e;
  color: #FFFFFF;
  border: 1px solid #333;
  padding: 7px 14px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover:not(:disabled) {
    background-color: #2a2a2a;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: #C4CED4;
  font-size: 14px;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 36px;
  font-size: 16px;
  color: #C4CED4;
`;

export default StatsDetailPage; 