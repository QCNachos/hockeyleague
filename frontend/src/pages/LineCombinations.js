import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PlayerCard from '../components/PlayerCard';

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
  gap: 15px;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #1a1a1a;
  border-radius: 8px;
  border: 1px solid #333;
`;

const TeamLogo = styled.div`
  width: 60px;
  height: 60px;
  background-color: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #fff;
`;

const TeamInfo = styled.div`
  flex: 1;
`;

const TeamName = styled.h1`
  color: #C4CED4;
  margin: 0;
  font-size: 2rem;
`;

const LeagueInfo = styled.div`
  color: #888;
  font-size: 1.1rem;
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

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  color: #C4CED4;
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

const Select = styled.select`
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

// New components for the Team News view
const NewsContainer = styled.div`
  background-color: #1e2133;
  border-radius: 6px;
  margin-bottom: 30px;
`;

const NewsHeader = styled.h1`
  color: white;
  font-size: 2rem;
  text-align: center;
  padding: 20px;
  margin: 0;
  background-color: #162040;
  border-bottom: 3px solid #B30E16;
`;

const NewsItem = styled.div`
  padding: 20px;
  border-bottom: 1px solid #333;
  
  &:last-child {
    border-bottom: none;
  }
`;

const NewsPlayerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

const NewsPlayerName = styled.h3`
  color: white;
  font-size: 1.2rem;
  margin: 0;
  
  span {
    color: #B30E16;
    font-weight: normal;
    margin-left: 5px;
  }
`;

const NewsBadge = styled.div`
  background-color: ${props => props.type === 'injury' ? '#e74c3c' : 
                              props.type === 'starter' ? '#4CAF50' : '#3498db'};
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  margin-left: auto;
`;

const NewsContent = styled.p`
  color: #C4CED4;
  margin: 0 0 10px 0;
  line-height: 1.4;
`;

const NewsSource = styled.div`
  color: #999;
  font-size: 0.8rem;
  font-style: italic;
`;

const PlayerJersey = styled.div`
  width: 100px;
  height: 120px;
  border-radius: 6px;
  overflow: hidden;
  margin-left: 15px;
  background-color: #B30E16;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 2rem;
  font-weight: bold;
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
  display: ${props => props.visible ? 'block' : 'none'};
