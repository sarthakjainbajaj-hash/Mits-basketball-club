import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchApi } from '../api/matchApi';
import {
  Shield,
  Clock,
  PlayCircle,
  Coins,
  ArrowRight,
  ArrowLeft,
  Users,
  CheckCircle2,
  Tv,
  Flame,
  Award,
  Zap,
  Trash2,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const MatchSetupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isScorer } = useAuth();

  const [match, setMatch] = useState(null);
  const [initialPossession, setInitialPossession] = useState('A');
  const [timeoutDuration, setTimeoutDuration] = useState(60);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const res = await matchApi.getById(id);
      const matchData = res?.data;
      setMatch(matchData);
      if (matchData?.possession) {
        setInitialPossession(matchData.possession);
      }
      if (matchData?.timeoutDuration || matchData?.settings?.timeoutDuration) {
        setTimeoutDuration(matchData.timeoutDuration || matchData.settings?.timeoutDuration || 60);
      }
    } catch (err) {
      setToast({ message: 'Error loading match setup: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTimeoutDuration = async (seconds) => {
    setTimeoutDuration(seconds);
    try {
      await matchApi.update(id, {
        timeoutDuration: seconds,
        'settings.timeoutDuration': seconds,
      });
      setToast({
        message: `Timeout clock set to ${seconds >= 60 ? `${Math.floor(seconds / 60)} Min` : `${seconds}s`}`,
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to update timeout duration:', err);
    }
  };

  const handleLaunchMatch = async () => {
    try {
      // Update possession first
      await matchApi.togglePossession(match._id, initialPossession);

      // Persist chosen timeout duration
      await matchApi.update(match._id, {
        timeoutDuration,
        'settings.timeoutDuration': timeoutDuration,
      });

      // Start the match timer & status
      await matchApi.start(match._id);

      setToast({ message: 'Match launched! Opening live scoreboard...', type: 'success' });
      setTimeout(() => {
        navigate(`/matches/${match._id}/live`);
      }, 500);
    } catch (err) {
      setToast({ message: err.message || 'Failed to start match', type: 'error' });
    }
  };

  const handleDeleteMatch = async () => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete match "${match.matchName}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await matchApi.delete(id);
      setToast({ message: 'Match deleted successfully', type: 'success' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      setToast({ message: 'Failed to delete match: ' + err.message, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-white font-bold text-lg">Match not found</p>
        <Link to="/dashboard" className="text-orange-400 underline text-sm mt-2 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const is5x5 = match.matchType === '5x5';
  const teamAStarters = match.teamA_roster?.starters || match.playersA || [];
  const teamASubs = match.teamA_roster?.substitutes || [];
  const teamBStarters = match.teamB_roster?.starters || match.playersB || [];
  const teamBSubs = match.teamB_roster?.substitutes || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link & Delete Match */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {(isAdmin || isScorer) && (
          <button
            onClick={handleDeleteMatch}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 hover:text-white font-bold text-xs border border-red-800/60 shadow transition-all active:scale-95"
            title="Delete Match"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Match</span>
          </button>
        )}
      </div>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-black uppercase px-3 py-1 rounded-full border ${
                  is5x5
                    ? 'text-blue-400 bg-blue-500/10 border-blue-500/30'
                    : 'text-orange-400 bg-orange-500/10 border-orange-500/30'
                }`}
              >
                🏀 {is5x5 ? 'BASKETBALL 5x5' : 'BASKETBALL 3x3'} PRE-MATCH STAGING
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded border border-slate-700">
                {is5x5 ? '4 Quarters (10:00)' : '1 Period (10:00)'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white mt-3">
              {match.matchName}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1.5 flex flex-wrap items-center gap-3">
              <span>Venue: {match.venue || 'Center Court'}</span>
              <span>•</span>
              <span>Shot Clock: {match.settings?.shotClock || match.shotClockDuration || (is5x5 ? 24 : 12)}s</span>
              <span>•</span>
              <span>Target: {match.targetScore ? `${match.targetScore} PTS (Sudden Win)` : 'No Target (Time Limit)'}</span>
              <span>•</span>
              <span>Team Foul Bonus: {match.foulLimit || (is5x5 ? 5 : 7)} fouls</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/live/${match._id}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700"
            >
              <Tv className="w-4 h-4 text-cyan-400" /> Spectator Display
            </Link>
          </div>
        </div>
      </div>

      {/* Opening Possession Picker */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-white text-base">
            {is5x5 ? 'Opening Possession / Tip-Off Winner' : 'Coin Toss / Opening Possession'}
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          {is5x5
            ? 'Award the initial opening ball possession resulting from the official tip-off.'
            : 'In FIBA 3x3, a coin toss decides opening possession. The winner chooses starting ball or potential overtime.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Team A Option */}
          <button
            type="button"
            onClick={() => setInitialPossession('A')}
            className={`p-5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              initialPossession === 'A'
                ? 'bg-orange-500/20 border-orange-500 shadow-lg shadow-orange-500/10 ring-2 ring-orange-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-orange-400">
                TEAM A (HOME)
              </span>
              <h3 className="font-bold text-white text-lg mt-0.5">{match.teamA?.name}</h3>
              <p className="text-xs text-slate-400 font-mono">Starts with ball</p>
            </div>
            {initialPossession === 'A' && (
              <CheckCircle2 className="w-6 h-6 text-orange-500" />
            )}
          </button>

          {/* Team B Option */}
          <button
            type="button"
            onClick={() => setInitialPossession('B')}
            className={`p-5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              initialPossession === 'B'
                ? 'bg-cyan-500/20 border-cyan-500 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500/40'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                TEAM B (AWAY)
              </span>
              <h3 className="font-bold text-white text-lg mt-0.5">{match.teamB?.name}</h3>
              <p className="text-xs text-slate-400 font-mono">Starts with ball</p>
            </div>
            {initialPossession === 'B' && (
              <CheckCircle2 className="w-6 h-6 text-cyan-400" />
            )}
          </button>
        </div>
      </div>

      {/* Pre-Match Timeout Clock Setting (1 Min or 2 Min) */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-white text-base">Timeout Clock Duration</h2>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
            Selected: {timeoutDuration === 120 ? '2 Minutes' : '1 Minute'}
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Match shuru hone se pehle select karein ki team timeout lene par kitne minute ki clock chalegi (1 Min or 2 Min).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <button
            type="button"
            onClick={() => handleSelectTimeoutDuration(60)}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              timeoutDuration === 60
                ? 'border-orange-500 bg-orange-500/15 ring-2 ring-orange-500/30 shadow-lg'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-digital text-xl font-black text-amber-400">01:00</span>
                <span className="font-bold text-white text-sm">1 Minute (Standard)</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Official FIBA 3x3 standard 60-second team timeout
              </p>
            </div>
            {timeoutDuration === 60 && <CheckCircle2 className="w-5 h-5 text-orange-400" />}
          </button>

          <button
            type="button"
            onClick={() => handleSelectTimeoutDuration(120)}
            className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
              timeoutDuration === 120
                ? 'border-orange-500 bg-orange-500/15 ring-2 ring-orange-500/30 shadow-lg'
                : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-digital text-xl font-black text-amber-400">02:00</span>
                <span className="font-bold text-white text-sm">2 Minutes (Full Timeout)</span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-1">
                Extended 120-second team strategy & hydration break
              </p>
            </div>
            {timeoutDuration === 120 && <CheckCircle2 className="w-5 h-5 text-orange-400" />}
          </button>
        </div>
      </div>

      {/* Roster Breakdown (Starters & Substitutes) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team A Roster */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-white text-sm">{match.teamA?.name} Lineup</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {teamAStarters.length} Starters • {teamASubs.length} Subs
            </span>
          </div>

          {/* Starters */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-orange-400 block tracking-wider">
              On-Court Starters ({teamAStarters.length})
            </span>
            {teamAStarters.map((p) => (
              <div
                key={p.player?._id || p.player}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-orange-500/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-orange-500/20 font-digital font-bold text-amber-400 flex items-center justify-center text-xs">
                    #{p.jerseyNumber}
                  </span>
                  <span className="font-bold text-white text-xs">{p.name}</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  Starter
                </span>
              </div>
            ))}
          </div>

          {/* Substitutes */}
          {teamASubs.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                Bench Substitutes ({teamASubs.length})
              </span>
              {teamASubs.map((p) => (
                <div
                  key={p.player?._id || p.player}
                  className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 font-digital font-bold text-slate-400 flex items-center justify-center text-xs">
                      #{p.jerseyNumber}
                    </span>
                    <span className="font-medium text-slate-300 text-xs">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                    Bench
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team B Roster */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">{match.teamB?.name} Lineup</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {teamBStarters.length} Starters • {teamBSubs.length} Subs
            </span>
          </div>

          {/* Starters */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase text-cyan-400 block tracking-wider">
              On-Court Starters ({teamBStarters.length})
            </span>
            {teamBStarters.map((p) => (
              <div
                key={p.player?._id || p.player}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-cyan-500/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500/20 font-digital font-bold text-cyan-400 flex items-center justify-center text-xs">
                    #{p.jerseyNumber}
                  </span>
                  <span className="font-bold text-white text-xs">{p.name}</span>
                </div>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  Starter
                </span>
              </div>
            ))}
          </div>

          {/* Substitutes */}
          {teamBSubs.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
                Bench Substitutes ({teamBSubs.length})
              </span>
              {teamBSubs.map((p) => (
                <div
                  key={p.player?._id || p.player}
                  className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 font-digital font-bold text-slate-400 flex items-center justify-center text-xs">
                      #{p.jerseyNumber}
                    </span>
                    <span className="font-medium text-slate-300 text-xs">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30">
                    Bench
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Launch Action */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleLaunchMatch}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-base shadow-2xl shadow-emerald-600/40 flex items-center gap-3 active:scale-95 transition-all"
        >
          <PlayCircle className="w-6 h-6 animate-pulse" />
          <span>START {is5x5 ? '5x5' : '3x3'} GAME & OPEN LIVE SCOREBOARD</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MatchSetupPage;
