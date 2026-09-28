import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchApi } from '../api/matchApi';
import { teamApi } from '../api/teamApi';
import { playerApi } from '../api/playerApi';
import {
  Activity,
  Trophy,
  Users,
  Shield,
  PlayCircle,
  Calendar,
  Flame,
  PlusCircle,
  ArrowRight,
  Tv,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const DashboardPage = () => {
  const { user, isAdmin, isScorer } = useAuth();
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [playersCount, setPlayersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [matchesRes, teamsRes, playersRes] = await Promise.all([
        matchApi.getAll(),
        teamApi.getAll(),
        playerApi.getAll(),
      ]);

      setMatches(matchesRes?.data || []);
      setTeams(teamsRes?.data || []);
      setPlayersCount(playersRes?.count || 0);
    } catch (err) {
      setToast({ message: 'Error loading dashboard data: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const liveMatches = matches.filter((m) => m.status === 'LIVE' || m.status === 'PAUSED');
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED');
  const upcomingMatches = matches.filter((m) => m.status === 'SCHEDULED');

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysMatches = matches.filter((m) => {
    const mDate = m.scheduledDate ? new Date(m.scheduledDate).toISOString().slice(0, 10) : '';
    return mDate === todayStr;
  });

  const featuredLiveMatch = liveMatches.length > 0 ? liveMatches[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-hoop-court to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
              Basketball 3x3 Control Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Welcome back, <span className="text-orange-500">{user?.name || 'Coach'}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Live match scoring, 12-second shot clock control, team management, and tournament standings.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10">
          {isAdmin && (
            <Link
              to="/matches/create"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Create Match
            </Link>
          )}

          {featuredLiveMatch && (
            <Link
              to={`/matches/${featuredLiveMatch._id}/live`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-95 animate-pulse"
            >
              <PlayCircle className="w-4 h-4" /> Open Live Scoreboard
            </Link>
          )}

          <Link
            to="/teams"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
          >
            <Shield className="w-4 h-4" /> Teams
          </Link>

          <Link
            to="/players"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all"
          >
            <Users className="w-4 h-4" /> Players
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[
          { label: 'Total Matches', value: matches.length, icon: Activity, color: 'text-cyan-400', border: 'border-cyan-500/20' },
          { label: 'Live Matches', value: liveMatches.length, icon: Flame, color: 'text-orange-500', border: 'border-orange-500/30', highlight: true },
          { label: 'Completed', value: completedMatches.length, icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'Total Teams', value: teams.length, icon: Shield, color: 'text-amber-400', border: 'border-amber-500/20' },
          { label: 'Total Players', value: playersCount, icon: Users, color: 'text-purple-400', border: 'border-purple-500/20' },
          { label: "Today's Games", value: todaysMatches.length, icon: Calendar, color: 'text-blue-400', border: 'border-blue-500/20' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl bg-slate-900/80 border ${item.border} backdrop-blur-sm shadow-lg flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider">{item.label}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className={`font-digital text-3xl font-black ${item.color}`}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Featured Live Match Card (If any live match) */}
      {featuredLiveMatch && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-orange-500/50 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
                ACTIVE 3X3 GAME IN PROGRESS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={`/live/${featuredLiveMatch._id}`}
                target="_blank"
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 text-xs font-bold text-slate-300 hover:text-white border border-slate-700"
              >
                <Tv className="w-3.5 h-3.5" /> Spectator View
              </Link>
              {isScorer && (
                <Link
                  to={`/matches/${featuredLiveMatch._id}/live`}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white shadow-md shadow-orange-600/30"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Scorer Console
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 py-4 border-y border-slate-800">
            {/* Team A */}
            <div className="flex items-center justify-center md:justify-end gap-4 text-right">
              <div>
                <h3 className="text-xl font-bold text-white">{featuredLiveMatch.teamA?.name}</h3>
                <p className="text-xs text-slate-400 font-mono">Fouls: {featuredLiveMatch.foulsA || 0}</p>
              </div>
              <span className="font-digital text-5xl font-black text-amber-400 led-amber">
                {featuredLiveMatch.scoreA}
              </span>
            </div>

            {/* Match Status & Venue */}
            <div className="flex flex-col items-center justify-center text-center">
              <span className="text-xs font-mono text-orange-400 font-bold bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30 mb-1">
                Target: {featuredLiveMatch.targetScore || 21} PTS
              </span>
              <p className="text-sm font-semibold text-slate-200">{featuredLiveMatch.matchName}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" /> {featuredLiveMatch.venue || 'Center Court'}
              </p>
            </div>

            {/* Team B */}
            <div className="flex items-center justify-center md:justify-start gap-4 text-left">
              <span className="font-digital text-5xl font-black text-cyan-400 led-cyan">
                {featuredLiveMatch.scoreB}
              </span>
              <div>
                <h3 className="text-xl font-bold text-white">{featuredLiveMatch.teamB?.name}</h3>
                <p className="text-xs text-slate-400 font-mono">Fouls: {featuredLiveMatch.foulsB || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Recent Matches & Upcoming Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Matches */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white text-base">Recent Completed Matches</h2>
            </div>
            <Link
              to="/history"
              className="text-xs font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {completedMatches.length > 0 ? (
              completedMatches.slice(0, 4).map((m) => (
                <Link
                  key={m._id}
                  to={`/matches/${m._id}`}
                  className="block p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 font-mono">
                    <span>{m.tournamentId?.name || 'Exhibition 3x3'}</span>
                    <span>{new Date(m.scheduledDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 font-bold text-white group-hover:text-orange-400 transition-colors">
                      {m.teamA?.shortName || m.teamA?.name}
                    </div>
                    <div className="px-3 py-1 rounded-lg bg-slate-900 font-digital font-bold text-base text-amber-400 border border-slate-700">
                      {m.scoreA} - {m.scoreB}
                    </div>
                    <div className="flex-1 text-right font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {m.teamB?.shortName || m.teamB?.name}
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1.5 font-mono flex items-center justify-center gap-1">
                    <Sparkles className="w-3 h-3" /> Winner: {m.winner === 'A' ? m.teamA?.name : m.winner === 'B' ? m.teamB?.name : 'Draw'}
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">No completed matches recorded yet</p>
            )}
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-white text-base">Upcoming Schedule</h2>
            </div>
            {isAdmin && (
              <Link
                to="/matches/create"
                className="text-xs font-mono text-orange-400 hover:text-orange-300 flex items-center gap-1"
              >
                Schedule Game <PlusCircle className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="space-y-3">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.slice(0, 4).map((m) => (
                <div
                  key={m._id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-mono text-slate-400">
                      {new Date(m.scheduledDate).toLocaleDateString()} @ {m.scheduledTime || '18:00'}
                    </div>
                    <div className="font-bold text-white text-sm mt-0.5">
                      {m.teamA?.name} vs {m.teamB?.name}
                    </div>
                    <div className="text-xs text-slate-500">{m.venue || 'Center Court'}</div>
                  </div>

                  {isScorer && (
                    <Link
                      to={`/matches/${m._id}/setup`}
                      className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md"
                    >
                      Stage & Start
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">No upcoming matches scheduled</p>
            )}
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default DashboardPage;
