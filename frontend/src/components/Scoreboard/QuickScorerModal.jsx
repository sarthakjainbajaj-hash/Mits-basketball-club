import React from 'react';
import { X, UserCheck, Flame } from 'lucide-react';

const QuickScorerModal = ({
  isOpen = false,
  team = 'A',
  teamName = 'Team',
  teamColor = '#FF5722',
  points = 1,
  players = [],
  onSelectScorer = null,
  onClose = null,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between border-b border-slate-800"
          style={{ borderTop: `4px solid ${teamColor}` }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                Select Scorer — {points > 0 ? `+${points}` : points} PTS
              </h3>
              <p className="text-xs text-slate-400">{teamName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Roster Selection */}
        <div className="p-4 space-y-2">
          <p className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">
            Who scored the {points === 2 ? '2-pointer' : 'point'}?
          </p>

          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
            {players && players.length > 0 ? (
              players.map((item) => {
                const playerObj = item.player || item;
                const pId = playerObj._id || item._id;
                const pName = item.name || playerObj.name;
                const pNum = item.jerseyNumber !== undefined ? item.jerseyNumber : playerObj.jerseyNumber;
                const pPos = playerObj.position || '';

                return (
                  <button
                    key={pId}
                    onClick={() => onSelectScorer(pId)}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-orange-600/20 hover:border-orange-500/50 border border-slate-700 transition-all text-left group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-lg bg-slate-900 font-digital font-bold text-base text-amber-400 flex items-center justify-center border border-slate-700 group-hover:border-orange-500/60">
                        #{pNum}
                      </span>
                      <div>
                        <div className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">
                          {pName}
                        </div>
                        {pPos && <div className="text-[11px] text-slate-400">{pPos}</div>}
                      </div>
                    </div>
                    <UserCheck className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No roster players available</p>
            )}
          </div>

          {/* Quick Fallback: Team Score without specific player */}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => onSelectScorer(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-colors text-center"
            >
              Generic Team Score (Unassigned Player)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickScorerModal;
