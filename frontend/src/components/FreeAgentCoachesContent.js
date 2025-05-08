import React, { useState } from 'react';
import styled from 'styled-components';

// Styled components for layout
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const Title = styled.h2`
  color: #C4CED4;
  font-size: 22px;
  font-weight: 600;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 22px;
    background-color: #B30E16;
    margin-right: 10px;
    border-radius: 2px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#B30E16' : '#333'};
  color: white;
  padding: 8px 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.primary ? '#950b12' : '#444'};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  svg {
    margin-right: 6px;
  }

  &.small {
    padding: 5px 10px;
    font-size: 12px;
  }
`;

const Card = styled.div`
  background-color: #252525;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
  margin-bottom: 15px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  border-bottom: 1px solid #333;
  
  h3 {
    margin: 0;
    color: #C4CED4;
    font-size: 16px;
  }
`;

const CardContent = styled.div`
  padding: 12px 15px;
`;

const SearchInput = styled.input`
  background-color: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: white;
  padding: 8px 12px;
  width: 220px;
  
  &::placeholder {
    color: #888;
  }
  
  &:focus {
    outline: none;
    border-color: #555;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background-color: #1a1a1a;
  
  th {
    text-align: left;
    padding: 10px;
    color: #aaa;
    font-weight: 500;
    font-size: 13px;
    border-bottom: 1px solid #333;
  }
`;

const TableBody = styled.tbody`
  tr {
    &:nth-child(even) {
      background-color: #1c1c1c;
    }
    
    &:hover {
      background-color: #2a2a2a;
    }
    
    td {
      padding: 10px;
      color: #C4CED4;
      font-size: 14px;
      border-bottom: 1px solid #333;
    }
  }
`;

