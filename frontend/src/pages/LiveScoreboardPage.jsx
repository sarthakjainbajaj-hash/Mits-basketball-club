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
  Share2,
  Maximize2,
  Minimize2,
  Keyboard,
  X,
  Zap,
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHotkeysModal, setShowHotkeysModal] = useState(false);

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

  // Timeout Clock State (1 Min / 2 Min changable duration countdown)
  const [activeTimeout, setActiveTimeout] = useState(null); // { team: 'A'|'B', remaining: number, total: number, isRunning: boolean }
  const [customTimeoutDuration, setCustomTimeoutDuration] = useState(null);
  const timeoutDuration = customTimeoutDuration ?? (match?.settings?.timeoutDuration || match?.timeoutDuration || 60);

  // Active Timeout Countdown Timer
  useEffect(() => {
    if (!activeTimeout || !activeTimeout.isRunning) return;

    if (activeTimeout.remaining <= 0) {
      playShotClockBuzzer();
      playWhistle();
      setToast({
        message: `⏱️ Timeout for ${activeTimeout.team === 'A' ? (match?.teamA?.name || 'Team A') : (match?.teamB?.name || 'Team B')} EXPIRED!`,
        type: 'warning',
      });
      setActiveTimeout((prev) => (prev ? { ...prev, isRunning: false } : null));
      return;
    }

    const intervalId = setInterval(() => {
      setActiveTimeout((prev) => {
        if (!prev || !prev.isRunning) return prev;
        const nextSec = prev.remaining - 1;
        if (nextSec <= 0) {
          playShotClockBuzzer();
          playWhistle();
          setToast({
            message: `⏱️ Timeout for ${prev.team === 'A' ? (match?.teamA?.name || 'Team A') : (match?.teamB?.name || 'Team B')} EXPIRED!`,
            type: 'warning',
          });
          return { ...prev, remaining: 0, isRunning: false };
        }
        return { ...prev, remaining: nextSec };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeTimeout?.isRunning, activeTimeout?.remaining, playShotClockBuzzer, playWhistle, match?.teamA?.name, match?.teamB?.name]);

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

  // Defensive state merger ensuring populated team/roster data and running timer are never clobbered
  const mergeMatchState = (prev, incoming, extra = {}) => {
    if (!prev) return incoming ? { ...incoming, ...extra } : null;
    if (!incoming) return { ...prev, ...extra };

    // If timer is running locally and also running in incoming update, DO NOT clobber running timer references
    const isTimerActive = prev.timerRunning && incoming.timerRunning;

    return {
      ...prev,
      ...incoming,
      remainingTime: isTimerActive ? prev.remainingTime : (incoming.remainingTime ?? prev.remainingTime),
      timerRunning: incoming.timerRunning !== undefined ? incoming.timerRunning : prev.timerRunning,
      timerStartedAt: isTimerActive ? prev.timerStartedAt : (incoming.timerStartedAt ?? prev.timerStartedAt),
      serverTime: isTimerActive ? prev.serverTime : (incoming.serverTime ?? prev.serverTime),
      shotClockRemaining: isTimerActive ? prev.shotClockRemaining : (incoming.shotClockRemaining ?? prev.shotClockRemaining),
      shotClockRunning: incoming.shotClockRunning !== undefined ? incoming.shotClockRunning : prev.shotClockRunning,
      shotClockStartedAt: isTimerActive ? prev.shotClockStartedAt : (incoming.shotClockStartedAt ?? prev.shotClockStartedAt),
      teamA: (incoming.teamA && typeof incoming.teamA === 'object' && incoming.teamA.name)
        ? incoming.teamA
        : prev.teamA,
      teamB: (incoming.teamB && typeof incoming.teamB === 'object' && incoming.teamB.name)
        ? incoming.teamB
        : prev.teamB,
      tournamentId: (incoming.tournamentId && typeof incoming.tournamentId === 'object' && incoming.tournamentId.name)
        ? incoming.tournamentId
        : prev.tournamentId,
      teamA_roster: (incoming.teamA_roster?.starters?.[0]?.player?.name)
        ? incoming.teamA_roster
        : prev.teamA_roster,
      teamB_roster: (incoming.teamB_roster?.starters?.[0]?.player?.name)
        ? incoming.teamB_roster
        : prev.teamB_roster,
      ...extra,
    };
  };

  // Socket.IO Room Connection and Event Listeners
  useEffect(() => {
    if (!id) return;
    joinMatch(id);

    if (socket) {
      socket.on('match-updated', ({ match: updatedMatch, latestEvent, timestamp }) => {
        setMatch((prev) => {
          if (!prev) return { ...updatedMatch, serverTime: updatedMatch.serverTime || timestamp };
          const isTimerActive = prev.timerRunning && updatedMatch.timerRunning;
          return mergeMatchState(prev, updatedMatch, {
            timerRunning: updatedMatch.timerRunning,
            timerStartedAt: isTimerActive ? prev.timerStartedAt : updatedMatch.timerStartedAt,
            serverTime: isTimerActive ? prev.serverTime : (updatedMatch.serverTime || timestamp),
            shotClockRunning: updatedMatch.shotClockRunning,
            shotClockStartedAt: isTimerActive ? prev.shotClockStartedAt : updatedMatch.shotClockStartedAt,
          });
        });
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
          if (details?.team) {
            const duration = details.timeoutDuration || 60;
            setActiveTimeout({
              team: details.team,
              remaining: duration,
              total: duration,
              isRunning: true,
            });
          }
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

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // WhatsApp Live Match Share
  const handleShareWhatsApp = () => {
    if (!match) return;
    const shareUrl = `${window.location.origin}/live/${match._id}`;
    const matchName = match.matchName || 'HoopScore Live Match';
    const teamAName = match.teamA?.name || 'Team A';
    const teamBName = match.teamB?.name || 'Team B';
    const scoreText = `${match.scoreA} - ${match.scoreB}`;
    const periodText = match.currentPeriod || (match.matchType === '5x5' ? 'Q1' : 'REGULATION');
    const text = `🏀 *HoopScore Live Basketball*\n*${matchName}*\n\n🔥 *${teamAName}* ${scoreText} *${teamBName}*\n⏱ Period: ${periodText}\n\n👉 *Watch Live Scoreboard:*\n${shareUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Main Timer Handlers with 0ms Optimistic UI Updates
  const handleStartTimer = async () => {
    const now = Date.now();
    playClick();

    // 0ms Optimistic Update
    setMatch((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: prev.status === 'SCHEDULED' ? 'LIVE' : prev.status,
        timerRunning: true,
        timerStartedAt: now,
        serverTime: now,
        shotClockRunning: true,
        shotClockStartedAt: now,
      };
    });
    setToast({ message: 'Game timer started (0ms)', type: 'success' });

    try {
      const res = await matchApi.start(id);
      if (res?.data) {
        setMatch((prev) => {
          if (!prev) return res.data;
          const keepTimer = prev.timerRunning && prev.timerStartedAt;
          return mergeMatchState(prev, res.data, {
            timerRunning: true,
            timerStartedAt: keepTimer ? prev.timerStartedAt : res.data.timerStartedAt,
            serverTime: keepTimer ? prev.serverTime : res.data.serverTime,
            shotClockRunning: true,
            shotClockStartedAt: keepTimer ? prev.shotClockStartedAt : res.data.shotClockStartedAt,
          });
        });
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to start timer', type: 'error' });
      fetchMatch();
    }
  };

  const handlePauseTimer = async () => {
    const now = Date.now();
    playClick();

    let calculatedRemainingTime = match?.remainingTime || 0;
    let calculatedScRemaining = match?.shotClockRemaining || 0;

    // 0ms Optimistic Update
    setMatch((prev) => {
      if (!prev) return prev;
      let newRemainingTime = prev.remainingTime;
      if (prev.timerRunning && prev.timerStartedAt) {
        const elapsed = (now - prev.timerStartedAt) / 1000;
        newRemainingTime = Math.max(0, Math.round((prev.remainingTime - elapsed) * 10) / 10);
      }
      let newScRemaining = prev.shotClockRemaining;
      if (prev.shotClockRunning && prev.shotClockStartedAt) {
        const scElapsed = (now - prev.shotClockStartedAt) / 1000;
        newScRemaining = Math.max(0, Math.round((prev.shotClockRemaining - scElapsed) * 10) / 10);
      }
      calculatedRemainingTime = newRemainingTime;
      calculatedScRemaining = newScRemaining;

      return {
        ...prev,
        status: prev.status === 'LIVE' ? 'PAUSED' : prev.status,
        timerRunning: false,
        timerStartedAt: null,
        remainingTime: newRemainingTime,
        shotClockRunning: false,
        shotClockStartedAt: null,
        shotClockRemaining: newScRemaining,
      };
    });
    setToast({ message: 'Game timer paused (0ms)', type: 'info' });

    try {
      const res = await matchApi.pause(id, {
        remainingTime: calculatedRemainingTime,
        shotClockRemaining: calculatedScRemaining,
      });
      if (res?.data) {
        setMatch((prev) => mergeMatchState(prev, res.data, {
          timerRunning: false,
          timerStartedAt: null,
          remainingTime: calculatedRemainingTime,
          shotClockRunning: false,
          shotClockStartedAt: null,
          shotClockRemaining: calculatedScRemaining,
        }));
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to pause timer', type: 'error' });
      fetchMatch();
    }
  };

  const handleResetTimer = async () => {
    const defaultSecs = match.matchType === '5x5'
      ? (match.settings?.quarterDuration || 600)
      : (match.gameDuration || 600);

    if (!window.confirm(`Reset period clock back to ${Math.floor(defaultSecs / 60)}:00?`)) return;

    playClick();
    // 0ms Optimistic Update
    setMatch((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        remainingTime: defaultSecs,
        timerRunning: false,
        timerStartedAt: null,
      };
    });
    setToast({ message: `Clock reset to ${Math.floor(defaultSecs / 60)}:00`, type: 'info' });

    try {
      const res = await matchApi.resetTimer(id, defaultSecs);
      if (res?.data) setMatch((prev) => mergeMatchState(prev, res.data));
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      fetchMatch();
    }
  };

  // Shot Clock Handlers with 0ms Optimistic UI Updates
  const handleShotClockAction = async (action, seconds) => {
    const now = Date.now();
    playClick();

    // 0ms Optimistic Update
    setMatch((prev) => {
      if (!prev) return prev;
      const is5x5 = prev.matchType === '5x5';
      const fullDuration = prev.settings?.shotClock || (is5x5 ? 24 : 12);
      const shortDuration = is5x5 ? 14 : 2;

      let newScRemaining = prev.shotClockRemaining;
      let newScRunning = prev.shotClockRunning;
      let newScStartedAt = prev.shotClockStartedAt;

      if (action === 'RESET_FULL' || (action === 'RESET_12' && !is5x5) || action === 'RESET_24') {
        newScRemaining = action === 'RESET_24' ? 24 : fullDuration;
        newScRunning = prev.timerRunning;
        newScStartedAt = prev.timerRunning ? now : null;
      } else if (action === 'RESET_12') {
        newScRemaining = 12;
        newScRunning = prev.timerRunning;
        newScStartedAt = prev.timerRunning ? now : null;
      } else if (action === 'RESET_SHORT' || action === 'RESET_14' || action === 'RESET_2') {
        newScRemaining = action === 'RESET_14' ? 14 : (action === 'RESET_2' ? 2 : shortDuration);
        newScRunning = prev.timerRunning;
        newScStartedAt = prev.timerRunning ? now : null;
      } else if (action === 'SET' && seconds !== undefined) {
        newScRemaining = Number(seconds);
        newScStartedAt = prev.shotClockRunning ? now : null;
      } else if (action === 'PAUSE') {
        if (prev.shotClockRunning && prev.shotClockStartedAt) {
          const scElapsed = (now - prev.shotClockStartedAt) / 1000;
          newScRemaining = Math.max(0, Math.round((prev.shotClockRemaining - scElapsed) * 10) / 10);
        }
        newScRunning = false;
        newScStartedAt = null;
      } else if (action === 'RESUME') {
        newScRunning = true;
        newScStartedAt = now;
      }

      return {
        ...prev,
        shotClockRemaining: newScRemaining,
        shotClockRunning: newScRunning,
        shotClockStartedAt: newScStartedAt,
      };
    });

    try {
      const res = await matchApi.controlShotClock(id, { action, seconds });
      if (res?.data) setMatch((prev) => mergeMatchState(prev, res.data));
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      fetchMatch();
    }
  };

  // Scoring with Player Attribution and 0ms Optimistic UI Updates
  const handleOpenScorerModal = (team, points) => {
    setScorerModal({
      isOpen: true,
      team,
      points,
    });
  };

  const executeScoreUpdate = async (team, points, playerId = null) => {
    const numPoints = Number(points);
    playClick();
    setScorerModal({ isOpen: false, team: 'A', points: 1 });

    const teamName = team === 'A' ? (match?.teamA?.shortName || 'Team A') : (match?.teamB?.shortName || 'Team B');

    // 0ms Optimistic UI Update
    setMatch((prev) => {
      if (!prev) return prev;
      const newScoreA = team === 'A' ? Math.max(0, prev.scoreA + numPoints) : prev.scoreA;
      const newScoreB = team === 'B' ? Math.max(0, prev.scoreB + numPoints) : prev.scoreB;

      let updatedPlayerStats = prev.playerStats ? [...prev.playerStats] : [];
      if (playerId) {
        const pidStr = playerId.toString();
        updatedPlayerStats = updatedPlayerStats.map((s) => {
          const sId = s.playerId ? (s.playerId._id || s.playerId).toString() : '';
          if (sId === pidStr) {
            const pPoints = Math.max(0, (s.points || 0) + numPoints);
            let onePts = s.onePoints || 0;
            let twoPts = s.twoPoints || 0;
            let threePts = s.threePoints || 0;
            if (numPoints === 1) onePts += 1;
            else if (numPoints === 2) twoPts += 1;
            else if (numPoints === 3) threePts += 1;
            else if (numPoints === -1 && onePts > 0) onePts -= 1;
            else if (numPoints === -2 && twoPts > 0) twoPts -= 1;
            else if (numPoints === -3 && threePts > 0) threePts -= 1;

            return { ...s, points: pPoints, onePoints: onePts, twoPoints: twoPts, threePoints: threePts };
          }
          return s;
        });
      }

      return {
        ...prev,
        scoreA: newScoreA,
        scoreB: newScoreB,
        playerStats: updatedPlayerStats,
      };
    });

    setToast({
      message: `${numPoints > 0 ? `+${numPoints}` : numPoints} PT for ${teamName} (0ms)`,
      type: 'success',
    });

    try {
      const res = await matchApi.updateScore(id, { team, points, playerId });
      if (res?.data) setMatch((prev) => mergeMatchState(prev, res.data));

      if (res?.autoCompleted) {
        playGameEndHorn();
        setToast({ message: 'TARGET SCORE REACHED! Game ended automatically.', type: 'success' });
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to update score', type: 'error' });
      fetchMatch();
    }
  };

  // Foul Handlers with 0ms Optimistic UI Updates
  const handleFoulAction = async (team, change) => {
    playClick();
    const numChange = Number(change);
    const teamName = team === 'A' ? (match?.teamA?.shortName || 'Team A') : (match?.teamB?.shortName || 'Team B');

    // 0ms Optimistic Update
    setMatch((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        foulsA: team === 'A' ? Math.max(0, prev.foulsA + numChange) : prev.foulsA,
        foulsB: team === 'B' ? Math.max(0, prev.foulsB + numChange) : prev.foulsB,
      };
    });

    setToast({
      message: `${numChange > 0 ? `+${numChange}` : numChange} Foul for ${teamName} (0ms)`,
      type: 'warning',
    });

    try {
      const res = await matchApi.recordFoul(id, { team, change });
      if (res?.data) setMatch((prev) => mergeMatchState(prev, res.data));
    } catch (err) {
      setToast({ message: err.message || 'Failed to update foul', type: 'error' });
      fetchMatch();
    }
  };

  // Possession Toggle with 0ms Optimistic UI Update
  const handleTogglePossession = async () => {
    playClick();
    // 0ms Optimistic Update
    setMatch((prev) => {
      if (!prev) return prev;
      const nextPossession = prev.possession === 'A' ? 'B' : prev.possession === 'B' ? 'A' : 'A';
      return {
        ...prev,
        possession: nextPossession,
      };
    });

    try {
      const res = await matchApi.togglePossession(id);
      if (res?.data) setMatch((prev) => mergeMatchState(prev, res.data));
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      fetchMatch();
    }
  };

  // Timeout Handler with 0ms Optimistic UI Update & Active Timeout Clock
  const handleCallTimeout = async (team) => {
    const now = Date.now();
    playWhistle();

    let calculatedRemainingTime = match?.remainingTime || 0;
    let calculatedScRemaining = match?.shotClockRemaining || 0;

    // 0ms Optimistic Update
    setMatch((prev) => {
      if (!prev) return prev;
      let newRemainingTime = prev.remainingTime;
      if (prev.timerRunning && prev.timerStartedAt) {
        const elapsed = (now - prev.timerStartedAt) / 1000;
        newRemainingTime = Math.max(0, Math.round((prev.remainingTime - elapsed) * 10) / 10);
      }
      let newScRemaining = prev.shotClockRemaining;
      if (prev.shotClockRunning && prev.shotClockStartedAt) {
        const scElapsed = (now - prev.shotClockStartedAt) / 1000;
        newScRemaining = Math.max(0, Math.round((prev.shotClockRemaining - scElapsed) * 10) / 10);
      }
      calculatedRemainingTime = newRemainingTime;
      calculatedScRemaining = newScRemaining;

      return {
        ...prev,
        status: prev.status === 'LIVE' ? 'PAUSED' : prev.status,
        timeoutsA: team === 'A' ? Math.max(0, prev.timeoutsA - 1) : prev.timeoutsA,
        timeoutsB: team === 'B' ? Math.max(0, prev.timeoutsB - 1) : prev.timeoutsB,
        timerRunning: false,
        timerStartedAt: null,
        remainingTime: newRemainingTime,
        shotClockRunning: false,
        shotClockStartedAt: null,
        shotClockRemaining: newScRemaining,
      };
    });

    // Start local timeout clock countdown
    setActiveTimeout({
      team,
      remaining: timeoutDuration,
      total: timeoutDuration,
      isRunning: true,
    });

    const teamName = team === 'A' ? (match?.teamA?.name || 'Team A') : (match?.teamB?.name || 'Team B');
    setToast({
      message: `⏱️ ${timeoutDuration >= 60 ? `${Math.floor(timeoutDuration / 60)} Min` : `${timeoutDuration}s`} Timeout for ${teamName} started!`,
      type: 'warning',
    });

    try {
      const res = await matchApi.callTimeout(id, {
        team,
        remainingTime: calculatedRemainingTime,
        shotClockRemaining: calculatedScRemaining,
        timeoutDuration,
      });
      if (res?.data) {
        setMatch((prev) => mergeMatchState(prev, res.data, {
          timerRunning: false,
          timerStartedAt: null,
          remainingTime: calculatedRemainingTime,
          shotClockRunning: false,
          shotClockStartedAt: null,
          shotClockRemaining: calculatedScRemaining,
        }));
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to call timeout', type: 'error' });
      fetchMatch();
    }
  };

  const handleChangeTimeoutDuration = async (newDuration) => {
    setCustomTimeoutDuration(newDuration);
    setToast({
      message: `Timeout clock set to ${newDuration >= 60 ? `${Math.floor(newDuration / 60)} Min` : `${newDuration}s`}`,
      type: 'info',
    });
    try {
      await matchApi.update(id, {
        timeoutDuration: newDuration,
        'settings.timeoutDuration': newDuration,
      });
    } catch {
      // Non-blocking
    }
  };

  const handleTogglePauseTimeout = () => {
    playClick();
    setActiveTimeout((prev) => (prev ? { ...prev, isRunning: !prev.isRunning } : null));
  };

  const handleResetTimeoutClock = (seconds = null) => {
    playClick();
    const dur = seconds || activeTimeout?.total || timeoutDuration || 60;
    setActiveTimeout((prev) => (prev ? { ...prev, remaining: dur, total: dur, isRunning: true } : null));
  };

  const handleDismissTimeout = () => {
    playClick();
    setActiveTimeout(null);
  };

  // Substitution Handler
  const handlePerformSubstitution = async (team, playerOutId, playerInId) => {
    try {
      playClick();
      const res = await matchApi.substitute(id, { team, playerOutId, playerInId });
      if (res?.data) setMatch((prev) => mergeMatchState(prev, res.data));
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
      if (res?.data) setMatch((prev) => mergeMatchState(prev, res.data));
      setToast({ message: `${match.currentPeriod || 'Quarter'} officially ended`, type: 'info' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to end quarter', type: 'error' });
    }
  };

  const handleNextQuarter = async () => {
    try {
      playClick();
      const res = await matchApi.controlPeriod(id, { action: 'NEXT_QUARTER' });
      if (res?.data) setMatch((prev) => mergeMatchState(prev, res.data));
      setToast({ message: `Advanced to ${res.data?.currentPeriod}! Timer & fouls reset.`, type: 'success' });
    } catch (err) {
      setToast({ message: err.message || 'Failed to advance quarter', type: 'error' });
    }
  };

  // Live Player Stat Tracker (+REB, +AST, +STL, +BLK) with 0ms Optimistic Update
  const handleRecordPlayerStat = async (playerId, statType, change) => {
    try {
      playClick();
      // 0ms Optimistic Update
      setMatch((prev) => {
        if (!prev) return prev;
        const pidStr = playerId.toString();
        const updatedStats = (prev.playerStats || []).map((s) => {
          const sId = s.playerId ? (s.playerId._id || s.playerId).toString() : '';
          if (sId === pidStr) {
            return {
              ...s,
              [statType]: Math.max(0, (s[statType] || 0) + Number(change)),
            };
          }
          return s;
        });
        return {
          ...prev,
          playerStats: updatedStats,
        };
      });

      setToast({ message: `Recorded ${statType.slice(0, -1).toUpperCase()} (+${change}) (0ms)`, type: 'info' });
      const res = await matchApi.recordPlayerStat(id, { playerId, statType, change });
      if (res?.data) setMatch((prev) => mergeMatchState(prev, res.data));
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
      fetchMatch();
    }
  };

  // Undo Last Action
  const handleUndo = async () => {
    try {
      playClick();
      const res = await matchApi.undo(id);
      if (res?.data) setMatch((prev) => mergeMatchState(prev, res.data));
      setToast({ message: res.message || 'Action undone', type: 'info' });
    } catch (err) {
      setToast({ message: err.message || 'Nothing to undo', type: 'warning' });
    }
  };

  // Scorer Keyboard Shortcuts Hook (Instant table control)
  useEffect(() => {
    if (!isScorer || match?.status === 'COMPLETED') return;

    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input, textarea or contenteditable element
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      // Escape closes open modals
      if (e.key === 'Escape') {
        if (scorerModal.isOpen) setScorerModal({ isOpen: false, team: 'A', points: 1 });
        if (subModal.isOpen) setSubModal({ isOpen: false, team: 'A' });
        if (showHotkeysModal) setShowHotkeysModal(false);
        return;
      }

      // If QuickScorer or Substitution modal is open, don't trigger game keys
      if (scorerModal.isOpen || subModal.isOpen) return;

      // Question mark or 'H' opens hotkeys help cheat sheet
      if (e.key === '?' || (e.key.toLowerCase() === 'h' && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        setShowHotkeysModal((prev) => !prev);
        return;
      }

      // Spacebar: Toggle Game Clock (Start / Pause)
      if (e.code === 'Space') {
        e.preventDefault();
        if (match?.timerRunning) {
          handlePauseTimer();
        } else {
          handleStartTimer();
        }
        return;
      }

      // Shot Clock Reset: S or s
      if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleShotClockAction(match?.matchType === '5x5' ? 'RESET_24' : 'RESET_12');
        return;
      }

      // Possession Toggle: P or p
      if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleTogglePossession();
        return;
      }

      // Undo: Ctrl + Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      const is5x5 = match?.matchType === '5x5';

      // Left Hand Controls - Team A
      if (e.key.toLowerCase() === 'q') {
        e.preventDefault();
        executeScoreUpdate('A', 1);
        return;
      }
      if (e.key.toLowerCase() === 'w') {
        e.preventDefault();
        executeScoreUpdate('A', 2);
        return;
      }
      if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        if (is5x5) {
          executeScoreUpdate('A', 3);
        }
        return;
      }
      if (e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleFoulAction('A', 1);
        return;
      }

      // Right Hand Controls - Team B
      if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        executeScoreUpdate('B', 1);
        return;
      }
      if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        executeScoreUpdate('B', 2);
        return;
      }
      if (e.key.toLowerCase() === 'o') {
        e.preventDefault();
        if (is5x5) {
          executeScoreUpdate('B', 3);
        }
        return;
      }
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleFoulAction('B', 1);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isScorer,
    match?.status,
    match?.timerRunning,
    match?.matchType,
    match?.remainingTime,
    match?.shotClockRemaining,
    match?.possession,
    scorerModal.isOpen,
    subModal.isOpen,
    showHotkeysModal,
  ]);

  // End Match
  const handleEndMatch = async () => {
    if (!window.confirm('Are you sure you want to officially end this match and persist results?')) {
      return;
    }

    try {
      playGameEndHorn();
      const res = await matchApi.end(id);
      if (res?.data) setMatch((prev) => mergeMatchState(prev, res.data));
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
  const activePlayersForModal = (() => {
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
  })();

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

          {/* Keyboard Hotkeys Cheat Sheet */}
          {isScorer && !isCompleted && (
            <button
              onClick={() => setShowHotkeysModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 text-xs font-mono font-bold border border-amber-500/30 transition-all shadow-sm"
              title="View Scorer Fast Keyboard Shortcuts (Hotkeys)"
            >
              <Keyboard className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Keys</span>
            </button>
          )}

          {/* WhatsApp Live Score Share */}
          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white text-xs font-mono font-bold border border-emerald-800/80 transition-all shadow-sm"
            title="Share live match scoreboard on WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Fullscreen Stadium / Projector Mode */}
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono font-bold border border-slate-700 transition-all shadow-sm"
            title={isFullscreen ? 'Exit Fullscreen' : 'Arena Fullscreen Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />}
            <span className="hidden md:inline">{isFullscreen ? 'Exit' : 'Stadium'}</span>
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
              MATCH COMPLETED — FINAL SCORE: <span className="tracking-[0.16em] inline-block">{match.scoreA}</span> - <span className="tracking-[0.16em] inline-block">{match.scoreB}</span>
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
                <span className="text-white font-digital font-bold text-sm tracking-[0.14em]">
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
              activeTimeout={activeTimeout}
              timeoutDuration={timeoutDuration}
              onChangeTimeoutDuration={handleChangeTimeoutDuration}
              onTogglePauseTimeout={handleTogglePauseTimeout}
              onDismissTimeout={handleDismissTimeout}
            />
          </div>

          {/* Center Column: Timer, Shot Clock, Possession, Game Clock Controls */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-4">
            {/* Active Timeout Hero Banner */}
            {activeTimeout && (
              <div className="w-full p-4 rounded-3xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-2 border-amber-500/80 shadow-2xl shadow-amber-500/20 flex flex-col items-center animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[11px] font-mono uppercase font-black text-amber-400 tracking-widest flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping inline-block" />
                    TIMEOUT • {activeTimeout.team === 'A' ? (match.teamA?.name || 'TEAM A') : (match.teamB?.name || 'TEAM B')}
                  </span>
                  <button
                    onClick={handleDismissTimeout}
                    className="text-slate-400 hover:text-white text-xs font-mono px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700"
                    title="Close Timeout Clock"
                  >
                    ✕ Dismiss
                  </button>
                </div>

                <div className="flex items-center gap-3 my-1">
                  <span className="font-digital text-4xl sm:text-5xl font-black text-amber-300 led-amber tracking-[0.16em]">
                    {Math.floor(activeTimeout.remaining / 60).toString().padStart(2, '0')}:
                    {(activeTimeout.remaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden my-1.5 border border-slate-700">
                  <div
                    className="bg-amber-400 h-full transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, (activeTimeout.remaining / (activeTimeout.total || 60)) * 100))}%` }}
                  />
                </div>

                {/* Controls */}
                {isScorer && !isCompleted && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
                    <button
                      onClick={handleTogglePauseTimeout}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-mono text-xs font-bold border border-amber-500/40 flex items-center gap-1"
                    >
                      {activeTimeout.isRunning ? '⏸ Pause' : '▶ Resume'}
                    </button>
                    <button
                      onClick={() => handleResetTimeoutClock(60)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold border border-slate-700"
                    >
                      ↺ 1 Min
                    </button>
                    <button
                      onClick={() => handleResetTimeoutClock(120)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-bold border border-slate-700"
                    >
                      ↺ 2 Min
                    </button>
                    <button
                      onClick={handleDismissTimeout}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold shadow-md"
                    >
                      ✓ End Timeout
                    </button>
                  </div>
                )}
              </div>
            )}

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
                serverTime={match.serverTime}
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
                serverTime={match.serverTime}
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
              activeTimeout={activeTimeout}
              timeoutDuration={timeoutDuration}
              onChangeTimeoutDuration={handleChangeTimeoutDuration}
              onTogglePauseTimeout={handleTogglePauseTimeout}
              onDismissTimeout={handleDismissTimeout}
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

      {/* Scorer Keyboard Shortcuts Cheat Sheet Modal */}
      {showHotkeysModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Keyboard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Scorer Fast Keyboard Hotkeys
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      0ms INSTANT
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Control live scoreboard instantly without touching the mouse!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHotkeysModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Universal Match Controls */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Universal Match Controls
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-300 font-medium">Start / Pause Game Clock</span>
                    <kbd className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-amber-400 font-mono font-bold text-xs shadow-sm">
                      SPACE
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-300 font-medium">Reset Shot Clock ({is5x5 ? '24s' : '12s'})</span>
                    <kbd className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-400 font-mono font-bold text-xs shadow-sm">
                      S
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-300 font-medium">Toggle Possession Arrow</span>
                    <kbd className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-white font-mono font-bold text-xs shadow-sm">
                      P
                    </kbd>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-300 font-medium">Undo Last Action</span>
                    <kbd className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-rose-400 font-mono font-bold text-xs shadow-sm">
                      CTRL + Z
                    </kbd>
                  </div>
                </div>
              </div>

              {/* 2-Column Split: Left Hand (Team A) vs Right Hand (Team B) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Left Hand: Team A */}
                <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400">
                      Left Hand — {match.teamA?.shortName || 'Team A'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Left side keys</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-300">+1 Point (Free Throw)</span>
                      <kbd className="px-2.5 py-0.5 rounded bg-orange-950 text-orange-400 font-mono font-bold border border-orange-700 shadow-sm">
                        Q
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-300">+2 Points (Field Goal)</span>
                      <kbd className="px-2.5 py-0.5 rounded bg-orange-950 text-orange-400 font-mono font-bold border border-orange-700 shadow-sm">
                        W
                      </kbd>
                    </div>
                    {is5x5 && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="text-slate-300">+3 Points (3-Pointer)</span>
                        <kbd className="px-2.5 py-0.5 rounded bg-orange-950 text-orange-400 font-mono font-bold border border-orange-700 shadow-sm">
                          E
                        </kbd>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-300">+1 Team Foul</span>
                      <kbd className="px-2.5 py-0.5 rounded bg-red-950 text-red-400 font-mono font-bold border border-red-700 shadow-sm">
                        A
                      </kbd>
                    </div>
                  </div>
                </div>

                {/* Right Hand: Team B */}
                <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                      Right Hand — {match.teamB?.shortName || 'Team B'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Right side keys</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-300">+1 Point (Free Throw)</span>
                      <kbd className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-700 shadow-sm">
                        U
                      </kbd>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-300">+2 Points (Field Goal)</span>
                      <kbd className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-700 shadow-sm">
                        I
                      </kbd>
                    </div>
                    {is5x5 && (
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                        <span className="text-slate-300">+3 Points (3-Pointer)</span>
                        <kbd className="px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono font-bold border border-cyan-700 shadow-sm">
                          O
                        </kbd>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-slate-300">+1 Team Foul</span>
                      <kbd className="px-2.5 py-0.5 rounded bg-red-950 text-red-400 font-mono font-bold border border-red-700 shadow-sm">
                        K
                      </kbd>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pro Tip Callout */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-2.5">
                <span className="text-base">💡</span>
                <div>
                  <p className="font-bold text-amber-200">Table Official Pro-Tip:</p>
                  <p className="text-[11px] text-amber-300/80 mt-0.5 leading-relaxed">
                    Keyboard keys update the scoreboard in <strong>0ms</strong> with zero network delay. If you want to attribute points to a specific player name, click the score button on the team card or click any player in the box score below!
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">Press [?] or [H] anytime to toggle</span>
              <button
                onClick={() => setShowHotkeysModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Close (Esc)
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default LiveScoreboardPage;
