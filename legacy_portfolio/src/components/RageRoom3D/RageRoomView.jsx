import { useEffect, useRef, useState } from "react";
import { RageRoomEngine, WEAPONS } from "./RageRoomEngine";
import { rageSound } from "./rageAudio";
import VirtualJoystick from "../Game/VirtualJoystick";
import {
  FaVolumeMute,
  FaVolumeUp,
  FaMusic,
  FaExpand,
  FaCompress,
  FaRedo,
  FaQuestionCircle,
  FaTimes,
  FaGlobe,
  FaGamepad,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function RageRoomView({
  onToggleViewMode,
  onSwitchGame,
  isEmbedded = false,
  onOpenFullscreen,
}) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);

  const [activeWeapon, setActiveWeapon] = useState(WEAPONS[0]);
  const [activeWeaponIndex, setActiveWeaponIndex] = useState(0);
  const [isHudVisible, setIsHudVisible] = useState(true);
  const [stats, setStats] = useState({
    mode: "free",
    timeRemaining: 60,
    score: 0,
    rage: 0,
    combo: 0,
    maxCombo: 0,
    hits: 0,
    targetZone: null,
    isPaused: false,
    isGameOver: false,
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isBgmOn, setIsBgmOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [endStats, setEndStats] = useState(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const engine = new RageRoomEngine(container, {
      mode: "free",
      onStatsChange: (newStats) => {
        setStats(newStats);
        if (newStats.activeWeapon) {
          setActiveWeapon(newStats.activeWeapon);
        }
      },
      onModeEnd: (finalStats) => {
        setEndStats(finalStats);
        setShowGameOverModal(true);
      },
    });

    engineRef.current = engine;

    const handleKey = (e) => {
      if (e.key === "h" || e.key === "H") {
        setIsHudVisible((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      engine.destroy();
      rageSound.stopBgm();
    };
  }, []);

  const handleWeaponSelect = (index) => {
    setActiveWeaponIndex(index);
    setActiveWeapon(WEAPONS[index]);
    if (engineRef.current) {
      engineRef.current.selectWeapon(index);
    }
  };

  const handleModeSelect = (mode) => {
    setShowGameOverModal(false);
    if (engineRef.current) {
      engineRef.current.setMode(mode);
    }
  };

  const handleAttack = () => {
    if (engineRef.current) {
      engineRef.current.attack();
    }
  };

  const handleResetDummy = () => {
    if (engineRef.current) {
      engineRef.current.resetDummy();
      rageSound.playSwing();
    }
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    rageSound.setMuted(next);
    if (!next) rageSound.playFoamBonk();
  };

  const toggleBgm = () => {
    const next = !isBgmOn;
    setIsBgmOn(next);
    rageSound.toggleBgm();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // 1. EMBEDDED VIEW (Clean & Minimal for Homepage)
  if (isEmbedded) {
    return (
      <div className="relative w-full h-[550px] sm:h-[650px] overflow-hidden rounded-[2rem] border-2 border-rose-500/60 bg-slate-950 shadow-2xl select-none">
        <div
          ref={containerRef}
          className="relative h-full w-full touch-none cursor-crosshair active:cursor-grabbing"
        />

        {/* Center Crosshair */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            <div className="h-4 w-4 rounded-full border-2 border-rose-400/80 bg-rose-500/20" />
            <div className="absolute h-1 w-1 rounded-full bg-white shadow-lg" />
          </div>
        </div>

        {/* Top Floating Mini Bar */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-between p-3 z-30">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-rose-500/50 bg-slate-950/85 px-3 py-1 text-xs text-rose-300 shadow backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-extrabold">RAGE ROOM 3D</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300 font-bold">Score: {stats.score}</span>
            <span className="text-slate-600">|</span>
            <span className="text-rose-400 font-bold">Rage: {stats.rage}%</span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {onSwitchGame && (
              <button
                onClick={onSwitchGame}
                type="button"
                className="flex items-center gap-1 rounded-full border border-gold-500/60 bg-brand-950/80 px-3 py-1 text-xs font-bold text-gold-300 shadow hover:bg-brand-900 transition"
                title="Switch to Citadel 3D RPG Realm"
              >
                <span>🏰</span>
                <span className="hidden sm:inline">Citadel 3D</span>
              </button>
            )}
            <button
              onClick={toggleSound}
              type="button"
              className="rounded-full border border-slate-700 bg-slate-950/85 p-1.5 text-slate-300 shadow hover:border-rose-500 hover:text-rose-300 backdrop-blur-md transition"
              title="Toggle Audio"
            >
              {isMuted ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
            </button>
            <button
              onClick={onOpenFullscreen}
              type="button"
              className="flex items-center gap-1 rounded-full border border-rose-500/70 bg-gradient-to-r from-rose-600 to-amber-600 px-3 py-1 text-xs font-bold text-white shadow hover:scale-105 transition"
            >
              <FaExpand size={11} />
              <span>Fullscreen 3D</span>
            </button>
          </div>
        </div>

        {/* Embedded Bottom Weapon Switcher */}
        <div className="pointer-events-auto absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-2xl border border-rose-500/40 bg-slate-950/90 p-1 shadow-2xl backdrop-blur-md z-20 max-w-full overflow-x-auto">
          {WEAPONS.map((w, idx) => (
            <button
              key={w.id}
              onClick={() => handleWeaponSelect(idx)}
              className={`flex items-center gap-1 rounded-xl px-2 py-1 text-xs font-bold transition ${
                activeWeaponIndex === idx
                  ? "bg-rose-600 text-white shadow"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
              title={w.name}
            >
              <span>{w.icon}</span>
              <span className="hidden sm:inline text-[11px]">{w.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Mobile touch controls */}
        <VirtualJoystick
          onMove={(dx, dy) => engineRef.current?.setJoystickInput(dx, dy)}
          onAttack={handleAttack}
          onAction={handleResetDummy}
        />
      </div>
    );
  }

  // 2. FULLSCREEN IMMERSIVE MODE (Clean, Minimal, Non-Intrusive)
  return (
    <div className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="relative h-full w-full touch-none cursor-crosshair active:cursor-grabbing"
      />

      {/* Center Screen Crosshair */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-30">
        <div className="relative flex items-center justify-center">
          <div
            className={`h-4 w-4 rounded-full border-2 transition-transform duration-100 ${
              stats.combo > 0
                ? "border-amber-400 scale-125 bg-amber-400/20"
                : "border-rose-400/80 bg-rose-500/15"
            }`}
          />
          <div className="absolute h-1 w-1 rounded-full bg-white shadow-lg" />
        </div>
      </div>

      {/* Dynamic Hit Combo Badge (Center-Top, non-blocking) */}
      {stats.combo > 1 && (
        <div className="pointer-events-none fixed top-12 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <div className="flex items-center gap-1.5 rounded-full border border-amber-400/80 bg-slate-950/90 px-4 py-1 text-xs sm:text-sm font-black text-amber-300 shadow-2xl backdrop-blur-md">
            <span>🔥</span>
            <span>{stats.combo}x COMBO!</span>
            {stats.combo >= 8 && <span className="text-rose-400 animate-pulse">FRENZY!</span>}
          </div>
        </div>
      )}

      {/* Target Practice Prompt Banner */}
      {stats.targetZone && (
        <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-30 animate-pulse">
          <div className="flex items-center gap-1.5 rounded-full border border-yellow-400/80 bg-yellow-950/85 px-3.5 py-1 text-[11px] font-black text-yellow-300 shadow-xl backdrop-blur-md">
            <span>🎯</span>
            <span>CHASE & HIT: {stats.targetZone.toUpperCase()} (+250%)</span>
          </div>
        </div>
      )}

      {/* 🌟 HUD VISIBILITY TOGGLE (Floating Top-Right When UI Hidden) 🌟 */}
      {!isHudVisible ? (
        <button
          onClick={() => setIsHudVisible(true)}
          className="pointer-events-auto fixed top-3 right-3 z-50 flex items-center gap-1.5 rounded-full border border-rose-500/60 bg-slate-950/85 px-3 py-1.5 text-xs font-bold text-rose-300 shadow-2xl backdrop-blur-md hover:scale-105 transition"
          title="Show HUD [Press H]"
        >
          <FaEye size={12} />
          <span>Show UI [H]</span>
        </button>
      ) : (
        <>
          {/* Top Flush Neon Glowing Rage Progress Bar */}
          <div className="pointer-events-none fixed top-0 inset-x-0 h-1 bg-slate-950 z-50">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 transition-all duration-200 shadow-[0_0_12px_#f43f5e]"
              style={{ width: `${stats.rage}%` }}
            />
          </div>

          {/* ULTRA-SLEEK TOP HUD BAR */}
          <header className="pointer-events-none fixed left-0 right-0 top-1.5 z-40 p-2 sm:px-4">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
              
              {/* Left: Compact Badge */}
              <div className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-rose-500/40 bg-slate-950/85 px-3 py-1 text-xs text-slate-200 shadow backdrop-blur-md">
                <span className="text-base">🥊</span>
                <span className="font-extrabold text-white font-heading tracking-wide">
                  RAGE ROOM 3D
                </span>
                <span className="text-slate-600">|</span>
                <span className="font-bold text-amber-300">Score: {stats.score}</span>
                <span className="text-slate-600 hidden sm:inline">|</span>
                <span className="font-bold text-rose-400 hidden sm:inline">Rage: {stats.rage}%</span>
                {stats.mode === "timed" && (
                  <span className="font-bold text-rose-300 ml-1">⏱️ {stats.timeRemaining}s</span>
                )}
              </div>

              {/* Center: Slim Game Mode Switcher */}
              <div className="pointer-events-auto hidden md:flex items-center gap-1 rounded-xl border border-rose-500/30 bg-slate-950/85 p-1 text-xs shadow backdrop-blur-md">
                {[
                  { id: "free", label: "Free", icon: "♾️" },
                  { id: "timed", label: "60s", icon: "⏱️" },
                  { id: "combo", label: "Combo", icon: "🔥" },
                  { id: "target", label: "Target", icon: "🎯" },
                  { id: "zen", label: "Zen", icon: "🧘" },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleModeSelect(m.id)}
                    className={`flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[11px] font-bold transition ${
                      stats.mode === m.id
                        ? "bg-rose-600 text-white shadow"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Right: Sleek Action Tools */}
              <div className="pointer-events-auto flex items-center gap-1.5">
                {/* Hide UI Toggle */}
                <button
                  onClick={() => setIsHudVisible(false)}
                  className="rounded-lg border border-slate-700 bg-slate-950/85 p-1.5 text-slate-300 shadow hover:border-rose-400 hover:text-rose-300 backdrop-blur-md transition"
                  title="Hide UI for full view [H]"
                >
                  <FaEyeSlash size={12} />
                </button>

                {/* Reset Dummy */}
                <button
                  onClick={handleResetDummy}
                  className="rounded-lg border border-slate-700 bg-slate-950/85 p-1.5 text-slate-300 shadow hover:border-amber-400 hover:text-amber-300 backdrop-blur-md transition"
                  title="Reset Dummy & Room [R]"
                >
                  <FaRedo size={12} />
                </button>

                {/* Lo-fi Synth Music Toggle */}
                <button
                  onClick={toggleBgm}
                  className={`rounded-lg border p-1.5 shadow backdrop-blur-md transition ${
                    isBgmOn
                      ? "border-emerald-500 bg-emerald-950/70 text-emerald-300"
                      : "border-slate-700 bg-slate-950/85 text-slate-400"
                  }`}
                  title="Arcade Music"
                >
                  <FaMusic size={11} />
                </button>

                {/* Audio SFX Toggle */}
                <button
                  onClick={toggleSound}
                  className="rounded-lg border border-slate-700 bg-slate-950/85 p-1.5 text-slate-300 shadow hover:border-rose-400 backdrop-blur-md transition"
                  title="Sound FX"
                >
                  {isMuted ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
                </button>

                {/* Instructions Help */}
                <button
                  onClick={() => setShowInstructions(true)}
                  className="rounded-lg border border-rose-500/50 bg-slate-950/85 p-1.5 text-rose-300 shadow hover:scale-105 backdrop-blur-md transition"
                  title="Help & Controls"
                >
                  <FaQuestionCircle size={12} />
                </button>

                {/* Fullscreen */}
                <button
                  onClick={toggleFullscreen}
                  className="hidden sm:block rounded-lg border border-slate-700 bg-slate-950/85 p-1.5 text-slate-300 shadow hover:border-rose-400 backdrop-blur-md transition"
                  title="Fullscreen"
                >
                  {isFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
                </button>

                {/* Switch to Citadel 3D */}
                {onSwitchGame && (
                  <button
                    onClick={onSwitchGame}
                    type="button"
                    className="flex items-center gap-1 rounded-xl border border-gold-500/70 bg-gradient-to-r from-brand-700 to-gold-600 px-2.5 py-1 text-xs font-black text-white shadow hover:scale-105 transition"
                    title="Switch to Citadel 3D RPG Realm"
                  >
                    <FaGamepad size={11} />
                    <span className="hidden sm:inline">Citadel 3D</span>
                  </button>
                )}

                {/* Classic Website */}
                <button
                  onClick={onToggleViewMode}
                  type="button"
                  className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-900/90 px-2.5 py-1 text-xs font-bold text-slate-300 shadow hover:text-white transition"
                  title="Return to Classic Portfolio View"
                >
                  <FaGlobe size={11} />
                  <span className="hidden sm:inline">Website</span>
                </button>
              </div>
            </div>
          </header>

          {/* ULTRA-COMPACT BOTTOM WEAPON DOCK (Height ~38px, completely unblocks view!) */}
          <div className="pointer-events-auto fixed bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1 sm:gap-1.5 rounded-2xl border border-rose-500/40 bg-slate-950/90 p-1 shadow-2xl backdrop-blur-xl">
            {WEAPONS.map((w, idx) => {
              const isSelected = activeWeaponIndex === idx;
              return (
                <button
                  key={w.id}
                  onClick={() => handleWeaponSelect(idx)}
                  className={`flex items-center gap-1 rounded-xl px-2 sm:px-2.5 py-1 text-xs font-bold transition ${
                    isSelected
                      ? "bg-rose-600 text-white shadow-lg scale-105 border border-rose-300"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                  title={`${w.name}: ${w.desc} [Key ${idx + 1}]`}
                >
                  <span className="text-sm">{w.icon}</span>
                  <span className="text-[10px] font-mono opacity-60">[{idx + 1}]</span>
                  {isSelected && (
                    <span className="hidden md:inline text-[11px] ml-0.5">
                      {w.name.split(" ")[0]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Mobile Virtual Joystick & Action Buttons */}
      <VirtualJoystick
        onMove={(dx, dy) => engineRef.current?.setJoystickInput(dx, dy)}
        onAttack={handleAttack}
        onAction={handleResetDummy}
      />

      {/* 🌟 INSTRUCTIONS & CONTROLS MODAL 🌟 */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border-2 border-rose-500/70 bg-slate-950/95 p-6 text-slate-100 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-lg font-black text-rose-400 font-heading">
                <span>🥊</span>
                <span>RAGE ROOM 3D • HOW TO PLAY</span>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="rounded-full border border-slate-700 p-1.5 text-slate-400 hover:text-white"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-300">
              <p>
                Release your stress in this arcade-style 3D room! <strong>The dummy gets scared and flees from you when hit</strong>—chase it around the room and smash it with 8 cartoon weapons!
              </p>

              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 p-3 space-y-1.5 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-rose-300 font-bold">Left Click / Space:</span>
                  <span>Strike / Shoot</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-300 font-bold">WASD / Arrow Keys:</span>
                  <span>Sprint & Chase the Dummy</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-300 font-bold">Mouse Drag:</span>
                  <span>Look around 360°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-300 font-bold">Number Keys [1-8]:</span>
                  <span>Quick switch equipment</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-300 font-bold">[H] Key:</span>
                  <span>Toggle UI (Full Clear View)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-300 font-bold">[R] Key:</span>
                  <span>Reset dummy & props</span>
                </div>
              </div>

              <h4 className="text-xs font-black uppercase text-amber-300 pt-1">
                Fictional Equipment Arsenal:
              </h4>
              <ul className="grid grid-cols-2 gap-1.5 text-xs">
                <li>🏏 <strong>Foam Bat:</strong> Fast boing swing</li>
                <li>🥊 <strong>Boxing Glove:</strong> Heavy spring punch</li>
                <li>🔨 <strong>Rubber Hammer:</strong> Cartoon squash & squeak</li>
                <li>⚡ <strong>Energy Hammer:</strong> Cyan plasma blast</li>
                <li>🎾 <strong>Tennis Launcher:</strong> Bouncing balls</li>
                <li>🎨 <strong>Paint Blaster:</strong> Colorful splatters</li>
                <li>🎉 <strong>Confetti Cannon:</strong> Paper party storm</li>
                <li>🌀 <strong>Shockwave:</strong> Radial concussive wave</li>
              </ul>
            </div>

            <button
              onClick={() => setShowInstructions(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 py-2.5 text-xs font-black text-white shadow-xl hover:scale-105 transition"
            >
              GOT IT • CHASE & SMASH!
            </button>
          </div>
        </div>
      )}

      {/* 🌟 60s BLITZ END-OF-ROUND MODAL 🌟 */}
      {showGameOverModal && endStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border-2 border-rose-500 bg-slate-950/95 p-6 text-center text-slate-100 shadow-2xl backdrop-blur-xl">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="text-2xl font-black text-white font-heading">
              TIME&apos;S UP!
            </h3>
            <p className="text-xs text-rose-400 font-bold mt-0.5">
              60-Second Challenge Complete
            </p>

            <div className="my-5 grid grid-cols-3 gap-2 rounded-2xl border border-rose-500/40 bg-rose-950/30 p-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Score</p>
                <p className="text-xl font-black text-amber-300">{endStats.score}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Max Combo</p>
                <p className="text-xl font-black text-rose-400">{endStats.maxCombo}x</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Total Hits</p>
                <p className="text-xl font-black text-emerald-400">{endStats.hits}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleModeSelect("timed")}
                className="flex-1 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 py-2.5 text-xs font-black text-white shadow-xl hover:scale-105 transition"
              >
                Play Again (60s)
              </button>
              <button
                onClick={() => handleModeSelect("free")}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-900 py-2.5 text-xs font-black text-slate-200 hover:bg-slate-800 transition"
              >
                Free Rage Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RageRoomView;
