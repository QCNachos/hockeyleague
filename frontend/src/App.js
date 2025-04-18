import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import MainLayout from './components/layout/MainLayout';

// Pages
import Home from './pages/Home';
import PlayerEditor from './pages/PlayerEditor';
import TeamManager from './pages/TeamManager';
import GameSimulation from './pages/GameSimulation';
import Calendar from './pages/Calendar';
import Statistics from './pages/Statistics';
import Standings from './pages/Standings';
import Contracts from './pages/Contracts';
import Draft from './pages/Draft';
import Login from './pages/Login';
import Register from './pages/Register';
import LineCombinations from './pages/LineCombinations';
import AssetMovement from './pages/AssetMovement';

// Game Modes
import FranchiseMode from './pages/gameModes/FranchiseMode';
import BeAProMode from './pages/gameModes/BeAProMode';
import BeAProCreate from './pages/gameModes/BeAProCreate';
import Tournaments from './pages/gameModes/Tournaments';
import OwnerMode from './pages/gameModes/OwnerMode';
import SeasonMode from './pages/gameModes/SeasonMode';
import TournamentSetup from './pages/gameModes/TournamentSetup';
import StanleyCupSetup from './pages/gameModes/StanleyCupSetup';

// Auth guard component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Main app routes with layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          
          {/* Game Modes */}
          <Route path="franchise" element={<FranchiseMode />} />
          <Route path="be-a-pro" element={<BeAProMode />} />
          <Route path="be-a-pro/create/:startType" element={<BeAProCreate />} />
          <Route path="tournaments" element={<Tournaments />} />
          <Route path="tournaments/stanley-cup/setup" element={<StanleyCupSetup />} />
          <Route path="tournaments/stanley-cup/play" element={<div>Stanley Cup Playoffs (Coming Soon)</div>} />
          <Route path="tournaments/:tournamentId/setup" element={<TournamentSetup />} />
          <Route path="tournaments/play" element={<div>Tournament Play Page (Coming Soon)</div>} />
          <Route path="owner" element={<OwnerMode />} />
          <Route path="season" element={<SeasonMode />} />
          
          {/* Management */}
          <Route path="players" element={<PlayerEditor />} />
          <Route path="teams" element={<TeamManager />} />
          <Route path="games" element={<GameSimulation />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="lines" element={<LineCombinations />} />
          <Route path="line-combinations" element={<LineCombinations />} />
          <Route path="line-combinations/:league/:teamId" element={<LineCombinations />} />
          <Route path="asset-movement" element={<AssetMovement />} />
          
          {/* Analytics */}
          <Route path="stats" element={<Statistics />} />
          <Route path="standings" element={<Standings />} />
          
          {/* Protected routes */}
          <Route 
            path="contracts" 
            element={
              <PrivateRoute>
                <Contracts />
              </PrivateRoute>
            }
          />
          <Route 
            path="draft" 
            element={
              <PrivateRoute>
                <Draft />
              </PrivateRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
