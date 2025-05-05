import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check for environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing Supabase credentials. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are defined in your .env file.'
  );
} else {
  console.log('Supabase URL configured for PlayerCreation');
}

const supabase = createClient(
  supabaseUrl || 'https://your-supabase-url.supabase.co',
  supabaseKey || 'your-supabase-anon-key'
);

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  color: #C4CED4;
  margin-bottom: 20px;
`;

const OptionsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-top: 30px;
`;

const OptionCard = styled.div`
  flex: 1;
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  }
`;

const OptionIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 20px;
  color: #B30E16;
`;

const OptionTitle = styled.h2`
  color: white;
  margin-bottom: 10px;
`;

const OptionDescription = styled.p`
  color: #C4CED4;
  margin-bottom: 20px;
`;

const ActionButton = styled.button`
  padding: 10px 15px;
  background-color: #B30E16;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #950b12;
  }
`;

const BackButton = styled.button`
  padding: 8px 15px;
  background-color: #2a2a2a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 20px;
  
  &:hover {
    background-color: #333;
  }
`;

const PlayerCreation = () => {
  const handleBackClick = () => {
    window.location.href = '/players';
  };
  
  const handleCreatePlayer = () => {
    window.location.href = '/player-editor/new';
  };
  
  const handleCreateGoalie = () => {
    window.location.href = '/player-editor/new?isGoalie=true';
  };
  
  return (
    <Container>
      <BackButton onClick={handleBackClick}>← Back to Player Management</BackButton>
      <Title>Create New Player</Title>
      
      <OptionsContainer>
        <OptionCard onClick={handleCreatePlayer}>
          <OptionIcon>🏒</OptionIcon>
          <OptionTitle>Create Player</OptionTitle>
          <OptionDescription>
            Create a new skater with attributes focused on skating, shooting, 
            hands, checking, defense, and physical skills.
          </OptionDescription>
          <ActionButton>Create Player</ActionButton>
        </OptionCard>
        
        <OptionCard onClick={handleCreateGoalie}>
          <OptionIcon>🥅</OptionIcon>
          <OptionTitle>Create Goalie</OptionTitle>
          <OptionDescription>
            Create a new goaltender with attributes focused on positioning, 
            reflexes, puck handling, agility, and mental toughness.
          </OptionDescription>
          <ActionButton>Create Goalie</ActionButton>
        </OptionCard>
      </OptionsContainer>
    </Container>
  );
};

export default PlayerCreation; 