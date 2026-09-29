import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SoundProvider } from './context/SoundContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailsPage from './pages/TeamDetailsPage';
import PlayersPage from './pages/PlayersPage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailsPage from './pages/TournamentDetailsPage';
import CreateMatchPage from './pages/CreateMatchPage';
import MatchSetupPage from './pages/MatchSetupPage';
import LiveScoreboardPage from './pages/LiveScoreboardPage';
import PublicScoreboardPage from './pages/PublicScoreboardPage';
import MatchHistoryPage from './pages/MatchHistoryPage';
import MatchDetailsPage from './pages/MatchDetailsPage';
import PlayerStatsPage from './pages/PlayerStatsPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

// Layout wrapper to hide nav/footer on spectator public scoreboard
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isSpectatorScoreboard = location.pathname.startsWith('/live/');

  if (isSpectatorScoreboard) {
    return <ErrorBoundary>{children}</ErrorBoundary>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-hoop-dark text-slate-100">
      <Navbar />
      <main className="flex-1 pb-12">
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <SoundProvider>
          <Router>
            <AppLayout>
              <Routes>
                {/* Public Spectator Display (TV / Projector View) */}
                <Route path="/live/:matchId" element={<PublicScoreboardPage />} />

                {/* Authentication */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Main Dashboard */}
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Teams */}
                <Route path="/teams" element={<TeamsPage />} />
                <Route path="/teams/:id" element={<TeamDetailsPage />} />

                {/* Players & Stats */}
                <Route path="/players" element={<PlayersPage />} />
                <Route path="/player-stats" element={<PlayerStatsPage />} />

                {/* Tournaments */}
                <Route path="/tournaments" element={<TournamentsPage />} />
                <Route path="/tournaments/:id" element={<TournamentDetailsPage />} />

                {/* Match Scheduling & Pre-Game Setup (Admin / Scorer) */}
                <Route
                  path="/matches/create"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <CreateMatchPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/matches/:id/setup"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'scorer']}>
                      <MatchSetupPage />
                    </ProtectedRoute>
                  }
                />

                {/* Live Match Scoreboard Console */}
                <Route
                  path="/matches/:id/live"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'scorer', 'viewer']}>
                      <LiveScoreboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Match History & Official Details */}
                <Route path="/history" element={<MatchHistoryPage />} />
                <Route path="/matches/:id" element={<MatchDetailsPage />} />

                {/* Settings */}
                <Route path="/settings" element={<SettingsPage />} />

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </AppLayout>
          </Router>
        </SoundProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
