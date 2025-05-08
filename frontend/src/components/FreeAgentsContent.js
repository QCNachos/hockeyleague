import React, { useState } from 'react';
import styled from 'styled-components';
import ContractOfferModal from './contracts/ContractOfferModal';

// Styling components
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #C4CED4;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 24px;
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
  padding: 10px 16px;
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
`;

const Card = styled.div`
  background-color: #252525;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
  margin-bottom: 20px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #333;
  
  h3 {
    margin: 0;
    color: #C4CED4;
    font-size: 18px;
  }
`;

const CardContent = styled.div`
  padding: 15px 20px;
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  th {
    text-align: left;
    padding: 10px;
    color: #C4CED4;
    font-size: 14px;
    font-weight: 500;
    border-bottom: 1px solid #333;
  }
`;

const TableBody = styled.tbody`
  tr {
    &:hover {
      background-color: rgba(255, 255, 255, 0.05);
    }
    
    td {
      padding: 10px;
      color: #fff;
      font-size: 14px;
      border-bottom: 1px solid #252525;
    }
  }
`;

const SearchInput = styled.input`
  background-color: #333;
  border: 1px solid #444;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  width: 250px;
  
  &::placeholder {
    color: #aaa;
  }
  
  &:focus {
    outline: none;
    border-color: #4a89dc;
  }
