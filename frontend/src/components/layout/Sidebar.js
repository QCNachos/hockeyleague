import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const SidebarContainer = styled.nav`
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  height: 100%;
  overflow-y: auto;
`;

const NavSection = styled.div`
  margin-bottom: 20px;
  
  h3 {
    color: #B30E16;
    padding: 0 20px;
    margin-bottom: 10px;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    cursor: pointer;
    
    span {
      margin-right: auto;
    }
  }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: #C4CED4;
  text-decoration: none;
  transition: background-color 0.2s, color 0.2s;
  
  &:hover {
    background-color: #2a2a2a;
    color: #fff;
  }
  
  &.active {
    background-color: #2a2a2a;
    color: #B30E16;
    border-left: 3px solid #B30E16;
  }
  
  span {
    margin-left: 10px;
  }
`;

const SubNavLink = styled(StyledNavLink)`
  padding-left: 35px;
  font-size: 0.95em;
`;

const DisabledNavLink = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: #666;
  text-decoration: none;
  cursor: not-allowed;
  
  &:after {
    content: ' (Coming Soon)';
    margin-left: 5px;
    font-size: 0.9em;
    color: #555;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #333;
  margin: 15px 0;
`;

const NavContent = styled.div`
  max-height: ${props => props.isOpen ? '500px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
`;

const Sidebar = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [sections, setSections] = useState({
    general: true,
    management: true,
    gameModes: true,
    analytics: true,
    admin: true
  });

  const toggleSection = (section) => {
    setSections({
      ...sections,
      [section]: !sections[section]
    });
  };
  
  return (
    <SidebarContainer>
      <NavSection>
        <h3 onClick={() => toggleSection('general')}>
          <span>General</span>
          {sections.general ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
        </h3>
        <NavContent isOpen={sections.general}>
          <StyledNavLink to="/">Dashboard</StyledNavLink>
          <StyledNavLink to="/calendar">Calendar</StyledNavLink>
        </NavContent>
      </NavSection>
      
      <NavSection>
        <h3 onClick={() => toggleSection('gameModes')}>
          <span>Game Modes</span>
          {sections.gameModes ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
        </h3>
        <NavContent isOpen={sections.gameModes}>
          <StyledNavLink to="/franchise">Franchise Mode</StyledNavLink>
          <StyledNavLink to="/be-a-pro">Be a Pro Mode</StyledNavLink>
          <StyledNavLink to="/season">Season Mode</StyledNavLink>
          <StyledNavLink to="/tournaments">Tournaments</StyledNavLink>
          <DisabledNavLink>Owner Mode</DisabledNavLink>
        </NavContent>
      </NavSection>
      
      <NavSection>
        <h3 onClick={() => toggleSection('management')}>
          <span>Management</span>
          {sections.management ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
        </h3>
        <NavContent isOpen={sections.management}>
          <StyledNavLink to="/players">Players</StyledNavLink>
          <StyledNavLink to="/teams">Teams</StyledNavLink>
          <StyledNavLink to="/lines">Line Combinations</StyledNavLink>
          <StyledNavLink to="/asset-movement">Asset Movement</StyledNavLink>
        </NavContent>
      </NavSection>
      
      <NavSection>
        <h3 onClick={() => toggleSection('analytics')}>
          <span>Analytics</span>
          {sections.analytics ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
        </h3>
        <NavContent isOpen={sections.analytics}>
          <StyledNavLink to="/stats">Statistics</StyledNavLink>
          <StyledNavLink to="/standings">Standings</StyledNavLink>
        </NavContent>
      </NavSection>
      
      {isAuthenticated && (
        <>
          <Divider />
          <NavSection>
            <h3 onClick={() => toggleSection('admin')}>
              <span>Admin Tools</span>
              {sections.admin ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
            </h3>
            <NavContent isOpen={sections.admin}>
              <StyledNavLink to="/contracts">Contracts</StyledNavLink>
              <StyledNavLink to="/draft">Draft</StyledNavLink>
            </NavContent>
          </NavSection>
        </>
      )}
    </SidebarContainer>
  );
};

export default Sidebar;
