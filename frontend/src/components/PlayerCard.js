import React from 'react';
import styled from 'styled-components';

// Styled components
const PlayerModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PlayerCardContent = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

const PlayerCardClose = styled.button`
  position: absolute;
  right: 15px;
  top: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: #B30E16;
  }
`;

const PlayerCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background-color: #1a3042;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #333;
`;

const PlayerInfo = styled.div`
  flex: 1;
  color: #fff;
  display: flex;
  flex-direction: column;
`;

const PlayerHeaderImage = styled.div`
  width: 160px;
  height: 200px;
  background-color: #B30E16;
  border-radius: 4px;
  margin-left: 20px;
  background-image: ${props => props.src ? `url(${props.src})` : 'none'};
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
`;

const PlayerName = styled.h1`
  margin: 0 0 5px 0;
  font-size: 1.8rem;
  color: #fff;
`;

const PlayerDetailLine = styled.div`
  margin-bottom: 4px;
  color: #ccc;
`;

const DraftInfo = styled.div`
  margin-top: 10px;
  color: #ccc;
  
  span.team {
    color: #ff4b55;
    font-weight: bold;
  }
  
  span.draft-pick {
    color: #ff4b55;
    font-weight: bold;
  }
`;

const PlayerCardBody = styled.div`
  padding: 0;
`;

const StatsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  margin-bottom: 10px;
  font-size: 14px;
`;

const StatsTableHeader = styled.th`
  background-color: ${props => props.primary ? '#2a506b' : '#1a3042'};
  padding: 8px;
  font-weight: bold;
  color: white;
  text-align: ${props => props.textAlign || 'center'};
  border-bottom: 1px solid #333;
`;

const StatsTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #2a2a2a;
  }
  
  &:nth-child(odd) {
    background-color: #1e1e1e;
  }
  
  color: ${props => {
    if (props.highlighted) return '#e6b5bc'; // AHL - pink
    if (props.green) return '#a5d6a7'; // SweHL - green
    if (props.nhled) return '#ffcc80'; // NHL - gold/orange
    return '#fff'; // Default - white
  }};
  
  // Make NHL Totals row bold
  font-weight: ${props => props.nhled && props.total ? 'bold' : 'normal'};
`;

const StatsTableCell = styled.td`
  padding: 8px;
  border-bottom: 1px solid #333;
  text-align: ${props => props.textAlign || 'center'};
`;

const SectionTitle = styled.h2`
  background-color: #1a3042;
  color: white;
  padding: 8px 15px;
  margin: 0;
  font-size: 1.2rem;
  border-bottom: 1px solid #333;
  font-weight: normal;
`;

const AttributeSection = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const AttributeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #333;
`;

const AttributeName = styled.span`
  color: #aaa;
`;

const AttributeValue = styled.span`
  font-weight: bold;
  color: ${props => {
    if (props.value >= 90) return '#4CAF50';
    if (props.value >= 80) return '#8BC34A';
    if (props.value >= 70) return '#CDDC39';
    if (props.value >= 60) return '#FFC107';
    return '#FF5722';
  }};
`;

const TournamentsSection = styled.div`
  margin-top: 20px;
`;

const AwardsSection = styled.div`
  margin-top: 20px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #333;
`;

const Tab = styled.div`
  padding: 10px 20px;
  background-color: ${props => props.active ? '#1a3042' : '#2a2a2a'};
  color: white;
  cursor: pointer;
  border-right: 1px solid #333;
  
  &:hover {
    background-color: ${props => props.active ? '#1a3042' : '#3a3a3a'};
  }
`;

/**
 * PlayerCard - A reusable component for displaying player details
 * 
 * @param {Object} player - The player data
 * @param {Function} onClose - Function to call when the close button is clicked
 * @param {boolean} isVisible - Whether the modal is visible
 */
