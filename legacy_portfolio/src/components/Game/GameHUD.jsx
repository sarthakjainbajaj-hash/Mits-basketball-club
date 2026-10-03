import { useState, useEffect } from "react";
import {
  FaVolumeMute,
  FaVolumeUp,
  FaExpand,
  FaCompress,
  FaGlobe,
  FaCompass,
  FaTimes,
  FaQuestionCircle,
  FaRocket,
  FaBriefcase,
  FaCode,
  FaGraduationCap,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { sound } from "./soundEngine";
import EngineSpecsModal from "./EngineSpecsModal";

function GameHUD({
  collectedCount = 0,
  totalCollectibles = 5,
  monstersSlain = 0,
  totalMonsters = 26,
  onToggleViewMode,
  houseTheme = "stark",
  playerHp = 100,
  playerMaxHp = 100,
  playerMana = 60,
  playerMaxMana = 60,
  playerExp = 0,
  playerMaxExp = 100,
  playerLevel = 1,
  playerGold = 0,
  boss = null,
  onAttack,
  onSpinAttack,
  onCastFireball,
  onDash,
  onInteract,
  onFastTravel = () => {},
  onToggleSkyView = () => {},
  onSwitchGame = null,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQuestInfo, setShowQuestInfo] = useState(false);
  const [showPortfolioGuide, setShowPortfolioGuide] = useState(() => {
    return !sessionStorage.getItem("seen_portfolio_guide");
  });
  const [showMobileTravel, setShowMobileTravel] = useState(false);
  const [isHudVisible, setIsHudVisible] = useState(true);
  const [showEngineSpecs, setShowEngineSpecs] = useState(false);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "h" || e.key === "H") {
        setIsHudVisible((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const toggleAudio = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) sound.playInteract();
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

  const closeGuide = () => {
    sessionStorage.setItem("seen_portfolio_guide", "true");
    setShowPortfolioGuide(false);
  };

  const handleTravelClick = (key) => {
    onFastTravel(key);
    setShowMobileTravel(false);
    setShowPortfolioGuide(false);
  };

  const hpPercent = Math.max(0, Math.min(100, (playerHp / (playerMaxHp || 100)) * 100));
  const manaPercent = Math.max(0, Math.min(100, (playerMana / (playerMaxMana || 60)) * 100));
  const expPercent = Math.max(0, Math.min(100, (playerExp / (playerMaxExp || 100)) * 100));

  const roleTitle =
    playerLevel >= 5
      ? "ARCHMAGE"
      : playerLevel >= 3
      ? "SPELLBLADE"
      : "WARRIOR";

  return (
    <>
      {/* Top HUD Bar */}
      {isHudVisible ? (
        <header className="pointer-events-none fixed left-0 right-0 top-0 z-40 p-2 sm:p-3">
          <div className="mx-auto flex max-w-7xl items-start justify-between gap-2 sm:gap-3">
            
            {/* Player Identity & RPG Resource Card */}
            <div
              onClick={() => setShowPortfolioGuide(true)}
              className="pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-gold-500/60 bg-slate-950/90 p-2 px-3 shadow-2xl backdrop-blur-md cursor-pointer hover:border-gold-400 transition group"
              title="Click to view Sarthak's Portfolio Guide"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-xl border-2 border-gold-500/80 shadow group-hover:scale-105 transition">
              <img
                src="/photo.jpeg"
                alt="Sarthak Jain Bajaj"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/sarthak-photo.png";
                }}
              />
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 py-0.5 text-center text-[9px] font-black text-amber-300">
                Lv.{playerLevel}
              </div>
            </div>

            <div className="flex flex-col gap-1 min-w-[130px] sm:min-w-[170px]">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-xs font-black tracking-wide text-slate-100 font-heading truncate">
                  Sarthak Jain Bajaj
                </span>
                <span className="rounded bg-brand-900/90 px-1.5 py-0.2 text-[9px] font-black tracking-wider text-gold-400 shrink-0">
                  {roleTitle}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate -mt-0.5">
                AI & Full-Stack Engineer
              </p>

              {/* HP Bar */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-red-400 w-4">HP</span>
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800/80 border border-red-950">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold text-slate-300 w-8 text-right">
                  {Math.round(playerHp)}
                </span>
              </div>

              {/* Mana Bar */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-cyan-400 w-4">MP</span>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80 border border-blue-950">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400 transition-all duration-300"
                    style={{ width: `${manaPercent}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold text-cyan-300 w-8 text-right">
                  {Math.round(playerMana)}
                </span>
              </div>

              {/* EXP Bar & Gold Counter */}
              <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-slate-800/80">
                <div className="flex items-center gap-1 flex-1">
                  <span className="text-[8px] font-black text-amber-400">EXP</span>
                  <div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-300"
                      style={{ width: `${expPercent}%` }}
                    />
                  </div>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-black text-amber-300">
                  <span>🪙</span>
                  <span>{playerGold}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Center: Boss Bar OR Portfolio Fast-Travel Directory */}
          {boss ? (
            <div className="pointer-events-auto flex flex-col items-center gap-1 rounded-2xl border-2 border-red-500/80 bg-slate-950/95 px-5 py-2.5 shadow-2xl backdrop-blur-lg animate-pulse">
              <div className="flex items-center gap-2 text-xs font-black tracking-wider text-red-400">
                <span className="text-base">🐲</span>
                <span>{boss.name.toUpperCase()}</span>
                <span className="rounded bg-red-900/80 px-2 py-0.5 text-[9px] font-bold text-red-200">
                  GRAND BOSS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative h-3 w-48 sm:w-72 overflow-hidden rounded-full border border-red-700 bg-slate-900">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 transition-all duration-200"
                    style={{ width: `${Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100))}%` }}
                  />
                </div>
                <span className="text-[10px] font-black text-red-200">
                  {Math.round(boss.hp)} / {boss.maxHp}
                </span>
              </div>
            </div>
          ) : (
            <div className="pointer-events-auto hidden lg:flex flex-col items-center gap-1">
              {/* Portfolio Fast Travel Bar */}
              <div className="flex items-center gap-1.5 rounded-2xl border border-gold-500/50 bg-slate-950/90 p-1.5 shadow-2xl backdrop-blur-md">
                <span className="px-2 text-[10px] font-black uppercase tracking-wider text-gold-400">
                  PORTFOLIO FAST TRAVEL:
                </span>
                <button
                  onClick={() => handleTravelClick("projects")}
                  className="flex items-center gap-1 rounded-xl border border-red-500/50 bg-red-950/60 px-3 py-1 text-xs font-bold text-red-200 hover:bg-red-900 hover:border-red-400 transition"
                  title="Teleport to Projects & SolveSphere"
                >
                  <span>🛠️</span>
                  <span>Projects</span>
                </button>
                <button
                  onClick={() => handleTravelClick("experience")}
                  className="flex items-center gap-1 rounded-xl border border-amber-500/50 bg-amber-950/60 px-3 py-1 text-xs font-bold text-amber-200 hover:bg-amber-900 hover:border-amber-400 transition"
                  title="Teleport to Experience & Internships"
                >
                  <span>💼</span>
                  <span>Experience</span>
                </button>
                <button
                  onClick={() => handleTravelClick("skills")}
                  className="flex items-center gap-1 rounded-xl border border-emerald-500/50 bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-200 hover:bg-emerald-900 hover:border-emerald-400 transition"
                  title="Teleport to Technical Skills"
                >
                  <span>⚡</span>
                  <span>Skills</span>
                </button>
                <button
                  onClick={() => handleTravelClick("education")}
                  className="flex items-center gap-1 rounded-xl border border-purple-500/50 bg-purple-950/60 px-3 py-1 text-xs font-bold text-purple-200 hover:bg-purple-900 hover:border-purple-400 transition"
                  title="Teleport to Education & Resume"
                >
                  <span>🎓</span>
                  <span>Resume</span>
                </button>
                <button
                  onClick={() => handleTravelClick("contact")}
                  className="flex items-center gap-1 rounded-xl border border-cyan-500/50 bg-cyan-950/60 px-3 py-1 text-xs font-bold text-cyan-200 hover:bg-cyan-900 hover:border-cyan-400 transition"
                  title="Teleport to Contact & Socials"
                >
                  <span>📬</span>
                  <span>Contact</span>
                </button>
              </div>

              {/* Subtitle reminder */}
              <p className="text-[10px] text-slate-400 font-medium">
                Click any zone above to jump directly to Sarthak&apos;s real work & credentials
              </p>
            </div>
          )}

          {/* Right Action Tools */}
          <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Fast Travel Trigger */}
            <button
              onClick={() => setShowMobileTravel((prev) => !prev)}
              aria-label="Portfolio Fast Travel"
              className="lg:hidden rounded-xl border border-gold-500/50 bg-slate-950/90 px-2.5 py-2 text-xs font-black text-gold-300 shadow hover:border-gold-400 backdrop-blur-md transition"
              title="Fast Travel"
            >
              <span>⚡ Fast Travel</span>
            </button>

            {/* Guide Button */}
            <button
              onClick={() => setShowPortfolioGuide(true)}
              aria-label="Open Portfolio Guide"
              className="rounded-xl border border-gold-500/60 bg-gradient-to-r from-brand-600/80 to-gold-600/80 p-2.5 text-white shadow hover:scale-105 backdrop-blur-md transition"
              title="About This Portfolio (Help)"
            >
              <FaQuestionCircle size={15} />
            </button>

            {/* Quest Log Button */}
            <button
              onClick={() => setShowQuestInfo(true)}
              aria-label="Citadel Quest Log"
              className="hidden sm:block rounded-xl border border-gold-500/40 bg-slate-950/85 p-2.5 text-gold-300 shadow hover:border-gold-400 hover:text-gold-200 backdrop-blur-md transition"
              title="RPG Quest Log"
            >
              <FaCompass size={14} />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleAudio}
              aria-label="Toggle Sound"
              className="rounded-xl border border-slate-700 bg-slate-950/85 p-2.5 text-slate-300 shadow hover:border-gold-500 hover:text-gold-300 backdrop-blur-md transition"
              title="Toggle Audio"
            >
              {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              aria-label="Toggle Fullscreen"
              className="hidden sm:block rounded-xl border border-slate-700 bg-slate-950/85 p-2.5 text-slate-300 shadow hover:border-gold-500 hover:text-gold-300 backdrop-blur-md transition"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <FaCompress size={14} /> : <FaExpand size={14} />}
            </button>

            {/* Hide HUD Toggle */}
            <button
              onClick={() => setIsHudVisible(false)}
              aria-label="Hide HUD"
              className="rounded-xl border border-slate-700 bg-slate-950/85 p-2.5 text-slate-300 shadow hover:border-gold-400 hover:text-gold-300 backdrop-blur-md transition"
              title="Hide UI for Full Panoramic 3D View [Press H]"
            >
              <FaEyeSlash size={14} />
            </button>

            {/* Sky View Toggle */}
            <button
              onClick={onToggleSkyView}
              aria-label="Look at Sky"
              className="rounded-xl border border-cyan-500/50 bg-slate-950/85 px-3 py-2 text-xs font-black text-cyan-300 shadow hover:border-cyan-400 hover:text-cyan-200 backdrop-blur-md transition flex items-center gap-1.5"
              title="Toggle Sky View (Look up at stars & celestial moon)"
            >
              <span>🌌</span>
              <span className="hidden md:inline">Sky View</span>
            </button>

            {/* WebGL Architecture Breakdown */}
            <button
              onClick={() => setShowEngineSpecs(true)}
              aria-label="Engine Specs"
              className="rounded-xl border border-cyan-500/60 bg-cyan-950/85 px-3 py-2 text-xs font-black text-cyan-200 shadow hover:bg-cyan-900 hover:border-cyan-400 backdrop-blur-md transition flex items-center gap-1.5"
              title="View WebGL Graphics Architecture & Performance Specs"
            >
              <span>⚙️</span>
              <span className="hidden md:inline">WebGL Specs</span>
            </button>

            {/* Switch to Rage Room 3D */}
            {onSwitchGame && (
              <button
                onClick={onSwitchGame}
                aria-label="Switch Game"
                className="rounded-xl border border-amber-500/60 bg-amber-950/80 px-3 py-2 text-xs font-black text-amber-200 shadow hover:bg-amber-900 hover:border-amber-400 backdrop-blur-md transition flex items-center gap-1.5"
                title="Switch to Rage Room 3D Arcade"
              >
                <span>🥊</span>
                <span className="hidden md:inline">Rage Room</span>
              </button>
            )}

            {/* Prominent Switch to Classic Website Button */}
            <button
              onClick={onToggleViewMode}
              type="button"
              className="flex items-center gap-1.5 rounded-xl border border-gold-400 bg-gradient-to-r from-brand-600 to-gold-600 px-3.5 py-2 text-xs font-black text-white shadow-xl transition duration-200 hover:scale-105"
              title="Switch to traditional resume view"
            >
              <FaGlobe size={13} />
              <span className="font-extrabold">Classic Website</span>
            </button>
          </div>
        </div>

        {/* Mobile Fast Travel Dropdown */}
        {showMobileTravel && (
          <div className="pointer-events-auto mx-auto mt-2 max-w-sm rounded-2xl border border-gold-500/60 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl animate-fadeIn lg:hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-gold-400">
              <span>⚡ JUMP TO PORTFOLIO ZONE:</span>
              <button onClick={() => setShowMobileTravel(false)}>✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={() => handleTravelClick("projects")}
                className="rounded-xl border border-red-500/50 bg-red-950/60 p-2 text-xs font-bold text-red-200 text-left"
              >
                🛠️ Projects
              </button>
              <button
                onClick={() => handleTravelClick("experience")}
                className="rounded-xl border border-amber-500/50 bg-amber-950/60 p-2 text-xs font-bold text-amber-200 text-left"
              >
                💼 Experience
              </button>
              <button
                onClick={() => handleTravelClick("skills")}
                className="rounded-xl border border-emerald-500/50 bg-emerald-950/60 p-2 text-xs font-bold text-emerald-200 text-left"
              >
                ⚡ Skills
              </button>
              <button
                onClick={() => handleTravelClick("education")}
                className="rounded-xl border border-purple-500/50 bg-purple-950/60 p-2 text-xs font-bold text-purple-200 text-left"
              >
                🎓 Resume
              </button>
              <button
                onClick={() => handleTravelClick("contact")}
                className="col-span-2 rounded-xl border border-cyan-500/50 bg-cyan-950/60 p-2 text-xs font-bold text-cyan-200 text-center"
              >
                📬 Contact & Socials
              </button>
            </div>
          </div>
        )}

        {/* Bottom Ability Hotbar (Desktop & Tablet) */}
        <div className="pointer-events-auto fixed bottom-5 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1.5 z-40">
          <div className="flex items-center gap-2 rounded-full border border-cyan-500/40 bg-slate-950/85 px-3.5 py-0.5 text-[10px] font-bold text-cyan-300 shadow backdrop-blur-md">
            <span>🌌</span>
            <span>Drag mouse up to view Sky & Stars • Scroll to zoom</span>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-gold-500/40 bg-slate-950/90 p-2 shadow-2xl backdrop-blur-md">
          {/* Attack */}
          <button
            onClick={onAttack}
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/60 hover:border-red-400 transition"
            title="Sword Attack Combo [Space or J]"
          >
            <span className="text-base">⚔️</span>
            <span className="hidden lg:inline">Slash</span>
            <span className="rounded bg-black/50 px-1 py-0.2 text-[9px] font-mono text-slate-400">[Space/J]</span>
          </button>

          {/* Whirlwind */}
          <button
            onClick={onSpinAttack}
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-900/60 hover:border-amber-400 transition"
            title="Whirlwind Spin Attack [Q or K]"
          >
            <span className="text-base">💥</span>
            <span className="hidden lg:inline">Whirlwind</span>
            <span className="rounded bg-black/50 px-1 py-0.2 text-[9px] font-mono text-slate-400">[Q/K]</span>
          </button>

          {/* Fireball */}
          <button
            onClick={onCastFireball}
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-950/40 px-3 py-1.5 text-xs font-bold text-orange-300 hover:bg-orange-900/60 hover:border-orange-400 transition"
            title="Cast Fireball Spell (18 MP) [R or F]"
          >
            <span className="text-base">🔥</span>
            <span className="hidden lg:inline">Fireball</span>
            <span className="rounded bg-black/50 px-1 py-0.2 text-[9px] font-mono text-slate-400">[R/F]</span>
          </button>

          {/* Dash */}
          <button
            onClick={onDash}
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-400 transition"
            title="Dragon Dash / Dodge Roll (12 MP) [Shift]"
          >
            <span className="text-base">💨</span>
            <span className="hidden lg:inline">Dash</span>
            <span className="rounded bg-black/50 px-1 py-0.2 text-[9px] font-mono text-slate-400">[Shift]</span>
          </button>

          {/* Interact */}
          <button
            onClick={onInteract}
            type="button"
            className="flex items-center gap-1.5 rounded-xl border border-gold-500/40 bg-brand-950/40 px-3 py-1.5 text-xs font-bold text-gold-300 hover:bg-brand-900/60 hover:border-gold-400 transition"
            title="Interact [E]"
          >
            <span className="text-base">📜</span>
            <span className="hidden lg:inline">Inspect</span>
            <span className="rounded bg-black/50 px-1 py-0.2 text-[9px] font-mono text-slate-400">[E]</span>
          </button>
          </div>
        </div>
        </header>
      ) : (
        <button
          onClick={() => setIsHudVisible(true)}
          className="pointer-events-auto fixed top-3 right-3 z-50 flex items-center gap-1.5 rounded-full border border-gold-500/60 bg-slate-950/90 px-3.5 py-1.5 text-xs font-bold text-gold-300 shadow-2xl backdrop-blur-md hover:scale-105 transition"
          title="Show HUD [Press H]"
        >
          <FaEye size={12} />
          <span>Show HUD [H]</span>
        </button>
      )}

      {/* 🌟 ONBOARDING WELCOME & PORTFOLIO GUIDE MODAL 🌟 */}
      {showPortfolioGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border-2 border-gold-500/70 bg-slate-950/95 p-5 sm:p-7 text-slate-100 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-gold-500 shadow-lg shrink-0">
                  <img
                    src="/photo.jpeg"
                    alt="Sarthak"
                    className="h-full w-full object-cover"
                    onError={(e) => (e.currentTarget.src = "/sarthak-photo.png")}
                  />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-100 font-heading">
                      Sarthak Jain Bajaj
                    </h3>
                    <span className="rounded-full border border-gold-500/60 bg-gold-500/20 px-2.5 py-0.5 text-[10px] font-bold text-gold-300">
                      AI & SOFTWARE ENGINEER
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    B.Tech Artificial Intelligence & Data Science (MITS) • IIT Roorkee Data Science Diploma
                  </p>
                </div>
              </div>

              <button
                onClick={closeGuide}
                aria-label="Close Guide"
                className="rounded-full border border-slate-700 bg-slate-900 p-2 text-slate-400 hover:border-gold-500 hover:text-white transition"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Explanation & Welcome Note */}
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-brand-500/30 bg-brand-950/30 p-4 leading-relaxed text-xs sm:text-sm text-slate-200">
                <p className="font-bold text-gold-300 text-sm mb-1">
                  👋 Welcome to my 3D Interactive Portfolio Realm!
                </p>
                <p>
                  Instead of a standard static text resume, this citadel allows you to walk through and explore my real engineering projects, industry internships, technical skills, and achievements in 3D world space.
                </p>
              </div>

              {/* 5 Portfolio Zones (Clickable Direct Fast-Travel) */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-gold-400 mb-2.5">
                  EXPLORE PORTFOLIO ZONES (CLICK TO TELEPORT):
                </h4>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {/* Projects */}
                  <div
                    onClick={() => handleTravelClick("projects")}
                    className="flex items-start gap-3 rounded-2xl border border-red-500/40 bg-slate-900/70 p-3 hover:border-red-400 hover:bg-red-950/40 cursor-pointer transition"
                  >
                    <div className="rounded-xl bg-red-950/80 p-2.5 text-xl text-red-400 border border-red-800">
                      🛠️
                    </div>
                    <div>
                      <div className="font-black text-xs text-red-300 flex items-center gap-1.5">
                        <span>Projects & SolveSphere</span>
                        <span className="text-[10px] text-gold-400">➔</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        SolveSphere (Smart India Hackathon SIH-26043), Parking Lot System, Report Card Generator.
                      </p>
                    </div>
                  </div>

                  {/* Experience */}
                  <div
                    onClick={() => handleTravelClick("experience")}
                    className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-slate-900/70 p-3 hover:border-amber-400 hover:bg-amber-950/40 cursor-pointer transition"
                  >
                    <div className="rounded-xl bg-amber-950/80 p-2.5 text-xl text-amber-400 border border-amber-800">
                      💼
                    </div>
                    <div>
                      <div className="font-black text-xs text-amber-300 flex items-center gap-1.5">
                        <span>Experience & Internships</span>
                        <span className="text-[10px] text-gold-400">➔</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Software Engineer Intern at Yuga Yatra (2026).
                      </p>
                    </div>
                  </div>

                  {/* Skills */}
                  <div
                    onClick={() => handleTravelClick("skills")}
                    className="flex items-start gap-3 rounded-2xl border border-emerald-500/40 bg-slate-900/70 p-3 hover:border-emerald-400 hover:bg-emerald-950/40 cursor-pointer transition"
                  >
                    <div className="rounded-xl bg-emerald-950/80 p-2.5 text-xl text-emerald-400 border border-emerald-800">
                      ⚡
                    </div>
                    <div>
                      <div className="font-black text-xs text-emerald-300 flex items-center gap-1.5">
                        <span>Technical Skills & AI</span>
                        <span className="text-[10px] text-gold-400">➔</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Python, AI/ML, React.js, Tailwind, Node.js, Express, MongoDB, C++, Arduino & IoT.
                      </p>
                    </div>
                  </div>

                  {/* Education & Resume */}
                  <div
                    onClick={() => handleTravelClick("education")}
                    className="flex items-start gap-3 rounded-2xl border border-purple-500/40 bg-slate-900/70 p-3 hover:border-purple-400 hover:bg-purple-950/40 cursor-pointer transition"
                  >
                    <div className="rounded-xl bg-purple-950/80 p-2.5 text-xl text-purple-400 border border-purple-800">
                      🎓
                    </div>
                    <div>
                      <div className="font-black text-xs text-purple-300 flex items-center gap-1.5">
                        <span>Education & Resume</span>
                        <span className="text-[10px] text-gold-400">➔</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        MITS B.Tech, IIT Roorkee Diploma, JPMorgan & Deloitte Certifications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls Cheatsheet */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-300">
                <span className="font-bold text-gold-400">Controls:</span>{" "}
                <span>WASD or Drag mouse</span> to move • <span>[E]</span> to inspect landmarks • Combat abilities (<span>[Space] Slash</span>, <span>[Q] Spin</span>, <span>[R] Fireball</span>) are a bonus RPG mini-game!
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={closeGuide}
                  type="button"
                  className="w-full sm:flex-1 rounded-xl bg-gradient-to-r from-brand-600 to-gold-600 py-3 text-xs sm:text-sm font-black text-white shadow-xl hover:brightness-110 transition"
                >
                  🏰 Explore 3D Portfolio Realm
                </button>

                <button
                  onClick={() => {
                    closeGuide();
                    onToggleViewMode();
                  }}
                  type="button"
                  className="w-full sm:flex-1 rounded-xl border border-gold-500/60 bg-slate-900 py-3 text-xs sm:text-sm font-bold text-gold-300 hover:bg-slate-800 transition"
                >
                  📄 Switch to Traditional Classic Website
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quest Modal */}
      {showQuestInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border-2 border-gold-500/60 bg-slate-950 p-6 text-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-black text-gold-400 flex items-center gap-2 font-heading tracking-wide">
                <FaCompass /> Citadel Mini-RPG Quests
              </h3>
              <button
                onClick={() => setShowQuestInfo(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-3">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <span>🐲</span> The North Dragon Arena
                </div>
                <p>
                  Journey far North to coordinates (0, -115) to confront <strong>Viserion the Glacial Scourge</strong>. Defeat the dragon to earn massive gold & EXP!
                </p>
              </div>

              <div className="rounded-xl border border-purple-500/30 bg-purple-950/30 p-3">
                <div className="font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                  <span>💀</span> Technical Skills Altar
                </div>
                <p>
                  Slay at least <strong>2 Skill Beasts</strong> roaming near the central citadel to break the seal on Sarthak&apos;s technical mastery shrine (or use Fast Travel above).
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowQuestInfo(false)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-brand-600 to-gold-600 py-2.5 text-xs font-bold text-white shadow-lg hover:brightness-110"
            >
              Return to Citadel
            </button>
          </div>
        </div>
      )}

      {/* Engine Specs Technical Breakdown Modal */}
      <EngineSpecsModal
        isOpen={showEngineSpecs}
        onClose={() => setShowEngineSpecs(false)}
      />
    </>
  );
}

export default GameHUD;
