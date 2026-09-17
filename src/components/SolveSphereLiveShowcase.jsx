import { useState } from "react";
import {
  FaExternalLinkAlt,
  FaGithub,
  FaSyncAlt,
  FaExpand,
  FaCompress,
  FaDesktop,
  FaMobileAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaTimes,
  FaRobot,
  FaUsers,
  FaLightbulb,
} from "react-icons/fa";

function SolveSphereLiveShowcase() {
  const [deviceMode, setDeviceMode] = useState("desktop"); // 'desktop' | 'mobile'
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [activeTab, setActiveTab] = useState("live"); // 'live' | 'architecture'

  const liveUrl = "https://solvesphere-three.vercel.app/";
  const githubUrl = "https://github.com/sarthakjainbajaj-hash/SolveSphere-SIH26043";

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="mb-14 rounded-3xl border-2 border-brand-500/40 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Flagship Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-950/70 px-3 py-0.5 text-[11px] font-black tracking-wide text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              FLAGSHIP PRODUCTION SYSTEM
            </span>
            <span className="rounded-full border border-gold-500/50 bg-gold-950/70 px-3 py-0.5 text-[11px] font-black tracking-wide text-gold-300">
              💡 SIH-26043 HACKATHON PROJECT
            </span>
          </div>

          <h4 className="text-2xl sm:text-3xl font-black text-slate-100 font-heading tracking-wide">
            SolveSphere <span className="text-brand-400">— AI Problem Solving Platform</span>
          </h4>
          <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
            Collaborative innovation platform designed for the Smart India Hackathon. Connects academic institutes, student researchers, and industry specialists to crowdsource and engineer solutions for real-world societal bottlenecks.
          </p>

          {/* Highlights */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-300">
              <FaRobot /> AI Problem Recommendation
            </span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <FaUsers /> Cross-University Collaboration
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <FaLightbulb /> SIH National Challenge Ecosystem
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
          <a
            href={liveUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-gold-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg hover:scale-105 transition"
          >
            <span>Launch Live App</span>
            <FaExternalLinkAlt size={11} />
          </a>

          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-slate-200 hover:border-gold-500 hover:text-white transition"
          >
            <FaGithub size={13} />
            <span>GitHub Code</span>
          </a>
        </div>
      </div>

      {/* View Switcher: Live Demo vs System Architecture */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("live")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "live"
                ? "bg-gradient-to-r from-brand-600 to-gold-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>🌐 Live Interactive App</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === "architecture"
                ? "bg-gradient-to-r from-brand-600 to-gold-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>📐 System Architecture & Specs</span>
          </button>
        </div>

        {activeTab === "live" && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:inline">Device Viewport:</span>
            <button
              onClick={() => setDeviceMode("desktop")}
              className={`p-1.5 rounded-lg border transition ${
                deviceMode === "desktop"
                  ? "border-gold-500 bg-gold-500/20 text-gold-300"
                  : "border-slate-800 bg-slate-900 text-slate-400"
              }`}
              title="Desktop View"
            >
              <FaDesktop size={14} />
            </button>
            <button
              onClick={() => setDeviceMode("mobile")}
              className={`p-1.5 rounded-lg border transition ${
                deviceMode === "mobile"
                  ? "border-gold-500 bg-gold-500/20 text-gold-300"
                  : "border-slate-800 bg-slate-900 text-slate-400"
              }`}
              title="Mobile View"
            >
              <FaMobileAlt size={14} />
            </button>
            <button
              onClick={handleReload}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              title="Reload Frame"
            >
              <FaSyncAlt size={13} className={isLoading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
              title="Fullscreen Preview"
            >
              <FaExpand size={13} />
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: SYSTEM ARCHITECTURE & IMPACT */}
      {activeTab === "architecture" && (
        <div className="mt-6 rounded-2xl border border-brand-500/30 bg-slate-950/90 p-5 sm:p-7 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h5 className="text-lg font-black text-slate-100 font-heading">
                SolveSphere End-to-End System Architecture
              </h5>
              <p className="text-xs text-slate-400 mt-1">
                Engineered for modularity, sub-second latency, and multi-tier university collaboration.
              </p>
            </div>
            <span className="rounded-full border border-emerald-500/50 bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-400 self-start sm:self-center">
              Microservices Pattern
            </span>
          </div>

          {/* Architecture Pipeline Flow Diagram */}
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {/* Step 1 */}
            <div className="rounded-2xl border border-blue-500/40 bg-blue-950/20 p-4">
              <div className="flex items-center justify-between text-blue-400 font-mono text-xs font-black mb-2">
                <span>01. CLIENT TIER</span>
                <span>🖥️</span>
              </div>
              <h6 className="font-bold text-sm text-slate-200">React 18 + Vite</h6>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Responsive UI with Tailwind CSS, dynamic client-side filtering, fast state stores, and real-time form validation.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[10px] text-blue-300">Vite</span>
                <span className="rounded bg-blue-900/60 px-2 py-0.5 text-[10px] text-blue-300">Tailwind</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-purple-500/40 bg-purple-950/20 p-4">
              <div className="flex items-center justify-between text-purple-400 font-mono text-xs font-black mb-2">
                <span>02. AI ENGINE</span>
                <span>🤖</span>
              </div>
              <h6 className="font-bold text-sm text-slate-200">Recommendation Pipeline</h6>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Semantic challenge tagging, automated categorization, and intelligent matching of problems to student skill sets.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="rounded bg-purple-900/60 px-2 py-0.5 text-[10px] text-purple-300">NLP Matching</span>
                <span className="rounded bg-purple-900/60 px-2 py-0.5 text-[10px] text-purple-300">FastAPI</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4">
              <div className="flex items-center justify-between text-amber-400 font-mono text-xs font-black mb-2">
                <span>03. STORAGE LAYER</span>
                <span>🗄️</span>
              </div>
              <h6 className="font-bold text-sm text-slate-200">MongoDB Atlas & Cloud</h6>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Document datastore indexing societal challenges, student submissions, team formations, and institutional verification.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="rounded bg-amber-900/60 px-2 py-0.5 text-[10px] text-amber-300">NoSQL</span>
                <span className="rounded bg-amber-900/60 px-2 py-0.5 text-[10px] text-amber-300">Indexing</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-4">
              <div className="flex items-center justify-between text-emerald-400 font-mono text-xs font-black mb-2">
                <span>04. DEPLOYMENT</span>
                <span>🚀</span>
              </div>
              <h6 className="font-bold text-sm text-slate-200">Vercel Edge Network</h6>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Continuous deployment via Git CI/CD, SSL certification, serverless API routes, and global edge cache distribution.
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                <span className="rounded bg-emerald-900/60 px-2 py-0.5 text-[10px] text-emerald-300">CI/CD</span>
                <span className="rounded bg-emerald-900/60 px-2 py-0.5 text-[10px] text-emerald-300">Edge CDN</span>
              </div>
            </div>
          </div>

          {/* Key Impact & Hackathon Metrics */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-800 text-center">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="text-2xl font-black text-gold-400 font-heading">SIH-26043</div>
              <p className="text-[11px] text-slate-400 mt-1">Hackathon Project</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="text-2xl font-black text-brand-400 font-heading">React 18</div>
              <p className="text-[11px] text-slate-400 mt-1">Modern UI & Vite</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="text-2xl font-black text-cyan-400 font-heading">Vercel</div>
              <p className="text-[11px] text-slate-400 mt-1">Live Cloud Deployment</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="text-2xl font-black text-emerald-400 font-heading">Multi-Tier</div>
              <p className="text-[11px] text-slate-400 mt-1">Student & Mentor Roles</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE BROWSER FRAME */}
      {activeTab === "live" && (
      <div className="mt-4 rounded-2xl border border-slate-700/80 bg-slate-950 shadow-2xl overflow-hidden ring-1 ring-gold-500/20">
        {/* Browser Top Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 px-4 py-3 border-b border-slate-800">
          {/* Traffic Light Dots */}
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500/90 shadow-sm" />
            <span className="h-3 w-3 rounded-full bg-amber-500/90 shadow-sm" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/90 shadow-sm" />
            <span className="hidden sm:inline text-xs font-bold text-slate-400 ml-2">
              Interactive Preview Window
            </span>
          </div>

          {/* Interactive URL Bar */}
          <div className="order-3 sm:order-2 flex-1 max-w-xl mx-auto flex items-center justify-between gap-2 rounded-xl border border-slate-700/80 bg-slate-950/90 px-3.5 py-1.5 text-xs text-slate-300 shadow-inner">
            <div className="flex items-center gap-2 truncate">
              <FaShieldAlt className="text-emerald-400 shrink-0 text-[11px]" />
              <span className="text-emerald-400 font-mono text-[11px]">https://</span>
              <span className="font-mono text-slate-200 truncate">solvesphere-three.vercel.app/</span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 shrink-0">
              <FaCheckCircle size={10} />
              <span className="hidden md:inline">Online</span>
            </span>
          </div>

          {/* Viewport Control Tools */}
          <div className="order-2 sm:order-3 flex items-center gap-1.5">
            {/* Desktop / Mobile Switcher */}
            <div className="flex items-center rounded-lg border border-slate-700 bg-slate-950 p-0.5">
              <button
                type="button"
                onClick={() => setDeviceMode("desktop")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                  deviceMode === "desktop"
                    ? "bg-brand-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Desktop View (Full Width)"
              >
                <FaDesktop size={11} />
                <span className="hidden md:inline">Desktop</span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceMode("mobile")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-bold transition ${
                  deviceMode === "mobile"
                    ? "bg-brand-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Mobile View (375px)"
              >
                <FaMobileAlt size={11} />
                <span className="hidden md:inline">Mobile</span>
              </button>
            </div>

            {/* Reload Button */}
            <button
              type="button"
              onClick={handleReload}
              className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-300 hover:border-gold-500 hover:text-gold-300 transition"
              title="Reload SolveSphere"
            >
              <FaSyncAlt size={12} className={isLoading ? "animate-spin text-brand-400" : ""} />
            </button>

            {/* Expand / Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-300 hover:border-gold-500 hover:text-gold-300 transition"
              title="Expand to Fullscreen"
            >
              <FaExpand size={12} />
            </button>
          </div>
        </div>

        {/* Live Running Iframe Container */}
        <div className="relative w-full bg-slate-950 flex justify-center overflow-hidden min-h-[520px] sm:min-h-[600px]">
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent shadow-lg" />
              <p className="mt-3 text-xs font-bold tracking-wider text-slate-300">
                Loading SolveSphere Live Edge Instance...
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Connecting to solvesphere-three.vercel.app</p>
            </div>
          )}

          {/* Iframe Viewport */}
          <div
            className={`transition-all duration-300 w-full ${
              deviceMode === "mobile"
                ? "max-w-[385px] my-4 rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden bg-slate-900"
                : "h-full"
            }`}
          >
            <iframe
              key={iframeKey}
              src={liveUrl}
              title="SolveSphere Live Application"
              onLoad={() => setIsLoading(false)}
              className="w-full h-[540px] sm:h-[620px] border-0 bg-white"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        </div>

        {/* Bottom Helper Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-900/80 px-4 py-2.5 text-[11px] text-slate-400 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">● Interactive:</span>
            <span>You can click, type, scroll, and test SolveSphere live inside this window!</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand-400 hover:text-gold-300 font-bold flex items-center gap-1 transition"
            >
              <span>Open in full tab</span>
              <FaExternalLinkAlt size={10} />
            </a>
          </div>
        </div>
      </div>
      )}

      {/* Fullscreen Modal View */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 backdrop-blur-xl animate-fadeIn p-2 sm:p-4">
          {/* Modal Header */}
          <div className="flex items-center justify-between gap-3 bg-slate-900 px-5 py-3 rounded-2xl border border-gold-500/40 mb-2">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <span>SolveSphere (SIH-26043)</span>
                  <span className="text-slate-400">|</span>
                  <span className="text-xs text-gold-400 font-mono">solvesphere-three.vercel.app</span>
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={liveUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white"
              >
                <span>New Tab</span>
                <FaExternalLinkAlt size={11} />
              </a>

              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="rounded-lg border border-red-500/40 bg-red-950/80 p-2 text-red-200 hover:bg-red-900 transition"
                title="Close Fullscreen"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {/* Fullscreen Iframe */}
          <div className="flex-1 w-full rounded-2xl overflow-hidden border border-slate-800 bg-white">
            <iframe
              src={liveUrl}
              title="SolveSphere Fullscreen Live"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SolveSphereLiveShowcase;