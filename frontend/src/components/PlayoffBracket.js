import React from 'react';
import styled from 'styled-components';
import { Droppable, Draggable } from 'react-beautiful-dnd';

const BracketContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
  overflow-x: auto;
  background-color: #121212;
  border-radius: 8px;
`;

const Round = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  min-width: 220px;
  margin: 0 10px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: -15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background-color: #333;
  }
  
  &:last-child::after {
    display: none;
  }
`;

const RoundTitle = styled.h3`
  color: #C4CED4;
  text-align: center;
  margin-bottom: 20px;
`;

const Matchup = styled.div`
  background-color: #252525;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: -15px;
    top: 50%;
    width: 15px;
    height: 2px;
    background-color: #333;
  }
`;

const EmptyMatchupSlot = styled.div`
  background-color: #1e1e1e;
  border: 2px dashed #333;
  border-radius: 8px;
  padding: 15px;
  margin: 10px 0;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-style: italic;
`;

const TeamSlot = styled.div`
  background-color: ${props => props.isDragging ? '#2a3f52' : props.isDropping ? '#1e3f52' : '#1e1e1e'};
  border: 2px solid ${props => props.isDragging ? '#4a89dc' : props.isDropping ? '#4a89dc' : '#333'};
  border-radius: 4px;
  padding: 8px;
  margin-bottom: ${props => props.isFirst ? '8px' : '0'};
  cursor: ${props => props.team ? 'grab' : 'default'};
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.team ? '#2a3f52' : '#1e1e1e'};
    border-color: ${props => props.team ? '#4a89dc' : '#333'};
  }
`;

const TeamContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TeamLogo = styled.img`
  width: 24px;
  height: 24px;
  object-fit: contain;
  flex-shrink: 0;
`;

const TeamInfo = styled.div`
  flex-grow: 1;
`;

const TeamName = styled.div`
  color: ${props => props.isWinner ? '#fff' : '#aaa'};
  font-weight: ${props => props.isWinner ? 'bold' : 'normal'};
  font-size: 14px;
`;

const TeamRecord = styled.div`
  color: #666;
  font-size: 12px;
`;

const TeamSeed = styled.div`
  color: #666;
  font-size: 12px;
  padding: 2px 6px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
`;

const PlayoffBracket = ({ teams = [] }) => {
  const rounds = [
    { name: 'First Round', matchups: 8 },
    { name: 'Second Round', matchups: 4 },
    { name: 'Conference Finals', matchups: 2 },
    { name: 'Stanley Cup Final', matchups: 1 }
  ];

  const renderTeamSlot = (roundIndex, matchupIndex, position, team) => {
    const slotId = `playoffSpot-${roundIndex}-${matchupIndex}-${position}`;
    const seed = matchupIndex * 2 + (position === 'top' ? 1 : 2);

    return (
      <Droppable droppableId={slotId} key={slotId}>
        {(provided, snapshot) => (
          <TeamSlot
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDropping={snapshot.isDraggingOver}
            isFirst={position === 'top'}
            team={team}
          >
            {team ? (
              <Draggable draggableId={`playoff-team-${team.id}`} index={0}>
                {(provided, snapshot) => (
                  <TeamContent
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    isDragging={snapshot.isDragging}
                  >
                    <TeamLogo src={team.logo_url || '/placeholder-team-logo.png'} alt={team.name} />
                    <TeamInfo>
                      <TeamName>{team.name}</TeamName>
                      <TeamRecord>{team.record || '0-0-0'}</TeamRecord>
                    </TeamInfo>
                    <TeamSeed>#{seed}</TeamSeed>
                  </TeamContent>
                )}
              </Draggable>
            ) : (
              <TeamContent>
                <TeamInfo>
                  <TeamName>Empty Slot</TeamName>
                  <TeamRecord>Drag team here</TeamRecord>
                </TeamInfo>
                <TeamSeed>#{seed}</TeamSeed>
              </TeamContent>
            )}
            {provided.placeholder}
          </TeamSlot>
        )}
      </Droppable>
    );
  };

  const renderMatchup = (roundIndex, matchupIndex) => {
    if (roundIndex === 0) {
      // First round matchups with draggable slots
      return (
        <Matchup key={`${roundIndex}-${matchupIndex}`}>
          {renderTeamSlot(roundIndex, matchupIndex, 'top', teams[matchupIndex * 2])}
          {renderTeamSlot(roundIndex, matchupIndex, 'bottom', teams[matchupIndex * 2 + 1])}
        </Matchup>
      );
    }

    // Future rounds show empty slots or advancing teams
    return (
      <EmptyMatchupSlot key={`${roundIndex}-${matchupIndex}`}>
        Winner of previous matchup
      </EmptyMatchupSlot>
    );
  };

  return (
    <BracketContainer>
      {rounds.map((round, roundIndex) => (
        <Round key={round.name}>
          <RoundTitle>{round.name}</RoundTitle>
          {Array(round.matchups).fill(null).map((_, matchupIndex) => (
            renderMatchup(roundIndex, matchupIndex)
          ))}
        </Round>
      ))}
    </BracketContainer>
  );
};

export default PlayoffBracket; 