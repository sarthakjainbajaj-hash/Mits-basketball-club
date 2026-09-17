import { FaYoutube, FaExternalLinkAlt, FaMagic, FaFilm, FaLayerGroup, FaPlay } from "react-icons/fa";
import { aiVideo } from "../data";

function AiVideoShowcase() {
  return (
    <section id="aivideo" className="section-wrap animate-fadeInUp">
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-red-500/30 bg-slate-950/80 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-amber-600/10 blur-3xl pointer-events-none" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-6 border-b border-slate-800 relative z-10">
          <div>
            <span className="flex items-center gap-1.5 rounded-full border border-red-500/50 bg-red-950/70 px-3 py-0.5 text-[11px] font-black tracking-wide text-red-400 w-fit mb-2">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
              AI VIDEO CREATOR SHOWCASE
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-slate-100 font-heading">
              Generative AI Video <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">& YouTube Channel</span>
            </h3>
            <p className="mt-2 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
              Transforming creative visions into cinematic motion. As an AI Video Content Creator, I utilize generative video models, prompt crafting, and digital post-production to produce engaging short-form narratives.
            </p>
          </div>

          <a
            href={aiVideo.youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg transition duration-200 hover:scale-105 self-start md:self-auto"
          >
            <FaYoutube className="text-lg" />
            <span>Watch on YouTube</span>
            <FaExternalLinkAlt size={10} />
          </a>
        </div>

        {/* Content Body: Two Columns */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr] items-center relative z-10">
          {/* Column 1: Embedded Video Device Frame */}
          <div className="flex justify-center">
            <div className="w-full max-w-[320px] rounded-3xl border-2 border-red-500/40 bg-slate-900/90 p-3 shadow-2xl ring-1 ring-red-500/20">
              {/* Smartphone style top indicator */}
              <div className="flex items-center justify-between px-3 py-1 mb-2 text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-red-400 font-bold">
                  <FaFilm /> YouTube Short
                </span>
                <span className="h-1.5 w-12 rounded-full bg-slate-700 mx-auto" />
                <span className="rounded bg-red-950 px-1.5 py-0.5 text-red-300 font-bold">LIVE</span>
              </div>

              {/* Responsive 9:16 Video Container */}
              <div className="relative aspect-[9/16] w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-800">
                <iframe
                  src={`${aiVideo.embedUrl}?rel=0&modestbranding=1&playsinline=1`}
                  title="Sarthak Jain Bajaj AI Video Short"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              {/* Bottom Caption & Link */}
              <div className="mt-3 flex items-center justify-between text-xs px-1 text-slate-300">
                <span className="font-semibold text-slate-200 truncate">YouTube Short</span>
                <a
                  href={aiVideo.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 text-[11px]"
                >
                  Open in YouTube <FaExternalLinkAlt size={9} />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Creative Process & Skills */}
          <div className="space-y-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h4 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <FaMagic className="text-amber-400" />
                Creative Vision & AI Pipeline
              </h4>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Crafting modern AI-generated video requires a fusion of prompt architecture, scene coherence, temporal stability, and audio-visual synchronization. Every short is engineered with intentional art direction, color grading, and narrative hooks designed for maximum audience engagement.
              </p>
            </div>

            {/* Core Creation Pillars */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FaFilm /> Generative AI Video
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Leveraging cutting-edge neural video models and diffusion to synthesize stylized, cinematic visuals.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="text-rose-400 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FaLayerGroup /> Prompt Engineering
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Iterative prompt refinement to preserve subject consistency, camera angles, and lighting realism.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FaPlay /> Pacing & Storytelling
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Editing for short-form retention: high-impact intro hooks, rhythmic pacing, and seamless scene transitions.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                <div className="text-red-400 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FaYoutube /> YouTube Content
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Active creator channel exploring new boundaries in AI video synthesis, creative aesthetics, and visual effects.
                </p>
              </div>
            </div>

            {/* Highlights Tag Cloud */}
            <div className="pt-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Production Skills & Creative Arsenal
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Generative AI Video",
                  "Prompt Engineering",
                  "Cinematic Storyboarding",
                  "YouTube Shorts Strategy",
                  "Audio Synchronization",
                  "Visual Consistency",
                  "Motion Synthesis",
                  "Digital Post-Production",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-red-500/20 bg-red-950/30 px-3 py-1 text-xs font-semibold text-red-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AiVideoShowcase;
