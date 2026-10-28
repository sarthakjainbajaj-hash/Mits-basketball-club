import React, { useState, useEffect, useRef } from 'react';

const DigitalTimer = ({
  remainingTime = 600,
  timerRunning = false,
  timerStartedAt = null,
  serverTime = null,
  onExpire = null,
  large = false,
}) => {
  const [displaySeconds, setDisplaySeconds] = useState(remainingTime);
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);

  // Lowest displayed value during active run to enforce strict monotonic countdown (timer NEVER jumps up)
  const minDisplayedRef = useRef(remainingTime);

  // Server clock offset (serverTime - localClientTime)
  const serverOffsetRef = useRef(0);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // Compute and smooth server clock offset
  useEffect(() => {
    if (serverTime) {
      const currentOffset = serverTime - Date.now();
      // Smooth out small jitter; only update if significant or initial
      if (serverOffsetRef.current === 0 || Math.abs(currentOffset - serverOffsetRef.current) > 400) {
        serverOffsetRef.current = currentOffset;
      }
    }
  }, [serverTime]);

  // Reset monotonic floor and expiration flag whenever clock stops, resets, or changes period
  useEffect(() => {
    hasExpiredRef.current = false;
    minDisplayedRef.current = remainingTime;
    setDisplaySeconds(remainingTime);
  }, [remainingTime, timerStartedAt, timerRunning === false]);

  useEffect(() => {
    let animationFrameId;
    let lastRenderedWhole = -1;
    let lastRenderedTenth = -1;

    const updateTimer = () => {
      if (timerRunning && timerStartedAt) {
        const now = Date.now() + serverOffsetRef.current;
        const elapsed = Math.max(0, (now - timerStartedAt) / 1000);
        let rawRemaining = Math.max(0, remainingTime - elapsed);

        // Monotonic non-increasing guarantee: timer must NEVER jump upwards while running
        if (rawRemaining < minDisplayedRef.current) {
          minDisplayedRef.current = rawRemaining;
        } else {
          rawRemaining = minDisplayedRef.current;
        }

        const wholeSecs = Math.floor(rawRemaining);
        const tenthSecs = Math.floor((rawRemaining % 1) * 10);

        // Throttled frame updates: only trigger React re-render when visible digits change
        const shouldUpdate =
          rawRemaining <= 60
            ? wholeSecs !== lastRenderedWhole || tenthSecs !== lastRenderedTenth
            : wholeSecs !== lastRenderedWhole;

        if (shouldUpdate) {
          lastRenderedWhole = wholeSecs;
          lastRenderedTenth = tenthSecs;
          setDisplaySeconds(rawRemaining);
        }

        if (rawRemaining <= 0) {
          setDisplaySeconds(0);
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            if (onExpireRef.current) onExpireRef.current();
          }
          return;
        }

        animationFrameId = requestAnimationFrame(updateTimer);
      } else {
        setDisplaySeconds(remainingTime);
        minDisplayedRef.current = remainingTime;
      }
    };

    updateTimer();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [remainingTime, timerRunning, timerStartedAt]);

  const mins = Math.floor(Math.max(0, displaySeconds) / 60);
  const secs = Math.floor(Math.max(0, displaySeconds) % 60);
  const formattedMins = mins.toString().padStart(2, '0');
  const formattedSecs = secs.toString().padStart(2, '0');

  // Sub-seconds (tenths) when under 1 minute for authentic stadium precision
  const tenths = Math.floor((Math.max(0, displaySeconds) % 1) * 10);
  const isCritical = displaySeconds <= 60 && displaySeconds > 0;
  const isZero = displaySeconds <= 0;

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`font-digital font-black tracking-widest select-none transition-colors ${
          large ? 'text-6xl sm:text-8xl md:text-9xl' : 'text-4xl sm:text-6xl md:text-7xl'
        } ${
          isZero
            ? 'text-red-500 led-red animate-pulse'
            : isCritical
            ? 'text-red-400 led-red'
            : timerRunning
            ? 'text-emerald-400 led-green'
            : 'text-amber-400 led-amber'
        }`}
      >
        <span className="tracking-[0.16em] inline-block">{formattedMins}</span>
        <span className={`px-1 inline-block ${timerRunning ? 'animate-pulse' : ''}`}>:</span>
        <span className="tracking-[0.16em] inline-block">{formattedSecs}</span>
        {isCritical && (
          <span className="text-3xl sm:text-5xl md:text-6xl text-red-400 opacity-90 tracking-[0.12em] pl-1">
            .{tenths}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mt-1">
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            timerRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-500'
          }`}
        />
        <span className="text-xs uppercase font-mono font-bold tracking-widest text-slate-400">
          {timerRunning ? 'GAME CLOCK RUNNING' : isZero ? 'TIME EXPIRED' : 'CLOCK STOPPED'}
        </span>
      </div>
    </div>
  );
};

export default DigitalTimer;
