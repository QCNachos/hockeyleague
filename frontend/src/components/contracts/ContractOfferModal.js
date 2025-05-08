import React, { useState } from 'react';
import styled from 'styled-components';
import PlayerSilhouette from '../../assets/Player_silouette.png';

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
  width: 90%;
  max-width: 1200px;
  height: 85vh;
  background-color: #0c1624;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const ModalHeader = styled.div`
  background: linear-gradient(90deg, #0c1624 0%, #1c3b6a 100%);
  padding: 0;
  position: relative;
  height: 200px;
  overflow: hidden;
`;

const HeaderContent = styled.div`
  padding: 20px;
  display: flex;
  justify-content: space-between;
  height: 100%;
`;

const PlayerInfo = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
`;

const BrandLogo = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 80px;
  height: 80px;
  background-color: #333;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-weight: bold;
`;

const PlayerName = styled.div`
  position: absolute;
  top: 20px;
  left: 140px;
  color: white;
  font-size: 50px;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

const PlayerImage = styled.div`
  position: absolute;
  bottom: 20px;
  left: 140px;
  width: 220px;
  height: 220px;
  background-image: url(${props => props.image || PlayerSilhouette});
  background-size: contain;
  background-position: center bottom;
  background-repeat: no-repeat;
`;

const ModalBody = styled.div`
  padding: 20px;
  color: white;
  flex: 1;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 3fr 2fr;
  grid-gap: 20px;
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.h3`
  color: #66c0f4;
  font-size: 18px;
  font-weight: 500;
  margin: 0 0 10px 0;
  border-bottom: 1px solid #37455c;
  padding-bottom: 5px;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const SalaryOffer = styled.div`
  background-color: #172334;
  padding: 15px;
  border-radius: 4px;
`;

const InputGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #0c1624;
  padding: 10px 15px;
  border-radius: 3px;
  
  label {
    font-size: 16px;
    font-weight: 500;
  }
  
  input, select {
    background-color: #0c1624;
    border: none;
    border-bottom: 1px solid #37455c;
    color: white;
    font-size: 16px;
    text-align: right;
    width: 150px;
    padding: 5px;
    
    &:focus {
      outline: none;
      border-bottom: 1px solid #66c0f4;
    }
  }
`;

const YearDisplay = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
`;

const YearColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  
  .year-label {
    font-weight: 500;
    margin-bottom: 5px;
  }
  
  .year-value {
    background-color: #0c1624;
    width: 90%;
    padding: 10px 0;
    text-align: center;
  }
  
  .clause-tag {
    background-color: #b30e16;
    color: white;
    padding: 3px 8px;
    border-radius: 3px;
    font-size: 12px;
    margin-top: 8px;
  }
`;

const ContractDetails = styled.div`
  background-color: #172334;
  padding: 15px;
  border-radius: 4px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  
  .label {
    color: #aaa;
    font-size: 14px;
  }
  
  .value {
    font-size: 14px;
    text-align: right;
  }
`;

const InfoSection = styled.div`
  background-color: #172334;
  padding: 15px;
  border-radius: 4px;
`;

const BarContainer = styled.div`
  margin: 8px 0;
  
  .label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 3px;
    
    span {
      font-size: 14px;
    }
  }
  
  .bar-bg {
    width: 100%;
    height: 8px;
    background-color: #0c1624;
    border-radius: 4px;
    overflow: hidden;
    
    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
      width: ${props => props.fillPercent || '0%'};
    }
  }
`;

const InterestSection = styled.div`
  margin-top: 15px;
  
  .interest-row {
    margin-bottom: 10px;
    
    .label {
      font-size: 14px;
      margin-bottom: 3px;
    }
  }
`;

const RequestsSection = styled.div`
  display: flex;
  justify-content: space-between;
  
  .column {
    width: 48%;
  }
  
  .title {
    font-size: 16px;
    color: #66c0f4;
    margin-bottom: 10px;
  }
  
  .content {
    background-color: #0c1624;
    padding: 15px;
    min-height: 100px;
    border-radius: 4px;
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

const CapSpaceProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background-color: #0c1624;
  border-radius: 5px;
  margin: 10px 0;
  position: relative;
  
  .bar-fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => Math.min(100, props.percentage)}%;
    background: linear-gradient(90deg, #4CAF50 0%, #8BC34A 100%);
    border-radius: 5px;
  }
  
  .marker {
    position: absolute;
    top: 0;
    left: ${props => props.markerPosition}%;
    height: 100%;
    width: 2px;
    background-color: white;
  }
