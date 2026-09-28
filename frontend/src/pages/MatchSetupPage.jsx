import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const MatchSetupPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [initialPossession, setInitialPossession] = useState('A');
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
    } catch (err) {
      setToast({ message: 'Error loading match setup: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchMatch = async () => {
    try {
      // Update possession first
      await matchApi.togglePossession(match._id, initialPossession);

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30">
              PRE-MATCH STAGING & COIN TOSS
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-2">
              {match.matchName}
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Venue: {match.venue} • Target: {match.targetScore || 21} PTS • Shot Clock: {match.shotClockDuration || 12}s
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`/live/${match._id}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700"
            >
              <Tv className="w-4 h-4" /> Test Spectator Display
            </Link>
          </div>
        </div>
      </div>

      {/* Coin Toss / Initial Possession Picker */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold text-white text-base">Coin Toss / Opening Possession</h2>
        </div>
        <p className="text-xs text-slate-400">
          In FIBA 3x3, a coin toss decides opening possession. The winning team can choose possession at start of game or potential overtime.
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

      {/* Roster Verification Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team A Roster */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-white text-sm">{match.teamA?.name} Lineup</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {match.playersA?.length || 0} Registered
            </span>
          </div>

          <div className="space-y-2">
            {match.playersA && match.playersA.length > 0 ? (
              match.playersA.map((p) => (
                <div
                  key={p.player?._id || p.player}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 font-digital font-bold text-amber-400 flex items-center justify-center text-xs">
                      #{p.jerseyNumber}
                    </span>
                    <span className="font-bold text-white text-xs">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    Active 3x3
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">No players assigned</p>
            )}
          </div>
        </div>

        {/* Team B Roster */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">{match.teamB?.name} Lineup</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {match.playersB?.length || 0} Registered
            </span>
          </div>

          <div className="space-y-2">
            {match.playersB && match.playersB.length > 0 ? (
              match.playersB.map((p) => (
                <div
                  key={p.player?._id || p.player}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 font-digital font-bold text-cyan-400 flex items-center justify-center text-xs">
                      #{p.jerseyNumber}
                    </span>
                    <span className="font-bold text-white text-xs">{p.name}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    Active 3x3
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">No players assigned</p>
            )}
          </div>
        </div>
      </div>

      {/* Launch Action */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleLaunchMatch}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-base shadow-2xl shadow-emerald-600/40 flex items-center gap-3 active:scale-95 transition-all"
        >
          <PlayCircle className="w-6 h-6 animate-pulse" />
          <span>START GAME & OPEN LIVE SCOREBOARD</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MatchSetupPage;