`;

const FilterButton = styled.button`
  background-color: #2d3748;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  
  &:hover {
    background-color: #3a4a61;
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const FreeAgentsContent = ({ teamLevel, rotateTeamLevel }) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showContractModal, setShowContractModal] = useState(false);

  const handleOpenContractModal = (player) => {
    setSelectedPlayer(player);
    setShowContractModal(true);
  };

  const handleCloseContractModal = () => {
    setShowContractModal(false);
  };

  const handleContractOffer = (contractData) => {
    console.log('Contract offered:', contractData);
    // Here you would implement API calls to submit the contract offer
    setShowContractModal(false);
  };

  const handleStartNegotiation = () => {
    console.log('Starting negotiation with:', selectedPlayer);
    // Here you would implement logic to start contract negotiations
    setShowContractModal(false);
  };

  return (
    <>
      <Header>
        <Title>Free Agents</Title>
        <ActionButtons>
          <Button onClick={rotateTeamLevel}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        padding: '20px',
        gap: '20px',
        overflowY: 'auto'
      }}>
        {/* Filters Section */}
        <Card>
          <CardHeader>
            <h3>Filters</h3>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '14px' }}>Position</label>
                <select style={{ 
                  backgroundColor: '#333', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  border: '1px solid #444',
                  width: '120px'
                }}>
                  <option value="all">All Positions</option>
                  <option value="c">Centers</option>
                  <option value="lw">Left Wings</option>
                  <option value="rw">Right Wings</option>
                  <option value="d">Defensemen</option>
                  <option value="g">Goalies</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '14px' }}>Age Range</label>
                <select style={{ 
                  backgroundColor: '#333', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  border: '1px solid #444',
                  width: '150px'
                }}>
                  <option value="all">All Ages</option>
                  <option value="young">Under 25</option>
                  <option value="prime">25-30</option>
                  <option value="veteran">Over 30</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '14px' }}>Overall Rating</label>
                <select style={{ 
                  backgroundColor: '#333', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  border: '1px solid #444',
                  width: '150px'
                }}>
                  <option value="all">All Ratings</option>
                  <option value="elite">85+</option>
                  <option value="great">80-84</option>
                  <option value="good">75-79</option>
                  <option value="average">70-74</option>
                  <option value="low">Under 70</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '14px' }}>Interest Level</label>
                <select style={{ 
                  backgroundColor: '#333', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  border: '1px solid #444',
                  width: '150px'
                }}>
                  <option value="all">All Interest</option>
                  <option value="high">High Interest</option>
                  <option value="medium">Medium Interest</option>
                  <option value="low">Low Interest</option>
                </select>
              </div>
              
              <div style={{ marginLeft: 'auto' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '14px' }}>Search</label>
                <SearchInput placeholder="Search free agents..." />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Free Agents Table */}
        <Card>
          <CardHeader>
            <h3>Available Free Agents</h3>
          </CardHeader>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHeader>
                  <tr>
                    <th>Player</th>
                    <th>Age</th>
                    <th>Position</th>
                    <th>OVR</th>
                    <th>POT</th>
                    <th>Requested Years</th>
                    <th>Requested Salary</th>
                    <th>Interest</th>
                    <th>Special Skills</th>
                    <th>Actions</th>
                  </tr>
                </TableHeader>
                <TableBody>
                  {[
                    { 
                      id: 1, 
                      firstName: 'John',
                      lastName: 'Klingberg', 
                      age: 31, 
                      position: 'D',
                      overall: 83, 
                      potential: 84, 
                      requestedYears: 2,
                      askingPrice: '4.2M', 
                      interest: 'High',
                      skills: ['Power Play', 'Puck Moving'],
                      number: '3',
                      shoots: 'RIGHT',
                      expiryStatus: 'UFA'
                    },
                    { 
                      id: 2, 
                      firstName: 'Paul',
                      lastName: 'Stastny', 
                      age: 37, 
                      position: 'C',
                      overall: 79, 
                      potential: 79, 
                      requestedYears: 1,
                      askingPrice: '2.1M', 
                      interest: 'Medium',
                      skills: ['Faceoffs', 'Playmaking'],
                      number: '26',
                      shoots: 'LEFT',
                      expiryStatus: 'UFA'
                    },
                    { 
                      id: 3, 
                      firstName: 'Jonathan',
                      lastName: 'Toews', 
                      age: 35, 
                      position: 'C',
                      overall: 82, 
                      potential: 82, 
                      requestedYears: 1,
                      askingPrice: '4.5M', 
                      interest: 'Low',
                      skills: ['Leadership', 'Two-way'],
                      number: '19',
                      shoots: 'LEFT',
                      expiryStatus: 'UFA'
                    },
                    { 
                      id: 4, 
                      firstName: 'Max',
                      lastName: 'Pacioretty', 
                      age: 34, 
                      position: 'LW',
                      overall: 81, 
                      potential: 81, 
                      requestedYears: 1,
                      askingPrice: '3.2M', 
                      interest: 'Medium',
                      skills: ['Shooting', 'Power Forward'],
                      number: '67',
                      shoots: 'RIGHT',
                      expiryStatus: 'UFA'
                    },
                    { 
                      id: 5, 
                      firstName: 'Joonas',
                      lastName: 'Korpisalo', 
                      age: 29, 
                      position: 'G',
                      overall: 83, 
                      potential: 85, 
                      requestedYears: 3,
                      askingPrice: '4.8M', 
                      interest: 'High',
                      skills: ['Reflexes', 'Positioning'],
                      number: '70',
                      shoots: 'LEFT',
                      expiryStatus: 'UFA'
                    },
                    { 
                      id: 6, 
                      firstName: 'Danton',
                      lastName: 'Heinen', 
                      age: 27, 
                      position: 'LW',
                      overall: 78, 
                      potential: 80, 
                      requestedYears: 2,
                      askingPrice: '1.8M', 
                      interest: 'High',
                      skills: ['Defensive Forward', 'Penalty Kill'],
                      number: '43',
                      shoots: 'LEFT',
                      expiryStatus: 'RFA'
                    },
                    { 
                      id: 7, 
                      firstName: 'Ethan',
                      lastName: 'Bear', 
                      age: 26, 
                      position: 'D',
                      overall: 77, 
                      potential: 81, 
                      requestedYears: 2,
                      askingPrice: '1.6M', 
                      interest: 'High',
                      skills: ['Shot Blocking', 'Mobility'],
                      number: '74',
                      shoots: 'RIGHT',
                      expiryStatus: 'RFA'
                    },
                    { 
                      id: 8, 
                      firstName: 'Jesse',
                      lastName: 'Puljujärvi', 
                      age: 25, 
                      position: 'RW',
                      overall: 78, 
                      potential: 83, 
                      requestedYears: 3,
                      askingPrice: '2.2M', 
                      interest: 'Medium',
                      skills: ['Size', 'Forechecking'],
                      number: '13',
                      shoots: 'LEFT',
                      expiryStatus: 'RFA'
                    }
                  ].map(player => (
                    <tr key={player.id}>
                      <td>{player.firstName} {player.lastName}</td>
                      <td>{player.age}</td>
                      <td>{player.position}</td>
                      <td>{player.overall}</td>
                      <td>{player.potential}</td>
                      <td>{player.requestedYears} {player.requestedYears === 1 ? 'year' : 'years'}</td>
                      <td>${player.askingPrice}</td>
                      <td>
                        <span style={{ 
                          display: 'inline-block',
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          backgroundColor: 
                            player.interest === 'High' ? '#4CAF50' : 
                            player.interest === 'Medium' ? '#FFA500' : 
                            '#F44336',
                          marginRight: '5px'
                        }}></span>
                        {player.interest}
                      </td>
                      <td>
                        {player.skills.join(', ')}
                      </td>
                      <td>
                        <Button 
                          primary 
                          small
                          onClick={() => handleOpenContractModal(player)}
                        >
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
        
        {/* Current Offers */}
        <Card>
          <CardHeader>
            <h3>Pending Contract Offers</h3>
          </CardHeader>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHeader>
                  <tr>
                    <th>Player</th>
                    <th>Position</th>
                    <th>Age</th>
                    <th>OVR</th>
                    <th>Offered Terms</th>
                    <th>Annual Salary</th>
                    <th>Total Value</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </TableHeader>
                <TableBody>
                  {[
                    { 
                      id: 1, 
                      name: 'Ethan Bear', 
                      position: 'D', 
                      age: 26, 
                      overall: 77,
                      offeredYears: 3,
                      annualSalary: '$1.5M',
                      totalValue: '$4.5M',
                      status: 'Considering'
                    },
                    { 
                      id: 2, 
                      name: 'Danton Heinen', 
                      position: 'LW', 
                      age: 27, 
                      overall: 78,
                      offeredYears: 2,
                      annualSalary: '$1.65M',
                      totalValue: '$3.3M',
                      status: 'Likely to Accept'
                    },
                    { 
                      id: 3, 
                      name: 'Joonas Korpisalo', 
                      position: 'G', 
                      age: 29, 
                      overall: 83,
                      offeredYears: 2,
                      annualSalary: '$4.2M',
                      totalValue: '$8.4M',
                      status: 'Likely to Reject'
                    }
                  ].map(offer => (
                    <tr key={offer.id}>
                      <td>{offer.name}</td>
                      <td>{offer.position}</td>
                      <td>{offer.age}</td>
                      <td>{offer.overall}</td>
                      <td>{offer.offeredYears} year{offer.offeredYears > 1 ? 's' : ''}</td>
                      <td>{offer.annualSalary}</td>
                      <td>{offer.totalValue}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          backgroundColor: offer.status === 'Likely to Accept' ? '#2a503333' : (offer.status === 'Considering' ? '#2a334799' : '#4a202033'),
                          color: offer.status === 'Likely to Accept' ? '#81c784' : (offer.status === 'Considering' ? '#90caf9' : '#e57373'),
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {offer.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button style={{ 
                            backgroundColor: '#2d3748', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            padding: '4px 8px', 
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}>
                            Edit
                          </button>
                          <button style={{ 
                            backgroundColor: '#47292d', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            padding: '4px 8px', 
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}>
                            Withdraw
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
        
        {/* Salary Cap Information */}
        <Card>
          <CardHeader>
            <h3>Salary Cap Information</h3>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '300px', flex: '1' }}>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#C4CED4', margin: '0 0 5px 0' }}>Current Salary Cap</h4>
                  <div style={{ height: '10px', backgroundColor: '#333', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '76%', backgroundColor: '#B30E16' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                    <span style={{ color: '#aaa', fontSize: '12px' }}>$62.8M / $82.5M</span>
                    <span style={{ color: '#aaa', fontSize: '12px' }}>$19.7M available</span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#C4CED4', margin: '0 0 5px 0' }}>Roster Size</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '14px' }}>
                    <span style={{ color: '#aaa' }}>Current NHL Roster:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>21 / 23 players</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '14px' }}>
                    <span style={{ color: '#aaa' }}>Total Contract Slots:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>42 / 50 contracts</span>
                  </div>
                </div>
              </div>
              
              <div style={{ minWidth: '300px', flex: '1' }}>
                <h4 style={{ color: '#C4CED4', margin: '0 0 10px 0' }}>Current Offers Impact</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#aaa' }}>Total Pending Offers:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>3</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#aaa' }}>Combined Cap Hit:</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>$7.35M</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#aaa' }}>Projected Cap Space (if all accepted):</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>$12.35M</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showContractModal && (
        <ContractOfferModal 
          player={selectedPlayer} 
          onClose={handleCloseContractModal}
          onBack={handleCloseContractModal}
          onOffer={handleContractOffer}
          onStartNegotiation={handleStartNegotiation}
        />
      )}
    </>
  );
};

export default FreeAgentsContent; 