`;

const ContractOfferModal = ({ player, onClose, onOffer, onBack, onStartNegotiation }) => {
  const [salary, setSalary] = useState(player?.askingPrice || "12.400M");
  const [years, setYears] = useState(player?.yearsWanted || 7);
  const [contractType, setContractType] = useState("1 Way");
  const [clauseBase, setClauseBase] = useState("No-Movement Clause");
  const [clauseStructure, setClauseStructure] = useState("Full");
  const [tradeProtection, setTradeProtection] = useState("100%");
  
  const handleSalaryChange = (e) => {
    setSalary(e.target.value);
  };
  
  const handleYearsChange = (e) => {
    setYears(parseInt(e.target.value));
  };
  
  const handleOffer = () => {
    onOffer({
      salary,
      years,
      contractType,
      clauseBase,
      clauseStructure,
      tradeProtection
    });
  };
  
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <BrandLogo>EA</BrandLogo>
          <PlayerName>
            {player?.firstName || "LEON"}<br/>
            {player?.lastName || "DRAISAITL"}
          </PlayerName>
          <PlayerImage image={player?.image} />
          <PlayerInfo>
            <span>#{player?.number || "29"} | {player?.position || "C/LW"} | AGE: {player?.age || "29"}</span>
            <span>SHOOTS: {player?.shoots || "LEFT"}</span>
            <span>OVERALL: {player?.overall || "93"} OVR</span>
            <span>POTENTIAL: {player?.potential || "Elite"}</span>
            <span>X-FACTOR: {player?.xFactor || "EXACT"}</span>
          </PlayerInfo>
        </ModalHeader>
        
        <ModalBody>
          <LeftPanel>
            <SectionTitle>YOUR OFFER</SectionTitle>
            <FormContainer>
              <SalaryOffer>
                <InputGroup>
                  <label>SALARY OFFERED</label>
                  <input type="text" value={salary} onChange={handleSalaryChange} />
                </InputGroup>
                
                <InputGroup>
                  <label>YEARS</label>
                  <input type="number" min="1" max="8" value={years} onChange={handleYearsChange} />
                </InputGroup>
                
                <InputGroup>
                  <label>CONTRACT TYPE</label>
                  <select value={contractType} onChange={(e) => setContractType(e.target.value)}>
                    <option value="1 Way">1 Way</option>
                    <option value="2 Way">2 Way</option>
                  </select>
                </InputGroup>
                
                <InputGroup>
                  <label>CLAUSE BASE</label>
                  <select value={clauseBase} onChange={(e) => setClauseBase(e.target.value)}>
                    <option value="No-Movement Clause">No-Movement Clause</option>
                    <option value="No-Trade Clause">No-Trade Clause</option>
                    <option value="None">None</option>
                  </select>
                </InputGroup>
                
                <InputGroup>
                  <label>CLAUSE STRUCTURE</label>
                  <select value={clauseStructure} onChange={(e) => setClauseStructure(e.target.value)}>
                    <option value="Full">Full</option>
                    <option value="Modified">Modified</option>
                    <option value="None">None</option>
                  </select>
                </InputGroup>
                
                <InputGroup>
                  <label>TRADE PROTECTION</label>
                  <select value={tradeProtection} onChange={(e) => setTradeProtection(e.target.value)}>
                    <option value="100%">100%</option>
                    <option value="75%">75%</option>
                    <option value="50%">50%</option>
                    <option value="25%">25%</option>
                    <option value="0%">0%</option>
                  </select>
                </InputGroup>
              </SalaryOffer>
              
              <YearDisplay>
                {Array.from({ length: 8 }, (_, i) => i + 1).map(year => (
                  <YearColumn key={year}>
                    <div className="year-label">YEAR {year}</div>
                    {year <= years ? (
                      <>
                        <div className="year-value">${parseFloat(salary).toFixed(3)}M</div>
                        {clauseBase !== "None" && year <= 4 && (
                          <div className="clause-tag">NMC</div>
                        )}
                      </>
                    ) : (
                      <div className="year-value">-</div>
                    )}
                  </YearColumn>
                ))}
              </YearDisplay>
            </FormContainer>
          </LeftPanel>
          
          <RightPanel>
            <InfoSection>
              <SectionTitle>PLAYER ASKS</SectionTitle>
              <DetailRow>
                <span className="label">ASKING PRICE:</span>
                <span className="value">${player?.askingPrice || "12.400M"}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">YEARS WANTED:</span>
                <span className="value">{player?.yearsWanted || 7}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">EXPIRY STATUS:</span>
                <span className="value">{player?.expiryStatus || "UFA"}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">INTEREST IN 2 WAY CONTRACT:</span>
                <span className="value">{player?.interestIn2Way || "NO"}</span>
              </DetailRow>
            </InfoSection>
            
            <InfoSection>
              <SectionTitle>SALARY CAP</SectionTitle>
              <DetailRow>
                <span className="label">CAP SPACE:</span>
                <span className="value">${player?.capSpace || "15.113M"}</span>
              </DetailRow>
              <DetailRow>
                <span className="label">SALARY CAP %:</span>
                <span className="value">{player?.salaryCapPercent || "13.1%"}</span>
              </DetailRow>
              
              <CapSpaceProgressBar percentage={83} markerPosition={87}>
                <div className="bar-fill"></div>
                <div className="marker"></div>
              </CapSpaceProgressBar>
              
              <DetailRow>
                <span className="label">CURRENT CAP:</span>
                <span className="value">${player?.currentCap || "79.612M"}/${player?.totalCap || "94.725M"}</span>
              </DetailRow>
            </InfoSection>
            
            <InfoSection>
              <SectionTitle>TEAM INTEREST</SectionTitle>
              <InterestSection>
                <div className="interest-row">
                  <div className="label">CURRENT OFFER</div>
                  <BarContainer fillPercent="80%">
                    <div className="bar-bg">
                      <div className="bar-fill"></div>
                    </div>
                  </BarContainer>
                </div>
                
                <div className="interest-row">
                  <div className="label">CONTRACT</div>
                  <BarContainer fillPercent="75%">
                    <div className="bar-bg">
                      <div className="bar-fill"></div>
                    </div>
                  </BarContainer>
                </div>
                
                <div className="interest-row">
                  <div className="label">ORGANIZATION</div>
                  <BarContainer fillPercent="65%">
                    <div className="bar-bg">
                      <div className="bar-fill"></div>
                    </div>
                  </BarContainer>
                </div>
              </InterestSection>
            </InfoSection>
            
            <InfoSection>
              <SectionTitle>LEAGUE INTEREST</SectionTitle>
              <DetailRow>
                <span className="label">TOP INTERESTED TEAM:</span>
                <span className="value">???</span>
              </DetailRow>
              <InterestSection>
                <div className="interest-row">
                  <div className="label">CONTRACT - ???</div>
                  <BarContainer fillPercent="60%">
                    <div className="bar-bg">
                      <div className="bar-fill"></div>
                    </div>
                  </BarContainer>
                </div>
                
                <div className="interest-row">
                  <div className="label">ORGANIZATION - ???</div>
                  <BarContainer fillPercent="55%">
                    <div className="bar-bg">
                      <div className="bar-fill"></div>
                    </div>
                  </BarContainer>
                </div>
              </InterestSection>
            </InfoSection>
            
            <RequestsSection>
              <div className="column">
                <div className="title">PLAYER REQUESTS</div>
                <div className="content">-</div>
              </div>
              <div className="column">
                <div className="title">YOUR PROMISES</div>
                <div className="content">-</div>
              </div>
            </RequestsSection>
          </RightPanel>
        </ModalBody>
        
        <ModalFooter>
          <FooterButton onClick={onBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8l-4 4 4 4" />
              <path d="M16 12H9" />
            </svg>
            BACK
          </FooterButton>
          
          <div>
            <FooterButton onClick={handleOffer}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              OFFER CONTRACT
            </FooterButton>
            <FooterButton primary onClick={onStartNegotiation} style={{ marginLeft: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" />
                <path d="M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              START NEGOTIATION
            </FooterButton>
          </div>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default ContractOfferModal; 