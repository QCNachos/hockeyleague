import React from 'react';
import styled from 'styled-components';

const RinkContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
`;

// The main SVG container for the rink
const RinkSVG = styled.svg`
  width: 100%;
  height: auto;
  display: block;
  background-color: #f4faff; /* Light ice blue color */
`;

const HockeyRink = ({ 
  width = 900, 
  height = 450, 
  positions = null,
  homeTeamColor = '#B30E16', // Red color for home team
  awayTeamColor = '#1a73e8', // Blue color for away team
  showPlayers = true
}) => {
  console.log("HockeyRink props:", { width, height, positions, showPlayers });
  // Real NHL rink dimensions (in feet)
  // Total rink: 200ft length x 85ft width (length is horizontal, width is vertical in our view)
  // Using these as reference to calculate proportions
  
  // Calculate center
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Calculate ice rink dimensions maintaining NHL proportions (200ft x 85ft)
  // We'll use the container width and calculate height based on proportions
  const rinkWidth = width * 0.96;
  const rinkHeight = (rinkWidth * 85) / 200; // Keep NHL aspect ratio
  const rinkX = (width - rinkWidth) / 2;
  const rinkY = (height - rinkHeight) / 2;
  
  // Corner radius for the rink (NHL rinks have rounded corners)
  const cornerRadius = Math.min(rinkWidth, rinkHeight) * 0.18;
  
  // Define team names based on reference
  const homeTeamName = "WSH";
  const awayTeamName = "NYI";
  
  // Goal line positions - NHL standard is 11ft from end boards
  const goalLineOffsetFromBoard = (11 / 200) * rinkWidth; // 11ft / 200ft * rinkWidth
  const homeGoalLineX = rinkX + goalLineOffsetFromBoard;
  const awayGoalLineX = rinkX + rinkWidth - goalLineOffsetFromBoard;
  
  // Blue lines positions - NHL standard is 64ft from goal line
  // Total neutral zone is 50ft (between blue lines)
  const blueLineDistFromGoalLine = (64 / 200) * rinkWidth; // 64ft / 200ft * rinkWidth
  const blueLine1X = homeGoalLineX + blueLineDistFromGoalLine;
  const blueLine2X = awayGoalLineX - blueLineDistFromGoalLine;
  const blueLineWidth = 2;
  
  // Center red line
  const redLineWidth = 2;
  const redLineDashArray = "5,5";
  
  // Faceoff circle positions and dimensions
  // In-zone faceoff circle diameter is 30ft
  const faceoffCircleDiameter = (30 / 85) * rinkHeight; // 30ft / 85ft * rinkHeight
  const faceoffRadius = faceoffCircleDiameter / 2;
  const faceoffDotRadius = 3;
  const lineLength = 7;
  const lineGap = 3;
  const markLength = 5;
  
  // Calculate in-zone faceoff circle positions
  // Faceoff dots are 44ft apart width-wise
  const inZoneFaceoffDistFromCenter = (44 / 2 / 85) * rinkHeight; // (44/2)ft / 85ft * rinkHeight
  
  // Calculate in-zone faceoff circle positions - NHL standard is 20 feet from goal line, 22 feet apart
  const faceoffDistFromGoalLine = (20 / 200) * rinkWidth; // 20ft / 200ft * rinkWidth
  const homeFaceoffX = homeGoalLineX + faceoffDistFromGoalLine;
  const awayFaceoffX = awayGoalLineX - faceoffDistFromGoalLine;
  const topFaceoffY = centerY - inZoneFaceoffDistFromCenter;
  const bottomFaceoffY = centerY + inZoneFaceoffDistFromCenter;
  
  // Neutral zone faceoff dots
  const neutralZoneDotsOffsetFromBlue = (5 / 200) * rinkWidth; // 5ft / 200ft * rinkWidth
  
  // Goal dimensions - based on NHL standards (6 feet wide, 4 feet high)
  const goalWidth = (6 / 85) * rinkHeight; // 6ft / 85ft * rinkHeight - increase width
  const goalHeight = goalWidth * 0.9; // Height proportional to width  (MODIFIED)
  const goalDepth = goalWidth * 0.55; // Deeper goal for better visibility
  
  // Goal crease - 8 feet wide (semi-circle extending from goal line)
  const goalCreaseWidth = (8.5 / 85) * rinkHeight; // 8ft / 85ft * rinkHeight (MODIFIED)
  const goalCreaseDepth = (4.5 / 200) * rinkWidth; // Reduce from 6ft to 4ft to make the D shape more obvious (MODIFIED)
  
  // Position goal mesh with front at the goal line, back extending behind the goal line
  // Calculate goal positions - the front of the net is at the goal line
  const homeGoalX = homeGoalLineX - goalDepth; // Position net with front at goal line, back behind the line
  const awayGoalX = awayGoalLineX; // Front of net at goal line
  const goalY = centerY - goalHeight / 2;
  
  // Calculate goalie positions - clearly in front of goal line in the crease
  // Based on reference image with green circle
  const homeGoalieX = homeGoalLineX + goalCreaseDepth * 2; // Well out in front of the crease
  const awayGoalieX = awayGoalLineX - goalCreaseDepth * 2; // Well out in front of the crease
  
  // Player dimensions
  const playerRadius = rinkHeight * 0.022;
  const playerStrokeWidth = 1;
  const playerStickLength = playerRadius * 1.5;
  const goalieRadius = playerRadius * 1.3;
  
  // Rotation angles for stick directions (relative to facing right)
  const homeDirection = 0;   // Home team faces right
  const awayDirection = 180; // Away team faces left
  
  // Benches and boxes dimensions
  const benchWidth = rinkWidth * 0.2;
  const benchHeight = 20;
  const benchGap = 5;
  const benchTextSize = 8;
  const smallTextSize = 7;
  
  // Player benches (top)
  const playerBench1X = centerX - benchWidth - benchGap;
  const playerBench2X = centerX + benchGap;
  const playerBenchY = rinkY - benchHeight - 5;
  
  // Penalty boxes and scorekeeper bench (bottom)
  // Make penalty boxes fit within neutral zone - distance between blue lines
  const neutralZoneWidth = blueLine2X - blueLine1X;
  const penaltyBoxWidth = neutralZoneWidth * 0.3;
  const scorekeeperWidth = neutralZoneWidth * 0.3;
  const bottomBoxesY = rinkY + rinkHeight + 5;
  
  // Position penalty boxes to align with blue lines
  const leftPenaltyX = blueLine1X + 10;
  const rightPenaltyX = blueLine2X - penaltyBoxWidth - 10;
  const scorekeeperX = centerX - scorekeeperWidth/2;
  
  // Render simple faceoff dot (for neutral zone)
  const renderFaceoffDot = (x, y) => {
    return (
      <circle 
        cx={x} 
        cy={y} 
        r={faceoffDotRadius} 
        fill="#ff0000" 
      />
    );
  };
  
  // Render the proper faceoff dot with vertical lines for in-zone faceoff circles
  const renderInZoneFaceoffDot = (x, y) => {
    return (
      <g>
        {/* Center faceoff dot */}
        <circle 
          cx={x} 
          cy={y} 
          r={faceoffDotRadius} 
          fill="#ff0000" 
        />
        
        {/* Left vertical line */}
        <line 
          x1={x - lineGap} 
          y1={y - lineLength} 
          x2={x - lineGap} 
          y2={y + lineLength} 
          stroke="#ff0000" 
          strokeWidth="1"
        />
        
        {/* Right vertical line */}
        <line 
          x1={x + lineGap} 
          y1={y - lineLength} 
          x2={x + lineGap} 
          y2={y + lineLength} 
          stroke="#ff0000" 
          strokeWidth="1"
        />
      </g>
    );
  };
  
  // Render faceoff circle with proper marks - positioned at top and bottom when viewed from above
  const renderFaceoffCircle = (x, y) => {
    return (
      <>
        {/* Main circle */}
        <circle 
          cx={x} 
          cy={y} 
          r={faceoffRadius} 
          fill="none" 
          stroke="#ff0000" 
          strokeWidth="1"
        />
        
        {/* Top marks (positioned horizontally when viewed from top) */}
        <line 
          x1={x - faceoffRadius * 0.2}
          y1={y - faceoffRadius}
          x2={x - faceoffRadius * 0.2}
          y2={y - faceoffRadius - markLength}
          stroke="#ff0000" 
          strokeWidth="1"
        />
        <line 
          x1={x + faceoffRadius * 0.2}
          y1={y - faceoffRadius}
          x2={x + faceoffRadius * 0.2}
          y2={y - faceoffRadius - markLength}
          stroke="#ff0000" 
          strokeWidth="1"
        />
        
        {/* Bottom marks (positioned horizontally when viewed from top) */}
        <line 
          x1={x - faceoffRadius * 0.2}
          y1={y + faceoffRadius}
          x2={x - faceoffRadius * 0.2}
          y2={y + faceoffRadius + markLength}
          stroke="#ff0000" 
          strokeWidth="1"
        />
        <line 
          x1={x + faceoffRadius * 0.2}
          y1={y + faceoffRadius}
          x2={x + faceoffRadius * 0.2}
          y2={y + faceoffRadius + markLength}
          stroke="#ff0000" 
          strokeWidth="1"
        />
        
        {/* Faceoff dot with vertical lines */}
        {renderInZoneFaceoffDot(x, y)}
      </>
    );
  };
  
  // Render player
  const renderPlayer = (x, y, number, teamColor, isHome, isGoalie = false) => {
    console.log(`Rendering player ${number} at (${x}, ${y}), isGoalie=${isGoalie}`);
    const radius = isGoalie ? goalieRadius : playerRadius;
    const direction = isHome ? homeDirection : awayDirection;
    
    // Calculate stick endpoint
    const angle = direction * (Math.PI / 180);
    const stickX = x + Math.cos(angle) * playerStickLength;
    const stickY = y + Math.sin(angle) * playerStickLength;
    
    return (
      <g key={`player-${teamColor}-${number}`}>
        {/* Player circle */}
        <circle 
          cx={x} 
          cy={y} 
          r={radius} 
          fill={teamColor} 
          stroke="#000" 
          strokeWidth={playerStrokeWidth}
        />
        
        {/* Stick */}
        <line 
          x1={x} 
          y1={y} 
          x2={stickX} 
          y2={stickY}
          stroke="#000" 
          strokeWidth="1.5"
        />
        
        {/* Player number */}
        <text 
          x={x} 
          y={y + 1.5} 
          textAnchor="middle" 
          dominantBaseline="middle"
          fontSize={radius * 1.2} 
          fill="white" 
          fontWeight="bold"
        >
          {number}
        </text>
      </g>
    );
  };
  
  // Render center ice logo
  const renderCenterLogo = () => {
    const logoRadius = faceoffRadius * 1.2;
    
    return (
      <g>
        <circle 
          cx={centerX} 
          cy={centerY} 
          r={logoRadius} 
          fill="#f9f9f9" 
          stroke="#dddddd" 
          strokeWidth="1"
        />
        <circle 
          cx={centerX} 
          cy={centerY} 
          r={logoRadius * 0.7} 
          fill="none" 
          stroke="#ff0000" 
          strokeWidth="1.5"
        />
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#333"
        >
          NHL
        </text>
      </g>
    );
  };
  
  // Render goal cage with net
  const renderGoal = (x, y, width, height, depth, isHome) => {
    // Calculate positions based on which side the goal is on
    const netX = isHome ? x : x;
    const netWidth = depth;
    const netHeight = height;
    
    return (
      <g>
        {/* Goal frame - thicker for visibility */}
        {isHome ? (
          <>
            {/* Home goal (left side) */}
            <rect
              x={x}
              y={y}
              width={depth}
              height={height}
              fill="none"
              stroke="#ff0000"
              strokeWidth="2.5"
            />
            
            {/* Goal posts */}
            <line
              x1={x + depth}
              y1={y}
              x2={x + depth}
              y2={y + height}
              stroke="#ff0000"
              strokeWidth="3"
            />
            
            {/* Net lines - vertical */}
            <line x1={x + depth*0.25} y1={y} x2={x + depth*0.25} y2={y + height} stroke="#999" strokeWidth="0.5" strokeDasharray="1,2" />
            <line x1={x + depth*0.5} y1={y} x2={x + depth*0.5} y2={y + height} stroke="#999" strokeWidth="0.5" strokeDasharray="1,2" />
            <line x1={x + depth*0.75} y1={y} x2={x + depth*0.75} y2={y + height} stroke="#999" strokeWidth="0.5" strokeDasharray="1,2" />
            
            {/* Net lines - horizontal */}
            <line x1={x} y1={y + height*0.33} x2={x + depth} y2={y + height*0.33} stroke="#999" strokeWidth="0.5" strokeDasharray="1,2" />
            <line x1={x} y1={y + height*0.66} x2={x + depth} y2={y + height*0.66} stroke="#999" strokeWidth="0.5" strokeDasharray="1,2" />
          </>
        ) : (
          <>
            {/* Away goal (right side) */}
            <rect
              x={x}
              y={y}
              width={depth}
              height={height}
              fill="none"
              stroke="#ff0000"
              strokeWidth="2.5"
            />
            
            {/* Goal posts */}
            <line
              x1={x}
              y1={y}
              x2={x}
              y2={y + height}
              stroke="#ff0000"
              strokeWidth="3"
            />
            
            {/* Net lines - vertical */}
            <line x1={x + depth*0.25} y1={y} x2={x + depth*0.25} y2={y + height} stroke="#999" strokeWidth="0.5" strokeDasharray="1,2" />
            <line x1={x + depth*0.5} y1={y} x2={x + depth*0.5} y2={y + height} stroke="#999" strokeWidth="0.5" strokeDasharray="1,2" />
            <line x1={x + depth*0.75} y1={y} x2={x + depth*0.75} y2={y + height} stroke="#999" strokeWidth="0.5" strokeDasharray="1,2" />
            
            {/* Net lines - horizontal */}
            <line x1={x} y1={y + height*0.33} x2={x + depth} y2={y + height*0.33} stroke="#999" strokeWidth="0.5" strokeDasharray="1,2" />
            <line x1={x} y1={y + height*0.66} x2={x + depth} y2={y + height*0.66} stroke="#999" strokeWidth="0.5" strokeDasharray="1,2" />
          </>
        )}
      </g>
    );
  };
  
  // Render players from positions data
  const renderPlayers = () => {
    if (!positions || !showPlayers) return null;
    
    console.log("USING REAL POSITION DATA:", positions);
    const playerElements = [];
    
    // Create a deep copy of positions to modify
    const modifiedPositions = JSON.parse(JSON.stringify(positions));
    
    // Explicitly set goalie positions to match the reference image
    // Check if home goalie exists in positions
    if (modifiedPositions.home) {
      console.log("Setting HOME team positions");
      
      // Set individual player positions by role
      const homePositions = {
        goalie: { x: 7, y: 50, set: false },           // HOME GOALIE - player 6
        center: { x: 49, y: 50, set: false },        // HOME CENTER - player 1
        left_wing: { x: 49, y: 29, set: false },       // HOME LEFT WING - player 2 - moved to left side
        right_wing: { x: 49, y: 71, set: false },      // HOME RIGHT WING - player 3 - moved to bottom left
        defense_left: { x: 38, y: 35, set: false },    // HOME LEFT DEFENSE - player 4 - closer to center
        defense_right: { x: 38, y: 65, set: false }    // HOME RIGHT DEFENSE - player 5 - closer to center
      };
      
      // Identify each player by role and assign positions
      Object.entries(modifiedPositions.home).forEach(([playerKey, playerData]) => {
        const role = playerData.role;
        const playerNum = parseInt(playerKey.replace('Player', ''));
        
        console.log(`Player ${playerKey} has role ${role} and number ${playerNum}`);
        
        // Map players by both role and player number to be extra safe
        if (role === 'goalie' || playerNum === 6) {
          console.log(`Setting HOME GOALIE position for ${playerKey}`);
          modifiedPositions.home[playerKey].x = homePositions.goalie.x;
          modifiedPositions.home[playerKey].y = homePositions.goalie.y;
          homePositions.goalie.set = true;
        }
        else if (role === 'center' || playerNum === 1) {
          console.log(`Setting HOME CENTER position for ${playerKey}`);
          modifiedPositions.home[playerKey].x = homePositions.center.x;
          modifiedPositions.home[playerKey].y = homePositions.center.y;
          homePositions.center.set = true;
        }
        else if (role === 'left_wing' || playerNum === 2) {
          console.log(`Setting HOME LEFT WING position for ${playerKey}`);
          modifiedPositions.home[playerKey].x = homePositions.left_wing.x;
          modifiedPositions.home[playerKey].y = homePositions.left_wing.y;
          homePositions.left_wing.set = true;
        }
        else if (role === 'right_wing' || playerNum === 3) {
          console.log(`Setting HOME RIGHT WING position for ${playerKey}`);
          modifiedPositions.home[playerKey].x = homePositions.right_wing.x;
          modifiedPositions.home[playerKey].y = homePositions.right_wing.y;
          homePositions.right_wing.set = true;
        }
        else if ((role === 'defense' && !homePositions.defense_left.set) || playerNum === 4) {
          console.log(`Setting HOME LEFT DEFENSE position for ${playerKey}`);
          modifiedPositions.home[playerKey].x = homePositions.defense_left.x;
          modifiedPositions.home[playerKey].y = homePositions.defense_left.y;
          homePositions.defense_left.set = true;
        }
        else if (role === 'defense' || playerNum === 5) {
          console.log(`Setting HOME RIGHT DEFENSE position for ${playerKey}`);
          modifiedPositions.home[playerKey].x = homePositions.defense_right.x;
          modifiedPositions.home[playerKey].y = homePositions.defense_right.y;
          homePositions.defense_right.set = true;
        }
      });
    }
    
    // Check if away team exists in positions
    if (modifiedPositions.away) {
      console.log("Setting AWAY team positions");
      
      // Set individual player positions by role
      const awayPositions = {
        goalie: { x: 93, y: 50, set: false },          // AWAY GOALIE - player 6
        center: { x: 51, y: 50, set: false },        // AWAY CENTER - player 1
        left_wing: { x: 51, y: 29, set: false },       // AWAY LEFT WING - player 2 - moved to right side
        right_wing: { x: 51, y: 71, set: false },      // AWAY RIGHT WING - player 3 - moved to bottom right
        defense_left: { x: 62, y: 35, set: false },    // AWAY LEFT DEFENSE - player 4 - closer to center
        defense_right: { x: 62, y: 65, set: false }    // AWAY RIGHT DEFENSE - player 5 - closer to center
      };
      
      // Identify each player by role and assign positions
      Object.entries(modifiedPositions.away).forEach(([playerKey, playerData]) => {
        const role = playerData.role;
        const playerNum = parseInt(playerKey.replace('Player', ''));
        
        console.log(`Player ${playerKey} has role ${role} and number ${playerNum}`);
        
        // Map players by both role and player number to be extra safe
        if (role === 'goalie' || playerNum === 6) {
          console.log(`Setting AWAY GOALIE position for ${playerKey}`);
          modifiedPositions.away[playerKey].x = awayPositions.goalie.x;
          modifiedPositions.away[playerKey].y = awayPositions.goalie.y;
          awayPositions.goalie.set = true;
        }
        else if (role === 'center' || playerNum === 1) {
          console.log(`Setting AWAY CENTER position for ${playerKey}`);
          modifiedPositions.away[playerKey].x = awayPositions.center.x;
          modifiedPositions.away[playerKey].y = awayPositions.center.y;
          awayPositions.center.set = true;
        }
        else if (role === 'left_wing' || playerNum === 2) {
          console.log(`Setting AWAY LEFT WING position for ${playerKey}`);
          modifiedPositions.away[playerKey].x = awayPositions.left_wing.x;
          modifiedPositions.away[playerKey].y = awayPositions.left_wing.y;
          awayPositions.left_wing.set = true;
        }
        else if (role === 'right_wing' || playerNum === 3) {
          console.log(`Setting AWAY RIGHT WING position for ${playerKey}`);
          modifiedPositions.away[playerKey].x = awayPositions.right_wing.x;
          modifiedPositions.away[playerKey].y = awayPositions.right_wing.y;
          awayPositions.right_wing.set = true;
        }
        else if ((role === 'defense' && !awayPositions.defense_left.set) || playerNum === 4) {
          console.log(`Setting AWAY LEFT DEFENSE position for ${playerKey}`);
          modifiedPositions.away[playerKey].x = awayPositions.defense_left.x;
          modifiedPositions.away[playerKey].y = awayPositions.defense_left.y;
          awayPositions.defense_left.set = true;
        }
        else if (role === 'defense' || playerNum === 5) {
          console.log(`Setting AWAY RIGHT DEFENSE position for ${playerKey}`);
          modifiedPositions.away[playerKey].x = awayPositions.defense_right.x;
          modifiedPositions.away[playerKey].y = awayPositions.defense_right.y;
          awayPositions.defense_right.set = true;
        }
      });
    }
    
    // Render home team players with modified positions
    Object.entries(modifiedPositions.home).forEach(([playerName, data]) => {
      if (data.role === 'bench' || data.role === 'backup_goalie') return;
      
      const x = (data.x / 100) * rinkWidth + rinkX;
      const y = (data.y / 100) * rinkHeight + rinkY;
      const playerNumber = playerName.replace('Player', '');
      const isGoalie = data.role === 'goalie';
      
      playerElements.push(
        renderPlayer(x, y, playerNumber, homeTeamColor, true, isGoalie)
      );
    });
    
    // Render away team players with modified positions
    Object.entries(modifiedPositions.away).forEach(([playerName, data]) => {
      if (data.role === 'bench' || data.role === 'backup_goalie') return;
      
      const x = (data.x / 100) * rinkWidth + rinkX;
      const y = (data.y / 100) * rinkHeight + rinkY;
      const playerNumber = playerName.replace('Player', '');
      const isGoalie = data.role === 'goalie';
      
      playerElements.push(
        renderPlayer(x, y, playerNumber, awayTeamColor, false, isGoalie)
      );
    });
    
    // Render puck - it should be separate from players
    if (modifiedPositions.puck) {
      const puckX = (modifiedPositions.puck.x / 100) * rinkWidth + rinkX;
      const puckY = (modifiedPositions.puck.y / 100) * rinkHeight + rinkY;
      
      playerElements.push(
        <circle 
          key="puck" 
          cx={puckX} 
          cy={puckY} 
          r={3.5} 
          fill="#000" 
        />
      );
    }
    
    return playerElements;
  };
  
  // For demonstration without API data - render static players in positions as shown in reference
  const renderDemoPlayers = () => {
    // Debug the positions variable
    console.log("positions variable:", positions);
    
    if (positions) {
      console.log("NOT SHOWING DEMO PLAYERS - positions is not null");
      return null; // If we have real positions, don't show demo players
    }
    
    console.log("SHOWING DEMO PLAYERS");
    
    const demoPlayers = [];
    
    // Initial faceoff positions - home team
    // Center (player 1) at center ice for faceoff
    demoPlayers.push(renderPlayer(centerX - playerRadius, centerY, 1, homeTeamColor, true));
    // Left wing (player 2) on the left wing position
    demoPlayers.push(renderPlayer(centerX - rinkWidth * 0.3, centerY - rinkHeight * 0.25, 2, homeTeamColor, true));
    // Right wing (player 3) on the right wing position
    demoPlayers.push(renderPlayer(centerX - rinkWidth * 0.3, centerY + rinkHeight * 0.25, 3, homeTeamColor, true));
    // Left defenseman (player 4) closer to center
    demoPlayers.push(renderPlayer(centerX - rinkWidth * 0.18, centerY - rinkHeight * 0.18, 4, homeTeamColor, true));
    // Right defenseman (player 5) closer to center
    demoPlayers.push(renderPlayer(centerX - rinkWidth * 0.18, centerY + rinkHeight * 0.18, 5, homeTeamColor, true));
    // Goalie (player 6) in position
    demoPlayers.push(renderPlayer(rinkX + rinkWidth * 0.08, centerY, 6, homeTeamColor, true, true));
    
    // Initial faceoff positions - away team
    // Center (player 1) at center ice for faceoff
    demoPlayers.push(renderPlayer(centerX + playerRadius, centerY, 1, awayTeamColor, false));
    // Left wing (player 2) on the left wing position
    demoPlayers.push(renderPlayer(centerX + rinkWidth * 0.3, centerY - rinkHeight * 0.25, 2, awayTeamColor, false));
    // Right wing (player 3) on the right wing position
    demoPlayers.push(renderPlayer(centerX + rinkWidth * 0.3, centerY + rinkHeight * 0.25, 3, awayTeamColor, false));
    // Left defenseman (player 4) closer to center
    demoPlayers.push(renderPlayer(centerX + rinkWidth * 0.18, centerY - rinkHeight * 0.18, 4, awayTeamColor, false));
    // Right defenseman (player 5) closer to center
    demoPlayers.push(renderPlayer(centerX + rinkWidth * 0.18, centerY + rinkHeight * 0.18, 5, awayTeamColor, false));
    // Goalie (player 6) in position
    demoPlayers.push(renderPlayer(rinkX + rinkWidth * 0.92, centerY, 6, awayTeamColor, false, true));
    
    return demoPlayers;
  };
  
  return (
    <RinkContainer>
      <RinkSVG viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Border around rink */}
        <rect 
          x={rinkX - 2} 
          y={rinkY - 2} 
          width={rinkWidth + 4} 
          height={rinkHeight + 4} 
          rx={cornerRadius + 2}
          ry={cornerRadius + 2}
          fill="#333" 
          strokeWidth="0"
        />
        
        {/* Main rink surface with rounded corners */}
        <rect 
          x={rinkX} 
          y={rinkY} 
          width={rinkWidth} 
          height={rinkHeight} 
          rx={cornerRadius}
          ry={cornerRadius}
          fill="#f4faff" 
          stroke="#999" 
          strokeWidth="0.5"
        />
        
        {/* Player benches (top) */}
        <rect 
          x={playerBench1X} 
          y={playerBenchY} 
          width={benchWidth} 
          height={benchHeight} 
          fill="#f9f9f9" 
          stroke="#333" 
          strokeWidth="1"
        />
        <text 
          x={playerBench1X + benchWidth/2} 
          y={playerBenchY + benchHeight/2 + 3} 
          textAnchor="middle" 
          fontSize={benchTextSize} 
          fontWeight="bold" 
          fill="#333"
        >
          PLAYERS BENCH
        </text>
        
        <rect 
          x={playerBench2X} 
          y={playerBenchY} 
          width={benchWidth} 
          height={benchHeight} 
          fill="#f9f9f9" 
          stroke="#333" 
          strokeWidth="1"
        />
        <text 
          x={playerBench2X + benchWidth/2} 
          y={playerBenchY + benchHeight/2 + 3} 
          textAnchor="middle" 
          fontSize={benchTextSize} 
          fontWeight="bold" 
          fill="#333"
        >
          PLAYERS BENCH
        </text>
        
        {/* Penalty boxes and scorekeeper (bottom) */}
        <rect 
          x={leftPenaltyX} 
          y={bottomBoxesY} 
          width={penaltyBoxWidth} 
          height={benchHeight} 
          fill="#f9f9f9" 
          stroke="#333" 
          strokeWidth="1"
        />
        <text 
          x={leftPenaltyX + penaltyBoxWidth/2} 
          y={bottomBoxesY + benchHeight/2 + 3} 
          textAnchor="middle" 
          fontSize={smallTextSize} 
          fontWeight="bold" 
          fill="#333"
        >
          PENALTY
        </text>
        
        <rect 
          x={scorekeeperX} 
          y={bottomBoxesY} 
          width={scorekeeperWidth} 
          height={benchHeight} 
          fill="#f9f9f9" 
          stroke="#333" 
          strokeWidth="1"
        />
        <text 
          x={centerX} 
          y={bottomBoxesY + benchHeight/2 + 3} 
          textAnchor="middle" 
          fontSize={smallTextSize} 
          fontWeight="bold" 
          fill="#333"
        >
          OFFICIALS
        </text>
        
        <rect 
          x={rightPenaltyX} 
          y={bottomBoxesY} 
          width={penaltyBoxWidth} 
          height={benchHeight} 
          fill="#f9f9f9" 
          stroke="#333" 
          strokeWidth="1"
        />
        <text 
          x={rightPenaltyX + penaltyBoxWidth/2} 
          y={bottomBoxesY + benchHeight/2 + 3} 
          textAnchor="middle" 
          fontSize={smallTextSize} 
          fontWeight="bold" 
          fill="#333"
        >
          PENALTY
        </text>
        
        {/* Team labels on sides of rink */}
        <text
          x={rinkX + 15}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill={homeTeamColor}
          transform={`rotate(-90, ${rinkX + 15}, ${centerY})`}
        >
          {homeTeamName}
        </text>
        
        <text
          x={rinkX + rinkWidth - 15}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fontWeight="bold"
          fill={awayTeamColor}
          transform={`rotate(90, ${rinkX + rinkWidth - 15}, ${centerY})`}
        >
          {awayTeamName}
        </text>
        
        {/* Goal lines */}
        <line 
          x1={homeGoalLineX} 
          y1={rinkY} 
          x2={homeGoalLineX} 
          y2={rinkY + rinkHeight} 
          stroke="#ff0000" 
          strokeWidth="1.5"
        />
        <line 
          x1={awayGoalLineX} 
          y1={rinkY} 
          x2={awayGoalLineX} 
          y2={rinkY + rinkHeight} 
          stroke="#ff0000" 
          strokeWidth="1.5"
        />
        
        {/* Blue lines */}
        <line 
          x1={blueLine1X} 
          y1={rinkY} 
          x2={blueLine1X} 
          y2={rinkY + rinkHeight} 
          stroke="#0000ff" 
          strokeWidth={blueLineWidth}
        />
        <line 
          x1={blueLine2X} 
          y1={rinkY} 
          x2={blueLine2X} 
          y2={rinkY + rinkHeight} 
          stroke="#0000ff" 
          strokeWidth={blueLineWidth}
        />
        
        {/* Red center line - dashed */}
        <line 
          x1={centerX} 
          y1={rinkY} 
          x2={centerX} 
          y2={rinkY + rinkHeight} 
          stroke="#ff0000" 
          strokeWidth={redLineWidth}
          strokeDasharray={redLineDashArray}
        />
        
        {/* Center logo */}
        {renderCenterLogo()}
        
        {/* Center faceoff circle */}
        <circle 
          cx={centerX} 
          cy={centerY} 
          r={faceoffRadius * 0.6} 
          fill="none" 
          stroke="#ff0000" 
          strokeWidth="1.5"
        />
        
        {/* Neutral zone faceoff dots - 4 dots in total, on both sides of center line */}
        {renderFaceoffDot(blueLine1X + neutralZoneDotsOffsetFromBlue, topFaceoffY)}
        {renderFaceoffDot(blueLine1X + neutralZoneDotsOffsetFromBlue, bottomFaceoffY)}
        {renderFaceoffDot(blueLine2X - neutralZoneDotsOffsetFromBlue, topFaceoffY)}
        {renderFaceoffDot(blueLine2X - neutralZoneDotsOffsetFromBlue, bottomFaceoffY)}
        
        {/* Faceoff circles in zones */}
        {renderFaceoffCircle(homeFaceoffX, topFaceoffY)}
        {renderFaceoffCircle(homeFaceoffX, bottomFaceoffY)}
        {renderFaceoffCircle(awayFaceoffX, topFaceoffY)}
        {renderFaceoffCircle(awayFaceoffX, bottomFaceoffY)}
        
        {/* Goals */}
        {renderGoal(homeGoalX, goalY, goalWidth, goalHeight, goalDepth, true)}
        {renderGoal(awayGoalX, goalY, goalWidth, goalHeight, goalDepth, false)}
        
        {/* Goal creases - with proper D shape */}
        <path 
          d={`M ${homeGoalLineX} ${centerY - goalCreaseWidth/2} 
               A ${goalCreaseDepth} ${goalCreaseWidth/2} 0 0 1 ${homeGoalLineX} ${centerY + goalCreaseWidth/2}`} 
          fill="none" 
          stroke="#ff0000" 
          strokeWidth="2.5"
        />
        <path 
          d={`M ${awayGoalLineX} ${centerY - goalCreaseWidth/2} 
               A ${goalCreaseDepth} ${goalCreaseWidth/2} 0 0 0 ${awayGoalLineX} ${centerY + goalCreaseWidth/2}`} 
          fill="none" 
          stroke="#ff0000" 
          strokeWidth="2.5"
        />
        
        {/* Add the flat part of the crease that connects to the goal line */}
        <line
          x1={homeGoalLineX}
          y1={centerY - goalCreaseWidth/2}
          x2={homeGoalLineX}
          y2={centerY + goalCreaseWidth/2}
          stroke="#ff0000"
          strokeWidth="2.5"
        />
        <line
          x1={awayGoalLineX}
          y1={centerY - goalCreaseWidth/2}
          x2={awayGoalLineX}
          y2={centerY + goalCreaseWidth/2}
          stroke="#ff0000"
          strokeWidth="2.5"
        />
        
        {/* Render demo players if no position data */}
        {renderDemoPlayers()}
        
        {/* Render players from positions data */}
        {renderPlayers()}
      </RinkSVG>
    </RinkContainer>
  );
};

export default HockeyRink; 