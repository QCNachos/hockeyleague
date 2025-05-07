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
  padding: 15px;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  h3 {
    margin-top: 0;
    color: #C4CED4;
  }
  
  p {
    color: #aaa;
  }
`;

// Add these new styled components after the existing Card component
const MatchupCard = styled.div`
  background-color: #1d2330;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid #333;
`;

const MatchupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  
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
  margin-bottom: 15px;
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
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #333;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
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
  cursor: pointer;
  
  &:hover {
    background-color: #252932;
  }
  
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
  margin-top: 30px;
`;

const MatchupSubHeader = styled.div`
  text-transform: uppercase;
  color: #fff;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  padding: 12px 0;
  background-color: #252932;
  margin-bottom: 15px;
  border-radius: 4px;
`;

const GoalieComparison = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const GoalieCard = styled.div`
  display: flex;
  align-items: center;
  background-color: #252932;
  border-radius: 8px;
  padding: 15px;
  
  .goalie-photo {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 15px;
    border: 2px solid ${props => props.primary ? '#B30E16' : '#333'};
  }
  
  .goalie-info {
    flex: 1;
    
    h4 {
      font-size: 16px;
      margin: 0 0 5px 0;
      color: #fff;
      display: flex;
      align-items: center;
      
      .number {
        background: #333;
        border-radius: 4px;
        padding: 1px 4px;
        margin-right: 6px;
        font-size: 12px;
      }
    }
    
    .goalie-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 5px 15px;
      margin-top: 10px;
      
      .stat-row {
        display: flex;
        justify-content: space-between;
        
        .stat-label {
          color: #888;
          font-size: 12px;
        }
        
        .stat-value {
          color: #fff;
          font-size: 12px;
          font-weight: bold;
        }
      }
    }
  }
`;

const TeamLeaders = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 20px;
`;

const LeaderCard = styled.div`
  background-color: #252932;
  border-radius: 8px;
  padding: 15px;
  
  h4 {
    color: #C4CED4;
    margin: 0 0 12px 0;
    font-size: 14px;
    text-transform: uppercase;
  }
  
  .leader-row {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    
    img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      margin-right: 10px;
    }
    
    .leader-info {
      flex: 1;
      
      .leader-name {
        color: #fff;
        font-size: 14px;
        margin: 0;
      }
      
      .leader-position {
        color: #888;
        font-size: 12px;
        margin: 0;
      }
    }
    
    .leader-stat {
      color: #B30E16;
      font-weight: bold;
      font-size: 16px;
      margin-left: 10px;
    }
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
  overflow-y: auto;
  height: 99vh; /* Changed from 100vh to 99vh */
  
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
  cursor: pointer;
  border-right: 1px solid #1E3A67;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start; /* Align content to the top */
  min-height: 150px; /* Increased height to match screenshot */
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    background-color: #102D57;
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
  height: calc(15% - 15px); /* Add League standings section */
  overflow-y: auto;
  
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

// Update TradesProposalContainer to 24.5% height
const TradesProposalContainer = styled.div`
  background-color: #252932;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #333;
  height: 24.5%; /* Changed from 25% to 24.5% */
  overflow-y: auto;
  
  /* Rest of the styles remain the same */
  h3 {
    margin: 0 0 15px 0;
    color: #C4CED4;
    font-size: 16px;
    text-align: center;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
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
        width: 40px;
        height: 40px;
        margin-bottom: 5px;
      }
      
      h4 {
        margin: 0;
        font-size: 14px;
        color: #fff;
      }
      
      p {
        margin: 5px 0 0;
        font-size: 12px;
        color: #aaa;
      }
    }
    
    .vs {
      font-size: 16px;
      color: #aaa;
    }
    
    .status-indicator {
      position: absolute;
      top: -10px;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 11px;
      color: #B30E16;
      font-weight: bold;
    }
    
    &.old {
      opacity: 0.7;
      padding-top: 15px;
      padding-bottom: 15px;
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
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
    margin-bottom: 20px;
    
    button {
      padding: 8px;
      border: none;
      border-radius: 4px;
      font-size: 12px;
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
`;

