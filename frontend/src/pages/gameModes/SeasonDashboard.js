import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import * as seasonService from '../../services/seasonService';
import { useSelector } from 'react-redux';
import { selectCommunityPack } from '../../store/slices/settingsSlice';

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
  PHI, PIT, SEA, SJS, STL, TBL, TOR, VAN, VGK, WPG, WSH, UTA
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
  display: flex;
  flex: 1;
  min-height: 100vh;
  height: 100vh; /* Set explicit height */
  background-color: #262626;
  overflow: hidden; /* Prevent scrolling on the container */
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #1a1a1a;
  color: #C4CED4;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  border-right: 1px solid #333;
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
  width: 40px;
  height: 40px;
  background-color: ${props => props.bgColor || '#333'};
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
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full viewport height */
  background: linear-gradient(to bottom, #252525, #1e1e1e);
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
  min-height: calc(100vh - 80px); /* Take full height minus some padding */
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden; /* Prevent scrollbars from appearing unnecessarily */
  backdrop-filter: blur(5px);
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
  background-color: #252525;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
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
  background-color: #1d2330;
  margin-bottom: 15px;
`;

const GoalieComparison = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const GoalieCard = styled.div`
  display: flex;
  align-items: center;
  background-color: #1d2330;
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
  background-color: #1d2330;
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
  margin-top: 20px;
  overflow: hidden;
  white-space: nowrap;
  
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

// Add a function to get team logo based on abbreviation
const getTeamLogo = (abbreviation) => {
  if (!abbreviation) return null;
  const normalizedAbbr = abbreviation.trim().toUpperCase();
  return teamLogos[normalizedAbbr] || null;
};

// Add a new styled component for the week view calendar
const WeekViewCalendar = styled.div`
  display: flex;
  width: 100%;
  background-color: #1d2330;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
`;

const WeekDay = styled.div`
  flex: 1;
  text-align: center;
  padding: 10px;
  position: relative;
  border-left: ${props => props.active ? '4px solid #B30E16' : '1px solid #333'};
  background-color: ${props => props.active ? '#252932' : 'transparent'};
  cursor: pointer;
  
  &:first-child {
    border-left: ${props => props.active ? '4px solid #B30E16' : 'none'};
  }
  
  &:hover {
    background-color: #252932;
  }
  
  .day-name {
    font-size: 12px;
    color: #888;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  
  .day-number {
    font-size: 16px;
    font-weight: ${props => props.active ? 'bold' : 'normal'};
    color: #fff;
    margin-bottom: 8px;
  }
  
  .game-indicator {
    height: 8px;
    width: 8px;
    background-color: ${props => props.isHomeGame ? '#B30E16' : '#4A90E2'};
    border-radius: 50%;
    display: ${props => props.hasGame ? 'inline-block' : 'none'};
    margin: 0 auto;
  }
  
  .game-info {
    margin-top: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    
    .team-logo {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }
    
    .vs {
      margin: 0 5px;
      font-size: 12px;
      color: #aaa;
    }
  }
`;

// SeasonDashboard Component
const SeasonDashboard = () => {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const communityPack = useSelector(selectCommunityPack);
  const [activeTab, setActiveTab] = useState('home');
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Add missing calendarData state
  const [calendarData] = useState({
    record: '8-7-3',
    position: '15th in League',
    points: '19',
    gamesPlayed: '18'
  });
  
  // Generate mock week data for the calendar
  const [weekDays] = useState(() => {
    const today = new Date();
    const days = [];
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const dayName = dayNames[date.getDay()];
      const dayNumber = date.getDate();
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const monthName = monthNames[date.getMonth()];
      
      // Randomly determine if there's a game on this day (for mock data)
      const hasGame = Math.random() > 0.5;
      const isHomeGame = hasGame && Math.random() > 0.5;
      
      // Random opponent for the game (if there is one)
      const opponents = ['NYR', 'BOS', 'TOR', 'MTL', 'OTT', 'TBL', 'FLA', 'CAR'];
      const opponent = opponents[Math.floor(Math.random() * opponents.length)];
      
      days.push({
        date,
        dayName,
        dayNumber,
        monthName,
        hasGame,
        isHomeGame,
        opponent,
        isToday: i === 0
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
      case 'lines':
        return renderLinesContent();
      case 'team':
        return renderTeamContent();
      case 'stats':
        return renderStatsContent();
      case 'standings':
        return renderStandingsContent();
      case 'trades':
        return renderTradesContent();
      case 'awards':
        return renderAwardsContent();
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
        
        {/* Add Week View Calendar */}
        <WeekViewCalendar>
          {weekDays.map((day, index) => (
            <WeekDay 
              key={index}
              active={day.isToday}
              hasGame={day.hasGame}
              isHomeGame={day.isHomeGame}
              onClick={() => setSelectedDay(day)}
            >
              <div className="day-name">{day.dayName}</div>
              <div className="day-number">{day.dayNumber} {day.monthName}</div>
              <div className="game-indicator"></div>
              {day.hasGame && (
                <div className="game-info">
                  {communityPack === 1 && getTeamLogo('VAN') ? (
                    <img 
                      className="team-logo" 
                      src={getTeamLogo('VAN')} 
                      alt="VAN" 
                    />
                  ) : (
                    <span>VAN</span>
                  )}
                  <span className="vs">VS</span>
                  {communityPack === 1 && getTeamLogo(day.opponent) ? (
                    <img 
                      className="team-logo" 
                      src={getTeamLogo(day.opponent)} 
                      alt={day.opponent} 
                    />
                  ) : (
                    <span>{day.opponent}</span>
                  )}
                </div>
              )}
            </WeekDay>
          ))}
        </WeekViewCalendar>
        
        <QuickLinks>
          <QuickLinkButton>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Stats Central
          </QuickLinkButton>
          <QuickLinkButton>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Morale
          </QuickLinkButton>
          <QuickLinkButton primary>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Coaching Staff
          </QuickLinkButton>
          <QuickLinkButton>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            Assign Scout
          </QuickLinkButton>
        </QuickLinks>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <MatchupCard>
            <MatchupHeader>
              <h3>Next Game</h3>
              <span>FRI 22</span>
            </MatchupHeader>
            
            <MatchupTeams>
              <MatchupTeam>
                {communityPack === 1 && getTeamLogo('VAN') ? (
                  <img 
                    src={getTeamLogo('VAN')} 
                    alt="Vancouver Canucks" 
                  />
                ) : (
                  <img 
                    src={season?.selectedTeam?.logoUrl || "https://via.placeholder.com/70"} 
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
                {communityPack === 1 && getTeamLogo('OTT') ? (
                  <img 
                    src={getTeamLogo('OTT')} 
                    alt="Ottawa Senators" 
                  />
                ) : (
                  <img 
                    src="https://via.placeholder.com/70" 
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
                    src="https://via.placeholder.com/70" 
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
                    src="https://via.placeholder.com/70" 
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
                      src="https://via.placeholder.com/32" 
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
                      src="https://via.placeholder.com/32" 
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
                      src="https://via.placeholder.com/32" 
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
                      src="https://via.placeholder.com/32" 
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
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <LineCombinations 
            isEmbedded={true} 
            league="nhl" 
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
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)' // Ensure it takes full height minus header
        }}>
          <Statistics isEmbedded={true} />
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
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)' // Ensure it takes full height minus header
        }}>
          <Standings isEmbedded={true} />
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
        </Header>
        
        <div style={{ 
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 120px)' // Ensure it takes full height minus header
        }}>
          <AssetMovement isEmbedded={true} />
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
              <p>{season?.name || '2023-24 Season'}</p>
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
            <NavItem active={activeTab === 'lines'}>
              <div onClick={() => setActiveTab('lines')}>Line Combinations</div>
            </NavItem>
            <NavItem active={activeTab === 'team'}>
              <div onClick={() => setActiveTab('team')}>Team Management</div>
            </NavItem>
            <NavItem active={activeTab === 'stats'}>
              <div onClick={() => setActiveTab('stats')}>Statistics</div>
            </NavItem>
            <NavItem active={activeTab === 'standings'}>
              <div onClick={() => setActiveTab('standings')}>Standings</div>
            </NavItem>
            <NavItem active={activeTab === 'trades'}>
              <div onClick={() => setActiveTab('trades')}>Asset Movement</div>
            </NavItem>
            <NavItem active={activeTab === 'awards'}>
              <div onClick={() => setActiveTab('awards')}>Awards</div>
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
              {renderContent()}
            </CustomScrollArea>
          </ContentArea>
        </MainContent>
      </PageContainer>
    </SeasonLayoutContainer>
  );
};

export default SeasonDashboard; 