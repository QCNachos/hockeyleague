import React, { useState } from 'react';
import styled from 'styled-components';

const StatsLeaderboard = ({ players, category, playerType, showTitle = true }) => {
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

  // Get the stat value for a player based on the category
  const getStatValue = (player) => {
    if (!player) return '-';
    
    if (category === 'timeOnIce' && player[category] !== undefined) {
      return player[category].toFixed(1);
    }
    
    return player[category] !== undefined ? player[category] : '-';
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
            {/* Empty circle as placeholder for player photo */}
            <EmptyCircle />
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
          {sortedPlayers.map((player, index) => (
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
        <ViewAllLink>All Leaders</ViewAllLink>
      </LeaderboardSection>
    </LeaderboardContainer>
  );
};

// Styled Components
const LeaderboardContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  flex-wrap: wrap;
  height: 100%;

  @media (min-width: 768px) {
    flex-wrap: nowrap;
  }
`;

const PlayerProfileSection = styled.div`
  flex: 1;
  min-width: 220px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
`;

const PlayerPhoto = styled.div`
  margin-bottom: 15px;
`;

const EmptyCircle = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
`;

const PlayerName = styled.div`
  margin-bottom: 10px;
`;

const FirstName = styled.div`
  font-size: 16px;
  color: #333;
`;

const LastName = styled.div`
  font-size: 22px;
  font-weight: bold;
  color: #111;
`;

const PlayerTeam = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TeamLogo = styled.div`
  margin-bottom: 5px;
  font-weight: bold;
  color: #666;
`;

const TeamInfo = styled.div`
  display: flex;
  align-items: center;
  color: #666;
  font-size: 14px;
`;

const Separator = styled.span`
  margin: 0 5px;
`;

const StatBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: auto;
`;

const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 5px;
`;

const StatValue = styled.div`
  font-size: 48px;
  font-weight: bold;
  color: #111;
`;

const LeaderboardSection = styled.div`
  flex: 2;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const LeaderboardTitle = styled.div`
  padding: 15px 20px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #eee;
  color: #333;
`;

const LeaderboardHeader = styled.div`
  display: flex;
  padding: 12px 20px;
  border-bottom: 1px solid #eee;
  color: #666;
  font-weight: 500;
  font-size: 14px;
`;

const RankCol = styled.div`
  width: 50px;
  text-align: center;
`;

const PlayerCol = styled.div`
  flex: 1;
`;

const StatCol = styled.div`
  width: 80px;
  text-align: center;
`;

const LeaderboardList = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 300px;
`;

const LeaderboardRow = styled.div`
  display: flex;
  padding: 10px 20px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  background-color: ${props => props.isSelected ? '#f0f8ff' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.isSelected ? '#f0f8ff' : '#f9f9f9'};
  }
`;

const PlayerRowInfo = styled.div`
  display: flex;
  align-items: center;
`;

const TeamAbbr = styled.div`
  margin-right: 10px;
  font-weight: 600;
  color: #444;
  min-width: 40px;
`;

const ViewAllLink = styled.div`
  text-align: right;
  padding: 10px 20px;
  color: #1e88e5;
  font-weight: 500;
  cursor: pointer;
  border-top: 1px solid #eee;
  
  &:hover {
    text-decoration: underline;
  }
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #666;
  font-size: 16px;
`;

export default StatsLeaderboard; 