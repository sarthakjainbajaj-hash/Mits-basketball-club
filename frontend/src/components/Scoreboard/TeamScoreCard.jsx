import React from 'react';
import { Plus, Minus, Clock, Shield, ArrowRightLeft } from 'lucide-react';
import FoulTracker from './FoulTracker';

const TeamScoreCard = ({
  team = 'A', // 'A' or 'B'
  teamData = null,
  score = 0,
  fouls = 0,
  timeouts = 1,
  foulLimit = 7,
  matchType = '3x3', // '3x3' or '5x5'
  isPossession = false,
  isScorer = false,
  onScoreClick = null,
  onAddFoul = null,
  onSubFoul = null,
  onCallTimeout = null,
  onOpenSubstitution = null,
  large = false,
}) => {
  const teamName = teamData?.name || `Team ${team}`;
  const shortName = teamData?.shortName || (team === 'A' ? 'TMA' : 'TMB');
  const primaryColor = teamData?.primaryColor || (team === 'A' ? '#FF5722' : '#06B6D4');
  const logo = teamData?.logo;
  const is5x5 = matchType === '5x5';

  return (
    <div
      className={`flex flex-col items-center p-4 sm:p-6 rounded-3xl bg-slate-900/80 backdrop-blur-md border transition-all duration-300 relative overflow-hidden shadow-2xl ${
        isPossession
          ? 'border-orange-500/80 ring-2 ring-orange-500/30 shadow-orange-500/10'
          : 'border-slate-800'
      }`}
      style={{
        borderTop: `6px solid ${primaryColor}`,
      }}
    >
      {/* Background Court Glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 rounded-full pointer-events-none"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Team Header & Logo */}
      <div className="flex items-center gap-3 mb-2 w-full justify-center">
        {logo ? (
          <img
            src={logo}
            alt={teamName}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-700 shadow-md"
          />
        ) : (
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-digital font-bold text-white text-base shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            {shortName.slice(0, 3)}
          </div>
        )}

        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              TEAM {team}
            </span>
            {isPossession && (
              <span className="text-[10px] uppercase font-black bg-orange-500 text-white px-1.5 py-0.5 rounded animate-pulse">
                BALL
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide truncate max-w-[180px] sm:max-w-[240px]">
            {teamName}
          </h2>
        </div>
      </div>

      {/* Giant Scoreboard LED Score */}
      <div className="my-2 sm:my-4 flex items-center justify-center">
        <span
          className={`font-digital font-black select-none tracking-[0.16em] pl-2 leading-none inline-block ${
            large ? 'text-8xl sm:text-9xl md:text-[140px]' : 'text-7xl sm:text-8xl md:text-9xl'
          } ${
            team === 'A' ? 'text-amber-400 led-amber' : 'text-cyan-400 led-cyan'
          }`}
        >
          {score.toString().padStart(2, '0')}
        </span>
      </div>

      {/* Scorer Controls: Score Buttons (+1, +2, +3 if 5x5, -1, -2, -3) */}
      {isScorer && (
        <div className="w-full max-w-xs space-y-2 mb-4">
          {/* Positive Points Buttons */}
          {is5x5 ? (
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onScoreClick(team, 1)}
                className="py-2.5 px-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-digital font-black text-base sm:text-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-0.5"
                title="Free Throw / 1 Point"
              >
                <Plus className="w-3.5 h-3.5" /> 1 PT
              </button>
              <button
                onClick={() => onScoreClick(team, 2)}
                className="py-2.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-digital font-black text-base sm:text-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-0.5"
                title="2-Point Field Goal"
              >
                <Plus className="w-3.5 h-3.5" /> 2 PT
              </button>
              <button
                onClick={() => onScoreClick(team, 3)}
                className="py-2.5 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-digital font-black text-base sm:text-lg shadow-md active:scale-95 transition-all flex items-center justify-center gap-0.5"
                title="3-Point Field Goal"
              >
                <Plus className="w-3.5 h-3.5" /> 3 PT
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onScoreClick(team, 1)}
                className="py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-digital font-black text-lg sm:text-xl shadow-lg shadow-orange-600/30 active:scale-95 transition-all flex items-center justify-center gap-1"
                title="Add 1 Point (Free Throw / Inside Arc)"
              >
                <Plus className="w-4 h-4" /> 1 PT
              </button>
              <button
                onClick={() => onScoreClick(team, 2)}
                className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-digital font-black text-lg sm:text-xl shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-1"
                title="Add 2 Points (Beyond Arc)"
              >
                <Plus className="w-4 h-4" /> 2 PT
              </button>
            </div>
          )}

          {/* Negative Correction Buttons */}
          {is5x5 ? (
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onScoreClick(team, -1)}
                disabled={score <= 0}
                className="py-1 px-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-mono text-[11px] font-bold border border-slate-700 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center gap-0.5"
                title="Correct -1"
              >
                <Minus className="w-3 h-3" /> 1 PT
              </button>
              <button
                onClick={() => onScoreClick(team, -2)}
                disabled={score <= 1}
                className="py-1 px-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-mono text-[11px] font-bold border border-slate-700 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center gap-0.5"
                title="Correct -2"
              >
                <Minus className="w-3 h-3" /> 2 PT
              </button>
              <button
                onClick={() => onScoreClick(team, -3)}
                disabled={score <= 2}
                className="py-1 px-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-mono text-[11px] font-bold border border-slate-700 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center gap-0.5"
                title="Correct -3"
              >
                <Minus className="w-3 h-3" /> 3 PT
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onScoreClick(team, -1)}
                disabled={score <= 0}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-mono text-xs font-bold border border-slate-700 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center gap-1"
                title="Correct Score -1"
              >
                <Minus className="w-3 h-3" /> 1 PT
              </button>
              <button
                onClick={() => onScoreClick(team, -2)}
                disabled={score <= 1}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-mono text-xs font-bold border border-slate-700 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center gap-1"
                title="Correct Score -2"
              >
                <Minus className="w-3 h-3" /> 2 PT
              </button>
            </div>
          )}
        </div>
      )}

      {/* Team Fouls, Timeouts & Substitution Bar */}
      <div className="w-full pt-3 border-t border-slate-800/80 flex flex-col items-center gap-2">
        <FoulTracker
          teamName={teamName}
          fouls={fouls}
          foulLimit={foulLimit}
          onAddFoul={onAddFoul ? () => onAddFoul(team, 1) : null}
          onSubFoul={onSubFoul ? () => onSubFoul(team, -1) : null}
          isScorer={isScorer}
        />

        {/* Timeouts & In-Game Substitution Row */}
        <div className="flex items-center justify-between w-full max-w-xs mt-1 px-2 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>TIMEOUTS:</span>
            <span className={`font-bold ${timeouts > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {timeouts}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isScorer && onCallTimeout && (
              <button
                onClick={() => onCallTimeout(team)}
                disabled={timeouts <= 0}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-300 disabled:opacity-30 border border-slate-700 transition-colors"
              >
                CALL TO
              </button>
            )}

            {isScorer && onOpenSubstitution && (
              <button
                onClick={() => onOpenSubstitution(team)}
                className="px-2 py-0.5 rounded bg-indigo-950/80 hover:bg-indigo-900 text-[11px] font-bold text-indigo-300 border border-indigo-700/60 flex items-center gap-1 transition-colors active:scale-95"
                title="Substitute Active / Bench Players"
              >
                <ArrowRightLeft className="w-3 h-3" /> SUB
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamScoreCard;
