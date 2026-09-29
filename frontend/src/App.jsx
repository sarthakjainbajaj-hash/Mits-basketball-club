import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { SoundProvider } from './context/SoundContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Eager loaded for instant homepage render
import DashboardPage from './pages/DashboardPage';

// Lazy-loaded routes (code-split to drastically speed up initial page download)
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const TeamsPage = lazy(() => import('./pages/TeamsPage'));
const TeamDetailsPage = lazy(() => import('./pages/TeamDetailsPage'));
const PlayersPage = lazy(() => import('./pages/PlayersPage'));
const PlayerStatsPage = lazy(() => import('./pages/PlayerStatsPage'));
const TournamentsPage = lazy(() => import('./pages/TournamentsPage'));
const TournamentDetailsPage = lazy(() => import('./pages/TournamentDetailsPage'));
const CreateMatchPage = lazy(() => import('./pages/CreateMatchPage'));
const MatchSetupPage = lazy(() => import('./pages/MatchSetupPage'));
const LiveScoreboardPage = lazy(() => import('./pages/LiveScoreboardPage'));
const PublicScoreboardPage = lazy(() => import('./pages/PublicScoreboardPage'));
const MatchHistoryPage = lazy(() => import('./pages/MatchHistoryPage'));
const MatchDetailsPage = lazy(() => import('./pages/MatchDetailsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageLoader = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Layout wrapper to hide nav/footer on spectator public scoreboard
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isSpectatorScoreboard = location.pathname.startsWith('/live/');

  if (isSpectatorScoreboard) {
    return <ErrorBoundary><Suspense fallback={<PageLoader />}>{children}</Suspense></ErrorBoundary>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-hoop-dark text-slate-100">
      <Navbar />
      <main className="flex-1 pb-12">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
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
