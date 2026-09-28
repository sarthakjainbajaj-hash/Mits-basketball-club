import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, ArrowRight, CheckCircle2, Users, Shield } from 'lucide-react';

const SubstitutionModal = ({
  isOpen = false,
  team = 'A',
  teamData = null,
  starters = [],
  substitutes = [],
  onSubstitute = null,
  onClose = null,
}) => {
  const [selectedOut, setSelectedOut] = useState(null);
  const [selectedIn, setSelectedIn] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedOut(starters.length > 0 ? (starters[0].player?._id || starters[0].player) : null);
      setSelectedIn(substitutes.length > 0 ? (substitutes[0].player?._id || substitutes[0].player) : null);
    }
  }, [isOpen, starters, substitutes]);

  if (!isOpen) return null;

  const teamName = teamData?.name || `Team ${team}`;
  const primaryColor = teamData?.primaryColor || (team === 'A' ? '#FF5722' : '#06B6D4');

  const playerOutDoc = starters.find((p) => (p.player?._id || p.player) === selectedOut);
  const playerInDoc = substitutes.find((p) => (p.player?._id || p.player) === selectedIn);

  const handleConfirm = () => {
    if (!selectedOut || !selectedIn) return;
    if (onSubstitute) {
      onSubstitute(team, selectedOut, selectedIn);
    }
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className="p-5 flex items-center justify-between border-b border-slate-800 bg-slate-950/60"
          style={{ borderTop: `4px solid ${primaryColor}` }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base leading-tight">
                In-Game Player Substitution
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {teamName} (Team {team})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Substitution Visual Summary Card */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800/80">
          <div className="flex items-center justify-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 px-3 py-1.5 rounded-xl">
              <span className="text-red-400 font-bold uppercase">OUT:</span>
              <span className="font-digital font-bold text-amber-400 text-sm">
                #{playerOutDoc?.jerseyNumber ?? '?'}
              </span>
              <span className="text-white font-bold">{playerOutDoc?.name || 'Select player'}</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500 animate-pulse" />

            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <span className="text-emerald-400 font-bold uppercase">IN:</span>
              <span className="font-digital font-bold text-cyan-400 text-sm">
                #{playerInDoc?.jerseyNumber ?? '?'}
              </span>
              <span className="text-white font-bold">{playerInDoc?.name || 'Select player'}</span>
            </div>
          </div>
        </div>

        {/* Columns: Step 1 (OUT) vs Step 2 (IN) */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Active On-Court Players (Going OUT) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase text-red-400">
                1. Select Outgoing (On Court)
              </span>
              <span className="text-[10px] font-mono text-slate-500">{starters.length} active</span>
            </div>

            <div className="space-y-2">
              {starters.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No active court players</p>
              ) : (
                starters.map((item) => {
                  const pId = item.player?._id || item.player;
                  const isSelected = selectedOut === pId;

                  return (
                    <button
                      key={pId}
                      type="button"
                      onClick={() => setSelectedOut(pId)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? 'bg-red-500/20 border-red-500 ring-2 ring-red-500/40 text-white'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 font-digital font-bold text-amber-400 flex items-center justify-center text-xs">
                          #{item.jerseyNumber}
                        </span>
                        <div>
                          <div className="font-bold text-xs text-white">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.position || 'Court'}
                          </div>
                        </div>
                      </div>
                      {isSelected && <span className="text-[10px] font-mono font-bold text-red-400 uppercase">SUB OUT</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Step 2: Bench Substitutes (Coming IN) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="text-xs font-mono font-bold uppercase text-emerald-400">
                2. Select Incoming (Bench)
              </span>
              <span className="text-[10px] font-mono text-slate-500">{substitutes.length} bench</span>
            </div>

            <div className="space-y-2">
              {substitutes.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No bench substitutes available</p>
              ) : (
                substitutes.map((item) => {
                  const pId = item.player?._id || item.player;
                  const isSelected = selectedIn === pId;

                  return (
                    <button
                      key={pId}
                      type="button"
                      onClick={() => setSelectedIn(pId)}
                      className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                        isSelected
                          ? 'bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/40 text-white'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 font-digital font-bold text-cyan-400 flex items-center justify-center text-xs">
                          #{item.jerseyNumber}
                        </span>
                        <div>
                          <div className="font-bold text-xs text-white">{item.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.position || 'Bench'}
                          </div>
                        </div>
                      </div>
                      {isSelected && <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">SUB IN</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Confirmation */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedOut || !selectedIn}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Substitution</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubstitutionModal;
