import { FaTimes, FaGamepad, FaFire, FaCompass } from "react-icons/fa";

export function GameSelectorModal({ isOpen, onClose, onSelectGame, currentGame = "citadel" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-gold-500/70 bg-slate-950/95 p-5 sm:p-8 text-slate-100 shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-heading">
                SELECT YOUR 3D GAME EXPERIENCE
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Choose how you want to explore Sarthak&apos;s portfolio or unleash stress in 3D
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-400 hover:border-gold-500 hover:text-white transition"
          >
            <FaTimes size={15} />
          </button>
        </div>

        {/* Side-by-side Game Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Game Card 1: Citadel 3D RPG */}
          <div
            className={`flex flex-col justify-between rounded-3xl border-2 p-5 sm:p-6 transition duration-200 ${
              currentGame === "citadel"
                ? "border-gold-400 bg-gradient-to-b from-brand-950/70 to-slate-900/90 shadow-2xl ring-2 ring-gold-400/30"
                : "border-slate-800 bg-slate-900/60 hover:border-gold-500/50 hover:bg-slate-900/90"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-full border border-gold-500/60 bg-gold-500/20 px-3 py-1 text-[11px] font-extrabold uppercase text-gold-300">
                  ⚔️ RPG PORTFOLIO REALM
                </span>
                {currentGame === "citadel" && (
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    ACTIVE NOW
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-white font-heading">
                The Citadel 3D Adventure
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Explore Sarthak&apos;s real-world software engineering projects, industry experience, certifications, and technical skills inside an expansive 3D Game of Thrones-themed medieval fortress realm.
              </p>

              {/* Key Features */}
              <div className="mt-4 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-gold-400">🏰</span>
                  <span><strong>Massive 260x260 Realm:</strong> 6 interactive landmarks</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">🌌</span>
                  <span><strong>Full Sky View:</strong> Tilt camera up to gaze at stars & moon</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-400">⚔️</span>
                  <span><strong>Combat System:</strong> Combos, Whirlwind, Fireball, Dash</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">🛠️</span>
                  <span><strong>Live Showcase:</strong> Interactive embedded SolveSphere demo</span>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["Third-Person 3D", "Portfolio Showcase", "RPG Combat", "Sky View", "SolveSphere"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-slate-800/80 border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onSelectGame("citadel");
                onClose();
              }}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-brand-600 to-gold-600 py-3 text-xs font-black text-white shadow-xl hover:scale-105 transition"
            >
              LAUNCH CITADEL 3D RPG
            </button>
          </div>

          {/* Game Card 2: Rage Room 3D */}
          <div
            className={`flex flex-col justify-between rounded-3xl border-2 p-5 sm:p-6 transition duration-200 ${
              currentGame === "rageroom"
                ? "border-rose-500 bg-gradient-to-b from-rose-950/70 to-slate-900/90 shadow-2xl ring-2 ring-rose-500/30"
                : "border-slate-800 bg-slate-900/60 hover:border-rose-500/50 hover:bg-slate-900/90"
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="rounded-full border border-rose-500/60 bg-rose-500/20 px-3 py-1 text-[11px] font-extrabold uppercase text-rose-300">
                  🥊 ARCADE STRESS RELIEF
                </span>
                {currentGame === "rageroom" && (
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    ACTIVE NOW
                  </span>
                )}
              </div>

              <h3 className="text-xl font-black text-white font-heading">
                Rage Room 3D: Stress Buster
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Step inside a vibrant neon arcade room containing a funny cartoon spring training dummy! Release frustration with 8 fictional cartoon weapons, satisfying wobble physics, destructible props, combos, and rage frenzy.
              </p>

              {/* Key Features */}
              <div className="mt-4 space-y-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="text-rose-400">🏏</span>
                  <span><strong>8 Cartoon Weapons:</strong> Foam Bat, Boxing Glove, Rubber Mallet</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">⚡</span>
                  <span><strong>Rage Meter:</strong> Unleash Max Rage frenzy & Zen reset</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">💥</span>
                  <span><strong>Destructible Props:</strong> Boxes, crates & soda cans scatter</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">🎯</span>
                  <span><strong>5 Modes:</strong> Free Rage, 60s Blitz, Combos, Target, Zen</span>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {["First-Person 3D", "Physics Wobble", "Arcade Combos", "Rage Meter", "Non-Violent Cartoon"].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg bg-slate-800/80 border border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                onSelectGame("rageroom");
                onClose();
              }}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 py-3 text-xs font-black text-white shadow-xl hover:scale-105 transition"
            >
              LAUNCH RAGE ROOM 3D
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
export default GameSelectorModal;
