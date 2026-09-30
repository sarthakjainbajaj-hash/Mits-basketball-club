import React from 'react';
import { Plus, Minus, AlertCircle } from 'lucide-react';

const FoulTracker = ({
  teamName = 'Team',
  fouls = 0,
  foulLimit = 7,
  onAddFoul = null,
  onSubFoul = null,
  isScorer = false,
}) => {
  const isPenalty = fouls >= foulLimit && fouls < 10;
  const isDoublePenalty = fouls >= 10;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">
          FOULS:
        </span>
        <span
          className={`font-digital text-2xl font-black tracking-[0.14em] pl-1 inline-block ${
            isDoublePenalty
              ? 'text-red-500 led-red animate-pulse'
              : isPenalty
              ? 'text-amber-400 led-amber'
              : 'text-white'
          }`}
        >
          {fouls}
        </span>
      </div>

      {/* Visual Foul Indicator Pips (1 to 10) */}
      <div className="flex items-center gap-1">
        {[...Array(10)].map((_, i) => {
          const pipNum = i + 1;
          const isActive = fouls >= pipNum;
          const isBonusPip = pipNum >= 7 && pipNum < 10;
          const isDoublePip = pipNum >= 10;

          return (
            <div
              key={i}
              className={`w-2.5 h-3 rounded-sm transition-all ${
                !isActive
                  ? 'bg-slate-800 border border-slate-700'
                  : isDoublePip
                  ? 'bg-red-500 border border-red-400 shadow-sm shadow-red-500'
                  : isBonusPip
                  ? 'bg-amber-400 border border-amber-300 shadow-sm shadow-amber-400'
                  : 'bg-emerald-400 border border-emerald-300 shadow-sm shadow-emerald-400'
              }`}
              title={`Foul ${pipNum}`}
            />
          );
        })}
      </div>

      {/* Bonus / Penalty Badges */}
      {isDoublePenalty ? (
        <span className="text-[10px] uppercase font-black bg-red-600/30 text-red-400 px-2 py-0.5 rounded border border-red-500/50 animate-pulse">
          DOUBLE BONUS (2 FT + BALL)
        </span>
      ) : isPenalty ? (
        <span className="text-[10px] uppercase font-black bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/40">
          PENALTY BONUS (2 FT)
        </span>
      ) : null}

      {/* Scorer Controls */}
      {isScorer && (
        <div className="flex items-center gap-1.5 mt-1">
          {onSubFoul && (
            <button
              onClick={onSubFoul}
              disabled={fouls <= 0}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 border border-slate-700 transition-colors"
              title="Subtract Foul"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}
          {onAddFoul && (
            <button
              onClick={onAddFoul}
              className="px-2 py-1 rounded bg-red-950/60 hover:bg-red-900/80 text-red-400 font-mono text-xs font-bold border border-red-800/80 flex items-center gap-1 transition-all active:scale-95 shadow-sm"
              title="Add Foul"
            >
              <Plus className="w-3 h-3" /> FOUL
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FoulTracker;