const FreeAgentCoachesContent = ({ teamLevel, rotateTeamLevel, onReturn }) => {
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);
  
  // Mock free agent coaches data
  const freeAgentCoaches = [
    {
      id: 1,
      name: 'Mike Sullivan',
      role: 'Head Coach',
      age: 56,
      experience: 15,
      overall: 'A',
      requestedYears: 3,
      askingPrice: '$4.8M',
      interest: 'Medium',
      specialties: ['Power Play', 'Defense']
    },
    {
      id: 2,
      name: 'Rick Bowness',
      role: 'Head Coach',
      age: 69,
      experience: 29,
      overall: 'B+',
      requestedYears: 1,
      askingPrice: '$3.5M',
      interest: 'High',
      specialties: ['Defense', 'Veteran Leadership']
    },
    {
      id: 3,
      name: 'Jeff Blashill',
      role: 'Assistant Coach',
      age: 51,
      experience: 10,
      overall: 'B',
      requestedYears: 2,
      askingPrice: '$2.2M',
      interest: 'High',
      specialties: ['Youth Development', 'Special Teams']
    },
    {
      id: 4,
      name: 'Martin St. Louis',
      role: 'Assistant Coach',
      age: 48,
      experience: 4,
      overall: 'B+',
      requestedYears: 3,
      askingPrice: '$2.8M',
      interest: 'Medium',
      specialties: ['Offense', 'Power Play']
    }
  ];
  
  const pendingOffers = [
    { 
      id: 1, 
      name: 'Steve Smith', 
      role: 'Defense Coach', 
      age: 61, 
      rating: 'B',
      offeredYears: 1,
      annualSalary: '$1.3M',
      totalValue: '$1.3M',
      status: 'Considering'
    },
    { 
      id: 2, 
      name: 'Gary Roberts', 
      role: 'Strength & Conditioning Coach', 
      age: 58, 
      rating: 'A-',
      offeredYears: 2,
      annualSalary: '$1.1M',
      totalValue: '$2.2M',
      status: 'Likely to Accept'
    }
  ];
  
  const handleOpenContractModal = (coach) => {
    setSelectedCoach(coach);
    setShowContractModal(true);
  };
  
  const handleCloseContractModal = () => {
    setShowContractModal(false);
  };
  
  const handleOfferContract = (contractData) => {
    console.log('Contract offered to coach:', contractData);
    // Here you would implement API calls to submit the contract offer
    setShowContractModal(false);
  };
  
  return (
    <>
      <Header>
        <Title>Free Agent Coaches</Title>
        <ActionButtons>
          <Button onClick={onReturn}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5"></path>
              <path d="M12 19l-7-7 7-7"></path>
            </svg>
            Back to Staff
          </Button>
          <Button onClick={rotateTeamLevel}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
            {teamLevel}
          </Button>
        </ActionButtons>
      </Header>
      
      <div style={{ 
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '15px',
        gap: '15px',
        height: 'calc(100vh - 100px)',
        overflow: 'hidden'
      }}>
        {/* Filters Section */}
        <Card>
          <CardHeader>
            <h3>Filters</h3>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '14px' }}>Role</label>
                <select style={{ 
                  backgroundColor: '#333', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  border: '1px solid #444',
                  width: '180px'
                }}>
                  <option value="all">All Roles</option>
                  <option value="head">Head Coach</option>
                  <option value="assistant">Assistant Coach</option>
                  <option value="defense">Defense Coach</option>
                  <option value="goalie">Goalie Coach</option>
                  <option value="strength">Strength & Conditioning</option>
                </select>
              </div>
              
              <div style={{ marginLeft: 'auto' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '14px' }}>Search</label>
                <SearchInput placeholder="Search coaches..." />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Free Agent Coaches Table */}
        <Card>
          <CardHeader>
            <h3>Available Coaches</h3>
          </CardHeader>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHeader>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Age</th>
                    <th>Exp</th>
                    <th>Overall</th>
                    <th>Requested Years</th>
                    <th>Asking Salary</th>
                    <th>Interest</th>
                    <th>Specialties</th>
                    <th>Actions</th>
                  </tr>
                </TableHeader>
                <TableBody>
                  {freeAgentCoaches.map(coach => (
                    <tr key={coach.id}>
                      <td>{coach.name}</td>
                      <td>{coach.role}</td>
                      <td>{coach.age}</td>
                      <td>{coach.experience}</td>
                      <td>{coach.overall}</td>
                      <td>{coach.requestedYears} {coach.requestedYears === 1 ? 'year' : 'years'}</td>
                      <td>{coach.askingPrice}</td>
                      <td>
                        <span style={{ 
                          display: 'inline-block',
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          backgroundColor: coach.interest === 'High' ? '#4CAF50' : coach.interest === 'Medium' ? '#FFA500' : '#F44336',
                          marginRight: '5px'
                        }}></span>
                        {coach.interest}
                      </td>
                      <td>{coach.specialties.join(', ')}</td>
                      <td>
                        <Button primary className="small" onClick={() => handleOpenContractModal(coach)}>
                          Offer Contract
                        </Button>
                      </td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
        
        {/* Pending Offers */}
        <Card>
          <CardHeader>
            <h3>Pending Contract Offers</h3>
          </CardHeader>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHeader>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Age</th>
                    <th>Rating</th>
                    <th>Offered Terms</th>
                    <th>Annual Salary</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </TableHeader>
                <TableBody>
                  {pendingOffers.map(offer => (
                    <tr key={offer.id}>
                      <td>{offer.name}</td>
                      <td>{offer.role}</td>
                      <td>{offer.age}</td>
                      <td>{offer.rating}</td>
                      <td>{offer.offeredYears} {offer.offeredYears === 1 ? 'year' : 'years'}</td>
                      <td>{offer.annualSalary}</td>
                      <td>{offer.totalValue}</td>
                      <td>
                        <span style={{ 
                          color: offer.status === 'Likely to Accept' ? '#4CAF50' : offer.status === 'Considering' ? '#FFA500' : '#F44336'
                        }}>
                          {offer.status}
                        </span>
                      </td>
                      <td>
                        <Button className="small">
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default FreeAgentCoachesContent; 