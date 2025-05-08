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
  width: 600px;
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

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #37455c;
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    color: #aaa;
  }
  
  .value {
    font-weight: 500;
  }
`;

const CoachContractModal = ({ coach, onClose, onExtend }) => {
  const [years, setYears] = useState(2);
  const [salary, setSalary] = useState(coach?.contract?.salary || "$1.5M");
  const [noFireClause, setNoFireClause] = useState(false);
  
  const handleYearsChange = (e) => {
    setYears(parseInt(e.target.value));
  };
  
  const handleSalaryChange = (e) => {
    setSalary(e.target.value);
  };
  
  const handleNoFireClauseChange = (e) => {
    setNoFireClause(e.target.checked);
  };
  
  const handleExtend = () => {
    onExtend({
      coach,
      years,
      salary,
      noFireClause
    });
  };
  
  return (
    <ModalOverlay>
      <ModalContainer>
        <ModalHeader>
          <h2>Extend Coach Contract</h2>
          <p>{coach?.name} - {coach?.role}</p>
        </ModalHeader>
        
        <ModalBody>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ color: '#66c0f4', marginBottom: '15px' }}>Current Contract</h3>
            <DetailRow>
              <span className="label">Current Contract</span>
              <span className="value">{coach?.contract?.years} years</span>
            </DetailRow>
            <DetailRow>
              <span className="label">Years Remaining</span>
              <span className="value">{coach?.contract?.yearsRemaining} years</span>
            </DetailRow>
            <DetailRow>
              <span className="label">Annual Salary</span>
              <span className="value">{coach?.contract?.salary}</span>
            </DetailRow>
            <DetailRow>
              <span className="label">No-Fire Clause</span>
              <span className="value">{coach?.contract?.noFire ? 'Yes' : 'No'}</span>
            </DetailRow>
          </div>
          
          <h3 style={{ color: '#66c0f4', marginBottom: '15px' }}>New Contract Offer</h3>
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
              placeholder="e.g. $1.5M"
            />
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
        </ModalBody>
        
        <ModalFooter>
          <FooterButton onClick={onClose}>
            Cancel
          </FooterButton>
          <FooterButton primary onClick={handleExtend}>
            Offer Extension
          </FooterButton>
        </ModalFooter>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default CoachContractModal; 