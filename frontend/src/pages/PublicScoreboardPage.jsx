import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useSound } from '../context/SoundContext';
import { matchApi } from '../api/matchApi';

import DigitalTimer from '../components/Scoreboard/DigitalTimer';
import ShotClock from '../components/Scoreboard/ShotClock';
import TeamScoreCard from '../components/Scoreboard/TeamScoreCard';
import PossessionArrow from '../components/Scoreboard/PossessionArrow';

import { Maximize2, Minimize2, Tv, Volume2, VolumeX, Flame } from 'lucide-react';

const PublicScoreboardPage = () => {
  const { matchId } = useParams();
  const { socket, isConnected, joinMatch, leaveMatch } = useSocket();
  const { playShotClockBuzzer, playGameEndHorn, playWhistle, soundEnabled, toggleSound } = useSound();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetchMatch();
  }, [matchId]);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const res = await matchApi.getById(matchId);
      setMatch(res?.data || null);
    } catch (err) {
      console.error('Failed to load public match scoreboard:', err);
    } finally {
      setLoading(false);
    }
  };

  // Join Match Socket Room
  useEffect(() => {
    if (!matchId) return;
    joinMatch(matchId);

    if (socket) {
      socket.on('match-updated', ({ match: updatedMatch }) => {
        setMatch(updatedMatch);
      });

      socket.on('buzzer-alert', ({ type }) => {
        if (type === 'SHOT_CLOCK') {
          playShotClockBuzzer();
        } else if (type === 'GAME_END') {
          playGameEndHorn();
        } else if (type === 'WHISTLE') {
          playWhistle();
        }
      });
    }

    return () => {
      leaveMatch(matchId);
      if (socket) {
        socket.off('match-updated');
        socket.off('buzzer-alert');
      }
    };
  }, [matchId, socket, joinMatch, leaveMatch, playShotClockBuzzer, playGameEndHorn, playWhistle]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.warn(e));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-digital text-amber-400 text-lg tracking-widest">CONNECTING ARENA DISPLAY...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center p-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Scoreboard Feed Unavailable</h1>
          <p className="text-slate-400 text-sm mb-4">The requested match broadcast could not be found.</p>
          <Link to="/" className="text-orange-400 underline text-sm">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = match.status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-3 sm:p-6 lg:p-8 select-none overflow-x-hidden">
      {/* Top TV Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-600/30">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-digital text-lg sm:text-xl font-black tracking-wider text-white">
              HOOP<span className="text-orange-500">SCORE</span> 3X3
            </h1>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              {match.tournamentId?.name || 'Live 3x3 Championship Series'} • {match.venue}
            </p>
          </div>
        </div>

        {/* Status and Fullscreen Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${
              isConnected
                ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                : 'bg-red-950/80 text-red-400 border-red-800 animate-pulse'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
              }`}
            />
            <span>{isConnected ? 'LIVE FEED' : 'RECONNECTING'}</span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            title="Toggle Stadium Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-mono font-bold transition-all"
            title="Toggle TV Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'EXIT' : 'FULLSCREEN'}</span>
          </button>
        </div>
      </div>

      {/* Center Broadcast Scoreboard Display */}
      <div className="my-auto py-6 sm:py-10">
        {/* Match Completed Banner */}
        {isCompleted && (
          <div className="max-w-3xl mx-auto mb-8 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500 text-center animate-in fade-in">
            <h2 className="text-2xl sm:text-4xl font-black text-emerald-400 font-digital tracking-wider">
              MATCH COMPLETED
            </h2>
            <p className="text-sm font-mono text-slate-200 mt-1">
              WINNER:{' '}
              <span className="font-bold text-amber-400 text-lg">
                {match.winner === 'A'
                  ? match.teamA?.name
                  : match.winner === 'B'
                  ? match.teamB?.name
                  : 'DRAW'}
              </span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto">
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
              isScorer={false}
              large={true}
            />
          </div>

          {/* Center Column: Possession, Game Clock, Shot Clock */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-6">
            <PossessionArrow
              possession={match.possession}
              teamAName={match.teamA?.shortName || 'TMA'}
              teamBName={match.teamB?.shortName || 'TMB'}
              isScorer={false}
            />

            {/* Huge Game Clock */}
            <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800 shadow-2xl w-full flex flex-col items-center">
              <span className="text-xs font-mono uppercase font-bold text-slate-400 tracking-widest mb-2">
                GAME CLOCK
              </span>
              <DigitalTimer
                remainingTime={match.remainingTime}
                timerRunning={match.timerRunning}
                timerStartedAt={match.timerStartedAt}
                large={true}
              />
            </div>

            {/* Shot Clock (12s) */}
            <div className="w-full max-w-xs">
              <ShotClock
                shotClockRemaining={match.shotClockRemaining}
                shotClockRunning={match.shotClockRunning}
                shotClockStartedAt={match.shotClockStartedAt}
                isScorer={false}
                large={true}
              />
            </div>

            <div className="text-center">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
                FIRST TO {match.targetScore || 21} PTS WINS
              </span>
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
              isScorer={false}
              large={true}
            />
          </div>
        </div>
      </div>

      {/* Bottom Ticker Bar */}
      <div className="pt-3 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-2">
        <div>
          FIBA 3x3 Official Timing System • 10:00 Duration • 12s Shot Clock
        </div>
        <div className="text-orange-500 font-bold">
          HOOPSCORE ARENA DISPLAY SYSTEM
        </div>
      </div>
    </div>
  );
};

export default PublicScoreboardPage;
