import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSound } from '../context/SoundContext';
import { matchApi } from '../api/matchApi';

import DigitalTimer from '../components/Scoreboard/DigitalTimer';
import ShotClock from '../components/Scoreboard/ShotClock';
import TeamScoreCard from '../components/Scoreboard/TeamScoreCard';
import PossessionArrow from '../components/Scoreboard/PossessionArrow';
import QuickScorerModal from '../components/Scoreboard/QuickScorerModal';
import SubstitutionModal from '../components/Scoreboard/SubstitutionModal';
import LivePlayerStats from '../components/Scoreboard/LivePlayerStats';
import Toast from '../components/Common/Toast';

import {
  Play,
  Pause,
  RotateCcw,
  Undo2,
  CheckCircle,
  Tv,
  Trophy,
  Volume2,
  VolumeX,
  ArrowLeft,
  ArrowRightLeft,
  FastForward,
  Flag,
} from 'lucide-react';

const LiveScoreboardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isScorer } = useAuth();
  const { socket, isConnected, joinMatch, leaveMatch } = useSocket();
  const { playShotClockBuzzer, playGameEndHorn, playWhistle, playClick, soundEnabled, toggleSound } = useSound();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Quick Scorer Attribution Modal State
  const [scorerModal, setScorerModal] = useState({
    isOpen: false,
    team: 'A',
    points: 1,
  });

  // Substitution Modal State
  const [subModal, setSubModal] = useState({
    isOpen: false,
    team: 'A',
  });

  // Fetch initial match state
  useEffect(() => {
    fetchMatch();
  }, [id]);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const res = await matchApi.getById(id);
      setMatch(res?.data || null);
    } catch (err) {
      setToast({ message: 'Error loading match: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Socket.IO Room Connection and Event Listeners
  useEffect(() => {
    if (!id) return;
    joinMatch(id);

    if (socket) {
      socket.on('match-updated', ({ match: updatedMatch, latestEvent }) => {
        setMatch(updatedMatch);
      });

      socket.on('buzzer-alert', ({ type, details }) => {
        if (type === 'SHOT_CLOCK') {
          playShotClockBuzzer();
          setToast({ message: 'SHOT CLOCK EXPIRED!', type: 'warning' });
        } else if (type === 'GAME_END') {
          playGameEndHorn();
          setToast({ message: details?.winner ? `GAME OVER! Winner: Team ${details.winner}` : 'GAME OVER!', type: 'info' });
        } else if (type === 'PERIOD_END') {
          playGameEndHorn();
          setToast({ message: `${details?.period || 'Quarter'} Ended!`, type: 'info' });
        } else if (type === 'WHISTLE') {
          playWhistle();
        }
      });
    }

    return () => {
      leaveMatch(id);
      if (socket) {
        socket.off('match-updated');
        socket.off('buzzer-alert');
      }
    };
  }, [id, socket, joinMatch, leaveMatch, playShotClockBuzzer, playGameEndHorn, playWhistle]);

  // Main Timer Handlers
  const handleStartTimer = async () => {
    try {
      playClick();
      const res = await matchApi.start(id);
      if (res?.data) setMatch((prev) => ({ ...prev, ...res.data, timerRunning: true }));
      setToast({ message: 'Game timer started', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to start timer', type: 'error' });
    }
  };

  const handlePauseTimer = async () => {
    try {
      playClick();
      const res = await matchApi.pause(id);
      if (res?.data) setMatch((prev) => ({ ...prev, ...res.data, timerRunning: false }));
      setToast({ message: 'Game timer paused', type: 'info' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to pause timer', type: 'error' });
    }
  };

  const handleResetTimer = async () => {
    const defaultSecs = match.matchType === '5x5'
      ? (match.settings?.quarterDuration || 600)
      : (match.gameDuration || 600);

    if (!window.confirm(`Reset period clock back to ${Math.floor(defaultSecs / 60)}:00?`)) return;
    try {
      playClick();
      const res = await matchApi.resetTimer(id, defaultSecs);
      if (res?.data) setMatch(res.data);
      setToast({ message: `Clock reset to ${Math.floor(defaultSecs / 60)}:00`, type: 'info' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  // Shot Clock Handlers
  const handleShotClockAction = async (action, seconds) => {
    try {
      playClick();
      const res = await matchApi.controlShotClock(id, { action, seconds });
      if (res?.data) setMatch(res.data);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  // Scoring with Player Attribution
  const handleOpenScorerModal = (team, points) => {
    setScorerModal({
      isOpen: true,
      team,
      points,
    });
  };

  const executeScoreUpdate = async (team, points, playerId) => {
    try {
      playClick();
      setScorerModal({ isOpen: false, team: 'A', points: 1 });
      const res = await matchApi.updateScore(id, { team, points, playerId });
      if (res?.data) setMatch(res.data);

      if (res?.autoCompleted) {
        playGameEndHorn();
        setToast({ message: 'TARGET SCORE REACHED! Game ended automatically.', type: 'success' });
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to update score', type: 'error' });
    }
  };

  // Foul Handlers
  const handleFoulAction = async (team, change) => {
    try {
      playClick();
      const res = await matchApi.recordFoul(id, { team, change });
      if (res?.data) setMatch(res.data);
    } catch (err) {
      setToast({ message: err.message || 'Failed to update foul', type: 'error' });
    }
  };

  // Possession Toggle
  const handleTogglePossession = async () => {
    try {
      playClick();
      const res = await matchApi.togglePossession(id);
      if (res?.data) setMatch(res.data);
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  // Timeout Handler
  const handleCallTimeout = async (team) => {
    try {
      playWhistle();
      const res = await matchApi.callTimeout(id, team);
      if (res?.data) setMatch(res.data);
      setToast({ message: `Timeout called by Team ${team}`, type: 'warning' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to call timeout', type: 'error' });
    }
  };

  // Substitution Handler
  const handlePerformSubstitution = async (team, playerOutId, playerInId) => {
    try {
      playClick();
      const res = await matchApi.substitute(id, { team, playerOutId, playerInId });
      if (res?.data) setMatch(res.data);
      setToast({ message: 'Substitution completed successfully!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to substitute player', type: 'error' });
    }
  };

  // Period / Quarter Controls for 5x5
  const handleEndQuarter = async () => {
    if (!window.confirm(`End current period (${match.currentPeriod || 'Quarter'})?`)) return;
    try {
      playGameEndHorn();
      const res = await matchApi.controlPeriod(id, { action: 'END_QUARTER' });
      if (res?.data) setMatch(res.data);
      setToast({ message: `${match.currentPeriod || 'Quarter'} officially ended`, type: 'info' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to end quarter', type: 'error' });
    }
  };

  const handleNextQuarter = async () => {
    try {
      playClick();
      const res = await matchApi.controlPeriod(id, { action: 'NEXT_QUARTER' });
      if (res?.data) setMatch(res.data);
      setToast({ message: `Advanced to ${res.data?.currentPeriod}! Timer & fouls reset.`, type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to advance quarter', type: 'error' });
    }
  };

  // Live Player Stat Tracker (+REB, +AST, +STL, +BLK)
  const handleRecordPlayerStat = async (playerId, statType, change) => {
    try {
      playClick();
      const res = await matchApi.recordPlayerStat(id, { playerId, statType, change });
      if (res?.data) setMatch(res.data);
      setToast({ message: `Recorded ${statType.slice(0, -1).toUpperCase()} (+${change})`, type: 'info' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    }
  };

  // Undo Last Action
  const handleUndo = async () => {
    try {
      playClick();
      const res = await matchApi.undo(id);
      if (res?.data) setMatch(res.data);
      setToast({ message: res.message || 'Action undone', type: 'info' });
    } catch (err) {
      setToast({ message: err.message || 'Nothing to undo', type: 'warning' });
    }
  };

  // End Match
  const handleEndMatch = async () => {
    if (!window.confirm('Are you sure you want to officially end this match and persist results?')) {
      return;
    }

    try {
      playGameEndHorn();
      const res = await matchApi.end(id);
      if (res?.data) setMatch(res.data);
      setToast({ message: 'Match officially ended and persisted to database!', type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to end match', type: 'error' });
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

  const isCompleted = match.status === 'COMPLETED';
  const is5x5 = match.matchType === '5x5';

  // Active On-Court Players for Scorer Attribution Modal
  const teamAStarters = match.teamA_roster?.starters?.length
    ? match.teamA_roster.starters
    : match.playersA || [];
  const teamBStarters = match.teamB_roster?.starters?.length
    ? match.teamB_roster.starters
    : match.playersB || [];

  const teamASubs = match.teamA_roster?.substitutes || [];
  const teamBSubs = match.teamB_roster?.substitutes || [];

  // Robust determination of on-court players for the scoring modal
  const activePlayersForModal = React.useMemo(() => {
    if (!match) return [];
    const team = scorerModal.team;

    // 1. Check playerStats for active players on court
    const teamStats = (match.playerStats || []).filter((s) => s.team === team);
    const onCourtStats = teamStats.filter((s) => s.isActive !== false);
    if (onCourtStats.length > 0) {
      return onCourtStats.map((s) => ({
        playerId: s.playerId,
        player: s.playerId,
        playerName: s.playerName,
        name: s.playerName,
        jerseyNumber: s.jerseyNumber,
        isStarter: s.isStarter,
        isActive: s.isActive,
        isCaptain: s.isCaptain,
        isViceCaptain: s.isViceCaptain,
      }));
    }

    // 2. Fallback to roster starters
    const starters = team === 'A' ? teamAStarters : teamBStarters;
    if (starters && starters.length > 0) return starters;

    // 3. Fallback to all team players
    return team === 'A' ? (match.playersA || []) : (match.playersB || []);
  }, [match, scorerModal.team, teamAStarters, teamBStarters]);

  return (
    <div className="max-w-[1550px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
      {/* Top Console Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Exit to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              {/* Match Format Badge */}
              <span
                className={`text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  is5x5
                    ? 'bg-blue-950/90 text-blue-400 border-blue-800'
                    : 'bg-orange-950/90 text-orange-400 border-orange-800'
                }`}
              >
                🏀 {is5x5 ? 'BASKETBALL 5x5' : 'BASKETBALL 3x3'}
              </span>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  isCompleted
                    ? 'bg-slate-800 text-emerald-400 border-emerald-800'
                    : match.timerRunning
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-800 animate-pulse'
                    : 'bg-amber-950 text-amber-400 border-amber-800'
                }`}
              >
                {match.status}
              </span>

              {/* Period Indicator */}
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {match.currentPeriod || (is5x5 ? 'Q1' : 'REGULATION')}
              </span>

              <span className="text-xs text-white font-bold truncate max-w-[180px] sm:max-w-none">
                {match.matchName}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Venue: {match.venue || 'Center Court'} • Shot Clock:{' '}
              {match.settings?.shotClock || match.shotClockDuration || (is5x5 ? 24 : 12)}s
              {match.targetScore ? ` • Target: ${match.targetScore} PTS` : ' • 4 Quarters'}
            </p>
          </div>
        </div>

        {/* Console Action Links */}
        <div className="flex items-center gap-2">
          {/* Quick Substitution Button for Scorer */}
          {isScorer && !isCompleted && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setSubModal({ isOpen: true, team: 'A' })}
                className="px-2.5 py-1.5 rounded-xl bg-orange-950/80 hover:bg-orange-900 text-orange-300 text-xs font-mono font-bold border border-orange-800/80 flex items-center gap-1.5 transition-all shadow-sm"
                title={`Substitute ${match.teamA?.shortName || 'Team A'} players`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>SUB {match.teamA?.shortName || 'A'}</span>
              </button>

              <button
                onClick={() => setSubModal({ isOpen: true, team: 'B' })}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 text-xs font-mono font-bold border border-cyan-800/80 flex items-center gap-1.5 transition-all shadow-sm"
                title={`Substitute ${match.teamB?.shortName || 'Team B'} players`}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>SUB {match.teamB?.shortName || 'B'}</span>
              </button>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border text-xs font-mono font-bold transition-colors ${
              soundEnabled
                ? 'bg-slate-800 text-amber-400 border-amber-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'Arena Horns Enabled' : 'Arena Horns Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Spectator Public View Link */}
          <Link
            to={`/live/${match._id}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-all"
            title="Open spectator-only scoreboard in new tab"
          >
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Spectator TV</span>
          </Link>

          {/* Full Match Report Link */}
          {isCompleted && (
            <Link
              to={`/matches/${match._id}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Full Match Report</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Scoreboard Arena Display */}
      <div className="court-gradient rounded-3xl border border-slate-800 p-4 sm:p-6 shadow-2xl relative">
        {/* Game Completed Banner */}
        {isCompleted && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-center animate-in fade-in">
            <h2 className="text-xl sm:text-2xl font-black text-emerald-400 font-digital tracking-wide">
              MATCH COMPLETED — FINAL SCORE: {match.scoreA} - {match.scoreB}
            </h2>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Winner:{' '}
              <span className="font-bold text-white uppercase">
                {match.winner === 'A'
                  ? match.teamA?.name
                  : match.winner === 'B'
                  ? match.teamB?.name
                  : 'Draw'}
              </span>{' '}
              • Statistics saved to official database
            </p>
          </div>
        )}

        {/* 5x5 Quarter Summary Breakdown Bar */}
        {is5x5 && match.periodScores && match.periodScores.length > 0 && (
          <div className="mb-5 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-center gap-6 text-xs font-mono">
            <span className="text-slate-500 uppercase font-bold">Quarter Scores:</span>
            {match.periodScores.map((ps) => (
              <div key={ps.period} className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">{ps.period}:</span>
                <span className="text-white font-digital font-bold text-sm">
                  {ps.scoreA} - {ps.scoreB}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 3-Column Arena Scoreboard Grid: Team A | Center Timer & Shot Clock | Team B */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Team A Score Card */}
          <div className="lg:col-span-4">
            <TeamScoreCard
              team="A"
              teamData={match.teamA}
              score={match.scoreA}
              fouls={match.foulsA}
              timeouts={match.timeoutsA}
              foulLimit={match.foulLimit || (is5x5 ? 5 : 7)}
              matchType={match.matchType || '3x3'}
              isPossession={match.possession === 'A'}
              isScorer={isScorer && !isCompleted}
              onScoreClick={handleOpenScorerModal}
              onAddFoul={handleFoulAction}
              onSubFoul={handleFoulAction}
              onCallTimeout={handleCallTimeout}
              onOpenSubstitution={() => setSubModal({ isOpen: true, team: 'A' })}
            />
          </div>

          {/* Center Column: Timer, Shot Clock, Possession, Game Clock Controls */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-4">
            {/* Possession Indicator */}
            <PossessionArrow
              possession={match.possession}
              teamAName={match.teamA?.shortName || 'TMA'}
              teamBName={match.teamB?.shortName || 'TMB'}
              onToggle={handleTogglePossession}
              isScorer={isScorer && !isCompleted}
            />

            {/* Game Clock Display */}
            <div className="p-4 rounded-3xl bg-black/60 border border-slate-800 shadow-2xl w-full flex flex-col items-center">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-widest mb-1">
                {is5x5
                  ? `GAME CLOCK (${match.currentPeriod || 'Q1'})`
                  : 'GAME CLOCK (FIBA 3X3)'}
              </span>
              <DigitalTimer
                remainingTime={match.remainingTime}
                timerRunning={match.timerRunning}
                timerStartedAt={match.timerStartedAt}
                onExpire={() => {
                  playGameEndHorn();
                  setToast({
                    message: is5x5 ? `${match.currentPeriod || 'Quarter'} Time Expired!` : 'REGULATION TIME EXPIRED!',
                    type: 'warning',
                  });
                }}
              />
            </div>

            {/* Shot Clock (12s for 3x3, 24s for 5x5) */}
            <div className="w-full max-w-xs">
              <ShotClock
                shotClockRemaining={match.shotClockRemaining}
                shotClockRunning={match.shotClockRunning}
                shotClockStartedAt={match.shotClockStartedAt}
                matchType={match.matchType || '3x3'}
                onResetFull={() => handleShotClockAction('RESET_FULL')}
                onResetShort={() => handleShotClockAction('RESET_SHORT')}
                onReset12={() => handleShotClockAction(is5x5 ? 'RESET_24' : 'RESET_12')}
                onReset2={() => handleShotClockAction(is5x5 ? 'RESET_14' : 'RESET_2')}
                onTogglePause={() =>
                  handleShotClockAction(match.shotClockRunning ? 'PAUSE' : 'RESUME')
                }
                onExpire={() => {
                  playShotClockBuzzer();
                }}
                isScorer={isScorer && !isCompleted}
              />
            </div>
          </div>

          {/* Team B Score Card */}
          <div className="lg:col-span-4">
            <TeamScoreCard
              team="B"
              teamData={match.teamB}
              score={match.scoreB}
              fouls={match.foulsB}
              timeouts={match.timeoutsB}
              foulLimit={match.foulLimit || (is5x5 ? 5 : 7)}
              matchType={match.matchType || '3x3'}
              isPossession={match.possession === 'B'}
              isScorer={isScorer && !isCompleted}
              onScoreClick={handleOpenScorerModal}
              onAddFoul={handleFoulAction}
              onSubFoul={handleFoulAction}
              onCallTimeout={handleCallTimeout}
              onOpenSubstitution={() => setSubModal({ isOpen: true, team: 'B' })}
            />
          </div>
        </div>

        {/* Scorer Action Control Panel (START, PAUSE, RESET, QUARTER CONTROLS, UNDO, END MATCH) */}
        {isScorer && !isCompleted && (
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-2xl">
            {/* Clock & Quarter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {!match.timerRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" /> START CLOCK
                </button>
              ) : (
                <button
                  onClick={handlePauseTimer}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg shadow-amber-600/30 active:scale-95 transition-all"
                >
                  <Pause className="w-4 h-4 fill-current" /> PAUSE CLOCK
                </button>
              )}

              <button
                onClick={handleResetTimer}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 active:scale-95 transition-all flex items-center gap-1"
                title="Reset current period clock"
              >
                <RotateCcw className="w-3.5 h-3.5" /> RESET CLOCK
              </button>

              {/* 5x5 Period/Quarter Controls */}
              {is5x5 && (
                <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-800">
                  <button
                    onClick={handleEndQuarter}
                    className="px-3 py-2.5 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 font-mono font-bold text-xs border border-indigo-700/80 active:scale-95 transition-all flex items-center gap-1"
                    title="End current quarter and store quarter score"
                  >
                    <Flag className="w-3.5 h-3.5" /> END QUARTER
                  </button>
                  <button
                    onClick={handleNextQuarter}
                    className="px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1"
                    title="Advance to next quarter (Q1->Q2->Q3->Q4->OT)"
                  >
                    <FastForward className="w-3.5 h-3.5" /> NEXT QUARTER
                  </button>
                </div>
              )}
            </div>

            {/* Undo & End Match Operations */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs sm:text-sm border border-amber-500/30 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                title="Undo last recorded score, foul, substitution, or period"
              >
                <Undo2 className="w-4 h-4" /> UNDO LAST ACTION
              </button>

              <button
                onClick={handleEndMatch}
                className="px-4 py-2.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/30"
              >
                <CheckCircle className="w-4 h-4" /> END MATCH
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Live Player Box Score Tracker */}
      <LivePlayerStats
        match={match}
        isScorer={isScorer && !isCompleted}
        onRecordStat={handleRecordPlayerStat}
        onPlayerScore={(team, pts, pId) => executeScoreUpdate(team, pts, pId)}
      />

      {/* Scorer Player Attribution Modal (Active court players only) */}
      <QuickScorerModal
        isOpen={scorerModal.isOpen}
        team={scorerModal.team}
        teamName={scorerModal.team === 'A' ? match.teamA?.name : match.teamB?.name}
        teamColor={scorerModal.team === 'A' ? match.teamA?.primaryColor : match.teamB?.primaryColor}
        points={scorerModal.points}
        players={activePlayersForModal}
        onSelectScorer={(playerId) => executeScoreUpdate(scorerModal.team, scorerModal.points, playerId)}
        onClose={() => setScorerModal({ isOpen: false, team: 'A', points: 1 })}
      />

      {/* In-Game Player Substitution Modal */}
      <SubstitutionModal
        isOpen={subModal.isOpen}
        team={subModal.team}
        teamData={subModal.team === 'A' ? match.teamA : match.teamB}
        starters={subModal.team === 'A' ? teamAStarters : teamBStarters}
        substitutes={subModal.team === 'A' ? teamASubs : teamBSubs}
        onSubstitute={handlePerformSubstitution}
        onClose={() => setSubModal({ isOpen: false, team: 'A' })}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default LiveScoreboardPage;
