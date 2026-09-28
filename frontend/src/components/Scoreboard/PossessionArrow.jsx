import React from 'react';
import { ArrowLeft, ArrowRight, Disc } from 'lucide-react';

const PossessionArrow = ({
  possession = null, // 'A', 'B', or null
  teamAName = 'Team A',
  teamBName = 'Team B',
  onToggle = null,
  isScorer = false,
}) => {
  return (
    <div className="flex flex-col items-center">
      <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-1">
        POSSESSION
      </div>

      <div
        onClick={isScorer && onToggle ? onToggle : undefined}
        className={`flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-900/90 border transition-all ${
          isScorer ? 'cursor-pointer hover:border-orange-500/50 active:scale-95' : ''
        } ${
          possession === 'A'
            ? 'border-orange-500/60 shadow-lg shadow-orange-500/10'
            : possession === 'B'
            ? 'border-cyan-500/60 shadow-lg shadow-cyan-500/10'
            : 'border-slate-800'
        }`}
        title={isScorer ? 'Click to toggle possession' : undefined}
      >
        {/* Team A Possession Indicator */}
        <div
          className={`flex items-center gap-1.5 transition-all ${
            possession === 'A'
              ? 'text-orange-400 font-bold scale-105'
              : 'text-slate-600 opacity-40'
          }`}
        >
          <ArrowLeft className={`w-5 h-5 ${possession === 'A' ? 'animate-pulse' : ''}`} />
          <span className="text-xs uppercase font-mono hidden sm:inline">{teamAName}</span>
        </div>

        <Disc className={`w-4 h-4 ${possession ? 'text-orange-500' : 'text-slate-600'}`} />

        {/* Team B Possession Indicator */}
        <div
          className={`flex items-center gap-1.5 transition-all ${
            possession === 'B'
              ? 'text-cyan-400 font-bold scale-105'
              : 'text-slate-600 opacity-40'
          }`}
        >
          <span className="text-xs uppercase font-mono hidden sm:inline">{teamBName}</span>
          <ArrowRight className={`w-5 h-5 ${possession === 'B' ? 'animate-pulse' : ''}`} />
        </div>
      </div>
    </div>
  );
};

export default PossessionArrow;
