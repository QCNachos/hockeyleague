import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrophy, FaMedal, FaChevronLeft, FaChevronRight, FaStar, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
import { selectCommunityPack } from '../store/slices/settingsSlice';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shine = keyframes`
  0% { background-position: -100px; }
  100% { background-position: 200px; }
`;

const connectTrophies = keyframes`
  0% { width: 0; }
  100% { width: 80px; }
`;

// Timing constants (in milliseconds)
const INTRO_DURATION = 5000;          // 5 seconds on intro slide
const SLIDE_DURATION = 10000;         // 10 seconds per award slide
const FINALIST_DELAY = 2500;          // 2.5 seconds between revealing each finalist (substantially increased)
const TROPHY_TITLE_DELAY = 800;       // 0.8 seconds before showing finalists heading
const FINALISTS_HEADING_DELAY = 1000; // 1 second between trophy title and first finalist
const WINNER_REVEAL_DELAY = 2000;     // 2 seconds before revealing winner after all finalists shown
const WINNER_VIEW_DURATION = 7000;    // 7 seconds to view winner before auto-advancing to next award

// Styled Components
const CeremonyContainer = styled.div`
  background-color: #0a0a0a;
  min-height: 100vh;
  padding: 0;
  position: relative;
  overflow: hidden;
`;

const Header = styled.div`
  padding: 20px;
  text-align: center;
  position: relative;
  animation: ${fadeIn} 1s ease-out;
`;

const BackButton = styled.button`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s;
  
  &:hover {
    background: rgba(179, 14, 22, 0.8);
  }
`;

const SeasonTitle = styled.h1`
  color: #C4CED4;
  font-size: 2.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 15px;
    color: #B30E16;
  }
`;

const CeremonyStage = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 20px auto;
  position: relative;
  height: 70vh;
  background-image: linear-gradient(to bottom, #1a1a1a, #0a0a0a);
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  animation: ${fadeIn} 1s ease-out;
`;

const StageBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.05;
  background-image: url(${props => props.backgroundImage || ''});
  background-size: cover;
  background-position: center;
  filter: grayscale(30%);
`;

const NavigationControls = styled.div`
  display: flex;
  justify-content: space-between;
  width: 90%;
  max-width: 1200px;
  margin: 20px auto;
  animation: ${fadeIn} 1s ease-out;
`;

const NavButton = styled.button`
  background-color: ${props => props.autoplay ? 
    (props.isActive ? '#25a244' : '#666') : 
    'rgba(179, 14, 22, 0.8)'
  };
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: ${props => props.autoplay ? 
      (props.isActive ? '#1e8035' : '#888') : 
      '#B30E16'
    };
  }
  
  &:disabled {
    background-color: #444;
    cursor: not-allowed;
  }
  
  svg {
    margin: 0 8px;
  }
`;

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const ProgressDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.active ? '#B30E16' : '#444'};
  margin: 0 5px;
  transition: background-color 0.3s;
`;

// Award presentation components
const AwardContent = styled.div`
  text-align: center;
  margin: 0 auto;
  max-width: 80%;
  animation: ${slideUp} 0.8s ease-out forwards;
  color: #C4CED4;
  display: flex;
  flex-direction: column;
  min-height: 60vh;
  justify-content: flex-start;
`;

const AwardTitle = styled.h2`
  color: #FFD700;
  font-size: 2.5rem;
  margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
`;

const AwardDescription = styled.p`
  color: #C4CED4;
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.8;
`;

const FinalistsHeading = styled.h3`
  margin: 20px 0;
  color: #C4CED4;
  font-size: 1.4rem;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.5s ease-in-out;
  animation: ${props => props.visible ? slideUp : 'none'} 0.8s ease-out forwards;
`;

const ChampionshipNote = styled.div`
  color: #B30E16;
  font-style: italic;
  margin: 10px 0 20px;
  font-size: 1.1rem;
  opacity: 0.8;
`;

const FinalistsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 30px;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
`;

const FinalistItem = styled.div`
  background: linear-gradient(90deg, rgba(30, 30, 30, 0.6), rgba(50, 50, 50, 0.6));
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: ${slideUp} 0.5s ease-out forwards;
  animation-delay: ${props => props.index * 0.2}s;
  opacity: ${props => props.visible ? 1 : 0};
  transition: opacity 0.5s ease-in-out;
  flex-wrap: wrap;
  
  &:nth-child(1) {
    border-left: 4px solid #FFD700; /* Gold */
  }
  
  &:nth-child(2) {
    border-left: 4px solid #C0C0C0; /* Silver */
  }
  
  &:nth-child(3) {
    border-left: 4px solid #CD7F32; /* Bronze */
  }
  
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const FinalistName = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px;
  
  @media (max-width: 600px) {
    white-space: normal;
    width: 100%;
    margin-bottom: 5px;
  }
`;

const FinalistTeam = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  width: 100px;
  flex-shrink: 0;
  text-align: center;
  
  img {
    width: 30px;
    height: 30px;
    margin-right: 10px;
    flex-shrink: 0;
    object-fit: contain;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 70px;
  }
  
  @media (max-width: 600px) {
    width: auto;
    margin-right: 15px;
  }
`;

const FinalistStats = styled.div`
  font-size: 0.9rem;
  color: #999;
  width: 180px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  @media (max-width: 600px) {
    width: 100%;
    text-align: left;
  }
`;

const Winner = styled.div`
  margin-top: 40px;
  animation: ${slideUp} 1s ease-out forwards;
  animation-delay: 0.5s;
  opacity: 0;
`;

const WinnerHeading = styled.h3`
  font-size: 1.5rem;
  color: #C4CED4;
  margin-bottom: 15px;
`;

const WinnerCard = styled.div`
  padding: 25px;
  background: linear-gradient(90deg, #1a1a1a, #2a2a2a);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  border: 2px solid #B30E16;
  max-width: 90%;
  width: 600px;
  margin: 0 auto;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    animation: ${shine} 2s infinite;
  }
`;

const WinnerName = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #FFD700;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s infinite;
  text-align: center;
  word-break: break-word;
  flex-wrap: wrap;
  
  svg {
    margin-right: 10px;
    flex-shrink: 0;
    color: #FFD700;
  }

  @media (max-width: 500px) {
    font-size: 1.7rem;
  }
`;

const WinnerTeam = styled.div`
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  
  img {
    width: 40px;
    height: 40px;
    margin-right: 15px;
    flex-shrink: 0;
    object-fit: contain;
  }
  
  span {
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (max-width: 500px) {
    font-size: 1.1rem;
  }
`;

const WinnerStats = styled.div`
  font-size: 1.1rem;
  color: #C4CED4;
  text-align: center;
  word-wrap: break-word;
  
  @media (max-width: 500px) {
    font-size: 1rem;
  }
`;

const IntroContent = styled.div`
  text-align: center;
  animation: ${slideUp} 1s ease-out;
  
  h2 {
    font-size: 2.5rem;
    color: #FFD700;
    margin-bottom: 20px;
  }
`;

