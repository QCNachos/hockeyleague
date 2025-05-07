import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const Standings = ({ isEmbedded = false }) => {
  const [standingsType, setStandingsType] = useState('division'); // 'division', 'conference', 'wildcard', 'league'
  const [season, setSeason] = useState('2023-24');
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState({});

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from your API here
        // For now, we're using mock data
        // const response = await axios.get(`/api/standings?type=${standingsType}&season=${season}`);
        setStandings(mockStandings);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching standings:', error);
        setLoading(false);
      }
    };

    fetchStandings();
  }, [standingsType, season]);

  // Mock standings data
  const mockStandings = {
    eastern: {
      atlantic: [
        { id: 1, team: 'Toronto Maple Leafs', teamAbbr: 'TOR', logo: '🍁', gp: 74, w: 45, l: 25, ot: 4, pts: 94, p_pct: .635, rw: 37, row: 44, gf: 242, ga: 219, diff: 23, home: '23-13-1', away: '22-12-3', s_o: '1-2', l10: '6-3-1', strk: 'W2' },
        { id: 2, team: 'Tampa Bay Lightning', teamAbbr: 'TBL', logo: '⚡', gp: 73, w: 43, l: 25, ot: 5, pts: 91, p_pct: .623, rw: 37, row: 41, gf: 264, ga: 195, diff: 69, home: '27-8-2', away: '16-17-3', s_o: '2-2', l10: '6-3-1', strk: 'W3' },
        { id: 3, team: 'Florida Panthers', teamAbbr: 'FLA', logo: '🐆', gp: 73, w: 44, l: 26, ot: 3, pts: 91, p_pct: .623, rw: 35, row: 39, gf: 233, ga: 198, diff: 35, home: '24-11-2', away: '20-15-1', s_o: '5-0', l10: '5-5-0', strk: 'L1' }
      ],
      metropolitan: [
        { id: 4, team: 'Washington Capitals', teamAbbr: 'WSH', logo: '🦅', gp: 73, w: 47, l: 17, ot: 9, pts: 103, p_pct: .705, rw: 40, row: 46, gf: 266, ga: 196, diff: 70, home: '24-8-6', away: '23-9-3', s_o: '1-3', l10: '6-3-1', strk: 'L2' },
        { id: 5, team: 'Carolina Hurricanes', teamAbbr: 'CAR', logo: '🌀', gp: 73, w: 45, l: 24, ot: 4, pts: 94, p_pct: .644, rw: 40, row: 45, gf: 238, ga: 196, diff: 42, home: '29-8-1', away: '16-16-3', s_o: '0-2', l10: '8-2-0', strk: 'W2' },
        { id: 6, team: 'New Jersey Devils', teamAbbr: 'NJD', logo: '😈', gp: 76, w: 40, l: 29, ot: 7, pts: 87, p_pct: .572, rw: 35, row: 38, gf: 227, ga: 201, diff: 26, home: '18-13-5', away: '22-16-2', s_o: '2-2', l10: '5-4-1', strk: 'W2' }
      ]
    },
    wildcard: [
      { id: 7, team: 'Ottawa Senators', teamAbbr: 'OTT', logo: '🍁', gp: 73, w: 39, l: 28, ot: 6, pts: 84, p_pct: .575, rw: 30, row: 38, gf: 211, ga: 209, diff: 2, home: '21-10-2', away: '18-18-4', s_o: '1-2', l10: '6-3-1', strk: 'OT1' },
      { id: 8, team: 'Montréal Canadiens', teamAbbr: 'MTL', logo: '🇨🇦', gp: 73, w: 34, l: 30, ot: 9, pts: 77, p_pct: .527, rw: 25, row: 32, gf: 220, ga: 246, diff: -26, home: '18-12-5', away: '16-18-4', s_o: '2-3', l10: '4-3-3', strk: 'W1' },
      { id: 9, team: 'New York Rangers', teamAbbr: 'NYR', logo: '🗽', gp: 74, w: 35, l: 32, ot: 7, pts: 77, p_pct: .520, rw: 32, row: 34, gf: 224, ga: 222, diff: 2, home: '17-17-3', away: '18-15-4', s_o: '1-0', l10: '4-5-1', strk: 'W1' },
      { id: 10, team: 'Columbus Blue Jackets', teamAbbr: 'CBJ', logo: '🧢', gp: 72, w: 33, l: 30, ot: 9, pts: 75, p_pct: .521, rw: 23, row: 27, gf: 234, ga: 242, diff: -8, home: '21-9-5', away: '12-21-4', s_o: '6-1', l10: '3-6-1', strk: 'L1' }
    ],
    western: {
      // Add western conference divisions here as needed
    }
  };

  // Handle tab change
  const handleTabChange = (type) => {
    setStandingsType(type);
  };

  return (
    <StandingsContainer isEmbedded={isEmbedded}>
      <StandingsHeader>
        <Title>Standings</Title>
        <FilterSection>
          <SelectWrapper>
            <label>Season:</label>
            <select 
              value={season} 
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
              <option value="2021-22">2021-22</option>
            </select>
          </SelectWrapper>
        </FilterSection>
      </StandingsHeader>

      <TabsContainer>
        <TabButton 
          active={standingsType === 'division'} 
          onClick={() => handleTabChange('division')}
        >
          Division
        </TabButton>
        <TabButton 
          active={standingsType === 'wildcard'} 
          onClick={() => handleTabChange('wildcard')}
        >
          Wild Card
        </TabButton>
        <TabButton 
          active={standingsType === 'conference'} 
          onClick={() => handleTabChange('conference')}
        >
          Conference
        </TabButton>
        <TabButton 
          active={standingsType === 'league'} 
          onClick={() => handleTabChange('league')}
        >
          League
        </TabButton>
      </TabsContainer>

      {loading ? (
        <LoadingMessage>Loading standings...</LoadingMessage>
      ) : (
        <StandingsContent>
          {standingsType === 'division' && (
            <DivisionStandings>
              <DivisionContainer>
                <DivisionHeader>Eastern</DivisionHeader>
                <ConferenceSection>
                  <DivisionSection>
                    <DivisionName>Atlantic</DivisionName>
                    <StandingsTable>
                      <StandingsTableHeader>
                        <HeaderCell width="50px">Rank</HeaderCell>
                        <HeaderCell width="250px">Team</HeaderCell>
                        <HeaderCell width="50px">GP</HeaderCell>
                        <HeaderCell width="50px">W</HeaderCell>
                        <HeaderCell width="50px">L</HeaderCell>
                        <HeaderCell width="50px">OT</HeaderCell>
                        <HeaderCell width="50px" highlighted>PTS</HeaderCell>
                        <HeaderCell width="60px">P%</HeaderCell>
                        <HeaderCell width="50px">RW</HeaderCell>
                        <HeaderCell width="50px">ROW</HeaderCell>
                        <HeaderCell width="50px">GF</HeaderCell>
                        <HeaderCell width="50px">GA</HeaderCell>
                        <HeaderCell width="50px">DIFF</HeaderCell>
                        <HeaderCell width="100px">HOME</HeaderCell>
                        <HeaderCell width="100px">AWAY</HeaderCell>
                        <HeaderCell width="50px">S/O</HeaderCell>
                        <HeaderCell width="70px">L10</HeaderCell>
                        <HeaderCell width="70px">STRK</HeaderCell>
                      </StandingsTableHeader>
                      <StandingsTableBody>
                        {standings.eastern.atlantic.map((team, index) => (
                          <StandingsTableRow key={team.id}>
                            <Cell width="50px">{index + 1}</Cell>
                            <TeamCell width="250px">
                              <TeamLogo>{team.logo}</TeamLogo>
                              <TeamName>{team.team}</TeamName>
                            </TeamCell>
                            <Cell width="50px">{team.gp}</Cell>
                            <Cell width="50px">{team.w}</Cell>
                            <Cell width="50px">{team.l}</Cell>
                            <Cell width="50px">{team.ot}</Cell>
                            <Cell width="50px" highlighted>{team.pts}</Cell>
                            <Cell width="60px">{team.p_pct.toFixed(3).substring(1)}</Cell>
                            <Cell width="50px">{team.rw}</Cell>
                            <Cell width="50px">{team.row}</Cell>
                            <Cell width="50px">{team.gf}</Cell>
                            <Cell width="50px">{team.ga}</Cell>
                            <Cell width="50px" positive={team.diff > 0} negative={team.diff < 0}>
                              {team.diff > 0 ? `+${team.diff}` : team.diff}
                            </Cell>
                            <Cell width="100px">{team.home}</Cell>
                            <Cell width="100px">{team.away}</Cell>
                            <Cell width="50px">{team.s_o}</Cell>
                            <Cell width="70px">{team.l10}</Cell>
                            <Cell width="70px">{team.strk}</Cell>
                          </StandingsTableRow>
                        ))}
                      </StandingsTableBody>
                    </StandingsTable>
                  </DivisionSection>

                  <DivisionSection>
                    <DivisionName>Metropolitan</DivisionName>
                    <StandingsTable>
                      <StandingsTableHeader>
                        <HeaderCell width="50px">Rank</HeaderCell>
                        <HeaderCell width="250px">Team</HeaderCell>
                        <HeaderCell width="50px">GP</HeaderCell>
                        <HeaderCell width="50px">W</HeaderCell>
                        <HeaderCell width="50px">L</HeaderCell>
                        <HeaderCell width="50px">OT</HeaderCell>
                        <HeaderCell width="50px" highlighted>PTS</HeaderCell>
                        <HeaderCell width="60px">P%</HeaderCell>
                        <HeaderCell width="50px">RW</HeaderCell>
                        <HeaderCell width="50px">ROW</HeaderCell>
                        <HeaderCell width="50px">GF</HeaderCell>
                        <HeaderCell width="50px">GA</HeaderCell>
                        <HeaderCell width="50px">DIFF</HeaderCell>
                        <HeaderCell width="100px">HOME</HeaderCell>
                        <HeaderCell width="100px">AWAY</HeaderCell>
                        <HeaderCell width="50px">S/O</HeaderCell>
                        <HeaderCell width="70px">L10</HeaderCell>
                        <HeaderCell width="70px">STRK</HeaderCell>
                      </StandingsTableHeader>
                      <StandingsTableBody>
                        {standings.eastern.metropolitan.map((team, index) => (
                          <StandingsTableRow key={team.id}>
                            <Cell width="50px">{index + 1}</Cell>
                            <TeamCell width="250px">
                              <TeamLogo>{team.logo}</TeamLogo>
                              <TeamName>{team.team}</TeamName>
                            </TeamCell>
                            <Cell width="50px">{team.gp}</Cell>
                            <Cell width="50px">{team.w}</Cell>
                            <Cell width="50px">{team.l}</Cell>
                            <Cell width="50px">{team.ot}</Cell>
                            <Cell width="50px" highlighted>{team.pts}</Cell>
                            <Cell width="60px">{team.p_pct.toFixed(3).substring(1)}</Cell>
                            <Cell width="50px">{team.rw}</Cell>
                            <Cell width="50px">{team.row}</Cell>
                            <Cell width="50px">{team.gf}</Cell>
                            <Cell width="50px">{team.ga}</Cell>
                            <Cell width="50px" positive={team.diff > 0} negative={team.diff < 0}>
                              {team.diff > 0 ? `+${team.diff}` : team.diff}
                            </Cell>
                            <Cell width="100px">{team.home}</Cell>
                            <Cell width="100px">{team.away}</Cell>
                            <Cell width="50px">{team.s_o}</Cell>
                            <Cell width="70px">{team.l10}</Cell>
                            <Cell width="70px">{team.strk}</Cell>
                          </StandingsTableRow>
                        ))}
                      </StandingsTableBody>
                    </StandingsTable>
                  </DivisionSection>
                </ConferenceSection>
              </DivisionContainer>

              <DivisionContainer>
                <DivisionHeader>Wild Card</DivisionHeader>
                <WildCardSection>
                  <StandingsTable>
                    <StandingsTableHeader>
                      <HeaderCell width="50px">Rank</HeaderCell>
                      <HeaderCell width="250px">Team</HeaderCell>
                      <HeaderCell width="50px">GP</HeaderCell>
                      <HeaderCell width="50px">W</HeaderCell>
                      <HeaderCell width="50px">L</HeaderCell>
                      <HeaderCell width="50px">OT</HeaderCell>
                      <HeaderCell width="50px" highlighted>PTS</HeaderCell>
                      <HeaderCell width="60px">P%</HeaderCell>
                      <HeaderCell width="50px">RW</HeaderCell>
                      <HeaderCell width="50px">ROW</HeaderCell>
                      <HeaderCell width="50px">GF</HeaderCell>
                      <HeaderCell width="50px">GA</HeaderCell>
                      <HeaderCell width="50px">DIFF</HeaderCell>
                      <HeaderCell width="100px">HOME</HeaderCell>
                      <HeaderCell width="100px">AWAY</HeaderCell>
                      <HeaderCell width="50px">S/O</HeaderCell>
                      <HeaderCell width="70px">L10</HeaderCell>
                      <HeaderCell width="70px">STRK</HeaderCell>
                    </StandingsTableHeader>
                    <StandingsTableBody>
                      {standings.wildcard.map((team, index) => (
                        <StandingsTableRow key={team.id} isPlayoffLine={index === 1}>
                          <Cell width="50px">{index + 1}</Cell>
                          <TeamCell width="250px">
                            <TeamLogo>{team.logo}</TeamLogo>
                            <TeamName>{team.team}</TeamName>
                          </TeamCell>
                          <Cell width="50px">{team.gp}</Cell>
                          <Cell width="50px">{team.w}</Cell>
                          <Cell width="50px">{team.l}</Cell>
                          <Cell width="50px">{team.ot}</Cell>
                          <Cell width="50px" highlighted>{team.pts}</Cell>
                          <Cell width="60px">{team.p_pct.toFixed(3).substring(1)}</Cell>
                          <Cell width="50px">{team.rw}</Cell>
                          <Cell width="50px">{team.row}</Cell>
                          <Cell width="50px">{team.gf}</Cell>
                          <Cell width="50px">{team.ga}</Cell>
                          <Cell width="50px" positive={team.diff > 0} negative={team.diff < 0}>
                            {team.diff > 0 ? `+${team.diff}` : team.diff}
                          </Cell>
                          <Cell width="100px">{team.home}</Cell>
                          <Cell width="100px">{team.away}</Cell>
                          <Cell width="50px">{team.s_o}</Cell>
                          <Cell width="70px">{team.l10}</Cell>
                          <Cell width="70px">{team.strk}</Cell>
                        </StandingsTableRow>
                      ))}
                    </StandingsTableBody>
                  </StandingsTable>
                </WildCardSection>
              </DivisionContainer>
            </DivisionStandings>
          )}

          {standingsType === 'wildcard' && (
            <div>Wild Card Standings View</div>
          )}

          {standingsType === 'conference' && (
            <div>Conference Standings View</div>
          )}

          {standingsType === 'league' && (
            <div>League Standings View</div>
          )}
        </StandingsContent>
      )}
    </StandingsContainer>
  );
};

