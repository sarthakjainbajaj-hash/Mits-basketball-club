import { useEffect, useRef, useState } from "react";
import { Roadmap3DEngine } from "./Roadmap3DEngine";
import { ROADMAP_STEPS } from "./roadmapData";
import { roadmapAudio } from "./roadmapAudio";
import {
  FaVolumeUp,
  FaVolumeMute,
  FaPlay,
  FaPause,
  FaLinkedin,
  FaGithub,
  FaFileDownload,
  FaChevronRight,
  FaChevronLeft,
  FaChevronDown,
  FaChevronUp,
  FaRobot,
  FaExternalLinkAlt,
  FaGamepad,
  FaThLarge,
  FaTimes,
} from "react-icons/fa";

export default function Roadmap3DView({ onSwitchView, onOpenGame }) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);

  // Experience States
  const [hasEntered, setHasEntered] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isWalking, setIsWalking] = useState(false);
  const [walkingStep, setWalkingStep] = useState(ROADMAP_STEPS[0]);
  const [isCardOpen, setIsCardOpen] = useState(true);
  const [cameraMode, setCameraMode] = useState("follow");

  // Audio & Voice States
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSubtitle, setSpeechSubtitle] = useState("");

  const currentStep = ROADMAP_STEPS[currentStepIndex];

  // Initialize Three.js 3D Roadmap Engine
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const engine = new Roadmap3DEngine(container, {
      onStepChange: (index, step) => {
        setCurrentStepIndex(index);
      },
      onWalkingStateChange: (walking, step) => {
        setIsWalking(walking);
        setWalkingStep(step);
        if (walking) {
          roadmapAudio.stopSpeaking();
          setIsSpeaking(false);
          setSpeechSubtitle("");
        }
      },
      onStepReached: (index, step) => {
        setCurrentStepIndex(index);
        setIsWalking(false);
        setIsCardOpen(true);

        // Trigger AI Bot Voice Narration
        if (hasEntered && isVoiceActive) {
          triggerVoiceNarration(step);
        }
      },
    });

    engineRef.current = engine;

    return () => {
      engine.destroy();
      roadmapAudio.stopBgm();
      roadmapAudio.stopSpeaking();
    };
  }, [hasEntered, isVoiceActive]);

  const triggerVoiceNarration = (step) => {
    roadmapAudio.stopSpeaking();
    setSpeechSubtitle(step.speechText);
    setIsSpeaking(true);

    roadmapAudio.speak(step.speechText, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
      },
    });
  };

  const handleEnterJourney = () => {
    setHasEntered(true);
    roadmapAudio.startBgm();
    roadmapAudio.playClick();

    // Welcome speech
    setTimeout(() => {
      triggerVoiceNarration(ROADMAP_STEPS[0]);
    }, 600);
  };

  const handleNext = () => {
    roadmapAudio.playClick();
    if (engineRef.current) {
      engineRef.current.nextStep();
    }
  };

  const handlePrev = () => {
    roadmapAudio.playClick();
    if (engineRef.current) {
      engineRef.current.prevStep();
    }
  };

  const handleJumpToStep = (index) => {
    roadmapAudio.playClick();
    if (engineRef.current) {
      engineRef.current.goToStep(index);
    }
  };

  const toggleSound = () => {
    const muted = roadmapAudio.toggleMute();
    setIsMuted(muted);
    if (muted) {
      setIsSpeaking(false);
      setSpeechSubtitle("");
    }
  };

  const toggleVoice = () => {
    const enabled = roadmapAudio.toggleVoice();
    setIsVoiceActive(enabled);
    if (!enabled) {
      setIsSpeaking(false);
      setSpeechSubtitle("");
    } else if (!isWalking && currentStep) {
      triggerVoiceNarration(currentStep);
    }
  };

  const toggleCameraMode = () => {
    const nextMode = cameraMode === "follow" ? "free" : "follow";
    setCameraMode(nextMode);
    if (engineRef.current) {
      engineRef.current.setCameraMode(nextMode);
    }
  };

  const handleAction = (act) => {
    roadmapAudio.playClick();
    if (act.next) {
      handleNext();
    } else if (act.game && onOpenGame) {
      onOpenGame(act.game);
    } else if (act.url) {
      if (act.download) {
        const link = document.createElement("a");
        link.href = act.url;
        link.download = act.download;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(act.url, "_blank", "noopener,noreferrer");
      }
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060810] font-sans select-none text-slate-100">
      {/* 1. 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0" />

      {/* 2. INITIAL INTRO GATE MODAL (Matching Infotact landing screen) */}
      {!hasEntered && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#070913]/95 backdrop-blur-xl p-4 transition-all duration-700">
          <div className="relative max-w-xl w-full text-center flex flex-col items-center">
            {/* Spinning 3D Animated Polygon Emblem */}
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 animate-spin opacity-75 blur-md" />
              <div className="relative w-28 h-28 rounded-2xl bg-[#090d1a] border border-cyan-500/50 flex flex-col items-center justify-center p-3 shadow-2xl">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                  SJB
                </span>
                <span className="text-[10px] tracking-widest text-cyan-300 font-bold uppercase mt-1">
                  3D ROADMAP
                </span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
              Your journey is ready.
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mb-8">
              Meet your 3D guide and walk all 8 milestone steps — from core full-stack skills to flagship AI systems, real internship, WebGL games, and verified resume.
            </p>

            <button
              onClick={handleEnterJourney}
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white text-base sm:text-lg bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 shadow-xl shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Enter the journey</span>
              <FaChevronRight className="text-sm group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span>🔊 Best with sound on</span>
            </div>

            {/* Checklist Indicators */}
            <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-2 text-left text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Paving the 3D road</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Raising 8 milestones</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Waking up your guide</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Lighting the sky</span>
              </div>
            </div>

            <div className="mt-8 text-4xl sm:text-5xl font-extrabold text-cyan-400/80 tracking-tighter">
              100<span className="text-2xl text-slate-500">%</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. TOP NAVIGATION BAR (Glassmorphic) */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#070a14]/75 backdrop-blur-md border-b border-slate-800/80">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 font-black text-white text-sm">
            SJ
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black tracking-wider text-white uppercase flex items-center gap-1.5">
              <span>SARTHAK JAIN BAJAJ</span>
              <span className="hidden md:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PORTFOLIO ROADMAP
              </span>
            </div>
            <div className="text-[10px] text-slate-400 hidden sm:block">
              Full Stack Developer & AI Creator • B.Tech CSE @ MITS
            </div>
          </div>
        </div>

        {/* Center Step Dots Tracker */}
        <div className="hidden lg:flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-inner">
          <span className="text-xs font-black text-cyan-400 tracking-wider mr-2">
            {currentStep.stepNumber} / 08
          </span>
          <div className="flex items-center gap-1.5">
            {ROADMAP_STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => handleJumpToStep(idx)}
                title={`Step ${step.stepNumber}: ${step.title}`}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? "w-6 bg-gradient-to-r from-cyan-400 to-blue-500 shadow-md shadow-cyan-500/50"
                    : idx < currentStepIndex
                    ? "bg-cyan-600/60 hover:bg-cyan-500"
                    : "bg-slate-700 hover:bg-slate-500"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audio BGM Toggle */}
          <button
            onClick={toggleSound}
            title={isMuted ? "Unmute Sound" : "Mute Sound"}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all"
          >
            {isMuted ? <FaVolumeMute className="text-xs sm:text-sm text-red-400" /> : <FaVolumeUp className="text-xs sm:text-sm text-cyan-400" />}
          </button>

          {/* AI Bot Voice Toggle */}
          <button
            onClick={toggleVoice}
            title={isVoiceActive ? "Disable AI Guide Voice" : "Enable AI Guide Voice"}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border flex items-center justify-center transition-all ${
              isVoiceActive
                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-md shadow-cyan-500/20"
                : "bg-slate-800/80 border-slate-700 text-slate-400"
            }`}
          >
            <FaRobot className={`text-xs sm:text-sm ${isSpeaking ? "animate-bounce text-cyan-400" : ""}`} />
          </button>

          {/* Social Links */}
          <a
            href="https://linkedin.com/in/sarthakjainbajaj"
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn Profile"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800/80 hover:bg-blue-600 border border-slate-700 hover:border-blue-500 flex items-center justify-center text-slate-300 hover:text-white transition-all hidden sm:flex"
          >
            <FaLinkedin className="text-xs sm:text-sm" />
          </a>

          <a
            href="https://github.com/sarthakjainbajaj-hash"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Repos"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all hidden sm:flex"
          >
            <FaGithub className="text-xs sm:text-sm" />
          </a>

          {/* Primary Resume PDF Download CTA Button */}
          <a
            href="/resume.pdf"
            download="Sarthak_Jain_Resume.pdf"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95 transition-all"
          >
            <FaFileDownload className="text-xs" />
            <span className="hidden xs:inline">Resume PDF</span>
            <span className="xs:hidden">Resume</span>
          </a>

          {/* Play 3D Games button */}
          {onOpenGame && (
            <button
              onClick={() => onOpenGame("citadel")}
              title="Launch 3D Games"
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <FaGamepad className="text-xs text-amber-400" />
              <span className="hidden md:inline">Games</span>
            </button>
          )}

          {/* Switch to Classic View button */}
          {onSwitchView && (
            <button
              onClick={() => onSwitchView("website")}
              title="Switch to Classic Portfolio View"
              className="px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <FaThLarge className="text-xs text-amber-400" />
              <span className="hidden md:inline">Classic</span>
            </button>
          )}
        </div>
      </header>

      {/* 4. WALKING STATUS INDICATOR (Bottom-Left, matching Infotact image 2) */}
      {isWalking && (
        <div className="absolute bottom-24 left-4 sm:left-8 z-30 bg-[#070a14]/90 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 max-w-xs sm:max-w-sm shadow-2xl animate-pulse">
          <div className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            WALKING TO STEP...
          </div>
          <div className="text-base sm:text-lg font-black text-white">
            {walkingStep.stepNumber} {walkingStep.shortTitle}
          </div>
          <div className="text-xs text-slate-400 truncate mt-0.5">
            {walkingStep.subtitle}
          </div>
        </div>
      )}

      {/* 5. MILESTONE DETAIL CARD (Right Side Modal, matching Infotact image 3) */}
      {!isWalking && currentStep && (
        <div
          className={`absolute top-20 right-4 sm:right-6 z-30 max-w-sm sm:max-w-md w-full transition-all duration-500 ${
            isCardOpen ? "opacity-100 translate-y-0" : "opacity-90 translate-y-4"
          }`}
        >
          <div className="bg-[#090d1a]/90 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
            {/* Card Header */}
            <div
              className={`p-4 sm:p-5 border-b border-slate-800/80 flex items-start justify-between bg-gradient-to-r ${currentStep.accentBg}`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-black text-black"
                    style={{ backgroundColor: currentStep.color }}
                  >
                    STEP {currentStep.stepNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    OF 08
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {currentStep.title}
                </h2>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {currentStep.subtitle}
                </p>
              </div>

              {/* Minimize / Expand Toggle */}
              <button
                onClick={() => setIsCardOpen((prev) => !prev)}
                className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                {isCardOpen ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
              </button>
            </div>

            {/* Card Content (Expandable) */}
            {isCardOpen && (
              <div className="p-4 sm:p-5 space-y-4 max-h-[62vh] overflow-y-auto">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {currentStep.description}
                </p>

                {/* Key Highlights list */}
                {currentStep.highlights && currentStep.highlights.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Key Highlights:
                    </div>
                    {currentStep.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-200">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Badges / Tech Tags */}
                {currentStep.badges && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentStep.badges.map((b, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800/80 text-cyan-300 border border-slate-700"
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                )}

                {/* YouTube Video Embed for Step 5 */}
                {currentStep.videoId && (
                  <div className="relative rounded-xl overflow-hidden aspect-video border border-red-500/40 shadow-lg bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${currentStep.videoId}?autoplay=0&rel=0`}
                      title="Sarthak Jain AI Video Creator"
                      className="w-full h-full"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  {currentStep.actions &&
                    currentStep.actions.map((act, i) => (
                      <button
                        key={i}
                        onClick={() => handleAction(act)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                          act.primary
                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
                            : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                        }`}
                      >
                        <span>{act.label}</span>
                        {act.url && <FaExternalLinkAlt className="text-[10px]" />}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. AI BOT VOICE SUBTITLE PILL (Bottom Center) */}
      {isSpeaking && speechSubtitle && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 max-w-xl w-[90%] sm:w-auto bg-[#070a14]/90 backdrop-blur-md border border-cyan-500/50 rounded-full px-5 py-3 shadow-2xl flex items-center gap-3 animate-fadeInUp">
          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <FaRobot className="text-cyan-400 text-sm animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-medium leading-snug line-clamp-2">
            {speechSubtitle}
          </p>
        </div>
      )}

      {/* 7. BOTTOM NAVIGATION CONTROLS PILL (Matching Infotact bottom bar) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 p-1.5 rounded-full bg-[#080c18]/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0 || isWalking}
          title="Previous Step"
          className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-200 transition-all"
        >
          <FaChevronLeft className="text-xs" />
        </button>

        {/* Camera Mode Toggle */}
        <button
          onClick={toggleCameraMode}
          title={`Camera Mode: ${cameraMode.toUpperCase()} (Click to toggle)`}
          className="px-4 py-2 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-all flex items-center gap-1.5"
        >
          <span>📹 {cameraMode === "follow" ? "Follow" : "Free Look"}</span>
        </button>

        {/* Start / Forward Button */}
        <button
          onClick={handleNext}
          disabled={currentStepIndex === ROADMAP_STEPS.length - 1 || isWalking}
          className="group flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-black text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/30 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
        >
          <span>{currentStepIndex === 0 && !isWalking ? "Start" : "Forward"}</span>
          <FaChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
