import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
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
    // Get draft order if not already loaded
    if (draftOrder.length === 0) {
      fetchDraftOrder();
    }
  };
  
  // Run the draft lottery
  const runLottery = async () => {
    setLoading(true);
    
    try {
      // Create lottery odds matrix for 1st, 2nd, and 3rd overall picks based on NHL odds
      const lotteryOdds = {
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
          const weight = Math.round(lotteryOdds[position][oddsType] * 10);
          
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
      
      // Take only the bottom 16 teams for the lottery
      const lotteryTeams = draftOrder.slice(0, 16).map((team, index) => ({
        ...team,
        position: index + 1, // Position 1-16 (worst to best)
        odds: lotteryOdds[index + 1].first // Store the odds for 1st pick
      }));
      
      // Copy the lottery teams for manipulation
      let draftOrderAfterLottery = [...lotteryTeams];
      
      // Simulate 1st overall pick
      const firstPickWinner = simulateLotteryWithWeights(lotteryTeams, "first");
      // Remove the winning team from consideration for the second pick
      const remainingTeams = lotteryTeams.filter(team => team.position !== firstPickWinner.position);
      
      // Simulate 2nd overall pick
      const secondPickWinner = simulateLotteryWithWeights(remainingTeams, "second");
      
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
            final_position: 1,
            position_change: team.position - 1,
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
            final_position: 2,
            position_change: team.position - 2,
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
      
      setLotteryResults(draftOrderAfterLottery);
      setLoading(false);
    } catch (error) {
      console.error("Error in lottery simulation:", error);
      setLoading(false);
    }
  };
  
  // Simulate a pick
  const simulatePick = async () => {
    if (!currentPick) return;
    
    try {
      setLoading(true);
      console.log(`Simulating pick for ${currentPick.team?.abbreviation || 'Unknown'} (pick #${currentPick.overall_pick})...`);
      
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
      
      // Remove from draft order
      setDraftOrder(prev => prev.filter(p => p.id !== currentPick.id));
      
      // Set next pick
      if (draftOrder.length > 1) {
        setCurrentPick(draftOrder[1]);
      } else {
        setCurrentPick(null);
      }
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
        <p>The NHL Draft Lottery determines the order of selection for the first 16 picks in the first round of the draft. Only the bottom 16 teams compete in the lottery.</p>
        <p>Only the first two picks are determined by the lottery, with specific odds for each position. The remaining teams get picks in order of their standings (worst to best).</p>
        <p>The team that finishes last (position #1) cannot drop lower than the 3rd overall pick.</p>
        
        <LotteryContainer>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Running lottery simulation...</p>
            </div>
          ) : lotteryResults ? (
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
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px 15px',
                      backgroundColor: index < 2 ? 'rgba(179, 14, 22, 0.1)' : 'transparent',
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
                      {result.team.abbreviation || result.team}
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
                <ul style={{ margin: '0 0 0 20px', padding: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    {lotteryResults[0].team?.abbreviation && (
                      <img 
                        src={getTeamLogo(lotteryResults[0].team) || 'https://via.placeholder.com/24'} 
                        alt={lotteryResults[0].team.abbreviation} 
                        style={{ width: '24px', height: '24px', marginRight: '8px' }}
                      />
                    )}
                    1st Overall Pick: {lotteryResults[0].team.abbreviation || lotteryResults[0].team} (moved {lotteryResults[0].position_change > 0 ? 'up' : 'down'} {Math.abs(lotteryResults[0].position_change)} {Math.abs(lotteryResults[0].position_change) === 1 ? 'spot' : 'spots'})
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center' }}>
                    {lotteryResults[1].team?.abbreviation && (
                      <img 
                        src={getTeamLogo(lotteryResults[1].team) || 'https://via.placeholder.com/24'} 
                        alt={lotteryResults[1].team.abbreviation} 
                        style={{ width: '24px', height: '24px', marginRight: '8px' }}
                      />
                    )}
                    2nd Overall Pick: {lotteryResults[1].team.abbreviation || lotteryResults[1].team} (moved {lotteryResults[1].position_change > 0 ? 'up' : 'down'} {Math.abs(lotteryResults[1].position_change)} {Math.abs(lotteryResults[1].position_change) === 1 ? 'spot' : 'spots'})
                  </li>
                </ul>
              </div>
            </div>
          ) : (
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
            disabled={!lotteryResults}
          >
            {lotteryResults ? 'Continue to Draft' : 'Run Lottery First'}
          </Button>
        </div>
      </Card>
    );
  };
  
  // Step 3: Draft Board
  const renderDraftBoard = () => {
    // Group picks by round
    const picksByRound = {};
    [...completedPicks, ...draftOrder].forEach(pick => {
      const round = pick.round_num;
      if (!picksByRound[round]) {
        picksByRound[round] = [];
      }
      picksByRound[round].push(pick);
    });
    
    // Sort picks by round and overall pick
    Object.keys(picksByRound).forEach(round => {
      picksByRound[round].sort((a, b) => a.overall_pick - b.overall_pick);
    });
    
    // Get the current round
    const currentRound = currentPick ? currentPick.round_num : 1;
    
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
                  const isCurrentPick = currentPick && pick.id === currentPick.id;
                  const isCompleted = completedPicks.some(p => p.id === pick.id);
                  const isUserTeam = selectedTeam && pick.team?.id === selectedTeam.id;
                  
                  return (
                    <DraftPickItem 
                      key={pick.id} 
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