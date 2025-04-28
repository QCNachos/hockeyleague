import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const LotteryContainer = styled.div`
  margin: 20px 0;
`;

const LotteryResults = styled.div`
  margin-top: 20px;
`;

const LotteryResult = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background-color: ${props => props.highlight ? 'rgba(179, 14, 22, 0.2)' : '#2a2a2a'};
  border-radius: 4px;
  
  .pick-number {
    font-weight: bold;
    margin-right: 15px;
    min-width: 30px;
  }
  
  .team-logo {
    width: 30px;
    height: 30px;
    margin-right: 15px;
  }
  
  .team-name {
    flex: 1;
  }
  
  .movement {
    margin-left: 10px;
    font-weight: bold;
    padding: 2px 8px;
    border-radius: 4px;
    background-color: ${props => {
      if (props.movement > 0) return 'rgba(76, 175, 80, 0.2)';
      if (props.movement < 0) return 'rgba(244, 67, 54, 0.2)';
      return 'transparent';
    }};
    color: ${props => {
      if (props.movement > 0) return '#4CAF50';
      if (props.movement < 0) return '#F44336';
      return '#999';
    }};
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
  margin-top: 20px;
  
  &:hover {
    background-color: ${props => props.primary ? '#950b12' : '#555'};
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 5px;
  background-color: #444;
  border-radius: 3px;
  overflow: hidden;
  margin: 20px 0;
  
  .progress {
    height: 100%;
    background-color: #B30E16;
    transition: width 0.5s ease;
  }
`;

const LotterySimulator = ({ 
  draftOrder, 
  userTeam, 
  onLotteryComplete, 
  onResetLottery,
  createPostLotteryOrder
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lotteryResults, setLotteryResults] = useState(null);
  const [originalOrder, setOriginalOrder] = useState([]);
  const [finalOrder, setFinalOrder] = useState([]);
  
  // Set original order when component mounts or draft order changes
  useEffect(() => {
    if (draftOrder && draftOrder.length > 0) {
      // Filter to get only the first round picks
      const firstRoundPicks = draftOrder
        .filter(pick => pick.round_num === 1)
        .sort((a, b) => a.pick_num - b.pick_num);
      
      setOriginalOrder(firstRoundPicks);
    }
  }, [draftOrder]);
  
  // Calculate lottery odds based on draft position
  const getLotteryOdds = (position) => {
    // NHL draft lottery odds for the first 16 positions
    const odds = {
      1: 25.5, 2: 13.5, 3: 11.5, 4: 9.5, 5: 8.5, 6: 7.5, 7: 6.5, 8: 6.0,
      9: 5.0, 10: 3.5, 11: 3.0, 12: 2.5, 13: 2.0, 14: 1.5, 15: 1.0, 16: 0.5
    };
    
    return odds[position] || 0;
  };
  
  // Run the lottery simulation
  const runLotterySimulation = () => {
    setIsSimulating(true);
    setProgress(0);
    
    // Perform the lottery simulation in steps
    const simulationSteps = 20; // Number of animation steps
    let currentStep = 0;
    
    // Progress animation
    const animateProgress = () => {
      currentStep++;
      setProgress((currentStep / simulationSteps) * 100);
      
      if (currentStep < simulationSteps) {
        setTimeout(animateProgress, 100);
      } else {
        // Final step - determine the lottery results
        finalizeLottery();
      }
    };
    
    // Start the animation
    animateProgress();
  };
  
  // Finalize the lottery results
  const finalizeLottery = () => {
    // Create a copy of the original order
    const newOrder = [...originalOrder];
    
    // Extract teams and their odds for lottery-eligible positions (top 16)
    const eligibleTeams = newOrder.slice(0, 16).map((pick, index) => ({
      ...pick,
      originalPosition: index + 1,
      odds: getLotteryOdds(index + 1)
    }));
    
    // Simulate lottery for first overall pick
    const firstPickWinner = simulateLotteryPick(eligibleTeams);
    
    // Simulate lottery for second overall pick (excluding first pick winner)
    const remainingTeams = eligibleTeams.filter(team => 
      team.team.abbreviation !== firstPickWinner.team.abbreviation
    );
    const secondPickWinner = simulateLotteryPick(remainingTeams);
    
    // Create the lottery results
    const lotteryWinners = [
      { 
        ...firstPickWinner, 
        newPosition: 1, 
        movement: firstPickWinner.originalPosition - 1 
      },
      { 
        ...secondPickWinner, 
        newPosition: 2, 
        movement: secondPickWinner.originalPosition - 2 
      }
    ];
    
    // Create the final draft order based on lottery results
    const finalDraftOrder = createFinalDraftOrder(newOrder, lotteryWinners);
    
    // Set the lottery results
    setLotteryResults(lotteryWinners);
    setFinalOrder(finalDraftOrder);
    
    // Call the callback with the new order
    if (typeof onLotteryComplete === 'function') {
      onLotteryComplete(finalDraftOrder);
    }
    
    // Call the callback to create post-lottery draft order for all rounds
    if (typeof createPostLotteryOrder === 'function') {
      createPostLotteryOrder(finalDraftOrder);
    }
    
    setIsSimulating(false);
  };
  
  // Simulate a single lottery pick based on odds
  const simulateLotteryPick = (teams) => {
    // Calculate total odds
    const totalOdds = teams.reduce((sum, team) => sum + team.odds, 0);
    
    // Generate a random number between 0 and total odds
    const random = Math.random() * totalOdds;
    
    // Determine the winner based on the random number
    let cumulativeOdds = 0;
    for (const team of teams) {
      cumulativeOdds += team.odds;
      if (random <= cumulativeOdds) {
        return team;
      }
    }
    
    // Fallback to the team with the highest odds (should rarely happen)
    return teams[0];
  };
  
  // Create the final draft order after lottery
  const createFinalDraftOrder = (originalOrder, lotteryWinners) => {
    // Start with the lottery winners
    const newOrder = [
      { ...lotteryWinners[0], newPosition: 1 },
      { ...lotteryWinners[1], newPosition: 2 }
    ];
    
    // Add the remaining teams in their original order, skipping lottery winners
    let position = 3;
    for (const pick of originalOrder) {
      const isLotteryWinner = lotteryWinners.some(
        winner => winner.team.abbreviation === pick.team.abbreviation
      );
      
      if (!isLotteryWinner) {
        newOrder.push({
          ...pick,
          originalPosition: originalOrder.findIndex(p => 
            p.team.abbreviation === pick.team.abbreviation
          ) + 1,
          newPosition: position,
          movement: (originalOrder.findIndex(p => 
            p.team.abbreviation === pick.team.abbreviation
          ) + 1) - position
        });
        position++;
      }
    }
    
    // Sort by new position
    newOrder.sort((a, b) => a.newPosition - b.newPosition);
    
    return newOrder;
  };
  
  // Reset the lottery
  const handleReset = () => {
    setLotteryResults(null);
    setFinalOrder([]);
    setProgress(0);
    
    if (typeof onResetLottery === 'function') {
      onResetLottery();
    }
  };
  
  return (
    <LotteryContainer>
      {!lotteryResults ? (
        <>
          <h3>Draft Lottery Simulation</h3>
          <p>
            The NHL Draft Lottery determines the order of the first round of the 
            draft. The teams with the worst records from the previous season have 
            the best odds of winning the lottery.
          </p>
          
          {isSimulating && (
            <ProgressBar>
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </ProgressBar>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              primary 
              onClick={runLotterySimulation}
              disabled={isSimulating || originalOrder.length === 0}
            >
              {isSimulating ? 'Simulating...' : 'Run Draft Lottery'}
            </Button>
          </div>
          
          {originalOrder.length > 0 && (
            <LotteryResults>
              <h4>Pre-Lottery Draft Order (First Round)</h4>
              {originalOrder.map((pick, index) => (
                <LotteryResult
                  key={pick.id || index}
                  highlight={userTeam && userTeam.abbreviation === pick.team.abbreviation}
                >
                  <div className="pick-number">#{index + 1}</div>
                  <img 
                    className="team-logo" 
                    src={pick.team.logo_url || 'https://via.placeholder.com/30'} 
                    alt={pick.team.abbreviation}
                  />
                  <div className="team-name">
                    {pick.team.city} {pick.team.name || pick.team.abbreviation}
                  </div>
                  <div className="odds">
                    {getLotteryOdds(index + 1)}% chance
                  </div>
                </LotteryResult>
              ))}
            </LotteryResults>
          )}
        </>
      ) : (
        <>
          <h3>Draft Lottery Results</h3>
          
          <LotteryResults>
            <h4>Lottery Winners</h4>
            {lotteryWinners?.map((winner, index) => (
              <LotteryResult
                key={index}
                movement={winner.movement}
                highlight={userTeam && userTeam.abbreviation === winner.team.abbreviation}
              >
                <div className="pick-number">#{winner.newPosition}</div>
                <img 
                  className="team-logo" 
                  src={winner.team.logo_url || 'https://via.placeholder.com/30'} 
                  alt={winner.team.abbreviation}
                />
                <div className="team-name">
                  {winner.team.city} {winner.team.name || winner.team.abbreviation}
                </div>
                <div className="movement">
                  {winner.movement > 0 ? `+${winner.movement}` : winner.movement}
                </div>
              </LotteryResult>
            ))}
            
            <h4>Final Draft Order (First Round)</h4>
            {finalOrder.map((pick) => (
              <LotteryResult
                key={pick.id}
                movement={pick.movement}
                highlight={userTeam && userTeam.abbreviation === pick.team.abbreviation}
              >
                <div className="pick-number">#{pick.newPosition}</div>
                <img 
                  className="team-logo" 
                  src={pick.team.logo_url || 'https://via.placeholder.com/30'} 
                  alt={pick.team.abbreviation}
                />
                <div className="team-name">
                  {pick.team.city} {pick.team.name || pick.team.abbreviation}
                </div>
                <div className="movement">
                  {pick.movement > 0 ? `+${pick.movement}` : pick.movement}
                </div>
              </LotteryResult>
            ))}
          </LotteryResults>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Button onClick={handleReset}>
              Reset Lottery
            </Button>
          </div>
        </>
      )}
    </LotteryContainer>
  );
};

export default LotterySimulator; 