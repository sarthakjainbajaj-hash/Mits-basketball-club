import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSound } from '../context/SoundContext';
import {
  Trophy,
  Users,
  Activity,
  Calendar,
  Volume2,
  VolumeX,
  LogIn,
  LogOut,
  User as UserIcon,
  Shield,
  Clock,
  History,
  BarChart3,
  Settings,
  Flame,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isScorer } = useAuth();
  const { isConnected } = useSocket();
  const { soundEnabled, toggleSound } = useSound();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Tournaments', path: '/tournaments', icon: Trophy },
    { name: 'Teams', path: '/teams', icon: Shield },
    { name: 'Players', path: '/players', icon: Users },
    { name: 'Stats', path: '/player-stats', icon: BarChart3 },
    { name: 'History', path: '/history', icon: History },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-hoop-court/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-digital text-xl font-black tracking-wider text-white">HOOP</span>
                <span className="font-digital text-xl font-black tracking-wider text-orange-500">SCORE</span>
                <span className="text-[10px] uppercase font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30 tracking-wider">
                  3X3
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight leading-none hidden sm:block">
                Live Scoring & Match Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Action Icons & User Status */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Live Socket Connection Status Dot */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                isConnected
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-red-950/60 text-red-400 border-red-800/60 animate-pulse'
              }`}
              title={isConnected ? 'Realtime Engine Synced' : 'Disconnected, Reconnecting...'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span className="hidden sm:inline">{isConnected ? 'LIVE SYNC' : 'RECONNECTING'}</span>
            </div>

            {/* Sound Synthesizer Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border text-sm transition-colors ${
                soundEnabled
                  ? 'bg-slate-800 text-amber-400 border-amber-500/30 hover:bg-slate-700'
                  : 'bg-slate-900 text-slate-500 border-slate-800 hover:bg-slate-800'
              }`}
              title={soundEnabled ? 'Buzzer Sound: ON' : 'Buzzer Sound: MUTED'}
              aria-label="Toggle Arena Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Settings Link */}
            <Link
              to="/settings"
              className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center space-x-2 pl-1 border-l border-slate-800">
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider ${
                      user.role === 'admin'
                        ? 'text-amber-400'
                        : user.role === 'scorer'
                        ? 'text-cyan-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-red-400 hover:bg-red-950/30 hover:border-red-800/40 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm font-semibold shadow-md shadow-orange-600/30 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-800/60 space-x-2 scrollbar-none">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  isActive(link.path)
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
