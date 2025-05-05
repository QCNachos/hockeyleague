import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { FaTrophy, FaMedal, FaAngleDown } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectCommunityPack } from '../store/slices/settingsSlice';

const PageContainer = styled.div`
  padding: 20px;
  position: relative;
`;

const PageTitle = styled.h1`
  color: #C4CED4;
  margin-bottom: 25px;
  font-size: 2rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 15px;
    color: #B30E16;
  }
`;

const CeremonyButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background-color: #25a244;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  z-index: 10;
  
  &:hover {
    background-color: #1e8035;
  }
`;

const LeagueFilter = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  background-color: ${({ active }) => active ? '#B30E16' : '#1e1e1e'};
  color: ${({ active }) => active ? 'white' : '#C4CED4'};
  border: 1px solid ${({ active }) => active ? '#B30E16' : '#333'};
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ active }) => active ? '#950b12' : '#2a2a2a'};
  }
`;

const TypeFilter = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
`;

const AwardsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const AwardCard = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  padding-bottom: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  
  h3 {
    color: #C4CED4;
    margin-bottom: 10px;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 10px;
      color: ${({ type }) => type === 'Individual' ? '#FFD700' : '#B30E16'};
    }
  }
  
  h4 {
    color: #C4CED4;
    margin-top: 15px;
    margin-bottom: 10px;
    font-size: 1.1rem;
  }
  
  .league {
    color: #B30E16;
    font-size: 0.9rem;
    margin-bottom: 10px;
  }
  
  .description {
    color: #aaa;
    font-size: 0.9rem;
    margin-bottom: 15px;
    flex-grow: 1;
  }
`;

const IndividualAwardCard = styled(AwardCard)`
  /* Base properties from AwardCard are inherited */
  
  /* Only apply grid positioning at larger screens where we have 3 columns */
  @media (min-width: 1200px) {
    &.hart-memorial { grid-area: 1 / 1 / 2 / 2; }
    &.art-ross { grid-area: 1 / 2 / 2 / 3; }
    &.maurice-richard { grid-area: 1 / 3 / 2 / 4; }
    
    &.james-norris { grid-area: 2 / 1 / 3 / 2; }
    &.rod-langway { grid-area: 2 / 2 / 3 / 3; }
    &.frank-selke { grid-area: 2 / 3 / 3 / 4; }
    
    &.calder-memorial { grid-area: 3 / 1 / 4 / 2; }
    &.vezina { grid-area: 3 / 2 / 4 / 3; }
    &.jennings { grid-area: 3 / 3 / 4 / 4; }
    
    &.conn-smythe { grid-area: 4 / 1 / 5 / 2; }
    &.ted-lindsay { grid-area: 4 / 2 / 5 / 3; }
    &.lady-byng { grid-area: 4 / 3 / 5 / 4; }
    
    &.bill-masterton { grid-area: 5 / 1 / 6 / 2; }
    &.jack-adams { grid-area: 5 / 2 / 6 / 3; }
    /* Add more specific positions as needed */
  }
`;

const HistoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 0.9rem;
  height: 300px; /* Fixed exact height for all tables */
  position: relative;
  table-layout: fixed; /* Makes columns have consistent widths */
  
  th, td {
    padding: 10px 8px;
    text-align: left;
    border-bottom: 1px solid #333;
    height: 25px; /* Fixed height for all cells */
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  
  th {
    color: #B30E16;
    border-bottom: 2px solid #333;
    padding-bottom: 12px;
    padding-top: 12px;
    font-weight: bold;
  }
  
  td {
    color: #C4CED4;
  }
  
  /* Add alternating row styling for better readability */
  tbody tr:nth-child(even) {
    background-color: rgba(20, 20, 20, 0.4);
  }
  
  /* Remove all custom empty row styling - we'll use a simpler approach */
  tbody {
    & tr:last-child td {
      border-bottom: none;
    }
  }
`;

const TableEmptySpace = styled.div`
  height: ${props => props.height || '120px'};
  width: 100%;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 50px;
  color: #C4CED4;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 50px;
  color: #B30E16;
`;

const ShowMoreButton = styled.button`
  background-color: transparent;
  color: #B30E16;
  border: none;
  padding: 2px 8px;
  border-radius: 4px;
  margin-top: 0px;
  margin-bottom: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(179, 14, 22, 0.1);
  }
  
  svg {
    margin-left: 4px;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background-color: #1e1e1e;
  padding: 25px;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  
  h2 {
    color: #C4CED4;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 10px;
      color: ${({ type }) => type === 'Individual' ? '#FFD700' : '#B30E16'};
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #C4CED4;
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: #B30E16;
  }
`;

// Simplified empty row renderer - same exact height as data rows
const renderEmptyRows = (count, colSpan) => {
  const rows = [];
  for (let i = 0; i < count; i++) {
    rows.push(
      <tr key={`empty-row-${i}`}>
        <td colSpan={colSpan}>&nbsp;</td>
      </tr>
    );
  }
  return rows;
};

const LogoWrapper = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  width: 24px;
  height: 24px;
  margin-right: 6px;
  background-color: rgba(30, 30, 30, 0.8);
  border-radius: 50%;
  flex-shrink: 0;
`;

const TeamLogo = styled.img`
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.05);
`;

// Update table cell styling to handle truncation
const TeamNameCell = styled.div`
  display: flex;
  align-items: center;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

// Helper function to get team logo
const getTeamLogo = (teamCode) => {
  try {
    if (!teamCode || teamCode === 'N/A') return '';
    
    const upperTeamCode = teamCode.toUpperCase();
    
    // Dynamic import from assets folder
    try {
      // This approach creates the correct path using webpack's require
      return require(`../assets/Logo_${upperTeamCode}.png`);
    } catch (error) {
      // Fallback to direct path if dynamic import fails
      return `/static/media/Logo_${upperTeamCode}.png`;
    }
  } catch (error) {
    console.warn('Error loading team logo:', error);
    return ''; // Return empty string on error
  }
};

// Helper function to format team display with logo
const formatTeamNameWithLogo = (winnerName, teamCode, communityPack = 1) => {
  try {
    if (!teamCode || teamCode === 'N/A' || communityPack !== 1) {
      return (
        <TeamNameCell>
          {winnerName} {teamCode && teamCode !== 'N/A' ? `(${teamCode})` : ''}
        </TeamNameCell>
      );
    }
    
    // Get logo path using our utility function
    const logoPath = getTeamLogo(teamCode);
    
    return (
      <TeamNameCell>
        {logoPath && (
          <LogoWrapper>
            <TeamLogo 
              src={logoPath} 
              alt={teamCode}
              onError={(e) => { 
                // Replace with team code in a styled span
                const parent = e.target.parentNode;
                if (parent) {
                  const abbr = document.createElement('span');
                  abbr.innerText = teamCode;
                  abbr.style.fontWeight = 'bold';
                  abbr.style.fontSize = '10px';
                  abbr.style.color = '#C4CED4';
                  parent.appendChild(abbr);
                }
                e.target.style.display = 'none'; // Hide broken images
              }}
            />
          </LogoWrapper>
        )}
        <span>{winnerName} ({teamCode})</span>
      </TeamNameCell>
    );
  } catch (error) {
    console.warn('Error formatting team name with logo:', error);
    return `${winnerName} (${teamCode || 'N/A'})`;
  }
};

// Helper function for processing award winner data
const processWinnerData = (winnerEntries, award, communityPack = 1) => {
  try {
    return winnerEntries.slice(0, 6).map(entry => {
      const isTeamAward = award.type === 'Team';
      
      let displayContent;
      if (isTeamAward) {
        // For team awards, show "Team Name (CODE)" with logo
        displayContent = formatTeamNameWithLogo(entry.winner, entry.team, communityPack);
      } else {
        // For individual awards, just show player name
        displayContent = entry.winner;
      }
      
      const logoSrc = entry.team ? getTeamLogo(entry.team) : '';
      
      return (
        <tr key={entry.key}>
          <td>{entry.year}</td>
          <td>{displayContent}</td>
          {award.type === 'Individual' && (
            <td>
              <TeamNameCell>
                {communityPack === 1 && entry.team && entry.team !== 'N/A' && logoSrc && (
                  <LogoWrapper>
                    <TeamLogo 
                      src={logoSrc} 
                      alt={entry.team}
                      onError={(e) => { 
                        // Replace with team code in a styled span
                        const parent = e.target.parentNode;
                        if (parent) {
                          const abbr = document.createElement('span');
                          abbr.innerText = entry.team;
                          abbr.style.fontWeight = 'bold';
                          abbr.style.fontSize = '10px';
                          abbr.style.color = '#C4CED4';
                          parent.appendChild(abbr);
                        }
                        e.target.style.display = 'none'; // Hide broken images
                      }}
                    />
                  </LogoWrapper>
                )}
                <span>{entry.team}</span>
              </TeamNameCell>
            </td>
          )}
        </tr>
      );
    });
  } catch (error) {
    console.error('Error processing winner data:', error);
    return []; // Return empty array on error
  }
};

// Helper function to convert award name to a CSS class name
const getAwardClassName = (awardName) => {
  return awardName
    .toLowerCase()
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/[^\w-]/g, ''); // remove non-word characters except hyphens
};

const Awards = () => {
  const [awards, setAwards] = useState([]);
  const [filteredAwards, setFilteredAwards] = useState([]);
  const [recentWinners, setRecentWinners] = useState({});
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState('NHL');
  const [selectedType, setSelectedType] = useState('Team');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAward, setSelectedAward] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAwardHistory, setSelectedAwardHistory] = useState(null);
  const communityPack = useSelector(selectCommunityPack) || 1;
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAwards = async () => {
      try {
        setLoading(true);
        const awardsResponse = await axios.get('/api/awards');
        const winnersResponse = await axios.get('/api/awards/recent');
        
        setAwards(awardsResponse.data.data);
        setRecentWinners(winnersResponse.data.data);
        
        // Extract unique leagues
        const uniqueLeagues = [...new Set(awardsResponse.data.data
          .filter(award => award.league)
          .map(award => award.league))];
        
        setLeagues(uniqueLeagues);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching awards:', err);
        setError('Failed to load awards data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  useEffect(() => {
    // Filter awards based on selected league and type
    let filtered = [...awards];
    
    if (selectedLeague) {
      filtered = filtered.filter(award => award.league === selectedLeague);
    }
    
    if (selectedType) {
      filtered = filtered.filter(award => award.type === selectedType);
    }
    
    // Manual fix for the individual award order
    if (selectedType === 'Individual') {
      // Find William M. Jennings Trophy and Bill Masterton Memorial
      const jennigsIndex = filtered.findIndex(award => award.award === 'William M. Jennings Trophy');
      const mastertionIndex = filtered.findIndex(award => award.award === 'Bill Masterton Memorial');
      
      // Swap their positions if both are found
      if (jennigsIndex !== -1 && mastertionIndex !== -1) {
        // Create a simple swapping operation
        const temp = filtered[jennigsIndex];
        filtered[jennigsIndex] = filtered[mastertionIndex];
        filtered[mastertionIndex] = temp;
      }
    }
    
    // Apply sorting only to the filtered awards
    setFilteredAwards(filtered);
  }, [awards, selectedLeague, selectedType]);

  const handleShowMore = (award) => {
    setSelectedAward(award);
    setShowModal(true);
    
    // Fetch all historical data for this award
    const fetchAllHistory = async () => {
      try {
        const response = await axios.get(`/api/awards/winners/all?award_id=${award.id}`);
        if (response.data && response.data.data) {
          // Update only this award's history in the modal
          const allYears = response.data.data;
          setSelectedAwardHistory(allYears);
        }
      } catch (err) {
        console.error('Error fetching complete award history:', err);
      }
    };
    
    fetchAllHistory();
  };

  const closeModal = () => {
    setShowModal(false);
    // Clear the selected award history when closing the modal
    setSelectedAwardHistory(null);
  };

  const getYearEntries = (award, years) => {
    // Filter out the years that don't have data for this award
    const validYears = years.filter(year => {
      const winnerEntry = recentWinners[year]?.find(entry => 
        entry.award_id === award.id
      );
      return winnerEntry != null;
    });
    
    return validYears;
  };

  // Handle click on ceremony button
  const handleCeremonyClick = () => {
    navigate('/awards-ceremony');
  };

  // Determine how many winners exist for a specific award
  const getWinnerCount = (award) => {
    if (!award || !recentWinners) return 0;
    
    return Object.keys(recentWinners).filter(year => {
      const entry = recentWinners[year]?.find(e => e.award_id === award.id);
      return entry !== undefined;
    }).length;
  };

  if (loading) {
    return <LoadingMessage>Loading awards data...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  return (
    <PageContainer>
      <PageTitle>
        <FaTrophy /> Hockey Awards
      </PageTitle>
      
      <CeremonyButton onClick={handleCeremonyClick}>
        Start Award Ceremony
      </CeremonyButton>
      
      <LeagueFilter>
        {leagues.map(league => (
          <FilterButton 
            key={league}
            active={selectedLeague === league}
            onClick={() => setSelectedLeague(league)}
          >
            {league}
          </FilterButton>
        ))}
      </LeagueFilter>
      
      <TypeFilter>
        <FilterButton 
          active={selectedType === 'Team'} 
          onClick={() => setSelectedType('Team')}
        >
          Team Awards
        </FilterButton>
        <FilterButton 
          active={selectedType === 'Individual'} 
          onClick={() => setSelectedType('Individual')}
        >
          Individual Awards
        </FilterButton>
      </TypeFilter>
      
      <AwardsGrid>
        {(() => {
          try {
            return filteredAwards.map(award => {
              // Determine which component to use based on award type
              const AwardCardComponent = award.type === 'Individual' ? IndividualAwardCard : AwardCard;
              
              // Generate a class name for the award
              const awardClassName = getAwardClassName(award.award);
              
              return (
                <AwardCardComponent 
                  key={award.id} 
                  type={award.type}
                  className={awardClassName}
                >
                  <h3>
                    {award.type === 'Individual' ? <FaMedal /> : <FaTrophy />}
                    {award.award}
                  </h3>
                  {award.league && <div className="league">{award.league}</div>}
                  <div className="description">{award.description}</div>
                  
                  <h4>Recent Winners</h4>
                  <HistoryTable>
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Winner</th>
                        {award.type === 'Individual' && <th>Team</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Get winners for this award
                        const winnerEntries = [];
                        const colSpan = award.type === 'Individual' ? 3 : 2;
                        
                        // Get up to 6 winners, sorted by year
                        if (recentWinners) {
                          Object.keys(recentWinners)
                            .sort((a, b) => b - a) // Sort years in descending order
                            .forEach(year => {
                              const entry = recentWinners[year]?.find(e => e.award_id === award.id);
                              if (entry) {
                                winnerEntries.push({
                                  year,
                                  winner: entry.winner,
                                  team: entry.team,
                                  key: `${award.id}-${year}`
                                });
                              }
                            });
                        }
                        
                        // Generate rows for actual winners (up to 6)
                        const rows = processWinnerData(winnerEntries, award, communityPack);
                        
                        // Add empty rows to reach exactly 6 rows
                        if (rows.length < 6) {
                          const emptyRows = renderEmptyRows(6 - rows.length, colSpan);
                          rows.push(...emptyRows);
                        }
                        
                        return rows;
                      })()}
                    </tbody>
                  </HistoryTable>
                  
                  <ShowMoreButton onClick={() => handleShowMore(award)}>
                    Show More History <FaAngleDown />
                  </ShowMoreButton>
                </AwardCardComponent>
              );
            });
          } catch (error) {
            console.error('Error rendering awards grid:', error);
            return <div style={{ color: '#C4CED4', textAlign: 'center' }}>Error displaying awards data.</div>;
          }
        })()}
      </AwardsGrid>
      
      {showModal && selectedAward && (
        <Modal onClick={closeModal}>
          <ModalContent type={selectedAward?.type} onClick={(e) => e.stopPropagation()}>
            <h2>
              {selectedAward?.type === 'Individual' ? <FaMedal /> : <FaTrophy />}
              {selectedAward?.award} - Complete History
            </h2>
            <div className="league">{selectedAward?.league}</div>
            <div className="description">{selectedAward?.description}</div>
            
            <HistoryTable>
              <thead>
                <tr>
                  <th>Year</th>
                  <th>Winner</th>
                  {selectedAward?.type === 'Individual' && <th>Team</th>}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  try {
                    const colSpan = selectedAward?.type === 'Individual' ? 3 : 2;
                    let rows = [];
                    
                    if (selectedAwardHistory) {
                      // Use complete history data
                      rows = selectedAwardHistory
                        .sort((a, b) => b.year - a.year) // Sort years in descending order
                        .map(entry => { // Remove the slice(0, 6) to show all history
                          const isTeamAward = selectedAward?.type === 'Team';
                          
                          let displayContent;
                          if (isTeamAward) {
                            // For team awards, show "Team Name (CODE)" with logo
                            displayContent = formatTeamNameWithLogo(entry.winner, entry.team, communityPack);
                          } else {
                            // For individual awards, just show player name
                            displayContent = entry.winner;
                          }
                          
                          const logoSrc = entry.team ? getTeamLogo(entry.team) : '';
                          
                          return (
                            <tr key={`history-${entry.id}`}>
                              <td>{entry.year}</td>
                              <td>{displayContent}</td>
                              {selectedAward?.type === 'Individual' && (
                                <td>
                                  <TeamNameCell>
                                    {communityPack === 1 && entry.team && entry.team !== 'N/A' && logoSrc && (
                                      <LogoWrapper>
                                        <TeamLogo 
                                          src={logoSrc} 
                                          alt={entry.team}
                                          onError={(e) => { 
                                            // Replace with team code in a styled span
                                            const parent = e.target.parentNode;
                                            if (parent) {
                                              const abbr = document.createElement('span');
                                              abbr.innerText = entry.team;
                                              abbr.style.fontWeight = 'bold';
                                              abbr.style.fontSize = '10px';
                                              abbr.style.color = '#C4CED4';
                                              parent.appendChild(abbr);
                                            }
                                            e.target.style.display = 'none'; // Hide broken images
                                          }}
                                        />
                                      </LogoWrapper>
                                    )}
                                    <span>{entry.team}</span>
                                  </TeamNameCell>
                                </td>
                              )}
                            </tr>
                          );
                        });
                    } else if (recentWinners) {
                      // Use recent winners as fallback
                      const winnerEntries = [];
                      Object.keys(recentWinners)
                        .sort((a, b) => b - a)
                        .forEach(year => {
                          const entry = recentWinners[year]?.find(e => e.award_id === selectedAward.id);
                          if (entry) {
                            winnerEntries.push({
                              year,
                              winner: entry.winner,
                              team: entry.team,
                              key: `${selectedAward.id}-${year}`
                            });
                          }
                        });
                        
                      rows = winnerEntries.map(entry => { // Remove slice(0, 6) to show all entries
                        const isTeamAward = selectedAward?.type === 'Team';
                        
                        let displayContent;
                        if (isTeamAward) {
                          // For team awards, show "Team Name (CODE)" with logo
                          displayContent = formatTeamNameWithLogo(entry.winner, entry.team, communityPack);
                        } else {
                          // For individual awards, just show player name
                          displayContent = entry.winner;
                        }
                        
                        const logoSrc = entry.team ? getTeamLogo(entry.team) : '';
                        
                        return (
                          <tr key={entry.key}>
                            <td>{entry.year}</td>
                            <td>{displayContent}</td>
                            {selectedAward?.type === 'Individual' && (
                              <td>
                                <TeamNameCell>
                                  {communityPack === 1 && entry.team && entry.team !== 'N/A' && logoSrc && (
                                    <LogoWrapper>
                                      <TeamLogo 
                                        src={logoSrc} 
                                        alt={entry.team}
                                        onError={(e) => { 
                                          // Replace with team code in a styled span
                                          const parent = e.target.parentNode;
                                          if (parent) {
                                            const abbr = document.createElement('span');
                                            abbr.innerText = entry.team;
                                            abbr.style.fontWeight = 'bold';
                                            abbr.style.fontSize = '10px';
                                            abbr.style.color = '#C4CED4';
                                            parent.appendChild(abbr);
                                          }
                                          e.target.style.display = 'none'; // Hide broken images
                                        }}
                                      />
                                    </LogoWrapper>
                                  )}
                                  <span>{entry.team}</span>
                                </TeamNameCell>
                              </td>
                            )}
                          </tr>
                        );
                      });
                    }
                    
                    // Since we're showing all history, we don't need to add empty rows
                    // Remove the empty rows logic
                    
                    return rows;
                  } catch (error) {
                    console.error('Error processing history data:', error);
                    return [];
                  }
                })()}
              </tbody>
            </HistoryTable>
            
            <CloseButton onClick={closeModal}>×</CloseButton>
          </ModalContent>
        </Modal>
      )}
    </PageContainer>
  );
};

export default Awards; 