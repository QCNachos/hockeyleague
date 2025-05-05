import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import { setCommunityPack, selectCommunityPack, toggleCommunityPack } from '../../store/slices/settingsSlice';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  padding: 10px;
  background-color: #1e1e1e;
  border-radius: 8px;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  cursor: pointer;
  user-select: none;
  color: #C4CED4;
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 50px;
  height: 24px;
  background-color: ${props => props.isActive ? '#B30E16' : '#333'};
  border-radius: 12px;
  transition: background-color 0.2s;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.isActive ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.2s;
  }
`;

const InfoText = styled.div`
  margin-top: 5px;
  font-size: 0.8rem;
  color: #999;
`;

const CommunityPackToggle = () => {
  const dispatch = useDispatch();
  const communityPack = useSelector(selectCommunityPack);
  
  const handleToggle = () => {
    dispatch(toggleCommunityPack());
  };
  
  return (
    <ToggleContainer>
      <ToggleLabel onClick={handleToggle}>
        <span>Team Logos {communityPack === 1 ? 'Enabled' : 'Disabled'}</span>
        <ToggleSwitch isActive={communityPack === 1} />
      </ToggleLabel>
      <InfoText>
        {communityPack === 1 
          ? 'Team logos are currently displayed in the application.' 
          : 'Team logos are currently hidden in the application.'}
      </InfoText>
    </ToggleContainer>
  );
};

export default CommunityPackToggle; 