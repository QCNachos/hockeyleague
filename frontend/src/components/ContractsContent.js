import React from 'react';
import styled from 'styled-components';

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

const ContractsContent = ({ teamLevel, rotateTeamLevel }) => {
  return (
    <>
      <Header>
        <Title>Contracts</Title>
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
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '14px' }}>Contract Type</label>
                <select style={{ 
                  backgroundColor: '#333', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  border: '1px solid #444',
                  width: '150px'
                }}>
                  <option value="all">All Types</option>
                  <option value="1way">1-Way</option>
                  <option value="2way">2-Way</option>
                  <option value="elc">Entry Level</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '14px' }}>Contract Status</label>
                <select style={{ 
                  backgroundColor: '#333', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  border: '1px solid #444',
                  width: '150px'
                }}>
                  <option value="all">All Status</option>
                  <option value="current">Active</option>
                  <option value="expiring">Expiring</option>
                  <option value="unsigned">Need Extension</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '14px' }}>Future Status</label>
                <select style={{ 
                  backgroundColor: '#333', 
                  color: 'white', 
                  padding: '8px 12px', 
                  borderRadius: '4px',
                  border: '1px solid #444',
                  width: '150px'
                }}>
                  <option value="all">All</option>
                  <option value="ufa">UFA</option>
                  <option value="rfa">RFA</option>
                </select>
              </div>
              
              <div style={{ marginLeft: 'auto' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#aaa', fontSize: '14px' }}>Search</label>
                <SearchInput placeholder="Search players..." />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Contracts Table */}
        <Card>
          <CardHeader>
            <h3>Player Contracts</h3>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14"></path>
                  <path d="M5 12h14"></path>
                </svg>
                Create New Contract
              </Button>
            </div>
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
                    <th>POT</th>
                    <th>Type</th>
                    <th>Years</th>
                    <th>AAV</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </TableHeader>
                <TableBody>
                  {[
                    { 
                      id: 1, 
                      name: 'Elias Pettersson', 
                      position: 'C', 
                      age: 25, 
                      overall: 89, 
                      potential: 92, 
                      type: '1-Way', 
                      years: [
                        { year: '2024-25', salary: '$8.5M', status: 'Active' },
                        { year: '2025-26', salary: '$8.5M', status: 'Active' },
                        { year: '2026-27', salary: '$8.5M', status: 'Active' },
                        { year: '2027-28', salary: '$8.5M', status: 'Active' },
                        { year: '2028-29', salary: 'UFA', status: 'UFA' }
                      ],
                      aav: '$8.5M',
                      total: '$34M',
                      futureStatus: 'UFA'
                    },
                    { 
                      id: 2, 
                      name: 'Quinn Hughes', 
                      position: 'D', 
                      age: 24, 
                      overall: 90, 
                      potential: 94, 
                      type: '1-Way', 
                      years: [
                        { year: '2024-25', salary: '$7.85M', status: 'Active' },
                        { year: '2025-26', salary: '$7.85M', status: 'Active' },
                        { year: '2026-27', salary: '$7.85M', status: 'Active' },
                        { year: '2027-28', salary: '$7.85M', status: 'Active' },
                        { year: '2028-29', salary: '$7.85M', status: 'Active' },
                        { year: '2029-30', salary: 'UFA', status: 'UFA' }
                      ],
                      aav: '$7.85M',
                      total: '$39.25M',
                      futureStatus: 'UFA'
                    },
                    { 
                      id: 3, 
                      name: 'Thatcher Demko', 
                      position: 'G', 
                      age: 28, 
                      overall: 87, 
                      potential: 89, 
                      type: '1-Way', 
                      years: [
                        { year: '2024-25', salary: '$5M', status: 'Active' },
                        { year: '2025-26', salary: '$5M', status: 'Active' },
                        { year: '2026-27', salary: 'UFA', status: 'UFA' }
                      ],
                      aav: '$5M',
                      total: '$10M',
                      futureStatus: 'UFA'
                    },
                    { 
                      id: 4, 
                      name: 'J.T. Miller', 
                      position: 'C', 
                      age: 31, 
                      overall: 86, 
                      potential: 86, 
                      type: '1-Way', 
                      years: [
                        { year: '2024-25', salary: '$8M', status: 'Active' },
                        { year: '2025-26', salary: '$8M', status: 'Active' },
                        { year: '2026-27', salary: '$8M', status: 'Active' },
                        { year: '2027-28', salary: '$8M', status: 'Active' },
                        { year: '2028-29', salary: '$8M', status: 'Active' },
                        { year: '2029-30', salary: '$8M', status: 'Active' },
                        { year: '2030-31', salary: 'UFA', status: 'UFA' }
                      ],
                      aav: '$8M',
                      total: '$48M',
                      futureStatus: 'UFA'
                    },
                    { 
                      id: 5, 
                      name: 'Filip Hronek', 
                      position: 'D', 
                      age: 26, 
                      overall: 83, 
                      potential: 85, 
                      type: '1-Way', 
                      years: [
                        { year: '2024-25', salary: '$4.75M', status: 'Active' },
                        { year: '2025-26', salary: 'RFA', status: 'RFA' }
                      ],
                      aav: '$4.75M',
                      total: '$4.75M',
                      futureStatus: 'RFA'
                    },
                    { 
                      id: 6, 
                      name: 'Arturs Silovs', 
                      position: 'G', 
                      age: 23, 
                      overall: 75, 
                      potential: 82, 
                      type: '2-Way', 
                      years: [
                        { year: '2024-25', salary: '$775K/$150K', status: 'Active' },
                        { year: '2025-26', salary: 'RFA', status: 'RFA' }
                      ],
                      aav: '$775K',
                      total: '$775K',
                      futureStatus: 'RFA'
                    },
                    { 
                      id: 7, 
                      name: 'Jonathan Lekkerimäki', 
                      position: 'RW', 
                      age: 20, 
                      overall: 73, 
                      potential: 88, 
                      type: 'ELC', 
                      years: [
                        { year: '2024-25', salary: '$925K/$82.5K', status: 'Active' },
                        { year: '2025-26', salary: '$925K/$82.5K', status: 'Active' },
                        { year: '2026-27', salary: '$925K/$82.5K', status: 'Active' },
                        { year: '2027-28', salary: 'RFA', status: 'RFA' }
                      ],
                      aav: '$925K',
                      total: '$2.775M',
                      futureStatus: 'RFA'
                    }
                  ].map(player => (
                    <tr key={player.id}>
                      <td style={{ fontWeight: 'bold' }}>{player.name}</td>
                      <td>{player.position}</td>
                      <td>{player.age}</td>
                      <td>{player.overall}</td>
                      <td style={{ color: player.potential > player.overall ? '#4caf50' : '#aaa' }}>
                        {player.potential}
                      </td>
                      <td>{player.type}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {player.years.map((year, index) => (
                            <div key={index} style={{ 
                              width: '20px', 
                              height: '20px', 
                              background: year.status === 'Active' ? '#294f2a' : (year.status === 'RFA' ? '#b7791f' : '#472927'), 
                              color: 'white',
                              borderRadius: '2px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}>
                              {year.status === 'Active' ? (index+1) : (year.status === 'RFA' ? 'R' : 'U')}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>{player.aav}</td>
                      <td>{player.total}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '4px', 
                          backgroundColor: player.futureStatus === 'RFA' ? '#b7791f33' : '#47292733',
                          color: player.futureStatus === 'RFA' ? '#f6ad55' : '#f56565',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {player.futureStatus}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button style={{ 
                            backgroundColor: '#394b6a', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            padding: '4px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px'
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="12" y1="8" x2="12" y2="16"></line>
                              <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                          </button>
                          <button style={{ 
                            backgroundColor: '#2d3748', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            padding: '4px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px'
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M12 20h9"></path>
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
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
        
        {/* Salary Cap Summary */}
        <Card>
          <CardHeader>
            <h3>Salary Cap Summary (2024-25 Season)</h3>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ minWidth: '200px', flex: '1' }}>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#C4CED4', margin: '0 0 5px 0' }}>NHL Salary Cap</h4>
                  <div style={{ height: '10px', backgroundColor: '#333', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '78%', backgroundColor: '#B30E16' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                    <span style={{ color: '#aaa', fontSize: '12px' }}>$63.4M / $82.5M</span>
                    <span style={{ color: '#aaa', fontSize: '12px' }}>$19.1M available</span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#C4CED4', margin: '0 0 5px 0' }}>AHL Salary Commitment</h4>
                  <div style={{ height: '10px', backgroundColor: '#333', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '45%', backgroundColor: '#394b6a' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                    <span style={{ color: '#aaa', fontSize: '12px' }}>$2.7M</span>
                    <span style={{ color: '#aaa', fontSize: '12px' }}>12 players</span>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ color: '#C4CED4', margin: '0 0 5px 0' }}>Projected Salary Cap (2025-26)</h4>
                  <div style={{ height: '10px', backgroundColor: '#333', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '68%', backgroundColor: '#805ad5' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                    <span style={{ color: '#aaa', fontSize: '12px' }}>$58.1M / $85.5M</span>
                    <span style={{ color: '#aaa', fontSize: '12px' }}>$27.4M projected space</span>
                  </div>
                </div>
              </div>
              
              <div style={{ minWidth: '200px', flex: '1' }}>
                <h4 style={{ color: '#C4CED4', margin: '0 0 10px 0' }}>Contract Breakdown</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#aaa' }}>NHL Contracts (1-Way)</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>18 players</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#aaa' }}>2-Way Contracts</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>14 players</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#aaa' }}>Entry Level Contracts</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>6 players</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#aaa' }}>Total Active Contracts</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>38 / 50</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid #333', paddingTop: '10px' }}>
                    <span style={{ color: '#aaa' }}>Expiring This Season</span>
                    <span style={{ color: '#f6ad55', fontWeight: 'bold' }}>8 players</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#aaa' }}>Becoming UFA</span>
                    <span style={{ color: '#f56565', fontWeight: 'bold' }}>3 players</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#aaa' }}>Becoming RFA</span>
                    <span style={{ color: '#f6ad55', fontWeight: 'bold' }}>5 players</span>
                  </div>
                </div>
              </div>
              
              <div style={{ minWidth: '200px', flex: '1' }}>
                <h4 style={{ color: '#C4CED4', margin: '0 0 10px 0' }}>Top Cap Hits</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#fff' }}>J.T. Miller (C)</span>
                    <span style={{ color: '#f56565', fontWeight: 'bold' }}>$8.5M</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#fff' }}>Elias Pettersson (C)</span>
                    <span style={{ color: '#f56565', fontWeight: 'bold' }}>$8.5M</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#fff' }}>Quinn Hughes (D)</span>
                    <span style={{ color: '#f56565', fontWeight: 'bold' }}>$7.85M</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#fff' }}>Bo Horvat (C)</span>
                    <span style={{ color: '#f56565', fontWeight: 'bold' }}>$5.5M</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#fff' }}>Thatcher Demko (G)</span>
                    <span style={{ color: '#f56565', fontWeight: 'bold' }}>$5M</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ContractsContent; 