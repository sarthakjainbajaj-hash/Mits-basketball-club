import { useEffect, useState } from "react";
import About from "./components/About";
import Certifications from "./components/Certifications";
import Contact from "./components/Contact";
import Experience from "./components/Experience";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Projects from "./components/Projects";
import Resume from "./components/Resume";
import Skills from "./components/Skills";
import AiVideoShowcase from "./components/AiVideoShowcase";
import ThreeBackground from "./components/ThreeBackground";
import ThreeGameView from "./components/Game3D/ThreeGameView";
import RageRoomView from "./components/RageRoom3D/RageRoomView";
import GameSelectorModal from "./components/Game/GameSelectorModal";
import EngineSpecsModal from "./components/Game/EngineSpecsModal";

function App() {
  const [isDark, setIsDark] = useState(false);
  const [houseTheme, setHouseTheme] = useState("stark");
  // Start directly in Game Mode
  const [viewMode, setViewMode] = useState("game");
  // Active 3D game: 'citadel' (RPG Realm) or 'rageroom' (Arcade Stress Buster)
  const [activeGame, setActiveGame] = useState("citadel");
  const [isGameSelectorOpen, setIsGameSelectorOpen] = useState(false);
  const [isEngineSpecsOpen, setIsEngineSpecsOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
    const savedHouse = localStorage.getItem("houseTheme");
    if (savedHouse) {
      setHouseTheme(savedHouse);
      document.documentElement.dataset.house = savedHouse;
    } else {
      document.documentElement.dataset.house = "stark";
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const nextTheme = !prev;
      document.documentElement.classList.toggle("dark", nextTheme);
      localStorage.setItem("theme", nextTheme ? "dark" : "light");
      return nextTheme;
    });
  };

  const changeHouseTheme = (house) => {
    setHouseTheme(house);
    localStorage.setItem("houseTheme", house);
    document.documentElement.dataset.house = house;
  };

  // 1. FULLSCREEN IMMERSIVE 3D GAME VIEW
  if (viewMode === "game") {
    return (
      <>
        {activeGame === "citadel" ? (
          <ThreeGameView
            onToggleViewMode={() => setViewMode("website")}
            onSwitchGame={() => setIsGameSelectorOpen(true)}
            houseTheme={houseTheme}
            isFullscreen={true}
          />
        ) : (
          <RageRoomView
            onToggleViewMode={() => setViewMode("website")}
            onSwitchGame={() => setIsGameSelectorOpen(true)}
          />
        )}

        <GameSelectorModal
          isOpen={isGameSelectorOpen}
          onClose={() => setIsGameSelectorOpen(false)}
          onSelectGame={(g) => {
            setActiveGame(g);
            setIsGameSelectorOpen(false);
          }}
          currentGame={activeGame}
        />
      </>
    );
  }

  // 2. WEBSITE VIEW (Contains embedded Playable Game Arena + full scrollable sections)
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute -left-24 top-24 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl dark:bg-brand-500/35" />
      <div className="pointer-events-none absolute right-0 top-[28rem] h-72 w-72 rounded-full bg-gold-500/25 blur-3xl dark:bg-gold-500/20" />
      <div className="pointer-events-none absolute inset-0 fire-bg opacity-10 dark:opacity-20" />
      <ThreeBackground houseTheme={houseTheme} isDark={isDark} />

      <Navbar
        isDark={isDark}
        onToggle={toggleTheme}
        houseTheme={houseTheme}
        onHouseChange={changeHouseTheme}
        onPlayGame={() => setViewMode("game")}
      />

      <main className="relative z-10">
        <Hero
          houseTheme={houseTheme}
          onPlayGame={() => setViewMode("game")}
        />

        {/* Embedded Playable Game Arena Section with Side-by-Side Selector */}
        <section id="game-arena" className="section-wrap pt-4 pb-12">
          {/* Section Header */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="section-badge">Live Interactive 3D Games</p>
              <h3 className="section-title">Playable 3D Arcade & Portfolio Realms</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEngineSpecsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/50 bg-cyan-950/80 px-3.5 py-2.5 text-xs font-bold text-cyan-300 shadow hover:bg-cyan-900 transition"
                title="View WebGL Graphics Architecture & Performance Specs"
              >
                <span>⚙️</span> WebGL Specs
              </button>
              <button
                type="button"
                onClick={() => setIsGameSelectorOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gold-500/50 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-gold-300 shadow hover:border-gold-400 transition"
              >
                <span>🎮</span> Choose Game
              </button>
              <button
                type="button"
                onClick={() => setViewMode("game")}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-gold-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-lg hover:scale-105 transition"
              >
                <span>🚀</span> Play Fullscreen Mode
              </button>
            </div>
          </div>

          {/* Side-by-side Game Mode Cards & Direct Switcher */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Card 1: Citadel 3D RPG */}
            <div
              onClick={() => setActiveGame("citadel")}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                activeGame === "citadel"
                  ? "border-gold-400 bg-brand-950/60 shadow-lg ring-1 ring-gold-400/40"
                  : "border-slate-800 bg-slate-900/40 hover:border-gold-500/40 hover:bg-slate-900/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏰</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white font-heading">
                      The Citadel 3D RPG
                    </h4>
                    {activeGame === "citadel" && (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/50 px-2 py-0.2 text-[9px] font-bold text-emerald-300">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Portfolio Realm • Combat, 3D Sky & Stars, Live SolveSphere Demo
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-gold-400 hidden lg:inline">
                {activeGame === "citadel" ? "● Loaded" : "Click to Switch"}
              </span>
            </div>

            {/* Card 2: Rage Room 3D */}
            <div
              onClick={() => setActiveGame("rageroom")}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition ${
                activeGame === "rageroom"
                  ? "border-rose-500 bg-rose-950/60 shadow-lg ring-1 ring-rose-500/40"
                  : "border-slate-800 bg-slate-900/40 hover:border-rose-500/40 hover:bg-slate-900/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🥊</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-white font-heading">
                      Rage Room 3D: Stress Buster
                    </h4>
                    {activeGame === "rageroom" && (
                      <span className="rounded-full bg-emerald-500/20 border border-emerald-500/50 px-2 py-0.2 text-[9px] font-bold text-emerald-300">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    First-Person Stress Relief • Dummy Physics, 8 Cartoon Weapons, Combos
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-400 hidden lg:inline">
                {activeGame === "rageroom" ? "● Loaded" : "Click to Switch"}
              </span>
            </div>
          </div>

          {/* Embedded Game Container */}
          {activeGame === "citadel" ? (
            <ThreeGameView
              isEmbedded={true}
              onOpenFullscreen={() => setViewMode("game")}
              onSwitchGame={() => setActiveGame("rageroom")}
              houseTheme={houseTheme}
            />
          ) : (
            <RageRoomView
              isEmbedded={true}
              onOpenFullscreen={() => setViewMode("game")}
              onSwitchGame={() => setActiveGame("citadel")}
            />
          )}
        </section>

        <About />
        <Experience />
        <Projects />
        <AiVideoShowcase />
        <Skills />
        <Certifications />
        <Resume />
        <Contact />
      </main>

      <Footer />

      {/* Floating Action Button for Fullscreen Game */}
      <button
        type="button"
        onClick={() => setViewMode("game")}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border-2 border-gold-500/80 bg-gradient-to-r from-brand-600 to-gold-600 px-5 py-3 text-xs font-extrabold text-white shadow-2xl transition duration-300 hover:scale-110 hover:shadow-gold-500/35 animate-bounce"
      >
        <span>🎮</span> Play 3D Games
      </button>

      {/* Game Selector Modal */}
      <GameSelectorModal
        isOpen={isGameSelectorOpen}
        onClose={() => setIsGameSelectorOpen(false)}
        onSelectGame={(g) => {
          setActiveGame(g);
          setIsGameSelectorOpen(false);
        }}
        currentGame={activeGame}
      />

      {/* Engine Specs Technical Breakdown Modal */}
      <EngineSpecsModal
        isOpen={isEngineSpecsOpen}
        onClose={() => setIsEngineSpecsOpen(false)}
      />
    </div>
  );
}

export default App;
