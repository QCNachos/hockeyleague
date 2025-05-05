import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

// Define a base URL for API calls
const API_BASE_URL = 'http://localhost:5001/api';

// Import team logos dynamically
function importAll(r) {
  let images = {};
  r.keys().forEach(item => {
    // Extract team abbreviation from filename (Logo_XXX.png -> XXX)
    const abbr = item.replace('./Logo_', '').replace('.png', '');
    images[abbr] = r(item);
  });
  return images;
}

// Import all logos from assets folder
const teamLogos = importAll(require.context('../assets', false, /Logo_.*\.png$/));

// Define animations
const pulse = keyframes`
  0% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
  100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
`;

// Pulse indicator for animation
const PulseIndicator = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #B30E16;
  margin-right: 10px;
  animation: ${pulse} 1.5s infinite;
`;

// Styled components
const PageContainer = styled.div`
  padding: 20px;
  color: #fff;
  background-color: #121212;
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  
  h1 {
    margin: 0;
    background: linear-gradient(45deg, #C4CED4, #fff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#B30E16' : '#333'};
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  margin: 5px;
  
  &:hover {
    background-color: ${props => props.primary ? '#950b12' : '#555'};
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const Card = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  
  h2 {
    color: #C4CED4;
    margin-top: 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
  }
`;

const TeamSelectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
`;

const TeamCard = styled.div`
  background-color: ${props => props.selected ? '#B30E16' : '#2a2a2a'};
  border-radius: 6px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
  
  &:hover {
    transform: translateY(-3px);
    background-color: ${props => props.selected ? '#950b12' : '#333'};
  }
  
  img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    margin-bottom: 10px;
  }
  
  .team-name {
    font-weight: bold;
    text-align: center;
  }
`;

const LotteryContainer = styled.div`
  margin: 20px 0;
`;

const LotteryResultsContainer = styled.div`
  margin-top: 20px;
  
  .result-item {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    .team-logo {
      width: 30px;
      height: 30px;
      margin-right: 10px;
    }
    
    .team-name {
      flex: 1;
    }
    
    .movement {
      margin-left: 10px;
      font-weight: bold;
      color: ${props => props.positive ? '#4CAF50' : props.negative ? '#F44336' : '#999'};
    }
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
  
  .step {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: ${props => props.active ? '#B30E16' : '#333'};
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 10px;
    font-weight: bold;
  }
  
  .step-line {
    height: 2px;
    background-color: #555;
    flex: 1;
    margin-top: 15px;
  }
`;

// Add a styled component for the prospect list
const ProspectList = styled.div`
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #444;
  border-radius: 4px;
`;

const ProspectItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #444;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #333;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .player-name {
    font-weight: bold;
  }
  
  .player-details {
    color: #999;
    font-size: 0.9em;
    margin-top: 4px;
  }
`;

const DraftOrderList = styled.div`
  margin-top: 20px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #444;
  border-radius: 4px;
`;

const DraftPickItem = styled.div`
  padding: 12px;
  border-bottom: 1px solid #444;
  display: flex;
  align-items: center;
  background-color: ${props => props.isUserTeam ? 'rgba(179, 14, 22, 0.1)' : props.completed ? '#2a2a2a' : 'transparent'};
  
  .pick-number {
    width: 40px;
    font-weight: bold;
  }
  
  .team-info {
    flex: 1;
    display: flex;
    align-items: center;
  }
  
  .team-logo {
    width: 30px;
    height: 30px;
    margin-right: 10px;
  }
  
  .player-info {
    flex: 1.5;
    padding-left: 15px;
  }
  
  .player-name {
    font-weight: bold;
    color: #4CAF50;
  }
  
  .player-details {
    color: #999;
    font-size: 0.85em;
    margin-top: 3px;
  }
  
  .not-selected {
    color: #777;
    font-style: italic;
  }
`;

// Add a styled component for the timer
const TimerBox = styled.div`
  background: #222;
  color: #fff;
  font-size: 1.2rem;
  font-weight: bold;
  padding: 8px 18px;
  border-radius: 6px;
  margin-bottom: 12px;
  display: inline-block;
`;

// Add a styled component for the modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;
const ModalContent = styled.div`
  background: #1e1e1e;
  padding: 30px 24px 24px 24px;
  border-radius: 10px;
  min-width: 350px;
  max-width: 95vw;
  max-height: 80vh;
  overflow-y: auto;
  color: #fff;
`;
const ProspectRow = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #333;
  cursor: pointer;
  background: ${({ selected }) => (selected ? '#333' : 'transparent')};
  &:hover { background: #292929; }
`;

// Add styled components for lottery animation
const LotteryAnimation = styled.div`
  margin: 40px 0;
`;

const LotteryRevealContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 800px;
  margin: 0 auto;
`;

// Add a glow animation for the revealing pick
const revealGlow = keyframes`
  0% {
    box-shadow: 0 0 5px rgba(179, 14, 22, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(179, 14, 22, 0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(179, 14, 22, 0.3);
  }
`;

// Modify the RevealRow styling for more noticeable animations
const RevealRow = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 15px;
  background-color: ${props => props.current 
    ? 'rgba(179, 14, 22, 0.15)' 
    : props.revealed 
      ? '#2a2a2a' 
      : '#222'
  };
  margin-bottom: 8px;
  border-radius: 6px;
  border: ${props => props.current 
    ? '2px solid #B30E16' 
    : props.revealed 
      ? '1px solid #444' 
      : '1px solid #333'
  };
  opacity: ${props => props.revealed ? 1 : 0.85};
  transform: translateY(${props => props.revealed ? '0' : '5px'});
  transition: all 0.8s ease-out;
  position: relative;
  overflow: hidden;
  ${props => props.justRevealed && css`
    animation: ${revealGlow} 1.5s;
    border-color: #B30E16;
  `}
  
  &:hover {
    opacity: 1;
    border-color: ${props => props.revealed ? '#555' : '#444'};
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${props => props.revealed ? 'transparent' : 'rgba(0,0,0,0.3)'};
    pointer-events: ${props => props.revealed ? 'none' : 'auto'};
    transition: background-color 0.5s ease-out;
  }
`;

const PickNumber = styled.div`
  width: 60px;
  font-weight: bold;
  font-size: 1.1rem;
`;

const TeamInfo = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
`;

const PositionChange = styled.div`
  width: 80px;
  font-weight: bold;
  color: ${props => props.value > 0 
    ? '#4CAF50' 
    : props.value < 0 
      ? '#F44336' 
      : '#999'};
  font-size: 1.1rem;
`;

const progressPulse = keyframes`
  0% {
    opacity: 0.8;
    box-shadow: 0 0 2px rgba(179, 14, 22, 0.3);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 8px rgba(179, 14, 22, 0.6);
  }
  100% {
    opacity: 0.8;
    box-shadow: 0 0 2px rgba(179, 14, 22, 0.3);
  }
`;

const LotteryProgress = styled.div`
  height: 8px;
  width: 100%;
  background-color: #333;
  border-radius: 6px;
  margin: 10px 0 20px 0;
  overflow: hidden;
  position: relative;
  border: 1px solid #444;
  
  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #B30E16, #950b12);
    border-radius: 6px;
    transition: width 0.3s ease;
    animation: ${progressPulse} 2s infinite;
  }
`;

const LotterySpotlight = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
  position: relative;
  padding: 30px;
  border-radius: 10px;
  background-color: #1a1a1a;
  box-shadow: 0 0 20px rgba(179, 14, 22, 0.5);
  
  img {
    width: 100px;
    height: 100px;
    object-fit: contain;
    filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.7));
  }
  
  .team-name {
    font-size: 1.8rem;
    font-weight: bold;
    margin-left: 20px;
    background: linear-gradient(to right, #fff, #C4CED4);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .position-change {
    margin-left: 15px;
    font-weight: bold;
    font-size: 1.5rem;
    color: ${props => props.positive ? '#4CAF50' : props.negative ? '#F44336' : '#999'};
    position: absolute;
    top: 10px;
    right: 20px;
  }
  
  &:before {
    content: '';
    position: absolute;
    top: -10px;
    left: -10px;
    right: -10px;
    bottom: -10px;
    background: radial-gradient(circle at center, rgba(179, 14, 22, 0.3) 0%, rgba(0, 0, 0, 0) 70%);
    z-index: -1;
    border-radius: 15px;
  }
  
  .spotlight-pick {
    position: absolute;
    top: 10px;
    left: 20px;
    font-size: 1.5rem;
    color: #B30E16;
    font-weight: bold;
  }
`;

// Add animations for spotlight effect
const shine = keyframes`
  0% {
    background-position: -300px;
    opacity: 0;
  }
  25% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.7;
  }
  75% {
    opacity: 0.5;
  }
  100% {
    background-position: 300px;
    opacity: 0;
  }
`;

const SpotlightEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: linear-gradient(90deg, 
    rgba(255,255,255,0) 0%, 
    rgba(255,255,255,0.15) 50%, 
    rgba(255,255,255,0) 100%);
  background-size: 300px 100%;
  animation: ${shine} 2.5s infinite linear;
  z-index: 10;
  border-radius: 10px;
`;

// Main component for the Draft Simulation page
const SimulateDraft = () => {
  // State for the current step in the process
  const [currentStep, setCurrentStep] = useState(1); // 1: Team Selection, 2: Lottery, 3: Draft
  const [nhlTeams, setNhlTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [lotteryResults, setLotteryResults] = useState(null);
  const [draftOrder, setDraftOrder] = useState([]);
  const [draftablePlayers, setDraftablePlayers] = useState([]);
  const [completedPicks, setCompletedPicks] = useState([]);
  const [currentPick, setCurrentPick] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draftYear, setDraftYear] = useState(new Date().getFullYear() + 1); // Default to next year
  const [timer, setTimer] = useState(0);
  const timerRef = useRef();
  const [showPickModal, setShowPickModal] = useState(false);
  const [prospectSearch, setProspectSearch] = useState('');
  const [selectedProspect, setSelectedProspect] = useState(null);
  
  // State for lottery animation
  const [lotteryAnimationActive, setLotteryAnimationActive] = useState(false);
  const [revealedPicks, setRevealedPicks] = useState([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [animationStep, setAnimationStep] = useState('preparing'); // 'preparing', 'revealing', 'completed'
  const [spotlightTeam, setSpotlightTeam] = useState(null);
  const [revealSequence, setRevealSequence] = useState([]);
  const [topThreeTeams, setTopThreeTeams] = useState([]);
  const [isTopPicksRevealing, setIsTopPicksRevealing] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for year parameter in the query string or use default
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const yearParam = queryParams.get('year');
    if (yearParam) {
      setDraftYear(parseInt(yearParam));
    }
  }, [location.search]);
  
  // Fetch NHL teams from the API with year parameter
  useEffect(() => {
    const fetchNHLTeams = async () => {
      try {
        setLoading(true);
        console.log(`Fetching NHL teams for year ${draftYear}...`);
        const response = await axios.get(`${API_BASE_URL}/teams/nhl`);
        if (response.data && Array.isArray(response.data)) {
          setNhlTeams(response.data);
        }
      } catch (error) {
        console.error('Error fetching NHL teams:', error);
        setError('Failed to load NHL teams. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNHLTeams();
  }, [draftYear]);
  
  // Fetch draft order data
  const fetchDraftOrder = useCallback(async () => {
    try {
      console.log(`Fetching draft order for year ${draftYear}...`);
      const response = await axios.get(`${API_BASE_URL}/draft/order?year=${draftYear}&use_lottery=false&use_mock=true`);
      if (response.data && Array.isArray(response.data)) {
        setDraftOrder(response.data);
        return response.data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching draft order:', err);
      return [];
    }
  }, [draftYear]);
  
  // Fetch draft prospects
  const fetchDraftProspects = useCallback(async () => {
    try {
      console.log(`Fetching draft prospects for year ${draftYear}...`);
      const response = await axios.get(`${API_BASE_URL}/draft/prospects?year=${draftYear}`);
      if (response.data && Array.isArray(response.data)) {
        console.log(`Loaded ${response.data.length} draft prospects`);
        setDraftablePlayers(response.data.map(player => ({
          ...player,
          drafted: false
        })));
        return response.data;
      }
      return [];
    } catch (err) {
      console.error('Error fetching draft prospects:', err);
      return [];
    }
  }, [draftYear]);
  
  // Load data for the draft board
  useEffect(() => {
    if (currentStep === 3) {
      // Fetch draft prospects if we don't have them yet
      if (draftablePlayers.length === 0) {
        fetchDraftProspects();
      }
      
      // Set the current pick to the first pick in the draft order
      if (draftOrder.length > 0 && !currentPick) {
        setCurrentPick(draftOrder[0]);
      }
    }
  }, [currentStep, draftOrder, draftablePlayers.length, currentPick, fetchDraftProspects]);
  
  // Handle team selection
  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
  };
  
  // Handle going back to the main draft page
  const handleCancel = () => {
    navigate('/draft');
  };
  
  // Handle starting the draft lottery
  const handleStartLottery = () => {
    // Moving to the lottery step
    setCurrentStep(2);
    // Reset lottery animation state
    setLotteryAnimationActive(false);
    setLotteryResults(null);
    setAnimationStep('preparing');
    setAnimationProgress(0);
    setRevealedPicks([]);
    setCurrentRevealIndex(null);
    setAnimationComplete(false);
    setSpotlightTeam(null);
    setTopThreeTeams([]);
    setRevealSequence([]);
    setIsTopPicksRevealing(false);
    
    // Get draft order if not already loaded
    if (draftOrder.length === 0) {
      fetchDraftOrder();
    }
  };
  
  // Run the draft lottery
  const runLottery = async () => {
    setLoading(true);
    setLotteryAnimationActive(true);
    setAnimationStep('preparing');
    setAnimationProgress(0);
    setRevealedPicks([]);
    setCurrentRevealIndex(0); // Initialize to 0 rather than null
    setAnimationComplete(false);
    setSpotlightTeam(null);
    setTopThreeTeams([]);
    setRevealSequence([]);
    setIsTopPicksRevealing(false);
    
    try {
      // Add detailed diagnostic logging
      console.log('===== LOTTERY DIAGNOSTICS =====');
      console.log('Original draft order:', draftOrder.map(p => ({
        id: p.id,
        overall_pick: p.overall_pick,
        round_num: p.round_num,
        team: p.team?.abbreviation,
        from_team: p.from_team?.abbreviation || 'N/A',
      })));

      // Create lottery odds matrix - will be reused in the map function for each team
      const lotteryOddsMatrix = {
        1: { first: 25.5, second: 18.8, third: 55.7 }, // Team in last place (worst record)
        2: { first: 13.5, second: 14.4, third: 33.1 },
        3: { first: 11.5, second: 12.1, third: 29.8 },
        4: { first: 9.5, second: 10.0, third: 26.7 },
        5: { first: 8.5, second: 8.9, third: 23.5 },
        6: { first: 7.5, second: 7.8, third: 20.7 },
        7: { first: 6.5, second: 6.8, third: 18.3 },
        8: { first: 6.0, second: 6.2, third: 16.8 },
        9: { first: 5.0, second: 5.3, third: 14.2 },
        10: { first: 3.5, second: 3.7, third: 10.1 },
        11: { first: 3.0, second: 3.2, third: 8.7 },
        12: { first: 2.5, second: 2.7, third: 7.3 },
        13: { first: 2.0, second: 2.2, third: 5.8 },
        14: { first: 1.5, second: 1.6, third: 4.3 },
        15: { first: 0.5, second: 0.5, third: 1.4 },
        16: { first: 0.5, second: 0.5, third: 1.4 }
      };
      
      // Helper function to simulate lottery with weights
      const simulateLotteryWithWeights = (teams, oddsType) => {
        // Create a weighted array for the lottery draw
        let weightedArray = [];
        let currentIndex = 0;
        
        teams.forEach(team => {
          const position = team.position;
          // Use the provided odds from the matrix based on team position
          // Convert percentage to whole number for weighting (25.5% becomes 255)
          const weight = Math.round(lotteryOddsMatrix[position][oddsType] * 10);
          
          for (let i = 0; i < weight; i++) {
            weightedArray.push(position);
          }
        });
        
        // Randomly select one position from the weighted array
        const randomIndex = Math.floor(Math.random() * weightedArray.length);
        const selectedPosition = weightedArray[randomIndex];
        
        // Return the selected team
        return teams.find(team => team.position === selectedPosition);
      };
      
      // Get current draft order
      if (!draftOrder || draftOrder.length === 0) {
        console.error("No draft order data available");
        setLoading(false);
        return;
      }
      
      // Start animation progress
      const startProgressAnimation = () => {
        let progress = 0;
        const progressInterval = setInterval(() => {
          progress += 1;
          setAnimationProgress(Math.min(progress, 100));
          if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
              console.log('Progress animation complete, starting reveals...');
              setAnimationStep('revealing');
              startRevealingTeams();
            }, 500);
          }
        }, 30);
      };
      
      // Start the animation sequence
      startProgressAnimation();
      
      // Take only the bottom 16 teams for the lottery
      const lotteryTeams = draftOrder.slice(0, 16).map((team, index) => {
        // Use the shared lotteryOddsMatrix defined above
        return {
          ...team,
          position: index + 1, // Position 1-16 (worst to best)
          odds: lotteryOddsMatrix[index + 1]?.first // Store the odds for 1st pick
        };
      });
      
      // Copy the lottery teams for manipulation
      let draftOrderAfterLottery = [...lotteryTeams];
      
      // Simulate 1st overall pick
      const firstPickWinner = simulateLotteryWithWeights(lotteryTeams, "first");
      // Enforce rule: maximum 6 spot jump
      const maxPositionChange = Math.min(firstPickWinner.position - 1, 6);
      let actualFirstPosition = Math.max(1, firstPickWinner.position - maxPositionChange);
      
      // Report what happened
      console.log(`1st pick winner: Team in position ${firstPickWinner.position} (${firstPickWinner.team?.abbreviation})`);
      console.log(`Maximum movement allowed: ${maxPositionChange} spots`);
      console.log(`Final position for 1st pick: ${actualFirstPosition}`);

      // Remove the winning team from consideration for the second pick
      const remainingTeams = lotteryTeams.filter(team => team.position !== firstPickWinner.position);
      
      // Simulate 2nd overall pick
      const secondPickWinner = simulateLotteryWithWeights(remainingTeams, "second");
      // Enforce rule: maximum 6 spot jump
      const maxPositionChange2 = Math.min(secondPickWinner.position - 2, 6);
      let actualSecondPosition = Math.max(2, secondPickWinner.position - maxPositionChange2);
      
      // Report what happened
      console.log(`2nd pick winner: Team in position ${secondPickWinner.position} (${secondPickWinner.team?.abbreviation})`);
      console.log(`Maximum movement allowed: ${maxPositionChange2} spots`);
      console.log(`Final position for 2nd pick: ${actualSecondPosition}`);

      // If first and second winners would end up in the same position, adjust
      if (actualFirstPosition === actualSecondPosition) {
        console.log(`Conflict detected: Both winners in position ${actualSecondPosition}`);
        actualSecondPosition++;
        console.log(`Adjusted 2nd pick position to: ${actualSecondPosition}`);
      }
      
      // Special rule: Team in position 1 (worst team) cannot drop below 3rd pick
      // If position 1 team didn't win 1st or 2nd pick, they get the 3rd pick
      let thirdPickTeam;
      if (firstPickWinner.position !== 1 && secondPickWinner.position !== 1) {
        thirdPickTeam = lotteryTeams.find(team => team.position === 1);
      } else {
        // Otherwise, next worst team not yet selected gets the 3rd pick
        const availableTeams = lotteryTeams.filter(
          team => team.position !== firstPickWinner.position && team.position !== secondPickWinner.position
        );
        thirdPickTeam = availableTeams[0]; // This would be the worst remaining team
      }
      
      // Update the draft order based on lottery results
      // 1st overall pick
      draftOrderAfterLottery = draftOrderAfterLottery.map(team => {
        if (team.position === firstPickWinner.position) {
          return {
            ...team,
            final_position: actualFirstPosition,
            position_change: team.position - actualFirstPosition,
            original_position: team.position
          };
        }
        return team;
      });
      
      // 2nd overall pick
      draftOrderAfterLottery = draftOrderAfterLottery.map(team => {
        if (team.position === secondPickWinner.position) {
          return {
            ...team,
            final_position: actualSecondPosition,
            position_change: team.position - actualSecondPosition,
            original_position: team.position
          };
        }
        return team;
      });
      
      // 3rd overall pick
      draftOrderAfterLottery = draftOrderAfterLottery.map(team => {
        if (team.position === thirdPickTeam.position) {
          return {
            ...team,
            final_position: 3,
            position_change: team.position - 3,
            original_position: team.position
          };
        }
        return team;
      });
      
      // Fill in the rest of the positions (4-16) in order of original standings
      let currentPosition = 4;
      draftOrderAfterLottery = draftOrderAfterLottery.map(team => {
        if (team.final_position === undefined) {
          const finalPos = currentPosition;
          currentPosition++;
          return {
            ...team,
            final_position: finalPos,
            position_change: team.position - finalPos,
            original_position: team.position
          };
        }
        return team;
      });
      
      // Sort by final position
      draftOrderAfterLottery.sort((a, b) => a.final_position - b.final_position);
      
      console.log('Lottery results:', draftOrderAfterLottery.map(r => ({
        final_position: r.final_position,
        original_position: r.original_position,
        team: r.team?.abbreviation,
        id: r.id
      })));
      
      // Define all functions before using them
      
      // Function to finalize lottery process when animation is complete
      const finalizeLottery = (results) => {
        if (!results || !Array.isArray(results) || results.length === 0) {
          console.error("Invalid results for lottery finalization");
          setLoading(false);
          setLotteryAnimationActive(false);
          return;
        }
        
        // Make sure all results have required properties
        const validResults = results.filter(result => 
          result && 
          typeof result.final_position !== 'undefined' && 
          result.team
        );

        if (validResults.length === 0) {
          console.error("No valid lottery results found");
          setLoading(false);
          setLotteryAnimationActive(false);
          return;
        }
        
        // Process team data to ensure logos can be displayed
        const processedResults = validResults.map(result => ({
          ...result,
          team: result.team || { city: 'Unknown', abbreviation: 'UNK', name: 'Team' },
          // Calculate position change if not already present
          position_change: result.position_change || 
            (result.original_position - result.final_position)
        }));
        
        // Ensure each pick from 1-3 has an assigned team
        const top3Positions = [1, 2, 3];
        const existingTopPositions = processedResults
          .filter(r => top3Positions.includes(r.final_position))
          .map(r => r.final_position);
        
        const missingPositions = top3Positions.filter(pos => !existingTopPositions.includes(pos));
        
        if (missingPositions.length > 0) {
          console.error(`Missing teams for top positions: ${missingPositions.join(', ')}`);
          // Fill in missing positions with placeholder data for UI integrity
          missingPositions.forEach(pos => {
            const originalPosition = pos === 1 ? 1 : pos === 2 ? 2 : 3;
            processedResults.push({
              final_position: pos,
              original_position: originalPosition,
              position_change: 0,
              team: { city: 'Unknown', abbreviation: 'UNK', name: 'Team' },
              odds: 0
            });
          });
        }

        setLotteryResults(processedResults);
        setAnimationStep('completed');
        setAnimationComplete(true);
        setLotteryAnimationActive(false);
        setLoading(false);
        
        // --- Build full draft order with new lottery results (handle traded picks, fix numbering) ---
        // 1. Map: lotteryResults (1-16) to draft picks, matching by original_position (overall_pick)
        const lotteryOriginalPositions = processedResults.map(t => t.original_position);
        const originalFirstRound = draftOrder.filter(p => p.round_num === 1);

        console.log("Original first round before lottery:", originalFirstRound.map(p => ({
          id: p.id,
          overall_pick: p.overall_pick,
          team: p.team?.abbreviation,
          from_team: p.from_team?.abbreviation || "N/A"
        })));

        // Picks 1-16: new lottery order
        const newFirst16 = processedResults.map((lotteryResult, idx) => {
          const origPick = originalFirstRound.find(p => p.overall_pick === lotteryResult.original_position);
          if (!origPick) {
            console.error(`Could not find original pick for position ${lotteryResult.original_position}`);
            return null;
          }
          return {
            ...origPick,
            team: lotteryResult.team,
            overall_pick: idx + 1,
            round_num: 1,
            lottery_result: lotteryResult,
            uniqueId: `lottery-${idx+1}-${lotteryResult.team?.abbreviation || 'unknown'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          };
        }).filter(Boolean); // Remove any null entries

        // Make sure we preserve any "from_team" information for traded picks
        newFirst16.forEach(pick => {
          if (!pick) return;
          const originalPick = originalFirstRound.find(p => p.overall_pick === pick.lottery_result.original_position);
          if (originalPick && originalPick.from_team) {
            pick.from_team = originalPick.from_team;
          }
        });

        // Picks 17-32: original picks not in the lottery
        const picks17plus = originalFirstRound
          .filter(p => !lotteryOriginalPositions.includes(p.overall_pick))
          .sort((a, b) => a.overall_pick - b.overall_pick)
          .map((pick, idx) => ({
            ...pick,
            overall_pick: 16 + idx + 1, // 17, 18, ...
            round_num: 1,
            uniqueId: `pick-${16+idx+1}-${pick.team?.abbreviation || 'unknown'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          }));

        console.log("Picks 17+ (picks not in lottery):", picks17plus.length, "entries");
        
        // Combine all picks for the first round
        const combinedFirstRound = [...newFirst16, ...picks17plus]
          .sort((a, b) => a.overall_pick - b.overall_pick)
          .map((pick, idx) => ({
            ...pick,
            overall_pick: idx + 1,
            round_num: 1,
          }));

        console.log("Combined first round (should be 32 picks):", combinedFirstRound.length, "entries");
        console.log("Pick numbers in combined first round:", combinedFirstRound.map(p => p.overall_pick).sort((a, b) => a - b));
        
        // Check for missing pick numbers in the combined first round
        const firstRoundNumbers = combinedFirstRound.map(p => p.overall_pick).sort((a, b) => a - b);
        const expectedFirstRound = Array.from({length: 32}, (_, i) => i + 1);
        const missingInFirstRound = expectedFirstRound.filter(num => !firstRoundNumbers.includes(num));
        if (missingInFirstRound.length > 0) {
          console.error("ERROR: Missing pick numbers in first round:", missingInFirstRound);
        }

        // Add the rest of the draft (rounds > 1)
        const restOfDraftRounds = draftOrder.filter(p => p.round_num > 1)
          .map(pick => ({
            ...pick,
            uniqueId: `rd${pick.round_num}-${pick.overall_pick}-${pick.team?.abbreviation || 'unknown'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          }));
          
        const newFullDraftOrder = [...combinedFirstRound, ...restOfDraftRounds]
          .sort((a, b) => a.round_num !== b.round_num ? a.round_num - b.round_num : a.overall_pick - b.overall_pick);

        console.log('Draft order after lottery with uniqueIds:', newFullDraftOrder.slice(0, 20).map(p => ({
          uniqueId: p.uniqueId,
          id: p.id,
          overall_pick: p.overall_pick,
          team: p.team?.abbreviation
        })));
        
        setDraftOrder(newFullDraftOrder);
        console.log('===== END LOTTERY DIAGNOSTICS =====');
      };
      
      // Function to handle revealing picks one by one
      const revealNextPick = (index, sequence, topPicks) => {
        if (index >= sequence.length) {
          console.log("All picks revealed, finishing lottery");
          finalizeLottery(draftOrderAfterLottery);
          return;
        }
        
        const currentPick = sequence[index];
        if (!currentPick) {
          console.error(`No pick found at index ${index}`);
          // Skip to next index
          setTimeout(() => revealNextPick(index + 1, sequence, topPicks), 1000);
          return;
        }
        
        const isTopPick = index >= sequence.length - topPicks.length;
        
        console.log(`Revealing pick #${currentPick.final_position}: ${currentPick.team?.abbreviation}, isTopPick: ${isTopPick}`);
        
        // Update current reveal index to trigger UI updates
        setCurrentRevealIndex(index);
        
        // Update revealed picks
        setRevealedPicks(prevPicks => {
          return prevPicks.map(p => {
            if (p.final_position === currentPick.final_position) {
              return {
                ...currentPick,
                revealed: true,
                placeholder: false
              };
            }
            return p;
          });
        });
        
        // For top 3 picks, use spotlight effect
        if (isTopPick) {
          setIsTopPicksRevealing(true);
          setSpotlightTeam(currentPick);
          
          // Longer delay for top picks (6 seconds)
          setTimeout(() => {
            setIsTopPicksRevealing(false);
            setSpotlightTeam(null);
            
            // Move to next pick
            setTimeout(() => {
              revealNextPick(index + 1, sequence, topPicks);
            }, 1000);
          }, 6000);
        } else {
          // Regular pick - shorter delay (3 seconds)
          setTimeout(() => {
            revealNextPick(index + 1, sequence, topPicks);
          }, 3000);
        }
      };
      
      // Start revealing the lottery results from the 16th pick to the 1st
      const startRevealingTeams = () => {
        if (!draftOrderAfterLottery || !Array.isArray(draftOrderAfterLottery) || draftOrderAfterLottery.length === 0) {
          console.error("Invalid draft order for animation:", draftOrderAfterLottery);
          finalizeLottery(draftOrderAfterLottery);
          return;
        }
        
        console.log(`Starting reveal preparation with ${draftOrderAfterLottery.length} teams in draft order`);

        // Sort the teams by final position
        const sortedTeams = [...draftOrderAfterLottery].sort((a, b) => b.final_position - a.final_position);
        
        // Create a sequence starting from pick #16 working up to #1
        const revealSequence = [];

        // First, get teams for positions 16 down to 4
        for (let pos = 16; pos >= 4; pos--) {
          const team = sortedTeams.find(t => t.final_position === pos);
          if (team) {
            revealSequence.push({
              ...team,
              final_position: pos,
              isTopPick: false,
              team: team.team || { city: 'Unknown', abbreviation: 'UNK', name: 'Team' }
            });
          } else {
            console.warn(`No team found for position ${pos}`);
          }
        }
        
        // Then add the top 3 picks in the special order: 3rd, 1st, 2nd
        const top3 = [];
        
        // Add the 3rd pick
        const pick3 = sortedTeams.find(t => t.final_position === 3);
        if (pick3) {
          top3.push({
            ...pick3,
            isTopPick: true,
            team: pick3.team || { city: 'Unknown', abbreviation: 'UNK', name: 'Team' }
          });
        }
        
        // Add the 1st pick
        const pick1 = sortedTeams.find(t => t.final_position === 1);
        if (pick1) {
          top3.push({
            ...pick1,
            isTopPick: true,
            team: pick1.team || { city: 'Unknown', abbreviation: 'UNK', name: 'Team' }
          });
        }
        
        // Add the 2nd pick (saved for last for drama)
        const pick2 = sortedTeams.find(t => t.final_position === 2);
        if (pick2) {
          top3.push({
            ...pick2,
            isTopPick: true,
            team: pick2.team || { city: 'Unknown', abbreviation: 'UNK', name: 'Team' }
          });
        }
        
        // Initialize the display with empty placeholders
        const initialPlaceholders = [];
        for (let i = 1; i <= 16; i++) {
          initialPlaceholders.push({
            displayed_position: i,
            final_position: i,
            revealed: false,
            placeholder: true,
            team: { 
              city: i === 16 ? 'Next to be revealed...' : 'To be revealed...', 
              abbreviation: '', 
              name: '' 
            },
            position_change: 0,
            original_position: 0,
            odds: 0
          });
        }
        
        // Important: Set these state variables in sequence to ensure proper rendering
        setRevealedPicks(initialPlaceholders);
        
        // Allow the DOM to update before we proceed
        setTimeout(() => {
          // Save the sequences for reference during animation
          setTopThreeTeams(top3);
          setRevealSequence([...revealSequence, ...top3]);
          setCurrentRevealIndex(-1); // Start at -1 so first increment gives us 0

          console.log(`Created reveal sequence with ${revealSequence.length} regular picks and ${top3.length} top picks`);
          
          // Start the animation after a short delay to show placeholders
          setTimeout(() => {
            console.log("Starting reveal animation...");
            // Increment to the first pick (0) and start revealing
            setCurrentRevealIndex(0);
            // Start the first reveal after the index has been set
            setTimeout(() => {
              revealNextPick(0, [...revealSequence, ...top3], top3);
            }, 300);
          }, 1500);
        }, 500);
      };
      
      // Now that all functions are defined, start the process
      // startRevealingTeams(); - no longer needed, called from startProgressAnimation
      
    } catch (error) {
      console.error("Error in lottery simulation:", error);
      setLoading(false);
      setLotteryAnimationActive(false);
    }
  };
  
  // Simulate a pick
  const simulatePick = async () => {
    if (!currentPick) return;
    
    try {
      setLoading(true);
      console.log(`Simulating pick for ${currentPick.team?.abbreviation || 'Unknown'} (pick #${currentPick.overall_pick})...`);
      
      // Add detailed diagnostic logging
      console.log('===== PICK DIAGNOSTICS =====');
      console.log('Current pick:', {
        uniqueId: currentPick.uniqueId,
        id: currentPick.id,
        overall_pick: currentPick.overall_pick,
        team: currentPick.team?.abbreviation
      });
      console.log('Draft order before pick:', draftOrder.slice(0, 5).map(p => ({
        uniqueId: p.uniqueId,
        id: p.id,
        overall_pick: p.overall_pick,
        team: p.team?.abbreviation
      })));
      
      // Pick a random player from the top 10 available players
      const availablePlayers = draftablePlayers.filter(p => !p.drafted).slice(0, 10);
      if (availablePlayers.length === 0) {
        console.error('No available players to draft');
        return;
      }
      
      const selectedPlayer = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
      console.log(`Selected ${selectedPlayer.first_name} ${selectedPlayer.last_name} for pick #${currentPick.overall_pick}`);
      
      // Update the player as drafted
      setDraftablePlayers(prevPlayers => 
        prevPlayers.map(p => p.id === selectedPlayer.id ? { ...p, drafted: true } : p)
      );
      
      // Update the pick with the selected player
      const updatedPick = { ...currentPick, player: selectedPlayer, completed: true };
      
      // Add to completed picks
      setCompletedPicks(prev => [...prev, updatedPick]);
      
      // Remove from draft order using uniqueId instead of id
      const newDraftOrder = draftOrder.filter(p => p.uniqueId !== currentPick.uniqueId);
      console.log('Draft order after pick:', newDraftOrder.slice(0, 5).map(p => ({
        uniqueId: p.uniqueId,
        id: p.id,
        overall_pick: p.overall_pick,
        team: p.team?.abbreviation
      })));
      
      setDraftOrder(newDraftOrder);
      
      // Set next pick
      if (newDraftOrder.length > 0) {
        const nextPick = newDraftOrder[0];
        console.log('Next pick:', {
          uniqueId: nextPick.uniqueId,
          id: nextPick.id,
          overall_pick: nextPick.overall_pick,
          team: nextPick.team?.abbreviation
        });
        setCurrentPick(nextPick);
      } else {
        setCurrentPick(null);
      }
      
      console.log('===== END PICK DIAGNOSTICS =====');
    } catch (err) {
      console.error('Error simulating pick:', err);
      setError('Failed to simulate pick. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Simulate entire round
  const simulateRound = async () => {
    if (!currentPick) return;
    
    // Get all picks in the current round
    const currentRound = currentPick.round_num;
    const roundPicks = draftOrder.filter(p => p.round_num === currentRound);
    
    // Simulate each pick in sequence
    for (const pick of roundPicks) {
      setCurrentPick(pick);
      await simulatePick();
    }
  };
  
  // Handle year change
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setDraftYear(newYear);
    
    // Update URL to reflect the year change
    navigate(`/simulate-draft?year=${newYear}`, { replace: true });
    
    // Reset state for the new year
    setSelectedTeam(null);
    setLotteryResults(null);
    setDraftOrder([]);
  };
  
  // Generate year options
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    
    for (let i = 0; i <= 5; i++) {
      options.push(
        <option key={currentYear + i} value={currentYear + i}>
          {currentYear + i}
        </option>
      );
    }
    
    return options;
  };
  
  // Helper function to get team logo
  const getTeamLogo = (team) => {
    if (!team || !team.abbreviation) return null;
    
    const abbr = team.abbreviation;
    return teamLogos[abbr] || null;
  };
  
  // Helper to get timer duration for current pick
  const getTimerDuration = (pick) => {
    if (!pick) return 0;
    return pick.round_num === 1 ? 180 : 90;
  };

  // Start/reset timer on pick change
  useEffect(() => {
    if (!currentPick) return;
    // Only start timer if not user's team
    if (selectedTeam && currentPick.team?.id === selectedTeam.id) {
      setTimer(0);
      return;
    }
    setTimer(getTimerDuration(currentPick));
  }, [currentPick, selectedTeam]);

  // Timer countdown effect
  useEffect(() => {
    if (!currentPick) return;
    if (selectedTeam && currentPick.team?.id === selectedTeam.id) return; // Pause for user pick
    if (timer <= 0) return;
    timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timer, currentPick, selectedTeam]);

  // Auto-simulate pick if timer reaches zero and not user's team
  useEffect(() => {
    if (!currentPick) return;
    if (timer === 0 && selectedTeam && currentPick.team?.id !== selectedTeam.id) {
      simulatePick();
    }
  }, [timer, currentPick, selectedTeam, simulatePick]);

  // Helper: is this the user's pick?
  const isUserPick = selectedTeam && currentPick && currentPick.team?.id === selectedTeam.id;

  // Helper to set timer for a pick
  const setTimerForPick = (pick) => {
    setTimer(getTimerDuration(pick));
  };

  // Update handleUserPick to use uniqueId instead of id
  const handleUserPick = async () => {
    if (!selectedProspect || !currentPick) return;
    
    console.log('===== USER PICK DIAGNOSTICS =====');
    console.log('Current pick:', {
      uniqueId: currentPick.uniqueId,
      id: currentPick.id,
      overall_pick: currentPick.overall_pick,
      team: currentPick.team?.abbreviation
    });
    console.log('Draft order before user pick:', draftOrder.slice(0, 5).map(p => ({
      uniqueId: p.uniqueId,
      id: p.id,
      overall_pick: p.overall_pick,
      team: p.team?.abbreviation
    })));
    
    setShowPickModal(false);
    setProspectSearch('');
    setSelectedProspect(null);
    // Update the player as drafted
    setDraftablePlayers(prevPlayers =>
      prevPlayers.map(p => p.id === selectedProspect.id ? { ...p, drafted: true } : p)
    );
    // Update the pick with the selected player
    const updatedPick = { ...currentPick, player: selectedProspect, completed: true };
    setCompletedPicks(prev => [...prev, updatedPick]);
    
    // Remove from draft order by uniqueId instead of id
    const newDraftOrder = draftOrder.filter(p => p.uniqueId !== currentPick.uniqueId);
    console.log('Draft order after user pick:', newDraftOrder.slice(0, 5).map(p => ({
      uniqueId: p.uniqueId,
      id: p.id,
      overall_pick: p.overall_pick,
      team: p.team?.abbreviation
    })));
    
    setDraftOrder(newDraftOrder);
    
    // Set next pick
    if (newDraftOrder.length > 0) {
      const nextPick = newDraftOrder[0];
      console.log('Next pick:', {
        uniqueId: nextPick.uniqueId,
        id: nextPick.id,
        overall_pick: nextPick.overall_pick,
        team: nextPick.team?.abbreviation
      });
      setCurrentPick(nextPick);
      setTimerForPick(nextPick);
    } else {
      setCurrentPick(null);
      setTimer(0);
    }
    
    console.log('===== END USER PICK DIAGNOSTICS =====');
  };
  
  // Utility: wait for state update
  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  // Refactor simulateToNextUserPick to robustly simulate picks one at a time
  const simulateToNextUserPick = async () => {
    if (isUserPick || !currentPick) return;
    // Make local copies
    let localDraftOrder = [...draftOrder];
    let localDraftablePlayers = [...draftablePlayers];
    let localCompletedPicks = [...completedPicks];
    let localCurrentPick = currentPick;
    while (true) {
      const nextPick = localDraftOrder[0];
      if (!nextPick || (selectedTeam && nextPick.team?.id === selectedTeam.id)) {
        // Update React state to reflect the new state
        setDraftOrder(localDraftOrder);
        setDraftablePlayers(localDraftablePlayers);
        setCompletedPicks(localCompletedPicks);
        setCurrentPick(nextPick);
        setTimerForPick(nextPick);
        break;
      }
      // AI selects from top 5 available prospects (by overall_rating or draft_ranking)
      const available = localDraftablePlayers.filter(p => !p.drafted);
      let sorted = [...available];
      if (sorted.length === 0) break;
      if (sorted[0].draft_ranking !== undefined) {
        sorted.sort((a, b) => (a.draft_ranking || 9999) - (b.draft_ranking || 9999));
      } else {
        sorted.sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0));
      }
      const topN = sorted.slice(0, 5);
      const selected = topN[Math.floor(Math.random() * topN.length)];
      // Mark as drafted and assign to pick
      localDraftablePlayers = localDraftablePlayers.map(p =>
        p.id === selected.id ? { ...p, drafted: true } : p
      );
      const updatedPick = { ...nextPick, player: selected, completed: true };
      localCompletedPicks = [...localCompletedPicks, updatedPick];
      localDraftOrder = localDraftOrder.filter(p => p.id !== nextPick.id);
      // Set next pick
      localCurrentPick = localDraftOrder[0] || null;
      // Update React state after each pick for UI feedback
      setDraftOrder([...localDraftOrder]);
      setDraftablePlayers([...localDraftablePlayers]);
      setCompletedPicks([...localCompletedPicks]);
      setCurrentPick(localCurrentPick);
      setTimerForPick(localCurrentPick);
      await wait(200); // Short delay for UI update
      if (!localDraftOrder.length || !localCurrentPick) break;
      if (selectedTeam && localDraftOrder[0]?.team?.id === selectedTeam.id) {
        setCurrentPick(localDraftOrder[0]);
        setTimerForPick(localDraftOrder[0]);
        break;
      }
    }
  };
  
  // Filter available prospects for modal
  const availableProspects = draftablePlayers.filter(p => !p.drafted &&
    (`${p.first_name} ${p.last_name}`.toLowerCase().includes(prospectSearch.toLowerCase()) ||
     p.position_primary?.toLowerCase().includes(prospectSearch.toLowerCase()) ||
     p.nationality?.toLowerCase().includes(prospectSearch.toLowerCase())
    )
  );

  // Different content based on the current step
  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return renderTeamSelection();
      case 2:
        return renderLottery();
      case 3:
        return renderDraftBoard();
      default:
        return renderTeamSelection();
    }
  };
  
  // Step 1: Team Selection
  const renderTeamSelection = () => {
    return (
      <Card>
        <h2>Select Your Team</h2>
        <p>Choose the team you want to manage during this draft.</p>
        
        {loading ? (
          <p>Loading teams...</p>
        ) : error ? (
          <p style={{ color: '#F44336' }}>{error}</p>
        ) : (
          <TeamSelectionGrid>
            {nhlTeams.map(team => (
              <TeamCard 
                key={team.id}
                selected={selectedTeam && selectedTeam.id === team.id}
                onClick={() => handleTeamSelect(team)}
                style={{ 
                  borderColor: team.primary_color || '#333'
                }}
              >
                <img 
                  src={getTeamLogo(team) || 'https://via.placeholder.com/80'}
                  alt={`${team.abbreviation} logo`}
                />
                <div className="team-name">
                  {team.city} {team.team || team.name}
                </div>
              </TeamCard>
            ))}
          </TeamSelectionGrid>
        )}
        
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            primary 
            disabled={!selectedTeam}
            onClick={handleStartLottery}
          >
            Next: Draft Lottery
          </Button>
        </div>
      </Card>
    );
  };
  
  // Step 2: Draft Lottery
  const renderLottery = () => {
    return (
      <Card>
        <h2>Draft Lottery</h2>
        {!lotteryAnimationActive && !lotteryResults && (
          <>
        <p>The NHL Draft Lottery determines the order of selection for the first 16 picks in the first round of the draft. Only the bottom 16 teams compete in the lottery.</p>
        <p>Only the first two picks are determined by the lottery, with specific odds for each position. The remaining teams get picks in order of their standings (worst to best).</p>
        <p>The team that finishes last (position #1) cannot drop lower than the 3rd overall pick.</p>
            <p>Each team can move up a maximum of 6 positions in the draft order.</p>
          </>
        )}
        
        <LotteryContainer>
          {loading && animationStep === 'preparing' && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <h3>Running Lottery Simulation</h3>
              <p>Calculating draft order using NHL lottery odds...</p>
              <LotteryProgress>
                <div className="progress-bar" style={{ width: `${animationProgress}%` }}></div>
              </LotteryProgress>
            </div>
          )}
          
          {animationStep === 'revealing' && (
            <LotteryAnimation>
              <h3>2025 NHL Draft Lottery Results</h3>
              
              <div style={{ 
                marginBottom: '20px', 
                padding: '15px', 
                backgroundColor: '#1a1a1a', 
                borderRadius: '6px',
                color: '#ddd',
                fontSize: '14px'
              }}>
                <p style={{ margin: '0 0 10px 0' }}>
                  <strong>Lottery Process:</strong> Revealing draft order from Pick #16 up to Pick #1.
                </p>
                <p style={{ margin: '0' }}>
                  Teams can move up a maximum of 6 positions. The team with the worst record cannot drop below Pick #3.
                </p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginTop: '15px', 
                  justifyContent: 'center'
                }}>
                  <PulseIndicator></PulseIndicator>
                  <span>
                    {revealSequence.length > 0 && currentRevealIndex >= 0 && currentRevealIndex < revealSequence.length ? (
                      `Revealing Pick #${revealSequence[currentRevealIndex].final_position}: ${currentRevealIndex + 1} of ${revealSequence.length}`
                    ) : (
                      `Revealing results... ${currentRevealIndex >= 0 ? currentRevealIndex : 0} of ${revealSequence.length || 13}`
                    )}
                  </span>
                </div>
              </div>
              
              {spotlightTeam && spotlightTeam.final_position <= 3 && (
                <LotterySpotlight 
                  positive={spotlightTeam.position_change > 0} 
                  negative={spotlightTeam.position_change < 0}
                >
                  <SpotlightEffect />
                  <div className="spotlight-pick">
                    {spotlightTeam.final_position === 1 && "1st OVERALL PICK"}
                    {spotlightTeam.final_position === 2 && "2nd OVERALL PICK"}
                    {spotlightTeam.final_position === 3 && "3rd OVERALL PICK"}
                  </div>
                  <img 
                    src={(spotlightTeam.team && getTeamLogo(spotlightTeam.team)) || 'https://via.placeholder.com/100'} 
                    alt={(spotlightTeam.team && spotlightTeam.team.abbreviation) || 'team'} 
                  />
                  <div className="team-name">
                    {spotlightTeam.team 
                      ? `${spotlightTeam.team.city || ''} ${spotlightTeam.team.name || spotlightTeam.team.abbreviation || ''}`
                      : 'Unknown Team'
                    }
                  </div>
                  <div className="position-change">
                    {spotlightTeam.position_change > 0 
                      ? `↑${spotlightTeam.position_change}` 
                      : spotlightTeam.position_change < 0 
                        ? `↓${Math.abs(spotlightTeam.position_change)}` 
                        : "―"}
                  </div>
                </LotterySpotlight>
              )}
              
              <LotteryRevealContainer>
                <div style={{
                  display: 'flex',
                  padding: '12px 15px',
                  backgroundColor: '#333',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  borderRadius: '6px 6px 0 0'
                }}>
                  <PickNumber>Pick</PickNumber>
                  <TeamInfo>Team</TeamInfo>
                  <div style={{ width: '100px' }}>Orig. Pos.</div>
                  <PositionChange>Change</PositionChange>
                  <div style={{ width: '80px' }}>Odds</div>
                </div>
                
                {/* Display teams in order from pick #1 to #16 */}
                {Array.from({length: 16}, (_, i) => i + 1).map(position => {
                  // Find the team with this displayed position
                  const team = revealedPicks.find(p => p.final_position === position);
                  
                  if (!team) {
                    console.log(`No team found for position ${position}`);
                    // Return a fallback placeholder row if team is undefined
                    return (
                      <RevealRow 
                        key={position}
                        revealed={false}
                        current={false}
                      >
                        <PickNumber>#{position}</PickNumber>
                        <TeamInfo>
                          <span style={{ color: '#999' }}>To be revealed...</span>
                        </TeamInfo>
                        <div style={{ width: '100px' }}>-</div>
                        <PositionChange value={0}>-</PositionChange>
                        <div style={{ width: '80px' }}>-</div>
                      </RevealRow>
                    );
                  }
                  
                  // Check if this is the currently revealing row (based on final_position)
                  const isCurrentlyRevealing = revealSequence[currentRevealIndex] && 
                                              revealSequence[currentRevealIndex].final_position === position;
                  
                  // Check if this is a top pick (1-3) that we're revealing with spotlight
                  const isTopPick = team.revealed && team.final_position <= 3;
                  
                  return (
                    <RevealRow 
                      key={position}
                      revealed={team.revealed}
                      current={isTopPick}
                      justRevealed={isCurrentlyRevealing}
                    >
                      <PickNumber>
                        {`#${position}`}
                      </PickNumber>
                      <TeamInfo>
                        {team.revealed ? (
                          <>
                            <img 
                              src={team.team && getTeamLogo(team.team) || 'https://via.placeholder.com/30'} 
                              alt={(team.team && team.team.abbreviation) || 'team'} 
                              style={{ width: '30px', height: '30px', marginRight: '10px' }}
                            />
                            {team.team ? `${team.team.city || ''} ${team.team.name || team.team.abbreviation || ''}` : 'Unknown Team'}
                          </>
                        ) : (
                          <span style={{ color: '#999' }}>To be revealed...</span>
                        )}
                      </TeamInfo>
                      <div style={{ width: '100px' }}>
                        {team.revealed ? `#${team.original_position}` : '-'}
                      </div>
                      <PositionChange value={team.revealed ? team.position_change : 0}>
                        {team.revealed 
                          ? (team.position_change > 0 
                              ? `↑${team.position_change}` 
                              : team.position_change < 0 
                                ? `↓${Math.abs(team.position_change)}` 
                                : "―") 
                          : '-'
                        }
                      </PositionChange>
                      <div style={{ width: '80px' }}>
                        {team.revealed && team.odds > 0 ? `${team.odds}%` : '-'}
                      </div>
                    </RevealRow>
                  );
                })}
              </LotteryRevealContainer>
            </LotteryAnimation>
          )}
          
          {animationStep === 'completed' && lotteryResults && lotteryResults.length > 0 && (
            <div>
              <h3>Lottery Results</h3>
              <div style={{ 
                marginTop: '20px',
                border: '1px solid #444',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  display: 'flex',
                  padding: '12px 15px',
                  backgroundColor: '#333',
                  fontWeight: 'bold',
                  borderBottom: '1px solid #555'
                }}>
                  <div style={{ width: '60px' }}>Pick</div>
                  <div style={{ flex: 1 }}>Team</div>
                  <div style={{ width: '100px' }}>Orig. Pos.</div>
                  <div style={{ width: '80px' }}>Change</div>
                  <div style={{ width: '80px' }}>Odds</div>
                </div>
                
                {lotteryResults.map((result, index) => (
                  result && (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 15px',
                        backgroundColor: index < 3 ? 'rgba(179, 14, 22, 0.1)' : 'transparent',
                      borderBottom: index < lotteryResults.length - 1 ? '1px solid #444' : 'none'
                    }}
                  >
                    <div style={{ width: '60px', fontWeight: 'bold' }}>#{result.final_position}</div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      {result.team?.abbreviation && (
                        <img 
                          src={getTeamLogo(result.team) || 'https://via.placeholder.com/30'} 
                          alt={result.team.abbreviation} 
                          style={{ width: '30px', height: '30px', marginRight: '10px' }}
                        />
                      )}
                        {result.team?.city} {result.team?.name || result.team?.abbreviation}
                    </div>
                    <div style={{ width: '100px' }}>#{result.original_position}</div>
                    <div 
                      style={{ 
                        width: '80px',
                        color: result.position_change > 0 ? '#4CAF50' : 
                              result.position_change < 0 ? '#F44336' : '#999',
                        fontWeight: 'bold'
                      }}
                    >
                      {result.position_change > 0 ? `+${result.position_change}` : result.position_change}
                    </div>
                    <div style={{ width: '80px' }}>
                      {result.odds > 0 ? `${result.odds}%` : '-'}
                    </div>
                  </div>
                  )
                ))}
              </div>
              
              <div style={{ 
                marginTop: '15px', 
                padding: '10px 15px', 
                backgroundColor: '#2a2a2a',
                borderRadius: '4px',
                fontSize: '14px',
                color: '#aaa'
              }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Lottery Winners:</strong>
                </p>
                {lotteryResults && lotteryResults.length >= 2 && (
                <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
                    {lotteryResults[0] && (
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                        {lotteryResults[0]?.team?.abbreviation && (
                      <img 
                        src={getTeamLogo(lotteryResults[0].team) || 'https://via.placeholder.com/24'} 
                        alt={lotteryResults[0].team.abbreviation} 
                        style={{ width: '24px', height: '24px', marginRight: '8px' }}
                      />
                    )}
                        1st Overall Pick: {lotteryResults[0]?.team?.city} {lotteryResults[0]?.team?.name || lotteryResults[0]?.team?.abbreviation} (moved {lotteryResults[0]?.position_change > 0 ? 'up' : 'down'} {Math.abs(lotteryResults[0]?.position_change)} {Math.abs(lotteryResults[0]?.position_change) === 1 ? 'spot' : 'spots'})
                  </li>
                    )}
                    {lotteryResults[1] && (
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                        {lotteryResults[1]?.team?.abbreviation && (
                      <img 
                        src={getTeamLogo(lotteryResults[1].team) || 'https://via.placeholder.com/24'} 
                        alt={lotteryResults[1].team.abbreviation} 
                        style={{ width: '24px', height: '24px', marginRight: '8px' }}
                      />
                    )}
                        2nd Overall Pick: {lotteryResults[1]?.team?.city} {lotteryResults[1]?.team?.name || lotteryResults[1]?.team?.abbreviation} (moved {lotteryResults[1]?.position_change > 0 ? 'up' : 'down'} {Math.abs(lotteryResults[1]?.position_change)} {Math.abs(lotteryResults[1]?.position_change) === 1 ? 'spot' : 'spots'})
                  </li>
                    )}
                </ul>
                )}
              </div>
            </div>
          )}
          
          {!lotteryAnimationActive && !lotteryResults && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Click the button below to run the lottery simulation.</p>
              <button
                onClick={runLottery}
                style={{
                  backgroundColor: '#B30E16',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  marginTop: '20px'
                }}
              >
                Run Draft Lottery
              </button>
            </div>
          )}
        </LotteryContainer>
        
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setCurrentStep(1)}>
            Back to Team Selection
          </Button>
          <Button 
            primary 
            onClick={() => setCurrentStep(3)}
            disabled={!lotteryResults && !animationComplete}
          >
            {lotteryResults || animationComplete ? 'Continue to Draft' : 'Run Lottery First'}
          </Button>
        </div>
      </Card>
    );
  };
  
  // Step 3: Draft Board
  const renderDraftBoard = () => {
    // Group picks by round - FIXING DUPLICATE ISSUES
    const picksByRound = {};
    
    // Process completed picks first
    completedPicks.forEach(pick => {
      const round = pick.round_num;
      if (!picksByRound[round]) {
        picksByRound[round] = [];
      }
      picksByRound[round].push({...pick, completed: true});
    });
    
    // Add remaining draft order picks, ensuring no duplicates by uniqueId
    draftOrder.forEach(pick => {
      const round = pick.round_num;
      if (!picksByRound[round]) {
        picksByRound[round] = [];
      }
      
      // Only add if not already in completed picks (check by uniqueId)
      const isAlreadyCompleted = completedPicks.some(p => p.uniqueId === pick.uniqueId);
      if (!isAlreadyCompleted) {
        picksByRound[round].push(pick);
      }
    });
    
    // Sort picks by round and overall pick
    Object.keys(picksByRound).forEach(round => {
      picksByRound[round].sort((a, b) => a.overall_pick - b.overall_pick);
    });
    
    // Get the current round
    const currentRound = currentPick ? currentPick.round_num : 1;

    // Diagnostic logging for all picks in the current round
    if (picksByRound[currentRound]) {
      // Check for missing pick numbers
      const pickNumbers = picksByRound[currentRound].map(p => p.overall_pick).sort((a, b) => a - b);
      // For first round, expect picks 1-32
      const expectedCount = currentRound === 1 ? 32 : picksByRound[currentRound].length;
      const expectedNumbers = Array.from({length: expectedCount}, (_, i) => i + 1);
      const missingNumbers = expectedNumbers.filter(num => !pickNumbers.includes(num));
      
      if (missingNumbers.length > 0) {
        console.warn("WARNING: Missing pick numbers in round:", missingNumbers);
        
        // Check if these picks exist in the draft order but aren't showing
        const allPicksInRound = [...draftOrder, ...completedPicks].filter(p => p.round_num === currentRound);
        const allPickNumbersInRound = allPicksInRound.map(p => p.overall_pick).sort((a, b) => a - b);
        
        console.warn("Picks that should exist in draftOrder or completedPicks but may not be displayed:");
        missingNumbers.forEach(num => {
          const pick = allPicksInRound.find(p => p.overall_pick === num);
          if (pick) {
            console.warn(`Pick #${num} exists but not displayed:`, {
              team: pick.team?.abbreviation,
              id: pick.id,
              uniqueId: pick.uniqueId,
              isCompleted: completedPicks.some(p => p.uniqueId === pick.uniqueId || p.id === pick.id)
            });
          } else {
            console.warn(`Pick #${num} doesn't exist in draftOrder or completedPicks`);
          }
        });
      }
      
      // Display info about displayed picks
      console.log(`Total picks displayed in round ${currentRound}:`, picksByRound[currentRound].length);
      console.log(`All picks in round ${currentRound}:`, picksByRound[currentRound].map(p => ({
        overall_pick: p.overall_pick,
        team: p.team?.abbreviation,
        from_team: p.from_team?.abbreviation || "N/A",
        uniqueId: p.uniqueId.substring(0, 15) + '...',
        id: p.id
      })));
    }
    
    return (
      <Card>
        <h2>Mock Draft Board</h2>
        <p>
          {selectedTeam 
            ? `You are drafting as the ${selectedTeam.city} ${selectedTeam.team || selectedTeam.name}.` 
            : 'Viewing the draft as an observer.'}
          {currentPick 
            ? ` Currently on pick #${currentPick.overall_pick}: ${currentPick.team?.abbreviation || 'Unknown'}.` 
            : ' All picks have been completed.'}
        </p>
        {currentPick && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '10px' }}>
            <TimerBox>
              {isUserPick
                ? 'Your pick!'
                : `Time left: ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}`}
            </TimerBox>
            <Button onClick={simulatePick} disabled={loading || isUserPick} style={{ marginRight: 8 }}>
              Simulate Pick
            </Button>
            <Button onClick={simulateToNextUserPick} disabled={loading || isUserPick}>
              Simulate to Next Pick
            </Button>
            {isUserPick && (
              <Button
                primary
                onClick={() => setShowPickModal(true)}
                disabled={loading}
              >
                Make Pick
              </Button>
            )}
          </div>
        )}
        {/* Pick Modal */}
        {showPickModal && (
          <ModalOverlay>
            <ModalContent>
              <h3>Select a Prospect</h3>
              <input
                type="text"
                placeholder="Search by name, position, nationality..."
                value={prospectSearch}
                onChange={e => setProspectSearch(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #444', background: '#222', color: '#fff' }}
              />
              <ProspectList>
                {availableProspects.length === 0 && <div style={{ color: '#bbb', padding: '10px' }}>No prospects found.</div>}
                {availableProspects.map(p => (
                  <ProspectRow
                    key={p.id}
                    selected={selectedProspect && selectedProspect.id === p.id}
                    onClick={() => setSelectedProspect(p)}
                  >
                    <span style={{ fontWeight: 600, marginRight: 8 }}>{p.first_name} {p.last_name}</span>
                    <span style={{ color: '#aaa', marginRight: 8 }}>{p.position_primary}</span>
                    <span style={{ color: '#aaa', marginRight: 8 }}>{p.nationality}</span>
                    <span style={{ color: '#bbb' }}>Overall: {p.overall_rating || 'N/A'}</span>
                  </ProspectRow>
                ))}
              </ProspectList>
              <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <Button onClick={() => setShowPickModal(false)} style={{ background: '#444' }}>Cancel</Button>
                <Button primary disabled={!selectedProspect} onClick={handleUserPick}>Confirm Pick</Button>
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Loading draft data...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '20px' }}>
            {/* Left side - Draft order */}
            <div style={{ flex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3>Draft Order - Round {currentRound}</h3>
                <div>
                  <Button 
                    onClick={simulatePick} 
                    disabled={!currentPick}
                    style={{ marginRight: '10px' }}
                  >
                    Simulate Pick
                  </Button>
                  <Button 
                    onClick={simulateRound} 
                    disabled={!currentPick}
                  >
                    Simulate Round
                  </Button>
                </div>
              </div>
              
              <DraftOrderList>
                {picksByRound[currentRound]?.map(pick => {
                  const isCurrentPick = currentPick && pick.uniqueId === currentPick.uniqueId;
                  const isCompleted = pick.completed || completedPicks.some(p => p.uniqueId === pick.uniqueId);
                  const isUserTeam = selectedTeam && pick.team?.id === selectedTeam.id;
                  
                  return (
                    <DraftPickItem 
                      key={pick.uniqueId} 
                      isUserTeam={isUserTeam}
                      completed={isCompleted}
                      style={isCurrentPick ? { border: '2px solid #B30E16' } : {}}
                    >
                      <div className="pick-number">#{pick.overall_pick}</div>
                      <div className="team-info">
                        <img 
                          className="team-logo" 
                          src={pick.team?.abbreviation ? getTeamLogo(pick.team) : 'https://via.placeholder.com/30'} 
                          alt={pick.team?.abbreviation || 'team'}
                        />
                        <div>{pick.team?.city} {pick.team?.name || pick.team?.abbreviation}</div>
                      </div>
                      <div className="player-info">
                        {isCompleted || pick.player ? (
                          <>
                            <div className="player-name">
                              {pick.player?.first_name} {pick.player?.last_name}
                            </div>
                            <div className="player-details">
                              {pick.player?.position_primary || 'N/A'} | {pick.player?.nationality || 'Unknown'}
                            </div>
                          </>
                        ) : (
                          <div className="not-selected">Not yet selected</div>
                        )}
                      </div>
                    </DraftPickItem>
                  );
                })}
              </DraftOrderList>
            </div>
            
            {/* Right side - Prospects */}
            <div style={{ flex: 1 }}>
              <h3>Top Prospects</h3>
              <ProspectList>
                {draftablePlayers
                  .filter(player => !player.drafted)
                  .slice(0, 15)
                  .map(player => (
                    <ProspectItem key={player.id}>
                      <div className="player-name">
                        {player.first_name} {player.last_name}
                      </div>
                      <div className="player-details">
                        {player.position_primary || 'N/A'} | {player.nationality || 'Unknown'} | 
                        Overall: {player.overall_rating || 'N/A'} | Potential: {player.potential || 'Unknown'}
                      </div>
                    </ProspectItem>
                  ))}
              </ProspectList>
            </div>
          </div>
        )}
        
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={() => setCurrentStep(2)}>
            Back to Lottery
          </Button>
          <Button 
            primary 
            onClick={handleCancel}
          >
            Exit Draft
          </Button>
        </div>
      </Card>
    );
  };
  
  return (
    <PageContainer>
      <Header>
        <h1>NHL Mock Draft Simulator</h1>
        {currentStep === 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <label style={{ color: '#C4CED4' }}>Draft Year:</label>
            <select
              value={draftYear}
              onChange={handleYearChange}
              style={{
                padding: '5px 10px',
                backgroundColor: '#2a2a2a',
                color: '#fff',
                border: '1px solid #333',
                borderRadius: '4px'
              }}
            >
              {generateYearOptions()}
            </select>
          </div>
        )}
      </Header>
      
      <StepIndicator>
        <div className="step" style={{ backgroundColor: currentStep >= 1 ? '#B30E16' : '#333' }}>1</div>
        <div className="step-line" style={{ backgroundColor: currentStep >= 2 ? '#B30E16' : '#333' }}></div>
        <div className="step" style={{ backgroundColor: currentStep >= 2 ? '#B30E16' : '#333' }}>2</div>
        <div className="step-line" style={{ backgroundColor: currentStep >= 3 ? '#B30E16' : '#333' }}></div>
        <div className="step" style={{ backgroundColor: currentStep >= 3 ? '#B30E16' : '#333' }}>3</div>
      </StepIndicator>
      
      {renderStepContent()}
    </PageContainer>
  );
};

export default SimulateDraft; 