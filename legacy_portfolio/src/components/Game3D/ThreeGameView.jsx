import { useEffect, useRef, useState } from "react";
import { ThreeGameEngine, INITIAL_MONSTERS } from "./ThreeGameEngine";
import ThreeMiniMap from "./ThreeMiniMap";
import GameHUD from "../Game/GameHUD";
import GameDialogModal from "../Game/GameDialogModal";
import VirtualJoystick from "../Game/VirtualJoystick";
import { sound } from "../Game/soundEngine";
import { INTERACTABLES } from "../Game/gameData";
import { FaExpand, FaVolumeMute, FaVolumeUp, FaHandSparkles, FaShieldAlt } from "react-icons/fa";

function ThreeGameView({
  onToggleViewMode,
  houseTheme = "stark",
  isEmbedded = false,
  onOpenFullscreen,
  onSwitchGame,
}) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);

  const [activeDialogItem, setActiveDialogItem] = useState(null);
  const [promptItem, setPromptItem] = useState(null);
  const [lockedNotice, setLockedNotice] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [monstersSlain, setMonstersSlain] = useState(0);
  const [skillsUnlocked, setSkillsUnlocked] = useState(false);
  const [playerHp, setPlayerHp] = useState(100);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 8 });
  const [monsters, setMonsters] = useState(INITIAL_MONSTERS);
  const [stats, setStats] = useState({
    hp: 100,
    maxHp: 100,
    mana: 60,
    maxMana: 60,
    exp: 0,
    maxExp: 100,
    level: 1,
    gold: 0,
    boss: null,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const engine = new ThreeGameEngine(container, {
      houseTheme,
      isEmbedded,
      onInteract: (item) => {
        setActiveDialogItem(item);
      },
      onMonsterKill: () => {
        setMonstersSlain((prev) => prev + 1);
      },
      onSkillsUnlocked: () => {
        setSkillsUnlocked(true);
        // Pop open Sarthak's technical skills loot upon monster defeat
        const skillItem = INTERACTABLES.find((i) => i.id === "skill_altar");
        if (skillItem) {
          setTimeout(() => {
            setActiveDialogItem(skillItem);
          }, 800);
        }
      },
      onRadarUpdate: ({ player, monsters: mList }) => {
        setPlayerPos(player);
        setMonsters(mList);
      },
      onHpChange: (hp) => {
        setPlayerHp(hp);
      },
      onStatsChange: (newStats) => {
        setStats(newStats);
        setPlayerHp(newStats.hp);
      },
      onPromptChange: (item) => {
        setPromptItem(item);
      },
      onLockedNotice: (msg) => {
        setLockedNotice(msg);
        setTimeout(() => {
          setLockedNotice((cur) => (cur === msg ? null : cur));
        }, 3500);
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, [houseTheme]);

  const handleJoystickMove = (dx, dy) => {
    if (engineRef.current) {
      engineRef.current.setJoystickInput(dx, dy);
    }
  };

  const handleAction = () => {
    if (engineRef.current) {
      engineRef.current.interact();
    }
  };

  const handleAttack = () => {
    if (engineRef.current) {
      engineRef.current.attack();
    }
  };

  const handleSpinAttack = () => {
    if (engineRef.current) {
      engineRef.current.spinAttack();
    }
  };

  const handleFireball = () => {
    if (engineRef.current) {
      engineRef.current.castFireball();
    }
  };

  const handleDash = () => {
    if (engineRef.current) {
      engineRef.current.dash();
    }
  };

  const handleFastTravel = (key) => {
    if (engineRef.current) {
      engineRef.current.fastTravelTo(key);
    }
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) sound.playInteract();
  };

  // 1. EMBEDDED 3D ARENA MODE
  if (isEmbedded) {
    return (
      <div className="relative w-full h-[550px] sm:h-[650px] overflow-hidden rounded-[2rem] border-2 border-gold-500/60 bg-slate-950 shadow-2xl select-none">
        <div
          ref={containerRef}
          className="relative h-full w-full touch-none cursor-grab active:cursor-grabbing"
        />

        {/* 3D Mini-Map Radar (Embedded) */}
        <ThreeMiniMap playerPos={playerPos} monsters={monsters} isEmbedded={true} />

        {/* Top Floating Bar */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-between p-3 sm:p-4 z-30">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-gold-500/40 bg-slate-950/90 px-3.5 py-1.5 text-xs text-gold-300 shadow backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">Lv.{stats.level} Warrior</span>
            <span className="text-slate-500">|</span>
            <span className="text-red-400 font-bold">HP {Math.round(stats.hp)}</span>
            <span className="text-slate-500">|</span>
            <span className="text-cyan-400 font-bold">MP {Math.round(stats.mana)}</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-300 font-bold">🪙 {stats.gold}</span>
            {stats.boss && <span className="text-rose-400 font-black animate-pulse">🐲 BOSS NEARBY!</span>}
            {skillsUnlocked && <span className="text-emerald-400 font-bold">★ Skills Unlocked!</span>}
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={() => engineRef.current?.toggleSkyView()}
              type="button"
              className="flex items-center gap-1 rounded-full border border-cyan-500/40 bg-slate-950/85 px-2.5 py-1.5 text-xs font-bold text-cyan-300 shadow hover:border-cyan-400 hover:text-cyan-200 backdrop-blur-md transition"
              title="Look at Celestial Sky & Stars (Drag mouse up to tilt)"
            >
              <span>🌌</span>
              <span className="hidden sm:inline">Sky View</span>
            </button>
            {onSwitchGame && (
              <button
                onClick={onSwitchGame}
                type="button"
                className="flex items-center gap-1 rounded-full border border-amber-500/60 bg-amber-950/70 px-2.5 py-1.5 text-xs font-bold text-amber-300 shadow hover:bg-amber-900 transition"
                title="Switch Game: Rage Room 3D"
              >
                <span>🥊</span>
                <span className="hidden sm:inline">Rage Room</span>
              </button>
            )}
            <button
              onClick={toggleSound}
              type="button"
              className="rounded-full border border-slate-700 bg-slate-950/85 p-2 text-slate-300 shadow hover:border-gold-500 hover:text-gold-300 backdrop-blur-md transition"
              title="Toggle Audio"
            >
              {isMuted ? <FaVolumeMute size={12} /> : <FaVolumeUp size={12} />}
            </button>
            <button
              onClick={onOpenFullscreen}
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-gold-500/60 bg-gradient-to-r from-brand-600 to-gold-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:scale-105 transition"
            >
              <FaExpand size={11} />
              <span>Fullscreen 3D</span>
            </button>
          </div>
        </div>

        {/* Proximity Interaction Prompt Banner */}
        {promptItem && (
          <div className="pointer-events-none absolute bottom-16 left-1/2 -translate-x-1/2 z-30 animate-bounce">
            <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border-2 border-gold-400 bg-slate-950/95 px-5 py-2 text-xs font-bold text-gold-300 shadow-2xl backdrop-blur-lg">
              <FaHandSparkles className="text-gold-400 animate-pulse" />
              <span>Press [E] or tap Action to inspect {promptItem.title || promptItem.name}</span>
            </div>
          </div>
        )}

        {/* Locked Skills Warning Notice */}
        {lockedNotice && (
          <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-40">
            <div className="flex items-center gap-2 rounded-2xl border-2 border-red-500/80 bg-red-950/90 px-4 py-2 text-xs font-bold text-red-200 shadow-2xl backdrop-blur-md animate-pulse">
              <FaShieldAlt className="text-red-400" />
              <span>{lockedNotice}</span>
            </div>
          </div>
        )}

        {/* Bottom Helper Bar */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-slate-800 bg-slate-950/85 px-4 py-1 text-[11px] text-slate-300 shadow backdrop-blur-md text-center whitespace-nowrap z-20">
          <span className="text-cyan-400 font-bold">🌌 Drag up to view Sky & Stars</span> • <span className="text-red-400 font-bold">⚔️ [Space/J]</span> Slash • <span className="text-amber-400 font-bold">💥 [Q/K]</span> Whirlwind • <span className="text-orange-400 font-bold">🔥 [R/F]</span> Fireball • <span className="text-cyan-400 font-bold">💨 [Shift]</span> Dash • <span className="text-slate-400">Scroll to Zoom</span>
        </div>

        {/* Mobile touch controls */}
        <VirtualJoystick
          onMove={handleJoystickMove}
          onAction={handleAction}
          onAttack={handleAttack}
          onSpinAttack={handleSpinAttack}
          onFireball={handleFireball}
          onDash={handleDash}
        />

        {/* Dialogue Modal */}
        {activeDialogItem && (
          <GameDialogModal
            item={activeDialogItem}
            onClose={() => setActiveDialogItem(null)}
            onSwitchToClassic={() => {
              setActiveDialogItem(null);
              const target = document.getElementById(activeDialogItem.category || "projects");
              if (target) target.scrollIntoView({ behavior: "smooth" });
            }}
          />
        )}
      </div>
    );
  }

  // 2. FULLSCREEN 3D GAME MODE
  return (
    <div className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-slate-950 select-none">
      <div
        ref={containerRef}
        className="relative h-full w-full touch-none cursor-grab active:cursor-grabbing"
      />

      {/* 3D Mini-Map Radar */}
      <ThreeMiniMap playerPos={playerPos} monsters={monsters} isEmbedded={false} />

      {/* Top HUD */}
      <GameHUD
        collectedCount={skillsUnlocked ? 5 : monstersSlain}
        totalCollectibles={5}
        monstersSlain={monstersSlain}
        totalMonsters={monsters.length}
        playerHp={stats.hp}
        playerMaxHp={stats.maxHp}
        playerMana={stats.mana}
        playerMaxMana={stats.maxMana}
        playerExp={stats.exp}
        playerMaxExp={stats.maxExp}
        playerLevel={stats.level}
        playerGold={stats.gold}
        boss={stats.boss}
        onAttack={handleAttack}
        onSpinAttack={handleSpinAttack}
        onCastFireball={handleFireball}
        onDash={handleDash}
        onInteract={handleAction}
        onFastTravel={handleFastTravel}
        onToggleViewMode={onToggleViewMode}
        onToggleSkyView={() => engineRef.current?.toggleSkyView()}
        onSwitchGame={onSwitchGame}
        houseTheme={houseTheme}
      />

      {/* Proximity Interaction Prompt Banner */}
      {promptItem && (
        <div className="pointer-events-none fixed bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 z-40 animate-bounce">
          <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border-2 border-gold-400 bg-slate-950/95 px-6 py-2.5 text-xs sm:text-sm font-bold text-gold-300 shadow-2xl backdrop-blur-lg">
            <FaHandSparkles className="text-gold-400 animate-pulse text-base" />
            <span>Press [E] or tap Action to inspect {promptItem.title || promptItem.name}</span>
          </div>
        </div>
      )}

      {/* Locked Skills Warning Notice */}
      {lockedNotice && (
        <div className="pointer-events-none fixed top-20 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-2 rounded-2xl border-2 border-red-500/80 bg-red-950/95 px-5 py-2.5 text-xs sm:text-sm font-bold text-red-200 shadow-2xl backdrop-blur-md animate-pulse">
            <FaShieldAlt className="text-red-400 text-base" />
            <span>{lockedNotice}</span>
          </div>
        </div>
      )}

      {/* Mobile Virtual Joystick with Full Abilities */}
      <VirtualJoystick
        onMove={handleJoystickMove}
        onAction={handleAction}
        onAttack={handleAttack}
        onSpinAttack={handleSpinAttack}
        onFireball={handleFireball}
        onDash={handleDash}
      />

      {/* Dialogue / Item Details Modal */}
      {activeDialogItem && (
        <GameDialogModal
          item={activeDialogItem}
          onClose={() => setActiveDialogItem(null)}
          onSwitchToClassic={() => {
            setActiveDialogItem(null);
            onToggleViewMode();
          }}
        />
      )}
    </div>
  );
}

export default ThreeGameView;
