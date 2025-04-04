import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const GameSimulation = () => {
  return (
    <Container>
      <Title>Game Simulation</Title>
      <p>This page will allow you to simulate games and view results.</p>
      
      <div className="card">
        <div className="card-header">Feature Currently in Development</div>
        <div className="card-body">
          <p>The Game Simulation feature is currently being developed. Check back soon!</p>
        </div>
      </div>
    </Container>
  );
};

export default GameSimulation;
