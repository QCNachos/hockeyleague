import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Select, Tag, Radio, Menu, Dropdown, Button, Tabs, Slider, Switch, Row, Col, Modal, Spin, Alert, message, Tooltip } from 'antd';

// Styled components
const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #111;
`;

const Header = styled.div`
  margin-bottom: 30px;
`;

const TeamHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 15px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #1a1a1a;
  border-radius: 8px;
  border: 1px solid #333;
`;

const TeamInfo = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 15px;
  flex: 1;
`;

const TeamName = styled.h2`
  margin: 0;
  color: #fff;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
`;

const LeagueInfo = styled.span`
  color: #ccc;
  font-size: 0.9rem;
`;

const TeamLogo = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.5rem;
`;

// Add these new styled components
const TeamOverall = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.6rem;
  margin-left: 15px;
`;

const EditLinesButton = styled.button`
  margin-left: auto;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #3e8e41;
  }
`;

const NavWidgets = styled.div`
  display: flex;
  margin-bottom: 30px;
  border: 1px solid #333;
`;

const NavWidget = styled.div`
  padding: 10px 15px;
  background-color: ${props => props.active ? '#1a3042' : '#1e1e1e'};
  color: ${props => props.active ? 'white' : '#888'};
  border-right: 1px solid #333;
  cursor: pointer;
  font-weight: bold;
  text-align: center;
  flex: 1;
  
  &:last-child {
    border-right: none;
  }
  
  &:hover {
    background-color: ${props => props.active ? '#1a3042' : '#2a2a2a'};
  }
`;

const TeamSelector = styled.div`
  border: 1px solid #333;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  gap: 20px;
`;

const ContentArea = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  color: #fff;
  font-size: 1.5rem;
  background-color: #1a3042;
  padding: 10px 20px;
  border-radius: 0;
  margin: 30px 0 15px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const SectionOverall = styled.div`
  background-color: white;
  color: #B30E16;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
  position: absolute;
  right: 15px;
  border: 1px solid #B30E16;
`;

const LineGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DefensePairGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
`;

const GoalieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const GoalieSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GoalieSplit = styled.div`
  background-color: #B30E16;
  color: white;
  padding: 4px 10px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 0.9rem;
  font-weight: bold;
`;

const SpecialTeamsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-bottom: 15px;
  
  &.center-row {
    justify-content: center;
    margin: 0 auto;
    width: 80%;
  }
`;

// eslint-disable-next-line no-unused-vars
const ClickMessage = styled.div`
  text-align: center;
  color: #aaa;
  font-size: 0.9rem;
  margin: 20px 0;
`;

const EmptySlot = styled.div`
  background-color: #1e1e1e;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
  color: #666;
  border: 1px dashed #333;
  width: 100%;
  max-width: 280px;
`;

const Badge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  color: white;
  z-index: 5;
`;

const StarterBadge = styled(Badge)`
  background-color: #4CAF50;
  content: "STARTER";
`;

const InjuryBadge = styled(Badge)`
  background-color: ${props => {
    switch(props.type) {
      case 'IR': return '#e74c3c';
      case 'DTD': return '#e67e22';
      case 'OUT': return '#c0392b';
      default: return '#95a5a6';
    }
  }};
`;

const BadgesLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  justify-content: center;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-right: 15px;
`;

const LegendBadge = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background-color: ${props => props.color};
  margin-right: 6px;
`;

const LegendText = styled.span`
  font-size: 0.85rem;
  color: #C4CED4;
`;

const StyledSelect = styled.select`
  background-color: #1e1e1e;
  color: #fff;
  padding: 8px 12px;
  border: 1px solid #333;
  border-radius: 4px;
  min-width: 180px;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
`;

// Update InjuryReturn styled component
const InjuryReturn = styled.div`
  color: #aaa;
  font-size: 0.85rem;
  margin: 8px 0 25px;
  text-align: center;
  font-style: italic;
  display: flex;
  justify-content: space-around;
  width: 100%;
`;

const InjuryReturnItem = styled.span`
  flex: 1;
  padding: 0 10px;
  text-align: center;
`;

const InjuryPairGrid = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 5px;
`;

// New components for the Stats views
const StatsContainer = styled.div`
  margin-top: 20px;
`;

const StatsPosition = styled.div`
  background-color: #1a3042;
  color: white;
  padding: 10px;
  text-align: center;
  font-weight: bold;
  margin-bottom: 2px;
  width: 100%;
`;

const StatsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  text-align: center;
  border-bottom: 1px solid #333;
  
  &:last-child {
    margin-bottom: 20px;
  }
`;

const StatsHeader = styled(StatsRow)`
  background-color: #2c3e50;
  color: white;
  font-weight: bold;
  border-bottom: 2px solid #B30E16;
`;

const StatsCell = styled.div`
  padding: 8px 5px;
  color: #C4CED4;
  font-size: 0.9rem;
  
  &:nth-child(1) {
    text-align: left;
    font-weight: bold;
    padding-left: 15px;
  }
`;

// Add these new styled components after the existing ones
const PlayerTypeTag = styled.div`
  position: absolute;
  top: -10px;
  left: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  background-color: #163756;
  color: white;
  z-index: 5;
`;

const PlayerModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PlayerCardContent = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

const PlayerCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background-color: #1a3042;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #333;
`;

const PlayerCardBody = styled.div`
  padding: 20px;
`;

const PlayerCardClose = styled.button`
  position: absolute;
  right: 15px;
  top: 15px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  
  &:hover {
    color: #B30E16;
  }
`;

const PlayerCardImage = styled.div`
  width: 120px;
  height: 140px;
  background-color: #B30E16;
  border-radius: 8px;
  margin-right: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 3rem;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
`;

const PlayerCardInfo = styled.div`
  flex: 1;
`;

const PlayerCardName = styled.h2`
  margin: 0 0 5px 0;
  font-size: 1.8rem;
`;

const PlayerCardDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
`;

const PlayerCardDetail = styled.div`
  margin-right: 20px;
  margin-bottom: 5px;
  
  span {
    color: #aaa;
    margin-right: 5px;
  }
`;

const PlayerCardSection = styled.div`
  margin-top: 20px;
`;

const PlayerCardSectionTitle = styled.h3`
  background-color: #1a3042;
  color: white;
  padding: 8px 15px;
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  border-bottom: 1px solid #333;
`;

const AttributeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const AttributeItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #333;
`;

const AttributeName = styled.span`
  color: #aaa;
`;

const AttributeValue = styled.span`
  font-weight: bold;
  color: ${props => {
    if (props.value >= 90) return '#4CAF50';
    if (props.value >= 80) return '#8BC34A';
    if (props.value >= 70) return '#CDDC39';
    if (props.value >= 60) return '#FFC107';
    return '#FF5722';
  }};
`;

const SeasonStatsTable = styled.div`
  overflow-x: auto;
  margin-top: 15px;
`;

const StatsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
`;

const StatsTableHeader = styled.th`
  background-color: #1a3042;
  padding: 8px;
  font-weight: bold;
  color: white;
  border-bottom: 1px solid #333;
`;

const StatsTableRow = styled.tr`
  &:nth-child(even) {
    background-color: #2a2a2a;
  }
  
  &:nth-child(odd) {
    background-color: #1e1e1e;
  }
`;

const StatsTableCell = styled.td`
  padding: 8px;
  border-bottom: 1px solid #333;
`;

// Add this styled component after LineGrid
const OtherLinesButton = styled.button`
  background-color: #1a3042;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  margin: 20px auto;
  display: block;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2c4458;
  }
`;

const OtherLinesContainer = styled.div`
  margin-top: 20px;
  border: 1px solid #333;
  padding: 15px;
  background-color: rgba(26, 48, 66, 0.2);
  display: ${props => props.$isVisible ? 'block' : 'none'};
`;

// Update PlayerCardItem to include chemistry badge
const PlayerCardItem = styled.div`
  background-color: #1e1e1e;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  width: 100%;
  max-width: 280px;
  
  &:hover {
    background-color: #2a2a2a;
    cursor: pointer;
  }
`;

const PlayerNumberCircle = styled.div`
  font-weight: bold;
  font-size: 1.2rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: transparent;
  color: #B30E16;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
`;

const PlayerInfo = styled.div`
  flex: 1;
`;

const PlayerName = styled.div`
  font-weight: bold;
  color: #fff;
`;

const PlayerPosition = styled.div`
  font-size: 0.8rem;
  color: #aaa;
`;

const PlayerOverall = styled.div`
  background-color: #B30E16;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
`;

// Add this styled component after PlayerOverall
const ChemistryBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  font-size: 0.8rem;
  color: white;
  background-color: ${props => {
    if (props.value > 0) return '#4CAF50'; // Green for positive
    if (props.value < 0) return '#B30E16'; // Red for negative
    return '#F1C40F'; // Yellow for neutral
  }};
`;

// Add a LineBadge styled component after ChemistryBadge
const LineBadge = styled.div`
  position: absolute;
  right: -35px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  color: white;
  background-color: ${props => {
    if (props.value > 0) return '#4CAF50'; // Green for positive
    if (props.value < 0) return '#B30E16'; // Red for negative
    return '#F1C40F'; // Yellow for neutral
  }};
