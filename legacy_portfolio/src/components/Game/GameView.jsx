import { useEffect, useRef, useState } from "react";
import { GameEngine } from "./GameEngine";
import GameHUD from "./GameHUD";
import GameDialogModal from "./GameDialogModal";
import VirtualJoystick from "./VirtualJoystick";
import { sound } from "./soundEngine";
import { INTERACTABLES } from "./gameData";
import { FaExpand, FaVolumeMute, FaVolumeUp } from "react-icons/fa";

function GameView({
  onToggleViewMode,
  houseTheme = "stark",
  isEmbedded = false,
  onOpenFullscreen,
}) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  const [activeDialogItem, setActiveDialogItem] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [monstersSlain, setMonstersSlain] = useState(0);
  const [skillsUnlocked, setSkillsUnlocked] = useState(false);
  const [collectedRunes, setCollectedRunes] = useState(() => {
    try {
      const saved = localStorage.getItem("citadel_runes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, {
      houseTheme,
      collectedRunes,
      onInteract: (item) => {
        setActiveDialogItem(item);
      },
      onCollect: (rune) => {
        setCollectedRunes((prev) => {
          if (!prev.includes(rune.id)) {
            const next = [...prev, rune.id];
            try {
              localStorage.setItem("citadel_runes", JSON.stringify(next));
            } catch {}
            if (next.length === 5) {
              sound.playFanfare();
            }
            return next;
          }
          return prev;
        });
      },
      onMonsterKill: (m) => {
        setMonstersSlain((prev) => prev + 1);
      },
      onSkillsUnlocked: () => {
        setSkillsUnlocked(true);
        // Pop open Sarthak's skills as victory loot!
        const skillItem = INTERACTABLES.find((i) => i.id === "skill_altar");
        if (skillItem) {
          setTimeout(() => {
            setActiveDialogItem(skillItem);
          }, 600);
        }
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

  const handleJoystickAction = () => {
    if (engineRef.current) {
      engineRef.current.interact();
    }
  };

  const handleJoystickAttack = () => {
    if (engineRef.current) {
      engineRef.current.attack();
    }
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) sound.playInteract();
  };

  // 1. EMBEDDED MODE
  if (isEmbedded) {
    return (
      <div className="relative w-full h-[550px] sm:h-[650px] overflow-hidden rounded-[2rem] border-2 border-gold-500/60 bg-slate-950 shadow-2xl select-none">
        <canvas
          ref={canvasRef}
          className="block h-full w-full touch-none cursor-crosshair"
        />

        {/* Top Floating Bar for Embedded Console */}
        <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-center justify-between p-4">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-gold-500/40 bg-slate-950/85 px-3.5 py-1.5 text-xs text-gold-300 shadow backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold">Playable Citadel Arena</span>
            <span className="text-slate-400">|</span>
            <span className="text-red-400 font-bold">Beasts: {monstersSlain}/2</span>
            {skillsUnlocked && <span className="text-emerald-400 font-bold">★ Skills Unlocked!</span>}
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
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
              <span>Fullscreen</span>
            </button>
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-slate-800 bg-slate-950/85 px-4 py-1 text-[11px] text-slate-300 shadow backdrop-blur-md text-center whitespace-nowrap">
          <span className="text-red-400 font-bold">⚔️ [Space/J]</span> to Slash • <span className="text-gold-400 font-bold">WASD / Click</span> to Walk • Defeat 2 Monsters to unlock Skills!
        </div>

        {/* Mobile touch controls */}
        <VirtualJoystick
          onMove={handleJoystickMove}
          onAction={handleJoystickAction}
          onAttack={handleJoystickAttack}
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

  // 2. FULLSCREEN MODE
  return (
    <div className="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-slate-950 select-none">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none cursor-crosshair"
      />

      {/* Top HUD */}
      <GameHUD
        collectedCount={collectedRunes.length}
        totalCollectibles={5}
        monstersSlain={monstersSlain}
        totalMonsters={2}
        onToggleViewMode={onToggleViewMode}
        houseTheme={houseTheme}
      />

      {/* Mobile Virtual Joystick with Attack */}
      <VirtualJoystick
        onMove={handleJoystickMove}
        onAction={handleJoystickAction}
        onAttack={handleJoystickAttack}
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

export default GameView;
