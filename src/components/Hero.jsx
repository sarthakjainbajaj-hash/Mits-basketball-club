import { useState } from "react";
import ThreeHeroObject from "./ThreeHeroObject";
import TiltCard from "./TiltCard";

function Hero({ houseTheme = "stark", onPlayGame }) {
  const [heroMode, setHeroMode] = useState("3d");

  return (
    <section id="hero" className="section-wrap pt-24">
      <div className="animate-fadeInUp rounded-[2rem] border border-brand-700/40 bg-slate-950/70 p-8 shadow-xl backdrop-blur-xl dark:border-gold-500/35 dark:bg-slate-950/75">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div className="max-w-4xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-gold-400">
              The North Remembers
            </p>
            <div className="house-words mb-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em]">
              <span>Honor</span>
              <span>Fire</span>
              <span>Gold</span>
              <span>Blood</span>
              <span>Winter</span>
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-100 sm:text-6xl md:text-7xl font-heading">
              Sarthak Jain Bajaj
            </h1>
            <h2 className="mt-4 text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-200 to-brand-300 font-heading">
              AI & Full-Stack Engineer • AI Video Creator
            </h2>
            <p className="mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300">
              Creator of SolveSphere for <span className="text-gold-300 font-bold">Smart India Hackathon (SIH-26043)</span>, AI video content creator, and B.Tech AI & Data Science student at MITS. Building scalable full-stack web platforms, generative media, and interactive real-time 3D experiences.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#projects"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-gold-600 px-5 py-3 text-xs sm:text-sm font-black text-white shadow-premium transition duration-200 hover:scale-105"
              >
                <span>🚀</span> Explore SolveSphere
              </a>
              <a
                href="#aivideo"
                className="flex items-center gap-2 rounded-xl border border-red-500/60 bg-red-950/40 px-5 py-3 text-xs sm:text-sm font-bold text-red-300 shadow transition duration-200 hover:border-red-400 hover:bg-red-900/60 hover:text-white"
              >
                <span>🎬</span> Watch AI Videos
              </a>
              <button
                type="button"
                onClick={onPlayGame}
                className="flex items-center gap-2 rounded-xl border border-gold-500/60 bg-slate-900/90 px-5 py-3 text-xs sm:text-sm font-bold text-gold-300 shadow transition duration-200 hover:border-gold-400 hover:text-white"
              >
                <span>🎮</span> Play 3D Citadel Realm
              </button>
              <a
                href="/resume.html"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-xs sm:text-sm font-bold text-slate-300 hover:border-slate-500 hover:text-white transition"
              >
                <span>📄</span> Resume PDF
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center">
            {/* View Switcher Toggle */}
            <div className="mb-4 flex rounded-full border border-gold-500/30 bg-slate-900/90 p-1 shadow-lg backdrop-blur-md">
              <button
                type="button"
                onClick={() => setHeroMode("3d")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition duration-200 ${
                  heroMode === "3d"
                    ? "bg-gradient-to-r from-brand-600 to-gold-500 text-white shadow"
                    : "text-slate-400 hover:text-gold-300"
                }`}
              >
                <span>🌌</span> 3D Astrolabe
              </button>
              <button
                type="button"
                onClick={() => setHeroMode("photo")}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition duration-200 ${
                  heroMode === "photo"
                    ? "bg-gradient-to-r from-brand-600 to-gold-500 text-white shadow"
                    : "text-slate-400 hover:text-gold-300"
                }`}
              >
                <span>🛡️</span> Portrait
              </button>
            </div>

            {heroMode === "3d" ? (
              <div className="relative flex w-full max-w-sm flex-col items-center justify-center rounded-[2rem] border border-brand-700/40 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl dark:border-gold-500/35">
                <ThreeHeroObject houseTheme={houseTheme} />
              </div>
            ) : (
              <TiltCard maxTilt={14} scale={1.03} className="w-full max-w-sm">
                <div className="relative mx-auto w-full overflow-hidden rounded-[2rem] border border-brand-700/40 bg-slate-900 p-3 shadow-xl dark:border-gold-500/35 dark:bg-slate-900">
                  <div className="pointer-events-none absolute inset-0 rounded-[2rem] fire-bg opacity-30" />
                  <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-300 dark:bg-slate-800">
                    <img
                      src="/sarthak-photo.png"
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute left-5 top-5 rounded-full border border-gold-500/70 bg-slate-950/90 px-3 py-1 text-xs font-semibold text-gold-400 shadow-sm animate-badgeMove">
                    Winter is Coming
                  </div>
                </div>
              </TiltCard>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
