import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tournamentApi } from '../api/tournamentApi';
import { teamApi } from '../api/teamApi';
import {
  Trophy,
  Plus,
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  X,
  Sparkles,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const TournamentsPage = () => {
  const { isAdmin } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organizer: '',
    venue: '',
    startDate: '',
    endDate: '',
    description: '',
    teams: [],
  });

  useEffect(() => {
    fetchTournaments();
    fetchTeams();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const res = await tournamentApi.getAll();
      setTournaments(res?.data || []);
    } catch (err) {
      setToast({ message: 'Failed to load tournaments: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await teamApi.getAll();
      setTeams(res?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateModal = () => {
    setFormData({
      name: '',
      organizer: 'FIBA 3x3 & HoopScore League',
      venue: 'Metropolitan Sports Complex',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      description: '',
      teams: teams.map((t) => t._id),
    });
    setIsModalOpen(true);
  };

  const handleToggleTeam = (teamId) => {
    const current = [...formData.teams];
    const index = current.indexOf(teamId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(teamId);
    }
    setFormData({ ...formData, teams: current });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await tournamentApi.create(formData);
      setToast({ message: 'Tournament created successfully!', type: 'success' });
      setIsModalOpen(false);
      fetchTournaments();
    } catch (err) {
      setToast({ message: err.message || 'Failed to create tournament', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Trophy className="w-8 h-8 text-amber-400" /> Official 3x3 Tournaments
          </h1>
          <p className="text-sm text-slate-400">
            FIBA 3x3 verified circuits, live standings, and championship brackets
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all active:scale-95 whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Tournament
          </button>
        )}
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((t) => (
            <div
              key={t._id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 p-6 backdrop-blur-sm shadow-xl flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${
                      t.status === 'ONGOING'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                        : t.status === 'COMPLETED'
                        ? 'bg-slate-800 text-slate-400 border-slate-700'
                        : 'bg-amber-950/60 text-amber-400 border-amber-800'
                    }`}
                  >
                    {t.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(t.startDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors mb-2">
                  {t.name}
                </h3>

                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  {t.description || 'Professional 3x3 Basketball tournament series.'}
                </p>

                <div className="space-y-2 text-xs font-mono text-slate-300 py-3 border-y border-slate-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{t.venue || 'TBA'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{t.teams?.length || 0} Registered Teams</span>
                  </div>
                </div>

                {/* Team Badges preview */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {t.teams &&
                    t.teams.slice(0, 4).map((tm) => (
                      <span
                        key={tm._id}
                        className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800"
                      >
                        {tm.shortName || tm.name}
                      </span>
                    ))}
                  {t.teams?.length > 4 && (
                    <span className="text-[10px] font-mono text-slate-500">
                      +{t.teams.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              <Link
                to={`/tournaments/${t._id}`}
                className="mt-6 w-full py-2.5 rounded-xl bg-orange-600/10 hover:bg-orange-600 text-orange-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2 border border-orange-500/30 hover:border-transparent transition-all"
              >
                <span>View Standings & Matches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold text-base">No Tournaments Registered</p>
          <p className="text-xs text-slate-400 mt-1">Create a new tournament to start competition</p>
        </div>
      )}

      {/* Create Tournament Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-lg">Create New 3x3 Tournament</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                  Tournament Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. National 3x3 Pro Circuit 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                    Organizer
                  </label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="FIBA 3x3"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Metro Arena Court"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Official tournament details..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                />
              </div>

              {/* Participating Teams Selection */}
              <div>
                <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-2">
                  Select Participating Teams ({formData.teams.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                  {teams.map((t) => {
                    const isSelected = formData.teams.includes(t._id);
                    return (
                      <button
                        key={t._id}
                        type="button"
                        onClick={() => handleToggleTeam(t._id)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between text-left transition-all ${
                          isSelected
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800'
                        }`}
                      >
                        <span className="truncate">{t.name}</span>
                        <span className="text-[10px] font-mono uppercase ml-1 opacity-70">
                          {t.shortName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all"
                >
                  Create Tournament
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

export default TournamentsPage;
