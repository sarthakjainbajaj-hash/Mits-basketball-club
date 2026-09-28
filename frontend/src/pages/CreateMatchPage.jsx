import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { matchApi } from '../api/matchApi';
import { teamApi } from '../api/teamApi';
import { tournamentApi } from '../api/tournamentApi';
import {
  Calendar,
  Clock,
  Shield,
  Sliders,
  PlusCircle,
  ArrowRight,
  Flame,
  Award,
  Users,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import Toast from '../components/Common/Toast';

const CreateMatchPage = () => {
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Match Type selection: '3x3' or '5x5'
  const [matchType, setMatchType] = useState('3x3');

  // Form State
  const [formData, setFormData] = useState({
    matchName: '',
    tournamentId: '',
    venue: 'Center Court',
    scheduledDate: new Date().toISOString().slice(0, 10),
    scheduledTime: '18:00',
    teamA: '',
    teamB: '',
    // Settings
    gameDuration: 600, // in seconds
    quarterDuration: 600,
    numberOfQuarters: 1,
    shotClockDuration: 12,
    targetScore: 21,
    foulLimit: 7,
  });

  // Selected Rosters
  const [teamAStarters, setTeamAStarters] = useState([]);
  const [teamASubstitutes, setTeamASubstitutes] = useState([]);
  const [teamBStarters, setTeamBStarters] = useState([]);
  const [teamBSubstitutes, setTeamBSubstitutes] = useState([]);

  const requiredStarters = matchType === '3x3' ? 3 : 5;
  const requiredSubs = matchType === '3x3' ? 1 : 5;
  const totalRoster = matchType === '3x3' ? 4 : 10;

  useEffect(() => {
    fetchOptions();
  }, []);

  // Update rule defaults whenever matchType changes
  const handleSelectMatchType = (type) => {
    setMatchType(type);
    if (type === '3x3') {
      setFormData((prev) => ({
        ...prev,
        venue: prev.venue.includes('Court') ? prev.venue : 'Center Court 3x3',
        gameDuration: 600,
        quarterDuration: 600,
        numberOfQuarters: 1,
        shotClockDuration: 12,
        targetScore: 21,
        foulLimit: 7,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        venue: prev.venue.includes('Court') ? prev.venue : 'Main Arena 5x5',
        gameDuration: 2400,
        quarterDuration: 600,
        numberOfQuarters: 4,
        shotClockDuration: 24,
        targetScore: 0,
        foulLimit: 5,
      }));
    }

    // Auto-trim or re-seed rosters if already selected
    if (formData.teamA) {
      autoAssignRoster('A', formData.teamA, type);
    }
    if (formData.teamB) {
      autoAssignRoster('B', formData.teamB, type);
    }
  };

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const [tRes, tmRes] = await Promise.all([tournamentApi.getAll(), teamApi.getAll()]);
      const availableTournaments = tRes?.data || [];
      const availableTeams = tmRes?.data || [];

      setTournaments(availableTournaments);
      setTeams(availableTeams);

      if (availableTeams.length >= 2) {
        const teamA = availableTeams[0];
        const teamB = availableTeams[1];
        setFormData((prev) => ({
          ...prev,
          teamA: teamA._id,
          teamB: teamB._id,
          matchName: `${teamA.name} vs ${teamB.name}`,
        }));

        autoAssignRoster('A', teamA._id, '3x3', availableTeams);
        autoAssignRoster('B', teamB._id, '3x3', availableTeams);
      }
    } catch (err) {
      setToast({ message: 'Error loading teams/tournaments: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const autoAssignRoster = (teamSide, teamId, type = matchType, teamList = teams) => {
    const teamDoc = teamList.find((t) => t._id === teamId);
    if (!teamDoc || !teamDoc.players || teamDoc.players.length === 0) {
      if (teamSide === 'A') {
        setTeamAStarters([]);
        setTeamASubstitutes([]);
      } else {
        setTeamBStarters([]);
        setTeamBSubstitutes([]);
      }
      return;
    }

    const nStarters = type === '3x3' ? 3 : 5;
    const nSubs = type === '3x3' ? 1 : 5;

    const allPlayerIds = teamDoc.players.map((p) => p._id || p);
    const starters = allPlayerIds.slice(0, nStarters);
    const subs = allPlayerIds.slice(nStarters, nStarters + nSubs);

    if (teamSide === 'A') {
      setTeamAStarters(starters);
      setTeamASubstitutes(subs);
    } else {
      setTeamBStarters(starters);
      setTeamBSubstitutes(subs);
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

    autoAssignRoster(which === 'teamA' ? 'A' : 'B', teamId);
  };

  // Toggle player assignment
  const handleAssignPlayer = (teamSide, playerId, targetBucket) => {
    const isTeamA = teamSide === 'A';
    const starters = isTeamA ? teamAStarters : teamBStarters;
    const subs = isTeamA ? teamASubstitutes : teamBSubstitutes;
    const setStarters = isTeamA ? setTeamAStarters : setTeamBStarters;
    const setSubs = isTeamA ? setTeamASubstitutes : setTeamBSubstitutes;

    const isStarter = starters.includes(playerId);
    const isSub = subs.includes(playerId);

    if (targetBucket === 'starters') {
      if (isStarter) {
        setStarters(starters.filter((id) => id !== playerId));
      } else {
        if (starters.length >= requiredStarters) {
          setToast({ message: `Max ${requiredStarters} starters allowed for ${matchType}`, type: 'warning' });
          return;
        }
        setSubs(subs.filter((id) => id !== playerId));
        setStarters([...starters, playerId]);
      }
    } else if (targetBucket === 'substitutes') {
      if (isSub) {
        setSubs(subs.filter((id) => id !== playerId));
      } else {
        if (subs.length >= requiredSubs) {
          setToast({ message: `Max ${requiredSubs} substitute(s) allowed for ${matchType}`, type: 'warning' });
          return;
        }
        setStarters(starters.filter((id) => id !== playerId));
        setSubs([...subs, playerId]);
      }
    }
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

    // Validate Team A Roster
    if (teamAStarters.length !== requiredStarters || teamASubstitutes.length !== requiredSubs) {
      setToast({
        message: `Team A requires exactly ${requiredStarters} starters and ${requiredSubs} substitute(s) for ${matchType}`,
        type: 'error',
      });
      return;
    }

    // Validate Team B Roster
    if (teamBStarters.length !== requiredStarters || teamBSubstitutes.length !== requiredSubs) {
      setToast({
        message: `Team B requires exactly ${requiredStarters} starters and ${requiredSubs} substitute(s) for ${matchType}`,
        type: 'error',
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        matchType,
        matchName: formData.matchName,
        tournamentId: formData.tournamentId || null,
        venue: formData.venue,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
        teamA: formData.teamA,
        teamB: formData.teamB,
        teamA_starters: teamAStarters,
        teamA_substitutes: teamASubstitutes,
        teamB_starters: teamBStarters,
        teamB_substitutes: teamBSubstitutes,
        settings: {
          gameDuration: Number(formData.gameDuration),
          shotClock: Number(formData.shotClockDuration),
          targetScore: Number(formData.targetScore),
          numberOfQuarters: matchType === '5x5' ? Number(formData.numberOfQuarters || 4) : 1,
          quarterDuration: Number(formData.quarterDuration || 600),
          foulLimit: Number(formData.foulLimit),
        },
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
    } finally {
      setSubmitting(false);
    }
  };

  const renderRosterSelector = (teamSide, teamId, starters, subs) => {
    const isTeamA = teamSide === 'A';
    const teamDoc = teams.find((t) => t._id === teamId);
    const teamPlayers = teamDoc?.players || [];

    const isComplete = starters.length === requiredStarters && subs.length === requiredSubs;

    return (
      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: teamDoc?.primaryColor || (isTeamA ? '#F59E0B' : '#10B981') }}
            />
            <h3 className="font-bold text-white text-sm">
              {teamDoc?.name || `Team ${teamSide}`} Roster
            </h3>
          </div>
          <button
            type="button"
            onClick={() => autoAssignRoster(teamSide, teamId)}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 bg-cyan-950/50 px-2 py-1 rounded border border-cyan-800/60"
          >
            <Sparkles className="w-3 h-3" /> Auto-Fill Roster
          </button>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`px-2 py-0.5 rounded border ${
              starters.length === requiredStarters
                ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                : 'bg-amber-950/70 text-amber-400 border-amber-800'
            }`}
          >
            Starters: {starters.length}/{requiredStarters}
          </span>
          <span
            className={`px-2 py-0.5 rounded border ${
              subs.length === requiredSubs
                ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                : 'bg-amber-950/70 text-amber-400 border-amber-800'
            }`}
          >
            Bench: {subs.length}/{requiredSubs}
          </span>
          {isComplete && (
            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" /> Ready
            </span>
          )}
        </div>

        {/* Player List */}
        {teamPlayers.length === 0 ? (
          <p className="text-xs text-slate-500 py-3 text-center">
            No registered players found for this team.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
            {teamPlayers.map((player) => {
              const pId = player._id || player;
              const isStarter = starters.includes(pId);
              const isSub = subs.includes(pId);

              return (
                <div
                  key={pId}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                    isStarter
                      ? 'bg-orange-500/10 border-orange-500/50 text-white'
                      : isSub
                      ? 'bg-blue-500/10 border-blue-500/50 text-white'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-slate-900 font-digital font-bold text-amber-400 flex items-center justify-center text-[11px]">
                      #{player.jerseyNumber ?? '?'}
                    </span>
                    <span className="font-semibold text-white">{player.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({player.position || 'G'})</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono">
                    <button
                      type="button"
                      onClick={() => handleAssignPlayer(teamSide, pId, 'starters')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                        isStarter
                          ? 'bg-orange-500 text-black border-orange-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-orange-300'
                      }`}
                    >
                      {isStarter ? 'Starter ✓' : '+ Starter'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAssignPlayer(teamSide, pId, 'substitutes')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                        isSub
                          ? 'bg-blue-500 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-blue-300'
                      }`}
                    >
                      {isSub ? 'Bench ✓' : '+ Bench'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Schedule New Match
          </h1>
          <p className="text-sm text-slate-400">
            Select format (3x3 or 5x5), configure official rosters, and calibrate game rules
          </p>
        </div>
      </div>

      {/* STEP 1: MATCH TYPE SELECTION (LARGE INTERACTIVE CARDS) */}
      <div className="space-y-3">
        <label className="block text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
          Step 1: Choose Match Type
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* 3x3 Card */}
          <button
            type="button"
            onClick={() => handleSelectMatchType('3x3')}
            className={`p-6 rounded-3xl border-2 text-left relative overflow-hidden transition-all duration-300 group ${
              matchType === '3x3'
                ? 'bg-gradient-to-br from-orange-950/60 via-slate-900 to-amber-950/40 border-orange-500 shadow-2xl shadow-orange-500/20 ring-2 ring-orange-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-2xl">
                🏀
              </div>
              {matchType === '3x3' && (
                <span className="px-2.5 py-1 rounded-full bg-orange-500 text-black font-mono font-black text-xs uppercase flex items-center gap-1 shadow-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                </span>
              )}
            </div>

            <div className="mt-4">
              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-orange-400 transition-colors">
                🏀 3x3 Basketball
              </h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Fast-paced half-court FIBA standard format with 12-second shot clock and 21-point sudden victory.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400">
              <div>
                <span className="text-white font-bold block">4 Players</span>
                <span>3 On-Court + 1 Sub</span>
              </div>
              <div>
                <span className="text-white font-bold block">12s Clock</span>
                <span>Stop clock 10:00</span>
              </div>
              <div>
                <span className="text-white font-bold block">21 PTS Win</span>
                <span>Sudden victory</span>
              </div>
            </div>
          </button>

          {/* 5x5 Card */}
          <button
            type="button"
            onClick={() => handleSelectMatchType('5x5')}
            className={`p-6 rounded-3xl border-2 text-left relative overflow-hidden transition-all duration-300 group ${
              matchType === '5x5'
                ? 'bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/40 border-blue-500 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500/40'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-2xl">
                🏀
              </div>
              {matchType === '5x5' && (
                <span className="px-2.5 py-1 rounded-full bg-blue-500 text-white font-mono font-black text-xs uppercase flex items-center gap-1 shadow-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                </span>
              )}
            </div>

            <div className="mt-4">
              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                🏀 5x5 Basketball
              </h2>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                Full-court standard basketball with 4 quarters (10:00 each), 24-second shot clock, and 3-point field goals.
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-[11px] font-mono text-slate-400">
              <div>
                <span className="text-white font-bold block">10 Players</span>
                <span>5 On-Court + 5 Subs</span>
              </div>
              <div>
                <span className="text-white font-bold block">24s Clock</span>
                <span>4 Quarters (Q1-Q4)</span>
              </div>
              <div>
                <span className="text-white font-bold block">+1/+2/+3 PTS</span>
                <span>3PT Arc Enabled</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Teams Requirement Notice */}
      {teams.length < 2 && (
        <div className="p-5 rounded-3xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-sm font-bold text-amber-200">
                At least 2 teams are required to schedule a match
              </p>
              <p className="text-xs text-amber-400/80 mt-0.5">
                You currently have {teams.length} team(s) registered. Add your teams and player rosters first.
              </p>
            </div>
          </div>
          <Link
            to="/teams"
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shrink-0 whitespace-nowrap shadow-md text-center transition-all active:scale-95"
          >
            + Go to Teams Directory
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Match Identity & Teams Selection */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Team Matchup ({matchType})
            </h2>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Roster: {totalRoster} per team ({requiredStarters} Starters + {requiredSubs} Subs)
            </span>
          </div>

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
                    {t.name} ({t.shortName}) — {t.players?.length || 0} players
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
                    {t.name} ({t.shortName}) — {t.players?.length || 0} players
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

        {/* ROSTER ASSIGNMENT SECTION */}
        {formData.teamA && formData.teamB && (
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Official Match Rosters ({matchType})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select exactly {requiredStarters} on-court starters and {requiredSubs} bench substitute(s) for each team.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderRosterSelector('A', formData.teamA, teamAStarters, teamASubstitutes)}
              {renderRosterSelector('B', formData.teamB, teamBStarters, teamBSubstitutes)}
            </div>
          </div>
        )}

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
                placeholder="Center Court"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-orange-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Format-Specific Rules Configuration */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" /> {matchType} Rules & Timer Parameters
            </h2>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-800">
              {matchType === '3x3' ? 'FIBA 3x3 Standards' : 'FIBA 5x5 Standards (4 Quarters)'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                {matchType === '3x3' ? 'Game Duration (Sec)' : 'Quarter Duration (Sec)'}
              </label>
              <input
                type="number"
                min={60}
                step={30}
                value={matchType === '3x3' ? formData.gameDuration : formData.quarterDuration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    gameDuration: matchType === '3x3' ? Number(e.target.value) : Number(e.target.value) * 4,
                    quarterDuration: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">
                {matchType === '3x3' ? '600s = 10:00 mins' : '600s = 10:00 per quarter'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                Shot Clock (Sec)
              </label>
              <input
                type="number"
                min={5}
                max={40}
                value={formData.shotClockDuration}
                onChange={(e) => setFormData({ ...formData, shotClockDuration: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">
                {matchType === '3x3' ? 'Default: 12s' : 'Default: 24s (14s reset)'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                Target Score (Sudden Win)
              </label>
              <input
                type="number"
                min={0}
                max={150}
                value={formData.targetScore}
                onChange={(e) => setFormData({ ...formData, targetScore: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">
                {matchType === '3x3' ? '21 points for 3x3' : '0 = No target (time based)'}
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-bold text-slate-400 mb-1">
                Foul Limit (Bonus)
              </label>
              <input
                type="number"
                min={3}
                max={15}
                value={formData.foulLimit}
                onChange={(e) => setFormData({ ...formData, foulLimit: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:border-orange-500 outline-none"
              />
              <span className="text-[10px] text-slate-500">
                {matchType === '3x3' ? '7 fouls penalty' : '5 fouls per quarter'}
              </span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-sm shadow-xl shadow-orange-600/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <span>{submitting ? 'Creating Match...' : `Create ${matchType} Match & Staging Setup`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CreateMatchPage;