`;

// Add back the PlayerCard styled component with a different name to avoid conflicts
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
    weightedSum += (player?.overall || 0) * normalizedWeights[index];
  });
  
  return Math.round(weightedSum);
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
        
        console.log('Team info loaded:', data);
      } catch (error) {
        console.error('Error fetching team info:', error);
      }
    };

    fetchTeamInfo();
  }, [teamId, league]);

  // Effect to set mock roster data
  useEffect(() => {
    const fetchRoster = async () => {
      setLoading(true);
      try {
        // Always use mock data
        setTimeout(() => {
          setRoster(getMockRoster());
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching roster:', error);
        setLoading(false);
      }
    };

    fetchRoster();
  }, [selectedTeam]); // Update roster when team changes

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

  const getMockRoster = () => {
    return {
      forwards: [
        { id: 1, name: 'Seth Jarvis', position: 'LW', number: 24, overall: 86, player_type: 'Playmaker',
          attributes: { skating: 87, shooting: 84, hands: 88, checking: 81, defense: 82 } },
        { id: 2, name: 'Sebastian Aho', position: 'C', number: 20, overall: 91, player_type: 'Sniper',
          attributes: { skating: 90, shooting: 92, hands: 91, checking: 85, defense: 87 } },
        { id: 3, name: 'Jackson Blake', position: 'RW', number: 53, overall: 83, player_type: '2 Way',
          attributes: { skating: 82, shooting: 81, hands: 83, checking: 84, defense: 85 } },
        { id: 4, name: 'Eric Robinson', position: 'LW', number: 50, overall: 79, player_type: 'Power Forward',
          attributes: { skating: 80, shooting: 78, hands: 76, checking: 84, defense: 77 } },
        { id: 5, name: 'Jack Roslovic', position: 'C', number: 98, overall: 82, player_type: 'Playmaker',
          attributes: { skating: 84, shooting: 81, hands: 85, checking: 78, defense: 80 } },
        { id: 6, name: 'Taylor Hall', position: 'RW', number: 71, overall: 85, player_type: 'Sniper',
          attributes: { skating: 87, shooting: 88, hands: 86, checking: 80, defense: 79 } },
        { id: 7, name: 'Jordan Martinook', position: 'LW', number: 48, overall: 81, player_type: '2 Way',
          attributes: { skating: 81, shooting: 79, hands: 80, checking: 84, defense: 83 } },
        { id: 8, name: 'Jesperi Kotkaniemi', position: 'C', number: 82, overall: 80, player_type: 'Power Forward',
          attributes: { skating: 79, shooting: 80, hands: 81, checking: 82, defense: 78 } },
        { id: 9, name: 'Logan Stankoven', position: 'RW', number: 22, overall: 84, player_type: 'Sniper',
          attributes: { skating: 85, shooting: 87, hands: 85, checking: 79, defense: 80 } },
        { id: 10, name: 'Tyson Jost', position: 'LW', number: 27, overall: 78, player_type: '2 Way',
          attributes: { skating: 80, shooting: 77, hands: 78, checking: 79, defense: 80 } },
        { id: 11, name: 'Mark Jankowski', position: 'C', number: 77, overall: 77, player_type: 'Power Forward',
          attributes: { skating: 77, shooting: 76, hands: 75, checking: 80, defense: 78 } },
        { id: 12, name: 'Justin Robidas', position: 'RW', number: 39, overall: 75, player_type: 'Playmaker',
          attributes: { skating: 78, shooting: 74, hands: 77, checking: 73, defense: 74 } },
      ],
      defensemen: [
        { id: 13, name: 'Jaccob Slavin', position: 'LD', number: 74, overall: 89, player_type: 'Defensive Def.',
          attributes: { skating: 85, shooting: 83, hands: 84, checking: 90, defense: 92 } },
        { id: 14, name: 'Brent Burns', position: 'RD', number: 8, overall: 86, player_type: 'Offensive Def.',
          attributes: { skating: 82, shooting: 89, hands: 88, checking: 86, defense: 85 } },
        { id: 15, name: 'Sean Walker', position: 'LD', number: 26, overall: 82, player_type: '2 Way Def.',
          attributes: { skating: 83, shooting: 81, hands: 82, checking: 83, defense: 84 } },
        { id: 16, name: 'Jalen Chatfield', position: 'RD', number: 5, overall: 80, player_type: 'Defensive Def.',
          attributes: { skating: 80, shooting: 76, hands: 77, checking: 84, defense: 85 } },
        { id: 17, name: 'Shayne Gostisbehere', position: 'LD', number: 4, overall: 84, player_type: 'Offensive Def.',
          attributes: { skating: 86, shooting: 87, hands: 88, checking: 78, defense: 80 } },
        { id: 18, name: 'Scott Morrow', position: 'RD', number: 56, overall: 79, player_type: '2 Way Def.',
          attributes: { skating: 81, shooting: 78, hands: 79, checking: 80, defense: 81 } },
      ],
      goalies: [
        { id: 19, name: 'Frederik Andersen', position: 'G', number: 31, overall: 88, isStarter: true, split: 65, player_type: 'Athletic',
          attributes: { agility: 88, positioning: 89, reflexes: 87, puck_control: 86, mental: 85 } },
        { id: 20, name: 'Pyotr Kochetkov', position: 'G', number: 52, overall: 83, isStarter: false, split: 35, player_type: 'Blocker',
          attributes: { agility: 83, positioning: 82, reflexes: 85, puck_control: 80, mental: 82 } },
      ],
      powerPlay1: [
        { id: 2, name: 'Sebastian Aho', position: 'C', number: 20, overall: 91, player_type: 'Sniper' },
        { id: 1, name: 'Seth Jarvis', position: 'LW', number: 24, overall: 86, player_type: 'Playmaker' },
        { id: 3, name: 'Jackson Blake', position: 'RW', number: 53, overall: 83, player_type: '2 Way' },
        { id: 6, name: 'Taylor Hall', position: 'RW', number: 71, overall: 85, player_type: 'Sniper' },
        { id: 17, name: 'Shayne Gostisbehere', position: 'LD', number: 4, overall: 84, player_type: 'Offensive Def.' },
      ],
      powerPlay2: [
        { id: 9, name: 'Logan Stankoven', position: 'RW', number: 22, overall: 84, player_type: 'Sniper' },
        { id: 8, name: 'Jesperi Kotkaniemi', position: 'C', number: 82, overall: 80, player_type: 'Power Forward' },
        { id: 5, name: 'Jack Roslovic', position: 'C', number: 98, overall: 82, player_type: 'Playmaker' },
        { id: 14, name: 'Brent Burns', position: 'RD', number: 8, overall: 86, player_type: 'Offensive Def.' },
        { id: 15, name: 'Sean Walker', position: 'LD', number: 26, overall: 82, player_type: '2 Way Def.' },
      ],
      penaltyKill1: [
        { id: 2, name: 'Sebastian Aho', position: 'C', number: 20, overall: 91, player_type: 'Sniper' },
        { id: 1, name: 'Seth Jarvis', position: 'LW', number: 24, overall: 86, player_type: 'Playmaker' },
        { id: 13, name: 'Jaccob Slavin', position: 'LD', number: 74, overall: 89, player_type: 'Defensive Def.' },
        { id: 14, name: 'Brent Burns', position: 'RD', number: 8, overall: 86, player_type: 'Offensive Def.' },
      ],
      penaltyKill2: [
        { id: 4, name: 'Eric Robinson', position: 'LW', number: 50, overall: 79, player_type: 'Power Forward' },
        { id: 10, name: 'Tyson Jost', position: 'LW', number: 27, overall: 78, player_type: '2 Way' },
        { id: 15, name: 'Sean Walker', position: 'LD', number: 26, overall: 82, player_type: '2 Way Def.' },
        { id: 18, name: 'Scott Morrow', position: 'RD', number: 56, overall: 79, player_type: '2 Way Def.' },
      ],
      // Add new formations for other lines
      fourOnFour: [
        { id: 2, name: 'Sebastian Aho', position: 'C', number: 20, overall: 91, player_type: 'Sniper' },
        { id: 6, name: 'Taylor Hall', position: 'RW', number: 71, overall: 85, player_type: 'Sniper' },
        { id: 13, name: 'Jaccob Slavin', position: 'LD', number: 74, overall: 89, player_type: 'Defensive Def.' },
        { id: 14, name: 'Brent Burns', position: 'RD', number: 8, overall: 86, player_type: 'Offensive Def.' },
      ],
      threeOnThree: [
        { id: 2, name: 'Sebastian Aho', position: 'C', number: 20, overall: 91, player_type: 'Sniper' },
        { id: 1, name: 'Seth Jarvis', position: 'LW', number: 24, overall: 86, player_type: 'Playmaker' },
        { id: 17, name: 'Shayne Gostisbehere', position: 'LD', number: 4, overall: 84, player_type: 'Offensive Def.' },
      ],
      shootout: [
        { id: 2, name: 'Sebastian Aho', position: 'C', number: 20, overall: 91, player_type: 'Sniper' },
        { id: 9, name: 'Logan Stankoven', position: 'RW', number: 22, overall: 84, player_type: 'Sniper' },
        { id: 1, name: 'Seth Jarvis', position: 'LW', number: 24, overall: 86, player_type: 'Playmaker' },
        { id: 6, name: 'Taylor Hall', position: 'RW', number: 71, overall: 85, player_type: 'Sniper' },
        { id: 5, name: 'Jack Roslovic', position: 'C', number: 98, overall: 82, player_type: 'Playmaker' },
      ],
      injured: [
        { id: 21, name: 'Jesper Fast', position: 'RW', number: 71, overall: 81, injuryStatus: 'IR', returnTime: '6-8 Weeks', player_type: '2 Way',
          attributes: { skating: 80, shooting: 79, hands: 81, checking: 83, defense: 82 } },
        { id: 24, name: 'William Carrier', position: 'LW', number: 28, overall: 79, injuryStatus: 'OUT', returnTime: '3 Weeks', player_type: 'Power Forward',
          attributes: { skating: 81, shooting: 77, hands: 76, checking: 85, defense: 78 } },
        { id: 25, name: 'Jordan Staal', position: 'C', number: 11, overall: 83, injuryStatus: 'DTD', returnTime: '2-3 Days', player_type: '2 Way',
          attributes: { skating: 79, shooting: 80, hands: 82, checking: 88, defense: 87 } },
        { id: 26, name: 'Andrei Svechnikov', position: 'RW', number: 37, overall: 88, injuryStatus: 'DTD', returnTime: '1 Week', player_type: 'Sniper',
          attributes: { skating: 89, shooting: 90, hands: 88, checking: 84, defense: 83 } },
      ],
      benched: [
        { id: 22, name: 'Martin Necas', position: 'C', number: 88, overall: 87, player_type: 'Playmaker',
          attributes: { skating: 89, shooting: 86, hands: 88, checking: 81, defense: 83 } },
        { id: 23, name: 'Jack Drury', position: 'C', number: 18, overall: 76, player_type: '2 Way',
          attributes: { skating: 76, shooting: 75, hands: 77, checking: 78, defense: 79 } },
      ]
    };
  };

  // Move the renderPlayer function inside the component
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
    
    // Calculate weighted average overall for forwards
    // Line 1: 33%, Line 2: 26%, Line 3: 22%, Line 4: 19%
    const forwardWeights = [0.33, 0.33, 0.33, 0.26, 0.26, 0.26, 0.22, 0.22, 0.22, 0.19, 0.19, 0.19];
    const forwardOverall = calculateWeightedOverall(forwards, forwardWeights);
    
    return (
      <>
        {renderSectionTitleWithOverall('Forwards', forwardOverall)}
        <LineGrid>
          {forwards.slice(0, 3).map(renderPlayer)}
        </LineGrid>
        <LineGrid>
          {forwards.slice(3, 6).map(renderPlayer)}
        </LineGrid>
        <LineGrid>
          {forwards.slice(6, 9).map(renderPlayer)}
        </LineGrid>
        <LineGrid>
          {forwards.slice(9, 12).map(renderPlayer)}
        </LineGrid>
      </>
    );
  };

  const renderDefensePairs = () => {
    const { defensemen } = roster;
    
    // Calculate weighted average overall for defense pairs
    // Pair 1: 42%, Pair 2: 34%, Pair 3: 24%
    const defenseWeights = [0.42, 0.42, 0.34, 0.34, 0.24, 0.24];
    const defenseOverall = calculateWeightedOverall(defensemen, defenseWeights);
    
    return (
      <>
        {renderSectionTitleWithOverall('Defense Pairs', defenseOverall)}
        <DefensePairGrid>
          {defensemen.slice(0, 1).map(renderPlayer)}
          {defensemen.slice(1, 2).map(renderPlayer)}
        </DefensePairGrid>
        <DefensePairGrid>
          {defensemen.slice(2, 3).map(renderPlayer)}
          {defensemen.slice(3, 4).map(renderPlayer)}
        </DefensePairGrid>
        <DefensePairGrid>
          {defensemen.slice(4, 5).map(renderPlayer)}
          {defensemen.slice(5, 6).map(renderPlayer)}
        </DefensePairGrid>
      </>
    );
  };

  const renderGoalies = () => {
    const { goalies } = roster;
    
    // Calculate weighted average overall for goalies
    // Starter: 60%, Backup: 40%
    const goalieWeights = [0.6, 0.4];
    const goalieOverall = calculateWeightedOverall(goalies, goalieWeights);
    
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
    
    // Calculate average overall for power play units (equal weighting)
    const pp1Weights = Array(powerPlay1.length).fill(1/powerPlay1.length);
    const pp1Overall = calculateWeightedOverall(powerPlay1, pp1Weights);
    
    const pp2Weights = Array(powerPlay2.length).fill(1/powerPlay2.length);
    const pp2Overall = calculateWeightedOverall(powerPlay2, pp2Weights);
    
    return (
      <>
        {renderSectionTitleWithOverall('1st Powerplay Unit', pp1Overall)}
        <SpecialTeamsGrid>
          {powerPlay1.slice(0, 3).map(renderPlayer)}
        </SpecialTeamsGrid>
        <SpecialTeamsGrid className="center-row">
          {powerPlay1.slice(3, 5).map(renderPlayer)}
        </SpecialTeamsGrid>
        
        {renderSectionTitleWithOverall('2nd Powerplay Unit', pp2Overall)}
        <SpecialTeamsGrid>
          {powerPlay2.slice(0, 3).map(renderPlayer)}
        </SpecialTeamsGrid>
        <SpecialTeamsGrid className="center-row">
          {powerPlay2.slice(3, 5).map(renderPlayer)}
        </SpecialTeamsGrid>
      </>
    );
  };

  const renderPenaltyKill = () => {
    const { penaltyKill1, penaltyKill2 } = roster;
    
    // Calculate average overall for penalty kill units (equal weighting)
    const pk1Weights = Array(penaltyKill1.length).fill(1/penaltyKill1.length);
    const pk1Overall = calculateWeightedOverall(penaltyKill1, pk1Weights);
    
    const pk2Weights = Array(penaltyKill2.length).fill(1/penaltyKill2.length);
    const pk2Overall = calculateWeightedOverall(penaltyKill2, pk2Weights);
    
    return (
      <>
        {renderSectionTitleWithOverall('1st Penalty Kill Unit', pk1Overall)}
        <SpecialTeamsGrid>
          {penaltyKill1.slice(0, 2).map(renderPlayer)}
        </SpecialTeamsGrid>
        <SpecialTeamsGrid className="center-row">
          {penaltyKill1.slice(2, 4).map(renderPlayer)}
        </SpecialTeamsGrid>
        
        {renderSectionTitleWithOverall('2nd Penalty Kill Unit', pk2Overall)}
        <SpecialTeamsGrid>
          {penaltyKill2.slice(0, 2).map(renderPlayer)}
        </SpecialTeamsGrid>
        <SpecialTeamsGrid className="center-row">
          {penaltyKill2.slice(2, 4).map(renderPlayer)}
        </SpecialTeamsGrid>
      </>
    );
  };

  const renderOtherLines = () => {
    const { fourOnFour, threeOnThree, shootout } = roster;
    
    // Calculate average overall for other formations (equal weighting)
    const fourOnFourWeights = Array(fourOnFour.length).fill(1/fourOnFour.length);
    const fourOnFourOverall = calculateWeightedOverall(fourOnFour, fourOnFourWeights);
    
    const threeOnThreeWeights = Array(threeOnThree.length).fill(1/threeOnThree.length);
    const threeOnThreeOverall = calculateWeightedOverall(threeOnThree, threeOnThreeWeights);
    
    const shootoutWeights = Array(shootout.length).fill(1/shootout.length);
    const shootoutOverall = calculateWeightedOverall(shootout, shootoutWeights);
    
    return (
      <OtherLinesContainer visible={showOtherLines}>
        {renderSectionTitleWithOverall('4-on-4 Formation', fourOnFourOverall)}
        <SpecialTeamsGrid>
          {fourOnFour.slice(0, 2).map(renderPlayer)}
        </SpecialTeamsGrid>
        <SpecialTeamsGrid className="center-row">
          {fourOnFour.slice(2, 4).map(renderPlayer)}
        </SpecialTeamsGrid>
        
        {renderSectionTitleWithOverall('3-on-3 Overtime', threeOnThreeOverall)}
        <SpecialTeamsGrid className="center-row">
          {threeOnThree.map(renderPlayer)}
        </SpecialTeamsGrid>
        
        {renderSectionTitleWithOverall('Shootout Order', shootoutOverall)}
        <SpecialTeamsGrid>
          {shootout.map(renderPlayer)}
        </SpecialTeamsGrid>
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
    
    return (
      <>
        <SectionTitle>Benched</SectionTitle>
        <LineGrid>
          {benched.map(renderPlayer)}
        </LineGrid>
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

  const renderTeamNews = () => {
    return (
      <NewsContainer>
        <NewsHeader>Carolina Hurricanes News</NewsHeader>
        
        <NewsItem>
          <NewsPlayerHeader>
            <NewsPlayerName>
              Pyotr Kochetkov <span>(Goalie)</span>
            </NewsPlayerName>
            <NewsBadge type="starter">Goalie Start</NewsBadge>
            <PlayerJersey>52</PlayerJersey>
          </NewsPlayerHeader>
          <NewsContent>Kochetkov is in the starter's crease at Carolina's morning skate.</NewsContent>
          <NewsContent>
            The Hurricanes have won three straight and will likely have Kochetkov tending the twine on Friday against the Detroit Red Wings. Kochetkov struggled in his most recent outing, allowing four goals on 31 shots (.871 SV%), but received ample goal support in a 6-4 win over the New York Islanders. The 25-year-old goalie has an ugly 4.75 GAA and .806 SV% in his last three games (1-2-0). Still, the Hurricanes enter Friday's contest as -186 road favorites against a Red Wings team desperately trying to stay within reach of the final Wild Card spot in the Eastern Conference.
          </NewsContent>
          <NewsSource>Source: Walt Ruff Apr 4, 2025 @ 11:49 EDT</NewsSource>
        </NewsItem>
        
        <NewsItem>
          <NewsPlayerHeader>
            <NewsPlayerName>
              Justin Robidas <span>(Center)</span>
            </NewsPlayerName>
            <NewsBadge type="callup">Call Up</NewsBadge>
            <PlayerJersey>39</PlayerJersey>
          </NewsPlayerHeader>
          <NewsContent>Robidas has been recalled from Chicago (AHL).</NewsContent>
          <NewsContent>
            Robidas was a fifth-round pick, 147th overall, of the Hurricanes in the 2021 NHL Entry Draft. The 22-year-old forward has yet to play an NHL game. He has 48 points (17G / 31A) in 65 games with the Chicago Wolves (AHL) this season.
          </NewsContent>
          <NewsSource>Source: Carolina Hurricanes Apr 3, 2025 @ 17:29 EDT</NewsSource>
        </NewsItem>
        
        <NewsItem>
          <NewsPlayerHeader>
            <NewsPlayerName>
              Andrei Svechnikov <span>(Right Wing)</span>
            </NewsPlayerName>
            <NewsBadge type="injury">Injury</NewsBadge>
            <PlayerJersey>37</PlayerJersey>
          </NewsPlayerHeader>
          <NewsContent>Svechnikov left Wednesday's game with an undisclosed injury and did not return.</NewsContent>
          <NewsContent>
            Svechnikov did not play in the third period of Wednesday's win over the Capitals, but head coach Rod Brind'Amour said he doesn't think it's too serious. The Hurricanes are off on Thursday, so there likely won't be an update on Svechnikov's status until Friday.
          </NewsContent>
          <NewsSource>Source: Walt Ruff Apr 2, 2025 @ 22:38 EDT</NewsSource>
        </NewsItem>
      </NewsContainer>
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
          <Select value={selectedLeague} onChange={handleLeagueChange}>
            <option value="NHL">NHL</option>
            <option value="AHL">AHL</option>
            <option value="CHL">CHL</option>
          </Select>
          <Select 
            value={selectedTeam || ''} 
            onChange={handleTeamChange}
          >
            <option value="">Select Team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.team}
              </option>
            ))}
          </Select>
        </TeamSelector>

        {teamInfo ? (
          <TeamHeader>
            <TeamLogo>
              {teamInfo.abbreviation || '???'}
            </TeamLogo>
            <TeamInfo>
              <TeamName>{teamInfo.team || 'Select Team'}</TeamName>
              <LeagueInfo>{teamInfo.league || selectedLeague}</LeagueInfo>
            </TeamInfo>
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