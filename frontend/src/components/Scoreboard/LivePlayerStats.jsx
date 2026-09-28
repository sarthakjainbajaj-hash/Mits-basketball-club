import React, { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, UserCheck, Shield, AlertCircle } from 'lucide-react';

const LivePlayerStats = ({
  match = null,
  isScorer = false,
  onRecordStat = null, // (playerId, statType, change)
}) => {
  const [activeTab, setActiveTab] = useState('A'); // 'A' or 'B'
  const [expanded, setExpanded] = useState(false);

  if (!match) return null;

  const is5x5 = match.matchType === '5x5';
  const teamData = activeTab === 'A' ? match.teamA : match.teamB;
  const teamName = teamData?.name || `Team ${activeTab}`;
  const teamColor = teamData?.primaryColor || (activeTab === 'A' ? '#FF5722' : '#06B6D4');

  // Filter player stats for the selected team
  const playerStats = (match.playerStats || []).filter((s) => s.team === activeTab);

  // Determine active players on court for this team
  const starters = (activeTab === 'A' ? match.teamA_roster?.starters : match.teamB_roster?.starters) || [];
  const starterIds = new Set(starters.map((s) => (s.player?._id || s.player || '').toString()));

  const statColumns = [
    { label: 'PTS', key: 'points', highlight: true },
    { label: '1PT', key: 'onePoints' },
    { label: '2PT', key: 'twoPoints' },
    ...(is5x5 ? [{ label: '3PT', key: 'threePoints' }] : []),
    { label: 'REB', key: 'rebounds', actionable: true },
    { label: 'AST', key: 'assists', actionable: true },
    { label: 'STL', key: 'steals', actionable: true },
    { label: 'BLK', key: 'blocks', actionable: true },
    { label: 'FOUL', key: 'fouls' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl mt-6">
      {/* Header and Toggle */}
      <div className="p-4 bg-slate-950/60 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('A')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === 'A'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {match.teamA?.shortName || 'TEAM A'}
            </button>
            <button
              onClick={() => setActiveTab('B')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                activeTab === 'B'
                  ? 'bg-cyan-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {match.teamB?.shortName || 'TEAM B'}
            </button>
          </div>

          <h3 className="font-bold text-white text-sm hidden sm:inline">
            Live Box Score ({match.matchType || '3x3'}) — <span style={{ color: teamColor }}>{teamName}</span>
          </h3>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 transition-colors"
        >
          <span>{expanded ? 'Collapse' : 'Expand Full Roster'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Table Content */}
      <div className={`overflow-x-auto ${expanded ? 'block' : 'max-h-72'}`}>
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-mono text-[11px] uppercase">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Player</th>
              <th className="py-2.5 px-2 text-center">Status</th>
              {statColumns.map((col) => (
                <th key={col.key} className="py-2.5 px-2 text-center">
                  {col.label}
                </th>
              ))}
              {isScorer && <th className="py-2.5 px-3 text-right">Quick Stat</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {playerStats.length > 0 ? (
              playerStats.map((p) => {
                const isOnCourt = starterIds.size > 0
                  ? starterIds.has(p.playerId?.toString())
                  : p.isActive !== false;

                return (
                  <tr
                    key={p.playerId}
                    className={`transition-colors ${
                      isOnCourt ? 'hover:bg-slate-800/40' : 'opacity-65 hover:opacity-100 hover:bg-slate-900/60'
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-amber-400">#{p.jerseyNumber}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-white whitespace-nowrap">
                      {p.playerName}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      <span
                        className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                          isOnCourt
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isOnCourt ? 'Court' : 'Bench'}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-orange-400 font-digital text-base">
                      {p.points}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.onePoints}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.twoPoints}</td>
                    {is5x5 && (
                      <td className="py-2.5 px-2 text-center text-blue-400 font-bold">{p.threePoints || 0}</td>
                    )}
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.rebounds}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.assists}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.steals}</td>
                    <td className="py-2.5 px-2 text-center text-slate-300">{p.blocks}</td>
                    <td className="py-2.5 px-2 text-center text-red-400 font-bold">{p.fouls}</td>

                    {/* Scorer Quick Buttons (Active court players only) */}
                    {isScorer && onRecordStat && (
                      <td className="py-2.5 px-3 text-right">
                        {isOnCourt ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onRecordStat(p.playerId, 'rebounds', 1)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-cyan-400 border border-slate-700 transition-colors"
                              title="Record Rebound"
                            >
                              +REB
                            </button>
                            <button
                              onClick={() => onRecordStat(p.playerId, 'assists', 1)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-amber-400 border border-slate-700 transition-colors"
                              title="Record Assist"
                            >
                              +AST
                            </button>
                            <button
                              onClick={() => onRecordStat(p.playerId, 'steals', 1)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-emerald-400 border border-slate-700 transition-colors"
                              title="Record Steal"
                            >
                              +STL
                            </button>
                            <button
                              onClick={() => onRecordStat(p.playerId, 'blocks', 1)}
                              className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-purple-400 border border-slate-700 transition-colors"
                              title="Record Block"
                            >
                              +BLK
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono italic">
                            Sub to Court
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={12} className="py-6 text-center text-slate-500">
                  No player statistics recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LivePlayerStats;
