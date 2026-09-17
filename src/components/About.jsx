function About() {
  return (
    <section id="about" className="section-wrap animate-fadeInUp">
      <div className="glass-card rounded-3xl p-7 shadow-xl sm:p-10 border border-brand-700/40 dark:border-gold-500/30">
        <p className="section-badge">Citadel Records</p>
        <h3 className="section-title">Engineering Philosophy & Background</h3>
        
        <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <p className="text-base sm:text-lg leading-relaxed text-slate-700 dark:text-slate-200">
              I am an <strong>AI & Full-Stack Software Engineer</strong> and <strong>AI Video Content Creator</strong> pursuing B.Tech in Artificial Intelligence & Data Science at MITS with a specialized Data Science diploma from <strong>IIT Roorkee</strong>. Creator of <strong>SolveSphere</strong> for the <strong>Smart India Hackathon (SIH-26043)</strong>.
            </p>
            <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300">
              My work spans scalable web architectures, creative generative AI video production, and interactive real-time WebGL 3D graphics. Having completed a software engineering internship at <strong>Yuga Yatra</strong>, I combine technical discipline with creative storytelling to build engaging, production-ready digital experiences.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gold-500/40 bg-slate-900/60 p-4 text-center">
              <div className="text-2xl font-black text-gold-400 font-heading">SIH-26043</div>
              <p className="text-xs text-slate-400 mt-1 font-bold">Hackathon Project</p>
            </div>
            <div className="rounded-2xl border border-cyan-500/40 bg-slate-900/60 p-4 text-center">
              <div className="text-2xl font-black text-cyan-400 font-heading">IIT Roorkee</div>
              <p className="text-xs text-slate-400 mt-1 font-bold">Data Science Diploma</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/40 bg-slate-900/60 p-4 text-center">
              <div className="text-2xl font-black text-emerald-400 font-heading">Yuga Yatra</div>
              <p className="text-xs text-slate-400 mt-1 font-bold">SWE Internship</p>
            </div>
            <div className="rounded-2xl border border-red-500/40 bg-slate-900/60 p-4 text-center">
              <div className="text-2xl font-black text-red-400 font-heading">AI Video</div>
              <p className="text-xs text-slate-400 mt-1 font-bold">Content Creator</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