// Styled Components
const StandingsContainer = styled.div`
  max-width: ${props => props.isEmbedded ? '100%' : '1200px'};
  margin: 0 auto;
  padding: ${props => props.isEmbedded ? '0' : '20px'};
  color: #C4CED4;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const StandingsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  font-size: 24px;
  margin: 0;
  color: #333;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 20px;
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

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 10px 16px;
  background: ${props => props.active ? '#f0f0f0' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#1e88e5' : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
`;

const StandingsContent = styled.div`
  margin-bottom: 30px;
`;

const DivisionStandings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const DivisionContainer = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const DivisionHeader = styled.div`
  background-color: #f8f8f8;
  padding: 12px 20px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #ddd;
`;

const ConferenceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px;
`;

const DivisionSection = styled.div`
  margin-bottom: 20px;
`;

const DivisionName = styled.h2`
  font-size: 20px;
  margin: 0 0 15px 0;
  color: #333;
`;

const WildCardSection = styled.div`
  padding: 20px;
`;

const StandingsTable = styled.div`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #eee;
`;

const StandingsTableHeader = styled.div`
  display: flex;
  background-color: #f8f8f8;
  border-bottom: 2px solid #ddd;
  font-weight: bold;
`;

const HeaderCell = styled.div`
  padding: 12px 8px;
  text-align: center;
  width: ${props => props.width || 'auto'};
  min-width: ${props => props.width || 'auto'};
  color: ${props => props.highlighted ? '#1e88e5' : '#666'};
  font-weight: 600;
  font-size: 13px;
`;

const StandingsTableBody = styled.div`
  
`;

const StandingsTableRow = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  &:nth-child(even) {
    background-color: #f9f9f9;
  }
  ${props => props.isPlayoffLine && `
    border-bottom: 2px solid #1e88e5;
  `}
`;

const Cell = styled.div`
  padding: 12px 8px;
  text-align: center;
  width: ${props => props.width || 'auto'};
  min-width: ${props => props.width || 'auto'};
  ${props => props.highlighted && `
    font-weight: bold;
    color: #1e88e5;
  `}
  ${props => props.positive && `
    color: #4caf50;
  `}
  ${props => props.negative && `
    color: #f44336;
  `}
`;

const TeamCell = styled(Cell)`
  display: flex;
  align-items: center;
  text-align: left;
  padding: 8px;
`;

const TeamLogo = styled.div`
  width: 30px;
  height: 30px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const TeamName = styled.div`
  font-weight: 500;
`;

export default Standings; 