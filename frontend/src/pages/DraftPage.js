import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import LotterySimulator from '../components/draft/LotterySimulator';
import DraftBoard from '../components/draft/DraftBoard';

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 20px;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 10px;
    color: #fff;
  }
  
  p {
    color: #ccc;
    font-size: 1.1rem;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #444;
`;

const ToggleButton = styled.button`
  background: transparent;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  color: ${props => props.active ? '#fff' : '#999'};
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  border-bottom: ${props => props.active ? '3px solid #B30E16' : '3px solid transparent'};
  
  &:hover {
    color: #fff;
  }
`;

const YearSelector = styled.select`
  padding: 8px 16px;
  background-color: #333;
  color: white;
  border: 1px solid #444;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #B30E16;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #B30E16;
  color: white;
  border: none;
  padding: 10px 20px;
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

const ErrorMessage = styled.div`
  background-color: rgba(179, 14, 22, 0.1);
  border: 1px solid #B30E16;
  color: #ff6b6b;
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const LoadingMessage = styled.div`
  margin: 20px 0;
  color: #ccc;
  font-size: 1.1rem;
  text-align: center;
`;

const DraftPage = () => {
  const [activeTab, setActiveTab] = useState('lottery');
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [originalDraftOrder, setOriginalDraftOrder] = useState([]);
  const [finalDraftOrder, setFinalDraftOrder] = useState([]);
  const [userTeam, setUserTeam] = useState(null);
  const [lotteryComplete, setLotteryComplete] = useState(false);
  
  const baseUrl = 'http://localhost:5001/api';
  
  // Fetch user team
  useEffect(() => {
    const fetchUserTeam = async () => {
      try {
        const response = await axios.get(`${baseUrl}/user/team`);
        if (response.data) {
          setUserTeam(response.data);
        }
      } catch (err) {
        console.error('Error fetching user team:', err);
        // Not setting an error here as this is not critical
      }
    };
    
    fetchUserTeam();
  }, []);
  
  // Fetch draft order when year changes
  useEffect(() => {
    const fetchDraftOrder = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${baseUrl}/draft/order?year=${year}&use_mock=true`);
        if (response.data) {
          setOriginalDraftOrder(response.data);
          setFinalDraftOrder([]);
          setLotteryComplete(false);
        }
      } catch (err) {
        console.error('Error fetching draft order:', err);
        setError('Failed to load draft order. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDraftOrder();
  }, [year]);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Handle year change
  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };
  
  // Handle draft reset
  const handleResetDraft = () => {
    setFinalDraftOrder([]);
    setLotteryComplete(false);
  };
  
  // Handle lottery complete
  const handleLotteryComplete = (lotteryResults) => {
    setFinalDraftOrder(lotteryResults);
    setLotteryComplete(true);
    setActiveTab('draft');
  };
  
  // Handle making a draft pick
  const handleMakePick = async (draftPickId, playerId) => {
    try {
      const response = await axios.post(`${baseUrl}/draft/pick`, {
        draft_pick_id: draftPickId,
        player_id: playerId
      });
      
      return response.data;
    } catch (err) {
      console.error('Error making draft pick:', err);
      setError('Failed to make draft pick. Please try again.');
      throw err;
    }
  };
  
  // Handle simulating a draft pick
  const handleSimulatePick = async (draftPickId) => {
    try {
      const response = await axios.post(`${baseUrl}/draft/simulate-pick`, {
        draft_pick_id: draftPickId
      });
      
      return response.data;
    } catch (err) {
      console.error('Error simulating draft pick:', err);
      setError('Failed to simulate draft pick. Please try again.');
      throw err;
    }
  };
  
  // Generate year options (current year + 5 years into the future)
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
  
  return (
    <PageContainer>
      <PageHeader>
        <h1>NHL Draft Central</h1>
        <p>Simulate the draft lottery and make your picks in this mock draft</p>
      </PageHeader>
      
      <ControlsContainer>
        <div>
          <YearSelector value={year} onChange={handleYearChange}>
            {generateYearOptions()}
          </YearSelector>
          
          {lotteryComplete && (
            <Button onClick={handleResetDraft}>
              Reset Draft
            </Button>
          )}
        </div>
      </ControlsContainer>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <ToggleContainer>
        <ToggleButton 
          active={activeTab === 'lottery'} 
          onClick={() => handleTabChange('lottery')}
        >
          Draft Lottery
        </ToggleButton>
        <ToggleButton 
          active={activeTab === 'draft'} 
          onClick={() => handleTabChange('draft')}
          disabled={!lotteryComplete && activeTab !== 'draft'}
        >
          Draft Board
        </ToggleButton>
      </ToggleContainer>
      
      {isLoading ? (
        <LoadingMessage>Loading draft data...</LoadingMessage>
      ) : (
        <>
          {activeTab === 'lottery' && (
            <LotterySimulator 
              draftOrder={originalDraftOrder}
              userTeam={userTeam}
              onLotteryComplete={handleLotteryComplete}
            />
          )}
          
          {activeTab === 'draft' && (
            <DraftBoard 
              draftOrder={lotteryComplete ? finalDraftOrder : originalDraftOrder}
              userTeam={userTeam}
              onMakePick={handleMakePick}
              onSimulatePick={handleSimulatePick}
              year={year}
            />
          )}
        </>
      )}
    </PageContainer>
  );
};

export default DraftPage; 