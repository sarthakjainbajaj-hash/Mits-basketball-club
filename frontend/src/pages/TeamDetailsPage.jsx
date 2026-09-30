import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { teamApi } from '../api/teamApi';
import { playerApi } from '../api/playerApi';
import {
  Shield,
  Users,
  Trophy,
  ArrowLeft,
  Calendar,
  Sparkles,
  ExternalLink,
  Flame,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const TeamDetailsPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Quick Add Player Modal State
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [newPlayerData, setNewPlayerData] = useState({
    name: '',
    jerseyNumber: '',
    position: 'Guard',
    isCaptain: false,
    isViceCaptain: false,
  });

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const fetchTeamDetails = async () => {
    try {
      setLoading(true);
      const res = await teamApi.getById(id);
      setTeam(res?.data || null);
    } catch (err) {
      setToast({ message: 'Failed to load team details: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openAddPlayerModal = () => {
    const existingJerseys = (team?.players || []).map((p) => p.jerseyNumber);
    let nextJersey = 0;
    while (existingJerseys.includes(nextJersey) && nextJersey <= 99) {
      nextJersey++;
    }
    setNewPlayerData({
      name: '',
      jerseyNumber: nextJersey,
      position: 'Guard',
      isCaptain: false,
      isViceCaptain: false,
    });
    setIsAddPlayerModalOpen(true);
  };

  const handleCreatePlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerData.name.trim()) return;

    try {
      let finalName = newPlayerData.name.trim();
      if (newPlayerData.isCaptain && !finalName.includes('(C)')) {
        finalName = `${finalName.replace(/\s*\(VC\)/gi, '')} (C)`;
      } else if (newPlayerData.isViceCaptain && !finalName.includes('(VC)')) {
        finalName = `${finalName.replace(/\s*\(C\)/gi, '')} (VC)`;
      }

      await playerApi.create({
        name: finalName,
        jerseyNumber: parseInt(newPlayerData.jerseyNumber, 10) || 0,
        position: newPlayerData.position,
        teamId: id,
        isCaptain: newPlayerData.isCaptain,
        isViceCaptain: newPlayerData.isViceCaptain,
      });

      // If marked as captain or vice captain, sync on team document
      if (newPlayerData.isCaptain) {
        await teamApi.update(id, { captain: finalName.replace(/\s*\(C\)/gi, '').trim() });
      } else if (newPlayerData.isViceCaptain) {
        await teamApi.update(id, { viceCaptain: finalName.replace(/\s*\(VC\)/gi, '').trim() });
      }

      setToast({
        message: `Player "${finalName}" successfully added to roster!`,
        type: 'success',
      });
      setIsAddPlayerModalOpen(false);
      fetchTeamDetails();
    } catch (err) {
      setToast({ message: err.message || 'Failed to add player', type: 'error' });
    }
  };

  const handleDeletePlayer = async (playerId, playerName) => {
    if (!window.confirm(`Are you sure you want to remove player "${playerName}" from the team?`)) {
      return;
    }
    try {
      await playerApi.delete(playerId);
      setToast({ message: `Player "${playerName}" removed from roster`, type: 'success' });
      fetchTeamDetails();
    } catch (err) {
      setToast({ message: err.message || 'Failed to remove player', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-white font-bold text-lg">Team not found</p>
        <Link to="/teams" className="text-orange-400 underline text-sm mt-2 inline-block">
          Return to Teams Directory
        </Link>
      </div>
    );
  }

  const played = team.stats?.played || 0;
  const wins = team.stats?.wins || 0;
  const losses = team.stats?.losses || 0;
  const winRate = played > 0 ? Math.round((wins / played) * 100) : 0;
  const ptsFor = team.stats?.pointsFor || 0;
  const ptsAgainst = team.stats?.pointsAgainst || 0;
  const diff = ptsFor - ptsAgainst;

  const stats3x3 = team.stats?.matches3x3 || { played: 0, wins: 0, losses: 0 };
  const stats5x5 = team.stats?.matches5x5 || { played: 0, wins: 0, losses: 0 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link */}
      <Link
        to="/teams"
        className="inline-flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Teams Directory
      </Link>

      {/* Team Hero Header */}
      <div
        className="p-6 sm:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden"
        style={{ borderTop: `6px solid ${team.primaryColor || '#FF5722'}` }}
      >
        <div
          className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: team.primaryColor || '#FF5722' }}
        />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10 text-center sm:text-left">
          {team.logo ? (
            <img
              src={team.logo}
              alt={team.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-slate-700 shadow-xl"
            />
          ) : (
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center font-digital font-black text-white text-3xl shadow-xl"
              style={{ backgroundColor: team.primaryColor || '#FF5722' }}
            >
              {team.shortName}
            </div>
          )}

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="font-digital font-bold text-xs uppercase px-2.5 py-1 rounded-md bg-slate-800 text-amber-400 border border-slate-700">
                {team.shortName}
              </span>
              {team.captain ? (
                <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                  <span>👑</span> Captain: {team.captain} (C)
                </span>
              ) : team.coach ? (
                <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-md">
                  Coach: {team.coach}
                </span>
              ) : null}
              {team.viceCaptain && (
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-md font-bold flex items-center gap-1">
                  <span>🥈</span> Vice-Captain: {team.viceCaptain} (VC)
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {team.name}
            </h1>
            <p className="text-sm text-slate-400">
              Official Basketball Franchise & Complete Roster
            </p>
          </div>
        </div>

        {/* Format Records Breakdown (3x3 vs 5x5) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-orange-950/20 border border-orange-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-orange-400 block">
                🏀 3x3 Basketball Record
              </span>
              <span className="text-xs text-slate-400">FIBA 3x3 Circuit</span>
            </div>
            <div className="text-right font-mono">
              <div className="text-xl font-bold text-white font-digital">
                {stats3x3.wins}W - {stats3x3.losses}L
              </div>
              <span className="text-[11px] text-slate-400">{stats3x3.played} Played</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-blue-400 block">
                🏀 5x5 Basketball Record
              </span>
              <span className="text-xs text-slate-400">Standard 4-Quarter League</span>
            </div>
            <div className="text-right font-mono">
              <div className="text-xl font-bold text-white font-digital">
                {stats5x5.wins}W - {stats5x5.losses}L
              </div>
              <span className="text-[11px] text-slate-400">{stats5x5.played} Played</span>
            </div>
          </div>
        </div>

        {/* Overall Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-800/60">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 text-center">
            <span className="text-[10px] uppercase font-mono text-slate-400">TOTAL MATCHES</span>
            <div className="font-digital text-2xl font-black text-white">{played}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 text-center">
            <span className="text-[10px] uppercase font-mono text-emerald-400">OVERALL W - L</span>
            <div className="font-digital text-2xl font-black text-emerald-400">
              {wins} - {losses}
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 text-center">
            <span className="text-[10px] uppercase font-mono text-amber-400">WIN RATE</span>
            <div className="font-digital text-2xl font-black text-amber-400">{winRate}%</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 text-center">
            <span className="text-[10px] uppercase font-mono text-cyan-400">PTS SCORED</span>
            <div className="font-digital text-2xl font-black text-cyan-400">{ptsFor}</div>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-950/60 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-mono text-purple-400">POINT DIFF</span>
            <div
              className={`font-digital text-2xl font-black ${
                diff >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {diff > 0 ? `+${diff}` : diff}
            </div>
          </div>
        </div>
      </div>

      {/* Roster & Matches Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Players Roster */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-400" />
              <h2 className="font-bold text-white text-base">Registered Player Roster</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                {team.players?.length || 0} Registered
              </span>
              {isAdmin && (
                <button
                  onClick={openAddPlayerModal}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Player
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {team.players && team.players.length > 0 ? (
              team.players.map((p) => (
                <div
                  key={p._id}
                  className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-slate-900 font-digital font-bold text-amber-400 flex items-center justify-center border border-slate-700 text-lg">
                      #{p.jerseyNumber}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-white text-sm">{p.name}</h4>
                        {(p.isCaptain || p.name.includes('(C)') || (team.captain && p.name.replace(/\s*\([CV]+\)/gi, '').trim().toLowerCase() === team.captain.replace(/\s*\([CV]+\)/gi, '').trim().toLowerCase())) && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-mono font-black flex items-center gap-1">
                            👑 <span>(C) CAPTAIN</span>
                          </span>
                        )}
                        {(p.isViceCaptain || p.name.includes('(VC)') || (team.viceCaptain && p.name.replace(/\s*\([CV]+\)/gi, '').trim().toLowerCase() === team.viceCaptain.replace(/\s*\([CV]+\)/gi, '').trim().toLowerCase())) && (
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-[10px] font-mono font-black flex items-center gap-1">
                            🥈 <span>(VC) VICE-CAPTAIN</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono">
                        {p.position || 'Player'} • {p.stats?.games || 0} Games
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono text-xs">
                      <span className="text-orange-400 font-bold font-digital text-base">
                        {p.stats?.points || 0}
                      </span>
                      <span className="text-slate-500 ml-1">PTS</span>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeletePlayer(p._id, p.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                        title="Remove Player"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">No players currently rostered</p>
            )}
          </div>
        </div>

        {/* Recent Matches */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white text-base">Match History</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Recent Games</span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {team.recentMatches && team.recentMatches.length > 0 ? (
              team.recentMatches.map((m) => (
                <Link
                  key={m._id}
                  to={`/matches/${m._id}`}
                  className="block p-3.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800/60 border border-slate-800 transition-all group"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          m.matchType === '5x5'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : 'bg-orange-950 text-orange-400 border border-orange-800'
                        }`}
                      >
                        {m.matchType || '3x3'}
                      </span>
                      <span>{m.matchName}</span>
                    </div>
                    <span>{new Date(m.scheduledDate || m.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white group-hover:text-orange-400 transition-colors">
                      {m.teamA?.name}
                    </span>
                    <span className="font-digital font-bold text-amber-400 px-3 py-0.5 rounded bg-slate-900 border border-slate-700 tracking-[0.16em]">
                      {m.scoreA} - {m.scoreB}
                    </span>
                    <span className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {m.teamB?.name}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-500 text-center py-6">No recent matches recorded</p>
            )}
          </div>
        </div>
      </div>

      {/* Add Player to Team Modal */}
      {isAddPlayerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-400" />
                Add Player to {team.name}
              </h3>
              <button
                onClick={() => setIsAddPlayerModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                  Player Full Name *
                </label>
                <input
                  type="text"
                  value={newPlayerData.name}
                  onChange={(e) => setNewPlayerData({ ...newPlayerData, name: e.target.value })}
                  placeholder="e.g. Aman Verma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                    Jersey Number (0-99) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={newPlayerData.jerseyNumber}
                    onChange={(e) =>
                      setNewPlayerData({ ...newPlayerData, jerseyNumber: e.target.value })
                    }
                    placeholder="7"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-digital font-bold text-sm focus:border-orange-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                    Position
                  </label>
                  <select
                    value={newPlayerData.position}
                    onChange={(e) =>
                      setNewPlayerData({ ...newPlayerData, position: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                  >
                    <option value="Guard">Guard</option>
                    <option value="Forward">Forward</option>
                    <option value="Center">Center</option>
                  </select>
                </div>
              </div>

              {/* Captain / Vice Captain designation checkboxes */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase font-bold text-slate-400 block mb-1">
                  Leadership Designation (Optional)
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={newPlayerData.isCaptain}
                    onChange={(e) =>
                      setNewPlayerData({
                        ...newPlayerData,
                        isCaptain: e.target.checked,
                        isViceCaptain: e.target.checked ? false : newPlayerData.isViceCaptain,
                      })
                    }
                    className="rounded border-slate-700 text-orange-600 focus:ring-0"
                  />
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    👑 Make Team Captain (C)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 hover:text-white select-none">
                  <input
                    type="checkbox"
                    checked={newPlayerData.isViceCaptain}
                    onChange={(e) =>
                      setNewPlayerData({
                        ...newPlayerData,
                        isViceCaptain: e.target.checked,
                        isCaptain: e.target.checked ? false : newPlayerData.isCaptain,
                      })
                    }
                    className="rounded border-slate-700 text-cyan-600 focus:ring-0"
                  />
                  <span className="flex items-center gap-1 font-bold text-cyan-400">
                    🥈 Make Team Vice-Captain (VC)
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddPlayerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all"
                >
                  Add Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TeamDetailsPage;
