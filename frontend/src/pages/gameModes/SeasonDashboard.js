import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import * as seasonService from '../../services/seasonService';
import { useSelector } from 'react-redux';
import { selectCommunityPack } from '../../store/slices/settingsSlice';
import PlayerSilhouette from '../../assets/Player_silouette.png';

// Import team logos for NHL teams
import ANA from '../../assets/Logo_ANA.png';
import BOS from '../../assets/Logo_BOS.png';
import BUF from '../../assets/Logo_BUF.png';
import CAR from '../../assets/Logo_CAR.png';
import CBJ from '../../assets/Logo_CBJ.png';
import CGY from '../../assets/Logo_CGY.png';
import CHI from '../../assets/Logo_CHI.png';
import COL from '../../assets/Logo_COL.png';
import DAL from '../../assets/Logo_DAL.png';
import DET from '../../assets/Logo_DET.png';
import EDM from '../../assets/Logo_EDM.png';
import FLA from '../../assets/Logo_FLA.png';
import LAK from '../../assets/Logo_LAK.png';
import MIN from '../../assets/Logo_MIN.png';
import MTL from '../../assets/Logo_MTL.png';
import NJD from '../../assets/Logo_NJD.png';
import NSH from '../../assets/Logo_NSH.png';
import NYI from '../../assets/Logo_NYI.png';
import NYR from '../../assets/Logo_NYR.png';
import OTT from '../../assets/Logo_OTT.png';
import PHI from '../../assets/Logo_PHI.png';
import PIT from '../../assets/Logo_PIT.png';
import SEA from '../../assets/Logo_SEA.png';
import SJS from '../../assets/Logo_SJS.png';
import STL from '../../assets/Logo_STL.png';
import TBL from '../../assets/Logo_TBL.png';
import TOR from '../../assets/Logo_TOR.png';
import VAN from '../../assets/Logo_VAN.png';
import VGK from '../../assets/Logo_VGK.png';
import WPG from '../../assets/Logo_WPG.png';
import WSH from '../../assets/Logo_WSH.png';
import UTA from '../../assets/Logo_UTA.png';
import AHL from '../../assets/AHL.png';
import ECHL from '../../assets/ECHL.png';

// Import all components for direct embedding
import Calendar from '../../pages/Calendar';
import LineCombinations from '../../pages/LineCombinations';
import Statistics from '../../pages/Statistics';
import Standings from '../../pages/Standings';
import AssetMovement from '../../pages/AssetMovement';
import Awards from '../../pages/Awards';

// Create a mapping of team abbreviations to logo images
const teamLogos = {
  ANA, BOS, BUF, CAR, CBJ, CGY, CHI, COL, DAL, DET, 
  EDM, FLA, LAK, MIN, MTL, NJD, NSH, NYI, NYR, OTT, 
  PHI, PIT, SEA, SJS, STL, TBL, TOR, VAN, VGK, WPG, WSH, UTA,
  AHL, ECHL
};

// Custom layout container for Season Dashboard that doesn't include the main app sidebar
const SeasonLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  background-color: #121212;
  color: #ffffff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999; /* Ensure it displays above other content */
`;

// Styled components
const PageContainer = styled.div`
  display: grid;
  grid-template-columns: 15% 65% 20%;
  width: 100%;
  min-height: 100vh;
  height: 100vh; /* Set explicit height */
  background-color: #1e1e1e;
  overflow: hidden; /* Prevent scrolling on the container */
`;

const Sidebar = styled.div`
  background-color: #1a1a1a;
  color: #C4CED4;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333;
  overflow-y: auto;
  height: 100vh;
`;

const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #333;
  display: flex;
  flex-direction: column;
  
  h2 {
    margin: 0 0 10px 0;
    color: #fff;
  }
  
  .franchise-info {
    font-size: 12px;
    color: #aaa;
    display: flex;
    align-items: center;
    
    img {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }
  }
`;

const SidebarTeamInfo = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #222;
  border-bottom: 1px solid #333;
`;

const TeamLogo = styled.div`
  width: 50px;
  height: 50px;
  background-color: ${props => props.bgColor || 'transparent'};
  border-radius: 50%;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.textColor || 'white'};
  background-image: ${props => props.logoUrl ? `url(${props.logoUrl})` : 'none'};
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
`;

const TeamName = styled.div`
  h3 {
    margin: 0;
    font-size: 14px;
  }
  
  p {
    margin: 2px 0 0;
    font-size: 12px;
    color: #aaa;
  }
`;

const SeasonInfo = styled.div`
  padding: 10px 20px;
  font-size: 12px;
  color: #aaa;
  background-color: #222;
  border-bottom: 1px solid #333;
  
  p {
    margin: 5px 0;
    display: flex;
    justify-content: space-between;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
`;

const NavItem = styled.li`
  border-bottom: 1px solid #2a2a2a;
  
  a, div {
    display: block;
    padding: 14px 20px;
    color: ${props => props.active ? '#fff' : '#aaa'};
    background-color: ${props => props.active ? '#252525' : 'transparent'};
    border-left: 4px solid ${props => props.active ? '#B30E16' : 'transparent'};
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: #252525;
      color: #fff;
    }
  }
`;

// Add new CollapsibleSection component
const CollapsibleSection = styled.div`
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 20px;
    color: ${props => props.active ? '#fff' : '#aaa'};
    background-color: ${props => props.active ? '#252525' : 'transparent'};
    border-left: 4px solid ${props => props.active ? '#B30E16' : 'transparent'};
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 1px solid #2a2a2a;
    
    &:hover {
      background-color: #252525;
      color: #fff;
    }
    
    .toggle-icon {
      transition: transform 0.3s ease;
      transform: ${props => props.expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
    }
  }
  
  .section-content {
    max-height: ${props => props.expanded ? '500px' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease;
    background-color: #1d1d1d;
    
    .task-item {
      display: flex;
      align-items: center;
      padding: 10px 20px 10px 48px;
      color: #aaa;
      border-bottom: 1px solid #2a2a2a;
      cursor: pointer;
      
      &:hover {
        background-color: #252525;
        color: #fff;
      }
      
      .task-status {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        margin-right: 10px;
        border: 1px solid #555;
        
        &.completed {
          background-color: #295438;
          border-color: #295438;
        }
        
        &.in-progress {
          background-color: #B36C00;
          border-color: #B36C00;
        }
        
        &.not-started {
          background-color: transparent;
        }
      }
      
      &.see-more {
        justify-content: center;
        padding-top: 12px;
        padding-bottom: 12px;
        background-color: #1a1a1a;
        
        span {
          text-decoration: none;
          cursor: pointer;
          
          &:hover {
            text-decoration: underline;
          }
        }
        
        &:hover {
          background-color: #202020;
        }
      }
    }
  }
`;

const SidebarFooter = styled.div`
  padding: 15px 20px;
  border-top: 1px solid #333;
  display: flex;
  flex-direction: column;
  
  .franchise-quicklinks {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    
    button {
      flex: 1;
      background-color: #252525;
      color: #C4CED4;
      border: 1px solid #333;
      border-radius: 4px;
      padding: 8px 5px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        margin-right: 4px;
        width: 14px;
        height: 14px;
      }
      
      &:hover {
        background-color: #2a2a2a;
        transform: translateY(-2px);
      }
    }
  }
  
  .primary-buttons {
  display: flex;
  justify-content: space-between;
    gap: 10px;
  }
`;

const FooterButton = styled.button`
  background-color: ${props => props.primary ? '#B30E16' : '#333'};
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 5px;
    width: 14px;
    height: 14px;
  }
  
  &:hover {
    background-color: ${props => props.primary ? '#950b12' : '#444'};
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const MainContent = styled.div`
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  background: #1e1e1e;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: url('https://via.placeholder.com/1200x200') no-repeat center top;
    background-size: cover;
    opacity: 0.1;
    pointer-events: none;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 24px;
    background-color: #B30E16;
    margin-right: 10px;
    border-radius: 2px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#B30E16' : '#333'};
  color: white;
  padding: 10px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.primary ? '#950b12' : '#444'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  svg {
    margin-right: 6px;
  }
`;

const ContentArea = styled.div`
  background-color: rgba(30, 30, 30, 0.7);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden; /* Prevent scrollbars from appearing unnecessarily */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid #333;
  z-index: 1;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 50px 0;
  
  h3 {
    margin-bottom: 10px;
    color: #C4CED4;
  }
  
  p {
    color: #aaa;
    margin-bottom: 20px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const Card = styled.div`
  background-color: #252525;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
  margin-bottom: 20px;
`;

// Add these new styled components after the existing Card component
const MatchupCard = styled.div`
  background-color: #1d2330;
  border-radius: 8px;
  padding: 18px; /* Reduced from 20px */
  margin-bottom: 18px; /* Reduced from 20px */
  border: 1px solid #333;
`;

const MatchupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px; /* Reduced from 15px */
  
  h3 {
    margin: 0;
    color: #C4CED4;
    font-size: 18px;
  }
  
  span {
    color: #B30E16;
    font-weight: bold;
  }
`;

const MatchupTeams = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px; /* Reduced from 15px */
`;

const MatchupTeam = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 120px;
  
  img {
    width: 70px;
    height: 70px;
    object-fit: contain;
    margin-bottom: 10px;
  }
  
  h4 {
    margin: 0;
    color: #fff;
    font-size: 16px;
  }
  
  p {
    margin: 5px 0 0;
    color: #aaa;
    font-size: 14px;
  }
`;

const VersusContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0 15px;
  
  span {
    font-size: 24px;
    font-weight: bold;
    color: #fff;
    margin-bottom: 10px;
  }
  
  p {
    color: #aaa;
    font-size: 12px;
    margin: 0;
  }
`;

const StatComparison = styled.div`
  margin-top: 16px; /* Reduced from 20px */
  padding-top: 14px; /* Reduced from 15px */
  border-top: 1px solid #333;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px; /* Reduced from 8px */
  
  .stat-label {
    color: #aaa;
    flex: 1;
    text-align: center;
  }
  
  .home-stat {
    color: #fff;
    width: 25%;
    text-align: right;
    font-weight: ${props => props.highlight === 'home' ? 'bold' : 'normal'};
  }
  
  .away-stat {
    color: #fff;
    width: 25%;
    text-align: left;
    font-weight: ${props => props.highlight === 'away' ? 'bold' : 'normal'};
  }
`;

// Add these new styled components for the calendar
const CalendarContainer = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 0;
  margin-top: 20px;
  overflow: hidden;
`;

const CalendarHeader = styled.div`
  background-color: #252525;
  padding: 15px 20px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  h2 {
    margin: 0;
    color: #C4CED4;
    font-size: 18px;
  }
`;

const MonthNavigation = styled.div`
  display: flex;
  align-items: center;
  
  span {
    margin: 0 15px;
    font-weight: bold;
    color: #fff;
  }
  
  button {
    background-color: #333;
    border: none;
    color: #fff;
    width: 30px;
    height: 30px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background-color: #444;
    }
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 10px;
  gap: 2px;
`;

const WeekdayHeader = styled.div`
  text-align: center;
  color: #888;
  font-size: 12px;
  padding: 10px 0;
  text-transform: uppercase;
`;

const DateCell = styled.div`
  height: 60px;
  background-color: ${props => props.isToday ? '#252932' : props.isActive ? '#1d2330' : '#262626'};
  border-left: ${props => props.hasGame ? '4px solid #B30E16' : 'none'};
  padding: 8px;
  position: relative;
  
  .date-number {
    font-size: 14px;
    font-weight: ${props => props.isToday ? 'bold' : 'normal'};
    color: ${props => props.isToday ? '#fff' : props.isCurrentMonth ? '#C4CED4' : '#666'};
  }
  
  .game-indicator {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.isHomeGame ? '#B30E16' : '#4A90E2'};
    display: ${props => props.hasGame ? 'block' : 'none'};
  }
  
  .game-info {
    font-size: 10px;
    color: #aaa;
    margin-top: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

// Add new styled component for quick links
const QuickLinks = styled.div`
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
`;

const QuickLinkButton = styled.button`
  background-color: #252525;
  border: 1px solid #333;
  border-radius: 4px;
  color: #C4CED4;
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  font-size: 13px;
  
  svg {
    margin-right: 8px;
    color: ${props => props.primary ? '#B30E16' : '#888'};
  }
  
  &:hover {
    background-color: #2a2a2a;
    transform: translateY(-2px);
  }
`;

// Create improved matchup components
const MatchupDetails = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 28px; /* Reduced from 30px */
`;

const MatchupSubHeader = styled.div`
  text-transform: uppercase;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  padding: 11px 0; /* Reduced from 12px */
  background-color: #252932;
  margin-bottom: 13px; /* Reduced from 15px */
  border-radius: 4px;
`;

const GoalieComparison = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px; /* Reduced from 20px */
`;

const GoalieCard = styled.div`
  display: flex;
  align-items: center;
  background-color: #252932;
  border-radius: 8px;
  padding: 13px; /* Reduced from 15px */
  
  .goalie-photo {
    width: 64px; /* Reduced from 70px */
    height: 68px; /* Reduced from 70px */
    border-radius: 50%;
    object-fit: cover;
    margin-right: 13px; /* Reduced from 15px */
    border: 2px solid ${props => props.primary ? '#B30E16' : '#333'};
  }
  
  .goalie-info {
    flex: 1;
    
    h4 {
      font-size: 15px; /* Reduced from 16px */
      margin: 0 0 4px 0; /* Reduced from 5px */
      color: #fff;
      display: flex;
      align-items: center;
      
      .number {
        background: #333;
        border-radius: 4px;
        padding: 1px 4px;
        margin-right: 6px;
        font-size: 12px; /* Reduced from 12px */
      }
    }
    
    .goalie-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 4px 12px; /* Reduced from 5px 15px */
      margin-top: 8px; /* Reduced from 10px */
      
      .stat-row {
        display: flex;
        justify-content: space-between;
        
        .stat-label {
          color: #888;
          font-size: 11px; /* Reduced from 12px */
        }
        
        .stat-value {
          color: #fff;
          font-size: 11px; /* Reduced from 12px */
          font-weight: bold;
        }
      }
    }
  }
`;

const TeamLeaders = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px; /* Reduced from 20px */
  margin-top: 16px; /* Reduced from 20px */
`;

const LeaderCard = styled.div`
  background-color: #252932;
  border-radius: 8px;
  padding: 12px; /* Reduced from 15px */
  
  h4 {
    color: #C4CED4;
    margin: 0 0 10px 0; /* Reduced from 12px */
    font-size: 13px; /* Reduced from 14px */
    text-transform: uppercase;
  }
  
  .leader-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px; /* Reduced from 10px */
    
    img {
      width: 28px; /* Reduced from 32px */
      height: 28px; /* Reduced from 32px */
      border-radius: 50%;
      margin-right: 8px; /* Reduced from 10px */
    }
    
    .leader-info {
      flex: 1;
      
      .leader-name {
        color: #fff;
        font-size: 13px; /* Reduced from 14px */
        margin: 0;
      }
      
      .leader-position {
        color: #888;
        font-size: 11px; /* Reduced from 12px */
        margin: 0;
      }
    }
    
    .leader-stat {
      color: #B30E16;
      font-weight: bold;
      font-size: 15px; /* Reduced from 16px */
      margin-left: 8px; /* Reduced from 10px */
    }
  }
  
  .leader-section-title {
    color: #94a3b8;
    font-size: 11px; /* Reduced from 12px */
    margin: 12px 0 8px 0; /* Reduced from 15px 0 10px 0 */
    border-top: 1px solid #333;
    padding-top: 8px; /* Reduced from 10px */
    text-transform: uppercase;
    font-weight: bold;
  }
`;

