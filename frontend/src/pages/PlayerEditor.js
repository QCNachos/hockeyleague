import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const PlayerEditor = () => {
  return (
    <Container>
      <Title>Player Editor</Title>
      <p>This page will allow you to create and edit player profiles.</p>
      
      <div className="card">
        <div className="card-header">Feature Currently in Development</div>
        <div className="card-body">
          <p>The Player Editor feature is currently being developed. Check back soon!</p>
        </div>
      </div>
    </Container>
  );
};

export default PlayerEditor;
