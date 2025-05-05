import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import { FaTrophy, FaMedal, FaExternalLinkAlt, FaUser, FaUserTie } from 'react-icons/fa';

const WidgetContainer = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
`;

const WidgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  
  h3 {
    color: #C4CED4;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 10px;
      color: #B30E16;
    }
  }
  
  a {
    color: #B30E16;
    text-decoration: none;
    display: flex;
    align-items: center;
    
    svg {
      margin-left: 5px;
    }
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  background-color: ${({ active }) => active ? '#B30E16' : '#333'};
  color: ${({ active }) => active ? 'white' : '#C4CED4'};
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ active }) => active ? '#950b12' : '#444'};
  }
`;

const AwardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AwardItem = styled.div`
  background-color: #252525;
  border-radius: 4px;
  padding: 12px;
  
  .award-name {
    color: #C4CED4;
    font-weight: bold;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 8px;
      color: ${({ type }) => type === 'Individual' ? '#FFD700' : '#B30E16'};
    }
  }
  
  .award-winner {
    color: #aaa;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    
    .year {
      color: #B30E16;
      margin-right: 8px;
    }
    
    .winner {
      display: flex;
      align-items: center;
      
      svg {
        margin-right: 5px;
        color: #FFD700;
      }
    }
    
    .team {
      margin-left: 5px;
      color: #888;
    }
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 15px;
  color: #C4CED4;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 15px;
  color: #B30E16;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 15px;
  color: #888;
  font-style: italic;
`;

const AwardsWidget = ({ limit = 5 }) => {
  const [awards, setAwards] = useState([]);
  const [filteredAwards, setFilteredAwards] = useState([]);
  const [recentWinners, setRecentWinners] = useState({});
  const [leagues] = useState(['NHL', 'AHL', 'ECHL', 'KHL', 'SHL', 'LIIGA', 'NCAA', 'USHL', 'QMJHL', 'OHL', 'WHL']);
  const [selectedLeague, setSelectedLeague] = useState('NHL');
  const [selectedType, setSelectedType] = useState('Team');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        setLoading(true);
        const awardsResponse = await axios.get('/api/awards');
        const winnersResponse = await axios.get('/api/awards/recent');
        
        setAwards(awardsResponse.data.data);
        setRecentWinners(winnersResponse.data.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching awards:', err);
        setError('Failed to load awards data');
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  useEffect(() => {
    // Filter awards based on selected league and type
    let filtered = [...awards];
    
    filtered = filtered.filter(award => award.league === selectedLeague);
    filtered = filtered.filter(award => award.type === selectedType);
    
    // Only show most recent winners
    const currentYear = new Date().getFullYear();
    
    // Create a list of awards with their winners
    const awardsWithWinners = filtered.map(award => {
      // Look for the most recent winner for this award
      for (let year = currentYear; year >= currentYear - 5; year--) {
        const winners = recentWinners[year]?.filter(winner => 
          winner.award_id === award.id
        );
        
        if (winners && winners.length > 0) {
          return {
            ...award,
            recentWinner: winners[0], // Take the first winner if multiple
            year
          };
        }
      }
      
      // No recent winner found
      return {
        ...award,
        recentWinner: null,
        year: null
      };
    });
    
    // Sort by most recent winners first
    awardsWithWinners.sort((a, b) => {
      // If no year info, put at the end
      if (!a.year) return 1;
      if (!b.year) return -1;
      
      // Most recent years first
      return b.year - a.year;
    });
    
    // Limit the number of awards to show
    setFilteredAwards(awardsWithWinners.slice(0, limit));
  }, [awards, recentWinners, selectedLeague, selectedType, limit]);

  // Get winner icon based on award type and winner data
  const getWinnerIcon = (awardType, winnerId) => {
    if (awardType === 'Team') {
      return <FaTrophy size={12} />;
    } else if (winnerId && winnerId.includes('coach')) {
      return <FaUserTie size={12} />;
    } else if (winnerId && winnerId.includes('gm')) {
      return <FaUserTie size={12} />;
    } else {
      return <FaUser size={12} />;
    }
  };

  if (loading) {
    return (
      <WidgetContainer>
        <WidgetHeader>
          <h3><FaTrophy /> Hockey Awards</h3>
        </WidgetHeader>
        <LoadingMessage>Loading...</LoadingMessage>
      </WidgetContainer>
    );
  }

  if (error) {
    return (
      <WidgetContainer>
        <WidgetHeader>
          <h3><FaTrophy /> Hockey Awards</h3>
        </WidgetHeader>
        <ErrorMessage>{error}</ErrorMessage>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer>
      <WidgetHeader>
        <h3><FaTrophy /> Hockey Awards</h3>
        <Link to="/awards">View All <FaExternalLinkAlt size={12} /></Link>
      </WidgetHeader>
      
      <FilterContainer>
        <FilterButton 
          active={selectedType === 'Team'} 
          onClick={() => setSelectedType('Team')}
        >
          Team
        </FilterButton>
        <FilterButton 
          active={selectedType === 'Individual'} 
          onClick={() => setSelectedType('Individual')}
        >
          Individual
        </FilterButton>
      </FilterContainer>
      
      <FilterContainer>
        {leagues.slice(0, 5).map(league => (
          <FilterButton 
            key={league}
            active={selectedLeague === league}
            onClick={() => setSelectedLeague(league)}
          >
            {league}
          </FilterButton>
        ))}
      </FilterContainer>
      
      <AwardsList>
        {filteredAwards.length > 0 ? (
          filteredAwards.map(award => (
            <AwardItem key={award.id} type={award.type}>
              <div className="award-name">
                {award.type === 'Individual' ? <FaMedal /> : <FaTrophy />}
                {award.award}
              </div>
              
              {award.recentWinner ? (
                <div className="award-winner">
                  <span className="year">{award.year}</span>
                  <span className="winner">
                    {getWinnerIcon(award.type, award.recentWinner.winner_id)}
                    {award.recentWinner.winner}
                  </span>
                  
                  {award.type === 'Individual' && award.recentWinner.team && (
                    <span className="team">({award.recentWinner.team})</span>
                  )}
                </div>
              ) : (
                <div className="award-winner">
                  <i>No recent winner data available</i>
                </div>
              )}
            </AwardItem>
          ))
        ) : (
          <NoDataMessage>No awards found for the selected filters.</NoDataMessage>
        )}
      </AwardsList>
    </WidgetContainer>
  );
};

export default AwardsWidget; 