import React, { useState, useEffect, useRef } from 'react';
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
  History,
  Maximize2,
  Volume2,
  VolumeX,
  AlertTriangle,
  ArrowLeft,
  Flame,
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
        if (latestEvent?.metadata?.description) {
          // Toast subtle notification for scorer if needed
        }
      });

      socket.on('buzzer-alert', ({ type, details }) => {
        if (type === 'SHOT_CLOCK') {
          playShotClockBuzzer();
          setToast({ message: 'SHOT CLOCK EXPIRED!', type: 'warning' });
        } else if (type === 'GAME_END') {
          playGameEndHorn();
          setToast({ message: 'GAME OVER! Target score reached.', type: 'info' });
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
    if (!window.confirm('Reset game timer back to full duration?')) return;
    try {
      playClick();
      const res = await matchApi.resetTimer(id, match.gameDuration || 600);
      if (res?.data) setMatch(res.data);
      setToast({ message: 'Timer reset to 10:00', type: 'info' });
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
    if (points > 0) {
      setScorerModal({
        isOpen: true,
        team,
        points,
      });
    } else {
      // Direct deduction for -1 or -2
      executeScoreUpdate(team, points, null);
    }
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
    if (!window.confirm('Are you sure you want to end this match and save official statistics?')) {
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
              <span className="text-xs text-white font-bold truncate max-w-[200px] sm:max-w-none">
                {match.matchName}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Target: {match.targetScore || 21} PTS • Court: {match.venue || 'Center Court'}
            </p>
          </div>
        </div>

        {/* Console Action Links */}
        <div className="flex items-center gap-2">
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
              foulLimit={match.foulLimit || 7}
              isPossession={match.possession === 'A'}
              isScorer={isScorer && !isCompleted}
              onScoreClick={handleOpenScorerModal}
              onAddFoul={handleFoulAction}
              onSubFoul={handleFoulAction}
              onCallTimeout={handleCallTimeout}
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
                GAME CLOCK (FIBA 3X3)
              </span>
              <DigitalTimer
                remainingTime={match.remainingTime}
                timerRunning={match.timerRunning}
                timerStartedAt={match.timerStartedAt}
                onExpire={() => {
                  playGameEndHorn();
                  setToast({ message: 'REGULATION TIME EXPIRED!', type: 'warning' });
                }}
              />
            </div>

            {/* Shot Clock (12s) Display */}
            <div className="w-full max-w-xs">
              <ShotClock
                shotClockRemaining={match.shotClockRemaining}
                shotClockRunning={match.shotClockRunning}
                shotClockStartedAt={match.shotClockStartedAt}
                onReset12={() => handleShotClockAction('RESET_12')}
                onReset2={() => handleShotClockAction('RESET_2')}
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
              foulLimit={match.foulLimit || 7}
              isPossession={match.possession === 'B'}
              isScorer={isScorer && !isCompleted}
              onScoreClick={handleOpenScorerModal}
              onAddFoul={handleFoulAction}
              onSubFoul={handleFoulAction}
              onCallTimeout={handleCallTimeout}
            />
          </div>
        </div>

        {/* Scorer Action Control Panel (START, PAUSE, RESET, UNDO, END MATCH) */}
        {isScorer && !isCompleted && (
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60 p-4 rounded-2xl">
            {/* Clock Controls */}
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
                title="Reset game clock to default 10:00"
              >
                <RotateCcw className="w-3.5 h-3.5" /> RESET 10:00
              </button>
            </div>

            {/* Undo & End Match Operations */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUndo}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs sm:text-sm border border-amber-500/30 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                title="Undo last recorded score, foul, or possession change"
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
      />

      {/* Scorer Player Attribution Modal */}
      <QuickScorerModal
        isOpen={scorerModal.isOpen}
        team={scorerModal.team}
        teamName={scorerModal.team === 'A' ? match.teamA?.name : match.teamB?.name}
        teamColor={scorerModal.team === 'A' ? match.teamA?.primaryColor : match.teamB?.primaryColor}
        points={scorerModal.points}
        players={scorerModal.team === 'A' ? match.playersA : match.playersB}
        onSelectScorer={(playerId) => executeScoreUpdate(scorerModal.team, scorerModal.points, playerId)}
        onClose={() => setScorerModal({ isOpen: false, team: 'A', points: 1 })}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default LiveScoreboardPage;