const PointsLeaderSection = styled.div`
  background-color: #1d2330;
  border-radius: 0 0 8px 8px;
  padding: 12px 20px;
  margin-top: auto; /* Push to bottom */
  overflow: hidden;
  white-space: nowrap;
  position: sticky;
  bottom: 0;
  border-top: 1px solid #333;
  
  .points-scrolling {
    animation: scroll-left 30s linear infinite;
    display: inline-block;
    white-space: nowrap;
    
    @keyframes scroll-left {
      0% { transform: translateX(100%); }
      100% { transform: translateX(-100%); }
    }
  }
  
  span {
    font-size: 14px;
    color: #C4CED4;
    margin-right: 20px;
    
    strong {
      color: #fff;
    }
  }
`;

// Add a custom scroll component
const CustomScrollArea = styled.div`
  overflow-y: auto;
  flex: 1;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

// Add the MatchupSidebar styled component
const MatchupSidebar = styled.div`
  background-color: #1a1a1a;
  padding: 20px;
  border-left: 1px solid #333;
  overflow-y: auto; /* Change back to auto to allow the sidebar to scroll */
  height: 99vh; /* Changed from 100vh to 99vh */
  display: flex;
  flex-direction: column;
  
  h3 {
    color: #C4CED4;
    font-size: 16px;
  }
`;

// Add a function to get team logo based on abbreviation
const getTeamLogo = (abbreviation) => {
  if (!abbreviation) return null;
  const normalizedAbbr = abbreviation.trim().toUpperCase();
  return teamLogos[normalizedAbbr] || null;
};

// Add a new styled component for the week view calendar
const WeekViewCalendar = styled.div`
  width: 100%;
  background-color: #0E1A33; /* Darker navy blue background */
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
  border: 1px solid #1E3A67; /* Slightly lighter blue for borders */
  min-height: 190px; /* Increased height to match screenshot */
`;

const WeekCalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #102040; /* Darker blue for header */
  border-bottom: 1px solid #1E3A67;
  
  h2 {
    margin: 0;
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  
  .calendar-date {
    color: #94a3b8;
    font-size: 16px;
  }
`;

const CalendarDays = styled.div`
  display: flex;
  width: 100%;
  height: 150px; /* Much taller calendar days container */
`;

const WeekDay = styled.div`
  flex: 1;
  text-align: center;
  padding: 12px 4px;
  position: relative;
  background-color: ${props => props.active ? '#102D57' : 'transparent'};
  border-right: 1px solid #1E3A67;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Align content to the top */
  min-height: 150px; /* Increased height to match screenshot */
  
  &:last-child {
    border-right: none;
  }
  
  .day-name {
    font-size: 13px;
    color: #7D8597;
    text-transform: uppercase;
    margin-bottom: 5px;
    z-index: 1;
    position: relative;
  }
  
  .day-number {
    font-size: 18px;
    font-weight: ${props => props.active ? 'bold' : '500'};
    color: #fff;
    margin-bottom: 6px;
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .active-day-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background-color: #fff;
    display: ${props => props.active ? 'block' : 'none'};
  }
  
  .game-indicator {
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    background-color: ${props => props.isHomeGame ? '#bd3039' : '#3d78e3'};
    border-radius: 50%;
    display: ${props => props.hasGame ? 'block' : 'none'};
  }
  
  .game-info {
    margin-top: 12px; /* Increased spacing */
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    z-index: 1;
    
    .team-logo {
      width: 35px; /* Bigger team logos */
      height: 35px;
      object-fit: contain;
    }
    
    .vs {
      margin: 0 2px;
      font-size: 10px;
      color: #7D8597;
    }
  }
  
  .game-result {
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    margin-top: 10px;
  }
  
  .team-level-indicator {
    position: absolute;
    top: 5px;
    right: 5px;
    display: inline-block;
    
    img {
      width: 24px; /* 30% smaller than the 35px team logos */
      height: 24px;
      object-fit: contain;
    }
  }
  
  .league-logo {
    width: 35px;
    height: 35px;
    margin: 12px auto 0; /* Center the logo and place it vertically centered */
  }
`;

// Create a more compact MatchupCard specifically for the sidebar
const SidebarMatchupCard = styled.div`
  background-color: #252932;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #333;
  
  h3 {
    margin: 0 0 15px 0;
    color: #C4CED4;
    font-size: 16px;
    text-align: center;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
  }
`;

// Update StandingsContainer styling to allow for division rotation arrows
const StandingsContainer = styled.div`
  background-color: #252932;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #333;
  height: calc(35% - 15px); /* Reduce height to accommodate League standings */
  overflow-y: auto;
  
  h3 {
    margin: 0 0 15px 0;
    color: #C4CED4;
    font-size: 16px;
    text-align: center;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    
    .division-arrows {
      position: absolute;
      right: 0;
      display: flex;
      
      button {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        font-size: 14px;
        padding: 0 5px;
        
        &:hover {
          color: #fff;
        }
      }
    }
  }
  
  .standings-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
    
    th, td {
      padding: 6px 8px;
      text-align: left;
    }
    
    th {
      color: #aaa;
      font-weight: normal;
      text-transform: uppercase;
      border-bottom: 1px solid #333;
    }
    
    td {
      color: #fff;
      border-bottom: 1px solid #222;
    }
    
    .team {
      display: flex;
      align-items: center;
      
      img {
        width: 20px;
        height: 20px;
        margin-right: 8px;
      }
    }
    
    .highlight {
      font-weight: bold;
      color: #B30E16;
    }
  }
`;

// Add new component for League Standings
const LeagueStandingsContainer = styled.div`
  background-color: #252932;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #333;
  min-height: 155px; /* Fixed height for standings */
  flex-shrink: 0; /* Prevent shrinking */
  overflow-y: hidden; /* Disable internal scrolling */
  
  h3 {
    margin: 0 0 15px 0;
    color: #C4CED4;
    font-size: 16px;
    text-align: center;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
  }
  
  .standings-groups {
    display: flex;
    justify-content: space-between;
    
    .standings-group {
      flex: 1;
      
      h4 {
        color: #aaa;
        font-size: 12px;
        margin: 0 0 8px 0;
        text-transform: uppercase;
        text-align: center;
      }
      
      .team-row {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
        padding: 0 5px;
        
        .rank {
          width: 16px;
          text-align: center;
          font-size: 12px;
          color: #888;
          margin-right: 4px;
        }
        
        .team {
          display: flex;
          align-items: center;
          flex: 1;
          
          img {
            width: 20px;
            height: 20px;
            margin-right: 6px;
          }
          
          .team-name {
            font-size: 12px;
            color: #fff;
          }
        }
        
        .points {
          width: 25px;
          text-align: right;
          font-size: 12px;
          font-weight: bold;
          color: #fff;
          margin-left: 4px;
        }
      }
    }
  }
`;

// Update TradesProposalContainer to make it more compact
const TradesProposalContainer = styled.div`
  background-color: #252932;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #333;
  min-height: 100px;
  max-height: 200px; /* Increased max height to accommodate content */
  flex-shrink: 0; /* Prevent shrinking */
  display: flex;
  flex-direction: column;
  overflow: hidden; /* Hide overflow */
  
  h3 {
    margin: 0 0 10px 0;
    color: #C4CED4;
    font-size: 16px;
    text-align: center;
    border-bottom: 1px solid #333;
    padding-bottom: 8px;
    flex-shrink: 0; /* Prevent shrinking */
  }
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    flex-shrink: 0; /* Prevent shrinking */
    
    button {
      padding: 6px; /* Smaller buttons */
      border: none;
      border-radius: 4px;
      font-size: 11px; /* Smaller font */
      cursor: pointer;
      
      &.accept {
        background-color: #295438;
        color: white;
      }
      
      &.reject {
        background-color: #8B0000;
        color: white;
      }
      
      &.negotiate {
        background-color: #394b6a;
        color: white;
      }
    }
  }
  
  /* Create a scrollable area for trade proposals */
  .trade-proposals-container {
    overflow-y: auto; /* Make this area scrollable */
    flex: 1; /* Take remaining space */
    
    /* Add custom scrollbar styling */
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #444;
      border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  }
  
  .trade-proposal {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    position: relative;
    
    .team-side {
      text-align: center;
      
      img {
        width: 35px; /* Slightly smaller images */
        height: 35px;
        margin-bottom: 5px;
      }
      
      h4 {
        margin: 0;
        font-size: 12px; /* Smaller font */
        color: #fff;
      }
      
      p {
        margin: 3px 0 0; /* Less margin */
        font-size: 11px; /* Smaller font */
        color: #aaa;
      }
    }
    
    .vs {
      font-size: 14px; /* Smaller font */
      color: #aaa;
    }
    
    .status-indicator {
      position: absolute;
      top: -8px; /* Slightly higher */
      left: 0;
      right: 0;
      text-align: center;
      font-size: 10px; /* Smaller font */
      color: #B30E16;
      font-weight: bold;
    }
    
    &.old {
      opacity: 0.7;
      padding-top: 12px; /* Less padding */
      padding-bottom: 12px;
      border-top: 1px dashed #444;
      
      &:before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
`;

// New News Container component
const NewsContainer = styled.div`
  background-color: #252932;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 0;
  border: 1px solid #333;
  flex: 1; /* Take remaining space */
  overflow-y: auto; /* Enable scrolling within the news container */
  display: flex;
  flex-direction: column;
  
  h3 {
    margin: 0 0 15px 0;
    color: #C4CED4;
    font-size: 16px;
    text-align: center;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
    flex-shrink: 0; /* Prevent header from shrinking */
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    overflow-y: auto; /* Enable scrolling for the list itself */
    flex: 1; /* Take remaining space */
  }
  
  li {
    padding: 15px;
    border-bottom: 1px solid #333;
    
    &:last-child {
      border-bottom: none;
    }
    
    .news-headline {
      margin-bottom: 8px;
      color: #fff;
      font-weight: bold;
    }
    
    .news-header {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      
      img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        object-fit: cover;
        margin-right: 10px;
        background-color: #2a2a2a;
      }
      
      .journalist-name {
        font-weight: bold;
        margin-right: 10px;
        font-size: 12px;
        color: #aaa;
      }
      
      .news-time {
        font-size: 12px;
        color: #777;
        margin-left: auto;
      }
    }
    
    .news-content {
      font-size: 13px;
      color: #ddd;
      margin-bottom: 10px;
      line-height: 1.4;
    }
    
    .news-team {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #888;
      
      img {
        width: 18px;
        height: 18px;
        margin-right: 8px;
      }
    }
  }
`;

// Card components
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #333;
  
  h3 {
    margin: 0;
    color: #C4CED4;
    font-size: 18px;
  }
  
  p {
    margin: 5px 0 0;
    color: #888;
    font-size: 14px;
  }
`;

const CardContent = styled.div`
  padding: 20px;
`;

// Role components for Leadership page
const RoleContainer = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const RoleCard = styled.div`
  display: flex;
  background-color: #252525;
  border-radius: 8px;
  padding: 15px;
  flex: 1;
  min-width: 250px;
  max-width: 350px;
`;

const RoleIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background-color: #B30E16;
  color: white;
  font-size: 24px;
  font-weight: bold;
  border-radius: 50%;
  margin-right: 15px;
`;

const RoleInfo = styled.div`
  flex: 1;
  
  h4 {
    margin: 0 0 10px;
    color: white;
  }
`;

const RoleDescription = styled.div`
  font-size: 14px;
  color: #aaa;
  line-height: 1.5;
  margin-bottom: 15px;
`;

// Table components
const TableContainer = styled.div`
  overflow-x: auto;
  max-width: 100%;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: #252525;
  
  th {
    text-align: left;
    padding: 12px 15px;
    color: #C4CED4;
    font-weight: 600;
    border-bottom: 1px solid #333;
  }
`;

const TableBody = styled.tbody`
  tr {
    &:nth-child(odd) {
      background-color: #1d1d1d;
    }
    
    &:hover {
      background-color: #252525;
    }
    
    td {
      padding: 12px 15px;
      color: #ddd;
      border-bottom: 1px solid #2a2a2a;
    }
  }
`;

// Form and UI components
const SearchInput = styled.input`
  background-color: #252525;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 8px 12px;
  color: white;
  width: 200px;
  
  &::placeholder {
    color: #888;
  }
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: #252525;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 8px 12px;
  color: #C4CED4;
  cursor: pointer;
  
  &:hover {
    background-color: #2a2a2a;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const MoodIcon = styled.span`
  color: ${props => props.status === 'positive' ? '#4CAF50' : props.status === 'negative' ? '#F44336' : '#FFC107'};
  display: inline-flex;
  align-items: center;
  margin-left: 10px;
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 5px 8px;
  color: #C4CED4;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  
  &:hover {
    background-color: #2a2a2a;
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const RetiredNumbersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
`;

const RetiredNumber = styled.div`
  background-color: ${props => props.status === 'retired' ? '#252525' : '#1d1d1d'};
  border: 1px solid ${props => props.status === 'retired' ? '#B30E16' : '#333'};
  border-radius: 6px;
  padding: 15px;
  text-align: center;
  
  .number {
    font-size: 24px;
    font-weight: bold;
    color: ${props => props.status === 'retired' ? '#B30E16' : '#C4CED4'};
    margin-bottom: 5px;
  }
  
  .player {
    font-size: 14px;
    color: #ddd;
    margin-bottom: 5px;
  }
  
  .status {
    font-size: 12px;
    color: #888;
    text-transform: uppercase;
  }
`;

// Morale page styled components
const MoraleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const MoraleSummary = styled.div`
  display: flex;
  background-color: #1a2233;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const MoraleGauge = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: conic-gradient(
    #4CAF50 0% ${props => props.value}%, 
    #232b40 ${props => props.value}% 100%
  );
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-right: 24px;
  
  &::before {
    content: '';
    position: absolute;
    top: 15px;
    left: 15px;
    right: 15px;
    bottom: 15px;
    border-radius: 50%;
    background-color: #1a2233;
  }
  
  .value {
    position: relative;
    font-size: 24px;
    font-weight: bold;
    color: #fff;
  }
`;

const MoraleStats = styled.div`
  flex: 1;
  
  h4 {
    margin-top: 0;
    margin-bottom: 12px;
    font-size: 20px;
    color: #fff;
  }
  
  .morale-description {
    margin-bottom: 20px;
    color: #b4c1d4;
    line-height: 1.5;
  }
`;

const MoraleGroups = styled.div`
  display: flex;
  gap: 16px;
`;

const MoraleGroupItem = styled.div`
  background-color: #232b40;
  border-radius: 6px;
  padding: 12px;
  flex: 1;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 4px;
    width: ${props => props.value}%;
    background-color: ${props => 
      props.value >= 80 ? '#4CAF50' : 
      props.value >= 60 ? '#FFC107' : 
      '#F44336'
    };
  }
  
  .label {
    font-size: 14px;
    color: #b4c1d4;
  }
  
  .value {
    float: right;
    font-weight: bold;
    color: ${props => 
      props.value >= 80 ? '#4CAF50' : 
      props.value >= 60 ? '#FFC107' : 
      '#F44336'
    };
  }
