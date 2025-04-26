import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const DraftContainer = styled.div`
  padding: 20px;
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

const ControlPanel = styled.div`
  display: flex;
  gap: 15px;
`;

const Button = styled.button`
  background-color: #B30E16;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #950b12;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const DraftBoard = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  
  h2 {
    color: #C4CED4;
    margin-top: 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const Tab = styled.div`
  padding: 10px 20px;
  cursor: pointer;
  color: ${props => props.active ? '#B30E16' : '#C4CED4'};
  border-bottom: 2px solid ${props => props.active ? '#B30E16' : 'transparent'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  
  &:hover {
    color: ${props => props.active ? '#B30E16' : '#fff'};
  }
`;

const ProspectPool = styled.div`
  background-color: #1e1e1e;
  border-radius: 8px;
  padding: 20px;
  
  h2 {
    color: #C4CED4;
    margin-top: 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #333;
    padding-bottom: 10px;
  }
`;

const SearchBar = styled.div`
  margin-bottom: 20px;
  
  input {
    width: 100%;
    padding: 10px;
    background-color: #2a2a2a;
    border: 1px solid #333;
    border-radius: 4px;
    color: #fff;
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: #B30E16;
    }
  }
`;

const ProspectTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th {
    text-align: left;
    padding: 10px;
    color: #C4CED4;
    border-bottom: 1px solid #333;
  }
  
  td {
    padding: 12px 10px;
    border-bottom: 1px solid #333;
    color: #bbb;
  }
  
  tr:hover td {
    background-color: #2a2a2a;
  }
`;

const YearSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  
  select {
    padding: 5px 10px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
`;

const DraftStatus = styled.div`
  margin: 10px 0;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  border-left: 4px solid #333;
`;

const DraftPicksTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  
  th, td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  thead {
    background-color: #f4f4f4;
  }
  
  tr.upcoming-pick {
    background-color: #f8f8f8;
    color: #777;
    font-style: italic;
  }
`;

const ActionButton = styled.button`
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #45a049;
  }
`;

const SimulateButton = styled(Button)`
  background-color: #4CAF50;
  font-weight: bold;
  padding: 10px 16px;
  margin-left: auto;
`;

const ErrorDisplay = styled.div`
  margin: 20px 0;
  padding: 15px;
  background-color: rgba(255, 0, 0, 0.1);
  border-left: 4px solid #B30E16;
  color: #fff;
`;

const InfoMessage = styled.div`
  margin: 20px 0;
  padding: 15px;
  background-color: rgba(0, 0, 255, 0.1);
  border-left: 4px solid #4a90e2;
  color: #fff;