`;

// These functions don't depend on component state so can stay outside
// Function to calculate weighted average for any array of players with weights
const calculateWeightedOverall = (players, weights) => {
  if (!players || players.length === 0 || !weights || weights.length === 0) return 0;
  
  // Make sure we only use as many weights as we have players
  const usedWeights = weights.slice(0, players.length);
  const sumOfWeights = usedWeights.reduce((sum, weight) => sum + weight, 0);
  
  // Normalize weights if they don't sum to 1
  const normalizedWeights = usedWeights.map(weight => weight / sumOfWeights);
  
  // Calculate weighted average
  let weightedSum = 0;
  players.forEach((player, index) => {
    const overall = parseInt(player?.overall || 0);
    weightedSum += (isNaN(overall) ? 0 : overall) * normalizedWeights[index];
  });
  
  return Math.round(weightedSum) || 0;
};

// Function to render section title with optional overall rating
const renderSectionTitleWithOverall = (title, overall = null) => {
  return (
    <SectionTitle>
      {title}
      {overall !== null && <SectionOverall>{overall}</SectionOverall>}
    </SectionTitle>
  );
};

// Add a function to sort forwards respecting positions
const sortForwardsByPosition = (forwards) => {
  // First, separate forwards by their natural positions
  const leftWingers = forwards.filter(p => p.position_primary === 'LW');
  const centers = forwards.filter(p => p.position_primary === 'C');
  const rightWingers = forwards.filter(p => p.position_primary === 'RW');
  
  // Sort each group by overall rating
  leftWingers.sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0));
  centers.sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0));
  rightWingers.sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0));
  
  // Prepare the output array of forwards
  const sortedForwards = [];
  
  // Fill each line with the appropriate position players
  for (let line = 0; line < 4; line++) {
    // Add left winger if available
    if (line < leftWingers.length) {
      sortedForwards.push(leftWingers[line]);
    }
    
    // Add center if available
    if (line < centers.length) {
      sortedForwards.push(centers[line]);
    }
    
    // Add right winger if available
    if (line < rightWingers.length) {
      sortedForwards.push(rightWingers[line]);
    }
  }
  
  // If we didn't fill all 12 forward spots, add any remaining forwards
  const remainingForwards = forwards.filter(p => 
    !sortedForwards.includes(p) && 
    ['LW', 'C', 'RW'].includes(p.position_primary)
  );
  
  remainingForwards.sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0));
  
  while (sortedForwards.length < 12 && remainingForwards.length > 0) {
    sortedForwards.push(remainingForwards.shift());
  }
  
  return sortedForwards;
};

// Add a debug function at the top level that we'll use to log API calls
const debugAPI = (message, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, data);
};

const LineCombinations = () => {
  const { league, teamId } = useParams();
  const [selectedLeague, setSelectedLeague] = useState(league || 'NHL');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [activeWidget, setActiveWidget] = useState('lines');
  const [roster, setRoster] = useState({
    forwards: [],
    defensemen: [],
    goalies: [],
    powerPlay1: [],
    powerPlay2: [],
    penaltyKill1: [],
    penaltyKill2: [],
    fourOnFour: [],
    threeOnThree: [],
    shootout: [],
    injured: [],
    benched: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [showOtherLines, setShowOtherLines] = useState(false);
  const [teamRatings, setTeamRatings] = useState({
    overall: 0,
    offense: 0,
    defense: 0,
    special_teams: 0,
    goaltending: 0,
    component_ratings: {
      line_1: 0,
      line_2: 0,
      line_3: 0,
      line_4: 0,
      pair_1: 0,
      pair_2: 0,
      pair_3: 0,
      power_play_1: 0,
      power_play_2: 0,
      penalty_kill_1: 0,
      penalty_kill_2: 0
    }
  });
  const [chemistryData, setChemistryData] = useState(null);

  // Add a ref to track if we've fetched the team ratings
  const hasLoadedTeamRatings = useRef(false);

  // Process line data from the API - now inside component with access to state
  const processLineData = (formationData) => {
    // Only proceed if we have valid data
    if (!formationData || !formationData.lines) {
      return;
    }
    
    const { lines, chemistry, team_rating } = formationData;
    
    console.log('Team rating data:', team_rating);
    console.log('Team overall rating:', team_rating?.overall);

    // Set team ratings in state
    if (team_rating) {
      setTeamRatings(team_rating);
      console.log('Setting team ratings:', team_rating);

      // Remove database update for now since the Team table doesn't have overall_rating column
    }
    
    // Set chemistry data for use in the UI
    setChemistryData(chemistry);
    
    // Extract forward lines
    const forwards = [];
    const defensemen = [];
    const goalies = [];
    const benchedPlayers = [];
    
    // Process forward lines
    if (lines.forward_lines) {
      lines.forward_lines.forEach((line, lineIndex) => {
        Object.entries(line).forEach(([position, player]) => {
          if (player !== 'Empty') {
            const mappedPlayer = {
              ...player,
              name: player.name || `${player.first_name} ${player.last_name}`,
              position: position,
              number: player.jersey,
              overall: player.overall_rating,
              player_type: player.player_type,
              lineNumber: lineIndex + 1,
              chemistry: 0, // Will be updated from chemistry data
              attributes: {
                skating: player.skating,
                shooting: player.shooting,
                hands: player.puck_skills,
                checking: player.physical,
                defense: player.defense
              }
            };
            forwards.push(mappedPlayer);
          }
        });
      });
    }
    
    // Process defense pairs
    if (lines.defense_pairs) {
      lines.defense_pairs.forEach((pair, pairIndex) => {
        Object.entries(pair).forEach(([position, player]) => {
          if (player !== 'Empty') {
            const mappedPlayer = {
              ...player,
              name: player.name || `${player.first_name} ${player.last_name}`,
              position: position,
              number: player.jersey,
              overall: player.overall_rating,
              player_type: player.player_type,
              pairNumber: pairIndex + 1,
              chemistry: 0, // Will be updated from chemistry data
              attributes: {
                skating: player.skating,
                shooting: player.shooting,
                hands: player.puck_skills,
                checking: player.physical,
                defense: player.defense
              }
            };
            defensemen.push(mappedPlayer);
          }
        });
      });
    }
    
    // Process goalies
    if (lines.goalies) {
      lines.goalies.forEach((goalie, index) => {
        if (goalie.G !== 'Empty') {
          const player = goalie.G;
          goalies.push({
            ...player,
            name: player.name || `${player.first_name} ${player.last_name}`,
            position: 'G',
            number: player.jersey,
            overall: player.overall_rating,
            isStarter: index === 0,
            split: index === 0 ? 65 : 35,
            player_type: player.player_type,
            attributes: {
              agility: player.agility,
              positioning: player.positioning,
              reflexes: player.reflexes,
              puck_control: player.puck_control,
              mental: player.mental
            }
          });
        }
      });
    }
    
    // Process extra players (benched)
    if (lines.extra) {
      lines.extra.forEach(player => {
        if (player) {
          benchedPlayers.push({
            ...player,
            name: player.name || `${player.first_name} ${player.last_name}`,
            position: player.position_primary,
            number: player.jersey,
            overall: player.overall_rating,
            player_type: player.player_type
          });
        }
      });
    }
    
    // Process special teams
    const powerPlay1 = [];
    const powerPlay2 = [];
    const penaltyKill1 = [];
    const penaltyKill2 = [];
    
    if (lines.power_play_1) {
      // Add forwards
      lines.power_play_1.forwards.forEach(player => {
        if (player !== 'Empty') {
          powerPlay1.push({
            ...player,
            name: player.name || `${player.first_name} ${player.last_name}`,
            position: player.position_primary,
            number: player.jersey,
            overall: player.overall_rating,
            player_type: player.player_type
          });
        }
      });
      
      // Add defense
      lines.power_play_1.defense.forEach(player => {
        if (player !== 'Empty') {
          powerPlay1.push({
            ...player,
            name: player.name || `${player.first_name} ${player.last_name}`,
            position: player.position_primary,
            number: player.jersey,
            overall: player.overall_rating,
            player_type: player.player_type
          });
        }
      });
    }
    
    if (lines.power_play_2) {
      // Add forwards
      lines.power_play_2.forwards.forEach(player => {
        if (player !== 'Empty') {
          powerPlay2.push({
            ...player,
            name: player.name || `${player.first_name} ${player.last_name}`,
            position: player.position_primary,
            number: player.jersey,
            overall: player.overall_rating,
            player_type: player.player_type
          });
        }
      });
      
      // Add defense
      lines.power_play_2.defense.forEach(player => {
        if (player !== 'Empty') {
          powerPlay2.push({
            ...player,
            name: player.name || `${player.first_name} ${player.last_name}`,
            position: player.position_primary,
            number: player.jersey,
            overall: player.overall_rating,
            player_type: player.player_type
          });
        }
      });
    }
    
    if (lines.penalty_kill_1) {
      // Add forwards
      lines.penalty_kill_1.forwards.forEach(player => {
        if (player !== 'Empty') {
          penaltyKill1.push({
            ...player,
            name: player.name || `${player.first_name} ${player.last_name}`,
            position: player.position_primary,
            number: player.jersey,
            overall: player.overall_rating,
            player_type: player.player_type
          });
        }
      });
      
      // Add defense
      lines.penalty_kill_1.defense.forEach(player => {
        if (player !== 'Empty') {
          penaltyKill1.push({
            ...player,
            name: player.name || `${player.first_name} ${player.last_name}`,
            position: player.position_primary,
            number: player.jersey,
            overall: player.overall_rating,
            player_type: player.player_type
          });
        }
      });
    }
    
    if (lines.penalty_kill_2) {
      // Add forwards
      lines.penalty_kill_2.forwards.forEach(player => {
        if (player !== 'Empty') {
          penaltyKill2.push({
            ...player,
            name: player.name || `${player.first_name} ${player.last_name}`,
            position: player.position_primary,
            number: player.jersey,
            overall: player.overall_rating,
            player_type: player.player_type
          });
        }
      });
      
      // Add defense
      lines.penalty_kill_2.defense.forEach(player => {
        if (player !== 'Empty') {
          penaltyKill2.push({
            ...player,
            name: player.name || `${player.first_name} ${player.last_name}`,
            position: player.position_primary,
            number: player.jersey,
            overall: player.overall_rating,
            player_type: player.player_type
          });
        }
      });
    }
    
    // Apply chemistry data if available
    if (chemistry) {
      // Apply forward line chemistry
      if (chemistry.forward_lines) {
        chemistry.forward_lines.forEach(lineData => {
          const lineIndex = lineData.line - 1;
          const lineChemistry = lineData.chemistry;
          
          // Apply to each player in the line
          forwards.filter(p => p.lineNumber === lineData.line).forEach(player => {
            player.chemistry = lineChemistry;
          });
        });
      }
      
      // Apply defense pair chemistry
      if (chemistry.defense_pairs) {
        chemistry.defense_pairs.forEach(pairData => {
          const pairIndex = pairData.pair - 1;
          const pairChemistry = pairData.chemistry;
          
          // Apply to each player in the pair
          defensemen.filter(p => p.pairNumber === pairData.pair).forEach(player => {
            player.chemistry = pairChemistry;
          });
        });
      }
    }
    
    // Find injured players
    const injured = [];
    
    // Set the complete roster
    setRoster({
      forwards,
      defensemen,
      goalies,
      powerPlay1,
      powerPlay2,
      penaltyKill1,
      penaltyKill2,
      fourOnFour: forwards.slice(0, 2).concat(defensemen.slice(0, 2)),
      threeOnThree: forwards.slice(0, 2).concat(defensemen.slice(0, 1)),
      shootout: forwards.slice(0, 5),
      injured,
      benched: benchedPlayers
    });
  };

  // Effect to fetch teams when league changes
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from('Team')
          .select(`
            *,
            League (
              league,
              league_level
            )
          `)
          .eq('league', selectedLeague)
          .order('team');

        if (error) throw error;
        
        setTeams(data || []);
        
        // If we have a teamId but no teamInfo, find and set it
        if (teamId && !teamInfo) {
          const team = data?.find(t => t.id === parseInt(teamId));
          if (team) {
            setTeamInfo(team);
            setSelectedTeam(team.id);
          }
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        setTeams(getMockTeams());
      }
    };

    fetchTeams();
  }, [selectedLeague, teamId]);

  // Effect to fetch team info when teamId changes
  useEffect(() => {
    const fetchTeamInfo = async () => {
      if (!teamId) return;
      
      try {
        const { data, error } = await supabase
          .from('Team')
          .select(`
            *,
            League (
              league,
              league_level
            )
          `)
          .eq('id', teamId)
          .single();

        if (error) throw error;
        
        setTeamInfo(data);
        setSelectedTeam(data.id);
        setSelectedLeague(data.league || league || 'NHL');
        // Reset the team ratings flag when team info changes
        hasLoadedTeamRatings.current = false;
        
        console.log('Team info loaded:', data);
      } catch (error) {
        console.error('Error fetching team info:', error);
      }
    };

    fetchTeamInfo();
  }, [teamId, league, setSelectedTeam, setSelectedLeague, setTeamInfo]);

  // Effect to fetch roster data
  useEffect(() => {
    const fetchRoster = async () => {
      setLoading(true);
      let players = [];
      
      try {
        debugAPI('Starting fetchRoster with teamAbbr:', teamInfo?.abbreviation);
        
        // Get team information first
        if (!teamInfo || !teamInfo.abbreviation) {
          if (teamInfo?.abbreviation) {
            // If we have teamAbbr but not teamInfo, try to get team info
            debugAPI('Getting team info for abbreviation:', teamInfo.abbreviation);
            const teamByAbbrResponse = await supabase
              .from('Team')
              .select('*')
              .eq('abbreviation', teamInfo.abbreviation)
              .single();
              
            if (!teamByAbbrResponse.error && teamByAbbrResponse.data) {
              setTeamInfo(teamByAbbrResponse.data);
              debugAPI('Set team info from abbreviation:', teamByAbbrResponse.data);
            } else {
              debugAPI('Error getting team by abbreviation:', teamByAbbrResponse.error);
          setLoading(false);
          return;
            }
          } else {
            debugAPI('No team abbreviation or team info available');
            setLoading(false);
            return;
          }
        }
        
        // Only fetch team ratings if we haven't done so already for this team
        if (!hasLoadedTeamRatings.current) {
          try {
            // Make sure we have a valid team abbreviation
            if (!teamInfo?.abbreviation) {
              debugAPI('No team abbreviation available for API calls', { teamInfo });
              setLoading(false);
              return;
            }
            
            // First try to get the team formation data which includes ratings
            const formationUrl = `http://localhost:5001/api/lines/formation/${teamInfo.abbreviation}`;
            debugAPI(`Fetching team formation data from: ${formationUrl}`, {});
            
            // Add timeout to API call
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            try {
              const formationResponse = await fetch(formationUrl, {
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              
              const formationStatus = formationResponse.status;
              debugAPI(`Formation API response status: ${formationStatus}`, {});
              
              if (formationResponse.ok) {
                const formationData = await formationResponse.json();
                debugAPI('Team formation response data:', formationData);
                
                // Check if we have any data at all
                if (!formationData) {
                  debugAPI('Formation data is empty or null', {});
                  tryLinesAPI();
                  return;
                }
                
                // If we have team_rating in the formation data, use it
                if (formationData.team_rating) {
                  debugAPI('Found team_rating in formation data', formationData.team_rating);
                  setTeamRatings({
                    overall: formationData.team_rating.overall || 0,
                    offense: formationData.team_rating.offense || 0,
                    defense: formationData.team_rating.defense || 0,
                    special_teams: formationData.team_rating.special_teams || 0,
                    goaltending: formationData.team_rating.goaltending || 0,
                    component_ratings: formationData.team_rating.component_ratings || {}
                  });
                  
                  // Mark that we've loaded team ratings
                  hasLoadedTeamRatings.current = true;
                  
                  // Process the line data if available
                  if (formationData.lines) {
                    debugAPI('Processing lines data from formation', { lineCount: Object.keys(formationData.lines).length });
                    processLineData(formationData);
                  } else {
                    debugAPI('No lines data in formation response', {});
                  }
                } else {
                  // If formation data doesn't have team ratings, try the lines API endpoint directly
                  debugAPI('No team_rating in formation data, trying lines API', {});
                  tryLinesAPI();
                }
              } else {
                // Log more details about the error
                const errorText = await formationResponse.text().catch(e => "Could not get error text");
                debugAPI(`Formation API failed with status: ${formationStatus}`, { errorText });
                
                // Fallback to direct endpoints
                tryLinesAPI();
              }
            } catch (fetchError) {
              clearTimeout(timeoutId);
              if (fetchError.name === 'AbortError') {
                debugAPI('Fetch request timed out', {});
              } else {
                debugAPI('Error fetching from formation endpoint:', fetchError);
              }
              tryLinesAPI();
            }
          } catch (formationError) {
            debugAPI('Error calling team formation endpoint:', formationError);
            // Try the direct endpoints as fallback
            tryLinesAPI();
          }
        } else {
          debugAPI('Team ratings already loaded, skipping API calls', { hasLoadedTeamRatings: hasLoadedTeamRatings.current });
        }
        
        // Function to try the lines API endpoint
        async function tryLinesAPI() {
          try {
            const apiUrl = `http://localhost:5001/api/lines/update-team-overall/${teamInfo.abbreviation}`;
            debugAPI(`Trying lines API endpoint: ${apiUrl}`, {});
            
            // Add timeout to API call
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
            
            try {
              const overallResponse = await fetch(apiUrl, {
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              
              const responseStatus = overallResponse.status;
              
              // Log the response status first before trying to parse JSON
              debugAPI(`Lines API response status: ${responseStatus}`, {});
              
            if (overallResponse.ok) {
              const overallData = await overallResponse.json();
                debugAPI('Team overall update response from lines API:', overallData);
              
              // Update the team ratings with the response data
              if (overallData && overallData.overall_rating) {
                setTeamRatings({
                  overall: overallData.overall_rating,
                  offense: overallData.offense || 0,
                  defense: overallData.defense || 0,
                  special_teams: overallData.special_teams || 0,
                  goaltending: overallData.goaltending || 0,
                    component_ratings: overallData.component_ratings || {}
                  });
                  // Mark that we've loaded team ratings
                  hasLoadedTeamRatings.current = true;
                }
              } else {
                // Log more details about the error
                const errorText = await overallResponse.text().catch(e => "Could not get error text");
                debugAPI(`Lines API endpoint failed with status: ${responseStatus}`, { errorText });
                
                // Try the team rating API endpoint as the final fallback
                tryTeamRatingAPI();
              }
            } catch (fetchError) {
              clearTimeout(timeoutId);
              if (fetchError.name === 'AbortError') {
                debugAPI('Lines API request timed out', {});
              } else {
                debugAPI('Error fetching from lines API endpoint:', fetchError);
              }
              tryTeamRatingAPI();
            }
          } catch (linesError) {
            debugAPI('Error calling lines API endpoint:', linesError);
            // Try the team rating API as final fallback
            tryTeamRatingAPI();
          }
        }
        
        // Function to try the team_rating API endpoint
        async function tryTeamRatingAPI() {
          try {
            const apiUrl = `http://localhost:5001/api/team_rating/calculate/${teamInfo.abbreviation}`;
            debugAPI(`Trying team_rating API endpoint: ${apiUrl}`, {});
            
            // Add timeout to API call
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
            
            try {
              const ratingResponse = await fetch(apiUrl, {
                signal: controller.signal
              });
              clearTimeout(timeoutId);
              
              const responseStatus = ratingResponse.status;
              
              // Log the response status first before trying to parse JSON
              debugAPI(`Team rating API response status: ${responseStatus}`, {});
              
              if (ratingResponse.ok) {
                const ratingData = await ratingResponse.json();
                debugAPI('Team rating response from team_rating API:', ratingData);
                
                // Use the rating data directly
                if (ratingData) {
                  setTeamRatings({
                    overall: ratingData.overall || 0,
                    offense: ratingData.offense || 0,
                    defense: ratingData.defense || 0,
                    special_teams: ratingData.special_teams || 0,
                    goaltending: ratingData.goaltending || 0,
                    component_ratings: ratingData.component_ratings || {}
                });
                // Mark that we've loaded team ratings
                hasLoadedTeamRatings.current = true;
              }
            } else {
                // Log more details about the error
                const errorText = await ratingResponse.text().catch(e => "Could not get error text");
                debugAPI(`Team rating API endpoint failed with status: ${responseStatus}`, { errorText });
                
                // Just continue with empty ratings at this point
                console.warn('All team rating endpoints failed. Using default values.');
                
                // Set default ratings as a last resort
                setTeamRatings({
                  overall: null,
                  offense: null,
                  defense: null,
                  special_teams: null,
                  goaltending: null,
                  component_ratings: {}
                });
                
                hasLoadedTeamRatings.current = true;
              }
            } catch (fetchError) {
              clearTimeout(timeoutId);
              if (fetchError.name === 'AbortError') {
                debugAPI('Team rating API request timed out', {});
              } else {
                debugAPI('Error fetching from team rating API endpoint:', fetchError);
              }
              // Set default ratings as a last resort
              setTeamRatings({
                overall: null,
                offense: null,
                defense: null,
                special_teams: null,
                goaltending: null,
                component_ratings: {}
              });
              
              hasLoadedTeamRatings.current = true;
            }
          } catch (ratingError) {
            debugAPI('Error calling team_rating API endpoint:', ratingError);
            // Set default ratings as a last resort
            setTeamRatings({
              overall: null,
              offense: null,
              defense: null,
              special_teams: null,
              goaltending: null,
              component_ratings: {}
            });
            
            hasLoadedTeamRatings.current = true;
          }
        }
        
        // Fetch players directly from Supabase
        try {
          const supabaseResponse = await supabase
            .from('Player')
            .select('*')
            .eq('team', teamInfo.abbreviation);
            
          if (supabaseResponse.error) {
            console.error('Supabase query error:', supabaseResponse.error);
            setLoading(false);
            return;
          }
          
          players = supabaseResponse.data || [];
          
          if (players.length === 0) {
            console.log('No players found for team:', teamInfo.abbreviation);
            // Initialize empty roster
            setRoster({
              forwards: [],
              defensemen: [],
              goalies: [],
              powerPlay1: [],
              powerPlay2: [],
              penaltyKill1: [],
              penaltyKill2: [],
              fourOnFour: [],
              threeOnThree: [],
              shootout: [],
              injured: [],
              benched: []
            });
            setLoading(false);
            return;
          }
          
          console.log('Players fetched:', players.length);
          
          // Rest of the function remains the same
          // Organize players by position - handle both "G" and "Goalie" for goalies
          const forwards = players.filter(p => ['LW', 'C', 'RW'].includes(p.position_primary));
          const defensemen = players.filter(p => ['LD', 'RD'].includes(p.position_primary));
          const goalies = players.filter(p => ['G', 'Goalie'].includes(p.position_primary));
          const injured = players.filter(p => p.injury_status);
          
          console.log(`Found ${forwards.length} forwards, ${defensemen.length} defensemen, ${goalies.length} goalies`);
          
          // Sort by overall rating
          const sortByRating = (a, b) => (b.overall_rating || 0) - (a.overall_rating || 0);
          forwards.sort(sortByRating);
          defensemen.sort(sortByRating);
          goalies.sort(sortByRating);
          
          // Sort forwards respecting positions
          const sortedForwards = sortForwardsByPosition(forwards);
          
          // Assign line numbers based on sorted position
          sortedForwards.forEach((player, index) => {
            const lineNumber = Math.floor(index / 3) + 1;
            player.lineNumber = lineNumber <= 4 ? lineNumber : 4;
          });
          
          defensemen.forEach((player, index) => {
            const pairNumber = Math.floor(index / 2) + 1;
            player.pairNumber = pairNumber <= 3 ? pairNumber : 3;
          });
          
          // Create basic line combinations
          const roster = {
            forwards: sortedForwards.slice(0, 12).map(p => ({
              ...p,
              name: p.name || `${p.first_name} ${p.last_name}`,
              position: p.position_primary,
              number: p.jersey,
              overall: p.overall_rating,
              player_type: p.player_type,
              chemistry: Math.floor(Math.random() * 11) - 5, // Mock chemistry from -5 to +5
              attributes: {
                skating: p.skating,
                shooting: p.shooting,
                hands: p.puck_skills,
                checking: p.physical,
                defense: p.defense
              }
            })),
            defensemen: defensemen.slice(0, 6).map(p => ({
              ...p,
              name: p.name || `${p.first_name} ${p.last_name}`,
              position: p.position_primary,
              number: p.jersey,
              overall: p.overall_rating,
              player_type: p.player_type,
              chemistry: Math.floor(Math.random() * 11) - 5, // Mock chemistry from -5 to +5
              attributes: {
                skating: p.skating,
                shooting: p.shooting,
                hands: p.puck_skills,
                checking: p.physical,
                defense: p.defense
              }
            })),
            goalies: goalies.slice(0, 2).map((p, idx) => ({
              ...p,
              name: p.name || `${p.first_name} ${p.last_name}`,
              position: 'G',
              number: p.jersey,
              overall: p.overall_rating,
              isStarter: idx === 0,
              split: idx === 0 ? 65 : 35,
              player_type: p.player_type,
              attributes: {
                agility: p.agility,
                positioning: p.positioning,
                reflexes: p.reflexes,
                puck_control: p.puck_control,
                mental: p.mental
              }
            })),
            powerPlay1: [],
            powerPlay2: [],
            penaltyKill1: [],
            penaltyKill2: [],
            fourOnFour: [],
            threeOnThree: [],
            shootout: [],
            injured: injured.map(p => ({
              ...p,
              name: p.name || `${p.first_name} ${p.last_name}`,
              position: p.position_primary,
              number: p.jersey,
              overall: p.overall_rating,
              player_type: p.player_type,
              injuryStatus: p.injury_status,
              returnTime: p.return_timeline || 'Unknown'
            })),
            benched: []
          };
          
          // Populate special teams based on player attributes
          if (sortedForwards.length > 0) {
            // Power play units with chemistry
            roster.powerPlay1 = [...sortedForwards.slice(0, 3), ...defensemen.slice(0, 2)].filter(Boolean).map(p => ({
              ...p,
              name: p.name || `${p.first_name} ${p.last_name}`,
              position: p.position_primary,
              number: p.jersey,
              overall: p.overall_rating,
              player_type: p.player_type,
              chemistry: Math.floor(Math.random() * 11) - 5 // Mock chemistry from -5 to +5
            }));
            
            roster.powerPlay2 = [...sortedForwards.slice(3, 6), ...defensemen.slice(2, 4)].filter(Boolean).map(p => ({
              ...p,
              name: p.name || `${p.first_name} ${p.last_name}`,
              position: p.position_primary,
              number: p.jersey,
              overall: p.overall_rating,
              player_type: p.player_type,
              chemistry: Math.floor(Math.random() * 11) - 5 // Mock chemistry from -5 to +5
            }));
            
            // Penalty kill units with chemistry
            roster.penaltyKill1 = [...sortedForwards.slice(0, 2), ...defensemen.slice(0, 2)].filter(Boolean).map(p => ({
              ...p,
              name: p.name || `${p.first_name} ${p.last_name}`,
              position: p.position_primary,
              number: p.jersey,
              overall: p.overall_rating,
              player_type: p.player_type,
              chemistry: Math.floor(Math.random() * 11) - 5 // Mock chemistry from -5 to +5
            }));
            
            roster.penaltyKill2 = [...sortedForwards.slice(2, 4), ...defensemen.slice(0, 2)].filter(Boolean).map(p => ({
              ...p,
              name: p.name || `${p.first_name} ${p.last_name}`,
              position: p.position_primary,
              number: p.jersey,
              overall: p.overall_rating,
              player_type: p.player_type,
              chemistry: Math.floor(Math.random() * 11) - 5 // Mock chemistry from -5 to +5
            }));
            
            // Other formations
            roster.fourOnFour = [...sortedForwards.slice(0, 2), ...defensemen.slice(0, 2)].filter(Boolean).map(p => ({
              ...p,
              name: p.name || `${p.first_name} ${p.last_name}`,
              position: p.position_primary,
              number: p.jersey,
              overall: p.overall_rating,
              player_type: p.player_type
            }));
            
            roster.threeOnThree = [...sortedForwards.slice(0, 2), ...defensemen.slice(0, 1)].filter(Boolean).map(p => ({
              ...p,
              name: p.name || `${p.first_name} ${p.last_name}`,
              position: p.position_primary,
              number: p.jersey,
              overall: p.overall_rating,
              player_type: p.player_type
            }));
            
            roster.shootout = sortedForwards.slice(0, 5).filter(Boolean).map(p => ({
              ...p,
              name: p.name || `${p.first_name} ${p.last_name}`,
              position: p.position_primary,
              number: p.jersey,
              overall: p.overall_rating,
              player_type: p.player_type
            }));
          }
          
          // Find benched players (players not in the active lineup)
          const activePlayerIds = new Set([
            ...roster.forwards.map(p => p.id),
            ...roster.defensemen.map(p => p.id),
            ...roster.goalies.map(p => p.id),
            ...injured.map(p => p.id)
          ]);
          
          // Add extra forwards and defensemen to benched
          const benchedSkaters = players.filter(p => 
            !activePlayerIds.has(p.id) && 
            !p.injury_status &&
            !['G', 'Goalie'].includes(p.position_primary)
          );
          
          // Add extra goalies (3rd string and beyond) to benched
          const benchedGoalies = goalies.slice(2).filter(p => !p.injury_status);
          
          // Combine all benched players
          roster.benched = [...benchedSkaters, ...benchedGoalies].map(p => ({
            ...p,
            name: p.name || `${p.first_name} ${p.last_name}`,
            position: p.position_primary,
            number: p.jersey,
            overall: p.overall_rating,
            player_type: p.player_type
          }));
          
          // Update roster state
          console.log('Setting roster from database with data:', roster);
          setRoster(roster);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching roster:', error);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching roster:', error);
        setLoading(false);
      }
    };

    fetchRoster();
  }, [selectedTeam, teamInfo]); // Update roster when team changes

  const handleLeagueChange = (e) => {
    setSelectedLeague(e.target.value);
    setSelectedTeam(null);
    setTeamInfo(null);
  };

  const handleTeamChange = async (e) => {
    const teamId = parseInt(e.target.value);
    const team = teams.find(t => t.id === teamId);
    setSelectedTeam(teamId);
    setTeamInfo(team);
    // Reset the team ratings flag when changing teams
    hasLoadedTeamRatings.current = false;
    window.history.pushState({}, '', `/line-combinations/${team.league}/${teamId}`);
  };

  const handleWidgetClick = (widget) => {
    setActiveWidget(widget);
  };

  // Function to handle player click
  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  // Function to close player modal
  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setSelectedPlayer(null);
  };

  // Mock data functions
  const getMockTeams = () => {
    return [
      { id: 1, name: 'Carolina Hurricanes' },
      { id: 2, name: 'New York Rangers' },
      { id: 3, name: 'Boston Bruins' },
      { id: 4, name: 'Tampa Bay Lightning' },
      { id: 5, name: 'Toronto Maple Leafs' },
      { id: 6, name: 'Florida Panthers' },
    ];
  };

  const renderPlayer = (player, showBadge = false) => {
    if (!player) {
      return <EmptySlot>Empty Slot</EmptySlot>;
    }
    
    return (
      <PlayerCardItem key={player.id} onClick={() => handlePlayerClick(player)}>
        {player.isStarter && showBadge && <StarterBadge>STARTER</StarterBadge>}
        {player.injuryStatus && <InjuryBadge type={player.injuryStatus}>{player.injuryStatus}</InjuryBadge>}
        {player.player_type && <PlayerTypeTag>{player.player_type}</PlayerTypeTag>}
        <PlayerNumberCircle>{player.number}</PlayerNumberCircle>
        <PlayerInfo>
          <PlayerName>{player.name}</PlayerName>
          <PlayerPosition>{player.position}</PlayerPosition>
        </PlayerInfo>
        <PlayerOverall>{player.overall}</PlayerOverall>
      </PlayerCardItem>
    );
  };

  const renderForwardLines = () => {
    const { forwards } = roster;
    
    // Use the overall from teamRatings for forwards
    const forwardOverall = Math.round(teamRatings.offense || 0);
    
    // Use line ratings from API if available
    const lineRatings = {
      line1: Math.round(teamRatings.component_ratings?.line_1 || 0),
      line2: Math.round(teamRatings.component_ratings?.line_2 || 0),
      line3: Math.round(teamRatings.component_ratings?.line_3 || 0),
      line4: Math.round(teamRatings.component_ratings?.line_4 || 0)
    };
    
    // Use chemistry data from API or default to 0
    const lineChemistry = [
      chemistryData?.forward_line_1 || 0,
      chemistryData?.forward_line_2 || 0,
      chemistryData?.forward_line_3 || 0,
      chemistryData?.forward_line_4 || 0
    ];
    
    return (
      <>
        {renderSectionTitleWithOverall('Forwards', forwardOverall)}
        <div style={{ position: 'relative' }}>
        <LineGrid>
          {forwards.slice(0, 3).map(renderPlayer)}
        </LineGrid>
          {forwards.slice(0, 3).length > 0 && (
            <LineBadge value={lineChemistry[0]}>{lineChemistry[0] > 0 ? '+' : ''}{lineChemistry[0]}</LineBadge>
          )}
        </div>
        <div style={{ position: 'relative' }}>
        <LineGrid>
          {forwards.slice(3, 6).map(renderPlayer)}
        </LineGrid>
          {forwards.slice(3, 6).length > 0 && (
            <LineBadge value={lineChemistry[1]}>{lineChemistry[1] > 0 ? '+' : ''}{lineChemistry[1]}</LineBadge>
          )}
        </div>
        <div style={{ position: 'relative' }}>
        <LineGrid>
          {forwards.slice(6, 9).map(renderPlayer)}
        </LineGrid>
          {forwards.slice(6, 9).length > 0 && (
            <LineBadge value={lineChemistry[2]}>{lineChemistry[2] > 0 ? '+' : ''}{lineChemistry[2]}</LineBadge>
          )}
        </div>
        <div style={{ position: 'relative' }}>
        <LineGrid>
          {forwards.slice(9, 12).map(renderPlayer)}
        </LineGrid>
          {forwards.slice(9, 12).length > 0 && (
            <LineBadge value={lineChemistry[3]}>{lineChemistry[3] > 0 ? '+' : ''}{lineChemistry[3]}</LineBadge>
          )}
        </div>
      </>
    );
  };

  const renderDefensePairs = () => {
    const { defensemen } = roster;
    
    // Use the overall from teamRatings for defense
    const defenseOverall = Math.round(teamRatings.defense || 0);
    
    // Use pair ratings from API if available
    const pairRatings = {
      pair1: Math.round(teamRatings.component_ratings?.pair_1 || 0),
      pair2: Math.round(teamRatings.component_ratings?.pair_2 || 0),
      pair3: Math.round(teamRatings.component_ratings?.pair_3 || 0)
    };
    
    // Use chemistry data from API or default to 0
    const pairChemistry = [
      chemistryData?.defense_pair_1 || 0,
      chemistryData?.defense_pair_2 || 0,
      chemistryData?.defense_pair_3 || 0
    ];
    
    return (
      <>
        {renderSectionTitleWithOverall('Defense Pairs', defenseOverall)}
        <div style={{ position: 'relative' }}>
        <DefensePairGrid>
            {defensemen.slice(0, 2).map(renderPlayer)}
        </DefensePairGrid>
          {defensemen.slice(0, 2).length > 0 && (
            <LineBadge value={pairChemistry[0]}>{pairChemistry[0] > 0 ? '+' : ''}{pairChemistry[0]}</LineBadge>
          )}
        </div>
        <div style={{ position: 'relative' }}>
        <DefensePairGrid>
            {defensemen.slice(2, 4).map(renderPlayer)}
        </DefensePairGrid>
          {defensemen.slice(2, 4).length > 0 && (
            <LineBadge value={pairChemistry[1]}>{pairChemistry[1] > 0 ? '+' : ''}{pairChemistry[1]}</LineBadge>
          )}
        </div>
        <div style={{ position: 'relative' }}>
        <DefensePairGrid>
            {defensemen.slice(4, 6).map(renderPlayer)}
        </DefensePairGrid>
          {defensemen.slice(4, 6).length > 0 && (
            <LineBadge value={pairChemistry[2]}>{pairChemistry[2] > 0 ? '+' : ''}{pairChemistry[2]}</LineBadge>
          )}
        </div>
      </>
    );
  };

  const renderGoalies = () => {
    const { goalies } = roster;
    
    // Use the goaltending rating from the API
    const goalieOverall = Math.round(teamRatings.goaltending || 0);
    
    // Calculate split percentages for display
    const getSplitText = () => {
      if (goalies.length < 2) return "";
      
      const starter = goalies.find(g => g.isStarter) || goalies[0];
      const backup = goalies.find(g => !g.isStarter) || goalies[1];
      
      return `${starter.split ?? 60}/${backup.split ?? 40} Split`;
    };
    
    return (
      <>
        {renderSectionTitleWithOverall('Goalies', goalieOverall)}
        <GoalieGrid>
          {goalies.map((goalie, index) => (
            <GoalieSection key={goalie.id}>
              {renderPlayer(goalie, true)}
              {index === 0 && goalies.length > 1 && (
                <GoalieSplit>{getSplitText()}</GoalieSplit>
              )}
            </GoalieSection>
          ))}
        </GoalieGrid>
      </>
    );
  };

  const renderPowerPlay = () => {
    const { powerPlay1, powerPlay2 } = roster;
    
    // Use the special teams overall from teamRatings
    const specialTeamsOverall = Math.round(teamRatings.special_teams || 0);
    
    // Calculate average overall for power play units from API data if available
    const pp1Overall = Math.round(teamRatings.component_ratings?.power_play_1 || 0);
    const pp2Overall = Math.round(teamRatings.component_ratings?.power_play_2 || 0);
    
    // Use chemistry data from API or default to 0
    const pp1Chemistry = chemistryData?.power_play_1 || 0;
    const pp2Chemistry = chemistryData?.power_play_2 || 0;
    
    return (
      <>
        {renderSectionTitleWithOverall('1st Powerplay Unit', pp1Overall)}
        <div style={{ position: 'relative' }}>
        <SpecialTeamsGrid>
          {powerPlay1.slice(0, 3).map(renderPlayer)}
        </SpecialTeamsGrid>
        <SpecialTeamsGrid className="center-row">
          {powerPlay1.slice(3, 5).map(renderPlayer)}
        </SpecialTeamsGrid>
          {powerPlay1.length > 0 && (
            <LineBadge value={pp1Chemistry}>{pp1Chemistry > 0 ? '+' : ''}{pp1Chemistry}</LineBadge>
          )}
        </div>
        
        {renderSectionTitleWithOverall('2nd Powerplay Unit', pp2Overall)}
        <div style={{ position: 'relative' }}>
        <SpecialTeamsGrid>
          {powerPlay2.slice(0, 3).map(renderPlayer)}
        </SpecialTeamsGrid>
        <SpecialTeamsGrid className="center-row">
          {powerPlay2.slice(3, 5).map(renderPlayer)}
        </SpecialTeamsGrid>
          {powerPlay2.length > 0 && (
            <LineBadge value={pp2Chemistry}>{pp2Chemistry > 0 ? '+' : ''}{pp2Chemistry}</LineBadge>
          )}
        </div>
      </>
    );
  };

  const renderPenaltyKill = () => {
    const { penaltyKill1, penaltyKill2 } = roster;
    
    // Use penalty kill ratings from API if available
    const pk1Overall = Math.round(teamRatings.component_ratings?.penalty_kill_1 || 0);
    const pk2Overall = Math.round(teamRatings.component_ratings?.penalty_kill_2 || 0);
    
    // Use chemistry data from API or default to 0
    const pk1Chemistry = chemistryData?.penalty_kill_1 || 0;
    const pk2Chemistry = chemistryData?.penalty_kill_2 || 0;
    
    return (
      <>
        {renderSectionTitleWithOverall('1st Penalty Kill Unit', pk1Overall)}
        <div style={{ position: 'relative' }}>
        <SpecialTeamsGrid>
          {penaltyKill1.slice(0, 2).map(renderPlayer)}
        </SpecialTeamsGrid>
        <SpecialTeamsGrid className="center-row">
          {penaltyKill1.slice(2, 4).map(renderPlayer)}
        </SpecialTeamsGrid>
          {penaltyKill1.length > 0 && (
            <LineBadge value={pk1Chemistry}>{pk1Chemistry > 0 ? '+' : ''}{pk1Chemistry}</LineBadge>
          )}
        </div>
        
        {renderSectionTitleWithOverall('2nd Penalty Kill Unit', pk2Overall)}
        <div style={{ position: 'relative' }}>
        <SpecialTeamsGrid>
          {penaltyKill2.slice(0, 2).map(renderPlayer)}
        </SpecialTeamsGrid>
        <SpecialTeamsGrid className="center-row">
          {penaltyKill2.slice(2, 4).map(renderPlayer)}
        </SpecialTeamsGrid>
          {penaltyKill2.length > 0 && (
            <LineBadge value={pk2Chemistry}>{pk2Chemistry > 0 ? '+' : ''}{pk2Chemistry}</LineBadge>
          )}
        </div>
      </>
    );
  };

  const renderOtherLines = () => {
    const { fourOnFour, threeOnThree, shootout } = roster;
    
    // Use ratings from API if available
    const fourOnFourOverall = Math.round(teamRatings.component_ratings?.other_special_teams || 0);
    const threeOnThreeOverall = Math.round(teamRatings.component_ratings?.other_special_teams || 0);
    const shootoutOverall = Math.round(teamRatings.component_ratings?.other_special_teams || 0);
    
    // Use chemistry data from API or default to 0
    const fourOnFourChemistry = chemistryData?.four_on_four || 0;
    const threeOnThreeChemistry = chemistryData?.three_on_three || 0;
    const shootoutChemistry = chemistryData?.shootout || 0;
    
    return (
      <OtherLinesContainer $isVisible={showOtherLines}>
        {renderSectionTitleWithOverall('4-on-4 Formation', fourOnFourOverall)}
        <div style={{ position: 'relative' }}>
          <SpecialTeamsGrid>
            {fourOnFour.slice(0, 2).map(renderPlayer)}
          </SpecialTeamsGrid>
          <SpecialTeamsGrid className="center-row">
            {fourOnFour.slice(2, 4).map(renderPlayer)}
          </SpecialTeamsGrid>
          {fourOnFour.length > 0 && (
            <LineBadge value={fourOnFourChemistry}>{fourOnFourChemistry > 0 ? '+' : ''}{fourOnFourChemistry}</LineBadge>
          )}
        </div>
        
        {renderSectionTitleWithOverall('3-on-3 Overtime', threeOnThreeOverall)}
        <div style={{ position: 'relative' }}>
          <SpecialTeamsGrid className="center-row">
            {threeOnThree.map(renderPlayer)}
          </SpecialTeamsGrid>
          {threeOnThree.length > 0 && (
            <LineBadge value={threeOnThreeChemistry}>{threeOnThreeChemistry > 0 ? '+' : ''}{threeOnThreeChemistry}</LineBadge>
          )}
        </div>
        
        {renderSectionTitleWithOverall('Shootout Order', shootoutOverall)}
        <div style={{ position: 'relative' }}>
          <SpecialTeamsGrid>
            {shootout.map(renderPlayer)}
          </SpecialTeamsGrid>
          {shootout.length > 0 && (
            <LineBadge value={shootoutChemistry}>{shootoutChemistry > 0 ? '+' : ''}{shootoutChemistry}</LineBadge>
          )}
        </div>
      </OtherLinesContainer>
    );
  };

  const renderInjured = () => {
    const { injured } = roster;
    if (injured.length === 0) return null;
    
    // Create pairs of injured players
    const createPairs = (players) => {
      const pairs = [];
      for (let i = 0; i < players.length; i += 2) {
        pairs.push(players.slice(i, i + 2));
      }
      return pairs;
    };
    
    const injuredPairs = createPairs(injured);
    
    return (
      <>
        <SectionTitle>Injuries</SectionTitle>
        {injuredPairs.map((pair, index) => (
          <React.Fragment key={index}>
            <InjuryPairGrid>
              {pair.map(player => renderPlayer(player))}
            </InjuryPairGrid>
            <InjuryReturn>
              {pair.map(player => (
                <InjuryReturnItem key={player.id}>
                  {player.name} expected back in: {player.returnTime}
                </InjuryReturnItem>
              ))}
            </InjuryReturn>
          </React.Fragment>
        ))}
      </>
    );
  };

  const renderBenched = () => {
    const { benched } = roster;
    if (benched.length === 0) return null;
    
    // Create groups of benched players (3 per row)
    const createGroups = (players, groupSize = 3) => {
      const groups = [];
      for (let i = 0; i < players.length; i += groupSize) {
        groups.push(players.slice(i, i + groupSize));
      }
      return groups;
    };
    
    const benchedGroups = createGroups(benched);
    
    return (
      <>
        <SectionTitle>Benched</SectionTitle>
        {benchedGroups.map((group, index) => (
          <LineGrid key={index}>
            {group.map(renderPlayer)}
            {/* Fill any empty slots in the last row */}
            {index === benchedGroups.length - 1 && 
              Array(3 - group.length).fill().map((_, i) => <EmptySlot key={`empty-${i}`}>Empty Slot</EmptySlot>)}
        </LineGrid>
        ))}
      </>
    );
  };

  const renderBadgesLegend = () => {
    return (
      <BadgesLegend>
        <LegendItem>
          <LegendBadge color="#4CAF50" />
          <LegendText>Starter</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendBadge color="#e74c3c" />
          <LegendText>IR (Injured Reserve)</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendBadge color="#e67e22" />
          <LegendText>DTD (Day-to-Day)</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendBadge color="#c0392b" />
          <LegendText>OUT</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendBadge color="#f1c40f" />
          <LegendText>Game-time Decision</LegendText>
        </LegendItem>
      </BadgesLegend>
    );
  };

  const renderLast10GamesStats = () => {
    return (
      <StatsContainer>
        <SectionTitle>Forwards</SectionTitle>
        
        <StatsPosition>LW</StatsPosition>
        <StatsHeader>
          <StatsCell>Name</StatsCell>
          <StatsCell>GP</StatsCell>
          <StatsCell>Goals</StatsCell>
          <StatsCell>Assists</StatsCell>
          <StatsCell>Shots</StatsCell>
          <StatsCell>Blocks</StatsCell>
          <StatsCell>PPP</StatsCell>
          <StatsCell>TOI/GM</StatsCell>
        </StatsHeader>
        <StatsRow {...makeStatsRowClickable('Seth Jarvis')}>
          <StatsCell>SETH JARVIS</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>5</StatsCell>
          <StatsCell>7</StatsCell>
          <StatsCell>31</StatsCell>
          <StatsCell>6</StatsCell>
          <StatsCell>5</StatsCell>
          <StatsCell>19.15</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Eric Robinson')}>
          <StatsCell>ERIC ROBINSON</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>1</StatsCell>
          <StatsCell>4</StatsCell>
          <StatsCell>16</StatsCell>
          <StatsCell>5</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>12.46</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Jordan Martinook')}>
          <StatsCell>JORDAN MARTINOOK</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>13</StatsCell>
          <StatsCell>7</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>14.69</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Tyson Jost')}>
          <StatsCell>TYSON JOST</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>4</StatsCell>
          <StatsCell>6</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>9</StatsCell>
        </StatsRow>
        
        <StatsPosition>C</StatsPosition>
        <StatsHeader>
          <StatsCell>Name</StatsCell>
          <StatsCell>GP</StatsCell>
          <StatsCell>Goals</StatsCell>
          <StatsCell>Assists</StatsCell>
          <StatsCell>Shots</StatsCell>
          <StatsCell>Blocks</StatsCell>
          <StatsCell>PPP</StatsCell>
          <StatsCell>TOI/GM</StatsCell>
        </StatsHeader>
        <StatsRow {...makeStatsRowClickable('Sebastian Aho')}>
          <StatsCell>SEBASTIAN AHO</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>4</StatsCell>
          <StatsCell>5</StatsCell>
          <StatsCell>22</StatsCell>
          <StatsCell>3</StatsCell>
          <StatsCell>3</StatsCell>
          <StatsCell>19.85</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Jack Roslovic')}>
          <StatsCell>JACK ROSLOVIC</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>4</StatsCell>
          <StatsCell>15</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>14.78</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Jesperi Kotkaniemi')}>
          <StatsCell>JESPERI KOTKANIEMI</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>3</StatsCell>
          <StatsCell>11</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>15.11</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Mark Jankowski')}>
          <StatsCell>MARK JANKOWSKI</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>5</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>5</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>10.97</StatsCell>
        </StatsRow>
        
        <StatsPosition>RW</StatsPosition>
        <StatsHeader>
          <StatsCell>Name</StatsCell>
          <StatsCell>GP</StatsCell>
          <StatsCell>Goals</StatsCell>
          <StatsCell>Assists</StatsCell>
          <StatsCell>Shots</StatsCell>
          <StatsCell>Blocks</StatsCell>
          <StatsCell>PPP</StatsCell>
          <StatsCell>TOI/GM</StatsCell>
        </StatsHeader>
        <StatsRow {...makeStatsRowClickable('Jackson Blake')}>
          <StatsCell>JACKSON BLAKE</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>3</StatsCell>
          <StatsCell>5</StatsCell>
          <StatsCell>25</StatsCell>
          <StatsCell>6</StatsCell>
          <StatsCell>4</StatsCell>
          <StatsCell>17.12</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Taylor Hall')}>
          <StatsCell>TAYLOR HALL</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>7</StatsCell>
          <StatsCell>5</StatsCell>
          <StatsCell>22</StatsCell>
          <StatsCell>3</StatsCell>
          <StatsCell>6</StatsCell>
          <StatsCell>16.29</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Logan Stankoven')}>
          <StatsCell>LOGAN STANKOVEN</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>3</StatsCell>
          <StatsCell>25</StatsCell>
          <StatsCell>3</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>14.42</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Justin Robidas')}>
          <StatsCell>JUSTIN ROBIDAS</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>1</StatsCell>
          <StatsCell>17</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>8.12</StatsCell>
        </StatsRow>
        
        <SectionTitle>Defensive Pairings</SectionTitle>
        <StatsHeader>
          <StatsCell>Name</StatsCell>
          <StatsCell>GP</StatsCell>
          <StatsCell>Goals</StatsCell>
          <StatsCell>Assists</StatsCell>
          <StatsCell>Shots</StatsCell>
          <StatsCell>Blocks</StatsCell>
          <StatsCell>PPP</StatsCell>
          <StatsCell>TOI/GM</StatsCell>
        </StatsHeader>
        <StatsRow {...makeStatsRowClickable('Jaccob Slavin')}>
          <StatsCell>JACCOB SLAVIN</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>1</StatsCell>
          <StatsCell>12</StatsCell>
          <StatsCell>20</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>20.73</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Brent Burns')}>
          <StatsCell>BRENT BURNS</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>3</StatsCell>
          <StatsCell>17</StatsCell>
          <StatsCell>6</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>20.95</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Sean Walker')}>
          <StatsCell>SEAN WALKER</StatsCell>
          <StatsCell>10</StatsCell>
          <StatsCell>3</StatsCell>
          <StatsCell>1</StatsCell>
          <StatsCell>16</StatsCell>
          <StatsCell>12</StatsCell>
          <StatsCell>1</StatsCell>
          <StatsCell>18.36</StatsCell>
        </StatsRow>
        
        <SectionTitle>Goalies</SectionTitle>
        <StatsHeader>
          <StatsCell>Name</StatsCell>
          <StatsCell>GP</StatsCell>
          <StatsCell>W</StatsCell>
          <StatsCell>L</StatsCell>
          <StatsCell>GAA</StatsCell>
          <StatsCell>SV%</StatsCell>
          <StatsCell>SO</StatsCell>
          <StatsCell>MIN</StatsCell>
        </StatsHeader>
        <StatsRow {...makeStatsRowClickable('Frederik Andersen')}>
          <StatsCell>FREDERIK ANDERSEN</StatsCell>
          <StatsCell>6</StatsCell>
          <StatsCell>4</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>2.32</StatsCell>
          <StatsCell>.921</StatsCell>
          <StatsCell>1</StatsCell>
          <StatsCell>362</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Pyotr Kochetkov')}>
          <StatsCell>PYOTR KOCHETKOV</StatsCell>
          <StatsCell>4</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>2.75</StatsCell>
          <StatsCell>.905</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>244</StatsCell>
        </StatsRow>
      </StatsContainer>
    );
  };

  const renderSeasonStats = () => {
    return (
      <StatsContainer>
        <SectionTitle>Forwards</SectionTitle>
        
        <StatsPosition>LW</StatsPosition>
        <StatsHeader>
          <StatsCell>Name</StatsCell>
          <StatsCell>GP</StatsCell>
          <StatsCell>Goals</StatsCell>
          <StatsCell>Assists</StatsCell>
          <StatsCell>Shots</StatsCell>
          <StatsCell>Blocks</StatsCell>
          <StatsCell>PPP</StatsCell>
          <StatsCell>TOI/GM</StatsCell>
        </StatsHeader>
        <StatsRow {...makeStatsRowClickable('Seth Jarvis')}>
          <StatsCell>SETH JARVIS</StatsCell>
          <StatsCell>78</StatsCell>
          <StatsCell>30</StatsCell>
          <StatsCell>30</StatsCell>
          <StatsCell>181</StatsCell>
          <StatsCell>48</StatsCell>
          <StatsCell>18</StatsCell>
          <StatsCell>19.47</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Eric Robinson')}>
          <StatsCell>ERIC ROBINSON</StatsCell>
          <StatsCell>65</StatsCell>
          <StatsCell>13</StatsCell>
          <StatsCell>17</StatsCell>
          <StatsCell>101</StatsCell>
          <StatsCell>15</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>12</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Jordan Martinook')}>
          <StatsCell>JORDAN MARTINOOK</StatsCell>
          <StatsCell>72</StatsCell>
          <StatsCell>13</StatsCell>
          <StatsCell>21</StatsCell>
          <StatsCell>106</StatsCell>
          <StatsCell>48</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>15.29</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Tyson Jost')}>
          <StatsCell>TYSON JOST</StatsCell>
          <StatsCell>62</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>4</StatsCell>
          <StatsCell>27</StatsCell>
          <StatsCell>13</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>9.55</StatsCell>
        </StatsRow>
        
        <StatsPosition>C</StatsPosition>
        <StatsHeader>
          <StatsCell>Name</StatsCell>
          <StatsCell>GP</StatsCell>
          <StatsCell>Goals</StatsCell>
          <StatsCell>Assists</StatsCell>
          <StatsCell>Shots</StatsCell>
          <StatsCell>Blocks</StatsCell>
          <StatsCell>PPP</StatsCell>
          <StatsCell>TOI/GM</StatsCell>
        </StatsHeader>
        <StatsRow {...makeStatsRowClickable('Sebastian Aho')}>
          <StatsCell>SEBASTIAN AHO</StatsCell>
          <StatsCell>79</StatsCell>
          <StatsCell>28</StatsCell>
          <StatsCell>42</StatsCell>
          <StatsCell>189</StatsCell>
          <StatsCell>27</StatsCell>
          <StatsCell>22</StatsCell>
          <StatsCell>20.23</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Jack Roslovic')}>
          <StatsCell>JACK ROSLOVIC</StatsCell>
          <StatsCell>71</StatsCell>
          <StatsCell>21</StatsCell>
          <StatsCell>15</StatsCell>
          <StatsCell>125</StatsCell>
          <StatsCell>21</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>13.73</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Jesperi Kotkaniemi')}>
          <StatsCell>JESPERI KOTKANIEMI</StatsCell>
          <StatsCell>75</StatsCell>
          <StatsCell>11</StatsCell>
          <StatsCell>20</StatsCell>
          <StatsCell>106</StatsCell>
          <StatsCell>28</StatsCell>
          <StatsCell>1</StatsCell>
          <StatsCell>14.11</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Mark Jankowski')}>
          <StatsCell>MARK JANKOWSKI</StatsCell>
          <StatsCell>64</StatsCell>
          <StatsCell>11</StatsCell>
          <StatsCell>5</StatsCell>
          <StatsCell>56</StatsCell>
          <StatsCell>27</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>12.3</StatsCell>
        </StatsRow>
        
        <StatsPosition>RW</StatsPosition>
        <StatsHeader>
          <StatsCell>Name</StatsCell>
          <StatsCell>GP</StatsCell>
          <StatsCell>Goals</StatsCell>
          <StatsCell>Assists</StatsCell>
          <StatsCell>Shots</StatsCell>
          <StatsCell>Blocks</StatsCell>
          <StatsCell>PPP</StatsCell>
          <StatsCell>TOI/GM</StatsCell>
        </StatsHeader>
        <StatsRow {...makeStatsRowClickable('Jackson Blake')}>
          <StatsCell>JACKSON BLAKE</StatsCell>
          <StatsCell>76</StatsCell>
          <StatsCell>14</StatsCell>
          <StatsCell>16</StatsCell>
          <StatsCell>130</StatsCell>
          <StatsCell>29</StatsCell>
          <StatsCell>7</StatsCell>
          <StatsCell>13.63</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Taylor Hall')}>
          <StatsCell>TAYLOR HALL</StatsCell>
          <StatsCell>72</StatsCell>
          <StatsCell>17</StatsCell>
          <StatsCell>22</StatsCell>
          <StatsCell>130</StatsCell>
          <StatsCell>39</StatsCell>
          <StatsCell>9</StatsCell>
          <StatsCell>15.12</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Logan Stankoven')}>
          <StatsCell>LOGAN STANKOVEN</StatsCell>
          <StatsCell>67</StatsCell>
          <StatsCell>12</StatsCell>
          <StatsCell>23</StatsCell>
          <StatsCell>175</StatsCell>
          <StatsCell>27</StatsCell>
          <StatsCell>7</StatsCell>
          <StatsCell>15.01</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Justin Robidas')}>
          <StatsCell>JUSTIN ROBIDAS</StatsCell>
          <StatsCell>12</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>0</StatsCell>
        </StatsRow>
        
        <SectionTitle>Defensive Pairings</SectionTitle>
        <StatsHeader>
          <StatsCell>Name</StatsCell>
          <StatsCell>GP</StatsCell>
          <StatsCell>Goals</StatsCell>
          <StatsCell>Assists</StatsCell>
          <StatsCell>Shots</StatsCell>
          <StatsCell>Blocks</StatsCell>
          <StatsCell>PPP</StatsCell>
          <StatsCell>TOI/GM</StatsCell>
        </StatsHeader>
        <StatsRow {...makeStatsRowClickable('Jaccob Slavin')}>
          <StatsCell>JACCOB SLAVIN</StatsCell>
          <StatsCell>79</StatsCell>
          <StatsCell>6</StatsCell>
          <StatsCell>18</StatsCell>
          <StatsCell>100</StatsCell>
          <StatsCell>131</StatsCell>
          <StatsCell>0</StatsCell>
          <StatsCell>21.65</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Brent Burns')}>
          <StatsCell>BRENT BURNS</StatsCell>
          <StatsCell>81</StatsCell>
          <StatsCell>5</StatsCell>
          <StatsCell>20</StatsCell>
          <StatsCell>166</StatsCell>
          <StatsCell>94</StatsCell>
          <StatsCell>2</StatsCell>
          <StatsCell>21.36</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Sean Walker')}>
          <StatsCell>SEAN WALKER</StatsCell>
          <StatsCell>71</StatsCell>
          <StatsCell>5</StatsCell>
          <StatsCell>12</StatsCell>
          <StatsCell>92</StatsCell>
          <StatsCell>86</StatsCell>
          <StatsCell>1</StatsCell>
          <StatsCell>19.73</StatsCell>
        </StatsRow>
        
        <SectionTitle>Goalies</SectionTitle>
        <StatsHeader>
          <StatsCell>Name</StatsCell>
          <StatsCell>GP</StatsCell>
          <StatsCell>W</StatsCell>
          <StatsCell>L</StatsCell>
          <StatsCell>GAA</StatsCell>
          <StatsCell>SV%</StatsCell>
          <StatsCell>SO</StatsCell>
          <StatsCell>MIN</StatsCell>
        </StatsHeader>
        <StatsRow {...makeStatsRowClickable('Frederik Andersen')}>
          <StatsCell>FREDERIK ANDERSEN</StatsCell>
          <StatsCell>42</StatsCell>
          <StatsCell>29</StatsCell>
          <StatsCell>11</StatsCell>
          <StatsCell>2.38</StatsCell>
          <StatsCell>.919</StatsCell>
          <StatsCell>3</StatsCell>
          <StatsCell>2462</StatsCell>
        </StatsRow>
        <StatsRow {...makeStatsRowClickable('Pyotr Kochetkov')}>
          <StatsCell>PYOTR KOCHETKOV</StatsCell>
          <StatsCell>27</StatsCell>
          <StatsCell>15</StatsCell>
          <StatsCell>8</StatsCell>
          <StatsCell>2.58</StatsCell>
          <StatsCell>.910</StatsCell>
          <StatsCell>1</StatsCell>
          <StatsCell>1564</StatsCell>
        </StatsRow>
      </StatsContainer>
    );
  };

  // Update makeStatsRowClickable to fix the player name search
  const makeStatsRowClickable = (playerName) => {
    // Find full player data from roster
    const findFullPlayerData = (searchName) => {
      const allPlayers = [
        ...roster.forwards,
        ...roster.defensemen,
        ...roster.goalies,
        ...roster.injured,
        ...roster.benched
      ];
      return allPlayers.find(p => p.name.toUpperCase() === searchName.toUpperCase()) || { 
        name: searchName, 
        position: 'Unknown',
        overall: 70,
        player_type: 'Unknown'
      };
    };
    
    // Get full player data
    const fullPlayer = findFullPlayerData(playerName);
    
    return {
      onClick: () => handlePlayerClick(fullPlayer),
      style: { cursor: 'pointer' }
    };
  };

  // Render Player Modal
  const renderPlayerModal = () => {
    if (!showPlayerModal || !selectedPlayer) return null;
    
    const isGoalie = selectedPlayer.position === 'G';
    
    // Mock player attributes
    const attributes = selectedPlayer.attributes || {
      skating: Math.floor(Math.random() * 20) + 70,
      shooting: Math.floor(Math.random() * 20) + 70,
      hands: Math.floor(Math.random() * 20) + 70,
      checking: Math.floor(Math.random() * 20) + 70,
      defense: Math.floor(Math.random() * 20) + 70,
      physical: Math.floor(Math.random() * 20) + 70
    };
    
    // Format team name safely - important for avoiding the React child error
    const getTeamDisplay = () => {
      const teamName = selectedPlayer.team || 'N/A';
      return typeof teamName === 'object' ? teamName.name || 'N/A' : teamName;
    };
    
    // Get team abbreviation safely
    const getTeamAbbr = () => {
      const team = selectedPlayer.team;
      return typeof team === 'object' ? team.abbreviation || 'CAR' : 'CAR';
    };
    
    const teamAbbr = getTeamAbbr();
    
    const isProspect = selectedPlayer.isProspect || false;
    
    // Mock birthdate and location information if not available
    const birthdate = selectedPlayer.birthdate || 'Apr 6 2001';
    const birthCity = selectedPlayer.birth_city || 'Zell';
    const birthCountry = selectedPlayer.birth_country || 'Germany';
    const heightCm = selectedPlayer.height_cm || '191';
    const weightKg = selectedPlayer.weight_kg || '93';
    
    // Mock season stats data with the safely obtained team abbreviation
    const seasonStats = [
      { season: '2023-24', team: teamAbbr, league: 'NHL', gp: 82, goals: isGoalie ? null : 9, assists: isGoalie ? null : 33, points: isGoalie ? null : 42, plusMinus: isGoalie ? null : -7, pim: 51, wins: isGoalie ? 29 : null, losses: isGoalie ? 11 : null, gaa: isGoalie ? 2.38 : null, svp: isGoalie ? .919 : null },
      { season: '2022-23', team: teamAbbr, league: 'NHL', gp: 82, goals: isGoalie ? null : 5, assists: isGoalie ? null : 37, points: isGoalie ? null : 42, plusMinus: isGoalie ? null : -11, pim: 40, wins: isGoalie ? 32 : null, losses: isGoalie ? 10 : null, gaa: isGoalie ? 2.41 : null, svp: isGoalie ? .922 : null },
      { season: '2021-22', team: teamAbbr, league: 'NHL', gp: 82, goals: isGoalie ? null : 7, assists: isGoalie ? null : 43, points: isGoalie ? null : 50, plusMinus: isGoalie ? null : -9, pim: 34, wins: isGoalie ? 24 : null, losses: isGoalie ? 12 : null, gaa: isGoalie ? 2.51 : null, svp: isGoalie ? .915 : null },
      { season: '2020-21', team: 'SWE', league: 'SweHL', gp: 41, goals: isGoalie ? null : 7, assists: isGoalie ? null : 21, points: isGoalie ? null : 28, plusMinus: isGoalie ? null : 14, pim: 16, wins: isGoalie ? 18 : null, losses: isGoalie ? 8 : null, gaa: isGoalie ? 2.22 : null, svp: isGoalie ? .925 : null }
    ];
    
    // Mock playoff stats
    const playoffStats = [
      { season: '2020-21', team: 'SWE', gp: 13, goals: isGoalie ? null : 1, assists: isGoalie ? null : 4, points: isGoalie ? null : 5, pim: 8, wins: isGoalie ? 9 : null, losses: isGoalie ? 4 : null, gaa: isGoalie ? 2.11 : null, svp: isGoalie ? .931 : null }
    ];
    
    // Get NHL totals
    const nhlStats = seasonStats.filter(s => s.league === 'NHL');
    const nhlTotals = isGoalie ? {
      gp: nhlStats.reduce((sum, s) => sum + s.gp, 0),
      wins: nhlStats.reduce((sum, s) => sum + s.wins, 0),
      losses: nhlStats.reduce((sum, s) => sum + s.losses, 0),
      gaa: (nhlStats.reduce((sum, s) => sum + s.gaa, 0) / nhlStats.length).toFixed(2),
      svp: (nhlStats.reduce((sum, s) => sum + s.svp, 0) / nhlStats.length).toFixed(3),
      pim: nhlStats.reduce((sum, s) => sum + s.pim, 0)
    } : {
      gp: nhlStats.reduce((sum, s) => sum + s.gp, 0),
      goals: nhlStats.reduce((sum, s) => sum + s.goals, 0),
      assists: nhlStats.reduce((sum, s) => sum + s.assists, 0),
      points: nhlStats.reduce((sum, s) => sum + s.points, 0),
      pim: nhlStats.reduce((sum, s) => sum + s.pim, 0)
    };
    
    // Mock tournaments data
    const tournaments = [
      { 
        year: 2020, 
        tournament: 'World Junior U-20 Championships', 
        team: 'Germany U-20',
        gp: 7,
        goals: isGoalie ? null : 0,
        assists: isGoalie ? null : 6,
        points: isGoalie ? null : 6,
        pim: 6,
        plusMinus: isGoalie ? null : 0,
        wins: isGoalie ? 4 : null,
        losses: isGoalie ? 3 : null,
        gaa: isGoalie ? 2.45 : null, 
        svp: isGoalie ? .914 : null
      }
    ];
    
    // Mock draft information if not available
    const draftTeam = selectedPlayer.draft_team || 'Detroit Red Wings';
    const draftPosition = selectedPlayer.draft_position || '6';
    const draftYear = selectedPlayer.draft_year || '2019';
    
    // Mock awards data
    const awards = [
      { year: '2021-22', league: 'NHL', award: isGoalie ? 'Vezina Trophy' : 'Calder Memorial Trophy' }
    ];
    
    return (
      <PlayerModal onClick={closePlayerModal}>
        <PlayerCardContent onClick={(e) => e.stopPropagation()}>
          <PlayerCardClose onClick={closePlayerModal}>×</PlayerCardClose>
          
          <PlayerCardHeader>
            <PlayerCardInfo>
              <PlayerCardName>{selectedPlayer.name}</PlayerCardName>
              <PlayerCardDetails>
                <PlayerCardDetail>
                  <span>Position:</span> {selectedPlayer.position || 'N/A'} -- shoots {selectedPlayer.handedness || 'R'}
                </PlayerCardDetail>
                <PlayerCardDetail>
                  <span>Born:</span> {birthdate} -- {birthCity}, {birthCountry}
                </PlayerCardDetail>
                <PlayerCardDetail>
                  <span>Age:</span> {selectedPlayer.age || '24'} yrs
                </PlayerCardDetail>
                <PlayerCardDetail>
                  <span>Height/Weight:</span> {selectedPlayer.height || '6.03'} -- {selectedPlayer.weight || '205'} [{heightCm} cm/{weightKg} kg]
                </PlayerCardDetail>
                
                {/* Team Information */}
                <PlayerCardDetail>
                  <span>Status:</span> {isProspect ? (
                    <span style={{color: '#4CAF50', fontWeight: 'bold'}}>Prospect</span>
                  ) : (
                    <span>{getTeamDisplay()}</span>
                  )}
                </PlayerCardDetail>
                
                {draftTeam && (
                  <PlayerCardDetail>
                    <span>Drafted by:</span> <span style={{color: '#B30E16', fontWeight: 'bold'}}>{draftTeam}</span>
                  </PlayerCardDetail>
                )}
                
                {draftPosition && (
                  <PlayerCardDetail>
                    <span>Draft Position:</span> round 1 <span style={{color: '#B30E16', fontWeight: 'bold'}}>#{draftPosition}</span> overall {draftYear} NHL Entry Draft
                  </PlayerCardDetail>
                )}
                
                {selectedPlayer.overall && (
                  <PlayerCardDetail>
                    <span>Overall:</span> {selectedPlayer.overall}
                  </PlayerCardDetail>
                )}
                
                {selectedPlayer.player_type && (
                  <PlayerCardDetail>
                    <span>Type:</span> {selectedPlayer.player_type || 'N/A'}
                  </PlayerCardDetail>
                )}
                
                {selectedPlayer.injuryStatus && (
                  <PlayerCardDetail>
                    <span>Status:</span> <span style={{ color: '#e74c3c' }}>{selectedPlayer.injuryStatus}</span>
                  </PlayerCardDetail>
                )}
                
                {selectedPlayer.returnTime && (
                  <PlayerCardDetail>
                    <span>Return:</span> {selectedPlayer.returnTime}
                  </PlayerCardDetail>
                )}
                
                {selectedPlayer.isStarter && (
                  <PlayerCardDetail>
                    <span>Status:</span> <span style={{ color: '#4CAF50' }}>Starter</span>
                  </PlayerCardDetail>
                )}
              </PlayerCardDetails>
            </PlayerCardInfo>
            <PlayerCardImage 
              style={{
                backgroundImage: selectedPlayer.image_url ? `url(${selectedPlayer.image_url})` : 'none',
                backgroundColor: '#B30E16',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold'
              }}
            >
              {!selectedPlayer.image_url && (selectedPlayer.number || '#')}
            </PlayerCardImage>
          </PlayerCardHeader>
          
          <PlayerCardBody>
            {/* Regular Season / Playoffs Stats Table Header */}
            <div style={{display: 'flex', backgroundColor: '#1a3042'}}>
              <div style={{flex: 1, textAlign: 'center', padding: '8px', fontWeight: 'bold', color: 'white'}}>
                Regular Season
              </div>
              <div style={{flex: 1, textAlign: 'center', padding: '8px', fontWeight: 'bold', color: 'white'}}>
                Playoffs
              </div>
            </div>
            
            <SeasonStatsTable>
              <StatsTable>
                <thead>
                  <tr>
                    <StatsTableHeader>Season</StatsTableHeader>
                    <StatsTableHeader>Team</StatsTableHeader>
                    <StatsTableHeader>Lge</StatsTableHeader>
                    <StatsTableHeader>GP</StatsTableHeader>
                    {isGoalie ? (
                      <>
                        <StatsTableHeader>W</StatsTableHeader>
                        <StatsTableHeader>L</StatsTableHeader>
                        <StatsTableHeader>GAA</StatsTableHeader>
                        <StatsTableHeader>SV%</StatsTableHeader>
                        <StatsTableHeader>PIM</StatsTableHeader>
                      </>
                    ) : (
                      <>
                        <StatsTableHeader>G</StatsTableHeader>
                        <StatsTableHeader>A</StatsTableHeader>
                        <StatsTableHeader>PTS</StatsTableHeader>
                        <StatsTableHeader>PIM</StatsTableHeader>
                        <StatsTableHeader>+/-</StatsTableHeader>
                      </>
                    )}
                    <StatsTableHeader>GP</StatsTableHeader>
                    {isGoalie ? (
                      <>
                        <StatsTableHeader>W</StatsTableHeader>
                        <StatsTableHeader>L</StatsTableHeader>
                        <StatsTableHeader>GAA</StatsTableHeader>
                        <StatsTableHeader>SV%</StatsTableHeader>
                      </>
                    ) : (
                      <>
                        <StatsTableHeader>G</StatsTableHeader>
                        <StatsTableHeader>A</StatsTableHeader>
                        <StatsTableHeader>PTS</StatsTableHeader>
                        <StatsTableHeader>PIM</StatsTableHeader>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {seasonStats.map((season, index) => {
                    // Find matching playoff stats
                    const playoff = playoffStats.find(p => p.season === season.season);
                    
                    // Determine text color based on league
                    const isAHL = season.league === 'AHL';
                    const isSweHL = season.league === 'SweHL';
                    const isNHL = season.league === 'NHL';
                    
                    let textColor = '#fff'; // Default white text
                    if (isAHL) textColor = '#e6b5bc'; // Pink for AHL
                    if (isSweHL) textColor = '#a5d6a7'; // Green for SweHL
                    if (isNHL) textColor = '#ffcc80'; // Gold/orange for NHL
                    
                    return (
                      <StatsTableRow key={index} style={{ color: textColor, backgroundColor: index % 2 === 0 ? '#2a2a2a' : '#1e1e1e' }}>
                        <StatsTableCell>{season.season}</StatsTableCell>
                        <StatsTableCell>{season.team}</StatsTableCell>
                        <StatsTableCell>{season.league}</StatsTableCell>
                        <StatsTableCell>{season.gp}</StatsTableCell>
                        {isGoalie ? (
                          <>
                            <StatsTableCell>{season.wins}</StatsTableCell>
                            <StatsTableCell>{season.losses}</StatsTableCell>
                            <StatsTableCell>{season.gaa}</StatsTableCell>
                            <StatsTableCell>{season.svp}</StatsTableCell>
                            <StatsTableCell>{season.pim}</StatsTableCell>
                          </>
                        ) : (
                          <>
                            <StatsTableCell>{season.goals}</StatsTableCell>
                            <StatsTableCell>{season.assists}</StatsTableCell>
                            <StatsTableCell>{season.points}</StatsTableCell>
                            <StatsTableCell>{season.pim}</StatsTableCell>
                            <StatsTableCell>{season.plusMinus}</StatsTableCell>
                          </>
                        )}
                        <StatsTableCell>{playoff ? playoff.gp : '--'}</StatsTableCell>
                        {isGoalie ? (
                          <>
                            <StatsTableCell>{playoff ? playoff.wins : '--'}</StatsTableCell>
                            <StatsTableCell>{playoff ? playoff.losses : '--'}</StatsTableCell>
                            <StatsTableCell>{playoff ? playoff.gaa : '--'}</StatsTableCell>
                            <StatsTableCell>{playoff ? playoff.svp : '--'}</StatsTableCell>
                          </>
                        ) : (
                          <>
                            <StatsTableCell>{playoff ? playoff.goals : '--'}</StatsTableCell>
                            <StatsTableCell>{playoff ? playoff.assists : '--'}</StatsTableCell>
                            <StatsTableCell>{playoff ? playoff.points : '--'}</StatsTableCell>
                            <StatsTableCell>{playoff ? playoff.pim : '--'}</StatsTableCell>
                          </>
                        )}
                      </StatsTableRow>
                    );
                  })}
                  {/* NHL Totals row */}
                  <StatsTableRow style={{ color: '#ffcc80', fontWeight: 'bold', backgroundColor: '#1e1e1e' }}>
                    <StatsTableCell>NHL Totals</StatsTableCell>
                    <StatsTableCell></StatsTableCell>
                    <StatsTableCell></StatsTableCell>
                    <StatsTableCell>{nhlTotals.gp}</StatsTableCell>
                    {isGoalie ? (
                      <>
                        <StatsTableCell>{nhlTotals.wins}</StatsTableCell>
                        <StatsTableCell>{nhlTotals.losses}</StatsTableCell>
                        <StatsTableCell>{nhlTotals.gaa}</StatsTableCell>
                        <StatsTableCell>{nhlTotals.svp}</StatsTableCell>
                        <StatsTableCell>{nhlTotals.pim}</StatsTableCell>
                      </>
                    ) : (
                      <>
                        <StatsTableCell>{nhlTotals.goals}</StatsTableCell>
                        <StatsTableCell>{nhlTotals.assists}</StatsTableCell>
                        <StatsTableCell>{nhlTotals.points}</StatsTableCell>
                        <StatsTableCell>{nhlTotals.pim}</StatsTableCell>
                        <StatsTableCell></StatsTableCell>
                      </>
                    )}
                    <StatsTableCell></StatsTableCell>
                    {isGoalie ? (
                      <>
                        <StatsTableCell></StatsTableCell>
                        <StatsTableCell></StatsTableCell>
                        <StatsTableCell></StatsTableCell>
                        <StatsTableCell></StatsTableCell>
                      </>
                    ) : (
                      <>
                        <StatsTableCell></StatsTableCell>
                        <StatsTableCell></StatsTableCell>
                        <StatsTableCell></StatsTableCell>
                        <StatsTableCell></StatsTableCell>
                      </>
                    )}
                  </StatsTableRow>
                </tbody>
              </StatsTable>
            </SeasonStatsTable>
            
            {/* Tournaments Section */}
            <PlayerCardSection>
              <PlayerCardSectionTitle>Tournaments</PlayerCardSectionTitle>
              <SeasonStatsTable>
                <StatsTable>
                  <thead>
                    <tr>
                      <StatsTableHeader>Year</StatsTableHeader>
                      <StatsTableHeader>Tournament</StatsTableHeader>
                      <StatsTableHeader>Team</StatsTableHeader>
                      <StatsTableHeader>GP</StatsTableHeader>
                      {isGoalie ? (
                        <>
                          <StatsTableHeader>W</StatsTableHeader>
                          <StatsTableHeader>L</StatsTableHeader>
                          <StatsTableHeader>GAA</StatsTableHeader>
                          <StatsTableHeader>SV%</StatsTableHeader>
                          <StatsTableHeader>PIM</StatsTableHeader>
                        </>
                      ) : (
                        <>
                          <StatsTableHeader>G</StatsTableHeader>
                          <StatsTableHeader>A</StatsTableHeader>
                          <StatsTableHeader>PTS</StatsTableHeader>
                          <StatsTableHeader>PIM</StatsTableHeader>
                          <StatsTableHeader>+/-</StatsTableHeader>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {tournaments.map((tournament, index) => {
                      const rowBackground = index % 2 === 0 ? '#2a2a2a' : '#1e1e1e';
                      return (
                        <StatsTableRow key={index} style={{ color: '#e6b5bc', backgroundColor: rowBackground }}>
                          <StatsTableCell>{tournament.year}</StatsTableCell>
                          <StatsTableCell>{tournament.tournament}</StatsTableCell>
                          <StatsTableCell>{tournament.team}</StatsTableCell>
                          <StatsTableCell>{tournament.gp}</StatsTableCell>
                          {isGoalie ? (
                            <>
                              <StatsTableCell>{tournament.wins}</StatsTableCell>
                              <StatsTableCell>{tournament.losses}</StatsTableCell>
                              <StatsTableCell>{tournament.gaa}</StatsTableCell>
                              <StatsTableCell>{tournament.svp}</StatsTableCell>
                              <StatsTableCell>{tournament.pim}</StatsTableCell>
                            </>
                          ) : (
                            <>
                              <StatsTableCell>{tournament.goals}</StatsTableCell>
                              <StatsTableCell>{tournament.assists}</StatsTableCell>
                              <StatsTableCell>{tournament.points}</StatsTableCell>
                              <StatsTableCell>{tournament.pim}</StatsTableCell>
                              <StatsTableCell>{tournament.plusMinus}</StatsTableCell>
                            </>
                          )}
                        </StatsTableRow>
                      );
                    })}
                  </tbody>
                </StatsTable>
              </SeasonStatsTable>
            </PlayerCardSection>
            
            {/* Awards Section */}
            <PlayerCardSection>
              <PlayerCardSectionTitle>Awards</PlayerCardSectionTitle>
              <SeasonStatsTable>
                <StatsTable>
                  <thead>
                    <tr>
                      <StatsTableHeader>Year</StatsTableHeader>
                      <StatsTableHeader>League</StatsTableHeader>
                      <StatsTableHeader>Award</StatsTableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {awards.map((award, index) => {
                      const rowBackground = index % 2 === 0 ? '#2a2a2a' : '#1e1e1e';
                      return (
                        <StatsTableRow key={index} style={{ color: '#81c784', backgroundColor: rowBackground }}>
                          <StatsTableCell>{award.year}</StatsTableCell>
                          <StatsTableCell>{award.league}</StatsTableCell>
                          <StatsTableCell style={{textAlign: 'left'}}>{award.award}</StatsTableCell>
                        </StatsTableRow>
                      );
                    })}
                  </tbody>
                </StatsTable>
              </SeasonStatsTable>
            </PlayerCardSection>
            
            {/* Player Attributes Section */}
            <PlayerCardSection>
              <PlayerCardSectionTitle>Attributes</PlayerCardSectionTitle>
              <AttributeGrid>
                {Object.entries(attributes).map(([key, value]) => (
                  <AttributeItem key={key}>
                    <AttributeName>{key.charAt(0).toUpperCase() + key.slice(1)}</AttributeName>
                    <AttributeValue value={value}>{value}</AttributeValue>
                  </AttributeItem>
                ))}
              </AttributeGrid>
            </PlayerCardSection>
          </PlayerCardBody>
        </PlayerCardContent>
      </PlayerModal>
    );
  };

  return (
    <Container>
      <Header>
        <TeamSelector>
          <StyledSelect value={selectedLeague} onChange={handleLeagueChange}>
            <option value="NHL">NHL</option>
            <option value="AHL">AHL</option>
            <option value="CHL">CHL</option>
          </StyledSelect>
          <StyledSelect 
            value={selectedTeam || ''} 
            onChange={handleTeamChange}
          >
            <option value="">Select Team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.team}
              </option>
            ))}
          </StyledSelect>
        </TeamSelector>

        {teamInfo ? (
          <TeamHeader>
            <TeamLogo>
              {teamInfo.abbreviation || '???'}
            </TeamLogo>
            <TeamInfo>
              <TeamName>
                {teamInfo.team || 'Select Team'}
                <TeamOverall>
                  {Math.round(teamRatings.overall) || '??'}
                  <Tooltip title={`Offense: ${Math.round(teamRatings.offense || 0)}, Defense: ${Math.round(teamRatings.defense || 0)}, Special Teams: ${Math.round(teamRatings.special_teams || 0)}, Goaltending: ${Math.round(teamRatings.goaltending || 0)}`}>
                    <span style={{ marginLeft: '5px', fontSize: '0.8rem', cursor: 'help' }}>ⓘ</span>
                  </Tooltip>
                </TeamOverall>
              </TeamName>
              <LeagueInfo>{teamInfo.league || selectedLeague}</LeagueInfo>
            </TeamInfo>
            <EditLinesButton onClick={() => alert('Edit lines feature coming soon!')}>
              Edit Lines
            </EditLinesButton>
          </TeamHeader>
        ) : (
          <TeamHeader>
            <TeamInfo>
              <TeamName>Line Combinations</TeamName>
              <LeagueInfo>{selectedLeague}</LeagueInfo>
            </TeamInfo>
          </TeamHeader>
        )}

        <NavWidgets>
          <NavWidget 
            active={activeWidget === 'lines'} 
            onClick={() => handleWidgetClick('lines')}
          >
            Lines
          </NavWidget>
          <NavWidget 
            active={activeWidget === 'stats'} 
            onClick={() => handleWidgetClick('stats')}
          >
            Last 10 Games
          </NavWidget>
          <NavWidget 
            active={activeWidget === 'season'} 
            onClick={() => handleWidgetClick('season')}
          >
            Season Stats
          </NavWidget>
          <NavWidget 
            active={activeWidget === 'news'} 
            onClick={() => handleWidgetClick('news')}
          >
            Team News
          </NavWidget>
        </NavWidgets>
      </Header>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <ContentArea>
          {activeWidget === 'lines' && (
            <>
              {renderForwardLines()}
              {renderDefensePairs()}
              {renderGoalies()}
              {renderPowerPlay()}
              {renderPenaltyKill()}
              <OtherLinesButton onClick={() => setShowOtherLines(!showOtherLines)}>
                {showOtherLines ? 'Hide Other Lines' : 'Show Other Lines'}
              </OtherLinesButton>
              {renderOtherLines()}
              {renderInjured()}
              {renderBenched()}
            </>
          )}
          {activeWidget === 'stats' && renderLast10GamesStats()}
          {activeWidget === 'season' && renderSeasonStats()}
          {activeWidget === 'news' && <div>Team News Coming Soon</div>}
        </ContentArea>
      )}

      {renderPlayerModal()}
    </Container>
  );
};

export default LineCombinations; 