// Update SeasonTasksContainer to match other components
const SeasonTasksContainer = styled.div`
  background-color: #252932;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #333;
  height: 25%; /* Keep this height but it's the last element */
  min-height: calc(25% - 15px); /* Ensure proper spacing */
  overflow-y: auto;
  
  /* Rest of the styles remain the same */
  h3 {
    margin: 0 0 15px 0;
    color: #C4CED4;
    font-size: 16px;
    text-align: center;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
  }
  
  .task-list {
    list-style: none;
    padding: 0;
    margin: 0;
    
    li {
      display: flex;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #333;
      
      &:last-child {
        border-bottom: none;
      }
      
      .task-status {
        width: 16px;
        height: 16px;
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
      
      .task-details {
        flex: 1;
        
        p {
          margin: 0;
          font-size: 13px;
          color: #fff;
        }
        
        span {
          font-size: 11px;
          color: #aaa;
        }
      }
    }
  }
`;

// Add the renderContent function to handle all tabs

// Add placeholder render functions for the new sections





// SeasonDashboard Component
const SeasonDashboard = () => {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const communityPack = useSelector(selectCommunityPack);
  const [activeTab, setActiveTab] = useState('home');
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Add team level state for NHL/AHL/ECHL rotation
  const [teamLevel, setTeamLevel] = useState('NHL');
  
  // Add division state and navigation functions here
  const [activeDivision, setActiveDivision] = useState('Atlantic');
  const divisions = ['Atlantic', 'Metropolitan', 'Central', 'Pacific'];
  
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
  const [calendarData] = useState({
    record: '8-7-3',
    position: '15th in League',
    points: '19',
    gamesPlayed: '18'
  });
  
  // Generate mock week data for the calendar to match the image
  const [weekDays] = useState(() => {
    // Fixed week data matching the image (November 20-26, 2024)
    const monthName = "NOV";
    const gameSchedule = {
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
      }
    };
    
    const days = [];
    
    for (let i = 20; i <= 26; i++) {
      const date = new Date(2024, 10, i); // November (10) 2024
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const dayName = dayNames[date.getDay()];
      const dayNumber = date.getDate();
      
      const todayInfo = gameSchedule[dayNumber] || { hasGame: false, isHomeGame: false, opponent: '' };
      
      days.push({
        date,
        dayName,
        dayNumber,
        monthName,
        hasGame: todayInfo.hasGame,
        isHomeGame: todayInfo.isHomeGame,
        opponent: todayInfo.opponent,
        isToday: dayNumber === 22, // FRI 22 is today
        gameCompleted: todayInfo.gameCompleted || false,
        gameResult: todayInfo.gameResult || '',
        teamWon: todayInfo.teamWon || false,
        affiliate: todayInfo.affiliate || '',
        affiliateGame: todayInfo.affiliateGame || false,
        affiliateOpponent: todayInfo.affiliateOpponent || ''
      });
    }
    
    return days;
  });
  
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
    alert('Game simulation feature is under development');
  };
  
  // Function to simulate to next day
  const simulateToNextDay = async () => {
    try {
      const { success, data, error } = await seasonService.simulateToNextDay(seasonId);
      
      if (success) {
        setSeason(data);
      } else {
        alert(`Failed to simulate to next day: ${error}`);
      }
    } catch (error) {
      console.error('Error simulating to next day:', error);
      alert('An unexpected error occurred during simulation');
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
            <div className="calendar-date">NOVEMBER 22, 2024</div>
          </WeekCalendarHeader>
          <CalendarDays>
            {weekDays.map((day, index) => (
              <WeekDay 
                key={index}
                active={day.isToday}
                hasGame={day.hasGame}
                isHomeGame={day.isHomeGame}
                onClick={() => setSelectedDay(day)}
              >
                <div className="day-name">
                  {day.dayName === 'FRI' ? 'FRI 22' : 
                   day.dayName === 'WED' ? 'WED 20' : 
                   day.dayName === 'THU' ? 'THU 21' : 
                   day.dayName === 'SAT' ? 'SAT 23' : 
                   day.dayName === 'SUN' ? 'SUN 24' : 
                   day.dayName === 'MON' ? 'MON 25' : 
                   day.dayName === 'TUE' ? 'TUE 26' : 
                   day.dayName}
                </div>
                <div className="day-number">{day.dayNumber}</div>
                
                {day.affiliateGame && (
                  <div className="team-level-indicator">
                    <img src={getTeamLogo(day.affiliate)} alt={day.affiliate} />
                  </div>
                )}

                {/* For the specific day 20, force both game and result to show */}
                {day.dayNumber === 20 && (
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
                {day.dayNumber !== 20 && day.hasGame && (
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

                {day.dayNumber !== 20 && day.hasGame && day.gameCompleted && (
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
  
  const renderNumbersContent = () => {
    return (
      <>
        <Header>
          <Title>Numbers</Title>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <EmptyState>
            <h3>Team Numbers</h3>
            <p>View and manage your team numbers and analytics.</p>
            <Button primary>Coming Soon</Button>
          </EmptyState>
        </div>
      </>
    );
  };
  
  const renderMoraleContent = () => {
    return (
      <>
        <Header>
          <Title>Team Morale</Title>
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <EmptyState>
            <h3>Team Morale</h3>
            <p>View and manage player and team morale.</p>
            <Button primary>Coming Soon</Button>
          </EmptyState>
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
          </NavList>
          
          <SidebarFooter>
            <div className="franchise-quicklinks">
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
                New Season
              </button>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                </svg>
                Load Season
              </button>
              <button>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                Export
              </button>
            </div>
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
                      <div className="calendar-date">NOVEMBER 22, 2024</div>
                    </WeekCalendarHeader>
                    <CalendarDays>
                      {weekDays.map((day, index) => (
                        <WeekDay 
                          key={index}
                          active={day.isToday}
                          hasGame={day.hasGame}
                          isHomeGame={day.isHomeGame}
                          onClick={() => setSelectedDay(day)}
                        >
                          <div className="day-name">
                            {day.dayName === 'FRI' ? 'FRI 22' : 
                             day.dayName === 'WED' ? 'WED 20' : 
                             day.dayName === 'THU' ? 'THU 21' : 
                             day.dayName === 'SAT' ? 'SAT 23' : 
                             day.dayName === 'SUN' ? 'SUN 24' : 
                             day.dayName === 'MON' ? 'MON 25' : 
                             day.dayName === 'TUE' ? 'TUE 26' : 
                             day.dayName}
                          </div>
                          <div className="day-number">{day.dayNumber}</div>
                          
                          {day.affiliateGame && (
                            <div className="team-level-indicator">
                              <img src={getTeamLogo(day.affiliate)} alt={day.affiliate} />
                            </div>
                          )}

                          {/* For the specific day 20, force both game and result to show */}
                          {day.dayNumber === 20 && (
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
                          {day.dayNumber !== 20 && day.hasGame && (
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

                          {day.dayNumber !== 20 && day.hasGame && day.gameCompleted && (
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
            
            <div className="action-buttons">
              <button className="accept">Accept</button>
              <button className="negotiate">Negotiate</button>
              <button className="reject">Reject</button>
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
          </TradesProposalContainer>
          
          <SeasonTasksContainer>
            <h3>SEASON TASKS</h3>
            <ul className="task-list">
              <li>
                <div className="task-status completed"></div>
                <div className="task-details">
                  <p>Set your lines for the season</p>
                  <span>Reward: $1.5M salary cap</span>
                </div>
              </li>
              <li>
                <div className="task-status in-progress"></div>
                <div className="task-details">
                  <p>Win 10 games in a row</p>
                  <span>Progress: 8/10</span>
                </div>
              </li>
              <li>
                <div className="task-status not-started"></div>
                <div className="task-details">
                  <p>Trade for a goalie with 90+ rating</p>
                  <span>Reward: Extra draft pick</span>
                </div>
              </li>
              <li>
                <div className="task-status not-started"></div>
                <div className="task-details">
                  <p>Make the playoffs</p>
                  <span>Reward: Contract extensions</span>
                </div>
              </li>
            </ul>
          </SeasonTasksContainer>
        </MatchupSidebar>
      </PageContainer>
    </SeasonLayoutContainer>
  );
};

export default SeasonDashboard; 