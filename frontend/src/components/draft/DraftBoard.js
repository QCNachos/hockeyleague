import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const DraftBoardContainer = styled.div`
  margin: 20px 0;
  width: 100%;
  overflow: auto;
`;

const DraftRoundTabs = styled.div`
  display: flex;
  margin-bottom: 15px;
  border-bottom: 1px solid #444;
`;

const RoundTab = styled.div`
  padding: 8px 16px;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  color: ${props => props.active ? '#ffffff' : '#999'};
  border-bottom: ${props => props.active ? '3px solid #B30E16' : '3px solid transparent'};
  
  &:hover {
    color: white;
  }
`;

const DraftTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #444;
  }
  
  th {
    background-color: #333;
    color: #ccc;
    font-weight: 600;
  }
  
  tr:hover {
    background-color: rgba(179, 14, 22, 0.05);
  }
  
  tr.user-team {
    background-color: rgba(179, 14, 22, 0.2);
  }
  
  tr.completed-pick {
    opacity: 0.7;
  }
`;

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  
  .player-name {
    font-weight: bold;
  }
  
  .player-details {
    font-size: 0.85em;
    color: #ccc;
  }
`;

const TeamInfo = styled.div`
  display: flex;
  align-items: center;
  
  .team-logo {
    width: 25px;
    height: 25px;
    margin-right: 10px;
  }
`;