const ClosingContent = styled.div`
  text-align: center;
  animation: ${slideUp} 1s ease-out;
  width: 100%;
  
  h2 {
    font-size: 2.5rem;
    color: #FFD700;
    margin-bottom: 20px;
  }
`;

const RecapSection = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 0 10px;
`;

const RecapTitle = styled.h3`
  font-size: 1.6rem;
  color: #C4CED4;
  margin-bottom: 15px;
  text-align: center;
`;

const RecapGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 15px;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`;

const RecapCard = styled.div`
  background: rgba(30, 30, 30, 0.7);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  height: 120px;
  
  .award-name {
    font-size: 1rem;
    color: #FFD700;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 6px;
      flex-shrink: 0;
    }
  }
  
  .winner-name {
    font-size: 1rem;
    color: #C4CED4;
    font-weight: bold;
    margin-bottom: 5px;
    text-align: center;
  }
  
  .winner-team {
    font-size: 0.9rem;
    color: #888;
    display: flex;
    align-items: center;
    justify-content: center;
    
    img {
      width: 24px;
      height: 24px;
      margin-right: 6px;
      flex-shrink: 0;
      object-fit: contain;
    }
  }
`;

const ExitButton = styled(NavButton)`
  background-color: #B30E16;
  
  &:hover {
    background-color: #950b12;
  }
`;

const ConferenceNote = styled.div`
  margin: 10px 0 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  
  span {
    color: #C4CED4;
    margin: 0 15px;
    font-size: 1rem;
  }
  
  hr {
    border: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, #666, transparent);
    width: 80px;
  }
`;

const ConnectionLine = styled.hr`
  border: 0;
  height: 2px;
  background: linear-gradient(to right, transparent, #B30E16, transparent);
  width: 80px;
  margin: 5px auto;
  animation: ${connectTrophies} 1.5s ease-out;
`;

// Helper components for conference championship display
const ConferenceChampionsWrap = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ConferencesRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ConferenceItem = styled.div`
  background: linear-gradient(90deg, rgba(30, 30, 30, 0.6), rgba(50, 50, 50, 0.6));
  padding: 20px;
  border-radius: 8px;
  width: 48%;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-bottom: 20px;
  }
  
  h3 {
    color: #FFD700;
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
  
  p {
    margin-bottom: 15px;
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const ConferenceWinner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .name {
    font-size: 1.3rem;
    font-weight: bold;
    margin: 10px 0;
  }
  
  .team {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    
    img {
      width: 40px;
      height: 40px;
      margin-right: 10px;
    }
  }
  
  .stats {
    font-size: 0.9rem;
    color: #C4CED4;
  }
`;

const StanleyCupSection = styled.div`
  margin-top: 30px;
  
  h3 {
    color: #B30E16;
    margin-bottom: 15px;
    font-size: 1.2rem;
  }
`;

const CupArrows = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 auto 20px;
  width: 100%;
  
  svg {
    color: #B30E16;
    margin: 0 5px;
    animation: ${pulse} 2s infinite;
  }
