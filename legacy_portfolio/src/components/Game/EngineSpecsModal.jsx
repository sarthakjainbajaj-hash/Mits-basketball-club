import { FaTimes, FaCube, FaMicrochip, FaVolumeUp, FaBolt } from "react-icons/fa";

function EngineSpecsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-cyan-500/60 bg-slate-950/95 p-5 sm:p-8 text-slate-100 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="rounded-full border border-cyan-500/60 bg-cyan-950/70 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-cyan-300">
                GRAPHICS & SYSTEMS ARCHITECTURE
              </span>
              <span className="rounded-full border border-emerald-500/50 bg-emerald-950/60 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                STEADY 60 FPS WEBGL
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-100 font-heading">
              3D WebGL Engine & Graphics Technical Specs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Why this is an advanced software engineering achievement rather than a simple mini-game.
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-400 hover:border-cyan-500 hover:text-white transition"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* 4 Core Engineering Pillars */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Pillar 1 */}
          <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4">
            <div className="flex items-center gap-2.5 text-cyan-400 font-bold text-sm mb-2">
              <FaCube className="text-lg" />
              <span>Zero Game Engine Bloat</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Engineered entirely in vanilla JavaScript and <span className="text-cyan-300 font-bold">Three.js</span> from first principles. No Unity WebGL exports (typically 40MB+), no Unreal Engine overhead. First-paint bundle loads in under 2MB.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-cyan-300">
              <span className="rounded bg-cyan-900/60 px-2 py-0.5">Three.js Core</span>
              <span className="rounded bg-cyan-900/60 px-2 py-0.5">Raw Shaders</span>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4">
            <div className="flex items-center gap-2.5 text-purple-400 font-bold text-sm mb-2">
              <FaMicrochip className="text-lg" />
              <span>Custom Math & Collision Physics</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Spherical coordinate orbit camera with ground-collision clamping, raycasting melee hit detection, and dynamic wall-repulsion vectors for autonomous fleeing AI navigation.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-purple-300">
              <span className="rounded bg-purple-900/60 px-2 py-0.5">Vector Math</span>
              <span className="rounded bg-purple-900/60 px-2 py-0.5">Raycasting</span>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
            <div className="flex items-center gap-2.5 text-amber-400 font-bold text-sm mb-2">
              <FaVolumeUp className="text-lg" />
              <span>Procedural Web Audio API Engine</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All sound effects (swings, strikes, bonks, laser blasts, sonic waves, singing bowl chimes) and retro synth chords are procedurally synthesized in real time using Web Audio oscillators and gain envelopes. Zero audio files over the wire.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-amber-300">
              <span className="rounded bg-amber-900/60 px-2 py-0.5">AudioContext</span>
              <span className="rounded bg-amber-900/60 px-2 py-0.5">0 MB Audio Assets</span>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm mb-2">
              <FaBolt className="text-lg" />
              <span>Rendering Performance (60 FPS)</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              2,200 particle celestial skybox, PCF Soft Shadow Mapping, dynamic lighting with additive corona blending, and touch/mouse Pointer Lock controls running smoothly on desktop and mobile browsers.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px] font-mono text-emerald-300">
              <span className="rounded bg-emerald-900/60 px-2 py-0.5">PCF Shadows</span>
              <span className="rounded bg-emerald-900/60 px-2 py-0.5">Pointer Lock API</span>
            </div>
          </div>
        </div>

        {/* Recruiter Note */}
        <div className="mt-6 rounded-2xl border border-gold-500/30 bg-gold-950/20 p-4 text-xs text-slate-200">
          <p className="font-bold text-gold-300 mb-1">💡 What This Demonstrates to Tech Interviewers:</p>
          <p className="text-slate-300 leading-relaxed">
            Building complex real-time WebGL engines proves mastery of core Computer Science fundamentals: memory lifecycle management, animation render loops, coordinate transforms, event delegation, and low-latency browser rendering.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-gradient-to-r from-brand-600 to-gold-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:brightness-110 transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

export default EngineSpecsModal;
