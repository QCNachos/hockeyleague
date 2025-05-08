import React, { useState } from 'react';
import styled from 'styled-components';

// Styled components
const ModalOverlay = styled.div`
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

const ModalContainer = styled.div`
  width: 700px;
  background-color: #0c1624;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ModalHeader = styled.div`
  background: linear-gradient(90deg, #0c1624 0%, #1c3b6a 100%);
  padding: 20px;
  position: relative;
  
  h2 {
    color: white;
    margin: 0;
    font-size: 24px;
  }
  
  p {
    color: #aaa;
    margin: 5px 0 0 0;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  color: white;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }
  
  select, input {
    width: 100%;
    padding: 10px;
    border-radius: 4px;
    background-color: #172334;
    border: 1px solid #37455c;
    color: white;
    font-size: 16px;
    
    &:focus {
      outline: none;
      border-color: #66c0f4;
    }
  }
`;

const ModalFooter = styled.div`
  background-color: #0c1624;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #37455c;
`;

const FooterButton = styled.button`
  background-color: ${props => props.primary ? '#4CAF50' : '#172334'};
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  
  svg {
    margin-right: 8px;
  }
  
  &:hover {
    background-color: ${props => props.primary ? '#3e8e41' : '#213246'};
  }
`;

const CoachInfoHeader = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const CoachAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #1e3152;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
  color: white;
  margin-right: 20px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }
`;

const CoachDetails = styled.div`
  flex: 1;
`;

const CoachName = styled.h3`
  margin: 0 0 5px 0;
  font-size: 20px;
`;

const CoachRole = styled.div`
  font-size: 14px;
  color: #aaa;
  margin-bottom: 5px;
`;

const CoachStats = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 10px;
`;

const StatItem = styled.div`
  .label {
    font-size: 12px;
    color: #aaa;
  }
  
  .value {
    font-weight: 600;
  }
`;

const TwoColumnLayout = styled.div`
  display: flex;
  gap: 30px;
  margin-top: 20px;
`;

const Column = styled.div`
  flex: 1;
`;

const ContractYearsVisual = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 15px 0;
`;

const YearBar = styled.div`
  display: flex;
  align-items: center;
  
  .year-label {
    width: 80px;
    font-size: 14px;
  }
  
  .year-bar {
    flex: 1;
    height: 30px;
    position: relative;
    background-color: #172334;
    border-radius: 4px;
    
    .fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: ${props => props.active ? '#4CAF50' : '#37455c'};
      width: 100%;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 500;
    }
  }
`;

const InfoBox = styled.div`
  background-color: #172334;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 15px;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #66c0f4;
  }
  
  p {
    margin: 0;
    font-size: 14px;
  }
`;

const InterestMeter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
  
  .meter-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #aaa;
  }
  
  .meter-bar {
    height: 8px;
    background-color: #37455c;
    border-radius: 4px;
    position: relative;
    
    .fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background-color: ${props => props.interest};
      width: ${props => props.percentage}%;
      border-radius: 4px;
    }
  }