`;

// Define base URL
const API_BASE_URL = 'http://localhost:5001/api';

const Draft = () => {
  const [activeTab, setActiveTab] = useState('draftBoard');
  const [searchQuery, setSearchQuery] = useState('');
  const [draftYear, setDraftYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [draftInfo, setDraftInfo] = useState(null);
  const [draftOrder, setDraftOrder] = useState([]);
  const [draftablePlayers, setDraftablePlayers] = useState([]);
  const [completedPicks, setCompletedPicks] = useState([]);
  const [canStartDraft, setCanStartDraft] = useState(false);
  
  // Define handleYearChange function here, before it's used in any rendering
  const handleYearChange = (e) => {
    setDraftYear(parseInt(e.target.value));
  };
  
  // Fetch draft order
  const fetchDraftOrder = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/draft/order?year=${draftYear}`);
      
      const allPicks = response.data;
      
      // Separate completed picks from upcoming picks
      const completed = allPicks.filter(pick => pick.player_id);
      const upcoming = allPicks.filter(pick => !pick.player_id);
      
      setDraftOrder(upcoming);
      setCompletedPicks(completed);
      
    } catch (err) {
      console.error('Error fetching draft order:', err);
      // Use empty arrays as fallback
      setDraftOrder([]);
      setCompletedPicks([]);
    }
  }, [draftYear]);
  
  // Fetch draft-eligible players
  const fetchDraftablePlayers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/draft/prospects?year=${draftYear}`);
      setDraftablePlayers(response.data);
    } catch (err) {
      console.error('Error fetching draft prospects:', err);
      // Use an empty array as fallback
      setDraftablePlayers([]);
    }
  }, [draftYear]);
  
  // Fetch draft info
  const fetchDraftInfo = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/draft/?year=${draftYear}`);
      
      // Check if it's mock data and add a message if it is
      if (response.data && response.data.mock_data) {
        console.log('Using mock draft data:', response.data);
        setError('Using mock draft data - some features may be limited');
      }
      
      setDraftInfo(response.data);
      
      // Also fetch draft order and players
      await fetchDraftOrder();
      await fetchDraftablePlayers();
      
    } catch (err) {
      console.error('Error fetching draft info:', err);
      
      // If the main endpoint fails, try the mock endpoint
      try {
        console.log('Trying mock draft endpoint as fallback...');
        const mockResponse = await axios.get(`${API_BASE_URL}/draft/mock?year=${draftYear}`);
        setDraftInfo(mockResponse.data);
        console.log('Using mock draft data:', mockResponse.data);
        
        // Still try to fetch order and players
        await fetchDraftOrder();
        await fetchDraftablePlayers();
        
        setError('Using mock draft data - some features may be limited');
      } catch (mockErr) {
        console.error('Mock endpoint also failed:', mockErr);
        setError('Failed to load draft information - database may not be properly initialized');
      }
    } finally {
      setLoading(false);
    }
  }, [draftYear, fetchDraftOrder, fetchDraftablePlayers]);
  
  // Fetch draft information on component mount and when draftYear changes
  useEffect(() => {
    // First test API connectivity
    const testApiConnection = async () => {
      try {
        // Test basic connectivity with test endpoint
        const testResponse = await axios.get(`${API_BASE_URL}/draft/test`);
        console.log('API connection test:', testResponse.data);
        
        // Next, check database health to see if connection works
        try {
          const healthResponse = await axios.get(`${API_BASE_URL}/init/db-health`);
          console.log('Database health check:', healthResponse.data);
          
          if (healthResponse.data.status === 'healthy') {
            console.log('Database connection is healthy');
          } else {
            console.error('Database health check failed:', healthResponse.data);
            setError('Database connection issues detected. Please check server logs.');
            setLoading(false);
            return;
          }
        } catch (healthErr) {
          console.warn('Database health check failed, continuing with debug endpoint:', healthErr);
          // Continue with debug endpoint
        }
        
        // Try the debug endpoint to check database state
        try {
          const debugResponse = await axios.get(`${API_BASE_URL}/draft/debug`);
          console.log('Database debug info:', debugResponse.data);
          
          // Check if we have the required data
          const dbInfo = debugResponse.data.database_info;
          
          // Check if we have NHL teams (at least 1) - use nhl_team_count if available
          const nhlTeamsExist = dbInfo.team_table && 
                               dbInfo.team_table.exists && 
                               (dbInfo.team_table.nhl_team_count > 0 || dbInfo.team_table.record_count > 0);
                              
          if (!nhlTeamsExist) {
            console.log('No NHL teams found. Using mock data or fallback.');
            setError('No NHL teams found in the database. The draft functionality will be limited.');
            
            // Still try to fetch draft info with whatever is available
            fetchDraftInfo();
            return;
          } else {
            console.log(`Teams exist in database (NHL teams: ${dbInfo.team_table.nhl_team_count || 'unknown'}), continuing with draft setup.`);
          }
          
          // Check if we have players in the database
          const playersExist = dbInfo.player_table && 
                             dbInfo.player_table.exists && 
                             dbInfo.player_table.record_count > 0;
                             
          if (!playersExist) {
            setError('No players found in the database. Please initialize the database first.');
            setLoading(false);
            return;
          }
          
          // Check if we have draft-eligible players - using the count from the debug info
          const hasProspects = dbInfo.player_table && 
                             dbInfo.player_table.draft_eligible_count && 
                             dbInfo.player_table.draft_eligible_count > 0;
                             
          if (hasProspects) {
            console.log(`Found ${dbInfo.player_table.draft_eligible_count} draft-eligible players.`);
            // Enable the draft start button if we have prospects
            setCanStartDraft(true);
          } else {
            console.log('No draft-eligible players found. Will display existing 17-year-old players as prospects.');
          }
          
          // If all looks good, fetch actual draft data
          fetchDraftInfo();
        } catch (debugErr) {
          console.error('Debug endpoint error:', debugErr);
          // Still try to fetch draft info even if debug fails
          fetchDraftInfo();
        }
      } catch (err) {
        console.error('API connection test failed:', err);
        setError('Could not connect to the API. Check if the server is running.');
        setLoading(false);
      }
    };

    // Helper to check if we have draft prospects (as a fallback)
    const checkProspectsCount = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/draft/prospects?limit=1`);
        return response.data.length;
      } catch (err) {
        console.error('Error checking prospects count:', err);
        return 0;
      }
    };

    testApiConnection();
  }, [fetchDraftInfo]);
  
  // Make a pick
  const makePick = async (pickId, playerId) => {
    try {
      const pickResponse = await axios.post(`${API_BASE_URL}/draft/pick`, {
        draft_pick_id: pickId,
        player_id: playerId,
        year: draftYear
      });
      
      // Update data after making pick
      await fetchDraftInfo();
      
      return { success: true, data: pickResponse.data };
    } catch (err) {
      console.error('Error making draft pick:', err);
      return { error: err.response?.data?.error || 'Failed to make draft pick' };
    }
  };
  
  // Simulate next pick
  const simulateNextPick = async () => {
    try {
      // Check if there are any prospects first
      if (draftablePlayers.length === 0) {
        alert("No draft-eligible players available. Cannot simulate picks.");
        return { error: "No draft-eligible players available" };
      }
      
      const simResponse = await axios.post(`${API_BASE_URL}/draft/simulate/pick`, {
        year: draftYear
      });
      
      // Update data after simulating pick
      await fetchDraftInfo();
      
      return { success: true, data: simResponse.data };
    } catch (err) {
      console.error('Error simulating pick:', err);
      return { error: err.response?.data?.error || 'Failed to simulate pick' };
    }
  };
  
  // Simulate round
  const simulateRound = async () => {
    try {
      // Check if there are any prospects first
      if (draftablePlayers.length === 0) {
        alert("No draft-eligible players available. Cannot simulate draft round.");
        return { error: "No draft-eligible players available" };
      }
      
      const roundResponse = await axios.post(`${API_BASE_URL}/draft/simulate/round`, {
        year: draftYear
      });
      
      // Update data after simulating round
      await fetchDraftInfo();
      
      return { success: true, data: roundResponse.data };
    } catch (err) {
      console.error('Error simulating round:', err);
      return { error: err.response?.data?.error || 'Failed to simulate round' };
    }
  };
  
  // Simulate entire draft
  const simulateEntireDraft = async () => {
    try {
      // Check if there are any prospects first
      if (draftablePlayers.length === 0) {
        alert("No draft-eligible players available. Cannot simulate entire draft.");
        return { error: "No draft-eligible players available" };
      }
      
      const draftResponse = await axios.post(`${API_BASE_URL}/draft/simulate/all`, {
        year: draftYear
      });
      
      // Update data after simulating entire draft
      await fetchDraftInfo();
      
      return { success: true, data: draftResponse.data };
    } catch (err) {
      console.error('Error simulating draft:', err);
      return { error: err.response?.data?.error || 'Failed to simulate draft' };
    }
  };
  
  // Handle pick selection (when user clicks on a player to draft)
  const handlePlayerSelect = async (playerId) => {
    if (!draftOrder.length) {
      alert('No more draft picks available');
      return;
    }
    
    if (!playerId) {
      alert('Invalid player selection');
      return;
    }
    
    // Get the next pick
    const nextPick = draftOrder[0];
    
    // Make the pick
    const result = await makePick(nextPick.id, playerId);
    
    if (result.error) {
      alert(result.error);
    }
  };
  
  // Filter the players based on search query
  const filteredPlayers = draftablePlayers.filter(player => 
    player.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.position_primary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (player.nationality && player.nationality.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  if (loading) {
    return (
      <DraftContainer>
        <Header>
          <h1>Draft Center</h1>
        </Header>
        <div style={{ textAlign: 'center', margin: '40px 0', color: '#fff' }}>
          <h2>Loading draft information...</h2>
          <p>Please wait while we fetch draft data from the server.</p>
        </div>
      </DraftContainer>
    );
  }
  
  if (error) {
    return (
      <DraftContainer>
        <Header>
          <h1>Draft Center</h1>
          <YearSelector>
            <label>Draft Year:</label>
            <select value={draftYear} onChange={handleYearChange}>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 2).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </YearSelector>
        </Header>
        
        <ErrorDisplay>
          <h3>Error Loading Draft Data</h3>
          <p>{error}</p>
          <Button onClick={() => fetchDraftInfo()}>
            Retry
          </Button>
        </ErrorDisplay>
        
        {draftInfo && draftInfo.mock_data && (
          <div>
            <InfoMessage>
              <h3>Using Demo Draft Data</h3>
              <p>Some features may be limited in demo mode.</p>
            </InfoMessage>
            
            <DraftStatus>
              {draftInfo && (
                <p>
                  Status: <strong>{draftInfo.status.toUpperCase()}</strong> | 
                  Current Round: {draftInfo.current_round} | 
                  Current Pick: {draftInfo.current_pick}
                </p>
              )}
            </DraftStatus>
            
            <TabContainer>
              <Tab 
                active={activeTab === 'prospects'} 
                onClick={() => setActiveTab('prospects')}
              >
                Prospect Pool
              </Tab>
            </TabContainer>
            
            {activeTab === 'prospects' && (
              <ProspectPool>
                <h2>Prospect Pool (Demo Data)</h2>
                <p style={{ color: '#bbb' }}>
                  This is a demonstration of the prospect pool interface. In the actual application, you would see real draft-eligible players here.
                </p>
              </ProspectPool>
            )}
          </div>
        )}
      </DraftContainer>
    );
  }
  
  return (
    <DraftContainer>
      <Header>
        <h1>Draft Center</h1>
        <YearSelector>
          <label>Draft Year:</label>
          <select value={draftYear} onChange={handleYearChange}>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 2).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </YearSelector>
        <ControlPanel>
          <Button onClick={async () => {
            if (draftablePlayers.length === 0) {
              alert("No draft-eligible players available. Cannot simulate picks.");
              return;
            }
            await simulateNextPick();
          }}>Simulate Pick</Button>
          <Button onClick={async () => {
            if (draftablePlayers.length === 0) {
              alert("No draft-eligible players available. Cannot simulate draft round.");
              return;
            }
            await simulateRound();
          }}>Simulate Round</Button>
          <Button onClick={async () => {
            if (draftablePlayers.length === 0) {
              alert("No draft-eligible players available. Cannot simulate entire draft.");
              return;
            }
            await simulateEntireDraft();
          }}>Simulate All</Button>
          <SimulateButton disabled={!canStartDraft || draftablePlayers.length === 0} onClick={() => alert('Draft simulation coming soon!')}>
            Start Simulated Draft
          </SimulateButton>
        </ControlPanel>
      </Header>
      
      <DraftStatus>
        {draftInfo && (
          <p>
            Status: <strong>{draftInfo.status.toUpperCase()}</strong> | 
            Current Round: {draftInfo.current_round} | 
            Current Pick: {draftInfo.current_pick}
          </p>
        )}
      </DraftStatus>
      
      <TabContainer>
        <Tab 
          active={activeTab === 'draftBoard'} 
          onClick={() => setActiveTab('draftBoard')}
        >
          Draft Board
        </Tab>
        <Tab 
          active={activeTab === 'prospects'} 
          onClick={() => setActiveTab('prospects')}
        >
          Prospect Pool
        </Tab>
        <Tab 
          active={activeTab === 'myPicks'} 
          onClick={() => setActiveTab('myPicks')}
        >
          My Picks
        </Tab>
        <Tab 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')}
        >
          Draft Settings
        </Tab>
      </TabContainer>
      
      {activeTab === 'draftBoard' && (
        <DraftBoard>
          <h2>Draft Board</h2>
          <DraftPicksTable>
            <thead>
              <tr>
                <th>Pick</th>
                <th>Round</th>
                <th>Team</th>
                <th>Player</th>
                <th>Position</th>
                <th>Nationality</th>
                <th>Overall</th>
              </tr>
            </thead>
            <tbody>
              {completedPicks.map(pick => (
                <tr key={pick.id}>
                  <td>{pick.overall_pick}</td>
                  <td>{pick.round_num}</td>
                  <td>{pick.team ? pick.team.name : 'Unknown Team'}</td>
                  <td>{pick.player ? `${pick.player.first_name} ${pick.player.last_name}` : 'Not Selected'}</td>
                  <td>{pick.player ? pick.player.position_primary : '-'}</td>
                  <td>{pick.player ? pick.player.nationality : '-'}</td>
                  <td>{pick.player ? pick.player.overall_rating : '-'}</td>
                </tr>
              ))}
              {draftOrder.map(pick => (
                <tr key={pick.id} className="upcoming-pick">
                  <td>{pick.overall_pick}</td>
                  <td>{pick.round_num}</td>
                  <td>{pick.team ? pick.team.name : 'Unknown Team'}</td>
                  <td colSpan="4">On the clock...</td>
                </tr>
              ))}
            </tbody>
          </DraftPicksTable>
        </DraftBoard>
      )}
      
      {activeTab === 'prospects' && (
        <ProspectPool>
          <h2>Prospect Pool</h2>
          <SearchBar>
            <input 
              type="text" 
              placeholder="Search prospects by name, position, nationality..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBar>
          
          <p style={{ color: '#bbb', marginBottom: '20px' }}>
            Displaying all 17-year-old draft-eligible players. These players are automatically eligible for the {draftYear} draft.
          </p>
          
          {filteredPlayers.length === 0 ? (
            <InfoMessage>
              <h3>No Draft-Eligible Players Found</h3>
              <p>There are currently no 17-year-old players eligible for the draft.</p>
              <p>Players will appear here automatically once they meet the draft eligibility criteria (age 17 and not previously drafted).</p>
            </InfoMessage>
          ) : (
            <ProspectTable>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Age</th>
                  <th>Nationality</th>
                  <th>Overall</th>
                  <th>Potential</th>
                  <th>Certainty</th>
                  <th>Volatility</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map((player) => (
                  <tr key={player.id}>
                    <td>{player.first_name} {player.last_name}</td>
                    <td>{player.position_primary}</td>
                    <td>{player.age}</td>
                    <td>{player.nationality}</td>
                    <td>{player.overall_rating}</td>
                    <td>{player.potential}</td>
                    <td>{player.potential_precision ? `${player.potential_precision}%` : 'N/A'}</td>
                    <td>{player.potential_volatility ? `${player.potential_volatility}%` : 'N/A'}</td>
                    <td>
                      <ActionButton onClick={() => handlePlayerSelect(player.id)}>
                        Draft
                      </ActionButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ProspectTable>
          )}
        </ProspectPool>
      )}
      
      {activeTab === 'myPicks' && (
        <DraftBoard>
          <h2>My Draft Picks</h2>
          <p>Your team's upcoming draft selections will appear here.</p>
        </DraftBoard>
      )}
      
      {activeTab === 'settings' && (
        <DraftBoard>
          <h2>Draft Settings</h2>
          <p>Configure draft options and settings here.</p>
        </DraftBoard>
      )}
    </DraftContainer>
  );
};

export default Draft;
