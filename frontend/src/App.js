import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import PlayerEditor from './pages/PlayerEditor';
import PlayerCreation from './pages/PlayerCreation';
import TeamManager from './pages/TeamManager';
import TeamEditor from './pages/TeamEditor';
import GameSimulation from './pages/GameSimulation';
import Calendar from './pages/Calendar';
import Statistics from './pages/Statistics';
import Standings from './pages/Standings';
import Contracts from './pages/Contracts';
import Draft from './pages/Draft';
import SimulateDraft from './pages/SimulateDraft';
import Login from './pages/Login';
import Register from './pages/Register';
import LineCombinations from './pages/LineCombinations';
import AssetMovement from './pages/AssetMovement';
import Awards from './pages/Awards';
import AwardsCeremony from './pages/AwardsCeremony';
import Settings from './pages/Settings';

// Components
import StatsDetailPage from './components/stats/StatsDetailPage';

// Game Modes
import FranchiseMode from './pages/gameModes/FranchiseMode';
import BeAProMode from './pages/gameModes/BeAProMode';
import BeAProCreate from './pages/gameModes/BeAProCreate';
import GameMode from './pages/gameModes/GameMode';
import PreGame from './pages/gameModes/PreGame';
import GameSimulationPage from './pages/gameModes/GameSimulationPage';
import Tournaments from './pages/gameModes/Tournaments';
import OwnerMode from './pages/gameModes/OwnerMode';
import SeasonMode from './pages/gameModes/SeasonMode';
import TournamentSetup from './pages/gameModes/TournamentSetup';
import StanleyCupSetup from './pages/gameModes/StanleyCupSetup';
import FranchiseSettings from './pages/gameModes/FranchiseSettings';
import FranchiseTeamSelection from './pages/gameModes/FranchiseTeamSelection';
import FranchiseExpansionSetup from './pages/gameModes/FranchiseExpansionSetup';
import FranchiseSummary from './pages/gameModes/FranchiseSummary';
import SeasonSetup from './pages/gameModes/SeasonSetup';
import SeasonDashboard from './pages/gameModes/SeasonDashboard';

// Auth guard component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Season Dashboard - Standalone layout */}
          <Route path="season/dashboard/:seasonId" element={<SeasonDashboard />} />
          
          {/* Main app routes with layout */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            
            {/* Game Modes */}
            <Route path="franchise" element={<FranchiseMode />} />
            <Route path="franchise/create/:franchiseType" element={<FranchiseSettings />} />
            <Route path="franchise/team-selection" element={<FranchiseTeamSelection />} />
            <Route path="franchise/expansion-setup" element={<FranchiseExpansionSetup />} />
            <Route path="franchise/summary" element={<FranchiseSummary />} />
            <Route path="franchise/setup" element={<div>Franchise Setup Page (Coming Soon)</div>} />
            <Route path="be-a-pro" element={<BeAProMode />} />
            <Route path="be-a-pro/create/:startType" element={<BeAProCreate />} />
            <Route path="game" element={<GameMode />} />
            <Route path="game/pre-game" element={<PreGame />} />
            <Route path="game/simulation" element={<GameSimulationPage />} />
            <Route path="game/simulation/:homeTeamId/:awayTeamId/:mode" element={<GameSimulationPage />} />
            <Route path="season" element={<SeasonMode />} />
            <Route path="season/create/:seasonType" element={<SeasonSetup />} />
            <Route path="tournaments" element={<Tournaments />} />
            <Route path="tournaments/stanley-cup/setup" element={<StanleyCupSetup />} />
            <Route path="tournaments/stanley-cup/play" element={<div>Stanley Cup Playoffs (Coming Soon)</div>} />
            <Route path="tournaments/:tournamentId/setup" element={<TournamentSetup />} />
            <Route path="tournaments/play" element={<div>Tournament Play Page (Coming Soon)</div>} />
            <Route path="owner" element={<OwnerMode />} />
            
            {/* Management */}
            <Route path="players" element={<PlayerEditor />} />
            <Route path="create-player" element={<PlayerCreation />} />
            <Route path="teams" element={<TeamManager />} />
            <Route path="team-manager" element={<TeamManager />} />
            <Route path="team-editor/:teamId" element={<TeamEditor />} />
            <Route path="games" element={<GameSimulation />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="lines" element={<LineCombinations />} />
            <Route path="line-combinations" element={<LineCombinations />} />
            <Route path="line-combinations/:league/:teamId" element={<LineCombinations />} />
            <Route path="asset-movement" element={<AssetMovement />} />
            
            {/* Analytics */}
            <Route path="stats" element={<Statistics />} />
            <Route path="stats/:playerType/:category" element={<StatsDetailPage />} />
            <Route path="standings" element={<Standings />} />
            <Route path="awards" element={<Awards />} />
            <Route path="awards-ceremony" element={<AwardsCeremony />} />
            <Route path="draft" element={<Draft />} />
            <Route path="simulate-draft" element={<SimulateDraft />} />
            
            {/* App Settings */}
            <Route path="settings" element={<Settings />} />
            
            {/* Protected routes */}
            <Route 
              path="contracts" 
              element={
                <PrivateRoute>
                  <Contracts />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
