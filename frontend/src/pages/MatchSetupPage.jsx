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
  RefreshCw,
  UserPlus,
  Plus,
  Sliders,
  X,
  AlertCircle,
  Calendar,
  MapPin,
  Edit3,
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
  const [isSyncing, setIsSyncing] = useState(false);

  // Edit Schedule Modal State
  const [isEditScheduleModalOpen, setIsEditScheduleModalOpen] = useState(false);
  const [isUpdatingSchedule, setIsUpdatingSchedule] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    matchName: '',
    scheduledDate: '',
    scheduledTime: '',
    venue: '',
  });

  // Timing & Structure local state
  const [matchStructure, setMatchStructure] = useState('QUARTERS'); // 'QUARTERS' | 'HALVES' | 'SINGLE'
  const [quarterDuration, setQuarterDuration] = useState(600);
  const [shotClock, setShotClock] = useState(24);

  // Add / Replace Player Modal State
  const [playerModal, setPlayerModal] = useState({
    isOpen: false,
    team: 'A',
    name: '',
    jerseyNumber: '',
    position: 'Guard',
    replacePlayerId: '',
    asStarter: false,
  });
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

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
      if (matchData?.settings) {
        setMatchStructure(matchData.settings.matchStructure || (matchData.matchType === '5x5' ? 'QUARTERS' : 'SINGLE'));
        setQuarterDuration(matchData.settings.quarterDuration || matchData.gameDuration || 600);
        setShotClock(matchData.settings.shotClock !== undefined ? matchData.settings.shotClock : (matchData.matchType === '5x5' ? 24 : 12));
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

  // Open Edit Schedule Modal
  const handleOpenEditSchedule = () => {
    if (!match) return;
    const rawDate = match.scheduledDate ? new Date(match.scheduledDate) : new Date();
    const yyyy = rawDate.getFullYear();
    const mm = String(rawDate.getMonth() + 1).padStart(2, '0');
    const dd = String(rawDate.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    setScheduleForm({
      matchName: match.matchName || '',
      scheduledDate: formattedDate,
      scheduledTime: match.scheduledTime || '18:00',
      venue: match.venue || '',
    });
    setIsEditScheduleModalOpen(true);
  };

  // Save Updated Schedule & Court Details
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingSchedule(true);
      await matchApi.update(id, {
        matchName: scheduleForm.matchName,
        scheduledDate: scheduleForm.scheduledDate,
        scheduledTime: scheduleForm.scheduledTime,
        venue: scheduleForm.venue,
      });
      setToast({ message: 'Match schedule & timing updated successfully!', type: 'success' });
      setIsEditScheduleModalOpen(false);
      await fetchMatch();
    } catch (err) {
      setToast({ message: 'Failed to update schedule: ' + err.message, type: 'error' });
    } finally {
      setIsUpdatingSchedule(false);
    }
  };

  // Update Game Structure / Period Duration / Shot Clock
  const handleUpdateTiming = async (newStructure, newDuration, newShotClock) => {
    const updatedStructure = newStructure ?? matchStructure;
    const updatedDuration = newDuration ?? quarterDuration;
    const updatedShotClock = newShotClock ?? shotClock;

    setMatchStructure(updatedStructure);
    setQuarterDuration(updatedDuration);
    setShotClock(updatedShotClock);

    try {
      await matchApi.update(id, {
        'settings.matchStructure': updatedStructure,
        'settings.quarterDuration': updatedDuration,
        'settings.gameDuration': updatedDuration,
        'settings.shotClock': updatedShotClock,
        'settings.numberOfQuarters': updatedStructure === 'HALVES' ? 2 : (match?.matchType === '3x3' ? 1 : 4),
        currentPeriod: updatedStructure === 'HALVES' ? 'H1' : (match?.matchType === '3x3' ? 'REGULATION' : 'Q1'),
        remainingTime: updatedDuration,
        gameDuration: updatedDuration,
        shotClockRemaining: updatedShotClock,
        shotClockDuration: updatedShotClock,
      });
      setToast({
        message: `Timing updated: ${updatedStructure === 'HALVES' ? '2 Halves' : '4 Quarters'} @ ${Math.floor(updatedDuration / 60)}:00`,
        type: 'success',
      });
      fetchMatch();
    } catch (err) {
      setToast({ message: 'Failed to update timing: ' + err.message, type: 'error' });
    }
  };

  // Sync Latest Players from Teams Directory
  const handleSyncRosters = async () => {
    try {
      setIsSyncing(true);
      const res = await matchApi.syncRosters(id);
      setToast({ message: res.data?.message || 'Rosters refreshed with latest team players!', type: 'success' });
      await fetchMatch();
    } catch (err) {
      setToast({ message: 'Failed to sync rosters: ' + err.message, type: 'error' });
    } finally {
      setIsSyncing(false);
    }
  };

  // Add or Replace Player Submit
  const handleAddPlayerSubmit = async (e) => {
    e.preventDefault();
    if (!playerModal.name || playerModal.jerseyNumber === '') {
      setToast({ message: 'Please enter player name and jersey number', type: 'error' });
      return;
    }
    try {
      setIsAddingPlayer(true);
      await matchApi.addOrReplacePlayer(id, {
        team: playerModal.team,
        name: playerModal.name,
        jerseyNumber: Number(playerModal.jerseyNumber),
        position: playerModal.position,
        replacePlayerId: playerModal.replacePlayerId || null,
        asStarter: playerModal.asStarter,
      });
      setToast({
        message: playerModal.replacePlayerId
          ? `Player replaced successfully with #${playerModal.jerseyNumber} ${playerModal.name}!`
          : `New player #${playerModal.jerseyNumber} ${playerModal.name} added to roster!`,
        type: 'success',
      });
      setPlayerModal({
        isOpen: false,
        team: 'A',
        name: '',
        jerseyNumber: '',
        position: 'Guard',
        replacePlayerId: '',
        asStarter: false,
      });
      await fetchMatch();
    } catch (err) {
      setToast({ message: 'Failed to add/replace player: ' + err.message, type: 'error' });
    } finally {
      setIsAddingPlayer(false);
    }
  };

  const handleLaunchMatch = async () => {
    try {
      // Update possession first
      await matchApi.togglePossession(match._id, initialPossession);

      // Persist chosen timeout duration & settings
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
          to={match.tournamentId?._id ? `/tournaments/${match.tournamentId._id}` : '/dashboard'}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {match.tournamentId?.name ? `Back to ${match.tournamentId.name}` : 'Back to Dashboard'}
        </Link>

        {(isAdmin || isScorer) && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncRosters}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white font-mono text-xs border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
              title="Refresh rosters from Teams directory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Team Players'}</span>
            </button>
            <button
              onClick={handleDeleteMatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-400 hover:text-white font-bold text-xs border border-red-800/60 shadow transition-all active:scale-95"
              title="Delete Match"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Match</span>
            </button>
          </div>
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
                {matchStructure === 'HALVES' ? '2 Halves' : is5x5 ? '4 Quarters' : '1 Period'} (
                {Math.floor(quarterDuration / 60)}:00)
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white mt-3">
              {match.matchName}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
              <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5 bg-slate-950/70 px-3 py-1 rounded-xl border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {new Date(match.scheduledDate || match.createdAt).toLocaleDateString()} @ {match.scheduledTime || '18:00'}
                </span>
              </span>
              <span className="text-xs font-mono text-slate-300 flex items-center gap-1.5 bg-slate-950/70 px-3 py-1 rounded-xl border border-slate-800">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>{match.venue || 'Center Court'}</span>
              </span>
              {(isAdmin || isScorer) && (
                <button
                  type="button"
                  onClick={handleOpenEditSchedule}
                  className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  title="Edit Date, Timing & Court"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Reschedule Match</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400 font-mono mt-2 flex flex-wrap items-center gap-3">
              <span>Shot Clock: {shotClock === 0 ? 'OFF (Disabled)' : `${shotClock}s`}</span>
              <span>•</span>
              <span>Target: {match.targetScore ? `${match.targetScore} PTS (Sudden Win)` : 'Time Limit'}</span>
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

      {/* Match Timing & Game Structure Settings (Customizable before match start) */}
      {is5x5 && (
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white text-base">Match Structure & Period Timing</h2>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
              {matchStructure === 'HALVES' ? '2 Halves Format' : '4 Quarters Format'}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            College tournaments me aksar 2 Halves (15 or 20 min) khele jaate hain. Yaha se match start hone se pehle timing adjust karein:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Structure: Quarters vs Halves */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                1. Select Game Structure
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateTiming('QUARTERS', quarterDuration === 900 ? 600 : quarterDuration, null)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    matchStructure === 'QUARTERS'
                      ? 'border-cyan-500 bg-cyan-500/20 text-white ring-2 ring-cyan-500/30'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-bold text-xs text-cyan-400">4 Quarters (FIBA)</p>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">Q1, Q2, Q3, Q4</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateTiming('HALVES', 900, null)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    matchStructure === 'HALVES'
                      ? 'border-amber-500 bg-amber-500/20 text-white ring-2 ring-amber-500/30'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-bold text-xs text-amber-400">2 Halves (College)</p>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">Half 1 & Half 2</p>
                </button>
              </div>
            </div>

            {/* Duration per Period / Half */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                2. {matchStructure === 'HALVES' ? 'Duration per Half' : 'Duration per Quarter'}
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(matchStructure === 'HALVES'
                  ? [
                      { label: '10 Min', val: 600 },
                      { label: '15 Min', val: 900 },
                      { label: '20 Min', val: 1200 },
                      { label: '25 Min', val: 1500 },
                    ]
                  : [
                      { label: '5 Min', val: 300 },
                      { label: '8 Min', val: 480 },
                      { label: '10 Min', val: 600 },
                      { label: '12 Min', val: 720 },
                    ]
                ).map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => handleUpdateTiming(null, opt.val, null)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-mono font-bold border transition-all ${
                      quarterDuration === opt.val
                        ? 'border-orange-500 bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/40'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Shot Clock Option */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <span className="text-xs font-mono text-slate-400">
              Shot Clock Setting: <strong className="text-white">{shotClock === 0 ? 'OFF (Disabled)' : `${shotClock}s`}</strong>
            </span>
            <div className="flex items-center gap-2">
              {[
                { label: '24s', val: 24 },
                { label: '14s', val: 14 },
                { label: 'OFF', val: 0 },
              ].map((sc) => (
                <button
                  key={sc.val}
                  type="button"
                  onClick={() => handleUpdateTiming(null, null, sc.val)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                    shotClock === sc.val
                      ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
                Official FIBA standard 60-second team timeout
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

      {/* Roster Breakdown (Starters & Substitutes) with Direct Add/Replace Player */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team A Roster */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-400" />
              <h3 className="font-bold text-white text-sm">{match.teamA?.name} Lineup</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                {teamAStarters.length} Starters • {teamASubs.length} Subs
              </span>
              {(isAdmin || isScorer) && (
                <button
                  onClick={() => setPlayerModal({
                    isOpen: true,
                    team: 'A',
                    name: '',
                    jerseyNumber: '',
                    position: 'Guard',
                    replacePlayerId: '',
                    asStarter: false,
                  })}
                  className="px-2 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs font-mono font-bold flex items-center gap-1 border border-orange-500/30"
                  title="Add or replace player for Team A"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Player</span>
                </button>
              )}
            </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    Starter
                  </span>
                  {(isAdmin || isScorer) && (
                    <button
                      onClick={() => setPlayerModal({
                        isOpen: true,
                        team: 'A',
                        name: '',
                        jerseyNumber: '',
                        position: p.position || 'Guard',
                        replacePlayerId: (p.player?._id || p.player).toString(),
                        asStarter: true,
                      })}
                      className="text-[10px] font-mono text-slate-400 hover:text-orange-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
                      title="Replace this absent/injured player"
                    >
                      Swap
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Substitutes */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
              Bench Substitutes ({teamASubs.length})
            </span>
            {teamASubs.length > 0 ? (
              teamASubs.map((p) => (
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
              ))
            ) : (
              <p className="text-xs text-slate-500 font-mono italic">No substitutes on bench</p>
            )}
          </div>
        </div>

        {/* Team B Roster */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">{match.teamB?.name} Lineup</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                {teamBStarters.length} Starters • {teamBSubs.length} Subs
              </span>
              {(isAdmin || isScorer) && (
                <button
                  onClick={() => setPlayerModal({
                    isOpen: true,
                    team: 'B',
                    name: '',
                    jerseyNumber: '',
                    position: 'Guard',
                    replacePlayerId: '',
                    asStarter: false,
                  })}
                  className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-xs font-mono font-bold flex items-center gap-1 border border-cyan-500/30"
                  title="Add or replace player for Team B"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Player</span>
                </button>
              )}
            </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    Starter
                  </span>
                  {(isAdmin || isScorer) && (
                    <button
                      onClick={() => setPlayerModal({
                        isOpen: true,
                        team: 'B',
                        name: '',
                        jerseyNumber: '',
                        position: p.position || 'Guard',
                        replacePlayerId: (p.player?._id || p.player).toString(),
                        asStarter: true,
                      })}
                      className="text-[10px] font-mono text-slate-400 hover:text-cyan-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800"
                      title="Replace this absent/injured player"
                    >
                      Swap
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Substitutes */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">
              Bench Substitutes ({teamBSubs.length})
            </span>
            {teamBSubs.length > 0 ? (
              teamBSubs.map((p) => (
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
              ))
            ) : (
              <p className="text-xs text-slate-500 font-mono italic">No substitutes on bench</p>
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
          <span>START {is5x5 ? '5x5' : '3x3'} GAME & OPEN LIVE SCOREBOARD</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* MODAL: ADD / EMERGENCY REPLACE PLAYER */}
      {playerModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">
                  {playerModal.replacePlayerId ? 'Emergency Swap / Replace Player' : 'Add Player to Roster'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {playerModal.team === 'A' ? match.teamA?.name : match.teamB?.name}
                </p>
              </div>
              <button
                onClick={() => setPlayerModal({ ...playerModal, isOpen: false })}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPlayerSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Team
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPlayerModal({ ...playerModal, team: 'A', replacePlayerId: '' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      playerModal.team === 'A'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {match.teamA?.name || 'Team A'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlayerModal({ ...playerModal, team: 'B', replacePlayerId: '' })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      playerModal.team === 'B'
                        ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    {match.teamB?.name || 'Team B'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={playerModal.name}
                  onChange={(e) => setPlayerModal({ ...playerModal, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Jersey #
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="99"
                    placeholder="23"
                    value={playerModal.jerseyNumber}
                    onChange={(e) => setPlayerModal({ ...playerModal, jerseyNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                    Position
                  </label>
                  <select
                    value={playerModal.position}
                    onChange={(e) => setPlayerModal({ ...playerModal, position: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  >
                    <option value="Guard">Guard</option>
                    <option value="Forward">Forward</option>
                    <option value="Center">Center</option>
                  </select>
                </div>
              </div>

              {/* Replace existing player or Add to bench */}
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
                  Roster Assignment
                </label>
                <select
                  value={playerModal.replacePlayerId}
                  onChange={(e) => setPlayerModal({ ...playerModal, replacePlayerId: e.target.value, asStarter: Boolean(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value="">Add as Bench Substitute</option>
                  <optgroup label="Replace Active Court Player (Unavailable/Late)">
                    {(playerModal.team === 'A' ? teamAStarters : teamBStarters).map((p) => {
                      const pid = (p.player?._id || p.player).toString();
                      return (
                        <option key={pid} value={pid}>
                          Replace #{p.jerseyNumber} {p.name} (Starter)
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerModal({ ...playerModal, isOpen: false })}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingPlayer}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/30 disabled:opacity-50"
                >
                  {isAddingPlayer ? 'Saving...' : playerModal.replacePlayerId ? 'Swap & Replace' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Match Schedule & Venue Modal */}
      {isEditScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditScheduleModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Reschedule Match</h3>
                <p className="text-xs text-slate-400 font-mono">Update scheduled date, kick-off time, and court venue</p>
              </div>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Match Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={scheduleForm.matchName}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, matchName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Match Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.scheduledDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                    Match Time
                  </label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.scheduledTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase tracking-wider mb-1.5">
                  Court / Venue
                </label>
                <input
                  type="text"
                  value={scheduleForm.venue}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, venue: e.target.value })}
                  placeholder="e.g. Main Arena Court, Court 2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditScheduleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingSchedule}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all disabled:opacity-50"
                >
                  {isUpdatingSchedule ? 'Saving Schedule...' : 'Save Schedule Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default MatchSetupPage;
