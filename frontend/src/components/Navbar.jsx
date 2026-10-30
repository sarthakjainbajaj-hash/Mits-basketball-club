import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSound } from '../context/SoundContext';
import {
  Trophy,
  Users,
  Activity,
  Volume2,
  VolumeX,
  LogIn,
  LogOut,
  User as UserIcon,
  Shield,
  History,
  BarChart3,
  Settings,
  Flame,
  Menu,
  X,
  ChevronRight,
  Radio,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin, isScorer, isSuperAdmin } = useAuth();
  const { isConnected } = useSocket();
  const { soundEnabled, toggleSound } = useSound();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
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

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return { label: 'SUPER ADMIN', className: 'text-rose-400 bg-rose-950/60 border-rose-800/60' };
      case 'admin':
        return { label: 'ADMIN', className: 'text-amber-400 bg-amber-950/60 border-amber-800/60' };
      case 'scorer':
        return { label: 'OFFICIAL SCORER', className: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60' };
      default:
        return { label: 'VIEWER', className: 'text-slate-400 bg-slate-800/80 border-slate-700' };
    }
  };

  return (
    <nav className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 transition-all w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group min-w-0 flex-shrink-0"
            aria-label="HoopScore Home"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-600/30 group-hover:scale-105 transition-transform flex-shrink-0">
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-digital text-lg sm:text-xl font-black tracking-wider text-white">
                  HOOP
                </span>
                <span className="font-digital text-lg sm:text-xl font-black tracking-wider text-orange-500">
                  SCORE
                </span>
                <span className="text-[10px] uppercase font-bold bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30 tracking-wider">
                  3X3
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight leading-none hidden sm:block">
                Live Scoring & Match Management
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links (>= lg: 1024px) */}
          <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Actions (>= lg) */}
          <div className="hidden lg:flex items-center space-x-2.5 flex-shrink-0">
            {/* Live Socket Connection Status Dot */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono font-medium border flex-shrink-0 ${
                isConnected
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-red-950/60 text-red-400 border-red-800/60 animate-pulse'
              }`}
              title={isConnected ? 'Realtime Engine Synced' : 'Disconnected, Reconnecting...'}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span>{isConnected ? 'LIVE SYNC' : 'RECONNECTING'}</span>
            </div>

            {/* Sound Synthesizer Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border text-sm transition-colors flex-shrink-0 ${
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
              className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
              title="Settings"
              aria-label="Platform Settings"
            >
              <Settings className="w-4 h-4" />
            </Link>

            {/* Performance Telemetry Link (Admin only) */}
            {isAdmin && (
              <Link
                to="/performance"
                className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-orange-400 hover:border-orange-500/30 hover:bg-slate-800 transition-colors flex-shrink-0"
                title="Performance & Latency Monitor"
                aria-label="Performance Monitor"
              >
                <Activity className="w-4 h-4 text-orange-400" />
              </Link>
            )}

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-800 flex-shrink-0">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border inline-block ${
                      getRoleBadge(user.role).className
                    }`}
                  >
                    {getRoleBadge(user.role).label}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 hover:border-rose-800/40 transition-colors flex-shrink-0"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all flex-shrink-0"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile Right Controls (< lg: Hamburger + Quick Live Dot) */}
          <div className="flex lg:hidden items-center gap-2 flex-shrink-0">
            {/* Compact Live Dot */}
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono font-bold border ${
                isConnected
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  : 'bg-red-950/60 text-red-400 border-red-800/60 animate-pulse'
              }`}
              title={isConnected ? 'Realtime Connected' : 'Disconnected'}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
            </div>

            {/* Mobile Hamburger Toggle Button - 44px touch target */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-all active:scale-95"
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-orange-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Slide-Down Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-950 border-b border-slate-800 shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto p-4 space-y-4">
            {/* Navigation Links Grid */}
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3">
                Tournament Menu
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all min-h-[48px] ${
                        active
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'text-slate-300 hover:text-white bg-slate-900/80 border border-slate-800/80 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            active ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{link.name}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${active ? 'text-orange-400' : 'text-slate-500'}`} />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions (Sound & Settings) */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 px-3">
                Match & System Controls
              </span>
              <div className="grid grid-cols-2 gap-2">
                {/* Arena Buzzer Sound Button */}
                <button
                  onClick={toggleSound}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-xs font-semibold min-h-[48px] transition-all text-left ${
                    soundEnabled
                      ? 'bg-amber-950/30 text-amber-300 border-amber-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${soundEnabled ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold">Arena Sound</div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {soundEnabled ? 'Buzzer ON' : 'Buzzer MUTED'}
                    </div>
                  </div>
                </button>

                {/* Settings Link */}
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold min-h-[48px] transition-all"
                >
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold">Settings</div>
                    <div className="text-[10px] font-mono text-slate-400">Rules & Audio</div>
                  </div>
                </Link>
              </div>

              {/* Performance Telemetry Link (Admin only) */}
              {isAdmin && (
                <Link
                  to="/performance"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-orange-950/20 border border-orange-500/30 text-orange-300 text-xs font-semibold min-h-[48px] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-orange-600/20 text-orange-400">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-white">Performance Telemetry</div>
                      <div className="text-[10px] font-mono text-orange-400/80">API & DB Latency Monitor</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-orange-400" />
                </Link>
              )}

              {/* Realtime Sync Status Card */}
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Radio className={`w-4 h-4 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
                  <span className="text-slate-300">Live Socket Engine</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    isConnected
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                      : 'bg-red-950/60 text-red-400 border-red-800/60'
                  }`}
                >
                  {isConnected ? 'Connected' : 'Reconnecting...'}
                </span>
              </div>
            </div>

            {/* User Account / Auth Section */}
            <div className="pt-2 border-t border-slate-800/80">
              {user ? (
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 flex-shrink-0">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{user.name}</div>
                      <span
                        className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border inline-block mt-0.5 ${
                          getRoleBadge(user.role).className
                        }`}
                      >
                        {getRoleBadge(user.role).label}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-bold font-mono flex items-center gap-1.5 flex-shrink-0 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md shadow-orange-600/30 transition-all min-h-[48px]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs transition-all min-h-[48px]"
                  >
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
