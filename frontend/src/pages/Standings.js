import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectCommunityPack } from '../store/slices/settingsSlice';

// Import team logos
import ANA from '../assets/Logo_ANA.png';
import BOS from '../assets/Logo_BOS.png';
import BUF from '../assets/Logo_BUF.png';
import CAR from '../assets/Logo_CAR.png';
import CBJ from '../assets/Logo_CBJ.png';
import CGY from '../assets/Logo_CGY.png';
import CHI from '../assets/Logo_CHI.png';
import COL from '../assets/Logo_COL.png';
import DAL from '../assets/Logo_DAL.png';
import DET from '../assets/Logo_DET.png';
import EDM from '../assets/Logo_EDM.png';
import FLA from '../assets/Logo_FLA.png';
import LAK from '../assets/Logo_LAK.png';
import MIN from '../assets/Logo_MIN.png';
import MTL from '../assets/Logo_MTL.png';
import NJD from '../assets/Logo_NJD.png';
import NSH from '../assets/Logo_NSH.png';
import NYI from '../assets/Logo_NYI.png';
import NYR from '../assets/Logo_NYR.png';
import OTT from '../assets/Logo_OTT.png';
import PHI from '../assets/Logo_PHI.png';
import PIT from '../assets/Logo_PIT.png';
import SEA from '../assets/Logo_SEA.png';
import SJS from '../assets/Logo_SJS.png';
import STL from '../assets/Logo_STL.png';
import TBL from '../assets/Logo_TBL.png';
import TOR from '../assets/Logo_TOR.png';
import VAN from '../assets/Logo_VAN.png';
import VGK from '../assets/Logo_VGK.png';
import WPG from '../assets/Logo_WPG.png';
import WSH from '../assets/Logo_WSH.png';
import UTA from '../assets/Logo_UTA.png';

// Create a mapping of team abbreviations to logo images
const teamLogos = {
  ANA, BOS, BUF, CAR, CBJ, CGY, CHI, COL, DAL, DET, 
  EDM, FLA, LAK, MIN, MTL, NJD, NSH, NYI, NYR, OTT, 
  PHI, PIT, SEA, SJS, STL, TBL, TOR, VAN, VGK, WPG, WSH, UTA
};

// Helper function to normalize team abbreviations
const normalizeAbbreviation = (abbr) => {
  if (!abbr) return '';
  return abbr.trim().toUpperCase();
};

// Function to get team logo
const getTeamLogo = (teamAbbr) => {
  if (!teamAbbr) {
    return null;
  }
  
  try {
    // Normalize the team abbreviation to uppercase
    const normalizedAbbr = normalizeAbbreviation(teamAbbr);
    
    // First try the static mapping for NHL teams (no spaces)
    if (teamLogos[normalizedAbbr]) {
      return teamLogos[normalizedAbbr];
    }
    
    // If not in static mapping, try dynamic import for teams with spaces
    try {
      // This approach handles filenames with spaces
      return require(`../assets/Logo_${normalizedAbbr}.png`);
    } catch (error) {
      // If dynamic import fails, return null
      return null;
    }
  } catch (error) {
    console.error(`Error getting logo: ${error.message}`);
    return null;
  }
};