`;

const CoachContractOfferModal = ({ coach, onClose, onOffer }) => {
  const [years, setYears] = useState(coach?.requestedYears || 2);
  const [salary, setSalary] = useState(coach?.askingPrice.replace('$', '') || "2.5M");
  const [rollOver, setRollOver] = useState(false);
  const [noFireClause, setNoFireClause] = useState(false);
  
  // Interest calculation 
  const getInterestColor = (interest) => {
    switch(interest) {
      case 'High': return '#4CAF50';
      case 'Medium': return '#FFA500';
      case 'Low': return '#F44336';
      default: return '#FFA500';
    }
  };
  
  const getInterestPercentage = (interest) => {
    switch(interest) {
      case 'High': return 85;
      case 'Medium': return 55;
      case 'Low': return 30;
      default: return 50;
    }
  };
  
  const handleYearsChange = (e) => {
    setYears(parseInt(e.target.value));
  };
  
  const handleSalaryChange = (e) => {
    setSalary(e.target.value);
  };
  
  const handleRollOverChange = (e) => {
    setRollOver(e.target.checked);
  };
  
  const handleNoFireClauseChange = (e) => {
    setNoFireClause(e.target.checked);
  };
  
  const handleOfferContract = () => {
    onOffer({
      coach,
      years,
      salary: `$${salary}`,
      rollOver,
      noFireClause
    });
  };
  
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <h2>Contract Offer</h2>
          <p>{coach?.role}</p>
        </ModalHeader>
        
        <ModalBody>
          <CoachInfoHeader>
            <CoachAvatar>
              {coach?.name.split(' ').map(n => n[0]).join('')}
            </CoachAvatar>
            <CoachDetails>
              <CoachName>{coach?.name}</CoachName>
              <CoachRole>{coach?.role} • {coach?.age} years old • {coach?.experience} years experience</CoachRole>
              
              <CoachStats>
                <StatItem>
                  <div className="label">Overall</div>
                  <div className="value">{coach?.overall}</div>
                </StatItem>
                <StatItem>
                  <div className="label">Specialties</div>
                  <div className="value">{coach?.specialties.join(', ')}</div>
                </StatItem>
              </CoachStats>
            </CoachDetails>
          </CoachInfoHeader>
          
          <TwoColumnLayout>
            <Column>
              <FormGroup>
                <label>Contract Length</label>
                <select value={years} onChange={handleYearsChange}>
                  <option value="1">1 Year</option>
                  <option value="2">2 Years</option>
                  <option value="3">3 Years</option>
                  <option value="4">4 Years</option>
                  <option value="5">5 Years</option>
                </select>
              </FormGroup>
              
              <FormGroup>
                <label>Annual Salary</label>
                <input 
                  type="text" 
                  value={salary} 
                  onChange={handleSalaryChange}
                  placeholder="e.g. 2.5M"
                />
              </FormGroup>
              
              <FormGroup>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={rollOver}
                    onChange={handleRollOverChange}
                    style={{ width: 'auto', marginRight: '10px' }}
                  />
                  Include Rollover Year
                </label>
              </FormGroup>
              
              <FormGroup>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={noFireClause}
                    onChange={handleNoFireClauseChange}
                    style={{ width: 'auto', marginRight: '10px' }}
                  />
                  Include No-Fire Clause
                </label>
              </FormGroup>
              
              <ContractYearsVisual>
                {[...Array(5)].map((_, i) => (
                  <YearBar key={i} active={i < years}>
                    <div className="year-label">Year {i + 1}:</div>
                    <div className="year-bar">
                      {i < years && (
                        <div className="fill">
                          ${salary}
                        </div>
                      )}
                    </div>
                  </YearBar>
                ))}
              </ContractYearsVisual>
            </Column>
            
            <Column>
              <InfoBox>
                <h4>Coach Asking Price</h4>
                <p>{coach?.askingPrice} per year for {coach?.requestedYears} {coach?.requestedYears === 1 ? 'year' : 'years'}</p>
              </InfoBox>
              
              <InfoBox>
                <h4>Coaching Budget</h4>
                <p>Current Coaching Spending: $12.7M</p>
                <p>Coaching Budget Remaining: $3.3M</p>
              </InfoBox>
              
              <InterestMeter
                interest={getInterestColor(coach?.interest)}
                percentage={getInterestPercentage(coach?.interest)}
              >
                <h4>Team Interest</h4>
                <div className="meter-label">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
                <div className="meter-bar">
                  <div className="fill"></div>
                </div>
              </InterestMeter>
              
              <InterestMeter
                interest={getInterestColor(coach?.interest)}
                percentage={getInterestPercentage(coach?.interest)}
              >
                <h4>League Interest</h4>
                <div className="meter-label">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
                <div className="meter-bar">
                  <div className="fill"></div>
                </div>
              </InterestMeter>
            </Column>
          </TwoColumnLayout>
        </ModalBody>
        
        <ModalFooter>
          <FooterButton onClick={onClose}>
            Cancel
          </FooterButton>
          <div>
            <FooterButton onClick={onClose} style={{ marginRight: '10px' }}>
              Start Negotiation
            </FooterButton>
            <FooterButton primary onClick={handleOfferContract}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Offer Contract
            </FooterButton>
          </div>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default CoachContractOfferModal; 