`;

const MoraleBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const MoralePlayerCard = styled.div`
  background-color: #1a2233;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const MoralePlayerHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background-color: ${props => 
    props.morale >= 80 ? 'rgba(76, 175, 80, 0.1)' : 
    props.morale >= 60 ? 'rgba(255, 193, 7, 0.1)' : 
    'rgba(244, 67, 54, 0.1)'
  };
  cursor: pointer;
  
  .player-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: #2c3651;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    margin-right: 12px;
  }
  
  .player-info {
    flex: 1;
    display: flex;
    align-items: center;
  }
  
  .player-name {
    font-weight: bold;
    margin-right: 6px;
  }
  
  .player-position {
    font-size: 12px;
    color: #b4c1d4;
    background-color: #2c3651;
    padding: 2px 6px;
    border-radius: 4px;
    margin-right: 6px;
  }
  
  .player-morale {
    display: flex;
    align-items: center;
    font-weight: bold;
    color: ${props => 
      props.morale >= 80 ? '#4CAF50' : 
      props.morale >= 60 ? '#FFC107' : 
      '#F44336'
    };
    margin-left: auto;
    
    svg {
      margin-left: 4px;
    }
  }
`;

const MoraleTimeline = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MoraleEvent = styled.div`
  padding: 12px;
  background-color: ${props => 
    props.impact === 'positive' ? 'rgba(76, 175, 80, 0.1)' : 
    props.impact === 'negative' ? 'rgba(244, 67, 54, 0.1)' : 
    'rgba(255, 193, 7, 0.1)'
  };
  border-left: 3px solid ${props => 
    props.impact === 'positive' ? '#4CAF50' : 
    props.impact === 'negative' ? '#F44336' : 
    '#FFC107'
  };
  border-radius: 4px;
  
  .event-title {
    font-weight: bold;
    color: ${props => 
      props.impact === 'positive' ? '#4CAF50' : 
      props.impact === 'negative' ? '#F44336' : 
      '#FFC107'
    };
    margin-bottom: 4px;
  }
  
  .event-date {
    font-size: 12px;
    color: #b4c1d4;
    margin-bottom: 6px;
  }
  
  .event-description {
    font-size: 13px;
    color: #d0d9e8;
  }
`;

// Settings page styled components
const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  width: 100%;
`;

const SettingCard = styled.div`
  background-color: #1a2233;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
`;

const SettingHeader = styled.div`
  padding: 16px 20px;
  background-color: #232b40;
  border-bottom: 1px solid #36405a;
  
  h3 {
    margin: 0;
    font-size: 18px;
    color: #fff;
  }
`;

const SettingContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SettingItem = styled.div`
  .setting-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    
    label {
      font-weight: bold;
      color: #d0d9e8;
    }
    
    .setting-value {
      font-size: 13px;
      color: #b4c1d4;
    }
  }
  
  .setting-description {
    font-size: 13px;
    color: #8496b4;
    margin-bottom: 12px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  background-color: #232b40;
  border: 1px solid #36405a;
  border-radius: 4px;
  color: #d0d9e8;
  font-size: 14px;
  appearance: none;
  cursor: pointer;
  position: relative;
  
  &:focus {
    outline: none;
    border-color: #4d78cc;
  }
  
  option {
    background-color: #1a2233;
    color: #d0d9e8;
  }
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #36405a;
    transition: .4s;
    border-radius: 26px;
  }
  
  .slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: #fff;
    transition: .4s;
    border-radius: 50%;
  }
  
  input:checked + .slider {
    background-color: #4d78cc;
  }
  
  input:focus + .slider {
    box-shadow: 0 0 1px #4d78cc;
  }
  
  input:checked + .slider:before {
    transform: translateX(24px);
  }
`;

const Slider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  background: #36405a;
  border-radius: 3px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4d78cc;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4d78cc;
    cursor: pointer;
  }
