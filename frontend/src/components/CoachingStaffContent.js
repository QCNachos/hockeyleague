import React, { useState } from 'react';
import styled from 'styled-components';
import FreeAgentCoachesContent from './FreeAgentCoachesContent';

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
`;

const Card = styled.div`
  background-color: #252525;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #333;
  margin-bottom: 15px;
  height: ${props => props.fullHeight ? 'calc(100vh - 180px)' : 'auto'};
  display: flex;
  flex-direction: column;
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
  overflow-y: auto;
  flex: 1;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #333;
  margin-bottom: 15px;
`;

const Tab = styled.div`
  padding: 10px 20px;
  cursor: pointer;
  color: ${props => props.active ? '#C4CED4' : '#888'};
  font-weight: ${props => props.active ? '600' : '400'};
  border-bottom: 3px solid ${props => props.active ? '#B30E16' : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    color: #C4CED4;
    background-color: #2a2a2a;
  }
`;

const CoachCard = styled.div`
  background-color: #1e1e1e;
  border-radius: 6px;
  padding: 10px;
  display: grid;
  grid-template-columns: 55px 1fr;
  gap: 10px;
  margin-bottom: 8px;
`;

const CoachAvatar = styled.div`
  width: 55px;
  height: 55px;
  border-radius: 50%;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #C4CED4;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CoachInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const CoachName = styled.h4`
  margin: 0 0 3px 0;
  font-size: 16px;
  color: #C4CED4;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .actions {
    display: flex;
    gap: 8px;
  }
  
  .action-btn {
    background-color: #333;
    color: #C4CED4;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 11px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #444;
    }
    
    &.fire {
      background-color: #B30E16;
      color: white;
      
      &:hover {
        background-color: #950b12;
      }
    }
  }
`;

const CoachRole = styled.div`
  color: #aaa;
  font-size: 13px;
  margin-bottom: 6px;
`;

const CoachSkillsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
`;

const SkillCircleContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  position: relative;
  margin-top: 10px;
  padding-bottom: 0;
  
  .divider {
    position: absolute;
    top: 0;
    left: calc(17% - 1px);
    width: 1px;
    height: 100%;
    background-color: #444;
  }
  
  .overall-section {
    width: 16%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .skills-section {
    width: 83%;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 0;
  }
`;

const SkillCircle = styled.div`
  position: relative;
  width: ${props => props.isOverall ? '55px' : '45px'};
  height: ${props => props.isOverall ? '55px' : '45px'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${props => props.isOverall ? '0' : '3px 2px'};
  
  .skill-label {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    color: #aaa;
    font-size: 9px;
    white-space: nowrap;
  }
  
  .circle-value {
    font-size: ${props => props.isOverall ? '22px' : '16px'};
    font-weight: bold;
    color: ${props => {
      switch(props.grade) {
        case 'A+': return '#4CAF50';
        case 'A': return '#66BB6A';
        case 'A-': return '#81C784';
        case 'B+': return '#8BC34A';
        case 'B': return '#9CCC65';
        case 'B-': return '#AED581';
        case 'C+': return '#FFC107';
        case 'C': return '#FFD54F';
        case 'C-': return '#FFE082';
        case 'D+': return '#FF9800';
        case 'D': return '#FFB74D';
        default: return '#F44336';
      }
    }};
    z-index: 2;
  }
  
  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }
  
  circle {
    fill: none;
    stroke-width: ${props => props.isOverall ? '6' : '5'};
    stroke-linecap: round;
    
    &.background {
      stroke: #333;
    }
    
    &.progress {
      stroke: ${props => {
        switch(props.grade) {
          case 'A+': return '#4CAF50';
          case 'A': return '#66BB6A';
          case 'A-': return '#81C784';
          case 'B+': return '#8BC34A';
          case 'B': return '#9CCC65';
          case 'B-': return '#AED581';
          case 'C+': return '#FFC107';
          case 'C': return '#FFD54F';
          case 'C-': return '#FFE082';
          case 'D+': return '#FF9800';
          case 'D': return '#FFB74D';
          default: return '#F44336';
        }
      }};
      stroke-dasharray: ${props => props.percentage * (props.isOverall ? 1.6 : 1.3)}, ${props => props.isOverall ? 160 : 130};
      transition: stroke-dasharray 0.5s ease;
    }
  }
`;

const ContractInfo = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid #333;
  
  .info-item {
    .label {
      color: #aaa;
      font-size: 9px;
      margin-bottom: 1px;
    }
    
    .value {
      font-size: 11px;
      color: #C4CED4;
    }
  }
`;

const EventCard = styled.div`
  background-color: #1e1e1e;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  
  .event-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    .event-date {
      font-size: 11px;
      color: #aaa;
    }
  }
  
  .event-title {
    color: #C4CED4;
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 14px;
  }
  
  .event-description {
    color: #aaa;
    font-size: 12px;
  }
  
  .event-impact {
    margin-top: 8px;
    font-size: 11px;
    
    &.positive {
      color: #4CAF50;
    }
    
    &.negative {
      color: #F44336;
    }
    
    &.neutral {
      color: #FFC107;
    }
  }
`;

const StrategySection = styled.div`
  margin-bottom: 16px;
  
  .strategy-header {
    font-size: 16px;
    color: #C4CED4;
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
  
  .strategy-description {
    color: #aaa;
    font-size: 14px;
    margin-bottom: 12px;
  }
`;

const StrategySelector = styled.div`
  display: flex;
  background-color: #1e1e1e;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 16px;
  height: 42px;
`;

const StrategyOption = styled.div`
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  color: ${props => props.selected ? '#C4CED4' : '#888'};
  background-color: ${props => props.selected ? '#333' : 'transparent'};
  border-bottom: 3px solid ${props => props.selected ? '#B30E16' : 'transparent'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: ${props => props.selected ? '#333' : '#252525'};
  }
`;

const ContentRow = styled.div`
  display: flex;
  gap: 15px;
  height: calc(100vh - 180px);
`;

const ContentColumn = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

// Helper function to convert numeric value to letter grade
const getLetterGrade = (value) => {
  if (value >= 95) return 'A+';
  if (value >= 90) return 'A';
  if (value >= 85) return 'A-';
  if (value >= 80) return 'B+';
  if (value >= 75) return 'B';
  if (value >= 70) return 'B-';
  if (value >= 65) return 'C+';
  if (value >= 60) return 'C';
  if (value >= 55) return 'C-';
  if (value >= 50) return 'D+';
  if (value >= 45) return 'D';
  return 'F';
};

// Helper function to get percentage fill for circle based on grade
const getGradePercentage = (grade) => {
  switch(grade) {
    case 'A+': return 100;
    case 'A': return 95;
    case 'A-': return 90;
    case 'B+': return 85;
    case 'B': return 80;
    case 'B-': return 75;
    case 'C+': return 70;
    case 'C': return 65;
    case 'C-': return 60;
    case 'D+': return 55;
    case 'D': return 50;
    case 'F': return 40;
    default: return 0;
  }
};

// Skill circle component
const SkillGradeCircle = ({ label, grade, isOverall = false }) => {
  const percentage = getGradePercentage(grade);
  const radius = isOverall ? 22 : 18;
  const centerPoint = isOverall ? 27.5 : 22.5;
  
  return (
    <SkillCircle grade={grade} percentage={percentage} isOverall={isOverall}>
      <div className="skill-label">{label}</div>
      <div className="circle-value">{grade}</div>
      <svg>
        <circle 
          className="background"
          cx={centerPoint} 
          cy={centerPoint} 
          r={radius} 
        />
        <circle 
          className="progress"
          cx={centerPoint} 
          cy={centerPoint} 
          r={radius} 
        />
      </svg>
    </SkillCircle>
  );
};

const CoachingStaffContent = ({ teamLevel, rotateTeamLevel }) => {
  const [activeTab, setActiveTab] = useState('staff');
  const [showFreeAgentCoaches, setShowFreeAgentCoaches] = useState(false);
  
  // Mock coach data with letter grades
  const coaches = [
    {
      id: 1,
      name: 'Bruce Boudreau',
      role: 'Head Coach',
      skills: {
        overall: 'B+',
        offense: 'A',
        defense: 'B',
        teaching: 'B+',
        goalie: 'B+',
        team_morale: 'C+',
        physicality: 'A'
      },
      contract: {
        years: 3,
        yearsRemaining: 2,
        salary: '$4.2M',
        noFire: true
      }
    },
    {
      id: 2,
      name: 'Travis Green',
      role: 'Assistant Coach',
      skills: {
        overall: 'B',
        offense: 'B+',
        defense: 'A',
        teaching: 'B',
        goalie: 'B',
        team_morale: 'B',
        physicality: 'B'
      },
      contract: {
        years: 2,
        yearsRemaining: 1,
        salary: '$1.8M',
        noFire: false
      }
    },
    {
      id: 3,
      name: 'Scott Stevens',
      role: 'Defense Coach',
      skills: {
        overall: 'B+',
        offense: 'B+',
        defense: 'B',
        teaching: 'C+',
        goalie: 'B',
        team_morale: 'A',
        physicality: 'A'
      },
      contract: {
        years: 2,
        yearsRemaining: 2,
        salary: '$1.5M',
        noFire: false
      }
    },
    {
      id: 4,
      name: 'Roberto Luongo',
      role: 'Goalie Coach',
      skills: {
        overall: 'A-',
        offense: 'A',
        defense: 'B+',
        teaching: 'B',
        goalie: 'A',
        team_morale: 'A+',
        physicality: 'C+'
      },
      contract: {
        years: 3,
        yearsRemaining: 3,
        salary: '$1.3M',
        noFire: false
      }
    },
    {
      id: 5,
      name: 'Mark Johnson',
      role: 'Strength & Conditioning Coach',
      skills: {
        conditioning: 86,
        injury: 82,
        recovery: 88,
        nutrition: 75,
        rehabilitation: 80
      },
      contract: {
        years: 2,
        yearsRemaining: 1,
        salary: '$950K',
        noFire: false
      }
    },
    {
      id: 6,
      name: 'Dr. Sarah Chen',
      role: 'Team Physician',
      skills: {
        diagnosis: 92,
        treatment: 88,
        preventativeCare: 85,
        recovery: 90,
        rehabilitation: 84
      },
      contract: {
        years: 4,
        yearsRemaining: 3,
        salary: '$1.1M',
        noFire: false
      }
    }
  ];
  
  // Mock coaching events
  const coachEvents = [
    {
      id: 1,
      date: 'Nov 15, 2024',
      title: 'Head Coach Intervention',
      description: 'Bruce Boudreau held an impromptu team meeting after three consecutive losses to address defensive lapses. Players responded with increased commitment in practice.',
      impact: 'Team morale increased by 5%',
      type: 'positive'
    },
    {
      id: 2,
      date: 'Nov 12, 2024',
      title: 'Goalie Coach Special Session',
      description: 'Roberto Luongo worked one-on-one with starting goalie on rebound control, showing immediate results in the next game.',
      impact: 'Goalie save percentage improved by 0.8%',
      type: 'positive'
    },
    {
      id: 3,
      date: 'Nov 8, 2024',
      title: 'Disagreement Among Coaching Staff',
      description: 'Assistant coach and defense coach had conflicting views on penalty kill strategy, leading to confusion during implementation.',
      impact: 'Penalty kill efficiency decreased by 2%',
      type: 'negative'
    },
    {
      id: 4,
      date: 'Nov 5, 2024',
      title: 'Strength & Conditioning Program Update',
      description: 'Mark Johnson implemented a new recovery protocol on travel days that has helped reduce fatigue.',
      impact: 'Player stamina improved in back-to-back games',
      type: 'positive'
    },
    {
      id: 5,
      date: 'Oct 30, 2024',
      title: 'Team Doctor Injury Prevention',
      description: 'Dr. Chen identified early signs of groin issues in two defensemen and prescribed preventative treatment.',
      impact: 'Prevented two potential injuries',
      type: 'positive'
    },
    {
      id: 6,
      date: 'Oct 25, 2024',
      title: 'Scott Stevens Defense Drill',
      description: 'Implemented new gap control drills that have improved defensive zone coverage.',
      impact: 'Goals against decreased by 0.5 per game',
      type: 'positive'
    },
    {
      id: 7,
      date: 'Oct 18, 2024',
      title: 'Head Coach System Change',
      description: 'Coach changed forecheck strategy mid-game, leading to confusion among forwards.',
      impact: 'Lost 2-goal lead in third period',
      type: 'negative'
    }
  ];
  
  // Strategy settings
  const [forecheck, setForecheck] = useState('balanced');
  const [backcheck, setBackcheck] = useState('defensive');
  const [powerPlay, setPowerPlay] = useState('umbrella');
  const [penaltyKill, setPenaltyKill] = useState('box');
  const [offensiveZone, setOffensiveZone] = useState('cycle');
  const [defensiveZone, setDefensiveZone] = useState('collapsing');
  const [breakout, setBreakout] = useState('controlled');
  const [coaching, setCoaching] = useState('balanced');
  
  const [showCoachModal, setShowCoachModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);
  
  const handleShowFreeAgentCoaches = () => {
    setShowFreeAgentCoaches(true);
  };
  
  const handleReturnToStaff = () => {
    setShowFreeAgentCoaches(false);
  };
  
  const handleOpenContractModal = (coach) => {
    setSelectedCoach(coach);
    setShowCoachModal(true);
  };
  
  const handleCloseContractModal = () => {
    setShowCoachModal(false);
  };
  
  const handleExtendContract = (coach) => {
    console.log('Extending contract for:', coach.name);
    // Logic to extend contract would go here
  };
  
  const handleFireCoach = (coach) => {
    console.log('Firing coach:', coach.name);
    // Logic to fire coach would go here
  };
  
  const renderCoachSkills = (coach) => {
    return (
      <SkillCircleContainer>
        <div className="divider"></div>
        <div className="overall-section">
          <SkillGradeCircle 
            key="overall" 
            label="Overall" 
            grade={coach.skills.overall}
            isOverall={true}
          />
        </div>
        <div className="skills-section">
          <SkillGradeCircle label="Offense" grade={coach.skills.offense} />
          <SkillGradeCircle label="Defense" grade={coach.skills.defense} />
          <SkillGradeCircle label="Teaching" grade={coach.skills.teaching} />
          <SkillGradeCircle label="Goalie" grade={coach.skills.goalie} />
          <SkillGradeCircle label="Team Morale" grade={coach.skills.team_morale} />
          <SkillGradeCircle label="Physicality" grade={coach.skills.physicality} />
        </div>
      </SkillCircleContainer>
    );
  };
  
  const renderStaffManagement = () => {
    return (
      <Card fullHeight>
        <CardHeader>
          <h3>Coaching Staff</h3>
          <Button primary onClick={handleShowFreeAgentCoaches}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Hire New Coach
          </Button>
        </CardHeader>
        <CardContent>
          {coaches.map(coach => (
            <CoachCard key={coach.id}>
              <CoachAvatar>
                {coach.name.split(' ').map(n => n[0]).join('')}
              </CoachAvatar>
              <CoachInfo>
                <CoachName>
                  {coach.name}
                  <div className="actions">
                    <button className="action-btn" onClick={() => handleExtendContract(coach)}>
                      Extend Contract
                    </button>
                    {!coach.contract.noFire && (
                      <button className="action-btn fire" onClick={() => handleFireCoach(coach)}>
                        Fire Coach
                      </button>
                    )}
                  </div>
                </CoachName>
                <CoachRole>{coach.role}</CoachRole>
                
                {renderCoachSkills(coach)}
                
                <ContractInfo>
                  <div className="info-item">
                    <div className="label">CONTRACT</div>
                    <div className="value">{coach.contract.years} {coach.contract.years > 1 ? 'years' : 'year'}</div>
                  </div>
                  <div className="info-item">
                    <div className="label">REMAINING</div>
                    <div className="value">{coach.contract.yearsRemaining} {coach.contract.yearsRemaining > 1 ? 'years' : 'year'}</div>
                  </div>
                  <div className="info-item">
                    <div className="label">SALARY</div>
                    <div className="value">{coach.contract.salary}/year</div>
                  </div>
                  {coach.contract.noFire && (
                    <div className="info-item" style={{ color: '#FFC107' }}>
                      <div className="label">PROTECTION</div>
                      <div className="value">No-Fire Clause</div>
                    </div>
                  )}
                </ContractInfo>
              </CoachInfo>
            </CoachCard>
          ))}
        </CardContent>
      </Card>
    );
  };
  
  const renderCoachEvents = () => {
    return (
      <Card fullHeight>
        <CardHeader>
          <h3>Coaching Events</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4CAF50' }}></div>
              <span style={{ fontSize: '11px', color: '#aaa' }}>Positive</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F44336' }}></div>
              <span style={{ fontSize: '11px', color: '#aaa' }}>Negative</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFC107' }}></div>
              <span style={{ fontSize: '11px', color: '#aaa' }}>Neutral</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {coachEvents.map(event => (
            <EventCard key={event.id}>
              <div className="event-header">
                <div className="event-title">{event.title}</div>
                <div className="event-date">{event.date}</div>
              </div>
              <div className="event-description">{event.description}</div>
              <div className={`event-impact ${event.type}`}>
                {event.impact}
              </div>
            </EventCard>
          ))}
        </CardContent>
      </Card>
    );
  };
  
  const renderTeamStrategy = () => {
    return (
      <Card fullHeight>
        <CardHeader>
          <h3>Team Strategy</h3>
          <Button primary>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            Save Strategy
          </Button>
        </CardHeader>
        <CardContent>
          <div style={{ marginBottom: '16px', color: '#aaa', fontSize: '14px' }}>
            Configure your team's strategic approach for different game situations. Your head coach Bruce Boudreau (MOT: B, TAC: B+) will implement these strategies.
          </div>
          
          {/* Forecheck Strategy */}
          <StrategySection>
            <div className="strategy-header">Forecheck Strategy</div>
            <div className="strategy-description">
              Controls how aggressively your forwards pressure the opposing team in their defensive zone.
            </div>
            <StrategySelector>
              <StrategyOption 
                selected={forecheck === 'aggressive'} 
                onClick={() => setForecheck('aggressive')}
              >
                Aggressive
              </StrategyOption>
              <StrategyOption 
                selected={forecheck === 'balanced'} 
                onClick={() => setForecheck('balanced')}
              >
                Balanced
              </StrategyOption>
              <StrategyOption 
                selected={forecheck === 'defensive'} 
                onClick={() => setForecheck('defensive')}
              >
                Defensive
              </StrategyOption>
              <StrategyOption 
                selected={forecheck === 'trap'} 
                onClick={() => setForecheck('trap')}
              >
                1-3-1
              </StrategyOption>
            </StrategySelector>
          </StrategySection>
          
          {/* Backcheck Strategy */}
          <StrategySection>
            <div className="strategy-header">Backcheck Strategy</div>
            <div className="strategy-description">
              Defines how your forwards return to defend when the opponent has possession.
            </div>
            <StrategySelector>
              <StrategyOption 
                selected={backcheck === 'aggressive'} 
                onClick={() => setBackcheck('aggressive')}
              >
                Aggressive
              </StrategyOption>
              <StrategyOption 
                selected={backcheck === 'balanced'} 
                onClick={() => setBackcheck('balanced')}
              >
                Balanced
              </StrategyOption>
              <StrategyOption 
                selected={backcheck === 'defensive'} 
                onClick={() => setBackcheck('defensive')}
              >
                Defensive
              </StrategyOption>
              <StrategyOption 
                selected={backcheck === 'passive'} 
                onClick={() => setBackcheck('passive')}
              >
                Passive
              </StrategyOption>
            </StrategySelector>
          </StrategySection>
          
          {/* Power Play Strategy */}
          <StrategySection>
            <div className="strategy-header">Power Play Strategy</div>
            <div className="strategy-description">
              Formation and approach when your team has a player advantage.
            </div>
            <StrategySelector>
              <StrategyOption 
                selected={powerPlay === 'umbrella'} 
                onClick={() => setPowerPlay('umbrella')}
              >
                Umbrella
              </StrategyOption>
              <StrategyOption 
                selected={powerPlay === '1-3-1'} 
                onClick={() => setPowerPlay('1-3-1')}
              >
                1-3-1
              </StrategyOption>
              <StrategyOption 
                selected={powerPlay === 'overload'} 
                onClick={() => setPowerPlay('overload')}
              >
                Overload
              </StrategyOption>
              <StrategyOption 
                selected={powerPlay === 'shooting'} 
                onClick={() => setPowerPlay('shooting')}
              >
                Shooting
              </StrategyOption>
            </StrategySelector>
          </StrategySection>
          
          {/* Penalty Kill Strategy */}
          <StrategySection>
            <div className="strategy-header">Penalty Kill Strategy</div>
            <div className="strategy-description">
              Formation and approach when defending with a player disadvantage.
            </div>
            <StrategySelector>
              <StrategyOption 
                selected={penaltyKill === 'box'} 
                onClick={() => setPenaltyKill('box')}
              >
                Box
              </StrategyOption>
              <StrategyOption 
                selected={penaltyKill === 'diamond'} 
                onClick={() => setPenaltyKill('diamond')}
              >
                Diamond
              </StrategyOption>
              <StrategyOption 
                selected={penaltyKill === 'aggressive'} 
                onClick={() => setPenaltyKill('aggressive')}
              >
                Aggressive
              </StrategyOption>
              <StrategyOption 
                selected={penaltyKill === 'passive'} 
                onClick={() => setPenaltyKill('passive')}
              >
                Passive
              </StrategyOption>
            </StrategySelector>
          </StrategySection>
          
          {/* Offensive Zone Strategy */}
          <StrategySection>
            <div className="strategy-header">Offensive Zone Strategy</div>
            <div className="strategy-description">
              Controls how your team maintains possession and creates scoring chances.
            </div>
            <StrategySelector>
              <StrategyOption 
                selected={offensiveZone === 'cycle'} 
                onClick={() => setOffensiveZone('cycle')}
              >
                Cycle
              </StrategyOption>
              <StrategyOption 
                selected={offensiveZone === 'crash'} 
                onClick={() => setOffensiveZone('crash')}
              >
                Crash the Net
              </StrategyOption>
              <StrategyOption 
                selected={offensiveZone === 'overload'} 
                onClick={() => setOffensiveZone('overload')}
              >
                Overload
              </StrategyOption>
              <StrategyOption 
                selected={offensiveZone === 'behind'} 
                onClick={() => setOffensiveZone('behind')}
              >
                Behind Net
              </StrategyOption>
            </StrategySelector>
          </StrategySection>
          
          {/* Defensive Zone Strategy */}
          <StrategySection>
            <div className="strategy-header">Defensive Zone Strategy</div>
            <div className="strategy-description">
              How your team defends in your own zone to prevent scoring chances.
            </div>
            <StrategySelector>
              <StrategyOption 
                selected={defensiveZone === 'collapsing'} 
                onClick={() => setDefensiveZone('collapsing')}
              >
                Collapsing
              </StrategyOption>
              <StrategyOption 
                selected={defensiveZone === 'tight'} 
                onClick={() => setDefensiveZone('tight')}
              >
                Tight Point
              </StrategyOption>
              <StrategyOption 
                selected={defensiveZone === 'contain'} 
                onClick={() => setDefensiveZone('contain')}
              >
                Contain
              </StrategyOption>
              <StrategyOption 
                selected={defensiveZone === 'staggered'} 
                onClick={() => setDefensiveZone('staggered')}
              >
                Staggered
              </StrategyOption>
            </StrategySelector>
          </StrategySection>
          
          {/* Breakout Strategy */}
          <StrategySection>
            <div className="strategy-header">Breakout Strategy</div>
            <div className="strategy-description">
              How your team transitions from defense to offense when gaining possession.
            </div>
            <StrategySelector>
              <StrategyOption 
                selected={breakout === 'controlled'} 
                onClick={() => setBreakout('controlled')}
              >
                Controlled
              </StrategyOption>
              <StrategyOption 
                selected={breakout === 'aggressive'} 
                onClick={() => setBreakout('aggressive')}
              >
                Aggressive
              </StrategyOption>
              <StrategyOption 
                selected={breakout === 'outlet'} 
                onClick={() => setBreakout('outlet')}
              >
                Outlet Pass
              </StrategyOption>
              <StrategyOption 
                selected={breakout === 'cautious'} 
                onClick={() => setBreakout('cautious')}
              >
                Cautious
              </StrategyOption>
            </StrategySelector>
          </StrategySection>
          
          {/* Overall Coaching Strategy */}
          <StrategySection>
            <div className="strategy-header">Overall Coaching Strategy</div>
            <div className="strategy-description">
              General philosophy guiding your coaching staff's approach.
            </div>
            <StrategySelector>
              <StrategyOption 
                selected={coaching === 'offensive'} 
                onClick={() => setCoaching('offensive')}
              >
                Offensive
              </StrategyOption>
              <StrategyOption 
                selected={coaching === 'balanced'} 
                onClick={() => setCoaching('balanced')}
              >
                Balanced
              </StrategyOption>
              <StrategyOption 
                selected={coaching === 'defensive'} 
                onClick={() => setCoaching('defensive')}
              >
                Defensive
              </StrategyOption>
              <StrategyOption 
                selected={coaching === 'physical'} 
                onClick={() => setCoaching('physical')}
              >
                Physical
              </StrategyOption>
            </StrategySelector>
          </StrategySection>
        </CardContent>
      </Card>
    );
  };
  
  // Render main content
  if (showFreeAgentCoaches) {
    return <FreeAgentCoachesContent teamLevel={teamLevel} rotateTeamLevel={rotateTeamLevel} onReturn={handleReturnToStaff} />;
  }
  
  return (
    <>
      <Header>
        <Title>Coaching Staff</Title>
        <ActionButtons>
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
        <TabContainer>
          <Tab active={activeTab === 'staff'} onClick={() => setActiveTab('staff')}>
            Staff Management
          </Tab>
          <Tab active={activeTab === 'events'} onClick={() => setActiveTab('events')}>
            Coach Events
          </Tab>
          <Tab active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')}>
            Team Strategy
          </Tab>
        </TabContainer>
        
        {activeTab === 'staff' && renderStaffManagement()}
        {activeTab === 'events' && renderCoachEvents()}
        {activeTab === 'strategy' && renderTeamStrategy()}
      </div>
    </>
  );
};

export default CoachingStaffContent; 