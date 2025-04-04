import React from 'react';
import styled from 'styled-components';

const StatsCategorySelector = ({ category, setCategory, playerType }) => {
  // Define available categories based on player type
  const categories = {
    skaters: [
      { value: 'points', label: 'Points' },
      { value: 'goals', label: 'Goals' },
      { value: 'assists', label: 'Assists' },
      { value: 'plusMinus', label: '+/-' },
      { value: 'timeOnIce', label: 'Time on Ice' }
    ],
    defensemen: [
      { value: 'points', label: 'Points' },
      { value: 'goals', label: 'Goals' },
      { value: 'assists', label: 'Assists' },
      { value: 'plusMinus', label: '+/-' },
      { value: 'blocks', label: 'Blocks' }
    ],
    rookies: [
      { value: 'points', label: 'Points' },
      { value: 'goals', label: 'Goals' },
      { value: 'assists', label: 'Assists' },
      { value: 'games', label: 'Games Played' }
    ],
    goalies: [
      { value: 'gaa', label: 'GAA' },
      { value: 'savePercentage', label: 'Save %' },
      { value: 'shutouts', label: 'Shutouts' },
      { value: 'wins', label: 'Wins' }
    ]
  };

  // Get appropriate categories for current player type
  const availableCategories = categories[playerType] || categories.skaters;

  return (
    <CategoryContainer>
      <CategoryTitle>STAT CATEGORY</CategoryTitle>
      <CategoryButtons>
        {availableCategories.map((cat) => (
          <CategoryButton 
            key={cat.value}
            active={category === cat.value}
            onClick={() => setCategory(cat.value)}
          >
            {cat.label}
          </CategoryButton>
        ))}
      </CategoryButtons>
    </CategoryContainer>
  );
};

const CategoryContainer = styled.div`
  margin-bottom: 20px;
`;

const CategoryTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
  letter-spacing: 1px;
`;

const CategoryButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const CategoryButton = styled.button`
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#1e88e5' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.active ? '#1976d2' : '#f5f5f5'};
  }
`;

export default StatsCategorySelector; 