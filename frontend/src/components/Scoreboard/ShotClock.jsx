import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Play, Pause, AlertTriangle } from 'lucide-react';

const ShotClock = ({
  shotClockRemaining = 12,
  shotClockRunning = false,
  shotClockStartedAt = null,
  serverTime = null,
  matchType = '3x3', // '3x3' or '5x5'
  disabled = false,
  onReset12 = null,
  onReset2 = null,
  onResetFull = null,
  onResetShort = null,
  onTogglePause = null,
  onExpire = null,
  isScorer = false,
  large = false,
}) => {
  const [displaySecs, setDisplaySecs] = useState(shotClockRemaining);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  if (disabled) {
    return (
      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/50 border border-slate-800 shadow-xl opacity-75">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-600" />
          SHOT CLOCK (OFF)
        </div>
        <div className={`font-digital font-black tracking-[0.14em] pl-1 select-none leading-none text-slate-600 ${large ? 'text-6xl sm:text-8xl' : 'text-5xl sm:text-7xl'}`}>
          --
        </div>
        <p className="text-[10px] text-slate-500 font-mono mt-1">Shot clock disabled</p>
      </div>
    );
  }

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (shotClockRemaining > 0) {
      hasExpiredRef.current = false;
    }
  }, [shotClockRemaining, shotClockStartedAt]);

  const localReceivedAtRef = useRef(Date.now());
  const lastStartedAtRef = useRef(shotClockStartedAt);

  useEffect(() => {
    if (shotClockStartedAt !== lastStartedAtRef.current) {
      lastStartedAtRef.current = shotClockStartedAt;
      localReceivedAtRef.current = Date.now();
    }
  }, [shotClockStartedAt]);

  useEffect(() => {
    let animationFrameId;

    const updateClock = () => {
      if (shotClockRunning && shotClockStartedAt) {
        let elapsed = 0;
        const now = Date.now();

        // If local client started shot clock or client clock aligns with shotClockStartedAt
        if (!serverTime || Math.abs(now - shotClockStartedAt) < 1800000) {
          elapsed = Math.max(0, (now - shotClockStartedAt) / 1000);
        } else {
          // Remote spectator client synchronization
          const serverBaseElapsed = (serverTime > shotClockStartedAt) ? (serverTime - shotClockStartedAt) / 1000 : 0;
          const additionalClientElapsed = Math.max(0, (now - localReceivedAtRef.current) / 1000);
          elapsed = serverBaseElapsed + additionalClientElapsed;
        }

        const currentRemaining = Math.max(0, shotClockRemaining - elapsed);
        setDisplaySecs(currentRemaining);

        if (currentRemaining <= 0) {
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            if (onExpireRef.current) onExpireRef.current();
          }
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
  }, [shotClockRemaining, shotClockRunning, shotClockStartedAt]);

  const roundedSeconds = Math.max(0, Math.ceil(displaySecs));
  const isWarning = roundedSeconds <= (matchType === '5x5' ? 5 : 3) && roundedSeconds > 0;
  const isExpired = roundedSeconds === 0;

  const fullSecs = matchType === '5x5' ? 24 : 12;
  const shortSecs = matchType === '5x5' ? 14 : 2;

  const handleFullReset = () => {
    if (onResetFull) onResetFull();
    else if (onReset12) onReset12();
  };

  const handleShortReset = () => {
    if (onResetShort) onResetShort();
    else if (onReset2) onReset2();
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/60 border border-slate-800 shadow-2xl relative">
      <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        SHOT CLOCK ({fullSecs}s)
      </div>

      {/* Main Digital Display */}
      <div
        className={`font-digital font-black tracking-[0.14em] pl-1 inline-block select-none transition-all leading-none ${
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
          <button
            onClick={handleFullReset}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs font-bold border border-cyan-500/30 flex items-center gap-1 transition-all active:scale-95"
            title={`Reset Shot Clock to ${fullSecs}s`}
          >
            <RotateCcw className="w-3 h-3" /> {fullSecs}s
          </button>

          <button
            onClick={handleShortReset}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono text-xs font-bold border border-amber-500/30 flex items-center gap-1 transition-all active:scale-95"
            title={`Reset Shot Clock to ${shortSecs}s (Offensive Rebound)`}
          >
            <RotateCcw className="w-3 h-3" /> {shortSecs}s
          </button>

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
