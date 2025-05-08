import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import playerSilhouette from '../../assets/Player_silouette.png';

const StatsLeaderboard = ({ players, category, playerType, showTitle = true }) => {
  const navigate = useNavigate();
  // Take the first player as the initially selected player
  const [selectedPlayer, setSelectedPlayer] = useState(players.length > 0 ? players[0] : null);

  // Get the appropriate stat label based on category and player type
  const getStatLabel = () => {
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

  // Sort players based on selected category
  const sortedPlayers = [...players].sort((a, b) => {
    // For most stats, higher is better
    if (category === 'gaa') {
      // For GAA, lower is better
      return a[category] - b[category];
    }
    return b[category] - a[category];
  });

  // Get the top 7 players only
  const topPlayers = sortedPlayers.slice(0, 7);

  // Get the stat value for a player based on the category
  const getStatValue = (player) => {
    if (!player) return '-';
    
    if (category === 'timeOnIce' && player[category] !== undefined) {
      return player[category].toFixed(1);
    }
    
    return player[category] !== undefined ? player[category] : '-';
  };

  const handleViewAllClick = () => {
    navigate(`/stats/${playerType}/${category}`);
  };

  if (!selectedPlayer) {
    return <EmptyState>No player statistics available.</EmptyState>;
  }

  return (
    <LeaderboardContainer>
      {/* Player Profile Section (Left) */}
      <PlayerProfileSection>
        <PlayerInfo>
          <PlayerPhoto>
            <PlayerImage src={playerSilhouette} alt="Player" />
          </PlayerPhoto>
          <PlayerName>
            <FirstName>{selectedPlayer.first_name}</FirstName>
            <LastName>{selectedPlayer.last_name}</LastName>
          </PlayerName>
          <PlayerTeam>
            <TeamLogo>{selectedPlayer.team}</TeamLogo>
            <TeamInfo>
              <span>{selectedPlayer.team}</span>
              {selectedPlayer.position && (
                <>
                  <Separator>•</Separator>
                  <span>#{selectedPlayer.jersey}</span>
                  <Separator>•</Separator>
                  <span>{selectedPlayer.position}</span>
                </>
              )}
            </TeamInfo>
          </PlayerTeam>
        </PlayerInfo>
        <StatBox>
          <StatLabel>{getStatLabel()}</StatLabel>
          <StatValue>{getStatValue(selectedPlayer)}</StatValue>
        </StatBox>
      </PlayerProfileSection>

      {/* Leaderboard Section (Right) */}
      <LeaderboardSection>
        {showTitle && (
          <LeaderboardTitle>
            {playerType.charAt(0).toUpperCase() + playerType.slice(1)} - {getStatLabel()}
          </LeaderboardTitle>
        )}
        <LeaderboardHeader>
          <RankCol>Rank</RankCol>
          <PlayerCol>Player</PlayerCol>
          <StatCol>{getStatLabel()}</StatCol>
        </LeaderboardHeader>
        <LeaderboardList>
          {topPlayers.map((player, index) => (
            <LeaderboardRow 
              key={player.id}
              isSelected={selectedPlayer.id === player.id}
              onClick={() => setSelectedPlayer(player)}
            >
              <RankCol>{index + 1}.</RankCol>
              <PlayerCol>
                <PlayerRowInfo>
                  <TeamAbbr>{player.team}</TeamAbbr>
                  <PlayerName>{player.first_name} {player.last_name}</PlayerName>
                </PlayerRowInfo>
              </PlayerCol>
              <StatCol>{getStatValue(player)}</StatCol>
            </LeaderboardRow>
          ))}
        </LeaderboardList>
        <ViewAllLink onClick={handleViewAllClick}>All Leaders</ViewAllLink>
      </LeaderboardSection>
    </LeaderboardContainer>
  );
};

// Styled Components
const LeaderboardContainer = styled.div`
  display: flex;
  gap: 0;
  margin-bottom: 0;
  flex-wrap: wrap;
  height: 100%;
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  @media (min-width: 768px) {
    flex-wrap: nowrap;
  }
`;

const PlayerProfileSection = styled.div`
  flex: 1;
  min-width: 220px;
  background-color: #1e1e1e;
  border-radius: 0 0 0 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  padding: 16px;
  display: flex;
  flex-direction: column;
  border: 1px solid #333;
  border-top: none;
  z-index: 1;
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 15px;
`;

const PlayerPhoto = styled.div`
  margin-bottom: 10px;
`;

const PlayerImage = styled.img`
  width: 80px;
  height: 75px;
  border-radius: 50%;
  background-color: #333;
  border: 1px solid #444;
  object-fit: cover;
`;

const PlayerName = styled.div`
  margin-bottom: 7px;
`;

const FirstName = styled.div`
  font-size: 14px;
  color: #C4CED4;
  line-height: 1.1;
`;

const LastName = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 1.1;
`;

const PlayerTeam = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TeamLogo = styled.div`
  margin-bottom: 3px;
  font-weight: bold;
  color: #B30E16;
`;

const TeamInfo = styled.div`
  display: flex;
  align-items: center;
  color: #C4CED4;
  font-size: 10px;
`;

const Separator = styled.span`
  margin: 0 3px;
`;

const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
`;

const StatLabel = styled.div`
  font-size: 10px;
  font-weight: 500;
  color: #C4CED4;
  margin-bottom: 3px;
`;

const StatValue = styled.div`
  font-size: 40px;
  font-weight: bold;
  color: #FFFFFF;
  line-height: 1;
`;

const LeaderboardSection = styled.div`
  flex: 2;
  background-color: #1e1e1e;
  border-radius: 0 0 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  border: 1px solid #333;
  border-top: none;
  border-left: none;
  min-height: 350px;
`;

const LeaderboardTitle = styled.div`
  padding: 10px 16px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid #333;
  color: #FFFFFF;
`;

const LeaderboardHeader = styled.div`
  display: flex;
  padding: 8px 16px;
  border-bottom: 1px solid #333;
  color: #C4CED4;
  font-weight: 500;
  font-size: 12px;
`;

const RankCol = styled.div`
  width: 40px;
  text-align: center;
`;

const PlayerCol = styled.div`
  flex: 1;
`;

const StatCol = styled.div`
  width: 60px;
  text-align: center;
`;

const LeaderboardList = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 280px;
`;

const LeaderboardRow = styled.div`
  display: flex;
  padding: 8px 16px;
  border-bottom: 1px solid #333;
  cursor: pointer;
  background-color: ${props => props.isSelected ? '#2a2a2a' : 'transparent'};
  color: ${props => props.isSelected ? '#FFFFFF' : '#C4CED4'};
  
  &:hover {
    background-color: ${props => props.isSelected ? '#2a2a2a' : '#252525'};
  }
`;

const PlayerRowInfo = styled.div`
  display: flex;
  align-items: center;
`;

const TeamAbbr = styled.div`
  margin-right: 7px;
  font-weight: 600;
  color: #B30E16;
  min-width: 30px;
`;

const ViewAllLink = styled.div`
  text-align: right;
  padding: 9px 16px;
  color: #B30E16;
  font-weight: 500;
  cursor: pointer;
  border-top: 1px solid #333;
  margin-top: 5px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EmptyState = styled.div`
  padding: 30px;
  text-align: center;
  color: #C4CED4;
  font-size: 14px;
`;

export default StatsLeaderboard; 