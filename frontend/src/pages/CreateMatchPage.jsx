import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { matchApi } from '../api/matchApi';
import { teamApi } from '../api/teamApi';
import { tournamentApi } from '../api/tournamentApi';
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  Sliders,
  PlayCircle,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const CreateMatchPage = () => {
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    matchName: '',
    tournamentId: '',
    venue: 'Center Court 3x3',
    scheduledDate: new Date().toISOString().slice(0, 10),
    scheduledTime: '18:00',
    teamA: '',
    teamB: '',
    gameDuration: 600, // 10:00 in seconds
    shotClockDuration: 12,
    targetScore: 21,
    foulLimit: 7,
  });

  useEffect(() => {
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const [tRes, tmRes] = await Promise.all([tournamentApi.getAll(), teamApi.getAll()]);
      const availableTournaments = tRes?.data || [];
      const availableTeams = tmRes?.data || [];

      setTournaments(availableTournaments);
      setTeams(availableTeams);

      if (availableTeams.length >= 2) {
        setFormData((prev) => ({
          ...prev,
          teamA: availableTeams[0]._id,
          teamB: availableTeams[1]._id,
          matchName: `${availableTeams[0].name} vs ${availableTeams[1].name}`,
        }));
      }
    } catch (err) {
      setToast({ message: 'Error loading teams/tournaments: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleTeamChange = (which, teamId) => {
    setFormData((prev) => {
      const updated = { ...prev, [which]: teamId };
      const teamADoc = teams.find((t) => t._id === (which === 'teamA' ? teamId : prev.teamA));
      const teamBDoc = teams.find((t) => t._id === (which === 'teamB' ? teamId : prev.teamB));
      if (teamADoc && teamBDoc) {
        updated.matchName = `${teamADoc.name} vs ${teamBDoc.name}`;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teamA || !formData.teamB) {
      setToast({ message: 'Please select both Team A and Team B', type: 'warning' });
      return;
    }

    if (formData.teamA === formData.teamB) {
      setToast({ message: 'Team A and Team B cannot be the same team', type: 'error' });
      return;
    }

    try {
      const payload = {
        ...formData,
        tournamentId: formData.tournamentId || null,
        gameDuration: Number(formData.gameDuration),
        shotClockDuration: Number(formData.shotClockDuration),
        targetScore: Number(formData.targetScore),
        foulLimit: Number(formData.foulLimit),
      };

      const res = await matchApi.create(payload);
      if (res?.data?._id) {
        setToast({ message: 'Match created successfully! Directing to staging setup...', type: 'success' });
        setTimeout(() => {
          navigate(`/matches/${res.data._id}/setup`);
        }, 600);
      }
    } catch (err) {
      setToast({ message: err.message || 'Failed to create match', type: 'error' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Schedule New 3x3 Match
          </h1>
          <p className="text-sm text-slate-400">
            Configure teams, starting rules, venue, and 12-second shot clock parameters
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Match Identity & Teams Selection */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
            <Shield className="w-4 h-4" /> Team Matchup
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1.5">
                Team A (Home)
              </label>
              <select
                value={formData.teamA}
                onChange={(e) => handleTeamChange('teamA', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                required
              >
                <option value="">Select Team A</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id} disabled={t._id === formData.teamB}>
                    {t.name} ({t.shortName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1.5">
                Team B (Away)
              </label>
              <select
                value={formData.teamB}
                onChange={(e) => handleTeamChange('teamB', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-cyan-500 outline-none"
                required
              >
                <option value="">Select Team B</option>
                {teams.map((t) => (
                  <option key={t._id} value={t._id} disabled={t._id === formData.teamA}>
                    {t.name} ({t.shortName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1.5">
              Official Match Title
            </label>
            <input
              type="text"
              value={formData.matchName}
              onChange={(e) => setFormData({ ...formData, matchName: e.target.value })}
              placeholder="e.g. Thunderbolts vs Viper Strike"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1.5">
              Associated Tournament (Optional)
            </label>
            <select
              value={formData.tournamentId}
              onChange={(e) => setFormData({ ...formData, tournamentId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
            >
              <option value="">Independent Match (No Tournament)</option>
              {tournaments.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Schedule & Location
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1.5">
                Time
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1.5">
                Court / Venue
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="Center Court 3x3"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3x3 FIBA Match Rules Customization */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" /> 3x3 Rules Configuration
            </h2>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              FIBA 3x3 Standard Defaults
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                Duration (Sec)
              </label>
              <input
                type="number"
                min={60}
                step={30}
                value={formData.gameDuration}
                onChange={(e) => setFormData({ ...formData, gameDuration: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
                title="600 seconds = 10 minutes"
              />
              <span className="text-[10px] text-slate-500">600s = 10:00 mins</span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                Shot Clock (Sec)
              </label>
              <input
                type="number"
                min={5}
                max={30}
                value={formData.shotClockDuration}
                onChange={(e) => setFormData({ ...formData, shotClockDuration: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Default: 12 seconds</span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                Target Score
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.targetScore}
                onChange={(e) => setFormData({ ...formData, targetScore: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Sudden win: 21 pts</span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                Foul Limit (Bonus)
              </label>
              <input
                type="number"
                min={4}
                max={10}
                value={formData.foulLimit}
                onChange={(e) => setFormData({ ...formData, foulLimit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">Penalty at 7 fouls</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-orange-600/30 flex items-center gap-2 active:scale-95 transition-all"
          >
            <span>Proceed to Match Staging Setup</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CreateMatchPage;
