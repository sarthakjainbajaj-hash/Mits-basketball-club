import React, { useState, useEffect } from 'react';
import { RotateCcw, Play, Pause, AlertTriangle } from 'lucide-react';

const ShotClock = ({
  shotClockRemaining = 12,
  shotClockRunning = false,
  shotClockStartedAt = null,
  onReset12 = null,
  onReset2 = null,
  onTogglePause = null,
  onExpire = null,
  isScorer = false,
  large = false,
}) => {
  const [displaySecs, setDisplaySecs] = useState(shotClockRemaining);

  useEffect(() => {
    let animationFrameId;

    const updateClock = () => {
      if (shotClockRunning && shotClockStartedAt) {
        const elapsed = (Date.now() - shotClockStartedAt) / 1000;
        const currentRemaining = Math.max(0, shotClockRemaining - elapsed);
        setDisplaySecs(currentRemaining);

        if (currentRemaining <= 0) {
          if (onExpire) onExpire();
          return;
        }

        animationFrameId = requestAnimationFrame(updateClock);
      } else {
        setDisplaySecs(shotClockRemaining);
      }
    };

    updateClock();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [shotClockRemaining, shotClockRunning, shotClockStartedAt, onExpire]);

  const roundedSeconds = Math.max(0, Math.ceil(displaySecs));
  const isWarning = roundedSeconds <= 3 && roundedSeconds > 0;
  const isExpired = roundedSeconds === 0;

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/60 border border-slate-800 shadow-2xl relative">
      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        SHOT CLOCK (12s)
      </div>

      {/* Main Digital Display */}
      <div
        className={`font-digital font-black tracking-tighter select-none transition-all leading-none ${
          large ? 'text-6xl sm:text-8xl' : 'text-5xl sm:text-7xl'
        } ${
          isExpired
            ? 'text-red-500 led-red animate-buzzer-flash'
            : isWarning
            ? 'text-red-500 led-red animate-pulse-fast'
            : 'text-amber-400 led-amber'
        }`}
      >
        {roundedSeconds.toString().padStart(2, '0')}
      </div>

      {/* Warning Banner when time is critical */}
      {isWarning && (
        <div className="absolute top-1 right-2 flex items-center gap-1 text-[10px] font-bold text-red-400 font-mono animate-bounce">
          <AlertTriangle className="w-3 h-3" /> CRITICAL
        </div>
      )}

      {/* Scorer Controls Bar */}
      {isScorer && (
        <div className="flex items-center gap-1.5 mt-3 pt-2 border-t border-slate-800/80 w-full justify-center">
          {onReset12 && (
            <button
              onClick={onReset12}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/30 flex items-center gap-1 transition-all active:scale-95"
              title="Reset Shot Clock to 12s"
            >
              <RotateCcw className="w-3 h-3" /> 12
            </button>
          )}

          {onReset2 && (
            <button
              onClick={onReset2}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-xs font-bold border border-amber-500/30 flex items-center gap-1 transition-all active:scale-95"
              title="Reset Shot Clock to 2s (Offensive Rebound / Quick Reset)"
            >
              <RotateCcw className="w-3 h-3" /> 2s
            </button>
          )}

          {onTogglePause && (
            <button
              onClick={onTogglePause}
              className={`p-1.5 rounded text-xs font-bold border transition-all active:scale-95 ${
                shotClockRunning
                  ? 'bg-amber-950/40 text-amber-400 border-amber-800 hover:bg-amber-900/50'
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-800 hover:bg-emerald-900/50'
              }`}
              title={shotClockRunning ? 'Pause Shot Clock' : 'Resume Shot Clock'}
            >
              {shotClockRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ShotClock;
