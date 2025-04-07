import React from 'react';
import styled from 'styled-components';
import { Droppable, Draggable } from 'react-beautiful-dnd';

const Container = styled.div`
  background-color: #121212;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  color: #C4CED4;
  margin-bottom: 15px;
`;

const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding: 10px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1e1e1e;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
    
    &:hover {
      background: #444;
    }
  }
`;

const TeamCard = styled.div`
  background-color: ${props => props.isDragging ? '#2a3f52' : '#1e1e1e'};
  border: 2px solid ${props => props.isDragging ? '#4a89dc' : '#333'};
  border-radius: 4px;
  padding: 10px;
  cursor: grab;
  transition: all 0.2s;
  
  &:hover {
    background-color: #2a3f52;
    border-color: #4a89dc;
  }
`;

const TeamContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TeamLogo = styled.img`
  width: 32px;
  height: 32px;
  object-fit: contain;
`;

const TeamInfo = styled.div`
  flex-grow: 1;
`;

const TeamName = styled.div`
  color: #fff;
  font-size: 14px;
  font-weight: 500;
`;

const TeamDetails = styled.div`
  color: #666;
  font-size: 12px;
`;

const ConferenceTitle = styled.h4`
  color: #C4CED4;
  margin: 15px 0 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #333;
`;

const TeamSelector = ({ teams }) => {
  // Group teams by conference
  const groupedTeams = teams.reduce((acc, team) => {
    const conference = team.conference || 'Other';
    if (!acc[conference]) {
      acc[conference] = [];
    }
    acc[conference].push(team);
    return acc;
  }, {});

  return (
    <Container>
      <Title>Available Teams</Title>
      {Object.entries(groupedTeams).map(([conference, conferenceTeams], conferenceIndex) => (
        <div key={conference}>
          <ConferenceTitle>{conference}</ConferenceTitle>
          <Droppable droppableId={`conference-${conference}`}>
            {(provided, snapshot) => (
              <TeamsGrid
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {conferenceTeams.map((team, index) => (
                  <Draggable
                    key={team.id}
                    draggableId={`available-team-${team.id}`}
                    index={conferenceIndex * 1000 + index} // Ensure unique indices across conferences
                  >
                    {(provided, snapshot) => (
                      <TeamCard
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        isDragging={snapshot.isDragging}
                      >
                        <TeamContent>
                          <TeamLogo src={team.logo_url || '/placeholder-team-logo.png'} alt={team.name} />
                          <TeamInfo>
                            <TeamName>{team.name}</TeamName>
                            <TeamDetails>
                              {team.division} Division
                            </TeamDetails>
                          </TeamInfo>
                        </TeamContent>
                      </TeamCard>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </TeamsGrid>
            )}
          </Droppable>
        </div>
      ))}
    </Container>
  );
};

export default TeamSelector; 