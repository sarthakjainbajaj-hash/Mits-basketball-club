import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useSound } from '../context/SoundContext';
import {
  Settings,
  Volume2,
  VolumeX,
  Radio,
  Server,
  Shield,
  HelpCircle,
  Play,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const {
    soundEnabled,
    toggleSound,
    playShotClockBuzzer,
    playGameEndHorn,
    playWhistle,
  } = useSound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-8 h-8 text-orange-500" /> System & Scoreboard Settings
        </h1>
        <p className="text-sm text-slate-400">
          Audio synthesizer test suite, real-time WebSocket connection diagnostics, and FIBA 3x3 rulebook
        </p>
      </div>

      {/* Audio Engine Configuration */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-bold text-white text-base">Arena Audio Synthesizer (Web Audio API)</h2>
              <p className="text-xs text-slate-400">
                Loud electronic stadium horns and shot clock buzzer sounds
              </p>
            </div>
          </div>

          <button
            onClick={toggleSound}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all ${
              soundEnabled
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800 shadow-md shadow-emerald-900/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{soundEnabled ? 'SOUND ENABLED' : 'SOUND MUTED'}</span>
          </button>
        </div>

        {/* Audio Test Triggers */}
        <div>
          <p className="text-xs font-mono uppercase text-slate-400 font-bold mb-3">
            Buzzer Test Suite
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={playShotClockBuzzer}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-red-500/60 text-left transition-all group active:scale-95"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-xs group-hover:text-red-400 transition-colors">
                  Shot Clock Expired
                </span>
                <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400" />
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Dissonant 440/452Hz arena buzzer</p>
            </button>

            <button
              onClick={playGameEndHorn}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/60 text-left transition-all group active:scale-95"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors">
                  Game End Stadium Horn
                </span>
                <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Deep 220Hz resonant brass horn</p>
            </button>

            <button
              onClick={playWhistle}
              className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/60 text-left transition-all group active:scale-95"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-xs group-hover:text-cyan-400 transition-colors">
                  Referee Whistle
                </span>
                <Play className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </div>
              <p className="text-[10px] text-slate-500 font-mono">2.6kHz modulated high-pitch whistle</p>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time WebSocket & System Status */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <Server className="w-5 h-5 text-cyan-400" />
          <h2 className="font-bold text-white text-base">Network & Diagnostics</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400">
                Socket.IO Real-time Connection
              </span>
              <div className="font-bold text-white text-sm flex items-center gap-1.5 mt-0.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isConnected ? 'bg-emerald-400' : 'bg-red-400 animate-ping'
                  }`}
                />
                <span>{isConnected ? 'Connected & Subscribed' : 'Reconnecting...'}</span>
              </div>
            </div>
            <Radio className={`w-5 h-5 ${isConnected ? 'text-emerald-400' : 'text-red-400'}`} />
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400">Current User</span>
              <div className="font-bold text-white text-sm mt-0.5">{user?.name || 'Guest'}</div>
              <span className="text-[10px] font-mono uppercase text-orange-400">
                Role: {user?.role || 'viewer'}
              </span>
            </div>
            <Shield className="w-5 h-5 text-orange-400" />
          </div>
        </div>
      </div>

      {/* FIBA 3x3 Official Rules Summary */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-white text-base">FIBA 3x3 Official Rule Summary</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300 font-mono leading-relaxed">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-400 uppercase text-xs">Game Duration & Target Score</h4>
            <p>
              • Playing time is 1 period of 10:00 minutes stop-clock.
            </p>
            <p>
              • First team to score <strong className="text-white">21 points or more</strong> wins immediately (Sudden Victory), even before regulation time expires!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-400 uppercase text-xs">Shot Clock & Fouls</h4>
            <p>
              • Shot clock is strictly <strong className="text-white">12 seconds</strong>.
            </p>
            <p>
              • Team fouls 7, 8, and 9 award <strong className="text-white">2 free throws</strong>.
            </p>
            <p>
              • 10th foul and subsequent award <strong className="text-white">2 free throws + ball possession</strong>!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