const PlayerCard = ({ player, onClose, isVisible }) => {
  const [activeTab, setActiveTab] = React.useState('stats');

  if (!isVisible || !player) return null;
  
  // Format calculations
  const formatSalary = (salary) => {
    if (salary === null || salary === undefined) return 'N/A';
    const numericSalary = Number(salary);
    if (isNaN(numericSalary)) return 'Invalid';
    return `$${(numericSalary / 1000000).toFixed(1)}M`;
  };
  
  // Format player attributes
  const getPlayerAttributes = () => {
    // Use player.attributes if available or generate mock ones
    return player.attributes || {
      skating: Math.floor(Math.random() * 20) + 70,
      shooting: Math.floor(Math.random() * 20) + 70,
      hands: Math.floor(Math.random() * 20) + 70,
      checking: Math.floor(Math.random() * 20) + 70,
      defense: Math.floor(Math.random() * 20) + 70,
      physical: Math.floor(Math.random() * 20) + 70
    };
  };
  
  // Generate season stats if not available
  const getSeasonStats = () => {
    // Use player stats if available, otherwise create mock data
    return player.seasonStats || [
      { 
        season: '2023-24', 
        team: player.team?.abbreviation || 'DET', 
        league: 'NHL',
        gp: 82, 
        goals: Math.floor(Math.random() * 20) + 5,
        assists: Math.floor(Math.random() * 30) + 10,
        points: function() { return this.goals + this.assists; },
        plusMinus: Math.floor(Math.random() * 30) - 15,
        pim: Math.floor(Math.random() * 60) + 10
      },
      { 
        season: '2022-23', 
        team: player.team?.abbreviation || 'DET', 
        league: 'NHL',
        gp: 75, 
        goals: Math.floor(Math.random() * 20) + 5,
        assists: Math.floor(Math.random() * 30) + 10,
        points: function() { return this.goals + this.assists; },
        plusMinus: Math.floor(Math.random() * 30) - 15,
        pim: Math.floor(Math.random() * 60) + 10
      }
    ];
  };
  
  // Get player tournaments
  const getTournaments = () => {
    return player.tournaments || [
      { 
        year: 2020, 
        tournament: 'World Junior U-20 Championships', 
        team: 'Germany U-20',
        gp: 7,
        goals: 0,
        assists: 6,
        points: 6,
        pim: 6,
        plusMinus: 0
      }
    ];
  };
  
  // Get player awards
  const getAwards = () => {
    return player.awards || [
      { year: '2021-22', league: 'NHL', award: 'Calder Memorial Trophy' }
    ];
  };
  
  // Data
  const playerAttributes = getPlayerAttributes();
  const seasonStats = getSeasonStats();
  const tournaments = getTournaments();
  const awards = getAwards();
  
  // Helper to get jersey number
  const getJerseyNumber = () => {
    return player.number || player.jersey_number || '#';
  };
  
  // Helper to get player name
  const getPlayerName = () => {
    if (player.first_name && player.last_name) {
      return `${player.first_name} ${player.last_name}`;
    }
    return player.name || 'Unknown Player';
  };
  
  // Helper function to check if value exists
  const ifExists = (value, fallback = 'N/A') => {
    return value !== undefined && value !== null ? value : fallback;
  };

  return (
    <PlayerModal onClick={onClose}>
      <PlayerCardContent onClick={(e) => e.stopPropagation()}>
        <PlayerCardClose onClick={onClose}>×</PlayerCardClose>
        
        <PlayerCardHeader>
          <PlayerInfo>
            <PlayerName>{getPlayerName()}</PlayerName>
            <PlayerDetailLine>
              {ifExists(player.position || player.position_primary)} -- shoots {ifExists(player.shoots || player.handedness, 'R')}
            </PlayerDetailLine>
            <PlayerDetailLine>
              Born {ifExists(player.birth_date || 'Apr 6 2001')} -- {ifExists(player.birth_city || 'Zell')}, {ifExists(player.birth_country || 'Germany')}
            </PlayerDetailLine>
            <PlayerDetailLine>
              [{ifExists(player.age || 24)} yrs. ago]
            </PlayerDetailLine>
            <PlayerDetailLine>
              Height {ifExists(player.height || '6.03')} -- Weight {ifExists(player.weight || 205)} [{ifExists(player.height_cm || 191)} cm/{ifExists(player.weight_kg || 93)} kg]
            </PlayerDetailLine>
            
            <DraftInfo>
              Drafted by <span className="team">{ifExists(player.draft_team || 'Detroit Red Wings')}</span>
              <br />- round 1 <span className="draft-pick">#{ifExists(player.draft_overall || 6)}</span> overall {ifExists(player.draft_year || 2019)} NHL Entry Draft
            </DraftInfo>
          </PlayerInfo>
          
          <PlayerHeaderImage 
            src={player.image_url || ''}
            style={{
              backgroundImage: player.image_url ? `url(${player.image_url})` : 'none',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {!player.image_url && getJerseyNumber()}
          </PlayerHeaderImage>
        </PlayerCardHeader>
        
        <TabsContainer>
          <Tab 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')}
          >
            Statistics
          </Tab>
          <Tab 
            active={activeTab === 'attributes'} 
            onClick={() => setActiveTab('attributes')}
          >
            Attributes
          </Tab>
        </TabsContainer>
        
        <PlayerCardBody>
          {activeTab === 'stats' && (
            <>
              {/* Regular Season / Playoffs Stats */}
              <div style={{ display: 'flex', backgroundColor: '#1a3042' }}>
                <StatsTableHeader primary style={{ flex: 1, textAlign: 'center' }}>
                  Regular Season
                </StatsTableHeader>
                <StatsTableHeader primary style={{ flex: 1, textAlign: 'center' }}>
                  Playoffs
                </StatsTableHeader>
              </div>
              
              <StatsTable>
                <thead>
                  <tr>
                    <StatsTableHeader textAlign="left">Season</StatsTableHeader>
                    <StatsTableHeader textAlign="left">Team</StatsTableHeader>
                    <StatsTableHeader>Lge</StatsTableHeader>
                    <StatsTableHeader>GP</StatsTableHeader>
                    <StatsTableHeader>G</StatsTableHeader>
                    <StatsTableHeader>A</StatsTableHeader>
                    <StatsTableHeader>Pts</StatsTableHeader>
                    <StatsTableHeader>PIM</StatsTableHeader>
                    <StatsTableHeader>+/-</StatsTableHeader>
                    <StatsTableHeader>GP</StatsTableHeader>
                    <StatsTableHeader>G</StatsTableHeader>
                    <StatsTableHeader>A</StatsTableHeader>
                    <StatsTableHeader>Pts</StatsTableHeader>
                    <StatsTableHeader>PIM</StatsTableHeader>
                  </tr>
                </thead>
                <tbody>
                  {seasonStats.map((stat, index) => (
                    <StatsTableRow 
                      key={index}
                      highlighted={stat.league === 'AHL'}
                      green={stat.league === 'SweHL'}
                      nhled={stat.league === 'NHL'}
                    >
                      <StatsTableCell textAlign="left">{stat.season}</StatsTableCell>
                      <StatsTableCell textAlign="left">{stat.team}</StatsTableCell>
                      <StatsTableCell>{stat.league}</StatsTableCell>
                      <StatsTableCell>{stat.gp}</StatsTableCell>
                      <StatsTableCell>{stat.goals}</StatsTableCell>
                      <StatsTableCell>{stat.assists}</StatsTableCell>
                      <StatsTableCell>{typeof stat.points === 'function' ? stat.points() : stat.points}</StatsTableCell>
                      <StatsTableCell>{stat.pim}</StatsTableCell>
                      <StatsTableCell>{stat.plusMinus}</StatsTableCell>
                      <StatsTableCell>{stat.playoff_gp || '--'}</StatsTableCell>
                      <StatsTableCell>{stat.playoff_goals || '--'}</StatsTableCell>
                      <StatsTableCell>{stat.playoff_assists || '--'}</StatsTableCell>
                      <StatsTableCell>{stat.playoff_points || '--'}</StatsTableCell>
                      <StatsTableCell>{stat.playoff_pim || '--'}</StatsTableCell>
                    </StatsTableRow>
                  ))}
                  
                  {/* NHL Totals Row */}
                  <StatsTableRow nhled total>
                    <StatsTableCell textAlign="left">NHL Totals</StatsTableCell>
                    <StatsTableCell></StatsTableCell>
                    <StatsTableCell></StatsTableCell>
                    <StatsTableCell>
                      {seasonStats.filter(s => s.league === 'NHL').reduce((sum, s) => sum + s.gp, 0)}
                    </StatsTableCell>
                    <StatsTableCell>
                      {seasonStats.filter(s => s.league === 'NHL').reduce((sum, s) => sum + s.goals, 0)}
                    </StatsTableCell>
                    <StatsTableCell>
                      {seasonStats.filter(s => s.league === 'NHL').reduce((sum, s) => sum + s.assists, 0)}
                    </StatsTableCell>
                    <StatsTableCell>
                      {seasonStats.filter(s => s.league === 'NHL').reduce((sum, s) => sum + (typeof s.points === 'function' ? s.points() : s.points), 0)}
                    </StatsTableCell>
                    <StatsTableCell>
                      {seasonStats.filter(s => s.league === 'NHL').reduce((sum, s) => sum + (s.pim || 0), 0)}
                    </StatsTableCell>
                    <StatsTableCell></StatsTableCell>
                    <StatsTableCell></StatsTableCell>
                    <StatsTableCell></StatsTableCell>
                    <StatsTableCell></StatsTableCell>
                    <StatsTableCell></StatsTableCell>
                    <StatsTableCell></StatsTableCell>
                  </StatsTableRow>
                </tbody>
              </StatsTable>
              
              {/* Tournaments Section */}
              {tournaments.length > 0 && (
                <TournamentsSection>
                  <SectionTitle>Tournaments</SectionTitle>
                  <StatsTable>
                    <thead>
                      <tr>
                        <StatsTableHeader>Year</StatsTableHeader>
                        <StatsTableHeader textAlign="left">Tournament</StatsTableHeader>
                        <StatsTableHeader textAlign="left">Team</StatsTableHeader>
                        <StatsTableHeader>GP</StatsTableHeader>
                        <StatsTableHeader>G</StatsTableHeader>
                        <StatsTableHeader>A</StatsTableHeader>
                        <StatsTableHeader>Pts</StatsTableHeader>
                        <StatsTableHeader>PIM</StatsTableHeader>
                        <StatsTableHeader>+/-</StatsTableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {tournaments.map((tournament, index) => (
                        <StatsTableRow 
                          key={index}
                          style={{ color: '#e6b5bc' }}
                        >
                          <StatsTableCell>{tournament.year}</StatsTableCell>
                          <StatsTableCell textAlign="left">{tournament.tournament}</StatsTableCell>
                          <StatsTableCell textAlign="left">{tournament.team}</StatsTableCell>
                          <StatsTableCell>{tournament.gp}</StatsTableCell>
                          <StatsTableCell>{tournament.goals}</StatsTableCell>
                          <StatsTableCell>{tournament.assists}</StatsTableCell>
                          <StatsTableCell>{tournament.points}</StatsTableCell>
                          <StatsTableCell>{tournament.pim}</StatsTableCell>
                          <StatsTableCell>{tournament.plusMinus}</StatsTableCell>
                        </StatsTableRow>
                      ))}
                    </tbody>
                  </StatsTable>
                </TournamentsSection>
              )}
              
              {/* Awards Section */}
              {awards.length > 0 && (
                <AwardsSection>
                  <SectionTitle>Awards</SectionTitle>
                  <StatsTable>
                    <thead>
                      <tr>
                        <StatsTableHeader>Year</StatsTableHeader>
                        <StatsTableHeader>League</StatsTableHeader>
                        <StatsTableHeader textAlign="left">Award</StatsTableHeader>
                      </tr>
                    </thead>
                    <tbody>
                      {awards.map((award, index) => (
                        <StatsTableRow 
                          key={index}
                          style={{ color: '#81c784' }}
                        >
                          <StatsTableCell>{award.year}</StatsTableCell>
                          <StatsTableCell>{award.league}</StatsTableCell>
                          <StatsTableCell textAlign="left">
                            <a href="#" style={{ color: '#3498db' }}>{award.award}</a>
                          </StatsTableCell>
                        </StatsTableRow>
                      ))}
                    </tbody>
                  </StatsTable>
                </AwardsSection>
              )}
            </>
          )}
          
          {activeTab === 'attributes' && (
            <AttributeSection>
              {Object.entries(playerAttributes).map(([key, value]) => (
                <AttributeItem key={key}>
                  <AttributeName>{key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')}</AttributeName>
                  <AttributeValue value={value}>{value}</AttributeValue>
                </AttributeItem>
              ))}
            </AttributeSection>
          )}
        </PlayerCardBody>
      </PlayerCardContent>
    </PlayerModal>
  );
};

export default PlayerCard; 