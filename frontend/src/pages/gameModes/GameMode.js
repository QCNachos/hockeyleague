import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  color: #C4CED4;
`;

const Description = styled.p`
  margin-bottom: 30px;
  color: #aaa;
  line-height: 1.6;
`;

const ActionButton = styled(Link)`
  display: inline-block;
  background-color: #B30E16;
  color: white;
  padding: 15px 30px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;
  font-size: 1.2rem;
  margin-top: 20px;
  
  &:hover {
    background-color: #950b12;
  }
`;

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 60px;
`;

const GameIllustration = styled.div`
  width: 300px;
  height: 300px;
  background-color: #1e1e1e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  position: relative;
  
  &:before, &:after {
    content: '';
    position: absolute;
    background-color: #B30E16;
    border-radius: 50%;
  }
  
  &:before {
    width: 100px;
    height: 100px;
    top: 50px;
    left: 50px;
  }
  
  &:after {
    width: 100px;
    height: 100px;
    bottom: 50px;
    right: 50px;
  }
`;

const GameMode = () => {
  return (
    <Container>
      <Title>Quick Game</Title>
      <Description>
        Jump right into the action with a single match between any two teams of your choice.
        Select your teams, customize game settings, and choose your preferred play style from
        real-time gameplay to fast simulation. Perfect for when you want to play a quick match
        without the commitment of a full season or franchise.
      </Description>
      
      <CenteredContainer>
        <GameIllustration />
        <ActionButton to="/game/pre-game">
          Start Game Setup
        </ActionButton>
      </CenteredContainer>
    </Container>
  );
};

export default GameMode; 