`;

// Helper function to get team logo with better error handling
const getTeamLogo = (teamCode) => {
  try {
    if (!teamCode || teamCode === 'N/A') return '';
    
    const upperTeamCode = teamCode.toUpperCase();
    
    // Dynamic import from assets folder
    try {
      // This approach creates the correct path using webpack's require
      return require(`../assets/Logo_${upperTeamCode}.png`);
    } catch (error) {
      // Fallback to direct path if dynamic import fails
      return `/static/media/Logo_${upperTeamCode}.png`;
    }
  } catch (error) {
    console.warn('Error loading team logo:', error);
    return ''; // Return empty string on error
  }
};

// Format team display with logo if enabled
const formatTeamDisplay = (name, teamCode, communityPack = 1) => {
  try {
    const showLogo = communityPack === 1 && teamCode && teamCode !== 'N/A';
    let logoPath = '';
    
    if (showLogo) {
      logoPath = getTeamLogo(teamCode);
    }
    
    return { name, teamCode, logoPath, showLogo };
  } catch (error) {
    console.warn('Error formatting team display:', error);
    return { name, teamCode, logoPath: '', showLogo: false };
  }
};

const getMockAwardData = (year = 2024) => {
  // Randomize the position of the winner in the finalists list for suspense awards
  const randomizeWinnerPosition = (finalists, winner) => {
    // Create a shuffled array of finalists that MUST include the winner
    const finalFinalists = [];
    
    // First add non-winner finalists
    for (const finalist of finalists) {
      if (finalist.name !== winner.name) {
        finalFinalists.push({...finalist});
      }
    }
    
    // Make sure we have at least 2 finalists besides the winner
    while (finalFinalists.length < 2) {
      finalFinalists.push({
        name: `Finalist ${finalFinalists.length + 1}`,
        team: "TBD",
        stats: "Stats unavailable"
      });
    }
    
    // Insert winner at random position in the array (0, 1, or 2)
    const randomPosition = Math.floor(Math.random() * 3);
    finalFinalists.splice(randomPosition, 0, {
      name: winner.name,
      team: winner.team,
      stats: winner.stats
    });
    
    return finalFinalists;
  };
  
  // Function to create award object with randomized finalist positions 
  const createAward = (id, name, description, type, winner, finalists) => {
    const finalFinalists = randomizeWinnerPosition(finalists, winner);
    return {
      id, 
      name, 
      description, 
      type, 
      winner,
      finalists: finalFinalists
    };
  };
  
  // Return the award data with randomized finalist positions
  return {
    // Regular Season Awards
    regularSeasonAwards: [
      {
        id: 1,
        name: "President's Trophy",
        description: "Given to the team with the best regular-season record.",
        type: "Team",
        winner: {
          name: "Boston Bruins",
          abbreviation: "BOS",
          stats: "65-12-5, 135 points"
        },
        finalists: [
          {
            name: "Boston Bruins",
            team: "BOS",
            stats: "65-12-5, 135 points"
          },
          {
            name: "Carolina Hurricanes",
            team: "CAR",
            stats: "52-21-9, 113 points"
          },
          {
            name: "Edmonton Oilers",
            team: "EDM",
            stats: "50-23-9, 109 points"
          }
        ]
      },
      {
        id: 2,
        name: "Art Ross Trophy",
        description: "Given to the player who leads the league in points at the end of the regular season.",
        type: "Individual",
        winner: {
          name: "Connor McDavid",
          team: "EDM",
          stats: "64 goals, 89 assists, 153 points"
        },
        finalists: [
          {
            name: "Connor McDavid",
            team: "EDM",
            stats: "64 goals, 89 assists, 153 points"
          },
          {
            name: "Leon Draisaitl",
            team: "EDM",
            stats: "52 goals, 76 assists, 128 points"
          },
          {
            name: "Nathan MacKinnon",
            team: "COL",
            stats: "51 goals, 73 assists, 124 points"
          }
        ]
      },
      {
        id: 3,
        name: "Maurice Richard Trophy",
        description: "Given to the top goal scorer in the regular season.",
        type: "Individual",
        winner: {
          name: "David Pastrnak",
          team: "BOS",
          stats: "61 goals"
        },
        finalists: [
          {
            name: "David Pastrnak",
            team: "BOS",
            stats: "61 goals"
          },
          {
            name: "Connor McDavid",
            team: "EDM",
            stats: "60 goals"
          },
          {
            name: "Auston Matthews",
            team: "TOR",
            stats: "58 goals"
          }
        ]
      },
      {
        id: 4,
        name: "William M. Jennings Trophy",
        description: "Given to the goaltender(s) who allowed the fewest goals during the regular season.",
        type: "Individual",
        winner: {
          name: "Linus Ullmark",
          team: "BOS",
          stats: "1.89 GAA, .938 SV%"
        },
        finalists: [
          {
            name: "Linus Ullmark",
            team: "BOS",
            stats: "1.89 GAA, .938 SV%"
          },
          {
            name: "Igor Shesterkin",
            team: "NYR",
            stats: "2.07 GAA, .932 SV%"
          },
          {
            name: "Ilya Sorokin",
            team: "NYI",
            stats: "2.24 GAA, .925 SV%"
          }
        ]
      }
    ],
    
    // Playoff Awards - keep all awards in the array, but we'll display the first 3 together
    playoffAwards: [
      {
        id: 6,
        name: "Prince of Wales Trophy",
        description: "Awarded to the Eastern Conference playoff champion.",
        type: "Team",
        winner: {
          name: "Florida Panthers",
          abbreviation: "FLA",
          stats: "Eastern Conference Champions"
        }
      },
      {
        id: 7,
        name: "Clarence S. Campbell Bowl",
        description: "Awarded to the Western Conference playoff champion.",
        type: "Team",
        winner: {
          name: "Vegas Golden Knights",
          abbreviation: "VGK",
          stats: "Western Conference Champions"
        }
      },
      {
        id: 5,
        name: "Stanley Cup",
        description: "Awarded to the NHL playoff champion.",
        type: "Team",
        winner: {
          name: "Vegas Golden Knights",
          abbreviation: "VGK",
          stats: "16-6 playoff record"
        }
      },
      {
        id: 8,
        name: "Conn Smythe Trophy",
        description: "Awarded to the most valuable player in the playoffs.",
        type: "Individual",
        winner: {
          name: "Jonathan Marchessault",
          team: "VGK",
          stats: "13 goals, 12 assists, 25 points"
        },
        finalists: [
          {
            name: "Jonathan Marchessault",
            team: "VGK",
            stats: "13 goals, 12 assists, 25 points"
          },
          {
            name: "Matthew Tkachuk",
            team: "FLA",
            stats: "11 goals, 13 assists, 24 points"
          },
          {
            name: "Jack Eichel",
            team: "VGK",
            stats: "6 goals, 20 assists, 26 points"
          }
        ]
      }
    ],
    
    // Suspense Awards (Show Finalists) - Updated with complete list in specified order
    suspenseAwards: [
      createAward(
        9,
        "Hart Memorial Trophy",
        "Awarded to the player judged most valuable to his team during the regular season, essentially the MVP.",
        "Individual",
        {
          name: "Connor McDavid",
          team: "EDM",
          stats: "64 goals, 89 assists, 153 points"
        },
        [
          {
            name: "Connor McDavid",
            team: "EDM",
            stats: "64 goals, 89 assists, 153 points"
          },
          {
            name: "David Pastrnak",
            team: "BOS",
            stats: "61 goals, 52 assists, 113 points"
          },
          {
            name: "Matthew Tkachuk", 
            team: "FLA",
            stats: "40 goals, 69 assists, 109 points"
          }
        ]
      ),
      createAward(
        11,
        "Norris Trophy",
        "Awarded to the top defenseman in the league.",
        "Individual",
        {
          name: "Erik Karlsson",
          team: "SJS",
          stats: "25 goals, 76 assists, 101 points"
        },
        [
          {
            name: "Erik Karlsson",
            team: "SJS",
            stats: "25 goals, 76 assists, 101 points"
          },
          {
            name: "Adam Fox",
            team: "NYR",
            stats: "12 goals, 60 assists, 72 points"
          },
          {
            name: "Cale Makar",
            team: "COL",
            stats: "17 goals, 49 assists, 66 points"
          }
        ]
      ),
      createAward(
        13,
        "Rod Langway Award",
        "Awarded to the top defensive defenseman in the league.",
        "Individual",
        {
          name: "Jaccob Slavin",
          team: "CAR",
          stats: "+23 rating, 18:24 avg. TOI"
        },
        [
          {
            name: "Jaccob Slavin",
            team: "CAR",
            stats: "+23 rating, 18:24 avg. TOI"
          },
          {
            name: "Chris Tanev",
            team: "CGY",
            stats: "+12 rating, 17:56 avg. TOI"
          },
          {
            name: "Devon Toews",
            team: "COL",
            stats: "+21 rating, 19:45 avg. TOI"
          }
        ]
      ),
      createAward(
        14,
        "Frank J. Selke Trophy",
        "Awarded to the forward who demonstrates the most skill in the defensive component of the game.",
        "Individual",
        {
          name: "Patrice Bergeron",
          team: "BOS",
          stats: "27 goals, 31 assists, +23 rating"
        },
        [
          {
            name: "Patrice Bergeron",
            team: "BOS",
            stats: "27 goals, 31 assists, +23 rating"
          },
          {
            name: "Aleksander Barkov",
            team: "FLA",
            stats: "23 goals, 55 assists, +16 rating"
          },
          {
            name: "Anze Kopitar",
            team: "LAK",
            stats: "28 goals, 46 assists, +10 rating"
          }
        ]
      ),
      createAward(
        10,
        "Vezina Trophy",
        "Awarded to the top goaltender in the league.",
        "Individual",
        {
          name: "Linus Ullmark",
          team: "BOS",
          stats: "40-6-1, 1.89 GAA, .938 SV%"
        },
        [
          {
            name: "Linus Ullmark",
            team: "BOS",
            stats: "40-6-1, 1.89 GAA, .938 SV%"
          },
          {
            name: "Ilya Sorokin",
            team: "NYI",
            stats: "31-22-7, 2.34 GAA, .924 SV%"
          },
          {
            name: "Connor Hellebuyck",
            team: "WPG",
            stats: "37-25-2, 2.49 GAA, .920 SV%"
          }
        ]
      ),
      createAward(
        12,
        "Calder Memorial Trophy",
        "Awarded to the rookie of the year.",
        "Individual",
        {
          name: "Matty Beniers",
          team: "SEA",
          stats: "24 goals, 33 assists, 57 points"
        },
        [
          {
            name: "Matty Beniers",
            team: "SEA",
            stats: "24 goals, 33 assists, 57 points"
          },
          {
            name: "Owen Power",
            team: "BUF",
            stats: "4 goals, 31 assists, 35 points"
          },
          {
            name: "Stuart Skinner",
            team: "EDM",
            stats: "29-14-5, 2.75 GAA, .914 SV%"
          }
        ]
      ),
      createAward(
        15,
        "Ted Lindsay Award",
        "Awarded to the most outstanding player as voted by the members of the NHL Players Association.",
        "Individual",
        {
          name: "Connor McDavid",
          team: "EDM",
          stats: "64 goals, 89 assists, 153 points"
        },
        [
          {
            name: "Connor McDavid",
            team: "EDM",
            stats: "64 goals, 89 assists, 153 points"
          },
          {
            name: "Nathan MacKinnon",
            team: "COL",
            stats: "42 goals, 69 assists, 111 points"
          },
          {
            name: "David Pastrnak",
            team: "BOS",
            stats: "61 goals, 52 assists, 113 points"
          }
        ]
      ),
      createAward(
        16,
        "King Clancy Memorial Trophy",
        "Awarded to the player who best exemplifies leadership qualities on and off the ice and has made a noteworthy humanitarian contribution to his community.",
        "Individual",
        {
          name: "P.K. Subban",
          team: "NJD",
          stats: "Charitable work with hospitals"
        },
        [
          {
            name: "P.K. Subban",
            team: "NJD",
            stats: "Charitable work with hospitals"
          },
          {
            name: "Ryan Getzlaf",
            team: "ANA",
            stats: "Community outreach programs"
          },
          {
            name: "Pekka Rinne",
            team: "NSH",
            stats: "Youth hockey initiatives"
          }
        ]
      ),
      createAward(
        17,
        "Mark Messier Leadership Award",
        "Awarded to the player who exemplifies great leadership qualities to his team, on and off the ice, during the regular season.",
        "Individual",
        {
          name: "Patrice Bergeron",
          team: "BOS",
          stats: "Team captain, community leader"
        },
        [
          {
            name: "Patrice Bergeron",
            team: "BOS",
            stats: "Team captain, community leader"
          },
          {
            name: "Anders Lee",
            team: "NYI",
            stats: "Team captain, children's foundation work"
          },
          {
            name: "Steven Stamkos",
            team: "TBL",
            stats: "Long-time captain, community outreach"
          }
        ]
      ),
      createAward(
        18,
        "Lady Byng Memorial Trophy",
        "Awarded to the player adjudged to have exhibited the best type of sportsmanship and gentlemanly conduct combined with a high standard of playing ability.",
        "Individual",
        {
          name: "Jaccob Slavin",
          team: "CAR",
          stats: "8 PIM, 35 points, +22 rating"
        },
        [
          {
            name: "Jaccob Slavin",
            team: "CAR",
            stats: "8 PIM, 35 points, +22 rating"
          },
          {
            name: "Auston Matthews",
            team: "TOR",
            stats: "10 PIM, 60 goals, 46 assists"
          },
          {
            name: "Kyle Connor",
            team: "WPG",
            stats: "4 PIM, 47 goals, 46 assists"
          }
        ]
      ),
      createAward(
        19,
        "Bill Masterton Memorial Trophy",
        "Awarded to the player who exemplifies the qualities of perseverance, sportsmanship, and dedication to ice hockey.",
        "Individual",
        {
          name: "Carey Price",
          team: "MTL",
          stats: "Return from career-threatening injury"
        },
        [
          {
            name: "Carey Price",
            team: "MTL",
            stats: "Return from career-threatening injury"
          },
          {
            name: "Kevin Hayes",
            team: "PHI",
            stats: "Played through personal tragedy"
          },
          {
            name: "Kris Letang",
            team: "PIT",
            stats: "Overcame stroke to return to play"
          }
        ]
      ),
      createAward(
        20,
        "Jack Adams Award",
        "Awarded to the coach adjudged to have contributed the most to his team's success.",
        "Individual",
        {
          name: "Jim Montgomery",
          team: "BOS",
          stats: "65-12-5 record, 135 points"
        },
        [
          {
            name: "Jim Montgomery",
            team: "BOS",
            stats: "65-12-5 record, 135 points"
          },
          {
            name: "Dave Hakstol",
            team: "SEA",
            stats: "46-28-8 record, 100 points"
          },
          {
            name: "Lindy Ruff",
            team: "NJD",
            stats: "52-22-8 record, 112 points"
          }
        ]
      ),
      createAward(
        21,
        "Jim Gregory General Manager of the Year Award",
        "Awarded to the general manager adjudged to have contributed most to his team's success.",
        "Individual",
        {
          name: "Don Sweeney",
          team: "BOS",
          stats: "Built team with 65-12-5 record"
        },
        [
          {
            name: "Don Sweeney",
            team: "BOS",
            stats: "Built team with 65-12-5 record"
          },
          {
            name: "Bill Zito",
            team: "FLA",
            stats: "Acquired key playoff pieces"
          },
          {
            name: "Kelly McCrimmon",
            team: "VGK",
            stats: "Built Stanley Cup champion"
          }
        ]
      )
    ]
  };
};

// Fetch award data based on game state
const fetchAwardData = async (gameMode, gameYear) => {
  try {
    // For demo or MENU mode, use mock data
    if (gameMode === 'MENU') {
      return getMockAwardData(gameYear);
    }
    
    // For actual game modes, try to fetch real data
    try {
      const regularSeasonResponse = await axios.get(`/api/game/awards/regular?year=${gameYear}`);
      const playoffResponse = await axios.get(`/api/game/awards/playoff?year=${gameYear}`);
      const finalistResponse = await axios.get(`/api/game/awards/finalists?year=${gameYear}`);
      
      return {
        regularSeasonAwards: regularSeasonResponse.data.data,
        playoffAwards: playoffResponse.data.data,
        suspenseAwards: finalistResponse.data.data
      };
    } catch (error) {
      console.warn('Could not fetch real award data, using mock data', error);
      return getMockAwardData(gameYear);
    }
  } catch (error) {
    console.error('Error in award data handling:', error);
    return getMockAwardData(gameYear);
  }
};

const AwardsCeremony = () => {
  // State variables
  const [ceremonyPhase, setCeremonyPhase] = useState('intro');
  const [currentAwardIndex, setCurrentAwardIndex] = useState(0);
  const [showingFinalists, setShowingFinalists] = useState(false);
  const [revealWinner, setRevealWinner] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [awardData, setAwardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleFinalists, setVisibleFinalists] = useState([]);
  const [isAutoplaying, setIsAutoplaying] = useState(true);
  const [pauseAutoAdvance, setPauseAutoAdvance] = useState(false);
  const [showingFinalistsHeading, setShowingFinalistsHeading] = useState(false);
  
  // Global settings from Redux with safe fallbacks
  const dispatch = useDispatch();
  const gameMode = useSelector(state => state?.settings?.gameMode?.currentMode || 'MENU');
  const gameYear = useSelector(state => state?.settings?.gameMode?.currentYear || 2024);
  const communityPack = useSelector(selectCommunityPack) || 1; // Default to 1 (ON) if Redux fails
  
  const navigate = useNavigate();
  
  // Fetch award data when component mounts
  useEffect(() => {
    const loadAwardData = async () => {
      try {
        setLoading(true);
        const data = await fetchAwardData(gameMode, gameYear);
        setAwardData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading award data:', err);
        setError('Failed to load award data. Please try again.');
        setLoading(false);
      }
    };
    
    loadAwardData();
  }, [gameMode, gameYear]);
  
  // Get the current awards data based on the ceremony phase
  const getCurrentAwardsData = () => {
    if (!awardData) return [];
    
    switch(ceremonyPhase) {
      case 'regularSeason':
        return awardData.regularSeasonAwards;
      case 'playoffs':
        return awardData.playoffAwards;
      case 'suspense':
        return awardData.suspenseAwards;
      default:
        return [];
    }
  };
  
  const currentAwards = getCurrentAwardsData();
  const currentAward = currentAwards[currentAwardIndex];
  
  // Auto-advance timer for intro phase
  useEffect(() => {
    if (ceremonyPhase === 'intro' && !loading && !error && isAutoplaying) {
      const timer = setTimeout(() => {
        goToNextAward();
      }, INTRO_DURATION);
      
      return () => clearTimeout(timer);
    }
  }, [ceremonyPhase, loading, error, isAutoplaying]);
  
  // Auto-advance timer for regular season and playoff awards
  useEffect(() => {
    if ((ceremonyPhase === 'regularSeason' || ceremonyPhase === 'playoffs') && 
        !loading && !error && isAutoplaying && !pauseAutoAdvance) {
      const timer = setTimeout(() => {
        goToNextAward();
      }, SLIDE_DURATION);
      
      return () => clearTimeout(timer);
    }
  }, [ceremonyPhase, currentAwardIndex, loading, error, isAutoplaying, pauseAutoAdvance]);
  
  // Auto-show finalists in suspense phase
  useEffect(() => {
    if (ceremonyPhase === 'suspense' && currentAward) {
      console.log(`Current award in suspense phase: ${currentAward.name}`);
      
      if (!showingFinalists && !loading && !error && isAutoplaying) {
        console.log(`Starting animation sequence for ${currentAward.name}`);
        
        // First show the trophy title with a delay
        const headingTimer = setTimeout(() => {
          console.log(`Showing finalists heading for ${currentAward.name}`);
          // Then show the "The finalists are:" heading
          setShowingFinalistsHeading(true);
          
          // Then start showing finalists after a delay
          const finalistsTimer = setTimeout(() => {
            console.log(`Setting showingFinalists to true for ${currentAward.name}`);
            setShowingFinalists(true);
          }, FINALISTS_HEADING_DELAY);
          
          return () => clearTimeout(finalistsTimer);
        }, TROPHY_TITLE_DELAY);
        
        return () => clearTimeout(headingTimer);
      }
    }
  }, [ceremonyPhase, currentAwardIndex, currentAward, showingFinalists, loading, error, isAutoplaying]);
  
  // Automatically show finalists for regular season awards
  useEffect(() => {
    if (ceremonyPhase === 'regularSeason' && currentAward && currentAward.finalists && isAutoplaying) {
      console.log(`Regular season award: ${currentAward.name} - showing all finalists immediately`);
      // Show all finalists immediately for regular season awards
      setVisibleFinalists([0, 1, 2]);
    }
  }, [ceremonyPhase, currentAwardIndex, currentAward, isAutoplaying]);
  
  // More robust handling of finalist reveals
  useEffect(() => {
    if (showingFinalists && ceremonyPhase === 'suspense' && currentAward && currentAward.finalists) {
      console.log(`Showing finalists effect triggered for ${currentAward.name}`);
      
      // Clear any existing state
      setVisibleFinalists([]);
      setRevealWinner(false); // Ensure winner is hidden when showing finalists
      
      const timers = [];
      
      // Show finalists one by one with proper delay
      currentAward.finalists.forEach((finalist, index) => {
        const timer = setTimeout(() => {
          console.log(`Showing finalist ${index} for ${currentAward.name}`);
          setVisibleFinalists(prev => {
            // Make sure we don't add duplicates
            if (prev.includes(index)) return prev;
            return [...prev, index];
          });
        }, FINALIST_DELAY * (index + 1));
        
        timers.push(timer);
      });
      
      // Auto-reveal winner after all finalists are shown, only if auto-playing
      if (isAutoplaying) {
        const totalFinalistDelay = FINALIST_DELAY * currentAward.finalists.length;
        
        const winnerTimer = setTimeout(() => {
          console.log(`Revealing winner for ${currentAward.name}`);
          setRevealWinner(true);
        }, totalFinalistDelay + WINNER_REVEAL_DELAY);
        
        timers.push(winnerTimer);
      
        // Auto-advance to next award after revealing winner, only if not paused
        if (!pauseAutoAdvance) {
          const advanceTimer = setTimeout(() => {
            console.log(`Auto-advancing from ${currentAward.name}`);
            goToNextAward();
          }, totalFinalistDelay + WINNER_REVEAL_DELAY + WINNER_VIEW_DURATION);
          
          timers.push(advanceTimer);
        }
      }
      
      // Cleanup function to clear all timers
      return () => {
        console.log(`Cleaning up ${timers.length} timers for ${currentAward.name}`);
        timers.forEach(timer => clearTimeout(timer));
      };
    }
  }, [showingFinalists, ceremonyPhase, currentAwardIndex, currentAward?.id]);
  
  // Reset states when moving to a new award
  const resetAwardStates = () => {
    console.log("Resetting award states");
    setRevealWinner(false);
    setShowingFinalists(false);
    setShowingFinalistsHeading(false);
    setVisibleFinalists([]);
  };
  
  const goToNextAward = () => {
    if (isAnimating) {
      console.log("Animation in progress, skipping navigation");
      return;
    }
    
    console.log("Going to next award");
    
    // Pause autoplay when manually navigating
    if (isAutoplaying) {
      setPauseAutoAdvance(true);
      
      // Resume autoplay after a delay
      setTimeout(() => {
        setPauseAutoAdvance(false);
      }, 15000);
    }
    
    setIsAnimating(true);
    
    // Complete reset of all states
    setVisibleFinalists([]);
    setShowingFinalists(false);
    setShowingFinalistsHeading(false);
    setRevealWinner(false);
    
    // Specific checks for the playoffs special case
    const specialPlayoffHandling = 
      ceremonyPhase === 'playoffs' && 
      currentAwardIndex === 0 && 
      awardData?.playoffAwards?.length > 3;
    
    // Navigate to next award
    if (specialPlayoffHandling || currentAwardIndex >= currentAwards.length - 1) {
      if (specialPlayoffHandling) {
        setCurrentAwardIndex(3); 
      } else {
        switch(ceremonyPhase) {
          case 'intro':
            setCeremonyPhase('regularSeason');
            break;
          case 'regularSeason':
            setCeremonyPhase('playoffs');
            break;
          case 'playoffs':
            setCeremonyPhase('suspense');
            break;
          case 'suspense':
            setCeremonyPhase('closing');
            break;
          default:
            // Do nothing
        }
        setCurrentAwardIndex(0);
      }
    } else {
      setCurrentAwardIndex(currentAwardIndex + 1);
    }
    
    // Reset animation state after transition
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };
  
  const goToPreviousAward = () => {
    if (isAnimating) {
      console.log("Animation in progress, skipping navigation");
      return;
    }
    
    console.log("Going to previous award");
    
    // Pause autoplay when manually navigating
    if (isAutoplaying) {
      setPauseAutoAdvance(true);
      
      // Resume autoplay after a delay
      setTimeout(() => {
        setPauseAutoAdvance(false);
      }, 15000);
    }
    
    setIsAnimating(true);
    
    // Complete reset of all states
    setVisibleFinalists([]);
    setShowingFinalists(false);
    setShowingFinalistsHeading(false);
    setRevealWinner(false);
    
    // Special handling for playoff awards
    const specialPlayoffHandling = 
      ceremonyPhase === 'playoffs' && 
      currentAwardIndex === 3; // We're at the 4th award (index 3, typically Conn Smythe)
    
    // If we're at the beginning of the current phase's awards
    if (specialPlayoffHandling || currentAwardIndex <= 0) {
      if (specialPlayoffHandling) {
        // Go back to the combined championship display
        setCurrentAwardIndex(0);
      } else {
        // Move to the previous phase
        switch(ceremonyPhase) {
          case 'regularSeason':
            setCeremonyPhase('intro');
            break;
          case 'playoffs':
            setCeremonyPhase('regularSeason');
            setCurrentAwardIndex(awardData?.regularSeasonAwards?.length - 1 || 0);
            break;
          case 'suspense':
            setCeremonyPhase('playoffs');
            // Go to the last normal playoff award (typically Conn Smythe)
            const lastPlayoffAwardIndex = awardData?.playoffAwards?.length - 1 || 0;
            setCurrentAwardIndex(lastPlayoffAwardIndex);
            break;
          case 'closing':
            setCeremonyPhase('suspense');
            setCurrentAwardIndex(awardData?.suspenseAwards?.length - 1 || 0);
            break;
          default:
            // Do nothing
        }
      }
    } else {
      // Move to the previous award in the current phase
      setCurrentAwardIndex(currentAwardIndex - 1);
    }
    
    // Reset animation state after transition
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };
  
  // Toggle autoplay mode
  const toggleAutoplay = () => {
    setIsAutoplaying(!isAutoplaying);
    setPauseAutoAdvance(false);
  };
  
  // Handle showing finalists and revealing winner (for manual control)
  const handleShowFinalists = () => {
    setShowingFinalists(true);
    // Set pause when manually controlling
    setPauseAutoAdvance(true);
  };
  
  const handleRevealWinner = () => {
    console.log("Manual winner reveal");
    setRevealWinner(true);
    // Set pause when manually controlling
    setPauseAutoAdvance(true);
  };
  
  const handleBackToMenu = () => {
    navigate('/awards');
  };
  
  // Helper function to show a special combined display for conference trophies and Stanley Cup
  const renderConferenceAndCupDisplay = () => {
    if (!awardData || !awardData.playoffAwards) return null;
    
    // Find the conference championships and Stanley Cup
    const easternChampion = awardData.playoffAwards.find(award => award.name === "Prince of Wales Trophy");
    const westernChampion = awardData.playoffAwards.find(award => award.name === "Clarence S. Campbell Bowl");
    const stanleyCup = awardData.playoffAwards.find(award => award.name === "Stanley Cup");
    
    if (!easternChampion || !westernChampion || !stanleyCup) return null;
    
    return (
      <ConferenceChampionsWrap>
        <ConferencesRow>
          <ConferenceItem>
            <h3>{easternChampion.name}</h3>
            <p>{easternChampion.description}</p>
            <ConferenceWinner>
              <div className="name">{easternChampion.winner.name}</div>
              <div className="team">
                {communityPack === 1 && (
                  <img 
                    src={getTeamLogo(easternChampion.winner.abbreviation)} 
                    alt={easternChampion.winner.abbreviation} 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <span>{easternChampion.winner.abbreviation}</span>
              </div>
              <div className="stats">{easternChampion.winner.stats}</div>
            </ConferenceWinner>
          </ConferenceItem>
          
          <ConferenceItem>
            <h3>{westernChampion.name}</h3>
            <p>{westernChampion.description}</p>
            <ConferenceWinner>
              <div className="name">{westernChampion.winner.name}</div>
              <div className="team">
                {communityPack === 1 && (
                  <img 
                    src={getTeamLogo(westernChampion.winner.abbreviation)} 
                    alt={westernChampion.winner.abbreviation} 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
                <span>{westernChampion.winner.abbreviation}</span>
              </div>
              <div className="stats">{westernChampion.winner.stats}</div>
            </ConferenceWinner>
          </ConferenceItem>
        </ConferencesRow>
        
        <CupArrows>
          <FaChevronDown />
          <FaChevronDown />
          <FaChevronDown />
        </CupArrows>
        
        <StanleyCupSection>
          <h3>And the winner of the ultimate prize...</h3>
          <WinnerCard>
            <WinnerName>
              <FaStar /> {stanleyCup.name}
            </WinnerName>
            <WinnerTeam>
              {communityPack === 1 && (
                <img 
                  src={getTeamLogo(stanleyCup.winner.abbreviation)} 
                  alt={stanleyCup.winner.abbreviation} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <span>{stanleyCup.winner.name}</span>
            </WinnerTeam>
            <WinnerStats>{stanleyCup.winner.stats}</WinnerStats>
          </WinnerCard>
        </StanleyCupSection>
      </ConferenceChampionsWrap>
    );
  };
  
  // Function to generate a recap of all award winners
  const generateAwardsRecap = (awardData) => {
    if (!awardData) return [];
    
    const allAwards = [
      ...(awardData.regularSeasonAwards || []),
      ...(awardData.playoffAwards || []),
      ...(awardData.suspenseAwards || [])
    ];
    
    // Sort the awards to match the order they were presented
    const sortOrder = {
      "President's Trophy": 1,
      "Art Ross Trophy": 2,
      "Maurice Richard Trophy": 3,
      "William M. Jennings Trophy": 4,
      "Prince of Wales Trophy": 5,
      "Clarence S. Campbell Bowl": 6,
      "Stanley Cup": 7,
      "Conn Smythe Trophy": 8,
      "Hart Memorial Trophy": 9,
      "Norris Trophy": 10,
      "Rod Langway Award": 11,
      "Frank J. Selke Trophy": 12,
      "Vezina Trophy": 13,
      "Calder Memorial Trophy": 14,
      "Ted Lindsay Award": 15,
      "King Clancy Memorial Trophy": 16,
      "Mark Messier Leadership Award": 17,
      "Lady Byng Memorial Trophy": 18,
      "Bill Masterton Memorial Trophy": 19,
      "Jack Adams Award": 20,
      "Jim Gregory General Manager of the Year Award": 21
    };
    
    return allAwards.sort((a, b) => {
      return (sortOrder[a.name] || 100) - (sortOrder[b.name] || 100);
    });
  };
  
  // Loading state
  if (loading) {
    return (
      <CeremonyContainer>
        <Header>
          <SeasonTitle>
            <FaTrophy /> {gameYear} NHL Awards
          </SeasonTitle>
        </Header>
        <CeremonyStage>
          <div style={{ textAlign: 'center', color: '#C4CED4' }}>
            <h2>Loading awards data...</h2>
            <p>Please wait while we prepare the ceremony</p>
          </div>
        </CeremonyStage>
      </CeremonyContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <CeremonyContainer>
        <Header>
          <BackButton onClick={handleBackToMenu}>
            <FaChevronLeft />
          </BackButton>
          <SeasonTitle>
            <FaTrophy /> {gameYear} NHL Awards
          </SeasonTitle>
        </Header>
        <CeremonyStage>
          <div style={{ textAlign: 'center', color: '#B30E16' }}>
            <h2>Error Loading Data</h2>
            <p>{error}</p>
            <NavButton onClick={handleBackToMenu} style={{ marginTop: '20px' }}>
              Return to Awards Page
            </NavButton>
          </div>
        </CeremonyStage>
      </CeremonyContainer>
    );
  }
  
  return (
    <CeremonyContainer>
      <Header>
        <BackButton onClick={handleBackToMenu}>
          <FaChevronLeft />
        </BackButton>
        <SeasonTitle>
          <FaTrophy /> {gameYear} NHL Awards
        </SeasonTitle>
      </Header>
      
      <CeremonyStage>
        <StageBackground backgroundImage="/images/nhl_stage.jpg" />
        
        {ceremonyPhase === 'intro' && (
          <IntroContent>
            <h2>Welcome to the {gameYear} NHL Awards</h2>
          </IntroContent>
        )}
        
        {ceremonyPhase === 'closing' && (
          <ClosingContent>
            <h2>Thank you for attending the {gameYear} NHL Awards</h2>
            
            <RecapSection>
              <RecapTitle>Award Winners Recap</RecapTitle>
              <RecapGrid>
                {generateAwardsRecap(awardData).map((award) => (
                  <RecapCard key={award.id}>
                    <div className="award-name">
                      {award.type === 'Individual' ? <FaMedal /> : <FaTrophy />}
                      {award.name}
                    </div>
                    <div className="winner-name">
                      {award.winner.name}
                    </div>
                    <div className="winner-team">
                      {communityPack === 1 && (
                        <img 
                          src={getTeamLogo(award.winner.team || award.winner.abbreviation)} 
                          alt={award.winner.team || award.winner.abbreviation}
                          onError={(e) => { 
                            e.target.style.display = 'none';
                            const span = e.target.nextSibling;
                            if (span) {
                              span.style.marginLeft = '0';
                            }
                          }}
                        />
                      )}
                      <span>{award.winner.team || award.winner.abbreviation}</span>
                    </div>
                  </RecapCard>
                ))}
              </RecapGrid>
            </RecapSection>
          </ClosingContent>
        )}
        
        {/* Regular season awards */}
        {ceremonyPhase === 'regularSeason' && currentAward && (
          <AwardContent>
            <AwardTitle>{currentAward.name}</AwardTitle>
            <AwardDescription>{currentAward.description}</AwardDescription>
            
            {currentAward.finalists && (
              <FinalistsList>
                <h3>The finalists are:</h3>
                {currentAward.finalists.map((finalist, index) => (
                  <FinalistItem 
                    key={index} 
                    index={index} 
                    visible={visibleFinalists.includes(index)}
                  >
                    <FinalistName>{finalist.name}</FinalistName>
                    <FinalistTeam>
                      {communityPack === 1 && finalist.team && finalist.team !== 'N/A' && (
                        <img 
                          src={getTeamLogo(finalist.team)} 
                          alt={finalist.team} 
                          onError={(e) => {
                            // Replace with team code in a styled span
                            const parent = e.target.parentNode;
                            if (parent) {
                              const abbr = document.createElement('span');
                              abbr.innerText = finalist.team;
                              abbr.style.fontWeight = 'bold';
                              abbr.style.fontSize = '10px';
                              abbr.style.color = '#C4CED4';
                              parent.appendChild(abbr);
                            }
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <span>{finalist.team}</span>
                    </FinalistTeam>
                    <FinalistStats>{finalist.stats}</FinalistStats>
                  </FinalistItem>
                ))}
              </FinalistsList>
            )}
            
            <Winner>
              <WinnerHeading>Winner:</WinnerHeading>
              <WinnerCard>
                <WinnerName>
                  <FaStar /> {currentAward.winner.name}
                </WinnerName>
                <WinnerTeam>
                  {communityPack === 1 && (
                    <img 
                      src={getTeamLogo(currentAward.winner.team || currentAward.winner.abbreviation)} 
                      alt={currentAward.winner.team || currentAward.winner.abbreviation} 
                      onError={(e) => {
                        // Replace with team code in a styled span
                        const parent = e.target.parentNode;
                        if (parent) {
                          const abbr = document.createElement('span');
                          abbr.innerText = currentAward.winner.team || currentAward.winner.abbreviation;
                          abbr.style.fontWeight = 'bold';
                          abbr.style.fontSize = '12px';
                          abbr.style.color = '#C4CED4';
                          parent.appendChild(abbr);
                        }
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <span>{currentAward.winner.team || currentAward.winner.abbreviation}</span>
                </WinnerTeam>
                <WinnerStats>{currentAward.winner.stats}</WinnerStats>
              </WinnerCard>
            </Winner>
          </AwardContent>
        )}
        
        {/* Championship trophies all on one screen */}
        {ceremonyPhase === 'playoffs' && currentAwardIndex === 0 && (
          <AwardContent>
            <AwardTitle>Championship Trophies</AwardTitle>
            <AwardDescription>Conference Champions and Stanley Cup Winner</AwardDescription>
            {renderConferenceAndCupDisplay()}
          </AwardContent>
        )}
        
        {/* Other playoff awards (like Conn Smythe) */}
        {ceremonyPhase === 'playoffs' && currentAwardIndex > 0 && currentAward && (
          <AwardContent>
            <AwardTitle>{currentAward.name}</AwardTitle>
            <AwardDescription>{currentAward.description}</AwardDescription>
            
            {currentAward.finalists && (
              <FinalistsList>
                <h3>The finalists are:</h3>
                {currentAward.finalists.map((finalist, index) => (
                  <FinalistItem 
                    key={index} 
                    index={index} 
                    visible={visibleFinalists.includes(index)}
                  >
                    <FinalistName>{finalist.name}</FinalistName>
                    <FinalistTeam>
                      {communityPack === 1 && finalist.team && finalist.team !== 'N/A' && (
                        <img 
                          src={getTeamLogo(finalist.team)} 
                          alt={finalist.team} 
                          onError={(e) => {
                            // Replace with team code in a styled span
                            const parent = e.target.parentNode;
                            if (parent) {
                              const abbr = document.createElement('span');
                              abbr.innerText = finalist.team;
                              abbr.style.fontWeight = 'bold';
                              abbr.style.fontSize = '10px';
                              abbr.style.color = '#C4CED4';
                              parent.appendChild(abbr);
                            }
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <span>{finalist.team}</span>
                    </FinalistTeam>
                    <FinalistStats>{finalist.stats}</FinalistStats>
                  </FinalistItem>
                ))}
              </FinalistsList>
            )}
            
            <Winner>
              <WinnerHeading>Winner:</WinnerHeading>
              <WinnerCard>
                <WinnerName>
                  <FaStar /> {currentAward.winner.name}
                </WinnerName>
                <WinnerTeam>
                  {communityPack === 1 && (
                    <img 
                      src={getTeamLogo(currentAward.winner.team || currentAward.winner.abbreviation)} 
                      alt={currentAward.winner.team || currentAward.winner.abbreviation} 
                      onError={(e) => {
                        // Replace with team code in a styled span
                        const parent = e.target.parentNode;
                        if (parent) {
                          const abbr = document.createElement('span');
                          abbr.innerText = currentAward.winner.team || currentAward.winner.abbreviation;
                          abbr.style.fontWeight = 'bold';
                          abbr.style.fontSize = '12px';
                          abbr.style.color = '#C4CED4';
                          parent.appendChild(abbr);
                        }
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <span>{currentAward.winner.team || currentAward.winner.abbreviation}</span>
                </WinnerTeam>
                <WinnerStats>{currentAward.winner.stats}</WinnerStats>
              </WinnerCard>
            </Winner>
          </AwardContent>
        )}
        
        {/* Suspense awards with improved animations */}
        {ceremonyPhase === 'suspense' && currentAward && (
          <AwardContent>
            <div>
              <AwardTitle>{currentAward.name}</AwardTitle>
              <AwardDescription>{currentAward.description}</AwardDescription>
            </div>
            
            {!showingFinalists && !showingFinalistsHeading && (
              <div style={{ flexGrow: 1 }}></div> // Spacer to maintain consistent layout
            )}
            
            {showingFinalistsHeading && (
              <FinalistsHeading visible={showingFinalistsHeading}>
                The finalists are:
              </FinalistsHeading>
            )}
            
            {showingFinalists && (
              <FinalistsList>
                {currentAward.finalists.map((finalist, index) => (
                  <FinalistItem 
                    key={`${currentAward.id}-finalist-${index}`}
                    index={index} 
                    visible={visibleFinalists.includes(index)}
                  >
                    <FinalistName>{finalist.name}</FinalistName>
                    <FinalistTeam>
                      {communityPack === 1 && finalist.team && finalist.team !== 'N/A' && (
                        <img 
                          src={getTeamLogo(finalist.team)} 
                          alt={finalist.team} 
                          onError={(e) => {
                            // Replace with team code in a styled span
                            const parent = e.target.parentNode;
                            if (parent) {
                              const abbr = document.createElement('span');
                              abbr.innerText = finalist.team;
                              abbr.style.fontWeight = 'bold';
                              abbr.style.fontSize = '10px';
                              abbr.style.color = '#C4CED4';
                              parent.appendChild(abbr);
                            }
                            e.target.style.display = 'none';
                          }}
                        />
                      )}
                      <span>{finalist.team}</span>
                    </FinalistTeam>
                    <FinalistStats>{finalist.stats}</FinalistStats>
                  </FinalistItem>
                ))}
              </FinalistsList>
            )}
            
            {revealWinner && (
              <Winner>
                <WinnerHeading>And the winner is...</WinnerHeading>
                <WinnerCard>
                  <WinnerName>
                    <FaStar /> {currentAward.winner.name}
                  </WinnerName>
                  <WinnerTeam>
                    {communityPack === 1 && currentAward.winner.team && currentAward.winner.team !== 'N/A' && (
                      <img 
                        src={getTeamLogo(currentAward.winner.team || currentAward.winner.abbreviation)} 
                        alt={currentAward.winner.team || currentAward.winner.abbreviation} 
                        onError={(e) => {
                          // Replace with team code in a styled span
                          const parent = e.target.parentNode;
                          if (parent) {
                            const abbr = document.createElement('span');
                            abbr.innerText = currentAward.winner.team || currentAward.winner.abbreviation;
                            abbr.style.fontWeight = 'bold';
                            abbr.style.fontSize = '12px';
                            abbr.style.color = '#C4CED4';
                            parent.appendChild(abbr);
                          }
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <span>{currentAward.winner.team || currentAward.winner.abbreviation}</span>
                  </WinnerTeam>
                  <WinnerStats>{currentAward.winner.stats}</WinnerStats>
                </WinnerCard>
              </Winner>
            )}
          </AwardContent>
        )}
      </CeremonyStage>
      
      <NavigationControls>
        <NavButton 
          onClick={goToPreviousAward} 
          disabled={ceremonyPhase === 'intro' || isAnimating}
        >
          <FaChevronLeft /> Previous
        </NavButton>
        
        <NavButton 
          onClick={toggleAutoplay}
          autoplay={true}
          isActive={isAutoplaying}
          style={{ 
            backgroundColor: isAutoplaying ? '#25a244' : '#666',
            margin: '0 10px'
          }}
        >
          {isAutoplaying ? 'Autoplay On' : 'Autoplay Off'}
        </NavButton>
        
        {ceremonyPhase === 'closing' ? (
          <ExitButton onClick={handleBackToMenu}>
            Exit <FaSignOutAlt />
          </ExitButton>
        ) : (
          <NavButton 
            onClick={goToNextAward}
            disabled={ceremonyPhase === 'closing' || isAnimating}
          >
            Next <FaChevronRight />
          </NavButton>
        )}
      </NavigationControls>
      
      <ProgressIndicator>
        <ProgressDot active={ceremonyPhase === 'intro'} />
        <ProgressDot active={ceremonyPhase === 'regularSeason'} />
        <ProgressDot active={ceremonyPhase === 'playoffs'} />
        <ProgressDot active={ceremonyPhase === 'suspense'} />
        <ProgressDot active={ceremonyPhase === 'closing'} />
      </ProgressIndicator>
    </CeremonyContainer>
  );
};

export default AwardsCeremony; 