const Standings = ({ isEmbedded = false }) => {
  const communityPack = useSelector(selectCommunityPack);
  const [standingsType, setStandingsType] = useState('wildcard'); // Changed default to 'wildcard'
  const [season, setSeason] = useState('2023-24');
  const [loading, setLoading] = useState(true);
  const [standings, setStandings] = useState({});

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true);
        // In a real app, you would fetch from your API here
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

  // Mock standings data (updated to use team abbreviations instead of emojis)
  const mockStandings = {
    eastern: {
      atlantic: [
        { id: 1, team: 'Toronto Maple Leafs', teamAbbr: 'TOR', gp: 74, w: 45, l: 25, ot: 4, pts: 94, p_pct: .635, rw: 37, row: 44, gf: 242, ga: 219, diff: 23, home: '23-13-1', away: '22-12-3', s_o: '1-2', l10: '6-3-1', strk: 'W2' },
        { id: 2, team: 'Tampa Bay Lightning', teamAbbr: 'TBL', gp: 73, w: 43, l: 25, ot: 5, pts: 91, p_pct: .623, rw: 37, row: 41, gf: 264, ga: 195, diff: 69, home: '27-8-2', away: '16-17-3', s_o: '2-2', l10: '6-3-1', strk: 'W3' },
        { id: 3, team: 'Florida Panthers', teamAbbr: 'FLA', gp: 73, w: 44, l: 26, ot: 3, pts: 91, p_pct: .623, rw: 35, row: 39, gf: 233, ga: 198, diff: 35, home: '24-11-2', away: '20-15-1', s_o: '5-0', l10: '5-5-0', strk: 'L1' }
      ],
      metropolitan: [
        { id: 4, team: 'Washington Capitals', teamAbbr: 'WSH', gp: 73, w: 47, l: 17, ot: 9, pts: 103, p_pct: .705, rw: 40, row: 46, gf: 266, ga: 196, diff: 70, home: '24-8-6', away: '23-9-3', s_o: '1-3', l10: '6-3-1', strk: 'L2' },
        { id: 5, team: 'Carolina Hurricanes', teamAbbr: 'CAR', gp: 73, w: 45, l: 24, ot: 4, pts: 94, p_pct: .644, rw: 40, row: 45, gf: 238, ga: 196, diff: 42, home: '29-8-1', away: '16-16-3', s_o: '0-2', l10: '8-2-0', strk: 'W2' },
        { id: 6, team: 'New Jersey Devils', teamAbbr: 'NJD', gp: 76, w: 40, l: 29, ot: 7, pts: 87, p_pct: .572, rw: 35, row: 38, gf: 227, ga: 201, diff: 26, home: '18-13-5', away: '22-16-2', s_o: '2-2', l10: '5-4-1', strk: 'W2' }
      ]
    },
    wildcard: [
      { id: 7, team: 'Ottawa Senators', teamAbbr: 'OTT', gp: 73, w: 39, l: 28, ot: 6, pts: 84, p_pct: .575, rw: 30, row: 38, gf: 211, ga: 209, diff: 2, home: '21-10-2', away: '18-18-4', s_o: '1-2', l10: '6-3-1', strk: 'OT1' },
      { id: 8, team: 'Montréal Canadiens', teamAbbr: 'MTL', gp: 73, w: 34, l: 30, ot: 9, pts: 77, p_pct: .527, rw: 25, row: 32, gf: 220, ga: 246, diff: -26, home: '18-12-5', away: '16-18-4', s_o: '2-3', l10: '4-3-3', strk: 'W1' },
      { id: 9, team: 'New York Rangers', teamAbbr: 'NYR', gp: 74, w: 35, l: 32, ot: 7, pts: 77, p_pct: .520, rw: 32, row: 34, gf: 224, ga: 222, diff: 2, home: '17-17-3', away: '18-15-4', s_o: '1-0', l10: '4-5-1', strk: 'W1' },
      { id: 10, team: 'Columbus Blue Jackets', teamAbbr: 'CBJ', gp: 72, w: 33, l: 30, ot: 9, pts: 75, p_pct: .521, rw: 23, row: 27, gf: 234, ga: 242, diff: -8, home: '21-9-5', away: '12-21-4', s_o: '6-1', l10: '3-6-1', strk: 'L1' }
    ],
    western: {
      central: [
        { id: 11, team: 'Colorado Avalanche', teamAbbr: 'COL', gp: 74, w: 42, l: 24, ot: 8, pts: 92, p_pct: .622, rw: 38, row: 42, gf: 245, ga: 219, diff: 26, home: '25-8-5', away: '17-16-3', s_o: '0-5', l10: '6-2-2', strk: 'W3' },
        { id: 12, team: 'Dallas Stars', teamAbbr: 'DAL', gp: 73, w: 39, l: 25, ot: 9, pts: 87, p_pct: .596, rw: 36, row: 38, gf: 231, ga: 204, diff: 27, home: '23-10-4', away: '16-15-5', s_o: '1-1', l10: '5-4-1', strk: 'L1' },
        { id: 13, team: 'Minnesota Wild', teamAbbr: 'MIN', gp: 72, w: 36, l: 28, ot: 8, pts: 80, p_pct: .556, rw: 34, row: 36, gf: 227, ga: 211, diff: 16, home: '19-13-4', away: '17-15-4', s_o: '0-2', l10: '6-3-1', strk: 'W2' }
      ],
      pacific: [
        { id: 14, team: 'Vancouver Canucks', teamAbbr: 'VAN', gp: 75, w: 48, l: 22, ot: 5, pts: 101, p_pct: .673, rw: 42, row: 46, gf: 238, ga: 183, diff: 55, home: '25-10-2', away: '23-12-3', s_o: '2-0', l10: '8-1-1', strk: 'W5' },
        { id: 15, team: 'Vegas Golden Knights', teamAbbr: 'VGK', gp: 74, w: 45, l: 22, ot: 7, pts: 97, p_pct: .655, rw: 36, row: 41, gf: 246, ga: 217, diff: 29, home: '24-10-5', away: '21-12-2', s_o: '4-5', l10: '6-3-1', strk: 'W2' },
        { id: 16, team: 'Edmonton Oilers', teamAbbr: 'EDM', gp: 76, w: 45, l: 24, ot: 7, pts: 97, p_pct: .638, rw: 35, row: 40, gf: 262, ga: 226, diff: 36, home: '21-10-4', away: '24-14-3', s_o: '5-1', l10: '7-2-1', strk: 'W3' }
      ]
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
                              <TeamLogo>
                                {communityPack === 1 && getTeamLogo(team.teamAbbr) ? (
                                  <TeamLogoImage src={getTeamLogo(team.teamAbbr)} alt={team.team} />
                                ) : (
                                  <TeamLogoPlaceholder>
                                    {team.teamAbbr.substring(0, 2)}
                                  </TeamLogoPlaceholder>
                                )}
                              </TeamLogo>
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
                              <TeamLogo>
                                {communityPack === 1 && getTeamLogo(team.teamAbbr) ? (
                                  <TeamLogoImage src={getTeamLogo(team.teamAbbr)} alt={team.team} />
                                ) : (
                                  <TeamLogoPlaceholder>
                                    {team.teamAbbr.substring(0, 2)}
                                  </TeamLogoPlaceholder>
                                )}
                              </TeamLogo>
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
                            <TeamLogo>
                              {communityPack === 1 && getTeamLogo(team.teamAbbr) ? (
                                <TeamLogoImage src={getTeamLogo(team.teamAbbr)} alt={team.team} />
                              ) : (
                                <TeamLogoPlaceholder>
                                  {team.teamAbbr.substring(0, 2)}
                                </TeamLogoPlaceholder>
                              )}
                            </TeamLogo>
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
            <WildCardStandings>
              <DivisionContainer>
                <DivisionHeader>Eastern Conference</DivisionHeader>
                <ConferenceSection>
                  <DivisionSection>
                    <DivisionName>Atlantic Division</DivisionName>
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
                        <HeaderCell width="50px">ROW</HeaderCell>
                        <HeaderCell width="50px">DIFF</HeaderCell>
                        <HeaderCell width="100px">L10</HeaderCell>
                        <HeaderCell width="70px">STRK</HeaderCell>
                      </StandingsTableHeader>
                      <StandingsTableBody>
                        {standings.eastern.atlantic.slice(0, 3).map((team, index) => (
                          <StandingsTableRow key={team.id}>
                            <Cell width="50px">{index + 1}</Cell>
                            <TeamCell width="250px">
                              <TeamLogo>
                                {communityPack === 1 && getTeamLogo(team.teamAbbr) ? (
                                  <TeamLogoImage src={getTeamLogo(team.teamAbbr)} alt={team.team} />
                                ) : (
                                  <TeamLogoPlaceholder>
                                    {team.teamAbbr.substring(0, 2)}
                                  </TeamLogoPlaceholder>
                                )}
                              </TeamLogo>
                              <TeamName>{team.team}</TeamName>
                            </TeamCell>
                            <Cell width="50px">{team.gp}</Cell>
                            <Cell width="50px">{team.w}</Cell>
                            <Cell width="50px">{team.l}</Cell>
                            <Cell width="50px">{team.ot}</Cell>
                            <Cell width="50px" highlighted>{team.pts}</Cell>
                            <Cell width="60px">{team.p_pct.toFixed(3).substring(1)}</Cell>
                            <Cell width="50px">{team.row}</Cell>
                            <Cell width="50px" positive={team.diff > 0} negative={team.diff < 0}>
                              {team.diff > 0 ? `+${team.diff}` : team.diff}
                            </Cell>
                            <Cell width="100px">{team.l10}</Cell>
                            <Cell width="70px">{team.strk}</Cell>
                          </StandingsTableRow>
                        ))}
                      </StandingsTableBody>
                    </StandingsTable>
                  </DivisionSection>

                  <DivisionSection>
                    <DivisionName>Metropolitan Division</DivisionName>
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
                        <HeaderCell width="50px">ROW</HeaderCell>
                        <HeaderCell width="50px">DIFF</HeaderCell>
                        <HeaderCell width="100px">L10</HeaderCell>
                        <HeaderCell width="70px">STRK</HeaderCell>
                      </StandingsTableHeader>
                      <StandingsTableBody>
                        {standings.eastern.metropolitan.slice(0, 3).map((team, index) => (
                          <StandingsTableRow key={team.id}>
                            <Cell width="50px">{index + 1}</Cell>
                            <TeamCell width="250px">
                              <TeamLogo>
                                {communityPack === 1 && getTeamLogo(team.teamAbbr) ? (
                                  <TeamLogoImage src={getTeamLogo(team.teamAbbr)} alt={team.team} />
                                ) : (
                                  <TeamLogoPlaceholder>
                                    {team.teamAbbr.substring(0, 2)}
                                  </TeamLogoPlaceholder>
                                )}
                              </TeamLogo>
                              <TeamName>{team.team}</TeamName>
                            </TeamCell>
                            <Cell width="50px">{team.gp}</Cell>
                            <Cell width="50px">{team.w}</Cell>
                            <Cell width="50px">{team.l}</Cell>
                            <Cell width="50px">{team.ot}</Cell>
                            <Cell width="50px" highlighted>{team.pts}</Cell>
                            <Cell width="60px">{team.p_pct.toFixed(3).substring(1)}</Cell>
                            <Cell width="50px">{team.row}</Cell>
                            <Cell width="50px" positive={team.diff > 0} negative={team.diff < 0}>
                              {team.diff > 0 ? `+${team.diff}` : team.diff}
                            </Cell>
                            <Cell width="100px">{team.l10}</Cell>
                            <Cell width="70px">{team.strk}</Cell>
                          </StandingsTableRow>
                        ))}
                      </StandingsTableBody>
                    </StandingsTable>
                  </DivisionSection>

                  <DivisionSection>
                    <DivisionName>Wild Card</DivisionName>
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
                        <HeaderCell width="50px">ROW</HeaderCell>
                        <HeaderCell width="50px">DIFF</HeaderCell>
                        <HeaderCell width="100px">L10</HeaderCell>
                        <HeaderCell width="70px">STRK</HeaderCell>
                      </StandingsTableHeader>
                      <StandingsTableBody>
                        {standings.wildcard.map((team, index) => (
                          <StandingsTableRow key={team.id} isPlayoffLine={index === 1}>
                            <Cell width="50px">{index + 1}</Cell>
                            <TeamCell width="250px">
                              <TeamLogo>
                                {communityPack === 1 && getTeamLogo(team.teamAbbr) ? (
                                  <TeamLogoImage src={getTeamLogo(team.teamAbbr)} alt={team.team} />
                                ) : (
                                  <TeamLogoPlaceholder>
                                    {team.teamAbbr.substring(0, 2)}
                                  </TeamLogoPlaceholder>
                                )}
                              </TeamLogo>
                              <TeamName>{team.team}</TeamName>
                            </TeamCell>
                            <Cell width="50px">{team.gp}</Cell>
                            <Cell width="50px">{team.w}</Cell>
                            <Cell width="50px">{team.l}</Cell>
                            <Cell width="50px">{team.ot}</Cell>
                            <Cell width="50px" highlighted>{team.pts}</Cell>
                            <Cell width="60px">{team.p_pct.toFixed(3).substring(1)}</Cell>
                            <Cell width="50px">{team.row}</Cell>
                            <Cell width="50px" positive={team.diff > 0} negative={team.diff < 0}>
                              {team.diff > 0 ? `+${team.diff}` : team.diff}
                            </Cell>
                            <Cell width="100px">{team.l10}</Cell>
                            <Cell width="70px">{team.strk}</Cell>
                          </StandingsTableRow>
                        ))}
                      </StandingsTableBody>
                    </StandingsTable>
                  </DivisionSection>
                </ConferenceSection>
              </DivisionContainer>

              <DivisionContainer>
                <DivisionHeader>Western Conference</DivisionHeader>
                <ConferenceSection>
                  <DivisionSection>
                    <DivisionName>Central Division</DivisionName>
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
                        <HeaderCell width="50px">ROW</HeaderCell>
                        <HeaderCell width="50px">DIFF</HeaderCell>
                        <HeaderCell width="100px">L10</HeaderCell>
                        <HeaderCell width="70px">STRK</HeaderCell>
                      </StandingsTableHeader>
                      <StandingsTableBody>
                        {standings.western.central.slice(0, 3).map((team, index) => (
                          <StandingsTableRow key={team.id}>
                            <Cell width="50px">{index + 1}</Cell>
                            <TeamCell width="250px">
                              <TeamLogo>
                                {communityPack === 1 && getTeamLogo(team.teamAbbr) ? (
                                  <TeamLogoImage src={getTeamLogo(team.teamAbbr)} alt={team.team} />
                                ) : (
                                  <TeamLogoPlaceholder>
                                    {team.teamAbbr.substring(0, 2)}
                                  </TeamLogoPlaceholder>
                                )}
                              </TeamLogo>
                              <TeamName>{team.team}</TeamName>
                            </TeamCell>
                            <Cell width="50px">{team.gp}</Cell>
                            <Cell width="50px">{team.w}</Cell>
                            <Cell width="50px">{team.l}</Cell>
                            <Cell width="50px">{team.ot}</Cell>
                            <Cell width="50px" highlighted>{team.pts}</Cell>
                            <Cell width="60px">{team.p_pct.toFixed(3).substring(1)}</Cell>
                            <Cell width="50px">{team.row}</Cell>
                            <Cell width="50px" positive={team.diff > 0} negative={team.diff < 0}>
                              {team.diff > 0 ? `+${team.diff}` : team.diff}
                            </Cell>
                            <Cell width="100px">{team.l10}</Cell>
                            <Cell width="70px">{team.strk}</Cell>
                          </StandingsTableRow>
                        ))}
                      </StandingsTableBody>
                    </StandingsTable>
                  </DivisionSection>

                  <DivisionSection>
                    <DivisionName>Pacific Division</DivisionName>
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
                        <HeaderCell width="50px">ROW</HeaderCell>
                        <HeaderCell width="50px">DIFF</HeaderCell>
                        <HeaderCell width="100px">L10</HeaderCell>
                        <HeaderCell width="70px">STRK</HeaderCell>
                      </StandingsTableHeader>
                      <StandingsTableBody>
                        {standings.western.pacific.slice(0, 3).map((team, index) => (
                          <StandingsTableRow key={team.id}>
                            <Cell width="50px">{index + 1}</Cell>
                            <TeamCell width="250px">
                              <TeamLogo>
                                {communityPack === 1 && getTeamLogo(team.teamAbbr) ? (
                                  <TeamLogoImage src={getTeamLogo(team.teamAbbr)} alt={team.team} />
                                ) : (
                                  <TeamLogoPlaceholder>
                                    {team.teamAbbr.substring(0, 2)}
                                  </TeamLogoPlaceholder>
                                )}
                              </TeamLogo>
                              <TeamName>{team.team}</TeamName>
                            </TeamCell>
                            <Cell width="50px">{team.gp}</Cell>
                            <Cell width="50px">{team.w}</Cell>
                            <Cell width="50px">{team.l}</Cell>
                            <Cell width="50px">{team.ot}</Cell>
                            <Cell width="50px" highlighted>{team.pts}</Cell>
                            <Cell width="60px">{team.p_pct.toFixed(3).substring(1)}</Cell>
                            <Cell width="50px">{team.row}</Cell>
                            <Cell width="50px" positive={team.diff > 0} negative={team.diff < 0}>
                              {team.diff > 0 ? `+${team.diff}` : team.diff}
                            </Cell>
                            <Cell width="100px">{team.l10}</Cell>
                            <Cell width="70px">{team.strk}</Cell>
                          </StandingsTableRow>
                        ))}
                      </StandingsTableBody>
                    </StandingsTable>
                  </DivisionSection>
                </ConferenceSection>
              </DivisionContainer>
            </WildCardStandings>
          )}

          {standingsType === 'conference' && (
            <ConferenceStandings>
              <DivisionContainer>
                <DivisionHeader>Eastern Conference</DivisionHeader>
                <ConferenceSection>
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
                      <HeaderCell width="50px">ROW</HeaderCell>
                      <HeaderCell width="50px">DIFF</HeaderCell>
                      <HeaderCell width="100px">L10</HeaderCell>
                      <HeaderCell width="70px">STRK</HeaderCell>
                    </StandingsTableHeader>
                    <StandingsTableBody>
                      {[...standings.eastern.atlantic, ...standings.eastern.metropolitan]
                        .sort((a, b) => b.pts - a.pts || b.row - a.row)
                        .map((team, index) => (
                          <StandingsTableRow key={team.id} isPlayoffLine={index === 7}>
                            <Cell width="50px">{index + 1}</Cell>
                            <TeamCell width="250px">
                              <TeamLogo>
                                {communityPack === 1 && getTeamLogo(team.teamAbbr) ? (
                                  <TeamLogoImage src={getTeamLogo(team.teamAbbr)} alt={team.team} />
                                ) : (
                                  <TeamLogoPlaceholder>
                                    {team.teamAbbr.substring(0, 2)}
                                  </TeamLogoPlaceholder>
                                )}
                              </TeamLogo>
                              <TeamName>{team.team}</TeamName>
                            </TeamCell>
                            <Cell width="50px">{team.gp}</Cell>
                            <Cell width="50px">{team.w}</Cell>
                            <Cell width="50px">{team.l}</Cell>
                            <Cell width="50px">{team.ot}</Cell>
                            <Cell width="50px" highlighted>{team.pts}</Cell>
                            <Cell width="60px">{team.p_pct.toFixed(3).substring(1)}</Cell>
                            <Cell width="50px">{team.row}</Cell>
                            <Cell width="50px" positive={team.diff > 0} negative={team.diff < 0}>
                              {team.diff > 0 ? `+${team.diff}` : team.diff}
                            </Cell>
                            <Cell width="100px">{team.l10}</Cell>
                            <Cell width="70px">{team.strk}</Cell>
                          </StandingsTableRow>
                        ))}
                    </StandingsTableBody>
                  </StandingsTable>
                </ConferenceSection>
              </DivisionContainer>

              <DivisionContainer>
                <DivisionHeader>Western Conference</DivisionHeader>
                <ConferenceSection>
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
                      <HeaderCell width="50px">ROW</HeaderCell>
                      <HeaderCell width="50px">DIFF</HeaderCell>
                      <HeaderCell width="100px">L10</HeaderCell>
                      <HeaderCell width="70px">STRK</HeaderCell>
                    </StandingsTableHeader>
                    <StandingsTableBody>
                      {[...standings.western.central, ...standings.western.pacific]
                        .sort((a, b) => b.pts - a.pts || b.row - a.row)
                        .map((team, index) => (
                          <StandingsTableRow key={team.id} isPlayoffLine={index === 7}>
                            <Cell width="50px">{index + 1}</Cell>
                            <TeamCell width="250px">
                              <TeamLogo>
                                {communityPack === 1 && getTeamLogo(team.teamAbbr) ? (
                                  <TeamLogoImage src={getTeamLogo(team.teamAbbr)} alt={team.team} />
                                ) : (
                                  <TeamLogoPlaceholder>
                                    {team.teamAbbr.substring(0, 2)}
                                  </TeamLogoPlaceholder>
                                )}
                              </TeamLogo>
                              <TeamName>{team.team}</TeamName>
                            </TeamCell>
                            <Cell width="50px">{team.gp}</Cell>
                            <Cell width="50px">{team.w}</Cell>
                            <Cell width="50px">{team.l}</Cell>
                            <Cell width="50px">{team.ot}</Cell>
                            <Cell width="50px" highlighted>{team.pts}</Cell>
                            <Cell width="60px">{team.p_pct.toFixed(3).substring(1)}</Cell>
                            <Cell width="50px">{team.row}</Cell>
                            <Cell width="50px" positive={team.diff > 0} negative={team.diff < 0}>
                              {team.diff > 0 ? `+${team.diff}` : team.diff}
                            </Cell>
                            <Cell width="100px">{team.l10}</Cell>
                            <Cell width="70px">{team.strk}</Cell>
                          </StandingsTableRow>
                        ))}
                    </StandingsTableBody>
                  </StandingsTable>
                </ConferenceSection>
              </DivisionContainer>
            </ConferenceStandings>
          )}

          {standingsType === 'league' && (
            <LeagueStandings>
              <DivisionContainer>
                <DivisionHeader>NHL</DivisionHeader>
                <ConferenceSection>
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
                      <HeaderCell width="50px">ROW</HeaderCell>
                      <HeaderCell width="50px">DIFF</HeaderCell>
                      <HeaderCell width="100px">L10</HeaderCell>
                      <HeaderCell width="70px">STRK</HeaderCell>
                    </StandingsTableHeader>
                    <StandingsTableBody>
                      {[...standings.eastern.atlantic, ...standings.eastern.metropolitan, 
                         ...standings.western.central, ...standings.western.pacific]
                        .sort((a, b) => b.pts - a.pts || b.row - a.row)
                        .map((team, index) => (
                          <StandingsTableRow key={team.id}>
                            <Cell width="50px">{index + 1}</Cell>
                            <TeamCell width="250px">
                              <TeamLogo>
                                {communityPack === 1 && getTeamLogo(team.teamAbbr) ? (
                                  <TeamLogoImage src={getTeamLogo(team.teamAbbr)} alt={team.team} />
                                ) : (
                                  <TeamLogoPlaceholder>
                                    {team.teamAbbr.substring(0, 2)}
                                  </TeamLogoPlaceholder>
                                )}
                              </TeamLogo>
                              <TeamName>{team.team}</TeamName>
                            </TeamCell>
                            <Cell width="50px">{team.gp}</Cell>
                            <Cell width="50px">{team.w}</Cell>
                            <Cell width="50px">{team.l}</Cell>
                            <Cell width="50px">{team.ot}</Cell>
                            <Cell width="50px" highlighted>{team.pts}</Cell>
                            <Cell width="60px">{team.p_pct.toFixed(3).substring(1)}</Cell>
                            <Cell width="50px">{team.row}</Cell>
                            <Cell width="50px" positive={team.diff > 0} negative={team.diff < 0}>
                              {team.diff > 0 ? `+${team.diff}` : team.diff}
                            </Cell>
                            <Cell width="100px">{team.l10}</Cell>
                            <Cell width="70px">{team.strk}</Cell>
                          </StandingsTableRow>
                        ))}
                    </StandingsTableBody>
                  </StandingsTable>
                </ConferenceSection>
              </DivisionContainer>
            </LeagueStandings>
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
  color: #FFFFFF;
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
    color: #C4CED4;
  }

  select {
    padding: 8px 12px;
    border-radius: 4px;
    border: 1px solid #444;
    background-color: #1e1e1e;
    color: #FFFFFF;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #444;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 10px 16px;
  background: ${props => props.active ? '#2a2a2a' : 'transparent'};
  border: none;
  border-bottom: 3px solid ${props => props.active ? '#B30E16' : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  color: ${props => props.active ? '#FFFFFF' : '#C4CED4'};
  transition: all 0.2s ease;

  &:hover {
    background: #2a2a2a;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #C4CED4;
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  background-color: #1e1e1e;
`;

const DivisionHeader = styled.div`
  background-color: #2a2a2a;
  padding: 12px 20px;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid #444;
  color: #FFFFFF;
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
  color: #FFFFFF;
  text-transform: uppercase;
`;

const WildCardSection = styled.div`
  padding: 20px;
`;

const StandingsTable = styled.div`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #444;
`;

const StandingsTableHeader = styled.div`
  display: flex;
  background-color: #2a2a2a;
  border-bottom: 2px solid #444;
  font-weight: bold;
`;

const HeaderCell = styled.div`
  padding: 12px 8px;
  text-align: center;
  width: ${props => props.width || 'auto'};
  min-width: ${props => props.width || 'auto'};
  color: ${props => props.highlighted ? '#B30E16' : '#C4CED4'};
  font-weight: 600;
  font-size: 13px;
`;

const StandingsTableBody = styled.div`
  
`;

const StandingsTableRow = styled.div`
  display: flex;
  border-bottom: 1px solid #444;
  &:nth-child(even) {
    background-color: #2a2a2a;
  }
  ${props => props.isPlayoffLine && `
    border-bottom: 2px solid #B30E16;
  `}
`;

const Cell = styled.div`
  padding: 12px 8px;
  text-align: center;
  width: ${props => props.width || 'auto'};
  min-width: ${props => props.width || 'auto'};
  ${props => props.highlighted && `
    font-weight: bold;
    color: #B30E16;
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

const TeamLogoImage = styled.img`
  max-width: 30px;
  max-height: 30px;
  object-fit: contain;
`;

const TeamLogoPlaceholder = styled.div`
  width: 30px;
  height: 30px;
  background-color: #444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
  color: #FFFFFF;
`;

const TeamName = styled.div`
  font-weight: 500;
  color: #FFFFFF;
`;

// New views for other standings types
const ConferenceStandings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const LeagueStandings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const WildCardStandings = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

export default Standings; 