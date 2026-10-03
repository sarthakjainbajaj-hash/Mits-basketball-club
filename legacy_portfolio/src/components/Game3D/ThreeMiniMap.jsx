import { WORLD_3D } from "./ThreeGameEngine";

function ThreeMiniMap({ playerPos = { x: 0, z: 8, rotY: 0 }, monsters = [], isEmbedded = false }) {
  const mapW = 160;
  const mapH = 160;
  const worldRadius = WORLD_3D.size / 2;

  // Convert 3D world (x, z) to 2D mini-map (px, py)
  const toMapCoord = (x, z) => {
    const nx = (x + worldRadius) / WORLD_3D.size;
    const ny = (z + worldRadius) / WORLD_3D.size;
    return {
      px: Math.max(10, Math.min(mapW - 10, nx * mapW)),
      py: Math.max(10, Math.min(mapH - 10, ny * mapH)),
    };
  };

  const pCoord = toMapCoord(playerPos.x || 0, playerPos.z || 0);
  const aliveMonsters = monsters.filter((m) => !m.isDead);

  return (
    <div className={`pointer-events-none z-30 hidden sm:block ${isEmbedded ? "absolute right-3 top-14 scale-90" : "fixed right-4 top-20"}`}>
      <div className="relative h-44 w-44 overflow-hidden rounded-2xl border-2 border-gold-500/80 bg-slate-950/90 p-2 shadow-2xl backdrop-blur-md">
        {/* Radar scanline animation */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.15)_0%,transparent_75%)]" />

        {/* Compass Cardinal Points */}
        <span className="absolute left-1/2 top-1 -translate-x-1/2 text-[9px] font-black tracking-widest text-gold-400">N</span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-black tracking-widest text-slate-500">S</span>
        <span className="absolute left-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black tracking-widest text-slate-500">W</span>
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-black tracking-widest text-slate-500">E</span>

        {/* Header & Live Monster Counter */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5 text-[9px] font-extrabold tracking-wider text-gold-400">
          <span>CITADEL RADAR</span>
        </div>
        <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded bg-red-950/80 px-1.5 py-0.5 text-[8px] font-bold text-red-400 border border-red-800/60">
          <span>⚔️</span>
          <span>{aliveMonsters.length} HOSTILES</span>
        </div>

        {/* Landmarks */}
        {Object.entries(WORLD_3D.landmarks).map(([key, val]) => {
          const coord = toMapCoord(val.x, val.z);
          return (
            <div
              key={key}
              style={{ left: `${coord.px}px`, top: `${coord.py}px` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 text-[11px] drop-shadow"
              title={val.label}
            >
              {val.icon}
            </div>
          );
        })}

        {/* Monsters (Pulsing Red / Purple / Dragon Boss) */}
        {monsters.map((m) => {
          if (m.isDead) return null;
          const coord = toMapCoord(m.x, m.z);
          const isBoss = m.isBoss;
          const isGuardian = m.isGuardian;
          return (
            <div
              key={m.id}
              style={{ left: `${coord.px}px`, top: `${coord.py}px` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              title={m.name}
            >
              {isBoss ? (
                <div className="relative">
                  <span className="block h-5 w-5 rounded-full bg-amber-500/50 animate-ping" />
                  <span className="absolute inset-0 flex items-center justify-center h-5 w-5 rounded-full bg-red-950 border-2 border-amber-400 text-[10px] shadow-lg">
                    🐲
                  </span>
                </div>
              ) : isGuardian ? (
                <div className="relative">
                  <span className="block h-3.5 w-3.5 rounded-full bg-purple-500 shadow-sm animate-ping" />
                  <span className="absolute inset-0 flex items-center justify-center h-3.5 w-3.5 rounded-full bg-purple-700 border border-yellow-300 text-[8px]">💀</span>
                </div>
              ) : (
                <div className="relative">
                  <span className="block h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm animate-ping" />
                  <span className="absolute inset-0 block h-2.5 w-2.5 rounded-full bg-red-600 border border-white" />
                </div>
              )}
            </div>
          );
        })}

        {/* Player Soldier (Bright Cyan Point with Heading Pointer) */}
        <div
          style={{ left: `${pCoord.px}px`, top: `${pCoord.py}px` }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          <div
            style={{ transform: `rotate(${-(playerPos.rotY || 0) + Math.PI}rad)` }}
            className="flex items-center justify-center"
          >
            <div className="h-3.5 w-3.5 rounded-full border-2 border-white bg-sky-400 shadow-lg ring-2 ring-sky-500/60" />
            <div className="absolute -top-1.5 h-2 w-1 bg-white rounded-t" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThreeMiniMap;