const SelectPlayerButton = styled.button`
  background-color: #B30E16;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #950b12;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const SimulatePickButton = styled.button`
  background-color: #333;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
  margin-bottom: 20px;
  
  &:hover {
    background-color: #555;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const PlayerSearchContainer = styled.div`
  margin-bottom: 20px;
  max-width: 500px;
`;

const PlayerSearchInput = styled.input`
  padding: 10px;
  width: 100%;
  background-color: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: white;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
`;

const PlayerSearchResults = styled.div`
  position: absolute;
  width: 500px;
  max-height: 300px;
  overflow-y: auto;
  background-color: #333;
  border: 1px solid #555;
  border-top: none;
  border-radius: 0 0 4px 4px;
  z-index: 10;
`;

const PlayerSearchResult = styled.div`
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #444;
  
  &:hover {
    background-color: #444;
  }
  
  .player-name {
    font-weight: bold;
  }
  
  .player-details {
    font-size: 0.85em;
    color: #ccc;
  }
`;

const DraftStatus = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const DraftControls = styled.div`
  display: flex;
  gap: 10px;
`;

const PickStatus = styled.div`
  font-size: 1.2em;
  font-weight: bold;
`;

const DraftBoard = ({ 
  draftOrder, 
  userTeam, 
  onMakePick, 
  onSimulatePick,
  year
}) => {
  const [currentRound, setCurrentRound] = useState(1);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPick, setCurrentPick] = useState(null);
  const [picks, setPicks] = useState([]);
  
  const baseUrl = 'http://localhost:5001/api';
  
  // Initialize picks state from draft order
  useEffect(() => {
    if (draftOrder && draftOrder.length > 0) {
      // Transform draft order to a format suitable for the draft board
      const initializedPicks = draftOrder.map(pick => ({
        ...pick,
        player: null,
        completed: false
      }));
      
      // Sort picks by round and pick number
      initializedPicks.sort((a, b) => {
        if (a.round_num !== b.round_num) {
          return a.round_num - b.round_num;
        }
        return a.pick_num - b.pick_num;
      });
      
      setPicks(initializedPicks);
      
      // Set the current pick to the first incomplete pick
      setCurrentPick(initializedPicks.find(pick => !pick.completed) || null);
    }
  }, [draftOrder]);
  
  // Fetch available players
  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${baseUrl}/players/top-prospects?year=${year}`);
        if (response.data) {
          setAvailablePlayers(response.data.map(player => ({
            ...player,
            drafted: false
          })));
        }
      } catch (err) {
        console.error('Error fetching available players:', err);
        setError('Failed to load available players. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (year) {
      fetchPlayers();
    }
  }, [year]);
  
  // Filter players based on search term
  useEffect(() => {
    if (searchTerm.trim().length > 0) {
      // Filter available players that haven't been drafted yet
      const results = availablePlayers
        .filter(player => !player.drafted)
        .filter(player => 
          player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (player.position && player.position.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .slice(0, 10); // Limit to 10 results
        
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm, availablePlayers]);
  
  // Handles round tab change
  const handleRoundChange = (round) => {
    setCurrentRound(round);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle player selection from search
  const handleSelectPlayer = (player) => {
    if (currentPick) {
      // Check if it's the user's team's turn
      if (currentPick.team.abbreviation === userTeam?.abbreviation) {
        makeDraftPick(player);
        setSearchTerm('');
        setShowSearchResults(false);
      }
    }
  };
  
  // Handle making a draft pick
  const makeDraftPick = (player) => {
    if (!currentPick) return;
    
    // Update the player as drafted
    const updatedPlayers = availablePlayers.map(p => 
      p.id === player.id ? { ...p, drafted: true } : p
    );
    setAvailablePlayers(updatedPlayers);
    
    // Update the pick with the selected player
    const updatedPicks = picks.map(pick => 
      pick.id === currentPick.id 
        ? { ...pick, player, completed: true } 
        : pick
    );
    setPicks(updatedPicks);
    
    // Find the next incomplete pick
    const nextPick = updatedPicks.find(pick => !pick.completed);
    setCurrentPick(nextPick || null);
    
    // Call the callback
    if (typeof onMakePick === 'function') {
      onMakePick(currentPick.id, player.id);
    }
  };
  
  // Handle simulating a pick
  const handleSimulatePick = async () => {
    if (!currentPick) return;
    
    // Call the callback to simulate the pick
    if (typeof onSimulatePick === 'function') {
      try {
        const player = await onSimulatePick(currentPick.id);
        
        if (player) {
          // Update the player as drafted
          const updatedPlayers = availablePlayers.map(p => 
            p.id === player.id ? { ...p, drafted: true } : p
          );
          setAvailablePlayers(updatedPlayers);
          
          // Update the pick with the selected player
          const updatedPicks = picks.map(pick => 
            pick.id === currentPick.id 
              ? { ...pick, player, completed: true } 
              : pick
          );
          setPicks(updatedPicks);
          
          // Find the next incomplete pick
          const nextPick = updatedPicks.find(pick => !pick.completed);
          setCurrentPick(nextPick || null);
        }
      } catch (err) {
        console.error('Error simulating pick:', err);
        setError('Failed to simulate pick. Please try again.');
      }
    }
  };
  
  // Generate round tabs based on number of rounds in draft
  const generateRoundTabs = () => {
    if (!picks.length) return null;
    
    // Get the maximum round number
    const maxRound = Math.max(...picks.map(pick => pick.round_num));
    
    const tabs = [];
    for (let i = 1; i <= maxRound; i++) {
      tabs.push(
        <RoundTab
          key={i}
          active={currentRound === i}
          onClick={() => handleRoundChange(i)}
        >
          Round {i}
        </RoundTab>
      );
    }
    
    return tabs;
  };
  
  // Filter picks by current round
  const filteredPicks = picks.filter(pick => pick.round_num === currentRound);
  
  // Check if it's the user's team's turn to draft
  const isUserTeamTurn = currentPick && userTeam && 
    currentPick.team.abbreviation === userTeam.abbreviation;
  
  return (
    <DraftBoardContainer>
      <h3>Mock Draft Board - {year}</h3>
      
      <DraftStatus>
        <PickStatus>
          {currentPick ? (
            <>
              {isUserTeamTurn ? (
                <span style={{ color: '#B30E16' }}>
                  Your team is on the clock! Make your selection.
                </span>
              ) : (
                <span>
                  Pick #{currentPick.overall_pick}: {currentPick.team.city} {currentPick.team.name} is on the clock
                </span>
              )}
            </>
          ) : (
            <span>Draft Complete</span>
          )}
        </PickStatus>
        
        <DraftControls>
          {!isUserTeamTurn && currentPick && (
            <SimulatePickButton 
              onClick={handleSimulatePick}
              disabled={!currentPick}
            >
              Simulate Next Pick
            </SimulatePickButton>
          )}
        </DraftControls>
      </DraftStatus>
      
      {isUserTeamTurn && (
        <PlayerSearchContainer>
          <h4>Select a Player</h4>
          <PlayerSearchInput
            type="text"
            placeholder="Search for a player by name or position..."
            value={searchTerm}
            onChange={handleSearchChange}
            onClick={() => setShowSearchResults(searchTerm.length > 0)}
          />
          
          {showSearchResults && searchResults.length > 0 && (
            <PlayerSearchResults>
              {searchResults.map((player) => (
                <PlayerSearchResult 
                  key={player.id}
                  onClick={() => handleSelectPlayer(player)}
                >
                  <div className="player-name">{player.name}</div>
                  <div className="player-details">
                    {player.position} • {player.height} • {player.weight} lbs • {player.team_name}
                  </div>
                </PlayerSearchResult>
              ))}
            </PlayerSearchResults>
          )}
        </PlayerSearchContainer>
      )}
      
      <DraftRoundTabs>
        {generateRoundTabs()}
      </DraftRoundTabs>
      
      <DraftTable>
        <thead>
          <tr>
            <th style={{ width: '8%' }}>Pick</th>
            <th style={{ width: '22%' }}>Team</th>
            <th style={{ width: '50%' }}>Player</th>
            <th style={{ width: '20%' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredPicks.map((pick) => (
            <tr 
              key={pick.id} 
              className={`
                ${pick.team.abbreviation === userTeam?.abbreviation ? 'user-team' : ''}
                ${pick.completed ? 'completed-pick' : ''}
              `}
            >
              <td>
                {pick.overall_pick}
                <div style={{ fontSize: '0.8em', color: '#999' }}>
                  Rd {pick.round_num}, Pick {pick.pick_num}
                </div>
              </td>
              <td>
                <TeamInfo>
                  <img 
                    className="team-logo" 
                    src={pick.team.logo_url || 'https://via.placeholder.com/25'} 
                    alt={pick.team.abbreviation}
                  />
                  <div>
                    {pick.team.city} {pick.team.name || pick.team.abbreviation}
                  </div>
                </TeamInfo>
              </td>
              <td>
                {pick.player ? (
                  <PlayerInfo>
                    <div className="player-name">{pick.player.name}</div>
                    <div className="player-details">
                      {pick.player.position} • {pick.player.height} • {pick.player.weight} lbs
                      <br />
                      {pick.player.team_name}
                    </div>
                  </PlayerInfo>
                ) : (
                  <span style={{ color: '#999' }}>Not selected</span>
                )}
              </td>
              <td>
                {currentPick && currentPick.id === pick.id && 
                pick.team.abbreviation === userTeam?.abbreviation && !pick.completed ? (
                  <SelectPlayerButton
                    onClick={() => setSearchTerm('')}
                  >
                    Make Selection
                  </SelectPlayerButton>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </DraftTable>
    </DraftBoardContainer>
  );
};

export default DraftBoard; 