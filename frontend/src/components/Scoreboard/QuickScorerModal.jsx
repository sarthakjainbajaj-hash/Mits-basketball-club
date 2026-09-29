import React from 'react';
import { X, UserCheck, Flame, MinusCircle } from 'lucide-react';

const QuickScorerModal = ({
  isOpen = false,
  team = 'A',
  teamName = 'Team',
  teamColor = '#FF5722',
  points = 1,
  players = [], // Active on-court starters or playerStats
  onSelectScorer = null,
  onClose = null,
}) => {
  if (!isOpen) return null;

  const isDeduction = points < 0;

  // Extract robust player ID from any player object structure
  const getPlayerId = (item) => {
    if (!item) return null;
    if (typeof item === 'string') return item;
    if (item.playerId) {
      return typeof item.playerId === 'object'
        ? (item.playerId._id || item.playerId).toString()
        : item.playerId.toString();
    }
    if (item.player) {
      return typeof item.player === 'object'
        ? (item.player._id || item.player).toString()
        : item.player.toString();
    }
    if (item._id) return item._id.toString();
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between border-b border-slate-800"
          style={{ borderTop: `4px solid ${teamColor}` }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                isDeduction
                  ? 'bg-red-950/80 text-red-400 border border-red-800/80'
                  : 'bg-orange-600/20 text-orange-400 border border-orange-500/30'
              }`}
            >
              {isDeduction ? <MinusCircle className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                {isDeduction
                  ? `Correct Player Score (${points} PT)`
                  : `Assign Points: ${points > 0 ? `+${points}` : points} PTS`}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {teamName} • Team {team}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Player Roster Selection */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-mono uppercase text-slate-400 font-bold">
              {isDeduction
                ? 'Select player whose points to correct:'
                : `Who scored the ${points === 3 ? '3-pointer' : points === 2 ? '2-pointer' : 'point'}?`}
            </p>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
              Active On-Court
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
            {players && players.length > 0 ? (
              players.map((item, idx) => {
                const playerObj = item.player && typeof item.player === 'object' ? item.player : item;
                const pId = getPlayerId(item);
                const pName = item.playerName || item.name || playerObj?.name || `Player ${idx + 1}`;
                const pNum =
                  item.jerseyNumber !== undefined
                    ? item.jerseyNumber
                    : playerObj?.jerseyNumber !== undefined
                    ? playerObj.jerseyNumber
                    : idx + 1;
                const pPos = item.position || playerObj?.position || '';

                const isCap =
                  item.isCaptain ||
                  playerObj?.isCaptain ||
                  pName.includes('(C)') ||
                  pName.includes('[C]');
                const isViceCap =
                  item.isViceCaptain ||
                  playerObj?.isViceCaptain ||
                  pName.includes('(VC)') ||
                  pName.includes('[VC]');

                return (
                  <button
                    key={pId || idx}
                    onClick={() => {
                      if (onSelectScorer && pId) {
                        onSelectScorer(pId);
                      }
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/70 hover:bg-orange-600/20 hover:border-orange-500/60 border border-slate-700/80 transition-all text-left group active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-slate-900 font-digital font-bold text-lg text-amber-400 flex items-center justify-center border border-slate-700 group-hover:border-orange-500/60 shadow-inner">
                        #{pNum}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">
                            {pName}
                          </span>
                          {isCap && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-mono font-black">
                              👑 (C)
                            </span>
                          )}
                          {isViceCap && (
                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[9px] font-mono font-black">
                              🥈 (VC)
                            </span>
                          )}
                        </div>
                        {pPos && <div className="text-[11px] text-slate-400 font-mono">{pPos}</div>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`text-xs font-digital font-bold px-2 py-0.5 rounded-lg border ${
                          isDeduction
                            ? 'bg-red-950/60 text-red-400 border-red-800'
                            : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        }`}
                      >
                        {points > 0 ? `+${points}` : points} PT
                      </span>
                      <UserCheck className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors ml-1" />
                    </div>
                  </button>
                );
              })
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No active on-court players found</p>
            )}
          </div>

          {/* Fallback button: Team Score without specific player */}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => onSelectScorer(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white font-mono text-xs border border-slate-700 transition-colors text-center"
            >
              Unassigned Team Score ({points > 0 ? `+${points}` : points} to Team Score Only)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickScorerModal;
