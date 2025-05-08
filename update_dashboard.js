#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Path to the SeasonDashboard.js file
const dashboardPath = path.join(__dirname, 'frontend/src/pages/gameModes/SeasonDashboard.js');

// First, add the imports at the top
fs.readFile(dashboardPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Add imports after the existing imports
  const importPattern = /import PlayerSilhouette from '\.\.\/\.\.\/assets\/Player_silouette\.png';/;
  const newImports = `import PlayerSilhouette from '../../assets/Player_silouette.png';
import FreeAgentsContent from '../../components/FreeAgentsContent';
import ContractsContent from '../../components/ContractsContent';`;
  
  let modifiedData = data.replace(importPattern, newImports);

  // Update the renderContractsContent function
  const contractsPattern = /const renderContractsContent = \(\) => \{[\s\S]*?return[\s\S]*?<EmptyState>[\s\S]*?<\/EmptyState>[\s\S]*?\);[\s\S]*?\};/g;
  const newContractsContent = `const renderContractsContent = () => {
    return <ContractsContent teamLevel={teamLevel} rotateTeamLevel={rotateTeamLevel} />;
  };`;
  
  modifiedData = modifiedData.replace(contractsPattern, newContractsContent);

  // Update the renderFreeAgentsContent function
  const freeAgentsPattern = /const renderFreeAgentsContent = \(\) => \{[\s\S]*?return[\s\S]*?<EmptyState>[\s\S]*?<\/EmptyState>[\s\S]*?\);[\s\S]*?\};/g;
  const newFreeAgentsContent = `const renderFreeAgentsContent = () => {
    return <FreeAgentsContent teamLevel={teamLevel} rotateTeamLevel={rotateTeamLevel} />;
  };`;
  
  modifiedData = modifiedData.replace(freeAgentsPattern, newFreeAgentsContent);

  // Write the modified content back to the file
  fs.writeFile(dashboardPath, modifiedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('SeasonDashboard.js updated successfully!');
  });
}); 