`;

// Define helper functions outside of the component to avoid hoisting issues
// Game schedule data
const GAME_SCHEDULE = {
  20: { 
    hasGame: true, 
    isHomeGame: true, 
    opponent: 'BUF', 
    gameCompleted: true, 
    gameResult: '4-1',
    teamWon: true 
  },
  22: { 
    hasGame: true, 
    isHomeGame: false, 
    opponent: 'OTT', 
    gameCompleted: false 
  },
  23: { 
    hasGame: true, 
    isHomeGame: false, 
    opponent: 'MTL', 
    gameCompleted: false 
  },
  24: { 
    hasGame: false, 
    isHomeGame: false, 
    affiliate: 'AHL',
    affiliateGame: true,
    affiliateOpponent: 'TOR' 
  },
  25: { 
    hasGame: false, 
    isHomeGame: false, 
    affiliate: 'ECHL',
    affiliateGame: true,
    affiliateOpponent: 'FLA' 
  },
  26: { 
    hasGame: true, 
    isHomeGame: false, 
    opponent: 'BOS', 
    gameCompleted: false 
  },
  // Additional days (Nov 27-30, Dec 1-2)
  27: { 
    hasGame: false, 
    isHomeGame: false 
  },
  28: { 
    hasGame: true, 
    isHomeGame: true, 
    opponent: 'EDM', 
    gameCompleted: false 
  },
  29: { 
    hasGame: false, 
    isHomeGame: false,
    affiliate: 'AHL',
    affiliateGame: true,
    affiliateOpponent: 'CGY' 
  },
  30: { 
    hasGame: true, 
    isHomeGame: false, 
    opponent: 'WSH', 
    gameCompleted: false 
  },
  // December (month 11)
  "12-1": { 
    hasGame: false, 
    isHomeGame: false 
  },
  "12-2": { 
    hasGame: true, 
    isHomeGame: true, 
    opponent: 'NYR', 
    gameCompleted: false 
  }
};

// Function to generate week days starting from a specific date
const generateWeekDays = (startDate, numDays, gameSchedule) => {
  const days = [];
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  
  // Clone the start date to avoid modifying the original
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < numDays; i++) {
    const date = new Date(currentDate);
    const dayName = dayNames[date.getDay()];
    const dayNumber = date.getDate();
    const monthNumber = date.getMonth();
    const monthName = monthNames[monthNumber];
    
    // Get game info - handle December dates specially
    let gameKey = dayNumber;
    if (monthNumber === 11) { // December
      gameKey = `12-${dayNumber}`;
    }
    
    const todayInfo = gameSchedule[gameKey] || { hasGame: false, isHomeGame: false, opponent: '' };
    
    days.push({
      date,
      dayName,
      dayNumber,
      monthName,
      hasGame: todayInfo.hasGame,
      isHomeGame: todayInfo.isHomeGame,
      opponent: todayInfo.opponent,
      isToday: i === 2, // Initially day 22 (index 2) is today
      gameCompleted: todayInfo.gameCompleted || false,
      gameResult: todayInfo.gameResult || '',
      teamWon: todayInfo.teamWon || false,
      affiliate: todayInfo.affiliate || '',
      affiliateGame: todayInfo.affiliateGame || false,
      affiliateOpponent: todayInfo.affiliateOpponent || ''
    });
    
    // Advance to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
};

// Function to get formatted date string
const getFormattedDateString = (date) => {
  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

// SeasonDashboard Component
const SeasonDashboard = () => {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const communityPack = useSelector(selectCommunityPack);
  const [activeTab, setActiveTab] = useState('home');
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Add state for collapsible sections
  const [tasksExpanded, setTasksExpanded] = useState(false);
  
  // Add team level state for NHL/AHL/ECHL rotation
  const [teamLevel, setTeamLevel] = useState('NHL');
  
  // Add division state and navigation functions here
  const [activeDivision, setActiveDivision] = useState('Atlantic');
  const divisions = ['Atlantic', 'Metropolitan', 'Central', 'Pacific'];
  
  // State for tracking which player cards are expanded in the morale section
  const [expandedPlayers, setExpandedPlayers] = useState({});
  
  // Function to toggle player expansion in the morale section
  const togglePlayerExpand = (playerId) => {
    setExpandedPlayers(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }));
  };
  
  // Add function to rotate between team levels
  const rotateTeamLevel = () => {
    const levels = ['NHL', 'AHL', 'ECHL'];
    const currentIndex = levels.indexOf(teamLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    setTeamLevel(levels[nextIndex]);
  };
  
  const nextDivision = () => {
    const currentIndex = divisions.indexOf(activeDivision);
    const nextIndex = (currentIndex + 1) % divisions.length;
    setActiveDivision(divisions[nextIndex]);
  };
  
  const prevDivision = () => {
    const currentIndex = divisions.indexOf(activeDivision);
    const prevIndex = (currentIndex - 1 + divisions.length) % divisions.length;
    setActiveDivision(divisions[prevIndex]);
  };
  
  // Add missing calendarData state
  const [calendarData, setCalendarData] = useState({
    record: '8-7-3',
    position: '15th in League',
    points: '19',
    gamesPlayed: '18'
  });
  
  // Generate mock week data for the calendar to match the image
  const [weekDays, setWeekDays] = useState(() => {
    return generateWeekDays(new Date(2024, 10, 20), 7, GAME_SCHEDULE);
  });
  
  // Add state for game result modal
  const [showGameModal, setShowGameModal] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [currentCalendarDate, setCurrentCalendarDate] = useState("NOVEMBER 22, 2024");
  const [visibleStartDate, setVisibleStartDate] = useState(new Date(2024, 10, 20)); // Nov 20, 2024
  
  // Add function to check if today has a game
  const hasTodayGame = () => {
    const today = weekDays.find(day => day.isToday);
    return today && today.hasGame && !today.gameCompleted;
  };
  
  // Function to get today's date info
  const getTodayInfo = () => {
    return weekDays.find(day => day.isToday);
  };
  
  useEffect(() => {
    // Load season data from service
    const loadSeason = async () => {
      try {
        const { success, data, error } = await seasonService.getSeasonById(seasonId);
        
        if (success) {
          setSeason(data);
        } else {
          console.error('Error loading season:', error);
          // Season not found, redirect to season mode
          navigate('/season');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Unexpected error loading season:', error);
        navigate('/season');
        setLoading(false);
      }
    };
    
    loadSeason();
  }, [seasonId, navigate]);
  
  const handleSave = async () => {
    try {
      // Save current season state
      const { success, error } = await seasonService.updateSeason(seasonId, season);
      
      if (success) {
        alert('Season saved successfully!');
      } else {
        alert(`Failed to save season: ${error}`);
      }
    } catch (error) {
      console.error('Error saving season:', error);
      alert('An unexpected error occurred while saving the season');
    }
  };
  
  const handleExitToMenu = async () => {
    // Prompt user if they want to save before exiting
    if (window.confirm('Do you want to save before exiting?')) {
      await handleSave();
    }
    navigate('/season');
  };
  
  // Function to simulate next game
  const simulateNextGame = () => {
    // Find the next game day (first non-completed game)
    const nextGameDay = weekDays.find(day => day.hasGame && !day.gameCompleted);
    
    if (!nextGameDay) {
      alert('No upcoming games scheduled in this week.');
      return;
    }
    
    // If next game day is today, simulate it
    if (nextGameDay.isToday) {
      simulateToday();
      return;
    }
    
    // Otherwise, advance to that day
    advanceToDay(nextGameDay.dayNumber, nextGameDay.date);
  };
  
  // Function to simulate today's game
  const simulateToday = () => {
    const today = getTodayInfo();
    
    if (!today || !today.hasGame || today.gameCompleted) {
      alert('No game scheduled for today.');
      return;
    }
    
    // Generate a random score
    const homeGoals = Math.floor(Math.random() * 6);
    const awayGoals = Math.floor(Math.random() * 6);
    
    // Determine if user team won
    const userTeamWon = today.isHomeGame ? homeGoals > awayGoals : awayGoals > homeGoals;
    
    // Create game result
    const result = {
      homeTeam: today.isHomeGame ? 'VAN' : today.opponent,
      awayTeam: today.isHomeGame ? today.opponent : 'VAN',
      homeGoals,
      awayGoals,
      userTeamWon
    };
    
    // Update the day with game result
    const updatedWeekDays = weekDays.map(day => {
      if (day.isToday) {
        return {
          ...day,
          gameCompleted: true,
          gameResult: `${homeGoals}-${awayGoals}`,
          teamWon: userTeamWon
        };
      }
      return day;
    });
    
    // Update state
    setWeekDays(updatedWeekDays);
    
    // Update record in calendarData
    updateTeamRecord(userTeamWon);
    
    // Show game result modal
    setGameResult(result);
    setShowGameModal(true);
  };
  
  // Function to update team record after a game
  const updateTeamRecord = (won) => {
    // Parse current record
    const [wins, losses, ot] = calendarData.record.split('-').map(Number);
    
    // Update based on game result (simplified version - no OT logic)
    const newRecord = won ? `${wins + 1}-${losses}-${ot}` : `${wins}-${losses + 1}-${ot}`;
    
    // Calculate new points (2 for win, 0 for loss, simplified)
    const newPoints = parseInt(calendarData.points) + (won ? 2 : 0);
    
    setCalendarData({
      ...calendarData,
      record: newRecord,
      points: newPoints.toString(),
      gamesPlayed: (parseInt(calendarData.gamesPlayed) + 1).toString()
    });
  };
  
  // Function to advance to a specific day
  const advanceToDay = (targetDayNumber, targetDate) => {
    // Find the day in the current visible days
    const dayIndex = weekDays.findIndex(day => day.dayNumber === targetDayNumber && 
      day.date.getMonth() === targetDate.getMonth());
    
    if (dayIndex === -1) {
      // If the day isn't in the current visible week, we need to shift the calendar
      const newStartDate = new Date(targetDate);
      newStartDate.setDate(newStartDate.getDate() - 3); // Center the target date
      
      // Generate new week days
      const newWeekDays = generateWeekDays(newStartDate, 7, GAME_SCHEDULE);
      
      // Mark the target day as "today"
      const newDayIndex = newWeekDays.findIndex(day => 
        day.dayNumber === targetDate.getDate() && 
        day.date.getMonth() === targetDate.getMonth());
      
      if (newDayIndex !== -1) {
        newWeekDays[newDayIndex].isToday = true;
      }
      
      setWeekDays(newWeekDays);
      setVisibleStartDate(newStartDate);
    } else {
      // If the day is in the current week, just update the "today" marker
      const updatedWeekDays = weekDays.map(day => ({
        ...day,
        isToday: day.dayNumber === targetDayNumber && 
                day.date.getMonth() === targetDate.getMonth()
      }));
      
      setWeekDays(updatedWeekDays);
    }
    
    // Update calendar date display
    setCurrentCalendarDate(getFormattedDateString(targetDate));
  };
  
  // Function to simulate to next day
  const simulateToNextDay = async () => {
    // Find today's index
    const todayIndex = weekDays.findIndex(day => day.isToday);
    
    if (todayIndex === -1) {
      alert('Cannot determine current day.');
      return;
    }
    
    if (todayIndex === weekDays.length - 1) {
      // We're at the last visible day, need to shift the calendar
      const nextDate = new Date(weekDays[todayIndex].date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      // Generate a new week starting from one day after the current start date
      const newStartDate = new Date(visibleStartDate);
      newStartDate.setDate(newStartDate.getDate() + 1);
      
      const newWeekDays = generateWeekDays(newStartDate, 7, GAME_SCHEDULE);
      
      // Mark the target day as "today"
      newWeekDays[todayIndex].isToday = true;
      
      setWeekDays(newWeekDays);
      setVisibleStartDate(newStartDate);
      setCurrentCalendarDate(getFormattedDateString(nextDate));
    } else {
      // Get the next day
      const nextDay = weekDays[todayIndex + 1];
      
      try {
        // Call the service (for data persistence)
        await seasonService.simulateToNextDay(seasonId);
        
        // Update UI to show next day
        advanceToDay(nextDay.dayNumber, nextDay.date);
        
      } catch (error) {
        console.error('Error simulating to next day:', error);
        alert('An unexpected error occurred during simulation');
      }
    }
  };
  
  // Function to render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'calendar':
        return renderCalendarContent();
      case 'stats':
        return renderStatsContent();
      case 'standings':
        return renderStandingsContent();
      case 'awards':
        return renderAwardsContent();
      case 'lines':
        return renderLinesContent();
      case 'coaching':
        return renderCoachingStaffContent();
      case 'trades':
        return renderTradesContent();
      case 'contracts':
        return renderContractsContent();
      case 'freeAgents':
        return renderFreeAgentsContent();
      case 'numbers':
        return renderNumbersContent();
      case 'morale':
        return renderMoraleContent();
      case 'tasks':
        return renderTasksContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return <div>Content not implemented</div>;
    }
  };
  
  // Home dashboard tab
  const renderHomeContent = () => {
    return (
      <>
        <Header>
          <Title>Season Dashboard</Title>
          <ActionButtons>
            <Button onClick={rotateTeamLevel}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              {teamLevel}
            </Button>
            <Button onClick={simulateToNextDay}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Advance Day
            </Button>
            {hasTodayGame() && (
              <Button onClick={simulateToday}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                Simulate Today Game
              </Button>
            )}
            <Button primary onClick={simulateNextGame}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Sim to Next Game
            </Button>
          </ActionButtons>
        </Header>
        
        <WeekViewCalendar>
          <WeekCalendarHeader>
            <h2>CALENDAR</h2>
            <div className="calendar-date">{currentCalendarDate}</div>
          </WeekCalendarHeader>
          <CalendarDays>
            {weekDays.map((day, index) => (
              <WeekDay 
                key={index}
                active={day.isToday}
                hasGame={day.hasGame}
                isHomeGame={day.isHomeGame}
              >
                <div className="day-name">
                  {day.dayName} {day.dayNumber}
                </div>
                <div className="day-number">{day.monthName}</div>
                
                {day.affiliateGame && (
                  <div className="team-level-indicator">
                    <img src={getTeamLogo(day.affiliate)} alt={day.affiliate} />
                  </div>
                )}

                {/* For the specific day 20, force both game and result to show */}
                {day.dayNumber === 20 && day.monthName === "NOV" && (
                  <>
                    <div className="game-info">
                      {communityPack === 1 && (
                        <>
                          <img className="team-logo" src={getTeamLogo('VAN')} alt="VAN" />
                          <span className="vs">VS</span>
                          <img className="team-logo" src={getTeamLogo('BUF')} alt="BUF" />
                        </>
                      )}
                    </div>
                    <div className="game-result">4-1</div>
                  </>
                )}

                {/* For all other days, use the regular logic */}
                {(day.dayNumber !== 20 || day.monthName !== "NOV") && day.hasGame && (
                  <div className="game-info">
                    {communityPack === 1 && (
                      <>
                        {day.isHomeGame ? (
                          <>
                            <img className="team-logo" src={getTeamLogo('VAN')} alt="VAN" />
                            <span className="vs">VS</span>
                            <img className="team-logo" src={getTeamLogo(day.opponent)} alt={day.opponent} />
                          </>
                        ) : (
                          <>
                            <img className="team-logo" src={getTeamLogo(day.opponent)} alt={day.opponent} />
                            <span className="vs">@</span>
                            <img className="team-logo" src={getTeamLogo('VAN')} alt="VAN" />
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}

                {(day.dayNumber !== 20 || day.monthName !== "NOV") && day.hasGame && day.gameCompleted && (
                  <div className="game-result">
                    {day.gameResult}
                  </div>
                )}

                {day.isToday && (
                  <div className="active-day-indicator"></div>
                )}
              </WeekDay>
            ))}
          </CalendarDays>
        </WeekViewCalendar>
        
        {/* Game Result Modal */}
        {showGameModal && gameResult && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowGameModal(false)}
          >
            <div 
              style={{
                backgroundColor: '#1d2330',
                padding: '30px',
                borderRadius: '8px',
                maxWidth: '500px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                border: '1px solid #333'
              }}
              onClick={e => e.stopPropagation()}
            >
              <h2 style={{ marginTop: 0, color: '#fff' }}>Game Result</h2>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '30px 0', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', width: '40%' }}>
                  <img 
                    src={getTeamLogo(gameResult.homeTeam)} 
                    alt={gameResult.homeTeam}
                    style={{ width: '80px', height: '80px' }}
                  />
                  <h3 style={{ marginBottom: '5px', color: '#fff' }}>{gameResult.homeTeam}</h3>
                </div>
                
                <div style={{ textAlign: 'center', fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>
                  {gameResult.homeGoals} - {gameResult.awayGoals}
                </div>
                
                <div style={{ textAlign: 'center', width: '40%' }}>
                  <img 
                    src={getTeamLogo(gameResult.awayTeam)} 
                    alt={gameResult.awayTeam}
                    style={{ width: '80px', height: '80px' }}
                  />
                  <h3 style={{ marginBottom: '5px', color: '#fff' }}>{gameResult.awayTeam}</h3>
                </div>
              </div>
              
              <div style={{ 
                backgroundColor: gameResult.userTeamWon ? '#295438' : '#8B0000',
                padding: '10px',
                borderRadius: '4px',
                color: 'white',
                fontWeight: 'bold',
                marginBottom: '20px'
              }}>
                {gameResult.userTeamWon ? 'VICTORY' : 'DEFEAT'}
              </div>
              
              <button 
                style={{
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                onClick={() => setShowGameModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        
        <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
          <MatchupCard>
            <MatchupHeader>
              <h3>Next Game</h3>
              <span>FRI 22</span>
            </MatchupHeader>
            
            <MatchupTeams>
              <MatchupTeam>
                {communityPack === 1 ? (
                  <img 
                    src={getTeamLogo('VAN')} 
                    alt="Vancouver Canucks" 
                  />
                ) : (
                  <img 
                    src={season?.selectedTeam?.logoUrl || PlayerSilhouette} 
                    alt="Vancouver Canucks" 
                  />
                )}
                <h4>VANCOUVER</h4>
                <p>CANUCKS</p>
                <p>8-7-3</p>
              </MatchupTeam>
              
              <VersusContainer>
                <span>VS</span>
                <p>Canadian Tire Centre™</p>
              </VersusContainer>
              
              <MatchupTeam>
                {communityPack === 1 ? (
                  <img 
                    src={getTeamLogo('OTT')} 
                    alt="Ottawa Senators" 
                  />
                ) : (
                  <img 
                    src={PlayerSilhouette} 
                    alt="Ottawa Senators" 
                  />
                )}
                <h4>OTTAWA</h4>
                <p>SENATORS</p>
                <p>9-9-1</p>
              </MatchupTeam>
            </MatchupTeams>
            
            <StatComparison>
              <StatRow highlight="home">
                <div className="home-stat">3.11</div>
                <div className="stat-label">GOALS FOR PER GAME</div>
                <div className="away-stat">2.79</div>
              </StatRow>
              <StatRow highlight="away">
                <div className="home-stat">2.84</div>
                <div className="stat-label">GOALS AGAINST PER GAME</div>
                <div className="away-stat">3.11</div>
              </StatRow>
              <StatRow highlight="home">
                <div className="home-stat">18.2%</div>
                <div className="stat-label">POWERPLAY %</div>
                <div className="away-stat">21.4%</div>
              </StatRow>
              <StatRow highlight="home">
                <div className="home-stat">84.5%</div>
                <div className="stat-label">PENALTY KILL %</div>
                <div className="away-stat">85.5%</div>
              </StatRow>
            </StatComparison>
            
            <MatchupDetails>
              <MatchupSubHeader>PROJECTED GOALIES</MatchupSubHeader>
              
              <GoalieComparison>
                <GoalieCard primary>
                  <img 
                    className="goalie-photo" 
                    src={PlayerSilhouette} 
                    alt="Arturs Silovs" 
                  />
                  <div className="goalie-info">
                    <h4>
                      <span className="number">#31</span>
                      ARTURS SILOVS
                    </h4>
                    <div className="goalie-stats">
                      <div className="stat-row">
                        <div className="stat-label">GP</div>
                        <div className="stat-value">5</div>
                      </div>
                      <div className="stat-row">
                        <div className="stat-label">W</div>
                        <div className="stat-value">1</div>
                      </div>
                      <div className="stat-row">
                        <div className="stat-label">SV%</div>
                        <div className="stat-value">.921</div>
                      </div>
                      <div className="stat-row">
                        <div className="stat-label">GAA</div>
                        <div className="stat-value">2.77</div>
                      </div>
                    </div>
                  </div>
                </GoalieCard>
                
                <GoalieCard>
                  <img 
                    className="goalie-photo" 
                    src={PlayerSilhouette} 
                    alt="Linus Ullmark" 
                  />
                  <div className="goalie-info">
                    <h4>
                      <span className="number">#29</span>
                      LINUS ULLMARK
                    </h4>
                    <div className="goalie-stats">
                      <div className="stat-row">
                        <div className="stat-label">GP</div>
                        <div className="stat-value">17</div>
                      </div>
                      <div className="stat-row">
                        <div className="stat-label">W</div>
                        <div className="stat-value">9</div>
                      </div>
                      <div className="stat-row">
                        <div className="stat-label">SV%</div>
                        <div className="stat-value">.913</div>
                      </div>
                      <div className="stat-row">
                        <div className="stat-label">GAA</div>
                        <div className="stat-value">2.97</div>
                      </div>
                    </div>
                  </div>
                </GoalieCard>
              </GoalieComparison>
            </MatchupDetails>
            
            <MatchupDetails>
              <MatchupSubHeader>TEAM LEADERS</MatchupSubHeader>
              
              <TeamLeaders>
                <LeaderCard>
                  <h4>Vancouver Canucks</h4>
                  <div className="leader-row">
                    <img 
                      src={PlayerSilhouette} 
                      alt="J. Debrusk" 
                    />
                    <div className="leader-info">
                      <p className="leader-name">J. DEBRUSK</p>
                      <p className="leader-position">#74 LW</p>
                    </div>
                    <div className="leader-stat">18 PTS</div>
                  </div>
                  <div className="leader-row">
                    <img 
                      src={PlayerSilhouette} 
                      alt="C. Giroux" 
                    />
                    <div className="leader-info">
                      <p className="leader-name">C. GIROUX</p>
                      <p className="leader-position">#28 C</p>
                    </div>
                    <div className="leader-stat">21 PTS</div>
                  </div>
                  <div className="leader-section-title">Goal Scorers</div>
                  <div className="leader-row">
                    <img 
                      src={PlayerSilhouette} 
                      alt="B. Horvat" 
                    />
                    <div className="leader-info">
                      <p className="leader-name">B. HORVAT</p>
                      <p className="leader-position">#53 C</p>
                    </div>
                    <div className="leader-stat">12 G</div>
                  </div>
                  <div className="leader-row">
                    <img 
                      src={PlayerSilhouette} 
                      alt="E. Pettersson" 
                    />
                    <div className="leader-info">
                      <p className="leader-name">E. PETTERSSON</p>
                      <p className="leader-position">#40 C</p>
                    </div>
                    <div className="leader-stat">10 G</div>
                  </div>
                  <div className="leader-section-title">Other Leaders</div>
                  <div className="leader-row">
                    <img 
                      src={PlayerSilhouette} 
                      alt="Q. Hughes" 
                    />
                    <div className="leader-info">
                      <p className="leader-name">Q. HUGHES</p>
                      <p className="leader-position">#43 D</p>
                    </div>
                    <div className="leader-stat">+12</div>
                  </div>
                  <div className="leader-row">
                    <img 
                      src={PlayerSilhouette} 
                      alt="T. Myers" 
                    />
                    <div className="leader-info">
                      <p className="leader-name">T. MYERS</p>
                      <p className="leader-position">#57 D</p>
                    </div>
                    <div className="leader-stat">24:35 TOI</div>
                  </div>
                </LeaderCard>
                
                <LeaderCard>
                  <h4>Ottawa Senators</h4>
                  <div className="leader-row">
                    <img 
                      src={PlayerSilhouette} 
                      alt="Player 1" 
                    />
                    <div className="leader-info">
                      <p className="leader-name">T. CHABOT</p>
                      <p className="leader-position">#72 D</p>
                    </div>
                    <div className="leader-stat">15 PTS</div>
                  </div>
                  <div className="leader-row">
                    <img 
                      src={PlayerSilhouette} 
                      alt="Player 2" 
                    />
                    <div className="leader-info">
                      <p className="leader-name">B. TKACHUK</p>
                      <p className="leader-position">#7 LW</p>
                    </div>
                    <div className="leader-stat">19 PTS</div>
                  </div>
                  <div className="leader-section-title">Goal Scorers</div>
                  <div className="leader-row">
                    <img 
                      src={PlayerSilhouette} 
                      alt="B. Tkachuk" 
                    />
                    <div className="leader-info">
                      <p className="leader-name">B. TKACHUK</p>
                      <p className="leader-position">#7 LW</p>
                    </div>
                    <div className="leader-stat">9 G</div>
                  </div>
                  <div className="leader-row">
                    <img 
                      src={PlayerSilhouette} 
                      alt="D. Batherson" 
                    />
                    <div className="leader-info">
                      <p className="leader-name">D. BATHERSON</p>
                      <p className="leader-position">#19 RW</p>
                    </div>
                    <div className="leader-stat">8 G</div>
                  </div>
                  <div className="leader-section-title">Other Leaders</div>
                  <div className="leader-row">
                    <img 
                      src={PlayerSilhouette} 
                      alt="A. Zub" 
                    />
                    <div className="leader-info">
                      <p className="leader-name">A. ZUB</p>
                      <p className="leader-position">#2 D</p>
                    </div>
                    <div className="leader-stat">+8</div>
                  </div>
                  <div className="leader-row">
                    <img 
                      src={PlayerSilhouette} 
                      alt="T. Chabot" 
                    />
                    <div className="leader-info">
                      <p className="leader-name">T. CHABOT</p>
                      <p className="leader-position">#72 D</p>
                    </div>
                    <div className="leader-stat">25:21 TOI</div>
                  </div>
                </LeaderCard>
              </TeamLeaders>
            </MatchupDetails>
          </MatchupCard>
          
          <PointsLeaderSection>
            <div className="points-scrolling">
              <span>1) <strong>C. MCDAVID - 29</strong></span>
              <span>2) <strong>N. MACKINNON - 29</strong></span>
              <span>3) <strong>M. MARNER - 29</strong></span>
              <span>4) <strong>N. KUCHEROV - 27</strong></span>
              <span>5) <strong>M. RANTANEN - 27</strong></span>
              <span>6) <strong>N. EHLERS - 26</strong></span>
              <span>7) <strong>A. MATTHEWS - 26</strong></span>
              <span>8) <strong>J. ROBERTSON - 25</strong></span>
              <span>9) <strong>D. PASTRNAK - 25</strong></span>
              <span>10) <strong>E. PETTERSSON - 24</strong></span>
            </div>
          </PointsLeaderSection>
        </div>
      </>
    );
  };
  
  // Calendar content
  const renderCalendarContent = () => {
    const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    
    // Mock data for demonstration purposes
    const currentMonth = "NOVEMBER 22, 2024";
    const calendarDays = Array(35).fill().map((_, i) => {
      const dayNum = i - 3; // Start from the last few days of the previous month
      const isCurrentMonth = dayNum > 0 && dayNum <= 30;
      const hasGame = [5, 10, 15, 22, 23, 26].includes(dayNum);
      const isHomeGame = [5, 15, 26].includes(dayNum);
      const isToday = dayNum === 22;
      const isActive = dayNum === 22;
      
      return {
        day: dayNum,
        isCurrentMonth,
        hasGame,
        isHomeGame,
        gameInfo: hasGame ? `vs ${isHomeGame ? 'OTT' : 'BOS'}` : '',
        isToday,
        isActive
      };
    });
    
    return (
      <>
        <Header>
          <Title>Calendar</Title>
          <ActionButtons>
            <Button onClick={rotateTeamLevel}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              {teamLevel}
            </Button>
            <Button onClick={simulateToNextDay}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Advance Day
            </Button>
            <Button primary onClick={simulateNextGame}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Sim to Next Game
            </Button>
          </ActionButtons>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)'
        }}>
          <CalendarContainer>
            <CalendarHeader>
              <h2>Calendar</h2>
              <MonthNavigation>
                <button>&lt;</button>
                <span>{currentMonth}</span>
                <button>&gt;</button>
              </MonthNavigation>
            </CalendarHeader>
            
            <CalendarGrid>
              {weekdays.map(day => (
                <WeekdayHeader key={day}>{day}</WeekdayHeader>
              ))}
              
              {calendarDays.map((day, index) => (
                <DateCell 
                  key={index}
                  isCurrentMonth={day.isCurrentMonth}
                  hasGame={day.hasGame}
                  isHomeGame={day.isHomeGame}
                  isToday={day.isToday}
                  isActive={day.isActive}
                >
                  <div className="date-number">{day.isCurrentMonth ? day.day : ''}</div>
                  <div className="game-indicator"></div>
                  <div className="game-info">{day.gameInfo}</div>
                </DateCell>
              ))}
            </CalendarGrid>
          </CalendarContainer>
          
          <Calendar 
            isEmbedded={true}
            style={{ display: 'none' }} // Hide the original Calendar component
          />
        </div>
      </>
    );
  };
  
  // Lines content
  const renderLinesContent = () => {
    const teamId = season?.selectedTeam?.id || 1;
    return (
      <>
        <Header>
          <Title>Line Combinations</Title>
          <ActionButtons>
            <Button onClick={rotateTeamLevel}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              {teamLevel}
            </Button>
          </ActionButtons>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <LineCombinations 
            isEmbedded={true} 
            league={teamLevel.toLowerCase()} 
            teamId={teamId.toString()} 
          />
        </div>
      </>
    );
  };
  
  // Team management content
  const renderTeamContent = () => {
    return (
      <>
        <Header>
          <Title>Team Management</Title>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <EmptyState>
            <h3>Team Management</h3>
            <p>Manage your team's roster, call-ups, and send-downs.</p>
            <Button primary disabled>Coming Soon</Button>
          </EmptyState>
        </div>
      </>
    );
  };
  
  // Stats content
  const renderStatsContent = () => {
    return (
      <>
        <Header>
          <Title>Statistics</Title>
          <ActionButtons>
            <Button onClick={rotateTeamLevel}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              {teamLevel}
            </Button>
          </ActionButtons>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)' // Ensure it takes full height minus header
        }}>
          <Statistics isEmbedded={true} league={teamLevel.toLowerCase()} />
        </div>
      </>
    );
  };
  
  // Standings content
  const renderStandingsContent = () => {
    return (
      <>
        <Header>
          <Title>Standings</Title>
          <ActionButtons>
            <Button onClick={rotateTeamLevel}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              {teamLevel}
            </Button>
          </ActionButtons>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)' // Ensure it takes full height minus header
        }}>
          <Standings isEmbedded={true} league={teamLevel.toLowerCase()} />
        </div>
      </>
    );
  };
  
  // Trades content
  const renderTradesContent = () => {
    return (
      <>
        <Header>
          <Title>Asset Movement</Title>
          <ActionButtons>
            <Button onClick={rotateTeamLevel}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              {teamLevel}
            </Button>
          </ActionButtons>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)' // Ensure it takes full height minus header
        }}>
          <AssetMovement isEmbedded={true} league={teamLevel.toLowerCase()} />
        </div>
      </>
    );
  };
  
  // Awards content
  const renderAwardsContent = () => {
    return (
      <>
        <Header>
          <Title>Awards</Title>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)' // Ensure it takes full height minus header
        }}>
          <Awards isEmbedded={true} />
        </div>
      </>
    );
  };
  
  // Inside the SeasonDashboard component, before the renderContent function
  // Define additional render functions for new tabs
  const renderCoachingStaffContent = () => {
    return (
      <>
        <Header>
          <Title>Coaching Staff</Title>
          <ActionButtons>
            <Button onClick={rotateTeamLevel}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              {teamLevel}
            </Button>
          </ActionButtons>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <EmptyState>
            <h3>Coaching Staff Management</h3>
            <p>Manage your {teamLevel} coaching staff and their abilities.</p>
            <Button primary>Coming Soon</Button>
          </EmptyState>
        </div>
      </>
    );
  };
  
  // Contracts content
  const renderContractsContent = () => {
    return (
      <>
        <Header>
          <Title>Contracts</Title>
          <ActionButtons>
            <Button onClick={rotateTeamLevel}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              {teamLevel}
            </Button>
          </ActionButtons>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <EmptyState>
            <h3>Contracts Management</h3>
            <p>Review and manage player contracts for {teamLevel} team.</p>
            <Button primary>Coming Soon</Button>
          </EmptyState>
        </div>
      </>
    );
  };
  
  const renderFreeAgentsContent = () => {
    return (
      <>
        <Header>
          <Title>Free Agents</Title>
          <ActionButtons>
            <Button onClick={rotateTeamLevel}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 3 21 3 21 9"></polyline>
                <polyline points="9 21 3 21 3 15"></polyline>
                <line x1="21" y1="3" x2="14" y2="10"></line>
                <line x1="3" y1="21" x2="10" y2="14"></line>
              </svg>
              {teamLevel}
            </Button>
          </ActionButtons>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <EmptyState>
            <h3>Free Agents</h3>
            <p>Browse and sign free agents for {teamLevel} league.</p>
            <Button primary>Coming Soon</Button>
          </EmptyState>
        </div>
      </>
    );
  };
  
  // Jersey Numbers & Leadership content
  const renderNumbersContent = () => {
    return (
      <>
        <Header>
          <Title>Jersey Numbers & Leadership</Title>
          <ActionButtons>
            <Button onClick={rotateTeamLevel}>
              {teamLevel}
            </Button>
          </ActionButtons>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          gap: '20px',
          overflowY: 'auto'
        }}>
          {/* Team Leadership Section */}
          <Card>
            <CardHeader>
              <h3>Team Leadership</h3>
              <p>Assign captaincy and alternate captain roles</p>
            </CardHeader>
            <CardContent>
              <RoleContainer>
                <RoleCard>
                  <RoleIcon>C</RoleIcon>
                  <RoleInfo>
                    <h4>Team Captain</h4>
                    <RoleDescription>
                      Bo Horvat (#53)<br />
                      Center, 29 years old<br />
                      Leadership Rating: A
                    </RoleDescription>
                    <Button primary small>Change</Button>
                  </RoleInfo>
                </RoleCard>
                
                <RoleCard>
                  <RoleIcon>A</RoleIcon>
                  <RoleInfo>
                    <h4>Alternate Captain</h4>
                    <RoleDescription>
                      Quinn Hughes (#43)<br />
                      Defenseman, 24 years old<br />
                      Leadership Rating: B+
                    </RoleDescription>
                    <Button primary small>Change</Button>
                  </RoleInfo>
                </RoleCard>
                
                <RoleCard>
                  <RoleIcon>A</RoleIcon>
                  <RoleInfo>
                    <h4>Alternate Captain</h4>
                    <RoleDescription>
                      J.T. Miller (#9)<br />
                      Center, 31 years old<br />
                      Leadership Rating: B
                    </RoleDescription>
                    <Button primary small>Change</Button>
                  </RoleInfo>
                </RoleCard>
              </RoleContainer>
            </CardContent>
          </Card>
          
          {/* Jersey Numbers Section */}
          <Card>
            <CardHeader>
              <h3>Player Jersey Numbers</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <SearchInput placeholder="Search players..." />
                <FilterButton>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  Filter
                </FilterButton>
              </div>
            </CardHeader>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHeader>
                    <tr>
                      <th>Player</th>
                      <th>Position</th>
                      <th>Current #</th>
                      <th>Preferred #</th>
                      <th>Actions</th>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: 1, name: 'Elias Pettersson', position: 'C', number: 40, preferred: 40, satisfaction: 'happy' },
                      { id: 2, name: 'Quinn Hughes', position: 'D', number: 43, preferred: 43, satisfaction: 'happy' },
                      { id: 3, name: 'Brock Boeser', position: 'RW', number: 6, preferred: 16, satisfaction: 'unsatisfied' },
                      { id: 4, name: 'Thatcher Demko', position: 'G', number: 35, preferred: 35, satisfaction: 'happy' },
                      { id: 5, name: 'J.T. Miller', position: 'C', number: 9, preferred: 9, satisfaction: 'happy' },
                      { id: 6, name: 'Bo Horvat', position: 'C', number: 53, preferred: 53, satisfaction: 'happy' },
                      { id: 7, name: 'Filip Hronek', position: 'D', number: 17, preferred: 17, satisfaction: 'happy' },
                      { id: 8, name: 'Dakota Joshua', position: 'LW', number: 81, preferred: 81, satisfaction: 'happy' },
                      { id: 9, name: 'Conor Garland', position: 'RW', number: 8, preferred: 8, satisfaction: 'happy' },
                      { id: 10, name: 'Tyler Myers', position: 'D', number: 57, preferred: 57, satisfaction: 'happy' },
                    ].map(player => (
                      <tr key={player.id}>
                        <td>{player.name}</td>
                        <td>{player.position}</td>
                        <td>{player.number}</td>
                        <td>
                          {player.preferred}
                          {player.number !== player.preferred && (
                            <MoodIcon status="negative">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M8 15s1.5 2 4 2 4-2 4-2"></path>
                                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                <line x1="15" y1="9" x2="15.01" y2="9"></line>
                              </svg>
                            </MoodIcon>
                          )}
                          {player.number === player.preferred && (
                            <MoodIcon status="positive">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                                <line x1="15" y1="9" x2="15.01" y2="9"></line>
                              </svg>
                            </MoodIcon>
                          )}
                        </td>
                        <td>
                          <ActionButton>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Change
                          </ActionButton>
                        </td>
                      </tr>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
          
          {/* Historical Jersey Numbers */}
          <Card>
            <CardHeader>
              <h3>Retired & Notable Numbers</h3>
            </CardHeader>
            <CardContent>
              <RetiredNumbersGrid>
                {[
                  { number: 10, player: 'Pavel Bure', status: 'retired' },
                  { number: 16, player: 'Trevor Linden', status: 'retired' },
                  { number: 12, player: 'Stan Smyl', status: 'retired' },
                  { number: 19, player: 'Markus Naslund', status: 'retired' },
                  { number: 22, player: 'Daniel Sedin', status: 'retired' },
                  { number: 33, player: 'Henrik Sedin', status: 'retired' },
                  { number: 23, player: 'Alexander Edler', status: 'notable' },
                  { number: 14, player: 'Alexandre Burrows', status: 'notable' },
                  { number: 17, player: 'Ryan Kesler', status: 'notable' },
                ].map(item => (
                  <RetiredNumber key={item.number} status={item.status}>
                    <div className="number">{item.number}</div>
                    <div className="player">{item.player}</div>
                    <div className="status">{item.status === 'retired' ? 'Retired' : 'Notable'}</div>
                  </RetiredNumber>
                ))}
              </RetiredNumbersGrid>
            </CardContent>
          </Card>
        </div>
      </>
    );
  };
  
  // Team Morale content
  const renderMoraleContent = () => {
    return (
      <>
        <Header>
          <Title>Team Morale</Title>
          <ActionButtons>
            <Button onClick={rotateTeamLevel}>
              {teamLevel}
            </Button>
          </ActionButtons>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          gap: '20px',
          overflowY: 'auto'
        }}>
          <MoraleContainer>
            {/* Overall Team Morale */}
            <MoraleSummary>
              <MoraleGauge value={78}>
                <div className="value">78%</div>
              </MoraleGauge>
              <MoraleStats>
                <h4>Team Morale: Good</h4>
                <div className="morale-description">
                  The team is feeling confident after the recent winning streak. Players are responding well to coaching and showing high engagement in practices.
                </div>
                
                <MoraleGroups>
                  <MoraleGroupItem value={82}>
                    <span className="label">Forwards:</span>
                    <span className="value">82%</span>
                  </MoraleGroupItem>
                  <MoraleGroupItem value={74}>
                    <span className="label">Defense:</span>
                    <span className="value">74%</span>
                  </MoraleGroupItem>
                  <MoraleGroupItem value={88}>
                    <span className="label">Goalies:</span>
                    <span className="value">88%</span>
                  </MoraleGroupItem>
                </MoraleGroups>
              </MoraleStats>
            </MoraleSummary>
            
            {/* Player Morale Breakdown */}
            <Card>
              <CardHeader>
                <h3>Player Morale</h3>
                <FilterButton>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  Filter
                </FilterButton>
              </CardHeader>
              <CardContent>
                <MoraleBreakdown>
                  {[
                    { id: 1, name: 'Elias Pettersson', position: 'C', number: 40, morale: 85, trend: 'up' },
                    { id: 2, name: 'Quinn Hughes', position: 'D', number: 43, morale: 90, trend: 'up' },
                    { id: 3, name: 'Brock Boeser', position: 'RW', number: 6, morale: 65, trend: 'down' },
                    { id: 4, name: 'Thatcher Demko', position: 'G', number: 35, morale: 88, trend: 'stable' },
                    { id: 5, name: 'J.T. Miller', position: 'C', number: 9, morale: 82, trend: 'up' },
                    { id: 6, name: 'Bo Horvat', position: 'C', number: 53, morale: 78, trend: 'stable' },
                    { id: 7, name: 'Tyler Myers', position: 'D', number: 57, morale: 76, trend: 'stable' },
                    { id: 8, name: 'Nils Höglander', position: 'LW', number: 21, morale: 80, trend: 'up' },
                    { id: 9, name: 'Conor Garland', position: 'RW', number: 8, morale: 81, trend: 'stable' },
                    { id: 10, name: 'Dakota Joshua', position: 'LW', number: 81, morale: 75, trend: 'down' },
                    { id: 11, name: 'Vasily Podkolzin', position: 'RW', number: 92, morale: 72, trend: 'up' },
                    { id: 12, name: 'Andrei Kuzmenko', position: 'LW', number: 96, morale: 79, trend: 'up' }
                  ].map(player => (
                    <MoralePlayerCard key={player.id}>
                      <MoralePlayerHeader 
                        morale={player.morale}
                        onClick={() => togglePlayerExpand(player.id)}
                      >
                        <div className="player-avatar">{player.number}</div>
                        <div className="player-info">
                          <div className="player-name">{player.name}</div>
                          <div className="player-position">{player.position}</div>
                        </div>
                        <div className="player-morale">
                          {player.morale}%
                          {player.trend === 'up' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="18 15 12 9 6 15"></polyline>
                            </svg>
                          )}
                          {player.trend === 'down' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          )}
                          {player.trend === 'stable' && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                          )}
                        </div>
                      </MoralePlayerHeader>
                      
                      {expandedPlayers[player.id] && (
                        <MoraleTimeline>
                          {player.id === 1 && (
                            <>
                              <MoraleEvent impact="positive">
                                <div className="event-title">Scored Hat Trick</div>
                                <div className="event-date">Nov 20, 2024</div>
                                <div className="event-description">Scored three goals against Boston, boosting confidence significantly.</div>
                              </MoraleEvent>
                              <MoraleEvent impact="positive">
                                <div className="event-title">Team Win</div>
                                <div className="event-date">Nov 18, 2024</div>
                                <div className="event-description">Contributed to a big team win against top division rival.</div>
                              </MoraleEvent>
                            </>
                          )}
                          {player.id === 2 && (
                            <>
                              <MoraleEvent impact="positive">
                                <div className="event-title">Named Player of the Week</div>
                                <div className="event-date">Nov 19, 2024</div>
                                <div className="event-description">Recognized for outstanding defensive performance.</div>
                              </MoraleEvent>
                            </>
                          )}
                          {player.id === 3 && (
                            <>
                              <MoraleEvent impact="negative">
                                <div className="event-title">Healthy Scratch</div>
                                <div className="event-date">Nov 17, 2024</div>
                                <div className="event-description">Was a healthy scratch against Calgary, decreasing morale.</div>
                              </MoraleEvent>
                              <MoraleEvent impact="neutral">
                                <div className="event-title">Media Criticism</div>
                                <div className="event-date">Nov 15, 2024</div>
                                <div className="event-description">Local media questioned recent performances.</div>
                              </MoraleEvent>
                            </>
                          )}
                          {player.id === 4 && (
                            <>
                              <MoraleEvent impact="positive">
                                <div className="event-title">Shutout</div>
                                <div className="event-date">Nov 21, 2024</div>
                                <div className="event-description">Recorded a 32-save shutout against Minnesota.</div>
                              </MoraleEvent>
                            </>
                          )}
                          {player.id === 5 && (
                            <>
                              <MoraleEvent impact="positive">
                                <div className="event-title">Point Streak</div>
                                <div className="event-date">Nov 22, 2024</div>
                                <div className="event-description">Extended point streak to 8 games.</div>
                              </MoraleEvent>
                            </>
                          )}
                          {player.id === 6 && (
                            <>
                              <MoraleEvent impact="neutral">
                                <div className="event-title">Lineup Change</div>
                                <div className="event-date">Nov 19, 2024</div>
                                <div className="event-description">Moved from first line to second line center.</div>
                              </MoraleEvent>
                            </>
                          )}
                        </MoraleTimeline>
                      )}
                    </MoralePlayerCard>
                  ))}
                </MoraleBreakdown>
              </CardContent>
            </Card>

            {/* Recent Morale Events */}
            <Card>
              <CardHeader>
                <h3>Recent Morale Events</h3>
              </CardHeader>
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHeader>
                      <tr>
                        <th>Date</th>
                        <th>Event</th>
                        <th>Players Affected</th>
                        <th>Impact</th>
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {[
                        { id: 1, date: 'Nov 22, 2024', event: 'Win vs. Ottawa (5-2)', players: 'Entire Team', impact: 'Positive (+5%)' },
                        { id: 2, date: 'Nov 21, 2024', event: 'Team Practice', players: 'Goaltenders', impact: 'Positive (+3%)' },
                        { id: 3, date: 'Nov 20, 2024', event: 'Pettersson Hat Trick', players: 'E. Pettersson', impact: 'Positive (+8%)' },
                        { id: 4, date: 'Nov 19, 2024', event: 'Hughes Named Player of Week', players: 'Q. Hughes', impact: 'Positive (+7%)' },
                        { id: 5, date: 'Nov 18, 2024', event: 'Win vs. Colorado (3-1)', players: 'Entire Team', impact: 'Positive (+4%)' },
                        { id: 6, date: 'Nov 17, 2024', event: 'Healthy Scratch', players: 'B. Boeser', impact: 'Negative (-10%)' },
                        { id: 7, date: 'Nov 15, 2024', event: 'Loss vs. Chicago (1-4)', players: 'Entire Team', impact: 'Negative (-3%)' },
                      ].map(event => (
                        <tr key={event.id}>
                          <td>{event.date}</td>
                          <td>{event.event}</td>
                          <td>{event.players}</td>
                          <td style={{ 
                            color: event.impact.includes('Positive') ? '#4CAF50' : 
                            event.impact.includes('Negative') ? '#F44336' : '#FFC107'
                          }}>
                            {event.impact}
                          </td>
                        </tr>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </MoraleContainer>
        </div>
      </>
    );
  };
  
  // Settings content
  const renderSettingsContent = () => {
    return (
      <>
        <Header>
          <Title>Season Settings</Title>
          <ActionButtons>
            <Button primary onClick={handleSave}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Save Settings
            </Button>
          </ActionButtons>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          gap: '20px',
          overflowY: 'auto'
        }}>
          <SettingsGrid>
            {/* Game Simulation Settings */}
            <SettingCard>
              <SettingHeader>
                <h3>Game Simulation</h3>
              </SettingHeader>
              <SettingContent>
                <SettingItem>
                  <div className="setting-label">
                    <label>Simulation Speed</label>
                    <div className="setting-value">Normal</div>
                  </div>
                  <div className="setting-description">
                    Controls how quickly games are simulated when using Sim to Next Game feature.
                  </div>
                  <Select defaultValue="normal">
                    <option value="very-slow">Very Slow</option>
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                    <option value="very-fast">Very Fast</option>
                  </Select>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Simulation Detail Level</label>
                    <div className="setting-value">High</div>
                  </div>
                  <div className="setting-description">
                    Higher detail generates more events and statistics during simulation.
                  </div>
                  <Select defaultValue="high">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Show Play-by-Play</label>
                  </div>
                  <div className="setting-description">
                    Display detailed play-by-play events during game simulation.
                  </div>
                  <Toggle>
                    <input type="checkbox" defaultChecked={true} />
                    <span className="slider"></span>
                  </Toggle>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Coach Influence</label>
                    <div className="setting-value">Medium (50%)</div>
                  </div>
                  <div className="setting-description">
                    How much impact coach attributes have on game simulation outcomes.
                  </div>
                  <Slider type="range" min="0" max="100" step="10" defaultValue="50" />
                </SettingItem>
              </SettingContent>
            </SettingCard>
            
            {/* NHL Rules Settings */}
            <SettingCard>
              <SettingHeader>
                <h3>NHL Rules</h3>
              </SettingHeader>
              <SettingContent>
                <SettingItem>
                  <div className="setting-label">
                    <label>Salary Cap</label>
                    <div className="setting-value">$83.5M</div>
                  </div>
                  <div className="setting-description">
                    Set the maximum salary cap for teams.
                  </div>
                  <Select defaultValue="83.5">
                    <option value="80.0">$80.0M</option>
                    <option value="83.5">$83.5M (NHL 2024-25)</option>
                    <option value="87.5">$87.5M</option>
                    <option value="90.0">$90.0M</option>
                    <option value="none">No Salary Cap</option>
                  </Select>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Salary Cap Floor</label>
                    <div className="setting-value">$61.7M</div>
                  </div>
                  <div className="setting-description">
                    Set the minimum salary floor for teams.
                  </div>
                  <Select defaultValue="61.7">
                    <option value="58.0">$58.0M</option>
                    <option value="61.7">$61.7M (NHL 2024-25)</option>
                    <option value="65.0">$65.0M</option>
                    <option value="none">No Salary Floor</option>
                  </Select>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Waiver Rules</label>
                  </div>
                  <div className="setting-description">
                    Enable NHL waiver rules for player movement between leagues.
                  </div>
                  <Toggle>
                    <input type="checkbox" defaultChecked={true} />
                    <span className="slider"></span>
                  </Toggle>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Trade Difficulty</label>
                    <div className="setting-value">Medium</div>
                  </div>
                  <div className="setting-description">
                    How challenging it is to make trades with AI teams.
                  </div>
                  <Select defaultValue="medium">
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="realistic">Realistic</option>
                  </Select>
                </SettingItem>
              </SettingContent>
            </SettingCard>
            
            {/* Season Structure Settings */}
            <SettingCard>
              <SettingHeader>
                <h3>Season Structure</h3>
              </SettingHeader>
              <SettingContent>
                <SettingItem>
                  <div className="setting-label">
                    <label>Regular Season Length</label>
                    <div className="setting-value">82 Games</div>
                  </div>
                  <div className="setting-description">
                    Number of games in the regular season.
                  </div>
                  <Select defaultValue="82">
                    <option value="56">56 Games</option>
                    <option value="70">70 Games</option>
                    <option value="82">82 Games (Standard)</option>
                    <option value="98">98 Games</option>
                  </Select>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Playoff Format</label>
                    <div className="setting-value">16 Teams, Best of 7</div>
                  </div>
                  <div className="setting-description">
                    Structure of playoff rounds and series length.
                  </div>
                  <Select defaultValue="standard">
                    <option value="standard">16 Teams, Best of 7 (Standard)</option>
                    <option value="expanded">24 Teams, Best of 7</option>
                    <option value="short-series">16 Teams, Best of 5</option>
                    <option value="conference">Conference Play Only</option>
                  </Select>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Preseason</label>
                  </div>
                  <div className="setting-description">
                    Enable preseason exhibition games before regular season.
                  </div>
                  <Toggle>
                    <input type="checkbox" defaultChecked={true} />
                    <span className="slider"></span>
                  </Toggle>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Minor League Simulation</label>
                  </div>
                  <div className="setting-description">
                    Simulate AHL and ECHL games for affiliated teams.
                  </div>
                  <Toggle>
                    <input type="checkbox" defaultChecked={true} />
                    <span className="slider"></span>
                  </Toggle>
                </SettingItem>
              </SettingContent>
            </SettingCard>
            
            {/* Gameplay Settings */}
            <SettingCard>
              <SettingHeader>
                <h3>Gameplay</h3>
              </SettingHeader>
              <SettingContent>
                <SettingItem>
                  <div className="setting-label">
                    <label>Game Balance</label>
                    <div className="setting-value">Realistic</div>
                  </div>
                  <div className="setting-description">
                    Adjust the balance between offense and defense in the game engine.
                  </div>
                  <Select defaultValue="realistic">
                    <option value="offense">Offense Heavy</option>
                    <option value="balanced">Balanced</option>
                    <option value="realistic">Realistic</option>
                    <option value="defense">Defense Heavy</option>
                  </Select>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Player Progression Speed</label>
                    <div className="setting-value">Medium</div>
                  </div>
                  <div className="setting-description">
                    How quickly young players develop and veterans decline.
                  </div>
                  <Select defaultValue="medium">
                    <option value="very-slow">Very Slow</option>
                    <option value="slow">Slow</option>
                    <option value="medium">Medium</option>
                    <option value="fast">Fast</option>
                    <option value="very-fast">Very Fast</option>
                  </Select>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Injuries</label>
                    <div className="setting-value">Realistic</div>
                  </div>
                  <div className="setting-description">
                    Controls frequency and severity of player injuries.
                  </div>
                  <Select defaultValue="realistic">
                    <option value="off">Off</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="realistic">Realistic</option>
                    <option value="high">High</option>
                  </Select>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Player Morale Effects</label>
                  </div>
                  <div className="setting-description">
                    Enable player morale system affecting performance.
                  </div>
                  <Toggle>
                    <input type="checkbox" defaultChecked={true} />
                    <span className="slider"></span>
                  </Toggle>
                </SettingItem>
              </SettingContent>
            </SettingCard>
            
            {/* User Interface Settings */}
            <SettingCard>
              <SettingHeader>
                <h3>User Interface</h3>
              </SettingHeader>
              <SettingContent>
                <SettingItem>
                  <div className="setting-label">
                    <label>Auto-Save</label>
                  </div>
                  <div className="setting-description">
                    Automatically save game progress after key events.
                  </div>
                  <Toggle>
                    <input type="checkbox" defaultChecked={true} />
                    <span className="slider"></span>
                  </Toggle>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>News Frequency</label>
                    <div className="setting-value">Medium</div>
                  </div>
                  <div className="setting-description">
                    Controls how often news articles and updates appear.
                  </div>
                  <Select defaultValue="medium">
                    <option value="minimal">Minimal</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Select>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Show Confirmation Dialogs</label>
                  </div>
                  <div className="setting-description">
                    Display confirmation prompts for important actions.
                  </div>
                  <Toggle>
                    <input type="checkbox" defaultChecked={true} />
                    <span className="slider"></span>
                  </Toggle>
                </SettingItem>
                
                <SettingItem>
                  <div className="setting-label">
                    <label>Show Real-Time Notifications</label>
                  </div>
                  <div className="setting-description">
                    Display popup notifications for important events.
                  </div>
                  <Toggle>
                    <input type="checkbox" defaultChecked={true} />
                    <span className="slider"></span>
                  </Toggle>
                </SettingItem>
              </SettingContent>
            </SettingCard>
          </SettingsGrid>
        </div>
      </>
    );
  };
  
  // Season Tasks content
  const renderTasksContent = () => {
    return (
      <>
        <Header>
          <Title>Season Tasks</Title>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '20px', backgroundColor: '#252932', borderRadius: '8px' }}>
            <ul className="task-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #333' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', marginRight: '10px', backgroundColor: '#295438', border: '1px solid #295438' }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#fff' }}>Set your lines for the season</p>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>Reward: $1.5M salary cap</span>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #333' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', marginRight: '10px', backgroundColor: '#B36C00', border: '1px solid #B36C00' }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#fff' }}>Win 10 games in a row</p>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>Progress: 8/10</span>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #333' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', marginRight: '10px', backgroundColor: 'transparent', border: '1px solid #555' }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#fff' }}>Trade for a goalie with 90+ rating</p>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>Reward: Extra draft pick</span>
                </div>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', marginRight: '10px', backgroundColor: 'transparent', border: '1px solid #555' }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#fff' }}>Make the playoffs</p>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>Reward: Contract extensions</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </>
    );
  };
  
  // Show loading indicator while fetching season data
  if (loading) {
    return (
      <PageContainer>
        <div style={{ margin: 'auto', textAlign: 'center', color: '#C4CED4' }}>
          <p>Loading season data...</p>
        </div>
      </PageContainer>
    );
  }
  
  // Season not found
  if (!season) {
    return (
      <PageContainer>
        <div style={{ margin: 'auto', textAlign: 'center', color: '#C4CED4' }}>
          <p>Season not found. <Link to="/season" style={{ color: '#B30E16' }}>Return to Season Mode</Link></p>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <SeasonLayoutContainer>
      <PageContainer>
        <Sidebar>
          <SidebarHeader>
            <h2>Franchise Overview</h2>
            <div className="franchise-info" style={{ marginBottom: '10px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B30E16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                <path d="M3 5c0 1.66 4 3 9 3s9-1.34 9-3"></path>
                <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
              </svg>
              CURRENT TEAM: {teamLevel}
            </div>
            <div className="franchise-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B30E16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              NEXT GAME: 1 DAY(S)
            </div>
            <div className="franchise-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B30E16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              CURRENT DATE: NOV 22, 2024
            </div>
            <div className="franchise-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B30E16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              LOCKER ROOM CHEMISTRY: 74%
            </div>
            <div className="franchise-info">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B30E16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
              PLAYER MEETINGS: 0
            </div>
          </SidebarHeader>
          
          <SidebarTeamInfo>
            {communityPack === 1 && season?.selectedTeam?.abbreviation && getTeamLogo(season.selectedTeam.abbreviation) ? (
              <TeamLogo 
                textColor="#ffffff"
                logoUrl={getTeamLogo(season.selectedTeam.abbreviation)}
              >
                {/* Logo will be shown as background image */}
              </TeamLogo>
            ) : (
              <TeamLogo 
                textColor="#ffffff"
                logoUrl={season?.selectedTeam?.logoUrl}
              >
                {!season?.selectedTeam?.logoUrl && (season?.selectedTeam?.abbreviation || 'TM')}
              </TeamLogo>
            )}
            <TeamName>
              <h3>{season?.selectedTeam?.team || 'Team Name'}</h3>
              <p>{season?.name || '2023-24 Season'} ({teamLevel})</p>
            </TeamName>
          </SidebarTeamInfo>
          
          <SeasonInfo>
            <p>
              <span>Record:</span>
              <span>{calendarData.record || '0-0-0'}</span>
            </p>
            <p>
              <span>Position:</span>
              <span>{calendarData.position || '7th Atlantic'}</span>
            </p>
            <p>
              <span>Points:</span>
              <span>{calendarData.points || '0 pts'} ({calendarData.gamesPlayed || '0'} GP)</span>
            </p>
          </SeasonInfo>
          
          <NavList>
            <NavItem active={activeTab === 'home'}>
              <div onClick={() => setActiveTab('home')}>Season Dashboard</div>
            </NavItem>
            <NavItem active={activeTab === 'calendar'}>
              <div onClick={() => setActiveTab('calendar')}>Calendar</div>
            </NavItem>
            <NavItem active={activeTab === 'stats'}>
              <div onClick={() => setActiveTab('stats')}>Statistics</div>
            </NavItem>
            <NavItem active={activeTab === 'standings'}>
              <div onClick={() => setActiveTab('standings')}>Standings</div>
            </NavItem>
            <NavItem active={activeTab === 'awards'}>
              <div onClick={() => setActiveTab('awards')}>Awards</div>
            </NavItem>
            <NavItem active={activeTab === 'lines'}>
              <div onClick={() => setActiveTab('lines')}>Line Combinations</div>
            </NavItem>
            <NavItem active={activeTab === 'coaching'}>
              <div onClick={() => setActiveTab('coaching')}>Coaching Staff</div>
            </NavItem>
            <NavItem active={activeTab === 'trades'}>
              <div onClick={() => setActiveTab('trades')}>Trade</div>
            </NavItem>
            <NavItem active={activeTab === 'contracts'}>
              <div onClick={() => setActiveTab('contracts')}>Contracts</div>
            </NavItem>
            <NavItem active={activeTab === 'freeAgents'}>
              <div onClick={() => setActiveTab('freeAgents')}>Free Agents</div>
            </NavItem>
            <NavItem active={activeTab === 'numbers'}>
              <div onClick={() => setActiveTab('numbers')}>Numbers</div>
            </NavItem>
            <NavItem active={activeTab === 'morale'}>
              <div onClick={() => setActiveTab('morale')}>Morale</div>
            </NavItem>
            
            <CollapsibleSection active={activeTab === 'tasks'} expanded={tasksExpanded}>
              <div className="section-header" onClick={() => setTasksExpanded(!tasksExpanded)}>
                <span>Season Tasks</span>
                <span className="toggle-icon">▼</span>
              </div>
              <div className="section-content">
                <div className="task-item" onClick={() => setActiveTab('tasks')}>
                  <div className="task-status completed"></div>
                  <span>Set your lines for the season</span>
                </div>
                <div className="task-item" onClick={() => setActiveTab('tasks')}>
                  <div className="task-status in-progress"></div>
                  <span>Win 10 games in a row (8/10)</span>
                </div>
                <div className="task-item" onClick={() => setActiveTab('tasks')}>
                  <div className="task-status not-started"></div>
                  <span>Trade for a goalie with 90+ rating</span>
                </div>
                <div className="task-item" onClick={() => setActiveTab('tasks')}>
                  <div className="task-status not-started"></div>
                  <span>Make the playoffs</span>
                </div>
                <div className="task-item see-more" onClick={() => setActiveTab('tasks')}>
                  <span style={{ fontStyle: 'italic', color: '#4A90E2', cursor: 'pointer' }}>See More...</span>
                </div>
              </div>
            </CollapsibleSection>
            
            <NavItem active={activeTab === 'settings'}>
              <div onClick={() => setActiveTab('settings')}>Settings</div>
            </NavItem>
          </NavList>
          
          <SidebarFooter>
            <div className="primary-buttons">
              <FooterButton onClick={handleSave}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save
              </FooterButton>
              <FooterButton primary onClick={handleExitToMenu}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
                Exit
              </FooterButton>
            </div>
          </SidebarFooter>
        </Sidebar>
        
        <MainContent>
          <ContentArea>
            <CustomScrollArea>
              {activeTab === 'home' && (
                <>
                  <Header>
                    <Title>Season Dashboard</Title>
                    <ActionButtons>
                      <Button onClick={rotateTeamLevel}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <polyline points="9 21 3 21 3 15"></polyline>
                          <line x1="21" y1="3" x2="14" y2="10"></line>
                          <line x1="3" y1="21" x2="10" y2="14"></line>
                        </svg>
                        {teamLevel}
                      </Button>
                      <Button onClick={simulateToNextDay}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        Advance Day
                      </Button>
                      {hasTodayGame() && (
                        <Button onClick={simulateToday}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polygon points="10 8 16 12 10 16 10 8"></polygon>
                          </svg>
                          Simulate Today Game
                        </Button>
                      )}
                      <Button primary onClick={simulateNextGame}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Sim to Next Game
                      </Button>
                    </ActionButtons>
                  </Header>
                  
                  <WeekViewCalendar>
                    <WeekCalendarHeader>
                      <h2>CALENDAR</h2>
                      <div className="calendar-date">{currentCalendarDate}</div>
                    </WeekCalendarHeader>
                    <CalendarDays>
                      {weekDays.map((day, index) => (
                        <WeekDay 
                          key={index}
                          active={day.isToday}
                          hasGame={day.hasGame}
                          isHomeGame={day.isHomeGame}
                        >
                          <div className="day-name">
                            {day.dayName} {day.dayNumber}
                          </div>
                          <div className="day-number">{day.monthName}</div>
                          
                          {day.affiliateGame && (
                            <div className="team-level-indicator">
                              <img src={getTeamLogo(day.affiliate)} alt={day.affiliate} />
                            </div>
                          )}

                          {/* For the specific day 20, force both game and result to show */}
                          {day.dayNumber === 20 && day.monthName === "NOV" && (
                            <>
                              <div className="game-info">
                                {communityPack === 1 && (
                                  <>
                                    <img className="team-logo" src={getTeamLogo('VAN')} alt="VAN" />
                                    <span className="vs">VS</span>
                                    <img className="team-logo" src={getTeamLogo('BUF')} alt="BUF" />
                                  </>
                                )}
                              </div>
                              <div className="game-result">4-1</div>
                            </>
                          )}

                          {/* For all other days, use the regular logic */}
                          {(day.dayNumber !== 20 || day.monthName !== "NOV") && day.hasGame && (
                            <div className="game-info">
                              {communityPack === 1 && (
                                <>
                                  {day.isHomeGame ? (
                                    <>
                                      <img className="team-logo" src={getTeamLogo('VAN')} alt="VAN" />
                                      <span className="vs">VS</span>
                                      <img className="team-logo" src={getTeamLogo(day.opponent)} alt={day.opponent} />
                                    </>
                                  ) : (
                                    <>
                                      <img className="team-logo" src={getTeamLogo(day.opponent)} alt={day.opponent} />
                                      <span className="vs">@</span>
                                      <img className="team-logo" src={getTeamLogo('VAN')} alt="VAN" />
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          )}

                          {(day.dayNumber !== 20 || day.monthName !== "NOV") && day.hasGame && day.gameCompleted && (
                            <div className="game-result">
                              {day.gameResult}
                            </div>
                          )}

                          {day.isToday && (
                            <div className="active-day-indicator"></div>
                          )}
                        </WeekDay>
                      ))}
                    </CalendarDays>
                  </WeekViewCalendar>
                  
                  {/* Game Result Modal */}
                  {showGameModal && gameResult && (
                    <div 
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000
                      }}
                      onClick={() => setShowGameModal(false)}
                    >
                      <div 
                        style={{
                          backgroundColor: '#1d2330',
                          padding: '30px',
                          borderRadius: '8px',
                          maxWidth: '500px',
                          width: '100%',
                          textAlign: 'center',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                          border: '1px solid #333'
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        <h2 style={{ marginTop: 0, color: '#fff' }}>Game Result</h2>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '30px 0', alignItems: 'center' }}>
                          <div style={{ textAlign: 'center', width: '40%' }}>
                            <img 
                              src={getTeamLogo(gameResult.homeTeam)} 
                              alt={gameResult.homeTeam}
                              style={{ width: '80px', height: '80px' }}
                            />
                            <h3 style={{ marginBottom: '5px', color: '#fff' }}>{gameResult.homeTeam}</h3>
                          </div>
                          
                          <div style={{ textAlign: 'center', fontSize: '32px', fontWeight: 'bold', color: '#fff' }}>
                            {gameResult.homeGoals} - {gameResult.awayGoals}
                          </div>
                          
                          <div style={{ textAlign: 'center', width: '40%' }}>
                            <img 
                              src={getTeamLogo(gameResult.awayTeam)} 
                              alt={gameResult.awayTeam}
                              style={{ width: '80px', height: '80px' }}
                            />
                            <h3 style={{ marginBottom: '5px', color: '#fff' }}>{gameResult.awayTeam}</h3>
                          </div>
                        </div>
                        
                        <div style={{ 
                          backgroundColor: gameResult.userTeamWon ? '#295438' : '#8B0000',
                          padding: '10px',
                          borderRadius: '4px',
                          color: 'white',
                          fontWeight: 'bold',
                          marginBottom: '20px'
                        }}>
                          {gameResult.userTeamWon ? 'VICTORY' : 'DEFEAT'}
                        </div>
                        
                        <button 
                          style={{
                            backgroundColor: '#333',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                          onClick={() => setShowGameModal(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column' }}>
                    <MatchupCard>
                      <MatchupHeader>
                        <h3>Next Game</h3>
                        <span>FRI 22</span>
                      </MatchupHeader>
                      
                      <MatchupTeams>
                        <MatchupTeam>
                          {communityPack === 1 ? (
                            <img 
                              src={getTeamLogo('VAN')} 
                              alt="Vancouver Canucks" 
                            />
                          ) : (
                            <img 
                              src={season?.selectedTeam?.logoUrl || PlayerSilhouette} 
                              alt="Vancouver Canucks" 
                            />
                          )}
                          <h4>VANCOUVER</h4>
                          <p>CANUCKS</p>
                          <p>8-7-3</p>
                        </MatchupTeam>
                        
                        <VersusContainer>
                          <span>VS</span>
                          <p>Canadian Tire Centre™</p>
                        </VersusContainer>
                        
                        <MatchupTeam>
                          {communityPack === 1 ? (
                            <img 
                              src={getTeamLogo('OTT')} 
                              alt="Ottawa Senators" 
                            />
                          ) : (
                            <img 
                              src={PlayerSilhouette} 
                              alt="Ottawa Senators" 
                            />
                          )}
                          <h4>OTTAWA</h4>
                          <p>SENATORS</p>
                          <p>9-9-1</p>
                        </MatchupTeam>
                      </MatchupTeams>
                      
                      <StatComparison>
                        <StatRow highlight="home">
                          <div className="home-stat">3.11</div>
                          <div className="stat-label">GOALS FOR PER GAME</div>
                          <div className="away-stat">2.79</div>
                        </StatRow>
                        <StatRow highlight="away">
                          <div className="home-stat">2.84</div>
                          <div className="stat-label">GOALS AGAINST PER GAME</div>
                          <div className="away-stat">3.11</div>
                        </StatRow>
                        <StatRow highlight="home">
                          <div className="home-stat">18.2%</div>
                          <div className="stat-label">POWERPLAY %</div>
                          <div className="away-stat">21.4%</div>
                        </StatRow>
                        <StatRow highlight="home">
                          <div className="home-stat">84.5%</div>
                          <div className="stat-label">PENALTY KILL %</div>
                          <div className="away-stat">85.5%</div>
                        </StatRow>
                      </StatComparison>
                      
                      <MatchupDetails>
                        <MatchupSubHeader>PROJECTED GOALIES</MatchupSubHeader>
                        
                        <GoalieComparison>
                          <GoalieCard primary>
                            <img 
                              className="goalie-photo" 
                              src={PlayerSilhouette} 
                              alt="Arturs Silovs" 
                            />
                            <div className="goalie-info">
                              <h4>
                                <span className="number">#31</span>
                                ARTURS SILOVS
                              </h4>
                              <div className="goalie-stats">
                                <div className="stat-row">
                                  <div className="stat-label">GP</div>
                                  <div className="stat-value">5</div>
                                </div>
                                <div className="stat-row">
                                  <div className="stat-label">W</div>
                                  <div className="stat-value">1</div>
                                </div>
                                <div className="stat-row">
                                  <div className="stat-label">SV%</div>
                                  <div className="stat-value">.921</div>
                                </div>
                                <div className="stat-row">
                                  <div className="stat-label">GAA</div>
                                  <div className="stat-value">2.77</div>
                                </div>
                              </div>
                            </div>
                          </GoalieCard>
                          
                          <GoalieCard>
                            <img 
                              className="goalie-photo" 
                              src={PlayerSilhouette} 
                              alt="Linus Ullmark" 
                            />
                            <div className="goalie-info">
                              <h4>
                                <span className="number">#29</span>
                                LINUS ULLMARK
                              </h4>
                              <div className="goalie-stats">
                                <div className="stat-row">
                                  <div className="stat-label">GP</div>
                                  <div className="stat-value">17</div>
                                </div>
                                <div className="stat-row">
                                  <div className="stat-label">W</div>
                                  <div className="stat-value">9</div>
                                </div>
                                <div className="stat-row">
                                  <div className="stat-label">SV%</div>
                                  <div className="stat-value">.913</div>
                                </div>
                                <div className="stat-row">
                                  <div className="stat-label">GAA</div>
                                  <div className="stat-value">2.97</div>
                                </div>
                              </div>
                            </div>
                          </GoalieCard>
                        </GoalieComparison>
                      </MatchupDetails>
                      
                      <MatchupDetails>
                        <MatchupSubHeader>TEAM LEADERS</MatchupSubHeader>
                        
                        <TeamLeaders>
                          <LeaderCard>
                            <h4>Vancouver Canucks</h4>
                            <div className="leader-row">
                              <img 
                                src={PlayerSilhouette} 
                                alt="J. Debrusk" 
                              />
                              <div className="leader-info">
                                <p className="leader-name">J. DEBRUSK</p>
                                <p className="leader-position">#74 LW</p>
                              </div>
                              <div className="leader-stat">18 PTS</div>
                            </div>
                            <div className="leader-row">
                              <img 
                                src={PlayerSilhouette} 
                                alt="C. Giroux" 
                              />
                              <div className="leader-info">
                                <p className="leader-name">C. GIROUX</p>
                                <p className="leader-position">#28 C</p>
                              </div>
                              <div className="leader-stat">21 PTS</div>
                            </div>
                            <div className="leader-section-title">Goal Scorers</div>
                            <div className="leader-row">
                              <img 
                                src={PlayerSilhouette} 
                                alt="B. Horvat" 
                              />
                              <div className="leader-info">
                                <p className="leader-name">B. HORVAT</p>
                                <p className="leader-position">#53 C</p>
                              </div>
                              <div className="leader-stat">12 G</div>
                            </div>
                            <div className="leader-row">
                              <img 
                                src={PlayerSilhouette} 
                                alt="E. Pettersson" 
                              />
                              <div className="leader-info">
                                <p className="leader-name">E. PETTERSSON</p>
                                <p className="leader-position">#40 C</p>
                              </div>
                              <div className="leader-stat">10 G</div>
                            </div>
                            <div className="leader-section-title">Other Leaders</div>
                            <div className="leader-row">
                              <img 
                                src={PlayerSilhouette} 
                                alt="Q. Hughes" 
                              />
                              <div className="leader-info">
                                <p className="leader-name">Q. HUGHES</p>
                                <p className="leader-position">#43 D</p>
                              </div>
                              <div className="leader-stat">+12</div>
                            </div>
                            <div className="leader-row">
                              <img 
                                src={PlayerSilhouette} 
                                alt="T. Myers" 
                              />
                              <div className="leader-info">
                                <p className="leader-name">T. MYERS</p>
                                <p className="leader-position">#57 D</p>
                              </div>
                              <div className="leader-stat">24:35 TOI</div>
                            </div>
                          </LeaderCard>
                          
                          <LeaderCard>
                            <h4>Ottawa Senators</h4>
                            <div className="leader-row">
                              <img 
                                src={PlayerSilhouette} 
                                alt="Player 1" 
                              />
                              <div className="leader-info">
                                <p className="leader-name">T. CHABOT</p>
                                <p className="leader-position">#72 D</p>
                              </div>
                              <div className="leader-stat">15 PTS</div>
                            </div>
                            <div className="leader-row">
                              <img 
                                src={PlayerSilhouette} 
                                alt="Player 2" 
                              />
                              <div className="leader-info">
                                <p className="leader-name">B. TKACHUK</p>
                                <p className="leader-position">#7 LW</p>
                              </div>
                              <div className="leader-stat">19 PTS</div>
                            </div>
                            <div className="leader-section-title">Goal Scorers</div>
                            <div className="leader-row">
                              <img 
                                src={PlayerSilhouette} 
                                alt="B. Tkachuk" 
                              />
                              <div className="leader-info">
                                <p className="leader-name">B. TKACHUK</p>
                                <p className="leader-position">#7 LW</p>
                              </div>
                              <div className="leader-stat">9 G</div>
                            </div>
                            <div className="leader-row">
                              <img 
                                src={PlayerSilhouette} 
                                alt="D. Batherson" 
                              />
                              <div className="leader-info">
                                <p className="leader-name">D. BATHERSON</p>
                                <p className="leader-position">#19 RW</p>
                              </div>
                              <div className="leader-stat">8 G</div>
                            </div>
                            <div className="leader-section-title">Other Leaders</div>
                            <div className="leader-row">
                              <img 
                                src={PlayerSilhouette} 
                                alt="A. Zub" 
                              />
                              <div className="leader-info">
                                <p className="leader-name">A. ZUB</p>
                                <p className="leader-position">#2 D</p>
                              </div>
                              <div className="leader-stat">+8</div>
                            </div>
                            <div className="leader-row">
                              <img 
                                src={PlayerSilhouette} 
                                alt="T. Chabot" 
                              />
                              <div className="leader-info">
                                <p className="leader-name">T. CHABOT</p>
                                <p className="leader-position">#72 D</p>
                              </div>
                              <div className="leader-stat">25:21 TOI</div>
                            </div>
                          </LeaderCard>
                        </TeamLeaders>
                      </MatchupDetails>
                    </MatchupCard>
                    
                    <PointsLeaderSection>
                      <div className="points-scrolling">
                        <span>1) <strong>C. MCDAVID - 29</strong></span>
                        <span>2) <strong>N. MACKINNON - 29</strong></span>
                        <span>3) <strong>M. MARNER - 29</strong></span>
                        <span>4) <strong>N. KUCHEROV - 27</strong></span>
                        <span>5) <strong>M. RANTANEN - 27</strong></span>
                        <span>6) <strong>N. EHLERS - 26</strong></span>
                        <span>7) <strong>A. MATTHEWS - 26</strong></span>
                        <span>8) <strong>J. ROBERTSON - 25</strong></span>
                        <span>9) <strong>D. PASTRNAK - 25</strong></span>
                        <span>10) <strong>E. PETTERSSON - 24</strong></span>
                      </div>
                    </PointsLeaderSection>
                  </div>
                </>
              )}
              
              {activeTab !== 'home' && renderContent()}
            </CustomScrollArea>
          </ContentArea>
        </MainContent>
        
        <MatchupSidebar>
          <StandingsContainer>
            <h3>
              {activeDivision} DIVISION
              <div className="division-arrows">
                <button onClick={prevDivision}>◀</button>
                <button onClick={nextDivision}>▶</button>
              </div>
            </h3>
            <table className="standings-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Team</th>
                  <th>GP</th>
                  <th>W</th>
                  <th>L</th>
                  <th>OTL</th>
                  <th>PTS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('BOS')} alt="BOS" />
                    ) : (
                      <span>BOS</span>
                    )}
                    Boston
                  </td>
                  <td>20</td>
                  <td>13</td>
                  <td>4</td>
                  <td>3</td>
                  <td className="highlight">29</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('TOR')} alt="TOR" />
                    ) : (
                      <span>TOR</span>
                    )}
                    Toronto
                  </td>
                  <td>21</td>
                  <td>12</td>
                  <td>6</td>
                  <td>3</td>
                  <td className="highlight">27</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('FLA')} alt="FLA" />
                    ) : (
                      <span>FLA</span>
                    )}
                    Florida
                  </td>
                  <td>19</td>
                  <td>12</td>
                  <td>6</td>
                  <td>1</td>
                  <td className="highlight">25</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('TBL')} alt="TBL" />
                    ) : (
                      <span>TBL</span>
                    )}
                    Tampa Bay
                  </td>
                  <td>19</td>
                  <td>12</td>
                  <td>7</td>
                  <td>0</td>
                  <td className="highlight">24</td>
                </tr>
                <tr>
                  <td>5</td>
                  <td className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('MTL')} alt="MTL" />
                    ) : (
                      <span>MTL</span>
                    )}
                    Montreal
                  </td>
                  <td>20</td>
                  <td>10</td>
                  <td>8</td>
                  <td>2</td>
                  <td className="highlight">22</td>
                </tr>
                <tr>
                  <td>6</td>
                  <td className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('BUF')} alt="BUF" />
                    ) : (
                      <span>BUF</span>
                    )}
                    Buffalo
                  </td>
                  <td>19</td>
                  <td>9</td>
                  <td>7</td>
                  <td>3</td>
                  <td className="highlight">21</td>
                </tr>
                <tr>
                  <td>7</td>
                  <td className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('OTT')} alt="OTT" />
                    ) : (
                      <span>OTT</span>
                    )}
                    Ottawa
                  </td>
                  <td>19</td>
                  <td>9</td>
                  <td>9</td>
                  <td>1</td>
                  <td className="highlight">19</td>
                </tr>
                <tr className="highlight">
                  <td>8</td>
                  <td className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('VAN')} alt="VAN" />
                    ) : (
                      <span>VAN</span>
                    )}
                    Vancouver
                  </td>
                  <td>18</td>
                  <td>8</td>
                  <td>7</td>
                  <td>3</td>
                  <td className="highlight">19</td>
                </tr>
              </tbody>
            </table>
          </StandingsContainer>
          
          <LeagueStandingsContainer>
            <h3>LEAGUE STANDINGS</h3>
            <div className="standings-groups">
              <div className="standings-group">
                <h4>Top Teams</h4>
                <div className="team-row">
                  <div className="rank">1</div>
                  <div className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('COL')} alt="COL" />
                    ) : (
                      <span>COL</span>
                    )}
                    <div className="team-name">Colorado</div>
                  </div>
                  <div className="points">35</div>
                </div>
                <div className="team-row">
                  <div className="rank">2</div>
                  <div className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('VGK')} alt="VGK" />
                    ) : (
                      <span>VGK</span>
                    )}
                    <div className="team-name">Vegas</div>
                  </div>
                  <div className="points">32</div>
                </div>
                <div className="team-row">
                  <div className="rank">3</div>
                  <div className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('BOS')} alt="BOS" />
                    ) : (
                      <span>BOS</span>
                    )}
                    <div className="team-name">Boston</div>
                  </div>
                  <div className="points">29</div>
                </div>
              </div>
              
              <div className="standings-group">
                <h4>Bottom Teams</h4>
                <div className="team-row">
                  <div className="rank">30</div>
                  <div className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('ANA')} alt="ANA" />
                    ) : (
                      <span>ANA</span>
                    )}
                    <div className="team-name">Anaheim</div>
                  </div>
                  <div className="points">11</div>
                </div>
                <div className="team-row">
                  <div className="rank">31</div>
                  <div className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('SJS')} alt="SJS" />
                    ) : (
                      <span>SJS</span>
                    )}
                    <div className="team-name">San Jose</div>
                  </div>
                  <div className="points">9</div>
                </div>
                <div className="team-row">
                  <div className="rank">32</div>
                  <div className="team">
                    {communityPack === 1 ? (
                      <img src={getTeamLogo('CHI')} alt="CHI" />
                    ) : (
                      <span>CHI</span>
                    )}
                    <div className="team-name">Chicago</div>
                  </div>
                  <div className="points">7</div>
                </div>
              </div>
            </div>
          </LeagueStandingsContainer>
          
          <TradesProposalContainer>
            <h3>TRADE PROPOSAL</h3>
            <div className="action-buttons">
              <button className="accept">Accept</button>
              <button className="negotiate">Negotiate</button>
              <button className="reject">Reject</button>
            </div>
            <div className="trade-proposals-container">
              <div className="trade-proposal">
                <div className="status-indicator">NEW</div>
                <div className="team-side">
                  {communityPack === 1 ? (
                    <img src={getTeamLogo('VAN')} alt="VAN" />
                  ) : (
                    <img src={season?.selectedTeam?.logoUrl || PlayerSilhouette} alt="Your Team" />
                  )}
                  <h4>YOU RECEIVE</h4>
                  <p>D. PASTRNAK</p>
                  <p>2024 RD3</p>
                </div>
                
                <span className="vs">↔</span>
                
                <div className="team-side">
                  {communityPack === 1 ? (
                    <img src={getTeamLogo('BOS')} alt="BOS" />
                  ) : (
                    <img src={PlayerSilhouette} alt="Trading Team" />
                  )}
                  <h4>BOS RECEIVES</h4>
                  <p>C. GIROUX</p>
                  <p>J. DEBRUSK</p>
                  <p>2024 RD1</p>
                </div>
              </div>
              
              <div className="trade-proposal old">
                <div className="status-indicator">2 DAYS AGO</div>
                <div className="team-side">
                  {communityPack === 1 ? (
                    <img src={getTeamLogo('VAN')} alt="VAN" />
                  ) : (
                    <img src={season?.selectedTeam?.logoUrl || PlayerSilhouette} alt="Your Team" />
                  )}
                  <h4>YOU RECEIVE</h4>
                  <p>C. MAKAR</p>
                </div>
                
                <span className="vs">↔</span>
                
                <div className="team-side">
                  {communityPack === 1 ? (
                    <img src={getTeamLogo('COL')} alt="COL" />
                  ) : (
                    <img src={PlayerSilhouette} alt="Trading Team" />
                  )}
                  <h4>COL RECEIVES</h4>
                  <p>Q. HUGHES</p>
                  <p>2025 RD1</p>
                  <p>2026 RD2</p>
                </div>
              </div>
              
              <div className="trade-proposal old">
                <div className="status-indicator">5 DAYS AGO</div>
                <div className="team-side">
                  {communityPack === 1 ? (
                    <img src={getTeamLogo('VAN')} alt="VAN" />
                  ) : (
                    <img src={season?.selectedTeam?.logoUrl || PlayerSilhouette} alt="Your Team" />
                  )}
                  <h4>YOU RECEIVE</h4>
                  <p>F. ANDERSEN</p>
                  <p>2024 RD5</p>
                </div>
                
                <span className="vs">↔</span>
                
                <div className="team-side">
                  {communityPack === 1 ? (
                    <img src={getTeamLogo('CAR')} alt="CAR" />
                  ) : (
                    <img src={PlayerSilhouette} alt="Trading Team" />
                  )}
                  <h4>CAR RECEIVES</h4>
                  <p>A. SILOVS</p>
                  <p>2024 RD3</p>
                </div>
              </div>
            </div>
          </TradesProposalContainer>
          
          <NewsContainer>
            <h3>HOCKEY NEWS</h3>
            <ul className="news-list">
              <li className="news-item">
                <div className="news-header">
                  <img src={PlayerSilhouette} alt="Journalist" />
                  <span className="journalist-name">Elliotte Friedman</span>
                  <span className="news-time">2h ago</span>
                </div>
                <div className="news-content">
                  Hearing that Vancouver is in serious trade talks with Boston regarding RW David Pastrnak. Could be a blockbuster in the making. Several pieces involved.
                </div>
                <div className="news-team">
                  <img src={getTeamLogo('VAN')} alt="VAN" />
                  Vancouver Canucks
                </div>
              </li>
              <li className="news-item">
                <div className="news-header">
                  <img src={PlayerSilhouette} alt="Journalist" />
                  <span className="journalist-name">Kevin Weekes</span>
                  <span className="news-time">5h ago</span>
                </div>
                <div className="news-content">
                  BREAKING: Arturs Silovs expected to start tomorrow vs Ottawa. Goalie has been strong in practice this week after recovering from minor injury.
                </div>
                <div className="news-team">
                  <img src={getTeamLogo('VAN')} alt="VAN" />
                  Vancouver Canucks
                </div>
              </li>
              <li className="news-item">
                <div className="news-header">
                  <img src={PlayerSilhouette} alt="Journalist" />
                  <span className="journalist-name">Darren Dreger</span>
                  <span className="news-time">1d ago</span>
                </div>
                <div className="news-content">
                  Claude Giroux is on pace for his best offensive season in years. Vancouver's gamble on the veteran forward is paying off in a big way.
                </div>
                <div className="news-team">
                  <img src={getTeamLogo('VAN')} alt="VAN" />
                  Vancouver Canucks
                </div>
              </li>
              <li className="news-item">
                <div className="news-header">
                  <img src={PlayerSilhouette} alt="Journalist" />
                  <span className="journalist-name">Chris Johnston</span>
                  <span className="news-time">2d ago</span>
                </div>
                <div className="news-content">
                  League sources tell me Vancouver's AHL affiliate will be getting a new head coach next season. Team looking to align development systems across all levels.
                </div>
                <div className="news-team">
                  <img src={getTeamLogo('AHL')} alt="AHL" />
                  AHL Affiliate
                </div>
              </li>
            </ul>
          </NewsContainer>
        </MatchupSidebar>
      </PageContainer>
    </SeasonLayoutContainer>
  );
};

export default SeasonDashboard; 