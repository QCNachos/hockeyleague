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

// Game Modes
import FranchiseMode from './pages/gameModes/FranchiseMode';
import BeAProMode from './pages/gameModes/BeAProMode';
import BeAProCreate from './pages/gameModes/BeAProCreate';
import Tournaments from './pages/gameModes/Tournaments';

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
          
          {/* Management */}
          <Route path="players" element={<PlayerEditor />} />
          <Route path="teams" element={<TeamManager />} />
          <Route path="games" element={<GameSimulation />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="lines" element={<LineCombinations />} />
          
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
